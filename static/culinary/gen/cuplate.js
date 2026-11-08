/* Culinary Ladder: generators for cuplate (course key cuplate). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cuplate.js: edit those, not this file. */
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
  // ===== Plating and Service (cuplate)
  G('cuplate.composition', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'clock']), R.pick(['clock', 'odd', 'bank']));
    if (kind === 'clock') { var it = R.pick([['the protein', 'About 6 o\'clock, in front of the guest'], ['the starch', 'About 10 or 11 o\'clock'], ['the vegetable', 'About 2 o\'clock']]); return { q: 'In the classic "clock" layout, where does ' + it[0] + ' go?', a: MC(it[1], ['About 6 o\'clock, in front of the guest', 'About 10 or 11 o\'clock', 'About 2 o\'clock', 'In the exact center, piled high']), steps: [it[1] + '.'] }; }
    if (kind === 'odd') { var n = R.pick([2, 3, 4, 5, 6, 7]), better = n % 2 ? n : n + 1; return { q: 'You are plating ' + n + ' seared scallops. Many chefs prefer odd numbers. How many would they plate?', a: MC(String(better), [String(better), String(n % 2 ? n + 1 : n), String(better + 2), String(Math.max(2, better - 1))]), steps: [n % 2 ? n + ' is already odd.' : 'Use ' + better + ', an odd number, which looks more natural.'] }; }
    return bank(R, [
      ['What is negative space on a plate?', 'Clear plate around the food', ['A dark plate', 'A hole in the plate', 'An empty course'], 'It frames the food.'],
      ['Why do many chefs plate odd numbers of small items?', 'Odd groups look more natural', ['They are cheaper', 'It is the law', 'Even numbers fall over'], ''],
      ['What should the rim of the plate look like when it leaves the kitchen?', 'Clean', ['Splashed with sauce', 'Sprinkled with flour', 'Decorated with herbs'], ''],
      ['What is the trouble with very tall towers of food?', 'They can topple on the way to the table and look dated', ['They taste bad', 'They are too cold', 'They are illegal'], ''],
      ['What do you choose first when plating?', 'The plate, to fit the food', ['The garnish', 'The sauce bottle', 'The tablecloth'], ''],
      ['Which plate shows the most color balance?', 'Seared salmon, green beans and a yellow purée', ['Chicken, rice and cauliflower', 'Fish, mashed potato and white sauce', 'Beef, brown gravy and mushrooms'], '']
    ]);
  });

  G('cuplate.sauce-garnish', function (R, ctx) {
    return bank(R, [
      ['Where should sauce go with crispy-skinned fish?', 'Under or beside the fish, not over it', ['Poured over the skin', 'In a separate room', 'Nowhere'], ''],
      ['Which is a good garnish rule?', 'Every garnish is edible and belongs to the dish', ['Use a parsley sprig on every plate', 'Garnish only for color', 'Use inedible flowers'], ''],
      ['What tool makes neat sauce dots?', 'A squeeze bottle', ['A ladle', 'A whisk', 'A rolling pin'], ''],
      ['How do you make a spoon swoosh?', 'Place a spoonful, then drag the back of the spoon through it in one motion', ['Pour from high above', 'Shake the plate', 'Use a fork'], ''],
      ['Why warm a sauce before putting it in a squeeze bottle?', 'So it flows smoothly', ['To make it safe', 'To thicken it', 'It doesn\'t matter'], ''],
      ['A woody rosemary branch across a lamb plate is…', 'a poor garnish, because it isn\'t eaten', ['the perfect garnish', 'required with lamb', 'a sauce'], 'Use a few leaves or rosemary oil.'],
      ['Which garnish best fits a carrot soup?', 'A few carrot-top leaves or a swirl of herb oil', ['A cherry', 'A paper umbrella', 'A slice of lemon on the rim'], '']
    ]);
  });

  G('cuplate.place-setting', function (R, ctx) {
    var kind = by(ctx, 'where', R.pick(['where', 'which', 'bank']), R.pick(['which', 'bank', 'where']));
    if (kind === 'where') { var it = R.pick([['the forks', 'To the left of the plate'], ['the dinner knife', 'To the right of the plate, blade facing the plate'], ['the soup spoon', 'To the right, outside the knives'], ['the bread plate', 'Upper left, above the forks'], ['the water glass', 'Above the dinner knife'], ['the dessert spoon and fork', 'Above the plate'], ['the wine glasses', 'To the right of the water glass'], ['the oyster fork', 'On the right, outside the spoons']]);
      return { q: 'In a formal place setting, where does ' + it[0] + ' go?', a: MC(it[1], ['To the left of the plate', 'To the right of the plate, blade facing the plate', 'To the right, outside the knives', 'Upper left, above the forks', 'Above the dinner knife', 'Above the plate', 'To the right of the water glass', 'On the right, outside the spoons']), steps: [it[1] + '.'] }; }
    if (kind === 'which') { var n = R.pick([2, 3]), first = R.pick(['salad', 'fish']); return { q: 'There are ' + n + ' forks to the left of the plate. The first course to need a fork is the ' + first + ' course. Which fork do you use?', a: MC('The one farthest from the plate (outermost)', ['The one farthest from the plate (outermost)', 'The one closest to the plate', 'The middle one', 'Any of them']), steps: ['Use utensils from the outside in.'] }; }
    return bank(R, [
      ['What does the "b" and "d" hand trick help you remember?', 'Bread plate on the left, drinks on the right', ['Butter and dessert', 'Beef and duck', 'Bowl and dish'], ''],
      ['Which way does the knife blade face?', 'Toward the plate', ['Away from the plate', 'Up', 'Toward the guest'], ''],
      ['What is the fish knife\'s broad, dull blade for?', 'Lifting fish off the bones', ['Cutting steak', 'Spreading butter', 'Cracking crab'], ''],
      ['Which is the only fork placed on the right?', 'The oyster fork', ['The salad fork', 'The dessert fork', 'The dinner fork'], ''],
      ['In what order are utensils used?', 'From the outside in', ['From the inside out', 'Left to right', 'Any order'], '']
    ]);
  });

  G('cuplate.tasting-menu', function (R, ctx) {
    var C = ['Amuse-bouche', 'Cold or raw course', 'Fish course', 'Meat course', 'Cheese', 'Pre-dessert', 'Dessert', 'Mignardises'];
    var kind = by(ctx, R.pick(['bank', 'order']), R.pick(['order', 'sum']), R.pick(['order', 'sum', 'bank']));
    if (kind === 'order') { var p = R.sample([0, 1, 2, 3, 4, 5, 6, 7], 2); var e = Math.min(p[0], p[1]); return { q: 'In a common tasting-menu order, which comes first: ' + C[p[0]].toLowerCase() + ' or ' + C[p[1]].toLowerCase() + '?', a: MC(C[e], [C[p[0]], C[p[1]]]), steps: ['Order: ' + C.join(', ').toLowerCase() + '.'] }; }
    if (kind === 'sum') { var n = R.int(3, 8), oz = R.pick([1.5, 2, 2.5, 3]); return { q: 'A tasting menu has ' + n + ' savory courses with about ' + T.num(oz) + ' oz of the main item each. About how many ounces per guest in all?', a: AX(n * oz), unit: 'oz', steps: ['$' + n + ' \\times ' + T.num(oz) + ' = ' + fx(n * oz) + '$ oz.'] }; }
    return bank(R, [
      ['What is an amuse-bouche?', 'One bite from the chef to welcome the guest', ['The main course', 'A dessert wine', 'The bill'], ''],
      ['What are mignardises?', 'Small sweets served at the end, often with coffee', ['Cold soups', 'Bread rolls', 'Raw oysters'], ''],
      ['How do tasting-menu courses usually move?', 'From light to rich, savory to sweet', ['From rich to light', 'Dessert first', 'In random order'], ''],
      ['What is a pre-dessert for?', 'A light, cleansing step before dessert', ['A second main course', 'A cheese plate', 'A salad'], ''],
      ['Why are tasting-menu portions small?', 'So 8 to 12 courses make a satisfying meal, not too much', ['To save money only', 'Because plates are small', 'They aren\'t small'], '']
    ]);
  });

  G('cuplate.service-styles', function (R, ctx) {
    var it = R.pick([['Food plated in the kitchen and carried to each guest', 'American (plated)'], ['A server serves each guest from a platter at the table', 'Russian'], ['Dishes finished, carved or flambéed on a cart beside the table', 'French (guéridon)'], ['Platters set on the table for guests to pass', 'Family style'], ['The host carves the roast at the table and serves', 'English'], ['A waiter flambés crêpes Suzette at the table', 'French (guéridon)']]);
    var kind = by(ctx, 'name', R.pick(['name', 'bank']), R.pick(['name', 'bank']));
    if (kind === 'name') return { q: 'Name the service style: ' + it[0] + '.', a: MC(it[1], ['American (plated)', 'Russian', 'French (guéridon)', 'Family style', 'English']), steps: [it[1] + '.'] };
    return bank(R, [
      ['Which service style do most restaurants use today?', 'American (plated)', ['Russian', 'English', 'Guéridon'], ''],
      ['In history, what did "service à la française" mean?', 'Many dishes set on the table at once', ['Courses one after another', 'Cart service', 'Buffets only'], ''],
      ['What replaced it in Europe in the 1800s, leading to course-by-course meals?', 'Service à la russe', ['Family style', 'Fast food', 'Buffets'], ''],
      ['Is family style less work for the kitchen?', 'No; the kitchen still cooks every dish', ['Yes, much less', 'Yes, no cooking at all', 'Only on weekends'], '']
    ]);
  });

  G('cuplate.the-pass', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'allday']), 'allday', R.pick(['allday', 'fire', 'bank']));
    if (kind === 'allday') { var item = R.pick(['salmon', 'steak', 'risotto', 'duck', 'chicken']), ts = R.ints(R.int(2, 5), 1, 4); var tot = ts.reduce(function (a, b) { return a + b; }, 0);
      return { q: 'Open tickets have ' + ts.map(function (x, i) { return 'table ' + (3 + i * 4) + ': ' + x + ' ' + item; }).join('; ') + '. How many ' + item + ' "all day"?', a: AX(tot), steps: ['"All day" is the total: $' + ts.join(' + ') + ' = ' + tot + '$.'] }; }
    if (kind === 'fire') { var a = R.pick([[12, 'steak'], [15, 'duck breast'], [18, 'roast chicken'], [10, 'pork chop']]), b = R.pick([[4, 'salmon'], [3, 'scallops'], [5, 'sautéed shrimp'], [6, 'trout']]); return { q: 'A table orders ' + a[1] + ' (' + a[0] + ' minutes) and ' + b[1] + ' (' + b[0] + ' minutes). How many minutes after firing the ' + a[1] + ' should the ' + b[1] + ' start, so both finish together?', a: AX(a[0] - b[0]), unit: 'min', steps: ['$' + a[0] + ' - ' + b[0] + ' = ' + (a[0] - b[0]) + '$ minutes.'] }; }
    return bank(R, [
      ['What does "fire" mean on the line?', 'Start cooking now', ['Turn off the stove', 'There is a fire', 'Throw it away'], ''],
      ['What does "ordering" mean when the expediter calls a ticket?', 'Get ready; it\'s coming', ['Cook it now', 'Call the supplier', 'Cancel it'], ''],
      ['How do cooks answer a call from the pass?', '"Heard" (or "yes, chef")', ['Silence', '"Maybe"', '"Later"'], ''],
      ['What does the expediter check before a plate leaves?', 'Temperature, look and that it\'s the right dish', ['Only the price', 'Only the color of the plate', 'Nothing'], ''],
      ['Why fire dishes at different times for one table?', 'So everything lands at the pass together', ['To confuse the cooks', 'To save gas', 'Because of the brigade'], '']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
