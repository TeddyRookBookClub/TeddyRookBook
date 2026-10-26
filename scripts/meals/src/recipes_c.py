# Meal Prep recipes, part C: breakfasts, lunches, sides and snacks. Same format as recipes_a.py.
from recipes_a import R, T_GROUND, T_GROUND_PORK, T_POULTRY, T_EGGS, T_LEFTOVERS

# ---------------- Breakfast ----------------
R(id='pancakes', name='Fluffy Buttermilk Pancakes', emoji='🥞', servings=4, serving_size='3 pancakes (about 4 inches)',
  meal=['breakfast'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly', 'freezer-friendly', 'budget'],
  prep=10, cook=20, equipment=['large bowl', 'griddle or large skillet', 'spatula', '1/4-cup measure'],
  summary='Tall, tender pancakes from scratch. Make extra and freeze them for school mornings.',
  ingredients='''
Batter:
2 cup flour
2 tbsp sugar
2 tsp baking-powder
1/2 tsp baking-soda
1/2 tsp salt
2 cup buttermilk
2 each eggs
3 tbsp butter | melted, plus more for the pan
1 tsp vanilla
To serve:
?1/2 cup maple-syrup
?1 cup blueberries
''',
  steps=[
    'Whisk the flour, sugar, baking powder, baking soda and salt in a large bowl.',
    'In another bowl whisk the buttermilk, eggs, melted butter and vanilla. Pour into the dry ingredients and stir just until no dry flour shows; small lumps are fine.',
    'Heat a griddle or skillet over medium heat and brush with butter. Pour 1/4 cup batter per pancake. Cook until bubbles form on top and the edges look dry, 2 to 3 minutes. Flip and cook 1 to 2 minutes more, until golden.',
    'Keep cooked pancakes warm on a baking sheet in a 200°F oven while you finish the rest.',
  ],
  safety=[],
  make_ahead='Mix the dry ingredients in a jar the night before.',
  freezer=(True, 'Cool, freeze in one layer on a tray, then bag for up to 2 months for best quality. Reheat in the toaster or microwave.'),
  leftovers=('Spread a cold pancake with peanut butter and roll it up for a snack.', None),
  kids='Add blueberries or chocolate chips to the pancakes after pouring the batter. Kids can help whisk.',
  swaps={'gluten_free': 'Use a gluten-free flour blend with xanthan gum.',
         'dairy_free': 'Use 1 3/4 cups unsweetened plant milk plus 2 tablespoons lemon juice for the buttermilk, and oil for the butter.'},
  prep_day=dict(ahead='Cook a double batch and freeze for weekdays.', station='stove', oven_f=None, active=25, keeps_days=3),
  pairs=['fruit-salad', 'scrambled-eggs'])

R(id='oatmeal', name='Creamy Stovetop Oatmeal', emoji='🥣', servings=4, serving_size='about 1 cup',
  meal=['breakfast'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['quick', 'budget', 'kid-friendly'],
  prep=2, cook=10, equipment=['medium saucepan'],
  summary='Old-fashioned oats cooked in milk and water with a little cinnamon. Set out toppings.',
  ingredients='''
Oatmeal:
2 cup rolled-oats
2 cup water
2 cup milk-2
1/4 tsp salt
1/2 tsp cinnamon
Toppings:
?2 each banana | sliced
?1/4 cup brown-sugar
?1/4 cup walnuts | chopped
?1/2 cup raisins
''',
  steps=[
    'Bring the water, milk and salt to a gentle boil in a saucepan over medium heat. Watch it; milk boils over quickly.',
    'Stir in the oats and cinnamon. Lower the heat and simmer 5 minutes, stirring often, until thick and creamy.',
    'Take off the heat, cover and let stand 2 minutes. Serve with toppings.',
  ],
  safety=[],
  make_ahead='Cook a big batch; refrigerate up to 4 days and reheat portions with a splash of milk.',
  freezer=(True, 'Freeze cooked oatmeal in muffin-tin portions, then bag, for up to 2 months.'),
  leftovers=('Stir leftover oatmeal into pancake batter.', None),
  kids='Let kids choose two toppings. Cool the bowl a few minutes; oatmeal holds heat.',
  swaps={'gluten_free': 'Use oats labeled gluten-free.', 'dairy_free': 'Use all water or an unsweetened plant milk.'},
  prep_day=dict(ahead='Cook a batch for the week.', station='stove', oven_f=None, active=10, keeps_days=4),
  pairs=[])

R(id='overnight-oats', name='Overnight Oats', emoji='🫙', servings=4, serving_size='1 jar (about 1 cup)',
  meal=['breakfast', 'snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick', 'lunchbox'],
  prep=10, cook=0, inactive=480, equipment=['4 jars or containers with lids'],
  summary='Oats soaked overnight in milk and yogurt. Grab-and-go breakfast with no cooking.',
  ingredients='''
Base:
2 cup rolled-oats
2 cup milk-2
1 cup greek-yogurt
2 tbsp chia-seeds
2 tbsp maple-syrup
1 tsp vanilla
1/2 tsp cinnamon
1/8 tsp salt
Toppings:
1 cup strawberries | sliced (or any fruit)
''',
  steps=[
    'Stir the oats, milk, yogurt, chia seeds, maple syrup, vanilla, cinnamon and salt together.',
    'Divide among 4 jars, top with fruit, cover and refrigerate at least 8 hours or overnight.',
    'Stir and eat cold, or microwave 1 to 2 minutes if you like it warm.',
  ],
  safety=[],
  make_ahead='Keeps 4 days in the fridge; add delicate fruit like bananas the morning you eat it.',
  freezer=(False, 'The texture suffers when frozen.'),
  leftovers=None,
  kids='Kids can layer their own jars the night before.',
  swaps={'gluten_free': 'Use oats labeled gluten-free.', 'dairy_free': 'Use plant milk and a dairy-free yogurt.'},
  prep_day=dict(ahead='Fill jars for 4 days.', station='none', oven_f=None, active=10, keeps_days=4),
  pairs=[])

R(id='scrambled-eggs', name='Soft Scrambled Eggs', emoji='🍳', servings=4, serving_size='2 eggs',
  meal=['breakfast', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['quick', 'kid-friendly', 'budget'],
  prep=3, cook=6, equipment=['nonstick skillet', 'silicone spatula', 'bowl', 'whisk or fork'],
  summary='Tender, fluffy scrambled eggs in under 10 minutes.',
  ingredients='''
Eggs:
8 each eggs
1/4 cup milk-2
1/4 tsp salt
1/8 tsp black-pepper
1 tbsp butter
?1/2 cup cheddar
?1 tbsp chives | chopped
To serve:
?4 slice wheat-bread | toasted
''',
  steps=[
    'Whisk the eggs, milk, salt and pepper until no streaks of white remain.',
    'Melt the butter in a nonstick skillet over medium-low heat. Add the eggs and let them sit 20 seconds.',
    'Push the eggs slowly from the edges to the center with a spatula, making large soft curds. Keep going until no liquid egg remains, 3 to 5 minutes (egg dishes are done at 160°F). Stir in cheese at the end if you like.',
    'Serve right away with toast.',
  ],
  safety=[T_EGGS],
  make_ahead='Best fresh.',
  freezer=(False, 'Best fresh; use the breakfast burritos for a freezer egg breakfast.'),
  leftovers=None,
  kids='Kids old enough to use the stove with help can learn eggs first; they are quick and forgiving.',
  swaps={'dairy_free': 'Use water instead of milk and olive oil instead of butter; skip the cheese.'},
  prep_day=None,
  pairs=['fruit-salad', 'pancakes'])

R(id='breakfast-burritos', name='Freezer Breakfast Burritos', emoji='🌯', servings=8, serving_size='1 burrito',
  meal=['breakfast'], protein='pork', method=['stovetop', 'oven'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly'],
  prep=20, cook=30, equipment=['large skillet', 'rimmed baking sheet', 'foil or freezer bags'],
  summary='Eggs, sausage, potatoes and cheese wrapped and frozen for grab-and-go mornings.',
  ingredients='''
Filling:
2 cup frozen-hash-browns
1 tbsp vegetable-oil
12 oz breakfast-sausage
10 each eggs
1/4 cup milk-2
1/2 tsp salt
1/4 tsp black-pepper
1 1/2 cup cheddar
Wrapping:
8 each large-flour-tortillas
?1/2 cup salsa
''',
  steps=[
    'Heat the oven to 425°F. Toss the hash browns with the oil on a baking sheet and bake 20 minutes, until crisp.',
    'Brown the sausage in a large skillet, breaking it up, until no pink remains and it reaches 160°F. Drain on paper towels. Wipe out the skillet.',
    'Whisk the eggs, milk, salt and pepper. Scramble in the skillet over medium-low heat until no liquid egg remains. Let everything cool 10 minutes.',
    'Divide the potatoes, sausage, eggs and cheese among the tortillas. Fold in the sides and roll tightly.',
    'Wrap each in foil or plastic and freeze. To reheat: unwrap, wrap in a damp paper towel and microwave 1 1/2 to 2 1/2 minutes, turning once, until 165°F in the center.',
  ],
  safety=[T_GROUND_PORK, T_EGGS, T_LEFTOVERS],
  make_ahead='Refrigerate wrapped burritos up to 3 days or freeze.',
  freezer=(True, 'Freeze for 2 to 3 months for best quality.'),
  leftovers=None,
  kids='Make smaller burritos in 8-inch tortillas for little ones.',
  swaps={'gluten_free': 'Use gluten-free tortillas and check the sausage label.', 'dairy_free': 'Skip the milk and cheese.',
         'meatless': 'Use 1 can drained black beans instead of sausage.'},
  prep_day=dict(ahead='Make and freeze the whole batch.', station='oven', oven_f=425, active=35, keeps_days=3),
  pairs=[])

R(id='egg-muffin-cups', name='Veggie Egg Muffin Cups', emoji='🧁', servings=6, serving_size='2 egg cups',
  meal=['breakfast', 'snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'freezer-friendly', 'lunchbox', 'kid-friendly'],
  prep=10, cook=22, equipment=['12-cup muffin tin', 'cooking spray', 'large bowl'],
  summary='Mini baked omelets with vegetables and cheese. Reheat in seconds.',
  ingredients='''
Egg cups:
10 each eggs
1/3 cup milk-2
1/2 tsp salt
1/4 tsp black-pepper
1 cup spinach | chopped
1/2 each red-bell-pepper | finely diced
2 each green-onions | sliced
3/4 cup cheddar
?1 tsp cooking-spray | or use silicone liners
''',
  steps=[
    'Heat the oven to 350°F. Coat a 12-cup muffin tin well with cooking spray (or use silicone liners).',
    'Whisk the eggs, milk, salt and pepper. Divide the spinach, pepper, green onions and cheese among the cups, then pour in the egg to about three-quarters full.',
    'Bake 20 to 24 minutes, until puffed and set in the center (160°F).',
    'Cool 5 minutes, then run a knife around each and lift out.',
  ],
  safety=[T_EGGS],
  make_ahead='Refrigerate up to 4 days; microwave 30 to 45 seconds until hot (165°F).',
  freezer=(True, 'Freeze in a bag for up to 2 months for best quality.'),
  leftovers=None,
  kids='Kids can choose their own fillings for a few cups; mark them with a toothpick.',
  swaps={'dairy_free': 'Use water instead of milk and skip the cheese.', 'meatless': 'Already meatless; add diced ham for a meat version.'},
  prep_day=dict(ahead='Bake a batch for weekday breakfasts.', station='oven', oven_f=350, active=10, keeps_days=4),
  pairs=['fruit-salad'])

R(id='french-toast', name='Cinnamon French Toast', emoji='🍞', servings=4, serving_size='2 slices',
  meal=['breakfast'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly', 'quick', 'budget', 'freezer-friendly'],
  prep=5, cook=15, equipment=['shallow dish', 'griddle or large skillet', 'spatula'],
  summary='A good use for day-old bread: dipped in cinnamon custard and griddled until golden.',
  ingredients='''
French toast:
4 each eggs
1 cup milk-2
1 tbsp sugar
1 tsp vanilla
1/2 tsp cinnamon
1/8 tsp salt
8 slice white-bread | a day old if you have it
2 tbsp butter
To serve:
?1/2 cup maple-syrup
?1 cup strawberries | sliced
''',
  steps=[
    'Whisk the eggs, milk, sugar, vanilla, cinnamon and salt in a shallow dish.',
    'Heat a griddle over medium heat and melt a little butter.',
    'Dip each bread slice in the egg mixture for a few seconds per side, letting extra drip off. Cook 2 to 3 minutes per side, until golden and no liquid egg remains in the center (160°F).',
    'Serve with syrup and fruit.',
  ],
  safety=[T_EGGS],
  make_ahead='Whisk the custard the night before and refrigerate.',
  freezer=(True, 'Freeze cooked slices in one layer, then bag, for up to 2 months; reheat in the toaster.'),
  leftovers=None,
  kids='Cut into sticks for dipping in syrup.',
  swaps={'gluten_free': 'Use gluten-free bread.', 'dairy_free': 'Use plant milk and oil.'},
  prep_day=dict(ahead='Make a batch and freeze.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=['fruit-salad'])

R(id='banana-muffins', name='Banana Oat Muffins', emoji='🧁', servings=12, serving_size='1 muffin',
  meal=['breakfast', 'snack'], protein='vegetarian', method=['oven'], tags=['freezer-friendly', 'make-ahead', 'lunchbox', 'kid-friendly'],
  prep=15, cook=20, equipment=['12-cup muffin tin', 'paper liners', '2 mixing bowls'],
  summary='Moist muffins that use up spotty bananas. Freeze and tuck into lunchboxes.',
  ingredients='''
Muffins:
3 each banana | very ripe, mashed (about 1 1/4 cups)
1/3 cup vegetable-oil
1/2 cup brown-sugar
1 each eggs
1/2 cup plain-yogurt
1 tsp vanilla
1 1/2 cup flour
1 cup rolled-oats
1 tsp baking-soda
1 tsp baking-powder
1 tsp cinnamon
1/2 tsp salt
?1/2 cup chocolate-chips
''',
  steps=[
    'Heat the oven to 375°F and line a muffin tin with paper liners.',
    'Mash the bananas in a large bowl. Whisk in the oil, brown sugar, egg, yogurt and vanilla.',
    'In another bowl, mix the flour, oats, baking soda, baking powder, cinnamon and salt. Add to the banana mixture and stir just until combined. Fold in chocolate chips if using.',
    'Fill the cups about three-quarters full. Bake 18 to 22 minutes, until a toothpick in the center comes out clean.',
    'Cool 5 minutes in the pan, then on a rack.',
  ],
  safety=[],
  make_ahead='Keep at room temperature up to 2 days or in the fridge up to 5.',
  freezer=(True, 'Freeze cooled muffins in a bag for up to 3 months. Pack frozen in a lunchbox; it thaws by lunchtime.'),
  leftovers=None,
  kids='Kids can mash the bananas and fill the liners.',
  swaps={'gluten_free': 'Use a gluten-free flour blend and oats labeled gluten-free.', 'dairy_free': 'Use a dairy-free yogurt and dairy-free chips.'},
  prep_day=dict(ahead='Bake a batch; freeze half.', station='oven', oven_f=375, active=15, keeps_days=5),
  pairs=[])

R(id='yogurt-parfait', name='Yogurt Parfaits', emoji='🍓', servings=4, serving_size='1 parfait',
  meal=['breakfast', 'snack'], protein='vegetarian', method=['no-cook'], tags=['quick', 'kid-friendly', 'lunchbox'],
  prep=10, cook=0, equipment=['4 glasses or jars'],
  summary='Layers of yogurt, fruit and granola. Kids can build their own.',
  ingredients='''
Parfaits:
3 cup vanilla-yogurt
2 cup strawberries | sliced
1 cup blueberries
1 cup granola
''',
  steps=[
    'Spoon a layer of yogurt into each glass, then fruit, then a little granola. Repeat.',
    'For lunchboxes, pack the granola separately so it stays crunchy, and include an ice pack.',
  ],
  safety=[],
  make_ahead='Layer yogurt and fruit up to 1 day ahead; add granola when serving.',
  freezer=(False, 'Best fresh.'),
  leftovers=None,
  kids='Set out bowls of toppings and let kids layer their own.',
  swaps={'gluten_free': 'Use granola labeled gluten-free.', 'dairy_free': 'Use a dairy-free yogurt.'},
  prep_day=dict(ahead='Wash and slice fruit; portion yogurt into jars.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=[])

# ---------------- Lunch ----------------
R(id='chicken-caesar-salad', name='Chicken Caesar-Style Salad', emoji='🥗', servings=4, serving_size='about 2 1/2 cups',
  meal=['lunch', 'dinner'], protein='chicken', method=['stovetop'], tags=['quick'],
  prep=15, cook=12, equipment=['skillet or grill pan', 'large bowl', 'small bowl', 'instant-read thermometer'],
  summary='Crisp romaine, Parmesan and croutons with an easy creamy dressing made without raw eggs.',
  ingredients='''
Chicken:
1 1/4 lb chicken-breast
1 tbsp olive-oil
1/2 tsp salt
1/4 tsp black-pepper
1/2 tsp garlic-powder
Dressing:
1/2 cup mayonnaise
1/4 cup parmesan
2 tbsp lemon-juice
1 tsp dijon-mustard
1 tsp worcestershire
1 clove garlic | grated
1/4 tsp black-pepper
Salad:
2 heart romaine | chopped
1 1/2 cup croutons
1/4 cup parmesan-wedge | shaved
''',
  steps=[
    'Pound the chicken to an even 3/4-inch thickness between sheets of plastic wrap. Rub with the oil and season with salt, pepper and garlic powder.',
    'Cook in a skillet or grill pan over medium-high heat 5 to 6 minutes per side, until 165°F in the thickest part. Rest 5 minutes, then slice.',
    'Whisk the dressing ingredients together. (Using mayonnaise instead of raw egg yolk keeps it safe to make ahead.)',
    'Toss the romaine with about 2/3 of the dressing. Top with chicken, croutons and shaved Parmesan, and pass the rest of the dressing.',
  ],
  safety=[T_POULTRY],
  make_ahead='The dressing keeps 5 days in the fridge. Cook the chicken up to 3 days ahead.',
  freezer=(False, 'Freeze cooked chicken only, not the salad.'),
  leftovers=('Pack dressing separately so the lettuce stays crisp.', 'lunch'),
  kids='Serve the lettuce, chicken and croutons separately with dressing for dipping.',
  swaps={'gluten_free': 'Skip the croutons and check the Worcestershire label.'},
  prep_day=dict(ahead='Cook and slice the chicken; make the dressing; wash and dry the romaine.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=[])

R(id='turkey-cheese-wraps', name='Turkey and Cheese Pinwheel Wraps', emoji='🌯', servings=4, serving_size='1 wrap (about 6 pinwheels)',
  meal=['lunch'], protein='turkey', method=['no-cook'], tags=['quick', 'lunchbox', 'kid-friendly'],
  prep=10, cook=0, equipment=['cutting board', 'sharp knife'],
  summary='Tortillas spread with cream cheese, rolled with turkey, cheese and spinach, and sliced into pinwheels.',
  ingredients='''
Wraps:
4 each large-flour-tortillas
4 oz cream-cheese | softened
8 oz deli-turkey
4 slice deli-provolone
1 cup spinach
1/2 each cucumber | cut in thin strips
''',
  steps=[
    'Spread each tortilla with cream cheese all the way to the edges (it holds the roll together).',
    'Layer turkey, provolone and spinach over the bottom two-thirds. Lay a few cucumber strips near the bottom edge.',
    'Roll up tightly from the bottom. Wrap in plastic and chill 15 minutes if you have time; they slice more neatly.',
    'Cut into 1-inch pinwheels. Pack with an ice pack in an insulated lunch bag.',
  ],
  safety=[],
  make_ahead='Rolled, wrapped wraps keep 1 day in the fridge; slice in the morning.',
  freezer=(False, 'Do not freeze.'),
  leftovers=None,
  kids='Pinwheels are easy for small hands. Swap in ham or cheese only.',
  swaps={'gluten_free': 'Use gluten-free tortillas.', 'dairy_free': 'Use hummus instead of cream cheese and skip the provolone.',
         'meatless': 'Use hummus, cheese and extra vegetables.'},
  prep_day=dict(ahead='Roll the wraps the night before.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['fruit-salad'])

R(id='lunchbox-sandwiches', name='Lunchbox PB and J (Nut-Free Option)', emoji='🥪', servings=4, serving_size='1 sandwich',
  meal=['lunch'], protein='vegetarian', method=['no-cook'], tags=['quick', 'lunchbox', 'kid-friendly', 'budget'],
  prep=5, cook=0, equipment=['butter knife'],
  summary='The classic, with a sunflower seed butter swap for schools that do not allow nuts.',
  ingredients='''
Sandwiches:
8 slice wheat-bread
1/2 cup peanut-butter | or sunflower seed butter
1/4 cup jam
?1 each banana | thinly sliced
''',
  steps=[
    'Spread 4 slices of bread with peanut butter (or sunflower seed butter) all the way to the edges; this keeps the jam from soaking in.',
    'Spread jam on the other 4 slices, add banana if you like, and close the sandwiches.',
    'Cut and pack. Make sandwiches the night before if mornings are rushed.',
  ],
  safety=[],
  make_ahead='Make up to 1 day ahead; keep refrigerated.',
  freezer=(True, 'Peanut butter and jam sandwiches (without banana) freeze for up to 1 month; pack frozen and they thaw by lunch.'),
  leftovers=None,
  kids='Use a cookie cutter for fun shapes. Check your school rules on nuts before packing peanut butter.',
  swaps={'gluten_free': 'Use gluten-free bread.'},
  prep_day=dict(ahead='Make and freeze a week of sandwiches.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['fruit-salad'])

R(id='tuna-salad', name='Classic Tuna Salad Sandwiches', emoji='🐟', servings=4, serving_size='1 sandwich',
  meal=['lunch'], protein='fish', method=['no-cook'], tags=['quick', 'budget', 'lunchbox'],
  prep=10, cook=0, equipment=['bowl', 'fork'],
  summary='Canned tuna with a little crunch from celery and pickle relish.',
  ingredients='''
Tuna salad:
2 can canned-tuna | drained
1/3 cup mayonnaise
1 stalk celery | finely diced
2 tbsp pickle-relish
1 tsp lemon-juice
1/8 tsp black-pepper
To serve:
8 slice wheat-bread
4 leaf green-leaf-lettuce
''',
  steps=[
    'Flake the tuna in a bowl. Stir in the mayonnaise, celery, relish, lemon juice and pepper.',
    'Spread on bread with lettuce. Pack with an ice pack.',
  ],
  safety=[],
  make_ahead='Tuna salad keeps 3 to 5 days in the fridge.',
  freezer=(False, 'Mayonnaise-based salads do not freeze well.'),
  leftovers=None,
  kids='Serve on crackers or in a wrap. Light tuna is lower in mercury than albacore, and the FDA lists it among its best choices for children.',
  swaps={'gluten_free': 'Serve in lettuce cups or on gluten-free bread.'},
  prep_day=dict(ahead='Mix the tuna salad.', station='none', oven_f=None, active=10, keeps_days=3),
  pairs=['fruit-salad'])

R(id='pasta-salad', name='Italian Pasta Salad', emoji='🥗', servings=8, serving_size='about 1 cup',
  meal=['lunch', 'side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'lunchbox', 'budget'],
  prep=15, cook=10, equipment=['large pot', 'colander', 'large bowl'],
  summary='Rotini with vegetables, mozzarella and Italian dressing. Better after a night in the fridge.',
  ingredients='''
Salad:
1 lb rotini
^1 tbsp salt | for the pasta water (most is poured off, so it is left out of nutrition)
1 cup cherry-tomatoes | halved
1 each cucumber | diced
1 each red-bell-pepper | diced
1/2 cup black-olives
8 oz fresh-mozzarella | cubed
3/4 cup italian-dressing
?3 oz pepperoni | quartered
?1/4 cup parmesan
''',
  steps=[
    'Cook the pasta in boiling salted water until just tender. Drain and rinse with cold water to cool; drain well.',
    'Toss with the vegetables, olives, mozzarella and dressing. Add pepperoni and Parmesan if you like.',
    'Chill at least 1 hour. Stir in a splash more dressing before serving if it looks dry.',
  ],
  safety=[],
  make_ahead='Keeps 3 to 5 days in the fridge.',
  freezer=(False, 'Does not freeze well.'),
  leftovers=('Pack with an ice pack for lunches.', 'lunch'),
  kids='Leave the olives on the side for kids who are unsure.',
  swaps={'gluten_free': 'Use gluten-free pasta.', 'dairy_free': 'Skip the cheeses and add a can of drained chickpeas.'},
  prep_day=dict(ahead='Make the whole salad for lunches.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=[])

R(id='hummus-veggie-wraps', name='Hummus Veggie Wraps', emoji='🥙', servings=4, serving_size='1 wrap',
  meal=['lunch'], protein='vegetarian', method=['no-cook'], tags=['quick', 'lunchbox'],
  prep=10, cook=0, equipment=['cutting board'],
  summary='Hummus, crunchy vegetables and feta rolled in a tortilla.',
  ingredients='''
Wraps:
4 each large-flour-tortillas
1 cup hummus
1 each cucumber | cut in strips
2 each carrot | shredded
1 each red-bell-pepper | sliced
2 cup spinach
1/2 cup feta
''',
  steps=[
    'Spread each tortilla with 1/4 cup hummus.',
    'Layer the vegetables and feta along the bottom third, roll up tightly and cut in half.',
    'Pack with an ice pack.',
  ],
  safety=[],
  make_ahead='Best the day you make it; vegetables can be cut up to 3 days ahead.',
  freezer=(False, 'Do not freeze.'),
  leftovers=None,
  kids='Offer the vegetables as dippers with hummus instead of a wrap.',
  swaps={'gluten_free': 'Use gluten-free tortillas.', 'dairy_free': 'Skip the feta.'},
  prep_day=dict(ahead='Cut the vegetables.', station='none', oven_f=None, active=10, keeps_days=3),
  pairs=[])

# ---------------- Sides ----------------
R(id='white-rice', name='Fluffy White Rice', emoji='🍚', servings=6, serving_size='about 1/2 cup cooked',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['budget', 'quick'],
  prep=2, cook=18, inactive=5, equipment=['medium saucepan with a tight lid'],
  summary='Simple stovetop long-grain rice. Cook extra for fried rice and burritos.',
  ingredients='''
Rice:
1 cup white-rice
1 3/4 cup water
1/2 tsp salt
1 tsp butter
''',
  steps=[
    'Rinse the rice in a strainer until the water runs mostly clear. This keeps it from getting gummy.',
    'Bring the water, salt and butter to a boil in a saucepan. Stir in the rice, cover, and turn the heat to low.',
    'Cook 15 to 18 minutes, until the water is absorbed. Take off the heat and let stand covered 5 minutes, then fluff with a fork.',
    'To keep leftovers safely, spread the rice out to cool and refrigerate it within 2 hours.',
  ],
  safety=[],
  make_ahead='Refrigerate cooked rice up to 4 days; reheat to 165°F with a splash of water.',
  freezer=(True, 'Freeze cooled rice flat in bags for up to 3 months.'),
  leftovers=('Use cold rice for fried rice.', None),
  kids='Stir in frozen peas for the last 5 minutes for color.',
  swaps={'dairy_free': 'Use oil or skip the butter.'},
  prep_day=dict(ahead='Cook a double batch for the week.', station='stove', oven_f=None, active=5, keeps_days=4),
  pairs=[])

R(id='brown-rice', name='Baked Brown Rice', emoji='🍚', servings=6, serving_size='about 1/2 cup cooked',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['budget', 'make-ahead'],
  prep=5, cook=60, inactive=5, equipment=['8-inch square baking dish', 'aluminum foil'],
  summary='Hands-off brown rice baked in the oven, which cooks it evenly every time.',
  ingredients='''
Rice:
1 1/2 cup brown-rice
2 1/2 cup water
1 tbsp butter
3/4 tsp salt
''',
  steps=[
    'Heat the oven to 375°F. Spread the rice in the baking dish.',
    'Bring the water, butter and salt to a boil (kettle or microwave) and pour over the rice. Cover tightly with foil.',
    'Bake 1 hour. Uncover, fluff with a fork and let stand 5 minutes.',
  ],
  safety=[],
  make_ahead='Refrigerate up to 4 days; cool quickly and refrigerate within 2 hours.',
  freezer=(True, 'Freeze in portions for up to 3 months.'),
  leftovers=('Add to soups or burrito bowls.', None),
  kids='Mix half brown and half white rice to start.',
  swaps={'dairy_free': 'Use olive oil instead of butter.'},
  prep_day=dict(ahead='Bake a batch while something else roasts.', station='oven', oven_f=375, active=5, keeps_days=4),
  pairs=[])

R(id='roasted-vegetables', name='Roasted Vegetables', emoji='🥕', servings=6, serving_size='about 3/4 cup',
  meal=['side'], protein='vegetarian', method=['oven', 'sheet-pan'], tags=['budget'],
  prep=10, cook=25, equipment=['large rimmed baking sheet'],
  summary='Broccoli, carrots and peppers roasted until browned at the edges. Works with almost any vegetable.',
  ingredients='''
Vegetables:
4 cup broccoli | florets
3 each carrot | sliced 1/4 inch thick
1 each red-bell-pepper | cut in chunks
1 each red-onion | cut in wedges
3 tbsp olive-oil
3/4 tsp salt
1/4 tsp black-pepper
1/2 tsp garlic-powder
''',
  steps=[
    'Heat the oven to 425°F.',
    'Toss everything on a large baking sheet and spread in one layer; crowding makes them steam instead of brown.',
    'Roast 20 to 25 minutes, stirring once, until tender and browned at the edges.',
  ],
  safety=[],
  make_ahead='Cut the vegetables up to 3 days ahead.',
  freezer=(False, 'Roasted vegetables turn soft when frozen.'),
  leftovers=('Add to pasta, quesadillas or egg muffin cups.', None),
  kids='A sprinkle of Parmesan in the last 5 minutes wins over many kids.',
  swaps={},
  prep_day=dict(ahead='Cut the vegetables.', station='oven', oven_f=425, active=10, keeps_days=4),
  pairs=[])

R(id='green-salad', name='Simple Green Salad', emoji='🥬', servings=6, serving_size='about 1 1/2 cups',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['quick'],
  prep=10, cook=0, equipment=['large bowl', 'jar with lid'],
  summary='Crisp greens and vegetables with a shake-in-a-jar vinaigrette.',
  ingredients='''
Salad:
1 head romaine | chopped
1 cup cherry-tomatoes | halved
1 each cucumber | sliced
1 each carrot | shredded
Vinaigrette:
1/4 cup olive-oil
2 tbsp red-wine-vinegar
1 tsp dijon-mustard
1 tsp honey
1/4 tsp salt
1/8 tsp black-pepper
''',
  steps=[
    'Shake the vinaigrette ingredients in a jar until blended.',
    'Toss the greens and vegetables with dressing just before serving.',
  ],
  safety=[],
  make_ahead='The vinaigrette keeps 1 week in the fridge; shake before using. Wash and dry greens up to 3 days ahead and store with a paper towel.',
  freezer=(False, 'Do not freeze.'),
  leftovers=None,
  kids='Serve dressing on the side for dipping.',
  swaps={},
  prep_day=dict(ahead='Wash greens; make the vinaigrette.', station='none', oven_f=None, active=10, keeps_days=3),
  pairs=[])

R(id='mashed-potatoes', name='Creamy Mashed Potatoes', emoji='🥔', servings=6, serving_size='about 3/4 cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly', 'make-ahead', 'budget'],
  prep=10, cook=20, equipment=['large pot', 'potato masher', 'colander'],
  summary='Buttery, smooth mashed potatoes made with yellow potatoes.',
  ingredients='''
Potatoes:
2 1/2 lb yukon-potato | peeled and cut in 2-inch chunks
^1 tbsp salt | for the cooking water (left out of nutrition)
4 tbsp butter
3/4 cup whole-milk | warmed
1/2 tsp salt
1/8 tsp black-pepper
''',
  steps=[
    'Put the potatoes in a large pot, cover with cold water by 1 inch and add 1 tablespoon salt. Bring to a boil and cook 15 to 20 minutes, until a fork slides in easily.',
    'Drain well and return to the pot over low heat for 1 minute to dry.',
    'Mash with the butter, then stir in the warm milk, salt and pepper.',
  ],
  safety=[],
  make_ahead='Make up to 2 days ahead; reheat covered in the oven or microwave to 165°F with a splash of milk.',
  freezer=(True, 'Freeze in portions for up to 1 month; they may be a little looser after thawing.'),
  leftovers=('Top shepherd\'s pie or make potato pancakes.', None),
  kids='Kids can do the mashing once the potatoes cool a little.',
  swaps={'dairy_free': 'Use olive oil and some of the potato cooking water or unsweetened plant milk.'},
  prep_day=dict(ahead='Make and refrigerate.', station='stove', oven_f=None, active=15, keeps_days=3),
  pairs=[])

R(id='green-beans', name='Garlic Butter Green Beans', emoji='🫛', servings=6, serving_size='about 3/4 cup',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['quick'],
  prep=5, cook=10, equipment=['large skillet with lid'],
  summary='Bright green beans steamed and tossed with garlic butter.',
  ingredients='''
Green beans:
1 1/2 lb green-beans | trimmed
1/3 cup water
2 tbsp butter
2 clove garlic | minced
1/2 tsp salt
1 tsp lemon-juice
''',
  steps=[
    'Put the beans and water in a large skillet, cover and cook over medium-high heat 5 to 6 minutes, until crisp-tender.',
    'Uncover and let any water boil off. Add the butter, garlic and salt and toss 1 minute. Squeeze in the lemon juice.',
  ],
  safety=[],
  make_ahead='Trim the beans up to 3 days ahead.',
  freezer=(False, 'Use frozen green beans instead if you like; cook them a little less.'),
  leftovers=None,
  kids='Call them "green fries" and let kids eat them with their fingers.',
  swaps={'dairy_free': 'Use olive oil.'},
  prep_day=dict(ahead='Trim the beans.', station='none', oven_f=None, active=5, keeps_days=3),
  pairs=[])

R(id='corn-on-the-cob', name='Buttered Corn on the Cob', emoji='🌽', servings=6, serving_size='1 ear',
  meal=['side'], protein='vegetarian', method=['stovetop', 'grill'], tags=['quick', 'kid-friendly'],
  prep=5, cook=8, equipment=['large pot', 'tongs'],
  summary='Sweet summer corn boiled or grilled and brushed with butter.',
  ingredients='''
Corn:
6 ear corn-on-cob | husked
2 tbsp butter
1/4 tsp salt
''',
  steps=[
    'Bring a large pot of water to a boil. Add the corn and cook 4 to 6 minutes, until tender.',
    'Or grill over medium-high heat 8 to 10 minutes, turning, until lightly charred.',
    'Brush with butter and sprinkle with salt.',
  ],
  safety=[],
  make_ahead='Best fresh. In winter, use 4 cups frozen corn heated with the butter.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Cut the kernels off leftover ears for salads, quesadillas or chili.', None),
  kids='Break ears in half for small hands. For young children, cut the kernels off the cob.',
  swaps={'dairy_free': 'Use olive oil.'},
  prep_day=None,
  pairs=[])

R(id='garlic-bread', name='Garlic Bread', emoji='🥖', servings=8, serving_size='2 slices',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['kid-friendly', 'quick', 'freezer-friendly'],
  prep=5, cook=12, equipment=['baking sheet', 'small bowl'],
  summary='Crusty bread spread with garlic butter and baked until golden.',
  ingredients='''
Garlic bread:
1 loaf french-bread
6 tbsp butter | softened
3 clove garlic | minced
1 tbsp parsley | chopped
1/8 tsp salt
?1/4 cup parmesan
''',
  steps=[
    'Heat the oven to 400°F. Split the loaf lengthwise.',
    'Mix the butter, garlic, parsley and salt; spread on the cut sides. Sprinkle with Parmesan if you like.',
    'Bake cut side up 10 to 12 minutes, until golden at the edges. Slice.',
  ],
  safety=[],
  make_ahead='Spread the bread, wrap in foil and refrigerate up to 1 day.',
  freezer=(True, 'Freeze the buttered, unbaked bread wrapped in foil for up to 2 months; bake from frozen about 15 minutes.'),
  leftovers=None,
  kids='Toast a few slices without garlic for very young eaters.',
  swaps={'gluten_free': 'Use gluten-free bread.', 'dairy_free': 'Use olive oil instead of butter.'},
  prep_day=dict(ahead='Butter the loaf and freeze.', station='oven', oven_f=400, active=5, keeps_days=1),
  pairs=[])

R(id='roasted-potatoes', name='Crispy Roasted Potatoes', emoji='🥔', servings=6, serving_size='about 3/4 cup',
  meal=['side'], protein='vegetarian', method=['oven', 'sheet-pan'], tags=['budget', 'kid-friendly'],
  prep=10, cook=35, equipment=['large rimmed baking sheet'],
  summary='Golden potato chunks with crisp edges and soft centers.',
  ingredients='''
Potatoes:
2 lb yukon-potato | cut in 1-inch chunks
3 tbsp olive-oil
3/4 tsp salt
1/4 tsp black-pepper
1/2 tsp garlic-powder
1/2 tsp rosemary-dried
''',
  steps=[
    'Heat the oven to 425°F with the baking sheet inside.',
    'Toss the potatoes with the oil and seasonings. Carefully spread them on the hot pan in one layer.',
    'Roast 30 to 35 minutes, turning once, until crisp and browned.',
  ],
  safety=[],
  make_ahead='Cut the potatoes and keep covered in water in the fridge up to 1 day; dry well before roasting.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Chop into a breakfast hash.', None),
  kids='Serve with ketchup for dipping.',
  swaps={},
  prep_day=dict(ahead='Cut the potatoes.', station='oven', oven_f=425, active=10, keeps_days=1),
  pairs=[])

R(id='coleslaw', name='Creamy Coleslaw', emoji='🥬', servings=8, serving_size='about 1/2 cup',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick', 'budget'],
  prep=10, cook=0, inactive=30, equipment=['large bowl'],
  summary='Crunchy cabbage slaw with a tangy-sweet dressing; great on pulled pork sandwiches.',
  ingredients='''
Slaw:
14 oz coleslaw-mix
1/2 cup mayonnaise
1 tbsp cider-vinegar
1 tbsp sugar
1/2 tsp celery-seed
1/4 tsp salt
1/8 tsp black-pepper
''',
  steps=[
    'Whisk the mayonnaise, vinegar, sugar, celery seed, salt and pepper.',
    'Toss with the coleslaw mix and chill at least 30 minutes.',
  ],
  safety=[],
  make_ahead='Keeps 3 days in the fridge; it softens over time.',
  freezer=(False, 'Do not freeze.'),
  leftovers=None,
  kids='Some kids like it best with a handful of raisins or apple matchsticks.',
  swaps={},
  prep_day=dict(ahead='Make the slaw.', station='none', oven_f=None, active=10, keeps_days=3),
  pairs=[])

R(id='cornbread-muffins', name='Cornbread Muffins', emoji='🌽', servings=12, serving_size='1 muffin',
  meal=['side', 'snack'], protein='vegetarian', method=['oven'], tags=['freezer-friendly', 'kid-friendly', 'budget'],
  prep=10, cook=16, equipment=['12-cup muffin tin', 'mixing bowls'],
  summary='Lightly sweet cornbread baked as muffins. Perfect with chili and soups.',
  ingredients='''
Muffins:
1 cup cornmeal
1 cup flour
1/4 cup sugar
1 tbsp baking-powder
1/2 tsp salt
1 cup milk-2
1 each eggs
1/3 cup vegetable-oil
''',
  steps=[
    'Heat the oven to 400°F. Grease a 12-cup muffin tin or line it with paper.',
    'Whisk the cornmeal, flour, sugar, baking powder and salt. In another bowl whisk the milk, egg and oil.',
    'Stir the wet ingredients into the dry just until combined. Divide among the cups.',
    'Bake 14 to 17 minutes, until golden and a toothpick comes out clean.',
  ],
  safety=[],
  make_ahead='Keep 2 days at room temperature.',
  freezer=(True, 'Freeze for up to 3 months.'),
  leftovers=None,
  kids='Serve with honey butter (not for babies under 12 months).',
  swaps={'gluten_free': 'Use a gluten-free flour blend.', 'dairy_free': 'Use unsweetened plant milk.'},
  prep_day=dict(ahead='Bake and freeze.', station='oven', oven_f=400, active=10, keeps_days=2),
  pairs=[])

R(id='fruit-salad', name='Rainbow Fruit Salad', emoji='🍇', servings=8, serving_size='about 3/4 cup',
  meal=['side', 'snack', 'breakfast'], protein='vegetarian', method=['no-cook'], tags=['kid-friendly', 'quick', 'lunchbox'],
  prep=15, cook=0, equipment=['large bowl', 'cutting board'],
  summary='A colorful bowl of fresh fruit with a squeeze of orange.',
  ingredients='''
Fruit:
2 cup strawberries | hulled and quartered
1 cup blueberries
2 cup grapes | halved
2 each kiwi | peeled and diced
2 each clementine | segmented
1 each banana | sliced, just before serving
1 tbsp lemon-juice
''',
  steps=[
    'Rinse the fruit under running water before cutting.',
    'Combine everything in a bowl and toss gently with the lemon juice, which keeps the banana from browning.',
  ],
  safety=[],
  make_ahead='Cut fruit (except banana) keeps 2 to 3 days in the fridge.',
  freezer=(False, 'Do not freeze (use leftover fruit in smoothies).'),
  leftovers=('Spoon over yogurt or oatmeal.', None),
  kids='Cut grapes lengthwise into quarters for children under 4; whole grapes are a choking risk.',
  swaps={},
  prep_day=dict(ahead='Wash and cut fruit.', station='none', oven_f=None, active=15, keeps_days=2),
  pairs=[])

# ---------------- Snacks ----------------
R(id='no-bake-oat-bites', name='No-Bake Oat Energy Bites', emoji='🍪', servings=12, serving_size='2 bites',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'freezer-friendly', 'kid-friendly', 'lunchbox'],
  prep=15, cook=0, inactive=30, equipment=['mixing bowl', 'baking sheet', 'wax paper'],
  summary='Oats, peanut butter and a few chocolate chips rolled into bite-size balls.',
  ingredients='''
Bites:
1 1/2 cup rolled-oats
1/2 cup peanut-butter | or sunflower seed butter
1/3 cup honey
2 tbsp flaxseed
1/3 cup chocolate-chips
1 tsp vanilla
1/8 tsp salt
''',
  steps=[
    'Stir everything together in a bowl until evenly mixed. If too sticky, chill 15 minutes.',
    'Roll into 24 balls about 1 inch across and set on wax paper.',
    'Chill at least 30 minutes to firm up.',
  ],
  safety=[],
  make_ahead='Keeps 1 week in the fridge in a covered container.',
  freezer=(True, 'Freeze up to 3 months.'),
  leftovers=None,
  kids='Kids love to roll these. Contains honey, so not for babies under 12 months.',
  swaps={'gluten_free': 'Use oats labeled gluten-free.', 'dairy_free': 'Use dairy-free chocolate chips.'},
  prep_day=dict(ahead='Roll a batch for the week.', station='none', oven_f=None, active=15, keeps_days=7),
  pairs=[])
