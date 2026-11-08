/* Culinary Ladder: generators for cupastry (course key cupastry). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cupastry.js: edit those, not this file. */
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
  // ===== Baking and Pastry (cupastry)
  var STAGES = [[230, 235, 'Thread'], [235, 240, 'Soft ball'], [245, 250, 'Firm ball'], [250, 265, 'Hard ball'], [270, 290, 'Soft crack'], [300, 310, 'Hard crack']];
  var SNAMES = ['Thread', 'Soft ball', 'Firm ball', 'Hard ball', 'Soft crack', 'Hard crack', 'Caramel'];

  G('cupastry.bakers-percent', function (R, ctx) {
    var kind = by(ctx, 'ing', R.pick(['ing', 'pct']), R.pick(['ing', 'pct', 'flour']));
    var INGS = [['water', [60, 62, 65, 68, 70, 72, 75, 78]], ['salt', [1.8, 2, 2.2, 2.5]], ['instant yeast', [0.5, 0.75, 1, 1.5]], ['sugar', [5, 8, 10, 12]], ['butter', [5, 10, 20, 50]], ['milk', [30, 40, 60]], ['olive oil', [3, 4, 5]]];
    var ing = R.pick(INGS), p = R.pick(ing[1]), fl = R.int(4, 40) * 50;
    if (kind === 'ing') return { q: 'A formula has ' + p + '% ' + ing[0] + '. How many grams of ' + ing[0] + ' for ' + T.commas(fl) + ' g of flour?', a: A(fl * p / 100, 3, 0.01), unit: 'g', steps: ['$' + T.commas(fl) + ' \\times ' + T.num(p / 100) + ' = ' + tv(fx(fl * p / 100)) + '$ g.'] };
    if (kind === 'pct') { var g = fx(fl * p / 100); return { q: 'A dough has ' + T.commas(fl) + ' g of flour and ' + tv(g) + ' g of ' + ing[0] + '. What is the ' + ing[0] + ' as a baker\'s percentage?', a: PC(p, 0.01), steps: ['$' + tv(g) + ' \\div ' + T.commas(fl) + ' = ' + T.num(p / 100) + ' = ' + p + '\\%$.'] }; }
    var tot = R.pick([160, 165, 168, 170, 171, 175, 180, 185, 190]), dw = R.int(10, 60) * 50; return { q: 'A formula\'s percents add up to ' + tot + '%. How much flour for ' + T.commas(dw) + ' g of dough?', a: A(dw * 100 / tot, 3, 0.01), unit: 'g', steps: ['Flour = dough ÷ (total ÷ 100): $' + T.commas(dw) + ' \\div ' + T.num(tot / 100) + ' \\approx ' + tv(sg(dw * 100 / tot, 4)) + '$ g.'] };
  });

  G('cupastry.lean-dough', function (R, ctx) {
    var kind = by(ctx, R.pick(['hyd', 'bank']), R.pick(['hyd', 'water', 'bank']), R.pick(['hyd', 'water', 'type']));
    if (kind === 'hyd') { var fl = R.int(4, 20) * 50, h = R.int(55, 85); var w = fl * h / 100; return { q: 'A dough has ' + fl + ' g of flour and ' + fx(w) + ' g of water. What is its hydration?', a: PC(h, 0.01), steps: ['$' + fx(w) + ' \\div ' + fl + ' = ' + T.num(h / 100) + ' = ' + h + '\\%$.'] }; }
    if (kind === 'water') { var fl2 = R.int(4, 30) * 50, h2 = R.int(58, 82); return { q: 'For ' + T.commas(fl2) + ' g of flour at ' + h2 + '% hydration, how many grams of water?', a: A(fl2 * h2 / 100, 3, 0.01), unit: 'g', steps: ['$' + T.commas(fl2) + ' \\times ' + T.num(h2 / 100) + ' = ' + tv(fx(fl2 * h2 / 100)) + '$ g.'] }; }
    if (kind === 'type') { var it = R.pick([[60, 'Firm (like bagels or sandwich loaves)'], [62, 'Firm (like bagels or sandwich loaves)'], [70, 'Soft, open loaf'], [72, 'Soft, open loaf'], [80, 'Very open and holey (like ciabatta)'], [82, 'Very open and holey (like ciabatta)']]);
      return { q: 'A lean dough at ' + it[0] + '% hydration will most likely be…', a: MC(it[1], ['Firm (like bagels or sandwich loaves)', 'Soft, open loaf', 'Very open and holey (like ciabatta)']), steps: ['Higher hydration, wetter dough, more open crumb.'] }; }
    return bank(R, [
      ['What is gluten?', 'A stretchy protein network that traps gas', ['A kind of yeast', 'A sugar', 'A fat'], ''],
      ['About what percent salt do lean breads use?', 'About 2%', ['About 20%', 'About 0.01%', 'About 10%'], ''],
      ['How do you tell when dough is proofed?', 'A floured finger poke springs back slowly', ['After exactly one hour', 'When it smells sour', 'When it is cold'], ''],
      ['What gas makes bread rise?', 'Carbon dioxide from yeast', ['Oxygen', 'Steam only', 'Nitrogen'], ''],
      ['About what internal temperature shows a lean loaf is baked?', 'About 200°F to 210°F', ['About 145°F', 'About 165°F', 'About 300°F'], '']
    ]);
  });

  G('cupastry.enriched-laminated', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['layers', 'bank', 'type']), R.pick(['layers', 'type']));
    if (kind === 'layers') { var n = R.int(2, 6), fold = R.pick([[3, 'letter (three-layer)'], [4, 'book (four-layer)']]); return { q: 'Starting from one layer of butter, how many layers after ' + n + ' ' + fold[1] + ' folds (each fold multiplies the layers by ' + fold[0] + ')?', a: AX(Math.pow(fold[0], n)), steps: ['$' + fold[0] + '^{' + n + '} = ' + T.commas(Math.pow(fold[0], n)) + '$ layers.'] }; }
    if (kind === 'type') { var it = R.pick([['Brioche', 'Enriched'], ['Challah', 'Enriched'], ['Cinnamon rolls', 'Enriched'], ['Milk bread', 'Enriched'], ['Croissant', 'Laminated'], ['Puff pastry', 'Laminated'], ['Danish', 'Laminated'], ['Baguette', 'Lean']]);
      return { q: 'Lean, enriched or laminated? ' + it[0] + '.', a: MC(it[1], ['Lean', 'Enriched', 'Laminated']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['What makes laminated dough puff into layers?', 'Water in the butter layers turns to steam', ['Extra yeast', 'Baking soda', 'Whipped egg whites'], ''],
      ['Why chill laminated dough between folds?', 'So the butter stays solid and separate', ['To kill the yeast', 'To make it rise faster', 'To dry it out'], ''],
      ['Which laminated dough has no yeast?', 'Puff pastry', ['Croissant', 'Danish', 'Brioche'], ''],
      ['What do butter, eggs and sugar do in an enriched dough?', 'Tenderize the crumb and brown the crust', ['Make it chewier', 'Speed up the yeast a lot', 'Make it lean'], ''],
      ['Why proof croissants somewhere warm but below about 78°F?', 'So the butter doesn\'t melt out', ['To kill the yeast', 'So they stay flat', 'To dry the surface'], '']
    ]);
  });

  G('cupastry.pastry-doughs', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', '321']), R.pick(['321', 'type']), R.pick(['321', 'back', 'bank']));
    if (kind === '321') { var fl = R.int(2, 20) * 75, what = R.pick(['fat', 'water']); return { q: 'In 3-2-1 pie dough (flour : fat : water by weight), how many grams of ' + what + ' for ' + T.commas(fl) + ' g of flour?', a: AX(what === 'fat' ? fl * 2 / 3 : fl / 3), unit: 'g', steps: ['One part is $' + T.commas(fl) + ' \\div 3 = ' + fl / 3 + '$ g.', what === 'fat' ? 'Fat is 2 parts: $' + fl * 2 / 3 + '$ g.' : 'Water is 1 part: $' + fl / 3 + '$ g.'] }; }
    if (kind === 'back') { var fat = R.int(2, 20) * 50; return { q: 'You have ' + fat + ' g of butter for 3-2-1 pie dough. How much flour?', a: AX(fat * 3 / 2), unit: 'g', steps: ['Fat is 2 parts, so one part is $' + fat + ' \\div 2 = ' + fat / 2 + '$ g.', 'Flour is 3 parts: $' + fat * 3 / 2 + '$ g.'] }; }
    if (kind === 'type') { var it = R.pick([['Cream puffs and éclairs', 'Pâte à choux'], ['A flaky apple pie crust', 'Pâte brisée (pie dough)'], ['A crisp, cookie-like fruit tart shell', 'Pâte sucrée'], ['Gougères (cheese puffs)', 'Pâte à choux'], ['A quiche crust', 'Pâte brisée (pie dough)']]);
      return { q: 'Which dough makes ' + it[0].toLowerCase() + '?', a: MC(it[1], ['Pâte à choux', 'Pâte brisée (pie dough)', 'Pâte sucrée', 'Puff pastry']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['What makes pie crust flaky?', 'Flat pieces of cold fat that melt and leave layers', ['Lots of kneading', 'Warm butter mixed in completely', 'Extra water'], ''],
      ['What makes pie dough tough?', 'Overworking it or adding too much water', ['Resting it', 'Cold butter', 'Salt'], ''],
      ['How is pâte à choux started?', 'Liquid and butter boiled, flour stirred in and cooked into a ball', ['Butter and sugar creamed', 'Yeast proofed in milk', 'Flour cut into cold fat'], ''],
      ['How is pâte sucrée usually made?', 'Butter and sugar creamed, egg added, then flour', ['Flour, fat and ice water, barely mixed', 'Boiled on the stove', 'With yeast and a long rise'], ''],
      ['Why not open the oven while choux puffs?', 'The shells can collapse', ['They burn', 'They turn sticky', 'It doesn\'t matter'], '']
    ]);
  });

  G('cupastry.custards', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'boil']), R.pick(['boil', 'scale', 'bank']));
    if (kind === 'boil') { var it = R.pick([['Milk, yolks and sugar only', 'No; stir it to about 170°F to 180°F'], ['Milk, yolks, sugar and cornstarch', 'Yes; it must boil to thicken fully'], ['Milk, yolks, sugar and flour', 'Yes; it must boil to thicken fully'], ['Cream, yolks, sugar and vanilla, for a sauce', 'No; stir it to about 170°F to 180°F']]);
      return { q: 'Should this custard be brought to a boil? ' + it[0] + '.', a: MC(it[1], ['No; stir it to about 170°F to 180°F', 'Yes; it must boil to thicken fully']), steps: ['Starch protects the yolks and needs a boil; without starch, boiling curdles the eggs.'] }; }
    if (kind === 'scale') { var milk = R.int(2, 8) * 250, y = R.pick([4, 5, 6]); return { q: 'A crème anglaise uses ' + y + ' yolks per 500 mL of milk. How many yolks for ' + T.commas(milk) + ' mL?', a: AX(y * milk / 500), steps: ['$' + y + ' \\times ' + T.commas(milk) + ' \\div 500 = ' + fx(y * milk / 500) + '$ yolks.'] }; }
    return bank(R, [
      ['How do you know crème anglaise is done?', 'It coats a spoon, and a finger leaves a clean line (about 170°F to 180°F)', ['It boils hard', 'It sets solid', 'After exactly 2 minutes'], ''],
      ['What happens if crème anglaise boils?', 'The yolks curdle', ['It thickens perfectly', 'Nothing', 'It turns clear'], ''],
      ['Why must pastry cream boil?', 'So the starch thickens fully and the cream doesn\'t thin later', ['To brown it', 'To kill the vanilla', 'It shouldn\'t boil'], ''],
      ['What is tempering yolks?', 'Whisking a little hot milk in first so they warm gently', ['Adding chocolate', 'Freezing them', 'Beating them alone for 10 minutes'], ''],
      ['How do you chill pastry cream?', 'Quickly, in a shallow container with plastic pressed on the surface', ['In the pot on the counter overnight', 'In the freezer in the pot', 'Uncovered in a deep bowl'], '']
    ]);
  });

  G('cupastry.chocolate', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'seed']), R.pick(['seed', 'work']), R.pick(['seed', 'work', 'bank']));
    if (kind === 'seed') { var tot = R.int(2, 20) * 75; return { q: 'For the seeding method you melt two-thirds of the chocolate and chop the rest. How many grams do you melt from ' + T.commas(tot) + ' g?', a: AX(tot * 2 / 3), unit: 'g', steps: ['$' + T.commas(tot) + ' \\times \\tfrac23 = ' + T.commas(tot * 2 / 3) + '$ g melted; ' + T.commas(tot / 3) + ' g chopped.'] }; }
    if (kind === 'work') { var it = R.pick([['dark', 'About 88°F to 90°F'], ['milk', 'About 86°F to 88°F'], ['white', 'About 82°F to 84°F']]); return { q: 'A typical working temperature for tempered ' + it[0] + ' chocolate is…', a: MC(it[1], ['About 88°F to 90°F', 'About 86°F to 88°F', 'About 82°F to 84°F', 'About 120°F', 'About 65°F']), steps: [it[1] + '; the maker\'s printed temperatures come first.'] }; }
    return bank(R, [
      ['What does tempering do?', 'Makes cocoa butter set in its stable, shiny, snapping form', ['Adds sugar', 'Makes chocolate melt faster', 'Removes fat'], ''],
      ['What are the three steps of tempering?', 'Melt, cool while stirring, rewarm slightly', ['Boil, freeze, thaw', 'Mix, bake, cool', 'Whip, chill, slice'], ''],
      ['Why keep water away from melting chocolate?', 'A few drops can make it seize into a thick paste', ['Water burns it', 'Water makes it shinier', 'It doesn\'t matter'], ''],
      ['What are gray streaks on untempered chocolate?', 'Fat bloom', ['Mold', 'Salt', 'Sugar crystals only'], ''],
      ['How do you test temper?', 'Smear a little on foil; it should set shiny and firm in a few minutes', ['Taste it hot', 'Smell it', 'Freeze it overnight'], ''],
      ['Where should finished chocolate be stored?', 'Cool and dry, not in the refrigerator', ['In the refrigerator', 'Next to the oven', 'In a steamy kitchen'], '']
    ]);
  });

  G('cupastry.sugar', function (R, ctx) {
    var kind = by(ctx, 'stage', R.pick(['stage', 'alt', 'use']), R.pick(['alt', 'stage', 'use']));
    if (kind === 'stage') { var st = R.pick(STAGES), t = R.int(st[0], st[1]); return { q: 'A sugar syrup reads ' + t + '°F at sea level. Which stage is it at?', a: MC(st[2], SNAMES), steps: [st[2] + ': ' + st[0] + '°F to ' + st[1] + '°F.'] }; }
    if (kind === 'alt') { var st2 = R.pick(STAGES), t2 = R.int(st2[0], st2[1]), ft = R.int(1, 16) * 500; return { q: 'A recipe says ' + t2 + '°F (' + st2[2].toLowerCase() + ') at sea level. Subtracting 1°F for every 500 feet, what temperature at ' + T.commas(ft) + ' feet?', a: AT(t2 - ft / 500, 1), unit: '°F', steps: ['$' + T.commas(ft) + ' \\div 500 = ' + ft / 500 + '$.', '$' + t2 + ' - ' + ft / 500 + ' = ' + (t2 - ft / 500) + '$°F.'] }; }
    var it = R.pick([['Fudge', 'Soft ball'], ['Fondant', 'Soft ball'], ['Caramels', 'Firm ball'], ['Nougat', 'Hard ball'], ['Taffy', 'Soft crack'], ['Butterscotch', 'Soft crack'], ['Lollipops', 'Hard crack'], ['Peanut brittle', 'Hard crack'], ['Spun sugar', 'Hard crack']]);
    return { q: 'Which sugar stage is used for ' + it[0].toLowerCase() + '?', a: MC(it[1], SNAMES), steps: [it[0] + ': ' + it[1].toLowerCase() + '.'] };
  });

  G('cupastry.plated-desserts', function (R, ctx) {
    return bank(R, [
      ['A plate of chocolate mousse, chocolate sauce and chocolate shavings needs…', 'Contrast: something crisp, sharp or cold', ['More chocolate', 'A mint sprig', 'A bigger plate'], ''],
      ['Which part of a plated dessert should go on last?', 'The cold part, like ice cream', ['The sauce', 'The tart', 'The crisp'], 'So it doesn\'t melt.'],
      ['What balances a very sweet dessert?', 'Acid or bitterness, such as berries or dark chocolate', ['More sugar', 'Salt only', 'Cream only'], ''],
      ['Which is a good garnish?', 'Something that belongs to the dish and tastes good with it', ['A sprig of mint on everything', 'An inedible flower', 'A plastic decoration'], ''],
      ['Which dessert parts can usually be made ahead?', 'Sauces, crisp elements and ice creams', ['Nothing can', 'Only the garnish', 'Only soufflés'], ''],
      ['Why keep dessert portions modest after a long meal?', 'Guests are already full', ['Desserts are cheap', 'Small plates are required', 'Sugar is dangerous'], ''],
      ['Which kinds of contrast make a plated dessert interesting?', 'Temperature, texture, sweetness and color', ['Only color', 'Only size', 'Only price'], '']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
