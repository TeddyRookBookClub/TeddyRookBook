#!/usr/bin/env python3
"""Builds data/meals/recipes/lunchboxes.json: the Back-to-school lunchboxes collection at /meal-prep/lunchboxes/.

Run:  python3 scripts/meals/src/build_lunchboxes.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds the NEW recipes written for the collection (collection='lunchboxes') and the page plan: courses that mix
them with lunchbox recipes already in Meal Prep (by id), and the pool the 4-week rotation planner draws from
(role: main or side; pack: cold, hot or shelf).

Food safety comes only from USDA FSIS, "Keeping 'Bag' Lunches Safe" (insulated bag, at least two cold sources on top
and under the food, perishables cold; hot food in a container preheated with boiling water, kept closed to stay at
140 °F; throw away leftovers and used bags after lunch) and CDC's choking-hazards page (cut grapes and cherry tomatoes
for young children).
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coll_util import G, build, write  # noqa: E402

SLUG = 'lunchboxes'
COLD = ('Pack it cold: in an insulated lunch bag with at least two cold sources, such as two frozen gel packs, or one gel pack '
        'and a frozen juice box or water bottle, one on top of the food and one under it (USDA).')
TOSS = 'Whatever comes home uneaten from a lunch box gets thrown away, along with used bags and wrappers (USDA).'
GRAPES = 'For toddlers and preschoolers, cut grapes and cherry tomatoes into small pieces; whole, they are a choking hazard for young children (CDC).'

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


R(id='sunbutter-banana-roll-ups', name='Sunflower Butter Banana Roll-Ups', emoji='🍌', servings=4, serving_size='1 roll-up (cut in 4 pieces)',
  meal=['lunch', 'snack'], protein='vegetarian', method=['no-cook'], tags=['lunchbox', 'kid-friendly', 'budget'], prep=10, cook=0,
  equipment=['butter knife', 'cutting board', 'sharp knife'],
  summary='A tortilla spread with sunflower seed butter, rolled around a whole banana and sliced into pinwheels. Peanut-free and tree-nut-free, so it suits nut-free schools.',
  ingredients='''
4 each flour-tortillas | 8-inch
1/2 cup sunflower-butter | or peanut butter where nuts are allowed
2 each banana | ripe but firm
?4 tsp honey | for kids over 1 year
~1 pinch cinnamon
''',
  steps=[
    'Spread 2 tablespoons of sunflower seed butter over each tortilla, almost to the edge. Drizzle with a teaspoon of honey and a pinch of cinnamon if you like.',
    'Peel the bananas and cut each one in half crosswise. Lay a banana half near one edge of each tortilla.',
    'Roll the tortilla up tightly around the banana. The spread holds it closed.',
    'Slice each roll into 4 pinwheels with a sharp knife, or leave it whole and cut it in half. Pack the pieces snugly in a container so they don’t unroll.',
  ],
  safety=[],
  make_ahead='Best made the morning of; the banana darkens after a day. Spread the tortillas the night before and add the banana in the morning.',
  freezer=(False, 'Bananas turn soft and brown when frozen this way.'),
  leftovers=(TOSS, None),
  kids='Kids as young as 4 can spread and roll these themselves. Older kids can slice them with a grown-up watching.',
  swaps={'nut_free': 'Sunflower seed butter is free of peanuts and tree nuts. Check the label for “made in a facility” warnings if your school asks.',
         'apple': 'Use thin apple slices instead of banana.', 'gluten_free': 'Use gluten-free tortillas.'},
  prep_day=dict(ahead='Spread the tortillas the night before.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['fruit-salad', 'sunflower-oat-energy-bites'])

R(id='ranch-chicken-wraps', name='Ranch Chicken Lunch Wraps', emoji='🌯', servings=4, serving_size='1 wrap',
  meal=['lunch'], protein='chicken', method=['no-cook'], tags=['lunchbox', 'kid-friendly', 'leftovers'], prep=15, cook=0,
  equipment=['cutting board', 'knife', 'mixing bowl', 'plastic wrap or foil'],
  summary='Shredded chicken tossed with ranch, rolled up with crisp lettuce and cheddar. A good use for leftover roast or rotisserie chicken.',
  ingredients='''
4 each large-flour-tortillas | 10-inch
2 cup rotisserie-chicken | meat only, shredded (or leftover roast chicken)
1/4 cup ranch-dressing | homemade or bought
1/2 cup cheddar | shredded
4 leaf romaine | ribs trimmed
8 each cherry-tomatoes | quartered (optional)
''',
  steps=[
    'Use chicken that has been kept in the refrigerator and is no more than 3 to 4 days old (USDA). Toss the shredded chicken with the ranch.',
    'Lay a lettuce leaf down the middle of each tortilla. Top with a quarter of the chicken, the cheddar and the tomatoes.',
    'Fold in the sides, then roll up tightly from the bottom. Wrap each one in plastic wrap or foil, seam side down, and cut it in half on a slant.',
    COLD,
  ],
  safety=[],
  make_ahead='Make the chicken mixture up to 2 days ahead and keep it in the refrigerator. Roll the wraps the night before or that morning.',
  freezer=(False, 'Lettuce and ranch don’t freeze well.'),
  leftovers=(TOSS, None),
  kids='Kids can shred the chicken with two forks and roll their own wraps.',
  swaps={'dairy_free': 'Use a dairy-free dressing and skip the cheese.', 'veggie': 'Use a drained can of chickpeas, lightly mashed, instead of chicken.'},
  prep_day=dict(ahead='Shred the chicken and toss it with ranch.', station='none', oven_f=None, active=15, keeps_days=2),
  pairs=['fruit-salad', 'lunchbox-hard-cooked-eggs'])

R(id='lunchbox-pizza-pinwheels', name='Pizza Pinwheels', emoji='🍕', servings=6, serving_size='2 pinwheels (makes 12)',
  meal=['lunch', 'snack'], protein='pork', method=['oven'], tags=['lunchbox', 'kid-friendly', 'make-ahead'], prep=20, cook=22,
  equipment=['rimmed baking sheet', 'parchment paper', 'rolling pin', 'sharp knife'],
  summary='Pizza dough rolled up with sauce, mozzarella and pepperoni, sliced and baked. Good cold, which makes them a lunch box favorite.',
  ingredients='''
1 each frozen-pizza-dough | about 1 lb, thawed in the refrigerator (or homemade)
1/2 cup marinara | thick pizza sauce works best
1 1/2 cup mozzarella | shredded
24 slice pepperoni
1 tsp italian-seasoning
^1 tbsp flour | for rolling
1 tbsp olive-oil
''',
  steps=[
    'Heat the oven to 400°F. Line a baking sheet with parchment.',
    'On a lightly floured counter, roll the dough into a rectangle about 10 by 14 inches. If it springs back, let it rest 5 minutes and try again.',
    'Spread the sauce over the dough, leaving a 1-inch strip bare along one long edge. Sprinkle with the cheese and seasoning, and lay the pepperoni on top.',
    'Starting from the long edge with sauce, roll the dough up tightly. Pinch the bare edge to seal it.',
    'Cut the roll into 12 slices with a sharp knife and set them cut side up on the baking sheet. Brush the tops with oil.',
    'Bake 18 to 22 minutes, until golden and the cheese bubbles. Cool on the pan.',
    'Refrigerate within 2 hours. ' + COLD,
  ],
  safety=[],
  make_ahead='Bake on the weekend; they keep 3 to 4 days in the refrigerator.',
  freezer=(True, 'Freeze baked pinwheels in a bag up to 2 months. Move what you need to the refrigerator the night before.'),
  leftovers=('Refrigerate within 2 hours and eat within 3 to 4 days.', 'lunch'),
  kids='Kids can spread the sauce, sprinkle the cheese and lay out the pepperoni. A grown-up slices the roll.',
  swaps={'veggie': 'Use diced bell peppers and spinach instead of pepperoni.', 'from_scratch': 'Use half a batch of the from-scratch pizza dough.'},
  prep_day=dict(ahead='Bake on the weekend.', station='oven', oven_f=400, active=20, keeps_days=4),
  pairs=['fruit-salad'])

R(id='cracker-stacker-lunch-box', name='Cracker Stacker Lunch Box', emoji='🍱', servings=4, serving_size='1 lunch box',
  meal=['lunch'], protein='turkey', method=['no-cook'], tags=['lunchbox', 'kid-friendly'], prep=15, cook=0,
  equipment=['cutting board', 'knife', 'divided lunch containers'],
  summary='A homemade version of the store-bought cracker kits: crackers, cheese and turkey to stack, with cucumber and grapes on the side.',
  ingredients='''
24 each whole-grain-crackers
4 oz cheddar-block | cut into squares the size of the crackers
6 slice deli-turkey | each cut into quarters
1 each cucumber | sliced into rounds
2 cup grapes | cut for young children
''',
  steps=[
    'Slice the cheese into thin squares about the size of the crackers. Cut each turkey slice into 4 squares.',
    'Slice the cucumber into rounds. ' + GRAPES,
    'In each divided container, put 6 crackers in one section (to keep them crisp, away from the wet foods), the cheese and turkey in another, and the cucumber and grapes in the rest.',
    COLD,
  ],
  safety=[],
  make_ahead='Cut the cheese, turkey and cucumber up to 2 days ahead and keep them in the refrigerator in separate containers. Pack the crackers in the morning.',
  freezer=(False, 'Crackers and cucumber don’t freeze.'),
  leftovers=(TOSS, None),
  kids='This is a good first lunch for kids to pack themselves: count out the crackers and fill each section.',
  swaps={'gluten_free': 'Use rice crackers.', 'veggie': 'Use hummus and extra cheese instead of turkey.', 'dairy_free': 'Skip the cheese and add a dip such as hummus or white bean dip.'},
  prep_day=dict(ahead='Cut the cheese, turkey and vegetables.', station='none', oven_f=None, active=15, keeps_days=2),
  pairs=['homemade-hummus'])

R(id='sunflower-oat-energy-bites', name='Nut-Free Sunflower Oat Energy Bites', emoji='🟤', servings=12, serving_size='2 bites (makes 24)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['lunchbox', 'kid-friendly', 'make-ahead', 'budget'], prep=15, cook=0, inactive=30,
  equipment=['mixing bowl', 'spoon or spatula', 'tray or plate', 'airtight container'],
  summary='No-bake oat bites held together with sunflower seed butter and honey, with mini chocolate chips. Made for nut-free classrooms.',
  ingredients='''
1 cup rolled-oats
1/2 cup sunflower-butter
1/3 cup honey
1/3 cup chocolate-chips | mini chips
2 tbsp flaxseed | ground
1 tsp vanilla
~1 pinch salt
''',
  steps=[
    'Stir the sunflower butter, honey and vanilla together in a bowl until smooth.',
    'Add the oats, ground flaxseed, chocolate chips and salt. Stir until everything is coated. If it’s too sticky to roll, add a spoonful more oats.',
    'Chill the bowl 20 to 30 minutes so the mixture firms up.',
    'Roll into 24 balls about 1 inch across, with damp hands. Keep them in a covered container in the refrigerator.',
  ],
  safety=[],
  make_ahead='Keeps 1 week in the refrigerator.',
  freezer=(True, 'Freeze up to 3 months; they thaw in the lunch box by lunchtime.'),
  leftovers=None,
  kids='Kids can measure, stir and roll these. No stove or oven needed.',
  swaps={'nut_free': 'Sunflower seed butter keeps these free of peanuts and tree nuts. Check the chocolate chip label too.',
         'dairy_free': 'Use dairy-free chocolate chips, or raisins.', 'honey': 'Use maple syrup; for children under 1 year, don’t use honey.'},
  prep_day=dict(ahead='Make a batch for the week.', station='none', oven_f=None, active=15, keeps_days=7),
  pairs=['sunbutter-banana-roll-ups'])

R(id='corn-dog-muffins', name='Mini Corn Dog Muffins', emoji='🌭', servings=8, serving_size='3 mini muffins (makes 24)',
  meal=['lunch', 'snack'], protein='pork', method=['oven'], tags=['lunchbox', 'kid-friendly', 'make-ahead'], prep=15, cook=15,
  equipment=['24-cup mini muffin pan', 'mixing bowls', 'whisk', 'food thermometer'],
  summary='Sweet cornbread batter baked around rounds of hot dog in a mini muffin pan. All the fun of a corn dog, no frying.',
  ingredients='''
1 cup cornmeal
1 cup flour
1/4 cup sugar
1 tbsp baking-powder
1/2 tsp salt
1 cup whole-milk
1 each eggs
1/4 cup vegetable-oil | plus a little for the pan
4 each hot-dogs | cut into 24 rounds
''',
  steps=[
    'Heat the oven to 375°F. Grease the mini muffin cups well.',
    'Whisk the cornmeal, flour, sugar, baking powder and salt in a bowl. In another bowl, whisk the milk, egg and oil. Stir the wet into the dry just until no flour shows.',
    'Spoon a tablespoon of batter into each cup and press a round of hot dog into the center of each.',
    'Bake 13 to 15 minutes, until golden and a toothpick in the cornbread comes out clean. The hot dog in the center should reach 165°F (USDA).',
    'Cool 5 minutes, then loosen with a butter knife. Refrigerate within 2 hours. ' + COLD,
  ],
  safety=[('hot dogs', 165, 0)],
  make_ahead='Bake on the weekend; they keep 3 to 4 days in the refrigerator.',
  freezer=(True, 'Freeze up to 2 months. Thaw overnight in the refrigerator.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can stir the batter and press a hot dog round into each cup. For young children, cut the muffins in quarters: hot dog pieces are a choking hazard (CDC).',
  swaps={'veggie': 'Use plant-based hot dogs, or corn kernels and cheddar instead.', 'dairy_free': 'Use any unsweetened plant milk.'},
  prep_day=dict(ahead='Bake on the weekend.', station='oven', oven_f=375, active=15, keeps_days=4),
  pairs=['fruit-salad'])

R(id='black-bean-corn-quesadillas', name='Black Bean and Corn Quesadilla Triangles', emoji='🫓', servings=4, serving_size='1 quesadilla (4 triangles)',
  meal=['lunch', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['lunchbox', 'kid-friendly', 'budget', 'quick'], prep=10, cook=16,
  equipment=['large skillet', 'spatula', 'can opener', 'fork'],
  summary='Crisp tortillas folded around cheese, black beans and corn. Good warm for dinner and good cold in a lunch box the next day.',
  ingredients='''
8 each flour-tortillas | 8-inch
1 can black-beans | drained and rinsed
1/2 can canned-corn | drained
1 1/2 cup mexican-cheese | shredded
1/2 tsp cumin
1 tsp vegetable-oil
?1/2 cup salsa | for dipping
''',
  steps=[
    'Mash about half the beans with a fork, then stir in the rest of the beans, the corn and cumin.',
    'Spread a quarter of the beans over 4 tortillas. Sprinkle with cheese and top with the other tortillas.',
    'Heat a skillet over medium heat and brush it with a little oil. Cook one quesadilla at a time, 2 minutes per side, until golden and the cheese melts.',
    'Cut each into 4 triangles. For lunches, cool them on a rack, refrigerate within 2 hours, and pack with a little salsa. ' + COLD,
  ],
  safety=[],
  make_ahead='Make them the night before and refrigerate.',
  freezer=(True, 'Freeze cooked, cooled triangles up to 2 months, with parchment between them.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can mash the beans and build the quesadillas. A grown-up handles the hot skillet.',
  swaps={'gluten_free': 'Use corn tortillas.', 'dairy_free': 'Use a dairy-free cheese, or mash in avocado instead.'},
  prep_day=dict(ahead='Cook the night before.', station='stove', oven_f=None, active=15, keeps_days=3),
  pairs=['fruit-salad'])

R(id='lunchbox-hard-cooked-eggs', name='Hard-Cooked Eggs for the Week', emoji='🥚', servings=6, serving_size='1 egg',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['stovetop'], tags=['lunchbox', 'budget', 'make-ahead', 'quick'], prep=2, cook=24,
  equipment=['saucepan with a lid', 'slotted spoon', 'bowl of ice water'],
  summary='Six eggs cooked until the whites and yolks are firm, cooled fast and kept in the refrigerator for the week’s lunches.',
  ingredients='''
6 each eggs | large
^4 cup water | enough to cover by 1 inch
~1 pinch salt | for serving
''',
  steps=[
    'Set the eggs in a single layer in a saucepan and add cold water to cover them by 1 inch.',
    'Bring to a full boil over high heat. Cover the pan, take it off the heat, and let the eggs stand 12 minutes for large eggs (15 for extra-large).',
    'Lift the eggs into a bowl of ice water and leave them 5 minutes, until cool enough to hold.',
    'Refrigerate them within 2 hours. Use hard-cooked eggs within 1 week, in or out of the shell (USDA). Peel them under running water when you need them.',
    COLD,
  ],
  safety=[],
  make_ahead='Cook a batch on Sunday for the week.',
  freezer=(False, 'Cooked egg whites turn rubbery in the freezer.'),
  leftovers=None,
  kids='Kids can peel cooled eggs. Tap the egg all over, then peel it under running water.',
  swaps={'deviled': 'Halve and fill them with the yolks mashed with mayonnaise and mustard; keep these cold too.'},
  prep_day=dict(ahead='Cook on Sunday.', station='stove', oven_f=None, active=5, keeps_days=7),
  pairs=['cracker-stacker-lunch-box'])

R(id='strawberry-yogurt-bark', name='Strawberry Yogurt Bark', emoji='🍓', servings=8, serving_size='2 pieces',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['lunchbox', 'kid-friendly', 'make-ahead'], prep=10, cook=0, inactive=180,
  equipment=['rimmed baking sheet', 'parchment paper', 'spatula', 'freezer bag'],
  summary='Greek yogurt sweetened with a little honey, spread on a pan with strawberries, frozen and broken into pieces.',
  ingredients='''
2 cup greek-yogurt | plain
3 tbsp honey
1/2 tsp vanilla
1 cup strawberries | diced
?2 tbsp chocolate-chips | mini
''',
  steps=[
    'Line a baking sheet with parchment. Stir the yogurt, honey and vanilla together.',
    'Spread the yogurt on the parchment about ¼ inch thick. Scatter the strawberries and chocolate chips over it and press them in lightly.',
    'Freeze at least 3 hours, until firm, then break it into about 16 pieces. Keep them in a freezer bag.',
    'Pack a few pieces in a small container, frozen, next to the other cold foods. They soften by lunchtime; this is a cold food, not an ice pack, so still use two cold sources (USDA).',
  ],
  safety=[],
  make_ahead='Keeps 1 month in the freezer.',
  freezer=(True, 'Keep it frozen up to 1 month.'),
  leftovers=None,
  kids='Kids can spread the yogurt and decorate it with fruit.',
  swaps={'berries': 'Use blueberries, raspberries or diced mango.', 'dairy_free': 'Use a thick dairy-free yogurt.'},
  prep_day=dict(ahead='Freeze a pan on the weekend.', station='none', oven_f=None, active=10, keeps_days=30),
  pairs=['sunbutter-banana-roll-ups'])

R(id='applesauce-oat-muffins', name='Applesauce Oat Muffins', emoji='🧁', servings=12, serving_size='1 muffin',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['oven'], tags=['lunchbox', 'kid-friendly', 'make-ahead', 'budget'], prep=15, cook=20,
  equipment=['12-cup muffin pan', 'paper liners', 'mixing bowls', 'whisk'],
  summary='Soft, lightly sweet muffins made with applesauce, oats and cinnamon. Nut-free, and sturdy enough to ride in a backpack.',
  ingredients='''
1 cup flour
1 cup rolled-oats
1/3 cup brown-sugar
1 1/2 tsp baking-powder
1/2 tsp baking-soda
1 tsp cinnamon
1/4 tsp salt
1 cup applesauce | unsweetened
1 each eggs
1/4 cup vegetable-oil
1/4 cup whole-milk
?1/2 cup raisins
''',
  steps=[
    'Heat the oven to 375°F and line a 12-cup muffin pan.',
    'Whisk the flour, oats, brown sugar, baking powder, baking soda, cinnamon and salt in a large bowl.',
    'In another bowl, whisk the applesauce, egg, oil and milk. Stir them into the dry ingredients just until combined, then fold in the raisins.',
    'Divide among the cups and bake 18 to 20 minutes, until a toothpick in the center comes out clean. Cool on a rack.',
  ],
  safety=[],
  make_ahead='Keeps 2 days on the counter in a covered container, or 5 days in the refrigerator.',
  freezer=(True, 'Freeze up to 3 months. A frozen muffin thaws in the lunch box by lunchtime.'),
  leftovers=None,
  kids='Kids can measure, stir and fill the liners. A grown-up handles the hot pan.',
  swaps={'dairy_free': 'Use any plant milk.', 'egg_free': 'Use 1 tablespoon ground flaxseed stirred into 3 tablespoons water, left 5 minutes.', 'from_scratch': 'Make the applesauce from scratch.'},
  prep_day=dict(ahead='Bake on the weekend.', station='oven', oven_f=375, active=15, keeps_days=5),
  pairs=['lunchbox-hard-cooked-eggs'])

R(id='cucumber-cream-cheese-sandwiches', name='Cucumber Cream Cheese Sandwiches', emoji='🥒', servings=4, serving_size='1 sandwich',
  meal=['lunch'], protein='vegetarian', method=['no-cook'], tags=['lunchbox', 'kid-friendly'], prep=10, cook=0,
  equipment=['cutting board', 'knife', 'small bowl', 'paper towels'],
  summary='Whole wheat bread with herby cream cheese and thin cucumber slices, cut into strips or triangles. Cool and crunchy.',
  ingredients='''
8 slice wheat-bread
4 oz cream-cheese | softened
1/2 tsp dill-dried | or 1 tablespoon fresh dill
1 each cucumber | thinly sliced
~1 pinch salt
''',
  steps=[
    'Stir the cream cheese with the dill.',
    'Slice the cucumber thin and lay the slices on paper towels for a few minutes to soak up extra water, so the bread doesn’t get soggy.',
    'Spread the cream cheese on all 8 slices of bread, edge to edge (it keeps the cucumber from wetting the bread). Layer cucumber on 4 slices, sprinkle with a little salt, and close the sandwiches.',
    'Cut into triangles or strips. ' + COLD,
  ],
  safety=[],
  make_ahead='Mix the dill cream cheese up to 5 days ahead. Assemble the sandwiches the morning you pack them.',
  freezer=(False, 'Cucumber turns watery when frozen.'),
  leftovers=(TOSS, None),
  kids='Kids can spread the cream cheese and layer the cucumbers.',
  swaps={'dairy_free': 'Use hummus instead of cream cheese.', 'gluten_free': 'Use gluten-free bread.'},
  prep_day=dict(ahead='Mix the dill cream cheese.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['applesauce-oat-muffins'])

R(id='chicken-meatball-bites', name='Mini Chicken Meatball Bites', emoji='🧆', servings=6, serving_size='5 mini meatballs (makes about 30)',
  meal=['lunch', 'dinner'], protein='chicken', method=['oven'], tags=['lunchbox', 'kid-friendly', 'make-ahead'], prep=20, cook=18,
  equipment=['rimmed baking sheet', 'parchment paper', 'mixing bowl', 'food thermometer', 'small scoop or spoon'],
  summary='Small, tender chicken meatballs with Parmesan and herbs. Pack them cold with a dip, or hot in a preheated insulated container.',
  ingredients='''
1 lb ground-chicken
1/2 cup breadcrumbs
1 each eggs
1/4 cup parmesan | grated
1/2 tsp garlic-powder
1 tsp italian-seasoning
1/2 tsp salt
1 tbsp olive-oil
?1/2 cup marinara | for dipping
''',
  steps=[
    'Heat the oven to 400°F and line a baking sheet with parchment. Brush it with the oil.',
    'Mix the chicken, breadcrumbs, egg, Parmesan, garlic powder, Italian seasoning and salt with your hands or a fork, just until combined. Wash your hands after handling raw chicken.',
    'Roll into about 30 balls, 1 inch across (wet hands help), and set them on the pan.',
    'Bake 15 to 18 minutes, until lightly browned and a food thermometer reads 165°F in the center of a meatball (USDA).',
    'Cool, then refrigerate within 2 hours. For a cold lunch, pack them with the marinara as a dip. ' + COLD,
    'For a hot lunch, reheat them in sauce to 165°F, fill an insulated food jar that you have warmed with boiling water for a few minutes, and keep it closed until lunch (USDA).',
  ],
  safety=[('ground chicken', 165, 0)],
  make_ahead='Bake on the weekend; they keep 3 to 4 days in the refrigerator.',
  freezer=(True, 'Freeze cooked meatballs on a tray, then bag them, up to 3 months.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat to 165°F.', 'dinner'),
  kids='Kids can roll the meatballs with clean hands and wash them well after.',
  swaps={'gluten_free': 'Use gluten-free breadcrumbs or quick oats.', 'turkey': 'Use ground turkey.'},
  prep_day=dict(ahead='Bake on the weekend.', station='oven', oven_f=400, active=20, keeps_days=4),
  pairs=['fruit-salad', 'pasta-salad'])

R(id='turkey-apple-cheddar-sandwiches', name='Turkey, Apple and Cheddar Sandwiches', emoji='🥪', servings=4, serving_size='1 sandwich',
  meal=['lunch'], protein='turkey', method=['no-cook'], tags=['lunchbox', 'quick'], prep=10, cook=0,
  equipment=['cutting board', 'knife', 'small bowl'],
  summary='Sliced turkey and sharp cheddar with thin, crisp apple slices on whole wheat. Sweet, salty and crunchy.',
  ingredients='''
8 slice wheat-bread
12 slice deli-turkey
4 slice cheddar
1 each apple | cored and thinly sliced
1 tsp lemon-juice
2 tbsp mayonnaise | or mustard
''',
  steps=[
    'Toss the apple slices with the lemon juice so they don’t turn brown.',
    'Spread mayonnaise or mustard on 4 slices of bread. Layer 3 slices of turkey, a slice of cheddar and a few apple slices on each, and close with the other bread.',
    'Cut in half and wrap. ' + COLD,
  ],
  safety=[],
  make_ahead='Assemble the night before and keep in the refrigerator; the lemon keeps the apple fresh.',
  freezer=(False, 'Apple and mayonnaise don’t freeze well.'),
  leftovers=(TOSS, None),
  kids='Kids can layer the sandwiches. A grown-up slices the apple.',
  swaps={'dairy_free': 'Skip the cheese and add lettuce.', 'gluten_free': 'Use gluten-free bread.'},
  prep_day=dict(ahead='Assemble the night before.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['sunflower-oat-energy-bites'])

R(id='thermos-ravioli', name='Hot Thermos Ravioli', emoji='🫙', servings=4, serving_size='about 1 cup',
  meal=['lunch'], protein='vegetarian', method=['stovetop'], tags=['lunchbox', 'kid-friendly', 'quick'], prep=5, cook=12,
  equipment=['saucepan', 'insulated food jar for each child', 'kettle or pot for boiling water', 'food thermometer'],
  summary='Cheese ravioli in tomato sauce, packed piping hot in a preheated insulated food jar so it’s still warm at lunch.',
  ingredients='''
20 oz refrigerated-ravioli | cheese
1 1/2 cup marinara
2 tbsp parmesan | grated
''',
  steps=[
    'Cook the ravioli the night before as the package directs, drain, toss with the sauce, and refrigerate it within 2 hours. (Or cook it fresh in the morning.)',
    'In the morning, fill each insulated food jar with boiling water, put the lid on, and let it stand a few minutes (USDA).',
    'Meanwhile, reheat the ravioli and sauce on the stove until it is steaming hot and reads 165°F on a food thermometer.',
    'Pour the water out of the jar, fill it with the hot ravioli, sprinkle with Parmesan and close the lid tightly. Keep it closed until lunch so the food stays at 140°F or above (USDA).',
  ],
  safety=[('leftovers, reheated', 165, 0), ('hot food held until lunch', 140, 0)],
  make_ahead='Cook the ravioli the night before; reheat it in the morning.',
  freezer=(False, 'Reheat cooked pasta from the refrigerator, not frozen, for a thermos lunch.'),
  leftovers=(TOSS, None),
  kids='Kids can help sprinkle the cheese and close the jar. A grown-up handles the boiling water.',
  swaps={'soup': 'The same thermos steps work for soup, chili or mac and cheese.', 'meat': 'Use meat-filled ravioli.'},
  prep_day=dict(ahead='Cook the ravioli the night before.', station='stove', oven_f=None, active=10, keeps_days=3),
  pairs=['fruit-salad'])

# =====================================================================  COLLECTION (the page's plan)
COURSES = [
    {'id': 'sandwiches', 'title': 'Sandwiches and wraps', 'icon': '🥪',
     'intro': 'The lunch box basics. Spread fillings to the edges of the bread so wet ingredients don’t soak in, and wrap them snugly.',
     'items': ['r:turkey-apple-cheddar-sandwiches', 'r:cucumber-cream-cheese-sandwiches', 'r:ranch-chicken-wraps', 'r:sunbutter-banana-roll-ups',
               'r:turkey-cheese-wraps', 'r:lunchbox-sandwiches', 'r:hummus-veggie-wraps', 'r:tuna-salad', 'r:smashed-chickpea-salad-sandwiches']},
    {'id': 'bento', 'title': 'Bento boxes and bites', 'icon': '🍱',
     'intro': 'Little bits of several things, each in its own section. Many kids eat more when they can pick and stack.',
     'items': ['r:cracker-stacker-lunch-box', 'r:lunchbox-pizza-pinwheels', 'r:corn-dog-muffins', 'r:chicken-meatball-bites', 'r:black-bean-corn-quesadillas',
               'r:spinach-ricotta-calzones', 'r:chicken-quesadillas', 'r:spring-vegetable-frittata', 'r:bean-cheese-burritos']},
    {'id': 'salads', 'title': 'Pasta salads and grain bowls', 'icon': '🥗',
     'intro': 'Made on Sunday, these get better by Tuesday. Cook and chill them in shallow containers first (USDA).',
     'items': ['r:pasta-salad', 'r:quinoa-black-bean-salad', 'r:mediterranean-quinoa-salad', 'r:mango-chicken-rice-bowls', 'r:greek-chicken-couscous-bowls', 'r:teriyaki-tofu-bowls']},
    {'id': 'hot', 'title': 'Hot lunches in a thermos', 'icon': '🫙',
     'intro': 'Preheat the insulated jar with boiling water, fill it with food heated to 165°F, and keep the lid on until lunch (USDA).',
     'items': ['r:thermos-ravioli', 'r:mac-and-cheese', 'r:beef-chili', 'r:chicken-noodle-soup']},
    {'id': 'snacks', 'title': 'Muffins, bites and snacks', 'icon': '🧁',
     'intro': 'Bake on the weekend and freeze; a frozen muffin thaws in the lunch box by lunchtime. Check nut labels if your school is nut-free.',
     'items': ['r:applesauce-oat-muffins', 'r:sunflower-oat-energy-bites', 'r:strawberry-yogurt-bark', 'r:lunchbox-hard-cooked-eggs',
               'r:banana-muffins', 'r:lemon-blueberry-muffins', 'r:pumpkin-bread', 'r:zucchini-bread', 'r:egg-muffin-cups', 'r:no-bake-oat-bites', 'r:berry-oat-crumble-bars']},
    {'id': 'sides', 'title': 'Fruit, vegetables and dips', 'icon': '🍎',
     'intro': 'Something fresh every day. Dips make vegetables more fun.',
     'items': ['r:fruit-salad', 'r:homemade-hummus', 'r:white-bean-herb-dip', 'r:cottage-cheese-dill-dip', 'r:three-bean-salad', 'r:sesame-garlic-edamame']},
]
SCRATCH = ['sandwich-bread', 'whole-wheat-sandwich-bread', 'flour-tortillas', 'pita', 'crackers', 'pizza-dough', 'applesauce', 'granola', 'yogurt', 'ranch-dressing']
DEFAULT_MENU = ['turkey-apple-cheddar-sandwiches', 'sunbutter-banana-roll-ups', 'cracker-stacker-lunch-box', 'lunchbox-pizza-pinwheels', 'ranch-chicken-wraps',
                'black-bean-corn-quesadillas', 'pasta-salad', 'thermos-ravioli', 'applesauce-oat-muffins', 'sunflower-oat-energy-bites',
                'lunchbox-hard-cooked-eggs', 'strawberry-yogurt-bark', 'fruit-salad', 'homemade-hummus']
# the rotation planner's pool: role (main = the lunch itself, side = one extra), pack (cold = with ice packs, hot = thermos, shelf = no cold source needed)
POOL = {
    'turkey-apple-cheddar-sandwiches': ['main', 'cold'], 'cucumber-cream-cheese-sandwiches': ['main', 'cold'], 'ranch-chicken-wraps': ['main', 'cold'],
    'sunbutter-banana-roll-ups': ['main', 'shelf'], 'turkey-cheese-wraps': ['main', 'cold'], 'lunchbox-sandwiches': ['main', 'shelf'],
    'hummus-veggie-wraps': ['main', 'cold'], 'tuna-salad': ['main', 'cold'], 'smashed-chickpea-salad-sandwiches': ['main', 'cold'],
    'cracker-stacker-lunch-box': ['main', 'cold'], 'lunchbox-pizza-pinwheels': ['main', 'cold'], 'corn-dog-muffins': ['main', 'cold'],
    'chicken-meatball-bites': ['main', 'cold'], 'black-bean-corn-quesadillas': ['main', 'cold'], 'spinach-ricotta-calzones': ['main', 'cold'],
    'chicken-quesadillas': ['main', 'cold'], 'spring-vegetable-frittata': ['main', 'cold'], 'bean-cheese-burritos': ['main', 'cold'],
    'pasta-salad': ['main', 'cold'], 'quinoa-black-bean-salad': ['main', 'cold'], 'mediterranean-quinoa-salad': ['main', 'cold'],
    'mango-chicken-rice-bowls': ['main', 'cold'], 'greek-chicken-couscous-bowls': ['main', 'cold'], 'teriyaki-tofu-bowls': ['main', 'cold'],
    'thermos-ravioli': ['main', 'hot'], 'mac-and-cheese': ['main', 'hot'], 'beef-chili': ['main', 'hot'], 'chicken-noodle-soup': ['main', 'hot'],
    'applesauce-oat-muffins': ['side', 'shelf'], 'sunflower-oat-energy-bites': ['side', 'cold'], 'strawberry-yogurt-bark': ['side', 'cold'],
    'lunchbox-hard-cooked-eggs': ['side', 'cold'], 'banana-muffins': ['side', 'shelf'], 'lemon-blueberry-muffins': ['side', 'shelf'],
    'pumpkin-bread': ['side', 'shelf'], 'zucchini-bread': ['side', 'shelf'], 'egg-muffin-cups': ['side', 'cold'], 'no-bake-oat-bites': ['side', 'cold'],
    'berry-oat-crumble-bars': ['side', 'shelf'], 'fruit-salad': ['side', 'cold'], 'homemade-hummus': ['side', 'cold'], 'white-bean-herb-dip': ['side', 'cold'],
    'cottage-cheese-dill-dip': ['side', 'cold'], 'three-bean-salad': ['side', 'cold'], 'sesame-garlic-edamame': ['side', 'cold'],
}
# plain fresh foods the rotation suggests each day (no recipe needed)
FRESH = ['Apple slices', 'Baby carrots', 'Clementine', 'Grapes (cut for little ones)', 'Cucumber rounds', 'Banana', 'Snap peas', 'Pear',
         'Bell pepper strips', 'Berries', 'Celery sticks', 'Melon cubes', 'Cherry tomatoes (cut for little ones)', 'Orange wedges', 'Broccoli florets']

SOURCES = [
    ('fsis-bag', 'Keeping “Bag” Lunches Safe', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/es/node/3380'),
    ('fsis-bag-archive', 'Keeping Bag Lunches Safe (archived fact sheet, full text)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20121010032255/http:/www.fsis.usda.gov/Fact_Sheets/Keeping_Bag_Lunches_Safe/index.asp'),
    ('cdc-choke', 'Choking Hazards', 'Centers for Disease Control and Prevention', 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html'),
    ('fda-allergens', 'Allergic to Sesame? Food Labels Now Must List Sesame as an Allergen (the nine major allergens)', 'U.S. Food and Drug Administration', 'https://www.fda.gov/consumers/consumer-updates/allergic-sesame-food-labels-now-must-list-sesame-allergen'),
]
U = {
    'bag': {'name': 'Keeping “Bag” Lunches Safe (USDA FSIS)', 'url': 'https://webarchive.library.unt.edu/web/20121010032255/http:/www.fsis.usda.gov/Fact_Sheets/Keeping_Bag_Lunches_Safe/index.asp', 'what': 'cold sources, hot foods in an insulated container, leftovers'},
    'choke': {'name': 'Choking Hazards (CDC)', 'url': 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html', 'what': 'cutting grapes, tomatoes and hot dogs for young children'},
}
LB = G('Lunchbox', 'background on lunch boxes')
CREDITS = {
    'sunbutter-banana-roll-ups': [LB], 'ranch-chicken-wraps': [U['bag'], G('Wrap_(food)', 'background')],
    'lunchbox-pizza-pinwheels': [U['bag'], G('Pizza', 'background')], 'cracker-stacker-lunch-box': [U['bag'], U['choke'], G('Bento', 'the boxed-lunch idea')],
    'sunflower-oat-energy-bites': [LB], 'corn-dog-muffins': [U['bag'], U['choke'], G('Corn_dog', 'background')],
    'black-bean-corn-quesadillas': [U['bag'], G('Quesadilla', 'background')], 'lunchbox-hard-cooked-eggs': [U['bag'], G('Boiled_egg', 'background')],
    'strawberry-yogurt-bark': [U['bag']], 'applesauce-oat-muffins': [G('Muffin', 'background')],
    'cucumber-cream-cheese-sandwiches': [U['bag']], 'chicken-meatball-bites': [U['bag']], 'turkey-apple-cheddar-sandwiches': [U['bag']],
    'thermos-ravioli': [U['bag']],
}
META = {'anchor': 'your-menu', 'title': 'Back-to-school lunchboxes', 'url': 'meal-prep/lunchboxes/', 'icon': '🍱', 'blurb': 'back-to-school lunchboxes',
        'keywords': ['school lunch', 'lunch box', 'lunchbox ideas', 'packed lunch', 'bento', 'nut-free', 'back to school', 'lunch rotation']}


def main():
    out = build(RECIPES, CREDITS, SLUG)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'pool': POOL, 'fresh': FRESH,
            'goals_exclude': ['strawberry-yogurt-bark', 'sunflower-oat-energy-bites'],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, extra_ids=list(POOL))


if __name__ == '__main__':
    main()
