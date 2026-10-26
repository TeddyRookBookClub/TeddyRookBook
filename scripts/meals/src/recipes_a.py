# Meal Prep recipes, part A: dinners. Original wording for Teddy Rook Book.
# Ingredient lines: "[?~=^]amount unit item-id | prep note"   ? optional, ~ to taste, = fixed (does not scale), ^ not eaten (cooking water salt), left out of nutrition
# A line ending in ":" starts an ingredient group.

T_GROUND = ('ground beef', 160, 0)
T_GROUND_PORK = ('ground pork or pork sausage', 160, 0)
T_GROUND_TURKEY = ('ground turkey or chicken', 165, 0)
T_POULTRY = ('chicken', 165, 0)
T_WHOLE_CUT = ('beef, pork or lamb steaks, chops and roasts', 145, 3)
T_FISH = ('fish', 145, 0)
T_EGGS = ('egg dishes', 160, 0)
T_CASSEROLE = ('casseroles', 165, 0)
T_LEFTOVERS = ('leftovers, reheated', 165, 0)

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


R(id='classic-burgers', name='Classic Cheeseburgers', emoji='🍔', servings=4, serving_size='1 burger',
  meal=['dinner', 'lunch'], protein='beef', method=['grill', 'stovetop'], tags=['kid-friendly', 'quick', 'budget'],
  prep=10, cook=12, equipment=['grill or large heavy skillet', 'instant-read thermometer', 'spatula'],
  summary='Juicy, simply seasoned burgers that cook on the grill or in a skillet in about 12 minutes.',
  ingredients='''
Burgers:
1 1/2 lb ground-beef-80
1 tsp salt
1/2 tsp black-pepper
1/2 tsp garlic-powder
To serve:
4 each hamburger-buns
4 slice american-cheese
4 leaf green-leaf-lettuce
1 each tomato | sliced
?1/2 each red-onion | thinly sliced
?1/4 cup ketchup
?2 tbsp yellow-mustard
?8 each dill-pickles | sliced
''',
  steps=[
    'Divide the beef into 4 equal portions and shape each into a patty about 3/4 inch thick and a little wider than the buns. Press a shallow dimple into the center of each so it stays flat as it cooks. Handle the meat gently.',
    'Wash your hands after shaping. Season both sides of the patties with the salt, pepper and garlic powder.',
    'Heat the grill or a heavy skillet over medium-high heat. Cook the patties 4 to 5 minutes per side, flipping once, until an instant-read thermometer in the center reads 160°F.',
    'Lay a slice of cheese on each patty for the last minute; cover so it melts.',
    'Toast the buns cut side down for 30 to 60 seconds. Move the cooked burgers to a clean plate, not the one that held the raw patties.',
    'Build the burgers with lettuce, tomato and your choice of toppings.',
  ],
  safety=[T_GROUND],
  make_ahead='Shape the patties up to 1 day ahead. Stack them with wax paper between and keep covered in the fridge.',
  freezer=(True, 'Freeze raw patties with wax paper between them for 3 to 4 months for best quality. Thaw overnight in the fridge, or cook from frozen and add a few minutes per side.'),
  leftovers=('Chop a leftover patty into a quesadilla or over a salad; reheat to 165°F.', 'lunch'),
  kids='Make a few small slider patties (about 2 ounces each) for little hands. They cook in about 3 minutes per side, still to 160°F.',
  swaps={'gluten_free': 'Use gluten-free buns or wrap the burgers in lettuce leaves.', 'dairy_free': 'Leave off the cheese.',
         'meatless': 'Cook store-bought veggie patties by the package directions and use the same toppings.'},
  prep_day=dict(ahead='Shape and season the patties; slice the tomato and onion.', station='none', oven_f=None, active=10, keeps_days=1),
  pairs=['corn-on-the-cob', 'green-salad', 'roasted-potatoes'])

