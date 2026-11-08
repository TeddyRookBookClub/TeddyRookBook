#!/usr/bin/env python3
"""Builds data/meals/recipes/easter.json: the Easter and spring dinner collection at /meal-prep/easter/.

Run:  python3 scripts/meals/src/build_easter.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds
  recipes     the NEW recipes written for this collection (same fields as build_recipes.py; collection='easter')
  collection  the page's plan: courses that mix these with recipes and from-scratch pages already in Meal Prep (by id),
              the ham and lamb table for the timeline tool, and meta (title, url, icon, keywords) for the recipe pages.

Food safety comes only from USDA FSIS and FDA:
  USDA FSIS, Roasting Those "Other" Holiday Meats (325 °F; lamb leg 20 to 26 min per lb, 145 °F and a 3-minute rest;
       fully cooked half ham 18 to 25 min per lb to 140 °F; cook-before-eating half ham 22 to 25 min per lb to 145 °F)
  USDA FSIS, Hams and Food Safety (spiral ham 10 to 18 min per lb; reheat plant-packaged cooked hams to 140 °F, others
       to 165 °F; leftovers 3 to 5 days)
  USDA FSIS, Hard Boiled Tips for Easter (2005): food-grade dye; don't crack the shells; hide eggs away from dirt and pets;
       hiding and hunting no more than 2 hours in all; refrigerate within 2 hours of cooking and use within a week
  FDA, What You Need to Know About Egg Safety (hard-cooked eggs within 1 week; never more than 2 hours out of the
       refrigerator, 1 hour above 90 °F; don't eat Easter eggs after hiding or playing with them; egg dishes 160 °F)
Where a point is disputed or unclear, it is left out.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

SLUG = 'easter'
T_HAM = ('fully cooked ham, reheated', 140, 0)
T_LAMB = ('lamb roast', 145, 3)
T_EGGS = ('egg dishes', 160, 0)
T_LEFT = ('leftover ham, reheated', 165, 0)

RAW_DOUGH = 'Don’t taste the raw batter: raw flour and raw eggs can carry germs (FDA and CDC).'
LEFT_HAM = ('Refrigerate sliced ham within 2 hours. Use leftovers from a ham you heated within 3 to 5 days, or freeze them 1 to 2 months (USDA). Reheat to 165°F, or eat cold.', 'lunch')

RECIPES = []


def R(**kw):
    kw.setdefault('collection', SLUG)
    RECIPES.append(kw)


# =====================================================================  HAM AND LAMB
R(id='bone-in-glazed-ham', name='Honey-Orange Glazed Bone-In Ham', emoji='🍖', servings=20, serving_size='about ⅓ lb as bought (with bone)',
  meal=['dinner'], protein='pork', method=['oven', 'stovetop'], tags=['leftovers'], prep=20, cook=150, inactive=15,
  equipment=['roasting pan with a rack', 'foil', 'small saucepan', 'pastry brush', 'sharp knife', 'food thermometer'],
  summary='A fully cooked bone-in half ham, scored in diamonds, warmed slowly at 325°F and lacquered with honey, orange and mustard. The bone goes into soup afterward.',
  ingredients='''
7 lb bone-in-ham | fully cooked half ham (shank or butt end)
1 cup water | for the pan
Glaze:
1/2 cup honey
1/2 cup brown-sugar | packed
1/3 cup orange-juice
1 each orange | zest only
2 tbsp dijon-mustard
1/4 tsp cloves | ground
''',
  steps=[
    'Read the label. This recipe is for a fully cooked ham. A ham labeled “cook before eating” must reach 145°F and rest 3 minutes; it takes 22 to 25 minutes per pound for a half ham (USDA).',
    'Heat the oven to 325°F. Trim the skin off if there is any, leaving a ¼-inch layer of fat. Score the fat in a diamond pattern, ¼ inch deep.',
    'Set the ham cut side down on the rack in the pan, pour the water into the pan, and cover the ham loosely with foil so it doesn’t dry out.',
    'Bake. USDA’s guide for a fully cooked bone-in half ham at 325°F is 18 to 24 minutes per pound: 2 to 2¾ hours for 7 lb. Fully cooked ham is safe cold; you’re warming it to 140°F, USDA’s temperature for reheating a ham packaged at an inspected plant.',
    'While it bakes, simmer the honey, brown sugar, orange juice, zest, mustard and ground cloves 3 to 4 minutes until syrupy.',
    'About 30 minutes before it’s done, take off the foil, turn the oven to 400°F, and brush the ham with a third of the glaze. Brush twice more, 10 minutes apart, until glossy and browned at the edges. Watch it: sugar burns quickly.',
    'Check that the thickest part reads 140°F on a food thermometer, not touching bone. Rest 15 minutes, then carve: cut along the bone to free large pieces, then slice them across the grain.',
  ],
  safety=[T_HAM],
  make_ahead='Make the glaze up to 3 days ahead and warm it before brushing.',
  freezer=(True, 'Freeze sliced leftover ham 1 to 2 months for best quality (USDA). Freeze the bone for soup.'),
  leftovers=LEFT_HAM,
  kids='Kids can zest the orange and brush on the glaze (with oven mitts, once the pan is out).',
  swaps={'spiral': 'For a spiral-cut ham, see our brown sugar glazed spiral ham: it heats in 10 to 18 minutes per pound (USDA) and needs no scoring.', 'pineapple': 'Use pineapple juice instead of orange juice and pin pineapple rings to the ham for the last 30 minutes.'},
  prep_day=dict(ahead='Make the glaze.', station='oven', oven_f=325, active=20, keeps_days=4),
  pairs=['classic-scalloped-potatoes', 'honey-glazed-carrots', 'deviled-eggs', 'hot-cross-buns'])

R(id='roast-leg-of-lamb', name='Garlic and Rosemary Roast Leg of Lamb', emoji='🐑', servings=10, serving_size='about 6 oz as bought',
  meal=['dinner'], protein='lamb', method=['oven'], tags=['leftovers'], prep=20, cook=120, inactive=20,
  equipment=['roasting pan with a rack', 'small sharp knife', 'food thermometer', 'foil', 'carving board'],
  summary='A bone-in leg studded with garlic and rubbed with rosemary, lemon and mustard, roasted at 325°F to a rosy 145°F. Serve with mint sauce.',
  ingredients='''
6 lb leg-of-lamb | bone in
6 clove garlic | 3 sliced thin, 3 grated
2 tbsp rosemary | chopped
1 each lemon | zest and juice
2 tbsp dijon-mustard
3 tbsp olive-oil
1 tbsp kosher-salt
1 tsp black-pepper
''',
  steps=[
    'Pat the lamb dry. Trim any thick fat cap to about ¼ inch. With a small knife, make 12 slits about 1 inch deep all over and push a garlic slice into each.',
    'Mix the grated garlic, rosemary, lemon zest and juice, mustard, oil, salt and pepper and rub it all over. You can do this up to a day ahead and refrigerate it.',
    'Heat the oven to 325°F. Set the lamb fat side up on the rack in the pan.',
    'Roast. USDA’s guide for a bone-in leg of lamb at 325°F is 20 to 26 minutes per pound: about 2 to 2½ hours for 6 lb. Start checking 30 minutes before.',
    'It’s done at 145°F (medium-rare) in the thickest part, not touching the bone; go to 160°F for medium. USDA’s minimum for lamb roasts is 145°F with a 3-minute rest.',
    'Tent with foil and rest 15 to 20 minutes. Carve slices across the grain, working around the bone.',
  ],
  safety=[T_LAMB],
  make_ahead='Rub the lamb the day before and refrigerate it uncovered. Make the mint sauce a day ahead.',
  freezer=(True, 'Freeze sliced leftovers 2 to 3 months.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days (USDA). Great in pitas with yogurt sauce.', 'lunch'),
  kids='Kids can strip rosemary and push the garlic slices into the slits (then wash hands well).',
  swaps={'boneless': 'A 4- to 7-lb boneless leg also takes 20 to 26 minutes per pound at 325°F (USDA). Tie it with string so it cooks evenly.', 'no_mustard': 'Leave out the mustard and add another tablespoon of oil.'},
  prep_day=dict(ahead='Rub the lamb with garlic and herbs the night before.', station='oven', oven_f=325, active=20, keeps_days=4),
  pairs=['mint-sauce', 'classic-scalloped-potatoes', 'peas-with-mint'])

R(id='mint-sauce', name='Fresh Mint Sauce', emoji='🌿', servings=8, serving_size='about 2 tablespoons',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['make-ahead'], prep=10, cook=0, inactive=30,
  equipment=['cutting board and knife', 'small bowl', 'kettle or small pan'],
  summary='The bright, sharp British sauce for lamb: chopped mint steeped in sweetened vinegar. Nothing like the green jelly.',
  ingredients='''
1 cup mint | leaves, packed (from about 2 bunches)
1/4 cup sugar
1/4 cup water | boiling
1/3 cup cider-vinegar | or white wine vinegar
1 pinch salt
''',
  steps=[
    'Chop the mint leaves finely with the sugar sprinkled over them; the sugar keeps the mint from bruising and helps it chop.',
    'Scrape into a bowl, pour the boiling water over, and stir until the sugar dissolves.',
    'Stir in the vinegar and salt. Let it stand at least 30 minutes. Taste: add a little more sugar if it’s too sharp.',
  ],
  safety=[],
  make_ahead='Make up to 2 days ahead and refrigerate; it darkens a little but tastes the same.',
  freezer=(False, ''),
  leftovers=('Keep covered in the refrigerator up to 1 week.', None),
  kids='Kids can pick the mint leaves off the stems.',
  swaps={'honey': 'Use 3 tablespoons honey instead of the sugar.'},
  prep_day=None,
  pairs=['roast-leg-of-lamb', 'rosemary-lamb-chops'])

# =====================================================================  EGGS
R(id='hard-cooked-eggs', name='Hard-Cooked Eggs for Dyeing and Eating', emoji='🥚', servings=12, serving_size='1 egg',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'lunchbox', 'kid-friendly'], prep=5, cook=15, inactive=15,
  equipment=['large saucepan with a lid', 'slotted spoon', 'large bowl of ice water', 'egg carton or tray'],
  summary='Firm, evenly set eggs with no green ring, ready to dye, devil or slice. Steaming makes them easier to peel.',
  ingredients='''
12 each eggs | large, uncracked
''',
  steps=[
    'Check every egg and set aside any with cracks; cracked eggs let germs in and shouldn’t be dyed (USDA).',
    'Boil method: lay the eggs in one layer in the pan and cover with cold water by 1 inch. Bring to a full boil, cover, turn off the heat, and let them stand 12 minutes for large eggs.',
    'Steam method (easier to peel): bring 1 inch of water to a boil in the pan, set the eggs in a steamer basket or right in the water, cover, and steam 12 to 13 minutes.',
    'Lift the eggs into ice water and cool 15 minutes. The yolks and whites should be firm all the way through.',
    'Dry them and refrigerate right away in the carton. To dye them, use food-grade dyes and keep them out of the refrigerator only while you work (see the egg-dyeing guide on the Easter page).',
    'Refrigerate within 2 hours of cooking and eat within 1 week (FDA and USDA).',
  ],
  safety=[],
  make_ahead='Cook and dye up to 3 days before Easter so they’re still within the week when you eat them.',
  freezer=(False, 'Hard-cooked whites turn rubbery in the freezer.'),
  leftovers=('Refrigerate in or out of the shell and eat within 1 week of cooking. Never leave them out of the refrigerator more than 2 hours (1 hour above 90°F).', None),
  kids='Kids can set eggs in the pan with a spoon (cold water only) and, of course, dye them.',
  swaps={'older_eggs': 'Eggs a week or two old peel more easily than very fresh ones.'},
  prep_day=dict(ahead='Cook eggs up to 3 days ahead.', station='stove', oven_f=None, active=5, keeps_days=7),
  pairs=['deviled-eggs', 'egg-salad-sandwiches'])

R(id='egg-salad-sandwiches', name='Classic Egg Salad Sandwiches', emoji='🥪', servings=6, serving_size='1 sandwich',
  meal=['lunch'], protein='vegetarian', method=['no-cook'], tags=['quick', 'lunchbox', 'leftovers'], prep=15, cook=0,
  equipment=['bowl', 'fork or pastry blender', 'knife'],
  summary='Creamy egg salad with celery and chives on soft bread. A good use for the eggs you dyed and kept in the refrigerator, not the ones that went on the hunt.',
  ingredients='''
8 each eggs | hard-cooked and peeled, kept refrigerated
1/3 cup mayonnaise
1 tsp dijon-mustard
1 stalk celery | finely chopped
2 tbsp chives | snipped
1/4 tsp salt
~1/4 tsp black-pepper
12 slice white-bread | or whole wheat
6 leaf green-leaf-lettuce
''',
  steps=[
    'Use eggs that stayed in the refrigerator (and were out no more than 2 hours in all). FDA advises not eating eggs that were hidden or played with.',
    'Chop or mash the eggs with a fork. Stir in the mayonnaise, mustard, celery, chives, salt and pepper.',
    'Spread on 6 slices of bread, add lettuce, and top with the rest.',
  ],
  safety=[],
  make_ahead='Make the egg salad a day ahead and keep it cold.',
  freezer=(False, ''),
  leftovers=('Keep the egg salad refrigerated and eat it within 3 to 4 days, and within a week of cooking the eggs. Pack it with an ice pack.', 'lunch'),
  kids='Kids can peel and mash the eggs.',
  swaps={'lighter': 'Use plain Greek yogurt for half the mayonnaise.', 'gluten_free': 'Serve in lettuce cups.'},
  prep_day=None,
  pairs=['hard-cooked-eggs'])

# =====================================================================  POTATOES AND SPRING VEGETABLES
R(id='classic-scalloped-potatoes', name='Classic Scalloped Potatoes', emoji='🥔', servings=8, serving_size='about 1 cup',
  meal=['side'], protein='vegetarian', method=['oven', 'stovetop'], tags=['make-ahead'], prep=25, cook=75, inactive=10,
  equipment=['9-by-13-inch baking dish', 'saucepan', 'whisk', 'mandoline with its hand guard, or a sharp knife', 'foil'],
  summary='Thin potato slices baked in a garlicky cream sauce until tender, with a golden top. No cheese: that would make them au gratin.',
  ingredients='''
3 lb russet-potato | peeled, sliced ⅛ inch thick
3 tbsp unsalted-butter
1 each shallot | minced
2 clove garlic | minced
3 tbsp flour
2 1/2 cup whole-milk
1 cup heavy-cream
1 1/2 tsp kosher-salt
1/2 tsp black-pepper
1/8 tsp nutmeg
1 tsp thyme | leaves
''',
  steps=[
    'Heat the oven to 375°F and butter the dish. Slice the potatoes; use the mandoline’s guard, never bare fingers.',
    'Melt the butter in the saucepan, cook the shallot and garlic 2 minutes, then whisk in the flour for 1 minute.',
    'Whisk in the milk and cream and bring to a simmer, whisking, until it thickens slightly. Stir in the salt, pepper, nutmeg and thyme.',
    'Layer a third of the potatoes in the dish, overlapping, and pour over a third of the sauce. Repeat twice.',
    'Cover with foil and bake 45 minutes. Uncover and bake 25 to 30 minutes more, until a knife slides through easily and the top is golden. Rest 10 minutes.',
  ],
  safety=[],
  make_ahead='Bake a day ahead, refrigerate, and reheat covered at 350°F for 30 to 40 minutes, to 165°F.',
  freezer=(False, 'Cream sauces can separate when frozen.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. Reheat to 165°F.', None),
  kids='Kids can layer the slices like fish scales.',
  swaps={'au_gratin': 'Scatter 1½ cups shredded Gruyère or cheddar between the layers and on top.', 'lighter': 'Use all milk and no cream.'},
  prep_day=dict(ahead='Bake a day ahead and reheat.', station='oven', oven_f=375, active=25, keeps_days=4),
  pairs=['bone-in-glazed-ham', 'roast-leg-of-lamb'])

R(id='honey-glazed-carrots', name='Honey Butter Glazed Carrots', emoji='🥕', servings=6, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=10, cook=20,
  equipment=['large skillet with a lid'],
  summary='Carrots simmered in a little water, then glazed with butter and honey until shiny. Use slim spring carrots with their tops trimmed if you find them.',
  ingredients='''
2 lb carrot | peeled, cut on the diagonal ½ inch thick
1/2 cup water
2 tbsp unsalted-butter
2 tbsp honey
1/2 tsp salt
1 tbsp parsley | or dill, chopped
1 tsp lemon-juice
''',
  steps=[
    'Put the carrots, water, butter, honey and salt in the skillet. Cover and simmer 8 to 10 minutes, until just tender.',
    'Uncover and boil, stirring, until the liquid cooks down to a glaze that coats the carrots, 5 to 8 minutes.',
    'Stir in the parsley and lemon juice.',
  ],
  safety=[],
  make_ahead='Peel and cut the carrots a day ahead.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days.', None),
  kids='Kids can peel carrots with a vegetable peeler.',
  swaps={'vegan': 'Use olive oil and maple syrup.'},
  prep_day=None,
  pairs=['bone-in-glazed-ham'])

R(id='peas-with-mint', name='Buttered Peas with Mint', emoji='🫛', servings=6, serving_size='about ½ cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['quick', 'budget', 'kid-friendly'], prep=5, cook=10,
  equipment=['saucepan'],
  summary='Sweet peas warmed with butter, shallot and fresh mint: the classic spring partner for lamb, ready in 15 minutes.',
  ingredients='''
1 lb frozen-peas | or shelled fresh peas
2 tbsp unsalted-butter
1 each shallot | minced
1/4 cup water
2 tbsp mint | chopped
1/2 tsp salt
1 tsp lemon-juice
''',
  steps=[
    'Melt the butter in the pan and cook the shallot until soft, 2 minutes.',
    'Add the peas and water, cover, and cook 4 to 5 minutes, until hot and bright green.',
    'Stir in the mint, salt and lemon juice.',
  ],
  safety=[],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days.', None),
  kids='Kids can tear the mint.',
  swaps={'dairy_free': 'Use olive oil.'},
  prep_day=None,
  pairs=['roast-leg-of-lamb'])

R(id='strawberry-spinach-salad', name='Strawberry Spinach Salad', emoji='🍓', servings=6, serving_size='about 2 cups',
  meal=['side', 'lunch'], protein='vegetarian', method=['no-cook'], tags=['quick'], prep=15, cook=0,
  equipment=['large bowl', 'jar with a lid'],
  summary='Baby spinach, sliced strawberries, red onion and crumbled feta with a honey-balsamic dressing. Add toasted almonds if your table eats nuts.',
  ingredients='''
10 oz spinach | baby
1 lb strawberries | hulled and sliced
1/4 each red-onion | thinly sliced
1/2 cup feta | crumbled, or goat cheese
?1/3 cup almonds | sliced and toasted
Dressing:
1/4 cup olive-oil
2 tbsp balsamic-vinegar
1 tbsp honey
1 tsp dijon-mustard
1/4 tsp salt
''',
  steps=[
    'Shake the dressing ingredients in a jar.',
    'Toss the spinach, strawberries and onion in a big bowl.',
    'Just before serving, toss with the dressing and scatter the feta and almonds on top.',
  ],
  safety=[],
  make_ahead='Make the dressing up to a week ahead. Slice the berries a few hours ahead.',
  freezer=(False, ''),
  leftovers=('Dressed salad wilts; refrigerate undressed leftovers and eat within a day.', None),
  kids='Kids can slice strawberries with a butter knife.',
  swaps={'nut_free': 'Leave out the almonds or use toasted sunflower seeds.', 'dairy_free': 'Skip the feta.'},
  prep_day=None,
  pairs=['bone-in-glazed-ham'])

# =====================================================================  BREADS AND DESSERTS
R(id='hot-cross-buns', name='Hot Cross Buns', emoji='✝️', servings=12, serving_size='1 bun',
  meal=['breakfast', 'snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'freezer-friendly'], prep=40, cook=22, inactive=150,
  equipment=['stand mixer with a dough hook, or a big bowl and your hands', '9-by-13-inch pan', 'piping bag or zip-top bag', 'pastry brush'],
  summary='Soft spiced buns with raisins and orange zest, marked with a cross and glazed with warm apricot jam. Traditionally eaten on Good Friday.',
  ingredients='''
Dough:
1 cup whole-milk | warm (about 110°F)
1 package yeast | instant or active dry (2¼ teaspoons)
1/3 cup sugar
4 cup flour
1 tsp salt
1 1/2 tsp cinnamon
1/2 tsp allspice
1/4 tsp nutmeg
1 each eggs
4 tbsp unsalted-butter | softened
3/4 cup raisins | or currants and dried cranberries
1 each orange | zest only
Cross and glaze:
^1/2 cup flour | for the crosses
^1/3 cup water
^1/4 cup jam | apricot, warmed
''',
  steps=[
    'Stir the warm milk, yeast and a pinch of the sugar together; if using active dry yeast, wait 5 minutes until foamy.',
    'Mix in the rest of the sugar, the flour, salt, spices, egg and butter. Knead 8 to 10 minutes (5 in a mixer), until smooth and springy. Knead in the raisins and zest.',
    'Cover and let rise in a warm spot until doubled, 1 to 1½ hours.',
    'Grease the pan. Divide the dough into 12 pieces, roll each into a tight ball, and set them in rows. Cover and let rise until puffy and touching, 45 minutes.',
    'Heat the oven to 375°F. Stir the ½ cup flour and water into a thick paste, pipe lines down each row and then across to make crosses.',
    'Bake 20 to 22 minutes, until deep golden. Brush the hot buns with the warmed jam. Cool a little and pull apart.',
  ],
  safety=[],
  make_ahead='Shape the buns, cover, and refrigerate overnight; let them rise at room temperature about 1 hour before baking.',
  freezer=(True, 'Freeze baked buns up to 2 months. Warm from frozen at 325°F for 10 minutes.'),
  leftovers=('Keep covered at room temperature 2 days. Split and toast older buns with butter.', None),
  kids='Kids can roll the balls and pipe the crosses.',
  swaps={'icing_cross': 'Pipe crosses of powdered-sugar icing on the cooled buns instead of the flour paste.', 'chocolate': 'Use chocolate chips instead of raisins.'},
  prep_day=dict(ahead='Shape and refrigerate overnight.', station='oven', oven_f=375, active=40, keeps_days=2),
  pairs=['bone-in-glazed-ham'])

R(id='carrot-cake', name='Carrot Cake with Cream Cheese Frosting', emoji='🥕', servings=16, serving_size='1 slice',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=40, cook=35, inactive=120,
  equipment=['two 9-inch round cake pans', 'parchment paper', 'box grater or food processor', 'mixer', 'cooling racks', 'offset spatula'],
  summary='A moist, spiced two-layer cake full of grated carrots, with tangy cream cheese frosting. Walnuts are optional.',
  ingredients='''
Cake:
2 cup flour
2 tsp baking-powder
1 tsp baking-soda
1/2 tsp salt
2 tsp cinnamon
1/2 tsp ginger-ground
1/4 tsp nutmeg
4 each eggs
1 cup sugar
1 cup brown-sugar | packed
1 cup canola-oil
2 tsp vanilla
3 cup carrot | finely grated (about 1 lb)
?1 cup walnuts | chopped, optional
Frosting:
8 oz cream-cheese | softened
1/2 cup unsalted-butter | softened
3 cup powdered-sugar
1 tsp vanilla
''',
  steps=[
    'Heat the oven to 350°F. Grease the pans, line the bottoms with parchment, and grease again.',
    'Whisk the flour, baking powder, baking soda, salt and spices.',
    'In another bowl whisk the eggs, both sugars, oil and vanilla until smooth. Stir in the dry ingredients, then the carrots and walnuts. ' + RAW_DOUGH,
    'Divide between the pans and bake 30 to 35 minutes, until a toothpick in the center comes out clean. Cool 10 minutes, turn out, and cool completely.',
    'Beat the cream cheese and butter until smooth, then beat in the powdered sugar and vanilla until fluffy.',
    'Set one layer on a plate, spread with a third of the frosting, top with the second layer, and frost the top and sides. Chill 30 minutes before slicing.',
  ],
  safety=[],
  make_ahead='Bake the layers up to 2 days ahead and wrap them; frost the day before.',
  freezer=(True, 'Freeze unfrosted layers up to 3 months, or the frosted cake (chilled firm first, then wrapped) up to 1 month.'),
  leftovers=('Keep the frosted cake covered in the refrigerator up to 5 days; let slices stand 20 minutes before eating.', None),
  kids='Kids can grate carrots with a grown-up (watch knuckles) and spread the frosting.',
  swaps={'sheet_cake': 'Bake in a 9-by-13-inch pan for 40 to 45 minutes and frost the top only.', 'pineapple': 'Add ½ cup well-drained crushed pineapple with the carrots.'},
  prep_day=dict(ahead='Bake the layers a day or two ahead.', station='oven', oven_f=350, active=40, keeps_days=5),
  pairs=['lemon-bars'])

R(id='lemon-bars', name='Lemon Bars', emoji='🍋', servings=16, serving_size='1 bar (2 inches square)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=20, cook=45, inactive=120,
  equipment=['8- or 9-inch square pan', 'parchment paper', 'mixing bowls', 'whisk', 'sieve'],
  summary='A buttery shortbread crust under a tart, silky lemon layer, dusted with powdered sugar. Sunny on a spring table.',
  ingredients='''
Crust:
1 cup flour
1/4 cup powdered-sugar
1/4 tsp salt
1/2 cup unsalted-butter | melted
Lemon layer:
3 each eggs
1 cup sugar
3 tbsp flour
2 each lemon | zest of 1, juice of both (about ½ cup)
^1 tbsp powdered-sugar | for dusting
''',
  steps=[
    'Heat the oven to 350°F. Line the pan with parchment, leaving overhang.',
    'Stir the flour, powdered sugar, salt and melted butter into a soft dough. Press it evenly into the pan and bake 18 to 20 minutes, until light golden.',
    'Whisk the eggs, sugar, flour, zest and lemon juice until smooth.',
    'Pour over the hot crust and bake 20 to 25 minutes, until the filling is set and doesn’t wobble in the center. A thermometer in the center reads above 160°F, the temperature for egg dishes.',
    'Cool, then chill at least 2 hours. Lift out, cut into 16 squares, and dust with powdered sugar.',
  ],
  safety=[T_EGGS],
  make_ahead='Bake up to 2 days ahead and keep in the refrigerator; dust with sugar just before serving.',
  freezer=(True, 'Freeze cut bars, not yet dusted, up to 2 months.'),
  leftovers=('Keep covered in the refrigerator up to 4 days.', None),
  kids='Kids can squeeze the lemons and press the crust into the pan.',
  swaps={'lime': 'Use limes instead of lemons.'},
  prep_day=dict(ahead='Bake a day or two ahead.', station='oven', oven_f=350, active=20, keeps_days=4),
  pairs=['carrot-cake'])

# =====================================================================  LEFTOVERS
R(id='ham-and-swiss-sliders', name='Baked Ham and Swiss Sliders', emoji='🧀', servings=6, serving_size='2 sliders',
  meal=['lunch', 'dinner'], protein='pork', method=['oven'], tags=['leftovers', 'kid-friendly'], prep=15, cook=25,
  equipment=['9-by-13-inch baking dish', 'serrated knife', 'small saucepan or microwave bowl', 'pastry brush', 'foil', 'food thermometer'],
  summary='A tray of soft rolls filled with leftover ham and Swiss cheese, brushed with mustard butter and baked until melty. The day-after lunch everyone asks for.',
  ingredients='''
12 each hawaiian-rolls | or other soft dinner rolls, in one slab
1 lb bone-in-ham | cooked leftover ham, thinly sliced (weighed without the bone)
6 slice swiss
3 tbsp unsalted-butter | melted
1 tbsp dijon-mustard
1 tsp worcestershire
1 tsp sesame-seeds | or poppy seeds
1/2 tsp onion-powder
''',
  steps=[
    'Heat the oven to 350°F. Without separating the rolls, slice the whole slab in half horizontally. Set the bottom in the dish.',
    'Layer on the ham, then the cheese, and put the top back on.',
    'Mix the butter, mustard, Worcestershire, sesame seeds and onion powder and brush it over the top.',
    'Cover with foil and bake 15 minutes, then uncover and bake 8 to 10 minutes more, until the cheese melts, the tops are golden and the ham in the middle reaches 165°F (USDA’s temperature for reheating leftovers).',
    'Cut along the roll lines and serve warm.',
  ],
  safety=[T_LEFT],
  make_ahead='Assemble up to a day ahead, cover and refrigerate; brush with the butter just before baking and add 5 minutes.',
  freezer=(True, 'Freeze assembled, unbaked sliders up to 1 month; bake from thawed.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days, and within 5 days of cooking the ham.', 'lunch'),
  kids='Kids can layer the ham and cheese and brush on the topping.',
  swaps={'turkey': 'Use leftover turkey and cheddar.', 'sesame_free': 'Use poppy seeds or leave them off.'},
  prep_day=dict(ahead='Assemble the night before.', station='oven', oven_f=350, active=15, keeps_days=3),
  pairs=['bone-in-glazed-ham'])

# =====================================================================  COLLECTION (the page's plan)
META = {'title': 'Easter and spring dinner', 'url': 'meal-prep/easter/', 'icon': '🐣',
        'blurb': 'Easter and spring dinner collection',
        'keywords': ['Easter', 'Easter dinner', 'Easter ham', 'leg of lamb', 'hot cross buns', 'dyeing eggs', 'spring', 'holiday']}
COURSES = [
    {'id': 'ham', 'title': 'Ham', 'icon': '🍖',
     'intro': 'Most hams sold for Easter are already fully cooked, so you’re warming them through. A bone-in half ham has the best flavor and a bone for soup; a spiral ham is the easiest to serve.',
     'items': ['r:bone-in-glazed-ham', 'r:brown-sugar-glazed-ham']},
    {'id': 'lamb', 'title': 'Lamb', 'icon': '🐑',
     'intro': 'Lamb is the traditional Easter meat in much of Europe and the Middle East. Roast a whole leg for a crowd, or sear chops for a few.',
     'items': ['r:roast-leg-of-lamb', 'r:mint-sauce', 'r:rosemary-lamb-chops']},
    {'id': 'eggs', 'title': 'Eggs', 'icon': '🥚',
     'intro': 'Cook a dozen early in the week: some to dye, some to devil, and the rest for egg salad. Keep the eggs you’ll eat separate from the ones that go on the hunt.',
     'items': ['r:hard-cooked-eggs', 'r:deviled-eggs', 'r:egg-salad-sandwiches', 'r:spring-vegetable-frittata', 'r:ham-cheddar-quiche']},
    {'id': 'sides', 'title': 'Potatoes and spring vegetables', 'icon': '🌱',
     'intro': 'Scalloped potatoes share the oven with the ham; everything else cooks on the stove or needs no cooking.',
     'items': ['r:classic-scalloped-potatoes', 'r:honey-glazed-carrots', 'r:peas-with-mint', 'r:lemon-parmesan-asparagus', 'r:asparagus-radish-salad', 'r:strawberry-spinach-salad', 'r:butter-roasted-radishes', 'r:green-salad']},
    {'id': 'breads', 'title': 'Breads', 'icon': '🥖',
     'intro': 'Hot cross buns for Good Friday or Easter breakfast, and rolls for the dinner table.',
     'items': ['r:hot-cross-buns', 'r:parker-house-rolls', 'r:buttermilk-biscuits', 's:soft-buns-rolls', 's:sweet-rolls']},
    {'id': 'desserts', 'title': 'Desserts', 'icon': '🍰',
     'intro': 'Make them the day before.',
     'items': ['r:carrot-cake', 'r:lemon-bars', 'r:mixed-berry-cobbler', 'r:mini-cheesecakes', 's:whipped-cream']},
    {'id': 'brunch', 'title': 'Easter brunch', 'icon': '☀️',
     'intro': 'If your family gathers in the morning instead.',
     'items': ['r:lemon-blueberry-muffins', 'r:cream-scones', 'r:fruit-salad', 'r:eggs-benedict']},
    {'id': 'leftovers', 'title': 'Leftover ham', 'icon': '🍲',
     'intro': 'Refrigerate the ham within 2 hours and use it within 3 to 5 days, or freeze it (USDA). Save the bone for soup.',
     'items': ['r:ham-and-swiss-sliders', 'r:split-pea-ham-soup', 'r:scalloped-potatoes-ham', 'r:cuban-sandwiches', 'r:fried-rice']},
]
SCRATCH = ['soft-buns-rolls', 'sweet-rolls', 'pie-crust', 'whipped-cream', 'butter', 'powdered-sugar', 'mayonnaise', 'vinaigrette']
DEFAULT_MENU = ['bone-in-glazed-ham', 'classic-scalloped-potatoes', 'deviled-eggs', 'honey-glazed-carrots', 'lemon-parmesan-asparagus', 'strawberry-spinach-salad', 'parker-house-rolls', 'carrot-cake']
DAY = {
    'classic-scalloped-potatoes': {'oven': [375, 75]}, 'lemon-parmesan-asparagus': {'oven': [425, 15]}, 'butter-roasted-radishes': {'oven': [425, 20]},
    'parker-house-rolls': {'oven': [375, 18], 'last': True}, 'buttermilk-biscuits': {'oven': [425, 15], 'last': True},
    'honey-glazed-carrots': {'stove': 20}, 'peas-with-mint': {'stove': 10},
    'mint-sauce': {'ahead': 2}, 'deviled-eggs': {'ahead': 1}, 'hard-cooked-eggs': {'ahead': 3}, 'egg-salad-sandwiches': {'ahead': 1},
    'strawberry-spinach-salad': {'stove': 0}, 'asparagus-radish-salad': {'stove': 0}, 'green-salad': {'stove': 0},
    'hot-cross-buns': {'ahead': 1}, 'carrot-cake': {'ahead': 1}, 'lemon-bars': {'ahead': 2}, 'mixed-berry-cobbler': {'oven': [375, 40]}, 'mini-cheesecakes': {'ahead': 2},
}
ROASTS = {
    'bone-in-glazed-ham': {'label': 'Fully cooked half ham, bone in (325°F)', 'oven': 325, 'per_lb': [18, 24], 'lb': [5, 8], 'done': '140°F (USDA, for a fully cooked ham)', 'rest': 15, 'src': 'USDA: 18 to 24 minutes per pound for a 5- to 7-lb half ham', 'glaze': 30},
    'brown-sugar-glazed-ham': {'label': 'Spiral-cut ham, fully cooked (325°F)', 'oven': 325, 'per_lb': [10, 18], 'lb': [7, 9], 'done': '140°F (USDA, for a fully cooked ham)', 'rest': 15, 'src': 'USDA: 10 to 18 minutes per pound for a 7- to 9-lb spiral ham', 'glaze': 20},
    'cook-before-eating-ham': {'label': '“Cook before eating” half ham, bone in (325°F)', 'recipe': 'bone-in-glazed-ham', 'oven': 325, 'per_lb': [22, 25], 'lb': [5, 8], 'done': '145°F, then rest at least 3 minutes (USDA)', 'rest': 15, 'src': 'USDA: 22 to 25 minutes per pound for a 5- to 7-lb half ham', 'glaze': 30},
    'roast-leg-of-lamb': {'label': 'Leg of lamb, bone in (325°F)', 'oven': 325, 'per_lb': [20, 26], 'lb': [5, 9], 'done': '145°F for medium-rare, then rest at least 3 minutes (USDA); 160°F for medium', 'rest': 20, 'src': 'USDA: 20 to 26 minutes per pound for a 5- to 9-lb leg'},
}
EXTRA = {'tool': 'roast', 'eggs': True}
EXTRA_IDS = []
GOALS_EXCLUDE = ['bone-in-glazed-ham', 'roast-leg-of-lamb', 'mint-sauce', 'hot-cross-buns', 'carrot-cake', 'lemon-bars', 'classic-scalloped-potatoes']

SOURCES = [
    ('fsis-roast', 'Roasting Those “Other” Holiday Meats', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/roasting-those-other-holiday-meats'),
    ('fsis-ham', 'Hams and Food Safety', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/hams-and-food-safety'),
    ('fsis-eggs', 'USDA Gives Hard Boiled Tips for Easter and Passover Food Safety (2005, archived)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20090117202512/http://www.fsis.usda.gov/News_&_Events/NR_032105_01/index.asp'),
    ('fda-eggs', 'What You Need to Know About Egg Safety', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-egg-safety'),
]

G = lambda t, what: {'name': t.replace('_', ' ').replace('(', '').replace(')', '') + ' (Grokipedia)', 'url': 'https://grokipedia.com/page/' + t, 'what': what}  # noqa: E731
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for a, b, c, d, w in [
    ('fsis-roast', 'Roasting Those “Other” Holiday Meats', 'USDA FSIS', SOURCES[0][3], 'roasting times, safe temperatures and rest'),
    ('fsis-ham', 'Hams and Food Safety', 'USDA FSIS', SOURCES[1][3], 'heating ham to 140°F; leftovers'),
    ('fsis-eggs', 'Hard Boiled Tips for Easter', 'USDA FSIS, archived', SOURCES[2][3], 'dyeing, hiding and the 2-hour rule'),
    ('fda-eggs', 'What You Need to Know About Egg Safety', 'FDA', SOURCES[3][3], 'hard-cooked eggs within a week; egg dishes to 160°F'),
]}
CREDITS = {
    'bone-in-glazed-ham': [U['fsis-roast'], U['fsis-ham'], G('Ham', 'background')],
    'roast-leg-of-lamb': [U['fsis-roast'], G('Lamb_and_mutton', 'background')],
    'mint-sauce': [G('Mint_sauce', 'background')],
    'hard-cooked-eggs': [U['fsis-eggs'], U['fda-eggs'], G('Easter_egg', 'the custom of decorated eggs')],
    'egg-salad-sandwiches': [U['fda-eggs']],
    'classic-scalloped-potatoes': [G('Scalloped_potatoes', 'scalloped versus au gratin')],
    'hot-cross-buns': [G('Hot_cross_bun', 'Good Friday and the 1592 London rule')],
    'carrot-cake': [G('Carrot_cake', 'background')],
    'lemon-bars': [U['fda-eggs']],
    'ham-and-swiss-sliders': [U['fsis-ham']],
}
NOTE = ('Easter and spring dinner (/meal-prep/easter/): new recipes plus the page plan, which reuses recipes from the other files by id. '
        'Edit scripts/meals/src/build_easter.py and run it; allergens, diet and guides are derived from the catalog.')
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
