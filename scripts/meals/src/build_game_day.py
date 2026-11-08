#!/usr/bin/env python3
"""Builds data/meals/recipes/game-day.json: "Big game day" at /meal-prep/game-day/.

Run:  python3 scripts/meals/src/build_game_day.py      (build the catalog first)
Then: node scripts/meals/check-data.js

New recipes (wings four ways, dips, sliders, nachos and snacks) plus a page plan that reuses the chilis, dips, pizza
and sandwiches already in Meal Prep (by id). The page itself is layouts/meal-prep/occasion.html.

Food safety: FoodSafety.gov (HHS) game-day party guidance and USDA FSIS (safe temperatures, holding hot food at 140°F,
the 2-hour rule). Frying: U.S. Fire Administration cooking fire safety and the Cambridge (MA) Fire Department's
NFPA-based grease-fire advice. Disputed points are left out.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from occasion_lib import G, build, write  # noqa: E402

SLUG = 'game-day'
T_CHICKEN = ('chicken wings', 165, 0)
T_CHICKEN_DIP = ('chicken dip, baked', 165, 0)
T_GROUND = ('ground beef', 160, 0)
T_REHEAT = ('reheated hot dogs and leftovers', 165, 0)

TWOHOURS = 'Set it out for no more than 2 hours, then refrigerate it or swap in a fresh batch from the kitchen (USDA).'
HOT = 'To keep it hot through the game, hold it in a slow cooker on warm or low, at 140°F or above (USDA).'
FRY_SAFE = ('Frying safety: use a deep, heavy pot with plenty of room above the oil, clip on a deep-fry thermometer, and never leave hot oil alone. '
            'Keep a lid or sheet pan beside the stove; if the oil catches fire, turn off the burner and slide the lid over it. Never pour water on a grease fire. '
            'Keep children well back from the stove.')
WING_TEST = 'Check a few of the biggest wings with a food thermometer, not touching bone: they are safe at 165°F (USDA). Wings get more tender and render more fat if you keep going, up to about 175 to 185°F.'
LEFT = ('Refrigerate within 2 hours in shallow containers; eat within 3 to 4 days (USDA). Reheat to 165°F.', None)

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  WINGS
R(id='crispy-baked-buffalo-wings', name='Crispy Baked Buffalo Wings', emoji='🍗', servings=6, serving_size='about 8 wing pieces',
  meal=['snack', 'dinner'], protein='chicken', method=['oven'], tags=['kid-friendly'], prep=15, cook=50,
  equipment=['2 rimmed baking sheets', '2 oven-safe wire racks', 'foil', 'large bowl', 'small saucepan', 'food thermometer'],
  summary='Wings tossed with a little baking powder and salt and baked on racks until the skin turns crisp, without a pot of oil, then coated in classic butter-and-hot-sauce Buffalo sauce.',
  ingredients='''
4 lb chicken-wings | flats and drumettes, tips removed
1 tbsp baking-powder | not baking soda; it helps the skin crisp
1 1/2 tsp kosher-salt
1/2 tsp garlic-powder
Buffalo sauce:
1/2 cup hot-sauce | a cayenne pepper sauce
5 tbsp unsalted-butter
1 tsp honey
?1/4 tsp cayenne | for more heat
For dipping:
1 1/2 cup celery | in sticks
1 1/2 cup carrot | in sticks
''',
  steps=[
    'Heat the oven to 425°F with racks in the upper and lower thirds. Line the baking sheets with foil and set the wire racks on them.',
    'Pat the wings very dry with paper towels. Toss them in a large bowl with the baking powder, salt and garlic powder until lightly coated. Wash your hands.',
    'Spread the wings in one layer on the racks, skin side up, with a little space between them.',
    'Bake 25 minutes. Flip the wings, swap the pans between racks, and bake 20 to 25 minutes more, until deep golden and crisp.',
    WING_TEST,
    'Meanwhile, melt the butter in a small saucepan with the hot sauce and honey, whisking until smooth. Toss the hot wings with the sauce in a clean bowl.',
    'Serve with celery and carrot sticks and blue cheese or ranch dip. ' + TWOHOURS,
  ],
  safety=[T_CHICKEN],
  make_ahead='Toss the wings with the baking powder mix and refrigerate them uncovered on the racks overnight; the skin gets even crisper. Make the sauce up to a week ahead.',
  freezer=(True, 'Freeze baked, unsauced wings up to 3 months. Reheat from frozen at 400°F about 20 minutes, to 165°F, then sauce.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days (USDA). Reheat on a rack at 400°F, about 10 minutes, to 165°F, so they crisp again.', None),
  kids='Kids can toss the wings in sauce (clean bowl, cooked wings) and cut the celery and carrot sticks with a kid-safe knife. Make a batch with mild sauce or just butter and garlic.',
  swaps={'mild': 'Use half hot sauce and half melted butter, or toss in barbecue sauce.', 'dairy_free': 'Melt the hot sauce with 3 tablespoons olive oil instead of butter.'},
  prep_day=dict(ahead='Coat the wings and refrigerate them on the racks overnight.', station='oven', oven_f=425, active=20, keeps_days=4),
  pairs=['homemade-blue-cheese-dip', 'beef-chili', 'loaded-sheet-pan-nachos'])

R(id='fried-buffalo-wings', name='Fried Buffalo Wings', emoji='🔥', servings=6, serving_size='about 8 wing pieces',
  meal=['snack', 'dinner'], protein='chicken', method=['stovetop'], tags=[], prep=15, cook=40,
  equipment=['large, heavy, deep pot or Dutch oven (at least 5 quarts)', 'deep-fry thermometer', 'spider or slotted spoon', 'sheet pan with a wire rack', 'food thermometer', 'a lid or sheet pan that covers the pot', 'large bowl'],
  summary='The original bar-style wing: fried unbreaded until crackly, then tossed in butter and hot sauce. Fry in small batches with a thermometer, and follow the frying safety steps.',
  ingredients='''
4 lb chicken-wings | flats and drumettes, tips removed, patted very dry
1 tsp kosher-salt
^2 quart vegetable-oil | or peanut or canola oil, for frying
Buffalo sauce:
1/2 cup hot-sauce | a cayenne pepper sauce
5 tbsp unsalted-butter
1 tsp honey
''',
  steps=[
    FRY_SAFE,
    'Pat the wings very dry; water makes hot oil spatter. Sprinkle with the salt.',
    'Pour oil into the pot to a depth of about 2 inches, keeping at least 3 to 4 inches of room above it. Heat over medium to 375°F, watching the thermometer. If the oil starts to smoke, turn off the heat.',
    'Lower about a third of the wings into the oil gently with the spider, away from you. Fry 10 to 12 minutes, stirring now and then, until deep golden and crisp. Adjust the heat to keep the oil near 350 to 375°F.',
    'Lift the wings onto the rack to drain. Let the oil come back to 375°F before the next batch.',
    WING_TEST,
    'Melt the butter with the hot sauce and honey and toss the wings in a clean bowl. Turn off the burner and let the oil cool completely, for hours, before straining or throwing it away (in a sealed container, not down the drain).',
  ],
  safety=[T_CHICKEN],
  make_ahead='Make the sauce ahead. Fry just before serving; wings keep crisp on a rack in a 200°F oven for 30 minutes.',
  freezer=(True, 'Freeze fried, unsauced wings up to 3 months; reheat at 400°F to 165°F.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat on a rack at 400°F to 165°F.', None),
  kids='Frying is a grown-up job. Kids can make the celery sticks and the dip, and toss the cooked wings in sauce, away from the stove.',
  swaps={'baked': 'For less mess and no hot oil, make the crispy baked wings instead.', 'peanut_allergy': 'Many people with peanut allergies avoid peanut oil; fry in canola or vegetable oil and tell your guests.'},
  prep_day=dict(ahead='Make the sauce; cut celery and carrot sticks.', station='stove', oven_f=None, active=40, keeps_days=4),
  pairs=['homemade-blue-cheese-dip', 'stovetop-queso', 'cheeseburger-sliders'])

R(id='honey-garlic-wings', name='Sticky Honey-Garlic Wings', emoji='🍯', servings=6, serving_size='about 8 wing pieces',
  meal=['snack', 'dinner'], protein='chicken', method=['oven', 'stovetop'], tags=['kid-friendly'], prep=15, cook=55,
  equipment=['2 rimmed baking sheets', '2 wire racks', 'foil', 'small saucepan', 'large bowl', 'food thermometer'],
  summary='Crisp oven wings glazed with a sweet and savory honey, soy and garlic sauce, sprinkled with sesame seeds and green onions. The wing for people who don’t like heat.',
  ingredients='''
4 lb chicken-wings | flats and drumettes, tips removed
1 tbsp baking-powder
1 tsp kosher-salt
Glaze:
1/3 cup honey
1/4 cup low-sodium-soy-sauce
4 clove garlic | grated
1 tbsp ginger | grated
1 tbsp rice-vinegar
2 tsp cornstarch | mixed with 1 tablespoon water
1 tbsp sesame-seeds | toasted
3 each green-onions | thinly sliced
''',
  steps=[
    'Heat the oven to 425°F. Line the pans with foil and set the racks on them. Pat the wings dry, toss with the baking powder and salt, and spread them out on the racks. Wash your hands.',
    'Bake 25 minutes, flip and swap the pans, then bake 20 to 25 minutes more, until golden and crisp.',
    WING_TEST,
    'Meanwhile, simmer the honey, soy sauce, garlic, ginger and vinegar for 2 minutes. Stir in the cornstarch mix and simmer 1 minute more, until glossy and thick.',
    'Toss the hot wings with the glaze, then put them back on the racks and bake 5 minutes so the glaze sets. Sprinkle with sesame seeds and green onions.',
  ],
  safety=[T_CHICKEN],
  make_ahead='Make the glaze up to 5 days ahead and warm it before tossing.',
  freezer=(True, 'Freeze baked, unglazed wings up to 3 months.'),
  leftovers=LEFT,
  kids='Kids can whisk the glaze ingredients before they heat and sprinkle the sesame seeds.',
  swaps={'gluten_free': 'Use tamari labeled gluten-free.', 'sesame_free': 'Leave off the sesame seeds.'},
  prep_day=dict(ahead='Make the glaze.', station='oven', oven_f=425, active=20, keeps_days=4),
  pairs=['crispy-baked-buffalo-wings', 'game-day-snack-mix'])

R(id='lemon-pepper-wings', name='Lemon-Pepper Wings', emoji='🍋', servings=6, serving_size='about 8 wing pieces',
  meal=['snack', 'dinner'], protein='chicken', method=['oven'], tags=['kid-friendly'], prep=15, cook=50,
  equipment=['2 rimmed baking sheets', '2 wire racks', 'foil', 'large bowl', 'microplane or grater', 'food thermometer'],
  summary='Crisp baked wings tossed in melted butter with lots of fresh lemon zest and cracked black pepper. Bright, salty and not spicy.',
  ingredients='''
4 lb chicken-wings | flats and drumettes, tips removed
1 tbsp baking-powder
1 1/2 tsp kosher-salt
4 tbsp unsalted-butter | melted
2 each lemon | zest of both, juice of 1
2 tsp black-pepper | coarsely cracked
1/2 tsp garlic-powder
1 tbsp parsley | chopped
''',
  steps=[
    'Heat the oven to 425°F and set wire racks in two foil-lined baking sheets. Pat the wings dry, toss with the baking powder and 1 teaspoon of the salt, and spread them out on the racks. Wash your hands.',
    'Bake 25 minutes, flip and swap the pans, and bake 20 to 25 minutes more, until crisp and golden.',
    WING_TEST,
    'Stir the melted butter, lemon zest, 1 tablespoon lemon juice, pepper, garlic powder and the remaining salt in a large bowl. Toss in the hot wings and sprinkle with parsley.',
  ],
  safety=[T_CHICKEN],
  make_ahead='Zest the lemons and mix the seasoning a day ahead.',
  freezer=(True, 'Freeze baked, unseasoned wings up to 3 months.'),
  leftovers=LEFT,
  kids='Kids can zest the lemons (watch fingers) and toss the wings.',
  swaps={'dairy_free': 'Use olive oil instead of butter.'},
  prep_day=dict(ahead='Zest the lemons.', station='oven', oven_f=425, active=20, keeps_days=4),
  pairs=['crispy-baked-buffalo-wings', 'homemade-blue-cheese-dip'])

# =====================================================================  DIPS
R(id='homemade-blue-cheese-dip', name='Homemade Blue Cheese Dip', emoji='🧀', servings=12, serving_size='2 tablespoons (makes about 1½ cups)',
  meal=['snack', 'side'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick'], prep=10, cook=0,
  equipment=['mixing bowl', 'fork', 'whisk'],
  summary='Chunky, tangy blue cheese dressing for wings and celery, made from sour cream, mayonnaise, buttermilk and crumbled blue cheese. Better than bottled, and ready in ten minutes.',
  ingredients='''
1/2 cup sour-cream
1/3 cup mayonnaise
1/4 cup buttermilk | or milk with a squeeze of lemon
1 tsp lemon-juice
?1/2 tsp worcestershire | adds depth; it usually contains anchovies
1/4 tsp garlic-powder
1/4 tsp black-pepper
3/4 cup blue-cheese | crumbled
''',
  steps=[
    'Whisk the sour cream, mayonnaise, buttermilk, lemon juice, Worcestershire (if using), garlic powder and pepper until smooth.',
    'Fold in the blue cheese, mashing a little of it with a fork so it streaks through. Taste and add a pinch of salt if needed.',
    'Refrigerate at least 30 minutes so the flavors blend. Set it out in a bowl over ice. ' + TWOHOURS,
  ],
  safety=[],
  make_ahead='Make up to 4 days ahead; it gets better.',
  freezer=(False, 'Dairy dips separate when frozen.'),
  leftovers=('Keeps 4 days in the refrigerator if it went back in within 2 hours.', None),
  kids='Kids can crumble the cheese and stir.',
  swaps={'ranch': 'Not a blue cheese family? Use our buttermilk ranch.', 'vegetarian': 'The Worcestershire is optional. It usually contains anchovies, so leave it out for vegetarians and anyone avoiding fish.'},
  prep_day=dict(ahead='Make the dip.', station='none', oven_f=None, active=10, keeps_days=4),
  pairs=['crispy-baked-buffalo-wings', 'fried-buffalo-wings'])

R(id='stovetop-queso', name='Stovetop Queso Dip', emoji='🫕', servings=10, serving_size='about ¼ cup (makes about 2½ cups)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['quick', 'kid-friendly'], prep=10, cook=12,
  equipment=['medium saucepan', 'whisk', 'box grater', 'slow cooker or small pot for keeping warm (optional)'],
  summary='Silky, scoopable cheese dip from real cheese: evaporated milk and a little cornstarch keep it smooth, and tomatoes with green chiles give it a little kick.',
  ingredients='''
8 oz cheddar-block | shredded
8 oz monterey-jack | shredded
1 tbsp cornstarch
1 can evaporated-milk | 12 oz
1 can diced-tomatoes-chiles | 10 oz, drained
1/2 tsp cumin
1/4 tsp garlic-powder
?1 each jalapeno | seeded and minced
8 oz tortilla-chips | for serving
''',
  steps=[
    'Toss the shredded cheeses with the cornstarch in a bowl. Shred your own; bagged cheese has an anti-caking coating that can make the dip grainy.',
    'Warm the evaporated milk in a saucepan over medium-low heat until steaming, not boiling.',
    'Add the cheese a handful at a time, whisking until each addition melts before adding more. Keep the heat low; high heat makes cheese stringy.',
    'Stir in the drained tomatoes and chiles, cumin, garlic powder and jalapeño. If it’s too thick, whisk in a splash of milk.',
    'Serve warm with chips. ' + HOT + ' Stir now and then, and add a splash of milk if it thickens.',
  ],
  safety=[],
  make_ahead='Make up to 2 days ahead and reheat gently on the stove or in the slow cooker, stirring, with a splash of milk, until hot (165°F).',
  freezer=(False, 'The dip turns grainy when frozen.'),
  leftovers=('Refrigerate within 2 hours; keeps 3 to 4 days. Reheat gently with a splash of milk.', None),
  kids='Kids can shred cheese with a grown-up watching and add handfuls while a grown-up whisks.',
  swaps={'beefy': 'Stir in ½ lb browned, drained ground beef or chorizo (cooked to 160°F).', 'mild': 'Use plain diced tomatoes and skip the jalapeño.'},
  prep_day=dict(ahead='Shred the cheese.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=['loaded-sheet-pan-nachos', 'homemade-tortilla-chips'])

R(id='buffalo-chicken-dip', name='Baked Buffalo Chicken Dip', emoji='🥣', servings=12, serving_size='about ⅓ cup',
  meal=['snack'], protein='chicken', method=['oven', 'stovetop'], tags=['make-ahead', 'kid-friendly'], prep=15, cook=45,
  equipment=['saucepan', '2 forks', 'mixing bowl', '9-inch pie plate or 2-quart baking dish', 'food thermometer'],
  summary='All the flavor of Buffalo wings in a hot, creamy dip: shredded chicken with cream cheese, hot sauce, ranch and cheddar, baked until bubbling. Serve with celery, crackers or chips.',
  ingredients='''
1 1/2 lb chicken-breast | 2 breasts
8 oz cream-cheese | softened
1/2 cup hot-sauce | a cayenne pepper sauce
1/2 cup ranch-dressing | or blue cheese dip
1 1/2 cup cheddar | shredded, divided
2 each green-onions | sliced
For dipping:
2 cup celery | in sticks
8 oz tortilla-chips
''',
  steps=[
    'Put the chicken in a saucepan, cover with water and bring to a boil. Lower the heat, cover and simmer gently 15 to 18 minutes, until a food thermometer in the thickest part reads 165°F (USDA). Cool a little and shred with two forks.',
    'Heat the oven to 350°F. Stir the cream cheese, hot sauce and ranch until smooth, then mix in the chicken and 1 cup of the cheddar.',
    'Spread in the baking dish and top with the rest of the cheese. Bake 20 to 25 minutes, until bubbling at the edges and hot in the center (165°F). Sprinkle with green onions.',
    'Serve hot. ' + HOT + ' ' + TWOHOURS,
  ],
  safety=[T_CHICKEN_DIP],
  make_ahead='Assemble the dip up to 2 days ahead and refrigerate. Bake it cold from the refrigerator, adding about 10 minutes, until 165°F in the center.',
  freezer=(True, 'Freeze the unbaked dip up to 2 months; thaw in the refrigerator before baking.'),
  leftovers=LEFT,
  kids='Kids can shred the cooled chicken with forks and stir the mix. Make a mild one with half the hot sauce.',
  swaps={'rotisserie': 'Use 3 cups shredded rotisserie chicken and skip step 1.', 'slow_cooker': 'Mix everything in a slow cooker and cook on low 2 hours, stirring once, until 165°F.'},
  prep_day=dict(ahead='Cook and shred the chicken; assemble the dip.', station='oven', oven_f=350, active=20, keeps_days=3),
  pairs=['crispy-baked-buffalo-wings', 'homemade-tortilla-chips'])

# =====================================================================  NACHOS, SLIDERS AND SNACKS
R(id='loaded-sheet-pan-nachos', name='Loaded Sheet-Pan Nachos', emoji='🧀', servings=8, serving_size='about ⅛ of the pan',
  meal=['snack', 'dinner'], protein='beef', method=['sheet-pan', 'oven', 'stovetop'], tags=['kid-friendly'], prep=20, cook=20,
  equipment=['large rimmed baking sheet', 'skillet', 'food thermometer', 'foil or parchment'],
  summary='Tortilla chips spread on a sheet pan and layered twice with seasoned beef, black beans and melted cheese, then piled with fresh toppings so every chip gets some.',
  ingredients='''
1 lb ground-beef-85
2 tbsp taco-seasoning | or our homemade mix
1/3 cup water
12 oz tortilla-chips
1 can black-beans | drained and rinsed
3 cup mexican-cheese | shredded
Toppings:
1 cup fresh-salsa | or pico de gallo
1 each avocado | diced
1/2 cup sour-cream
1 each jalapeno | sliced (optional)
3 each green-onions | sliced
2 tbsp cilantro | chopped
''',
  steps=[
    'Heat the oven to 400°F and line the baking sheet with foil or parchment.',
    'Brown the beef in a skillet over medium-high heat, breaking it up, until no pink remains and a food thermometer reads 160°F (USDA). Drain the fat. Stir in the taco seasoning and water and simmer 2 to 3 minutes until saucy.',
    'Spread half the chips on the pan. Top with half the beef, half the beans and half the cheese. Repeat the layers.',
    'Bake 8 to 10 minutes, until the cheese is melted and bubbling.',
    'Top with salsa, avocado, dollops of sour cream, jalapeños, green onions and cilantro. Serve right away, on the pan.',
  ],
  safety=[T_GROUND],
  make_ahead='Cook the beef a day ahead and refrigerate; reheat it before layering. Chop the toppings a few hours ahead.',
  freezer=(True, 'Freeze the seasoned beef up to 3 months. Nachos themselves don’t keep.'),
  leftovers=('Nachos go soggy; refrigerate leftover beef and toppings separately within 2 hours and use within 3 to 4 days.', None),
  kids='Kids can layer the chips, beans and cheese and add their own toppings at the table.',
  swaps={'vegetarian': 'Skip the beef and use two cans of beans, one of them pinto, warmed with the taco seasoning.', 'chicken': 'Use shredded cooked chicken, or leftover buffalo chicken dip, in place of the beef.'},
  prep_day=dict(ahead='Cook the beef; chop the toppings.', station='oven', oven_f=400, active=25, keeps_days=3),
  pairs=['stovetop-queso', 'guacamole', 'beef-chili'])

R(id='cheeseburger-sliders', name='Sheet-Pan Cheeseburger Sliders', emoji='🍔', servings=12, serving_size='1 slider',
  meal=['snack', 'dinner'], protein='beef', method=['oven', 'sheet-pan'], tags=['kid-friendly'], prep=20, cook=25,
  equipment=['rimmed baking sheet (about 9x13 inches)', 'parchment paper', 'serrated knife', 'food thermometer', 'small bowl'],
  summary='One big seasoned patty baked in a pan, topped with cheese and tucked into a whole sheet of soft rolls, then brushed with butter and baked again. Twelve sliders with no flipping.',
  ingredients='''
1 1/2 lb ground-beef-85
1 tsp kosher-salt
1/2 tsp black-pepper
1 tsp onion-powder
1 tsp worcestershire
6 slice american-cheese | or cheddar
12 each hawaiian-rolls | or other slider rolls, in one sheet
Sauce:
1/4 cup mayonnaise
2 tbsp ketchup
1 tbsp pickle-relish
1/2 cup dill-pickles | sliced
Topping:
2 tbsp unsalted-butter | melted
1 tsp sesame-seeds
''',
  steps=[
    'Heat the oven to 400°F and line the baking sheet with parchment.',
    'Mix the beef with the salt, pepper, onion powder and Worcestershire gently. Press it into an even rectangle on the pan, about the size of the sheet of rolls. Wash your hands.',
    'Bake 12 to 15 minutes, until a food thermometer in the center reads 160°F (USDA). Carefully pour off the fat. Lay the cheese over the top and bake 1 minute to melt.',
    'Slice the sheet of rolls in half sideways without separating them. Set the bottoms in the pan or on a clean sheet, spread with the sauce, and lift the cheesy patty onto them with two wide spatulas. Add the pickles and the tops.',
    'Brush the tops with butter, sprinkle with sesame seeds and bake 5 to 8 minutes, until toasted. Cut into 12 sliders.',
  ],
  safety=[T_GROUND],
  make_ahead='Mix the sauce and shape the patty on its parchment up to a day ahead; keep it covered in the refrigerator.',
  freezer=(True, 'Freeze the raw shaped patty, wrapped well, up to 3 months; thaw in the refrigerator.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat at 350°F, covered, to 165°F.', 'lunch'),
  kids='Kids can mix the sauce, lay on the cheese and pickles, and brush the butter.',
  swaps={'turkey': 'Use ground turkey and cook it to 165°F.', 'sesame_free': 'Leave off the sesame seeds.'},
  prep_day=dict(ahead='Shape the patty; mix the sauce.', station='oven', oven_f=400, active=20, keeps_days=3),
  pairs=['crispy-baked-buffalo-wings', 'loaded-potato-skins'])

R(id='meatball-sliders', name='Meatball Sliders', emoji='🥖', servings=12, serving_size='1 slider',
  meal=['snack', 'dinner'], protein='beef', method=['oven', 'stovetop'], tags=['kid-friendly', 'make-ahead'], prep=30, cook=40,
  equipment=['2 baking sheets', 'parchment paper', 'saucepan', 'mixing bowl', 'food thermometer', '9x13-inch baking dish'],
  summary='Tender homemade meatballs simmered in marinara and tucked into soft rolls with melted mozzarella and a garlic-butter top. Make the meatballs ahead and the sliders take 15 minutes.',
  ingredients='''
Meatballs:
1 lb ground-beef-85
1/2 cup breadcrumbs
1/4 cup parmesan | grated
1 each eggs
3 tbsp whole-milk
2 clove garlic | grated
1 tsp italian-seasoning
3/4 tsp kosher-salt
1/4 tsp black-pepper
Sliders:
2 cup marinara
12 each hawaiian-rolls | in one sheet, or slider buns
1 1/2 cup mozzarella | shredded
2 tbsp unsalted-butter | melted
1/4 tsp garlic-powder
1 tbsp parsley | chopped
''',
  steps=[
    'Heat the oven to 400°F and line a baking sheet. Mix the meatball ingredients gently with your hands, then roll 12 balls, about 1½ inches. Wash your hands.',
    'Bake the meatballs 15 to 18 minutes, until browned and a food thermometer in the center of one reads 160°F (USDA).',
    'Warm the marinara in a saucepan and add the meatballs; simmer 5 minutes.',
    'Lower the oven to 350°F. Slice the sheet of rolls in half sideways and set the bottoms in the baking dish. Space the meatballs on top with a little sauce, cover with the mozzarella and add the roll tops.',
    'Stir the butter, garlic powder and parsley and brush it on the tops. Bake 12 to 15 minutes, until the cheese melts and the tops are golden. Cut apart and serve with extra sauce.',
  ],
  safety=[T_GROUND],
  make_ahead='Bake the meatballs up to 3 days ahead and refrigerate, or freeze them. Reheat in the sauce until 165°F before assembling.',
  freezer=(True, 'Freeze baked meatballs up to 3 months.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat to 165°F.', 'lunch'),
  kids='Kids can roll the meatballs (then wash hands well) and sprinkle the cheese.',
  swaps={'shortcut': 'Use 24 small frozen cooked meatballs, heated in the sauce to 165°F.', 'turkey': 'Use ground turkey and bake the meatballs to 165°F.'},
  prep_day=dict(ahead='Bake the meatballs.', station='oven', oven_f=400, active=30, keeps_days=3),
  pairs=['crispy-baked-buffalo-wings', 'green-salad'])

R(id='loaded-potato-skins', name='Loaded Potato Skins', emoji='🥔', servings=8, serving_size='2 skins',
  meal=['snack', 'side'], protein='pork', method=['oven'], tags=['kid-friendly', 'make-ahead'], prep=20, cook=80,
  equipment=['baking sheet', 'skillet', 'spoon', 'pastry brush'],
  summary='Baked potato halves scooped out, brushed with butter and baked crisp, then filled with cheddar and bacon and finished with sour cream and green onions.',
  ingredients='''
8 each russet-potato | small to medium, scrubbed
3 tbsp unsalted-butter | melted
1 tsp kosher-salt
1/2 tsp black-pepper
8 strip bacon
2 cup cheddar | shredded
1/2 cup sour-cream
4 each green-onions | sliced
''',
  steps=[
    'Heat the oven to 400°F. Prick the potatoes with a fork and bake directly on the rack 50 to 60 minutes, until tender. Cool 10 minutes.',
    'Meanwhile cook the bacon in a skillet until crisp; drain and crumble.',
    'Halve the potatoes lengthwise and scoop out most of the flesh, leaving a ¼-inch shell. (Save the flesh for mashed potatoes or potato soup.)',
    'Raise the oven to 450°F. Brush the skins inside and out with butter, season with salt and pepper, and bake cut side up on a baking sheet 10 to 12 minutes, until crisp.',
    'Fill with cheese and bacon and bake 5 minutes more, until melted. Top with sour cream and green onions.',
  ],
  safety=[],
  make_ahead='Bake and scoop the potatoes and cook the bacon up to 2 days ahead; refrigerate. Crisp and fill just before serving.',
  freezer=(True, 'Freeze crisped, unfilled skins up to 2 months.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat at 400°F until hot (165°F).', None),
  kids='Kids can scoop the cooled potatoes with a spoon and sprinkle the fillings.',
  swaps={'vegetarian': 'Skip the bacon; add sautéed peppers and onions or chopped broccoli.'},
  prep_day=dict(ahead='Bake and scoop the potatoes; cook the bacon.', station='oven', oven_f=450, active=20, keeps_days=2),
  pairs=['cheeseburger-sliders', 'beef-chili'])

R(id='pigs-in-a-blanket', name='Puff Pastry Pigs in a Blanket', emoji='🌭', servings=12, serving_size='3 pieces',
  meal=['snack'], protein='beef', method=['oven'], tags=['kid-friendly'], prep=20, cook=20,
  equipment=['2 baking sheets', 'parchment paper', 'sharp knife or pizza cutter', 'pastry brush'],
  summary='Bite-size pieces of hot dog rolled in strips of flaky puff pastry, brushed with egg and baked golden. Serve with mustard and ketchup.',
  ingredients='''
2 sheet puff-pastry | a 17-oz box, thawed in the refrigerator
9 each hot-dogs | each cut into 4 pieces
1 each eggs | beaten with 1 tablespoon water
?1 tbsp sesame-seeds | or everything-bagel seasoning
For dipping:
~1/4 cup yellow-mustard
~1/4 cup ketchup
''',
  steps=[
    'Heat the oven to 400°F and line the baking sheets with parchment.',
    'Unfold each pastry sheet on a lightly floured counter and cut it into 18 strips, about 1½ inches wide and 3 inches long.',
    'Roll a strip around each hot dog piece, seam side down on the sheet. Brush with egg and sprinkle with sesame seeds.',
    'Bake 18 to 22 minutes, until puffed and deep golden; the hot dogs will be steaming hot (165°F).',
    'Cool 5 minutes and serve with mustard and ketchup. ' + TWOHOURS,
  ],
  safety=[T_REHEAT],
  make_ahead='Roll them up to a day ahead and refrigerate on the sheets, covered; brush with egg and bake when guests arrive.',
  freezer=(True, 'Freeze unbaked on the sheet, then bag them; bake from frozen, adding 5 minutes.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat at 375°F until steaming hot.', None),
  kids='Kids love rolling these. Cut the hot dog pieces in half lengthwise for little ones.',
  swaps={'dough': 'Use our from-scratch pizza dough or biscuit dough, cut in strips.', 'egg_free': 'Brush with milk instead of egg.'},
  prep_day=dict(ahead='Roll them and refrigerate.', station='oven', oven_f=400, active=20, keeps_days=1),
  pairs=['cheeseburger-sliders', 'game-day-snack-mix'])

R(id='homemade-tortilla-chips', name='Baked Homemade Tortilla Chips', emoji='🌮', servings=6, serving_size='about 1 oz (8 chips)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['budget', 'quick'], prep=10, cook=15,
  equipment=['2 baking sheets', 'pastry brush', 'pizza cutter or knife'],
  summary='Corn tortillas cut into wedges, brushed with a little oil and baked crisp. Lighter than fried and they taste of real corn.',
  ingredients='''
12 each corn-tortillas | store-bought or from scratch
2 tbsp vegetable-oil
1/2 tsp kosher-salt
?1 each lime | zest, for lime chips
''',
  steps=[
    'Heat the oven to 375°F with racks in the upper and lower thirds.',
    'Brush both sides of the tortillas lightly with oil. Stack and cut into 6 wedges each.',
    'Spread in one layer on the baking sheets and sprinkle with salt (and lime zest).',
    'Bake 10 to 15 minutes, turning the chips and swapping the pans halfway, until crisp and lightly golden. They crisp more as they cool. Watch closely at the end; they go from golden to burnt quickly.',
  ],
  safety=[],
  make_ahead='Keep cooled chips in an airtight container up to 3 days; recrisp at 350°F for 3 minutes.',
  freezer=(False, 'Best fresh.'),
  leftovers=None,
  kids='Kids can brush the oil, cut wedges with a pizza cutter and sprinkle the salt.',
  swaps={'flour': 'Flour tortillas work too and bake a few minutes faster; they contain wheat.'},
  prep_day=dict(ahead='Bake the chips.', station='oven', oven_f=375, active=10, keeps_days=3),
  pairs=['stovetop-queso', 'guacamole', 'seven-layer-dip'])

R(id='game-day-snack-mix', name='Savory Oven Snack Mix', emoji='🥨', servings=16, serving_size='about ½ cup (makes 8 cups)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=10, cook=60,
  equipment=['large roasting pan or 2 rimmed baking sheets', 'large bowl', 'small saucepan or microwave-safe cup'],
  summary='Crunchy oat and corn cereals, pretzels and cheese crackers tossed in seasoned butter and baked low until toasty. Nut-free as written, so it works for most crowds.',
  ingredients='''
3 cup toasted-oat-cereal
3 cup corn-flakes | or a corn square cereal
2 cup pretzels | small twists or sticks
1 1/2 cup cheese-crackers
Seasoned butter:
6 tbsp unsalted-butter | melted
1 tbsp low-sodium-soy-sauce | or Worcestershire (which usually contains anchovies)
1 tsp garlic-powder
1 tsp onion-powder
1 tsp smoked-paprika
1/2 tsp kosher-salt
''',
  steps=[
    'Heat the oven to 250°F.',
    'Put the cereals, pretzels and crackers in a large bowl. Stir the butter with the soy sauce and seasonings, drizzle it over and toss gently until everything is coated.',
    'Spread in the roasting pan and bake 1 hour, stirring every 15 minutes.',
    'Spread on paper towels to cool; it crisps as it cools. Store airtight.',
  ],
  safety=[],
  make_ahead='Keeps 2 weeks in an airtight container.',
  freezer=(True, 'Freezes up to 3 months in a sealed bag.'),
  leftovers=None,
  kids='Kids can measure everything and toss it in the bowl.',
  swaps={'nuts': 'If no one is allergic, add 1 cup peanuts or mixed nuts.', 'gluten_free': 'Use gluten-free cereals, pretzels and crackers, and tamari labeled gluten-free.'},
  prep_day=dict(ahead='Bake the snack mix.', station='oven', oven_f=250, active=10, keeps_days=14),
  pairs=['honey-garlic-wings', 'homemade-trail-mix'])


# =====================================================================  THE PAGE PLAN
COURSES = [
    {'id': 'wings', 'title': 'Wings, four ways', 'icon': '🍗',
     'intro': 'Baked wings get crisp on a rack with a little baking powder, and they cook two trays at a time while you watch the pregame. Frying is faster per batch but needs a grown-up at the stove the whole time.',
     'items': ['r:crispy-baked-buffalo-wings', 'r:fried-buffalo-wings', 'r:honey-garlic-wings', 'r:lemon-pepper-wings', 'r:homemade-blue-cheese-dip', 'r:buttermilk-ranch']},
    {'id': 'chili', 'title': 'A pot of chili', 'icon': '🌶️',
     'intro': 'Chili is made for game day: cook it the day before, reheat it to 165°F, and keep it warm in a slow cooker with a toppings bar beside it.',
     'items': ['r:beef-chili', 'r:white-chicken-chili', 'r:turkey-white-bean-chili', 'r:black-bean-sweet-potato-chili', 'r:jalapeno-cheddar-cornbread', 'r:cornbread-muffins']},
    {'id': 'dips', 'title': 'Dips', 'icon': '🥣',
     'intro': 'A hot dip, a cold dip and something fresh. Hot dips stay in a slow cooker on warm; cold dips sit in a bowl set in a bigger bowl of ice.',
     'items': ['r:stovetop-queso', 'r:buffalo-chicken-dip', 'r:seven-layer-dip', 'r:spinach-artichoke-dip', 'r:guacamole', 'r:mango-salsa',
               'r:white-bean-herb-dip', 'r:homemade-hummus', 'r:cottage-cheese-dill-dip', 'r:homemade-tortilla-chips', 'r:relish-tray']},
    {'id': 'handhelds', 'title': 'Sliders, nachos and handhelds', 'icon': '🍔',
     'intro': 'Food people can eat standing up, with one hand, without missing a play.',
     'items': ['r:cheeseburger-sliders', 'r:meatball-sliders', 'r:loaded-sheet-pan-nachos', 'r:pigs-in-a-blanket', 'r:loaded-potato-skins', 'r:bbq-pulled-pork',
               'r:sloppy-joes', 'r:philly-cheesesteaks', 'r:sheet-pan-pizza', 'r:chicken-quesadillas']},
    {'id': 'snacks', 'title': 'Snacks and something sweet', 'icon': '🥨',
     'intro': 'Make these days ahead. They sit out safely all game, so they fill the gaps between hot batches.',
     'items': ['r:game-day-snack-mix', 'r:crispy-roasted-chickpeas', 'r:homemade-trail-mix', 'r:deviled-eggs', 'r:peanut-butter-cookies', 'r:oatmeal-raisin-walnut-cookies']},
]
SCRATCH = ['soft-pretzels', 'pizza-dough', 'salsa', 'ranch-dressing', 'corn-tortillas', 'chili-seasoning', 'taco-seasoning', 'soft-buns-rolls']
DEFAULT_MENU = ['crispy-baked-buffalo-wings', 'homemade-blue-cheese-dip', 'beef-chili', 'stovetop-queso', 'seven-layer-dip', 'cheeseburger-sliders', 'game-day-snack-mix']
DAY = {
    'crispy-baked-buffalo-wings': {'oven': [425, 50], 'ahead_part': 'coat the wings and refrigerate them on racks overnight'}, 'fried-buffalo-wings': {'fry': 40},
    'honey-garlic-wings': {'oven': [425, 55], 'ahead_part': 'make the glaze'}, 'lemon-pepper-wings': {'oven': [425, 50]},
    'homemade-blue-cheese-dip': {'ahead': 3}, 'buttermilk-ranch': {'ahead': 3},
    'beef-chili': {'ahead': 2, 'slow': 60}, 'white-chicken-chili': {'ahead': 2, 'slow': 60}, 'turkey-white-bean-chili': {'ahead': 2, 'slow': 60}, 'black-bean-sweet-potato-chili': {'ahead': 2, 'slow': 60},
    'jalapeno-cheddar-cornbread': {'oven': [400, 25]}, 'cornbread-muffins': {'oven': [400, 18]},
    'stovetop-queso': {'stove': 20}, 'buffalo-chicken-dip': {'oven': [350, 30], 'ahead_part': 'assemble the dip'}, 'seven-layer-dip': {'chill': 20},
    'spinach-artichoke-dip': {'oven': [375, 25]}, 'guacamole': {'chill': 15}, 'mango-salsa': {'chill': 20}, 'white-bean-herb-dip': {'ahead': 2}, 'homemade-hummus': {'ahead': 3},
    'cottage-cheese-dill-dip': {'ahead': 2}, 'homemade-tortilla-chips': {'ahead': 2}, 'relish-tray': {'chill': 20},
    'cheeseburger-sliders': {'oven': [400, 25], 'ahead_part': 'shape the patty and mix the sauce'}, 'meatball-sliders': {'oven': [350, 15], 'ahead_part': 'bake the meatballs'},
    'loaded-sheet-pan-nachos': {'oven': [400, 10], 'last': True, 'ahead_part': 'cook the beef and chop the toppings'}, 'pigs-in-a-blanket': {'oven': [400, 20], 'ahead_part': 'roll them'},
    'loaded-potato-skins': {'oven': [450, 17], 'ahead_part': 'bake and scoop the potatoes; cook the bacon'}, 'bbq-pulled-pork': {'ahead': 2, 'slow': 45},
    'sloppy-joes': {'stove': 25}, 'philly-cheesesteaks': {'stove': 25}, 'sheet-pan-pizza': {'oven': [450, 20]}, 'chicken-quesadillas': {'stove': 25},
    'game-day-snack-mix': {'ahead': 7}, 'crispy-roasted-chickpeas': {'ahead': 2}, 'homemade-trail-mix': {'ahead': 7}, 'deviled-eggs': {'ahead': 1},
    'peanut-butter-cookies': {'ahead': 3}, 'oatmeal-raisin-walnut-cookies': {'ahead': 3},
}
HOWMUCH = [
    {'what': 'Wings (single pieces: flats and drumettes)', 'per': 6, 'unit': 'pieces', 'note': 'About 10 if wings are the main event; 3 to 4 lb makes about 40 pieces.'},
    {'what': 'Chili (if one of several dishes)', 'per': 0.75, 'unit': 'cups', 'note': 'A full pot of most chili recipes (about 12 cups) serves 16 this way.'},
    {'what': 'Dips, all kinds together', 'per': 0.33, 'unit': 'cups', 'note': 'Three dips at about 2 tablespoons each.'},
    {'what': 'Chips and crackers', 'per': 2, 'unit': 'oz', 'note': 'A 13-oz bag serves about 6.'},
    {'what': 'Sliders or other handhelds', 'per': 2, 'unit': 'pieces', 'note': 'Fewer if there’s chili; more for teens.'},
    {'what': 'Vegetable sticks for dipping', 'per': 0.5, 'unit': 'cups', 'note': 'Celery and carrots go fastest beside wings.'},
]
GOALS_EXCLUDE = ['crispy-baked-buffalo-wings', 'fried-buffalo-wings', 'honey-garlic-wings', 'lemon-pepper-wings', 'homemade-blue-cheese-dip', 'stovetop-queso', 'buffalo-chicken-dip',
                 'loaded-sheet-pan-nachos', 'cheeseburger-sliders', 'meatball-sliders', 'loaded-potato-skins', 'pigs-in-a-blanket', 'homemade-tortilla-chips', 'game-day-snack-mix']

SOURCES = [
    ('fsgov-party', 'Don’t Let the End Zone Become the Danger Zone (game-day party food safety)', 'FoodSafety.gov, U.S. Department of Health and Human Services', 'https://www.foodsafety.gov/blog/dont-let-end-zone-become-danger-zone-your-guide-hosting-penalty-free-super-bowl-party'),
    ('fsis-temps', 'Safe Temperature Chart', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'),
    ('fsis-grill', 'Grilling Food Safely (holding hot food at 140°F; the 2-hour rule)', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/grilling-food-safely'),
    ('usfa-cooking', 'Cooking Fire Safety', 'U.S. Fire Administration', 'https://www.usfa.fema.gov/prevention/home-fires/prevent-fires/cooking/'),
    ('cfd-grease', 'Safety Tips Related to Kitchen Grease Fires (with NFPA guidance)', 'Cambridge Fire Department', 'https://www.cambridgema.gov/cfd/News/2023/05/cookingfiresafety'),
]
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for (a, b, c, d), w in zip(SOURCES, [
    'party food: batches, ice, 2 hours, 165°F wings', 'safe internal temperatures', 'holding hot food at 140°F', 'stand by your pan; lid nearby', 'never water on a grease fire'])}
CREDITS = {
    'crispy-baked-buffalo-wings': [U['fsgov-party'], G('Buffalo_wing', 'the 1964 Buffalo, New York origin')],
    'fried-buffalo-wings': [U['fsgov-party'], U['usfa-cooking'], U['cfd-grease'], G('Buffalo_wing', 'the 1964 Buffalo, New York origin')],
    'honey-garlic-wings': [U['fsgov-party']], 'lemon-pepper-wings': [U['fsgov-party']],
    'homemade-blue-cheese-dip': [G('Blue_cheese_dressing', 'background'), U['fsgov-party']],
    'stovetop-queso': [G('Chile_con_queso', 'background'), U['fsgov-party']],
    'buffalo-chicken-dip': [U['fsgov-party'], U['fsis-temps']],
    'loaded-sheet-pan-nachos': [G('Nachos', 'the 1943 Piedras Negras origin'), U['fsis-temps']],
    'cheeseburger-sliders': [G('Slider_(sandwich)', 'background'), U['fsgov-party']],
    'meatball-sliders': [U['fsis-temps']],
    'loaded-potato-skins': [G('Potato_skins', 'background')],
    'pigs-in-a-blanket': [G('Pigs_in_blankets', 'background'), U['fsis-temps']],
    'game-day-snack-mix': [G('Snack_mix', 'background')],
}

META = {'anchor': 'your-menu', 'title': 'Big game day', 'url': 'meal-prep/game-day/', 'icon': '🏈', 'blurb': 'Big game day party collection',
        'keywords': ['game day', 'football party', 'wings', 'chili', 'dips', 'queso', 'sliders', 'nachos', 'party food', 'party timeline']}
EVENT = {'label': 'Kickoff (food out)', 'time': '18:30', 'hours': 4, 'hot': False, 'date': 'sunday'}


def main():
    out = build(RECIPES, CREDITS, SLUG)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'day': DAY, 'howmuch': HOWMUCH,
            'full_courses': [], 'goals_exclude': GOALS_EXCLUDE, 'event': EVENT,
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, 'Big game day (/meal-prep/game-day/): new recipes plus the page plan, which reuses recipes from the other files by id. '
                           'Edit scripts/meals/src/build_game_day.py and run it; allergens, diet and guides are derived from the catalog.')


if __name__ == '__main__':
    main()
