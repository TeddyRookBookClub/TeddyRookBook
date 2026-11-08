#!/usr/bin/env python3
"""Builds data/meals/recipes/plates.json: "Simple plates, all day" at /meal-prep/simple-plates/.

Run:  python3 scripts/meals/src/build_plates.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds
  recipes  the NEW plate recipes (same fields as build_recipes.py; each has plate=True). Each is one whole plate:
           a protein, a starch and a vegetable, at an ordinary adult portion, with a kids' portion note.
  plates   the page's plan: the plates in order (new ones plus matching recipes from elsewhere in Meal Prep, by id),
           sides to build your own plate, and "one reported day": the foods of a widely reported actor's bulking day,
           estimated here from the same USDA FoodData Central numbers the rest of Meal Prep uses.

The reported day follows Muscle & Fitness as reported by E! Online (April 8, 2015) and FiveThirtyEight (April 2015);
Men's Health (2020) gives the 2014 Hercules version, which differs. Supplements (a protein shake, fish oil) are named
on the page but left out of the totals; the site gives no supplement advice.
Food safety: USDA FSIS safe minimum internal temperatures and "Leftovers and Food Safety" (refrigerate within 2 hours,
use within 3 to 4 days, freeze for longer, reheat to 165 °F).
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

T_FISH = ('fish', 145, 0)
T_STEAK = ('beef steaks', 145, 3)
T_POULTRY = ('chicken', 165, 0)
T_GROUND = ('ground beef', 160, 0)
T_EGGS = ('egg dishes', 160, 0)

BATCH = ('Batch-cook: cool the cooked food in shallow containers and refrigerate it within 2 hours. '
         'Eat it within 3 to 4 days, or freeze it. Reheat to 165°F (USDA).')
LEFT = ('Pack a plate for lunch: refrigerate within 2 hours, eat within 3 to 4 days, and reheat to 165°F (USDA).', 'lunch')
RICE = ('Rinse the rice in a strainer. Bring it to a boil with the water and ¼ teaspoon of the salt, cover, turn the heat to low '
        'and cook 18 minutes. Turn off the heat and let it stand, covered, 5 minutes, then fluff it with a fork.')

RECIPES = []


def R(**kw):
    kw.setdefault('plate', True)
    RECIPES.append(kw)


R(id='lemon-cod-rice-asparagus', name='Lemon Cod with Rice and Asparagus', emoji='🐟', servings=4,
  serving_size='1 fillet, 1 cup of rice and a quarter of the asparagus',
  meal=['dinner', 'lunch'], protein='fish', method=['oven', 'sheet-pan', 'stovetop'], tags=['budget', 'kid-friendly', 'make-ahead'],
  prep=10, cook=25, inactive=5,
  equipment=['medium saucepan with a lid', 'rimmed baking sheet', 'parchment or foil', 'food thermometer'],
  summary='Mild white fish and asparagus roasted on one pan while the rice cooks. The simplest fish plate there is.',
  ingredients='''
Rice:
1 1/3 cup white-rice
^2 2/3 cup water
Cod and asparagus:
4 fillet cod | about 6 oz each, thawed if frozen
1 lb asparagus | woody ends snapped off
2 tbsp olive-oil
1 tbsp butter | melted
2 clove garlic | minced
1 each lemon | half juiced, half cut in wedges
3/4 tsp salt
~1/4 tsp black-pepper
?1 tbsp parsley | chopped
''',
  steps=[
    RICE,
    'Heat the oven to 425°F. Line a baking sheet with parchment or foil.',
    'Toss the asparagus with 1 tablespoon of the oil and a pinch of salt and spread it on one side of the pan. Roast 5 minutes.',
    'Pat the cod dry and set it on the other side of the pan. Mix the butter, the rest of the oil, the garlic and the lemon juice and spoon it over the fish. Sprinkle the fish with the rest of the salt and the pepper.',
    'Roast 10 to 12 minutes, until the fish flakes easily with a fork and the thickest part reads 145°F on a food thermometer.',
    'Divide the rice, cod and asparagus among 4 plates. Add a lemon wedge and parsley.',
  ],
  safety=[T_FISH],
  make_ahead='Cook the rice up to 3 days ahead. ' + BATCH,
  freezer=(True, 'Cooked rice and cooked cod each freeze up to 3 months; thaw in the refrigerator and reheat to 165°F.'),
  leftovers=LEFT,
  kids='A kids’ plate is about half of an adult’s: half a fillet, ½ cup of rice and a few spears. Check the fish for bones and flake it; cut asparagus into short pieces for little ones.',
  swaps={'dairy_free': 'Use 1 more tablespoon of olive oil instead of butter.', 'other_fish': 'Any mild white fish works: haddock, pollock, tilapia or halibut. Thin fillets cook faster.'},
  prep_day=dict(ahead='Cook the rice; trim the asparagus.', station='oven', oven_f=425, active=10, keeps_days=3),
  pairs=['green-salad'])

R(id='chicken-sweet-potato-broccoli', name='Chicken, Sweet Potato and Broccoli Sheet Pan', emoji='🍗', servings=4,
  serving_size='1 piece of chicken with a quarter of the vegetables',
  meal=['dinner', 'lunch'], protein='chicken', method=['oven', 'sheet-pan'], tags=['kid-friendly', 'make-ahead'],
  prep=15, cook=35, inactive=5,
  equipment=['2 rimmed baking sheets', 'food thermometer', 'cutting board'],
  summary='Seasoned chicken breast, sweet potato cubes and broccoli roasted together. A classic plate for packing lunches.',
  ingredients='''
1 1/2 lb chicken-breast | boneless, skinless, cut into 4 pieces of even thickness
1 1/2 lb sweet-potato | peeled or scrubbed, in ¾-inch cubes
12 oz broccoli | in florets
3 tbsp olive-oil
1 tsp garlic-powder
1 tsp paprika
1 tsp salt
~1/2 tsp black-pepper
''',
  steps=[
    'Heat the oven to 425°F with racks in the upper and lower thirds.',
    'Toss the sweet potatoes with 1 tablespoon of the oil and a little of the salt on one baking sheet. Roast on the lower rack 15 minutes.',
    'Mix the garlic powder, paprika, the rest of the salt and the pepper. Rub the chicken with 1 tablespoon of oil and the spice mix. Toss the broccoli with the last of the oil.',
    'Stir the sweet potatoes. Put the chicken and broccoli on the second sheet on the upper rack. Roast 18 to 22 minutes, until the chicken reads 165°F in the thickest part on a food thermometer and the sweet potatoes are tender.',
    'Wash your hands, the cutting board and the knife after handling raw chicken. Let the chicken rest 5 minutes, slice it, and divide everything among 4 plates.',
  ],
  safety=[T_POULTRY],
  make_ahead='Cube the sweet potatoes and cut the broccoli up to 2 days ahead. ' + BATCH,
  freezer=(True, 'Cooked chicken and sweet potatoes freeze up to 3 months; broccoli gets soft but is fine in a bowl.'),
  leftovers=LEFT,
  kids='Kids eat about half an adult plate: 2 to 3 ounces of chicken, ½ cup of sweet potato and a few florets. Cut chicken into small pieces for young children.',
  swaps={'thighs': 'Use boneless chicken thighs; they also need 165°F and stay juicy.', 'potato': 'Use white potatoes instead of sweet potatoes.'},
  prep_day=dict(ahead='Cut the vegetables and season the chicken.', station='oven', oven_f=425, active=15, keeps_days=4),
  pairs=[])

R(id='sirloin-baked-potato-green-beans', name='Sirloin Steak, Baked Potato and Green Beans', emoji='🥩', servings=4,
  serving_size='about 5 oz of steak, 1 potato and a quarter of the beans',
  meal=['dinner'], protein='beef', method=['oven', 'stovetop'], tags=['kid-friendly'],
  prep=10, cook=60, inactive=5,
  equipment=['heavy skillet (cast iron is good)', 'food thermometer', 'saucepan with a steamer basket or lid', 'fork', 'baking sheet'],
  summary='A steakhouse plate at home: seared top sirloin, a fluffy baked potato and buttery green beans.',
  ingredients='''
1 1/2 lb sirloin-steak | about 1 inch thick
4 each russet-potato | scrubbed
1 lb green-beans | ends trimmed
1 tbsp olive-oil
2 tbsp butter
1 clove garlic | minced
1 tsp salt
~1/2 tsp black-pepper
?4 tbsp sour-cream | for the potatoes
?2 each green-onions | sliced
''',
  steps=[
    'Heat the oven to 400°F. Prick each potato a few times with a fork and set them on a baking sheet. Bake 50 to 60 minutes, until a knife slides in easily.',
    'About 20 minutes before the potatoes are done, pat the steak dry and season it with ¾ teaspoon of the salt and the pepper. Let it sit while the skillet heats.',
    'Heat the oil in the skillet over medium-high heat until it shimmers. Sear the steak 4 to 5 minutes per side, until it reads at least 145°F in the center on a food thermometer. Move it to a board and let it rest 3 minutes (USDA).',
    'Meanwhile, steam the green beans over simmering water 5 to 7 minutes, until bright green and tender. Toss them with the butter, garlic and the rest of the salt.',
    'Slice the steak across the grain. Split the potatoes and top with sour cream and green onions if you like. Divide everything among 4 plates.',
  ],
  safety=[T_STEAK],
  make_ahead='Bake the potatoes up to 3 days ahead and reheat them. ' + BATCH,
  freezer=(False, 'Steak is best fresh; sliced leftover steak freezes up to 3 months for stir-fries or tacos.'),
  leftovers=('Slice cold steak for a salad or a wrap; refrigerate within 2 hours and eat within 3 to 4 days (USDA).', 'lunch'),
  kids='A kids’ plate: 2 to 3 ounces of thinly sliced steak, cut small, half a potato and a few beans. Kids can scrub potatoes and snap the ends off the beans.',
  swaps={'dairy_free': 'Use olive oil on the beans and skip the sour cream.', 'spinach': 'Serve a spinach salad instead of green beans.'},
  prep_day=dict(ahead='Bake the potatoes; trim the beans.', station='oven', oven_f=400, active=10, keeps_days=3),
  pairs=['green-salad'])

R(id='eggs-oatmeal-berries', name='Eggs, Oatmeal and Berries', emoji='🍳', servings=4,
  serving_size='2 eggs, 1 cup of oatmeal and ½ cup of berries',
  meal=['breakfast'], protein='vegetarian', method=['stovetop'], tags=['budget', 'kid-friendly', 'quick'],
  prep=5, cook=12, inactive=0,
  equipment=['medium saucepan', 'nonstick skillet', 'spatula', 'food thermometer (optional)'],
  summary='A warm breakfast plate: creamy oatmeal with berries and two eggs on the side. Ready in under 20 minutes.',
  ingredients='''
Oatmeal:
2 cup rolled-oats
2 cup whole-milk
^2 cup water
=1/4 tsp salt
1/2 tsp cinnamon
2 cup blueberries | or sliced strawberries, fresh or frozen
?2 tbsp honey | not for babies under 1 year
Eggs:
8 each eggs
1 tsp butter
~1/8 tsp black-pepper
''',
  steps=[
    'Bring the milk, water and salt just to a simmer in the saucepan. Stir in the oats and cinnamon and cook over medium-low heat 5 minutes, stirring now and then, until thick and creamy.',
    'While the oats cook, melt the butter in the skillet over medium heat. Crack in the eggs and cook them the way your family likes (fried, scrambled or over easy) until the whites and yolks are firm. Scrambled eggs and egg dishes are done at 160°F (USDA).',
    'Spoon the oatmeal into bowls, top with the berries and a drizzle of honey if you like, and serve the eggs alongside with a little pepper.',
  ],
  safety=[T_EGGS],
  make_ahead='Cook a big pot of oatmeal and keep it in the refrigerator up to 4 days; reheat with a splash of milk. Hard-cook eggs ahead: they keep a week in the refrigerator (USDA).',
  freezer=(True, 'Cooked oatmeal freezes in portions up to 3 months. Don’t freeze eggs in the shell.'),
  leftovers=None,
  kids='Kids eat about half: 1 egg, ½ cup of oatmeal and a handful of berries. For children under 4, cut blueberries into smaller pieces. Skip honey for babies under 1 year.',
  swaps={'dairy_free': 'Make the oatmeal with water or soy milk and cook the eggs in oil.', 'gluten_free': 'Use oats labeled gluten-free.'},
  prep_day=dict(ahead='Cook a pot of oatmeal; hard-cook eggs.', station='stove', oven_f=None, active=10, keeps_days=4),
  pairs=[])

R(id='beef-rice-peppers', name='Ground Beef, Rice and Pepper Plates', emoji='🫑', servings=4,
  serving_size='about 1½ cups of beef and peppers with 1 cup of rice',
  meal=['dinner', 'lunch'], protein='beef', method=['stovetop'], tags=['budget', 'kid-friendly', 'make-ahead', 'freezer-friendly'],
  prep=10, cook=25, inactive=0,
  equipment=['medium saucepan with a lid', 'large skillet', 'food thermometer', 'wooden spoon'],
  summary='Lean ground beef browned with sweet peppers and onion, mildly spiced, over white rice. Freezes well in single plates.',
  ingredients='''
Rice:
1 1/3 cup white-rice
^2 2/3 cup water
Beef and peppers:
1 1/4 lb ground-beef-90
1 each red-bell-pepper | in strips
1 each green-bell-pepper | in strips
1 each onion | sliced
2 clove garlic | minced
1 tbsp olive-oil
1 tsp cumin
1 tsp paprika
3/4 tsp salt
~1/4 tsp black-pepper
''',
  steps=[
    RICE,
    'Heat the oil in the skillet over medium-high heat. Cook the peppers and onion 5 to 6 minutes, until they soften and brown at the edges. Move them to a plate.',
    'Add the beef to the skillet and break it up. Cook 6 to 8 minutes, until no pink remains and it reads 160°F on a food thermometer. Spoon off extra fat.',
    'Stir in the garlic, cumin, paprika, the rest of the salt and the pepper and cook 1 minute. Return the peppers and onion and toss to heat through.',
    'Serve over the rice.',
  ],
  safety=[T_GROUND],
  make_ahead=BATCH,
  freezer=(True, 'Freeze single plates of beef and rice up to 3 months. Thaw in the refrigerator and reheat to 165°F.'),
  leftovers=LEFT,
  kids='Kids eat about half: ½ cup of the beef and peppers and ½ cup of rice. Cut pepper strips small for little ones, or keep a few raw strips for dipping.',
  swaps={'turkey': 'Use ground turkey; cook it to 165°F.', 'brown_rice': 'Use brown rice; simmer it about 40 minutes with a little more water.'},
  prep_day=dict(ahead='Cook the rice and slice the vegetables.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=['green-salad'])

R(id='salmon-quinoa-spinach', name='Salmon, Quinoa and Garlic Spinach', emoji='🍣', servings=4,
  serving_size='1 fillet, ¾ cup of quinoa and a quarter of the spinach',
  meal=['dinner', 'lunch'], protein='fish', method=['oven', 'stovetop'], tags=['make-ahead'],
  prep=10, cook=20, inactive=5,
  equipment=['medium saucepan with a lid', 'rimmed baking sheet', 'large skillet', 'food thermometer', 'fine strainer'],
  summary='Baked salmon with fluffy quinoa and spinach wilted with garlic and lemon. Rich in protein and good fats.',
  ingredients='''
Quinoa:
1 cup quinoa
^2 cup water
Salmon:
4 fillet salmon | about 6 oz each
1 tbsp olive-oil
1/2 tsp salt
~1/4 tsp black-pepper
1 each lemon | half juiced, half in wedges
Spinach:
10 oz spinach | about 12 cups, loosely packed
1 tbsp olive-oil
2 clove garlic | sliced
=1/4 tsp salt
''',
  steps=[
    'Rinse the quinoa well in a fine strainer. Bring it to a boil with the water, cover, and simmer on low 15 minutes. Let it stand, covered, 5 minutes, then fluff it.',
    'Heat the oven to 400°F. Set the salmon skin side down on a lined baking sheet, brush with 1 tablespoon of oil and season with the salt and pepper.',
    'Bake 12 to 15 minutes, until the thickest part reads 145°F on a food thermometer and flakes easily. Squeeze the lemon juice over it.',
    'Meanwhile, warm the remaining oil and the garlic in the skillet over medium heat until the garlic sizzles, about 1 minute. Add the spinach a handful at a time and toss until just wilted, 2 to 3 minutes. Season with the salt.',
    'Divide the quinoa, salmon and spinach among 4 plates with lemon wedges.',
  ],
  safety=[T_FISH],
  make_ahead='Cook the quinoa up to 4 days ahead. ' + BATCH,
  freezer=(True, 'Cooked quinoa freezes up to 3 months. Cooked salmon freezes up to 3 months but is best fresh.'),
  leftovers=('Flake cold salmon over the quinoa for lunch; refrigerate within 2 hours and eat within 3 to 4 days (USDA).', 'lunch'),
  kids='Kids eat about half a fillet and ½ cup of quinoa. Run a finger along the salmon to find pin bones and pull them out. Some kids prefer spinach raw, in a few leaves.',
  swaps={'rice': 'Use rice or couscous instead of quinoa.', 'greens': 'Use kale or chard; cook them a few minutes longer.'},
  prep_day=dict(ahead='Cook the quinoa; wash the spinach.', station='oven', oven_f=400, active=10, keeps_days=3),
  pairs=[])

R(id='garlic-chicken-rice-broccoli', name='Garlic Chicken, Rice and Broccoli', emoji='🥦', servings=4,
  serving_size='a quarter of the chicken, 1 cup of rice and 1 cup of broccoli',
  meal=['dinner', 'lunch'], protein='chicken', method=['stovetop'], tags=['budget', 'kid-friendly', 'make-ahead'],
  prep=10, cook=25, inactive=0,
  equipment=['medium saucepan with a lid', 'large skillet', 'steamer basket or a pot with a lid', 'food thermometer', 'cutting board'],
  summary='Pan-seared chicken with a little garlic, white rice and steamed broccoli. The plate meal-preppers make by the dozen.',
  ingredients='''
Rice:
1 1/3 cup white-rice
^2 2/3 cup water
Chicken and broccoli:
1 1/2 lb chicken-breast | sliced into thin cutlets
1 1/2 tbsp olive-oil
1 tsp garlic-powder
1/2 tsp oregano
3/4 tsp salt
~1/4 tsp black-pepper
1 lb broccoli | in florets
1 tbsp low-sodium-soy-sauce | or a squeeze of lemon
''',
  steps=[
    RICE,
    'Season the chicken with the garlic powder, oregano, salt and pepper. Wash your hands and the cutting board after handling raw chicken.',
    'Heat the oil in the skillet over medium-high heat. Cook the cutlets 4 to 5 minutes per side, until golden and 165°F in the thickest part on a food thermometer. Let them rest 5 minutes, then slice.',
    'Steam the broccoli over simmering water 4 to 5 minutes, until bright green and just tender. Toss with the soy sauce or lemon.',
    'Divide the rice, chicken and broccoli among 4 plates or containers.',
  ],
  safety=[T_POULTRY],
  make_ahead=BATCH,
  freezer=(True, 'Freeze plates of chicken and rice up to 3 months; steam the broccoli fresh if you can.'),
  leftovers=LEFT,
  kids='Kids eat about half: 2 to 3 ounces of chicken cut small, ½ cup of rice and a few florets. Kids can tear broccoli into florets.',
  swaps={'gluten_free': 'Use lemon instead of soy sauce, or a gluten-free tamari.', 'veg': 'Use green beans or asparagus instead of broccoli.'},
  prep_day=dict(ahead='Cook the rice; cut the chicken and broccoli.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=[])

R(id='egg-veggie-scramble-toast', name='Egg and Veggie Scramble with Toast', emoji='🥚', servings=4,
  serving_size='about 1 cup of scramble and 1 slice of toast',
  meal=['breakfast', 'lunch', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['budget', 'kid-friendly', 'quick'],
  prep=10, cook=10, inactive=0,
  equipment=['large nonstick skillet', 'mixing bowl', 'whisk or fork', 'spatula', 'toaster'],
  summary='Whole eggs and egg whites scrambled with onion, peppers and mushrooms, with whole-wheat toast. Quick, filling and cheap.',
  ingredients='''
6 each eggs
1 cup egg-whites
1 tbsp olive-oil
1 each onion | diced
1 each red-bell-pepper | diced
4 oz mushrooms | sliced
1/2 tsp salt
~1/4 tsp black-pepper
?1/2 cup cheddar | shredded
4 slice wheat-bread | toasted
''',
  steps=[
    'Whisk the eggs, egg whites, ¼ teaspoon of the salt and the pepper in a bowl.',
    'Heat the oil in the skillet over medium heat. Cook the onion, pepper and mushrooms with the rest of the salt 6 to 7 minutes, until soft and the mushroom liquid cooks off.',
    'Pour in the eggs. Stir slowly with a spatula until they are set with no liquid egg left, 2 to 3 minutes; egg dishes are done at 160°F (USDA). Sprinkle on cheese if you like.',
    'Serve with the toast.',
  ],
  safety=[T_EGGS],
  make_ahead='Chop the vegetables up to 3 days ahead and keep them in the refrigerator. Cooked scramble keeps 3 to 4 days; reheat to 165°F.',
  freezer=(True, 'Cooked scramble freezes up to 2 months for breakfast burritos; thaw in the refrigerator.'),
  leftovers=('Roll leftover scramble in a tortilla for lunch; refrigerate within 2 hours and eat within 3 to 4 days (USDA).', 'lunch'),
  kids='Kids eat about half: ½ cup of scramble and half a slice of toast. Kids can crack eggs into a bowl and whisk (wash hands after).',
  swaps={'whole_eggs': 'Use 9 whole eggs instead of eggs plus whites.', 'gluten_free': 'Use gluten-free bread.'},
  prep_day=dict(ahead='Chop the vegetables.', station='stove', oven_f=None, active=10, keeps_days=3),
  pairs=['fruit-salad'])

# ---------------------------------------------------------------- the page plan
# plates in the order shown: new ones and close matches already in Meal Prep (r:<id>)
PLATES = [
    {'id': 'breakfast', 'title': 'Breakfast plates', 'icon': '🍳',
     'items': ['eggs-oatmeal-berries', 'egg-veggie-scramble-toast', 'oatmeal', 'scrambled-eggs', 'egg-muffin-cups']},
    {'id': 'fish', 'title': 'Fish plates', 'icon': '🐟',
     'items': ['lemon-cod-rice-asparagus', 'salmon-quinoa-spinach', 'sheet-pan-salmon-asparagus', 'mediterranean-baked-cod', 'baked-salmon']},
    {'id': 'chicken', 'title': 'Chicken plates', 'icon': '🍗',
     'items': ['chicken-sweet-potato-broccoli', 'garlic-chicken-rice-broccoli', 'roast-chicken', 'chicken-stir-fry']},
    {'id': 'beef', 'title': 'Beef plates', 'icon': '🥩',
     'items': ['sirloin-baked-potato-green-beans', 'beef-rice-peppers', 'beef-and-broccoli', 'steak-chimichurri']},
]
# build your own plate: one from each column
SIDES = {
    'starch': ['white-rice', 'brown-rice', 'roasted-potatoes', 'mashed-potatoes', 'lemon-herb-couscous', 'bulgur-pilaf'],
    'veg': ['green-beans', 'roasted-vegetables', 'lemon-parmesan-asparagus', 'green-salad', 'garlicky-swiss-chard', 'garlic-bok-choy'],
}
# a whole day of plates (the new recipes), shown with its totals
DAY = ['eggs-oatmeal-berries', 'garlic-chicken-rice-broccoli', 'lemon-cod-rice-asparagus', 'chicken-sweet-potato-broccoli',
       'sirloin-baked-potato-green-beans', 'salmon-quinoa-spinach', 'egg-veggie-scramble-toast']

# One reported day: Muscle & Fitness (2015), as reported by E! Online and FiveThirtyEight. Amounts as reported; how we
# read them for the estimate (cooked rice and oatmeal to dry weight; "1 cup veggies" as a named vegetable) is in 'how'.
# Each food: [catalog item, grams as bought/raw, how it was described]. Supplements are listed but not counted.
REPORTED = [
    {'n': 1, 'foods': '10 oz cod, 2 eggs, 2 cups oatmeal', 'est': [['cod', 283.5], ['eggs', 100], ['rolled-oats', 81]],
     'how': '2 cups cooked oatmeal counted as 1 cup dry oats', 'plate': 'eggs-oatmeal-berries'},
    {'n': 2, 'foods': '8 oz cod, 12 oz sweet potato, 1 cup vegetables', 'est': [['cod', 226.8], ['sweet-potato', 340.2], ['broccoli', 91]],
     'how': 'vegetables counted as broccoli', 'plate': 'chicken-sweet-potato-broccoli'},
    {'n': 3, 'foods': '8 oz chicken, 2 cups white rice, 1 cup vegetables', 'est': [['chicken-breast', 226.8], ['white-rice', 123], ['broccoli', 91]],
     'how': '2 cups cooked rice counted as ⅔ cup dry', 'plate': 'garlic-chicken-rice-broccoli'},
    {'n': 4, 'foods': '8 oz cod, 2 cups white rice, 1 cup vegetables, fish oil', 'est': [['cod', 226.8], ['white-rice', 123], ['asparagus', 134]],
     'how': 'vegetables counted as asparagus; fish oil left out', 'plate': 'lemon-cod-rice-asparagus'},
    {'n': 5, 'foods': '8 oz steak, 12 oz baked potato, spinach salad', 'est': [['sirloin-steak', 226.8], ['russet-potato', 340.2], ['spinach', 60]],
     'how': 'steak counted as top sirloin; salad as 2 cups spinach, no dressing', 'plate': 'sirloin-baked-potato-green-beans'},
    {'n': 6, 'foods': '10 oz cod, 2 cups white rice, salad', 'est': [['cod', 283.5], ['white-rice', 123], ['spinach', 60]],
     'how': 'salad as 2 cups greens, no dressing', 'plate': 'lemon-cod-rice-asparagus'},
    {'n': 7, 'foods': 'a 10-egg-white omelet with onions, peppers and mushrooms; a protein shake; fish oil', 'est': [['egg-whites', 330], ['onion', 53], ['red-bell-pepper', 50], ['mushrooms', 23]],
     'how': 'egg whites and 1 cup vegetables counted; the shake and fish oil left out', 'plate': 'egg-veggie-scramble-toast'},
]

SOURCES = [
    ('eonline-2015', 'Dwayne “The Rock” Johnson’s Daily Diet Plan Revealed: 7 Meals, 36 Ounces of Cod…', 'E! Online, April 8, 2015 (citing Muscle & Fitness)',
     'https://www.eonline.com/news/644338/dwayne-the-rock-johnson-s-daily-diet-plan-revealed-7-meals-36-ounces-of-cod-and-approximately-4-131-calories'),
    ('538-2015', 'Dwayne ‘The Rock’ Johnson Eats About 821 Pounds of Cod per Year', 'FiveThirtyEight (Walt Hickey), April 2015',
     'https://fivethirtyeight.com/features/dwayne-the-rock-johnson-eats-about-821-pounds-of-cod-per-year/'),
    ('mh-2020', 'The Rock Used This ‘12 Labors’ Diet to Build Muscle Quickly for Hercules', 'Men’s Health (Edward Cooper), 2020',
     'https://www.menshealth.com/nutrition/a32447211/dwayne-johnson-12-labors-diet/'),
]

FSIS_LEFT = {'name': 'Leftovers and Food Safety (USDA FSIS)', 'url': 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety', 'what': 'refrigerate within 2 hours, eat within 3 to 4 days, reheat to 165°F'}


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
            'plate': True, 'credits': [FSIS_LEFT],
        })
    return out


def estimate(foods):
    """kcal and protein for raw/as-bought grams, from the catalog's USDA numbers (edible share applied)."""
    k = p = 0.0
    for item, g in foods:
        it = B.catalog[item]
        n = it['nutrition']
        e = g * (it.get('edible') or 1) / 100
        k += n['kcal'] * e
        p += n['protein'] * e
    return k, p


