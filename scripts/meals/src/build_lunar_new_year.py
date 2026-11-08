#!/usr/bin/env python3
"""Builds data/meals/recipes/lunar-new-year.json: the Lunar New Year collection at /meal-prep/lunar-new-year/.

Run:  python3 scripts/meals/src/build_lunar_new_year.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds
  recipes     the NEW recipes written for this collection (same fields as build_recipes.py; collection='lunar-new-year')
  collection  the page's plan: courses that mix these with recipes already in Meal Prep (by id), the numbers for the
              dumpling-party planner, the next few New Year dates, and meta for the recipe pages.

Food safety comes from USDA FSIS and FDA (ground pork 160 °F; poultry 165 °F; fish 145 °F or opaque flesh that separates
with a fork; leftovers within 2 hours) and, for frying, the Los Angeles Fire Department's cooking-safety advice (stay with
hot oil; smother a pan fire with a lid and turn off the burner; never use water). The food meanings are the widely
documented ones (Grokipedia articles; Academy of Nutrition and Dietetics), told as customs that vary by family and region.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

SLUG = 'lunar-new-year'
T_PORK = ('ground pork', 160, 0)
T_CHICKEN = ('whole chicken', 165, 0)
T_FISH = ('fish', 145, 0)
FRY = ('Fry safely: use a heavy pot no more than one-third full of oil, stay with it the whole time, and slide food in gently away from you. '
       'If the oil ever catches fire, slide a lid over the pot and turn off the burner; never use water (Los Angeles Fire Department).')
CHEWY = 'Glutinous rice is very sticky and chewy. Cut it into small pieces for young children, and eat slowly.'
LEFT = ('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat to 165°F.', 'lunch')

RECIPES = []


def R(**kw):
    kw.setdefault('collection', SLUG)
    RECIPES.append(kw)


# =====================================================================  DUMPLINGS
R(id='pork-cabbage-dumplings', name='Pork and Napa Cabbage Dumplings (Jiaozi)', emoji='🥟', servings=6, serving_size='about 8 dumplings',
  meal=['dinner'], protein='pork', method=['stovetop'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly'], prep=75, cook=15,
  equipment=['large bowl', 'colander', 'clean kitchen towel', 'baking sheets dusted with flour', 'large pot (to boil) or a nonstick skillet with a lid (for potstickers)', 'slotted spoon', 'food thermometer'],
  summary='Juicy pork and cabbage dumplings, folded together around the table and boiled or pan-fried as potstickers. In northern China they are the dish of New Year’s Eve.',
  ingredients='''
1 lb napa-cabbage | about half a head, finely chopped
1 tsp salt | to draw water from the cabbage
1 lb ground-pork
4 each green-onions | finely chopped
1 tbsp ginger | grated
2 clove garlic | grated
2 tbsp low-sodium-soy-sauce
1 tbsp sesame-oil
1/4 tsp black-pepper | or white pepper
2 tbsp chicken-broth | or water, for juiciness
48 each dumpling-wrappers | round, thawed if frozen
For potstickers:
?2 tbsp canola-oil
''',
  steps=[
    'Toss the chopped cabbage with the salt and let it sit 15 minutes. Squeeze it hard in a towel, a handful at a time, to wring out as much water as you can. Dry cabbage keeps the filling from going soggy.',
    'Mix the pork, cabbage, green onions, ginger, garlic, soy sauce, sesame oil, pepper and broth, stirring in one direction for a minute until sticky. Wash your hands and anything the raw pork touched.',
    'Fold (see the folding guide on the Lunar New Year page): put a scant tablespoon of filling in the center of a wrapper, wet half the edge with water, fold it into a half moon and pinch the top. Make 3 or 4 pleats along one side, pressing each against the flat side, and seal well. Set them on the floured sheets, not touching. Keep unused wrappers covered.',
    'To boil: bring a big pot of water to a rolling boil. Add 12 to 15 dumplings and stir gently so they don’t stick. When the water returns to a boil, add 1 cup cold water; do this twice more. When they float, puff and the wrappers turn glossy, about 6 to 8 minutes, they’re done. Lift one out and cut it open: the pork should be no longer pink and read 160°F.',
    'For potstickers: heat 1 tablespoon oil in the skillet over medium-high. Set the dumplings in flat side down and fry 2 minutes until the bottoms are golden. Add ⅓ cup water, cover right away (it spatters), and steam 6 to 8 minutes, until the water is gone and the filling reaches 160°F. Uncover and fry 1 more minute to recrisp.',
    'Serve hot with dumpling dipping sauce.',
  ],
  safety=[T_PORK],
  make_ahead='Make the filling the day before and keep it cold. Fold dumplings a few hours ahead and keep them refrigerated on the trays, covered, or freeze them.',
  freezer=(True, 'Freeze folded, uncooked dumplings on the floured tray until hard, then bag them, up to 3 months. Cook from frozen: boil 2 to 3 minutes longer, or steam 2 to 3 minutes longer as potstickers, until 160°F inside.'),
  leftovers=('Refrigerate cooked dumplings within 2 hours and eat within 3 to 4 days. Pan-fry leftovers until crisp and heated to 165°F.', 'lunch'),
  kids='Folding is the family part: kids as young as five can fill and pinch half moons. Little hands do best with the simple fold, no pleats.',
  swaps={'chicken': 'Use ground chicken or turkey; cook to 165°F.', 'shrimp': 'Use half pork and half chopped raw shrimp (adds shellfish).', 'homemade_wrappers': 'Make wrappers: stir 2 cups flour with about ¾ cup water to a firm dough, rest 30 minutes, roll into a rope, cut 24 pieces, and roll each into a 3½-inch circle. Double for this recipe.'},
  prep_day=dict(ahead='Make the filling; fold and freeze dumplings ahead.', station='stove', oven_f=None, active=75, keeps_days=3),
  pairs=['dumpling-dipping-sauce', 'vegetable-dumplings'])

R(id='vegetable-dumplings', name='Vegetable and Tofu Dumplings', emoji='🥬', servings=6, serving_size='about 8 dumplings',
  meal=['dinner'], protein='vegetarian', method=['stovetop'], tags=['freezer-friendly', 'make-ahead'], prep=75, cook=15,
  equipment=['large skillet', 'large bowl', 'clean kitchen towel', 'floured baking sheets', 'large pot or nonstick skillet with a lid', 'slotted spoon'],
  summary='A meatless filling of napa cabbage, mushrooms, carrots, tofu and rice noodles, seasoned with ginger and sesame. Most families make a vegetable batch alongside the pork one.',
  ingredients='''
1 lb napa-cabbage | about half a head, finely chopped
1 tsp salt | to draw water from the cabbage
1 tbsp canola-oil
8 oz mushrooms | finely chopped
2 each carrot | finely grated
14 oz tofu | firm, pressed and crumbled
2 oz rice-noodles | thin, soaked and chopped (optional but traditional)
4 each green-onions | chopped
1 tbsp ginger | grated
3 tbsp low-sodium-soy-sauce
1 tbsp sesame-oil
1/4 tsp black-pepper
48 each dumpling-wrappers | round
''',
  steps=[
    'Salt the cabbage, wait 15 minutes, and squeeze it very dry in a towel.',
    'Heat the oil and cook the mushrooms and carrots until their liquid cooks off, 6 to 8 minutes. Cool.',
    'Mix the cabbage, mushrooms, carrots, tofu, noodles, green onions, ginger, soy sauce, sesame oil and pepper.',
    'Fold, then boil or pan-fry exactly as for the pork dumplings. These are done when the wrappers are tender and the filling is steaming hot, 5 to 6 minutes of boiling.',
  ],
  safety=[],
  make_ahead='Make the filling a day ahead. Fold and freeze dumplings up to 3 months.',
  freezer=(True, 'Freeze uncooked dumplings on a tray, then bag them, up to 3 months; cook from frozen, adding 2 to 3 minutes.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Pan-fry to reheat.', 'lunch'),
  kids='Kids can stir the filling and fold dumplings.',
  swaps={'egg': 'Scramble 2 eggs, chop and mix in for a richer filling (adds eggs).', 'gluten_free': 'Use rice-paper or gluten-free wrappers and tamari.'},
  prep_day=dict(ahead='Make the filling; fold and freeze dumplings ahead.', station='stove', oven_f=None, active=75, keeps_days=3),
  pairs=['dumpling-dipping-sauce', 'pork-cabbage-dumplings'])

R(id='dumpling-dipping-sauce', name='Dumpling Dipping Sauce', emoji='🥢', servings=8, serving_size='about 2 tablespoons',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['quick', 'make-ahead'], prep=5, cook=0,
  equipment=['small bowl or jar'],
  summary='Soy sauce, vinegar, a little sesame oil, ginger and garlic, with chili flakes if you like heat. Everyone mixes their own dish to taste.',
  ingredients='''
1/2 cup low-sodium-soy-sauce
1/4 cup rice-vinegar | or black vinegar
2 tbsp water
1 tbsp sesame-oil
1 tsp sugar
1 tbsp ginger | cut in fine shreds
1 clove garlic | grated
?1 tsp red-pepper-flakes | or chili oil
1 each green-onions | sliced
''',
  steps=[
    'Stir the soy sauce, vinegar, water, sesame oil and sugar until the sugar dissolves.',
    'Add the ginger, garlic, chili flakes and green onion. Let it stand 10 minutes. Serve in little dishes.',
  ],
  safety=[],
  make_ahead='Mix up to 3 days ahead (add the green onion just before serving).',
  freezer=(False, ''),
  leftovers=('Keep covered in the refrigerator up to 1 week.', None),
  kids='Kids can mix their own: more vinegar, less soy, no chili.',
  swaps={'gluten_free': 'Use tamari.'},
  prep_day=None,
  pairs=['pork-cabbage-dumplings', 'vegetable-spring-rolls'])

# =====================================================================  NOODLES, FISH AND CHICKEN
R(id='longevity-noodles', name='Longevity Noodles', emoji='🍜', servings=6, serving_size='about 1½ cups',
  meal=['dinner', 'side'], protein='vegetarian', method=['stovetop'], tags=['quick'], prep=15, cook=15,
  equipment=['large pot', 'wok or large skillet', 'tongs'],
  summary='Long wheat noodles stir-fried with mushrooms, cabbage and green onions in a savory soy sauce. The noodles stay uncut: long strands stand for a long life.',
  ingredients='''
12 oz chinese-wheat-noodles | dried, the longest you can find
2 tbsp canola-oil
8 oz mushrooms | sliced (shiitake if you can)
3 cup napa-cabbage | shredded, or bok choy
1 each carrot | cut in thin matchsticks
2 clove garlic | minced
1 tbsp ginger | minced
6 each green-onions | cut in 2-inch lengths
Sauce:
3 tbsp low-sodium-soy-sauce
1 tbsp hoisin-sauce
1 tbsp sesame-oil
1 tsp sugar
2 tbsp water
''',
  steps=[
    'Cook the noodles as the package says, until just tender. Drain, rinse briefly with cold water so they don’t stick, and toss with a few drops of the sesame oil. Don’t cut or break them.',
    'Stir the sauce ingredients together.',
    'Heat the oil in the wok over high heat. Stir-fry the mushrooms 3 minutes, then the cabbage and carrot 2 minutes, then the garlic, ginger and green onions 30 seconds.',
    'Add the noodles and sauce and toss with tongs, lifting high, until hot and evenly coated, 2 minutes. Serve the long strands piled on a platter.',
  ],
  safety=[],
  make_ahead='Cut the vegetables and mix the sauce a day ahead.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can count who has the longest noodle.',
  swaps={'chicken': 'Stir-fry ¾ lb thin-sliced chicken first, to 165°F, and take it out; add it back with the noodles.', 'gluten_free': 'Use rice noodles and tamari; check the hoisin label.'},
  prep_day=None,
  pairs=['steamed-whole-fish', 'garlic-stir-fried-lettuce'])


R(id='steamed-whole-fish', name='Steamed Whole Fish with Ginger and Scallions', emoji='🐟', servings=4, serving_size='about ¼ of the fish',
  meal=['dinner'], protein='fish', method=['stovetop'], tags=['quick'], prep=15, cook=15,
  equipment=['wok or wide pot with a lid', 'steaming rack, and a heatproof plate that fits inside with room around it', 'small saucepan', 'food thermometer'],
  summary='A whole fish steamed over ginger, topped with fresh scallions and cilantro, and finished with sizzling oil and soy sauce. The word for fish sounds like the word for “surplus,” so it’s served whole for a year of plenty.',
  ingredients='''
1 each whole-fish | 1½ lb, scaled and cleaned, head and tail on
1 piece ginger | 2-inch piece, half sliced thin and half cut in fine shreds
6 each green-onions | 2 cut in 3-inch lengths, 4 cut in fine shreds
1/4 tsp salt
1/4 cup cilantro | sprigs
3 tbsp low-sodium-soy-sauce
1 tbsp water
1 tsp sugar
3 tbsp canola-oil
''',
  steps=[
    'Rinse the fish inside and out under cold water and pat it dry. Cut 3 diagonal slashes, down to the bone, on each side so it cooks evenly. Rub with the salt.',
    'Lay the ginger slices and the 3-inch green onion pieces on the plate and set the fish on top; tuck a few slices inside the belly. Bring 2 inches of water to a boil in the wok under the rack.',
    'Set the plate on the rack, cover, and steam over high heat 10 to 14 minutes for a 1½-lb fish (about 8 minutes per inch at the thickest part). It’s done when the flesh at the thickest slash is opaque and flakes easily from the bone, 145°F on a thermometer (FDA). Lift the plate out carefully with a towel; the steam is very hot.',
    'Pour off the steaming liquid and discard the cooked onion and ginger slices. Heat the soy sauce, water and sugar until the sugar dissolves and pour it around the fish. Pile the shredded ginger, shredded green onions and cilantro on top.',
    'Heat the oil in the small saucepan until it shimmers. Standing back, pour it slowly over the green onions and ginger; it will sizzle and spit a little. Serve right away.',
    'At the table, lift the top fillet off in pieces, then pull out the backbone in one piece to reach the bottom fillet, rather than flipping the fish (many families consider flipping it unlucky). Watch for small bones.',
  ],
  safety=[T_FISH],
  make_ahead='Shred the ginger and green onions a few hours ahead and keep them cold.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; eat within 1 to 2 days. Many families leave a little uneaten on purpose, for “surplus every year”; refrigerate it promptly.', None),
  kids='Kids can pick the cilantro sprigs and scatter the scallion shreds. A grown-up handles the hot oil.',
  swaps={'fillets': 'Use 1½ lb thick white fish fillets; steam 6 to 8 minutes, to 145°F.', 'gluten_free': 'Use tamari.'},
  prep_day=None,
  pairs=['longevity-noodles', 'garlic-stir-fried-lettuce'])

R(id='white-cut-chicken', name='White Cut Chicken with Ginger-Scallion Sauce', emoji='🐔', servings=6, serving_size='about ⅙ of the chicken, with sauce',
  meal=['dinner'], protein='chicken', method=['stovetop', 'one-pot'], tags=['make-ahead'], prep=20, cook=50, inactive=20,
  equipment=['large stockpot that holds the chicken covered with water', 'large bowl of ice water', 'tongs', 'food thermometer', 'cleaver or sturdy knife', 'small saucepan'],
  summary='A whole chicken poached gently until silky, chilled in ice water, cut into pieces and served with a fragrant ginger and scallion oil. Served whole on the table, it stands for family togetherness.',
  ingredients='''
1 each whole-chicken | about 4 lb
For the poaching water (mostly not eaten):
^1 piece ginger | 2-inch piece, sliced
^4 each green-onions | in 3-inch lengths
^1 tbsp salt
Ginger-scallion sauce:
1/2 cup green-onions | finely chopped
3 tbsp ginger | finely grated
1/2 tsp salt
1/3 cup canola-oil
1 tsp sesame-oil
''',
  steps=[
    'Take the giblets out of the chicken. Bring enough water to cover it to a boil in the stockpot with the ginger slices, green onions and salt.',
    'Holding the chicken by the wings with tongs, lower it in, lift it out to drain the hot water from the cavity, and lower it again; do this twice so the inside heats evenly. Then submerge it, breast side down.',
    'When the water returns to a gentle simmer, turn the heat to low and keep it just below a simmer, small bubbles only, for 40 to 50 minutes. Check the thickest part of the thigh and breast with a food thermometer: every spot must reach 165°F (USDA). If not, keep poaching and check every 5 minutes.',
    'Lift the chicken into the ice water and chill 15 to 20 minutes; this tightens the skin and gives it its silky bite. Drain, brush with sesame oil, and refrigerate if not serving soon. Save the poaching liquid as broth.',
    'For the sauce, put the chopped green onions, grated ginger and salt in a heatproof bowl. Heat the oil until it shimmers and pour it over carefully; it will sizzle. Stir.',
    'Cut the chicken into pieces with a cleaver: legs, wings, then the breast through the bone into strips. Arrange it as a whole bird on the platter and serve at room temperature with the sauce.',
  ],
  safety=[T_CHICKEN],
  make_ahead='Poach the chicken in the morning and refrigerate it; serve within 2 hours of taking it out. The sauce keeps 3 days.',
  freezer=(True, 'Freeze leftover meat off the bone up to 3 months; freeze the broth too.'),
  leftovers=LEFT,
  kids='Kids can chop green onions with a kid-safe knife.',
  swaps={'parts': 'Poach 3 lb bone-in thighs and breasts instead: about 25 to 30 minutes at a bare simmer, to 165°F.'},
  prep_day=dict(ahead='Poach the chicken in the morning.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=['longevity-noodles', 'garlic-stir-fried-lettuce'])

R(id='lions-head-meatballs', name='Lion’s Head Meatballs with Napa Cabbage', emoji='🦁', servings=6, serving_size='1 large meatball with cabbage and broth',
  meal=['dinner'], protein='pork', method=['stovetop', 'one-pot'], tags=['make-ahead', 'freezer-friendly'], prep=25, cook=50,
  equipment=['large bowl', 'large skillet', 'Dutch oven or wide pot with a lid', 'food thermometer'],
  summary='Big, tender pork meatballs browned and then braised on a bed of napa cabbage. A dish from eastern China, often served at family celebrations; the round shape stands for reunion.',
  ingredients='''
1 1/2 lb ground-pork
1/2 cup water-chestnuts | finely chopped (from a can)
4 each green-onions | finely chopped
1 tbsp ginger | grated
1 each eggs
2 tbsp low-sodium-soy-sauce
1 tbsp cornstarch
1 tsp sugar
1/2 tsp salt
2 tbsp canola-oil
2 lb napa-cabbage | about 1 head, cut in 2-inch pieces
2 cup chicken-broth | low-sodium
1 tbsp low-sodium-soy-sauce | for the braise
''',
  steps=[
    'Mix the pork, water chestnuts, green onions, ginger, egg, 2 tablespoons soy sauce, cornstarch, sugar and salt, stirring in one direction until sticky. Wet your hands and shape 6 large balls, tossing each from hand to hand to firm it.',
    'Heat the oil in the skillet over medium heat and brown the meatballs on all sides, about 8 minutes. They will still be raw inside.',
    'Put half the cabbage in the pot, set the meatballs on top, and cover with the rest of the cabbage. Pour in the broth and 1 tablespoon soy sauce.',
    'Bring to a boil, cover, and simmer gently 40 minutes, until the cabbage is silky and the center of a meatball reads 160°F.',
    'Serve each meatball on a pile of cabbage with some of the broth.',
  ],
  safety=[T_PORK],
  make_ahead='The braise tastes even better the next day: refrigerate it within 2 hours and reheat to 165°F.',
  freezer=(True, 'Freeze in the broth up to 3 months.'),
  leftovers=LEFT,
  kids='Kids can toss the meatballs from hand to hand (then wash hands well).',
  swaps={'chicken': 'Use ground chicken; cook to 165°F.', 'egg_free': 'Leave out the egg and add 2 tablespoons water.'},
  prep_day=dict(ahead='Braise a day ahead and reheat.', station='stove', oven_f=None, active=25, keeps_days=3),
  pairs=['white-rice', 'garlic-stir-fried-lettuce'])

# =====================================================================  VEGETABLES AND SPRING ROLLS
R(id='garlic-stir-fried-lettuce', name='Garlic Stir-Fried Lettuce', emoji='🥬', servings=4, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['quick', 'budget'], prep=5, cook=5,
  equipment=['wok or large skillet', 'tongs'],
  summary='Romaine hearts flashed in a hot wok with garlic until just wilted. In Cantonese the word for lettuce sounds like “growing wealth,” so it’s a New Year favorite.',
  ingredients='''
2 heart romaine | or 1 head iceberg, cut in wide ribbons
1 tbsp canola-oil
4 clove garlic | sliced
1 tbsp low-sodium-soy-sauce
1 tsp sesame-oil
1/2 tsp sugar
''',
  steps=[
    'Wash the lettuce and dry it well; water makes the oil spatter.',
    'Heat the oil in the wok over high heat. Add the garlic and stir 15 seconds until fragrant.',
    'Add the lettuce and toss 1 to 2 minutes, just until it wilts but still has some crunch.',
    'Add the soy sauce, sesame oil and sugar, toss, and serve at once.',
  ],
  safety=[],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Best right away. Refrigerate within 2 hours and eat within a day.', None),
  kids='Kids are often surprised that lettuce can be cooked; let them taste it.',
  swaps={'oyster_sauce': 'Use 1 tablespoon oyster sauce instead of soy (adds shellfish).', 'gluten_free': 'Use tamari.'},
  prep_day=None,
  pairs=['steamed-whole-fish', 'white-cut-chicken'])

R(id='buddhas-delight', name='Buddha’s Delight (Vegetable Braise)', emoji='🍄', servings=6, serving_size='about 1½ cups',
  meal=['dinner', 'side'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['budget'], prep=20, cook=20,
  equipment=['wok or large skillet with a lid', 'bowl for soaking noodles'],
  summary='A braise of napa cabbage, mushrooms, tofu, carrots, snap peas, water chestnuts and glassy noodles. Many Buddhist families eat it on the first day of the New Year, when some avoid meat.',
  ingredients='''
2 oz rice-noodles | thin, or bean thread noodles
2 tbsp canola-oil
14 oz tofu | firm, pressed and cut in cubes
8 oz mushrooms | sliced
2 clove garlic | minced
1 tbsp ginger | minced
1 each carrot | sliced thin
1 lb napa-cabbage | about half a head, cut in 2-inch pieces
1 can water-chestnuts | drained and sliced
6 oz snap-peas
Sauce:
1 cup vegetable-broth
2 tbsp low-sodium-soy-sauce
1 tbsp hoisin-sauce
1 tsp sugar
1 tbsp cornstarch
1 tsp sesame-oil
''',
  steps=[
    'Soak the noodles in hot water 10 minutes, drain and cut into shorter lengths with scissors.',
    'Stir the sauce ingredients together.',
    'Heat the oil in the wok and brown the tofu on two sides, 5 minutes; set aside. Stir-fry the mushrooms 3 minutes, then the garlic, ginger and carrot 1 minute.',
    'Add the cabbage and water chestnuts, then the sauce. Cover and simmer 5 minutes until the cabbage wilts.',
    'Add the snap peas, tofu and noodles and simmer 2 to 3 minutes, until the sauce thickens and everything is hot.',
  ],
  safety=[],
  make_ahead='Cut the vegetables a day ahead.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can snap the ends off the peas.',
  swaps={'gluten_free': 'Use tamari and check the hoisin label.'},
  prep_day=None,
  pairs=['white-rice', 'longevity-noodles'])

R(id='vegetable-spring-rolls', name='Crispy Vegetable Spring Rolls', emoji='🌯', servings=10, serving_size='2 spring rolls',
  meal=['snack', 'side'], protein='vegetarian', method=['stovetop'], tags=['freezer-friendly', 'make-ahead'], prep=45, cook=25,
  equipment=['wok or large skillet', 'colander', 'heavy pot for frying, and a deep-fry thermometer', 'slotted spoon or spider', 'paper-towel-lined tray', 'small bowl of water'],
  summary='Thin, golden rolls filled with cabbage, carrots, mushrooms and rice noodles. Fried until crisp, they look like little gold bars, a wish for wealth in the new year.',
  ingredients='''
2 oz rice-noodles | thin, soaked and cut short
1 tbsp canola-oil
4 cup cabbage | finely shredded
2 each carrot | cut in thin matchsticks
6 oz mushrooms | thinly sliced
4 each green-onions | sliced
1 tbsp ginger | grated
2 tbsp low-sodium-soy-sauce
1 tsp sesame-oil
1 tsp cornstarch | stirred into 1 tablespoon water
20 sheet spring-roll-wrappers | thawed, kept under a damp towel
^4 cup vegetable-oil | for frying (most stays in the pot)
2 tbsp vegetable-oil | about what the rolls soak up
''',
  steps=[
    'Heat 1 tablespoon oil in the wok and stir-fry the cabbage, carrots and mushrooms 4 to 5 minutes, until wilted and dry. Add the green onions, ginger, soy sauce and sesame oil, then the noodles. Spread on a tray to cool completely; a warm filling tears the wrappers.',
    'Lay a wrapper with a corner pointing at you. Put 2 tablespoons filling near that corner, fold the corner over, fold in the sides, and roll up firmly. Seal the last corner with a dab of the cornstarch paste. Keep finished rolls covered.',
    'Heat 2 inches of oil in the heavy pot to 350°F. ' + FRY,
    'Fry 4 or 5 rolls at a time, turning, 3 to 4 minutes until deep golden. Drain on paper towels. Let the oil come back to 350°F between batches.',
    'Oven option, no deep frying: brush the rolls with oil and bake on a rack set on a sheet pan at 425°F for 18 to 20 minutes, turning once. They’re a little less crisp.',
    'Serve with dumpling dipping sauce.',
  ],
  safety=[],
  make_ahead='Roll and freeze them uncooked, on a tray, then bag.',
  freezer=(True, 'Freeze uncooked rolls up to 2 months; fry from frozen at 325°F for 6 to 7 minutes.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 days. Recrisp in a 400°F oven.', None),
  kids='Kids can help roll (it’s like folding a tiny burrito). Frying is a grown-up job.',
  swaps={'pork': 'Add ½ lb ground pork, cooked to 160°F, to the filling.'},
  prep_day=None,
  pairs=['dumpling-dipping-sauce'])

# =====================================================================  SWEETS
R(id='nian-gao', name='Nian Gao (Brown Sugar Sticky Rice Cake)', emoji='🍘', servings=12, serving_size='1 wedge (or 3 pan-fried slices)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=15, cook=60, inactive=240,
  equipment=['8-inch round cake pan', 'parchment paper', 'wok or large pot with a rack and lid for steaming', 'whisk', 'saucepan'],
  summary='A chewy, glossy cake of glutinous rice flour and brown sugar, steamed for an hour. Its name sounds like “higher year,” a wish for a better year ahead. Eat it in slices, or pan-fry them.',
  ingredients='''
1 cup brown-sugar | packed, dark if you have it
1 1/4 cup water
1 lb glutinous-rice-flour | sweet rice flour, not regular rice flour
2 tbsp canola-oil | plus more for the pan
?2 tbsp sesame-seeds | toasted, for the top
''',
  steps=[
    'Heat the brown sugar and water, stirring, until the sugar dissolves. Cool until just warm.',
    'Put the rice flour in a bowl and slowly whisk in the syrup and the oil to a smooth, thick batter with no lumps.',
    'Line the pan with oiled parchment. Pour in the batter and smooth it. Sprinkle with sesame seeds.',
    'Set the pan on a rack in the wok over boiling water, cover, and steam 50 to 60 minutes, adding boiling water to the wok as needed. It’s done when a chopstick in the center comes out clean and the cake looks translucent.',
    'Cool completely, then let it firm at least 4 hours or overnight before cutting. Oil your knife.',
    'To pan-fry: cut into ¼-inch slices, dip in beaten egg if you like, and fry in a little oil until crisp outside and soft inside. ' + CHEWY,
  ],
  safety=[],
  make_ahead='Make up to 3 days ahead; it firms up and slices more cleanly.',
  freezer=(True, 'Wrap slices well and freeze up to 3 months; pan-fry from thawed.'),
  leftovers=('Keep wrapped at cool room temperature 2 days or in the refrigerator up to a week (it hardens; steam or pan-fry to soften).', None),
  kids='Kids can whisk the batter. ' + CHEWY,
  swaps={'dates': 'Press pitted red dates or chopped dates into the top before steaming.'},
  prep_day=None,
  pairs=['tangyuan-ginger-syrup'])

R(id='tangyuan-ginger-syrup', name='Tangyuan: Black Sesame Rice Balls in Ginger Syrup', emoji='⚪', servings=6, serving_size='4 rice balls with syrup',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'freezer-friendly'], prep=45, cook=20, inactive=30,
  equipment=['dry skillet', 'blender, spice grinder or mortar', 'bowls', 'tray lined with parchment', 'pot', 'slotted spoon'],
  summary='Soft, chewy glutinous rice balls filled with a sweet black sesame paste, served warm in ginger syrup. Their name sounds like “reunion”; families eat them on the Lantern Festival, the fifteenth day of the New Year.',
  ingredients='''
Filling:
1/2 cup sesame-seeds | black, or white
1/4 cup sugar
3 tbsp unsalted-butter | softened, or lard or coconut oil
Dough:
2 cup glutinous-rice-flour
3/4 cup water | warm, plus a little more if needed
Ginger syrup:
3 cup water
1 piece ginger | 2-inch piece, sliced
1/3 cup brown-sugar
''',
  steps=[
    'Toast the sesame seeds in a dry skillet over medium-low, stirring, 3 to 4 minutes until fragrant. Cool, then grind with the sugar to a fine, damp powder. Mix in the butter to make a paste. Chill 30 minutes, then roll into 24 small balls (about 1 teaspoon each) and chill again.',
    'Stir the warm water into the rice flour and knead to a smooth dough like soft clay. Add water by teaspoons if it cracks, or flour if sticky.',
    'Roll the dough into a log and cut 24 pieces. Flatten one into a cup, set a ball of filling in it, pinch the dough closed, and roll smooth between your palms. Keep finished balls on the tray, covered.',
    'Simmer the syrup water, ginger and brown sugar 10 minutes.',
    'In another pot, bring water to a gentle boil. Add the balls and stir so they don’t stick. When they float, cook 2 to 3 minutes more, until soft all the way through.',
    'Spoon them into bowls with the hot ginger syrup. Let them cool a minute: the filling is very hot. ' + CHEWY,
  ],
  safety=[],
  make_ahead='Freeze the shaped balls on the tray, then bag them; cook from frozen, adding 2 minutes.',
  freezer=(True, 'Freeze uncooked balls up to 2 months.'),
  leftovers=('Best freshly cooked; cooked balls harden in the refrigerator.', None),
  kids='Kids can roll the balls; the dough is like play clay. ' + CHEWY,
  swaps={'plain': 'Make small plain balls (no filling), tinted with a drop of food coloring, and serve in the syrup.', 'dairy_free': 'Use lard or coconut oil in the filling.', 'peanut': 'Use ground roasted peanuts instead of sesame (adds peanuts).'},
  prep_day=None,
  pairs=['nian-gao'])

# =====================================================================  COLLECTION (the page's plan)
META = {'title': 'Lunar New Year', 'url': 'meal-prep/lunar-new-year/', 'icon': '🧧',
        'blurb': 'Lunar New Year collection',
        'keywords': ['Lunar New Year', 'Chinese New Year', 'Spring Festival', 'dumplings', 'jiaozi', 'longevity noodles', 'nian gao', 'tangyuan', 'reunion dinner']}
COURSES = [
    {'id': 'dumplings', 'title': 'Dumplings', 'icon': '🥟',
     'intro': 'Folding dumplings together is the heart of New Year’s Eve for many families, especially in northern China. Make a pork batch and a vegetable batch, and freeze extras.',
     'items': ['r:pork-cabbage-dumplings', 'r:vegetable-dumplings', 'r:dumpling-dipping-sauce']},
    {'id': 'mains', 'title': 'The reunion dinner', 'icon': '🐟',
     'intro': 'A whole fish, a whole chicken and long noodles carry the year’s best wishes. Pick what suits your table.',
     'items': ['r:steamed-whole-fish', 'r:white-cut-chicken', 'r:longevity-noodles', 'r:lions-head-meatballs', 'r:orange-sesame-chicken', 'r:beef-and-broccoli', 'r:pork-lo-mein']},
    {'id': 'vegetables', 'title': 'Vegetables and spring rolls', 'icon': '🥬',
     'intro': 'Greens for the table, golden spring rolls, and the vegetable braise many families eat on New Year’s Day.',
     'items': ['r:vegetable-spring-rolls', 'r:garlic-stir-fried-lettuce', 'r:buddhas-delight', 'r:garlic-bok-choy', 'r:tofu-bok-choy-stir-fry', 'r:sesame-garlic-edamame', 'r:white-rice', 'r:fried-rice']},
    {'id': 'sweets', 'title': 'Sweets', 'icon': '🍊',
     'intro': 'Sticky rice cake for a “higher year,” rice balls for reunion, and a bowl of oranges or tangerines for luck.',
     'items': ['r:nian-gao', 'r:tangyuan-ginger-syrup', 'r:tropical-fruit-salad']},
    {'id': 'leftovers', 'title': 'The days after', 'icon': '🍲',
     'intro': 'Leftover chicken becomes noodle soup; extra dumplings go into the freezer for busy nights.',
     'items': ['r:ginger-chicken-rice-noodle-soup', 'r:egg-roll-bowls', 'r:cold-sesame-noodles']},
]
SCRATCH = ['chicken-stock', 'vegetable-stock', 'egg-noodles']
DEFAULT_MENU = ['pork-cabbage-dumplings', 'vegetable-dumplings', 'dumpling-dipping-sauce', 'steamed-whole-fish', 'longevity-noodles', 'garlic-stir-fried-lettuce', 'vegetable-spring-rolls', 'white-rice', 'nian-gao']
DAY = {
    'pork-cabbage-dumplings': {'stove': 30, 'ahead_part': 'make the filling and fold (or freeze) the dumplings'},
    'vegetable-dumplings': {'stove': 30, 'ahead_part': 'make the filling and fold (or freeze) the dumplings'},
    'dumpling-dipping-sauce': {'ahead': 3},
    'steamed-whole-fish': {'stove': 25, 'last': True}, 'white-cut-chicken': {'ahead_part': 'poach and chill the chicken in the morning', 'stove': 10},
    'longevity-noodles': {'stove': 20, 'last': True}, 'lions-head-meatballs': {'ahead': 1}, 'garlic-stir-fried-lettuce': {'stove': 5, 'last': True},
    'buddhas-delight': {'stove': 25}, 'vegetable-spring-rolls': {'stove': 30, 'ahead_part': 'roll (or freeze) the spring rolls'},
    'white-rice': {'stove': 25}, 'fried-rice': {'stove': 20}, 'nian-gao': {'ahead': 3}, 'tangyuan-ginger-syrup': {'ahead_part': 'shape (or freeze) the rice balls', 'stove': 20},
}
ROASTS = {}
# the dumpling-party planner: dumplings per person (a main course vs one dish of many), wrappers per package, folding speed
PARTY = {'per_main': 12, 'per_feast': 6, 'wrappers_per_pack': 45, 'filling_batch': 48, 'fold_per_min': 2,
         'note': 'Our planning estimates: about 12 dumplings each when they’re the main dish, 6 when they share the table; a practiced folder makes about 2 a minute, a beginner about 1.'}
# New Year's Day (first day of the first lunar month) in the United States, from timeanddate.com
DATES = [['2027-02-06', 'Year of the Goat'], ['2028-01-26', 'Year of the Monkey'], ['2029-02-13', 'Year of the Rooster']]
EXTRA = {'tool': 'party', 'party': PARTY, 'dates': DATES}
EXTRA_IDS = []
GOALS_EXCLUDE = ['steamed-whole-fish', 'white-cut-chicken', 'nian-gao', 'tangyuan-ginger-syrup', 'vegetable-spring-rolls', 'dumpling-dipping-sauce']

SOURCES = [
    ('fsis-temps', 'Safe Minimum Internal Temperature Chart', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'),
    ('fda-seafood', 'Selecting and Serving Fresh and Frozen Seafood Safely', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely'),
    ('lafd', 'Cooking Safety', 'Los Angeles Fire Department', 'https://lafd.org/cooking-safety'),
    ('eatright', 'Ringing in the Lunar New Year', 'Academy of Nutrition and Dietetics', 'https://www.eatright.org/food/cultural-cuisines-and-traditions/holidays-and-celebrations/ringing-in-the-lunar-new-year'),
    ('tad', 'Lunar New Year dates', 'timeanddate.com', 'https://www.timeanddate.com/holidays/us/lunar-new-year'),
]

G = lambda t, what: {'name': t.replace('_', ' ').replace('(', '').replace(')', '').replace('%27', '’') + ' (Grokipedia)', 'url': 'https://grokipedia.com/page/' + t, 'what': what}  # noqa: E731
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for a, b, c, d, w in [
    ('fsis-temps', 'Safe Minimum Internal Temperature Chart', 'USDA FSIS', SOURCES[0][3], 'ground pork 160°F, poultry 165°F'),
    ('fda-seafood', 'Selecting and Serving Fresh and Frozen Seafood Safely', 'FDA', SOURCES[1][3], 'fish to 145°F, or opaque flesh that flakes'),
    ('lafd', 'Cooking Safety', 'Los Angeles Fire Department', SOURCES[2][3], 'frying and pan fires'),
    ('eatright', 'Ringing in the Lunar New Year', 'Academy of Nutrition and Dietetics', SOURCES[3][3], 'what the foods stand for'),
]}
CNY = G('Chinese_New_Year', 'the festival and its foods')
CREDITS = {
    'pork-cabbage-dumplings': [G('Jiaozi', 'dumplings and the ingot shape'), U['fsis-temps'], U['eatright']],
    'vegetable-dumplings': [G('Jiaozi', 'dumplings and the ingot shape'), U['eatright']],
    'longevity-noodles': [G('Yi_mein', 'long noodles for long life'), U['eatright']],
    'steamed-whole-fish': [U['fda-seafood'], CNY, U['eatright']],
    'white-cut-chicken': [G('White_cut_chicken', 'the Cantonese dish'), U['fsis-temps'], U['eatright']],
    'lions-head-meatballs': [U['fsis-temps']],
    'garlic-stir-fried-lettuce': [CNY],
    'buddhas-delight': [G('Buddha%27s_delight', 'the New Year’s Day custom')],
    'vegetable-spring-rolls': [G('Spring_roll', 'background'), U['lafd'], U['eatright']],
    'nian-gao': [G('Nian_gao', 'the name and the custom'), U['eatright']],
    'tangyuan-ginger-syrup': [G('Tangyuan_(food)', 'reunion and the Lantern Festival'), G('Lantern_Festival', 'the fifteenth day')],
}
NOTE = ('Lunar New Year (/meal-prep/lunar-new-year/): new recipes plus the page plan, which reuses recipes from the other files by id. '
        'Edit scripts/meals/src/build_lunar_new_year.py and run it; allergens, diet and guides are derived from the catalog.')
SOFT = set()


def build(lst):
    out, ids = [], set()
    for r in lst:
        rid = r['id']
        assert rid not in ids, rid
        ids.add(rid)
        ings = B.parse_ingredients(r['ingredients'], rid)
        allergens, diet, guides = B.derive(ings)
        inactive = r.get('inactive', 0)
        fz_ok, fz_text = r['freezer']
        lo = r.get('leftovers')
        if 'food-safety' not in guides and r['safety']:
            guides.append('food-safety')
        tags = list(r['tags'])
        total = r['prep'] + r['cook'] + inactive
        if total <= 30 and 'quick' not in tags:
            tags.append('quick')
        if total > 30 and 'quick' in tags:
            tags.remove('quick')
        if fz_ok and 'freezer-friendly' not in tags:
            tags.append('freezer-friendly')
        if not fz_ok and 'freezer-friendly' in tags:
            tags.remove('freezer-friendly')
        if lo and lo[1] and 'leftovers' not in tags:
            tags.append('leftovers')
        out.append({
            'id': rid, 'name': r['name'], 'emoji': r['emoji'], 'summary': r['summary'],
            'servings': r['servings'], 'serving_size': r['serving_size'],
            'meal': r['meal'], 'protein': r['protein'], 'method': r['method'], 'tags': tags,
            'times': {'prep': r['prep'], 'cook': r['cook'], 'inactive': inactive, 'total': total},
            'equipment': r['equipment'], 'ingredients': ings, 'steps': r['steps'],
            'safety': [{'food': f, 'temp_f': t, 'rest_min': m} for f, t, m in r['safety']],
            'make_ahead': r.get('make_ahead'),
            'freezer': {'ok': fz_ok, 'text': fz_text},
            'leftovers': {'text': lo[0], 'next_day': lo[1]} if lo else None,
            'kids': r.get('kids'), 'swaps': r.get('swaps') or {}, 'prep_day': r.get('prep_day'),
            'pairs': r.get('pairs') or [], 'allergens': allergens, 'diet': diet, 'guides': guides,
            'collection': r['collection'], 'credits': CREDITS.get(rid, []),
        })
    return out


def existing_ids(skip):
    rec = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != skip:
            rec |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    return rec


def main():
    out = build(RECIPES)
    fname = SLUG + '.json'
    rec_ids = existing_ids(fname)
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    soft = SOFT
    sc_ids = {s['id'] for s in json.load(open(os.path.join(SITE, 'data/meals/scratch.json')))['recipes']}
    allr = []
    for c in COURSES:
        for it in c['items']:
            kind, _, i = it.partition(':')
            if (kind == 'r' and i not in rec_ids and i not in soft) or (kind == 's' and i not in sc_ids) or kind not in 'rs':
                raise SystemExit(f'course {c["id"]}: unknown {it}')
            if kind == 'r' and i not in allr:
                allr.append(i)
    for i in SCRATCH:
        if i not in sc_ids:
            raise SystemExit(f'unknown scratch page {i}')
    for i in DEFAULT_MENU + EXTRA_IDS + list(DAY) + [v.get('recipe', k) for k, v in ROASTS.items()]:
        if i not in rec_ids and i not in soft:
            raise SystemExit(f'unknown recipe {i}')
    for r in out:
        for p in r['pairs']:
            if p not in rec_ids:
                raise SystemExit(f'{r["id"]}: pairs with unknown {p}')
    missing = {r['id'] for r in out} - set(allr)
    if missing:
        raise SystemExit(f'new recipes not on the page: {missing}')
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU,
            'day': DAY, 'roasts': ROASTS, 'goals_exclude': GOALS_EXCLUDE, **EXTRA,
            'all': allr, 'new': [r['id'] for r in out],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    with open(os.path.join(SITE, 'data/meals/recipes', fname), 'w') as fh:
        json.dump({'note': NOTE,
                   'collection': coll, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(fname, len(out), 'new recipes;', len(allr), 'recipes on the page')


if __name__ == '__main__':
    main()
