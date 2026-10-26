# Meal Prep recipes, part B: more dinners. Same format as recipes_a.py.
from recipes_a import R, T_GROUND, T_GROUND_PORK, T_GROUND_TURKEY, T_POULTRY, T_WHOLE_CUT, T_FISH, T_EGGS, T_CASSEROLE, T_LEFTOVERS

R(id='shepherds-pie', name="Shepherd's Pie", emoji='🥧', servings=6, serving_size='about 1 1/2 cups',
  meal=['dinner'], protein='beef', method=['oven', 'stovetop'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly', 'leftovers'],
  prep=25, cook=45, equipment=['large pot', 'large oven-safe skillet or 9-by-13-inch dish', 'potato masher'],
  summary='Savory beef and vegetables under a mashed-potato crust. Made with beef it is often called cottage pie; use ground lamb for the classic.',
  ingredients='''
Potato topping:
2 1/2 lb russet-potato | peeled and cut in chunks
4 tbsp butter
1/2 cup whole-milk
3/4 tsp salt
Filling:
1 tbsp vegetable-oil
1 1/2 lb ground-beef-85 | or ground lamb
1 each onion | chopped
2 each carrot | diced
2 clove garlic | minced
2 tbsp tomato-paste
2 tbsp flour
1 cup beef-broth
1 tbsp worcestershire
1 tsp thyme-dried
1/2 tsp salt
1/4 tsp black-pepper
1 cup frozen-peas
1 cup frozen-corn
?1/2 cup cheddar
''',
  steps=[
    'Cover the potatoes with cold salted water in a large pot, bring to a boil and cook 15 minutes, until very tender. Drain and mash with the butter, milk and salt.',
    'Meanwhile, heat the oven to 400°F. Heat the oil in a large oven-safe skillet over medium-high heat. Cook the beef, onion and carrots, breaking up the meat, until no pink remains and the beef reaches 160°F, about 8 minutes. Spoon off extra fat. Add the garlic for 1 minute.',
    'Stir in the tomato paste and flour and cook 1 minute. Add the broth, Worcestershire, thyme, salt and pepper and simmer 5 minutes, until thick. Stir in the peas and corn. (Move to a baking dish if your skillet is not oven-safe.)',
    'Spread the mashed potatoes over the filling to the edges and rough up the top with a fork. Sprinkle with cheese if you like.',
    'Bake 20 to 25 minutes, until bubbling at the edges, golden on top and 165°F in the center.',
  ],
  safety=[T_GROUND, T_CASSEROLE],
  make_ahead='Assemble, cool, cover and refrigerate up to 1 day. Bake about 15 minutes longer, until 165°F in the center.',
  freezer=(True, 'Freeze assembled and unbaked, well wrapped, for 2 to 3 months for best quality. Thaw in the fridge before baking.'),
  leftovers=('Reheat portions covered to 165°F for lunch.', 'lunch'),
  kids='Kids can help spread and swirl the potatoes.',
  swaps={'gluten_free': 'Thicken with 1 tablespoon cornstarch mixed with 2 tablespoons cold water instead of flour; check the Worcestershire and broth labels.',
         'dairy_free': 'Mash the potatoes with olive oil and some of their cooking water; skip the cheese.',
         'meatless': 'Use 2 cans drained lentils and 8 ounces chopped mushrooms instead of beef, with vegetable broth.'},
  prep_day=dict(ahead='Make the filling and mashed potatoes; assemble and refrigerate.', station='stove', oven_f=400, active=35, keeps_days=3),
  pairs=['green-salad'])

R(id='beef-stew', name='Hearty Beef Stew', emoji='🍲', servings=6, serving_size='about 1 1/2 cups',
  meal=['dinner'], protein='beef', method=['one-pot', 'stovetop', 'slow-cooker'], tags=['freezer-friendly', 'make-ahead', 'leftovers'],
  prep=25, cook=150, equipment=['Dutch oven or large heavy pot (or slow cooker)', 'tongs'],
  summary='Chunks of beef simmered with potatoes and carrots until spoon-tender.',
  ingredients='''
Stew:
2 lb stew-beef | cut in 1 1/2-inch pieces
1 1/2 tsp salt
1/2 tsp black-pepper
3 tbsp flour
3 tbsp vegetable-oil
1 each onion | chopped
3 clove garlic | minced
2 tbsp tomato-paste
4 cup beef-broth
1 tbsp worcestershire
1 tsp thyme-dried
=2 leaf bay-leaves
1 1/2 lb yukon-potato | cut in 1-inch chunks
4 each carrot | cut in 1-inch pieces
2 stalk celery | sliced
1 cup frozen-peas
''',
  steps=[
    'Pat the beef dry, season with the salt and pepper, and toss with the flour.',
    'Heat 2 tablespoons oil in a Dutch oven over medium-high heat. Brown the beef in two batches, 5 to 6 minutes per batch, adding the last of the oil as needed. Move to a plate.',
    'Lower the heat to medium. Cook the onion 4 minutes, then the garlic and tomato paste for 1 minute.',
    'Add the broth, Worcestershire, thyme and bay leaves, scraping up the browned bits. Return the beef. Bring to a boil, then cover and simmer gently 1 1/2 hours.',
    'Add the potatoes, carrots and celery and simmer covered 30 to 40 minutes more, until the beef and vegetables are tender. (Beef is safe at 145°F; stew meat needs this long, gentle simmer to turn tender.) Stir in the peas for the last 5 minutes. Remove the bay leaves.',
    'Slow cooker: after browning, put everything except the peas in the cooker and cook on low 8 hours. Stir in the peas at the end.',
  ],
  safety=[T_WHOLE_CUT],
  make_ahead='Stew is even better the next day. Refrigerate up to 4 days; reheat to 165°F.',
  freezer=(True, 'Freeze for 2 to 3 months for best quality. Potatoes soften a little after freezing.'),
  leftovers=('Pack in a preheated insulated food jar for lunch; reheat to 165°F first.', 'lunch'),
  kids='Cut the meat and vegetables a little smaller for young children.',
  swaps={'gluten_free': 'Toss the beef in 2 tablespoons cornstarch instead of flour; check the broth and Worcestershire labels.'},
  prep_day=dict(ahead='Cook the stew start to finish; it reheats well all week.', station='stove', oven_f=None, active=35, keeps_days=4),
  pairs=['cornbread-muffins', 'green-salad'])

R(id='chicken-pot-pie', name='Chicken Pot Pie', emoji='🥧', servings=6, serving_size='1 wedge',
  meal=['dinner'], protein='chicken', method=['oven', 'stovetop'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly', 'leftovers'],
  prep=25, cook=35, inactive=10, equipment=['large saucepan', '9-inch deep-dish pie plate', 'baking sheet'],
  summary='Creamy chicken and vegetables under a flaky crust. Uses leftover or rotisserie chicken.',
  ingredients='''
Filling:
4 tbsp butter
1 each onion | chopped
2 stalk celery | sliced
1/3 cup flour
1 1/2 cup chicken-broth
3/4 cup whole-milk
1/2 tsp thyme-dried
1/2 tsp salt
1/4 tsp black-pepper
3 cup rotisserie-chicken | shredded or diced
2 cup frozen-peas-carrots
Crust:
2 sheet pie-crust
1 each eggs | beaten, for brushing
''',
  steps=[
    'Heat the oven to 400°F with a baking sheet on the lower rack to catch drips.',
    'Melt the butter in a large saucepan over medium heat. Cook the onion and celery 5 minutes. Stir in the flour and cook 1 minute.',
    'Slowly whisk in the broth, then the milk. Simmer, stirring, until thick, about 3 minutes. Add the thyme, salt, pepper, chicken and peas and carrots.',
    'Line the pie plate with one crust, pour in the filling and top with the second crust. Pinch the edges to seal, cut 4 small slits in the top and brush with the egg.',
    'Bake 30 to 35 minutes, until the crust is deep golden and the filling bubbles and reaches 165°F. Let it rest 10 minutes before cutting.',
  ],
  safety=[T_POULTRY, T_CASSEROLE],
  make_ahead='Make the filling up to 2 days ahead and refrigerate. Assemble with cold filling and add 10 minutes to the baking time.',
  freezer=(True, 'Freeze unbaked, well wrapped, for 2 to 3 months for best quality. Bake from frozen at 400°F for about 60 to 70 minutes (cover the edges with foil if they brown too fast) until 165°F in the center.'),
  leftovers=('Reheat wedges in the oven or microwave to 165°F.', 'lunch'),
  kids='Kids can cut shapes from crust scraps to decorate the top.',
  swaps={'gluten_free': 'Use a gluten-free crust and thicken with 3 tablespoons cornstarch mixed into the cold milk.',
         'meatless': 'Use 3 cups mixed vegetables and 1 can drained white beans instead of chicken, with vegetable broth.'},
  prep_day=dict(ahead='Make the filling; assemble on the night you bake.', station='stove', oven_f=400, active=25, keeps_days=2),
  pairs=['green-salad'])

R(id='mac-and-cheese', name='Stovetop Mac and Cheese', emoji='🧀', servings=6, serving_size='about 1 cup',
  meal=['dinner', 'lunch', 'side'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['kid-friendly', 'quick', 'budget'],
  prep=5, cook=20, equipment=['large pot', 'colander', 'whisk'],
  summary='A smooth, creamy cheese sauce made in the same pot as the pasta.',
  ingredients='''
Pasta:
1 lb elbow-macaroni
^1 tbsp salt | for the pasta water (most is poured off, so it is left out of nutrition)
Sauce:
3 tbsp butter
3 tbsp flour
2 1/2 cup whole-milk
1/2 tsp ground-mustard
1/4 tsp garlic-powder
1/2 tsp salt
3 cup cheddar
''',
  steps=[
    'Cook the macaroni in a large pot of boiling salted water until just tender. Drain and set aside.',
    'In the same pot, melt the butter over medium heat. Whisk in the flour and cook 1 minute.',
    'Slowly whisk in the milk. Cook, whisking, until it thickens and coats a spoon, 4 to 5 minutes. Stir in the mustard, garlic powder and salt.',
    'Take the pot off the heat and stir in the cheese a handful at a time until smooth. Add the macaroni and stir to coat.',
  ],
  safety=[],
  make_ahead='Best fresh. To reheat, add a splash of milk and warm gently, stirring, until hot (165°F).',
  freezer=(True, 'Freeze portions for up to 2 months for best quality; the sauce may separate a little, so stir in milk while reheating.'),
  leftovers=('Spoon into a preheated insulated food jar for lunch.', 'lunch'),
  kids='Stir in a cup of frozen peas or steamed broccoli with the pasta for extra vegetables.',
  swaps={'gluten_free': 'Use gluten-free pasta and thicken with 2 tablespoons cornstarch whisked into the cold milk instead of flour.'},
  prep_day=dict(ahead='Shred the cheese.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=['green-beans', 'roasted-vegetables'])

R(id='sloppy-joes', name='Sloppy Joes', emoji='🥪', servings=6, serving_size='1 sandwich',
  meal=['dinner', 'lunch'], protein='beef', method=['stovetop', 'one-pot'], tags=['kid-friendly', 'quick', 'budget', 'freezer-friendly'],
  prep=10, cook=20, equipment=['large skillet'],
  summary='Sweet and tangy saucy beef on soft buns, from pantry staples.',
  ingredients='''
Filling:
1 1/2 lb ground-beef-85
1 each onion | finely chopped
1/2 each green-bell-pepper | finely chopped
2 clove garlic | minced
1 small-can tomato-sauce
1/3 cup ketchup
1 tbsp brown-sugar
1 tbsp worcestershire
1 tsp yellow-mustard
1/2 tsp chili-powder
1/2 tsp salt
1/4 tsp black-pepper
To serve:
6 each hamburger-buns
?6 each dill-pickles | sliced
''',
  steps=[
    'Cook the beef, onion and pepper in a large skillet over medium-high heat, breaking up the meat, until no pink remains and the beef reaches 160°F, about 8 minutes. Spoon off extra fat. Add the garlic for 1 minute.',
    'Stir in the tomato sauce, ketchup, brown sugar, Worcestershire, mustard, chili powder, salt and pepper. Simmer 10 minutes, until thick.',
    'Spoon onto toasted buns.',
  ],
  safety=[T_GROUND],
  make_ahead='The filling keeps 3 to 4 days in the fridge; reheat to 165°F.',
  freezer=(True, 'Freeze the filling for 2 to 3 months for best quality.'),
  leftovers=('Spoon leftover filling over baked potatoes or into a quesadilla.', 'lunch'),
  kids='Serve open-faced with a fork for neater eating.',
  swaps={'gluten_free': 'Use gluten-free buns and Worcestershire.', 'meatless': 'Use 2 cans drained lentils in place of the beef.'},
  prep_day=dict(ahead='Cook the filling.', station='stove', oven_f=None, active=15, keeps_days=4),
  pairs=['corn-on-the-cob', 'coleslaw'])

R(id='bbq-pulled-pork', name='Slow Cooker BBQ Pulled Pork', emoji='🐖', servings=10, serving_size='about 1/2 cup meat',
  meal=['dinner', 'lunch'], protein='pork', method=['slow-cooker'], tags=['freezer-friendly', 'make-ahead', 'leftovers', 'budget'],
  prep=15, cook=480, equipment=['slow cooker (6-quart)', 'two forks'],
  summary='Pork shoulder cooked low and slow, shredded and tossed with barbecue sauce. Feeds a crowd or a week of lunches.',
  ingredients='''
Rub:
1 tbsp brown-sugar
2 tsp paprika
1 tsp garlic-powder
1 tsp onion-powder
1 tsp chili-powder
2 tsp salt
1/2 tsp black-pepper
Pork:
4 lb pork-shoulder | boneless, trimmed
1 each onion | sliced
1/2 cup chicken-broth
2 tbsp cider-vinegar
1 1/2 cup bbq-sauce
To serve:
10 each hamburger-buns
?3 cup coleslaw-mix
''',
  steps=[
    'Mix the rub ingredients and rub all over the pork.',
    'Lay the onion in the slow cooker, set the pork on top, and pour the broth and vinegar around it.',
    'Cover and cook on low 8 to 10 hours (or high 5 to 6), until the pork pulls apart easily with a fork. It is safe at 145°F, but shoulder needs long cooking to become tender enough to shred.',
    'Lift out the pork, shred it with two forks and discard any large pieces of fat. Skim the fat from the juices.',
    'Return the meat to the cooker with 1 cup of the juices and the barbecue sauce. Stir and keep warm. Serve on buns with coleslaw.',
  ],
  safety=[T_WHOLE_CUT],
  make_ahead='Cook up to 4 days ahead; reheat to 165°F with a splash of the juices.',
  freezer=(True, 'Freeze shredded pork with some juices for 2 to 3 months for best quality.'),
  leftovers=('Use in quesadillas, over baked potatoes, or on rice bowls; reheat to 165°F.', 'lunch'),
  kids='Toss a portion with less sauce for kids who like it mild.',
  swaps={'gluten_free': 'Check the barbecue sauce and broth labels; serve on gluten-free buns or over rice.'},
  prep_day=dict(ahead='Start the slow cooker in the morning; shred and portion in the evening.', station='slow-cooker', oven_f=None, active=20, keeps_days=4),
  pairs=['coleslaw', 'corn-on-the-cob'])

R(id='sheet-pan-chicken-potatoes', name='Sheet-Pan Chicken Thighs and Potatoes', emoji='🍗', servings=4, serving_size='2 thighs with potatoes',
  meal=['dinner'], protein='chicken', method=['sheet-pan', 'oven'], tags=['kid-friendly', 'budget'],
  prep=10, cook=40, equipment=['large rimmed baking sheet', 'instant-read thermometer'],
  summary='Crispy-skinned chicken thighs roasted over potatoes and carrots on one pan.',
  ingredients='''
Sheet pan:
8 thigh chicken-thighs-bone-in | about 3 pounds
1 1/2 lb yukon-potato | cut in 1-inch chunks
4 each carrot | cut in 2-inch pieces
3 tbsp olive-oil
1 1/2 tsp salt
1/2 tsp black-pepper
1 tsp garlic-powder
1 tsp paprika
1 tsp italian-seasoning
''',
  steps=[
    'Heat the oven to 425°F. Mix the salt, pepper, garlic powder, paprika and Italian seasoning.',
    'Toss the potatoes and carrots with 2 tablespoons oil and half the seasoning and spread on the baking sheet.',
    'Pat the chicken dry (do not rinse it), rub with the rest of the oil and seasoning, and set skin side up on the vegetables. Wash your hands.',
    'Roast 35 to 45 minutes, until the skin is crisp and a thermometer in the thickest thigh, not touching bone, reads 165°F. Thighs stay juicy even if they go a bit higher.',
  ],
  safety=[T_POULTRY],
  make_ahead='Season the chicken up to 1 day ahead; cut the vegetables and keep the potatoes in water in the fridge.',
  freezer=(False, 'Freeze raw thighs instead, up to 9 months for best quality.'),
  leftovers=('Pull leftover meat for quesadillas or soup; reheat to 165°F.', 'lunch'),
  kids='Take the skin off and cut the meat from the bone for young children.',
  swaps={},
  prep_day=dict(ahead='Season the chicken and cut the vegetables.', station='oven', oven_f=425, active=10, keeps_days=1),
  pairs=['green-salad', 'green-beans'])

R(id='chicken-fajitas', name='Sheet-Pan Chicken Fajitas', emoji='🫑', servings=4, serving_size='2 to 3 fajitas',
  meal=['dinner'], protein='chicken', method=['sheet-pan', 'oven'], tags=['quick', 'kid-friendly'],
  prep=15, cook=20, equipment=['large rimmed baking sheet', 'large bowl'],
  summary='Sliced chicken, peppers and onions roasted with a smoky spice mix and wrapped in warm tortillas.',
  ingredients='''
Fajitas:
1 1/2 lb chicken-breast | sliced in thin strips
3 each red-bell-pepper | or mixed colors, sliced
1 each onion | sliced
3 tbsp vegetable-oil
2 tsp chili-powder
1 tsp cumin
1 tsp paprika
1/2 tsp garlic-powder
1 tsp salt
1 tbsp lime-juice
To serve:
8 each flour-tortillas
?1/2 cup sour-cream
?1/2 cup salsa
?1 each avocado | sliced
?1 cup mexican-cheese
''',
  steps=[
    'Heat the oven to 425°F. Mix the chili powder, cumin, paprika, garlic powder and salt.',
    'In a large bowl toss the chicken, peppers and onion with the oil and spices. Spread in one layer on the baking sheet (use two pans if crowded). Wash your hands and the bowl.',
    'Roast 18 to 22 minutes, stirring once, until the vegetables are tender and the chicken is no longer pink inside and reaches 165°F.',
    'Sprinkle with lime juice. Serve in warm tortillas with toppings.',
  ],
  safety=[T_POULTRY],
  make_ahead='Slice the vegetables and store them separately from the raw chicken up to 2 days ahead.',
  freezer=(False, 'Freeze the raw chicken strips in the spice mix (in a bag) for up to 9 months for best quality; thaw in the fridge.'),
  leftovers=('Roll leftovers into a wrap or toss onto rice for lunch; reheat to 165°F.', 'lunch'),
  kids='Let kids choose their own fillings; mild seasoning works for most.',
  swaps={'gluten_free': 'Use corn tortillas.', 'dairy_free': 'Skip the sour cream and cheese.',
         'meatless': 'Use 2 cans drained black beans and 8 ounces sliced mushrooms instead of chicken.'},
  prep_day=dict(ahead='Slice the peppers and onions; mix the spices.', station='oven', oven_f=425, active=15, keeps_days=2),
  pairs=['white-rice', 'fruit-salad'])

R(id='lentil-vegetable-soup', name='Lentil Vegetable Soup', emoji='🥣', servings=6, serving_size='about 1 1/2 cups',
  meal=['dinner', 'lunch'], protein='vegetarian', method=['one-pot', 'stovetop'], tags=['budget', 'freezer-friendly', 'make-ahead'],
  prep=15, cook=40, equipment=['large pot'],
  summary='A thick, filling soup of lentils, carrots and tomatoes. Inexpensive and freezes well.',
  ingredients='''
Soup:
2 tbsp olive-oil
1 each onion | chopped
2 each carrot | diced
2 stalk celery | diced
3 clove garlic | minced
1 tsp cumin
1 tsp thyme-dried
1 1/2 cup lentils | rinsed
1 can diced-tomatoes
6 cup vegetable-broth
=1 leaf bay-leaves
1 tsp salt
1/4 tsp black-pepper
3 cup spinach
1 tbsp lemon-juice
''',
  steps=[
    'Heat the oil in a large pot over medium heat. Cook the onion, carrots and celery 6 to 8 minutes, until soft. Add the garlic, cumin and thyme for 1 minute.',
    'Add the lentils, tomatoes, broth, bay leaf, salt and pepper. Bring to a boil, then lower the heat, partly cover and simmer 25 to 30 minutes, until the lentils are tender.',
    'Remove the bay leaf. Stir in the spinach until wilted and add the lemon juice. Taste for salt.',
  ],
  safety=[],
  make_ahead='Keeps 4 to 5 days in the fridge; it thickens, so add water when reheating to 165°F.',
  freezer=(True, 'Freeze for 2 to 3 months for best quality.'),
  leftovers=('Pack for lunch in a preheated insulated food jar.', 'lunch'),
  kids='Blend part of the soup for a smoother texture, and serve with crackers or toast for dipping.',
  swaps={'gluten_free': 'Check the broth label.'},
  prep_day=dict(ahead='Cook the soup.', station='stove', oven_f=None, active=15, keeps_days=4),
  pairs=['grilled-cheese-tomato-soup', 'cornbread-muffins'])

R(id='sheet-pan-pizza', name='Sheet-Pan Pizza Night', emoji='🍕', servings=6, serving_size='2 squares',
  meal=['dinner'], protein='pork', method=['sheet-pan', 'oven'], tags=['kid-friendly', 'budget'],
  prep=20, cook=20, inactive=30, equipment=['large rimmed baking sheet'],
  summary='One big pizza on a baking sheet, with half plain cheese and half toppings so everyone is happy.',
  ingredients='''
Crust:
2 each frozen-pizza-dough | 1-pound balls, thawed
2 tbsp olive-oil
Toppings:
1 1/2 cup marinara
1 tsp italian-seasoning
3 cup mozzarella
3 oz pepperoni
?1 cup mushrooms | sliced
?1/2 each green-bell-pepper | sliced
?2 tbsp parmesan
''',
  steps=[
    'Let the thawed dough sit covered at room temperature 30 minutes so it stretches easily (or thaw in the fridge overnight, then do this).',
    'Heat the oven to 450°F. Oil the baking sheet with 1 tablespoon oil. Press and stretch the dough to fill the pan; if it springs back, rest it 5 minutes and try again. Brush with the remaining oil.',
    'Spread the sauce to within 1/2 inch of the edges and sprinkle with Italian seasoning, then mozzarella. Add toppings to half or all.',
    'Bake on the lowest rack 15 to 20 minutes, until the crust is golden underneath and the cheese bubbles. Cool 5 minutes and cut into squares.',
  ],
  safety=[],
  make_ahead='Shred the cheese and slice toppings the day before.',
  freezer=(True, 'Freeze baked squares for 1 to 2 months for best quality; reheat at 400°F until hot.'),
  leftovers=('Cold pizza goes in lunchboxes with an ice pack, or reheat in a skillet.', 'lunch'),
  kids='Give each child a corner to top themselves.',
  swaps={'gluten_free': 'Use two gluten-free pizza crusts and bake as their package says.', 'meatless': 'Skip the pepperoni and add more vegetables.',
         'dairy_free': 'Use a dairy-free shredded cheese.'},
  prep_day=dict(ahead='Move the dough to the fridge to thaw; prep toppings.', station='oven', oven_f=450, active=20, keeps_days=1),
  pairs=['green-salad'])

R(id='fish-tacos', name='Crispy Baked Fish Tacos', emoji='🐟', servings=4, serving_size='2 to 3 tacos',
  meal=['dinner'], protein='fish', method=['oven', 'sheet-pan'], tags=['quick', 'kid-friendly'],
  prep=15, cook=15, equipment=['rimmed baking sheet', '3 shallow dishes', 'instant-read thermometer'],
  summary='Panko-coated white fish baked until crisp, with a quick lime slaw.',
  ingredients='''
Fish:
1 1/2 lb cod | or tilapia, cut in strips
1/2 cup flour
2 each eggs
1 1/2 cup panko
1 tsp chili-powder
1/2 tsp garlic-powder
3/4 tsp salt
2 tbsp vegetable-oil
Lime slaw:
3 cup coleslaw-mix
2 tbsp mayonnaise
1 tbsp lime-juice
1/4 tsp salt
To serve:
8 each corn-tortillas
?1 each avocado | sliced
?1/4 cup cilantro
''',
  steps=[
    'Heat the oven to 425°F and oil the baking sheet.',
    'Put the flour in one dish, beat the eggs in another, and mix the panko with chili powder, garlic powder and salt in the third. Pat the fish dry, coat in flour, dip in egg, and press into the panko. Set on the pan and drizzle with the oil. Wash your hands.',
    'Bake 12 to 15 minutes, turning once, until golden and the fish flakes easily and reaches 145°F.',
    'Meanwhile, toss the slaw ingredients together.',
    'Fill warm tortillas with fish, slaw and toppings.',
  ],
  safety=[T_FISH],
  make_ahead='Mix the slaw dressing ahead; toss with the cabbage just before serving.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Reheat leftover fish in the oven to 165°F so it stays crisp.', None),
  kids='Serve the crispy fish as fish sticks with ketchup or tartar-style dip.',
  swaps={'gluten_free': 'Use gluten-free panko and rice flour.', 'dairy_free': 'This recipe is dairy-free as written.'},
  prep_day=dict(ahead='Thaw fish in the fridge; mix the slaw dressing.', station='oven', oven_f=425, active=15, keeps_days=1),
  pairs=['white-rice', 'coleslaw'])

R(id='turkey-taco-rice-bowls', name='Turkey Taco Rice Bowls', emoji='🥗', servings=4, serving_size='1 bowl',
  meal=['dinner', 'lunch'], protein='turkey', method=['stovetop'], tags=['quick', 'make-ahead', 'lunchbox'],
  prep=10, cook=20, equipment=['large skillet', 'saucepan'],
  summary='Seasoned ground turkey, rice, beans and corn in a bowl. Packs well for lunches.',
  ingredients='''
Turkey:
1 tbsp vegetable-oil
1 lb ground-turkey
1/2 each onion | chopped
1 tbsp chili-powder
1 tsp cumin
1/2 tsp garlic-powder
1/2 tsp salt
1/2 cup tomato-sauce
Bowls:
1 cup white-rice | cooked (makes about 3 cups)
1 can black-beans | drained and rinsed, warmed
1 cup frozen-corn | thawed
1 cup cherry-tomatoes | halved
1 cup cheddar
?1/2 cup salsa
?1/2 cup sour-cream
''',
  steps=[
    'Cook the rice (see Fluffy White Rice).',
    'Heat the oil in a skillet over medium-high heat. Cook the turkey and onion, breaking up the meat, until no pink remains and the turkey reaches 165°F, about 8 minutes.',
    'Stir in the spices and salt for 1 minute, then the tomato sauce. Simmer 3 minutes.',
    'Fill bowls with rice, turkey, beans, corn, tomatoes and cheese. Top with salsa and sour cream.',
  ],
  safety=[T_GROUND_TURKEY],
  make_ahead='Pack the turkey, rice, beans and corn in containers for up to 4 days; add the cold toppings when serving.',
  freezer=(True, 'Freeze the cooked turkey filling for 2 to 3 months for best quality.'),
  leftovers=('Reheat the turkey, rice and beans to 165°F, then add the cold toppings.', 'lunch'),
  kids='Serve the parts in separate piles on the plate.',
  swaps={'gluten_free': 'Check the chili powder label.', 'dairy_free': 'Skip the cheese and sour cream.',
         'meatless': 'Use a second can of beans instead of turkey.'},
  prep_day=dict(ahead='Cook the rice and the turkey; pack bowls for lunches.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=[])
