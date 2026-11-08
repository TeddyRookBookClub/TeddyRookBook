  // ===== Proteins (cuprot)
  var PRIM = [['Ribeye steak', 'Rib'], ['Prime rib roast', 'Rib'], ['Strip steak', 'Short loin'], ['T-bone steak', 'Short loin'], ['Porterhouse steak', 'Short loin'], ['Top sirloin steak', 'Sirloin'], ['Tri-tip', 'Sirloin'],
    ['Chuck roast', 'Chuck'], ['Flat iron steak', 'Chuck'], ['Top round', 'Round'], ['Eye of round', 'Round'], ['Bottom round', 'Round'], ['Brisket', 'Brisket'], ['Skirt steak', 'Plate'], ['Flank steak', 'Flank']];
  var BEEFP = ['Chuck', 'Rib', 'Short loin', 'Sirloin', 'Round', 'Brisket', 'Plate', 'Flank'];

  G('cuprot.meat-structure', function (R, ctx) {
    var kind = by(ctx, R.pick(['method', 'bank']), R.pick(['method', 'bank']), R.pick(['method', 'bank']));
    if (kind === 'method') { var it = R.pick([['beef tenderloin', 'Quick dry heat (roast, grill, sauté)'], ['beef chuck', 'Slow moist heat (braise, stew)'], ['pork loin', 'Quick dry heat (roast, grill, sauté)'], ['pork shoulder', 'Slow moist heat (braise, stew)'], ['lamb rack', 'Quick dry heat (roast, grill, sauté)'], ['lamb shank', 'Slow moist heat (braise, stew)'], ['beef short ribs', 'Slow moist heat (braise, stew)'], ['beef brisket', 'Slow moist heat (braise, stew)'], ['strip steak', 'Quick dry heat (roast, grill, sauté)'], ['veal shank (osso buco)', 'Slow moist heat (braise, stew)'], ['pork tenderloin', 'Quick dry heat (roast, grill, sauté)'], ['beef oxtail', 'Slow moist heat (braise, stew)'], ['lamb loin chops', 'Quick dry heat (roast, grill, sauté)'], ['beef cheeks', 'Slow moist heat (braise, stew)'], ['ribeye steak', 'Quick dry heat (roast, grill, sauté)'], ['pork belly', 'Slow moist heat (braise, stew)']]);
      return { q: 'What is the best way to cook ' + it[0] + '?', a: MC(it[1], ['Quick dry heat (roast, grill, sauté)', 'Slow moist heat (braise, stew)']), steps: [it[1].indexOf('Slow') === 0 ? 'A hard-working muscle with lots of connective tissue: slow, moist heat.' : 'A tender muscle that did little work: quick, dry heat.'] }; }
    return bank(R, [
      ['Why slice across the grain?', 'It leaves short fibers that are easy to chew', ['It looks prettier only', 'It keeps the meat hot', 'It removes fat'], ''],
      ['Which muscles are toughest?', 'Ones that worked hard, like shoulder and leg', ['Ones along the back, like the loin', 'All muscles are the same', 'Only the tenderloin'], ''],
      ['What is silverskin?', 'Tough connective tissue (elastin) that should be trimmed', ['A kind of fat that melts', 'The skin of a fish', 'A cut of pork'], 'It doesn\'t soften with cooking.'],
      ['What is marbling?', 'Fat within the muscle', ['Connective tissue', 'Bone', 'A cooking method'], '']
    ]);
  });

  G('cuprot.primal-cuts', function (R, ctx) {
    var kind = by(ctx, 'beef', R.pick(['beef', 'other']), R.pick(['beef', 'other', 'where']));
    if (kind === 'beef') { var c = R.pick(PRIM); return { q: 'Which beef primal does the ' + c[0].toLowerCase() + ' come from?', a: MC(c[1], BEEFP), steps: [c[0] + ': the ' + c[1].toLowerCase() + ' primal.'] }; }
    if (kind === 'where') { var w = R.pick([['Chuck', 'The shoulder'], ['Round', 'The rear leg'], ['Brisket', 'The lower chest'], ['Rib', 'The upper back, ribs 6 to 12'], ['Short loin', 'The middle of the back'], ['Flank', 'The belly, below the loin']]);
      return { q: 'Where on the steer is the ' + w[0].toLowerCase() + ' primal?', a: MC(w[1], ['The shoulder', 'The rear leg', 'The lower chest', 'The upper back, ribs 6 to 12', 'The middle of the back', 'The belly, below the loin']), steps: [w[0] + ': ' + w[1].toLowerCase() + '.'] }; }
    return bank(R, [
      ['Which is a pork primal?', 'Belly', ['Brisket', 'Flank', 'Round'], 'Pork: shoulder, loin, belly, leg.'],
      ['Ham comes from which pork primal?', 'The leg', ['The loin', 'The belly', 'The shoulder'], ''],
      ['Bacon is usually made from which pork primal?', 'The belly', ['The leg', 'The loin', 'The shoulder'], ''],
      ['A rack of lamb comes from which primal?', 'The rib (rack)', ['The leg', 'The shoulder', 'The shank'], ''],
      ['Pork chops usually come from which primal?', 'The loin', ['The belly', 'The leg', 'The shank'], ''],
      ['Boston butt comes from which pork primal?', 'The shoulder', ['The leg', 'The loin', 'The belly'], 'Despite the name.']
    ]);
  });

  G('cuprot.brines', function (R, ctx) {
    var kind = by(ctx, R.pick(['salt', 'bank']), R.pick(['salt', 'pct']), R.pick(['salt', 'pct', 'dry']));
    if (kind === 'salt') { var L = R.int(2, 16) / 2, p = R.pick([3, 4, 5, 6, 7, 8]); return { q: 'How many grams of salt for ' + T.num(L) + ' liter' + (L === 1 ? '' : 's') + ' (' + T.commas(L * 1000) + ' g) of water to make a ' + p + '% brine (by weight of the water)?', a: AX(L * 10 * p), unit: 'g', steps: ['$' + T.commas(L * 1000) + ' \\times ' + T.num(p / 100) + ' = ' + T.commas(L * 10 * p) + '$ g.'] }; }
    if (kind === 'pct') { var w = R.int(4, 40) * 100, pp = R.pick([3, 4, 5, 6, 8]); var sl = w * pp / 100; return { q: 'You dissolve ' + sl + ' g of salt in ' + T.commas(w) + ' g of water. What percent brine is that, by weight of the water?', a: PC(pp), steps: ['$' + sl + ' \\div ' + T.commas(w) + ' = ' + T.num(pp / 100) + ' = ' + pp + '\\%$.'] }; }
    if (kind === 'dry') { var m = R.int(4, 40) * 50; return { q: 'You dry-brine a ' + T.commas(m) + ' g pork roast with salt at 1% of its weight. How many grams of salt?', a: AX(m / 100), unit: 'g', steps: ['$' + T.commas(m) + ' \\times 0.01 = ' + fx(m / 100) + '$ g.'] }; }
    return bank(R, [
      ['Where should food brine or marinate?', 'In the refrigerator', ['On the counter', 'In a warm oven', 'Anywhere covered'], ''],
      ['Why weigh brine salt instead of using a cup?', 'Different salts weigh very differently by volume', ['Cups are unsanitary', 'Scales are faster always', 'Salt dissolves in cups'], ''],
      ['Can raw marinade be used as a sauce?', 'Only if boiled first; better, set some aside before it touches raw meat', ['Yes, always', 'Yes, if cold', 'Never, under any circumstances'], ''],
      ['What does a marinade mostly do?', 'Flavors the surface', ['Cooks the meat through', 'Seasons all the way to the center fast', 'Makes any cut tender'], ''],
      ['Why pat brined meat dry before cooking?', 'So the surface browns', ['To remove the salt taste', 'To cool it', 'It isn\'t needed'], '']
    ]);
  });

  G('cuprot.poultry', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'yield']), R.pick(['yield', 'bank']), R.pick(['yield', 'need', 'count']));
    if (kind === 'yield') { var ap = R.int(28, 60) / 10, y = R.int(60, 78); var ep = r2(ap * y / 100); return { q: 'A ' + ap + ' lb chicken gives ' + ep + ' lb of trimmed pieces. What is the yield percent?', a: PC(sg(100 * ep / ap, 3), 0.01), steps: ['$' + ep + ' \\div ' + ap + ' \\approx ' + sg(ep / ap, 3) + '$, about ' + sg(100 * ep / ap, 3) + '%.'] }; }
    if (kind === 'need') { var n = R.int(4, 30) * 2, pcs = 8; return { q: 'Each guest gets 2 pieces of an eight-piece chicken. How many whole chickens for ' + n + ' guests?', a: AX(Math.ceil(n * 2 / pcs)), steps: ['$' + n + ' \\times 2 = ' + n * 2 + '$ pieces.', '$' + n * 2 + ' \\div 8 = ' + fx(n * 2 / 8) + '$, so ' + Math.ceil(n * 2 / 8) + ' chickens.'] }; }
    if (kind === 'count') { var c = R.int(2, 12); return { q: 'How many pieces do you get from ' + c + ' chickens with the classic eight-piece cut?', a: AX(8 * c), steps: ['$8 \\times ' + c + ' = ' + 8 * c + '$.'] }; }
    return bank(R, [
      ['What are the eight pieces of a cut-up chicken?', 'Two each of drumsticks, thighs, wings and breasts', ['Four legs and four wings', 'Eight breast pieces', 'Two legs, two wings, four backs'], ''],
      ['How do you take off a leg?', 'Bend it out until the hip joint pops, then cut through the joint', ['Saw through the thigh bone', 'Pull it off by hand', 'Chop with a cleaver anywhere'], ''],
      ['Does USDA advise rinsing raw poultry?', 'No; it splashes germs around the kitchen', ['Yes, always', 'Only whole birds', 'Only in hot water'], ''],
      ['What is an airline breast?', 'A boneless breast with the first wing bone left on', ['A breast cut for flights', 'A breast with the skin removed', 'A breast pounded flat'], ''],
      ['What is spatchcocking?', 'Removing the backbone and pressing the bird flat', ['Stuffing the bird', 'Tying the legs', 'Brining overnight'], ''],
      ['What do you do with the back and wing tips?', 'Make stock', ['Throw them away', 'Grill them for service', 'Use them as garnish'], '']
    ]);
  });

  G('cuprot.fish', function (R, ctx) {
    var kind = by(ctx, R.pick(['fresh', 'fil']), R.pick(['yield', 'fresh', 'fil']), R.pick(['yield', 'need']));
    if (kind === 'yield') { var w = R.int(20, 80) / 10, y = R.int(40, 55); var f = r2(w * y / 100); return { q: 'A ' + w + ' lb whole salmon gives ' + f + ' lb of skinless fillet. What is the yield percent?', a: PC(sg(100 * f / w, 3), 0.01), steps: ['$' + f + ' \\div ' + w + ' \\approx ' + sg(f / w, 3) + '$, about ' + sg(100 * f / w, 3) + '%.'] }; }
    if (kind === 'need') { var por = R.int(4, 30) * 2, oz = R.pick([5, 6, 7, 8]), y2 = R.pick([40, 45, 50]); var lbs = por * oz / 16 / (y2 / 100); return { q: 'You need ' + por + ' portions of ' + oz + ' oz fillet. Whole fish yields ' + y2 + '% fillet. About how many pounds of whole fish should you buy?', a: A(lbs, 3, 0.02), unit: 'lb', steps: ['Fillet needed: $' + por + ' \\times ' + oz + ' = ' + por * oz + '$ oz $= ' + fx(por * oz / 16) + '$ lb.', 'Divide by the yield: $' + fx(por * oz / 16) + ' \\div ' + T.num(y2 / 100) + ' \\approx ' + sg(lbs, 3) + '$ lb.'] }; }
    if (kind === 'fil') { var it = R.pick([['salmon', 2], ['trout', 2], ['snapper', 2], ['sea bass', 2], ['sole', 4], ['flounder', 4], ['halibut', 4]]); return { q: 'How many fillets does a whole ' + it[0] + ' give?', a: MC(String(it[1]), ['1', '2', '4', '6']), steps: [(it[1] === 4 ? 'It is a flatfish: four fillets.' : 'It is a round fish: two fillets.')] }; }
    return which(R, 'Which is a sign of fresh fish?', ['A clean smell like the sea', 'Firm flesh that springs back', 'Bright, clear eyes', 'Red or pink gills', 'Shiny, moist skin'], ['A strong fishy smell', 'Cloudy, sunken eyes', 'Soft flesh that stays dented', 'Brown, dry gills', 'Gaps and browning on fillets'], function (c) { return c + ' is a sign of freshness.'; });
  });

  G('cuprot.shellfish', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'grp']), R.pick(['grp', 'bank']));
    if (kind === 'grp') { var it = R.pick([['shrimp', 'Crustacean'], ['lobster', 'Crustacean'], ['crab', 'Crustacean'], ['crawfish', 'Crustacean'], ['clam', 'Mollusk'], ['mussel', 'Mollusk'], ['oyster', 'Mollusk'], ['scallop', 'Mollusk'], ['squid', 'Mollusk']]); return { q: 'Is a ' + it[0] + ' a crustacean or a mollusk?', a: MC(it[1], ['Crustacean', 'Mollusk']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['A clam\'s shell is open and doesn\'t close when tapped. What do you do?', 'Throw it away', ['Cook it longer', 'Soak it in fresh water', 'Serve it raw'], 'It is probably dead.'],
      ['How long does the Food Code say to keep shellstock tags after the container is empty?', '90 days', ['7 days', '1 year', 'Until the end of the shift'], 'So an outbreak can be traced.'],
      ['How should live mussels be stored?', 'Cold, in a container that breathes, covered with a damp towel', ['In a sealed plastic bag', 'In a bowl of tap water', 'At room temperature'], ''],
      ['When are steamed mussels done?', 'When the shells open', ['After exactly 20 minutes', 'When they sink', 'When they turn black'], 'Discard any that stay shut.'],
      ['When is shrimp done?', 'When the flesh is pearly and opaque', ['When it is still translucent', 'When it floats', 'After 1 second'], ''],
      ['Which group is one of the nine major allergens?', 'Crustacean shellfish', ['All seafood', 'Only oysters', 'Only squid'], 'Mollusks are a separate group.'],
      ['What must a restaurant serving raw oysters post under the Food Code?', 'A consumer advisory', ['Nothing', 'The fisherman\'s name', 'A price warning'], '']
    ]);
  });

  G('cuprot.doneness', function (R, ctx) {
    var kind = by(ctx, R.pick(['pull', 'term']), R.pick(['pull', 'final']), R.pick(['pull', 'final', 'term']));
    if (kind === 'pull') { var tgt = R.pick([125, 130, 135, 140, 145, 150, 155]), rise = R.int(3, 12); return { q: 'You want a roast to finish at ' + tgt + '°F after resting, and expect it to rise ' + rise + '°F. At what temperature do you pull it from the oven?', a: AX(tgt - rise), unit: '°F', steps: ['$' + tgt + ' - ' + rise + ' = ' + (tgt - rise) + '$°F.'] }; }
    if (kind === 'final') { var p = R.int(115, 150), r = R.int(3, 12); return { q: 'A roast is pulled at ' + p + '°F and rises ' + r + '°F as it rests. What is its final center temperature?', a: AX(p + r), unit: '°F', steps: ['$' + p + ' + ' + r + ' = ' + (p + r) + '$°F.'] }; }
    var t = R.pick([[122, 'Rare'], [125, 'Rare'], [131, 'Medium-rare'], [134, 'Medium-rare'], [140, 'Medium'], [143, 'Medium'], [150, 'Medium-well'], [153, 'Medium-well'], [160, 'Well done'], [165, 'Well done']]);
    return { q: 'A steak rests at ' + t[0] + '°F in the center. Which doneness word do cooks use for that?', a: MC(t[1], ['Rare', 'Medium-rare', 'Medium', 'Medium-well', 'Well done']), steps: ['Rare 120°F to 125°F; medium-rare 130°F to 135°F; medium 135°F to 145°F; medium-well 145°F to 155°F; well done 155°F and up. USDA\'s safe minimum for whole cuts is 145°F with a 3-minute rest.'] };
  });

  G('cuprot.eggs', function (R, ctx) {
    return bank(R, [
      ['Which omelet is rolled, pale, and creamy inside with no browning?', 'The French omelet', ['The American omelet', 'A frittata', 'A Spanish tortilla'], ''],
      ['Which omelet is folded in half, filled and often lightly browned?', 'The American omelet', ['The French omelet', 'A soufflé', 'A poached egg'], ''],
      ['About what water temperature is right for poaching eggs?', 'About 180°F, barely simmering', ['A hard boil, 212°F', 'Warm tap water', '250°F'], ''],
      ['Why add a splash of vinegar to egg-poaching water?', 'It helps the white set quickly', ['It flavors the yolk', 'It makes the water boil', 'It keeps eggs white forever'], ''],
      ['To what temperature does USDA say egg dishes should be cooked?', '160°F', ['145°F', '120°F', '180°F'], ''],
      ['What makes eggs rubbery?', 'Too much heat', ['Too little salt', 'Fresh eggs', 'A nonstick pan'], 'Proteins overtighten and squeeze out water.'],
      ['Which eggs hold together best when poached?', 'Very fresh eggs', ['Old eggs', 'Frozen eggs', 'Hard-boiled eggs'], ''],
      ['How do restaurants hold poached eggs for service?', 'In ice water, then rewarm in hot water', ['In the steam table for hours', 'At room temperature', 'In the fryer'], ''],
      ['Which is a safer choice for runny eggs for an older adult or a pregnant guest?', 'Pasteurized eggs', ['Older eggs', 'Brown eggs', 'Larger eggs'], '']
    ]);
  });
