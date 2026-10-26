/* Browser tests for the Meal Prep pages. Build the site, serve it, then:
     NODE_PATH=$(npm root -g) node scripts/meals/app-ui-tests.js http://localhost:9102 /tmp/meal-shots
   Checks at 1280 and 390 px, light and dark: no console errors, no sideways scrolling; placing meals with a
   mouse drag, a touch long-press drag, tap-to-place and the keyboard; leftovers, shuffle, tabs, the recipe
   editor (catalog item + write-in), backup export/import, recipe-page scaling, storage blocked, the print
   page (saved as a PDF) and the PNG pictures (saved for looking at). From scratch: the library, the "how much do
   you need?" scaler, Make it / Buy instead and "make when I can" on the shopping list, prep-day timing for bread,
   the Grow view, "What I grow" and the garden section of the list, and the Garden Planner hand-off both ways. */
'use strict';
var pw = require('playwright'), fs = require('fs'), path = require('path');
var BASE = process.argv[2] || 'http://localhost:9102', OUT = process.argv[3] || '/tmp/meal-shots';
fs.mkdirSync(OUT, { recursive: true });
var pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log('FAIL: ' + m); } }
function cellsOf(pg) { return pg.evaluate(function () { var s = JSON.parse(localStorage.getItem('trb-meals-v1')); return s.plans.filter(function (p) { return p.id === s.cur; })[0].cells; }); }

async function page(b, o) {
  var ctx = await b.newContext({ viewport: { width: o.w, height: o.w < 500 ? 844 : 900 }, hasTouch: o.w < 500, isMobile: o.w < 500, acceptDownloads: true });
  var pg = await ctx.newPage(); pg.errs = [];
  pg.on('console', function (m) { if (m.type() === 'error') pg.errs.push(m.text()); });
  pg.on('pageerror', function (e) { pg.errs.push(e.message); (pg.stacks = pg.stacks || []).push(e.stack || ''); });
  await pg.addInitScript(function (a) {
    if (a.block) { Object.defineProperty(window, 'localStorage', { get: function () { throw new Error('blocked'); } }); return; }
    localStorage.setItem('pref-theme', a.dark ? 'dark' : 'light');
  }, { dark: !!o.dark, block: !!o.block });
  pg.ctx = ctx; return pg;
}
async function check(pg, name) {
  var sw = await pg.evaluate(function () { return document.documentElement.scrollWidth - window.innerWidth; });
  ok(sw <= 0, name + ': no sideways scroll (' + sw + 'px too wide)');
  ok(!pg.errs.length, name + ': no console errors ' + pg.errs.join(' | '));
}
async function shot(pg, name, full) { await pg.screenshot({ path: path.join(OUT, name + '.png'), fullPage: full !== false }); }

