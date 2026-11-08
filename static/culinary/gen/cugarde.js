/* Culinary Ladder: generators for cugarde (course key cugarde). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cugarde.js: edit those, not this file. */
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
  // ===== Garde Manger and Preservation (cugarde)
  G('cugarde.salads-dressings', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'vin']), R.pick(['vin', 'bank', 'greens']), R.pick(['vin', 'greens']));
    if (kind === 'vin') { var cups = R.int(1, 16) / 2, what = R.coin() ? 'oil' : 'acid'; return { q: 'A vinaigrette is 3 parts oil to 1 part acid. How many cups of ' + what + ' for ' + T.num(cups) + ' cup' + (cups === 1 ? '' : 's') + ' of dressing?', a: AX(what === 'oil' ? cups * 0.75 : cups / 4), unit: 'cups', steps: ['4 parts in all.', '$' + T.num(cups) + ' \\times \\tfrac{' + (what === 'oil' ? 3 : 1) + '}{4} = ' + fx(what === 'oil' ? cups * 0.75 : cups / 4) + '$ cups.'] }; }
    if (kind === 'greens') { var n = R.int(4, 60), oz = R.pick([1, 1.5, 2, 3]); return { q: 'A side salad uses ' + T.num(oz) + ' oz of greens. How many pounds of greens for ' + n + ' salads? (16 oz = 1 lb)', a: AT(r2(n * oz / 16), 0.01), unit: 'lb', steps: ['$' + n + ' \\times ' + T.num(oz) + ' = ' + fx(n * oz) + '$ oz.', '$' + fx(n * oz) + ' \\div 16 ' + ((n * oz) % 16 ? '\\approx ' : '= ') + r2(n * oz / 16) + '$ lb.'] }; }
    return bank(R, [
      ['What does "garde manger" mean?', 'Keeper of the food: the cold kitchen', ['The head chef', 'The grill cook', 'The dishwasher'], ''],
      ['Why dry greens completely before dressing?', 'Oil won\'t cling to wet leaves', ['Water makes them bitter', 'Dry greens last forever', 'It is only for looks'], ''],
      ['When should a tossed salad be dressed?', 'Just before serving', ['An hour ahead', 'The night before', 'After the guest eats'], 'Acid and salt wilt leaves.'],
      ['Under the Food Code, cut leafy greens are…', 'A TCS food kept at 41°F or below', ['Safe at room temperature all day', 'Never a hazard', 'A dry food'], ''],
      ['How do you wash greens with grit?', 'In plenty of cold water, then lift them out so grit stays behind', ['Pour them into a colander with the water', 'Rub them with soap', 'Soak them in hot water'], ''],
      ['What is a composed salad?', 'One arranged piece by piece on the plate', ['One tossed in a bowl', 'A salad with no dressing', 'A frozen salad'], '']
    ]);
  });

  G('cugarde.canapes', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'count']), R.pick(['count', 'each']), R.pick(['count', 'each', 'bank']));
    if (kind === 'count') { var g = R.int(2, 30) * 5, per = R.pick([4, 5, 6, 8, 10]); return { q: 'A reception for ' + g + ' guests plans ' + per + ' canapés per person. How many canapés in all?', a: AX(g * per), steps: ['$' + g + ' \\times ' + per + ' = ' + T.commas(g * per) + '$.'] }; }
    if (kind === 'each') { var g2 = R.int(2, 20) * 10, per2 = R.pick([4, 5, 6]), kinds = R.pick([2, 4, 5]); return { q: g2 + ' guests, ' + per2 + ' pieces each, split evenly among ' + kinds + ' kinds of canapé. How many of each kind?', a: AX(g2 * per2 / kinds), steps: ['$' + g2 + ' \\times ' + per2 + ' = ' + g2 * per2 + '$ pieces.', '$' + g2 * per2 + ' \\div ' + kinds + ' = ' + fx(g2 * per2 / kinds) + '$ of each.'] }; }
    return bank(R, [
      ['What are the three parts of a canapé?', 'Base, spread and garnish', ['Bread, meat and cheese', 'Crust, filling and sauce', 'Plate, napkin and pick'], ''],
      ['Why put butter or cream cheese on the base?', 'It keeps the base from going soggy', ['It is required by law', 'Only for color', 'It makes it heavier'], ''],
      ['How big should a canapé be?', 'One or two bites', ['A full sandwich', 'A dinner portion', 'As big as a plate'], ''],
      ['Why not build canapés on bread hours ahead?', 'They go soft', ['They freeze', 'They shrink', 'They become illegal'], ''],
      ['At what temperature should cold canapés be kept until served?', '41°F or below', ['Room temperature', '60°F', '50°F'], '']
    ]);
  });

  G('cugarde.pickles', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'brine']), R.pick(['brine', 'bank']), R.pick(['brine', 'salt', 'bank']));
    if (kind === 'brine') { var c = R.int(1, 12) / 2; return { q: 'A quick pickle brine is equal parts vinegar and water. How many cups of vinegar for ' + T.num(c * 2) + ' cups of brine?', a: AX(c), unit: 'cups', steps: ['Half of the brine: $' + T.num(c * 2) + ' \\div 2 = ' + T.num(c) + '$ cups.'] }; }
    if (kind === 'salt') { var w = R.int(2, 12) * 250, p = R.pick([2, 3, 4, 5]); return { q: 'A refrigerator pickle brine uses salt at ' + p + '% of the liquid\'s weight. How many grams of salt for ' + T.commas(w) + ' g of liquid?', a: AX(w * p / 100), unit: 'g', steps: ['$' + T.commas(w) + ' \\times ' + T.num(p / 100) + ' = ' + fx(w * p / 100) + '$ g.'] }; }
    return bank(R, [
      ['Where are quick pickles kept?', 'In the refrigerator', ['On the pantry shelf', 'In a warm cupboard', 'Anywhere sealed'], ''],
      ['To can pickles for the shelf, you should…', 'Follow a tested recipe from USDA or an extension service exactly', ['Invent your own recipe', 'Use less vinegar for flavor', 'Skip processing if the jar seals'], ''],
      ['What acidity should pickling vinegar be at least?', '5%', ['0.5%', '1%', '50%'], 'It says so on the label.'],
      ['Which salt is good for pickling?', 'Pickling or canning salt, or additive-free kosher salt', ['Iodized table salt with anti-caking agents', 'Seasoned salt', 'Garlic salt'], ''],
      ['In a canning recipe, can you reduce the vinegar?', 'No', ['Yes, by half', 'Yes, if you add sugar', 'Yes, if you refrigerate'], 'Acidity keeps the jar safe.'],
      ['How are fermented pickles like sauerkraut made sour?', 'Bacteria make acid', ['Added vinegar only', 'Lemon juice', 'Boiling'], 'Follow a tested recipe.']
    ]);
  });

  G('cugarde.confit-terrines', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'date']), R.pick(['date', 'bank', 'temp']));
    if (kind === 'date') { var d = R.int(1, 21); return { q: 'A terrine is made on day ' + d + ' of the month and kept at 41°F. By the 7-day date-marking rule (made day = day 1), what is the last day of the month it may be used?', a: AX(d + 6), steps: ['$' + d + ' + 6 = ' + (d + 6) + '$.'] }; }
    if (kind === 'temp') { var it = R.pick([['chicken liver pâté', '165°F'], ['duck terrine', '165°F'], ['pork terrine', '155°F (Food Code, ground meat) or 160°F (USDA)'], ['country pâté of ground pork', '155°F (Food Code, ground meat) or 160°F (USDA)']]); return { q: 'To what internal temperature is a ' + it[0] + ' cooked?', a: MC(it[1], ['165°F', '155°F (Food Code, ground meat) or 160°F (USDA)', '120°F', '135°F']), steps: [it[1].indexOf('165') === 0 ? 'It contains poultry: 165°F.' : 'Ground pork: 155°F for 17 seconds by the Food Code, or 160°F by USDA.'] }; }
    return bank(R, [
      ['What is confit?', 'Meat cooked slowly while submerged in fat', ['Fruit preserved in sugar only', 'Raw cured meat', 'A cold soup'], ''],
      ['Where is confit stored today?', 'In the refrigerator', ['In a cupboard under fat', 'On the counter', 'In the sun'], ''],
      ['What is a terrine?', 'A seasoned mixture cooked in a mold and served cold', ['A hot soup', 'A kind of bread', 'A frozen dessert'], ''],
      ['What is a forcemeat?', 'A mixture of ground meat, fat and seasoning', ['A cut of beef', 'A sauce', 'A marinade'], ''],
      ['Why keep forcemeat very cold while grinding?', 'So the fat doesn\'t smear', ['To kill germs', 'To make it cook faster', 'It doesn\'t matter'], ''],
      ['How do you slice a terrine neatly?', 'Cold, with a hot, wet knife', ['Warm, with a serrated knife', 'Frozen, with a cleaver', 'With a spoon'], '']
    ]);
  });

  G('cugarde.charcuterie-cheese', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'fam']), R.pick(['fam', 'bank', 'count']), R.pick(['fam', 'count']));
    if (kind === 'fam') { var it = R.pick([['Ricotta', 'Fresh'], ['Fresh mozzarella', 'Fresh'], ['Brie', 'Soft-ripened'], ['Camembert', 'Soft-ripened'], ['Fontina', 'Semi-soft'], ['Havarti', 'Semi-soft'], ['Cheddar', 'Semi-hard'], ['Gruyère', 'Semi-hard'], ['Parmesan', 'Hard'], ['Pecorino Romano', 'Hard'], ['Gorgonzola', 'Blue'], ['Roquefort', 'Blue']]);
      return { q: 'Which cheese family is ' + it[0] + ' in?', a: MC(it[1], ['Fresh', 'Soft-ripened', 'Semi-soft', 'Semi-hard', 'Hard', 'Blue']), steps: [it[1] + '.'] }; }
    if (kind === 'count') { var g = R.int(4, 30), oz = R.pick([1, 1.5, 2]), k = R.pick([2, 3, 4]); return { q: 'A board for ' + g + ' people plans ' + T.num(oz) + ' oz of each cheese per person, with ' + k + ' cheeses. How many ounces of cheese in all?', a: AX(g * oz * k), unit: 'oz', steps: ['$' + g + ' \\times ' + T.num(oz) + ' \\times ' + k + ' = ' + fx(g * oz * k) + '$ oz.'] }; }
    return bank(R, [
      ['Why does this course describe curing instead of giving a home recipe?', 'Curing needs exact curing salt and controlled temperature and humidity', ['Curing is illegal', 'Cured meat is not food', 'It takes only minutes'], ''],
      ['What does curing salt (nitrite) add?', 'Protection, especially against botulism, and the pink color', ['Sweetness', 'Crunch', 'Nothing useful'], ''],
      ['At what temperature does cheese taste best when served?', 'Cool room temperature; take it out about 30 minutes ahead', ['Straight from the freezer', 'Hot', 'Ice cold'], ''],
      ['Which is a whole-muscle cured meat?', 'Prosciutto', ['Salami', 'Pâté', 'Sausage'], ''],
      ['Which allergens are common on boards?', 'Nuts, milk, wheat and sesame', ['None', 'Only fish', 'Only eggs'], 'Label them.'],
      ['How should cured meats be sliced for a board?', 'Thin', ['Thick, like steak', 'In cubes only', 'Shredded'], '']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
