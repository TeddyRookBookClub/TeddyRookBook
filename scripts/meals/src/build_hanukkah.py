#!/usr/bin/env python3
"""Builds data/meals/recipes/hanukkah.json: "A Hanukkah table" at /meal-prep/hanukkah/.

Run:  python3 scripts/meals/src/build_hanukkah.py      (build the catalog first)
Then: node scripts/meals/check-data.js

New recipes (latkes four ways, sufganiyot, bimuelos, brisket, potato kugel, tzimmes, blintzes) plus a page plan that
reuses the noodle kugel, roast chicken, soups and vegetables already in Meal Prep, and the from-scratch applesauce and
challah pages (by id). The page itself is layouts/meal-prep/occasion.html.

Context comes from Grokipedia (Hanukkah, Latke, Sufganiyah, Brisket (Jewish dish), Kugel, Tzimmes, Blintz) and the
holiday dates from Hebcal. Food safety: USDA FSIS (safe temperatures, leftovers). Frying: U.S. Fire Administration and
the Cambridge (MA) Fire Department's NFPA-based grease-fire advice. Disputed points are left out.
"""
import glob, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from occasion_lib import G, SITE, build, write  # noqa: E402

SLUG = 'hanukkah'
T_BRISKET = ('beef brisket (whole cut)', 145, 3)
T_REHEAT = ('brisket and leftovers, reheated', 165, 0)
T_EGGS = ('egg dishes', 160, 0)

FRY_SAFE = ('Frying safety: use a heavy pan, keep the oil below smoking (350 to 375°F), and never leave hot oil alone. Keep a lid or sheet pan beside the stove; '
            'if the oil catches fire, turn off the burner and slide the lid over it. Never pour water on a grease fire. Keep children back from the stove.')