(async function () {
  var b = await pw.chromium.launch();
  for (var dark of [false, true]) {
    var tag = dark ? 'dark' : 'light';
    // ---------- desktop: mouse, keyboard ----------
    var pg = await page(b, { w: 1280, dark: dark });
    await pg.goto(BASE + '/meal-prep/plan/', { waitUntil: 'networkidle' });
    ok(await pg.evaluate(function () { return document.getElementById('mp-setup').open; }), tag + ': settings start open on a first visit');
    await pg.click('#mp-setup > summary');
    var first = await pg.getAttribute('.mp-rec', 'data-r');
    // tap/click to place
    await pg.click('.mp-rec[data-r="' + first + '"]'); await pg.click('.mp-cell[data-k="0|dinner"]'); await pg.click('#mp-placedone');
    ok((await cellsOf(pg))['0|dinner'][0].r === first, tag + ': click a recipe, click a slot');
    // mouse drag from the library
    var ids = await pg.$$eval('.mp-rec', function (a) { return a.map(function (x) { return x.dataset.r; }); });
    var second = ids[1]; await pg.evaluate(function () { scrollTo(0, 0); });
    var s = await pg.locator('.mp-rec[data-r="' + second + '"]').boundingBox(), t = await pg.locator('.mp-cell[data-k="1|dinner"]').boundingBox();
    await pg.mouse.move(s.x + 20, s.y + 10); await pg.mouse.down(); await pg.mouse.move(s.x + 30, s.y + 20, { steps: 3 }); await pg.mouse.move(t.x + 30, t.y + 20, { steps: 12 }); await pg.mouse.up();
    ok(((await cellsOf(pg))['1|dinner'] || [])[0] && (await cellsOf(pg))['1|dinner'][0].r === second, tag + ': mouse drag from the library');
    // mouse drag a chip to another day
    s = await pg.locator('.mp-chip[data-k="1|dinner"]').boundingBox(); t = await pg.locator('.mp-cell[data-k="3|dinner"]').boundingBox();
    await pg.mouse.move(s.x + 20, s.y + 8); await pg.mouse.down(); await pg.mouse.move(s.x + 30, s.y + 30, { steps: 3 }); await pg.mouse.move(t.x + 30, t.y + 20, { steps: 12 }); await pg.mouse.up();
    var c = await cellsOf(pg); ok(!c['1|dinner'] && c['3|dinner'] && c['3|dinner'][0].r === second, tag + ': mouse drag moves a chip');
    // keyboard: focus a library recipe, Enter, arrows, Enter, Escape
    await pg.focus('.mp-rec[data-r="' + first + '"]'); await pg.keyboard.press('Enter');
    ok(await pg.evaluate(function () { return document.activeElement.classList.contains('target'); }), tag + ': keyboard placing focuses a slot (' + (await pg.evaluate(function () { var a = document.activeElement; return a.tagName + '.' + a.className; })) + ')');
    await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowRight'); // breakfast → day 2 lunch
    var k = await pg.evaluate(function () { return document.activeElement.dataset.k; });
    ok(k === '2|lunch', tag + ': arrow keys move between slots (' + k + ')');
    await pg.keyboard.press('Enter'); await pg.keyboard.press('Escape');
    ok(((await cellsOf(pg))['2|lunch'] || [])[0], tag + ': Enter places with the keyboard');
    // keyboard on a chip: Enter opens the menu; Move…; arrows; Enter
    await pg.focus('.mp-chip[data-k="2|lunch"]'); await pg.keyboard.press('Enter'); await pg.waitForSelector('dialog[open] #cm-move');
    await pg.click('#cm-move'); await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter');
    c = await cellsOf(pg); ok(c['3|lunch'] && !c['2|lunch'], tag + ': keyboard move via the chip menu ' + JSON.stringify(c) + ' focus=' + (await pg.evaluate(function () { return document.activeElement.className + ' ' + (document.activeElement.dataset.k || ''); })));
    // Delete key removes a focused chip
    await pg.focus('.mp-chip[data-k="3|lunch"]'); await pg.keyboard.press('Delete');
    ok(!(await cellsOf(pg))['3|lunch'], tag + ': Delete removes a meal');
    await pg.click('#mp-undo'); ok(!!(await cellsOf(pg))['3|lunch'], tag + ': Undo brings it back');
    // leftovers
    await pg.click('.mp-chip[data-k="0|dinner"]'); await pg.click('#cm-lo');
    c = await cellsOf(pg); ok(c['1|lunch'] && c['1|lunch'][0].lo === '0|dinner', tag + ': cook extra for tomorrow\'s lunch');
    // shuffle the week (fill empty dinners and breakfasts)
    await pg.click('#mp-shuffle'); await pg.click('#sh-go');
    c = await cellsOf(pg); var dinners = 0; for (var d = 0; d < 7; d++) if (c[d + '|dinner']) dinners++;
    ok(dinners === 7, tag + ': shuffle fills every dinner');
    await shot(pg, tag + '-1280-calendar');
    for (var v of ['shop', 'nutr', 'prep', 'kids']) { await pg.click('#tab-' + v); await pg.waitForTimeout(150); await shot(pg, tag + '-1280-' + v); }
    ok(await pg.locator('.mp-shopsec li').count() > 5, tag + ': shopping list has rows');
    await pg.click('#tab-shop'); var hid = await pg.getAttribute('[data-have]', 'id'); await pg.click('#' + hid);
    await pg.waitForTimeout(200); var nh = await pg.locator('.mp-have li').count(); ok(nh === 1, tag + ': "have it" moves an item to Already have (' + nh + ')');
    await check(pg, tag + ' planner 1280');
    // pictures
    await pg.click('#mp-export'); await pg.click('#ex-picw'); await pg.waitForTimeout(400);
    for (var what of ['week', 'list', 'kids']) for (var size of ['phone', 'print']) {
      await pg.selectOption('#pc-what', what); await pg.check('input[name=pc-size][value=' + size + ']'); await pg.waitForTimeout(250);
      var src = await pg.getAttribute('.mp-picprev img', 'src');
      ok(src && src.length > 5000, tag + ': picture ' + what + ' ' + size);
      if (!dark) fs.writeFileSync(path.join(OUT, 'pic-' + what + '-' + size + '.png'), Buffer.from(src.split(',')[1], 'base64'));
    }
    await pg.keyboard.press('Escape');
    // backup round trip
    await pg.click('#mp-export');
    var dl = await Promise.all([pg.waitForEvent('download'), pg.click('#ex-save')]);
    var file = path.join(OUT, 'backup-' + tag + '.json'); await dl[0].saveAs(file);
    var j = JSON.parse(fs.readFileSync(file, 'utf8')); ok(j.trbMeals === 1 && j.state.plans.length === 1, tag + ': backup file saved');
    await pg.setInputFiles('#ex-open', file); await pg.waitForTimeout(300);
    ok(await pg.evaluate(function () { return JSON.parse(localStorage.getItem('trb-meals-v1')).plans.length; }) === 2, tag + ': backup imported (added as a second plan)');
    ok(await pg.locator('.mp-plantab[data-plan]').count() === 2, tag + ': plan tabs show both plans');
    // print page → PDF
    await pg.click('#mp-export'); await pg.check('[data-inc=cards]'); await pg.check('[data-inc=kids]'); await pg.check('[data-inc=prep]');
    await Promise.all([pg.waitForNavigation(), pg.click('#ex-print')]);
    await pg.waitForSelector('.mpp-grid'); await shot(pg, tag + '-print');
    ok(await pg.locator('.mpp-page').count() >= 4, tag + ': print page has grid, list, prep, cards and kids pages');
    if (!dark) { await pg.emulateMedia({ media: 'print' }); await pg.pdf({ path: path.join(OUT, 'plan.pdf'), format: 'Letter', printBackground: true }); }
    await check(pg, tag + ' print page');
    await pg.ctx.close();

    // ---------- phone: touch ----------
    pg = await page(b, { w: 390, dark: dark });
    await pg.goto(BASE + '/meal-prep/plan/', { waitUntil: 'networkidle' });
    await pg.tap('#mp-setup > summary');
    await pg.tap('#mp-open-lib'); await pg.waitForTimeout(300); await shot(pg, tag + '-390-library', false);
    var r1 = await pg.getAttribute('.mp-rec', 'data-r');
    await pg.tap('.mp-rec[data-r="' + r1 + '"]'); await pg.tap('.mp-cell[data-k="0|dinner"]'); await pg.tap('.mp-cell[data-k="2|dinner"]'); await pg.tap('#mp-placedone');
    c = await cellsOf(pg); ok(c['0|dinner'] && c['2|dinner'], tag + ': tap a recipe, tap two slots');
    await pg.tap('[data-addk="0|breakfast"]'); await pg.waitForTimeout(300); await pg.locator('#mp-lib-list .mp-rec').first().tap(); await pg.waitForTimeout(200);
    ok(!!(await cellsOf(pg))['0|breakfast'], tag + ': the ＋ in a slot adds straight to it');
    var cdp = await pg.ctx.newCDPSession(pg);
    await pg.locator('.mp-chip[data-k="2|dinner"]').scrollIntoViewIfNeeded();
    var a = await pg.locator('.mp-chip[data-k="2|dinner"]').boundingBox(); t = await pg.locator('.mp-cell[data-k="1|dinner"]').boundingBox();
    var p0 = { x: a.x + 30, y: a.y + 12 }, p1 = { x: t.x + 60, y: t.y + t.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p0] }); await pg.waitForTimeout(450);
    for (var i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p0.x + (p1.x - p0.x) * i / 12, y: p0.y + (p1.y - p0.y) * i / 12 }] }); await pg.waitForTimeout(20); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(250);
    c = await cellsOf(pg); ok(c['1|dinner'] && !c['2|dinner'], tag + ': long-press drag on a touch screen');
    var y0 = await pg.evaluate(function () { return scrollY; }); a = await pg.locator('.mp-chip[data-k="0|dinner"]').boundingBox();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x + 20, y: a.y + 10 }] });
    for (i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + 20, y: a.y + 10 - i * 25 }] }); await pg.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(300);
    ok((await pg.evaluate(function () { return scrollY; })) !== y0, tag + ': a quick swipe over a meal still scrolls the page');
    await pg.evaluate(function () { scrollTo(0, 0); });
    await shot(pg, tag + '-390-calendar');
    for (v of ['shop', 'nutr', 'prep', 'kids']) { await pg.tap('#tab-' + v); await pg.waitForTimeout(150); await shot(pg, tag + '-390-' + v); await check(pg, tag + ' phone ' + v); }
    await pg.tap('#tab-cal'); await pg.tap('#mp-open-lib'); await pg.tap('#mp-newrec'); await pg.waitForTimeout(200);
    await pg.fill('#ed-name', 'Test Casserole'); await pg.fill('.mp-ingq', 'chicken'); await pg.waitForTimeout(150); await pg.tap('[data-pick="0"]'); await pg.fill('[data-a="0"]', '2');
    await pg.tap('#ed-adding'); await pg.fill('[data-q="1"]', 'grandma secret sauce'); await pg.tap('[data-write="1"]'); await pg.fill('[data-a="1"]', '1');
    await shot(pg, tag + '-390-editor', false);
    await pg.tap('#ed-form button[type=submit]'); await pg.waitForTimeout(200);
    var mine = await pg.evaluate(function () { return JSON.parse(localStorage.getItem('trb-meals-v1')).mine; }), mk = Object.keys(mine);
    ok(mk.length === 1 && mine[mk[0]].ingredients.length === 2 && mine[mk[0]].ingredients[1].item === null, tag + ': own recipe saved with a catalog item and a write-in');
    await pg.tap('#mp-open-lib'); ok(await pg.locator('.mp-rec[data-r="' + mk[0] + '"]').count() === 1, tag + ': own recipe is in the library');
    await check(pg, tag + ' planner 390');
    await pg.ctx.close();

    // ---------- content pages ----------
    for (var w of [1280, 390]) {
      pg = await page(b, { w: w, dark: dark });
      for (var u of ['/meal-prep/', '/meal-prep/recipes/', '/meal-prep/guides/']) { await pg.goto(BASE + u, { waitUntil: 'networkidle' }); await check(pg, tag + ' ' + w + ' ' + u); await shot(pg, tag + '-' + w + u.replace(/\//g, '_')); }
      var rurl = await pg.evaluate(function () { return null; });
      await pg.goto(BASE + '/meal-prep/recipes/', { waitUntil: 'networkidle' });
      rurl = await pg.getAttribute('.mp-rcard', 'href');
      await pg.click('[data-f=quick]'); var shown = await pg.locator('.mp-rcard:not([hidden])').count(), all = await pg.locator('.mp-rcard').count();
      ok(shown > 0 && shown < all, tag + ' ' + w + ': recipe filter narrows the list');
      await pg.goto(BASE + rurl, { waitUntil: 'networkidle' });
      var base = +(await pg.textContent('#rp-n')); await pg.click('#rp-plus'); await pg.click('#rp-plus');
      ok(+(await pg.textContent('#rp-n')) === base + 2, tag + ' ' + w + ': recipe servings stepper');
      ok(!(await pg.locator('#rp-scalenote').isHidden()), tag + ' ' + w + ': scaling note appears');
      await shot(pg, tag + '-' + w + '-recipe'); await check(pg, tag + ' ' + w + ' recipe');
      var gl = await pg.locator('.mp-glink[href*="/guides/"]').first().getAttribute('href').catch(function () { return null; });
      if (gl) { await pg.goto(BASE + gl, { waitUntil: 'networkidle' }); await check(pg, tag + ' ' + w + ' guide'); await shot(pg, tag + '-' + w + '-guide'); }
      await pg.ctx.close();
    }
  }
  // ---------- from scratch and the garden ----------
  // a July week: burgers Mon, tacos Tue, French toast Wed (sandwich bread), spaghetti Thu, sandwiches Fri lunch, French toast again Sun
  function seedPlan(extra) {
    var s = { v: 1, cur: 'p1', plans: [{ id: 'p1', name: 'Week A', start: '2026-07-06', len: 7, slots: { breakfast: true, lunch: true, dinner: true, snack: false },
      cells: { '0|dinner': [{ r: 'classic-burgers' }], '1|dinner': [{ r: 'beef-tacos' }], '2|breakfast': [{ r: 'french-toast' }], '3|dinner': [{ r: 'spaghetti-meat-sauce' }], '4|lunch': [{ r: 'lunchbox-sandwiches' }], '6|breakfast': [{ r: 'french-toast' }] }, guests: {}, pantry: {}, extras: [] }],
      people: [{ k: 'adult', label: 'Adults', n: 2, f: 1 }, { k: 'child', label: 'Children (4–12)', n: 2, f: 0.6 }], avoid: [], diet: {}, rules: { noRepeat: 6, busy: [] }, mine: {}, view: 'shop', shopRange: 'all' };
    return JSON.stringify(Object.assign(s, extra || {}));
  }
  async function seeded(o, extra) {
    var pg = await page(b, o);
    await pg.addInitScript(function (s) { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('trb-meals-v1', s); } }, seedPlan(extra));
    return pg;
  }
  function stOf(pg) { return pg.evaluate(function () { return JSON.parse(localStorage.getItem('trb-meals-v1')); }); }
  for (var dark2 of [false, true]) for (var w2 of [1280, 390]) {
    var tg = (dark2 ? 'dark' : 'light') + ' ' + w2, tap = function (pg, sel) { return w2 < 500 ? pg.tap(sel) : pg.click(sel); };
    // the library and one recipe's "how much do you need?"
    pg = await page(b, { w: w2, dark: dark2 });
    await pg.goto(BASE + '/meal-prep/scratch/', { waitUntil: 'networkidle' });
    ok(await pg.locator('.mp-rcard').count() >= 40, tg + ': the from-scratch library lists the recipes');
    await check(pg, tg + ' scratch library'); await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-scratch-library');
    await pg.goto(BASE + '/meal-prep/scratch/sandwich-bread/', { waitUntil: 'networkidle' });
    await pg.selectOption('#sx-u', '0'); await pg.fill('#sx-n', '1.5'); await pg.waitForTimeout(100);
    var ingT = await pg.textContent('#sx-ings'), panT = await pg.textContent('#sx-pans');
    ok(/720 g/.test(ingT) && /10\.5 g/.test(ingT) && /13\.5 g/.test(ingT), tg + ': 1½ loaves → 720 g flour, 10.5 g yeast, 13.5 g salt by weight (' + ingT.slice(0, 120) + ')');
    ok(/2 × 8½ × 4½-inch loaf pan/.test(panT), tg + ': 1½ loaves → two 8½ × 4½ pans (' + panT + ')');
    await pg.fill('#sx-n', '24'); await pg.selectOption('#sx-u', '1'); await pg.fill('#sx-n', '24'); await pg.waitForTimeout(100);
    ok(/×1½/.test(await pg.textContent('#sx-what')), tg + ': 24 slices → ×1½ of the recipe');
    ok(/per slice/.test(await pg.textContent('#sx-nutr')), tg + ': nutrition per homemade slice');
    await check(pg, tg + ' scratch page'); await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-scratch-bread');
    await pg.goto(BASE + '/meal-prep/scratch/egg-pasta/', { waitUntil: 'networkidle' });
    await pg.selectOption('#sx-u', '1'); await pg.fill('#sx-n', '1'); await pg.waitForTimeout(100);
    ok(/4 large eggs/.test(await pg.textContent('#sx-ings')) && /400 g/.test(await pg.textContent('#sx-ings')), tg + ': 1 lb of dried spaghetti’s worth → 4 eggs and 400 g flour');
    await pg.goto(BASE + '/meal-prep/recipes/beef-tacos/', { waitUntil: 'networkidle' });
    ok(await pg.locator('a.mp-glink[href*="/meal-prep/scratch/corn-tortillas/"]').count() === 1, tg + ': the tacos page links “Make the corn tortillas yourself”');
    ok(await pg.locator('#rp-ings .mp-grow').count() >= 3, tg + ': recipe ingredients the garden can grow have a Grow it badge');
    await check(pg, tg + ' recipe with scratch links');
    // breads: the library's groups, the pretzel scaler (the soda bath doesn't scale), and the sourdough's day-before steps
    await pg.goto(BASE + '/meal-prep/scratch/', { waitUntil: 'networkidle' });
    var hs = await pg.$$eval('main h2', function (a) { return a.map(function (x) { return x.textContent.trim(); }); });
    var want = ['Yeast breads', 'Enriched breads', 'Sourdough', 'Flatbreads and tortillas', 'Quick breads', 'Boiled breads: pretzels and bagels', 'Pastry and crackers'];
    ok(want.every(function (g, i) { return hs.indexOf(g) >= 0 && (i === 0 || hs.indexOf(g) > hs.indexOf(want[i - 1])); }), tg + ': the library groups the breads in order (' + hs.join(' / ') + ')');
    ok(await pg.locator('.mp-jump a[href="#boiled-breads-pretzels-and-bagels"]').count() === 1, tg + ': the library has jump links to the groups');
    ok(/English muffins/.test(await pg.textContent('#yeast-breads')), tg + ': “English” keeps its capital in the library');
    await pg.goto(BASE + '/meal-prep/scratch/soft-pretzels/', { waitUntil: 'networkidle' });
    ok(/large pretzels/.test(await pg.textContent('#sx-u option[value="1"]')) && /pretzel buns/.test(await pg.textContent('#sx-u')), tg + ': the pretzel scaler counts pretzels or buns');
    await pg.selectOption('#sx-u', '1'); await pg.fill('#sx-n', '16'); await pg.waitForTimeout(100);
    var pzT = await pg.textContent('#sx-ings');
    ok(/1000 g|1,000 g|2 lb/.test(pzT) && /½ cup \(110 g\) baking soda/.test(pzT) && /8 cups water, for the bath/.test(pzT), tg + ': 16 pretzels → twice the flour, the same soda bath (' + pzT.replace(/\s+/g, ' ').slice(0, 220) + ')');
    ok(/×2/.test(await pg.textContent('#sx-what')), tg + ': 16 pretzels is ×2');
    var pzPage = await pg.textContent('main');
    ok(/250°F for 1 hour/.test(pzPage) && /not aluminum/.test(pzPage) && /history only/.test(pzPage), tg + ': the pretzel page has baked baking soda, a non-aluminum pot, and lye as history only');
    ok(/per large pretzel|per pretzel/.test(await pg.textContent('#sx-nutr')), tg + ': nutrition per homemade pretzel');
    await check(pg, tg + ' pretzel page'); await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-scratch-pretzels');
    await pg.goto(BASE + '/meal-prep/scratch/sourdough-bread/', { waitUntil: 'networkidle' });
    var sdT = await pg.textContent('#sx-th + p + table');
    ok((sdT.match(/the day before/g) || []).length === 5 && /1 day/.test(sdT), tg + ': sourdough marks its day-before steps and totals in days (' + sdT.replace(/\s+/g, ' ').slice(-80) + ')');
    await check(pg, tg + ' sourdough page');
    await pg.goto(BASE + '/meal-prep/scratch/challah/', { waitUntil: 'networkidle' });
    var chU = await pg.textContent('#sx-u');
    ok(/slices of challah/.test(chU) && !/dried/.test(chU) && /per 40-g slice/.test(await pg.textContent('#sx-nutr')), tg + ': a bread made by weight scales by slices, not “dried” (' + chU + ')');
    await pg.goto(BASE + '/meal-prep/scratch/sourdough-starter/', { waitUntil: 'networkidle' });
    ok(/1:1:1/.test(await pg.textContent('main')) && /green/.test(await pg.textContent('main')), tg + ': the starter guide gives the feeding ratio and when to throw it out');
    await pg.ctx.close();
    // a recipe of my own with bagels and sourdough: Make it, and the prep day starts the day before
    pg = await seeded({ w: w2, dark: dark2 }, { mine: { 'my-brunch': { name: 'Bagel brunch', servings: 4, meal: ['breakfast'], ingredients: [{ item: 'bagels', amount: 4, unit: 'each' }, { item: 'sourdough', amount: 4, unit: 'slice' }], steps: ['Toast and serve.'] } },
      plans: [{ id: 'p1', name: 'Week A', start: '2026-07-06', len: 7, slots: { breakfast: true, lunch: true, dinner: true, snack: false }, cells: { '1|breakfast': [{ r: 'my-brunch' }] }, guests: {}, pantry: {}, extras: [] }] });
    await pg.goto(BASE + '/meal-prep/plan/', { waitUntil: 'networkidle' });
    ok(await pg.locator('#mp-shop [data-make="bagels"]').count() === 1 && await pg.locator('#mp-shop [data-make="sourdough"]').count() === 1, tg + ': bagels and sourdough on the list have Make it');
    await tap(pg, '#mp-shop [data-make="bagels"]'); await pg.waitForTimeout(150); await tap(pg, '#mp-shop [data-make="sourdough"]'); await pg.waitForTimeout(200);
    ok(await pg.locator('#mp-shop .mp-shopsec .mp-sn', { hasText: /^Bagels$/ }).count() === 0 && await pg.locator('#mp-shop .mp-sn', { hasText: 'Bread flour' }).count() === 1, tg + ': Make it swaps bagels and sourdough for bread flour');
    await tap(pg, '#tab-prep'); await pg.waitForTimeout(200);
    var prepT = await pg.textContent('#mp-prep');
    ok(/The day before/.test(prepT) && /Feed the starter/.test(await pg.textContent('#mp-prep .mp-before').catch(function () { return ''; })), tg + ': prep day lists the sourdough’s day-before steps');
    var tl2 = await pg.$$eval('.mp-timeline li', function (a) { return a.map(function (x) { return x.textContent; }); });
    ok(tl2.some(function (t) { return /Sourdough bread/.test(t) && /Bake at 475/.test(t); }) && !tl2.some(function (t) { return /Feed the starter/.test(t); }), tg + ': the timeline bakes the sourdough and leaves the starter to the day before');
    ok(tl2.some(function (t) { return /Bagels/.test(t) && /Boil/.test(t); }), tg + ': the bagels are boiled on prep day');
    await check(pg, tg + ' prep with sourdough'); await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-prep-sourdough');
    await pg.ctx.close();

    // the planner: Make it swaps the item for its ingredients; Buy instead puts it back
    pg = await seeded({ w: w2, dark: dark2 });
    await pg.goto(BASE + '/meal-prep/plan/', { waitUntil: 'networkidle' });
    ok(await pg.locator('#mp-shop .mp-sn', { hasText: 'Corn tortillas' }).count() === 1, tg + ': corn tortillas are on the list');
    await tap(pg, '#mp-shop [data-make="corn-tortillas"]'); await pg.waitForTimeout(200);
    ok(await pg.locator('#mp-shop .mp-shopsec .mp-sn', { hasText: 'Corn tortillas' }).count() === 0 && await pg.locator('#mp-shop .mp-sn', { hasText: 'Masa harina' }).count() === 1, tg + ': Make it swaps the tortillas for masa harina');
    ok(/Corn tortillas/.test(await pg.textContent('#sl-made')), tg + ': the From scratch panel lists the tortillas');
    ok((await stOf(pg)).make['corn-tortillas'] === true, tg + ': the choice is saved');
    await tap(pg, '#sl-made [data-make="corn-tortillas"]'); await pg.waitForTimeout(200);
    ok(await pg.locator('#mp-shop .mp-shopsec .mp-sn', { hasText: 'Corn tortillas' }).count() === 1 && await pg.locator('#mp-shop .mp-sn', { hasText: 'Masa harina' }).count() === 0, tg + ': Buy instead puts them back');
    // household default: make from scratch when I can
    await tap(pg, '#mp-setup > summary'); await pg.check('#mp-makeall'); await pg.waitForTimeout(200);
    var made = await pg.textContent('#mp-make-sum');
    ok(/sandwich bread/i.test(made) && /hamburger buns/.test(made) && !/brown sugar/.test(made), tg + ': “make when I can” covers scratch recipes, not stand-ins (' + made + ')');
    await tap(pg, '#mp-setup > summary');
    await tap(pg, '#tab-shop'); await pg.waitForTimeout(200);
    ok(await pg.locator('#mp-shop .mp-shopsec .mp-sn', { hasText: /^Hamburger buns$/ }).count() === 0 && await pg.locator('#mp-shop .mp-sn', { hasText: 'All-purpose flour' }).count() === 1, tg + ': buns and bread become flour and yeast');
    var flourRow = await pg.locator('#mp-shop li', { has: pg.locator('.mp-sn', { hasText: 'All-purpose flour' }) }).textContent();
    ok(/Sandwich bread \(homemade\)/.test(flourRow) && /Soft buns/.test(flourRow), tg + ': one flour row for both homemade breads');
    await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-shop-scratch');
    // prep day: the dough is mixed first and baked after rising; Sunday's bread is frozen
    await tap(pg, '#tab-prep'); await pg.waitForTimeout(200);
    var tl = await pg.$$eval('.mp-timeline li', function (a) { return a.map(function (x) { return x.textContent; }); });
    var iMix = tl.findIndex(function (t) { return /Sandwich bread/.test(t) && /Mix and knead/.test(t); }), iBake = tl.findIndex(function (t) { return /Sandwich bread/.test(t) && /Bake at 350/.test(t); });
    function tmin(t) { var m = /(\d+):(\d\d) (AM|PM)/.exec(t); return m ? (+m[1] % 12 + (m[3] === 'PM' ? 12 : 0)) * 60 + +m[2] : -1; }
    var tMix = iMix >= 0 ? tmin(tl[iMix]) : -1, tBake = iBake >= 0 ? tmin(tl[iBake]) : -1;
    ok(iMix >= 0 && iBake > iMix, tg + ': prep day mixes the bread dough early and bakes it later (' + iMix + ', ' + iBake + ')');
    ok(tBake - tMix >= 25 + 90 + 10 + 50, tg + ': the bread goes in only after kneading and two rises (' + (tBake - tMix) + ' min)');
    var ovens = await pg.$$eval('.mp-timeline li', function (a) { return a.filter(function (x) { return /Heat the oven/.test(x.textContent); }).length; });
    ok(ovens >= 1, tg + ': the oven heating is called out');
    ok(/Freeze the part for Sat Jul 11|Freeze the part for Sun Jul 12/.test(await pg.textContent('#mp-prep .mp-scratchsel')), tg + ': bread for the end of the week is frozen on prep day');
    await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-prep-scratch');
    await check(pg, tg + ' planner prep with scratch');
    // nutrition counts the homemade versions
    await tap(pg, '#tab-nutr'); await pg.waitForTimeout(200);
    ok(/Counted as homemade/.test(await pg.textContent('#mp-nutr')), tg + ': nutrition says it counts homemade versions');
    // the grow view and "What I grow"
    await tap(pg, '#tab-grow'); await pg.waitForTimeout(200);
    ok(await pg.locator('.mp-growtab tbody tr').count() >= 4, tg + ': the grow view lists the plan’s crops');
    var gh = await pg.getAttribute('#gr-open', 'href');
    ok(/crops=[^&]*tomatoes/.test(decodeURIComponent(gh)) && /mode=only/.test(gh), tg + ': the Garden Planner link carries the crops (' + gh + ')');
    await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-grow');
    await check(pg, tg + ' grow view');
    await tap(pg, '#mp-grow [data-growdlg]'); await pg.waitForTimeout(200);
    await tap(pg, '[data-gon="tomatoes"]'); await pg.waitForTimeout(150);
    ok(await pg.locator('[data-gk="tomatoes"] .mp-mon[aria-pressed="true"]').count() >= 3, tg + ': tomatoes start with the garden calendar’s example months');
    await tap(pg, '[data-gk="tomatoes"] .mp-mon[data-gm="12"]'); await pg.waitForTimeout(100);
    ok((await stOf(pg)).grow.crops.tomatoes.m.indexOf(12) >= 0, tg + ': a month toggle is saved');
    await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-growdlg', false);
    await tap(pg, '#gw-done'); await pg.waitForTimeout(200);
    await tap(pg, '#tab-shop'); await pg.waitForTimeout(200);
    var gsec = await pg.textContent('#sl-garden').catch(function () { return ''; });
    ok(/Tomatoes/.test(gsec) && /Crushed tomatoes/.test(gsec), tg + ': July tomatoes move to “From your garden”');
    ok(await pg.locator('#mp-shop .mp-shopsec:not(#sl-garden) .mp-sn', { hasText: /^Tomatoes$/ }).count() === 0, tg + ': and off the buying list');
    await check(pg, tg + ' shop with garden');
    await tap(pg, '#tab-cal');
    if (w2 < 500) { await tap(pg, '#mp-open-lib'); await pg.waitForTimeout(200); }
    ok(await pg.locator('[data-f="garden"]').count() === 1, tg + ': the library has a “From my garden” filter');
    await tap(pg, '[data-f="garden"]'); await pg.waitForTimeout(150);
    var nrec = await pg.locator('#mp-lib-list .mp-rec').count();
    ok(nrec > 0 && nrec < 40, tg + ': it shows recipes using what you grow (' + nrec + ')');
    await pg.ctx.close();

    // garden hand-off both ways
    pg = await page(b, { w: w2, dark: dark2 });
    await pg.goto(BASE + '/garden/?crops=tomatoes,cucumbers&mode=only&people=4&hens=3&from=meals', { waitUntil: 'networkidle' });
    var gst = await pg.evaluate(function () { return JSON.parse(localStorage.getItem('trb-garden-v1')); });
    ok(gst.must.join() === 'tomatoes,cucumbers' && gst.mode === 'only' && gst.people === 4 && gst.hens && gst.nhens === 3, tg + ': the Garden Planner opens with the meal plan’s crops');
    ok(!/crops=/.test(pg.url()), tg + ': and tidies the address');
    ok(await pg.locator('#gd-frommeals').count() === 1 && await pg.locator('#gd-out .gd-cook').count() >= 2, tg + ': it says where they came from and links Cook it recipes');
    ok(await pg.locator('#gd-table tr', { hasText: /^Cucumbers/ }).locator('.gd-cook a[href*="/meal-prep/scratch/refrigerator-pickles/"]').count() === 1, tg + ': cucumbers → refrigerator pickles in the crop reference');
    await check(pg, tg + ' garden from meals'); await shot(pg, (dark2 ? 'dark' : 'light') + '-' + w2 + '-garden-handoff');
    var hh = await pg.getAttribute('#gd-harvest', 'href');
    ok(/harvest=tomatoes%3A6-10%2Ccucumbers%3A5-10%2Chens%3A1-12/.test(hh), tg + ': “Plan meals around my harvest” carries the months (' + hh + ')');
    await Promise.all([pg.waitForNavigation(), tap(pg, '#gd-harvest')]); await pg.waitForLoadState('networkidle'); await pg.waitForTimeout(200);
    var mst = await stOf(pg);
    ok(mst.grow.crops.tomatoes.on && mst.grow.crops.tomatoes.m.join() === '6,7,8,9,10' && mst.grow.animals.hens.on, tg + ': Meal Prep takes the harvest months');
    ok(/From your Garden Planner/.test(await pg.textContent('#mp-msg')), tg + ': and says so');
    ok(!/harvest=/.test(pg.url()), tg + ': and tidies the address');
    await check(pg, tg + ' planner from garden');
    await pg.ctx.close();
  }

  // ---------- storage blocked ----------
  pg = await page(b, { w: 1280, block: true });
  await pg.goto(BASE + '/meal-prep/plan/', { waitUntil: 'networkidle' });
  ok(await pg.isVisible('#mp-nostore'), 'storage blocked: the page warns that nothing is saved');
  await pg.click('.mp-rec'); await pg.click('.mp-cell[data-k="0|dinner"]'); await pg.click('#mp-placedone');
  ok(await pg.locator('.mp-chip').count() === 1, 'storage blocked: the planner still works');
  await pg.click('#mp-export'); await Promise.all([pg.waitForNavigation(), pg.click('#ex-print')]); await pg.waitForSelector('.mpp-grid');
  ok(await pg.locator('.mpp-m').count() === 1, 'storage blocked: the print page still gets the plan');
  // the site's theme script reads localStorage without a guard; only errors from the meal-prep scripts count here
  var mine = (pg.stacks || []).filter(function (x) { return /meal-prep\/[a-z-]+\.js/.test(x); });
  ok(!mine.length, 'storage blocked: no errors from the meal-prep scripts ' + mine.join(' || '));
  await pg.goto(BASE + '/meal-prep/scratch/corn-tortillas/', { waitUntil: 'networkidle' });
  ok(/16/.test(await pg.inputValue('#sx-n')) && await pg.locator('#sx-ings li').count() === 3, 'storage blocked: the from-scratch scaler still works');
  mine = (pg.stacks || []).filter(function (x) { return /meal-prep\/[a-z-]+\.js/.test(x); });
  ok(!mine.length, 'storage blocked: no errors from the scratch page ' + mine.join(' || '));
  await b.close();
  console.log(pass + ' passed, ' + fail + ' failed; screenshots, pictures and plan.pdf in ' + OUT);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
