#!/usr/bin/env python3
"""Builds data/meals/recipes/birthday.json: the Birthday parties collection at /meal-prep/birthday/.

Run:  python3 scripts/meals/src/build_birthday.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds the NEW recipes (collection='birthday') and the page plan: courses that mix them with party recipes
already in Meal Prep (by id), the cake sizes the cake calculator uses, and the countdown's make-ahead tasks.

Safety comes only from USDA FSIS ("Holiday or Party Buffets": 2 hours at room temperature, hot food 140 °F or warmer,
cold food 40 °F or colder, small platters replaced rather than topped up; safe minimum temperatures), FDA (don't eat or
taste raw flour, dough or batter; the nine major food allergens and reading labels) and CDC (choking hazards for young
children).
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coll_util import G, build, write  # noqa: E402

SLUG = 'birthday'
RAW = 'Don’t eat or taste the raw batter, and don’t let kids lick the spoon: raw flour and raw eggs can carry germs (FDA). Bake it first.'
BUFFET = 'At the party, set it out for no more than 2 hours, then refrigerate what’s left (USDA).'
PANS = 'Grease the pans, line the bottoms with parchment circles, and grease the parchment. Flour the sides lightly, tapping out the extra.'

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  CAKES
R(id='vanilla-layer-cake', name='Vanilla Birthday Layer Cake', emoji='🎂', servings=16, serving_size='1 slice (1/16 of the cake), unfrosted',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=25, cook=30, inactive=60,
  equipment=['two 9-inch round cake pans', 'parchment paper', 'stand or hand mixer', 'mixing bowls', 'cooling racks', 'toothpick'],
  summary='A tender, buttery two-layer vanilla cake, the classic birthday cake. Frost it with vanilla or chocolate buttercream.',
  ingredients='''
3 cup flour | spooned and leveled
1 tbsp baking-powder
3/4 tsp salt
1 cup unsalted-butter | softened (2 sticks)
2 cup sugar
4 each eggs | at room temperature
1 tbsp vanilla
1 1/4 cup whole-milk | at room temperature
''',
  steps=[
    'Heat the oven to 350°F with a rack in the middle. ' + PANS,
    'Whisk the flour, baking powder and salt in a bowl.',
    'Beat the butter and sugar on medium-high speed for 3 to 4 minutes, until pale and fluffy. Beat in the eggs one at a time, then the vanilla.',
    'On low speed, add the flour mixture in three parts and the milk in two, starting and ending with flour. Mix just until no flour shows. ' + RAW,
    'Divide the batter between the pans and smooth the tops. Bake 28 to 32 minutes, until the tops spring back and a toothpick in the center comes out clean.',
    'Cool in the pans 10 minutes, then turn the layers out onto racks, peel off the parchment and cool completely, about 1 hour, before frosting.',
    'To frost, see “Frost a layer cake” on the Birthday parties page: a thin crumb coat, 20 minutes in the refrigerator, then the final coat.',
  ],
  safety=[],
  make_ahead='Bake the layers up to 2 days ahead, cool, wrap tightly and keep at room temperature, or freeze them. Frost the day before or the morning of the party.',
  freezer=(True, 'Wrap cooled layers in plastic wrap and foil and freeze up to 2 months. Frost them while still a little frozen; they crumb less.'),
  leftovers=('Keep a buttercream-frosted cake covered at room temperature up to 2 days, or refrigerated up to 5.', None),
  kids='Kids can measure, crack eggs into a separate bowl, and run the mixer on low with a grown-up.',
  swaps={'cupcakes': 'This batter makes about 30 cupcakes; bake 18 to 20 minutes.', 'sheet': 'Bake it in a 9-by-13-inch pan for 35 to 40 minutes.',
         'gluten_free': 'A cup-for-cup gluten-free flour blend that contains xanthan gum works in this cake.'},
  prep_day=dict(ahead='Bake the layers up to 2 days before.', station='oven', oven_f=350, active=25, keeps_days=2),
  pairs=['vanilla-buttercream', 'chocolate-buttercream'])

R(id='chocolate-layer-cake', name='Chocolate Birthday Layer Cake', emoji='🍫', servings=16, serving_size='1 slice (1/16 of the cake), unfrosted',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=20, cook=32, inactive=60,
  equipment=['two 9-inch round cake pans', 'parchment paper', 'large mixing bowl', 'whisk', 'kettle', 'cooling racks'],
  summary='A dark, moist one-bowl chocolate cake made with cocoa, oil and hot water. No mixer needed.',
  ingredients='''
1 3/4 cup flour
2 cup sugar
3/4 cup cocoa | unsweetened
1 1/2 tsp baking-soda
1 1/2 tsp baking-powder
1 tsp salt
2 each eggs
1 cup whole-milk
1/2 cup vegetable-oil
2 tsp vanilla
1 cup water | boiling
''',
  steps=[
    'Heat the oven to 350°F. ' + PANS,
    'Whisk the flour, sugar, cocoa, baking soda, baking powder and salt in a large bowl until no lumps of cocoa remain.',
    'Add the eggs, milk, oil and vanilla and whisk 2 minutes, until smooth.',
    'A grown-up pours in the boiling water while whisking slowly. The batter will be thin; that’s right. ' + RAW,
    'Pour into the pans and bake 30 to 35 minutes, until a toothpick in the center comes out with a few moist crumbs but no wet batter.',
    'Cool 10 minutes in the pans, then turn out onto racks and cool completely before frosting.',
  ],
  safety=[],
  make_ahead='Bake up to 2 days ahead, wrap well and keep at room temperature, or freeze.',
  freezer=(True, 'Wrap cooled layers in plastic wrap and foil; freeze up to 2 months.'),
  leftovers=('Keep covered at room temperature up to 2 days, or refrigerated up to 5.', None),
  kids='Kids can whisk the dry ingredients. A grown-up adds the boiling water.',
  swaps={'deeper_flavor': 'Use hot coffee instead of boiling water.', 'dairy_free': 'Use any plant milk with 1 tablespoon vinegar stirred in.',
         'cupcakes': 'Makes about 30 cupcakes; bake 18 to 22 minutes.'},
  prep_day=dict(ahead='Bake the layers up to 2 days before.', station='oven', oven_f=350, active=20, keeps_days=2),
  pairs=['chocolate-buttercream', 'vanilla-buttercream'])

R(id='vanilla-sheet-cake', name='Vanilla Sheet Cake for a Crowd', emoji='🟨', servings=24, serving_size='1 square (1/24 of a half-sheet), unfrosted',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=25, cook=32, inactive=60,
  equipment=['half-sheet pan (13 by 18 inches, 1 inch deep)', 'parchment paper', 'stand or hand mixer', 'mixing bowls', 'cooling rack', 'offset spatula'],
  summary='One big, flat vanilla cake for a class or a crowd. Frost it right in the pan; no stacking or leveling.',
  ingredients='''
4 1/2 cup flour
4 1/2 tsp baking-powder
1 tsp salt
1 1/2 cup unsalted-butter | softened (3 sticks)
3 cup sugar
6 each eggs | at room temperature
1 1/2 tbsp vanilla
2 cup whole-milk | at room temperature
''',
  steps=[
    'Heat the oven to 350°F. Grease the half-sheet pan, line it with parchment, and grease the parchment.',
    'Whisk the flour, baking powder and salt.',
    'Beat the butter and sugar 4 minutes, until fluffy. Beat in the eggs one at a time, then the vanilla.',
    'On low speed, add the flour in three parts and the milk in two, mixing just until smooth. ' + RAW,
    'Spread the batter evenly in the pan. Bake 28 to 32 minutes, until golden and a toothpick in the center comes out clean.',
    'Cool completely in the pan on a rack. Frost the top with 1½ batches of buttercream and cut 4 by 6 for 24 squares (or 6 by 8 for 48 small ones).',
  ],
  safety=[],
  make_ahead='Bake a day ahead and keep it covered at room temperature; frost that evening or the morning of the party.',
  freezer=(True, 'Freeze the unfrosted cake, wrapped well in the pan, up to 1 month.'),
  leftovers=('Keep covered at room temperature up to 2 days, or refrigerated up to 5.', None),
  kids='Kids can decorate the frosted top with sprinkles, fruit or a candy border.',
  swaps={'smaller': 'Halve everything and bake in a 9-by-13-inch pan for 30 to 35 minutes.', 'chocolate': 'See the chocolate sheet cake.'},
  prep_day=dict(ahead='Bake the day before.', station='oven', oven_f=350, active=25, keeps_days=2),
  pairs=['vanilla-buttercream', 'chocolate-buttercream'])

R(id='chocolate-sheet-cake', name='Chocolate Sheet Cake with Fudge Frosting', emoji='🟫', servings=24, serving_size='1 square, frosted',
  meal=['snack'], protein='vegetarian', method=['oven', 'stovetop'], tags=['kid-friendly', 'make-ahead'], prep=20, cook=25, inactive=45,
  equipment=['half-sheet pan (13 by 18 inches)', 'two saucepans', 'large mixing bowl', 'whisk', 'spatula'],
  summary='A thin, fudgy chocolate cake in a half-sheet pan, with a glossy cocoa frosting poured over while it’s warm. Feeds a crowd, ready in about an hour.',
  ingredients='''
Cake:
2 cup flour
2 cup sugar
1 tsp baking-soda
1/2 tsp salt
1 cup unsalted-butter | 2 sticks
1/3 cup cocoa
1 cup water
1/2 cup buttermilk
2 each eggs
1 tsp vanilla
Frosting:
1/2 cup unsalted-butter | 1 stick
1/3 cup cocoa
1/3 cup whole-milk
3 1/2 cup powdered-sugar
1 tsp vanilla
''',
  steps=[
    'Heat the oven to 350°F and grease the half-sheet pan.',
    'Whisk the flour, sugar, baking soda and salt in a large bowl.',
    'In a saucepan, bring the butter, cocoa and water to a boil, stirring. Pour it over the flour mixture and whisk until smooth.',
    'Whisk in the buttermilk, eggs and vanilla. ' + RAW,
    'Pour into the pan and spread it to the corners. Bake 18 to 22 minutes, until a toothpick in the center comes out clean.',
    'About 5 minutes before the cake is done, make the frosting: melt the butter with the cocoa and milk in a saucepan, bring just to a simmer, take it off the heat and whisk in the powdered sugar and vanilla until smooth.',
    'Pour the warm frosting over the hot cake and spread it quickly; it sets as it cools. Cool at least 30 minutes before cutting into 24 squares.',
  ],
  safety=[],
  make_ahead='Bake the day before; keep it covered at room temperature.',
  freezer=(True, 'Freeze squares between layers of parchment up to 2 months.'),
  leftovers=('Keep covered at room temperature up to 3 days.', None),
  kids='Kids can whisk the dry ingredients and help pour the cooler parts. A grown-up handles the boiling butter and the hot frosting.',
  swaps={'nuts': 'Many families scatter chopped pecans over the frosting; leave them off for a nut-free party.', 'buttermilk': 'Use ½ cup milk with 1½ teaspoons vinegar stirred in.'},
  prep_day=dict(ahead='Bake the day before.', station='oven', oven_f=350, active=20, keeps_days=3),
  pairs=['party-lemonade'])

R(id='vanilla-cupcakes', name='Vanilla Cupcakes', emoji='🧁', servings=24, serving_size='1 cupcake, unfrosted',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=20, cook=20, inactive=45,
  equipment=['two 12-cup muffin pans', 'paper liners', 'mixer', 'mixing bowls', 'large spoon or scoop', 'cooling racks'],
  summary='Soft vanilla cupcakes, 24 to a batch. Easy to carry to school, easy to hand out, no slicing.',
  ingredients='''
2 1/2 cup flour
2 1/2 tsp baking-powder
1/2 tsp salt
3/4 cup unsalted-butter | softened (1½ sticks)
1 1/2 cup sugar
3 each eggs
1 tbsp vanilla
1 cup whole-milk
''',
  steps=[
    'Heat the oven to 350°F and line 24 muffin cups.',
    'Whisk the flour, baking powder and salt.',
    'Beat the butter and sugar 3 minutes until fluffy. Beat in the eggs one at a time, then the vanilla.',
    'On low, mix in the flour in three parts and the milk in two, just until smooth. ' + RAW,
    'Fill the liners two-thirds full (a scant ¼ cup each). Bake 18 to 20 minutes, until the tops spring back and a toothpick comes out clean.',
    'Cool 5 minutes in the pans, then on racks. Frost when completely cool: swirl on buttercream with a knife, or pipe it from a zip-top bag with a corner snipped off.',
  ],
  safety=[],
  make_ahead='Bake a day ahead and keep in a covered container; frost the day of the party.',
  freezer=(True, 'Freeze unfrosted cupcakes in a bag up to 2 months; thaw at room temperature in their bag.'),
  leftovers=('Keep covered at room temperature up to 2 days.', None),
  kids='Kids can fill the liners with a scoop and decorate the frosted tops.',
  swaps={'gluten_free': 'Use a cup-for-cup gluten-free flour blend with xanthan gum.', 'dairy_free': 'Use a plant-based butter stick and plant milk; check the butter label for milk.'},
  prep_day=dict(ahead='Bake the day before.', station='oven', oven_f=350, active=20, keeps_days=2),
  pairs=['vanilla-buttercream', 'chocolate-buttercream'])

R(id='chocolate-cupcakes', name='Chocolate Cupcakes', emoji='🧁', servings=24, serving_size='1 cupcake, unfrosted',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=15, cook=20, inactive=45,
  equipment=['two 12-cup muffin pans', 'paper liners', 'mixing bowl', 'whisk', 'kettle', 'cooling racks'],
  summary='Moist one-bowl chocolate cupcakes made with cocoa and oil. They stay soft for days.',
  ingredients='''
1 1/2 cup flour
1 1/2 cup sugar
3/4 cup cocoa
1 1/2 tsp baking-soda
3/4 tsp baking-powder
3/4 tsp salt
2 each eggs
3/4 cup whole-milk
1/2 cup vegetable-oil
2 tsp vanilla
3/4 cup water | boiling
''',
  steps=[
    'Heat the oven to 350°F and line 24 muffin cups.',
    'Whisk the flour, sugar, cocoa, baking soda, baking powder and salt.',
    'Whisk in the eggs, milk, oil and vanilla until smooth. A grown-up whisks in the boiling water; the batter will be thin. ' + RAW,
    'Fill the liners about half full (a pitcher or measuring cup makes it easy). Bake 18 to 20 minutes, until a toothpick comes out clean.',
    'Cool completely before frosting.',
  ],
  safety=[],
  make_ahead='Bake a day ahead; frost the day of the party.',
  freezer=(True, 'Freeze unfrosted up to 2 months.'),
  leftovers=('Keep covered at room temperature up to 3 days.', None),
  kids='Kids can line the pans and whisk the dry ingredients.',
  swaps={'dairy_free': 'Use plant milk.'},
  prep_day=dict(ahead='Bake the day before.', station='oven', oven_f=350, active=15, keeps_days=3),
  pairs=['vanilla-buttercream', 'chocolate-buttercream'])

R(id='egg-free-chocolate-cake', name='Egg-Free, Dairy-Free Chocolate Cake (Wacky Cake)', emoji='🎂', servings=9, serving_size='1 square (1/9 of an 8-inch cake)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['budget', 'kid-friendly', 'make-ahead'], prep=10, cook=32, inactive=30,
  equipment=['8-inch square baking pan', 'fork or whisk', 'measuring cups and spoons'],
  summary='The old “wacky cake”: no eggs, milk or butter, mixed right in the pan, risen with baking soda and vinegar. Handy when a guest can’t have eggs or dairy.',
  ingredients='''
1 1/2 cup flour
1 cup sugar
1/4 cup cocoa
1 tsp baking-soda
1/2 tsp salt
1/3 cup vegetable-oil
1 tbsp white-vinegar
1 tsp vanilla
1 cup water | cold
''',
  steps=[
    'Heat the oven to 350°F. You don’t need to grease the pan.',
    'Stir the flour, sugar, cocoa, baking soda and salt together right in the pan with a fork, and smooth it out.',
    'Poke three wells in the dry mixture: a big one, a medium one and a small one. Pour the oil into the big one, the vinegar into the medium one and the vanilla into the small one.',
    'Pour the water over everything and stir with the fork until no dry spots remain, getting into the corners. ' + RAW,
    'Bake 30 to 35 minutes, until a toothpick in the center comes out clean. Cool in the pan.',
    'Dust with powdered sugar, or frost with a dairy-free buttercream (see the swaps).',
  ],
  safety=[],
  make_ahead='Bake a day ahead; keep covered at room temperature.',
  freezer=(True, 'Freeze squares up to 2 months.'),
  leftovers=('Keep covered at room temperature up to 3 days.', None),
  kids='A great first cake: kids can do every step but the oven, and it’s fun to watch the vinegar fizz.',
  swaps={'frosting': 'For a dairy-free frosting, make the vanilla buttercream with vegetable shortening or a plant-based butter stick and plant milk. Check every label for milk.',
         'cupcakes': 'Doubled, it makes about 20 cupcakes; bake 18 to 20 minutes.', 'gluten_free': 'Use a cup-for-cup gluten-free flour blend.'},
  prep_day=dict(ahead='Bake the day before.', station='oven', oven_f=350, active=10, keeps_days=3),
  pairs=['party-lemonade'])

# =====================================================================  FROSTING AND TOPPINGS
R(id='vanilla-buttercream', name='Vanilla Buttercream', emoji='🍦', servings=16, serving_size='about 3 tablespoons (makes about 3½ cups)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick'], prep=12, cook=0,
  equipment=['stand or hand mixer', 'large bowl', 'sifter or fine strainer', 'spatula'],
  summary='Fluffy American buttercream: butter beaten with powdered sugar, cream and vanilla. Enough to fill and frost a two-layer cake or 24 cupcakes.',
  ingredients='''
1 cup unsalted-butter | softened (2 sticks)
4 cup powdered-sugar | sifted
3 tbsp heavy-cream | or milk
2 tsp vanilla
~1 pinch salt
''',
  steps=[
    'Beat the butter on medium-high for 3 minutes, until pale and creamy.',
    'On low speed, add the powdered sugar a cup at a time. Add the cream, vanilla and salt.',
    'Beat on medium-high 2 to 3 minutes, until light and fluffy. Add a spoonful more cream if it’s too stiff, or more sugar if too soft.',
    'To tint it, stir in food coloring a drop at a time; gel colors give stronger color with less liquid.',
  ],
  safety=[],
  make_ahead='Keeps 1 week in the refrigerator. Let it soften on the counter and beat it again before using.',
  freezer=(True, 'Freeze up to 3 months; thaw in the refrigerator and re-beat.'),
  leftovers=None,
  kids='Kids can add the sugar on low speed (with a towel over the bowl to stop the cloud) and choose the colors.',
  swaps={'dairy_free': 'Use vegetable shortening or a plant-based butter stick and plant milk; check labels for milk.', 'chocolate': 'See the chocolate buttercream.'},
  prep_day=dict(ahead='Make up to a week ahead and refrigerate.', station='none', oven_f=None, active=12, keeps_days=7),
  pairs=['vanilla-layer-cake', 'vanilla-cupcakes'])

R(id='chocolate-buttercream', name='Chocolate Buttercream', emoji='🍫', servings=16, serving_size='about 3 tablespoons (makes about 3½ cups)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick'], prep=12, cook=0,
  equipment=['stand or hand mixer', 'large bowl', 'sifter or fine strainer', 'spatula'],
  summary='Creamy cocoa buttercream for filling and frosting a two-layer cake or 24 cupcakes.',
  ingredients='''
1 cup unsalted-butter | softened (2 sticks)
3 1/2 cup powdered-sugar | sifted
3/4 cup cocoa | sifted
1/3 cup heavy-cream | or milk
2 tsp vanilla
~1 pinch salt
''',
  steps=[
    'Beat the butter on medium-high for 3 minutes, until creamy.',
    'On low speed, add the powdered sugar and cocoa alternately with the cream, a little at a time.',
    'Add the vanilla and salt and beat on medium-high 2 to 3 minutes, until fluffy. Adjust with a spoonful of cream or sugar.',
  ],
  safety=[],
  make_ahead='Keeps 1 week in the refrigerator; soften and re-beat before using.',
  freezer=(True, 'Freeze up to 3 months.'),
  leftovers=None,
  kids='Kids can sift the cocoa and sugar.',
  swaps={'dairy_free': 'Use shortening or a plant-based butter stick and plant milk; check labels for milk.'},
  prep_day=dict(ahead='Make up to a week ahead and refrigerate.', station='none', oven_f=None, active=12, keeps_days=7),
  pairs=['chocolate-layer-cake', 'chocolate-cupcakes'])

R(id='cream-cheese-frosting', name='Cream Cheese Frosting', emoji='🤍', servings=16, serving_size='about 3 tablespoons (makes about 3 cups)',
  meal=['snack'], protein='vegetarian', method=['no-cook'], tags=['make-ahead', 'quick'], prep=10, cook=0,
  equipment=['mixer', 'large bowl', 'spatula'],
  summary='Tangy, smooth frosting for chocolate, vanilla or carrot cake. A cake frosted with it lives in the refrigerator.',
  ingredients='''
8 oz cream-cheese | softened, full-fat block
1/2 cup unsalted-butter | softened (1 stick)
3 cup powdered-sugar | sifted
1 tsp vanilla
~1 pinch salt
''',
  steps=[
    'Beat the cream cheese and butter together until smooth, about 2 minutes. Both should be soft, or you’ll get lumps.',
    'On low speed, beat in the powdered sugar a cup at a time, then the vanilla and salt. Beat just until creamy; overbeating makes it runny.',
    'Chill 15 minutes if it’s too soft to spread.',
    'Keep a cake or cupcakes with this frosting in the refrigerator, and set it out for the party for no more than 2 hours (USDA).',
  ],
  safety=[],
  make_ahead='Keeps 5 days in the refrigerator.',
  freezer=(True, 'Freeze up to 1 month; thaw in the refrigerator and stir.'),
  leftovers=None,
  kids='Kids can add the sugar on low speed.',
  swaps={},
  prep_day=dict(ahead='Make up to 5 days ahead.', station='none', oven_f=None, active=10, keeps_days=5),
  pairs=['chocolate-layer-cake'])

R(id='hot-fudge-sauce', name='Hot Fudge Sauce (and a Sundae Bar)', emoji='🍨', servings=12, serving_size='2 tablespoons (makes about 1½ cups)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'quick', 'kid-friendly'], prep=5, cook=8,
  equipment=['small heavy saucepan', 'whisk', 'jar'],
  summary='Thick, glossy chocolate sauce in 10 minutes, for an ice cream sundae bar at the party or a scoop next to the cake.',
  ingredients='''
2/3 cup heavy-cream
1/3 cup corn-syrup
1/3 cup brown-sugar
1/4 cup cocoa
1 cup chocolate-chips | semisweet
2 tbsp unsalted-butter
1 tsp vanilla
~1 pinch salt
''',
  steps=[
    'Whisk the cream, corn syrup, brown sugar, cocoa and salt in a saucepan over medium heat. Bring to a simmer, whisking, and simmer 1 minute.',
    'Take it off the heat. Add the chocolate chips and butter, wait 1 minute, then whisk until smooth. Stir in the vanilla.',
    'Serve warm. A grown-up should check that it’s warm, not hot, before kids spoon it on.',
    'For a sundae bar, set out scoops of ice cream in cups just before serving, with the fudge, berries, sliced bananas, sprinkles and whipped cream. Put the ice cream back in the freezer between rounds.',
  ],
  safety=[],
  make_ahead='Keeps 2 weeks in a jar in the refrigerator. Rewarm in short bursts in the microwave, stirring.',
  freezer=(True, 'Freezes up to 3 months.'),
  leftovers=None,
  kids='Kids can set up the topping bowls.',
  swaps={'dairy_free': 'Use full-fat coconut milk, coconut oil and dairy-free chips.'},
  prep_day=dict(ahead='Make up to 2 weeks ahead.', station='stove', oven_f=None, active=10, keeps_days=14),
  pairs=['vanilla-layer-cake'])

# =====================================================================  PARTY FOOD
R(id='make-your-own-mini-pizzas', name='Make-Your-Own Mini Pizzas', emoji='🍕', servings=8, serving_size='2 mini pizzas',
  meal=['lunch', 'dinner'], protein='pork', method=['oven'], tags=['kid-friendly', 'quick'], prep=15, cook=10,
  equipment=['two rimmed baking sheets', 'spoons for sauce', 'small bowls for toppings', 'oven mitts'],
  summary='English muffin halves the guests top themselves with sauce, cheese and toppings. A party activity and lunch in one.',
  ingredients='''
8 each english-muffins | split (16 halves)
1 cup marinara | or pizza sauce
2 cup mozzarella | shredded
?32 slice pepperoni
?1 each green-bell-pepper | diced
''',
  steps=[
    'Heat the oven to 425°F. If you like a crisper base, toast the muffin halves on the sheets for 4 minutes first.',
    'Set out the muffin halves, sauce, cheese and toppings in bowls. Each guest spreads a spoonful of sauce, sprinkles cheese and adds toppings. Write names on the parchment with a pencil so everyone gets their own.',
    'A grown-up bakes them 8 to 10 minutes, until the cheese melts and bubbles.',
    'Cool 3 minutes; melted cheese is very hot. ' + BUFFET,
  ],
  safety=[],
  make_ahead='Dice toppings the day before. Assemble and bake at the party.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='The guests make these themselves; a grown-up handles the oven.',
  swaps={'gluten_free': 'Use gluten-free English muffins or bagels.', 'from_scratch': 'Use the from-scratch pizza dough, rolled into 4-inch rounds; bake 10 to 12 minutes.', 'dairy_free': 'Use dairy-free cheese.'},
  prep_day=dict(ahead='Dice the toppings.', station='oven', oven_f=425, active=15, keeps_days=1),
  pairs=['veggie-cups-ranch', 'party-lemonade'])

R(id='party-pigs-in-a-blanket', name='Party Pigs in a Blanket', emoji='🌭', servings=8, serving_size='3 pieces (makes 24)',
  meal=['snack'], protein='pork', method=['oven'], tags=['kid-friendly'], prep=15, cook=15,
  equipment=['rimmed baking sheet', 'parchment paper', 'knife', 'food thermometer'],
  summary='Little pieces of hot dog wrapped in biscuit dough and baked golden. The snack that disappears first.',
  ingredients='''
8 each hot-dogs | each cut in 3 pieces
8 each biscuit-dough | refrigerated biscuits, each cut in 3 strips
1 each eggs | beaten, for brushing (optional)
?2 tbsp ketchup | for dipping
?2 tbsp yellow-mustard | for dipping
''',
  steps=[
    'Heat the oven to 375°F and line a baking sheet with parchment.',
    'Cut each biscuit into 3 strips and stretch each strip a little. Wrap one around each piece of hot dog, pinching the end underneath.',
    'Set them seam side down on the sheet and brush with egg if you like.',
    'Bake 12 to 15 minutes, until golden. The hot dogs should be steaming hot, 165°F (USDA).',
    'Cool 5 minutes. ' + BUFFET + ' For guests under 4, cut them into small pieces; hot dogs are a choking hazard for young children (CDC).',
  ],
  safety=[('hot dogs', 165, 0)],
  make_ahead='Wrap them up to 2 hours ahead and refrigerate on the sheet; bake when guests arrive.',
  freezer=(True, 'Freeze unbaked on a tray, then bag; bake from frozen, adding 3 to 5 minutes.'),
  leftovers=('Refrigerate within 2 hours; reheat to 165°F.', None),
  kids='Kids can wrap the dough around the hot dogs and wash their hands after.',
  swaps={'puff_pastry': 'Use a sheet of thawed puff pastry cut in strips; bake at 400°F.', 'from_scratch': 'Use a half batch of from-scratch biscuit dough.'},
  prep_day=dict(ahead='Wrap them up to 2 hours before.', station='oven', oven_f=375, active=15, keeps_days=1),
  pairs=['veggie-cups-ranch'])

R(id='party-chicken-tenders', name='Crispy Baked Chicken Tenders', emoji='🍗', servings=8, serving_size='about 3 tenders',
  meal=['dinner', 'lunch'], protein='chicken', method=['oven'], tags=['kid-friendly'], prep=20, cook=18,
  equipment=['two rimmed baking sheets', 'wire racks (optional)', 'three shallow dishes', 'food thermometer'],
  summary='Chicken tenders coated in Parmesan panko and baked until crunchy. Everyone’s party favorite, without frying.',
  ingredients='''
2 lb chicken-tenders
1/2 cup flour
2 each eggs
1 1/2 cup panko
1/2 cup parmesan | grated
1 tsp garlic-powder
1 tsp paprika
1 tsp salt
3 tbsp olive-oil
''',
  steps=[
    'Heat the oven to 425°F. Set a rack on each baking sheet if you have them and brush with oil.',
    'Set out three dishes: flour with half the salt; eggs beaten with a spoonful of water; panko mixed with the Parmesan, garlic powder, paprika, the rest of the salt and the oil.',
    'Pat the chicken dry. Dip each tender in flour, then egg, then press it into the crumbs. Lay them on the racks. Wash your hands, and anything raw chicken touched.',
    'Bake 15 to 18 minutes, turning once, until golden and a food thermometer reads 165°F in the thickest tender (USDA).',
    'Serve with ranch, ketchup or honey mustard. ' + BUFFET,
  ],
  safety=[('chicken', 165, 0)],
  make_ahead='Bread them a few hours ahead and refrigerate on the racks; bake when guests arrive.',
  freezer=(True, 'Freeze baked tenders up to 3 months; reheat at 400°F to 165°F.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days; reheat to 165°F.', 'lunch'),
  kids='Older kids can do the dipping, with hand-washing after.',
  swaps={'gluten_free': 'Use gluten-free flour and crushed corn flakes.', 'dairy_free': 'Leave out the Parmesan and add ½ teaspoon more salt.'},
  prep_day=dict(ahead='Bread them a few hours ahead.', station='oven', oven_f=425, active=20, keeps_days=3),
  pairs=['veggie-cups-ranch'])

R(id='party-ham-cheese-sliders', name='Baked Ham and Cheese Party Sliders', emoji='🥪', servings=12, serving_size='1 slider',
  meal=['lunch', 'snack'], protein='pork', method=['oven'], tags=['kid-friendly', 'make-ahead'], prep=15, cook=20,
  equipment=['9-by-13-inch baking dish', 'serrated knife', 'pastry brush', 'foil'],
  summary='A whole tray of soft sweet rolls filled with ham and Swiss, brushed with butter and mustard and baked until melty.',
  ingredients='''
12 each hawaiian-rolls | in one connected slab
12 slice deli-ham
6 slice swiss | cut in half
3 tbsp unsalted-butter | melted
1 tbsp dijon-mustard
1/2 tsp onion-powder
''',
  steps=[
    'Heat the oven to 350°F.',
    'Without pulling the rolls apart, slice the whole slab in half horizontally with a serrated knife. Set the bottom in the baking dish.',
    'Layer the ham and cheese over the bottom, then put the top back on.',
    'Stir the butter, mustard and onion powder together and brush it over the tops.',
    'Cover with foil and bake 15 minutes, then uncover and bake 5 minutes more, until the cheese melts and the centers are hot.',
    'Cut into 12 sliders. ' + BUFFET,
  ],
  safety=[],
  make_ahead='Assemble up to 1 day ahead, cover and refrigerate; brush with butter and bake just before the party, adding 5 minutes.',
  freezer=(False, 'Best fresh.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days.', 'lunch'),
  kids='Kids can layer the ham and cheese.',
  swaps={'turkey': 'Use turkey and cheddar.', 'mustard': 'Leave out the mustard for picky eaters.'},
  prep_day=dict(ahead='Assemble the day before.', station='oven', oven_f=350, active=15, keeps_days=1),
  pairs=['veggie-cups-ranch', 'party-lemonade'])

R(id='veggie-cups-ranch', name='Veggie Cups with Ranch Dip', emoji='🥕', servings=12, serving_size='1 cup',
  meal=['snack', 'side'], protein='vegetarian', method=['no-cook'], tags=['kid-friendly', 'make-ahead'], prep=25, cook=0,
  equipment=['12 clear plastic cups (9 oz)', 'cutting board', 'knife', 'tray'],
  summary='Each guest gets a cup with ranch in the bottom and vegetable sticks standing up in it. No double-dipping, and it looks bright on the table.',
  ingredients='''
1 1/2 cup ranch-dressing | homemade or bought
48 each baby-carrots
4 stalk celery | cut in 4-inch sticks
1 each cucumber | cut in sticks
1 each red-bell-pepper | cut in strips
''',
  steps=[
    'Cut the celery, cucumber and pepper into sticks about 4 inches long, so they stand up above the rim.',
    'Spoon 2 tablespoons of ranch into the bottom of each cup.',
    'Stand 4 carrots and a few sticks of each vegetable in each cup.',
    'Keep the cups in the refrigerator until serving, then set them out on a tray of ice. ' + BUFFET,
  ],
  safety=[],
  make_ahead='Cut the vegetables a day ahead and store them in containers with a damp paper towel. Fill the cups up to 3 hours ahead and refrigerate.',
  freezer=(False, 'Raw vegetables don’t freeze for this.'),
  leftovers=None,
  kids='Kids can fill the cups.',
  swaps={'hummus': 'Use hummus in some cups for guests who can’t have milk or eggs (it contains sesame).', 'from_scratch': 'Make the ranch dressing from scratch.'},
  prep_day=dict(ahead='Cut the vegetables.', station='none', oven_f=None, active=25, keeps_days=1),
  pairs=['make-your-own-mini-pizzas'])

R(id='party-lemonade', name='Fresh-Squeezed Party Lemonade', emoji='🍋', servings=10, serving_size='1 cup',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead', 'budget', 'quick'], prep=15, cook=5,
  equipment=['small saucepan', 'citrus juicer', 'strainer', 'large pitcher'],
  summary='Real lemonade from fresh lemons and a simple syrup, a gallon pitcher for the party. Not too sweet; add more syrup to taste.',
  ingredients='''
1 1/2 cup lemon-juice | fresh, from about 8 lemons
1 cup sugar
^7 cup water | divided
?1 each lemon | sliced, for the pitcher
''',
  steps=[
    'Make a syrup: heat the sugar with 1 cup of the water, stirring, until it dissolves. Let it cool.',
    'Squeeze the lemons and strain out the seeds.',
    'In a pitcher, stir the lemon juice, syrup and the remaining 6 cups of cold water. Taste and add a little more water or sugar.',
    'Chill, and serve over ice with lemon slices.',
  ],
  safety=[],
  make_ahead='Make the syrup and juice up to 3 days ahead and keep them in the refrigerator; mix with water the day of the party.',
  freezer=(True, 'Freeze in ice cube trays to cool the pitcher without watering it down.'),
  leftovers=('Keeps 5 days in the refrigerator.', None),
  kids='Kids can roll the lemons on the counter to loosen the juice and help squeeze them.',
  swaps={'pink': 'Stir in ½ cup of strawberry purée.', 'sparkling': 'Use sparkling water for half of the water.'},
  prep_day=dict(ahead='Squeeze the lemons and make the syrup.', station='stove', oven_f=None, active=15, keeps_days=3),
  pairs=['make-your-own-mini-pizzas'])

# =====================================================================  COLLECTION (the page's plan)
COURSES = [
    {'id': 'cakes', 'title': 'The cake, from scratch', 'icon': '🎂',
     'intro': 'Layer cakes for the table, a sheet cake for a crowd, cupcakes to hand out, and an egg-free, dairy-free cake that everyone can share.',
     'items': ['r:vanilla-layer-cake', 'r:chocolate-layer-cake', 'r:vanilla-sheet-cake', 'r:chocolate-sheet-cake', 'r:vanilla-cupcakes', 'r:chocolate-cupcakes', 'r:egg-free-chocolate-cake', 'r:mini-cheesecakes']},
    {'id': 'frosting', 'title': 'Frosting and toppings', 'icon': '🍦',
     'intro': 'One batch fills and frosts a two-layer cake or 24 cupcakes. A sheet cake takes about 1½ batches.',
     'items': ['r:vanilla-buttercream', 'r:chocolate-buttercream', 'r:cream-cheese-frosting', 'r:hot-fudge-sauce', 's:whipped-cream', 's:powdered-sugar']},
    {'id': 'mains', 'title': 'Pizza and party mains', 'icon': '🍕',
     'intro': 'Pizza is the classic. Kids love making their own; a grown-up runs the oven.',
     'items': ['r:make-your-own-mini-pizzas', 'r:sheet-pan-pizza', 's:pizza-dough', 'r:party-chicken-tenders', 'r:party-ham-cheese-sliders', 'r:classic-burgers', 'r:baked-mac-and-cheese']},
    {'id': 'finger', 'title': 'Finger foods', 'icon': '🌭',
     'intro': 'Small bites people can eat standing up. Serve on several small platters and swap in a fresh one rather than topping one up (USDA).',
     'items': ['r:party-pigs-in-a-blanket', 'r:lunchbox-pizza-pinwheels', 'r:turkey-cheese-wraps', 'r:corn-dog-muffins', 'r:deviled-eggs', 'r:chicken-meatball-bites']},
    {'id': 'fresh', 'title': 'Fruit, vegetables and dips', 'icon': '🍉',
     'intro': 'Bright, fresh and kid-friendly. Keep cold dishes on ice.',
     'items': ['r:veggie-cups-ranch', 'r:fruit-kabobs-yogurt-dip', 'r:watermelon-fruit-pizza', 'r:fruit-salad', 'r:guacamole', 'r:seven-layer-dip', 'r:buttermilk-ranch']},
    {'id': 'drinks', 'title': 'Drinks and frozen treats', 'icon': '🍋',
     'items': ['r:party-lemonade', 'r:berry-yogurt-pops', 'r:watermelon-lime-pops', 'r:watermelon-agua-fresca'],
     'intro': 'Ice pops can be made days ahead.'},
]
SCRATCH = ['pizza-dough', 'cake-flour', 'powdered-sugar', 'whipped-cream', 'butter', 'marinara', 'ranch-dressing', 'biscuits', 'soft-buns-rolls']
DEFAULT_MENU = ['vanilla-layer-cake', 'vanilla-buttercream', 'make-your-own-mini-pizzas', 'party-pigs-in-a-blanket', 'veggie-cups-ranch', 'fruit-kabobs-yogurt-dip', 'party-lemonade']
# the cake calculator: how many each cake serves at a party, and how much frosting it takes (batches of our buttercream)
CAKES = [
    {'id': 'vanilla-layer-cake', 'label': 'a 9-inch two-layer round', 'serves': [16, 20], 'frost': 1},
    {'id': 'chocolate-layer-cake', 'label': 'a 9-inch two-layer round', 'serves': [16, 20], 'frost': 1},
    {'id': 'vanilla-sheet-cake', 'label': 'a half-sheet cake (13 by 18 inches)', 'serves': [24, 48], 'frost': 1.5},
    {'id': 'chocolate-sheet-cake', 'label': 'a fudge-frosted half-sheet cake', 'serves': [24, 48], 'frost': 0},
    {'id': 'vanilla-cupcakes', 'label': '24 cupcakes', 'serves': [24, 24], 'frost': 1},
    {'id': 'chocolate-cupcakes', 'label': '24 cupcakes', 'serves': [24, 24], 'frost': 1},
    {'id': 'egg-free-chocolate-cake', 'label': 'an 8-inch square cake', 'serves': [9, 16], 'frost': 0.5},
]
# the countdown: what to do ahead for each dish (days before the party; 0 = the day itself) and its oven time on the day
DAY = {
    'vanilla-layer-cake': {'ahead': 2, 'task': 'bake and cool the layers; wrap them well'},
    'chocolate-layer-cake': {'ahead': 2, 'task': 'bake and cool the layers; wrap them well'},
    'vanilla-sheet-cake': {'ahead': 1, 'task': 'bake the sheet cake'}, 'chocolate-sheet-cake': {'ahead': 1, 'task': 'bake and frost the sheet cake'},
    'vanilla-cupcakes': {'ahead': 1, 'task': 'bake the cupcakes'}, 'chocolate-cupcakes': {'ahead': 1, 'task': 'bake the cupcakes'},
    'egg-free-chocolate-cake': {'ahead': 1, 'task': 'bake the cake; keep it apart, with its own knife'}, 'mini-cheesecakes': {'ahead': 1, 'task': 'bake and chill'},
    'vanilla-buttercream': {'ahead': 3, 'task': 'make the frosting and refrigerate it'}, 'chocolate-buttercream': {'ahead': 3, 'task': 'make the frosting and refrigerate it'},
    'cream-cheese-frosting': {'ahead': 2, 'task': 'make the frosting and refrigerate it'}, 'hot-fudge-sauce': {'ahead': 5, 'task': 'make the sauce'},
    'make-your-own-mini-pizzas': {'ahead': 1, 'task': 'dice the toppings', 'oven': [425, 10]}, 'sheet-pan-pizza': {'ahead': 1, 'task': 'make the dough or thaw it in the refrigerator', 'oven': [450, 15]},
    'party-chicken-tenders': {'ahead': 0, 'task': 'bread the tenders a few hours before', 'oven': [425, 18]},
    'party-ham-cheese-sliders': {'ahead': 1, 'task': 'assemble the sliders and refrigerate', 'oven': [350, 20]},
    'party-pigs-in-a-blanket': {'ahead': 0, 'task': 'wrap them up to 2 hours ahead', 'oven': [375, 15]},
    'lunchbox-pizza-pinwheels': {'ahead': 1, 'task': 'bake the pinwheels'}, 'corn-dog-muffins': {'ahead': 1, 'task': 'bake the muffins'},
    'chicken-meatball-bites': {'ahead': 1, 'task': 'bake the meatballs', 'oven': [350, 12]}, 'baked-mac-and-cheese': {'ahead': 1, 'task': 'assemble it', 'oven': [375, 30]},
    'deviled-eggs': {'ahead': 1, 'task': 'cook the eggs and make the filling'}, 'turkey-cheese-wraps': {'ahead': 1, 'task': 'roll the wraps'},
    'veggie-cups-ranch': {'ahead': 1, 'task': 'cut the vegetables'}, 'fruit-kabobs-yogurt-dip': {'ahead': 0, 'task': 'build the kabobs in the morning'},
    'watermelon-fruit-pizza': {'ahead': 0, 'task': 'cut the fruit in the morning'}, 'fruit-salad': {'ahead': 0, 'task': 'cut the fruit in the morning'},
    'party-lemonade': {'ahead': 2, 'task': 'squeeze the lemons and make the syrup'}, 'berry-yogurt-pops': {'ahead': 3, 'task': 'make and freeze the pops'},
    'watermelon-lime-pops': {'ahead': 3, 'task': 'make and freeze the pops'}, 'classic-burgers': {'ahead': 1, 'task': 'shape the patties and refrigerate'},
    'guacamole': {'ahead': 0, 'task': 'make it just before guests arrive'}, 'seven-layer-dip': {'ahead': 0, 'task': 'layer it in the morning'},
    'buttermilk-ranch': {'ahead': 2, 'task': 'make the dressing'}, 'watermelon-agua-fresca': {'ahead': 1, 'task': 'blend and chill'},
}
SOURCES = [
    ('fsis-buffet', 'Holiday or Party Buffets (archived fact sheet)', 'USDA Food Safety and Inspection Service', 'https://webarchive.library.unt.edu/web/20121014010316/http:/www.fsis.usda.gov/Fact_Sheets/Focus_On_Holiday_or_Party_Buffets/index.asp'),
    ('fda-flour', 'Flour, Raw Food and Other Safety Facts', 'U.S. Food and Drug Administration', 'https://www.fda.gov/consumers/consumer-updates/flour-raw-food-and-other-safety-facts'),
    ('fda-allergens', 'Allergic to Sesame? Food Labels Now Must List Sesame as an Allergen (the nine major allergens)', 'U.S. Food and Drug Administration', 'https://www.fda.gov/consumers/consumer-updates/allergic-sesame-food-labels-now-must-list-sesame-allergen'),
    ('cdc-choke', 'Choking Hazards', 'Centers for Disease Control and Prevention', 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html'),
]
U = {
    'flour': {'name': 'Flour, Raw Food and Other Safety Facts (FDA)', 'url': 'https://www.fda.gov/consumers/consumer-updates/flour-raw-food-and-other-safety-facts', 'what': 'don’t eat raw batter or dough'},
    'buffet': {'name': 'Holiday or Party Buffets (USDA FSIS, archived)', 'url': 'https://webarchive.library.unt.edu/web/20121014010316/http:/www.fsis.usda.gov/Fact_Sheets/Focus_On_Holiday_or_Party_Buffets/index.asp', 'what': 'the 2-hour rule and keeping party food hot or cold'},
    'choke': {'name': 'Choking Hazards (CDC)', 'url': 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html', 'what': 'hot dogs and young children'},
    'allergen': {'name': 'The nine major food allergens (FDA)', 'url': 'https://www.fda.gov/consumers/consumer-updates/allergic-sesame-food-labels-now-must-list-sesame-allergen', 'what': 'reading labels for allergens'},
}
BC = G('Birthday_cake', 'background on birthday cakes')
CREDITS = {
    'vanilla-layer-cake': [U['flour'], BC], 'chocolate-layer-cake': [U['flour'], G('Chocolate_cake', 'background')],
    'vanilla-sheet-cake': [U['flour'], G('Sheet_cake', 'background')], 'chocolate-sheet-cake': [U['flour'], G('Sheet_cake', 'background')],
    'vanilla-cupcakes': [U['flour'], G('Cupcake', 'background')], 'chocolate-cupcakes': [U['flour'], G('Cupcake', 'background')],
    'egg-free-chocolate-cake': [U['flour'], U['allergen'], G('Wacky_cake', 'the cake’s history in the 1930s and wartime rationing')],
    'vanilla-buttercream': [G('Buttercream', 'background')], 'chocolate-buttercream': [G('Buttercream', 'background')], 'cream-cheese-frosting': [U['buffet']],
    'hot-fudge-sauce': [G('Chocolate_syrup', 'background')],
    'make-your-own-mini-pizzas': [U['buffet'], G('Pizza_bagel', 'mini pizzas on bread')], 'party-pigs-in-a-blanket': [U['buffet'], U['choke'], G('Pigs_in_a_blanket', 'background')],
    'party-chicken-tenders': [U['buffet'], G('Chicken_nugget', 'background')], 'party-ham-cheese-sliders': [U['buffet'], G('Slider_(sandwich)', 'background')],
    'veggie-cups-ranch': [U['buffet']], 'party-lemonade': [G('Lemonade', 'background')],
}
META = {'anchor': 'your-menu', 'title': 'Birthday parties', 'url': 'meal-prep/birthday/', 'icon': '🎂', 'blurb': 'Birthday parties collection',
        'keywords': ['birthday party', 'birthday cake', 'layer cake', 'cupcakes', 'buttercream', 'kids party food', 'party planning', 'allergy-friendly cake']}


def main():
    out = build(RECIPES, CREDITS, SLUG)
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU, 'cakes': CAKES, 'day': DAY,
            'goals_exclude': [r['id'] for r in out] + ['mini-cheesecakes'],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    write(SLUG, out, coll, extra_ids=[c['id'] for c in CAKES] + list(DAY))


if __name__ == '__main__':
    main()
