/* Culinary Ladder: generators for cuflavor (course key cuflavor). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cuflavor.js: edit those, not this file. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  /* shared helpers (every Culinary course file starts with these) */
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(fx(x)), tol: tol }; }
  function PC(x, rtol) { var o = { t: 'num', v: String(fx(x)), pct: true }; if (rtol) o.rtol = rtol; return o; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function money(x) { return T.money(r2(x).toFixed(2).replace(/\.00$/, '')); }
  function m2(x) { return '\\$' + r2(x).toFixed(2); }
  /* a recall item: [question, correct answer, [wrong answers], why (shown after answering)] */
  function bank(R, items) { var it = R.pick(items); return { q: it[0], a: MC(it[1], it[2]), steps: [it[3] || (it[1] + '.')] }; }
  /* a true-or-false style pick between two lists: "Which of these is X?" */
  function which(R, q, yes, no, why) { var c = R.pick(yes); return { q: q, a: MC(c, R.sample(no, 3)), steps: [why ? why(c) : c + '.'] }; }
  // ===== Flavor, Seasoning and Menu Design (cuflavor)
  G('cuflavor.tastes', function (R, ctx) {
    var kind = by(ctx, 'taste', R.pick(['taste', 'bank']), R.pick(['taste', 'bank']));
    if (kind === 'taste') { var it = R.pick([['lemon juice', 'Sour'], ['vinegar', 'Sour'], ['plain yogurt', 'Sour'], ['honey', 'Sweet'], ['ripe mango', 'Sweet'], ['caramelized onions', 'Sweet'], ['soy sauce', 'Umami'], ['aged Parmesan', 'Umami'], ['dried mushrooms', 'Umami'], ['anchovies', 'Umami'], ['coffee', 'Bitter'], ['radicchio', 'Bitter'], ['dark chocolate (unsweetened)', 'Bitter'], ['olives in brine', 'Salty'], ['capers', 'Salty'], ['feta cheese', 'Salty']]);
      return { q: 'Which basic taste stands out most in ' + it[0] + '?', a: MC(it[1], ['Sweet', 'Sour', 'Salty', 'Bitter', 'Umami']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['How many basic tastes does the tongue sense?', 'Five: sweet, sour, salty, bitter, umami', ['Three', 'Four, with no umami', 'Ten'], ''],
      ['Where does most of a food\'s flavor come from?', 'Aroma, smelled through the back of the nose', ['The tip of the tongue', 'The teeth', 'Color'], ''],
      ['Is the "tongue map" with one taste per zone true?', 'No; every taste is sensed all over the tongue', ['Yes', 'Only for sweet', 'Only for children'], ''],
      ['What is umami?', 'A savory taste, from glutamates', ['A spicy feeling', 'A sour taste', 'A kind of salt'], ''],
      ['Why does food taste flat when you have a cold?', 'You can\'t smell its aroma', ['Your tongue stops working', 'Food changes', 'Salt stops working'], ''],
      ['Chile heat is…', 'a chemical feeling, not one of the basic tastes', ['the sixth basic taste', 'a kind of sweetness', 'a sour taste'], '']
    ]);
  });

  G('cuflavor.seasoning', function (R, ctx) {
    var kind = by(ctx, R.pick(['lever', 'salt']), R.pick(['salt', 'lever', 'bank']), R.pick(['salt', 'salt2', 'lever']));
    if (kind === 'salt') { var w = R.int(10, 80) * 100, p = R.pick([0.8, 1, 1.2]); return { q: 'A pot of soup weighs ' + T.commas(w) + ' g. Starting with salt at ' + p + '% of its weight, how many grams of salt?', a: AX(w * p / 100), unit: 'g', steps: ['$' + T.commas(w) + ' \\times ' + T.num(p / 100) + ' = ' + fx(w * p / 100) + '$ g, then adjust by tasting.'] }; }
    if (kind === 'salt2') { var w2 = R.int(10, 60) * 100, s = R.int(10, 60); return { q: 'You salted ' + T.commas(w2) + ' g of stew with ' + s + ' g of salt. What percent of its weight is salt?', a: PC(r2(100 * s / w2), 0.01), steps: ['$' + s + ' \\div ' + T.commas(w2) + ' \\approx ' + sg(s / w2, 3) + '$, about ' + r2(100 * s / w2) + '%.'] }; }
    if (kind === 'lever') { var it = R.pick([['A rich cream sauce tastes heavy and dull', 'Acid'], ['A soup tastes bland and flat', 'Salt'], ['A lean dish tastes thin and dry', 'Fat'], ['A dish needs more depth and a little kick', 'Heat'], ['Braised short ribs taste too rich', 'Acid'], ['Steamed vegetables taste of nothing', 'Salt']]);
      return { q: 'Which lever would you reach for first? ' + it[0] + '.', a: MC(it[1], ['Salt', 'Acid', 'Fat', 'Heat']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['What does salt do to food?', 'Makes it taste more like itself and softens bitterness', ['Makes it sour', 'Makes it spicy', 'Removes aroma'], ''],
      ['What does acid do?', 'Brightens and cuts richness', ['Adds sweetness', 'Thickens', 'Adds fat'], ''],
      ['Why season in layers?', 'Salt added at each stage seasons food through', ['It saves salt', 'It is faster', 'It makes food sweeter'], ''],
      ['When can pasta absorb seasoning?', 'While it cooks in salted water', ['Only after draining', 'Never', 'Only when cold'], '']
    ]);
  });

  G('cuflavor.tasting-adjusting', function (R, ctx) {
    var kind = by(ctx, 'fix', R.pick(['fix', 'bank']), R.pick(['fix', 'bank']));
    if (kind === 'fix') { var it = R.pick([['Too salty', 'Add more of the unsalted base'], ['Flat and dull', 'Add salt, then a little acid'], ['Too sour', 'Add a little sweetness or fat'], ['Too sweet', 'Add acid or a pinch of salt'], ['Too bitter', 'Add salt, fat or sweetness'], ['Too spicy', 'Add dairy, fat or more base']]);
      return { q: 'A soup is ' + it[0].toLowerCase() + '. What is the usual fix?', a: MC(it[1], ['Add more of the unsalted base', 'Add salt, then a little acid', 'Add a little sweetness or fat', 'Add acid or a pinch of salt', 'Add salt, fat or sweetness', 'Add dairy, fat or more base']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['How do you taste food while cooking?', 'With a clean spoon each time', ['With the stirring spoon', 'With your fingers', 'Only at the end'], 'Never double-dip.'],
      ['Can sugar fix too much salt?', 'Not really; dilute with more unsalted base', ['Yes, completely', 'Yes, with lemon', 'Yes, with more salt'], ''],
      ['Cold food needs…', 'a little more seasoning than hot', ['no seasoning', 'less seasoning than hot', 'only sugar'], ''],
      ['Why adjust in small steps?', 'You can add but not take away', ['It is faster', 'Salt is expensive', 'Spoons are small'], ''],
      ['When should you taste the parts of a plate together?', 'After tasting each part alone', ['Never', 'Only the sauce', 'Only the guest does'], '']
    ]);
  });

  G('cuflavor.herbs-spices', function (R, ctx) {
    var kind = by(ctx, R.pick(['hardy', 'conv', 'base']), R.pick(['conv', 'hardy', 'base', 'conv2']), R.pick(['conv', 'conv2', 'hardy']));
    if (kind === 'conv') { var f = R.int(1, 24) * 3, u = R.pick([['teaspoons', 'tsp'], ['tablespoons', 'Tbsp']]), hb = R.pick(['oregano', 'thyme', 'basil', 'dill', 'tarragon', 'parsley', 'sage', 'rosemary']); return { q: 'A recipe calls for ' + f + ' ' + u[0] + ' of fresh ' + hb + '. Using 1 part dried for 3 parts fresh, how much dried?', a: AX(f / 3), unit: u[1], steps: ['$' + f + ' \\div 3 = ' + f / 3 + '$ ' + u[0] + '.'] }; }
    if (kind === 'conv2') { var d = R.int(1, 16), hb2 = R.pick(['oregano', 'thyme', 'basil', 'dill', 'marjoram', 'sage']); return { q: 'You have ' + d + ' tablespoon' + (d > 1 ? 's' : '') + ' of dried ' + hb2 + ' in a recipe and want to use fresh. Using 3 parts fresh for 1 part dried, how much fresh?', a: AX(d * 3), unit: 'Tbsp', steps: ['$' + d + ' \\times 3 = ' + d * 3 + '$ tablespoons.'] }; }
    if (kind === 'base') { var it = R.pick([['Onion, carrot and celery', 'Mirepoix (French)'], ['Onion, celery and green bell pepper', 'Holy trinity (Cajun and Creole)'], ['Onion, carrot and celery cooked slowly in olive oil', 'Soffritto (Italian)'], ['Thyme, bay and parsley stems tied together', 'Bouquet garni']]);
      return { q: 'What is this aromatic base called? ' + it[0] + '.', a: MC(it[1], ['Mirepoix (French)', 'Holy trinity (Cajun and Creole)', 'Soffritto (Italian)', 'Bouquet garni']), steps: [it[1] + '.'] }; }
    var h = R.pick([['thyme', 'Early'], ['rosemary', 'Early'], ['bay leaf', 'Early'], ['sage', 'Early'], ['oregano', 'Early'], ['basil', 'At the end'], ['parsley', 'At the end'], ['cilantro', 'At the end'], ['chives', 'At the end'], ['dill', 'At the end'], ['mint', 'At the end'], ['tarragon', 'At the end']]);
    return { q: 'In a long-simmered dish, when does fresh ' + h[0] + ' usually go in?', a: MC(h[1], ['Early', 'At the end']), steps: [h[1] === 'Early' ? 'A hardy herb: it holds up to long cooking.' : 'A tender herb: heat drives off its flavor, so add it at the end.'] };
  });

  G('cuflavor.seasonality', function (R, ctx) {
    var it = R.pick([['asparagus', 'Spring'], ['peas', 'Spring'], ['rhubarb', 'Spring'], ['radishes', 'Spring'], ['tomatoes', 'Summer'], ['sweet corn', 'Summer'], ['zucchini', 'Summer'], ['peaches', 'Summer'], ['blueberries', 'Summer'], ['apples', 'Fall'], ['pears', 'Fall'], ['winter squash', 'Fall'], ['pumpkins', 'Fall'], ['citrus fruit', 'Winter'], ['kale', 'Winter'], ['cabbage', 'Winter']]);
    var kind = by(ctx, 'season', R.pick(['season', 'bank']), R.pick(['season', 'bank']));
    if (kind === 'season') return { q: 'In much of the United States, when are ' + it[0] + ' at their peak?', a: MC(it[1], ['Spring', 'Summer', 'Fall', 'Winter']), steps: [it[1] + '. Seasons shift with region and climate.'] };
    return bank(R, [
      ['Why does seasonal produce usually taste better?', 'It is picked ripe and eaten soon', ['It is always organic', 'It has added sugar', 'It is frozen'], ''],
      ['Why is long-shipped produce often less flavorful?', 'It is picked before it is ripe so it survives the trip', ['It is cooked first', 'It is salted', 'It is a different plant'], ''],
      ['What is a smart way to write a seasonal menu?', 'Dishes that can swap one vegetable for another as the season changes', ['One menu all year', 'Only imported produce', 'Only frozen vegetables'], ''],
      ['How do kitchens carry summer into winter?', 'Pickles, jams and frozen purées', ['They can\'t', 'Only canned soup', 'By raising prices'], '']
    ]);
  });

  G('cuflavor.menu-writing', function (R, ctx) {
    var kind = by(ctx, R.pick(['price', 'bank']), R.pick(['price', 'pct', 'class']), R.pick(['price', 'pct', 'class']));
    if (kind === 'price') { var c = R.int(150, 900) / 100, p = R.pick([25, 28, 30, 32, 35]); var pr = c / (p / 100); return { q: 'A dish costs ' + m2(c) + ' per portion. At a ' + p + '% food-cost target, what menu price does the formula give? (price = cost ÷ food-cost %)', a: A(pr, 4, 0.005), unit: 'dollars', steps: ['$' + c.toFixed(2) + ' \\div ' + T.num(p / 100) + ' \\approx ' + pr.toFixed(2) + '$.'] }; }
    if (kind === 'pct') { var c2 = R.int(200, 900) / 100, pr2 = R.int(12, 40); return { q: 'A dish costs ' + m2(c2) + ' and sells for \\$' + pr2 + '. What is its food-cost percent?', a: PC(r1(100 * c2 / pr2), 0.01), steps: ['$' + c2.toFixed(2) + ' \\div ' + pr2 + ' \\approx ' + sg(c2 / pr2, 3) + '$, about ' + r1(100 * c2 / pr2) + '%.'] }; }
    if (kind === 'class') { var it = R.pick([['popular and profitable', 'Star'], ['popular but not very profitable', 'Plowhorse'], ['profitable but not popular', 'Puzzle'], ['neither popular nor profitable', 'Dog']]); return { q: 'In menu engineering, what is a dish that is ' + it[0] + ' called?', a: MC(it[1], ['Star', 'Plowhorse', 'Puzzle', 'Dog']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Why balance a menu across stations?', 'So one cook isn\'t overloaded on a busy night', ['To use more pans', 'It looks nicer', 'It isn\'t needed'], ''],
      ['What should a menu description do?', 'Say clearly and honestly what the dish is, including allergens and raw items', ['Hide the main ingredient', 'Use as many adjectives as possible', 'Be in a foreign language'], ''],
      ['What do chefs usually do with a "dog" on the menu?', 'Replace it', ['Feature it', 'Raise its price', 'Add more of it'], ''],
      ['Which menu is better balanced?', 'One with several cooking methods, colors and price points', ['Five fried dishes', 'All dishes from the grill', 'All cream sauces'], '']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
