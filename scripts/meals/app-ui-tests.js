/* Browser tests for the Meal Prep pages. Build the site, serve it, then:
     NODE_PATH=$(npm root -g) node scripts/meals/app-ui-tests.js http://localhost:9102 /tmp/meal-shots
   Checks at 1280 and 390 px, light and dark: no console errors, no sideways scrolling; placing meals with a
   mouse drag, a touch long-press drag, tap-to-place and the keyboard; leftovers, shuffle, tabs, the recipe
   editor (catalog item + write-in), backup export/import, recipe-page scaling, storage blocked, the print
   page (saved as a PDF) and the PNG pictures (saved for looking at). */
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
  await b.close();
  console.log(pass + ' passed, ' + fail + ' failed; screenshots, pictures and plan.pdf in ' + OUT);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
