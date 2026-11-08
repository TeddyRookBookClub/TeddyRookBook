  // ===== The Professional Kitchen (cupro)
  function clk(mins) { mins = ((mins % 1440) + 1440) % 1440; var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'p.m.' : 'a.m.'; return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function addD(m, d, k) { d += k; while (d > MD[m]) { d -= MD[m]; m = (m + 1) % 12; } return MONTHS[m] + ' ' + d; }

  G('cupro.brigade', function (R, ctx) {
    var S = [['Saucier', 'Sauces and sautéed dishes'], ['Poissonnier', 'Fish'], ['Rôtisseur', 'Roasts and their jus'], ['Grillardin', 'Grilled foods'], ['Friturier', 'Fried foods'], ['Entremetier', 'Vegetables, starches, soups and eggs'], ['Garde manger', 'Cold foods: salads, cold appetizers, pâtés'], ['Pâtissier', 'Pastry and desserts'], ['Boucher', 'Butchery'], ['Tournant', 'Fills in at any station'], ['Plongeur', 'Washing dishes'], ['Aboyeur', 'Calling orders at the pass']];
    var kind = by(ctx, R.pick(['who', 'rank']), R.pick(['who', 'job']), R.pick(['who', 'job', 'rank']));
    var s = R.pick(S);
    if (kind === 'who') return { q: 'In Escoffier\'s brigade, who is in charge of this? ' + s[1] + '.', a: MC(s[0], S.map(function (x) { return x[0]; })), steps: [s[0] + '.'] };
    if (kind === 'job') return { q: 'What does the ' + s[0].toLowerCase() + ' do in a classical brigade?', a: MC(s[1], S.map(function (x) { return x[1]; })), steps: [s[0] + ': ' + s[1].toLowerCase() + '.'] };
    return bank(R, [
      ['Who runs the whole kitchen?', 'The chef de cuisine', ['The sous-chef', 'The commis', 'The plongeur'], ''],
      ['Who is second in command and often runs service?', 'The sous-chef', ['The pâtissier', 'The aboyeur', 'The commis'], 'Sous means "under".'],
      ['What is a chef de partie?', 'A station chef', ['The head chef', 'A dishwasher', 'A server'], ''],
      ['What is a commis?', 'A junior cook', ['The head chef', 'A sauce', 'A kind of knife'], ''],
      ['Who organized the brigade system at hotels such as the Savoy and the Carlton?', 'Auguste Escoffier', ['Louis XIV', 'Julia Child', 'Gordon Ramsay'], '']
    ]);
  });

  G('cupro.kitchen-language', function (R, ctx) {
    var L = [['Behind', 'I\'m passing behind you'], ['Corner', 'I\'m coming around a blind corner'], ['Hot', 'I\'m carrying something hot'], ['Sharp', 'I\'m carrying a knife'], ['Heard', 'I understand'], ['Fire', 'Start cooking it now'], ['All day', 'The total of one item on all tickets'], ['86', 'We\'re out of it'], ['On the fly', 'Needed right away'], ['In the weeds', 'Overwhelmed and behind'], ['Ordering', 'Get ready, it\'s coming'], ['Walking in', 'It\'s on its way']];
    var kind = by(ctx, 'mean', R.pick(['mean', 'say']), R.pick(['mean', 'say', 'bank']));
    var l = R.pick(L);
    if (kind === 'mean') return { q: 'In a kitchen, what does "' + l[0] + '" mean?', a: MC(l[1], L.map(function (x) { return x[1]; })), steps: [l[1] + '.'] };
    if (kind === 'say') return { q: 'What do you call out to mean "' + l[1].toLowerCase() + '"?', a: MC('"' + l[0] + '"', L.map(function (x) { return '"' + x[0] + '"'; })), steps: ['"' + l[0] + '."'] };
    return bank(R, [
      ['You\'re carrying a hot sheet pan past a cook at the stove. What do you say?', '"Hot behind!"', ['Nothing', '"Fire!"', '"Heard!"'], ''],
      ['The chef calls "Fire table 6." What do you say?', '"Heard!"', ['Nothing', '"86!"', '"Behind!"'], ''],
      ['The kitchen runs out of salmon. What is the call?', '"86 salmon"', ['"Salmon all day"', '"Fire salmon"', '"Salmon behind"'], '']
    ]);
  });

  G('cupro.station-prep', function (R, ctx) {
    var kind = by(ctx, R.pick(['prep', 'bank']), 'prep', R.pick(['prep', 'par', 'bank']));
    if (kind === 'prep') { var it = R.pick([['diced shallots', 'qt'], ['sliced scallions', 'qt'], ['portioned salmon', 'portions'], ['picked parsley', 'cups'], ['blanched green beans', 'lb']]), par = R.int(4, 40) / 2, have = R.int(0, Math.floor(par * 2) - 1) / 2; return { q: 'Par for ' + it[0] + ' is ' + par + ' ' + it[1] + '. You have ' + have + ' ' + it[1] + ' left. How much do you prep?', a: AX(par - have), unit: it[1], steps: ['Prep = par − on hand: $' + par + ' - ' + have + ' = ' + fx(par - have) + '$ ' + it[1] + '.'] }; }
    if (kind === 'par') { var sold = R.int(30, 120), buf = R.pick([10, 15, 20]); return { q: 'A Friday dinner usually sells about ' + sold + ' risottos. With a ' + buf + '% buffer, what par would you set (round up)?', a: AX(Math.ceil(sold * (1 + buf / 100))), steps: ['$' + sold + ' \\times ' + T.num(1 + buf / 100) + ' = ' + fx(sold * (1 + buf / 100)) + '$, so ' + Math.ceil(sold * (1 + buf / 100)) + '.'] }; }
    return bank(R, [
      ['What is a par level?', 'How much of an item you need on hand for a service', ['The price of an item', 'The temperature of the walk-in', 'A cook\'s rank'], ''],
      ['How do you write a prep list?', 'Par minus what you have on hand', ['Whatever you feel like', 'Everything on the menu', 'Only what\'s easy'], ''],
      ['Why set a station the same way every day?', 'Your hands learn where everything is', ['Health codes require one layout', 'It looks nice', 'It is faster to clean only'], ''],
      ['What prep usually goes last?', 'Delicate items like picked herbs', ['Stocks', 'Braises', 'Doughs that must rise'], '']
    ]);
  });

  G('cupro.ordering-inventory', function (R, ctx) {
    var kind = by(ctx, R.pick(['recv', 'used']), R.pick(['used', 'recv']), R.pick(['used', 'turn', 'recv']));
    if (kind === 'used') { var o = R.int(40, 120) * 100, p = R.int(20, 80) * 100, c = R.int(30, Math.floor((o + p) / 100) - 10) * 100; return { q: 'Opening inventory \\$' + T.commas(o) + ', purchases \\$' + T.commas(p) + ', closing inventory \\$' + T.commas(c) + '. What was the cost of food used?', a: AX(o + p - c), unit: 'dollars', steps: ['Food used = opening + purchases − closing.', '$' + T.commas(o) + ' + ' + T.commas(p) + ' - ' + T.commas(c) + ' = ' + T.commas(o + p - c) + '$.'] }; }
    if (kind === 'turn') { var used = R.int(20, 80) * 100, sales = R.int(Math.ceil(used / 100 / 0.4), Math.floor(used / 100 / 0.22)) * 100; return { q: 'Food used this month cost \\$' + T.commas(used) + '. Food sales were \\$' + T.commas(sales) + '. What is the food-cost percent?', a: PC(r1(100 * used / sales), 0.01), steps: ['$' + T.commas(used) + ' \\div ' + T.commas(sales) + ' \\approx ' + sg(used / sales, 3) + '$, about ' + r1(100 * used / sales) + '%.'] }; }
    var it = R.pick([['A case of chicken arrives at 39°F', 'Accept'], ['A case of chicken arrives at 50°F', 'Reject'], ['Frozen shrimp with large ice crystals and signs of thawing', 'Reject'], ['Live oysters with their shellstock tag, shells closed', 'Accept'], ['Milk at 40°F in sealed cartons', 'Accept'], ['A box of fish with a torn bag and a sour smell', 'Reject'], ['Ice cream frozen solid', 'Accept'], ['Ground beef at 47°F', 'Reject']]);
    return { q: 'Accept or reject this delivery? ' + it[0] + '.', a: MC(it[1], ['Accept', 'Reject']), steps: [it[1] === 'Accept' ? 'It arrived at a safe temperature and in good condition.' : 'Cold food must arrive at 41°F or below and frozen food frozen solid, in sound packaging.'] };
  });

  G('cupro.recipe-costing', function (R, ctx) {
    var kind = by(ctx, R.pick(['ep', 'yield']), R.pick(['ep', 'portion', 'fc']), R.pick(['ep', 'fc', 'price', 'portion']));
    if (kind === 'yield') { var ap = R.int(20, 100) / 10, y = R.int(40, 90); var ep = r2(ap * y / 100); return { q: 'You buy ' + ap + ' lb of an item; after trimming you have ' + ep + ' lb. What is the yield percent?', a: PC(sg(100 * ep / ap, 3), 0.01), steps: ['$' + ep + ' \\div ' + ap + ' \\approx ' + sg(ep / ap, 3) + '$, about ' + sg(100 * ep / ap, 3) + '%.'] }; }
    if (kind === 'ep') { var it = R.pick([['beef tenderloin', 14, 24, 65, 75], ['whole salmon', 6, 12, 40, 50], ['carrots', 1, 2, 75, 85], ['pineapple', 2, 4, 45, 55], ['whole chicken', 2, 4, 65, 75]]); var pr = R.int(it[1] * 4, it[2] * 4) / 4, y = R.int(it[3], it[4]); var e = pr / (y / 100);
      return { q: it[0].charAt(0).toUpperCase() + it[0].slice(1) + ' costs ' + m2(pr) + ' per pound as purchased and yields ' + y + '%. What is the usable cost per pound?', a: A(e, 4, 0.005), unit: 'dollars', steps: ['Usable cost = purchase price ÷ yield.', '$' + pr.toFixed(2) + ' \\div ' + T.num(y / 100) + ' \\approx ' + e.toFixed(2) + '$.'] }; }
    if (kind === 'portion') { var rc = R.int(2000, 12000) / 100, n = R.pick([4, 6, 8, 10, 12, 16, 20, 24]); return { q: 'A recipe costs ' + m2(rc) + ' to make and yields ' + n + ' portions. What is the cost per portion?', a: A(rc / n, 4, 0.005), unit: 'dollars', steps: ['$' + rc.toFixed(2) + ' \\div ' + n + ' \\approx ' + (rc / n).toFixed(2) + '$.'] }; }
    if (kind === 'fc') { var c = R.int(250, 900) / 100, p = R.int(14, 42); return { q: 'A dish\'s portion cost is ' + m2(c) + ' and it sells for \\$' + p + '. What is its food-cost percent?', a: PC(r1(100 * c / p), 0.01), steps: ['$' + c.toFixed(2) + ' \\div ' + p + ' \\approx ' + sg(c / p, 3) + '$, about ' + r1(100 * c / p) + '%.'] }; }
    var c2 = R.int(200, 900) / 100, t = R.pick([25, 28, 30, 32, 35]); return { q: 'To hit a ' + t + '% food cost, what should a dish with a ' + m2(c2) + ' portion cost sell for?', a: A(c2 / (t / 100), 4, 0.005), unit: 'dollars', steps: ['$' + c2.toFixed(2) + ' \\div ' + T.num(t / 100) + ' \\approx ' + (c2 / (t / 100)).toFixed(2) + '$.'] };
  });

  G('cupro.timing-service', function (R, ctx) {
    var kind = by(ctx, R.pick(['start', 'bank']), 'start', R.pick(['start', 'start2', 'bank']));
    if (kind === 'start') { var serve = R.int(34, 42) * 30, cook = R.int(3, 24) * 5, rest = R.pick([0, 5, 10, 15, 20]), it = R.pick(['the roast', 'the braise', 'the potatoes', 'the bread', 'the rice']);
      var st = serve - cook - rest; return { q: 'Dinner is served at ' + clk(serve) + '. ' + it.charAt(0).toUpperCase() + it.slice(1) + ' needs ' + cook + ' minutes of cooking' + (rest ? ' and ' + rest + ' minutes of resting' : '') + '. When must it start?', a: MC(clk(st), [clk(st), clk(st + 15), clk(st - 15), clk(serve - cook), clk(st + 30)]), steps: ['$' + cook + (rest ? ' + ' + rest : '') + ' = ' + (cook + rest) + '$ minutes before ' + clk(serve) + ': ' + clk(st) + '.'] }; }
    if (kind === 'start2') { var a = R.int(15, 40), b = R.int(3, 12); return { q: 'One dish takes ' + a + ' minutes and another ' + b + ' minutes. To finish together, how many minutes after starting the first should the second start?', a: AX(a - b), unit: 'min', steps: ['$' + a + ' - ' + b + ' = ' + (a - b) + '$ minutes.'] }; }
    return bank(R, [
      ['What is ticket time?', 'How long from order to plate', ['The time the restaurant opens', 'How long a ticket is kept', 'The server\'s break'], ''],
      ['Which foods are best cooked at the last moment?', 'Sautés and fried foods', ['Braises', 'Stocks', 'Sauces held in a bain-marie'], ''],
      ['Which foods hold well before service?', 'Braises and sauces', ['French fries', 'Soufflés', 'Seared scallops'], ''],
      ['How do professionals plan a dinner\'s timing?', 'Backward from the serving time', ['Forward from when they wake up', 'By guessing', 'By cooking everything at once'], '']
    ]);
  });

  G('cupro.cleaning-maintenance', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'sched']), R.pick(['sched', 'when']), R.pick(['sched', 'when', 'bank']));
    if (kind === 'sched') { var m = R.int(0, 11), d = R.int(1, 25), k = R.pick([7, 14, 30]); return { q: 'A task is done every ' + k + ' days. It was last done on ' + MONTHS[m] + ' ' + d + '. When is it next due?', a: MC(addD(m, d, k), [addD(m, d, k), addD(m, d, k - 1), addD(m, d, k + 1), addD(m, d, k + 7)]), steps: [k + ' days after ' + MONTHS[m] + ' ' + d + ' is ' + addD(m, d, k) + '.'] }; }
    if (kind === 'when') { var it = R.pick([['Wiping a spill on the line', 'As you go'], ['Sanitizing the cutting boards between tasks', 'As you go'], ['Cleaning the flat-top and floors after service', 'Daily (closing)'], ['Emptying and cleaning the steam table', 'Daily (closing)'], ['Cleaning behind and under the equipment', 'Periodic (deep clean)'], ['Cleaning the walk-in shelves', 'Periodic (deep clean)']]);
      return { q: 'On which schedule does this usually happen? ' + it[0] + '.', a: MC(it[1], ['As you go', 'Daily (closing)', 'Periodic (deep clean)']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Who sets how often equipment is cleaned, descaled or serviced?', 'The manufacturer\'s instructions and local codes', ['Whoever has time', 'The guests', 'Nobody'], ''],
      ['Why keep hood filters clean?', 'Grease buildup is a fire risk', ['For looks only', 'To make food spicier', 'It isn\'t needed'], ''],
      ['What do you do before cleaning a slicer or mixer?', 'Unplug or lock it out, as the manual says', ['Run it on low', 'Spray it while running', 'Nothing'], ''],
      ['Why is ice machine cleaning important?', 'Ice is food', ['Ice machines rust instantly', 'It is only cosmetic', 'It isn\'t'], ''],
      ['What should happen before cleaning a fryer?', 'Let the oil and fryer cool', ['Add water to hot oil', 'Turn it to high', 'Nothing'], '']
    ]);
  });

  G('cupro.working-safely', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'weight']), R.pick(['weight', 'bank']));
    if (kind === 'weight') { var g = R.int(2, 10); return { q: 'A gallon of water weighs about 8.3 pounds. About how much does ' + g + ' gallons of hot stock weigh (not counting the pot)?', a: A(g * 8.3, 3, 0.02), unit: 'lb', steps: ['$' + g + ' \\times 8.3 = ' + fx(g * 8.3) + '$ pounds: get help or ladle it out.'] }; }
    return bank(R, [
      ['Why never grab a hot handle with a wet towel?', 'Water carries heat through to your hand', ['Wet towels slip', 'It ruins the towel', 'It is fine to do'], ''],
      ['What shoes are safest in a kitchen?', 'Closed, non-slip shoes', ['Sandals', 'Canvas sneakers', 'Any shoes'], 'OSHA advises non-slip, closed-toe shoes.'],
      ['Someone spills oil on the floor. What do you do?', 'Clean it up right away and warn others', ['Step around it', 'Wait until closing', 'Cover it with a towel'], ''],
      ['How do you open a steamer or a hot oven door?', 'Away from your face, letting steam escape', ['Lean in and look', 'Quickly with your face close', 'With a wet towel'], ''],
      ['How do you lift a heavy box?', 'With your legs, keeping the load close, and get help if it\'s heavy', ['With your back, arms straight', 'By twisting quickly', 'Above your head'], ''],
      ['How should you unplug equipment?', 'By the plug, not the cord', ['By yanking the cord', 'With wet hands', 'While it runs'], ''],
      ['What should stay clear at all times?', 'Fire exits and extinguishers', ['The dish pit', 'The walk-in door', 'The trash can'], '']
    ]);
  });

  G('cupro.michelin', function (R, ctx) {
    var kind = by(ctx, 'star', R.pick(['star', 'crit', 'bank']), R.pick(['crit', 'bank', 'star']));
    if (kind === 'star') { var s = R.pick([['One star', '"Worth a stop"'], ['Two stars', '"Worth a detour"'], ['Three stars', '"Worth a special journey"']]); return { q: 'In Michelin\'s own words, what does ' + s[0].toLowerCase() + ' mean?', a: MC(s[1], ['"Worth a stop"', '"Worth a detour"', '"Worth a special journey"', '"Worth a look"']), steps: [s[0] + ': ' + s[1] + '.'] }; }
    if (kind === 'crit') return which(R, 'Which of these is one of Michelin\'s five published criteria for stars?', ['The quality of the ingredients', 'The harmony of flavors', 'The mastery of techniques', 'The personality of the chef as expressed through the cuisine', 'Consistency across the menu and over time'], ['The décor of the dining room', 'The price of the wine list', 'How famous the chef is', 'The number of tables', 'The tablecloths'], function (c) { return c + ' is one of the five; Michelin says the stars are for the food.'; });
    return bank(R, [
      ['How do Michelin inspectors visit restaurants?', 'Anonymously, booking under assumed names and paying their bills', ['As announced guests', 'Only by phone', 'By reading reviews online'], ''],
      ['What does the Bib Gourmand mark?', 'Good quality, good value cooking', ['Three-star restaurants', 'The best wine', 'The oldest restaurants'], 'Since 1997.'],
      ['When did the Michelin Guide begin?', '1900, as a booklet for motorists', ['1990', '1800', '1950'], ''],
      ['Who receives a Michelin star?', 'The restaurant', ['The chef personally, for life', 'The city', 'The owner\'s family'], 'Stars can be lost if the cooking changes.']
    ]);
  });

  G('cupro.careers', function (R, ctx) {
    var kind = by(ctx, 'bls', R.pick(['bls', 'years', 'bank']), R.pick(['years', 'bank', 'bls']));
    if (kind === 'years') { var a = R.int(1, 3), b = R.int(2, 5), c = R.int(1, 4); return { q: 'A cook spends ' + a + ' year' + (a > 1 ? 's' : '') + ' as a prep cook, ' + b + ' as a line cook and ' + c + ' as a sous-chef before becoming a chef de cuisine. How many years in all?', a: AX(a + b + c), unit: 'years', steps: ['$' + a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '$.'] }; }
    if (kind === 'bls') return bank(R, [
      ['According to the BLS, how do most chefs and head cooks learn their skills?', 'Through work experience', ['Only in four-year colleges', 'From television', 'In six-week online courses'], 'BLS Occupational Outlook Handbook, 2026.'],
      ['According to the BLS, how much related work experience do chefs and head cooks typically have?', '5 years or more', ['None', '6 months', '1 year'], ''],
      ['What was the BLS median pay for chefs and head cooks in May 2025?', 'About \\$62,470 a year', ['About \\$20,000 a year', 'About \\$150,000 a year', 'About \\$250,000 a year'], ''],
      ['What growth does the BLS project for chefs and head cooks from 2025 to 2035?', 'About 7%', ['About 70%', 'A 50% decline', 'No jobs at all'], '']
    ]);
    return bank(R, [
      ['What is a stage (stahzh)?', 'A short working trial or visit in a kitchen', ['A cooking competition', 'A kind of oven', 'A step in a recipe'], 'The cook is a stagiaire.'],
      ['Which group offers chef certifications such as Certified Sous Chef and Certified Executive Chef?', 'The American Culinary Federation (ACF)', ['The Michelin Guide', 'The FDA', 'The BLS'], ''],
      ['Is ACF certification required to work as a cook?', 'No; it is optional', ['Yes, everywhere', 'Only for dishwashers', 'Only in Europe'], ''],
      ['Which is a typical path in a kitchen?', 'Prep cook → line cook → sous-chef → chef de cuisine', ['Chef → dishwasher → cook', 'Server → owner → cook', 'Executive chef first'], ''],
      ['What do some states and cities require of food workers?', 'A food handler card', ['A college degree', 'A Michelin star', 'Nothing ever'], '']
    ]);
  });

  G('cupro.capstone', function (R, ctx) {
    var kind = by(ctx, R.pick(['cost', 'bank']), R.pick(['cost', 'back']), R.pick(['cost', 'back', 'bank']));
    if (kind === 'cost') { var g = R.pick([4, 5, 6, 8]), per = R.int(12, 40), tot = per * g + R.int(0, g - 1); return { q: 'Your tasting menu\'s ingredients cost \\$' + tot + ' for ' + g + ' guests. What is the cost per guest?', a: A(tot / g, 4, 0.005), unit: 'dollars', steps: ['$' + tot + ' \\div ' + g + ' \\approx ' + r2(tot / g).toFixed(2) + '$.'] }; }
    if (kind === 'back') { var serve = R.int(36, 40) * 30, items = R.sample([['the braise reheats', 30], ['the sauce is finished', 15], ['the fish is seared', 8], ['the vegetables are glazed', 10], ['the dessert is plated', 6]], 1)[0]; return { q: 'The course is served at ' + clk(serve) + '. If ' + items[0] + ' takes ' + items[1] + ' minutes, when does it start?', a: MC(clk(serve - items[1]), [clk(serve - items[1]), clk(serve + items[1]), clk(serve - 2 * items[1]), clk(serve - items[1] + 5)]), steps: [items[1] + ' minutes before ' + clk(serve) + ' is ' + clk(serve - items[1]) + '.'] }; }
    return bank(R, [
      ['What is the best way to avoid disaster on the night of a home tasting menu?', 'Cook each new dish once as a test beforehand', ['Try five new techniques on the night', 'Skip the timeline', 'Prep nothing ahead'], ''],
      ['Which can be made 2 to 3 days ahead?', 'Stocks, ice cream and sauce bases', ['Seared fish', 'Dressed salad', 'Fried food'], ''],
      ['What should you ask guests when you invite them?', 'Whether they have food allergies', ['Their favorite color', 'Their salary', 'Nothing'], ''],
      ['What should the last hour before service mostly be?', 'Plating and last-minute searing', ['Making stock', 'Shopping', 'Baking bread from scratch'], '']
    ]);
  });
