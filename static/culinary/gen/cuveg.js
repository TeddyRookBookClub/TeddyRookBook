/* Culinary Ladder: generators for cuveg (course key cuveg). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cuveg.js: edit those, not this file. */
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
  // ===== Vegetables, Grains, Legumes and Pasta (cuveg)
  G('cuveg.blanch-shock', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'water']), R.pick(['water', 'bank']), R.pick(['water', 'batch', 'bank']));
    if (kind === 'water') { var lb = R.int(1, 12); return { q: 'Using about a gallon of water per pound, how many gallons of boiling water for ' + lb + ' pound' + (lb > 1 ? 's' : '') + ' of green beans in one batch?', a: AX(lb), unit: 'gal', steps: ['$' + lb + ' \\times 1 = ' + lb + '$ gallons, or cook in batches in a smaller pot.'] }; }
    if (kind === 'batch') { var pot = R.pick([2, 3, 4, 5]), lb2 = R.int(4, 20); return { q: 'Your pot holds ' + pot + ' gallons of boiling water, enough for about ' + pot + ' pounds at a time. How many batches to blanch ' + lb2 + ' pounds of broccoli?', a: AX(Math.ceil(lb2 / pot)), steps: ['$' + lb2 + ' \\div ' + pot + ' = ' + r2(lb2 / pot) + '$, so ' + Math.ceil(lb2 / pot) + ' batches (round up).'] }; }
    return bank(R, [
      ['What does shocking do?', 'Stops the cooking and sets the color', ['Makes vegetables softer', 'Adds salt', 'Kills all germs'], 'Plunge into ice water.'],
      ['Why use lots of water for blanching?', 'So it comes back to a boil fast when the vegetables go in', ['To save time washing', 'To dilute the salt', 'It doesn\'t matter'], ''],
      ['Why do green vegetables turn olive-drab?', 'Long cooking or acid, such as from a lid trapping acids', ['Too much ice', 'Too much water', 'Salt in the water'], ''],
      ['Which of these is a use for blanching?', 'Loosening tomato skins', ['Browning onions', 'Thickening sauces', 'Making caramel'], 'Also the first step before freezing many vegetables.'],
      ['Should you cover the pot when blanching green vegetables?', 'No, leave the lid off', ['Yes, always', 'Only for spinach', 'Only at sea level'], '']
    ]);
  });

  G('cuveg.veg-methods', function (R, ctx) {
    var kind = by(ctx, 'name', R.pick(['name', 'bank']), R.pick(['name', 'bank']));
    if (kind === 'name') { var it = R.pick([['Carrots cooked in a little water, butter and sugar until shiny', 'Glazing'], ['Cauliflower tossed in oil and browned at 425°F', 'Roasting'], ['Cooked parsnips blended with cream and passed through a sieve', 'Puréeing'], ['Pearl onions cooked until coated in a shiny syrup', 'Glazing'], ['Brussels sprouts browned at the edges on a sheet pan', 'Roasting'], ['Peas blended smooth with butter', 'Puréeing']]);
      return { q: 'Name the method: ' + it[0] + '.', a: MC(it[1], ['Glazing', 'Roasting', 'Puréeing', 'Blanching']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Why spread vegetables out on the roasting pan?', 'Crowded vegetables steam instead of browning', ['To cool them', 'To save oil', 'It is only for looks'], ''],
      ['About what oven temperature browns roasted vegetables well?', 'About 400°F to 450°F', ['About 200°F', 'About 300°F', 'About 550°F only'], ''],
      ['What gives a purée a silky restaurant texture?', 'Passing it through a fine sieve', ['Adding flour', 'Boiling it longer', 'Freezing it'], ''],
      ['What do purées often need to taste their best?', 'Salt and a little acid', ['More water', 'Sugar only', 'Nothing'], ''],
      ['Which pan suits glazing?', 'One just wide enough to hold the vegetables in one layer', ['A tall stockpot', 'A deep fryer', 'A sheet pan in the oven'], '']
    ]);
  });

  G('cuveg.potatoes', function (R, ctx) {
    var kind = by(ctx, R.pick(['pick', 'bank']), R.pick(['pick', 'bank']), R.pick(['pick', 'bank']));
    if (kind === 'pick') { var it = R.pick([['Fluffy baked potatoes', 'Starchy (russet)'], ['Crisp French fries', 'Starchy (russet)'], ['Light mashed potatoes', 'Starchy (russet)'], ['Potato salad that keeps its cubes', 'Waxy (red-skinned)'], ['A gratin with neat layers', 'Waxy (red-skinned)'], ['Potatoes in a soup that hold their shape', 'Waxy (red-skinned)'], ['Roasted fingerlings', 'Waxy (red-skinned)'], ['Hash browns that crisp well', 'Starchy (russet)'], ['Potato gnocchi that are light', 'Starchy (russet)'], ['Boiled new potatoes with butter and herbs', 'Waxy (red-skinned)'], ['Potato chips', 'Starchy (russet)'], ['A Niçoise salad', 'Waxy (red-skinned)']]);
      return { q: 'Which kind of potato is best for this? ' + it[0] + '.', a: MC(it[1], ['Starchy (russet)', 'Waxy (red-skinned)']), steps: [it[1].indexOf('Starchy') === 0 ? 'High starch, low moisture: fluffy and crisp.' : 'Less starch, more moisture: holds its shape.'] }; }
    return bank(R, [
      ['Why not mash potatoes in a food processor?', 'Bursting the starch cells makes them gluey', ['They get lumpy', 'They turn gray', 'It takes too long'], ''],
      ['How are classic French fries cooked?', 'Twice: low to cook through, then high to crisp', ['Once at very high heat', 'Boiled, then baked', 'Steamed, then microwaved'], ''],
      ['Should potatoes for mashing start in cold or boiling water?', 'Cold water', ['Boiling water', 'Ice water, then the oven', 'It doesn\'t matter'], 'The outside and center cook evenly.'],
      ['Why rinse cut fries before frying?', 'To wash off surface starch so they crisp and don\'t stick', ['To add salt', 'To cool the oil', 'To make them softer'], ''],
      ['Yukon Gold potatoes are usually called…', 'All-purpose, between starchy and waxy', ['The starchiest', 'The waxiest', 'Sweet potatoes'], '']
    ]);
  });

  G('cuveg.rice-grains', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'water']), R.pick(['water', 'method']), R.pick(['water', 'ladle', 'bank']));
    if (kind === 'water') { var rt = R.pick([1.25, 1.5, 1.75, 2]), c = R.int(1, 8); return { q: 'Your rice uses ' + T.num(rt) + ' cups of water per cup of rice. How much water for ' + c + ' cup' + (c > 1 ? 's' : '') + ' of rice?', a: AX(rt * c), unit: 'cups', steps: ['$' + T.num(rt) + ' \\times ' + c + ' = ' + fx(rt * c) + '$ cups.'] }; }
    if (kind === 'ladle') { var stock = R.int(3, 10), lad = R.pick([2, 4, 8]); return { q: 'You add hot stock to risotto ' + lad + ' fluid ounces at a time and use ' + stock + ' cups in all (1 cup = 8 fl oz). How many additions is that?', a: AX(stock * 8 / lad), steps: ['$' + stock + ' \\times 8 = ' + stock * 8 + '$ fl oz.', '$' + stock * 8 + ' \\div ' + lad + ' = ' + fx(stock * 8 / lad) + '$ additions.'] }; }
    if (kind === 'method') { var it = R.pick([['Rice toasted in butter with onion, then covered and cooked in hot stock', 'Pilaf'], ['Brown rice boiled in lots of water and drained', 'Pasta method'], ['Short-grain rice with hot stock added a ladle at a time while stirring', 'Risotto'], ['Rice with a measured amount of water, all absorbed, lid on', 'Absorption']]);
      return { q: 'Name the method: ' + it[0] + '.', a: MC(it[1], ['Pilaf', 'Pasta method', 'Risotto', 'Absorption']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Which rice is used for risotto?', 'Short-grain, such as Arborio or Carnaroli', ['Long-grain basmati', 'Wild rice', 'Instant rice'], ''],
      ['Why add hot, not cold, stock to risotto?', 'Cold stock slows the cooking and the creamy texture', ['Cold stock is unsafe', 'Hot stock is saltier', 'It doesn\'t matter'], ''],
      ['Why not rinse risotto rice?', 'Its surface starch makes the dish creamy', ['It is already clean', 'Water ruins it', 'It gets too sticky'], ''],
      ['Cooked rice left warm for hours can grow germs whose toxins…', 'aren\'t removed by reheating', ['disappear in the refrigerator', 'make it taste sweet', 'are harmless'], 'Cool rice quickly and keep it cold.'],
      ['What does "all\'onda" mean for risotto?', 'Like a wave: loose and flowing', ['Dry and firm', 'Fried crisp', 'Cold'], '']
    ]);
  });

  G('cuveg.fresh-pasta', function (R, ctx) {
    var kind = by(ctx, R.pick(['flour', 'bank', 'dough']), R.pick(['flour', 'eggs', 'dough']), R.pick(['flour', 'eggs', 'bank', 'people']));
    if (kind === 'dough') { var e2 = R.int(1, 10); return { q: 'A large egg weighs about 50 g out of its shell. About how many grams of dough do ' + e2 + ' egg' + (e2 > 1 ? 's' : '') + ' and 100 g of flour per egg make?', a: AX(150 * e2), unit: 'g', steps: ['Each egg plus its flour is about $50 + 100 = 150$ g.', '$' + e2 + ' \\times 150 = ' + T.commas(150 * e2) + '$ g.'] }; }
    if (kind === 'people') { var pp = R.int(2, 16), g = R.pick([75, 100, 125]); return { q: 'You plan ' + g + ' g of flour per person for fresh pasta. How much flour for ' + pp + ' people?', a: AX(g * pp), unit: 'g', steps: ['$' + g + ' \\times ' + pp + ' = ' + T.commas(g * pp) + '$ g.'] }; }
    if (kind === 'flour') { var e = R.int(1, 12); return { q: 'Using about 100 g of flour per large egg, how much flour for ' + e + ' egg' + (e > 1 ? 's' : '') + '?', a: AX(100 * e), unit: 'g', steps: ['$' + e + ' \\times 100 = ' + 100 * e + '$ g.'] }; }
    if (kind === 'eggs') { var fl = R.int(2, 15) * 100; return { q: 'You have ' + T.commas(fl) + ' g of flour. How many large eggs for fresh pasta at 100 g of flour per egg?', a: AX(fl / 100), steps: ['$' + T.commas(fl) + ' \\div 100 = ' + fl / 100 + '$ eggs.'] }; }
    return bank(R, [
      ['Why rest pasta dough before rolling?', 'The gluten relaxes and the flour finishes absorbing the egg', ['To dry it out', 'To let it rise', 'To cool the eggs'], ''],
      ['About how long does fresh pasta cook?', 'About 1 to 3 minutes', ['About 10 to 12 minutes', 'About 30 minutes', 'About 5 seconds'], ''],
      ['What do you dust cut pasta with so it doesn\'t stick?', 'Semolina', ['Sugar', 'Salt', 'Baking soda'], ''],
      ['Your pasta dough is too sticky. What do you do?', 'Knead in flour a spoon at a time', ['Add an egg', 'Add water', 'Refrigerate it for a week'], ''],
      ['About how long do you knead fresh pasta dough by hand?', 'About 8 to 10 minutes', ['About 30 seconds', 'About an hour', 'You don\'t knead it'], '']
    ]);
  });

  G('cuveg.legumes', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'yield']), R.pick(['yield', 'bank']), R.pick(['yield', 'back', 'bank']));
    if (kind === 'yield') { var c = R.int(1, 12) / 2; return { q: 'Dried beans roughly triple in volume when cooked. About how many cups of cooked beans from ' + T.num(c) + ' cup' + (c === 1 ? '' : 's') + ' of dried beans?', a: AX(c * 3), unit: 'cups', steps: ['$' + T.num(c) + ' \\times 3 = ' + fx(c * 3) + '$ cups.'] }; }
    if (kind === 'back') { var cooked = R.int(2, 12) * 1.5; return { q: 'You need ' + fx(cooked) + ' cups of cooked beans. If dried beans triple when cooked, how many cups of dried beans?', a: AX(cooked / 3), unit: 'cups', steps: ['$' + fx(cooked) + ' \\div 3 = ' + fx(cooked / 3) + '$ cups.'] }; }
    return bank(R, [
      ['Which of these needs no soaking?', 'Lentils', ['Kidney beans', 'Chickpeas', 'Black beans'], 'Split peas don\'t either.'],
      ['How do you make red kidney beans safe?', 'Soak, drain, and boil hard in fresh water', ['Cook them in a slow cooker on low', 'Soak them only', 'Sprout them'], 'Meal Prep follows FDA advice: boil at least 30 minutes.'],
      ['Why add tomatoes after beans are tender?', 'Acid slows softening', ['Tomatoes burn', 'Tomatoes add toxins', 'It doesn\'t matter'], ''],
      ['What is a quick soak?', 'Boil 2 minutes, then rest 1 hour', ['Soak in ice water overnight', 'Microwave for 10 minutes', 'Rinse three times'], ''],
      ['Why simmer beans gently instead of boiling hard all the time?', 'So the skins don\'t burst (after any required hard boil)', ['To keep them raw', 'To save salt', 'Boiling makes them pink'], ''],
      ['Why might beans never soften?', 'They are old', ['Too much water', 'They were rinsed', 'The pot was too big'], 'Buy from a store that sells a lot.']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
