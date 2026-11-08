#!/usr/bin/env python3
"""Builds data/meals/recipes/camping.json: the Camping and campfire cooking collection at /meal-prep/camping/.

Run:  python3 scripts/meals/src/build_camping.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds the NEW recipes (collection='camping') and the page plan: courses that mix them with recipes already in
Meal Prep (by id, including the s'mores), and for the camp meal planner each dish's slot (breakfast, lunch, dinner,
snack, dessert), how it's cooked (fire, stove, no-cook, made at home) and whether it rides in the cooler.

Safety comes only from USDA FSIS ("Food Safety While Hiking, Camping and Boating": cooler at 40 °F or below, block ice,
a separate drinks cooler, raw meat below ready-to-eat food, throw out perishables once the ice is gone, 2 hours / 1 hour
above 90 °F, boil water 1 minute; current safe minimum temperatures), CDC (never use a camp stove, charcoal grill or
lantern inside a tent or camper: carbon monoxide), Smokey Bear / USDA Forest Service (existing fire rings, 15 feet from
tents, water and a shovel at hand, never leave a fire, drown-stir-drown-feel), Leave No Trace's seven principles, and
the Missouri Department of Conservation's Dutch-oven briquette rule (diameter × 2 for about 325 °F; 2 more per 25 °F;
two-thirds on the lid for baking).
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coll_util import G, build, write  # noqa: E402

SLUG = 'camping'
COOLER = 'Keep the raw meat in the cooler at 40°F or below, sealed and packed below ready-to-eat food, until it goes on the fire (USDA).'
HANDS = 'Wash your hands before and after handling raw meat; bring soap and water, or wipes, if there’s no tap (USDA).'
COALS = ('Cook over a bed of glowing coals in an established fire ring or on a camp grill, not over tall flames. Use long tongs and heat-proof gloves, '
         'and open packets away from your face: the steam is very hot.')
FOIL = 'Tear four sheets of heavy-duty foil about 18 inches long. (Or double up regular foil.)'
LEFT = ('Leftovers are safe only while the cooler still has ice; otherwise throw them out (USDA). Pack out all trash and food scraps (Leave No Trace).', None)

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  FOIL PACKETS
R(id='foil-packet-hamburger-dinner', name='Foil-Packet Hamburger Dinners', emoji='🔥', servings=4, serving_size='1 packet',
  meal=['dinner'], protein='beef', method=['grill'], tags=['kid-friendly', 'make-ahead'], prep=20, cook=35,
  equipment=['heavy-duty foil', 'long tongs', 'heat-proof gloves', 'food thermometer', 'campfire grate or camp grill'],
  summary='The classic campfire supper: a seasoned beef patty on sliced potatoes, carrots and onion, sealed in foil and cooked in the coals.',
  ingredients='''
1 1/2 lb ground-beef-85
1 tsp salt | divided
1/2 tsp black-pepper
1 tsp garlic-powder
2 each russet-potato | sliced thin
2 each carrot | sliced thin
1 each onion | sliced
2 tbsp unsalted-butter | in small pieces
?4 tbsp ketchup | for serving
''',
  steps=[
    'At home or at camp: mix the beef with half the salt, the pepper and garlic powder, and shape 4 patties about ¾ inch thick. ' + HANDS,
    FOIL + ' Divide the potatoes, carrots and onion among them, sprinkle with the rest of the salt and dot with butter. Lay a patty on top.',
    'Bring the long sides of the foil together and fold them down twice, then fold the ends in tightly, so the steam stays in.',
    COALS + ' Cook 30 to 40 minutes, turning the packets over halfway.',
    'Open one packet carefully and check: the potatoes should be tender and the beef should read 160°F in the center (USDA). If not, reseal it and cook 5 minutes more.',
  ],
  safety=[('ground beef', 160, 0)],
  make_ahead='Shape the patties and slice the vegetables at home; assemble the packets and keep them flat in the cooler, below everything else, for up to 1 day.',
  freezer=(True, 'Freeze assembled packets flat; they help keep the cooler cold and thaw by the second night. Thaw in the cooler, not on the table.'),
  leftovers=LEFT,
  kids='Kids can layer their own packets with clean hands and help fold the edges. A grown-up handles the coals.',
  swaps={'stove': 'No fire? Cook the packets on a camp grill over medium heat, or in a covered skillet on the camp stove.', 'turkey': 'Use ground turkey and cook to 165°F.'},
  prep_day=dict(ahead='Shape the patties and slice the vegetables.', station='grill', oven_f=None, active=20, keeps_days=1),
  pairs=['corn-on-the-cob', 'campfire-banana-boats'])

R(id='foil-packet-chicken-veggies', name='Foil-Packet Italian Chicken and Vegetables', emoji='🍗', servings=4, serving_size='1 packet',
  meal=['dinner'], protein='chicken', method=['grill'], tags=['make-ahead'], prep=20, cook=25,
  equipment=['heavy-duty foil', 'long tongs', 'heat-proof gloves', 'food thermometer', 'campfire grate or camp grill'],
  summary='Chunks of chicken with zucchini, peppers and onion, olive oil and Italian herbs, cooked in foil packets over the coals.',
  ingredients='''
1 1/2 lb chicken-breast | in 1-inch pieces
2 each zucchini | in half-moons
1 each red-bell-pepper | in chunks
1 each onion | in wedges
3 tbsp olive-oil
2 tsp italian-seasoning
1 tsp garlic-powder
1 tsp salt
1/2 tsp black-pepper
?1/4 cup parmesan | grated, for serving
''',
  steps=[
    'At home, put the chicken in a sealed container or zip-top bag with half the oil, the seasoning, garlic powder and salt. Put the vegetables in another bag with the rest of the oil and the pepper. ' + COOLER,
    FOIL + ' Divide the vegetables and chicken among them. Fold the long sides together twice and crimp the ends. ' + HANDS,
    COALS + ' Cook 20 to 25 minutes, turning once.',
    'Open one packet carefully and check the biggest piece of chicken: it must read 165°F (USDA). Sprinkle with Parmesan.',
  ],
  safety=[('chicken', 165, 0)],
  make_ahead='Cut and season everything at home the day before; it marinates in the cooler.',
  freezer=(True, 'Freeze the seasoned raw chicken flat in its bag; it doubles as an ice pack and thaws in the cooler by day 2.'),
  leftovers=LEFT,
  kids='Kids can toss the vegetables with oil and build the packets.',
  swaps={'rice': 'Serve over instant rice made on the camp stove.', 'shrimp': 'Use peeled shrimp and cook 8 to 10 minutes, until opaque.'},
  prep_day=dict(ahead='Cut and season the chicken and vegetables.', station='grill', oven_f=None, active=20, keeps_days=1),
  pairs=['campfire-bannock'])

R(id='foil-packet-sausage-potatoes', name='Foil-Packet Sausage, Potatoes and Corn', emoji='🌽', servings=4, serving_size='1 packet',
  meal=['dinner'], protein='pork', method=['grill'], tags=['kid-friendly', 'budget'], prep=15, cook=35,
  equipment=['heavy-duty foil', 'long tongs', 'heat-proof gloves', 'food thermometer'],
  summary='Smoked sausage, little potatoes, corn on the cob and green beans with butter and paprika. Like a shrimp boil without the pot.',
  ingredients='''
1 each smoked-sausage | about 14 oz, sliced into coins
1 1/2 lb baby-potatoes | halved
2 ear corn-on-cob | each cut in 4 rounds
2 cup frozen-green-beans | or fresh
3 tbsp unsalted-butter | melted, or olive oil
1 tsp smoked-paprika
1/2 tsp garlic-powder
1/2 tsp salt
''',
  steps=[
    'At home, microwave or boil the halved potatoes 5 minutes, until just starting to soften, so they finish in the fire with everything else. Cool and pack them in the cooler.',
    'Toss the potatoes, corn, green beans and sausage with the butter, paprika, garlic powder and salt.',
    FOIL + ' Divide everything among them and seal: long sides folded together twice, ends crimped.',
    COALS + ' Cook 25 to 35 minutes, turning once, until the potatoes are tender. Smoked sausage is already cooked; heat it until steaming, 165°F (USDA).',
  ],
  safety=[('precooked sausage, reheated', 165, 0)],
  make_ahead='Par-cook the potatoes and cut the corn at home.',
  freezer=(False, 'The potatoes turn mealy.'),
  leftovers=LEFT,
  kids='Kids can shuck and help cut the corn (with a grown-up) and fill the packets.',
  swaps={'veggie': 'Use plant-based sausage, or a drained can of chickpeas.'},
  prep_day=dict(ahead='Par-cook the potatoes.', station='grill', oven_f=None, active=15, keeps_days=1),
  pairs=['campfire-banana-boats'])

R(id='campfire-banana-boats', name='Campfire Banana Boats', emoji='🍌', servings=4, serving_size='1 banana',
  meal=['snack'], protein='', method=['grill'], tags=['kid-friendly', 'quick'], prep=5, cook=8,
  equipment=['foil', 'knife', 'long tongs', 'spoons'],
  summary='A banana split in its peel, stuffed with chocolate chips and marshmallows and warmed in the coals until gooey. Eat it with a spoon.',
  ingredients='''
4 each banana | unpeeled
1/2 cup chocolate-chips
12 each marshmallows | cut in half, or 1 cup minis
?4 tsp graham-crackers | crushed, for the top
''',
  steps=[
    'With the peel on, cut a slit down the inside curve of each banana, through the fruit but not the bottom peel. Open it a little to make a pocket.',
    'Stuff the pocket with chocolate chips and marshmallows. Wrap each banana in foil.',
    'Set them on the grate or at the edge of the coals for 5 to 8 minutes, until the chocolate melts.',
    'Let them cool 2 minutes before opening; melted marshmallow is very hot. Top with graham crumbs and eat from the peel with a spoon.',
  ],
  safety=[],
  make_ahead='Pack the fillings in a bag at home.',
  freezer=(False, 'Bananas go soft and brown.'),
  leftovers=None,
  kids='Kids can stuff their own. A grown-up handles the coals.',
  swaps={'dairy_free': 'Use dairy-free chocolate chips.', 'smores': 'Make classic s’mores from scratch too.'},
  prep_day=dict(ahead='Bag the fillings.', station='grill', oven_f=None, active=5, keeps_days=1),
  pairs=['smores-from-scratch'])

# =====================================================================  POTS AND SKILLETS
R(id='campfire-chili', name='Campfire Dutch-Oven Chili', emoji='🌶️', servings=8, serving_size='about 1½ cups',
  meal=['dinner'], protein='beef', method=['one-pot', 'stovetop'], tags=['kid-friendly', 'make-ahead', 'budget'], prep=15, cook=50,
  equipment=['12-inch cast-iron Dutch oven or large pot', 'long-handled spoon', 'heat-proof gloves', 'lid lifter', 'can opener', 'food thermometer'],
  summary='A big pot of beef and bean chili, simmered over the fire or a camp stove. Warms everyone up on a cool night.',
  ingredients='''
1 1/2 lb ground-beef-85
1 each onion | chopped
1 each green-bell-pepper | chopped
2 can kidney-beans | drained
2 can diced-tomatoes
1 can tomato-sauce
3 tbsp chili-powder
2 tsp cumin
1 tsp garlic-powder
1 tsp salt
1 tbsp vegetable-oil
?1 cup cheddar | shredded, for serving
''',
  steps=[
    'At home, chop the onion and pepper and mix the spices in a small bag. ' + COOLER,
    'Set the Dutch oven on a grate over the fire (or a camp stove over medium-high heat) and add the oil. Brown the beef with the onion and pepper, breaking it up, 8 to 10 minutes, until no pink remains and it reads 160°F (USDA). Spoon off extra fat into a can to pack out.',
    'Stir in the spices, then the beans, tomatoes and tomato sauce.',
    'Bring to a simmer, then move the pot to a cooler part of the grate (or turn the stove to low). Cover and simmer 30 to 40 minutes, stirring every 10 minutes so it doesn’t catch on the bottom.',
    'Serve with cheese, over walking-taco chips or with bannock.',
  ],
  safety=[('ground beef', 160, 0)],
  make_ahead='Make the chili at home, cool it fast in shallow containers, and freeze it flat in bags. It keeps the cooler cold; reheat to 165°F at camp.',
  freezer=(True, 'Freeze up to 4 months.'),
  leftovers=('Refrigerate (or ice) leftovers within 2 hours, within 1 hour above 90°F, and keep them only while the cooler has ice (USDA). Reheat to 165°F.', None),
  kids='Kids can open the cans (with a grown-up) and stir the pot away from the flames.',
  swaps={'veggie': 'Skip the beef and add a third can of beans plus a can of corn.', 'from_scratch': 'Use the from-scratch chili seasoning.'},
  prep_day=dict(ahead='Make it at home and freeze it flat.', station='stove', oven_f=None, active=20, keeps_days=3),
  pairs=['campfire-bannock', 'walking-tacos'])

R(id='camp-skillet-breakfast-hash', name='Camp Skillet Breakfast Hash', emoji='🍳', servings=4, serving_size='about 1½ cups with 2 eggs',
  meal=['breakfast'], protein='pork', method=['stovetop'], tags=['kid-friendly'], prep=10, cook=30,
  equipment=['12-inch cast-iron skillet with a lid (or foil)', 'spatula', 'camp stove or fire grate', 'heat-proof gloves'],
  summary='Bacon, crispy hash browns, peppers and onion in one big skillet, with eggs cooked right on top. Breakfast for the whole campsite.',
  ingredients='''
8 strip bacon | cut in pieces
4 cup frozen-hash-browns | kept in the cooler; thawed is fine
1 each onion | chopped
1 each green-bell-pepper | chopped
8 each eggs
1 cup cheddar | shredded
1/2 tsp salt
1/4 tsp black-pepper
''',
  steps=[
    'Cook the bacon in the skillet over medium heat until crisp. Lift it out, leaving about 2 tablespoons of fat in the pan. Pour the rest into a can to cool and pack out.',
    'Add the hash browns, onion and pepper. Spread them out and leave them alone 5 minutes to brown, then stir and cook 8 to 10 minutes more, until crisp and tender. Season with salt and pepper.',
    'Stir the bacon back in. Make 8 wells and crack an egg into each. Cover with a lid or foil and cook on low 6 to 8 minutes, until the whites and yolks are firm (USDA).',
    'Sprinkle with cheese, cover a minute to melt it, and serve from the pan.',
  ],
  safety=[],
  make_ahead='Chop the onion and pepper at home; crack the eggs into a sealed bottle or container for the cooler (use within 2 days).',
  freezer=(False, 'Best made fresh.'),
  leftovers=LEFT,
  kids='Kids can crack eggs into a cup first, then slide them into the wells.',
  swaps={'veggie': 'Skip the bacon and use 2 tablespoons of oil; add mushrooms or spinach.', 'burritos': 'Scoop it into tortillas for breakfast burritos.'},
  prep_day=dict(ahead='Chop the vegetables.', station='stove', oven_f=None, active=10, keeps_days=1),
  pairs=['camp-hot-cocoa-mix'])

R(id='camp-shake-pancakes', name='Shake-and-Pour Camp Pancakes', emoji='🥞', servings=4, serving_size='3 pancakes',
  meal=['breakfast'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly', 'budget', 'make-ahead', 'quick'], prep=5, cook=20,
  equipment=['1-quart wide-mouth bottle or jar with a tight lid', 'griddle or large skillet', 'spatula', 'camp stove'],
  summary='Mix the dry ingredients at home in a bottle with powdered milk. At camp, add water and oil, shake, and pour. No eggs to keep cold.',
  ingredients='''
At home, in the bottle:
2 cup flour
2 tbsp sugar
4 tsp baking-powder
1/2 tsp salt
1/2 cup dry-milk
At camp:
^1 1/2 cup water | safe drinking water
3 tbsp vegetable-oil | plus more for the pan
?1/2 cup maple-syrup | for serving
''',
  steps=[
    'At home: put the flour, sugar, baking powder, salt and dry milk in a clean, dry 1-quart bottle or jar (a funnel helps). Close it and label it “add 1½ cups water + 3 tbsp oil.”',
    'At camp: add the water and oil, close the lid tightly and shake hard for about 30 seconds, until there are no dry pockets. A few small lumps are fine.',
    'Heat an oiled griddle over medium-low on the camp stove. Pour ¼-cup pancakes straight from the bottle.',
    'Cook until bubbles cover the top and the edges look dry, about 2 minutes, then flip and cook 1 to 2 minutes more, until golden and cooked through. Don’t taste the raw batter (FDA).',
  ],
  safety=[],
  make_ahead='The dry mix keeps 2 months in the pantry.',
  freezer=(False, 'Keep the dry mix in the pantry.'),
  leftovers=None,
  kids='Kids love to shake the bottle. Pouring and flipping on a hot griddle is a grown-up job, or for older kids with help.',
  swaps={'blueberries': 'Drop a few blueberries onto each pancake after pouring.', 'from_scratch': 'Use 2 cups of the from-scratch pancake mix.'},
  prep_day=dict(ahead='Fill the bottle with the dry mix.', station='stove', oven_f=None, active=10, keeps_days=60),
  pairs=['camp-hot-cocoa-mix'])

R(id='dutch-oven-peach-cobbler', name='Dutch-Oven Peach Cobbler', emoji='🍑', servings=8, serving_size='about ¾ cup',
  meal=['snack'], protein='vegetarian', method=['grill'], tags=['kid-friendly', 'budget'], prep=10, cook=45,
  equipment=['12-inch camp Dutch oven with legs and a flat, rimmed lid', 'charcoal briquettes and a chimney starter', 'lid lifter', 'heat-proof gloves', 'foil liner (optional)'],
  summary='Canned peaches under a buttery batter, baked in a Dutch oven with coals underneath and on the lid. The classic campout dessert.',
  ingredients='''
3 can canned-peaches | in juice, drained (save ½ cup juice)
1 tsp cinnamon | divided
Batter (dry part mixed at home):
1 1/2 cup flour
3/4 cup sugar
2 tsp baking-powder
1/4 tsp salt
1/2 cup unsalted-butter | melted
3/4 cup whole-milk
''',
  steps=[
    'At home, mix the flour, sugar, baking powder, salt and half the cinnamon in a bag.',
    'Light about 26 briquettes in a chimney starter in the fire ring or on bare ground cleared of anything that can burn. When they are covered in gray ash (15 to 20 minutes), they are ready.',
    'Line the Dutch oven with foil if you like (for easy cleanup). Spread the peaches and saved juice in the bottom and sprinkle with the rest of the cinnamon.',
    'Stir the milk and melted butter into the dry mix just until combined, and spoon the batter over the peaches.',
    'Put on the lid. Set the oven over 9 briquettes in a ring and put 17 on the lid, spread evenly. This is about 350°F for a 12-inch oven (diameter × 2, plus 2 for each 25°F, two-thirds on top for baking).',
    'Bake 35 to 45 minutes, turning the oven a quarter turn one way and the lid a quarter turn the other every 15 minutes so it browns evenly. Lift the lid carefully, brushing ash away, to check: the top should be golden and a knife come out clean.',
    'Let it cool 10 minutes; the fruit is very hot. When done, put the used coals in the fire ring and put them out completely: drown, stir, drown and feel.',
  ],
  safety=[],
  make_ahead='Mix the dry batter at home.',
  freezer=(False, 'Best warm, at camp.'),
  leftovers=('Covered, it keeps overnight in the cooler while it still has ice.', None),
  kids='Kids can spoon on the batter. Coals and the lid are for grown-ups.',
  swaps={'oven': 'At home, bake it in a 9-by-13-inch dish at 350°F for 40 to 45 minutes.', 'dry_milk': 'Use ¼ cup dry milk in the bag and ¾ cup water at camp, so nothing needs the cooler.'},
  prep_day=dict(ahead='Mix the dry batter.', station='grill', oven_f=None, active=15, keeps_days=1),
  pairs=['campfire-chili'])

R(id='campfire-bannock', name='Campfire Bannock (Skillet or Stick)', emoji='🫓', servings=6, serving_size='1 wedge',
  meal=['side', 'breakfast'], protein='vegetarian', method=['stovetop'], tags=['budget', 'make-ahead', 'kid-friendly'], prep=10, cook=20,
  equipment=['mixing bowl or a sturdy zip-top bag', 'cast-iron skillet', 'spatula', 'clean green sticks or metal roasting sticks (optional)'],
  summary='A simple flatbread of flour, baking powder, fat and water, cooked in a skillet or wrapped around a stick over the coals. A camp staple for centuries.',
  ingredients='''
2 cup flour
1 tbsp baking-powder
1 tbsp sugar
1/2 tsp salt
3 tbsp shortening | or lard or butter
^3/4 cup water | about
1 tbsp vegetable-oil | for the skillet
''',
  steps=[
    'At home, mix the flour, baking powder, sugar and salt and rub in the shortening with your fingers until it looks like coarse crumbs. Pack it in a zip-top bag; it keeps 2 weeks.',
    'At camp, add the water a little at a time, squeezing the bag or stirring in a bowl, until it makes a soft dough that isn’t sticky. Knead it a few times.',
    'Skillet: pat the dough into a round about ¾ inch thick. Heat the oil in the skillet over low coals or a low stove flame and cook 8 to 10 minutes per side, until golden and it sounds hollow when tapped. Keep the heat low so the middle cooks before the outside burns.',
    'On a stick: roll pieces of dough into ropes and wind them around clean sticks. Hold them over glowing coals, turning, 8 to 10 minutes, until golden and cooked through. Don’t eat raw dough (FDA).',
    'Cut into wedges and eat warm, with butter, jam or the chili.',
  ],
  safety=[],
  make_ahead='The dry mix with the fat rubbed in keeps 2 weeks in a cool place.',
  freezer=(False, 'Keep the dry mix in the pantry.'),
  leftovers=('Wrap leftover bannock and eat it within 2 days.', None),
  kids='Kids can mix the dough in the bag and wind it on sticks. Supervise them near the fire.',
  swaps={'sweet': 'Add a handful of raisins or berries and a pinch of cinnamon.', 'traditional': 'Lard is the traditional fat in many families; butter works too.'},
  prep_day=dict(ahead='Mix the dry ingredients and fat.', station='stove', oven_f=None, active=15, keeps_days=14),
  pairs=['campfire-chili'])

R(id='walking-tacos', name='Walking Tacos', emoji='🌮', servings=6, serving_size='1 bag of chips with toppings',
  meal=['dinner', 'lunch'], protein='beef', method=['stovetop'], tags=['kid-friendly', 'quick'], prep=10, cook=15,
  equipment=['large skillet', 'spatula', 'food thermometer', 'small bowls for toppings', 'forks'],
  summary='Taco meat spooned straight into a bag of tortilla chips, topped and eaten with a fork. Hardly any dishes to wash at camp.',
  ingredients='''
1 lb ground-beef-85
1 package taco-seasoning | or 3 tablespoons homemade
^2/3 cup water
6 cup tortilla-chips | in 6 single-serving bags or zip-top bags
1 cup mexican-cheese | shredded
2 cup iceberg | shredded
1 each tomato | diced
?1/2 cup salsa
?1/2 cup sour-cream
''',
  steps=[
    'Brown the beef in a skillet over medium-high heat on the camp stove, breaking it up, until no pink remains and it reads 160°F (USDA). Spoon off extra fat into a can to pack out.',
    'Stir in the seasoning and water and simmer 5 minutes, until thick.',
    'Crush the chips a little in each bag, open it, and spoon in the meat. Let everyone add cheese, lettuce, tomato, salsa and sour cream, then eat out of the bag with a fork.',
    'Keep the cheese, lettuce, salsa and sour cream in the cooler until serving and put them back within 2 hours, or 1 hour on a day above 90°F (USDA).',
  ],
  safety=[('ground beef', 160, 0)],
  make_ahead='Cook the taco meat at home, cool it fast and freeze it flat; reheat to 165°F at camp.',
  freezer=(True, 'Freeze the cooked meat up to 3 months.'),
  leftovers=LEFT,
  kids='Kids can crush the chips and build their own.',
  swaps={'veggie': 'Use the seasoned lentil taco filling or black beans.', 'from_scratch': 'Use the from-scratch taco seasoning.'},
  prep_day=dict(ahead='Cook and freeze the taco meat.', station='stove', oven_f=None, active=15, keeps_days=3),
  pairs=['campfire-chili'])

R(id='pie-iron-pizza-pockets', name='Pie-Iron Pizza Pockets', emoji='🍕', servings=4, serving_size='1 pocket',
  meal=['lunch', 'dinner'], protein='pork', method=['grill'], tags=['kid-friendly', 'quick'], prep=10, cook=10,
  equipment=['pie irons (campfire sandwich makers)', 'heat-proof gloves', 'butter knife'],
  summary='Buttered bread around pizza sauce, mozzarella and pepperoni, toasted in a pie iron over the coals until crisp and melty.',
  ingredients='''
8 slice white-bread
2 tbsp unsalted-butter | softened
1/2 cup marinara
1 cup mozzarella | shredded
16 slice pepperoni
''',
  steps=[
    'Butter one side of each slice of bread.',
    'Open a pie iron and lay a slice, butter side down, in one half. Spread with 2 tablespoons of sauce, add a quarter of the cheese and 4 slices of pepperoni, and top with another slice, butter side up.',
    'Close the iron, latch it, and trim any bread sticking out.',
    'Hold it over glowing coals (not in the flames) 2 to 4 minutes per side, peeking once, until golden. Open it carefully: the iron and filling are very hot. Cool 2 minutes before eating.',
  ],
  safety=[],
  make_ahead='Pack the fillings in small containers in the cooler.',
  freezer=(False, 'Best fresh.'),
  leftovers=None,
  kids='Kids can build their own pocket. A grown-up holds the hot iron.',
  swaps={'dessert': 'Fill with canned pie filling or chocolate chips and marshmallows.', 'skillet': 'No pie iron? Cook them like grilled cheese in a skillet.'},
  prep_day=dict(ahead='Pack the fillings.', station='grill', oven_f=None, active=10, keeps_days=1),
  pairs=['nut-free-camp-trail-mix'])

R(id='camp-stove-mac-and-cheese', name='One-Pot Camp Stove Mac and Cheese', emoji='🧀', servings=4, serving_size='about 1¼ cups',
  meal=['dinner', 'lunch'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['kid-friendly', 'quick', 'budget'], prep=5, cook=15,
  equipment=['3- or 4-quart pot with a lid', 'camp stove', 'long spoon'],
  summary='Macaroni cooked in just enough water to soak up, then stirred with milk, butter and cheddar. One pot, no draining.',
  ingredients='''
3 cup elbow-macaroni | about 12 oz
^3 cup water | safe drinking water
1 cup whole-milk | or evaporated milk
2 tbsp unsalted-butter
2 cup cheddar | shredded
1/2 tsp salt
~1 pinch black-pepper
''',
  steps=[
    'Bring the water and salt to a boil in the pot over the camp stove.',
    'Add the macaroni and cook, stirring often, 8 to 10 minutes, until tender and most of the water is soaked up. Add a splash more water if it gets dry before the pasta is done.',
    'Turn the heat to low and stir in the milk and butter until hot, then the cheese a handful at a time until creamy. Season with pepper.',
  ],
  safety=[],
  make_ahead='Shred the cheese at home and keep it in the cooler.',
  freezer=(False, 'Best fresh.'),
  leftovers=LEFT,
  kids='Kids can stir in the cheese, standing away from the stove with a long spoon.',
  swaps={'shelf_stable': 'Use a can of evaporated milk instead of fresh milk; it needs no cooler until opened.', 'add_ins': 'Stir in chopped hot dogs or leftover chili.'},
  prep_day=dict(ahead='Shred the cheese.', station='stove', oven_f=None, active=15, keeps_days=1),
  pairs=['foil-packet-sausage-potatoes'])

R(id='biscuit-on-a-stick', name='Cinnamon Sugar Biscuits on a Stick', emoji='🥖', servings=8, serving_size='1 twist',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['grill'], tags=['kid-friendly', 'quick'], prep=5, cook=12,
  equipment=['clean roasting sticks or long metal skewers', 'small pot or foil pan for butter', 'plate for cinnamon sugar'],
  summary='Biscuit dough twisted around a roasting stick, toasted over the coals, then rolled in butter and cinnamon sugar.',
  ingredients='''
8 each biscuit-dough | refrigerated biscuits
3 tbsp unsalted-butter | melted
1/4 cup sugar
2 tsp cinnamon
''',
  steps=[
    'Mix the sugar and cinnamon on a plate. Melt the butter in a small pot at the edge of the fire.',
    'Roll each biscuit into a rope about 8 inches long and wind it around the end of a stick, pinching the ends.',
    'Hold it a few inches above glowing coals, turning slowly, 8 to 12 minutes, until golden all over and cooked through; it should slide off easily and feel light. Don’t eat raw dough (FDA).',
    'Slide it off, brush with butter and roll in cinnamon sugar. Let it cool a minute before biting.',
  ],
  safety=[],
  make_ahead='Mix the cinnamon sugar at home. Keep the biscuits in the cooler.',
  freezer=(False, 'Keep the dough in the cooler.'),
  leftovers=None,
  kids='Kids can roll and wind the dough and toast it, supervised, standing back from the fire with a long stick.',
  swaps={'from_scratch': 'Use the bannock dough instead.'},
  prep_day=dict(ahead='Mix the cinnamon sugar.', station='grill', oven_f=None, active=10, keeps_days=1),
  pairs=['camp-hot-cocoa-mix'])

# =====================================================================  PACKED FROM HOME
R(id='nut-free-camp-trail-mix', name='Nut-Free Camp Trail Mix', emoji='🥾', servings=16, serving_size='½ cup',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['lunchbox', 'kid-friendly', 'make-ahead', 'quick'], prep=5, cook=0,
  equipment=['large bowl', 'bags or containers for each hiker'],
  summary='Seeds, oat cereal, pretzels, raisins, cranberries and a few chocolate chips. All the crunch of trail mix, without peanuts or tree nuts.',
  ingredients='''
1 cup sunflower-seeds | roasted, salted or not
1 cup pumpkin-seeds | roasted
2 cup toasted-oat-cereal
2 cup pretzels | small twists
1 cup raisins
1/2 cup dried-cranberries
1/2 cup chocolate-chips
''',
  steps=[
    'Stir everything together in a big bowl.',
    'Scoop ½-cup portions into small bags, one per hiker per snack, so nobody reaches into a shared bag with unwashed hands.',
  ],
  safety=[],
  make_ahead='Keeps 1 month in a sealed container.',
  freezer=(False, 'Keep it in the pantry.'),
  leftovers=None,
  kids='Kids can measure, mix and bag it.',
  swaps={'nut_free': 'Check the seed, cereal and chocolate labels for “may contain” warnings if someone has a severe allergy.', 'gluten_free': 'Use gluten-free pretzels and cereal.'},
  prep_day=dict(ahead='Mix and bag it.', station='none', oven_f=None, active=5, keeps_days=30),
  pairs=['homemade-trail-mix'])

R(id='camp-hot-cocoa-mix', name='Homemade Hot Cocoa Mix', emoji='☕', servings=12, serving_size='⅓ cup mix (1 mug)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'budget', 'kid-friendly', 'quick'], prep=5, cook=0,
  equipment=['large bowl', 'whisk', 'jar or bag', 'kettle or pot at camp'],
  summary='Powdered milk, cocoa and sugar mixed at home. At camp, stir a scoop into a mug of hot water for cocoa by the fire.',
  ingredients='''
2 cup dry-milk
1 cup powdered-sugar
3/4 cup cocoa | unsweetened
~1 pinch salt
?1 cup marshmallows | mini, for the mugs
''',
  steps=[
    'Whisk the dry milk, powdered sugar, cocoa and salt together until no lumps remain, and pack it in a jar or bag.',
    'At camp, heat safe drinking water. If your water comes from a lake or stream, bring it to a rolling boil for 1 minute first (USDA).',
    'Stir ⅓ cup of mix into 1 cup of hot water. Let it cool to sipping temperature before handing it to kids.',
  ],
  safety=[],
  make_ahead='Keeps 3 months in a sealed jar.',
  freezer=(False, 'Keep it in the pantry.'),
  leftovers=None,
  kids='Kids can whisk the mix and fill the jars; they make good gifts.',
  swaps={'richer': 'Add ½ cup of chocolate chips, finely chopped.', 'dairy_free': 'Use powdered coconut milk.'},
  prep_day=dict(ahead='Mix a jar.', station='none', oven_f=None, active=5, keeps_days=90),
  pairs=['camp-shake-pancakes'])

# =====================================================================  COLLECTION (the page's plan)
COURSES = [
    {'id': 'foil', 'title': 'Foil-packet dinners', 'icon': '🔥',
     'intro': 'Everyone builds a packet, it cooks in the coals, and there’s almost nothing to wash. Use heavy-duty foil and long tongs.',
     'items': ['r:foil-packet-hamburger-dinner', 'r:foil-packet-chicken-veggies', 'r:foil-packet-sausage-potatoes']},
    {'id': 'pots', 'title': 'Dutch oven, skillet and pot', 'icon': '🍲',
     'intro': 'One pot or pan over the fire or the camp stove.',
     'items': ['r:campfire-chili', 'r:walking-tacos', 'r:camp-stove-mac-and-cheese', 'r:pie-iron-pizza-pockets', 'r:campfire-bannock', 'r:classic-burgers', 'r:corn-on-the-cob']},
    {'id': 'breakfast', 'title': 'Camp breakfasts', 'icon': '🍳',
     'intro': 'A hot skillet breakfast, pancakes from a bottle, or something made at home.',
     'items': ['r:camp-skillet-breakfast-hash', 'r:camp-shake-pancakes', 'r:breakfast-burritos', 'r:overnight-oats', 'r:homemade-granola', 'r:camp-hot-cocoa-mix']},
    {'id': 'lunch', 'title': 'Trail lunches and snacks', 'icon': '🥾',
     'intro': 'Lunches that travel. Pack them in the cooler; trail mix and bites ride in a pocket.',
     'items': ['r:nut-free-camp-trail-mix', 'r:homemade-trail-mix', 'r:sunflower-oat-energy-bites', 'r:turkey-cheese-wraps', 'r:lunchbox-sandwiches', 'r:pasta-salad', 'r:cracker-stacker-lunch-box']},
    {'id': 'desserts', 'title': 'Campfire desserts', 'icon': '🍑',
     'intro': 'S’mores, of course, plus a Dutch-oven cobbler, banana boats and biscuits on a stick.',
     'items': ['r:smores-from-scratch', 'r:dutch-oven-peach-cobbler', 'r:campfire-banana-boats', 'r:biscuit-on-a-stick', 'r:grilled-stone-fruit']},
]
SCRATCH = ['marshmallows', 'graham-crackers', 'chocolate-from-cocoa', 'pancake-mix', 'granola', 'flour-tortillas', 'taco-seasoning', 'chili-seasoning', 'biscuits']
DEFAULT_MENU = ['foil-packet-hamburger-dinner', 'campfire-chili', 'camp-skillet-breakfast-hash', 'camp-shake-pancakes', 'turkey-cheese-wraps',
                'nut-free-camp-trail-mix', 'smores-from-scratch', 'dutch-oven-peach-cobbler', 'camp-hot-cocoa-mix']
# the camp meal planner: slot, how it's cooked (fire, stove, nocook, home = made before you leave), needs the cooler
PLAN = {
    'foil-packet-hamburger-dinner': ['dinner', 'fire', True], 'foil-packet-chicken-veggies': ['dinner', 'fire', True], 'foil-packet-sausage-potatoes': ['dinner', 'fire', True],
    'campfire-chili': ['dinner', 'fire', True], 'walking-tacos': ['dinner', 'stove', True], 'camp-stove-mac-and-cheese': ['dinner', 'stove', True],
    'pie-iron-pizza-pockets': ['lunch', 'fire', True], 'campfire-bannock': ['side', 'fire', False], 'classic-burgers': ['dinner', 'fire', True], 'corn-on-the-cob': ['side', 'fire', False],
    'camp-skillet-breakfast-hash': ['breakfast', 'stove', True], 'camp-shake-pancakes': ['breakfast', 'stove', False], 'breakfast-burritos': ['breakfast', 'home', True],
    'overnight-oats': ['breakfast', 'home', True], 'homemade-granola': ['breakfast', 'home', False], 'camp-hot-cocoa-mix': ['drink', 'stove', False],
    'nut-free-camp-trail-mix': ['snack', 'home', False], 'homemade-trail-mix': ['snack', 'home', False], 'sunflower-oat-energy-bites': ['snack', 'home', True],
    'turkey-cheese-wraps': ['lunch', 'home', True], 'lunchbox-sandwiches': ['lunch', 'home', False], 'pasta-salad': ['lunch', 'home', True], 'cracker-stacker-lunch-box': ['lunch', 'home', True],
    'smores-from-scratch': ['dessert', 'fire', False], 'dutch-oven-peach-cobbler': ['dessert', 'fire', True], 'campfire-banana-boats': ['dessert', 'fire', False],
    'biscuit-on-a-stick': ['dessert', 'fire', True], 'grilled-stone-fruit': ['dessert', 'fire', True],
}
SOURCES = [
    ('fsis-camp', 'Food Safety While Hiking, Camping and Boating (archived fact sheet)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20090115231949/http://www.fsis.usda.gov/Fact_Sheets/Food_Safety_While_Hiking_Camping_&_Boating/index.asp'),
    ('fsis-temps', 'Safe Minimum Internal Temperature Chart', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'),
    ('cdc-co', 'Carbon Monoxide Poisoning Prevention (archived feature)', 'Centers for Disease Control and Prevention', 'https://webarchive.library.unt.edu/web/20130213202524/http://www.cdc.gov/Features/COpoisoning'),
    ('smokey', 'How to Maintain and Extinguish Your Campfire', 'Smokey Bear (USDA Forest Service, National Association of State Foresters, Ad Council)', 'https://smokeybear.com/en/prevention-how-tos/campfire-safety/how-to-maintain-and-extinguish-your-campfire'),
    ('lnt', 'Leave No Trace Seven Principles', 'National Park Service (© Leave No Trace Center for Outdoor Ethics)', 'https://www.nps.gov/articles/leave-no-trace-seven-principles.htm'),
    ('mdc-dutch', 'Dutch Oven Cooking 101', 'Missouri Department of Conservation', 'https://mdc.mo.gov/node/246451'),
    ('fda-flour', 'Flour, Raw Food and Other Safety Facts', 'U.S. Food and Drug Administration', 'https://www.fda.gov/consumers/consumer-updates/flour-raw-food-and-other-safety-facts'),
]
U = {
    'camp': {'name': 'Food Safety While Hiking, Camping and Boating (USDA FSIS, archived)', 'url': SOURCES[0][3], 'what': 'coolers, ice, the 2-hour and 1-hour rules, boiling water'},
    'temps': {'name': 'Safe Minimum Internal Temperature Chart (USDA FSIS)', 'url': SOURCES[1][3], 'what': 'safe temperatures'},
    'smokey': {'name': 'How to Maintain and Extinguish Your Campfire (Smokey Bear)', 'url': SOURCES[3][3], 'what': 'putting coals out: drown, stir, drown, feel'},
    'lnt': {'name': 'Leave No Trace Seven Principles (NPS)', 'url': SOURCES[4][3], 'what': 'packing out trash'},
    'mdc': {'name': 'Dutch Oven Cooking 101 (Missouri Department of Conservation)', 'url': SOURCES[5][3], 'what': 'briquettes for the temperature'},
    'flour': {'name': 'Flour, Raw Food and Other Safety Facts (FDA)', 'url': SOURCES[6][3], 'what': 'don’t eat raw dough or batter'},
}
CREDITS = {
    'foil-packet-hamburger-dinner': [U['camp'], U['temps'], G('Campfire', 'background')], 'foil-packet-chicken-veggies': [U['camp'], U['temps']],
    'foil-packet-sausage-potatoes': [U['camp'], U['temps']], 'campfire-banana-boats': [G('Campfire', 'background')],
    'campfire-chili': [U['camp'], U['temps'], G('Chili_con_carne', 'background'), G('Dutch_oven', 'the pot')],
    'camp-skillet-breakfast-hash': [U['camp'], U['lnt']], 'camp-shake-pancakes': [U['flour'], G('Pancake', 'background')],
    'dutch-oven-peach-cobbler': [U['mdc'], U['smokey'], G('Cobbler_(food)', 'background'), G('Dutch_oven', 'camp Dutch ovens')],
    'campfire-bannock': [U['flour'], G('Bannock_(Indigenous_American_food)', 'Scottish origins and Indigenous North American bannock'), G('Bannock_(British_and_Irish_food)', 'the Scottish bannock')],
    'walking-tacos': [U['camp'], U['temps'], G('Frito_pie', 'the chips-in-a-bag idea')], 'pie-iron-pizza-pockets': [G('Pie_iron', 'the tool')],
    'camp-stove-mac-and-cheese': [U['lnt'], G('Macaroni_and_cheese', 'background')], 'biscuit-on-a-stick': [U['flour']],
    'nut-free-camp-trail-mix': [G('Trail_mix', 'background')], 'camp-hot-cocoa-mix': [U['camp'], G('Hot_chocolate', 'background')],
}
META = {'anchor': 'your-menu', 'title': 'Camping and campfire cooking', 'url': 'meal-prep/camping/', 'icon': '🏕️', 'blurb': 'Camping and campfire cooking collection',
        'keywords': ['camping food', 'campfire cooking', 'foil packet dinners', 'Dutch oven', 'camp meal plan', 'cooler packing', 'bannock', 'Leave No Trace']}


def main():
    out = build(RECIPES, CREDITS, SLUG)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'plan': PLAN,
            'goals_exclude': ['campfire-banana-boats', 'dutch-oven-peach-cobbler', 'biscuit-on-a-stick', 'camp-hot-cocoa-mix'],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, extra_ids=list(PLAN))


if __name__ == '__main__':
    main()
