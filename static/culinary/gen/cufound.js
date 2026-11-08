/* Culinary Ladder: generators for cufound (course key cufound). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cufound.js: edit those, not this file. */
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
  // ===== Kitchen Foundations (cufound)
  G('cufound.kitchen-tour', function (R, ctx) {
    return bank(R, [
      ['Which machine heats only from above, for quick browning of tops?', 'A salamander', ['A deep fryer', 'A griddle', 'A walk-in'], 'A salamander (like a broiler) puts strong heat on the top of the food.'],
      ['Which oven can cook with hot air, steam, or both at once?', 'A combi oven', ['A salamander', 'A still oven', 'A charbroiler'], 'A combi (combination) oven adds steam to hot air.'],
      ['What is the pass?', 'The counter where finished plates are checked before they go out', ['The walk-in refrigerator', 'The dish station', 'The back door for deliveries'], 'The pass sits between the line and the dining room.'],
      ['What is a station?', 'One cook\'s work area for one part of the menu', ['A delivery schedule', 'A kind of oven', 'The dining room'], 'Grill, sauté, fry, cold and pastry are typical stations.'],
      ['What does the fan in a convection oven do?', 'Moves hot air so food cooks faster and browns more evenly', ['Cools the oven between uses', 'Adds steam', 'Heats only the top'], 'Moving air carries heat to the food faster.'],
      ['Which machine is best for grill marks on a steak?', 'A charbroiler (grill)', ['A steam kettle', 'A salamander', 'A combi oven on steam'], 'A grill heats from below through grates.'],
      ['Which machine is a thick, flat, hot steel plate for eggs, pancakes and burgers?', 'A griddle (flat-top)', ['A salamander', 'A fryer', 'A stockpot'], 'A griddle is a flat cooking surface.'],
      ['At or below what temperature should a walk-in hold cold food, by the FDA Food Code?', '41°F', ['50°F', '55°F', '32°F only'], 'Cold TCS food is held at 41°F or below.'],
      ['What is "the line"?', 'The row of cooking stations that work during service', ['A queue of customers', 'A painted mark on the floor', 'The list of suppliers'], 'Line cooks work the line.'],
      ['Which heats food in hot oil all around it?', 'A deep fryer', ['A griddle', 'A salamander', 'A proofing box'], 'Deep fryers cook by convection in oil.']
    ]);
  });

  G('cufound.knives-boards', function (R, ctx) {
    var kind = by(ctx, R.pick(['part', 'knife']), R.pick(['part', 'knife', 'board']), R.pick(['knife', 'board', 'part']));
    if (kind === 'part') return bank(R, [
      ['What is the tang of a knife?', 'The part of the blade that runs into the handle', ['The very tip', 'The sharp edge', 'The flat side'], 'A full tang runs the whole length of the handle.'],
      ['What is the heel of a knife?', 'The back of the edge, nearest the handle, for heavy cuts', ['The point', 'The top of the blade', 'The end of the handle'], 'Use the heel for tough cuts such as chopping through hard squash.'],
      ['What is the spine of a knife?', 'The thick, unsharpened top of the blade', ['The sharp edge', 'The rivets', 'The very tip'], 'The spine is used to scrape food across the board.'],
      ['What is the bolster on a forged knife?', 'The thick collar between the blade and the handle', ['The edge guard', 'The serrations', 'The tip'], 'Not every knife has one; stamped knives usually don\'t.'],
      ['Which part of the knife do you use for fine, delicate cuts?', 'The tip', ['The heel', 'The spine', 'The bolster'], 'The tip does detail work like scoring.']
    ]);
    if (kind === 'knife') return bank(R, [
      ['Which knife is best for slicing a crusty loaf of bread?', 'A serrated knife', ['A paring knife', 'A boning knife', 'A cleaver'], 'Teeth bite through crust without crushing.'],
      ['Which knife does most of the work in a kitchen?', 'The chef\'s knife', ['The paring knife', 'The bread knife', 'The oyster knife'], 'Chopping, dicing, slicing and mincing.'],
      ['Which knife is best for peeling and trimming small items in your hand?', 'A paring knife', ['A slicer', 'A chef\'s knife', 'A bread knife'], 'A short blade is easy to control.'],
      ['Which knife takes meat off the bone?', 'A boning knife', ['A serrated knife', 'A santoku', 'A paring knife only'], 'Its narrow blade follows bones.'],
      ['Which knife is long and narrow for carving a roast in thin slices?', 'A slicer', ['A paring knife', 'A cleaver', 'A boning knife'], 'Long strokes give smooth slices.'],
      ['Which three knives cover nearly every job?', 'Chef\'s, paring and serrated', ['Cleaver, boning and fillet', 'Steak, butter and bread', 'Santoku, nakiri and paring'], 'Spend on those three first.']
    ]);
    return bank(R, [
      ['How do you keep a cutting board from sliding?', 'Put a damp towel or a non-slip mat under it', ['Press down harder with the knife', 'Use a glass board', 'Hold it with your guide hand'], 'A board that slides is dangerous.'],
      ['Which board material dulls a knife fastest?', 'Glass', ['Wood', 'Plastic', 'Bamboo'], 'Glass, stone and metal destroy edges.'],
      ['Why do many kitchens use color-coded plastic boards?', 'To keep raw meat away from ready-to-eat food', ['Because color makes knives sharper', 'To match the plates', 'It is required for bread only'], 'Separate boards prevent cross-contamination.'],
      ['Which boards are good for knives?', 'Wood or plastic', ['Granite or marble', 'Glass', 'Steel'], 'Softer surfaces protect the edge.']
    ]);
  });

  G('cufound.pans-materials', function (R, ctx) {
    var kind = by(ctx, 'mat', R.pick(['mat', 'shape']), R.pick(['mat', 'shape', 'why']));
    if (kind === 'mat') return bank(R, [
      ['Which metal spreads heat fastest and most evenly?', 'Copper', ['Stainless steel', 'Cast iron', 'Glass'], 'Copper conducts heat best, then aluminum.'],
      ['Which pan material reacts with acid unless coated?', 'Bare aluminum', ['Stainless steel', 'Enameled cast iron', 'Glass'], 'Acidic foods can taste metallic in bare aluminum.'],
      ['Why do good stainless pans have an aluminum or copper core?', 'Stainless steel spreads heat poorly on its own', ['To make them lighter than plastic', 'To make them nonstick', 'So they can go in the microwave'], 'The core spreads the heat; the stainless faces the food.'],
      ['Which pan holds heat well, sears hard, and must be seasoned?', 'Cast iron or carbon steel', ['Nonstick aluminum', 'Glass', 'Copper lined with tin'], 'Both store a lot of heat and need seasoning.'],
      ['Which pan is best kept at moderate heat with no metal tools?', 'Nonstick', ['Cast iron', 'Carbon steel', 'Stainless steel'], 'High heat and metal wear the coating.'],
      ['Which material is a restaurant workhorse that is like cast iron but lighter?', 'Carbon steel', ['Copper', 'Glass', 'Ceramic'], 'Carbon steel sauté pans and woks are common on the line.']
    ]);
    if (kind === 'shape') return bank(R, [
      ['Which pan is wide and shallow with two loop handles, for braising?', 'A rondeau', ['A saucepan', 'A sauteuse', 'A sheet pan'], 'Rondeaus (braziers) brown and braise big batches.'],
      ['Which pan has sloped sides for tossing food?', 'A sauteuse', ['A sautoir', 'A stockpot', 'A hotel pan'], 'Sloped sides let food slide and flip.'],
      ['Which pot is tall and narrow for stocks?', 'A stockpot', ['A rondeau', 'A sauteuse', 'A sheet pan'], 'A tall shape slows evaporation during long simmering.'],
      ['Which pan is a deep rectangular pan for holding and storing food?', 'A hotel pan', ['A sauteuse', 'A rondeau', 'A wok'], 'Hotel pans fit steam tables and racks.'],
      ['Which pan has straight sides and a lid, for shallow braises and pan sauces?', 'A sautoir', ['A sauteuse', 'A sheet pan', 'A stockpot'], 'Straight sides hold more liquid.']
    ]);
    return bank(R, [
      ['Mushrooms crowded in a thin pan stay gray. Why?', 'The pan cools and the food steams instead of browning', ['Mushrooms cannot brown', 'The pan was too heavy', 'They needed more salt at the start'], 'Leave space, use a heavy pan, and cook in batches.'],
      ['What simple test shows a stainless pan is hot enough to sear?', 'A drop of water skitters across it as a ball', ['The handle feels warm', 'The pan smokes heavily', 'The pan turns blue'], 'The ball rides on a cushion of steam.'],
      ['Which pan is best for an hour-long tomato sauce?', 'Stainless clad or enameled', ['Bare aluminum', 'Bare cast iron', 'Unlined copper'], 'They don\'t react with acid.']
    ]);
  });

  G('cufound.hand-tools', function (R, ctx) {
    var kind = by(ctx, R.pick(['scoop', 'tool', 'batch']), R.pick(['scoop', 'ladle', 'tool', 'batch']), R.pick(['scoop', 'ladle', 'scoopn', 'batch']));
    if (kind === 'batch') { var sn = R.pick([8, 10, 12, 16, 20, 24, 30, 40]), qq = R.int(1, 8); return {
      q: 'Each level #' + sn + ' scoop is 1/' + sn + ' of a quart. How many scoops of cookie dough are in ' + qq + ' quart' + (qq > 1 ? 's' : '') + ' of dough?',
      a: AX(sn * qq), steps: ['$' + sn + ' \\times ' + qq + ' = ' + sn * qq + '$ scoops.']
    }; }
    if (kind === 'scoop') { var n = R.pick([4, 6, 8, 10, 12, 16, 20, 24, 30, 32, 40]); return {
      q: 'A portion scoop\'s number is how many level scoops make a quart (32 fluid ounces). How many fluid ounces does a #' + n + ' scoop hold?',
      a: A(32 / n, 3, 0.02), unit: 'fl oz', steps: ['$32 \\div ' + n + ' = ' + sg(32 / n, 3) + '$ fluid ounces.']
    }; }
    if (kind === 'scoopn') { var oz = R.pick([1, 2, 4, 8, 16]); return {
      q: 'Which scoop number holds ' + oz + ' fluid ounce' + (oz > 1 ? 's' : '') + '? (The number is scoops per 32-ounce quart.)',
      a: AX(32 / oz), steps: ['$32 \\div ' + oz + ' = ' + (32 / oz) + '$, so a #' + (32 / oz) + ' scoop.']
    }; }
    if (kind === 'ladle') { var l = R.pick([2, 3, 4, 6, 8, 12]), qts = R.int(1, 12); var tot = qts * 32; return {
      q: 'How many ' + l + '-ounce ladles of soup are in ' + qts + ' quart' + (qts > 1 ? 's' : '') + '? (1 quart = 32 fluid ounces.)',
      a: AX(Math.floor(tot / l)), steps: ['$' + qts + ' \\times 32 = ' + tot + '$ fluid ounces.', (tot % l ? '$' + tot + ' \\div ' + l + ' \\approx ' + r2(tot / l) + '$, so ' + Math.floor(tot / l) + ' full ladles.' : '$' + tot + ' \\div ' + l + ' = ' + (tot / l) + '$ ladles.')]
    }; }
    return bank(R, [
      ['What is a chinois?', 'A fine, cone-shaped strainer for silky sauces', ['A Chinese cleaver', 'A steamer basket', 'A rolling pin'], 'Push sauce through it with a ladle.'],
      ['What should always be used with a mandoline?', 'The hand guard (or a cut-resistant glove, as the maker says)', ['A wet towel', 'A serrated knife', 'Gloves only for onions'], 'Most mandoline cuts happen on the last slices.'],
      ['How do you check an instant-read thermometer?', 'In a glass of ice and a little water: it should read 32°F', ['In the oven at 350°F', 'In tap water: it should read 70°F', 'By touching it'], 'Ice water is a reliable 32°F.'],
      ['What is a spider used for?', 'Lifting food out of hot oil or water', ['Cutting dough', 'Zesting lemons', 'Measuring flour'], 'It is a wide wire skimmer.'],
      ['What is a fish spatula?', 'A thin, flexible, slotted turner for delicate food', ['A knife for filleting', 'A scale for fish', 'A pan for poaching'], 'It slides under fish without breaking it.'],
      ['Which tool zests citrus and grates hard cheese finely?', 'A microplane (rasp grater)', ['A chinois', 'A tamis', 'A spider'], 'Its tiny blades shave fine strands.'],
      ['What is a tamis?', 'A drum sieve for pushing purées or flour through', ['A tart pan', 'A scale', 'A cutting board'], 'It gives a very smooth purée.']
    ]);
  });

  G('cufound.machines', function (R, ctx) {
    return bank(R, [
      ['Which stand-mixer attachment is for bread dough?', 'The dough hook', ['The whisk', 'The paddle', 'The grater'], 'The hook kneads.'],
      ['Which stand-mixer attachment whips cream and egg whites?', 'The whisk', ['The dough hook', 'The paddle', 'The slicer'], 'The whisk beats air in.'],
      ['Which attachment creams butter and sugar for cookies?', 'The paddle', ['The whisk', 'The dough hook', 'No attachment'], 'The paddle beats without clogging.'],
      ['Why shouldn\'t you mash potatoes in a food processor?', 'The blade bursts starch cells and makes them gluey', ['It makes them lumpy', 'It makes them cold', 'It adds too much air'], 'Use a ricer, food mill or masher.'],
      ['How full should a blender be with hot soup?', 'No more than about half, with the vent open and covered by a towel', ['Full to the top with the lid sealed', 'Any amount if the lid is tight', 'Only a spoonful'], 'Steam can force a sealed lid off.'],
      ['What does an immersion circulator do?', 'Heats and stirs a water bath to an exact temperature', ['Blends soup in the pot', 'Chills food fast', 'Grinds meat'], 'It is the heart of sous vide cooking.'],
      ['Which tool purées soup right in the pot?', 'An immersion (stick) blender', ['A stand mixer', 'A mandoline', 'A spider'], 'No transfer to a blender needed.'],
      ['What should you do before reaching toward a mixer or processor blade?', 'Unplug the machine', ['Turn it to low speed', 'Wear an oven mitt', 'Wet your hands'], 'Never reach into a machine that can start.'],
      ['Which machine is best for pulsing pie dough or chopping nuts quickly?', 'A food processor', ['An immersion circulator', 'A salamander', 'A stand mixer with whisk'], 'Pulse and stop early.']
    ]);
  });

  G('cufound.weighing', function (R, ctx) {
    var kind = by(ctx, R.pick(['oz2g', 'g2oz']), R.pick(['lb2g', 'g2lb', 'kg2lb', 'tbsp']), R.pick(['lb2g', 'g2lb', 'cups', 'tbsp', 'oz2g']));
    if (kind === 'oz2g') { var o = R.int(2, 48); return {
      q: 'A recipe calls for ' + o + ' ounces of butter. How many grams is that? (1 ounce = 28.35 g)', a: A(o * 28.35, 3, 0.01), unit: 'g',
      steps: ['$' + o + ' \\times 28.35 = ' + fx(o * 28.35) + '$ g.']
    }; }
    if (kind === 'g2oz') { var g = R.int(2, 40) * 25; return {
      q: 'How many ounces is ' + g + ' g? (1 ounce = 28.35 g)', a: A(g / 28.35, 3, 0.01), unit: 'oz',
      steps: ['$' + g + ' \\div 28.35 \\approx ' + sg(g / 28.35, 3) + '$ ounces.']
    }; }
    if (kind === 'lb2g') { var lb = R.int(1, 24) / 2; return {
      q: 'How many grams is ' + lb + ' pound' + (lb === 1 ? '' : 's') + '? (1 pound = 453.6 g)', a: A(lb * 453.6, 3, 0.01), unit: 'g',
      steps: ['$' + lb + ' \\times 453.6 = ' + tv(fx(lb * 453.6)) + '$ g.']
    }; }
    if (kind === 'g2lb') { var g2 = R.int(4, 60) * 100; return {
      q: 'You have ' + tv(g2) + ' g of potatoes. How many pounds is that? (1 pound = 453.6 g)', a: A(g2 / 453.6, 3, 0.01), unit: 'lb',
      steps: ['$' + tv(g2) + ' \\div 453.6 \\approx ' + sg(g2 / 453.6, 3) + '$ pounds.']
    }; }
    if (kind === 'kg2lb') { var kg = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 15, 20, 25]); return {
      q: 'About how many pounds is ' + kg + ' kg? (1 kg ≈ 2.2 pounds)', a: A(kg * 2.2, 3, 0.02), unit: 'lb',
      steps: ['$' + kg + ' \\times 2.2 = ' + fx(kg * 2.2) + '$ pounds.']
    }; }
    if (kind === 'tbsp') { var tb = R.pick([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48]); var w = R.pick(['cups', 'fl oz', 'tsp']); return {
      q: 'How many ' + (w === 'fl oz' ? 'fluid ounces' : w === 'tsp' ? 'teaspoons' : 'cups') + ' are in ' + tb + ' tablespoons? (3 tsp = 1 Tbsp; 2 Tbsp = 1 fl oz; 16 Tbsp = 1 cup)',
      a: AX(w === 'cups' ? tb / 16 : w === 'fl oz' ? tb / 2 : tb * 3), unit: w,
      steps: [w === 'cups' ? '$' + tb + ' \\div 16 = ' + fx(tb / 16) + '$ cups.' : w === 'fl oz' ? '$' + tb + ' \\div 2 = ' + fx(tb / 2) + '$ fluid ounces.' : '$' + tb + ' \\times 3 = ' + tb * 3 + '$ teaspoons.']
    }; }
    var c = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24]); var to = R.pick(['quarts', 'pints', 'fl oz']); return {
      q: 'How many ' + (to === 'fl oz' ? 'fluid ounces' : to) + ' are in ' + c + ' cups? (2 cups = 1 pint; 4 cups = 1 quart; 1 cup = 8 fl oz)',
      a: AX(to === 'quarts' ? c / 4 : to === 'pints' ? c / 2 : c * 8), unit: to,
      steps: [to === 'quarts' ? '$' + c + ' \\div 4 = ' + fx(c / 4) + '$ quarts.' : to === 'pints' ? '$' + c + ' \\div 2 = ' + fx(c / 2) + '$ pints.' : '$' + c + ' \\times 8 = ' + c * 8 + '$ fluid ounces.']
    };
  });

  G('cufound.reading-recipes', function (R, ctx) {
    var kind = by(ctx, R.pick(['factor', 'amount']), R.pick(['amount', 'amount', 'factor']), R.pick(['amount', 'down', 'servings']));
    var dish = R.pick([['a soup', 'carrots', [600, 900, 1200]], ['a stew', 'beef', [800, 1000, 1500]], ['a bread dough', 'flour', [500, 1000, 1200]], ['a sauce', 'tomatoes', [700, 1000, 1400]], ['a salad', 'greens', [300, 450, 600]]]);
    var y0 = R.pick([4, 6, 8, 10, 12]), y1 = R.intNot(2, 40, y0), amt = R.pick(dish[2]);
    if (kind === 'factor') return {
      q: 'A recipe for ' + dish[0] + ' makes ' + y0 + ' servings. You need ' + y1 + ' servings. What is the conversion factor?',
      a: A(y1 / y0, 3, 0.01), steps: ['Factor = new yield ÷ old yield: $' + y1 + ' \\div ' + y0 + ' \\approx ' + sg(y1 / y0, 3) + '$.']
    };
    if (kind === 'servings') { var f = R.pick([0.5, 1.5, 2, 2.5, 3, 4]); return {
      q: 'You multiplied every ingredient of a ' + y0 + '-serving recipe by ' + f + '. How many servings does it make now?',
      a: AX(y0 * f), steps: ['$' + y0 + ' \\times ' + f + ' = ' + fx(y0 * f) + '$ servings.']
    }; }
    if (kind === 'down') { var big = R.pick([24, 36, 48, 60]), small = R.pick([6, 8, 12]), fl = R.pick([1200, 1800, 2400, 3000]); return {
      q: 'A dough makes ' + big + ' rolls with ' + tv(fl) + ' g of flour. How much flour for ' + small + ' rolls?',
      a: A(fl * small / big, 3, 0.01), unit: 'g', steps: ['Factor: $' + small + ' \\div ' + big + '$.', '$' + tv(fl) + ' \\times ' + small + ' \\div ' + big + ' = ' + tv(sg(fl * small / big, 4)) + '$ g.']
    }; }
    return {
      q: dish[0].charAt(0).toUpperCase() + dish[0].slice(1) + ' for ' + y0 + ' uses ' + tv(amt) + ' g of ' + dish[1] + '. How many grams for ' + y1 + ' servings?',
      a: A(amt * y1 / y0, 3, 0.01), unit: 'g', steps: ['Factor: $' + y1 + ' \\div ' + y0 + '$.', '$' + tv(amt) + ' \\times ' + y1 + ' \\div ' + y0 + ' \\approx ' + tv(sg(amt * y1 / y0, 4)) + '$ g.']
    };
  });

  G('cufound.mise-en-place', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'first']), R.pick(['first', 'bank', 'first']));
    if (kind === 'first') {
      var items = R.sample([['rice', 30], ['a braise', 150], ['a quick salad', 10], ['pan-seared fish', 8], ['bread dough (rising)', 120], ['a stock', 240], ['roasted potatoes', 50], ['a pan sauce', 6], ['whipped cream', 5], ['a custard (chilling)', 180]], 4);
      var top = items.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
      return { q: 'Dinner needs: ' + items.map(function (x) { return x[0] + ' (' + x[1] + ' min)'; }).join(', ') + '. With mise en place in mind, which do you start first?',
        a: MC(top[0], items.map(function (x) { return x[0]; })), steps: ['Start the item that takes longest: ' + top[0] + ', ' + top[1] + ' minutes. Prep the rest while it cooks.'] };
    }
    return bank(R, [
      ['What does "mise en place" mean?', 'Everything in its place, ready before cooking', ['Cook everything at once', 'Clean up after service', 'The place where plates are checked'], 'Read, plan, gather, prep and set up first.'],
      ['When should you chop the garlic for a sauté?', 'Before the pan goes on the heat', ['While the oil smokes', 'After the dish is plated', 'Only if you have time'], 'Garlic burns in under a minute.'],
      ['What is "working clean"?', 'Wiping and putting things back as you go', ['Wearing a new apron every hour', 'Only cleaning at closing', 'Using gloves for everything'], 'A clean station is a safe station.'],
      ['What do you do first with a new recipe?', 'Read it all the way through, twice', ['Turn on the oven', 'Start chopping', 'Double it'], 'Find long steps and temperatures first.'],
      ['How should ingredients be grouped on your station?', 'By when they go into the dish', ['Alphabetically', 'By color', 'By price'], 'First in, after five minutes, at the end.']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
