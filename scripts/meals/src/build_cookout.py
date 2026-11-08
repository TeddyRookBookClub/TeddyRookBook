#!/usr/bin/env python3
"""Builds data/meals/recipes/cookout.json: "Fourth of July and summer cookouts" at /meal-prep/cookout/.

Run:  python3 scripts/meals/src/build_cookout.py      (build the catalog first)
Then: node scripts/meals/check-data.js

New recipes written for the collection, plus a page plan that reuses burgers, ribs, salads, watermelon and berry
desserts that already live elsewhere in Meal Prep (by id). The page itself is layouts/meal-prep/occasion.html.

Food safety comes only from USDA FSIS (grilling, safe temperatures, marinating, coolers, the 2-hour / 1-hour rule),
the U.S. Fire Administration (grill fire safety) and CDC (carbon monoxide). Disputed points are left out.
  USDA FSIS, Grilling Food Safely; Safe Temperature Chart; Tailgating Food Safety (archived fact sheet)
  U.S. Fire Administration, Outdoor Fire Safety (grills)
  CDC, Carbon Monoxide (CO) Poisoning Prevention
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from occasion_lib import G, build, write  # noqa: E402

SLUG = 'cookout'
T_CHICKEN = ('chicken', 165, 0)
T_GROUND = ('ground beef', 160, 0)
T_HOTDOG = ('hot dogs, reheated', 165, 0)
T_RIBS = ('pork ribs (whole cuts)', 145, 3)
T_EGGS = ('egg dishes', 160, 0)

COLD = 'Keep it cold until serving: 40°F or below in the refrigerator or a cooler with plenty of ice. Put it away within 2 hours of setting it out, or within 1 hour if it’s above 90°F outside (USDA).'
PLATE = 'Take the cooked food off the grill onto a clean platter, not the one that held it raw (USDA).'
NOPART = 'Cook it all the way through in one go: never partly grill meat or poultry to finish later (USDA).'
MARINADE = 'Marinate in the refrigerator, never on the counter. Throw out the used marinade, or boil it first if you want to brush it on cooked food (USDA).'
LEFT = ('Refrigerate leftovers within 2 hours (1 hour on a day above 90°F) in shallow containers; eat within 3 to 4 days (USDA). Reheat to 165°F.', None)

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  FROM THE GRILL
R(id='grilled-hot-dogs', name='Grilled Hot Dogs with All the Toppings', emoji='🌭', servings=8, serving_size='1 hot dog in a bun, with toppings',
  meal=['dinner', 'lunch'], protein='beef', method=['grill'], tags=['kid-friendly', 'budget'], prep=10, cook=10,
  equipment=['grill', 'long tongs', 'food thermometer', 'clean platter', 'small bowls for toppings'],
  summary='Hot dogs grilled until they blister, in toasted buns, with a toppings bar so everyone builds their own: mustard, ketchup, relish, onions, sauerkraut and cheese.',
  ingredients='''
8 each hot-dogs | all-beef or your favorite kind
8 each hot-dog-buns
Toppings bar:
~1/4 cup yellow-mustard
~1/4 cup ketchup
~1/4 cup pickle-relish
?1/2 each onion | finely chopped
?1 cup sauerkraut | drained and warmed
?1/2 cup cheddar | shredded
''',
  steps=[
    'Heat the grill to medium. Set out the toppings in small bowls; keep the sauerkraut warm and the cheese cold until serving.',
    'Grill the hot dogs, turning every minute or two with tongs, for 6 to 8 minutes, until they are browned and heated through. Hot dogs are already cooked, but USDA advises reheating them until steaming hot, 165°F in the center.',
    'Lay the buns cut side down on the edge of the grill for 30 to 60 seconds to toast.',
    PLATE + ' Tuck each hot dog into a bun and let everyone add toppings.',
    'Cut hot dogs lengthwise and then into small pieces for young children, since round slices are a choking risk.',
  ],
  safety=[T_HOTDOG],
  make_ahead='Chop the onion and set up the toppings bar in the refrigerator an hour or two ahead.',
  freezer=(True, 'Unopened hot dogs freeze 1 to 2 months for best quality (USDA).'),
  leftovers=('Refrigerate grilled hot dogs within 2 hours (1 hour above 90°F) and eat within 3 to 4 days. Reheat until steaming hot, 165°F.', 'lunch'),
  kids='Kids can set up the toppings bar and build their own. Cut hot dogs lengthwise, then into small pieces, for little ones.',
  swaps={'turkey_or_chicken': 'Use turkey or chicken hot dogs; grill them the same way.', 'gluten_free': 'Use gluten-free buns and check the hot dog label.', 'vegetarian': 'Grill plant-based hot dogs per the package.'},
  prep_day=dict(ahead='Set up the toppings bar.', station='grill', oven_f=None, active=10, keeps_days=1),
  pairs=['classic-mustard-potato-salad', 'homemade-baked-beans', 'corn-on-the-cob'])

R(id='grilled-bbq-chicken', name='Grilled Barbecue Chicken', emoji='🍗', servings=6, serving_size='2 pieces',
  meal=['dinner'], protein='chicken', method=['grill'], tags=['kid-friendly'], prep=15, cook=40,
  equipment=['grill with a lid', 'long tongs', 'basting brush', 'food thermometer', 'clean platter'],
  summary='Bone-in thighs and drumsticks cooked over gentle heat until tender, then brushed with barbecue sauce at the end so it turns sticky instead of burning.',
  ingredients='''
2 lb chicken-thighs-bone-in | skin on, about 6
2 lb chicken-drumsticks | about 6
Rub:
1 tbsp brown-sugar
2 tsp paprika
1 1/2 tsp kosher-salt
1 tsp garlic-powder
1 tsp onion-powder
1/2 tsp black-pepper
1 tbsp vegetable-oil
1 cup bbq-sauce | or our homemade barbecue sauce
''',
  steps=[
    'Set up the grill for two zones: on a gas grill, one side on medium and the other side off or on low; with charcoal, push the hot coals to one side. You want about 350 to 400°F under the lid.',
    'Pat the chicken dry. Mix the rub, toss the chicken with the oil, then with the rub. Wash your hands and anything the raw chicken touched.',
    'Brown the chicken skin side down over the hotter side, 2 to 3 minutes, watching for flare-ups. Move it to the cooler side, close the lid and cook 25 to 35 minutes, turning once or twice.',
    'Pour about half the sauce into a small bowl for brushing; keep the rest clean for the table. Brush the chicken in the last 10 minutes, turning and brushing two or three times. Sugar in the sauce burns fast, so keep it on the cooler side.',
    'Check with a food thermometer in the thickest part, not touching bone: the chicken is safe at 165°F (USDA). Dark meat gets more tender if you take it a little further, to about 175°F.',
    PLATE + ' ' + NOPART,
  ],
  safety=[T_CHICKEN],
  make_ahead='Rub the chicken up to a day ahead and keep it covered in the refrigerator.',
  freezer=(True, 'Freeze cooked chicken up to 4 months for best quality (USDA).'),
  leftovers=('Refrigerate within 2 hours (1 hour above 90°F); eat within 3 to 4 days (USDA). Pull the meat off the bone for barbecue chicken sandwiches or salads.', 'lunch'),
  kids='Kids can mix the rub and brush sauce onto cooked pieces at the table. A grown-up handles the grill.',
  swaps={'oven': 'Bake at 400°F on a rack over a foil-lined pan for 40 to 45 minutes, brushing with sauce for the last 10, until 165°F.', 'boneless': 'Use boneless thighs; grill them over direct medium heat 5 to 6 minutes per side before saucing.'},
  prep_day=dict(ahead='Rub the chicken.', station='grill', oven_f=None, active=20, keeps_days=4),
  pairs=['vinegar-coleslaw', 'homemade-baked-beans', 'corn-on-the-cob'])

R(id='grilled-lemon-herb-chicken', name='Lemon-Herb Grilled Chicken Breasts', emoji='🍋', servings=6, serving_size='1 breast half (about 5 oz cooked)',
  meal=['dinner', 'lunch'], protein='chicken', method=['grill'], tags=['make-ahead'], prep=15, cook=12, inactive=60,
  equipment=['grill or grill pan', 'zip-top bag or covered dish', 'meat mallet or rolling pin', 'food thermometer', 'clean platter'],
  summary='Chicken breasts pounded to an even thickness and marinated in lemon, garlic, oregano and olive oil, so they grill fast and stay juicy. Good hot, or sliced cold onto salads.',
  ingredients='''
2 1/4 lb chicken-breast | 3 large breasts, halved into 6 pieces
Marinade:
1/4 cup olive-oil
1 each lemon | zest and juice
3 clove garlic | grated
1 tbsp oregano | dried
1 tsp kosher-salt
1/2 tsp black-pepper
2 tbsp parsley | chopped, for serving
''',
  steps=[
    'Put the chicken between sheets of plastic wrap and pound the thick ends until the pieces are an even ¾ inch. Wash your hands and the work surface.',
    'Whisk the marinade in a bag or dish, add the chicken and turn to coat. ' + MARINADE + ' Marinate 1 to 4 hours; longer and the lemon makes the meat mushy.',
    'Heat the grill to medium-high and oil the grates. Lift the chicken out of the marinade and throw the marinade away.',
    'Grill 5 to 6 minutes per side, without moving it until it releases easily, until a food thermometer in the thickest part reads 165°F (USDA).',
    PLATE + ' Rest 5 minutes, slice, and sprinkle with parsley.',
  ],
  safety=[T_CHICKEN],
  make_ahead='Marinate in the morning for an evening cookout. Grilled breasts keep 3 to 4 days for salads and wraps.',
  freezer=(True, 'Freeze the raw chicken in its marinade up to 3 months and thaw it in the refrigerator, or freeze cooked slices up to 4 months.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days (USDA). Slice cold for salads, wraps and lunchboxes.', 'lunch'),
  kids='Kids can zest the lemon, measure the marinade and squeeze the bag closed.',
  swaps={'thighs': 'Boneless thighs stay juicier and need no pounding; grill 5 to 7 minutes per side to 165°F.', 'herbs': 'Use 2 tablespoons fresh oregano or thyme instead of dried.'},
  prep_day=dict(ahead='Pound and marinate the chicken.', station='grill', oven_f=None, active=15, keeps_days=4),
  pairs=['grilled-vegetable-skewers', 'pasta-salad', 'watermelon-feta-salad'])

R(id='grilled-baby-back-ribs', name='Grill-Smoked Baby Back Ribs', emoji='🍖', servings=6, serving_size='about ⅓ rack',
  meal=['dinner'], protein='pork', method=['grill'], tags=[], prep=20, cook=210,
  equipment=['grill with a lid (gas or charcoal)', 'grill thermometer, or the lid gauge', 'food thermometer', 'foil', 'basting brush', 'long tongs', 'cutting board'],
  summary='Two racks of ribs cooked low and slow beside the fire, not over it, then wrapped to turn tender and brushed with sauce at the end. A cookout afternoon project.',
  ingredients='''
4 1/2 lb pork-ribs | 2 racks baby back ribs
Rub:
3 tbsp brown-sugar
1 tbsp paprika
1 tbsp smoked-paprika
2 tsp kosher-salt
1 tsp garlic-powder
1 tsp onion-powder
1 tsp chili-powder
1/2 tsp black-pepper
1/4 cup apple-juice | for wrapping
1 cup bbq-sauce | or our homemade barbecue sauce
''',
  steps=[
    'Pat the ribs dry. On the bone side, slide a butter knife under the thin membrane at one end, grab it with a paper towel and pull it off. Mix the rub and pat it over both sides. Wash your hands.',
    'Set up the grill for indirect heat at 250 to 275°F: on a gas grill, light one side on low and leave the other off; with charcoal, bank a small fire on one side. Add a pan of water under the cool side if you like, which helps keep the heat steady.',
    'Lay the ribs bone side down on the cool side, close the lid and cook 2 hours. Check the lid temperature now and then and adjust the burner or add a few coals to stay near 250 to 275°F.',
    'Wrap each rack in a double layer of foil with 2 tablespoons of apple juice, and return to the cool side for 45 minutes to 1 hour, until a toothpick slides between the bones easily.',
    'Unwrap the ribs (careful of steam), brush with sauce and cook uncovered on the cool side 15 to 20 minutes more, brushing once or twice, until sticky.',
    'Pork is safe at 145°F with a 3-minute rest (USDA); ribs are cooked far past that to become tender, and the meat pulls back from the bone ends. ' + PLATE + ' Rest 5 minutes and cut between the bones.',
  ],
  safety=[T_RIBS],
  make_ahead='Rub the ribs the night before. Or cook them through step 4 a day ahead, chill, and finish on a medium grill with sauce until hot (165°F) and sticky.',
  freezer=(True, 'Freeze cooked ribs, wrapped well, up to 3 months. Thaw in the refrigerator and reheat to 165°F.'),
  leftovers=LEFT,
  kids='Kids can mix the rub and brush on the sauce at the end, with a grown-up at the grill.',
  swaps={'oven': 'No grill time? Use our oven baby back ribs and finish them on the grill for 10 minutes.', 'spare_ribs': 'Spare ribs are bigger: add about an hour in step 3.'},
  prep_day=dict(ahead='Rub the ribs the night before.', station='grill', oven_f=None, active=30, keeps_days=4),
  pairs=['homemade-baked-beans', 'vinegar-coleslaw', 'grilled-street-corn'])

R(id='grilled-vegetable-skewers', name='Grilled Vegetable Skewers', emoji='🍢', servings=6, serving_size='2 skewers',
  meal=['side', 'dinner'], protein='vegetarian', method=['grill'], tags=['kid-friendly'], prep=25, cook=12,
  equipment=['12 skewers (soak wooden ones in water 30 minutes)', 'grill or grill pan', 'large bowl', 'long tongs'],
  summary='Zucchini, peppers, red onion, mushrooms and cherry tomatoes tossed in garlic and herbs and grilled until charred at the edges. A side for everyone, and a main for vegetarians.',
  ingredients='''
2 each zucchini | in 1-inch half-moons
1 each red-bell-pepper | in 1-inch pieces
1 each yellow-bell-pepper | in 1-inch pieces
1 each red-onion | in 1-inch chunks
8 oz mushrooms | whole, small
1 1/2 cup cherry-tomatoes
Dressing:
1/4 cup olive-oil
2 tbsp balsamic-vinegar
2 clove garlic | grated
1 tsp italian-seasoning
1 tsp kosher-salt
1/2 tsp black-pepper
''',
  steps=[
    'Whisk the dressing in a large bowl. Add the vegetables and toss to coat. Let them sit 15 minutes, or up to 2 hours in the refrigerator.',
    'Thread the vegetables onto the skewers, mixing colors. Put tomatoes on their own skewers if you like, since they cook faster.',
    'Heat the grill to medium-high and oil the grates. Grill the skewers 10 to 12 minutes, turning every few minutes, until tender and charred in spots; tomato skewers need only 4 to 5 minutes.',
    'Brush with any dressing left in the bowl and serve hot or at room temperature.',
  ],
  safety=[],
  make_ahead='Cut the vegetables and make the dressing the day before; thread the skewers a few hours ahead and refrigerate.',
  freezer=(False, 'Grilled vegetables turn watery when frozen.'),
  leftovers=('Refrigerate within 2 hours; keeps 3 to 4 days. Chop leftovers into pasta salad or a wrap.', 'lunch'),
  kids='Kids can thread the skewers (blunt ends, sitting down) and pick their own colors.',
  swaps={'halloumi_or_tofu': 'Add cubes of firm tofu or halloumi for protein.', 'no_skewers': 'Use a grill basket and toss the vegetables now and then.'},
  prep_day=dict(ahead='Cut the vegetables; make the dressing.', station='grill', oven_f=None, active=25, keeps_days=2),
  pairs=['grilled-lemon-herb-chicken', 'classic-burgers', 'black-bean-burgers'])

# =====================================================================  SALADS AND SIDES
R(id='classic-mustard-potato-salad', name='Classic Mustard Potato Salad', emoji='🥔', servings=10, serving_size='about ⅔ cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=25, cook=20, inactive=120,
  equipment=['large pot', 'colander', 'large bowl', 'small pot for eggs'],
  summary='The yellow, old-fashioned kind: tender potatoes dressed while warm with vinegar, then mixed with mayonnaise, mustard, pickles, celery, onion and chopped egg.',
  ingredients='''
3 lb russet-potato | peeled, in ¾-inch cubes
^1 tbsp kosher-salt | for the cooking water (most drains away)
4 each eggs
2 tbsp cider-vinegar
3/4 cup mayonnaise
2 tbsp yellow-mustard
3 tbsp pickle-relish | or chopped dill pickles
2 stalk celery | finely chopped
1/2 each onion | finely chopped
1 tsp kosher-salt
1/2 tsp black-pepper
~1/2 tsp paprika | for the top
''',
  steps=[
    'Put the potatoes in a pot, cover with cold water by an inch and add the salt. Bring to a boil and simmer 8 to 10 minutes, until a knife slides in easily but they still hold their shape. Drain well, spread in a large bowl and sprinkle with the vinegar while warm.',
    'Meanwhile, cover the eggs with water in a small pot, bring to a boil, cover, take off the heat and let stand 12 minutes. Cool in ice water, peel and chop.',
    'Stir the mayonnaise, mustard, relish, celery, onion, salt and pepper together. When the potatoes are no longer steaming, fold in the dressing and eggs gently.',
    'Cover and refrigerate at least 2 hours, until cold. Dust with paprika before serving. ' + COLD,
  ],
  safety=[],
  make_ahead='Best made a day ahead so the flavors settle. Keeps 3 to 4 days in the refrigerator.',
  freezer=(False, 'Mayonnaise and cooked potatoes don’t freeze well.'),
  leftovers=('Keep refrigerated and eat within 3 to 4 days. Throw out any that sat out more than 2 hours (1 hour above 90°F).', 'lunch'),
  kids='Kids can peel the cooled eggs, stir the dressing and fold it in gently.',
  swaps={'no_egg': 'Leave out the eggs and use an egg-free mayonnaise for egg allergies.', 'red_potatoes': 'Use red potatoes with the skins on; no peeling needed.'},
  prep_day=dict(ahead='Make it the day before.', station='stove', oven_f=None, active=30, keeps_days=4),
  pairs=['grilled-hot-dogs', 'classic-burgers', 'grilled-bbq-chicken'])

R(id='macaroni-salad', name='Picnic Macaroni Salad', emoji='🍝', servings=10, serving_size='about ⅔ cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'kid-friendly', 'budget'], prep=15, cook=10, inactive=60,
  equipment=['large pot', 'colander', 'large bowl'],
  summary='Elbow macaroni in a creamy, tangy dressing with crunchy celery, bell pepper and a little sweet pickle. A cookout classic kids reach for.',
  ingredients='''
1 lb elbow-macaroni
^1 tbsp kosher-salt | for the pasta water (most drains away)
1 cup mayonnaise
2 tbsp cider-vinegar
1 tbsp sugar
1 tbsp yellow-mustard
1 tsp kosher-salt
1/2 tsp black-pepper
2 stalk celery | finely chopped
1 each red-bell-pepper | finely chopped
1/2 each red-onion | finely chopped
1/4 cup pickle-relish
''',
  steps=[
    'Cook the macaroni in boiling salted water 1 minute past the package time, so it stays tender when cold. Drain, rinse with cold water until cool, and drain well.',
    'Whisk the mayonnaise, vinegar, sugar, mustard, salt and pepper in a large bowl.',
    'Add the macaroni, celery, pepper, onion and relish and stir well. The pasta drinks up dressing as it sits, so it will thicken.',
    'Refrigerate at least 1 hour. Stir in a splash of milk or a spoonful of mayonnaise before serving if it seems dry. ' + COLD,
  ],
  safety=[],
  make_ahead='Make it up to a day ahead. Keeps 3 to 4 days in the refrigerator.',
  freezer=(False, 'Doesn’t freeze well.'),
  leftovers=('Keep refrigerated; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can chop the celery with a kid-safe knife, measure the dressing and stir.',
  swaps={'no_egg': 'Use an egg-free mayonnaise.', 'gluten_free': 'Use gluten-free elbow pasta, cooked just to the package time.'},
  prep_day=dict(ahead='Make the salad.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=['grilled-bbq-chicken', 'grilled-hot-dogs', 'classic-burgers'])

R(id='homemade-baked-beans', name='Homemade Baked Beans with Bacon', emoji='🫘', servings=10, serving_size='about ½ cup',
  meal=['side'], protein='pork', method=['oven', 'stovetop'], tags=['make-ahead', 'budget'], prep=15, cook=75,
  equipment=['oven-safe pot or 9x13-inch baking dish', 'skillet'],
  summary='Navy beans baked slowly with bacon, onion, molasses, brown sugar and mustard until the sauce turns thick and glossy. Made from canned beans, so no overnight soak.',
  ingredients='''
4 can white-beans | navy or great northern, 15 oz each, drained and rinsed
6 strip bacon | chopped
1 each onion | chopped
1/2 cup ketchup
1/4 cup molasses
1/4 cup brown-sugar
1 tbsp yellow-mustard
1 tbsp cider-vinegar
1 tsp worcestershire
1/2 tsp black-pepper
1 cup water
''',
  steps=[
    'Heat the oven to 325°F.',
    'Cook the bacon in an oven-safe pot or skillet over medium heat until it starts to crisp, about 6 minutes. Add the onion and cook 5 minutes, until soft. Spoon off all but about a tablespoon of the fat.',
    'Stir in the ketchup, molasses, brown sugar, mustard, vinegar, Worcestershire, pepper and water, then the beans. Bring to a simmer. (Pour into a baking dish now if your pot can’t go in the oven.)',
    'Bake uncovered 1 hour, stirring once or twice, until the sauce is thick and bubbling at the edges. It thickens more as it cools a little. Taste for salt; the bacon adds plenty.',
  ],
  safety=[],
  make_ahead='Bake a day or two ahead and reheat, covered, at 350°F for 30 minutes (to 165°F) or on the stove; add a splash of water.',
  freezer=(True, 'Freezes up to 3 months. Thaw in the refrigerator and reheat to 165°F.'),
  leftovers=LEFT,
  kids='Kids can rinse the beans in a colander and stir the sauce before it heats.',
  swaps={'vegetarian': 'Skip the bacon, cook the onion in 2 tablespoons oil, and add 1 teaspoon smoked paprika.', 'slow_cooker': 'After step 3, cook in a slow cooker on low 4 to 5 hours.'},
  prep_day=dict(ahead='Bake the beans.', station='oven', oven_f=325, active=20, keeps_days=4),
  pairs=['grilled-bbq-chicken', 'grilled-hot-dogs', 'grilled-baby-back-ribs'])

R(id='vinegar-coleslaw', name='Tangy Vinegar Coleslaw', emoji='🥬', servings=8, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'budget'], prep=15, cook=0, inactive=60,
  equipment=['large bowl', 'small saucepan or microwave-safe cup', 'whisk'],
  summary='A crunchy, mayonnaise-free slaw dressed with cider vinegar, a little sugar and celery seed. It holds up better than creamy slaw on a hot day and belongs on a pulled pork sandwich.',
  ingredients='''
1 head cabbage | about 2 lb, cored and thinly sliced, or 2 bags coleslaw mix
2 each carrot | grated
1/2 each red-onion | very thinly sliced
Dressing:
1/2 cup cider-vinegar
1/3 cup sugar
1/4 cup vegetable-oil
1 1/2 tsp kosher-salt
1 tsp celery-seed
1/2 tsp black-pepper
''',
  steps=[
    'Warm the vinegar and sugar just until the sugar dissolves (a minute in the microwave). Whisk in the oil, salt, celery seed and pepper.',
    'Toss the cabbage, carrots and onion with the dressing in a large bowl.',
    'Refrigerate at least 1 hour, tossing once or twice. The cabbage softens a little and gives off liquid; toss again and serve with a slotted spoon.',
  ],
  safety=[],
  make_ahead='Make it up to a day ahead; it stays crunchy for 3 days.',
  freezer=(False, 'Cabbage turns limp when frozen.'),
  leftovers=('Keeps 3 days in the refrigerator.', None),
  kids='Kids can grate carrots with a grown-up nearby and toss the slaw with clean hands or tongs.',
  swaps={'less_sugar': 'Use 3 tablespoons sugar or honey.'},
  prep_day=dict(ahead='Make the slaw.', station='none', oven_f=None, active=15, keeps_days=3),
  pairs=['bbq-pulled-pork', 'grilled-bbq-chicken', 'grilled-baby-back-ribs'])

R(id='grilled-street-corn', name='Grilled Street-Style Corn', emoji='🌽', servings=8, serving_size='1 ear',
  meal=['side'], protein='vegetarian', method=['grill'], tags=['kid-friendly'], prep=10, cook=12,
  equipment=['grill', 'long tongs', 'small bowl', 'pastry brush or spoon'],
  summary='Corn grilled until charred, then coated with a creamy lime sauce, crumbled cheese and chili powder, in the style of Mexican elote sold by street vendors.',
  ingredients='''
8 ear corn-on-cob | husked
1/3 cup mayonnaise
1/3 cup sour-cream
1 each lime | zest and juice, plus wedges
1/2 cup feta | crumbled (or cotija)
1 tsp chili-powder
2 tbsp cilantro | chopped
''',
  steps=[
    'Heat the grill to medium-high. Stir the mayonnaise, sour cream, lime zest and 1 tablespoon lime juice together.',
    'Grill the corn 10 to 12 minutes, turning every couple of minutes, until tender and charred in spots.',
    'While hot, brush or spoon the sauce over each ear, roll or sprinkle with the cheese, and dust with chili powder and cilantro. Serve with lime wedges.',
  ],
  safety=[],
  make_ahead='Mix the sauce a day ahead and refrigerate.',
  freezer=(False, 'Best eaten fresh.'),
  leftovers=('Cut the kernels off and refrigerate up to 3 days; stir into salads or tacos.', None),
  kids='Kids can husk the corn and sprinkle on the cheese. Cut kernels off the cob for little ones.',
  swaps={'off_the_cob': 'Grill, cut the kernels off, and toss with the sauce in a bowl for an easy-to-serve salad.', 'no_egg': 'Use all sour cream or plain yogurt instead of mayonnaise.'},
  prep_day=dict(ahead='Mix the sauce.', station='grill', oven_f=None, active=15, keeps_days=1),
  pairs=['grilled-bbq-chicken', 'grilled-baby-back-ribs', 'classic-burgers'])

R(id='homemade-bbq-sauce', name='Homemade Barbecue Sauce', emoji='🥫', servings=16, serving_size='2 tablespoons (makes about 2 cups)',
  meal=['side'], protein='', method=['stovetop'], tags=['make-ahead'], prep=5, cook=20,
  equipment=['small saucepan', 'whisk', 'jar for storing'],
  summary='A sweet, tangy, lightly smoky sauce from ketchup, molasses, vinegar and spices. Twenty minutes on the stove, and it keeps for weeks.',
  ingredients='''
1 1/2 cup ketchup
1/3 cup cider-vinegar
1/4 cup brown-sugar
2 tbsp molasses
1 tbsp worcestershire
1 tbsp yellow-mustard
1 tsp smoked-paprika
1 tsp garlic-powder
1 tsp onion-powder
1/2 tsp black-pepper
?1/4 tsp cayenne
''',
  steps=[
    'Whisk everything in a small saucepan and bring to a simmer over medium heat.',
    'Lower the heat and simmer 15 to 20 minutes, stirring often (it spatters), until thick enough to coat a spoon.',
    'Cool and pour into a clean jar. Keep a separate small bowl for brushing raw or cooking meat, so the jar stays clean.',
  ],
  safety=[],
  make_ahead='Keeps up to 3 weeks in a covered jar in the refrigerator.',
  freezer=(True, 'Freezes up to 6 months.'),
  leftovers=None,
  kids='Kids can measure and whisk everything before it goes on the heat.',
  swaps={'fish_free': 'Worcestershire usually contains anchovies; use soy sauce for a fish-free sauce.', 'spicier': 'Add the cayenne and a few dashes of hot sauce.'},
  prep_day=dict(ahead='Make the sauce.', station='stove', oven_f=None, active=10, keeps_days=21),
  pairs=['grilled-bbq-chicken', 'grilled-baby-back-ribs', 'bbq-pulled-pork'])

# =====================================================================  DRINKS AND DESSERTS
R(id='fresh-lemonade', name='Fresh-Squeezed Lemonade', emoji='🍋', servings=8, serving_size='1 cup',
  meal=['snack'], protein='vegetarian', method=['stovetop', 'no-cook'], tags=['kid-friendly', 'make-ahead'], prep=15, cook=5, inactive=30,
  equipment=['citrus juicer or reamer', 'small saucepan', 'large pitcher', 'fine strainer'],
  summary='Real lemons, sugar dissolved into a quick syrup so it never sits gritty at the bottom, and cold water. Easy to make less sweet, or pink with berries.',
  ingredients='''
1 cup sugar
1 cup water | for the syrup
8 each lemon | juiced, for about 1½ cups juice (or 1½ cups bottled lemon juice)
5 cup water | cold
?1 each lemon | sliced, for the pitcher
''',
  steps=[
    'Heat the sugar and 1 cup water, stirring, just until the sugar dissolves. Let the syrup cool.',
    'Roll the lemons on the counter, cut them in half and squeeze; strain out the seeds.',
    'Stir the syrup, lemon juice and cold water together in a pitcher. Taste and add more water if it’s too tart or sweet. Chill and serve over ice with lemon slices.',
  ],
  safety=[],
  make_ahead='Keeps 5 days in the refrigerator. Make the syrup up to 2 weeks ahead.',
  freezer=(True, 'Freeze in ice-cube trays to cool drinks without watering them down.'),
  leftovers=None,
  kids='Kids love squeezing the lemons and stirring the pitcher.',
  swaps={'pink': 'Blend 1 cup strawberries or raspberries with a little of the water, strain, and stir it in.', 'less_sweet': 'Start with ⅔ cup sugar.'},
  prep_day=dict(ahead='Make the lemonade.', station='stove', oven_f=None, active=15, keeps_days=5),
  pairs=['watermelon-agua-fresca', 'flag-sheet-cake'])

R(id='flag-sheet-cake', name='Flag Sheet Cake with Berries', emoji='🇺🇸', servings=20, serving_size='1 piece (1/20 of a 9x13 cake)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=40, cook=30, inactive=90,
  equipment=['9x13-inch baking pan', 'mixing bowls', 'electric mixer', 'cooling rack', 'offset spatula or butter knife'],
  summary='A tender vanilla sheet cake spread with a light cream cheese whipped frosting, with blueberries in the corner and rows of raspberries or strawberries for stripes.',
  ingredients='''
Cake:
2 1/2 cup flour
2 1/2 tsp baking-powder
1/2 tsp salt
3/4 cup unsalted-butter | softened
1 1/2 cup sugar
3 each eggs | room temperature
2 tsp vanilla
1 1/4 cup milk-2
Frosting:
8 oz cream-cheese | softened
3/4 cup powdered-sugar
1 tsp vanilla
1 1/2 cup heavy-cream | cold
Berries:
1 cup blueberries
12 oz raspberries | or sliced strawberries
''',
  steps=[
    'Heat the oven to 350°F. Butter and flour the pan.',
    'Whisk the flour, baking powder and salt. In a large bowl, beat the butter and sugar until light and fluffy, about 3 minutes. Beat in the eggs one at a time, then the vanilla.',
    'Mix in the flour in three parts, alternating with the milk, just until smooth. Spread in the pan.',
    'Bake 28 to 32 minutes, until golden and a toothpick in the center comes out clean. Cool completely in the pan, at least an hour.',
    'Beat the cream cheese, powdered sugar and vanilla until smooth. In another bowl whip the cream to stiff peaks, then fold it into the cream cheese. Spread over the cooled cake.',
    'Make the flag: a rectangle of blueberries in the top left corner, and rows of raspberries or strawberries across for stripes, leaving white frosting between them.',
    'Refrigerate until serving; the frosting is made with cream and cream cheese, so put leftovers back in the refrigerator within 2 hours (1 hour above 90°F).',
  ],
  safety=[],
  make_ahead='Bake the cake a day ahead and keep it covered. Frost and decorate up to 6 hours before the party; keep it in the refrigerator.',
  freezer=(True, 'Freeze the unfrosted cake, wrapped well, up to 2 months.'),
  leftovers=('Refrigerate, covered; best within 3 days.', None),
  kids='Kids can place the berries, which is the best part. They can also measure and help the mixer along.',
  swaps={'cupcakes': 'Bake 24 cupcakes, 18 to 20 minutes, and top each with a swirl of frosting and a few berries.', 'quicker': 'Frost with plain whipped cream from scratch; serve the same day.'},
  prep_day=dict(ahead='Bake the cake.', station='oven', oven_f=350, active=40, keeps_days=3),
  pairs=['fresh-lemonade', 'grilled-hot-dogs'])

R(id='strawberry-shortcakes', name='Strawberry Shortcakes', emoji='🍓', servings=8, serving_size='1 shortcake with berries and cream',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['kid-friendly'], prep=30, cook=15, inactive=30,
  equipment=['baking sheet', 'parchment paper', 'mixing bowls', 'pastry cutter or fork', '2½-inch round cutter or a glass', 'whisk or mixer'],
  summary='Tender, lightly sweet biscuits split and piled with juicy sugared strawberries and softly whipped cream. A summer dessert that tastes best the day you make it.',
  ingredients='''
Berries:
2 lb strawberries | hulled and sliced
1/4 cup sugar
Shortcakes:
2 cup flour
3 tbsp sugar
1 tbsp baking-powder
1/2 tsp salt
6 tbsp unsalted-butter | cold, in small cubes
3/4 cup heavy-cream | plus 1 tbsp for brushing
1 each eggs
Cream:
1 cup heavy-cream | cold
2 tbsp powdered-sugar
1/2 tsp vanilla
''',
  steps=[
    'Toss the strawberries with the sugar and let them sit 30 minutes, stirring once, to make their own syrup.',
    'Heat the oven to 425°F and line a baking sheet. Whisk the flour, sugar, baking powder and salt. Cut in the butter with a pastry cutter or your fingertips until it looks like coarse crumbs with some pea-size bits.',
    'Whisk the ¾ cup cream with the egg and stir it in with a fork just until the dough comes together. Pat it out ¾ inch thick on a floured counter and cut 8 rounds, pressing scraps together once.',
    'Set them on the sheet, brush the tops with cream and sprinkle with a little sugar. Bake 13 to 16 minutes, until golden. Cool 10 minutes.',
    'Whip the cream with the powdered sugar and vanilla to soft peaks.',
    'Split each shortcake, spoon berries and their syrup over the bottom, add cream, and set the top on.',
  ],
  safety=[],
  make_ahead='Bake the shortcakes in the morning; slice the berries and whip the cream up to 2 hours ahead and refrigerate.',
  freezer=(True, 'Freeze baked shortcakes up to 1 month; warm at 350°F for 5 minutes.'),
  leftovers=('Store shortcakes airtight and berries and cream in the refrigerator, separately, up to 2 days.', None),
  kids='Kids can hull strawberries with a straw or small spoon, cut out the rounds and build their own.',
  swaps={'other_berries': 'Use a mix of strawberries, blueberries and raspberries for red, white and blue with the cream.', 'buttermilk': 'Use our from-scratch biscuits instead, with 2 tablespoons sugar added.'},
  prep_day=dict(ahead='Bake the shortcakes; slice the berries.', station='oven', oven_f=425, active=30, keeps_days=2),
  pairs=['fresh-lemonade', 'grilled-lemon-herb-chicken'])

R(id='red-white-blue-parfaits', name='Red, White and Blue Yogurt Parfaits', emoji='🫐', servings=6, serving_size='1 parfait (about 1 cup)',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['no-cook'], tags=['kid-friendly', 'quick'], prep=15, cook=0,
  equipment=['6 clear cups or small jars', 'spoons'],
  summary='Layers of vanilla yogurt, strawberries, blueberries and crunchy granola in clear cups. No oven, and kids can make them.',
  ingredients='''
3 cup vanilla-yogurt | or plain Greek yogurt with honey
2 cup strawberries | diced
1 1/2 cup blueberries
1 cup granola
?2 tbsp honey | to drizzle
''',
  steps=[
    'Spoon a layer of yogurt into each cup, then strawberries, then more yogurt, then blueberries.',
    'Top with granola right before serving so it stays crunchy, and drizzle with honey if you like.',
    'Keep the parfaits in the refrigerator or a cooler on ice until serving.',
  ],
  safety=[],
  make_ahead='Layer the yogurt and fruit up to 4 hours ahead and refrigerate; add granola at the last minute.',
  freezer=(False, 'Granola goes soft; freeze the yogurt and berries as pops instead.'),
  leftovers=None,
  kids='A whole recipe kids can make on their own, with clean hands and a spoon.',
  swaps={'nut_free': 'Check the granola label; many contain nuts. Use crushed graham crackers or toasted oats instead.', 'dairy_free': 'Use a coconut or soy yogurt.'},
  prep_day=dict(ahead='Wash and dice the berries.', station='none', oven_f=None, active=15, keeps_days=1),
  pairs=['flag-sheet-cake', 'fruit-kabobs-yogurt-dip'])


# =====================================================================  THE PAGE PLAN
COURSES = [
    {'id': 'grill', 'title': 'Off the grill', 'icon': '🔥',
     'intro': 'Burgers and hot dogs are the backbone. Add chicken, ribs or something for vegetarians, and grill in an order that keeps the fire busy: long cooks first, burgers and hot dogs last.',
     'items': ['r:classic-burgers', 'r:grilled-hot-dogs', 'r:grilled-bbq-chicken', 'r:grilled-lemon-herb-chicken', 'r:grilled-baby-back-ribs', 'r:turkey-burgers',
               'r:black-bean-burgers', 'r:greek-lamb-burgers', 'r:steak-chimichurri', 'r:grilled-vegetable-skewers']},
    {'id': 'slow', 'title': 'Low and slow, or no grill needed', 'icon': '🍖',
     'intro': 'Make-ahead mains that free up the grill: pulled pork from the oven or slow cooker, oven ribs, and a big pot of shrimp boil to dump on the table.',
     'items': ['r:bbq-pulled-pork', 'r:oven-baby-back-ribs', 'r:lowcountry-shrimp-boil']},
    {'id': 'salads', 'title': 'Potato salad, slaw and cold salads', 'icon': '🥗',
     'intro': 'Make these the day before; they taste better for it. Keep them cold, at 40°F or below, until they go out.',
     'items': ['r:classic-mustard-potato-salad', 'r:dill-potato-salad', 'r:macaroni-salad', 'r:pasta-salad', 'r:coleslaw', 'r:vinegar-coleslaw',
               'r:three-bean-salad', 'r:green-salad', 'r:watermelon-feta-salad', 'r:summer-melon-salad']},
    {'id': 'sides', 'title': 'Corn, beans and the rest of the table', 'icon': '🌽',
     'intro': 'Corn on the cob, a pan of baked beans, deviled eggs, dips and a sauce for everything.',
     'items': ['r:corn-on-the-cob', 'r:grilled-street-corn', 'r:homemade-baked-beans', 'r:charro-beans', 'r:deviled-eggs', 'r:guacamole', 'r:mango-salsa', 'r:homemade-bbq-sauce']},
    {'id': 'drinks', 'title': 'Watermelon and cold drinks', 'icon': '🍉',
     'intro': 'Watermelon is the easiest dessert there is: chill it, cut it into wedges or sticks, and keep it on ice. Wash the rind before cutting so the knife doesn’t carry dirt into the fruit.',
     'items': ['r:fresh-lemonade', 'r:watermelon-agua-fresca', 'r:watermelon-lime-pops', 'r:fruit-kabobs-yogurt-dip']},
    {'id': 'desserts', 'title': 'Flag cake and berry desserts', 'icon': '🇺🇸',
     'intro': 'Red and blue berries make the Fourth’s colors without food coloring. Bake the cake a day ahead; cobblers and grilled fruit can share the grill after dinner.',
     'items': ['r:flag-sheet-cake', 'r:strawberry-shortcakes', 'r:red-white-blue-parfaits', 'r:mixed-berry-cobbler', 'r:peach-cobbler', 'r:grilled-stone-fruit',
               'r:watermelon-fruit-pizza', 'r:berry-yogurt-pops', 'r:smores-from-scratch']},
]
SCRATCH = ['soft-buns-rolls', 'refrigerator-pickles', 'mayonnaise', 'ranch-dressing', 'salsa', 'biscuits', 'whipped-cream', 'simple-syrup']
DEFAULT_MENU = ['classic-burgers', 'grilled-hot-dogs', 'grilled-bbq-chicken', 'classic-mustard-potato-salad', 'coleslaw', 'homemade-baked-beans', 'corn-on-the-cob',
                'fresh-lemonade', 'flag-sheet-cake']
# what each dish needs on the day, for the countdown (minutes)
DAY = {
    'classic-burgers': {'grill': 12, 'last': True}, 'grilled-hot-dogs': {'grill': 10, 'last': True}, 'grilled-bbq-chicken': {'grill': 45, 'ahead_part': 'rub the chicken'},
    'grilled-lemon-herb-chicken': {'grill': 15, 'ahead_part': 'marinate the chicken (1 to 4 hours, in the refrigerator)'}, 'grilled-baby-back-ribs': {'grill': 210, 'ahead_part': 'rub the ribs'},
    'turkey-burgers': {'grill': 14, 'last': True}, 'black-bean-burgers': {'grill': 12, 'last': True, 'ahead_part': 'shape the patties'}, 'greek-lamb-burgers': {'grill': 12, 'last': True},
    'steak-chimichurri': {'grill': 15}, 'grilled-vegetable-skewers': {'grill': 12, 'ahead_part': 'cut the vegetables'},
    'bbq-pulled-pork': {'ahead': 2, 'stove': 20}, 'oven-baby-back-ribs': {'oven': [275, 165]}, 'lowcountry-shrimp-boil': {'stove': 40},
    'classic-mustard-potato-salad': {'ahead': 2}, 'dill-potato-salad': {'ahead': 2}, 'macaroni-salad': {'ahead': 2}, 'pasta-salad': {'ahead': 1}, 'coleslaw': {'ahead': 1},
    'vinegar-coleslaw': {'ahead': 2}, 'three-bean-salad': {'ahead': 2}, 'green-salad': {'chill': 15}, 'watermelon-feta-salad': {'chill': 15}, 'summer-melon-salad': {'chill': 15},
    'corn-on-the-cob': {'stove': 15}, 'grilled-street-corn': {'grill': 12}, 'homemade-baked-beans': {'oven': [325, 75]},
    'charro-beans': {'stove': 30}, 'deviled-eggs': {'ahead': 1}, 'guacamole': {'chill': 15}, 'mango-salsa': {'chill': 20}, 'homemade-bbq-sauce': {'ahead': 7},
    'fresh-lemonade': {'ahead': 3}, 'watermelon-agua-fresca': {'ahead': 1}, 'watermelon-lime-pops': {'ahead': 2}, 'fruit-kabobs-yogurt-dip': {'chill': 25},
    'flag-sheet-cake': {'ahead': 1, 'ahead_part': 'bake the cake; frost and decorate it on the morning of the party and keep it in the refrigerator'}, 'strawberry-shortcakes': {'oven': [425, 15]}, 'red-white-blue-parfaits': {'chill': 15},
    'mixed-berry-cobbler': {'oven': [375, 45]}, 'peach-cobbler': {'oven': [375, 45]}, 'grilled-stone-fruit': {'grill': 8}, 'watermelon-fruit-pizza': {'chill': 20},
    'berry-yogurt-pops': {'ahead': 2}, 'smores-from-scratch': {'grill': 10},
}
HOWMUCH = [
    {'what': 'Burgers and hot dogs, together', 'per': 1.5, 'unit': 'pieces', 'note': 'Teens may eat 2 or 3; small children often half.'},
    {'what': 'Buns', 'per': 1.5, 'unit': 'buns', 'note': 'Match the meat count, plus a few spares.'},
    {'what': 'Chicken pieces or ribs (if also serving burgers)', 'per': 1, 'unit': 'pieces', 'note': 'Or about ⅓ rack of ribs per rib lover.'},
    {'what': 'Cold salads, all kinds together', 'per': 1, 'unit': 'cups', 'note': 'Three salads at about ⅓ cup each.'},
    {'what': 'Corn', 'per': 1, 'unit': 'ears', 'note': 'Halve the ears for kids and big crowds.'},
    {'what': 'Watermelon (whole, as bought)', 'per': 0.75, 'unit': 'lb', 'note': 'A 15-lb melon gives about 30 wedges.'},
    {'what': 'Ice for drinks and coolers', 'per': 2, 'unit': 'lb', 'note': 'More on a hot day; keep food coolers separate from drink coolers.'},
]
GOALS_EXCLUDE = ['grilled-hot-dogs', 'homemade-bbq-sauce', 'fresh-lemonade', 'flag-sheet-cake', 'strawberry-shortcakes', 'red-white-blue-parfaits', 'homemade-baked-beans', 'macaroni-salad',
                 'classic-mustard-potato-salad']

SOURCES = [
    ('fsis-grill', 'Grilling Food Safely', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/grilling-food-safely'),
    ('fsis-temps', 'Safe Temperature Chart', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'),
    ('fsis-tailgate', 'Tailgating Food Safety (archived fact sheet)', 'USDA FSIS', 'https://webarchive.library.unt.edu/web/20121002134501/http:/www.fsis.usda.gov/Fact_Sheets/Tailgating_Food_Safety/index.asp'),
    ('usfa-outdoor', 'Outdoor Fire Safety (grills)', 'U.S. Fire Administration', 'https://www.usfa.fema.gov/prevention/outdoor-fires/'),
    ('cdc-co', 'Carbon Monoxide (CO) Poisoning Prevention', 'CDC', 'https://www.cdc.gov/nceh/features/copoisoning'),
]
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for a, b, c, d, w in [
    ('fsis-grill', 'Grilling Food Safely', 'USDA FSIS', SOURCES[0][3], 'grilling, holding hot food, the 2-hour and 1-hour rule'),
    ('fsis-temps', 'Safe Temperature Chart', 'USDA FSIS', SOURCES[1][3], 'safe internal temperatures'),
    ('fsis-tailgate', 'Tailgating Food Safety', 'USDA FSIS, archived', SOURCES[2][3], 'marinating in the refrigerator; coolers at 40°F'),
]}
CREDITS = {
    'grilled-hot-dogs': [U['fsis-grill'], G('Hot_dog', 'background')],
    'grilled-bbq-chicken': [U['fsis-grill'], U['fsis-temps'], G('Barbecue_sauce', 'background')],
    'grilled-lemon-herb-chicken': [U['fsis-grill'], U['fsis-tailgate']],
    'grilled-baby-back-ribs': [U['fsis-grill'], U['fsis-temps'], G('Barbecue_in_the_United_States', 'regional barbecue styles')],
    'grilled-vegetable-skewers': [G('Grilling', 'background')],
    'classic-mustard-potato-salad': [U['fsis-grill'], G('Potato_salad', 'background')],
    'macaroni-salad': [U['fsis-grill']],
    'homemade-baked-beans': [G('Baked_beans', 'background')],
    'vinegar-coleslaw': [G('Coleslaw', 'background')],
    'grilled-street-corn': [G('Corn_on_the_cob', 'background, including elote')],
    'homemade-bbq-sauce': [G('Barbecue_sauce', 'background')],
    'fresh-lemonade': [G('Lemonade', 'background')],
    'flag-sheet-cake': [U['fsis-grill']],
    'strawberry-shortcakes': [G('Shortcake', 'background')],
}

META = {'anchor': 'your-menu', 'title': 'Fourth of July and summer cookouts', 'url': 'meal-prep/cookout/', 'icon': '🎆', 'blurb': 'Fourth of July and summer cookout collection',
        'keywords': ['Fourth of July', 'cookout', 'barbecue', 'grilling', 'picnic', 'summer', 'burgers', 'hot dogs', 'potato salad', 'flag cake']}
EVENT = {'label': 'Food on the table', 'time': '17:00', 'hours': 3, 'hot': True, 'date': 'july4'}


def main():
    out = build(RECIPES, CREDITS, SLUG)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'day': DAY, 'howmuch': HOWMUCH,
            'full_courses': ['grill', 'slow'], 'goals_exclude': GOALS_EXCLUDE, 'event': EVENT,
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, 'Fourth of July and summer cookouts (/meal-prep/cookout/): new recipes plus the page plan, which reuses recipes from the other files by id. '
                           'Edit scripts/meals/src/build_cookout.py and run it; allergens, diet and guides are derived from the catalog.')


if __name__ == '__main__':
    main()