def to_grams(it, amount, unit):
    m, v = B.meta['units']['mass'], B.meta['units']['volume']
    if unit in m:
        return amount * m[unit]
    if unit in v:
        return amount * v[unit] * it['g_per_cup'] / v['cup'] if it['g_per_cup'] else None
    return amount * it['counts'][unit] if unit in (it.get('counts') or {}) else None


def per_serving(r):
    """kcal, protein, fat, carb, fiber, sodium per serving, the way check-data.js and model.js add them up."""
    tot = dict.fromkeys(['kcal', 'protein', 'fat', 'carb', 'fiber', 'sodium'], 0.0)
    for i in r['ingredients']:
        if i.get('optional') or i.get('in_nutrition') is False:
            continue
        it = B.catalog[i['item']]
        g = to_grams(it, i['amount'], i['unit']) * (it.get('edible') or 1)
        for k in tot:
            tot[k] += (it['nutrition'].get(k) or 0) * g / 100
    return {k: round(v / r['servings']) for k, v in tot.items()}


def main():
    out = build(RECIPES)
    rec_ids = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != 'plates.json':
            rec_ids |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    shown = []
    for g in PLATES:
        for i in g['items']:
            if i not in rec_ids:
                raise SystemExit(f'plates {g["id"]}: unknown recipe {i}')
            shown.append(i)
    for col in SIDES.values():
        for i in col:
            if i not in rec_ids:
                raise SystemExit(f'sides: unknown recipe {i}')
    missing = {r['id'] for r in out} - set(shown)
    if missing:
        raise SystemExit(f'new plates not on the page: {missing}')
    for i in DAY:
        if i not in {r['id'] for r in out}:
            raise SystemExit(f'day: {i} is not a new plate')
    allrec = {r['id']: r for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != 'plates.json':
            allrec.update({r['id']: r for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']})
    allrec.update({r['id']: r for r in out})
    nutr = {i: per_serving(allrec[i]) for i in dict.fromkeys(shown + DAY + [x for c in SIDES.values() for x in c])}
    reported, tk, tp = [], 0.0, 0.0
    for m in REPORTED:
        if m['plate'] not in rec_ids:
            raise SystemExit(f'reported meal {m["n"]}: unknown plate {m["plate"]}')
        k, p = estimate(m['est'])
        tk += k
        tp += p
        reported.append({'n': m['n'], 'foods': m['foods'], 'how': m['how'], 'plate': m['plate'], 'kcal': round(k), 'protein': round(p)})
    plan = {'groups': PLATES, 'sides': SIDES, 'day': DAY, 'new': [r['id'] for r in out], 'nutr': nutr,
            'day_total': {k: sum(nutr[i][k] for i in DAY) for k in ('kcal', 'protein')},
            'reported': {'meals': reported, 'kcal': round(tk, -1), 'protein': round(tp),
                         'published': 'about 4,100 (E! Online) to 5,200 (FiveThirtyEight) calories, counting everything'},
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    path = os.path.join(SITE, 'data/meals/recipes', 'plates.json')
    with open(path, 'w') as fh:
        json.dump({'note': 'Simple plates, all day (/meal-prep/simple-plates/): new plate recipes plus the page plan, which reuses recipes from the other files by id. '
                           'Edit scripts/meals/src/build_plates.py and run it; allergens, diet and guides are derived from the catalog.',
                   'plates': plan, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print('plates.json', len(out), 'new recipes; reported day', round(tk), 'kcal', round(tp), 'g protein')


if __name__ == '__main__':
    main()
