#!/usr/bin/env python3
"""Builds data/meals/recipes/thanksgiving.json: the Thanksgiving dinner collection at /meal-prep/thanksgiving/.

Run:  python3 scripts/meals/src/build_thanksgiving.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds
  recipes     the NEW recipes written for the collection (same fields as build_recipes.py; each has collection='thanksgiving')
  collection  the page's plan: courses that mix these new recipes with recipes and from-scratch pages that already
              exist elsewhere in Meal Prep (listed by id, so nothing is copied), oven times for the timeline tool,
              and USDA's thawing and roasting numbers.

Food safety comes only from USDA FSIS (thawing, roasting, stuffing, frying, leftovers), the National Fire Protection
Association and state fire services (outdoor fryers). Where a point is disputed or unclear, it is left out.
  USDA FSIS, Let's Talk Turkey: A Consumer Guide to Safely Roasting a Turkey (timetable, thawing, 1 lb per person, 20-minute rest)
  USDA FSIS, Happy Thanksgiving / Turkey Basics (165 °F in the breast, innermost wing and innermost thigh; stuffing; leftovers)
  USDA FSIS, Stuffing and Food Safety (3/4 cup per pound, loosely; mix wet and dry just before; precook oysters and meat)
  USDA FSIS, Deep Fat Frying and Turkey: Alternate Routes to the Table (12 lb or less; 350 °F oil; 3 to 5 min per lb;
       water to measure the oil; smoker 225 to 300 °F, 8 to 12 lb, unstuffed)
  NFPA / National Park Service, Delaware State Fire School (fryer outdoors away from structures, never in a garage,
       burner off while lowering the bird, grease-rated extinguisher)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

T_TURKEY = ('turkey', 165, 0)
T_STUFFING = ('stuffing and dressing', 165, 0)
T_GROUND = ('ground pork sausage', 160, 0)
T_EGGS = ('egg dishes', 160, 0)
T_REHEAT = ('make-ahead dishes, reheated', 165, 0)
T_LEFTOVERS = ('leftovers, reheated', 165, 0)

THERMO = ('Check the temperature with a food thermometer in three places, not touching bone: the thickest part of the breast, '
          'the innermost part of the thigh and the innermost part of the wing. Every spot must read at least 165°F (USDA).')
REST = 'Let the turkey rest 20 minutes before carving, so the juices settle (USDA). Tent it loosely with foil; it stays hot for 40 minutes or more.'
THAW = 'Thaw a frozen turkey in the refrigerator (about 24 hours for every 4 to 5 lb) or in cold water (about 30 minutes per lb, changing the water every 30 minutes, then cook it right away). See the thawing planner on the Thanksgiving page.'
GIBLETS = 'Take the neck and the bag of giblets out of both ends of the bird; save them for stock. Don’t rinse the turkey: washing raw poultry spreads germs around the sink (USDA). Pat it dry with paper towels and wash your hands.'
LEFT_TURKEY = ('Carve the meat off the bones and refrigerate it within 2 hours; use it within 3 to 4 days or freeze it (USDA). Reheat to 165°F. Make stock from the carcass.', 'dinner')
STUFF_BIRD = ('To stuff the bird instead (USDA): mix the wet and dry ingredients only just before stuffing, spoon it in loosely (about ¾ cup per pound of turkey), '
              'roast right away, and check that the center of the stuffing reaches 165°F. Let the bird stand 20 minutes before taking the stuffing out. Never stuff a turkey ahead of time.')

RECIPES = []


def R(**kw):
    kw.setdefault('collection', 'thanksgiving')
    RECIPES.append(kw)


# =====================================================================  TURKEY
R(id='classic-roast-turkey', name='Classic Roast Turkey', emoji='🦃', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['oven'], tags=['leftovers'], prep=30, cook=180, inactive=20,
  equipment=['large roasting pan with a rack', 'food thermometer', 'paper towels', 'kitchen twine (optional)', 'foil', 'carving board'],
  summary='A golden whole turkey roasted at 325°F the USDA way, with butter, salt and a few vegetables in the pan for gravy. The bird most families picture.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed
4 tbsp unsalted-butter | softened, or olive oil
1 tbsp kosher-salt | or 1½ teaspoons table salt
~1 tsp black-pepper
In the cavity and pan:
1 each onion | quartered
2 stalk celery | in chunks
2 each carrot | in chunks
4 sprig thyme | or rosemary or sage
^2 cup turkey-broth | or water, for the pan
''',
  steps=[
    THAW,
    GIBLETS,
    'Heat the oven to 325°F with a rack in the lower third (USDA advises no lower than 325°F). Set the turkey breast side up on the rack in the pan. Tuck the wing tips under the back so they don’t burn.',
    'Rub the butter all over the skin and sprinkle the salt and pepper over it and inside the cavity. Put half the onion, celery and herbs in the cavity; scatter the rest and the carrots in the pan with the broth. Tie the legs together loosely if you like.',
    'Roast. USDA’s guide times for an unstuffed bird at 325°F: 8 to 12 lb, 2¾ to 3 hours; 12 to 14 lb, 3 to 3¾ hours; 14 to 18 lb, 3¾ to 4¼ hours; 18 to 20 lb, 4¼ to 4½ hours; 20 to 24 lb, 4½ to 5 hours. Start checking 30 minutes before the shortest time.',
    'When the breast is golden, after about 2 hours, cover it loosely with foil so it doesn’t get too dark. Add a little water to the pan if it runs dry.',
    THERMO,
    REST + ' Pour off the pan juices for gravy while it rests, then carve (see the carving guide).',
    STUFF_BIRD + ' A stuffed 8- to 12-lb bird takes 3 to 3½ hours at 325°F.',
  ],
  safety=[T_TURKEY],
  make_ahead='Make the stock, gravy and cranberry sauce days ahead. The day before, take out the giblets, pat the bird dry and refrigerate it uncovered on a tray so the skin dries and browns better.',
  freezer=(True, 'Freeze carved leftover turkey in a little broth or gravy for 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Kids can wash and cut the vegetables with a grown-up, rub butter on the skin (then wash hands well), and read the thermometer.',
  swaps={'dairy_free': 'Use olive oil instead of butter.', 'bigger_bird': 'Scale the servings up; the roasting times for bigger birds are in step 5.'},
  prep_day=dict(ahead='Thaw the turkey; take out the giblets and dry it the night before.', station='oven', oven_f=325, active=30, keeps_days=4),
  pairs=['turkey-gravy-from-drippings', 'classic-bread-stuffing', 'mashed-potatoes', 'homemade-cranberry-sauce'])

R(id='herb-butter-roast-turkey', name='Herb-Butter Roast Turkey', emoji='🌿', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['oven'], tags=['leftovers'], prep=35, cook=180, inactive=20,
  equipment=['large roasting pan with a rack', 'food thermometer', 'small bowl', 'foil', 'carving board'],
  summary='Butter mixed with sage, thyme, rosemary, garlic and lemon zest, spread under the skin so it bastes the breast meat as it roasts.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed
Herb butter:
1/2 cup unsalted-butter | softened (1 stick)
2 tbsp sage | chopped
1 tbsp thyme | leaves
1 tbsp rosemary | chopped
2 tbsp parsley | chopped
3 clove garlic | grated
1 each lemon | zest only; the halves go in the cavity
2 tsp kosher-salt
1 tsp black-pepper
For the pan:
1 each onion | quartered
^2 cup turkey-broth | or water
''',
  steps=[
    THAW,
    GIBLETS,
    'Mash the butter with the herbs, garlic, lemon zest, salt and pepper.',
    'Heat the oven to 325°F with a rack in the lower third. Starting at the neck end, slide your fingers under the skin of the breast to loosen it, working gently so it doesn’t tear. Loosen the skin over the thighs too.',
    'Push about two-thirds of the herb butter under the skin and spread it out by pressing on the outside of the skin. Rub the rest over the outside. Put the lemon halves and onion in the cavity, set the turkey breast side up on the rack, and pour the broth into the pan.',
    'Roast 2¾ to 3 hours for an 8- to 12-lb turkey (USDA’s time for an unstuffed bird at 325°F; bigger birds take longer, see the classic roast turkey). The butter browns quickly, so cover the breast loosely with foil once it’s deep golden.',
    THERMO,
    REST + ' The pan juices are full of herbs and make a fine gravy.',
  ],
  safety=[T_TURKEY],
  make_ahead='Make the herb butter up to 3 days ahead and refrigerate; let it soften before spreading. You can butter the bird the night before and refrigerate it on a tray.',
  freezer=(True, 'Herb butter freezes up to 3 months. Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Kids can strip herb leaves from the stems and mash the herb butter.',
  swaps={'dried_herbs': 'Use 2 teaspoons dried sage, 1 teaspoon dried thyme and 1 teaspoon dried rosemary, crumbled.', 'dairy_free': 'Mix the herbs with ⅓ cup olive oil and rub it under and over the skin.'},
  prep_day=dict(ahead='Make the herb butter; butter the bird the night before.', station='oven', oven_f=325, active=35, keeps_days=4),
  pairs=['turkey-gravy-from-drippings', 'sausage-apple-stuffing', 'make-ahead-mashed-potatoes'])

R(id='dry-brined-turkey', name='Dry-Brined Roast Turkey', emoji='🧂', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['oven'], tags=['make-ahead', 'leftovers'], prep=20, cook=180, inactive=1460,
  equipment=['rimmed baking sheet or roasting pan that fits in the refrigerator', 'roasting pan with a rack', 'food thermometer', 'foil'],
  summary='Salt and herbs rubbed on a day or more ahead. The salt seasons the meat all the way through and dries the skin, so it roasts up crisp. No bucket of brine needed.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed; not basted, self-basting, enhanced or kosher
2 1/2 tbsp kosher-salt | coarse kosher salt; use half as much table salt
1 tbsp brown-sugar
1 tsp black-pepper
2 tsp thyme-dried | or poultry seasoning
1 tsp rosemary-dried | crumbled
2 tbsp olive-oil | or melted butter, for roasting
''',
  steps=[
    'Check the label. A turkey sold as basted, self-basting, enhanced or kosher already has salt added, so don’t brine it; roast it as it is.',
    'One to three days before roasting, take out the neck and giblets and pat the thawed turkey dry. Don’t rinse it.',
    'Mix the salt, brown sugar, pepper and herbs. Sprinkle it evenly over the whole bird, a little more on the thick breast and thighs, and some inside the cavity. Loosen the skin over the breast and rub some under it too.',
    'Set the turkey breast side up on a rack or rimmed sheet and refrigerate it, uncovered or loosely covered, for 1 to 3 days. Keep it on the bottom shelf, away from foods that won’t be cooked. The skin will look dry and a little tight; that’s what you want.',
    'Heat the oven to 325°F. Don’t rinse the bird; the salt has soaked in. Brush the skin with the oil and set it on the rack in the roasting pan.',
    'Roast 2¾ to 3 hours for an 8- to 12-lb turkey (USDA’s time at 325°F, unstuffed; see the classic roast turkey for bigger birds). Dry-brined skin browns fast: tent the breast with foil once it’s golden.',
    THERMO,
    REST + ' Taste the pan juices before salting the gravy; they will be salty.',
  ],
  safety=[T_TURKEY],
  make_ahead='The salting is the make-ahead step: do it 1 to 3 days before you roast.',
  freezer=(True, 'Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Kids can measure and mix the salt and herbs.',
  swaps={'citrus': 'Add the grated zest of an orange or lemon to the salt mix.', 'unsalted_gravy': 'Make the gravy with unsalted stock, since the drippings carry salt.'},
  prep_day=dict(ahead='Salt the turkey 1 to 3 days ahead and refrigerate it uncovered.', station='oven', oven_f=325, active=20, keeps_days=4),
  pairs=['turkey-gravy-from-drippings', 'cornbread-dressing', 'make-ahead-mashed-potatoes'])

R(id='wet-brined-turkey', name='Brined Roast Turkey', emoji='🪣', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['oven', 'stovetop'], tags=['make-ahead', 'leftovers'], prep=30, cook=180, inactive=740,
  equipment=['large food-safe brining bag or a clean container that holds the turkey and fits in your refrigerator', 'large pot', 'roasting pan with a rack', 'food thermometer', 'paper towels'],
  summary='A turkey soaked overnight in cold salt water with brown sugar, peppercorns and bay. Brining makes the meat juicy and well seasoned, and it’s forgiving if the breast runs a little over.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed; not basted, self-basting, enhanced or kosher
Brine (most of it is poured away):
^1 1/2 cup kosher-salt | coarse kosher salt; ¾ cup if using table salt
^1/2 cup brown-sugar
^1 tbsp black-pepper | whole peppercorns
^4 leaf bay-leaves
^1 each orange | quartered (optional)
^1 1/2 gallon water | cold, divided
For roasting:
3 tbsp unsalted-butter | melted, or olive oil
1 each onion | quartered
^2 cup turkey-broth | unsalted, for the pan
''',
  steps=[
    'Check the label first: a basted, self-basting, enhanced or kosher turkey already contains salt, so skip the brine.',
    'Make the brine: heat 4 cups of the water with the salt, brown sugar, peppercorns and bay leaves, stirring until the salt dissolves. Take it off the heat, add the orange, and stir in the rest of the cold water. Let it cool completely, then chill it. The brine must be cold before the turkey goes in.',
    'Put the thawed turkey (neck and giblets out) in the brining bag or container, set it in a pan to catch drips, and pour in the cold brine to cover. Seal the bag, pressing out the air.',
    'Refrigerate it for 12 to 24 hours, no longer, turning it once if it isn’t fully covered. The turkey and brine have to stay in the refrigerator, at 40°F or colder, the whole time (USDA).',
    'Lift the turkey out, let the brine drain from the cavity, and throw the brine away. Pat the turkey very dry with paper towels. For crisper skin, refrigerate it uncovered for a few hours. Wash the sink and anything the brine touched.',
    'Heat the oven to 325°F. Set the turkey on the rack, brush with the butter, put the onion in the cavity and pour the broth into the pan.',
    'Roast 2¾ to 3 hours for an 8- to 12-lb turkey (USDA’s time at 325°F, unstuffed; brined birds often cook a little faster, so start checking early). Tent the breast with foil once golden.',
    THERMO,
    REST + ' The drippings are salty: make the gravy with unsalted broth and taste before adding salt.',
  ],
  safety=[T_TURKEY],
  make_ahead='Make and chill the brine the day before you brine; start brining the night before roasting.',
  freezer=(True, 'Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Kids can measure the salt and sugar and stir the brine while it’s cool. A grown-up handles the heavy, slippery bird.',
  swaps={'no_fridge_space': 'If the turkey won’t fit in your refrigerator in a container, try the dry-brined turkey instead; it needs only a sheet pan.'},
  prep_day=dict(ahead='Make and chill the brine; brine the turkey overnight in the refrigerator.', station='oven', oven_f=325, active=30, keeps_days=4),
  pairs=['make-ahead-turkey-gravy', 'classic-bread-stuffing', 'mashed-potatoes'])

R(id='spatchcocked-turkey', name='Spatchcocked Turkey', emoji='🍗', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['oven', 'sheet-pan'], tags=['leftovers'], prep=30, cook=90, inactive=20,
  equipment=['heavy poultry shears or a sharp chef’s knife', 'large rimmed baking sheet (or roasting pan) with a wire rack', 'food thermometer', 'carving board'],
  summary='The backbone cut out and the bird pressed flat, so it roasts evenly in about half the time and frees the oven sooner for the sides.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed
3 tbsp olive-oil | or melted butter
1 tbsp kosher-salt | or 1½ teaspoons table salt
1 tsp black-pepper
1 tsp thyme-dried | or poultry seasoning
For the pan:
2 each onion | thickly sliced
2 each carrot | in chunks
3 stalk celery | in chunks
''',
  steps=[
    THAW,
    GIBLETS,
    'Heat the oven to 425°F with a rack in the middle. Set the turkey breast side down on a cutting board. With the shears, cut along both sides of the backbone from tail to neck and lift it out. Save it with the neck for stock.',
    'Turn the bird over, open it like a book, and press hard on the breastbone with both hands until it cracks and the turkey lies flat. Tuck the wing tips behind the breast.',
    'Spread the vegetables on the baking sheet and set the rack over them. Lay the turkey on the rack, skin side up, legs turned slightly in. Pat dry, rub with the oil, and sprinkle with the salt, pepper and thyme.',
    'Roast about 70 to 90 minutes for an 11- to 12-lb turkey; a flat bird cooks much faster than a whole one, so start checking at 1 hour. Add a cup of water to the pan if the vegetables start to scorch.',
    THERMO,
    REST + ' Spoon the pan juices and soft vegetables off for gravy.',
  ],
  safety=[T_TURKEY],
  make_ahead='Spatchcock and season the bird the day before and refrigerate it uncovered on its rack.',
  freezer=(True, 'Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='A grown-up does the cutting. Kids can scatter the vegetables and season the bird, then wash their hands.',
  swaps={'butcher': 'Ask the meat counter to spatchcock the turkey for you; many will.'},
  prep_day=dict(ahead='Spatchcock and season the turkey; refrigerate it uncovered.', station='oven', oven_f=425, active=30, keeps_days=4),
  pairs=['turkey-gravy-from-drippings', 'cornbread-dressing', 'green-bean-casserole-crispy-shallots'])

R(id='smoked-turkey', name='Smoked Turkey', emoji='🔥', servings=10, serving_size='about 1 lb of turkey as bought, with some leftovers',
  meal=['dinner'], protein='turkey', method=['grill'], tags=['leftovers'], prep=30, cook=300, inactive=20,
  equipment=['smoker, or a covered charcoal or gas grill set up for indirect heat', 'hardwood chunks or chips (apple, cherry, hickory or oak)', 'grill or oven thermometer for the smoker’s air', 'food thermometer', 'disposable foil pan'],
  summary='A turkey cooked low and slow over hardwood smoke on a smoker or grill. The meat turns rosy near the skin and tastes of the wood, and the oven stays free for everything else.',
  ingredients='''
11 lb whole-turkey | thawed, neck and giblets removed; 8 to 12 lb is best for smoking
2 tbsp olive-oil
Rub:
1 tbsp brown-sugar
1 tbsp kosher-salt
2 tsp smoked-paprika | or sweet paprika
1 tsp garlic-powder
1 tsp onion-powder
1 tsp black-pepper
1 tsp thyme-dried
''',
  steps=[
    'Pick a turkey of 8 to 12 lb: bigger birds take too long to heat through at smoker temperatures (USDA). It must be fully thawed, and don’t stuff it.',
    GIBLETS,
    'Set up the smoker or grill for indirect heat and bring the air inside to 225 to 300°F (USDA’s range); about 275°F is a good target. Check it with a thermometer at the level of the bird, not the lid gauge.',
    'Mix the rub. Rub the turkey with the oil, then the rub, inside and out. Set it breast side up on the grate away from the fire, with the foil pan under it to catch drips.',
    'Add the wood: a few chunks on the coals, or chips in a smoker box or foil packet on a gas grill. Thin, blue-gray smoke is what you want; thick white smoke tastes bitter. Add wood for the first 2 to 3 hours only.',
    'Keep the lid closed and hold the air temperature at 225 to 300°F, adding charcoal as needed. USDA estimates 20 to 30 minutes per pound in a smoker, so an 11-lb bird takes about 4 to 5½ hours. Wind and cold weather add time.',
    THERMO + ' Smoked turkey often looks pink just under the skin even when it’s done; trust the thermometer, not the color.',
    REST,
  ],
  safety=[T_TURKEY],
  make_ahead='Mix the rub days ahead. You can rub the turkey the night before and refrigerate it uncovered.',
  freezer=(True, 'Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Kids can mix the rub. Keep them well back from the smoker or grill; the outside gets very hot.',
  swaps={'covered_grill': 'On a covered grill at 225 to 300°F, USDA estimates 15 to 18 minutes per pound for turkeys up to 16 lb, checked the same way with a thermometer.'},
  prep_day=dict(ahead='Mix the rub; season the turkey the night before.', station='grill', oven_f=None, active=30, keeps_days=4),
  pairs=['make-ahead-turkey-gravy', 'cornbread-dressing', 'baked-mac-and-cheese'])

R(id='deep-fried-turkey', name='Deep-Fried Turkey (Outdoors Only)', emoji='🛢️', servings=10, serving_size='about 1 lb of turkey as bought',
  meal=['dinner'], protein='turkey', method=[], tags=['leftovers'], prep=60, cook=55, inactive=20,
  equipment=['outdoor propane turkey fryer with a 26- to 30-quart pot, basket or rack, and lifting hook', 'deep-fry thermometer', 'food thermometer',
             'fire extinguisher rated for grease fires (Class B or K)', 'long oven mitts or grill gloves, and safety glasses', 'sheet pan with a rack for draining', 'paper towels'],
  summary='A turkey fried whole in a pot of hot oil, outdoors, in under an hour. The skin is crackly and the meat stays moist, but the oil is a serious fire hazard, so every safety step matters.',
  ingredients='''
11 lb whole-turkey | 12 lb or less, completely thawed, neck and giblets removed, not stuffed
2 tsp kosher-salt
1 tsp garlic-powder
1 tsp paprika
?1/2 tsp cayenne | for a little heat
^3 gallon peanut-oil | roughly; measure first (step 3). Canola or another high-heat oil works too
''',
  steps=[
    'A word first: the National Fire Protection Association discourages home use of gas-fueled turkey fryers, because oil spills and boil-overs start fires. If you fry, follow every step here and the fryer maker’s instructions, or roast or smoke the turkey instead.',
    'Use a turkey of 12 lb or less (USDA). It must be completely thawed and never stuffed: ice or water in a frozen or wet bird makes hot oil boil over violently. Take out the neck and giblets and pull off any pop-up timer, plastic or wire.',
    'Measure the oil the day before, with water. Put the turkey in the empty fryer pot (in its basket) and add water until it’s covered by about an inch. Lift the turkey out and mark the water line: that’s how much oil you need. Pour out the water and dry the pot and the turkey completely.',
    'Pick the spot: outdoors, on flat, level ground, well away from your house and other buildings, wooden decks, trees and anything that burns. Never use a fryer in a garage, on a porch, or under a roof or covered patio. Set the propane tank as far from the burner as the hose allows.',
    'Keep a fire extinguisher rated for grease fires within reach. Never use water on an oil fire. Keep children and pets well away from the fryer the whole time, and afterward too: the oil stays dangerously hot for hours.',
    'Pat the turkey very dry, inside and out. Mix the salt, garlic powder, paprika and cayenne and rub it over the skin.',
    'Fill the pot with oil only to your mark and heat it to 350°F (USDA), watching the deep-fry thermometer. Never leave hot oil unattended. If the oil starts to smoke, turn off the gas.',
    'Put on the gloves and glasses. Turn the burner off. Then lower the turkey into the oil very slowly, neck end down, on its rack or basket. When it is fully in and the bubbling has calmed, relight the burner following the fryer maker’s directions and bring the oil back to about 350°F.',
    'Fry about 3 to 5 minutes per pound (USDA), so 35 to 55 minutes for an 11-lb bird. Stay with the fryer and keep watching the oil temperature.',
    'Turn the burner off. Lift the turkey out slowly and let the oil drain from the cavity back into the pot, then set it on the rack over the sheet pan.',
    THERMO + ' If it isn’t done, lower it back into the hot oil the same careful way (burner off) and fry a few minutes more.',
    REST + ' Let the oil cool completely, for hours, before you move it or pour it back into its containers for disposal.',
  ],
  safety=[T_TURKEY],
  make_ahead='Do the water test and set up the fryer site the day before. Thaw the bird completely in the refrigerator, and dry it well.',
  freezer=(True, 'Freeze carved leftover turkey 2 to 6 months for best quality (USDA).'),
  leftovers=LEFT_TURKEY,
  kids='Not a job for kids. Keep children and pets far from the fryer, the oil and the propane, during and long after cooking.',
  swaps={'peanut_allergy': 'Many people with peanut allergies avoid peanut oil. Fry in canola or another high-heat oil, and tell your guests which oil you used.'},
  prep_day=None,
  pairs=['make-ahead-turkey-gravy', 'cornbread-dressing', 'baked-mac-and-cheese'])

# =====================================================================  GRAVY
R(id='turkey-gravy-from-drippings', name='Turkey Gravy from the Drippings', emoji='🥣', servings=10, serving_size='about ⅓ cup (makes about 4 cups)',
  meal=['side'], protein='turkey', method=['stovetop'], tags=[], prep=5, cook=20,
  equipment=['fat separator or a large glass measuring cup', 'roasting pan from the turkey', 'medium saucepan', 'whisk', 'fine strainer (optional)'],
  summary='Pan juices from the roast turkey, thickened with a butter-and-flour roux and simmered smooth while the bird rests.',
  ingredients='''
6 tbsp unsalted-butter | or turkey fat skimmed from the drippings, or some of each
6 tbsp flour
4 cup turkey-broth | including the skimmed pan juices; homemade stock is best
1/2 tsp thyme-dried | or a few fresh sprigs
~1/4 tsp salt | taste first; drippings from brined birds are salty
~1/4 tsp black-pepper
''',
  steps=[
    'While the turkey rests, pour the pan juices into the fat separator (or a measuring cup and let the fat rise). Set the roasting pan over two burners on medium heat, add 1 cup of the broth, and scrape up all the browned bits. Pour this into the separator too.',
    'Spoon or pour off the fat. Use up to 6 tablespoons of it in place of the butter. Add broth to the skimmed juices to make 4 cups.',
    'Melt the butter (or heat the fat) in the saucepan over medium heat. Whisk in the flour and cook, whisking, 2 to 3 minutes, until it smells toasty and turns light brown.',
    'Pour in the warm juices and broth a little at a time, whisking hard so no lumps form. Add the thyme.',
    'Simmer 8 to 10 minutes, whisking now and then, until it coats a spoon. Taste, then season. Strain it if you want it perfectly smooth. Thin with broth if it gets too thick.',
  ],
  safety=[],
  make_ahead='Make the turkey stock days ahead, or the whole make-ahead gravy, so this is only a quick finish.',
  freezer=(True, 'Freeze gravy up to 2 to 3 months. Thaw in the refrigerator and bring it to a rolling boil when you reheat it (USDA).'),
  leftovers=('Refrigerate within 2 hours and use within 1 to 2 days (USDA’s time for gravy). Bring it to a rolling boil before serving again.', None),
  kids='A child can whisk while a grown-up pours the hot broth.',
  swaps={'gluten_free': 'Skip the roux. Whisk ¼ cup cornstarch into ½ cup cold broth, stir it into the simmering juices, and cook 2 minutes until thick.'},
  prep_day=dict(ahead='Make the turkey stock.', station='stove', oven_f=None, active=20, keeps_days=2),
  pairs=['classic-roast-turkey', 'mashed-potatoes'])

R(id='make-ahead-turkey-gravy', name='Make-Ahead Turkey Gravy', emoji='🫕', servings=10, serving_size='about ⅓ cup (makes about 4 cups)',
  meal=['side'], protein='turkey', method=['oven', 'stovetop'], tags=['make-ahead'], prep=15, cook=105,
  equipment=['roasting pan', 'large saucepan', 'fine strainer', 'whisk'],
  summary='Roasted turkey wings and vegetables simmered into a deep brown gravy days ahead, so there’s no last-minute whisking. Stir in the pan drippings on the day if you have them.',
  ingredients='''
^3 lb turkey-necks | turkey wings or necks
1 each onion | quartered
2 each carrot | in chunks
2 stalk celery | in chunks
6 cup turkey-broth | or chicken broth
6 tbsp unsalted-butter
6 tbsp flour
1 tsp thyme-dried
1 leaf bay-leaves
~1/2 tsp salt
~1/4 tsp black-pepper
''',
  steps=[
    'Heat the oven to 400°F. Spread the turkey wings, onion, carrots and celery in the roasting pan and roast about 1 hour, turning once, until deep brown.',
    'Move everything to the saucepan. Pour 1 cup of the broth into the hot pan, scrape up the browned bits, and add it to the saucepan with the rest of the broth, the thyme and the bay leaf.',
    'Simmer gently 45 minutes. Strain, pressing on the solids, and skim off the fat (save 6 tablespoons to use instead of the butter, if you like). You should have about 4 cups; add broth or water to make up the difference.',
    'Melt the butter in the saucepan, whisk in the flour, and cook 3 minutes, whisking, until light brown. Whisk in the hot stock a little at a time and simmer 10 minutes until thick. Season with salt and pepper.',
    'Cool quickly in a shallow container and refrigerate within 2 hours. On the day, reheat it to a rolling boil, whisking in any skimmed drippings from the roasting pan.',
  ],
  safety=[],
  make_ahead='Make it up to 2 days ahead and refrigerate, or freeze it weeks ahead.',
  freezer=(True, 'Freeze up to 2 to 3 months. Thaw in the refrigerator and bring it to a rolling boil before serving (USDA).'),
  leftovers=('Refrigerate within 2 hours and use within 1 to 2 days (USDA’s time for gravy). Bring it to a rolling boil before serving again.', None),
  kids=None,
  swaps={'gluten_free': 'Thicken with ¼ cup cornstarch whisked into ½ cup cold stock instead of the roux.', 'meat_off_the_wings': 'Pick the meat off the roasted wings for soup or sandwiches.'},
  prep_day=dict(ahead='Make the gravy and refrigerate or freeze it.', station='oven', oven_f=400, active=30, keeps_days=2),
  pairs=['deep-fried-turkey', 'smoked-turkey'])

# =====================================================================  STUFFING AND DRESSING
R(id='classic-bread-stuffing', name='Classic Sage and Onion Bread Stuffing', emoji='🍞', servings=10, serving_size='about ¾ cup',
  meal=['side'], protein='', method=['oven', 'stovetop'], tags=['make-ahead'], prep=25, cook=55,
  equipment=['2 rimmed baking sheets (to dry the bread)', 'large skillet', 'very large bowl', '9 × 13-inch baking dish', 'foil', 'food thermometer'],
  summary='Toasted bread cubes with butter-soft onions, celery, fresh sage and thyme, moistened with broth and baked in a dish until crisp on top. Baked outside the bird, it’s often called dressing.',
  ingredients='''
1 lb white-bread | about 16 slices, or a 1-lb loaf of homemade or Italian bread, in ¾-inch cubes
1/2 cup unsalted-butter | 1 stick, plus more for the dish
2 each onion | chopped
4 stalk celery | chopped, with some leaves
2 tbsp sage | chopped, or 2 teaspoons dried
1 tbsp thyme | leaves, or 1 teaspoon dried
1/4 cup parsley | chopped
1 tsp salt
1/2 tsp black-pepper
2 1/2 cup turkey-broth | or chicken or vegetable broth; up to 3 cups
2 each eggs | beaten
''',
  steps=[
    'Dry the bread: spread the cubes on the baking sheets and bake at 300°F for 20 to 25 minutes, stirring once, until dry but not brown. Or leave them out uncovered overnight. Dry bread soaks up the broth without turning to mush.',
    'Melt the butter in the skillet over medium heat. Cook the onions and celery with a pinch of salt, stirring now and then, until soft and sweet, about 10 minutes. Stir in the sage and thyme for the last minute.',
    'Heat the oven to 350°F and butter the baking dish. Toss the bread, vegetables (scrape in all the butter), parsley, salt and pepper in the big bowl.',
    'Whisk the eggs into 2½ cups of the broth and pour it over the bread, tossing gently until it’s evenly moist. Add up to ½ cup more broth if it seems dry; it should be damp, not soggy.',
    'Spread it in the dish. Cover with foil and bake 30 minutes, then uncover and bake 15 to 20 minutes more, until the top is golden and crisp and the center reaches 165°F on a food thermometer (it has egg and broth).',
    STUFF_BIRD,
  ],
  safety=[T_STUFFING],
  make_ahead='Dry the bread cubes up to 3 days ahead and keep them in a bag. Cook the vegetables a day ahead and refrigerate them. Mix everything with the broth and eggs just before baking (USDA advises against making stuffing ahead).',
  freezer=(True, 'Freeze baked leftover stuffing up to 1 month for best quality. Reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days (USDA). Reheat to 165°F, with a splash of broth.', None),
  kids='Kids can tear or cube the bread, strip the herbs and toss everything together in the bowl.',
  swaps={'meatless': 'Use vegetable broth for a vegetarian stuffing.', 'mushroom': 'Cook 8 oz sliced mushrooms with the onions.', 'gluten_free': 'Use a 1-lb loaf of gluten-free sandwich bread, dried the same way.'},
  prep_day=dict(ahead='Dry the bread cubes and cook the onions and celery.', station='oven', oven_f=350, active=25, keeps_days=3),
  pairs=['classic-roast-turkey', 'turkey-gravy-from-drippings'])

R(id='cornbread-dressing', name='Southern Cornbread Dressing', emoji='🌽', servings=12, serving_size='about ¾ cup',
  meal=['side'], protein='', method=['oven', 'stovetop'], tags=['make-ahead'], prep=30, cook=70, inactive=60,
  equipment=['10-inch cast-iron skillet or 9-inch square pan (for the cornbread)', 'large skillet', 'very large bowl', '9 × 13-inch baking dish', 'food thermometer'],
  summary='Crumbled day-old cornbread with onion, celery, sage and broth, baked until set and golden. The dressing on many Southern tables, made here with no wheat bread at all.',
  ingredients='''
Cornbread (bake a day ahead):
2 cup cornmeal | plain, not a mix
1 tsp baking-powder
1/2 tsp baking-soda
1 tsp salt
2 cup buttermilk
2 each eggs
4 tbsp unsalted-butter | melted
Dressing:
6 tbsp unsalted-butter | plus more for the dish
2 each onion | chopped
4 stalk celery | chopped
2 tbsp sage | chopped, or 2 teaspoons dried
1 tsp thyme-dried
1/2 tsp black-pepper
3 1/2 cup turkey-broth | or chicken broth; up to 4 cups
2 each eggs | beaten
''',
  steps=[
    'Make the cornbread: heat the oven to 425°F with the skillet inside. Whisk the cornmeal, baking powder, baking soda and salt. Whisk in the buttermilk and 2 eggs, then 3 tablespoons of the melted butter.',
    'Swirl the last tablespoon of butter in the hot skillet, pour in the batter, and bake 20 to 25 minutes, until golden and a toothpick comes out clean. Cool, then crumble it into the big bowl and leave it out, loosely covered, for a few hours or overnight to dry.',
    'Melt 6 tablespoons butter in the large skillet and cook the onions and celery until soft, about 10 minutes. Stir in the sage, thyme and pepper. Add to the cornbread.',
    'Heat the oven to 375°F and butter the baking dish. Whisk the 2 eggs into 3½ cups broth and pour it over the cornbread, stirring gently. It should look like thick, wet oatmeal; add more broth if it’s dry. Taste a little of the broth mixture for salt before the eggs go in, if you like, and season.',
    'Spread in the dish and bake uncovered 40 to 45 minutes, until set, golden at the edges, and 165°F in the center on a food thermometer.',
  ],
  safety=[T_STUFFING],
  make_ahead='Bake the cornbread 1 to 2 days ahead (or freeze it for weeks) and cook the vegetables the day before. Mix with the broth and eggs just before baking.',
  freezer=(True, 'Freeze the cornbread, crumbled, up to 3 months. Freeze baked leftover dressing up to 1 month; reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days (USDA). Reheat to 165°F.', None),
  kids='Kids can whisk the cornbread batter and crumble the cooled cornbread.',
  swaps={'sausage': 'Brown ½ lb breakfast sausage to 160°F and stir it in.', 'gluten_free': 'It is gluten-free as written with plain cornmeal and gluten-free broth; check the labels.'},
  prep_day=dict(ahead='Bake and crumble the cornbread; cook the onions and celery.', station='oven', oven_f=375, active=30, keeps_days=3),
  pairs=['dry-brined-turkey', 'smoked-turkey', 'turkey-gravy-from-drippings'])

R(id='sausage-apple-stuffing', name='Sausage and Apple Stuffing', emoji='🍎', servings=10, serving_size='about ¾ cup',
  meal=['side'], protein='pork', method=['oven', 'stovetop'], tags=['make-ahead'], prep=25, cook=60,
  equipment=['2 rimmed baking sheets', 'large skillet', 'very large bowl', '9 × 13-inch baking dish', 'foil', 'food thermometer'],
  summary='Bread stuffing with browned pork sausage, tart apple, onion and sage. Savory, a little sweet, and filling.',
  ingredients='''
1 lb white-bread | or a 1-lb loaf, in ¾-inch cubes
1 lb breakfast-sausage | bulk pork sausage, not links
4 tbsp unsalted-butter | plus more for the dish
1 each onion | chopped
3 stalk celery | chopped
1 each apple | a tart one, cored and diced (no need to peel)
2 tbsp sage | chopped, or 2 teaspoons dried
1 tsp thyme-dried
1/2 tsp black-pepper
2 cup turkey-broth | or chicken broth; up to 2½ cups
2 each eggs | beaten
''',
  steps=[
    'Dry the bread cubes on the baking sheets at 300°F for 20 to 25 minutes, or leave them out overnight.',
    'Brown the sausage in the skillet over medium-high heat, breaking it up, until no pink remains and it reaches 160°F, about 8 minutes. Lift it into the big bowl with a slotted spoon, leaving the fat.',
    'Add the butter to the skillet and cook the onion, celery and apple until soft, about 8 minutes. Stir in the sage, thyme and pepper. Add to the bowl with the bread.',
    'Heat the oven to 350°F and butter the dish. Whisk the eggs into 2 cups broth, pour over the stuffing and toss until evenly moist, adding more broth if it’s dry. The sausage is salty, so taste the broth before adding any salt.',
    'Spread in the dish, cover with foil and bake 30 minutes, then uncover and bake 15 to 20 minutes more, until crisp on top and 165°F in the center.',
  ],
  safety=[T_GROUND, T_STUFFING],
  make_ahead='Dry the bread up to 3 days ahead. Brown the sausage and cook the vegetables a day ahead and refrigerate. Combine with the broth and eggs just before baking.',
  freezer=(True, 'Freeze baked leftovers up to 1 month; reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days (USDA). Reheat to 165°F.', None),
  kids='Kids can cube the bread and toss the stuffing (before the raw eggs go in, or wash hands after).',
  swaps={'italian': 'Use mild Italian sausage and add ¼ cup grated Parmesan.', 'cranberry': 'Stir in ½ cup dried cranberries with the apple.'},
  prep_day=dict(ahead='Dry the bread; brown the sausage and cook the vegetables.', station='oven', oven_f=350, active=25, keeps_days=3),
  pairs=['herb-butter-roast-turkey', 'turkey-gravy-from-drippings'])

R(id='oyster-dressing', name='Oyster Dressing', emoji='🦪', servings=10, serving_size='about ¾ cup',
  meal=['side'], protein='', method=['oven', 'stovetop'], tags=[], prep=25, cook=55,
  equipment=['2 rimmed baking sheets', 'small saucepan', 'strainer', 'large skillet', 'very large bowl', '9 × 13-inch baking dish', 'food thermometer'],
  summary='An old coastal favorite from New England down through the Chesapeake and the Gulf: bread dressing with plump oysters, celery, onion and herbs, moistened with the oysters’ own liquor.',
  ingredients='''
12 oz french-bread | or white bread, in ¾-inch cubes
1 pint oysters | shucked, with their liquor
6 tbsp unsalted-butter | plus more for the dish
1 each onion | chopped
3 stalk celery | chopped
3 each green-onions | sliced
1/4 cup parsley | chopped
1 tsp thyme-dried
1/2 tsp black-pepper
~1/4 tsp cayenne
1 1/2 cup turkey-broth | or chicken broth, about
2 each eggs | beaten
1 each lemon | wedges, for serving
''',
  steps=[
    'Dry the bread cubes on the baking sheets at 300°F for 20 minutes, or leave them out overnight.',
    'Cook the oysters first, as USDA advises for stuffing: pour them and their liquor into the saucepan and heat gently just until the edges curl, 2 to 3 minutes. Strain, saving every drop of the liquor. Chop the oysters into large pieces.',
    'Melt the butter in the skillet and cook the onion and celery until soft, about 8 minutes. Stir in the green onions, parsley, thyme, pepper and cayenne.',
    'Heat the oven to 350°F and butter the dish. In the big bowl, toss the bread with the vegetables and oysters. Add broth to the oyster liquor to make 2 cups, whisk in the eggs, and pour it over, tossing gently. Add a little more broth if it seems dry. The oyster liquor is salty, so taste before salting.',
    'Spread in the dish and bake uncovered 30 to 35 minutes, until golden on top and 165°F in the center. Serve with lemon wedges.',
  ],
  safety=[T_STUFFING],
  make_ahead='Dry the bread and chop the vegetables a day ahead. Buy the oysters as close to the day as you can and keep them on ice in the refrigerator; cook and mix just before baking.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and eat within 1 to 2 days. Reheat to 165°F.', None),
  kids=None,
  swaps={'crackers': 'Many old family recipes use crushed saltine crackers for part of the bread.', 'canned': 'Two 8-oz cans of whole oysters, drained (save the liquid), work in place of fresh.'},
  prep_day=dict(ahead='Dry the bread; chop the vegetables.', station='oven', oven_f=350, active=25, keeps_days=1),
  pairs=['classic-roast-turkey'])

R(id='wild-rice-stuffing', name='Wild Rice Stuffing with Mushrooms and Pecans', emoji='🍄', servings=8, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['stovetop', 'oven'], tags=['make-ahead'], prep=20, cook=75,
  equipment=['medium saucepan with a lid', 'large skillet', '2-quart baking dish', 'foil'],
  summary='Nutty wild rice baked with browned mushrooms, celery, sage, dried cranberries and toasted pecans. No bread, so it’s gluten-free, and it can be vegan too.',
  ingredients='''
1 1/2 cup wild-rice | rinsed
4 cup vegetable-broth | or turkey broth
1/2 tsp salt
4 tbsp unsalted-butter | or olive oil
8 oz cremini | sliced
1 each onion | chopped
3 stalk celery | chopped
1 tbsp sage | chopped, or 1 teaspoon dried
1 tsp thyme-dried
1/2 cup dried-cranberries
1/2 cup pecans | toasted and chopped
1/4 cup parsley | chopped
''',
  steps=[
    'Bring the rice, broth and salt to a boil in the saucepan, cover, and simmer 45 to 55 minutes, until the grains split open and are tender but still chewy. Drain any broth that’s left (save it).',
    'Meanwhile, heat the butter in the skillet over medium-high heat and cook the mushrooms without stirring for 3 minutes, until browned. Add the onion and celery and cook until soft, about 8 minutes. Stir in the sage and thyme.',
    'Heat the oven to 350°F. Stir the rice, vegetables, cranberries, pecans and parsley together, adding ¼ cup of the saved broth if it looks dry. Taste for salt.',
    'Spread in the baking dish, cover with foil and bake 20 minutes, until hot through. Or skip the oven and serve it straight from the skillet.',
  ],
  safety=[],
  make_ahead='Cook the rice and vegetables up to 2 days ahead and refrigerate. Combine and bake on the day; add 10 minutes if it goes in cold.',
  freezer=(True, 'Freeze up to 2 months. Thaw in the refrigerator and reheat covered.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. Good cold as a salad with a little vinaigrette.', 'lunch'),
  kids='Kids can rinse the rice, measure the cranberries and stir.',
  swaps={'vegan': 'Use olive oil instead of butter and vegetable broth.', 'nut_free': 'Leave out the pecans or use toasted pumpkin seeds.'},
  prep_day=dict(ahead='Cook the wild rice and the vegetables.', station='oven', oven_f=350, active=20, keeps_days=4),
  pairs=['herb-butter-roast-turkey', 'spatchcocked-turkey'])

# =====================================================================  SIDES
R(id='make-ahead-mashed-potatoes', name='Make-Ahead Mashed Potatoes', emoji='🥔', servings=12, serving_size='about ⅔ cup',
  meal=['side'], protein='vegetarian', method=['stovetop', 'oven'], tags=['make-ahead'], prep=20, cook=75,
  equipment=['large pot', 'potato masher or ricer', '9 × 13-inch baking dish', 'foil', 'food thermometer'],
  summary='Creamy mashed potatoes made with cream cheese and sour cream, spread in a dish up to two days ahead, and baked on the day. One less pot on the stove.',
  ingredients='''
4 lb yukon-potato | or russets, peeled and cut in 2-inch chunks
^1 tbsp salt | for the cooking water; most is poured away
4 oz cream-cheese | softened
1/2 cup sour-cream
6 tbsp unsalted-butter | divided
3/4 cup whole-milk | warm, up to 1 cup
1 tsp salt
1/4 tsp black-pepper
2 tbsp chives | snipped (optional)
''',
  steps=[
    'Put the potatoes in the pot, cover with cold water by an inch, and add the 1 tablespoon salt. Bring to a boil and simmer until a knife slides in easily, 15 to 20 minutes.',
    'Drain well and return them to the warm pot for a minute to steam dry. Mash or rice them.',
    'Beat in the cream cheese, sour cream and 4 tablespoons of the butter, then enough warm milk to make them creamy. Season with the salt and pepper.',
    'Spread in the buttered baking dish and dot with the remaining 2 tablespoons butter. Serve now, or cool, cover and refrigerate within 2 hours, for up to 2 days.',
    'To serve, heat the oven to 350°F. Bake covered 30 minutes, then uncovered 20 to 30 minutes more, until hot in the center (165°F) and lightly golden on top. Sprinkle with chives.',
  ],
  safety=[T_REHEAT],
  make_ahead='Make and refrigerate them up to 2 days ahead. Take the dish out of the refrigerator 30 minutes before baking.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. Reheat to 165°F, or make potato pancakes.', None),
  kids='Kids can mash (with a grown-up holding the hot pot) and sprinkle the chives.',
  swaps={'garlic': 'Simmer 4 peeled garlic cloves with the potatoes and mash them in.', 'slow_cooker': 'Instead of baking, reheat the potatoes on low in a buttered slow cooker for 3 to 4 hours, stirring once, until 165°F; this frees the oven.'},
  prep_day=dict(ahead='Make the potatoes and refrigerate them in the baking dish.', station='oven', oven_f=350, active=25, keeps_days=2),
  pairs=['turkey-gravy-from-drippings', 'make-ahead-turkey-gravy'])

R(id='sweet-potato-casserole-marshmallows', name='Sweet Potato Casserole with Marshmallows', emoji='🍠', servings=10, serving_size='about ⅔ cup',
  meal=['side'], protein='', method=['stovetop', 'oven'], tags=['make-ahead', 'kid-friendly'], prep=20, cook=60,
  equipment=['large pot', 'potato masher or hand mixer', '2-quart baking dish'],
  summary='Buttery mashed sweet potatoes with brown sugar, vanilla and warm spice, baked under a layer of toasted marshmallows. Make the marshmallows yourself for a soft, vanilla top.',
  ingredients='''
3 lb sweet-potato | peeled and cut in 2-inch chunks
4 tbsp unsalted-butter | plus more for the dish
1/4 cup brown-sugar
1/2 cup whole-milk | warm
1 tsp vanilla
1/2 tsp cinnamon
1/4 tsp nutmeg
1/2 tsp salt
4 cup marshmallows | mini marshmallows, or homemade cut in ¾-inch cubes
''',
  steps=[
    'Cover the sweet potatoes with cold water in the pot, bring to a boil and simmer until very tender, 15 to 20 minutes. Drain well.',
    'Mash with the butter, brown sugar, milk, vanilla, cinnamon, nutmeg and salt until smooth. Taste; add a little more sugar if your sweet potatoes aren’t very sweet.',
    'Heat the oven to 350°F and butter the baking dish. Spread the sweet potatoes in it and bake 20 minutes, until hot.',
    'Scatter the marshmallows over the top in a single snug layer and bake 8 to 12 minutes more, watching closely, until puffed and golden. (Or brown them under the broiler for 1 to 2 minutes, standing right there.)',
  ],
  safety=[],
  make_ahead='Make the mashed sweet potatoes up to 2 days ahead and refrigerate them in the dish. Bake 30 to 35 minutes from cold before adding the marshmallows.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. The marshmallows soften but still taste good.', None),
  kids='A favorite job: kids can mash and lay out the marshmallows in rows. A grown-up handles the oven and broiler.',
  swaps={'pecan_topping': 'For the pecan streusel version, see our sweet potato casserole with pecan topping.', 'vegetarian': 'Most marshmallows contain gelatin. Use marshmallows labeled gelatin-free for a vegetarian dish.', 'dairy_free': 'Use plant butter and oat or soy milk.'},
  prep_day=dict(ahead='Boil and mash the sweet potatoes; refrigerate them in the dish.', station='oven', oven_f=350, active=20, keeps_days=2),
  pairs=['classic-roast-turkey'])

R(id='green-bean-casserole-crispy-shallots', name='Green Bean Casserole with Crispy Shallots', emoji='🫛', servings=8, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['stovetop', 'oven'], tags=['make-ahead'], prep=25, cook=40,
  equipment=['large pot', 'large skillet', 'small heavy saucepan for frying', 'slotted spoon', 'paper towels', '2-quart baking dish'],
  summary='Fresh green beans in a from-scratch mushroom cream sauce, topped with shallots fried crisp at home. Everything a can would give you, made by hand.',
  ingredients='''
1 1/2 lb green-beans | trimmed, cut in 2-inch pieces
^1 tbsp salt | for the cooking water; most is poured away
Mushroom sauce:
3 tbsp unsalted-butter
10 oz cremini | finely chopped
2 clove garlic | minced
3 tbsp flour
1 cup vegetable-broth
1 cup half-and-half
1/2 tsp salt
1/4 tsp black-pepper
~1 pinch nutmeg
Crispy shallots:
4 each shallot | sliced into thin rings
2 tbsp flour
1 pinch salt
^3/4 cup vegetable-oil | for frying; most stays in the pan
''',
  steps=[
    'Bring a large pot of water to a boil with the 1 tablespoon salt. Cook the beans 4 to 5 minutes, until bright green and just tender. Drain and spread them out on a towel to stop the cooking.',
    'Make the crispy shallots: toss the shallot rings with the 2 tablespoons flour and a pinch of salt. Heat the oil in the small saucepan over medium heat until a ring sizzles at once. Fry the shallots in two batches, stirring, until golden brown, 3 to 5 minutes. Lift them onto paper towels; they crisp as they cool. Keep a lid nearby and never leave hot oil alone.',
    'Make the sauce: melt the butter in the skillet over medium-high heat and cook the mushrooms until their liquid cooks off and they brown, 8 to 10 minutes. Add the garlic for 30 seconds, then sprinkle in the 3 tablespoons flour and stir 1 minute.',
    'Stir in the broth, then the half-and-half, and simmer, stirring, until thick, 3 to 4 minutes. Season with the salt, pepper and nutmeg. Fold in the beans.',
    'Heat the oven to 400°F. Spread the beans in the dish and bake 15 minutes, until bubbling. Scatter the shallots on top and bake 3 to 5 minutes more.',
  ],
  safety=[],
  make_ahead='Blanch the beans and make the sauce up to 2 days ahead; refrigerate them combined in the dish. Fry the shallots up to 2 days ahead and keep them airtight at room temperature. Bake from cold for 25 minutes before topping.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days.', None),
  kids='Kids can snap the beans and stir the sauce. A grown-up fries the shallots.',
  swaps={'gluten_free': 'Thicken the sauce with 1½ tablespoons cornstarch stirred into the cold broth, and toss the shallots in cornstarch or rice flour.', 'crumb_top': 'For a buttery crumb top instead of shallots, see our from-scratch green bean casserole.'},
  prep_day=dict(ahead='Blanch the beans, make the sauce and fry the shallots.', station='oven', oven_f=400, active=30, keeps_days=2),
  pairs=['classic-roast-turkey', 'spatchcocked-turkey'])

R(id='jellied-cranberry-sauce', name='Jellied Cranberry Sauce', emoji='🫙', servings=12, serving_size='about ¼ cup (makes about 3 cups)',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'kid-friendly'], prep=5, cook=15, inactive=480,
  equipment=['medium saucepan', 'fine strainer', 'sturdy spatula', '3- to 4-cup mold, loaf pan or two clean 15-oz cans'],
  summary='Fresh cranberries cooked with sugar, pressed smooth and chilled into a firm, sliceable jelly. It sets on its own, from the fruit’s natural pectin.',
  ingredients='''
24 oz cranberries | two 12-oz bags, fresh or frozen
2 cup sugar
2 cup water
1 pinch salt
''',
  steps=[
    'Bring the cranberries, sugar, water and salt to a boil in the saucepan, stirring until the sugar dissolves. Boil gently 10 minutes, until all the berries have burst.',
    'Pour it into the strainer set over a bowl and press and scrape with the spatula until only skins and seeds are left. Scrape the thick purée off the underside of the strainer into the bowl too.',
    'Pour into the mold, loaf pan or cans (rinse the mold with cold water first so it slides out easily). Cool, cover and refrigerate at least 8 hours, until firm.',
    'To unmold, run a thin knife around the edge, dip the mold in warm water for 10 seconds, and turn it out onto a plate. Slice into rounds.',
  ],
  safety=[],
  make_ahead='Make it up to a week ahead; it needs at least 8 hours to set.',
  freezer=(False, ''),
  leftovers=('Refrigerate, covered, up to a week. Slice onto turkey sandwiches.', None),
  kids='Kids love listening for the berries to pop, and they can turn out the jelly.',
  swaps={'whole_berry': 'For whole-berry sauce, see our homemade cranberry sauce with orange.', 'orange': 'Use 1 cup orange juice in place of 1 cup of the water.'},
  prep_day=dict(ahead='Make the jelly and chill it overnight.', station='stove', oven_f=None, active=15, keeps_days=7),
  pairs=['classic-roast-turkey', 'day-after-turkey-sandwich'])

R(id='parker-house-rolls', name='Parker House Rolls', emoji='🥐', servings=12, serving_size='2 rolls (makes 24)',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'freezer-friendly', 'kid-friendly'], prep=40, cook=18, inactive=120,
  equipment=['large bowl or stand mixer with a dough hook', 'rolling pin', '2½- to 3-inch round cutter or a glass', '9 × 13-inch baking pan or a large baking sheet', 'pastry brush'],
  summary='Soft, buttery yeast rolls folded over like little pocketbooks, the style made famous at Boston’s Parker House hotel in the 1800s.',
  ingredients='''
500 g flour | about 4 cups, spooned and leveled
1 package yeast | 2¼ teaspoons instant or active dry
1/4 cup sugar
1 1/2 tsp salt
1 cup whole-milk | warmed to about 110°F
6 tbsp unsalted-butter | softened
1 each eggs
For brushing:
4 tbsp unsalted-butter | melted
?1/2 tsp sea-salt | flaky, for the tops
''',
  steps=[
    'Stir the warm milk, sugar and yeast together and let it stand 5 minutes until foamy (instant yeast can go straight in with the flour). Add the egg, softened butter, salt and about 3 cups of the flour, and mix until smooth.',
    'Work in enough of the remaining flour to make a soft dough that pulls away from the bowl. Knead 8 minutes by hand (5 in a mixer), until smooth and springy. Cover and let rise in a warm spot until doubled, about 1 hour.',
    'Butter the pan. Punch the dough down and roll it out on a lightly floured counter about ½ inch thick. Cut 24 rounds, gathering and rerolling the scraps once.',
    'Brush each round with melted butter, press a line across it just off center with the back of a knife, and fold it over along the line so the top half is a little shorter than the bottom. Press the edge lightly.',
    'Set the rolls in rows in the pan, just touching, overlapping like shingles. Cover and let rise until puffy, 30 to 45 minutes.',
    'Heat the oven to 375°F. Bake 15 to 18 minutes, until deep golden. Brush with the last of the butter and sprinkle with flaky salt if you like.',
  ],
  safety=[],
  make_ahead='Shape the rolls, cover the pan and refrigerate overnight; let them rise at room temperature about 1 hour before baking. Or bake, cool and freeze them, then warm at 350°F for 8 to 10 minutes.',
  freezer=(True, 'Freeze baked rolls in a freezer bag up to 3 months. Warm from frozen, wrapped in foil, at 350°F for 10 to 15 minutes.'),
  leftovers=('Keep at room temperature, wrapped, 2 days. Split for leftover turkey sliders.', None),
  kids='Kids can cut the circles, brush them with butter and fold them over.',
  swaps={'whole_wheat': 'Swap up to 1 cup of the flour for whole-wheat flour.', 'simpler': 'For round dinner rolls, see our from-scratch soft buns and dinner rolls.'},
  prep_day=dict(ahead='Shape the rolls and refrigerate the pan overnight.', station='oven', oven_f=375, active=40, keeps_days=2),
  pairs=['classic-roast-turkey', 'day-after-turkey-sandwich'])

R(id='baked-mac-and-cheese', name='Baked Macaroni and Cheese', emoji='🧀', servings=12, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['stovetop', 'oven'], tags=['make-ahead', 'kid-friendly'], prep=20, cook=45,
  equipment=['large pot', 'large saucepan', 'whisk', '9 × 13-inch baking dish'],
  summary='Elbow macaroni in a sharp cheddar sauce, baked until bubbling under a crunchy, buttery crumb top. A Thanksgiving side in many families, especially across the South.',
  ingredients='''
1 lb elbow-macaroni
^1 tbsp salt | for the pasta water; most is poured away
Cheese sauce:
4 tbsp unsalted-butter
1/4 cup flour
4 cup whole-milk | warm
1 tsp ground-mustard
1/2 tsp paprika
1 tsp salt
1/4 tsp black-pepper
5 cup cheddar-block | sharp cheddar, shredded (about 1¼ lb), divided
Topping:
1 cup panko
2 tbsp unsalted-butter | melted
''',
  steps=[
    'Heat the oven to 375°F and butter the baking dish. Cook the macaroni in well-salted boiling water 2 minutes less than the package says. It finishes in the oven. Drain.',
    'Melt the butter in the saucepan over medium heat, whisk in the flour, and cook 1 minute. Whisk in the warm milk a little at a time, then simmer, whisking, until it thickens, 5 to 7 minutes.',
    'Take it off the heat and stir in the mustard, paprika, salt, pepper and 4 cups of the cheese until smooth.',
    'Stir in the macaroni and spread it in the dish. Top with the last cup of cheese, then the panko tossed with the melted butter.',
    'Bake 25 to 30 minutes, until bubbling at the edges and golden on top. Let it stand 10 minutes before serving.',
  ],
  safety=[],
  make_ahead='Assemble without the crumb topping up to 1 day ahead and refrigerate. Add the topping and bake 40 to 45 minutes from cold, until hot in the center.',
  freezer=(True, 'Freeze the assembled, unbaked casserole (no topping) up to 2 months. Thaw in the refrigerator, top and bake.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. Reheat to 165°F with a splash of milk.', None),
  kids='Kids can shred cheese (with care at the grater) and sprinkle the topping.',
  swaps={'stovetop': 'For a quicker, creamy pot version, see our stovetop mac and cheese.', 'gluten_free': 'Use gluten-free pasta and thicken with 3 tablespoons cornstarch; top with crushed gluten-free crackers.'},
  prep_day=dict(ahead='Assemble the casserole without the topping.', station='oven', oven_f=375, active=25, keeps_days=1),
  pairs=['smoked-turkey', 'deep-fried-turkey'])

R(id='deviled-eggs', name='Classic Deviled Eggs', emoji='🥚', servings=12, serving_size='2 halves (makes 24)',
  meal=['snack', 'side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'kid-friendly'], prep=25, cook=15, inactive=15,
  equipment=['large saucepan with a lid', 'bowl of ice water', 'mixing bowl and fork', 'piping bag or zip-top bag (optional)'],
  summary='Hard-cooked eggs filled with a smooth, tangy yolk filling and dusted with paprika. A before-dinner nibble that disappears fast.',
  ingredients='''
12 each eggs | large
1/3 cup mayonnaise
2 tsp dijon-mustard | or yellow mustard
1 tsp cider-vinegar | or pickle juice
1/4 tsp salt
~1 pinch black-pepper
~1/2 tsp paprika | or smoked paprika, for the tops
?1 tbsp chives | snipped, for the tops
''',
  steps=[
    'Lay the eggs in the saucepan in one layer and cover with cold water by an inch. Bring to a full boil, then cover, take the pan off the heat, and let it stand 12 minutes. The yolks and whites will be fully firm.',
    'Move the eggs into the ice water for 15 minutes. Crack them all over and peel under running water.',
    'Halve the eggs lengthwise and pop the yolks into the bowl. Mash the yolks very fine with a fork, then stir in the mayonnaise, mustard, vinegar, salt and pepper until smooth.',
    'Spoon or pipe the filling into the whites. Dust with paprika and chives.',
    'Keep them cold until serving, and put them back in the refrigerator within 2 hours.',
  ],
  safety=[],
  make_ahead='Hard-cook and peel the eggs up to 2 days ahead and refrigerate. Make the filling a day ahead and keep it separately; fill the whites a few hours before serving.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours. They’re best the day they’re made; eat leftovers the next day.', None),
  kids='Kids can peel the eggs, mash the yolks and pipe the filling.',
  swaps={'relish': 'Stir 2 tablespoons sweet pickle relish into the filling, a Southern favorite.', 'no_mayo': 'Use plain Greek yogurt in place of half the mayonnaise.'},
  prep_day=dict(ahead='Hard-cook and peel the eggs; make the filling.', station='stove', oven_f=None, active=25, keeps_days=1),
  pairs=['relish-tray'])

R(id='relish-tray', name='Old-Fashioned Relish Tray', emoji='🥒', servings=10, serving_size='a small handful of each',
  meal=['snack', 'side'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'kid-friendly', 'quick'], prep=20, cook=0,
  equipment=['large platter or a divided tray', 'small bowls', 'paring knife'],
  summary='A platter of crisp celery, carrots and radishes with pickles, olives and celery stuffed with herb cream cheese. Something cool and crunchy to nibble while the turkey rests.',
  ingredients='''
6 stalk celery | in 3-inch sticks
4 each carrot | peeled, in sticks
8 oz radishes | trimmed (about 1 bunch)
6 each dill-pickles | spears or small whole
1 can black-olives | drained
Stuffed celery:
4 oz cream-cheese | softened
1 tbsp chives | snipped
1 pinch paprika
''',
  steps=[
    'Cut the celery and carrots into sticks of about the same length. Trim the radishes, leaving a little green on top. Crisp them in a bowl of ice water in the refrigerator for 30 minutes if you have time, then pat dry.',
    'Mix the cream cheese and chives and spread or pipe it into the hollow of 8 or so celery sticks. Dust with paprika.',
    'Arrange the vegetables, pickles and olives in groups on the platter, with the olives and pickles in small bowls so their juice doesn’t run.',
    'Keep it cold until serving, and refrigerate leftovers within 2 hours.',
  ],
  safety=[],
  make_ahead='Cut the vegetables up to 2 days ahead and keep them in water in covered containers in the refrigerator. Stuff the celery the morning of.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; the vegetables keep 3 to 4 days for lunchboxes and soup.', 'lunch'),
  kids='A great first job: kids can wash the vegetables, fill the celery and arrange the tray.',
  swaps={'dairy_free': 'Fill the celery with peanut or sunflower seed butter instead of cream cheese.', 'more': 'Add pickled beets, sweet gherkins, cherry tomatoes or deviled eggs.'},
  prep_day=dict(ahead='Cut the vegetables and keep them in cold water.', station='none', oven_f=None, active=20, keeps_days=2),
  pairs=['deviled-eggs'])

# =====================================================================  DESSERTS
R(id='pecan-pie', name='Pecan Pie', emoji='🥧', servings=8, serving_size='1 slice (⅛ of a 9-inch pie)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=20, cook=60, inactive=120,
  equipment=['9-inch pie plate', 'mixing bowl and whisk', 'baking sheet', 'foil or a pie crust shield', 'food thermometer (helpful)'],
  summary='A rich, gooey brown-sugar filling packed with toasted pecans in a flaky crust. Use our butter pie crust or a store-bought one.',
  ingredients='''
1 sheet pie-crust | homemade or refrigerated, for a 9-inch pie
3 each eggs
1 cup corn-syrup | light or dark
3/4 cup brown-sugar | packed
3 tbsp unsalted-butter | melted
1 tsp vanilla
1/4 tsp salt
1 1/2 cup pecans | halves or large pieces
''',
  steps=[
    'Heat the oven to 350°F with a rack in the lower third. Fit the crust into the pie plate and crimp the edge. Chill it while you make the filling.',
    'Toast the pecans on a baking sheet in the oven for 6 to 8 minutes, until fragrant. Cool a few minutes.',
    'Whisk the eggs, then whisk in the corn syrup, brown sugar, melted butter, vanilla and salt until smooth.',
    'Spread the pecans in the crust and pour the filling over them. Set the pie on the baking sheet.',
    'Bake 50 to 60 minutes, until the edges are puffed and set and the center jiggles only slightly when nudged. A thermometer in the center reads about 200°F, well past the 160°F that egg dishes need. Cover the crust edge with foil if it browns too fast.',
    'Cool on a rack at least 2 hours to set, then refrigerate.',
  ],
  safety=[T_EGGS],
  make_ahead='Bake up to 2 days ahead. Once it has cooled, keep it in the refrigerator (USDA advises refrigerating egg-rich pies such as pecan and pumpkin).',
  freezer=(True, 'Freeze the baked, cooled pie, well wrapped, up to 2 months. Thaw overnight in the refrigerator.'),
  leftovers=('Refrigerate within 2 hours of baking and eat within 3 to 4 days.', None),
  kids='Kids can arrange the pecan halves in rings on top.',
  swaps={'less_sweet': 'Use maple syrup for half the corn syrup for a deeper, less sugary flavor.', 'chocolate': 'Scatter ½ cup chocolate chips over the crust with the pecans.'},
  prep_day=dict(ahead='Bake the pie a day or two before.', station='oven', oven_f=350, active=20, keeps_days=3),
  pairs=['pumpkin-pie'])

R(id='apple-pie', name='Double-Crust Apple Pie', emoji='🍏', servings=8, serving_size='1 slice (⅛ of a 9-inch pie)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=40, cook=65, inactive=180,
  equipment=['9-inch pie plate (deep-dish is easiest)', 'large bowl', 'rolling pin', 'pastry brush', 'baking sheet lined with foil'],
  summary='Thin-sliced tart and sweet apples with cinnamon and a little lemon, baked in a flaky double crust until the juices bubble thickly through the vents.',
  ingredients='''
2 sheet pie-crust | homemade (a double batch) or refrigerated
3 lb apple | about 7 medium, a mix of tart and sweet, peeled, cored and sliced ¼ inch thick
3/4 cup sugar | plus 1 tablespoon for the top
3 tbsp flour
1 tbsp cornstarch
1 tbsp lemon-juice
1 tsp cinnamon
1/4 tsp nutmeg
1/4 tsp salt
2 tbsp unsalted-butter | in small pieces
1 each eggs | beaten with 1 tablespoon water, for the top
''',
  steps=[
    'Heat the oven to 425°F with a rack in the lower third and the foil-lined baking sheet on the rack below to catch drips. Line the pie plate with one crust and chill it.',
    'Toss the apples with ¾ cup sugar, the flour, cornstarch, lemon juice, cinnamon, nutmeg and salt.',
    'Pile the apples into the crust, mounding them in the center, and pour in any juices. Dot with the butter.',
    'Lay the second crust over the top. Trim, fold the top edge under the bottom one, and crimp. Cut 5 or 6 vents. Brush with the egg wash and sprinkle with the 1 tablespoon sugar.',
    'Bake 20 minutes at 425°F, then turn the oven to 375°F and bake 40 to 50 minutes more, until the crust is deep golden and the juices bubble slowly through the vents. Cover the edge with foil if it darkens too fast.',
    'Cool at least 3 hours so the filling sets before slicing.',
  ],
  safety=[],
  make_ahead='Bake a day ahead and keep it covered at room temperature. Or freeze the unbaked pie and bake it from frozen at 425°F for 25 minutes, then 375°F for 50 to 60 minutes.',
  freezer=(True, 'Freeze the unbaked, assembled pie, well wrapped, up to 3 months; bake from frozen. Baked pie freezes up to 2 months.'),
  leftovers=('Keep covered at room temperature up to 2 days, or refrigerate up to 4 days. Warm slices in a 300°F oven.', None),
  kids='Kids can toss the apples with the sugar and spice and cut shapes from scraps of dough for the top.',
  swaps={'crumb_top': 'Skip the top crust and cover with a crumble of ¾ cup flour, ½ cup brown sugar and 6 tablespoons cold butter; bake at 375°F for 55 to 65 minutes.'},
  prep_day=dict(ahead='Bake the pie the day before.', station='oven', oven_f=425, active=40, keeps_days=2),
  pairs=['pumpkin-pie', 'pecan-pie'])

# =====================================================================  LEFTOVERS
R(id='turkey-carcass-noodle-soup', name='Turkey Noodle Soup from the Carcass', emoji='🍜', servings=8, serving_size='about 1½ cups',
  meal=['dinner', 'lunch'], protein='turkey', method=['stovetop', 'one-pot'], tags=['leftovers', 'freezer-friendly', 'budget'], prep=20, cook=40,
  equipment=['large soup pot', 'ladle'],
  summary='The day-after soup: stock made from the roasted turkey frame, with carrots, celery, egg noodles and the last of the turkey meat.',
  ingredients='''
10 cup turkey-broth | from the carcass (see turkey stock), or store-bought
2 tbsp unsalted-butter | or olive oil
1 each onion | chopped
3 each carrot | sliced
3 stalk celery | sliced
1 tsp thyme-dried
1 leaf bay-leaves
6 oz egg-noodles | wide
1 lb turkey-breast | cooked leftover turkey, diced or shredded (about 3 cups)
1/4 cup parsley | chopped
~1 tsp salt | depends on the stock
~1/4 tsp black-pepper
''',
  steps=[
    'Make the stock the day after dinner: break up the carcass and simmer it as in our turkey stock recipe. Strain and chill it; lift off the fat.',
    'Melt the butter in the pot and cook the onion, carrots and celery until they start to soften, about 8 minutes.',
    'Add the stock, thyme and bay leaf and simmer 15 minutes, until the vegetables are tender.',
    'Add the noodles and cook as the package says, usually 6 to 8 minutes. Stir in the turkey and simmer until the soup is steaming hot all through, 165°F.',
    'Season with salt and pepper, take out the bay leaf, and stir in the parsley.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='The stock keeps 1 to 2 days in the refrigerator, or freeze it. Make the soup any day while the turkey is still good (3 to 4 days after Thanksgiving).',
  freezer=(True, 'Freeze the soup without the noodles up to 2 to 3 months; add freshly cooked noodles when you reheat it.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. The noodles soak up broth, so add a little water when reheating. Reheat to 165°F.', 'lunch'),
  kids='Kids can slice celery with a kid-safe knife and stir in the noodles.',
  swaps={'rice': 'Use ¾ cup rice or wild rice instead of noodles; simmer until tender before adding the turkey.', 'gluten_free': 'Use gluten-free pasta or rice.'},
  prep_day=dict(ahead='Make the stock from the carcass.', station='stove', oven_f=None, active=20, keeps_days=3))

R(id='day-after-turkey-sandwich', name='The Day-After Turkey Sandwich', emoji='🥪', servings=4, serving_size='1 sandwich',
  meal=['lunch'], protein='turkey', method=['no-cook'], tags=['leftovers', 'quick'], prep=10, cook=0,
  equipment=['cutting board', 'knife'],
  summary='Leftover turkey on good bread with cranberry sauce, a swipe of mayonnaise and crisp lettuce. Add a spoonful of warm stuffing if there’s any left.',
  ingredients='''
8 slice sourdough | or homemade sandwich bread, or split Parker House rolls
1/4 cup mayonnaise
1/2 cup cranberry-sauce | homemade whole-berry or jellied
3/4 lb turkey-breast | cooked leftover turkey, sliced
4 leaf green-leaf-lettuce
~1 pinch black-pepper
''',
  steps=[
    'Toast the bread if you like. Spread 4 slices with mayonnaise and the other 4 with cranberry sauce.',
    'Pile the turkey on the mayonnaise side and grind a little pepper over it. Top with lettuce.',
    'If you have leftover stuffing, warm a spoonful per sandwich to 165°F and add it. Close the sandwiches and cut them in half.',
  ],
  safety=[],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Use leftover turkey within 3 to 4 days of the dinner (USDA).', None),
  kids='Kids can build their own.',
  swaps={'hot': 'Heat the turkey in a little gravy and serve it open-faced over toast.'},
  prep_day=None,
  pairs=['jellied-cranberry-sauce'])


# =====================================================================  CREATIVE LEFTOVERS
LO_RULE = ('Refrigerate within 2 hours; eat within 3 to 4 days of the holiday dinner (USDA). Reheat to 165°F.', None)

R(id='moist-maker-sandwich', name='The “Moist Maker” Leftover Sandwich', emoji='🥪', servings=2, serving_size='1 tall sandwich',
  meal=['lunch', 'dinner'], protein='turkey', method=['stovetop'], tags=['leftovers'], prep=10, cook=10,
  equipment=['small saucepan', 'shallow dish', 'microwave-safe plate or a covered skillet', 'food thermometer'],
  summary='Turkey, cranberry sauce and stuffing with an extra slice of gravy-soaked bread in the middle. Made famous by a 1998 episode of the TV comedy Friends, “The One with Ross’s Sandwich.”',
  ingredients='''
6 slice white-bread | or a soft homemade loaf; 3 slices per sandwich
3/4 cup turkey-gravy | leftover or from a jar
8 oz cooked-turkey | leftover, sliced
1/2 cup cranberry-sauce | whole-berry or jellied
1 cup leftover-stuffing
?2 tbsp mayonnaise
''',
  steps=[
    'Bring the gravy to a rolling boil in the saucepan, then turn the heat to low. (USDA advises bringing leftover gravy to a boil before serving it again.)',
    'Warm the turkey and stuffing, covered, in the microwave or a covered skillet with a splash of gravy, until they reach 165°F.',
    'Pour the hot gravy into the shallow dish. Lay 2 slices of bread in it for a few seconds per side, so they soak up gravy but still hold together. These are the middle slices, the “moist makers.”',
    'Build each sandwich: a slice of bread (spread with mayonnaise if you like), half the turkey and cranberry sauce, a layer of stuffing, a gravy-soaked slice, then the rest of the turkey and cranberry, and a top slice of bread.',
    'Press down gently, cut in half and eat it while it’s warm. Napkins help.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=LO_RULE,
  kids='Kids can build their own; a grown-up handles the hot gravy.',
  swaps={'lighter': 'Skip the middle slice and drizzle a spoonful of warm gravy over the stuffing instead.'},
  prep_day=None,
  pairs=['jellied-cranberry-sauce'])

R(id='thanksgiving-leftover-pie', name='Thanksgiving Leftover Pie', emoji='🥧', servings=6, serving_size='about 1½ cups',
  meal=['dinner'], protein='turkey', method=['oven'], tags=['leftovers', 'kid-friendly', 'budget'], prep=15, cook=35,
  equipment=['2-quart or 8-inch square baking dish', 'mixing bowl', 'food thermometer'],
  summary='The whole dinner in one dish, shepherd’s-pie style: turkey and vegetables in gravy, a layer of stuffing, and a golden mashed-potato top.',
  ingredients='''
1 lb cooked-turkey | leftover, in bite-size pieces (about 3 cups)
2 cup frozen-peas-carrots | or leftover green beans, Brussels sprouts or roasted vegetables
1 1/2 cup turkey-gravy | leftover or from a jar
2 cup leftover-stuffing
3 cup leftover-mashed-potatoes
1/2 cup cheddar-block | shredded (optional)
~1/4 tsp black-pepper
''',
  steps=[
    'Heat the oven to 375°F. Stir the turkey, vegetables, gravy and pepper together and spread them in the baking dish.',
    'Crumble the stuffing evenly over the top.',
    'Stir the mashed potatoes to loosen them (add a splash of milk if stiff) and spread them over the stuffing to the edges. Rough up the top with a fork and sprinkle with the cheese.',
    'Bake 30 to 35 minutes, until bubbling at the edges and 165°F in the center. Turn on the broiler for the last 2 minutes for a browner top, watching closely.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Assemble it the day after Thanksgiving and refrigerate; bake within a day, adding 10 to 15 minutes from cold.',
  freezer=(True, 'Freeze the assembled, unbaked pie up to 2 months. Thaw in the refrigerator and bake until 165°F in the center.'),
  leftovers=LO_RULE,
  kids='Kids can crumble the stuffing and spread the potatoes.',
  swaps={'cranberry': 'Serve with cranberry sauce on the side, or dot a few spoonfuls over the stuffing layer.'},
  prep_day=dict(ahead='Assemble the pie.', station='oven', oven_f=375, active=15, keeps_days=1))

R(id='stuffing-waffles', name='Stuffing Waffles', emoji='🧇', servings=4, serving_size='1 large waffle',
  meal=['breakfast', 'lunch'], protein='', method=['stovetop'], tags=['leftovers', 'kid-friendly', 'quick'], prep=5, cook=20,
  equipment=['waffle iron', 'mixing bowl', 'food thermometer'],
  summary='Leftover stuffing bound with an egg and pressed in a waffle iron until crisp outside and soft inside. Top with gravy, cranberry sauce or a fried egg.',
  ingredients='''
4 cup leftover-stuffing
2 each eggs | beaten
2 tbsp whole-milk | or broth, if the stuffing is dry
?1 tbsp vegetable-oil | or cooking spray, for the waffle iron
''',
  steps=[
    'Heat the waffle iron to medium-high and brush it lightly with oil.',
    'Mix the stuffing and eggs in the bowl until it holds together when squeezed; add the milk if it’s crumbly.',
    'Pack about 1 cup into the iron, close it, and cook 5 to 7 minutes, until deep golden and crisp and the center reaches 165°F. Don’t open it early or it will tear.',
    'Lift it out with a fork and keep warm in a low oven while you cook the rest.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead=None,
  freezer=(True, 'Freeze cooled waffles in a bag up to 1 month; reheat in a toaster or oven until hot.'),
  leftovers=LO_RULE,
  kids='Kids can mix and pack the iron with a grown-up close by; the iron is hot.',
  swaps={'toppings': 'Hot gravy, cranberry sauce, a fried egg, or leftover turkey warmed in gravy.'},
  prep_day=None,
  pairs=['moist-maker-sandwich'])

R(id='mashed-potato-pancakes', name='Leftover Mashed Potato Pancakes', emoji='🥞', servings=4, serving_size='3 small pancakes',
  meal=['breakfast', 'side'], protein='vegetarian', method=['stovetop'], tags=['leftovers', 'kid-friendly', 'quick'], prep=10, cook=15,
  equipment=['large nonstick or cast-iron skillet', 'mixing bowl', 'spatula'],
  summary='Cold mashed potatoes mixed with egg, cheese and green onion and pan-fried into crisp golden cakes.',
  ingredients='''
3 cup leftover-mashed-potatoes | cold
1 each eggs
1/3 cup flour | plus more for shaping
1/2 cup cheddar-block | shredded
2 each green-onions | sliced
~1/4 tsp black-pepper
3 tbsp vegetable-oil | for the pan
?1/2 cup sour-cream | for serving
''',
  steps=[
    'Stir the potatoes, egg, flour, cheese, green onions and pepper together. Taste for salt; leftover potatoes are usually seasoned already.',
    'With floured hands, shape 12 patties about ½ inch thick.',
    'Heat the oil in the skillet over medium heat. Fry the patties in batches, 3 to 4 minutes per side, until deep golden and hot through (165°F). Don’t crowd the pan.',
    'Drain on a paper towel and serve with sour cream.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Shape the patties and refrigerate them on a plate up to 1 day.',
  freezer=(False, ''),
  leftovers=LO_RULE,
  kids='Kids can shape the patties.',
  swaps={'croquettes': 'For croquettes, roll into logs, dip in beaten egg and then breadcrumbs, and fry until golden all over.', 'gluten_free': 'Use rice flour or cornstarch instead of wheat flour.'},
  prep_day=None)

R(id='turkey-cranberry-quesadillas', name='Turkey Cranberry Quesadillas', emoji='🌮', servings=4, serving_size='1 quesadilla',
  meal=['lunch', 'dinner'], protein='turkey', method=['stovetop'], tags=['leftovers', 'kid-friendly', 'quick'], prep=10, cook=15,
  equipment=['large skillet', 'spatula'],
  summary='Leftover turkey, melty Monterey Jack and a spread of cranberry sauce in a crisp tortilla. Sweet, savory and done in minutes.',
  ingredients='''
4 each flour-tortillas | large (10-inch)
1/2 cup cranberry-sauce
8 oz cooked-turkey | shredded (about 2 cups)
2 cup monterey-jack | shredded
2 each green-onions | sliced
?1 each jalapeno | seeded and minced
1 tbsp unsalted-butter
''',
  steps=[
    'Spread 2 tablespoons cranberry sauce over half of each tortilla. Top with the turkey, cheese, green onions and jalapeño, and fold.',
    'Melt a little butter in the skillet over medium heat. Cook the quesadillas 2 or 3 minutes per side, pressing with the spatula, until golden, the cheese melts and the filling is hot (165°F).',
    'Rest a minute, then cut into wedges.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=LO_RULE,
  kids='Kids can fill and fold their own.',
  swaps={'egg_rolls': 'For turkey egg rolls, roll the same filling (plus a little leftover stuffing) in egg roll wrappers and bake at 425°F, brushed with oil, 12 to 15 minutes, until golden and 165°F inside.'},
  prep_day=None)

R(id='cranberry-turkey-sliders', name='Cranberry Turkey Sliders', emoji='🍔', servings=6, serving_size='2 sliders',
  meal=['lunch', 'dinner'], protein='turkey', method=['oven'], tags=['leftovers', 'kid-friendly'], prep=10, cook=20,
  equipment=['9 × 13-inch baking dish', 'long serrated knife', 'foil', 'pastry brush'],
  summary='A whole pan of little sandwiches on leftover rolls, with turkey, Swiss cheese and cranberry sauce, baked under a buttery mustard glaze.',
  ingredients='''
12 each hawaiian-rolls | in one connected sheet, or leftover Parker House rolls
1/2 cup cranberry-sauce
12 oz cooked-turkey | sliced
6 slice swiss | halved
Glaze:
3 tbsp unsalted-butter | melted
1 tbsp dijon-mustard
1/4 tsp garlic-powder
''',
  steps=[
    'Heat the oven to 350°F. Without separating the rolls, slice the whole sheet in half horizontally and set the bottom half in the dish.',
    'Spread the cranberry sauce over the bottom, layer on the turkey and cheese, and put the top half back on.',
    'Whisk the butter, mustard and garlic powder and brush it over the tops.',
    'Cover with foil and bake 15 minutes, then uncover and bake 5 minutes more, until the cheese melts, the tops are golden and the center reaches 165°F. Cut apart and serve.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Assemble (without the glaze) up to 1 day ahead and refrigerate; add the glaze and bake 5 minutes longer.',
  freezer=(False, ''),
  leftovers=LO_RULE,
  kids='Kids can spread the cranberry sauce and lay on the cheese.',
  swaps={'stuffing': 'Add a thin layer of warm leftover stuffing under the turkey.'},
  prep_day=dict(ahead='Assemble the sliders without the glaze.', station='oven', oven_f=350, active=10, keeps_days=1))

R(id='turkey-fried-rice', name='Leftover Turkey Fried Rice', emoji='🍚', servings=4, serving_size='about 1½ cups',
  meal=['dinner', 'lunch'], protein='turkey', method=['stovetop', 'one-pot'], tags=['leftovers', 'quick', 'budget'], prep=10, cook=15,
  equipment=['wok or large skillet', 'spatula'],
  summary='Day-old rice stir-fried hot with leftover turkey, eggs, peas and carrots, green onions and soy sauce. A quick change from turkey and gravy.',
  ingredients='''
1 cup white-rice | cooked a day ahead and chilled (makes about 3 cups)
2 tbsp vegetable-oil | divided
2 each eggs | beaten
2 clove garlic | minced
1 cup frozen-peas-carrots
10 oz cooked-turkey | diced (about 2 cups)
3 each green-onions | sliced
3 tbsp soy-sauce | low-sodium if you have it
1 tsp sesame-oil
''',
  steps=[
    'Cook the rice the day before, spread it out to cool, and refrigerate it within 2 hours. Cold rice fries up without clumping. Break up any clumps with your fingers.',
    'Heat 1 tablespoon oil in the wok over high heat. Scramble the eggs until just set, then slide them onto a plate.',
    'Add the rest of the oil, the garlic and the peas and carrots and stir-fry 1 to 2 minutes. Add the rice and turkey and stir-fry, pressing the rice against the pan, until it’s steaming hot and starting to crisp, 4 to 5 minutes (165°F).',
    'Stir in the soy sauce, sesame oil, green onions and eggs. Serve right away.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Cook and chill the rice the day before.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and eat within 1 or 2 days, since the turkey is already a leftover. Reheat to 165°F.', None),
  kids='Kids can measure the peas and stir in the green onions.',
  swaps={'gluten_free': 'Use tamari labeled gluten-free instead of soy sauce.'},
  prep_day=dict(ahead='Cook and chill the rice.', station='stove', oven_f=None, active=10, keeps_days=1))

R(id='leftover-gravy-poutine', name='Leftover Gravy Poutine', emoji='🍟', servings=4, serving_size='about 1½ cups',
  meal=['snack', 'dinner'], protein='', method=['oven', 'stovetop'], tags=['leftovers', 'kid-friendly'], prep=5, cook=30,
  equipment=['large rimmed baking sheet', 'small saucepan', 'serving platter'],
  summary='Crisp oven fries topped with cheese and hot turkey gravy, in the style of Quebec’s poutine. Add leftover turkey to make it a meal.',
  ingredients='''
2 lb frozen-fries
6 oz cheddar-block | white cheddar in small chunks, or cheese curds if you can find them
1 1/2 cup turkey-gravy | leftover or from a jar
?4 oz cooked-turkey | shredded
~1/4 tsp black-pepper
''',
  steps=[
    'Bake the fries as the package directs, until very crisp; crisp fries hold up under the gravy.',
    'Meanwhile, bring the gravy (with the turkey, if using) to a rolling boil, then keep it hot over low heat.',
    'Pile the fries on the platter, scatter the cheese over them, and ladle on the hot gravy so the cheese starts to soften. Grind pepper over the top and serve at once.',
  ],
  safety=[],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Best eaten right away; the fries go soft. Refrigerate leftover gravy within 2 hours and use it within 1 to 2 days.', None),
  kids='Kids can scatter the cheese; a grown-up ladles the hot gravy.',
  swaps={'homemade_fries': 'Use 2 lb russet potatoes cut in wedges, tossed with oil and roasted at 425°F for 35 to 40 minutes.'},
  prep_day=dict(ahead='Nothing ahead; this is a quick one.', station='oven', oven_f=425, active=5, keeps_days=0))

R(id='pumpkin-pie-parfaits', name='Pumpkin Pie Parfaits', emoji='🍨', servings=4, serving_size='1 parfait (about 1 cup)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['kid-friendly', 'quick', 'leftovers'], prep=15, cook=0,
  equipment=['mixing bowl', '4 clear glasses or jars', 'zip-top bag and rolling pin'],
  summary='Layers of spiced pumpkin yogurt, crushed graham crackers and whipped cream in a glass. Use the leftover pumpkin purée, or crumble in a slice of leftover pie.',
  ingredients='''
1 cup pumpkin-puree | leftover from a can or homemade
2 cup vanilla-yogurt
2 tbsp maple-syrup
1 tsp pumpkin-pie-spice
4 sheet graham-crackers | crushed
?1/2 cup heavy-cream | whipped, or leftover whipped cream
?2 tbsp pecans | chopped
''',
  steps=[
    'Stir the pumpkin, yogurt, maple syrup and spice together until smooth.',
    'Seal the graham crackers in the bag and crush them with the rolling pin.',
    'Layer in the glasses: crumbs, pumpkin yogurt, crumbs, pumpkin yogurt. Top with whipped cream and pecans.',
    'Serve right away, or chill up to 4 hours (the crumbs soften). Have leftover pumpkin pie? Crumble a slice into the layers instead of the crackers.',
  ],
  safety=[],
  make_ahead='Mix the pumpkin yogurt up to 2 days ahead and refrigerate; layer just before serving.',
  freezer=(False, ''),
  leftovers=('Refrigerate and eat within a day.', None),
  kids='A kid-run dessert: crushing the crackers in a bag and layering the glasses are the fun parts.',
  swaps={'shake': 'For a pumpkin pie shake, blend ½ cup pumpkin purée, 2 cups vanilla ice cream, ½ cup milk and ½ teaspoon pumpkin pie spice. Serves 2.', 'nut_free': 'Leave off the pecans.'},
  prep_day=None)

R(id='next-day-bowls', name='Thanksgiving Next-Day Bowls', emoji='🥣', servings=4, serving_size='1 bowl',
  meal=['lunch', 'dinner'], protein='turkey', method=['stovetop'], tags=['leftovers', 'quick'], prep=10, cook=15,
  equipment=['saucepan', 'microwave or covered skillet', 'food thermometer', '4 bowls'],
  summary='Everyone builds a bowl from the leftovers: warm mashed potatoes or stuffing, turkey, a green vegetable, hot gravy and a spoonful of cranberry sauce.',
  ingredients='''
2 cup leftover-mashed-potatoes
2 cup leftover-stuffing
1 lb cooked-turkey | sliced or shredded
2 cup frozen-green-beans | or leftover green beans or roasted vegetables
1 cup turkey-gravy
1/2 cup cranberry-sauce
?2 cup salad-mix | for a fresh side
''',
  steps=[
    'Bring the gravy to a rolling boil, then keep it warm over low heat.',
    'Reheat the potatoes, stuffing, turkey and green beans separately, covered, in the microwave or a covered skillet with a splash of broth or water, stirring once, until each reaches 165°F.',
    'Set everything out and let each person fill a bowl: potatoes or stuffing on the bottom, then turkey and vegetables, gravy over the top and cranberry sauce on the side.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=LO_RULE,
  kids='Kids love a build-your-own bar.',
  swaps={'grain_bowl': 'Use cooked rice, wild rice or quinoa as the base, with greens and a vinaigrette instead of gravy.'},
  prep_day=None)


# =====================================================================  COLLECTION (the page's plan)
# ids of recipes (r:) and from-scratch pages (s:) in each course; existing ones are reused, not copied
COURSES = [
    {'id': 'turkey', 'title': 'The turkey, seven ways', 'icon': '🦃',
     'intro': 'Pick one. The classic roast suits most kitchens; dry-brining needs a day’s head start; spatchcocking frees the oven fastest; smoking and frying happen outdoors. For a small table, roast just a breast.',
     'items': ['r:classic-roast-turkey', 'r:herb-butter-roast-turkey', 'r:dry-brined-turkey', 'r:wet-brined-turkey', 'r:spatchcocked-turkey', 'r:smoked-turkey', 'r:deep-fried-turkey', 'r:herb-roast-turkey-breast']},
    {'id': 'gravy', 'title': 'Gravy and stock', 'icon': '🥣',
     'intro': 'Make stock from the neck and giblets (or turkey wings) days ahead, and gravy is easy.',
     'items': ['r:turkey-gravy-from-drippings', 'r:make-ahead-turkey-gravy', 's:turkey-stock']},
    {'id': 'stuffing', 'title': 'Stuffing and dressing', 'icon': '🍞',
     'intro': 'Same idea, different name: stuffing goes in the bird, dressing bakes in a dish. USDA says baking it in a dish is safest. If you do stuff the bird, follow the rules in the box below.',
     'items': ['r:classic-bread-stuffing', 'r:cornbread-dressing', 'r:sausage-apple-stuffing', 'r:oyster-dressing', 'r:wild-rice-stuffing']},
    {'id': 'potatoes', 'title': 'Potatoes and sweet potatoes', 'icon': '🥔',
     'intro': 'Classic mashed potatoes on the stove, or a make-ahead dish that bakes while the turkey rests. Sweet potatoes two ways.',
     'items': ['r:mashed-potatoes', 'r:make-ahead-mashed-potatoes', 'r:sweet-potato-casserole-marshmallows', 'r:sweet-potato-casserole-pecans']},
    {'id': 'vegetables', 'title': 'Vegetables', 'icon': '🫛',
     'intro': 'A green bean casserole and something roasted.',
     'items': ['r:green-bean-casserole-crispy-shallots', 'r:green-bean-casserole', 'r:balsamic-roasted-brussels-sprouts', 'r:maple-roasted-sweet-potatoes-brussels', 'r:roasted-root-vegetables', 'r:brown-sugar-acorn-squash']},
    {'id': 'cranberry', 'title': 'Cranberry sauce', 'icon': '🫙',
     'intro': 'Whole-berry sauce takes 15 minutes. Jellied sauce needs a night in the refrigerator to set.',
     'items': ['r:homemade-cranberry-sauce', 'r:jellied-cranberry-sauce']},
    {'id': 'breads', 'title': 'Rolls and cornbread', 'icon': '🥐',
     'items': ['r:parker-house-rolls', 's:soft-buns-rolls', 's:cornbread', 'r:cornbread-muffins', 'r:buttermilk-biscuits'],
     'intro': 'Bake the rolls ahead and freeze them, or shape them the night before and bake while the turkey rests.'},
    {'id': 'more', 'title': 'Mac and cheese, salads and nibbles', 'icon': '🧀',
     'intro': 'Mac and cheese is on many family tables. Deviled eggs and a relish tray keep people happy while the turkey rests.',
     'items': ['r:baked-mac-and-cheese', 'r:mac-and-cheese', 'r:deviled-eggs', 'r:relish-tray', 'r:harvest-apple-salad', 'r:kale-apple-salad']},
    {'id': 'desserts', 'title': 'Pies and dessert', 'icon': '🥧',
     'intro': 'Bake pies a day or two ahead; they free up the oven on the day.',
     'items': ['r:pumpkin-pie', 'r:pecan-pie', 'r:apple-pie', 'r:apple-pear-crisp', 's:whipped-cream', 's:pie-crust', 's:pumpkin-puree']},
    {'id': 'leftovers', 'title': 'Leftovers: soups and sandwiches', 'icon': '🍜',
     'intro': 'Refrigerate leftovers within 2 hours and use them within 3 to 4 days, or freeze them (USDA).',
     'items': ['r:turkey-carcass-noodle-soup', 'r:day-after-turkey-sandwich', 'r:turkey-wild-rice-soup', 'r:turkey-club-sandwiches', 'r:turkey-cobb-salad']},
    {'id': 'creative', 'title': 'Creative leftovers', 'icon': '✨',
     'intro': 'Fun things to make the day after, the kind families trade every November: a famous TV sandwich, a whole-dinner pie, stuffing waffles and more. For the pot pie, use turkey in place of chicken.',
     'items': ['r:moist-maker-sandwich', 'r:thanksgiving-leftover-pie', 'r:stuffing-waffles', 'r:mashed-potato-pancakes', 'r:turkey-cranberry-quesadillas', 'r:cranberry-turkey-sliders',
               'r:turkey-fried-rice', 'r:leftover-gravy-poutine', 'r:next-day-bowls', 'r:pumpkin-pie-parfaits', 'r:chicken-pot-pie', 'r:turkey-tetrazzini']},
]
# make it from scratch: from-scratch pages that feed this dinner
SCRATCH = ['turkey-stock', 'pumpkin-puree', 'pie-crust', 'whipped-cream', 'sandwich-bread', 'soft-buns-rolls', 'cornbread', 'marshmallows', 'butter', 'croutons']
# the starting menu the page checks for you (one turkey, a sensible spread)
DEFAULT_MENU = ['classic-roast-turkey', 'turkey-gravy-from-drippings', 'classic-bread-stuffing', 'mashed-potatoes', 'sweet-potato-casserole-marshmallows',
                'green-bean-casserole-crispy-shallots', 'homemade-cranberry-sauce', 'parker-house-rolls', 'pumpkin-pie', 'pecan-pie']
# for the timeline tool: what each dish needs on the day.
#   oven: [temp °F, minutes in the oven on the day]; stove: minutes on the stovetop on the day (finish before dinner);
#   ahead: days it can be made ahead (0 = on the day); after_turkey: needs the turkey's pan juices
DAY = {
    'turkey-gravy-from-drippings': {'stove': 25, 'after_turkey': True},
    'make-ahead-turkey-gravy': {'stove': 10, 'ahead': 2},
    'classic-bread-stuffing': {'oven': [350, 50]}, 'cornbread-dressing': {'oven': [375, 45], 'ahead_part': 'bake the cornbread'},
    'sausage-apple-stuffing': {'oven': [350, 50]}, 'oyster-dressing': {'oven': [350, 35]}, 'wild-rice-stuffing': {'oven': [350, 20], 'ahead_part': 'cook the rice'},
    'mashed-potatoes': {'stove': 35}, 'make-ahead-mashed-potatoes': {'oven': [350, 55], 'ahead': 2},
    'sweet-potato-casserole-marshmallows': {'oven': [350, 40], 'ahead_part': 'mash the sweet potatoes'}, 'sweet-potato-casserole-pecans': {'oven': [350, 40], 'ahead_part': 'mash the sweet potatoes'},
    'green-bean-casserole-crispy-shallots': {'oven': [400, 30], 'ahead_part': 'blanch the beans, make the sauce, fry the shallots'}, 'green-bean-casserole': {'oven': [400, 30], 'ahead_part': 'assemble it'},
    'balsamic-roasted-brussels-sprouts': {'oven': [425, 25]}, 'maple-roasted-sweet-potatoes-brussels': {'oven': [425, 30]}, 'roasted-root-vegetables': {'oven': [425, 40]},
    'brown-sugar-acorn-squash': {'oven': [400, 45]},
    'homemade-cranberry-sauce': {'ahead': 7}, 'jellied-cranberry-sauce': {'ahead': 7},
    'parker-house-rolls': {'oven': [375, 18], 'last': True, 'ahead_part': 'shape the rolls and refrigerate them'}, 'cornbread-muffins': {'oven': [400, 18], 'last': True},
    'buttermilk-biscuits': {'oven': [425, 15], 'last': True},
    'baked-mac-and-cheese': {'oven': [375, 30], 'ahead_part': 'assemble it'}, 'mac-and-cheese': {'stove': 25},
    'deviled-eggs': {'ahead': 1}, 'relish-tray': {'ahead': 1}, 'harvest-apple-salad': {'stove': 0}, 'kale-apple-salad': {'stove': 0},
    'pumpkin-pie': {'ahead': 2}, 'pecan-pie': {'ahead': 2}, 'apple-pie': {'ahead': 1}, 'apple-pear-crisp': {'ahead': 1},
}
# turkey methods for the timeline: minutes per the USDA numbers (or our estimate, labeled), oven use
METHODS = {
    'classic-roast-turkey': {'label': 'Roast, unstuffed (325°F)', 'how': 'roast', 'oven': 325},
    'herb-butter-roast-turkey': {'label': 'Roast with herb butter (325°F)', 'how': 'roast', 'oven': 325},
    'stuffed': {'label': 'Roast, stuffed (325°F)', 'how': 'stuffed', 'oven': 325},
    'dry-brined-turkey': {'label': 'Dry-brined, then roasted (325°F)', 'how': 'roast', 'oven': 325, 'brine': 'dry'},
    'wet-brined-turkey': {'label': 'Wet-brined, then roasted (325°F)', 'how': 'roast', 'oven': 325, 'brine': 'wet'},
    'spatchcocked-turkey': {'label': 'Spatchcocked (425°F)', 'how': 'spatchcock', 'oven': 425},
    'smoked-turkey': {'label': 'Smoked (smoker or grill, 225 to 300°F)', 'how': 'smoke', 'oven': None},
    'deep-fried-turkey': {'label': 'Deep-fried outdoors (350°F oil)', 'how': 'fry', 'oven': None},
    'herb-roast-turkey-breast': {'label': 'Bone-in turkey breast (350°F)', 'how': 'breast', 'oven': 350},
}
# USDA FSIS, Let's Talk Turkey: roasting at 325 °F, hours [low, high] by weight [lb from, lb to]
ROAST_UNSTUFFED = [[8, 12, 2.75, 3], [12, 14, 3, 3.75], [14, 18, 3.75, 4.25], [18, 20, 4.25, 4.5], [20, 24, 4.5, 5]]
ROAST_STUFFED = [[8, 12, 3, 3.5], [12, 14, 3.5, 4], [14, 18, 4, 4.25], [18, 20, 4.25, 4.75], [20, 24, 4.75, 5.25]]
BREAST_UNSTUFFED = [[4, 8, 1.5, 3.25]]

SOURCES = [
    ('fsis-roast', 'Let’s Talk Turkey: A Consumer Guide to Safely Roasting a Turkey', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/sites/default/files/media_file/2021-04/Lets_Talk_Turkey.pdf'),
    ('fsis-thanksgiving', 'Happy Thanksgiving (thawing, cooking, stuffing and leftovers)', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/happy-thanksgiving'),
    ('fsis-stuffing', 'Stuffing and Food Safety (archived fact sheet)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20130302221439/http:/www.fsis.usda.gov/factsheets/Stuffing_and_Food_Safety/index.asp'),
    ('fsis-frying', 'Deep Fat Frying and Food Safety (archived fact sheet)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20121010032255/http:/www.fsis.usda.gov/Fact_Sheets/Deep_Fat_Frying/index.asp'),
    ('fsis-alt', 'Turkey: Alternate Routes to the Table (smoking, grilling, frying; archived)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/eot2008/20081007023842/http:/www.fsis.usda.gov/Fact_Sheets/Turkey_Alt_Routes/index.asp'),
    ('nps-fryer', 'Fire Prevention 52: Deep Fried Danger (with NFPA’s advice)', 'National Park Service', 'https://www.nps.gov/articles/p52-deep-fried-turkey-fire-safety.htm'),
    ('de-fryer', 'Turkey Fryer Safety Tips', 'Delaware State Fire School', 'https://statefireschool.delaware.gov/wp-content/uploads/sites/114/2017/10/11TurkeyFryerSafetyTips.pdf'),
]


# credits shown in each new recipe page's "Sources and credits" block (content/meal-prep/recipes/_content.gotmpl)
G = lambda t, what: {'name': t.replace('_', ' ').replace('(', '').replace(')', '') + ' (Grokipedia)', 'url': 'https://grokipedia.com/page/' + t, 'what': what}  # noqa: E731
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for a, b, c, d, w in [
    ('fsis-roast', 'Let’s Talk Turkey: A Consumer Guide to Safely Roasting a Turkey', 'USDA FSIS', 'https://www.fsis.usda.gov/sites/default/files/media_file/2021-04/Lets_Talk_Turkey.pdf', 'roasting times, thawing and resting'),
    ('fsis-thanksgiving', 'Happy Thanksgiving', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/happy-thanksgiving', 'safe temperatures, stuffing and leftovers'),
    ('fsis-stuffing', 'Stuffing and Food Safety', 'USDA FSIS, archived', 'https://webarchive.library.unt.edu/web/20130302221439/http:/www.fsis.usda.gov/factsheets/Stuffing_and_Food_Safety/index.asp', 'stuffing safety'),
    ('fsis-frying', 'Deep Fat Frying and Food Safety', 'USDA FSIS, archived', 'https://webarchive.library.unt.edu/web/20121010032255/http:/www.fsis.usda.gov/Fact_Sheets/Deep_Fat_Frying/index.asp', 'turkey size, oil temperature, frying time'),
    ('fsis-alt', 'Turkey: Alternate Routes to the Table', 'USDA FSIS, archived', 'https://webarchive.library.unt.edu/eot2008/20081007023842/http:/www.fsis.usda.gov/Fact_Sheets/Turkey_Alt_Routes/index.asp', 'smoking, grilling and frying times'),
    ('nps-fryer', 'Fire Prevention 52: Deep Fried Danger', 'National Park Service, with NFPA advice', 'https://www.nps.gov/articles/p52-deep-fried-turkey-fire-safety.htm', 'fryer fire safety'),
    ('de-fryer', 'Turkey Fryer Safety Tips', 'Delaware State Fire School', 'https://statefireschool.delaware.gov/wp-content/uploads/sites/114/2017/10/11TurkeyFryerSafetyTips.pdf', 'burner off while lowering; grease-rated extinguisher'),
]}
TURKEY_G = G('Domestic_turkey', 'background on the bird')
CREDITS = {
    'classic-roast-turkey': [U['fsis-roast'], U['fsis-thanksgiving'], U['fsis-stuffing'], TURKEY_G],
    'herb-butter-roast-turkey': [U['fsis-roast'], U['fsis-thanksgiving'], TURKEY_G],
    'dry-brined-turkey': [U['fsis-roast'], U['fsis-thanksgiving'], G('Brining', 'how brining works')],
    'wet-brined-turkey': [U['fsis-roast'], U['fsis-thanksgiving'], G('Brining', 'how brining works')],
    'spatchcocked-turkey': [U['fsis-thanksgiving'], TURKEY_G],
    'smoked-turkey': [U['fsis-alt'], U['fsis-thanksgiving'], TURKEY_G],
    'deep-fried-turkey': [U['fsis-frying'], U['fsis-alt'], U['nps-fryer'], U['de-fryer'], G('Turkey_fryer', 'background')],
    'turkey-gravy-from-drippings': [G('Gravy', 'background'), U['fsis-thanksgiving']],
    'make-ahead-turkey-gravy': [G('Gravy', 'background'), U['fsis-thanksgiving']],
    'classic-bread-stuffing': [U['fsis-stuffing'], U['fsis-thanksgiving'], G('Stuffing', 'stuffing and dressing')],
    'cornbread-dressing': [U['fsis-stuffing'], G('Cornbread', 'background'), G('Stuffing', 'stuffing and dressing')],
    'sausage-apple-stuffing': [U['fsis-stuffing'], G('Stuffing', 'stuffing and dressing')],
    'oyster-dressing': [U['fsis-stuffing'], G('Stuffing', 'regional stuffings, including oyster')],
    'wild-rice-stuffing': [G('Wild_rice', 'background')],
    'make-ahead-mashed-potatoes': [G('Mashed_potato', 'background')],
    'sweet-potato-casserole-marshmallows': [G('Marshmallow', 'background')],
    'green-bean-casserole-crispy-shallots': [G('Green_bean_casserole', 'the dish’s history')],
    'jellied-cranberry-sauce': [G('Cranberry_sauce', 'background')],
    'parker-house-rolls': [G('Parker_House_roll', 'the roll and the hotel')],
    'deviled-eggs': [G('Deviled_egg', 'background')],
    'pecan-pie': [G('Pecan_pie', 'background'), U['fsis-thanksgiving']],
    'apple-pie': [G('Apple_pie', 'background')],
    'turkey-carcass-noodle-soup': [U['fsis-thanksgiving']],
    'moist-maker-sandwich': [G('List_of_Friends_episodes', 'the episode’s title and 1998 air date'), U['fsis-thanksgiving']],
    'thanksgiving-leftover-pie': [U['fsis-thanksgiving']], 'stuffing-waffles': [U['fsis-thanksgiving']], 'mashed-potato-pancakes': [U['fsis-thanksgiving']],
    'turkey-cranberry-quesadillas': [U['fsis-thanksgiving']], 'cranberry-turkey-sliders': [U['fsis-thanksgiving']], 'turkey-fried-rice': [U['fsis-thanksgiving']],
    'leftover-gravy-poutine': [G('Poutine', 'the dish’s Quebec origin'), U['fsis-thanksgiving']], 'next-day-bowls': [U['fsis-thanksgiving']],
    'day-after-turkey-sandwich': [U['fsis-thanksgiving']],
}


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


def main():
    out = build(RECIPES)
    # every id the page points to must exist (recipes from all files, from-scratch pages)
    sys.path.insert(0, os.path.join(SITE, 'scripts', 'meals'))
    rec_ids = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != 'thanksgiving.json':
            rec_ids |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    sc_ids = {s['id'] for s in json.load(open(os.path.join(SITE, 'data/meals/scratch.json')))['recipes']}
    allr = []
    for c in COURSES:
        for it in c['items']:
            kind, _, i = it.partition(':')
            if (kind == 'r' and i not in rec_ids) or (kind == 's' and i not in sc_ids) or kind not in 'rs':
                raise SystemExit(f'course {c["id"]}: unknown {it}')
            if kind == 'r' and i not in allr:
                allr.append(i)
    for i in SCRATCH:
        if i not in sc_ids:
            raise SystemExit(f'unknown scratch page {i}')
    for i in list(DEFAULT_MENU) + list(DAY) + [k for k in METHODS if k != 'stuffed']:
        if i not in rec_ids:
            raise SystemExit(f'unknown recipe {i}')
    new_ids = {r['id'] for r in out}
    missing = new_ids - set(allr)
    if missing:
        raise SystemExit(f'new recipes not on the page: {missing}')
    coll = {'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'day': DAY, 'methods': METHODS,
            'roast_unstuffed': ROAST_UNSTUFFED, 'roast_stuffed': ROAST_STUFFED, 'breast': BREAST_UNSTUFFED,
            'all': allr, 'new': [r['id'] for r in out],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    path = os.path.join(SITE, 'data/meals/recipes', 'thanksgiving.json')
    with open(path, 'w') as fh:
        json.dump({'note': 'Thanksgiving dinner (/meal-prep/thanksgiving/): new recipes plus the page plan, which reuses recipes from the other files by id. '
                           'Edit scripts/meals/src/build_thanksgiving.py and run it; allergens, diet and guides are derived from the catalog.',
                   'collection': coll, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print('thanksgiving.json', len(out), 'new recipes;', len(allr), 'recipes on the page')


if __name__ == '__main__':
    main()