R(id='beef-tacos', name='Ground Beef Tacos', emoji='🌮', servings=4, serving_size='2 to 3 tacos',
  meal=['dinner'], protein='beef', method=['stovetop'], tags=['kid-friendly', 'quick', 'budget'],
  prep=10, cook=15, equipment=['large skillet', 'wooden spoon'],
  summary='Taco night with a homemade seasoning mix, so you know exactly what is in it.',
  ingredients='''
Filling:
1 lb ground-beef-85
1/2 each onion | finely chopped
1 tbsp chili-powder
1 tsp cumin
1/2 tsp paprika
1/2 tsp garlic-powder
1/2 tsp oregano
3/4 tsp salt
1/4 tsp black-pepper
1/2 cup tomato-sauce
1/4 cup water
To serve:
10 each corn-tortillas | or hard taco shells
1 cup cheddar
2 cup iceberg | shredded
1 each tomato | diced
?1/2 cup sour-cream
?1/2 cup salsa
?1 each avocado | sliced
?1 each lime | cut in wedges
''',
  steps=[
    'Cook the beef and onion in a large skillet over medium-high heat, breaking up the meat, until no pink remains and the beef reaches 160°F, about 7 minutes. Spoon off extra fat if there is a lot.',
    'Stir in the chili powder, cumin, paprika, garlic powder, oregano, salt and pepper and cook 1 minute, until fragrant.',
    'Add the tomato sauce and water. Simmer 4 to 5 minutes, stirring now and then, until thick enough to hold on a spoon.',
    'Warm the tortillas: wrap in a damp paper towel and microwave 30 to 45 seconds, or heat one at a time in a dry skillet.',
    'Set out the filling and toppings so everyone can build their own.',
  ],
  safety=[T_GROUND],
  make_ahead='Cook the filling up to 3 days ahead and keep it in the fridge. Reheat to 165°F, adding a splash of water.',
  freezer=(True, 'Freeze the cooked filling flat in a freezer bag for 2 to 3 months for best quality. Thaw in the fridge overnight.'),
  leftovers=('Use leftover filling for taco salad, nachos or quesadillas the next day.', 'lunch'),
  kids='Set up a build-your-own bar. Younger children often like the meat, cheese and tortilla separate on the plate.',
  swaps={'gluten_free': 'Corn tortillas and this homemade seasoning are naturally free of wheat; check labels on the tortillas.',
         'dairy_free': 'Skip the cheese and sour cream; add extra avocado.',
         'meatless': 'Use 2 cans of black or pinto beans, drained and lightly mashed, in place of the beef. Skip the browning step.'},
  prep_day=dict(ahead='Cook the taco filling; shred the lettuce and dice the tomato.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=['white-rice'])

R(id='lasagna', name='Classic Meat Lasagna', emoji='🍝', servings=8, serving_size='1 square (about 3 by 4 inches)',
  meal=['dinner'], protein='beef', method=['oven'], tags=['freezer-friendly', 'make-ahead', 'leftovers', 'kid-friendly'],
  prep=35, cook=60, inactive=15, equipment=['9-by-13-inch baking dish', 'large pot', 'large skillet', 'mixing bowl', 'aluminum foil'],
  summary='Layers of meat sauce, ricotta and mozzarella. Make it on the weekend; it reheats beautifully.',
  ingredients='''
Meat sauce:
1 lb ground-beef-85
1/2 lb italian-sausage | casings removed
1 each onion | chopped
3 clove garlic | minced
1 can crushed-tomatoes
1 small-can tomato-sauce
2 tbsp tomato-paste
1 tsp italian-seasoning
1 tsp sugar
1/2 tsp salt
1/4 tsp black-pepper
Cheese filling:
15 oz ricotta
1 each eggs
1/2 cup parmesan
2 tbsp parsley | chopped, or 2 teaspoons dried
Layers:
12 sheet lasagna-noodles
16 oz mozzarella
1/4 cup parmesan
''',
  steps=[
    'Heat the oven to 375°F. Bring a large pot of salted water to a boil and cook the noodles 2 minutes less than the package says. Drain and lay them flat on an oiled baking sheet so they do not stick.',
    'Meanwhile, cook the beef, sausage and onion in a large skillet over medium-high heat, breaking up the meat, until no pink remains and the meat reaches 160°F, 8 to 10 minutes. Spoon off extra fat. Add the garlic and cook 1 minute.',
    'Stir in the crushed tomatoes, tomato sauce, tomato paste, Italian seasoning, sugar, salt and pepper. Simmer 15 minutes, stirring now and then.',
    'In a bowl, mix the ricotta, egg, 1/2 cup Parmesan and parsley.',
    'Spread 1 cup of meat sauce in the baking dish. Layer 4 noodles, half the ricotta mixture, a third of the mozzarella and a third of the remaining sauce. Repeat once. Finish with the last 4 noodles, the rest of the sauce, the rest of the mozzarella and 1/4 cup Parmesan.',
    'Cover with foil (tent it or spray the underside so it does not stick to the cheese). Bake 40 minutes. Uncover and bake 15 to 20 minutes more, until bubbling and the center reaches 165°F.',
    'Let the lasagna rest 15 minutes before cutting so the layers hold together.',
  ],
  safety=[T_GROUND, T_GROUND_PORK, T_CASSEROLE],
  make_ahead='Assemble, cover tightly and refrigerate up to 1 day. Add about 15 minutes to the covered baking time, and check that the center reaches 165°F.',
  freezer=(True, 'Freeze assembled, unbaked lasagna wrapped well for 2 to 3 months for best quality. Thaw in the fridge 1 to 2 days, then bake as directed until 165°F in the center. Baked squares freeze well too.'),
  leftovers=('Squares reheat well for lunch; microwave covered until 165°F in the center.', 'lunch'),
  kids='Children who are wary of ricotta often like it once it is baked in. Cut small squares for younger kids; it holds heat, so let it cool a few minutes.',
  swaps={'gluten_free': 'Use gluten-free lasagna noodles (cook as the package says) and check the sausage label.',
         'meatless': 'Replace the meat with 1 pound chopped mushrooms and 10 ounces thawed, squeezed frozen spinach, browned in a little olive oil.'},
  prep_day=dict(ahead='Make the meat sauce and assemble the whole lasagna; refrigerate or freeze unbaked.', station='stove', oven_f=375, active=35, keeps_days=4),
  pairs=['green-salad', 'garlic-bread'])

R(id='spaghetti-meat-sauce', name='Spaghetti with Meat Sauce', emoji='🍝', servings=6, serving_size='about 1 1/2 cups',
  meal=['dinner'], protein='beef', method=['stovetop'], tags=['kid-friendly', 'budget', 'freezer-friendly', 'leftovers'],
  prep=10, cook=35, equipment=['large pot', 'large skillet or saucepan', 'colander'],
  summary='A weeknight meat sauce that simmers while the pasta cooks. Double the sauce and freeze half.',
  ingredients='''
Sauce:
1 tbsp olive-oil
1 lb ground-beef-85
1 each onion | chopped
1 each carrot | finely grated (optional, adds sweetness)
3 clove garlic | minced
1 can crushed-tomatoes
2 tbsp tomato-paste
1 1/2 tsp italian-seasoning
1 tsp sugar
3/4 tsp salt
1/4 tsp black-pepper
?1/4 tsp red-pepper-flakes
Pasta:
1 lb spaghetti
^1 tbsp salt | for the pasta water (most is poured off, so it is left out of nutrition)
To serve:
?1/2 cup parmesan
''',
  steps=[
    'Heat the oil in a large skillet over medium-high heat. Add the beef, onion and carrot and cook, breaking up the meat, until no pink remains and the beef reaches 160°F, about 8 minutes. Spoon off extra fat. Add the garlic and cook 1 minute.',
    'Stir in the crushed tomatoes, tomato paste, Italian seasoning, sugar, salt, pepper and pepper flakes. Bring to a simmer, then lower the heat and cook 20 minutes, stirring now and then.',
    'While the sauce simmers, bring a large pot of water to a boil with 1 tablespoon salt. Cook the spaghetti until tender, following the package time. Save 1/2 cup of the cooking water, then drain.',
    'Toss the pasta with about half the sauce, adding a little pasta water if it looks dry. Serve the rest of the sauce on top with Parmesan.',
  ],
  safety=[T_GROUND],
  make_ahead='The sauce keeps 3 to 4 days in the fridge. Reheat to 165°F and cook the pasta fresh.',
  freezer=(True, 'Freeze the sauce (without pasta) for 2 to 3 months for best quality.'),
  leftovers=('Leftover sauce makes quick sloppy joes or a topping for baked potatoes; reheat to 165°F.', 'lunch'),
  kids='Serve some plain buttered noodles on the side with sauce for dipping. Break the spaghetti in half before cooking for easier eating.',
  swaps={'gluten_free': 'Use gluten-free spaghetti.', 'dairy_free': 'Skip the Parmesan.',
         'meatless': 'Use 2 cups chopped mushrooms and 1 can drained lentils or white beans in place of the beef.'},
  prep_day=dict(ahead='Make a double batch of sauce; refrigerate one, freeze one.', station='stove', oven_f=None, active=15, keeps_days=4),
  pairs=['green-salad', 'garlic-bread', 'roasted-vegetables'])

R(id='pot-roast', name='Pot Roast with Carrots and Potatoes', emoji='🥩', servings=6, serving_size='about 5 ounces meat with vegetables',
  meal=['dinner'], protein='beef', method=['slow-cooker', 'oven', 'one-pot'], tags=['leftovers', 'make-ahead'],
  prep=20, cook=480, equipment=['slow cooker (6-quart) or Dutch oven', 'large skillet', 'instant-read thermometer'],
  summary='A Sunday-dinner classic you can make in the slow cooker or the oven. The leftovers make great sandwiches.',
  ingredients='''
Roast:
3 lb chuck-roast
1 1/2 tsp salt
1/2 tsp black-pepper
2 tbsp vegetable-oil
1 each onion | cut in wedges
4 clove garlic | smashed
2 tbsp tomato-paste
2 cup beef-broth
1 tbsp worcestershire
=2 sprig thyme | or 1 teaspoon dried
=2 leaf bay-leaves
Vegetables:
1 1/2 lb yukon-potato | cut in 2-inch chunks
1 lb carrot | cut in 2-inch pieces
3 stalk celery | cut in 2-inch pieces
Gravy:
2 tbsp cornstarch
2 tbsp water
''',
  steps=[
    'Pat the roast dry and season all over with the salt and pepper.',
    'Heat the oil in a large skillet (or the Dutch oven) over medium-high heat. Brown the roast well on all sides, about 10 minutes total. Browning adds flavor; you can skip it on a busy morning.',
    'Slow cooker: Put the potatoes, carrots, celery and onion in the cooker and set the roast on top. Whisk the tomato paste into the broth with the Worcestershire and pour it over. Add the garlic, thyme and bay leaves. Cover and cook on low 8 to 9 hours or high 5 to 6 hours.',
    'Oven: Heat the oven to 325°F. In the Dutch oven, add the onion, garlic, broth mixture, thyme and bay leaves around the roast. Cover and bake 2 1/2 hours. Add the vegetables and bake 1 hour more.',
    'The roast is safe at 145°F, but chuck becomes fork-tender only after long cooking, when it pulls apart easily. Lift out the meat and vegetables and remove the bay leaves.',
    'For gravy, pour the cooking liquid into a saucepan and bring to a boil. Stir the cornstarch into the water, whisk it in and simmer 1 to 2 minutes until thickened. Slice or pull the beef and serve with the vegetables and gravy.',
  ],
  safety=[T_WHOLE_CUT],
  make_ahead='Cook a day ahead; chill the meat in its liquid. Lift off the hardened fat, then reheat gently to 165°F.',
  freezer=(True, 'Freeze sliced beef in gravy for 2 to 3 months for best quality. Potatoes turn grainy when frozen, so eat those first.'),
  leftovers=('Pile leftover beef on rolls with a little gravy for hot sandwiches, or use it in beef stew or tacos; reheat to 165°F.', 'lunch'),
  kids='Shred the beef and serve with the soft carrots. Let little ones dip pieces in the gravy.',
  swaps={'gluten_free': 'Use a gluten-free Worcestershire sauce and broth (check labels); cornstarch is gluten-free.'},
  prep_day=dict(ahead='Cut the vegetables and season the roast the night before; start the slow cooker in the morning.', station='slow-cooker', oven_f=325, active=20, keeps_days=4),
  pairs=['green-beans', 'green-salad'])

R(id='roast-chicken', name='Simple Roast Chicken', emoji='🍗', servings=5, serving_size='about 5 ounces meat',
  meal=['dinner'], protein='chicken', method=['oven'], tags=['leftovers', 'budget'],
  prep=15, cook=75, inactive=15, equipment=['roasting pan or large oven-safe skillet', 'instant-read thermometer', 'kitchen twine (optional)'],
  summary='A whole chicken roasted with lemon, garlic and herbs. Leftovers become soup, salads and quesadillas.',
  ingredients='''
Chicken:
1 each whole-chicken | about 4 pounds
2 tbsp butter | softened
1 1/2 tsp salt
1/2 tsp black-pepper
1 tsp thyme-dried
1/2 tsp garlic-powder
1 each lemon | halved
4 clove garlic
1 each onion | cut in thick slices
''',
  steps=[
    'Heat the oven to 425°F. Take the chicken out of its package and remove anything in the cavity. Do not rinse the chicken; washing raw poultry spreads germs around the sink. Pat it dry with paper towels and throw them away. Wash your hands and anything the raw chicken touched.',
    'Lay the onion slices in the pan as a rack. Set the chicken on top, breast up.',
    'Mix the butter, salt, pepper, thyme and garlic powder and rub it all over the chicken. Put the lemon halves and garlic cloves inside. Tie the legs together if you like.',
    'Roast 1 hour 10 minutes to 1 hour 30 minutes, until an instant-read thermometer reads 165°F in the thickest part of the breast and the innermost part of the thigh, without touching bone.',
    'Let the chicken rest 15 minutes before carving. Spoon the pan juices over the meat.',
    'Within 2 hours, pull the meat off the leftover carcass and refrigerate it. Save the bones in the freezer for stock if you like.',
  ],
  safety=[T_POULTRY],
  make_ahead='Rub the chicken with the seasoned butter up to 1 day ahead and keep it uncovered on a plate in the fridge; the skin dries and roasts crisper.',
  freezer=(True, 'Freeze cooked, pulled chicken in portions for up to 4 months for best quality. Handy for soups, quesadillas and pot pie.'),
  leftovers=('Use leftover meat in chicken noodle soup, chicken quesadillas, Caesar salad or pot pie; reheat to 165°F.', 'lunch'),
  kids='Many kids like the drumsticks. Pull the meat off the bone for younger children.',
  swaps={'dairy_free': 'Use olive oil instead of butter.'},
  prep_day=dict(ahead='Roast a chicken (or two) and pull the meat for the week.', station='oven', oven_f=425, active=15, keeps_days=4),
  pairs=['mashed-potatoes', 'green-beans', 'roasted-vegetables'])

R(id='beef-chili', name='Family Beef and Bean Chili', emoji='🌶️', servings=8, serving_size='about 1 1/2 cups',
  meal=['dinner', 'lunch'], protein='beef', method=['one-pot', 'stovetop', 'slow-cooker'], tags=['freezer-friendly', 'make-ahead', 'budget', 'leftovers'],
  prep=15, cook=50, equipment=['large pot or Dutch oven', 'wooden spoon'],
  summary='Mild, hearty chili that feeds a crowd and freezes well. Let everyone add heat at the table.',
  ingredients='''
Chili:
1 tbsp vegetable-oil
2 lb ground-beef-85
1 each onion | chopped
1 each green-bell-pepper | chopped
4 clove garlic | minced
3 tbsp chili-powder
2 tsp cumin
1 tsp oregano
1 tsp paprika
1 1/2 tsp salt
1/2 tsp black-pepper
1 can crushed-tomatoes
1 can diced-tomatoes
2 can kidney-beans | drained and rinsed
1 can pinto-beans | drained and rinsed
1 cup beef-broth
1 tsp brown-sugar
To serve:
?1 cup cheddar
?1/2 cup sour-cream
?1/4 cup green-onions | sliced
?1 cup tortilla-chips
''',
  steps=[
    'Heat the oil in a large pot over medium-high heat. Add the beef, onion and bell pepper and cook, breaking up the meat, until no pink remains and the beef reaches 160°F, about 10 minutes. Spoon off extra fat.',
    'Add the garlic, chili powder, cumin, oregano, paprika, salt and pepper. Cook 1 minute, stirring.',
    'Stir in the crushed and diced tomatoes, beans, broth and brown sugar. Bring to a boil, then lower the heat, partly cover and simmer 30 to 40 minutes, stirring now and then, until thick.',
    'Taste and add more salt or chili powder if you like. Serve with toppings.',
    'Slow cooker: brown the beef and vegetables first (steps 1 and 2), then put everything in the cooker and cook on low 6 to 8 hours.',
  ],
  safety=[T_GROUND],
  make_ahead='Chili tastes even better the next day. Refrigerate up to 4 days and reheat to 165°F.',
  freezer=(True, 'Cool, then freeze in meal-size containers for 2 to 3 months for best quality.'),
  leftovers=('Spoon over baked potatoes or hot dogs, or fill burritos; reheat to 165°F.', 'lunch'),
  kids='Keep the pot mild and set out hot sauce for grown-ups. Kids like crushing a few tortilla chips on top.',
  swaps={'gluten_free': 'Check the chili powder and broth labels.', 'dairy_free': 'Skip the cheese and sour cream.',
         'meatless': 'Skip the beef and add 2 more cans of beans plus 1 cup frozen corn.'},
  prep_day=dict(ahead='Cook the whole pot; portion some for lunches and freeze the rest.', station='stove', oven_f=None, active=25, keeps_days=4),
  pairs=['cornbread-muffins', 'green-salad'])

R(id='chicken-stir-fry', name='Chicken and Vegetable Stir-Fry', emoji='🥢', servings=4, serving_size='about 1 1/2 cups with rice',
  meal=['dinner'], protein='chicken', method=['stovetop'], tags=['quick', 'kid-friendly'],
  prep=15, cook=12, equipment=['large skillet or wok', 'small bowl', 'whisk'],
  summary='Tender chicken and crisp vegetables in a simple soy-ginger sauce. Have the rice cooking first.',
  ingredients='''
Sauce:
1/4 cup low-sodium-soy-sauce
1/4 cup chicken-broth
1 tbsp honey
1 tbsp cornstarch
1 tsp sesame-oil
1 tbsp ginger | grated
2 clove garlic | minced
Stir-fry:
1 1/2 lb chicken-breast | cut in 1-inch pieces
2 tbsp vegetable-oil
1/4 tsp salt
3 cup broccoli | small florets
1 each red-bell-pepper | sliced
1 each carrot | thinly sliced
1 cup snap-peas
?2 each green-onions | sliced
?1 tbsp sesame-seeds
''',
  steps=[
    'Whisk all the sauce ingredients together in a small bowl.',
    'Heat 1 tablespoon oil in a large skillet or wok over high heat. Add the chicken in one layer, sprinkle with the salt, and cook without stirring 2 minutes, then stir and cook until no longer pink inside and the pieces reach 165°F, about 4 minutes more. Move the chicken to a clean plate.',
    'Add the remaining oil, the broccoli and carrot, and 2 tablespoons water. Cover and cook 2 minutes. Add the bell pepper and snap peas and stir-fry 2 minutes, until crisp-tender.',
    'Return the chicken. Stir the sauce again (the cornstarch settles), pour it in and cook, stirring, until glossy and thick, about 1 minute.',
    'Serve over rice (see Fluffy White Rice), topped with green onions and sesame seeds.',
  ],
  safety=[T_POULTRY],
  make_ahead='Cut the chicken and vegetables and mix the sauce up to 1 day ahead; keep raw chicken in its own covered container on the bottom shelf.',
  freezer=(False, 'The vegetables go soft when frozen and reheated. Freeze raw cut chicken instead.'),
  leftovers=('Pack over rice for lunch; reheat to 165°F.', 'lunch'),
  kids='Serve the sauce on the side for dipping, and let kids pick their vegetables.',
  swaps={'gluten_free': 'Use tamari labeled gluten-free instead of soy sauce, and gluten-free broth.',
         'meatless': 'Use 14 ounces firm tofu, pressed and cubed, browned in the oil.'},
  prep_day=dict(ahead='Cut the vegetables and chicken (separate containers); mix the sauce; cook the rice.', station='none', oven_f=None, active=15, keeps_days=1),
  pairs=['white-rice', 'brown-rice'])

R(id='sheet-pan-sausage-vegetables', name='Sheet-Pan Sausage and Vegetables', emoji='🌭', servings=4, serving_size='about 2 cups',
  meal=['dinner'], protein='pork', method=['sheet-pan', 'oven'], tags=['quick', 'kid-friendly'],
  prep=10, cook=25, equipment=['large rimmed baking sheet', 'large bowl'],
  summary='Smoked sausage roasted with potatoes, peppers and broccoli on one pan. Little to wash.',
  ingredients='''
Sheet pan:
14 oz smoked-sausage | sliced into coins
1 1/2 lb baby-potatoes | halved
1 each red-bell-pepper | cut in chunks
1 each onion | cut in wedges
2 cup broccoli | florets
3 tbsp olive-oil
1 tsp garlic-powder
1 tsp italian-seasoning
1/2 tsp paprika
1/2 tsp salt
1/4 tsp black-pepper
''',
  steps=[
    'Heat the oven to 425°F. Line a large rimmed baking sheet with foil or parchment.',
    'Toss the potatoes with 2 tablespoons oil and half the seasonings. Spread on the pan and roast 10 minutes.',
    'Toss the sausage, pepper, onion and broccoli with the remaining oil and seasonings. Add to the pan, spread everything in one layer, and roast 15 minutes more, until the potatoes are tender and the sausage is browned and steaming hot (165°F).',
  ],
  safety=[('fully cooked sausage, reheated', 165, 0)],
  make_ahead='Cut the vegetables and sausage up to 2 days ahead.',
  freezer=(False, 'Roasted potatoes do not freeze well.'),
  leftovers=('Chop leftovers and scramble with eggs for breakfast; reheat to 165°F.', 'lunch'),
  kids='Cut the sausage into half-moons for small children (round coins can be a choking risk).',
  swaps={'gluten_free': 'Choose a sausage labeled gluten-free.',
         'meatless': 'Use 2 cans drained chickpeas instead of sausage; add them with the vegetables.'},
  prep_day=dict(ahead='Chop everything and store the vegetables and sausage in one container.', station='oven', oven_f=425, active=10, keeps_days=2),
  pairs=['green-salad'])

R(id='meatloaf', name='Glazed Meatloaf', emoji='🍖', servings=6, serving_size='1 thick slice',
  meal=['dinner'], protein='beef', method=['oven'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly', 'leftovers', 'budget'],
  prep=15, cook=60, inactive=10, equipment=['9-by-5-inch loaf pan or rimmed baking sheet', 'mixing bowl', 'instant-read thermometer'],
  summary='Tender meatloaf with a sweet tomato glaze. Leftover slices make the best sandwiches.',
  ingredients='''
Meatloaf:
2 lb ground-beef-85
1 each onion | finely chopped
2 clove garlic | minced
2 each eggs
3/4 cup breadcrumbs
1/2 cup whole-milk
1/4 cup ketchup
1 tbsp worcestershire
1 tsp salt
1/2 tsp black-pepper
1 tsp italian-seasoning
Glaze:
1/2 cup ketchup
2 tbsp brown-sugar
1 tbsp cider-vinegar
''',
  steps=[
    'Heat the oven to 350°F. In a large bowl, stir the breadcrumbs into the milk and let them soak 5 minutes.',
    'Add the eggs, 1/4 cup ketchup, Worcestershire, salt, pepper, Italian seasoning, onion and garlic and mix well. Add the beef and mix gently with your hands just until combined. Wash your hands.',
    'Shape into a loaf about 9 by 5 inches on a lined baking sheet (it browns better than in a pan), or press into the loaf pan.',
    'Stir the glaze ingredients together and spread half over the loaf.',
    'Bake 45 minutes. Spread on the rest of the glaze and bake 10 to 20 minutes more, until a thermometer in the center reads 160°F.',
    'Rest 10 minutes before slicing.',
  ],
  safety=[T_GROUND],
  make_ahead='Shape the loaf, cover and refrigerate up to 1 day before baking; add about 10 minutes to the time.',
  freezer=(True, 'Freeze baked slices separated with wax paper for 2 to 3 months, or the raw shaped loaf for 3 to 4 months, for best quality. Thaw in the fridge.'),
  leftovers=('Cold or warmed meatloaf on bread with ketchup is a lunchbox favorite; reheat to 165°F if serving warm.', 'lunch'),
  kids='Bake some of the mixture in muffin tins (about 20 minutes, still to 160°F) for kid-size mini loaves.',
  swaps={'gluten_free': 'Use 3/4 cup quick oats labeled gluten-free instead of breadcrumbs, and gluten-free Worcestershire.',
         'dairy_free': 'Use water or unsweetened plant milk instead of milk.'},
  prep_day=dict(ahead='Mix and shape the meatloaf; refrigerate covered until baking night.', station='oven', oven_f=350, active=15, keeps_days=1),
  pairs=['mashed-potatoes', 'green-beans'])

R(id='baked-ziti', name='Cheesy Baked Ziti', emoji='🧀', servings=8, serving_size='about 1 1/2 cups',
  meal=['dinner'], protein='vegetarian', method=['oven'], tags=['freezer-friendly', 'make-ahead', 'kid-friendly', 'budget', 'leftovers'],
  prep=20, cook=30, equipment=['9-by-13-inch baking dish', 'large pot', 'colander', 'aluminum foil'],
  summary='Pasta baked in marinara with ricotta and a blanket of mozzarella. Add browned meat if you like.',
  ingredients='''
Ziti:
1 lb penne | or ziti
^1 tbsp salt | for the pasta water (most is poured off, so it is left out of nutrition)
2 jar marinara
15 oz ricotta
1 each eggs
1/2 cup parmesan
1 tsp italian-seasoning
1/4 tsp black-pepper
12 oz mozzarella
?1 lb italian-sausage | browned, if you want meat
''',
  steps=[
    'Heat the oven to 375°F. Cook the pasta in a large pot of boiling salted water for 2 minutes less than the package time. Drain.',
    'If using sausage, brown it in a skillet, breaking it up, until no pink remains and it reaches 160°F. Stir it into the sauce.',
    'In a bowl, mix the ricotta, egg, half the Parmesan, Italian seasoning and pepper.',
    'Toss the pasta with 1 1/2 jars of sauce. Spread half in the baking dish, dot with the ricotta mixture and sprinkle with half the mozzarella. Top with the rest of the pasta, the remaining sauce, mozzarella and Parmesan.',
    'Cover with foil and bake 20 minutes. Uncover and bake 10 to 15 minutes more, until bubbling and 165°F in the center.',
  ],
  safety=[T_CASSEROLE, T_GROUND_PORK],
  make_ahead='Assemble up to 1 day ahead, cover and refrigerate; add 10 to 15 minutes to the covered time and check for 165°F.',
  freezer=(True, 'Freeze unbaked in a foil pan, well wrapped, for 2 to 3 months for best quality. Thaw in the fridge and bake as directed.'),
  leftovers=('Reheat portions covered in the microwave to 165°F for lunches.', 'lunch'),
  kids='Mix a portion without ricotta for picky eaters; it bakes the same.',
  swaps={'gluten_free': 'Use gluten-free pasta and check the sauce label.',
         'dairy_free': 'Skip the ricotta and Parmesan, and use a dairy-free shredded cheese.'},
  prep_day=dict(ahead='Assemble the ziti and refrigerate or freeze it unbaked.', station='stove', oven_f=375, active=20, keeps_days=4),
  pairs=['green-salad', 'garlic-bread'])

R(id='chicken-noodle-soup', name='Chicken Noodle Soup', emoji='🍲', servings=6, serving_size='about 1 3/4 cups',
  meal=['dinner', 'lunch'], protein='chicken', method=['one-pot', 'stovetop'], tags=['freezer-friendly', 'kid-friendly', 'budget'],
  prep=15, cook=35, equipment=['large pot', 'ladle'],
  summary='A comforting pot of soup with tender chicken, carrots and egg noodles.',
  ingredients='''
Soup:
2 tbsp butter
1 each onion | chopped
3 each carrot | sliced
3 stalk celery | sliced
2 clove garlic | minced
8 cup chicken-broth
1 1/2 lb chicken-thighs | or breasts
1 tsp thyme-dried
=1 leaf bay-leaves
1/2 tsp salt
1/4 tsp black-pepper
3 cup egg-noodles
2 tbsp parsley | chopped
''',
  steps=[
    'Melt the butter in a large pot over medium heat. Add the onion, carrots and celery and cook 6 to 8 minutes, until softened. Add the garlic and cook 1 minute.',
    'Add the broth, chicken, thyme, bay leaf, salt and pepper. Bring to a boil, then lower the heat and simmer 15 to 20 minutes, until the chicken reaches 165°F.',
    'Lift out the chicken, shred it with two forks and return it to the pot. Remove the bay leaf.',
    'Bring the soup back to a boil, add the noodles and cook until tender, 6 to 8 minutes. Stir in the parsley and taste for salt.',
  ],
  safety=[T_POULTRY],
  make_ahead='Make the soup base (without noodles) up to 4 days ahead. Reheat to a boil and cook the noodles in it just before serving, so they do not go mushy.',
  freezer=(True, 'Freeze the soup without noodles for 2 to 3 months for best quality. Add fresh noodles when reheating.'),
  leftovers=('Pack hot soup in a preheated insulated food jar for school lunch: fill the jar with boiling water for a few minutes, empty it, then add soup heated to 165°F.', 'lunch'),
  kids='Use small noodles or broken spaghetti for little spoons.',
  swaps={'gluten_free': 'Use rice or gluten-free noodles and gluten-free broth.', 'dairy_free': 'Use olive oil instead of butter.',
         'meatless': 'Use vegetable broth and 2 cans drained white beans in place of the chicken.'},
  prep_day=dict(ahead='Make the soup base; cook noodles when serving.', station='stove', oven_f=None, active=20, keeps_days=4),
  pairs=['green-salad'])

R(id='grilled-cheese-tomato-soup', name='Grilled Cheese and Tomato Soup', emoji='🥪', servings=4, serving_size='1 sandwich and about 1 1/4 cups soup',
  meal=['lunch', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly', 'quick', 'budget'],
  prep=10, cook=25, equipment=['medium saucepan', 'immersion blender or blender', 'large skillet or griddle'],
  summary='A creamy tomato soup from pantry cans and golden grilled cheese for dipping.',
  ingredients='''
Tomato soup:
2 tbsp butter
1 each onion | chopped
2 clove garlic | minced
1 can crushed-tomatoes
2 cup vegetable-broth
1 tsp sugar
1/2 tsp basil-dried
1/2 tsp salt
1/4 tsp black-pepper
1/2 cup half-and-half
Grilled cheese:
8 slice white-bread
8 slice cheddar
3 tbsp butter | softened
''',
  steps=[
    'Melt 2 tablespoons butter in a saucepan over medium heat. Cook the onion 5 minutes, until soft. Add the garlic for 30 seconds.',
    'Add the tomatoes, broth, sugar, basil, salt and pepper. Simmer 15 minutes.',
    'Blend until smooth with an immersion blender (or carefully in a blender, filled no more than halfway with the lid vented). Stir in the half-and-half and warm through without boiling.',
    'Butter one side of each bread slice. Put 4 slices butter side down in a skillet over medium-low heat, add 2 slices cheese each, and top with the other bread, butter side up.',
    'Cook 3 to 4 minutes per side, until golden and the cheese melts. Cut and serve with the soup.',
  ],
  safety=[],
  make_ahead='The soup keeps 4 days in the fridge; reheat to 165°F.',
  freezer=(True, 'Freeze the soup before adding the half-and-half for 2 to 3 months for best quality; stir it in when reheating.'),
  leftovers=('Leftover soup makes a quick sauce for pasta.', None),
  kids='Cut sandwiches into strips for dipping.',
  swaps={'gluten_free': 'Use gluten-free bread and broth.',
         'dairy_free': 'Use olive oil in the soup and skip the half-and-half (or use canned coconut milk); use dairy-free cheese and spread.'},
  prep_day=dict(ahead='Make the soup.', station='stove', oven_f=None, active=10, keeps_days=4),
  pairs=['green-salad'])

R(id='breakfast-for-dinner-hash', name='Breakfast-for-Dinner Sheet-Pan Hash', emoji='🍳', servings=4, serving_size='about 1 1/2 cups with 2 eggs',
  meal=['dinner', 'breakfast'], protein='pork', method=['sheet-pan', 'oven'], tags=['kid-friendly', 'budget'],
  prep=10, cook=35, equipment=['large rimmed baking sheet', 'skillet'],
  summary='Crispy potatoes, sausage and peppers on one pan, topped with eggs. Breakfast for dinner is a weeknight win.',
  ingredients='''
Hash:
1 1/2 lb russet-potato | cut in 1/2-inch cubes
1 each green-bell-pepper | chopped
1 each onion | chopped
2 tbsp vegetable-oil
3/4 tsp salt
1/2 tsp paprika
1/4 tsp black-pepper
12 oz breakfast-sausage
Eggs:
8 each eggs
?1/2 cup cheddar
?2 tbsp green-onions | sliced
''',
  steps=[
    'Heat the oven to 425°F. Toss the potatoes, bell pepper and onion with the oil, salt, paprika and pepper on a rimmed baking sheet. Roast 25 minutes, stirring once, until browned.',
    'Meanwhile, brown the sausage in a skillet, breaking it up, until no pink remains and it reaches 160°F. Drain on a paper towel.',
    'Scatter the sausage over the potatoes. Make 8 small wells and crack an egg into each. Bake 8 to 10 minutes, until the whites are set and the yolks are firm. (USDA advises cooking eggs until the yolks and whites are firm.)',
    'Sprinkle with cheese and green onions and serve.',
  ],
  safety=[T_GROUND_PORK, T_EGGS],
  make_ahead='Cube the potatoes and keep them covered in water in the fridge up to 1 day; drain and pat dry before roasting.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Wrap leftover hash and egg in a tortilla for a breakfast burrito; reheat to 165°F.', None),
  kids='Scramble the eggs separately for kids who do not like them baked.',
  swaps={'gluten_free': 'Check the sausage label.', 'dairy_free': 'Skip the cheese.',
         'meatless': 'Skip the sausage and add 1 can drained black beans with the eggs.'},
  prep_day=dict(ahead='Cook the sausage; chop the peppers and onion.', station='oven', oven_f=425, active=15, keeps_days=3),
  pairs=['fruit-salad'])

R(id='bean-cheese-burritos', name='Freezer Bean and Cheese Burritos', emoji='🌯', servings=8, serving_size='1 burrito',
  meal=['lunch', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['freezer-friendly', 'make-ahead', 'budget', 'kid-friendly', 'lunchbox'],
  prep=20, cook=10, equipment=['large skillet', 'aluminum foil or freezer bags'],
  summary='A big batch of burritos to wrap and freeze for fast lunches and busy nights.',
  ingredients='''
Filling:
1 tbsp vegetable-oil
1/2 each onion | finely chopped
1 can refried-beans-veg
1 can black-beans | drained and rinsed
1/2 cup salsa
1 tsp cumin
1 tsp chili-powder
1/4 tsp salt
2/3 cup white-rice | cooked (makes about 2 cups)
2 cup mexican-cheese
Wrapping:
8 each large-flour-tortillas
''',
  steps=[
    'Heat the oil in a large skillet over medium heat and cook the onion 4 minutes. Stir in the refried beans, black beans, salsa, cumin, chili powder and salt and heat until steaming, 3 to 4 minutes. Let cool 10 minutes.',
    'Warm the tortillas briefly so they fold without cracking.',
    'Spread about 1/2 cup bean mixture and 1/4 cup rice down the center of each tortilla and top with 1/4 cup cheese. Fold in the sides and roll up tightly.',
    'To eat now, toast seam side down in a skillet until golden. To freeze, wrap each burrito in foil or plastic and freeze in a bag.',
    'From frozen: unwrap, wrap in a damp paper towel and microwave 2 to 3 minutes, turning halfway, until 165°F in the center. Or bake wrapped in foil at 375°F for 35 to 40 minutes.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='The filling keeps 4 days in the fridge.',
  freezer=(True, 'Freeze wrapped burritos for 2 to 3 months for best quality.'),
  leftovers=None,
  kids='Make a few smaller burritos in 8-inch tortillas for little appetites.',
  swaps={'gluten_free': 'Use large corn or gluten-free tortillas (they crack more easily; warm them well).',
         'dairy_free': 'Use a dairy-free cheese or skip it and add diced avocado when serving.'},
  prep_day=dict(ahead='Cook the rice and filling, roll the burritos and freeze.', station='stove', oven_f=None, active=30, keeps_days=4),
  pairs=['fruit-salad'])

R(id='chicken-quesadillas', name='Chicken Quesadillas', emoji='🧀', servings=4, serving_size='1 large quesadilla',
  meal=['lunch', 'dinner'], protein='chicken', method=['stovetop'], tags=['quick', 'kid-friendly', 'leftovers'],
  prep=10, cook=15, equipment=['large skillet or griddle', 'spatula'],
  summary='Crisp tortillas with melted cheese and chicken. A great way to use leftover roast or rotisserie chicken.',
  ingredients='''
Quesadillas:
2 cup rotisserie-chicken | shredded (or leftover chicken)
1/2 tsp cumin
1/2 tsp chili-powder
1/4 tsp salt
2 cup mexican-cheese
4 each large-flour-tortillas
1 tbsp vegetable-oil
To serve:
?1/2 cup salsa
?1/2 cup sour-cream
''',
  steps=[
    'Toss the chicken with the cumin, chili powder and salt.',
    'Lay a tortilla flat and sprinkle half of it with 1/4 cup cheese, 1/2 cup chicken and another 1/4 cup cheese. Fold over. Repeat with the rest.',
    'Brush a skillet lightly with oil and heat over medium. Cook quesadillas 2 to 3 minutes per side, until golden and the cheese melts and the filling is hot (165°F for cooked chicken).',
    'Cut into wedges and serve with salsa and sour cream.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Shred the chicken and mix the seasoning up to 3 days ahead (within 3 to 4 days of when the chicken was cooked).',
  freezer=(False, 'Best fresh.'),
  leftovers=('Cold wedges are fine in a lunchbox with an ice pack.', None),
  kids='Cheese-only quesadillas are a good starting point; add a few beans or corn as they get adventurous.',
  swaps={'gluten_free': 'Use corn tortillas (make smaller ones) and check the rotisserie chicken label.',
         'meatless': 'Use 1 can drained black beans and 1 cup corn instead of chicken.'},
  prep_day=dict(ahead='Shred and season the chicken.', station='none', oven_f=None, active=10, keeps_days=3),
  pairs=['fruit-salad'])

R(id='fried-rice', name='Vegetable Fried Rice', emoji='🍚', servings=4, serving_size='about 1 1/2 cups',
  meal=['dinner', 'lunch'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['quick', 'budget', 'kid-friendly', 'leftovers'],
  prep=10, cook=12, equipment=['large skillet or wok'],
  summary='Day-old rice, eggs and frozen vegetables become dinner in 20 minutes. Add leftover ham or chicken if you have it.',
  ingredients='''
Fried rice:
2 tbsp vegetable-oil
3 each eggs | beaten
1 each onion | chopped
2 clove garlic | minced
1 1/2 cup frozen-peas-carrots
1 1/3 cup white-rice | cooked a day ahead and chilled (makes about 4 cups)
3 tbsp low-sodium-soy-sauce
1 tsp sesame-oil
1/4 tsp black-pepper
3 each green-onions | sliced
?1 cup deli-ham | diced
''',
  steps=[
    'Heat 1 teaspoon oil in a large skillet over medium heat. Add the eggs and scramble until no liquid egg remains (egg dishes are done at 160°F). Move to a plate.',
    'Add the rest of the oil and turn the heat to medium-high. Cook the onion 3 minutes, then the garlic for 30 seconds.',
    'Add the peas and carrots (and ham, if using) and cook 2 minutes.',
    'Add the rice, breaking up clumps, and cook without stirring 1 minute so it crisps a little, then stir. Repeat a few times until the rice is hot, about 5 minutes.',
    'Stir in the soy sauce, sesame oil, pepper, eggs and green onions.',
  ],
  safety=[T_EGGS, T_LEFTOVERS],
  make_ahead='Cook the rice a day ahead. Spread hot rice on a tray to cool quickly and refrigerate it within 2 hours.',
  freezer=(True, 'Freeze cooled fried rice in portions for up to 1 month for best quality; reheat to 165°F.'),
  leftovers=('Pack for lunch and reheat to 165°F.', 'lunch'),
  kids='Kids can help crack and beat the eggs and stir in the peas.',
  swaps={'gluten_free': 'Use tamari labeled gluten-free.', 'meatless': 'It is already meatless without the ham.'},
  prep_day=dict(ahead='Cook a big pot of rice for the week; cool quickly and refrigerate.', station='stove', oven_f=None, active=10, keeps_days=4),
  pairs=[])

R(id='baked-salmon', name='Lemon-Garlic Baked Salmon', emoji='🐟', servings=4, serving_size='1 fillet',
  meal=['dinner'], protein='fish', method=['oven', 'sheet-pan'], tags=['quick'],
  prep=5, cook=15, equipment=['rimmed baking sheet', 'instant-read thermometer'],
  summary='Salmon fillets baked with butter, lemon and garlic in about 15 minutes.',
  ingredients='''
Salmon:
4 fillet salmon | about 6 ounces each
2 tbsp butter | melted
1 tbsp lemon-juice
2 clove garlic | minced
1/2 tsp salt
1/4 tsp black-pepper
1/2 tsp paprika
1 each lemon | cut in wedges
1 tbsp parsley | chopped
''',
  steps=[
    'Heat the oven to 400°F. Line a baking sheet with foil or parchment and set the fillets skin side down on it.',
    'Mix the melted butter, lemon juice and garlic and brush over the salmon. Sprinkle with salt, pepper and paprika.',
    'Bake 12 to 15 minutes, until the thickest part reaches 145°F and the flesh flakes easily with a fork.',
    'Sprinkle with parsley and serve with lemon wedges.',
  ],
  safety=[T_FISH],
  make_ahead='Mix the lemon-garlic butter up to 3 days ahead.',
  freezer=(False, 'Freeze raw fillets instead; thaw overnight in the fridge before baking.'),
  leftovers=('Flake cold salmon onto a salad or into a wrap the next day.', 'lunch'),
  kids='Check for pin bones by running a finger along the fillet before baking. A drizzle of honey on a kid portion helps (not for babies under 12 months).',
  swaps={'dairy_free': 'Use olive oil instead of butter.'},
  prep_day=dict(ahead='Thaw fillets in the fridge; mix the butter.', station='oven', oven_f=400, active=5, keeps_days=2),
  pairs=['brown-rice', 'roasted-vegetables', 'green-beans'])

R(id='pork-chops', name='Skillet Pork Chops', emoji='🥩', servings=4, serving_size='1 chop',
  meal=['dinner'], protein='pork', method=['stovetop'], tags=['quick'],
  prep=5, cook=15, inactive=3, equipment=['large heavy skillet', 'instant-read thermometer', 'tongs'],
  summary='Golden, juicy boneless chops with a quick pan sauce.',
  ingredients='''
Chops:
4 chop pork-chops | about 3/4 inch thick
3/4 tsp salt
1/2 tsp black-pepper
1/2 tsp garlic-powder
1/2 tsp paprika
1 tbsp vegetable-oil
Pan sauce:
1 tbsp butter
1/2 cup chicken-broth
1 tsp dijon-mustard
1 tsp honey
''',
  steps=[
    'Pat the chops dry. Mix the salt, pepper, garlic powder and paprika and rub on both sides.',
    'Heat the oil in a heavy skillet over medium-high heat. Cook the chops 4 to 5 minutes per side, until browned and a thermometer in the thickest part reads 145°F.',
    'Move the chops to a clean plate and let them rest at least 3 minutes.',
    'Lower the heat to medium. Add the broth, mustard and honey to the pan and scrape up the browned bits. Simmer 2 minutes, then swirl in the butter. Spoon over the chops.',
  ],
  safety=[T_WHOLE_CUT],
  make_ahead='Season the chops up to 1 day ahead and refrigerate covered.',
  freezer=(False, 'Freeze raw chops instead, 4 to 6 months for best quality.'),
  leftovers=('Slice thin for sandwiches or fried rice; reheat to 165°F.', 'lunch'),
  kids='Slice the chop into thin strips for younger children; 145°F pork can look slightly pink in the center and is safe after the rest.',
  swaps={'gluten_free': 'Use gluten-free broth.', 'dairy_free': 'Skip the butter in the sauce.'},
  prep_day=dict(ahead='Season the chops.', station='none', oven_f=None, active=5, keeps_days=1),
  pairs=['mashed-potatoes', 'green-beans'])