SQUEEZE = 'Squeeze the grated potatoes hard in a clean kitchen towel, a handful at a time, over a bowl. Dry potatoes make crisp latkes, and less water means less spattering oil.'
WARM = 'Keep finished latkes warm and crisp in one layer on a wire rack set in a baking sheet in a 200°F oven while you fry the rest.'
LEFT = ('Refrigerate within 2 hours; eat within 3 to 4 days (USDA). Reheat to 165°F.', None)
LATKE_LEFT = ('Refrigerate within 2 hours; keep up to 3 days. Recrisp on a rack at 400°F for 8 to 10 minutes; a microwave makes them soggy.', None)

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  LATKES
R(id='classic-potato-latkes', name='Classic Potato Latkes', emoji='🥔', servings=6, serving_size='4 latkes (makes about 24)',
  meal=['side', 'dinner'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=30, cook=40,
  equipment=['box grater or food processor with a grating disk', 'clean kitchen towel', '2 large bowls', 'large heavy skillet (cast iron is ideal)', 'thermometer (optional)', 'wide spatula', 'baking sheet with a wire rack'],
  summary='Crisp, lacy-edged potato pancakes fried in oil, the best-known Hanukkah food in many Ashkenazi Jewish homes. Serve with applesauce, sour cream, or both.',
  ingredients='''
3 lb russet-potato | peeled
1 each onion
2 each eggs | beaten
1/3 cup flour | or matzo meal
1 1/2 tsp kosher-salt
1/2 tsp black-pepper
1/2 tsp baking-powder
^1 1/2 cup vegetable-oil | for frying; about ¼ inch in the pan
For serving:
?1 cup applesauce | homemade or store-bought
?1 cup sour-cream
''',
  steps=[
    'Heat the oven to 200°F and set a wire rack in a baking sheet. ' + FRY_SAFE,
    'Grate the potatoes and onion on the large holes of a box grater or in a food processor, alternating them; the onion helps keep the potatoes from turning gray.',
    SQUEEZE + ' Let the squeezed-out liquid sit 5 minutes, pour off the water and keep the white potato starch at the bottom of the bowl.',
    'Mix the potatoes and onion with the starch, eggs, flour, salt, pepper and baking powder.',
    'Heat about ¼ inch of oil in the skillet over medium-high heat until a shred of potato sizzles right away (about 350 to 375°F).',
    'Drop in heaping 2-tablespoon mounds, a few at a time without crowding, and flatten them to about 3 inches. Fry 3 to 4 minutes per side, until deep golden brown and crisp. Lower the heat if they brown too fast.',
    'Drain briefly on paper towels, then move to the rack in the oven. ' + WARM + ' Stir the batter between batches and add oil as needed, letting it heat back up.',
    'Serve hot with applesauce and sour cream. When you’re done, turn off the burner and let the oil cool completely before throwing it away in a sealed container.',
  ],
  safety=[],
  make_ahead='Fry up to a day ahead, cool on the rack and refrigerate; recrisp on a rack at 400°F, 8 to 10 minutes. Or freeze them.',
  freezer=(True, 'Freeze fried, cooled latkes in one layer, then bag them, up to 3 months. Reheat from frozen at 400°F, about 12 minutes.'),
  leftovers=LATKE_LEFT,
  kids='Kids can mix the batter and spoon on toppings. Grating knuckles and hot oil are grown-up jobs.',
  swaps={'gluten_free': 'Use potato starch or a gluten-free flour in place of the flour or matzo meal.', 'egg_free': 'Leave out the eggs and add 2 more tablespoons flour; handle them gently.',
         'kosher_meat_meal': 'For a meat meal, serve with applesauce instead of sour cream.'},
  prep_day=dict(ahead='Fry and freeze ahead, or recrisp the next day.', station='stove', oven_f=None, active=60, keeps_days=3),
  pairs=['onion-braised-brisket', 'noodle-kugel', 'green-salad'])

R(id='sweet-potato-latkes', name='Sweet Potato Latkes', emoji='🍠', servings=6, serving_size='4 latkes (makes about 24)',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=25, cook=35,
  equipment=['box grater or food processor', 'clean kitchen towel', 'large bowl', 'large heavy skillet', 'wide spatula', 'baking sheet with a wire rack'],
  summary='Orange, slightly sweet latkes from grated sweet potato with a little cinnamon and green onion. They brown faster than potato latkes, so fry them over medium heat.',
  ingredients='''
2 lb sweet-potato | peeled
4 each green-onions | thinly sliced
2 each eggs | beaten
1/2 cup flour
1 tsp kosher-salt
1/2 tsp cinnamon
1/4 tsp black-pepper
^1 1/2 cup vegetable-oil | for frying
For serving:
?1 cup sour-cream | or Greek yogurt
?2 tbsp honey | to drizzle
''',
  steps=[
    'Heat the oven to 200°F and set a wire rack in a baking sheet. ' + FRY_SAFE,
    'Grate the sweet potatoes on the large holes. Squeeze them lightly in a towel; they hold less water than white potatoes.',
    'Mix with the green onions, eggs, flour, salt, cinnamon and pepper.',
    'Heat ¼ inch of oil over medium heat. Fry heaping 2-tablespoon mounds, flattened, 3 minutes per side, until browned and crisp at the edges. Sweet potatoes have more sugar and burn faster; turn the heat down if needed.',
    'Drain on paper towels, then keep warm on the rack in the oven. Serve with sour cream and a drizzle of honey.',
  ],
  safety=[],
  make_ahead='Fry a day ahead, refrigerate, and recrisp at 400°F on a rack.',
  freezer=(True, 'Freeze in one layer, then bag, up to 3 months; reheat at 400°F.'),
  leftovers=LATKE_LEFT,
  kids='Kids can mix the batter and drizzle the honey.',
  swaps={'savory': 'Leave out the cinnamon and add ½ teaspoon cumin and some chopped cilantro.', 'gluten_free': 'Use potato starch instead of flour.'},
  prep_day=dict(ahead='Fry ahead and recrisp.', station='stove', oven_f=None, active=45, keeps_days=3),
  pairs=['classic-potato-latkes', 'onion-braised-brisket'])

R(id='zucchini-carrot-latkes', name='Zucchini and Carrot Latkes', emoji='🥕', servings=6, serving_size='3 latkes (makes about 18)',
  meal=['side', 'lunch'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=30, cook=30,
  equipment=['box grater', 'colander', 'clean kitchen towel', 'large bowl', 'large skillet', 'wide spatula'],
  summary='Light vegetable fritters with zucchini, carrot, a little potato and fresh dill. A colorful latke for a dairy meal with a yogurt dip.',
  ingredients='''
2 each zucchini | grated
2 each carrot | grated
1 each russet-potato | peeled and grated
1 1/2 tsp kosher-salt
3 each green-onions | sliced
2 tbsp dill | chopped
2 each eggs
1/2 cup flour
1/4 tsp black-pepper
^1 cup vegetable-oil | for frying
Yogurt dip:
1 cup greek-yogurt
1 clove garlic | grated
1 tbsp lemon-juice
''',
  steps=[
    'Toss the zucchini with 1 teaspoon of the salt in a colander and let it drain 10 minutes. Then squeeze the zucchini, carrot and potato very dry in a towel.',
    FRY_SAFE,
    'Mix the vegetables with the green onions, dill, eggs, flour, pepper and the remaining salt.',
    'Heat ¼ inch of oil over medium-high. Fry 2-tablespoon mounds, flattened, 3 minutes per side until golden. Drain on paper towels and keep warm in a 200°F oven.',
    'Stir the yogurt, garlic and lemon juice together for dipping.',
  ],
  safety=[],
  make_ahead='Grate the carrots a day ahead. Make the yogurt dip up to 3 days ahead.',
  freezer=(True, 'Freeze fried latkes up to 2 months; recrisp at 400°F.'),
  leftovers=LATKE_LEFT,
  kids='Kids can squeeze the vegetables in the towel (a good arm workout) and stir the dip.',
  swaps={'dairy_free': 'Serve with applesauce instead of the yogurt dip.'},
  prep_day=dict(ahead='Grate the carrots; make the dip.', station='stove', oven_f=None, active=45, keeps_days=3),
  pairs=['cheese-blintzes', 'classic-potato-latkes'])

R(id='sheet-pan-latkes', name='Oven-Baked Sheet-Pan Latkes', emoji='🍳', servings=6, serving_size='4 latkes (makes about 24)',
  meal=['side'], protein='vegetarian', method=['oven', 'sheet-pan'], tags=['kid-friendly'], prep=30, cook=30,
  equipment=['2 rimmed baking sheets', 'box grater or food processor', 'clean kitchen towel', 'large bowl', 'wide spatula'],
  summary='Latkes baked in a very hot oven on oiled pans: less oil, no spattering, and every batch done at once. Crisp edges with a softer middle.',
  ingredients='''
3 lb russet-potato | peeled
1 each onion
2 each eggs | beaten
1/3 cup flour | or matzo meal
1 1/2 tsp kosher-salt
1/2 tsp black-pepper
6 tbsp vegetable-oil | for the pans and brushing
''',
  steps=[
    'Heat the oven to 450°F with racks in the upper and lower thirds. Pour 2 tablespoons of oil onto each baking sheet and tilt to coat. Heat the pans in the oven 5 minutes.',
    'Grate the potatoes and onion. ' + SQUEEZE,
    'Mix with the eggs, flour, salt and pepper.',
    'Carefully take out the hot pans. Drop 2-tablespoon mounds on them, flatten to 3 inches, and brush the tops with the remaining oil.',
    'Bake 15 minutes, until browned underneath. Flip, swap the pans between racks and bake 10 to 15 minutes more, until crisp and golden.',
  ],
  safety=[],
  make_ahead='Bake a day ahead and recrisp at 400°F on a rack.',
  freezer=(True, 'Freeze baked latkes up to 3 months; reheat at 400°F.'),
  leftovers=LATKE_LEFT,
  kids='Kids can mix and shape the latkes on the cool pan corners with a grown-up placing them on the hot pans.',
  swaps={'gluten_free': 'Use potato starch instead of flour.'},
  prep_day=dict(ahead='Bake ahead and recrisp.', station='oven', oven_f=450, active=30, keeps_days=3),
  pairs=['onion-braised-brisket', 'roast-chicken'])

# =====================================================================  FRIED SWEETS
R(id='sufganiyot', name='Sufganiyot (Jelly Doughnuts)', emoji='🍩', servings=16, serving_size='1 doughnut (makes about 16)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=40, cook=30, inactive=150,
  equipment=['stand mixer with dough hook, or a large bowl', 'rolling pin', '2½- to 3-inch round cutter or a glass', 'baking sheets', 'parchment paper', 'large heavy pot or Dutch oven', 'deep-fry thermometer',
             'spider or slotted spoon', 'wire rack', 'piping bag with a round tip, or a zip-top bag', 'a lid or sheet pan that covers the pot'],
  summary='Soft, yeasted doughnuts fried golden, filled with jam and dusted with powdered sugar. In Israel they are the Hanukkah treat; they take an afternoon, mostly waiting for the dough to rise.',
  ingredients='''
Dough:
3/4 cup whole-milk | warm, about 110°F
1 package yeast | 2¼ teaspoons
1/4 cup sugar
3 cup flour | plus more for rolling
1/2 tsp salt
2 each eggs | room temperature
3 tbsp unsalted-butter | softened
1 tsp vanilla
To fry and fill:
^2 quart vegetable-oil | for frying
3/4 cup jam | strawberry or raspberry, seedless
1/3 cup powdered-sugar
''',
  steps=[
    'Stir the warm milk, yeast and 1 tablespoon of the sugar together; let stand 5 to 10 minutes until foamy.',
    'Mix in the remaining sugar, the flour, salt, eggs, butter and vanilla. Knead 6 to 8 minutes (or 5 minutes with a dough hook) until soft, smooth and slightly tacky. Add a spoonful of flour only if it’s very sticky.',
    'Cover and let rise in a warm spot 1 to 1½ hours, until doubled.',
    'Roll the dough ½ inch thick on a floured counter and cut rounds. Set them on floured parchment, cover loosely and let rise 30 to 45 minutes, until puffy. Reroll the scraps once.',
    FRY_SAFE.replace('(350 to 375°F)', '(about 350°F)') + ' Use a deep pot with oil about 2 inches deep and at least 3 inches of room above it.',
    'Heat the oil to 350°F. Fry 3 or 4 doughnuts at a time, lowering them in gently by hand-holding the parchment edge or with the spider, 1½ to 2 minutes per side, until deep golden. Hotter oil browns the outside before the inside cooks; keep it near 350°F.',
    'Drain on a rack. Tear the first one open to check that the center is cooked through, not doughy; fry the rest a little longer if needed.',
    'When cool enough to handle, poke a hole in the side of each with a skewer or chopstick, wiggle it to make a pocket, and pipe in about 2 teaspoons of jam. Dust with powdered sugar.',
    'Turn off the burner and let the oil cool completely before straining or throwing it away in a sealed container.',
  ],
  safety=[],
  make_ahead='Make the dough the night before and let it rise slowly in the refrigerator; let it warm for 30 minutes before rolling. Doughnuts are best the day they’re fried.',
  freezer=(True, 'Freeze unfilled doughnuts up to 1 month; thaw, warm at 350°F for 5 minutes, then fill and dust.'),
  leftovers=('Keep at room temperature, loosely covered, for 1 day.', None),
  kids='Kids can cut out the rounds, poke the jam holes in cooled doughnuts and shake on the powdered sugar. The frying is for grown-ups.',
  swaps={'baked': 'For a lower-oil version, bake the risen rounds at 375°F for 10 to 12 minutes, brush with melted butter and roll in sugar before filling; they’ll be softer and more like rolls.',
         'fillings': 'Try lemon curd, chocolate spread or a thick vanilla custard.', 'dairy_free': 'Use water or oat milk and oil instead of milk and butter.'},
  prep_day=dict(ahead='Make the dough the night before.', station='stove', oven_f=None, active=60, keeps_days=1),
  pairs=['bimuelos', 'classic-potato-latkes'])

R(id='bimuelos', name='Bimuelos (Honey Fritters)', emoji='🍯', servings=8, serving_size='4 fritters (makes about 32)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['kid-friendly'], prep=15, cook=25, inactive=75,
  equipment=['large bowl', 'large heavy pot', 'deep-fry thermometer', '2 spoons', 'slotted spoon', 'wire rack', 'small saucepan', 'a lid or sheet pan that covers the pot'],
  summary='Light, puffy yeasted fritters drizzled with warm honey syrup and cinnamon, eaten at Hanukkah in many Sephardic Jewish families. No rolling or cutting: the batter goes straight into the oil by the spoonful.',
  ingredients='''
2 cup flour
1 package yeast
1 tbsp sugar
1/2 tsp salt
1 1/2 cup water | warm, about 110°F
^2 quart vegetable-oil | for frying
Syrup:
1/2 cup honey
1/4 cup water
1 tsp lemon-juice
1/2 tsp cinnamon
''',
  steps=[
    'Whisk the flour, yeast, sugar and salt. Stir in the warm water to make a thick, sticky batter. Cover and let rise in a warm place about 1 hour, until doubled and bubbly.',
    FRY_SAFE.replace('(350 to 375°F)', '(about 365°F)') + ' Use a deep pot with oil about 2 inches deep and plenty of room above it.',
    'Heat the oil to 365°F. Wet two spoons and drop walnut-size blobs of batter into the oil, a few at a time. Fry 3 to 4 minutes, turning, until puffed and golden all over. Drain on the rack.',
    'Warm the honey, water and lemon juice until runny. Drizzle over the fritters and dust with cinnamon. Serve warm.',
    'Turn off the burner and let the oil cool completely before throwing it away.',
  ],
  safety=[],
  make_ahead='Best fresh. Mix the batter an hour before you want to fry.',
  freezer=(False, 'They lose their crispness.'),
  leftovers=('Eat the same day.', None),
  kids='Kids can stir the batter, watch it rise, and drizzle the honey.',
  swaps={'sugar_syrup': 'Use simple syrup with a strip of orange peel instead of honey, or roll them in cinnamon sugar.'},
  prep_day=None,
  pairs=['sufganiyot', 'classic-potato-latkes'])

# =====================================================================  THE MAIN AND SIDES
R(id='onion-braised-brisket', name='Onion-Braised Brisket', emoji='🥩', servings=10, serving_size='about 4 oz sliced brisket with onions and gravy',
  meal=['dinner'], protein='beef', method=['oven', 'stovetop'], tags=['make-ahead', 'leftovers'], prep=30, cook=225, inactive=480,
  equipment=['large Dutch oven or roasting pan with a tight lid (or heavy foil)', 'large skillet', 'food thermometer', 'sharp carving knife', 'cutting board'],
  summary='A beef brisket browned and braised slowly on a thick bed of onions with tomato, garlic and broth until fork-tender. Like many braises, it tastes best made a day ahead, chilled, sliced and reheated in its gravy.',
  ingredients='''
5 lb brisket | first cut (flat), with a thin layer of fat
2 tsp kosher-salt
1 tsp black-pepper
1 tsp paprika
2 tbsp vegetable-oil
3 each onion | halved and thinly sliced
6 clove garlic | sliced
2 tbsp tomato-paste
1 cup beef-broth
1 cup crushed-tomatoes
2 tbsp brown-sugar
2 tbsp red-wine-vinegar
3 leaf bay-leaves
4 sprig thyme
3 each carrot | in chunks
''',
  steps=[
    'Heat the oven to 325°F. Pat the brisket dry and rub it all over with the salt, pepper and paprika. Wash your hands.',
    'Heat the oil in the Dutch oven over medium-high and brown the brisket well, 5 to 6 minutes per side (cut it in half to fit if needed). Set it aside on a plate.',
    'Lower the heat to medium, add the onions and cook, stirring and scraping up the browned bits, 12 to 15 minutes, until soft and golden. Stir in the garlic and tomato paste for 1 minute.',
    'Stir in the broth, tomatoes, brown sugar, vinegar, bay leaves and thyme. Set the brisket fat side up on the onions, tuck the carrots around, and spoon some onions over the top.',
    'Cover tightly and braise 3½ to 4 hours, until a fork slides in with almost no resistance. Beef is safe at 145°F (USDA); brisket is cooked far beyond that, near 200°F, to become tender.',
    'Make it ahead (the usual way): cool the brisket in its liquid for up to an hour, then refrigerate it, covered, overnight. The next day lift off the hardened fat, slice the cold meat across the grain about ¼ inch thick, and lay the slices back in the gravy.',
    'Reheat covered at 325°F for 45 to 60 minutes, until the gravy bubbles and the center slices reach 165°F. Pull out the bay leaves and thyme stems and serve with the onions and gravy.',
    'Serving it the same day instead: rest the brisket 20 minutes, skim the fat from the gravy, then slice across the grain.',
  ],
  safety=[T_BRISKET, T_REHEAT],
  make_ahead='Braise up to 2 days ahead and refrigerate in its gravy; slice cold and reheat to 165°F.',
  freezer=(True, 'Freeze sliced brisket in its gravy up to 3 months. Thaw in the refrigerator and reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days (USDA). Reheat to 165°F. Great on challah the next day.', 'lunch'),
  kids='Kids can rub the spices on (then wash hands well), tuck in the carrots, and help peel the onions.',
  swaps={'slow_cooker': 'Brown the meat and onions, then cook everything in a slow cooker on low 8 to 10 hours.', 'sweet_and_sour': 'Use ½ cup ketchup in place of the crushed tomatoes and add ¼ cup more brown sugar.'},
  prep_day=dict(ahead='Braise the brisket a day ahead; chill, slice and reheat in the gravy.', station='oven', oven_f=325, active=45, keeps_days=4),
  pairs=['classic-potato-latkes', 'potato-kugel', 'carrot-tzimmes'])

R(id='potato-kugel', name='Crispy Potato Kugel', emoji='🥘', servings=10, serving_size='1 square (1/10 of a 9x13 pan)',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=25, cook=75,
  equipment=['9x13-inch baking dish', 'box grater or food processor', 'clean kitchen towel', 'large bowl', 'skillet'],
  summary='A golden baked pudding of grated potatoes and sweet sautéed onions, crisp on top and at the edges and tender inside. Like latkes, but all in one pan.',
  ingredients='''
4 lb russet-potato | peeled
2 each onion | 1 grated, 1 chopped
1/3 cup vegetable-oil | divided
5 each eggs | beaten
1/3 cup flour | or matzo meal
2 tsp kosher-salt
1/2 tsp black-pepper
''',
  steps=[
    'Heat the oven to 400°F. Cook the chopped onion in 2 tablespoons of the oil until golden, about 10 minutes.',
    'Pour 2 tablespoons of oil into the baking dish and put it in the oven to heat while you grate.',
    'Grate the potatoes and the second onion. Squeeze them dry in a towel, a handful at a time.',
    'Mix the potatoes with the cooked onion, eggs, flour, salt, pepper and the remaining oil.',
    'Carefully take out the hot dish and spread the potato mixture in it; it should sizzle. Bake 60 to 75 minutes, until deep golden and crisp on top and a knife slides easily into the center (it reaches well past 160°F, done for an egg dish).',
    'Let it rest 10 minutes and cut into squares.',
  ],
  safety=[T_EGGS],
  make_ahead='Bake up to 2 days ahead. Reheat uncovered at 375°F for 20 to 25 minutes, until hot (165°F) and crisp again.',
  freezer=(True, 'Freeze baked squares up to 3 months; reheat from frozen at 375°F.'),
  leftovers=LEFT,
  kids='Kids can beat the eggs and mix everything with a big spoon.',
  swaps={'gluten_free': 'Use potato starch instead of flour.'},
  prep_day=dict(ahead='Bake the kugel.', station='oven', oven_f=400, active=25, keeps_days=4),
  pairs=['onion-braised-brisket', 'roast-chicken'])

R(id='carrot-tzimmes', name='Carrot and Sweet Potato Tzimmes', emoji='🥕', servings=8, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=20, cook=60,
  equipment=['9x13-inch baking dish', 'foil', 'small bowl'],
  summary='Carrots and sweet potatoes baked with dried apricots and raisins in orange juice and honey until glazed and tender. A sweet side that sits happily beside brisket.',
  ingredients='''
2 lb carrot | in ½-inch coins
1 1/2 lb sweet-potato | peeled, in 1-inch chunks
1/2 cup dried-apricots | halved
1/3 cup raisins
3/4 cup orange-juice
1/4 cup honey
2 tbsp vegetable-oil
1/2 tsp cinnamon
1/2 tsp kosher-salt
''',
  steps=[
    'Heat the oven to 375°F.',
    'Toss everything together in the baking dish.',
    'Cover with foil and bake 40 minutes. Uncover, stir, and bake 20 to 25 minutes more, stirring once, until the vegetables are tender and glazed.',
  ],
  safety=[],
  make_ahead='Bake up to 2 days ahead; reheat covered at 350°F until hot.',
  freezer=(True, 'Freezes up to 2 months.'),
  leftovers=LEFT,
  kids='Kids can measure and toss everything in the pan.',
  swaps={'prunes': 'Prunes are a traditional addition; use them in place of the apricots.'},
  prep_day=dict(ahead='Bake the tzimmes.', station='oven', oven_f=375, active=20, keeps_days=4),
  pairs=['onion-braised-brisket', 'potato-kugel'])

R(id='cheese-blintzes', name='Cheese Blintzes', emoji='🥞', servings=6, serving_size='2 blintzes (makes 12)',
  meal=['breakfast', 'dinner'], protein='vegetarian', method=['stovetop', 'oven'], tags=['make-ahead', 'kid-friendly'], prep=40, cook=35, inactive=30,
  equipment=['blender or whisk and bowl', '8-inch nonstick skillet', 'baking dish', 'mixing bowl', 'spatula'],
  summary='Thin crepes wrapped around a lightly sweet ricotta and cream cheese filling, browned in butter. A favorite for a dairy meal at Hanukkah, served with sour cream and berries or applesauce.',
  ingredients='''
Crepes:
1 cup flour
1 1/4 cup whole-milk
3 each eggs
2 tbsp unsalted-butter | melted, plus more for the pan
1/4 tsp salt
Filling:
15 oz ricotta | drained in a strainer 30 minutes
4 oz cream-cheese | softened
1 each egg-yolks
3 tbsp sugar
1 tsp vanilla
1 each lemon | zest only
For cooking and serving:
2 tbsp unsalted-butter
?1/2 cup sour-cream
?1 cup blueberries | or strawberries or applesauce
''',
  steps=[
    'Blend the crepe ingredients until smooth and let the batter rest 30 minutes (or overnight in the refrigerator).',
    'Heat the skillet over medium and brush with butter. Pour in about 3 tablespoons batter and swirl to coat the bottom thinly. Cook about 1 minute, until the top is set and the edge lifts; cook on one side only. Slide it out, browned side up, and repeat, stacking the crepes.',
    'Mix the filling ingredients until smooth.',
    'Spoon 2 tablespoons filling onto the browned side of each crepe near one edge. Fold in the sides, then roll up like a little package.',
    'Heat the oven to 375°F. Melt the butter in a skillet over medium heat and brown the blintzes seam side down first, 2 minutes per side. Move them to the baking dish and bake 10 to 12 minutes, until the filling is hot, 160°F, since it contains raw egg (USDA).',
    'Serve warm with sour cream and berries or applesauce.',
  ],
  safety=[T_EGGS],
  make_ahead='Fill and roll the blintzes up to a day ahead and refrigerate, or freeze them; brown and bake when ready.',
  freezer=(True, 'Freeze filled, unbrowned blintzes in one layer, then bag, up to 3 months. Brown from frozen and bake 20 minutes, to 160°F.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 days. Reheat at 350°F until hot (165°F).', 'lunch'),
  kids='Kids can stir the filling and roll up the blintzes (the folding is like wrapping a present).',
  swaps={'cottage_cheese': 'Use small-curd cottage cheese, drained and pressed through a strainer, in place of the ricotta.', 'fruit': 'Fill with thick cooked apples or cherries instead of cheese.'},
  prep_day=dict(ahead='Make the crepes and fill them.', station='stove', oven_f=375, active=50, keeps_days=2),
  pairs=['zucchini-carrot-latkes', 'noodle-kugel'])

R(id='brisket-challah-sandwiches', name='Leftover Brisket Sandwiches on Challah', emoji='🥪', servings=4, serving_size='1 sandwich',
  meal=['lunch', 'dinner'], protein='beef', method=['stovetop'], tags=['quick', 'leftovers'], prep=10, cook=10,
  equipment=['small saucepan or skillet', 'food thermometer', 'bread knife'],
  summary='The next day’s best meal: brisket slices warmed in their gravy and piled on thick slices of challah with a little horseradish and the sweet braised onions.',
  ingredients='''
1 lb brisket | leftover onion-braised brisket, sliced, with ½ cup of its gravy and onions
8 slice challah | thick slices
2 tbsp horseradish | prepared
1 cup salad-mix | or sliced pickles
''',
  steps=[
    'Warm the brisket slices in their gravy and onions in a covered pan over medium-low heat, 6 to 8 minutes, until steaming and 165°F (USDA).',
    'Toast the challah lightly if you like. Spread with horseradish.',
    'Pile on the brisket and onions, add greens or pickles, and close the sandwiches. Spoon a little gravy on top for dipping.',
  ],
  safety=[('leftovers, reheated', 165, 0)],
  make_ahead=None,
  freezer=(False, 'Freeze the brisket, not the sandwiches.'),
  leftovers=None,
  kids='Kids can build their own sandwiches; skip the horseradish for them.',
  swaps={'latke_sandwich': 'Use two latkes instead of bread for a latke-brisket sandwich.'},
  prep_day=None,
  pairs=['onion-braised-brisket', 'green-salad'])


# =====================================================================  THE PAGE PLAN
COURSES = [
    {'id': 'latkes', 'title': 'Latkes, four ways', 'icon': '🥔',
     'intro': 'Potato latkes fried in oil are the classic; sweet potato and zucchini latkes add color, and the sheet-pan version saves standing at the stove. Applesauce from scratch takes about 30 minutes.',
     'items': ['r:classic-potato-latkes', 'r:sweet-potato-latkes', 'r:zucchini-carrot-latkes', 'r:sheet-pan-latkes', 's:applesauce']},
    {'id': 'mains', 'title': 'Brisket and other mains', 'icon': '🥩',
     'intro': 'Brisket is the centerpiece in many American Jewish homes, and it is best made a day ahead. A roast chicken or a pot of chicken soup are other family favorites.',
     'items': ['r:onion-braised-brisket', 'r:roast-chicken', 'r:chicken-noodle-soup', 'r:brisket-challah-sandwiches']},
    {'id': 'sides', 'title': 'Kugel, vegetables and challah', 'icon': '🥘',
     'intro': 'Potato kugel for a meat meal and sweet noodle kugel for a dairy one, a sweet tzimmes, something green, and a braided challah.',
     'items': ['r:potato-kugel', 'r:noodle-kugel', 'r:carrot-tzimmes', 'r:roasted-root-vegetables', 'r:balsamic-roasted-brussels-sprouts', 'r:green-beans', 'r:green-salad', 's:challah']},
    {'id': 'dairy', 'title': 'A dairy meal', 'icon': '🧀',
     'intro': 'Many families also eat cheese and other dairy foods during Hanukkah, a custom tied to the story of Judith. Blintzes, cheese pancakes and noodle kugel make a dairy supper with latkes and sour cream.',
     'items': ['r:cheese-blintzes', 'r:cottage-cheese-pancakes', 'r:lemon-ricotta-pancakes', 'r:borscht']},
    {'id': 'sweets', 'title': 'Doughnuts and fried sweets', 'icon': '🍩',
     'intro': 'Sufganiyot, jelly doughnuts, are the Hanukkah treat in Israel; bimuelos, honey-soaked fritters, come from Sephardic kitchens.',
     'items': ['r:sufganiyot', 'r:bimuelos', 'r:apple-pear-crisp']},
]
SCRATCH = ['applesauce', 'challah', 'chicken-stock', 'egg-noodles', 'ricotta', 'butter']
DEFAULT_MENU = ['onion-braised-brisket', 'classic-potato-latkes', 'sweet-potato-latkes', 'potato-kugel', 'carrot-tzimmes', 'green-salad', 'sufganiyot']
DAY = {
    'classic-potato-latkes': {'fry': 45, 'last': True}, 'sweet-potato-latkes': {'fry': 35, 'last': True}, 'zucchini-carrot-latkes': {'fry': 30, 'last': True},
    'sheet-pan-latkes': {'oven': [450, 30], 'last': True},
    'onion-braised-brisket': {'oven': [325, 60], 'ahead': 1, 'ahead_part': 'braise the brisket, chill it, then slice it cold'},
    'roast-chicken': {'oven': [425, 80]}, 'chicken-noodle-soup': {'ahead': 2, 'stove': 15}, 'brisket-challah-sandwiches': {'stove': 10},
    'potato-kugel': {'oven': [400, 75]}, 'noodle-kugel': {'oven': [350, 60]}, 'carrot-tzimmes': {'oven': [375, 60]}, 'roasted-root-vegetables': {'oven': [425, 40]},
    'balsamic-roasted-brussels-sprouts': {'oven': [425, 25]}, 'green-beans': {'stove': 15}, 'green-salad': {'chill': 15},
    'cheese-blintzes': {'oven': [375, 12], 'ahead_part': 'make the crepes and fill them'}, 'cottage-cheese-pancakes': {'stove': 25}, 'lemon-ricotta-pancakes': {'stove': 25},
    'borscht': {'ahead': 2, 'stove': 15},
    'sufganiyot': {'fry': 40, 'ahead_part': 'make the dough and let it rise slowly in the refrigerator overnight'}, 'bimuelos': {'fry': 25}, 'apple-pear-crisp': {'ahead': 1},
}
HOWMUCH = [
    {'what': 'Latkes (3-inch)', 'per': 4, 'unit': 'latkes', 'note': '3 lb of potatoes makes about 24.'},
    {'what': 'Brisket, raw weight', 'per': 0.5, 'unit': 'lb', 'note': 'It shrinks by about a third to a half as it braises.'},
    {'what': 'Applesauce', 'per': 0.25, 'unit': 'cups', 'note': '3 lb of apples makes about 4 cups.'},
    {'what': 'Sufganiyot', 'per': 1.5, 'unit': 'doughnuts', 'note': 'One batch makes about 16.'},
    {'what': 'Kugel or other sides, together', 'per': 1, 'unit': 'cups', 'note': 'Two or three sides.'},
]
GOALS_EXCLUDE = ['classic-potato-latkes', 'sweet-potato-latkes', 'zucchini-carrot-latkes', 'sheet-pan-latkes', 'sufganiyot', 'bimuelos', 'onion-braised-brisket', 'potato-kugel',
                 'carrot-tzimmes', 'cheese-blintzes', 'brisket-challah-sandwiches']
# Hebcal: Hanukkah begins at sundown on the first date and ends at nightfall on the second
DATES = [['2026-12-04', '2026-12-12'], ['2027-12-24', '2028-01-01'], ['2028-12-12', '2028-12-20'], ['2029-12-01', '2029-12-09'], ['2030-12-20', '2030-12-28']]

SOURCES = [
    ('hebcal', 'Chanukah 2026 (dates for 2026 to 2031)', 'Hebcal', 'https://www.hebcal.com/holidays/chanukah-2026'),
    ('fsis-temps', 'Safe Temperature Chart', 'USDA FSIS', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'),
    ('usfa-cooking', 'Cooking Fire Safety', 'U.S. Fire Administration', 'https://www.usfa.fema.gov/prevention/home-fires/prevent-fires/cooking/'),
    ('cfd-grease', 'Safety Tips Related to Kitchen Grease Fires (with NFPA guidance)', 'Cambridge Fire Department', 'https://www.cambridgema.gov/cfd/News/2023/05/cookingfiresafety'),
]
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for (a, b, c, d), w in zip(SOURCES, ['the holiday’s dates', 'safe internal temperatures', 'stand by your pan; lid nearby', 'never water on a grease fire'])}
FRY = [U['usfa-cooking'], U['cfd-grease']]
CREDITS = {
    'classic-potato-latkes': [G('Latke', 'history: potato latkes after the 16th century')] + FRY,
    'sweet-potato-latkes': [G('Latke', 'background')] + FRY, 'zucchini-carrot-latkes': [G('Latke', 'background')] + FRY, 'sheet-pan-latkes': [G('Latke', 'background')],
    'sufganiyot': [G('Sufganiyah', 'history')] + FRY, 'bimuelos': [G('Hanukkah', 'fried foods in Sephardic communities')] + FRY,
    'onion-braised-brisket': [G('Brisket_(Jewish_dish)', 'background'), U['fsis-temps']],
    'potato-kugel': [G('Potato_kugel', 'background'), U['fsis-temps']], 'carrot-tzimmes': [G('Tzimmes', 'background')],
    'cheese-blintzes': [G('Blintz', 'background'), G('Latke', 'the dairy custom and Judith'), U['fsis-temps']],
    'brisket-challah-sandwiches': [G('Challah', 'background'), U['fsis-temps']],
}

META = {'anchor': 'your-menu', 'title': 'A Hanukkah table', 'url': 'meal-prep/hanukkah/', 'icon': '🕎', 'blurb': 'Hanukkah table collection',
        'keywords': ['Hanukkah', 'Chanukah', 'latkes', 'sufganiyot', 'jelly doughnuts', 'brisket', 'kugel', 'applesauce', 'challah', 'Jewish holiday food']}
EVENT = {'label': 'Dinner', 'time': '18:00', 'hours': 2, 'hot': False, 'date': 'hanukkah'}


def kosher_sets(new):
    """Recipes with dairy and recipes with meat, for the menu's gentle 'meat and dairy together' note."""
    allr = {r['id']: r for r in new}
    for f in [os.path.join(SITE, 'data/meals/recipes.json')] + glob.glob(os.path.join(SITE, 'data/meals/recipes/*.json')):
        if not f.endswith(SLUG + '.json'):
            for r in json.load(open(f))['recipes']:
                allr.setdefault(r['id'], r)
    ids = [i.split(':', 1)[1] for c in COURSES for i in c['items'] if i.startswith('r:')]
    dairy = [i for i in ids if 'milk' in allr[i]['allergens']]
    meat = [i for i in ids if allr[i]['protein'] in ('beef', 'chicken', 'turkey', 'lamb', 'pork')]
    return dairy, meat


def main():
    out = build(RECIPES, CREDITS, SLUG)
    dairy, meat = kosher_sets(out)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'day': DAY, 'howmuch': HOWMUCH,
            'full_courses': ['mains'], 'goals_exclude': GOALS_EXCLUDE, 'event': EVENT, 'dates': DATES, 'dairy': dairy, 'meat': meat,
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, 'A Hanukkah table (/meal-prep/hanukkah/): new recipes plus the page plan, which reuses recipes from the other files by id. '
                           'Edit scripts/meals/src/build_hanukkah.py and run it; allergens, diet and guides are derived from the catalog.')


if __name__ == '__main__':
    main()
