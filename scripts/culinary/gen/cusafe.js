  // ===== Food Safety and Sanitation (cusafe): facts from the FDA Food Code 2022, FDA and USDA FSIS only.
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function addDays(m, d, k) { d += k; while (d > MDAYS[m]) { d -= MDAYS[m]; m = (m + 1) % 12; } return [m, d]; }
  function dstr(md) { return MONTHS[md[0]] + ' ' + md[1]; }
  function clock(mins) { mins = ((mins % 1440) + 1440) % 1440; var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'p.m.' : 'a.m.'; var hh = h % 12 || 12; return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  var USDA = [['a whole chicken', 165], ['ground turkey', 165], ['chicken thighs', 165], ['stuffing cooked in a bird', 165], ['duck breast', 165], ['ground beef patties', 160], ['ground pork sausage', 160], ['ground lamb', 160], ['a frittata (egg dish)', 160], ['a beef steak', 145], ['pork chops', 145], ['a lamb roast', 145], ['a veal chop', 145], ['salmon fillet', 145], ['cod fillet', 145], ['reheated leftovers', 165], ['a meat casserole', 165], ['raw fresh ham', 145]];

  G('cusafe.hazards', function (R, ctx) {
    var kind = by(ctx, 'type', R.pick(['type', 'tcs']), R.pick(['type', 'tcs', 'need']));
    if (kind === 'type') { var it = R.pick([['A sliver of glass from a broken jar', 'Physical'], ['A fish bone in a "boneless" fillet', 'Physical'], ['A metal shaving from a can opener', 'Physical'], ['A bandage that fell into the salad', 'Physical'],
      ['Sanitizer splashed into a bowl of soup', 'Chemical'], ['Degreaser stored above the prep table dripping on food', 'Chemical'], ['Peanuts in a dish served to a guest with a peanut allergy', 'Chemical'], ['Pesticide residue on unwashed produce', 'Chemical'],
      ['Salmonella in undercooked chicken', 'Biological'], ['Norovirus spread by a sick worker', 'Biological'], ['Bacteria growing in rice left warm for hours', 'Biological'], ['Parasites in raw fish', 'Biological']]);
      return { q: 'What kind of hazard is this? ' + it[0] + '.', a: MC(it[1], ['Biological', 'Chemical', 'Physical', 'None, it is safe']), steps: [it[1] + ' hazard. The Food Code counts allergens as chemical hazards.'] }; }
    if (kind === 'tcs') return which(R, 'Which of these is a TCS food (needs time and temperature control for safety)?', ['Cooked rice', 'Cut melon', 'Sliced tomatoes', 'Cooked beans', 'Cut leafy greens', 'Milk', 'Raw chicken', 'Tofu', 'Cooked pasta', 'Sprouts'], ['Dry pasta, uncooked', 'Crackers', 'Flour', 'A whole uncut potato', 'Granulated sugar', 'Unopened canned soup', 'Honey', 'Dry beans', 'Bread'], function (c) { return c + ' is moist and supports germ growth, so the Food Code treats it as TCS food.'; });
    return bank(R, [
      ['Which of these do bacteria need to grow?', 'Warmth, moisture, food and time', ['Light and cold', 'Dryness and salt', 'Only sugar'], 'Take away any one and growth slows.'],
      ['Can you tell food is safe by its smell?', 'No; illness-causing germs usually don\'t change smell or look', ['Yes, always', 'Only for meat', 'Only for dairy'], 'Spoilage germs and illness germs are different groups.'],
      ['Which kind of hazard causes most foodborne illness?', 'Biological', ['Physical', 'Chemical', 'Electrical'], 'Bacteria, viruses and parasites.']
    ]);
  });

  G('cusafe.danger-zone', function (R, ctx) {
    var kind = by(ctx, R.pick(['nums', 'inout']), R.pick(['inout', 'nums', 'two']), R.pick(['inout', 'two', 'nums']));
    if (kind === 'inout') { var hot = R.coin(), t = hot ? R.int(110, 160) : R.int(30, 60); var inZone = t > 41 && t < 135;
      return { q: (hot ? 'A pan of soup in the steam table' : 'A container of chicken salad in the reach-in') + ' reads ' + t + '°F. By the FDA Food Code, is it in the temperature danger zone?',
        a: MC(inZone ? 'Yes' : 'No', ['Yes', 'No']), steps: ['The Food Code holds cold food at 41°F or below and hot food at 135°F or above.', t + '°F is ' + (inZone ? 'between those limits: in the danger zone.' : 'outside the zone.')] }; }
    if (kind === 'two') return bank(R, [
      ['How long does USDA say perishable food can sit out at room temperature?', 'No more than 2 hours (1 hour above 90°F)', ['4 hours', 'All day if covered', '30 minutes'], 'USDA consumer guidance.'],
      ['Why do the Food Code (41°F to 135°F) and USDA (40°F to 140°F) give different numbers?', 'They are different documents for different readers, restaurants and home cooks', ['One of them is wrong', 'USDA is for frozen food only', 'The Food Code is for Europe'], 'Both say keep food out of the middle.'],
      ['Does cold kill bacteria?', 'No, it slows them down', ['Yes, all of them', 'Only below 41°F', 'Only in the freezer'], 'That\'s why cold food still has time limits.']
    ]);
    return bank(R, [
      ['By the FDA Food Code, cold TCS food must be held at or below…', '41°F', ['45°F', '50°F', '32°F'], 'Cold holding: 41°F or below.'],
      ['By the FDA Food Code, hot TCS food must be held at or above…', '135°F', ['120°F', '165°F', '100°F'], 'Hot holding: 135°F or above.'],
      ['What range does USDA give home cooks as the "Danger Zone"?', '40°F to 140°F', ['0°F to 32°F', '140°F to 212°F', '50°F to 100°F'], 'USDA consumer guidance.'],
      ['What temperature should a home refrigerator be at or below, by USDA?', '40°F', ['50°F', '45°F', '32°F exactly'], 'And the freezer at 0°F.']
    ]);
  });

  G('cusafe.cooking-temps', function (R, ctx) {
    var kind = by(ctx, 'usda', R.pick(['usda', 'num']), R.pick(['num', 'code', 'done']));
    var f = R.pick(USDA);
    if (kind === 'usda') return { q: 'What is the USDA safe minimum internal temperature for ' + f[0] + '?', a: MC(f[1] + '°F', ['145°F', '155°F', '160°F', '165°F', '135°F']), steps: ['USDA: ' + f[0] + ', ' + f[1] + '°F' + (f[1] === 145 && !/salmon|cod/.test(f[0]) ? ' with a 3-minute rest.' : '.')] };
    if (kind === 'num') return { q: 'In °F, what is the USDA safe minimum internal temperature for ' + f[0] + '?', a: AX(f[1]), unit: '°F', steps: ['USDA: ' + f[1] + '°F.'] };
    if (kind === 'done') { var g = R.pick(USDA), t = g[1] + R.pick([-12, -8, -5, -3, 0, 2, 5]); var ok = t >= g[1];
      return { q: 'A thermometer in the thickest part of ' + g[0] + ' reads ' + t + '°F. Has it reached the USDA safe minimum?', a: MC(ok ? 'Yes' : 'No, keep cooking', ['Yes', 'No, keep cooking']), steps: ['The safe minimum is ' + g[1] + '°F; ' + t + '°F is ' + (ok ? 'at or above it.' : 'below it.')] }; }
    return bank(R, [
      ['By the FDA Food Code, ground beef in a restaurant is cooked to…', '155°F for 17 seconds', ['145°F for 15 seconds', '165°F for 1 minute', '130°F for 1 second'], 'Or another time-and-temperature pair in the code\'s table.'],
      ['By the FDA Food Code, poultry is cooked to…', '165°F for less than 1 second', ['145°F for 15 seconds', '155°F for 17 seconds', '140°F for 4 minutes'], 'Poultry and stuffed foods: 165°F.'],
      ['By the FDA Food Code, a fish fillet or a whole steak is cooked to…', '145°F for 15 seconds', ['165°F instantly', '155°F for 17 seconds', '120°F for 1 minute'], 'Intact meat and fish: 145°F for 15 seconds.'],
      ['Why must ground meat reach a higher temperature than a whole steak?', 'Grinding mixes surface germs into the middle', ['Ground meat is fattier', 'Ground meat is always older', 'It is only a taste preference'], 'On a whole steak, germs are mostly on the surface.'],
      ['Where do you put the thermometer?', 'In the thickest part, away from bone', ['Touching the bone', 'In the thinnest end', 'On the surface'], 'Bone conducts heat differently.']
    ]);
  });

  G('cusafe.cooling', function (R, ctx) {
    var kind = by(ctx, R.pick(['rule', 'pass']), R.pick(['pass', 'deadline']), R.pick(['pass', 'deadline', 'method']));
    if (kind === 'pass') { var start = R.int(16, 44) * 30, t70 = R.pick([60, 90, 105, 120, 135, 150, 180]), t41 = t70 + R.pick([120, 180, 210, 240, 270, 300]);
      var ok1 = t70 <= 120, ok2 = t41 <= 360;
      return { q: 'Cooked chili was 135°F at ' + clock(start) + '. It reached 70°F at ' + clock(start + t70) + ' and 41°F at ' + clock(start + t41) + '. Did it pass the Food Code\'s two-stage cooling rule?',
        a: MC(ok1 && ok2 ? 'Yes' : 'No', ['Yes', 'No']), steps: ['Stage 1: 135°F to 70°F took ' + t70 + ' minutes (limit 120): ' + (ok1 ? 'passed.' : 'failed.'), 'In all, 135°F to 41°F took ' + (t41 / 60) + ' hours (limit 6): ' + (ok2 ? 'passed.' : 'failed.')] }; }
    if (kind === 'deadline') { var st = R.int(20, 44) * 30, which70 = R.coin();
      return { q: 'Stock was 135°F at ' + clock(st) + '. By what time must it reach ' + (which70 ? '70°F' : '41°F, at the latest') + ' under the Food Code\'s cooling rule?',
        a: MC(clock(st + (which70 ? 120 : 360)), [clock(st + 120), clock(st + 240), clock(st + 360), clock(st + 480), clock(st + 60)]), steps: [which70 ? '135°F to 70°F within 2 hours.' : '135°F to 41°F within 6 hours in all (2 + 4).'] }; }
    if (kind === 'method') return which(R, 'Which of these helps cool a big batch of soup safely?', ['Divide it into shallow pans', 'Stir it in an ice-water bath', 'Use an ice wand', 'Add ice as part of the recipe\'s water', 'Use a blast chiller'], ['Cover the full stockpot tightly and put it in the walk-in', 'Leave it on the stove overnight', 'Put the hot pot on the floor', 'Wrap the pot in towels', 'Let it cool on the counter until morning'], function (c) { return c + ': it moves heat out faster (FDA Food Code 3-501.15).'; });
    return bank(R, [
      ['The first stage of the Food Code cooling rule is…', '135°F to 70°F within 2 hours', ['135°F to 41°F within 2 hours', '70°F to 41°F within 2 hours', '165°F to 135°F within 4 hours'], 'Then 70°F to 41°F within 4 more hours.'],
      ['The second stage of the Food Code cooling rule is…', '70°F to 41°F within 4 more hours', ['70°F to 41°F within 1 hour', '41°F to 0°F within 6 hours', '135°F to 70°F within 4 hours'], '6 hours in all.'],
      ['How long in all may cooling from 135°F to 41°F take, by the Food Code?', '6 hours', ['2 hours', '4 hours', '12 hours'], '2 hours plus 4 hours.'],
      ['Why is the first stage the stricter one?', 'Bacteria grow fastest in the upper-middle temperatures', ['It is easier to cool hot food', 'Cold food spoils faster', 'There is no reason'], 'Get through that range quickly.']
    ]);
  });

  G('cusafe.holding-dating', function (R, ctx) {
    var kind = by(ctx, R.pick(['rule', 'date']), R.pick(['date', 'rule']), R.pick(['date', 'reheat', 'fifo']));
    if (kind === 'date') { var m = R.int(0, 11), d = R.int(1, MDAYS[m]), food = R.pick(['Chicken salad', 'Cooked rice', 'Sliced ham', 'Potato salad', 'Hummus', 'Cut melon', 'Cooked beans', 'Tuna salad']);
      var last = addDays(m, d, 6);
      return { q: food + ' is made on ' + dstr([m, d]) + ' and held at 41°F. Under the Food Code\'s 7-day date marking rule (the day it was made is day 1), what is the last day it may be used?',
        a: MC(dstr(last), [dstr(addDays(m, d, 5)), dstr(last), dstr(addDays(m, d, 7)), dstr(addDays(m, d, 3)), dstr(addDays(m, d, 10))]), steps: ['Day 1 is ' + dstr([m, d]) + '; day 7 is ' + dstr(last) + '.'] }; }
    if (kind === 'reheat') return bank(R, [
      ['Food cooked and cooled in the kitchen is reheated for hot holding to…', '165°F for 15 seconds, within 2 hours', ['135°F for 1 minute, within 4 hours', '145°F, any time', '120°F, within 6 hours'], 'Food Code reheating rule.'],
      ['Can you heat cold soup in the steam table?', 'No; reheat it first, then hold it in the steam table', ['Yes, if you stir it', 'Yes, overnight', 'Only for vegetable soup'], 'Steam tables hold hot food; they don\'t heat cold food fast enough.']
    ]);
    if (kind === 'fifo') return bank(R, [
      ['What does FIFO mean?', 'First in, first out', ['Food in, food out', 'Freeze it, fry it once', 'Fill it full only'], 'Use older stock first.'],
      ['Where do you put a new delivery of milk?', 'Behind or under the older milk', ['In front of the older milk', 'On top of the older milk', 'Anywhere'], 'So the older is used first.'],
      ['What goes on a food label in a commercial kitchen?', 'What it is and the date (made and use-by)', ['Only the price', 'Only the cook\'s name', 'Nothing if it is in a clear container'], 'Many kitchens also add initials.']
    ]);
    return bank(R, [
      ['Hot holding temperature by the Food Code:', '135°F or above', ['120°F or above', '100°F or above', '165°F only'], ''],
      ['Cold holding temperature by the Food Code:', '41°F or below', ['50°F or below', '45°F or below', '60°F or below'], ''],
      ['How long can ready-to-eat TCS food be kept at 41°F under the Food Code\'s date marking rule?', '7 days, counting the day it was made as day 1', ['30 days', '14 days', '1 day'], ''],
      ['Why does cold ready-to-eat food have a time limit?', 'Some germs, such as Listeria, can grow slowly even in the cold', ['It loses all its vitamins', 'The law dislikes leftovers', 'It freezes'], '']
    ]);
  });

  G('cusafe.cross-contamination', function (R, ctx) {
    var ORDER = [['washed lettuce', 0], ['cooked rice', 0], ['sliced cheese', 0], ['cut fruit', 0], ['a tray of cooked lasagna', 0], ['raw salmon', 1], ['raw cod', 1], ['raw shrimp', 1], ['raw beef steaks', 2], ['raw pork chops', 2], ['a raw lamb roast', 2], ['raw ground beef', 3], ['raw ground pork', 3], ['raw pork sausage', 3], ['raw chicken breasts', 4], ['a raw whole turkey', 4], ['raw ground chicken', 4]];
    var LV = ['ready-to-eat (top)', 'fish, 145°F', 'whole cuts of beef and pork, 145°F', 'ground meat, 155°F (Food Code)', 'poultry, 165°F (bottom)'];
    var kind = by(ctx, R.pick(['lower', 'bank', 'bottom']), R.pick(['lower', 'bottom']), R.pick(['lower', 'bottom', 'bank']));
    if (kind === 'lower') { var p = R.sample(ORDER, 2); while (p[0][1] === p[1][1]) p = R.sample(ORDER, 2); var lo = p[0][1] > p[1][1] ? p[0] : p[1];
      return { q: 'In the refrigerator, which goes on the LOWER shelf: ' + p[0][0] + ' or ' + p[1][0] + '?', a: MC(lo[0], [p[0][0], p[1][0]]), steps: ['Store top to bottom by the temperature each must be cooked to; the one cooked hottest goes lowest.', p[0][0] + ': ' + LV[p[0][1]] + '. ' + p[1][0] + ': ' + LV[p[1][1]] + '.'] }; }
    if (kind === 'bottom') { var f = R.pick(ORDER); return { q: 'In a refrigerator stored by the safe order, which group does ' + f[0] + ' belong to?', a: MC(LV[f[1]], LV), steps: ['Top to bottom: ready-to-eat, fish, whole cuts, ground meat, poultry.'] }; }
    return bank(R, [
      ['You used tongs to put raw chicken on the grill. What do you use to take it off?', 'Clean tongs', ['The same tongs', 'Your hands', 'A towel'], 'Raw juices are on the first tongs.'],
      ['Why store ready-to-eat food above raw meat?', 'So raw juices can\'t drip onto food that won\'t be cooked', ['Cold air rises', 'It looks neater', 'Raw meat needs light'], 'Drips only fall on food that will be cooked hotter.'],
      ['Which is a way to stop cross-contamination?', 'Separate boards for raw meat and produce', ['Rinsing raw chicken in the sink', 'One towel for everything', 'Tasting raw batter'], 'Or clean and sanitize between uses.'],
      ['Should you rinse raw chicken before cooking?', 'No; USDA advises against it because water spreads germs', ['Yes, always', 'Only with hot water', 'Only for whole birds'], 'Cooking to 165°F is what kills germs.']
    ]);
  });

  G('cusafe.allergens', function (R, ctx) {
    var BIG = ['milk', 'eggs', 'fish', 'crustacean shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans', 'sesame'];
    var NOT = ['corn', 'rice', 'potatoes', 'carrots', 'apples', 'chicken', 'beef', 'oats', 'tomatoes', 'garlic', 'onions', 'bananas'];
    var kind = by(ctx, 'which', R.pick(['which', 'bank']), R.pick(['which', 'which', 'bank', 'bank', 'count']));
    if (kind === 'which') return which(R, 'Which of these is one of the nine major food allergens named by U.S. law?', BIG, NOT, function (c) { return c.charAt(0).toUpperCase() + c.slice(1) + ' is one of the nine: milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame.'; });
    if (kind === 'count') return { q: 'How many major food allergens does U.S. law name today?', a: AX(9), steps: ['Nine, since sesame was added on January 1, 2023.'] };
    return bank(R, [
      ['Which allergen was added to the U.S. list on January 1, 2023?', 'Sesame', ['Mustard', 'Corn', 'Celery'], 'By the FASTER Act of 2021.'],
      ['Does cooking destroy food allergens?', 'No', ['Yes, at 165°F', 'Yes, if boiled', 'Only for nuts'], 'Keeping them out is the only protection.'],
      ['A guest allergic to shrimp orders fries. The fryer oil was used for shrimp. Is it safe?', 'No; the oil carries the allergen', ['Yes, oil is hot enough', 'Yes, if the shrimp were removed', 'Yes, fries are vegetables'], 'Use a separate fryer.'],
      ['The cook picks the walnuts off a salad for a guest with a tree-nut allergy. Is it safe?', 'No; remake it with clean tools', ['Yes, if no nuts are visible', 'Yes, if rinsed', 'Yes, walnuts are mild'], 'Traces remain.'],
      ['A guest asks if a sauce contains peanuts and you don\'t know. What do you do?', 'Say you don\'t know and find out from the chef or label', ['Guess no', 'Guess yes', 'Change the subject'], 'Never guess about allergens.']
    ]);
  });

  G('cusafe.hygiene', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'when']), R.pick(['when', 'bank']));
    if (kind === 'when') return which(R, 'When must a food worker wash their hands?', ['After handling raw chicken', 'After using the restroom', 'After touching their face or hair', 'After taking out the trash', 'Before putting on gloves', 'After handling money or a phone', 'When starting a shift'], ['Only at the end of the shift', 'Only if hands look dirty', 'Only before eating lunch', 'Never, if wearing gloves'], function (c) { return c + ': yes, by the Food Code.'; });
    return bank(R, [
      ['How long should you scrub when washing hands?', 'At least 20 seconds in all', ['3 seconds', '1 minute is required', 'Just a rinse is fine'], 'Soap, warm water, backs, between fingers, under nails.'],
      ['Do gloves replace handwashing?', 'No; wash before putting them on', ['Yes', 'Only for raw meat', 'Only in summer'], 'Dirty hands make dirty gloves.'],
      ['When should you change gloves?', 'When they tear, when you switch tasks, and after raw meat', ['Once a day', 'Only when they look dirty', 'Never during a shift'], ''],
      ['A cook has vomiting and diarrhea. Under the Food Code, should they work with food?', 'No', ['Yes, with gloves', 'Yes, if they feel better by noon', 'Yes, on the cold station only'], 'Illnesses such as norovirus spread through food.'],
      ['Can bare hands touch ready-to-eat food in a restaurant under the Food Code?', 'No; use gloves, tongs or deli paper', ['Yes, if washed', 'Yes, for bread only', 'Yes, always'], ''],
      ['How should a cut on a cook\'s finger be handled at work?', 'Covered with a bandage and a glove', ['Left open to heal', 'Covered with tape only', 'Ignored'], '']
    ]);
  });

  G('cusafe.clean-sanitize', function (R, ctx) {
    var kind = by(ctx, 'bank', R.pick(['bank', 'order']), R.pick(['order', 'bank']));
    if (kind === 'order') { var steps = ['wash', 'rinse', 'sanitize', 'air-dry']; var k = R.int(0, 3);
      return { q: 'In a three-compartment sink, what is step ' + (k + 1) + ' of washing dishes (after scraping)?', a: MC(steps[k], steps.concat(['towel-dry'])), steps: ['Wash, rinse, sanitize, then air-dry.'] }; }
    return bank(R, [
      ['What is the difference between cleaning and sanitizing?', 'Cleaning removes dirt; sanitizing reduces germs on a clean surface', ['They are the same', 'Sanitizing removes dirt; cleaning kills germs', 'Cleaning is only for floors'], 'Clean first, then sanitize.'],
      ['How do you know how strong to mix a sanitizer?', 'Follow its label and check with the test strips made for it', ['Add extra to be safe', 'Smell it', 'Use any amount'], 'The label also gives the contact time.'],
      ['Why rinse dishes between washing and sanitizing?', 'Soap left on can weaken some sanitizers', ['To make them shine', 'It saves sanitizer', 'It\'s not needed'], ''],
      ['How should sanitized dishes dry?', 'In the air', ['With a clean towel', 'With a paper towel', 'In the oven'], 'Towels can put germs back.'],
      ['Is it safe to mix bleach with an ammonia cleaner?', 'No; it gives off harmful gases', ['Yes, it cleans better', 'Yes, in small amounts', 'Only outdoors'], 'Never mix cleaning chemicals.'],
      ['Where are cleaning chemicals stored?', 'Below and away from food, in labeled containers', ['Above the prep table', 'Next to the spices', 'In unlabeled spray bottles'], ''],
      ['Why doesn\'t spraying sanitizer on a dirty board work well?', 'Food and grease shield germs and use up some sanitizers', ['Sanitizer only works on metal', 'Boards can\'t be sanitized', 'It works fine'], 'Clean first.']
    ]);
  });

  G('cusafe.haccp', function (R, ctx) {
    var P7 = ['Analyze hazards', 'Find critical control points', 'Set critical limits', 'Monitor', 'Take corrective actions', 'Verify', 'Keep records'];
    var kind = by(ctx, R.pick(['what', 'ccp']), R.pick(['order', 'ccp', 'limit']), R.pick(['order', 'ccp', 'limit', 'corr']));
    if (kind === 'order') { var k = R.int(0, 6); return { q: 'In the seven HACCP principles, what is principle ' + (k + 1) + '?', a: MC(P7[k], P7), steps: ['1 analyze hazards, 2 find CCPs, 3 set critical limits, 4 monitor, 5 corrective actions, 6 verify, 7 records.'] }; }
    if (kind === 'ccp') return which(R, 'Which step is usually a critical control point (CCP) for chicken soup?', ['Cooking the chicken to 165°F', 'Cooling the soup', 'Reheating the soup for service', 'Receiving the raw chicken cold'], ['Chopping the carrots', 'Choosing the bowl', 'Writing the menu', 'Washing the ladle'], function (c) { return c + ': a step where control is essential to stop a hazard.'; });
    if (kind === 'limit') return bank(R, [
      ['What is a critical limit for cooking chicken?', '165°F', ['145°F', '120°F', 'Until golden brown'], 'A measurable limit.'],
      ['What is a critical limit for cooling (first stage)?', '135°F to 70°F within 2 hours', ['Overnight in the walk-in', 'Until it feels cool', '135°F to 41°F in 1 hour'], ''],
      ['Which is a good critical limit?', 'A temperature and a time you can measure', ['"Cook until it looks done"', '"Cool it soon"', '"Use good judgment"'], 'Limits must be measurable.']
    ]);
    if (kind === 'corr') return { q: 'Soup was 135°F at noon and 82°F at 2:00 p.m. What is the corrective action under the Food Code?', a: MC('Reheat to 165°F and start cooling again, or discard', ['Reheat to 165°F and start cooling again, or discard', 'Keep cooling; it will catch up', 'Serve it right away', 'Put it in the freezer and forget it']), steps: ['Stage 1 (70°F within 2 hours) was missed, so the code calls for reheating and recooling, or discarding.'] };
    return bank(R, [
      ['What does HACCP stand for?', 'Hazard Analysis and Critical Control Points', ['Health And Cleaning Compliance Plan', 'Hot And Cold Cooking Procedure', 'Hazard Avoidance in Commercial Cooking Practice'], ''],
      ['HACCP began with food for which program in the 1960s?', 'The U.S. space program', ['School lunches', 'The Olympics', 'Railroads'], ''],
      ['Which restaurant process requires a HACCP plan under the Food Code?', 'Reduced-oxygen packaging, such as sous vide', ['Making toast', 'Washing lettuce', 'Serving coffee'], 'Also curing and some other special processes.']
    ]);
  });
