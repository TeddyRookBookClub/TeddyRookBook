/* Culinary Ladder: generators for cuheat (course key cuheat). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cuheat.js: edit those, not this file. */
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
  // ===== Heat and Cooking Methods (cuheat)
  var ROAST = [[130, 112], [131, 89], [133, 56], [135, 36], [136, 28], [138, 18], [140, 12], [142, 8], [144, 5], [145, 4]];

  G('cuheat.heat-transfer', function (R, ctx) {
    var it = R.pick([['A steak sizzling in a hot cast-iron pan', 'Conduction'], ['Heat moving from the outside of a potato to its center', 'Conduction'], ['An egg frying on a griddle', 'Conduction'], ['Pancakes on a hot flat-top', 'Conduction'],
      ['Fries cooking in hot oil', 'Convection'], ['A fan oven cooking cookies faster', 'Convection'], ['Pasta cooking in boiling water', 'Convection'], ['Dumplings cooking in steam', 'Convection'], ['Hot air circulating around a roast', 'Convection'],
      ['A salamander browning cheese from above', 'Radiation'], ['A broiler crisping the top of a gratin', 'Radiation'], ['Glowing coals searing a steak from a distance', 'Radiation'], ['Toast browning under a red-hot element', 'Radiation']]);
    var kind = by(ctx, 'cls', R.pick(['cls', 'bank']), R.pick(['cls', 'bank']));
    if (kind === 'cls') return { q: 'Which way does heat mainly reach the food here? ' + it[0] + '.', a: MC(it[1], ['Conduction', 'Convection', 'Radiation']), steps: [it[1] + '.'] };
    return bank(R, [
      ['Inside a piece of food, heat moves only by…', 'Conduction, which is slow', ['Radiation, which is fast', 'Convection currents', 'Steam'], 'That\'s why thick food cooks slowly.'],
      ['Why does a very hot oven burn a roast\'s outside before the center is done?', 'Heat reaches the center slowly by conduction', ['The center is colder metal', 'Ovens heat only the outside', 'Fat blocks heat completely'], 'Lower heat gives the center time.'],
      ['Many recipes suggest setting a convection oven about how much lower than a still oven?', 'About 25°F', ['About 100°F', 'About 5°F', 'Higher, not lower'], 'Moving air cooks faster; follow the oven maker\'s guide.'],
      ['Why does steam cook food quickly?', 'It gives up a lot of heat when it condenses back to water on the food', ['It is hotter than an oven', 'It contains oil', 'It cooks by radiation'], '']
    ]);
  });

  G('cuheat.browning', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'which']), R.pick(['which', 'more']));
    if (kind === 'which') { var it = R.pick([['Seared steak crust', 'Maillard reaction'], ['Toasted bread', 'Maillard reaction'], ['Roasted coffee beans', 'Maillard reaction'], ['Browned roast chicken skin', 'Maillard reaction'], ['Golden pretzel crust', 'Maillard reaction'],
        ['Amber caramel from plain sugar', 'Caramelization'], ['Crème brûlée\'s burnt-sugar top', 'Caramelization'], ['Spun sugar turning golden', 'Caramelization']]);
      return { q: 'Which browning reaction mainly makes this? ' + it[0] + '.', a: MC(it[1], ['Maillard reaction', 'Caramelization']), steps: [it[1] === 'Caramelization' ? 'Sugar alone breaking down: caramelization.' : 'Proteins and sugars reacting: the Maillard reaction.'] }; }
    if (kind === 'more') return which(R, 'Which change helps food brown more?', ['Pat the surface dry', 'Use a hotter pan', 'Leave space between pieces', 'Let it sit until it releases', 'Brush on a little milk or sugar glaze'], ['Crowd the pan', 'Cover it with a lid', 'Add a splash of water', 'Stir it constantly', 'Lower the heat'], function (c) { return c + ': browning needs a hot, dry surface.'; });
    return bank(R, [
      ['The Maillard reaction is between…', 'amino acids and certain sugars', ['water and salt', 'fat and acid', 'starch and vinegar'], ''],
      ['Above about what temperature does the Maillard reaction go quickly?', 'About 280°F to 300°F', ['About 100°F', 'About 212°F only', 'About 500°F only'], ''],
      ['Why can\'t a wet surface brown?', 'Water keeps it near 212°F, too cool to brown', ['Water is acidic', 'Water blocks flavor', 'It can, just slower'], ''],
      ['Table sugar begins to caramelize at about…', '320°F', ['212°F', '150°F', '600°F'], ''],
      ['Why is boiled meat gray and roasted meat brown?', 'Boiling never gets hotter than 212°F, below browning temperatures', ['Boiling removes all protein', 'Roasting adds color', 'Water bleaches meat'], '']
    ]);
  });

  G('cuheat.saute-panfry', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'name']), R.pick(['name', 'bank']));
    if (kind === 'name') { var it = R.pick([['Thin strips of beef tossed fast in a very hot wok', 'Stir-frying'], ['Small pieces of chicken moved in a hot pan with a thin film of oil', 'Sautéing'], ['Breaded pork cutlets in ¼ inch of oil, turned once', 'Pan-frying'],
        ['Shrimp tossed in a hot pan with a little butter for two minutes', 'Sautéing'], ['Battered fish fully submerged in 350°F oil', 'Deep-frying'], ['Fried green tomatoes in ⅛ inch of oil, browned on each side', 'Pan-frying']]);
      return { q: 'Name the method: ' + it[0] + '.', a: MC(it[1], ['Sautéing', 'Stir-frying', 'Pan-frying', 'Deep-frying', 'Braising']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Which comes first in a sauté?', 'Heat the pan, then add the fat', ['Add food to a cold pan', 'Add salt to cold oil', 'Cover the pan'], 'Add food when the fat shimmers.'],
      ['What is the standard breading order?', 'Flour, then egg, then crumbs', ['Egg, crumbs, flour', 'Crumbs, flour, egg', 'Flour only'], ''],
      ['Which fat burns soonest at high heat?', 'Whole butter', ['Clarified butter', 'Refined peanut oil', 'Refined canola oil'], 'Its milk solids burn.'],
      ['Why does food stick and soak up oil in a cold pan?', 'It sits in fat while it slowly heats instead of searing', ['Cold pans are sticky', 'Oil turns thick when cold', 'It doesn\'t'], ''],
      ['Why turn pan handles in from the edge of the stove?', 'So no one knocks the pan off', ['To heat the handle', 'To save space only', 'Tradition'], ''],
      ['Why use a dry towel, not a wet one, on a hot handle?', 'Water carries heat through to your hand', ['Dry towels are softer', 'Wet towels stain', 'It doesn\'t matter'], '']
    ]);
  });

  G('cuheat.deep-fry', function (R, ctx) {
    var kind = by(ctx, 'fire', R.pick(['fire', 'temp', 'pot']), R.pick(['pot', 'temp', 'fire']));
    if (kind === 'pot') { var qt = R.pick([4, 5, 6, 8, 10, 12, 16, 20]); return { q: 'A pot holds ' + qt + ' quarts. Following the advice to fill it no more than about half full of oil, what is the most oil to use, in quarts?', a: AX(qt / 2), unit: 'qt', steps: ['$' + qt + ' \\div 2 = ' + fx(qt / 2) + '$ quarts, leaving room for bubbling when food goes in.'] }; }
    if (kind === 'temp') return bank(R, [
      ['Most deep-frying is done at about…', '325°F to 375°F', ['200°F to 250°F', '400°F to 500°F', '150°F to 200°F'], ''],
      ['Food comes out greasy. The oil was probably…', 'too cool', ['too hot', 'too fresh', 'too deep'], 'Cool oil soaks in.'],
      ['Fries are dark outside and raw inside. The oil was probably…', 'too hot', ['too cool', 'too old', 'too shallow'], ''],
      ['Why fry in small batches?', 'So the oil temperature doesn\'t crash', ['To save oil', 'Big batches burn', 'Tradition'], '']
    ]);
    return bank(R, [
      ['A small pan of oil catches fire on the stove. What do you do first?', 'Slide a lid over it and turn off the heat', ['Pour water on it', 'Carry it outside', 'Fan the flames'], 'Leave the pan where it is until it cools.'],
      ['Why never pour water on a grease fire?', 'It can make burning oil spray and spread the fire', ['Water is too cold', 'It makes smoke only', 'It is fine to do'], ''],
      ['Which extinguisher class is for commercial cooking-oil fires?', 'Class K', ['Class A', 'Class D', 'Class C only'], 'Only trained people should use extinguishers.'],
      ['What should you do if a kitchen fire is not small and contained?', 'Get everyone out and call 911', ['Keep fighting it', 'Open the windows and wait', 'Move the pan to the sink'], ''],
      ['Why never put icy frozen food straight into hot oil?', 'The ice turns to steam instantly and the oil spatters or foams over', ['It makes the oil cold forever', 'It is illegal', 'It tastes bad'], ''],
      ['What should you do before moving or straining fryer oil?', 'Let it cool completely', ['Move it quickly while hot', 'Add water to cool it', 'Nothing'], 'OSHA lists fryers as a leading cause of burns.']
    ]);
  });

  G('cuheat.dry-oven', function (R, ctx) {
    var kind = by(ctx, 'name', R.pick(['name', 'conv', 'bank']), R.pick(['conv', 'bank', 'name']));
    if (kind === 'conv') { var t = R.int(13, 18) * 25; return { q: 'A recipe says ' + t + '°F in a still oven. Using the common guide of 25°F lower for a convection oven, what setting would you try?', a: AX(t - 25), unit: '°F', steps: ['$' + t + ' - 25 = ' + (t - 25) + '$°F, then check early.'] }; }
    if (kind === 'name') { var it = R.pick([['Food on grates over a heat source', 'Grilling'], ['Food under a strong heat source from above', 'Broiling'], ['Food in an open pan surrounded by hot air in an oven', 'Roasting'], ['Bread or pastry cooked in hot oven air', 'Baking'], ['Brown the top of a cooked gratin fast', 'Broiling']]);
      return { q: 'Name the method: ' + it[0] + '.', a: MC(it[1], ['Grilling', 'Broiling', 'Roasting', 'Baking', 'Poaching']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Why roast big pieces at a lower temperature after searing?', 'So the center cooks without a thick overcooked gray band', ['To save energy only', 'Searing cooks the center', 'Low heat browns better'], ''],
      ['What is the best way to check a roast\'s doneness?', 'A probe or instant-read thermometer in the thickest part', ['Cut into it', 'Press it with a finger only', 'Look at the color outside'], ''],
      ['Why use a rack in a roasting pan?', 'So hot air reaches the bottom', ['To catch fat for frying', 'To make grill marks', 'It is only decoration'], ''],
      ['What is the reverse sear?', 'A low oven first, then a hot sear at the end', ['Searing after it rests overnight', 'Cooking upside down', 'Boiling then frying'], '']
    ]);
  });

  G('cuheat.moist-heat', function (R, ctx) {
    var kind = by(ctx, R.pick(['range', 'name']), R.pick(['alt', 'range']), R.pick(['alt', 'name', 'range']));
    if (kind === 'alt') { var ft = R.int(1, 20) * 500, bp = 212 - ft / 500; return { q: 'Water boils about 1°F lower for every 500 feet above sea level. About what temperature does it boil at ' + T.commas(ft) + ' feet?', a: AT(bp, 1), unit: '°F', steps: ['$' + T.commas(ft) + ' \\div 500 = ' + ft / 500 + '$.', '$212 - ' + ft / 500 + ' = ' + bp + '$°F.'] }; }
    if (kind === 'range') { var t = R.pick([160, 162, 165, 168, 170, 172, 175, 178, 180, 186, 188, 190, 192, 195, 198, 200, 202, 205, 212]); var m = t <= 180 ? 'Poaching' : t < 212 ? 'Simmering' : 'Boiling';
      return { q: 'Water held at about ' + t + '°F (at sea level) is best for which method?', a: MC(m, ['Poaching', 'Simmering', 'Boiling']), steps: ['Poach about 160°F to 180°F; simmer about 185°F to 205°F; boil at 212°F.'] }; }
    var it = R.pick([['Eggs slipped into water that barely moves', 'Poaching'], ['A stock with small bubbles breaking gently', 'Simmering'], ['Pasta in large rolling bubbles', 'Boiling'], ['Dumplings in a basket above boiling water', 'Steaming'], ['Salmon in barely moving wine and water', 'Poaching'], ['Green beans blanched in a big rolling pot', 'Boiling'], ['Beans cooked gently for an hour', 'Simmering']]);
    return { q: 'Name the method: ' + it[0] + '.', a: MC(it[1], ['Poaching', 'Simmering', 'Boiling', 'Steaming']), steps: [it[1] + '.'] };
  });

  G('cuheat.braise-stew', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'name']), R.pick(['bank', 'name', 'liquid']), R.pick(['name', 'liquid', 'bank']));
    if (kind === 'liquid') { var h = R.pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8]), fr = R.pick([[1, 3, 'a third'], [1, 2, 'halfway']]); return { q: 'Short ribs stand ' + h + ' inches tall in the pot. For a braise, you add liquid ' + fr[2] + ' up the meat. How many inches of liquid?', a: AT(r2(h * fr[0] / fr[1]), 0.05), unit: 'in', steps: ['$' + h + ' \\times \\tfrac{' + fr[0] + '}{' + fr[1] + '} ' + (h * fr[0] % fr[1] ? '\\approx ' : '= ') + r2(h * fr[0] / fr[1]) + '$ inches.'] }; }
    if (kind === 'name') { var it = R.pick([['Lamb shanks browned whole and cooked covered with wine partway up', 'Braise'], ['Cubes of beef covered in liquid and simmered slowly', 'Stew'], ['A whole pot roast in a little liquid in a 300°F oven', 'Braise'], ['Bite-size chicken pieces simmered covered in sauce', 'Stew']]);
      return { q: 'Braise or stew? ' + it[0] + '.', a: MC(it[1], ['Braise', 'Stew']), steps: ['Braise: large pieces, partly covered. Stew: smaller pieces, covered in liquid.'] }; }
    return bank(R, [
      ['In a braise, tough collagen slowly turns into…', 'gelatin', ['fat', 'sugar', 'starch'], 'It gives body to the sauce.'],
      ['Why brown meat before braising?', 'For the deep flavor of the Maillard reaction', ['To kill germs only', 'To make it tender', 'It isn\'t needed'], ''],
      ['What happens if you braise at a hard boil?', 'The meat can turn stringy and dry', ['It gets more tender faster', 'Nothing changes', 'It gets more flavor'], 'Keep it at a gentle simmer.'],
      ['Which cut is best for braising?', 'Beef chuck', ['Beef tenderloin', 'Fish fillet', 'Chicken breast'], 'Hard-working muscle, lots of collagen.'],
      ['A common oven temperature for braising is about…', '300°F to 325°F', ['500°F', '200°F', '425°F'], '']
    ]);
  });

  G('cuheat.sous-vide', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'table', 'start']), R.pick(['table', 'start']), R.pick(['table', 'start', 'bank']));
    if (kind === 'table') { var r = R.pick(ROAST); return { q: 'By the Food Code\'s whole-roast table, how many minutes must a beef roast hold at ' + r[0] + '°F once its center reaches that temperature?', a: AX(r[1]), unit: 'min', steps: ['The table gives ' + r[1] + ' minutes at ' + r[0] + '°F.'] }; }
    if (kind === 'start') { var r2_ = R.pick(ROAST), up = R.pick([45, 60, 75, 90, 120]); return { q: 'A beef roast goes into a ' + r2_[0] + '°F bath. Its center reaches ' + r2_[0] + '°F after ' + up + ' minutes. By the Food Code table (' + r2_[1] + ' minutes at ' + r2_[0] + '°F), how many minutes after it went in is the earliest it may come out?', a: AX(up + r2_[1]), unit: 'min', steps: ['The clock starts when the center reaches the temperature.', '$' + up + ' + ' + r2_[1] + ' = ' + (up + r2_[1]) + '$ minutes.'] }; }
    return bank(R, [
      ['What makes sous vide cooking safe?', 'Enough time at temperature, measured at the center', ['The sealed bag alone', 'A low temperature alone', 'Searing afterward alone'], ''],
      ['What does the Food Code require in a restaurant for vacuum-sealed (reduced-oxygen) cooking like sous vide?', 'A HACCP plan', ['Nothing special', 'Only a lid', 'A different stove'], ''],
      ['Food cooked sous vide isn\'t served right away. What next?', 'Chill it fast by the two-stage cooling rule and keep it cold', ['Leave it in the warm bath overnight', 'Cool it on the counter', 'Freeze it hot in the bag'], ''],
      ['Why sear meat after sous vide?', 'The bath can\'t brown the surface', ['To make it safe', 'To cool it down', 'To seal the juices'], '']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
