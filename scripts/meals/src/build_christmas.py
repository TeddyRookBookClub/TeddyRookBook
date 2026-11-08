#!/usr/bin/env python3
"""Builds data/meals/recipes/christmas.json: the Christmas baking and holiday dinner collection at /meal-prep/christmas/.

Run:  python3 scripts/meals/src/build_christmas.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

The file holds
  recipes     the NEW recipes written for this collection (same fields as build_recipes.py; collection='christmas')
  collection  the page's plan: courses that mix these with recipes and from-scratch pages already in Meal Prep (by id,
              nothing copied), the roast table for the timeline tool, cookie yields for the cookie-swap planner,
              and meta (title, url, icon, keywords) that the recipe pages use for their crumb and search words.

Food safety comes only from USDA FSIS and FDA:
  USDA FSIS, Roasting Those "Other" Holiday Meats (325 °F; bone-in rib roast 4 to 8 lb 23 to 30 min per lb; 145 °F and a
       3-minute rest; fully cooked ham 140 °F; never roast below 325 °F)
  USDA FSIS, Hams and Food Safety (reheat fully cooked hams to 140 °F; leftovers 3 to 5 days)
  USDA FSIS, Leftovers and Food Safety (refrigerate within 2 hours; use in 3 to 4 days; reheat to 165 °F)
  FDA, What You Need to Know About Egg Safety (pasteurized eggs for raw-egg recipes such as royal icing; egg dishes 160 °F)
  CDC / FDA, Say No to Raw Dough (don't taste raw dough or batter: raw flour and raw eggs)
Where a point is disputed or unclear, it is left out.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

SLUG = 'christmas'
T_BEEF = ('beef rib roast', 145, 3)
T_EGGS = ('egg dishes', 160, 0)
T_SAUSAGE = ('ground pork sausage', 160, 0)
T_REHEAT = ('leftovers and gravy, reheated', 165, 0)

RAW_DOUGH = 'Don’t taste the raw dough: raw flour and raw eggs can carry germs (FDA and CDC). Bake first, then taste.'
COOKIE_KEEP = ('Keep cooled cookies in an airtight tin at room temperature for about a week.', None)
LEFT_ROAST = ('Refrigerate sliced leftovers within 2 hours and use them within 3 to 4 days, or freeze them (USDA). Reheat to 165°F, or serve cold in sandwiches.', 'lunch')

RECIPES = []


def R(**kw):
    kw.setdefault('collection', SLUG)
    RECIPES.append(kw)


# =====================================================================  COOKIES
R(id='sugar-cutout-cookies', name='Sugar Cookie Cutouts with Royal Icing', emoji='⭐', servings=24, serving_size='1 iced cookie (about 3 inches)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=60, cook=10, inactive=120,
  equipment=['stand or hand mixer', 'rolling pin', 'cookie cutters', '2 baking sheets', 'parchment paper', 'cooling racks', 'piping bags or zip-top bags', 'small bowls for colors'],
  summary='Buttery cutouts that hold their shape in the oven, iced with smooth royal icing that dries hard enough to stack. The cookie most people picture for decorating day.',
  ingredients='''
Cookies:
1 cup unsalted-butter | softened (2 sticks)
1 cup sugar
1 each eggs | room temperature
1 1/2 tsp vanilla
2 3/4 cup flour | plus more for rolling
1 tsp baking-powder
1/2 tsp salt
Royal icing:
3 cup powdered-sugar | sifted
3 each egg-whites | pasteurized (from a carton), about 6 tablespoons
1/2 tsp lemon-juice | or vanilla
''',
  steps=[
    'Beat the butter and sugar until pale and fluffy, about 3 minutes. Beat in the egg and vanilla.',
    'Whisk the flour, baking powder and salt, then mix them in on low speed just until no dry flour shows. ' + RAW_DOUGH,
    'Divide the dough in half, flatten each into a disk, wrap, and chill at least 1 hour (up to 3 days). Cold dough keeps sharp edges.',
    'Heat the oven to 350°F and line the sheets with parchment. Roll one disk between two sheets of parchment, or on a floured counter, to ¼ inch thick. Cut shapes and set them 1 inch apart. Gather the scraps, chill, and roll again.',
    'Bake 8 to 10 minutes, until the edges are just turning golden. Cool 5 minutes on the sheet, then on a rack until completely cool before icing.',
    'Make the icing: beat the powdered sugar, egg whites and lemon juice on medium-high for 4 to 5 minutes, until thick and glossy. Use pasteurized egg whites, because this icing is never cooked (FDA advises pasteurized eggs for raw-egg recipes).',
    'For outlines, keep the icing thick. For filling in (“flooding”), stir in water a few drops at a time until a ribbon of icing sinks back in about 10 seconds. Tint small bowls with gel food coloring. Keep the bowls covered with a damp towel; the icing crusts fast.',
    'Pipe an outline, let it set 10 minutes, then flood the middle and nudge it into the corners with a toothpick. Add sprinkles while it’s wet. Let the cookies dry, uncovered, 6 hours or overnight before stacking.',
  ],
  safety=[],
  make_ahead='Chill the dough up to 3 days or freeze it up to 3 months. Bake the cookies up to a week before you ice them.',
  freezer=(True, 'Freeze plain baked cookies up to 3 months; ice after thawing. Iced cookies freeze well too once the icing is fully dry, packed in layers with parchment.'),
  leftovers=COOKIE_KEEP,
  kids='Kids can cut shapes, flood cookies with icing and shake on sprinkles. Pick a cutter for each child.',
  swaps={'meringue_powder': 'Use 2 tablespoons meringue powder and 5 to 6 tablespoons water instead of the egg whites.', 'egg_free_icing': 'For a simple glaze, stir 2 cups powdered sugar with 3 tablespoons milk; it stays softer than royal icing.'},
  prep_day=dict(ahead='Make and chill the dough.', station='oven', oven_f=350, active=60, keeps_days=7),
  pairs=['gingerbread-people', 'butter-shortbread'])

R(id='gingerbread-people', name='Gingerbread People', emoji='🍪', servings=24, serving_size='1 cookie (about 4 inches)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=40, cook=10, inactive=120,
  equipment=['mixer', 'rolling pin', 'gingerbread-person cutter', '2 baking sheets', 'parchment paper', 'cooling racks'],
  summary='Dark, spicy molasses cookies, soft in the middle with crisp edges. Decorate with royal icing buttons and smiles.',
  ingredients='''
3/4 cup unsalted-butter | softened (1½ sticks)
3/4 cup brown-sugar | packed
1 each eggs
1/2 cup molasses
3 1/4 cup flour | plus more for rolling
1 tsp baking-soda
1/2 tsp salt
1 tbsp ginger-ground
1 1/2 tsp cinnamon
1/4 tsp cloves
1/4 tsp nutmeg
''',
  steps=[
    'Beat the butter and brown sugar until fluffy. Beat in the egg, then the molasses.',
    'Whisk the flour, baking soda, salt and spices, and mix them in on low speed. The dough will be soft. ' + RAW_DOUGH,
    'Divide in half, flatten into disks, wrap and chill at least 2 hours, or up to 3 days.',
    'Heat the oven to 350°F. Roll the dough ¼ inch thick on a floured counter and cut out people. Set them 1 inch apart on parchment-lined sheets. Press in raisins for eyes if you like.',
    'Bake 8 to 10 minutes: shorter for soft cookies, longer for crisp ones. They firm up as they cool. Cool 5 minutes on the sheet, then on a rack.',
    'Decorate with royal icing (see the sugar cookie recipe) or a simple powdered-sugar glaze once they’re completely cool.',
  ],
  safety=[],
  make_ahead='The dough keeps 3 days in the refrigerator or 3 months in the freezer.',
  freezer=(True, 'Freeze baked, undecorated cookies up to 3 months.'),
  leftovers=COOKIE_KEEP,
  kids='Kids can cut out the people, press in raisin eyes and pipe on buttons.',
  swaps={'stronger': 'For a bolder cookie, add ½ teaspoon black pepper and use dark brown sugar.'},
  prep_day=dict(ahead='Make and chill the dough.', station='oven', oven_f=350, active=40, keeps_days=7),
  pairs=['sugar-cutout-cookies', 'gingerbread-house'])

R(id='gingerbread-house', name='Gingerbread House', emoji='🏠', servings=12, serving_size='1 piece when you break it up (it’s mostly for looking at)',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead', 'kid-friendly'], prep=90, cook=15, inactive=240,
  equipment=['mixer', 'rolling pin', 'paper or cardstock for templates', 'ruler and sharp knife or pizza cutter', '2 large baking sheets', 'parchment paper', 'piping bag', 'a cake board or tray to build on', 'small cans or jars to prop the walls'],
  summary='A sturdy construction gingerbread, baked flat and hard, glued together with stiff royal icing and covered in candy. A family project for a December weekend.',
  ingredients='''
Construction gingerbread:
1/2 cup shortening | or unsalted butter
1 cup brown-sugar | packed
3/4 cup molasses
1/4 cup water
5 cup flour
1 tsp baking-soda
1/2 tsp salt
1 tbsp ginger-ground
1 tbsp cinnamon
Glue (stiff royal icing):
4 cup powdered-sugar | sifted
4 each egg-whites | pasteurized (from a carton)
To decorate:
?1 cup candy-canes | small candies of your choice
''',
  steps=[
    'Cut paper templates: two side walls 7 by 4 inches, two end walls 6 inches wide and 4 inches tall at the sides rising to a peak of 7 inches, and two roof panels 7½ by 5 inches.',
    'Heat the shortening, brown sugar, molasses and water in a saucepan just until the shortening melts. Cool 10 minutes.',
    'Whisk the flour, baking soda, salt and spices in a big bowl. Stir in the molasses mixture to make a stiff dough; knead it smooth with your hands.',
    'Heat the oven to 350°F. Roll the dough ⅛ to ¼ inch thick right on sheets of parchment. Lay the templates on top and cut around them; pull away the scraps. Cut windows and a door if you like. Slide the parchment onto baking sheets.',
    'Bake 12 to 15 minutes, until firm and a little darker at the edges. While still warm, lay the templates back on and trim any edges that spread, so the walls fit. Cool completely on the sheets, at least 2 hours or overnight.',
    'Beat the powdered sugar and pasteurized egg whites for 5 minutes until very thick, like toothpaste. Keep it covered with a damp towel.',
    'Build: pipe a thick line of icing on the board and stand a side wall in it. Pipe icing up the edge and press an end wall against it. Add the other walls the same way, propping them with cans. Let them set 1 hour before adding the roof panels, then let the whole house set 2 hours before decorating.',
    'Decorate with icing “snow” and candy. This house is for display: after a few days on the table it’s dry and dusty. Break off a piece the first day if you want a taste.',
  ],
  safety=[],
  make_ahead='Bake the panels up to a week ahead and keep them flat and airtight. Build and decorate the same day or over two days.',
  freezer=(False, ''),
  leftovers=('The finished house keeps its looks for weeks in a dry room. Eat pieces only in the first day or two.', None),
  kids='Building is a grown-up job; decorating is the kids’ part. Give each child a small pile of candy and a bag of icing.',
  swaps={'kit': 'Short on time? Bake gingerbread people instead and let everyone decorate one.', 'graham': 'For little kids, build mini houses from graham crackers glued to a milk carton with the same icing.'},
  prep_day=dict(ahead='Bake the panels a day or more ahead.', station='oven', oven_f=350, active=90, keeps_days=7),
  pairs=['gingerbread-people'])

R(id='butter-shortbread', name='Scottish-Style Butter Shortbread', emoji='🧈', servings=24, serving_size='1 finger',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=15, cook=35, inactive=30,
  equipment=['mixing bowl', '9-by-13-inch pan', 'fork', 'sharp knife'],
  summary='Three main ingredients, butter, sugar and flour, pressed into a pan and baked low and slow until pale gold and sandy-crisp. Keeps for weeks and packs well for gifts.',
  ingredients='''
1 1/2 cup unsalted-butter | softened (3 sticks)
3/4 cup sugar | plus 1 tablespoon for the top
1 tsp vanilla
3 cup flour
1/2 cup cornstarch | or rice flour, for extra tenderness
1/2 tsp salt
''',
  steps=[
    'Heat the oven to 325°F. Beat the butter, ¾ cup sugar and vanilla until creamy but not fluffy, about 1 minute.',
    'Whisk the flour, cornstarch and salt and mix them in on low until the dough just comes together in crumbly clumps.',
    'Press it evenly into the ungreased pan with your fingers, then smooth it with the back of a spoon. Prick all over with a fork and sprinkle with the 1 tablespoon sugar.',
    'Bake 30 to 35 minutes, until pale golden at the edges and firm in the middle.',
    'Right away, cut into 24 fingers (3 rows by 8). Cool completely in the pan before lifting them out; they crisp as they cool.',
  ],
  safety=[],
  make_ahead='Shortbread is the best keeper on the cookie tray: bake up to 2 weeks ahead.',
  freezer=(True, 'Freeze baked shortbread up to 3 months.'),
  leftovers=('Keep in an airtight tin at room temperature for up to 2 weeks.', None),
  kids='Kids can press the dough into the pan and prick the pattern with a fork.',
  swaps={'dipped': 'Dip one end of each finger in melted dark chocolate.', 'brown_butter': 'Brown the butter, chill it until soft-solid, then go on as written.'},
  prep_day=dict(ahead='Bake up to 2 weeks ahead.', station='oven', oven_f=325, active=15, keeps_days=14),
  pairs=['jam-thumbprint-cookies'])

R(id='snickerdoodles', name='Snickerdoodles', emoji='🍥', servings=24, serving_size='1 cookie',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['kid-friendly'], prep=20, cook=10, inactive=15,
  equipment=['mixer', 'small bowl', '2 baking sheets', 'parchment paper', 'cooling racks'],
  summary='Soft, crackly cookies rolled in cinnamon sugar. Cream of tartar gives them their slight tang and pillowy middle.',
  ingredients='''
1 cup unsalted-butter | softened (2 sticks)
1 1/2 cup sugar
2 each eggs
2 3/4 cup flour
2 tsp cream-of-tartar
1 tsp baking-soda
1/4 tsp salt
Cinnamon sugar:
^3 tbsp sugar
^1 tbsp cinnamon
''',
  steps=[
    'Heat the oven to 375°F and line the sheets with parchment.',
    'Beat the butter and sugar until fluffy, then beat in the eggs one at a time.',
    'Whisk the flour, cream of tartar, baking soda and salt, and mix them in on low. ' + RAW_DOUGH,
    'Stir the cinnamon sugar together. Roll the dough into balls about 1½ inches across, roll them in the cinnamon sugar, and set them 2 inches apart.',
    'Bake 8 to 10 minutes, until the edges are set and the tops crackled but still soft. Cool 5 minutes on the sheet, then on a rack.',
  ],
  safety=[],
  make_ahead='Roll the dough balls (without the sugar) and freeze them; roll in cinnamon sugar and bake from frozen, adding 2 minutes.',
  freezer=(True, 'Freeze dough balls up to 3 months, or baked cookies up to 3 months.'),
  leftovers=COOKIE_KEEP,
  kids='Kids love rolling the balls in cinnamon sugar.',
  swaps={'no_cream_of_tartar': 'Use 2 teaspoons baking powder instead of the cream of tartar and baking soda; the cookies will be a little less tangy.'},
  prep_day=dict(ahead='Freeze dough balls ahead.', station='oven', oven_f=375, active=20, keeps_days=7),
  pairs=['spritz-cookies'])

R(id='jam-thumbprint-cookies', name='Jam Thumbprint Cookies', emoji='🔴', servings=24, serving_size='1 cookie',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['kid-friendly', 'make-ahead'], prep=25, cook=14, inactive=30,
  equipment=['mixer', '2 baking sheets', 'parchment paper', 'small spoon'],
  summary='Tender butter cookies with a thumb-pressed well of bright jam. Use raspberry and apricot for a red-and-gold tray.',
  ingredients='''
1 cup unsalted-butter | softened (2 sticks)
2/3 cup sugar
2 each egg-yolks
1 tsp vanilla
2 1/4 cup flour
1/2 tsp salt
1/2 cup jam | raspberry, strawberry or apricot
''',
  steps=[
    'Heat the oven to 350°F and line the sheets with parchment.',
    'Beat the butter and sugar until fluffy. Beat in the yolks and vanilla, then the flour and salt on low until a soft dough forms. ' + RAW_DOUGH,
    'Roll into 1-inch balls and set them 2 inches apart. Press a deep well in each with your thumb or the back of a ½-teaspoon measure. Chill the trays 15 minutes.',
    'Fill each well with about ½ teaspoon jam; don’t overfill.',
    'Bake 12 to 14 minutes, until the bottoms are light golden. Cool on the sheet 5 minutes, then on a rack. The jam stays sticky for a while, so let them sit before stacking.',
  ],
  safety=[],
  make_ahead='Freeze the shaped, unfilled balls; thaw 10 minutes, fill and bake.',
  freezer=(True, 'Freeze baked cookies in a single layer, then pack with parchment, up to 2 months.'),
  leftovers=('Keep in a tin with parchment between layers for up to 5 days.', None),
  kids='This is the perfect kid job: pressing thumbprints and spooning in jam.',
  swaps={'nutty': 'Roll the balls in finely chopped walnuts or pecans before pressing (this adds tree nuts).', 'egg_free': 'Leave out the yolks and add 2 tablespoons milk.'},
  prep_day=dict(ahead='Shape and freeze the dough balls.', station='oven', oven_f=350, active=25, keeps_days=5),
  pairs=['butter-shortbread'])

R(id='spritz-cookies', name='Spritz Butter Cookies', emoji='🌸', servings=24, serving_size='2 small cookies',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['kid-friendly'], prep=25, cook=9, inactive=10,
  equipment=['cookie press', 'mixer', '2 cold, ungreased baking sheets (no parchment)', 'cooling racks'],
  summary='Little pressed butter cookies in wreaths, trees and flowers. Their name comes from the German word for “to squirt,” which is what the press does.',
  ingredients='''
1 cup unsalted-butter | softened (2 sticks)
2/3 cup sugar
1 each eggs
1 1/2 tsp vanilla | or 1 teaspoon vanilla and ½ teaspoon almond extract
2 1/4 cup flour
1/4 tsp salt
''',
  steps=[
    'Heat the oven to 375°F. Use cool, bare baking sheets: the dough has to stick to the pan to come off the press.',
    'Beat the butter and sugar until fluffy. Beat in the egg and vanilla, then the flour and salt on low. ' + RAW_DOUGH,
    'Tint the dough with gel food coloring if you like. Pack it into the press with your chosen disk.',
    'Hold the press upright against the sheet, squeeze once, and lift. Space cookies 1 inch apart. If they don’t stick, chill the pan 5 minutes.',
    'Decorate with sprinkles and bake 7 to 9 minutes, until the edges just start to color. Cool 2 minutes, then move to a rack.',
  ],
  safety=[],
  make_ahead='Bake up to a week ahead.',
  freezer=(True, 'Freeze baked spritz up to 3 months.'),
  leftovers=COOKIE_KEEP,
  kids='Kids can squeeze the press with a grown-up steadying it, and add sprinkles.',
  swaps={'chocolate': 'Replace ¼ cup of the flour with cocoa powder.'},
  prep_day=dict(ahead='Bake up to a week ahead.', station='oven', oven_f=375, active=25, keeps_days=7),
  pairs=['snickerdoodles'])

R(id='chocolate-crinkle-cookies', name='Chocolate Crinkle Cookies', emoji='❄️', servings=24, serving_size='1 cookie',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['kid-friendly', 'make-ahead'], prep=20, cook=11, inactive=180,
  equipment=['mixing bowls', 'whisk', '2 baking sheets', 'parchment paper', 'small bowls'],
  summary='Fudgy cocoa cookies rolled in powdered sugar that cracks into a snowy pattern as they bake.',
  ingredients='''
1/2 cup cocoa | unsweetened
1 cup sugar
1/4 cup canola-oil
2 each eggs
2 tsp vanilla
1 cup flour
1 tsp baking-powder
1/4 tsp salt
^1/2 cup powdered-sugar | for rolling
''',
  steps=[
    'Whisk the cocoa, sugar and oil. Whisk in the eggs one at a time, then the vanilla.',
    'Stir in the flour, baking powder and salt. The dough will be soft and sticky. Cover and chill at least 3 hours or overnight. ' + RAW_DOUGH,
    'Heat the oven to 350°F and line the sheets with parchment.',
    'Roll tablespoons of dough into balls and roll them thickly in powdered sugar. Set 2 inches apart.',
    'Bake 10 to 11 minutes, until the edges are set and the tops cracked. They look soft but firm up as they cool.',
  ],
  safety=[],
  make_ahead='The dough keeps 2 days in the refrigerator.',
  freezer=(True, 'Freeze baked cookies up to 2 months; roll in a little more powdered sugar after thawing.'),
  leftovers=COOKIE_KEEP,
  kids='Kids can roll the balls in powdered sugar (and themselves).',
  swaps={'mint': 'Add ½ teaspoon peppermint extract with the vanilla.'},
  prep_day=dict(ahead='Make and chill the dough.', station='oven', oven_f=350, active=20, keeps_days=7),
  pairs=['peppermint-bark'])

R(id='peppermint-bark', name='Peppermint Bark', emoji='🍬', servings=24, serving_size='1 piece (about 1 oz)',
  meal=['snack'], protein='vegetarian', method=['stovetop', 'no-cook'], tags=['make-ahead', 'kid-friendly'], prep=20, cook=10, inactive=60,
  equipment=['9-by-13-inch pan or rimmed sheet', 'parchment paper', 'heatproof bowls', 'saucepan for a water bath (or a microwave)', 'zip-top bag and rolling pin'],
  summary='A layer of dark chocolate, a layer of white chocolate and a shower of crushed candy canes. No baking, and it makes a pretty gift.',
  ingredients='''
10 oz dark-chocolate | chopped, or semisweet chips
2 cup white-chocolate-chips | 12 oz
1/2 cup candy-canes | crushed (about 4 canes)
''',
  steps=[
    'Line the pan with parchment, leaving some hanging over the sides.',
    'Melt the dark chocolate in a heatproof bowl set over a pan of barely simmering water, stirring until smooth (or microwave in 20-second bursts, stirring each time). Spread it in the pan and refrigerate 15 minutes, until just set.',
    'Melt the white chocolate the same way, gently: it scorches easily. Let it cool a few minutes so it doesn’t melt the dark layer, then spread it on top.',
    'Scatter the crushed candy canes over it right away and press them in lightly.',
    'Refrigerate 30 to 45 minutes until firm. Lift out with the parchment and break or cut into 24 pieces.',
  ],
  safety=[],
  make_ahead='Make up to 2 weeks ahead.',
  freezer=(True, 'Freeze up to 2 months in a tight container; the candy can get sticky if it thaws in humid air.'),
  leftovers=('Keep in an airtight tin in a cool room, or the refrigerator, for up to 2 weeks.', None),
  kids='Kids can crush the candy canes in a zip-top bag with a rolling pin.',
  swaps={'gift': 'Pack in cellophane bags or small tins with a label listing milk and soy (from the chocolate).'},
  prep_day=None,
  pairs=['chocolate-fudge'])

R(id='chocolate-fudge', name='Easy Chocolate Fudge', emoji='🟫', servings=24, serving_size='1 square (about 1¼ inches)',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=10, cook=10, inactive=120,
  equipment=['heavy saucepan', 'silicone spatula', '8-inch square pan', 'foil or parchment'],
  summary='Smooth, rich fudge from chocolate chips and sweetened condensed milk, with no candy thermometer needed. Add nuts if your family eats them.',
  ingredients='''
3 cup chocolate-chips | semisweet, 18 oz
1 can condensed-milk | 14 oz, sweetened
2 tbsp unsalted-butter
1 1/2 tsp vanilla
1 pinch salt
?3/4 cup walnuts | chopped, optional
''',
  steps=[
    'Line the pan with foil or parchment, leaving overhang to lift it out.',
    'Put the chocolate chips, condensed milk and butter in the saucepan over low heat. Stir constantly until melted and smooth, about 5 minutes. Keep the heat low so it doesn’t scorch.',
    'Off the heat, stir in the vanilla, salt and walnuts if using.',
    'Spread in the pan and smooth the top. Refrigerate about 2 hours until firm.',
    'Lift out and cut into 36 squares, or 24 larger ones. Wipe the knife between cuts for neat edges.',
  ],
  safety=[],
  make_ahead='Make up to 2 weeks ahead.',
  freezer=(True, 'Wrap well and freeze up to 3 months.'),
  leftovers=('Keep covered in the refrigerator for up to 2 weeks, or at cool room temperature for about a week.', None),
  kids='Kids can stir (off the heat) and sprinkle the toppings.',
  swaps={'peppermint': 'Use white chocolate chips and top with crushed candy canes.', 'nut_free': 'Leave out the walnuts; top with sprinkles instead.'},
  prep_day=None,
  pairs=['peppermint-bark'])

# =====================================================================  THE ROAST DINNER
R(id='standing-rib-roast', name='Standing Rib Roast (Prime Rib)', emoji='🥩', servings=8, serving_size='about ⅔ lb as bought (one thick slice)',
  meal=['dinner'], protein='beef', method=['oven'], tags=['leftovers'], prep=20, cook=150, inactive=30,
  equipment=['heavy roasting pan with a rack (or the rib bones as the rack)', 'instant-read or probe food thermometer', 'foil', 'carving board and long knife'],
  summary='A bone-in beef rib roast with a garlic, herb and black-pepper crust, roasted at 325°F the USDA way. The bones make their own rack and the drippings make the Yorkshire puddings.',
  ingredients='''
5 1/2 lb standing-rib-roast | 3 ribs, bone in
1 tbsp kosher-salt | or 1½ teaspoons table salt
2 tsp black-pepper | coarsely ground
4 clove garlic | grated
1 tbsp rosemary | chopped
1 tbsp thyme | leaves
2 tbsp olive-oil
''',
  steps=[
    'For the best crust, salt the roast a day ahead: pat it dry, rub the salt all over, and refrigerate it uncovered on a rack over a tray, away from ready-to-eat foods.',
    'Heat the oven to 325°F (USDA advises roasting meat at 325°F or higher). Mix the pepper, garlic, rosemary, thyme and oil and rub it over the fat and cut sides.',
    'Set the roast fat side up, bones down, in the pan. Roast. USDA’s guide time for a 4- to 8-lb bone-in rib roast at 325°F is 23 to 30 minutes per pound; a 5½-lb roast takes about 2 to 2¾ hours. Start checking an hour before the shortest time.',
    'Check with a food thermometer in the thickest part, not touching bone. Take it out at 145°F for medium-rare, or 160°F for medium. USDA’s safe minimum for beef roasts is 145°F with a 3-minute rest.',
    'Tent loosely with foil and rest 20 to 30 minutes (at least 3). The temperature rises a few degrees as it rests, and the oven is free for the Yorkshire puddings.',
    'Pour the drippings from the pan for the puddings and gravy. To carve, cut along the bones to free the meat in one piece, then slice it across the grain about ¾ inch thick. Serve the ribs alongside for anyone who likes to gnaw.',
  ],
  safety=[T_BEEF],
  make_ahead='Salt it 1 to 2 days ahead. Make the horseradish cream a day ahead.',
  freezer=(True, 'Freeze sliced leftovers, wrapped tightly, 2 to 3 months.'),
  leftovers=LEFT_ROAST,
  kids='Kids can strip the herb leaves and read the thermometer with you.',
  swaps={'boneless': 'A 4-lb boneless rib roast takes 39 to 43 minutes per pound at 325°F (USDA); tie it so it keeps its shape.', 'smaller': 'Figure about 1 rib for every 2 people.'},
  prep_day=dict(ahead='Salt the roast a day or two ahead.', station='oven', oven_f=325, active=20, keeps_days=4),
  pairs=['yorkshire-puddings', 'horseradish-cream', 'crisp-roast-potatoes', 'beef-pan-gravy'])

R(id='yorkshire-puddings', name='Yorkshire Puddings', emoji='🧁', servings=12, serving_size='1 pudding',
  meal=['side'], protein='', method=['oven'], tags=[], prep=10, cook=22, inactive=30,
  equipment=['12-cup muffin tin (or a popover pan)', 'whisk and bowl or blender', 'pitcher', 'oven mitts'],
  summary='Tall, crisp, hollow puddings baked in sizzling beef drippings. The classic partner for roast beef, from northern England.',
  ingredients='''
4 each eggs
1 cup whole-milk
1 cup flour
1/2 tsp salt
4 tbsp tallow | beef drippings from the roast, or vegetable oil
''',
  steps=[
    'Whisk the eggs, milk, flour and salt until smooth, or blend 10 seconds. Pour into a pitcher and let the batter rest at least 30 minutes at room temperature (or up to a day in the refrigerator).',
    'When the roast comes out, turn the oven to 450°F. Put 1 teaspoon drippings in each muffin cup and heat the tin in the oven 10 minutes, until the fat is very hot.',
    'Working fast, open the oven, pull the rack out a little, and pour batter into the cups about halfway. Hot fat can spit, so pour carefully and keep your face back.',
    'Bake 18 to 22 minutes without opening the door, until puffed high and deep golden. Serve right away.',
  ],
  safety=[],
  make_ahead='Make the batter up to a day ahead and refrigerate it; stir before pouring.',
  freezer=(True, 'Freeze baked puddings up to a month; reheat from frozen at 400°F for 5 minutes.'),
  leftovers=('Best hot from the oven. Leftovers recrisp in a 400°F oven for 4 to 5 minutes.', None),
  kids='Kids can whisk the batter and watch the puddings rise through the oven window.',
  swaps={'toad_in_hole': 'Pour the batter over browned sausages in a hot baking dish for “toad in the hole.”', 'no_drippings': 'Use vegetable oil or lard instead of beef drippings.'},
  prep_day=dict(ahead='Make the batter the night before.', station='oven', oven_f=450, active=10, keeps_days=1),
  pairs=['standing-rib-roast', 'beef-pan-gravy'])

R(id='horseradish-cream', name='Horseradish Cream Sauce', emoji='🥄', servings=8, serving_size='about 2 tablespoons',
  meal=['side'], protein='vegetarian', method=['no-cook'], tags=['quick', 'make-ahead'], prep=5, cook=0,
  equipment=['small bowl', 'whisk'],
  summary='Cool sour cream with a sharp bite of horseradish and a little lemon. The sauce for prime rib.',
  ingredients='''
3/4 cup sour-cream
3 tbsp horseradish | prepared
1 tsp dijon-mustard
1 tsp lemon-juice
1 tbsp chives | snipped
1/4 tsp salt
~1 pinch black-pepper
''',
  steps=[
    'Stir everything together. Taste and add more horseradish if you like it hotter.',
    'Chill at least 30 minutes, or up to 2 days, so the flavors blend.',
  ],
  safety=[],
  make_ahead='Make up to 2 days ahead.',
  freezer=(False, ''),
  leftovers=('Keep covered in the refrigerator up to 4 days. It’s good on roast beef sandwiches.', None),
  kids='Kids can snip the chives with kitchen scissors.',
  swaps={'lighter': 'Use plain Greek yogurt for half the sour cream.'},
  prep_day=None,
  pairs=['standing-rib-roast'])

R(id='beef-pan-gravy', name='Beef Pan Gravy', emoji='🥣', servings=8, serving_size='about ¼ cup',
  meal=['side'], protein='beef', method=['stovetop'], tags=['quick'], prep=5, cook=15,
  equipment=['the roasting pan (or a saucepan)', 'whisk', 'fat separator or spoon'],
  summary='A smooth brown gravy made from the roast’s drippings and beef broth while the meat rests.',
  ingredients='''
3 tbsp tallow | fat from the roast's drippings, or butter
3 tbsp flour
2 1/2 cup beef-broth | low-sodium
1 tsp worcestershire
~1/4 tsp black-pepper
~1/4 tsp salt
''',
  steps=[
    'Pour the drippings into a cup and let the fat rise. Spoon 3 tablespoons fat back into the pan; save the dark juices underneath.',
    'Set the pan over medium heat (across two burners if it’s big). Whisk in the flour and cook, stirring, 2 minutes, until it smells toasty.',
    'Whisk in the broth and the saved juices a little at a time, scraping up the browned bits. Simmer 5 to 8 minutes, until it coats a spoon.',
    'Stir in the Worcestershire, then taste before salting: drippings can be salty. Strain if you like it very smooth.',
  ],
  safety=[T_REHEAT],
  make_ahead='Make a base gravy with butter instead of drippings a day ahead; whisk in the drippings when the roast comes out.',
  freezer=(True, 'Freeze up to 3 months.'),
  leftovers=('Refrigerate within 2 hours and use within 1 to 2 days. Bring it to a rolling boil, or 165°F, when reheating (USDA).', None),
  kids='Kids can whisk while a grown-up pours.',
  swaps={'gluten_free': 'Use 1½ tablespoons cornstarch stirred into ¼ cup cold broth instead of the flour; skip the cooking-the-flour step.'},
  prep_day=None,
  pairs=['standing-rib-roast', 'yorkshire-puddings'])

R(id='crisp-roast-potatoes', name='Extra-Crisp Roast Potatoes', emoji='🥔', servings=8, serving_size='about 1 cup',
  meal=['side'], protein='vegetarian', method=['oven', 'stovetop'], tags=[], prep=15, cook=65,
  equipment=['large pot', 'colander', 'large roasting pan or rimmed baking sheet', 'metal spatula'],
  summary='Potatoes boiled until just tender, shaken in the colander to rough up their edges, then roasted in hot fat until glassy-crisp outside and fluffy inside.',
  ingredients='''
4 lb russet-potato | or Yukon-type, peeled and cut in 2-inch chunks
^1 tbsp salt | for the cooking water (most is poured away)
1/3 cup olive-oil | or beef drippings, duck fat or lard
1 1/2 tsp kosher-salt
4 sprig rosemary
6 clove garlic | smashed, skins on
''',
  steps=[
    'Heat the oven to 425°F. Put the potatoes in the pot, cover with cold water, add 1 tablespoon salt, and bring to a boil. Simmer 8 to 10 minutes, until the outsides are soft but the centers still firm.',
    'While they boil, put the oil in the roasting pan and heat it in the oven 5 minutes.',
    'Drain the potatoes well and let them steam 2 minutes. Shake the colander hard so the edges turn fluffy and rough.',
    'Carefully tip the potatoes into the hot oil (it will sizzle), turn them to coat, and sprinkle with the kosher salt.',
    'Roast 45 to 55 minutes, turning every 15 minutes, adding the rosemary and garlic for the last 15. They’re done when deep golden and crunchy.',
  ],
  safety=[],
  make_ahead='Parboil and rough up the potatoes up to a day ahead; cool, then refrigerate uncovered. Roast on the day.',
  freezer=(True, 'Freeze parboiled, cooled potatoes on a tray, then bag; roast from frozen, adding 10 minutes.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days. Recrisp in a 425°F oven.', None),
  kids='Kids can shake the colander (with the lid on) to rough up the potatoes.',
  swaps={'shared_oven': 'Roasting alongside the beef at 325°F? Give them 70 to 80 minutes, then crisp them at 450°F with the Yorkshire puddings.'},
  prep_day=dict(ahead='Parboil the potatoes the day before.', station='oven', oven_f=425, active=15, keeps_days=4),
  pairs=['standing-rib-roast', 'roast-carrots-parsnips'])

R(id='roast-carrots-parsnips', name='Honey-Roasted Carrots and Parsnips', emoji='🥕', servings=8, serving_size='about ¾ cup',
  meal=['side'], protein='vegetarian', method=['oven', 'sheet-pan'], tags=[], prep=15, cook=35,
  equipment=['large rimmed baking sheet', 'large bowl'],
  summary='Sweet root vegetables roasted until caramelized, then tossed with honey and thyme. A classic on British and American holiday tables.',
  ingredients='''
1 1/2 lb carrot | peeled, halved lengthwise and cut in 3-inch sticks
1 1/2 lb parsnips | peeled, cut like the carrots (core removed if woody)
3 tbsp olive-oil
1 tsp kosher-salt
1/2 tsp black-pepper
2 tbsp honey
1 tbsp thyme | leaves
''',
  steps=[
    'Heat the oven to 425°F.',
    'Toss the carrots and parsnips with the oil, salt and pepper and spread them on the sheet in one layer.',
    'Roast 25 minutes, stir, and roast 10 minutes more, until browned and tender.',
    'Drizzle with honey, scatter the thyme over and toss on the hot pan.',
  ],
  safety=[],
  make_ahead='Peel and cut the vegetables a day ahead; keep them in a bag in the refrigerator.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days.', None),
  kids='Kids can toss the vegetables with oil and drizzle the honey.',
  swaps={'vegan': 'Use maple syrup instead of honey.'},
  prep_day=dict(ahead='Cut the vegetables the day before.', station='oven', oven_f=425, active=15, keeps_days=4),
  pairs=['standing-rib-roast'])

# =====================================================================  DESSERTS AND BREAKFAST
R(id='english-trifle', name='Berry and Custard Trifle', emoji='🍮', servings=12, serving_size='about 1 cup',
  meal=['snack'], protein='vegetarian', method=['oven', 'stovetop'], tags=['make-ahead'], prep=45, cook=30, inactive=240,
  equipment=['9-by-13-inch pan', 'saucepan', 'whisk', 'mixer', 'glass trifle bowl or large glass bowl', 'food thermometer (helpful)'],
  summary='Layers of soft sponge cake, raspberry jam, berries, homemade vanilla custard and whipped cream in a glass bowl. A British Christmas classic, made family-style with orange juice instead of sherry.',
  ingredients='''
Sponge:
4 each eggs
3/4 cup sugar
1 tsp vanilla
1 cup flour
1 tsp baking-powder
1/4 tsp salt
Custard:
3 cup whole-milk
4 each egg-yolks
1/2 cup sugar
1/4 cup cornstarch
2 tsp vanilla
To assemble:
1/2 cup jam | raspberry
1/2 cup orange-juice
3 cup raspberries | fresh or thawed frozen, plus strawberries
1 1/2 cup heavy-cream
2 tbsp powdered-sugar
''',
  steps=[
    'Bake the sponge: heat the oven to 350°F and grease and flour the pan. Beat the eggs and sugar on high until pale and thick, 5 minutes. Beat in the vanilla. Fold in the flour, baking powder and salt. Spread in the pan and bake 18 to 20 minutes, until springy. Cool.',
    'Make the custard: heat the milk until steaming. Whisk the yolks, sugar and cornstarch in a bowl, then slowly whisk in the hot milk. Pour it back into the pan.',
    'Cook over medium heat, whisking constantly, until it bubbles and thickens, then whisk 1 minute more. It will be well past 160°F, the temperature for egg dishes. Stir in the vanilla, press plastic wrap on the surface, and chill until cold.',
    'Cut the sponge in 1-inch cubes. Toss half with half the jam and orange juice and pack it into the bowl. Add half the berries, then half the custard. Repeat.',
    'Whip the cream with the powdered sugar to soft peaks and spread it on top. Chill at least 4 hours or overnight so the cake softens. Top with more berries to serve.',
  ],
  safety=[T_EGGS],
  make_ahead='Bake the sponge 2 days ahead. Assemble the trifle the night before.',
  freezer=(True, 'Freeze the plain sponge up to 2 months. The finished trifle doesn’t freeze well.'),
  leftovers=('Keep covered in the refrigerator and eat within 2 days.', None),
  kids='Kids can cube the cake and layer the bowl.',
  swaps={'shortcut': 'Use a store-bought pound cake or ladyfingers instead of the sponge.', 'fruit': 'Use sliced peaches or mandarin oranges instead of berries.'},
  prep_day=dict(ahead='Make the trifle the night before.', station='oven', oven_f=350, active=45, keeps_days=2),
  pairs=['buche-de-noel'])

R(id='buche-de-noel', name='Bûche de Noël (Yule Log Cake)', emoji='🪵', servings=12, serving_size='1 slice',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=60, cook=12, inactive=120,
  equipment=['10-by-15-inch rimmed baking sheet (jelly-roll pan)', 'parchment paper', 'mixer', 'clean kitchen towel', 'saucepan', 'offset spatula', 'fork'],
  summary='A rolled chocolate sponge filled with whipped cream and frosted with chocolate ganache scored to look like bark. Paris pastry shops made the log famous in the late 1800s.',
  ingredients='''
Chocolate sponge:
5 each eggs | separated
3/4 cup sugar
1 tsp vanilla
1/3 cup cocoa
1/3 cup flour
1/4 tsp salt
^2 tbsp powdered-sugar | for the towel
Filling:
1 1/2 cup heavy-cream
3 tbsp powdered-sugar
1 tsp vanilla
Ganache bark:
8 oz dark-chocolate | chopped, or semisweet chips
3/4 cup heavy-cream
''',
  steps=[
    'Heat the oven to 375°F. Line the pan with parchment and grease the paper.',
    'Beat the yolks with half the sugar until thick and pale, 3 minutes; beat in the vanilla. In a clean bowl, beat the whites to soft peaks, then add the rest of the sugar and beat to firm, glossy peaks.',
    'Sift the cocoa, flour and salt over the yolks and fold gently, then fold in the whites in three parts. Spread evenly in the pan.',
    'Bake 10 to 12 minutes, until it springs back. Dust a towel with powdered sugar, turn the cake out onto it, peel off the paper, and roll the warm cake up in the towel from a short end. Cool rolled, about 1 hour. Rolling it warm keeps it from cracking later.',
    'Whip the cream with the powdered sugar and vanilla to firm peaks. Unroll the cake, spread the cream to within 1 inch of the edges, and roll it up again without the towel. Chill seam side down.',
    'For the ganache, heat the cream until steaming and pour it over the chocolate. Wait 3 minutes, then stir smooth. Cool until thick enough to spread, about 30 minutes.',
    'Cut a short diagonal piece off one end and set it against the side as a branch. Spread the ganache over everything and drag a fork through it to look like bark. Chill at least 1 hour. Dust with powdered sugar “snow” to serve.',
  ],
  safety=[],
  make_ahead='Make the whole log a day ahead and keep it chilled.',
  freezer=(True, 'Freeze the finished log, unwrapped until firm, then wrapped, up to 1 month. Thaw overnight in the refrigerator.'),
  leftovers=('Keep covered in the refrigerator up to 3 days.', None),
  kids='Kids can drag the fork bark lines and shake on the snow.',
  swaps={'mocha': 'Add 1 teaspoon instant coffee to the cream for the filling.'},
  prep_day=dict(ahead='Make the log the day before.', station='oven', oven_f=375, active=60, keeps_days=3),
  pairs=['english-trifle'])

R(id='overnight-breakfast-strata', name='Christmas Morning Sausage Strata', emoji='🎁', servings=10, serving_size='1 square',
  meal=['breakfast'], protein='pork', method=['oven', 'stovetop'], tags=['make-ahead', 'leftovers'], prep=25, cook=55, inactive=480,
  equipment=['skillet', '9-by-13-inch baking dish', 'large bowl', 'whisk', 'food thermometer'],
  summary='Bread, browned sausage, cheese and eggs assembled the night before. In the morning it goes straight into the oven while presents are opened.',
  ingredients='''
1 lb breakfast-sausage | bulk, or links removed from casings
1 each onion | chopped
1 each red-bell-pepper | chopped
10 slice sourdough | or French bread, cubed (about 10 cups)
2 cup cheddar | shredded
10 each eggs
2 1/2 cup whole-milk
1 tsp ground-mustard
1/2 tsp salt
1/4 tsp black-pepper
''',
  steps=[
    'Cook the sausage in the skillet, breaking it up, until no pink remains and it reaches 160°F. Add the onion and pepper and cook until soft. Drain off the fat and cool 10 minutes.',
    'Grease the dish. Layer half the bread, half the sausage mixture and half the cheese, then repeat.',
    'Whisk the eggs, milk, mustard, salt and pepper and pour over everything. Press the bread down so it soaks. Cover and refrigerate overnight (8 to 24 hours).',
    'In the morning, heat the oven to 350°F and let the dish stand while it heats. Uncover and bake 50 to 55 minutes, until puffed and golden and a knife in the center comes out clean. The center should read 160°F.',
    'Let it stand 10 minutes before cutting.',
  ],
  safety=[T_SAUSAGE, T_EGGS],
  make_ahead='Assemble the night before; that’s the point.',
  freezer=(True, 'Freeze baked squares up to 2 months; reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; eat within 3 to 4 days. Reheat to 165°F.', 'lunch'),
  kids='Kids can tear the bread and sprinkle the cheese.',
  swaps={'meatless': 'Use 3 cups sautéed mushrooms and spinach instead of sausage.', 'ham': 'Use 2 cups diced leftover ham; it’s already cooked.'},
  prep_day=dict(ahead='Assemble the night before.', station='oven', oven_f=350, active=25, keeps_days=4),
  pairs=['cranberry-orange-muffins'])

# =====================================================================  COLLECTION (the page's plan)
META = {'title': 'Christmas baking and holiday dinner', 'url': 'meal-prep/christmas/', 'icon': '🎄',
        'blurb': 'Christmas baking and holiday dinner collection',
        'keywords': ['Christmas', 'Christmas cookies', 'holiday baking', 'cookie swap', 'Christmas dinner', 'prime rib', 'holiday']}
COURSES = [
    {'id': 'cookies', 'title': 'Cookies for the tray', 'icon': '🍪', 'mode': 'cookies',
     'intro': 'Cut-outs to decorate, spiced gingerbread, butter cookies that keep for weeks, and two from our everyday recipes. Most doughs freeze, so you can bake in December evenings and still have a full tray.',
     'items': ['r:sugar-cutout-cookies', 'r:gingerbread-people', 'r:butter-shortbread', 'r:snickerdoodles', 'r:jam-thumbprint-cookies', 'r:spritz-cookies', 'r:chocolate-crinkle-cookies', 'r:peanut-butter-cookies', 'r:oatmeal-raisin-walnut-cookies']},
    {'id': 'candy', 'title': 'Candy and gifts', 'icon': '🍬', 'mode': 'cookies',
     'intro': 'No-bake treats that pack well in tins. The from-scratch marshmallows make a fine gift with a jar of cocoa.',
     'items': ['r:peppermint-bark', 'r:chocolate-fudge', 'r:gingerbread-house', 's:marshmallows', 's:chocolate-from-cocoa']},
    {'id': 'roast', 'title': 'The roast', 'icon': '🥩',
     'intro': 'Pick one centerpiece. Prime rib is the grandest; a glazed ham feeds a crowd and gives the best leftovers; a roast chicken suits a small table.',
     'items': ['r:standing-rib-roast', 'r:brown-sugar-glazed-ham', 'r:bone-in-glazed-ham', 'r:roast-chicken', 'r:herb-pork-loin-roast']},
    {'id': 'sides', 'title': 'Yorkshire puddings, potatoes and vegetables', 'icon': '🥔',
     'intro': 'Yorkshire puddings bake while the beef rests. Potatoes and roots can share the oven before that.',
     'items': ['r:yorkshire-puddings', 'r:crisp-roast-potatoes', 'r:beef-pan-gravy', 'r:horseradish-cream', 'r:roast-carrots-parsnips', 'r:mashed-potatoes', 'r:balsamic-roasted-brussels-sprouts', 'r:green-beans', 'r:homemade-cranberry-sauce', 'r:winter-citrus-salad', 'r:parker-house-rolls']},
    {'id': 'desserts', 'title': 'Desserts', 'icon': '🎂',
     'intro': 'Both showpieces are made the day before, so the oven and the cook are free on the day.',
     'items': ['r:buche-de-noel', 'r:english-trifle', 'r:mini-cheesecakes', 'r:apple-pie', 's:whipped-cream']},
    {'id': 'breakfast', 'title': 'Christmas morning', 'icon': '🎁',
     'intro': 'Breakfasts that are ready when everyone comes down.',
     'items': ['r:overnight-breakfast-strata', 'r:cranberry-orange-muffins', 's:cinnamon-rolls', 'r:french-toast']},
]
SCRATCH = ['butter', 'powdered-sugar', 'whipped-cream', 'marshmallows', 'chocolate-from-cocoa', 'cinnamon-rolls', 'brioche', 'beef-stock', 'soft-buns-rolls']
DEFAULT_MENU = ['standing-rib-roast', 'yorkshire-puddings', 'crisp-roast-potatoes', 'beef-pan-gravy', 'horseradish-cream', 'roast-carrots-parsnips', 'balsamic-roasted-brussels-sprouts', 'buche-de-noel']
DEFAULT_COOKIES = ['sugar-cutout-cookies', 'gingerbread-people', 'butter-shortbread', 'peppermint-bark']
# for the timeline: what each dish needs on the day (oven [°F, minutes]; stove minutes; ahead days; last = straight from the oven;
# after_roast = made from the drippings while the roast rests)
DAY = {
    'yorkshire-puddings': {'oven': [450, 22], 'last': True, 'ahead_part': 'make the batter'},
    'crisp-roast-potatoes': {'oven': [425, 55], 'ahead_part': 'parboil the potatoes'},
    'roast-carrots-parsnips': {'oven': [425, 35], 'ahead_part': 'peel and cut the vegetables'},
    'balsamic-roasted-brussels-sprouts': {'oven': [425, 25]},
    'parker-house-rolls': {'oven': [375, 18], 'last': True},
    'beef-pan-gravy': {'stove': 15, 'after_roast': True},
    'mashed-potatoes': {'stove': 35}, 'green-beans': {'stove': 15},
    'horseradish-cream': {'ahead': 2}, 'homemade-cranberry-sauce': {'ahead': 7}, 'winter-citrus-salad': {'stove': 0},
    'buche-de-noel': {'ahead': 1}, 'english-trifle': {'ahead': 1}, 'mini-cheesecakes': {'ahead': 2}, 'apple-pie': {'ahead': 1},
}
# roasts for the timeline. per_lb: [min per lb low, high] at oven °F (USDA FSIS); done: the thermometer reading; rest: minutes
ROASTS = {
    'standing-rib-roast': {'label': 'Standing rib roast, bone in (325°F)', 'oven': 325, 'per_lb': [23, 30], 'lb': [4, 8], 'done': '145°F for medium-rare (USDA minimum), 160°F for medium', 'rest': 30, 'src': 'USDA: 23 to 30 minutes per pound for a 4- to 8-lb roast'},
    'bone-in-glazed-ham': {'label': 'Fully cooked half ham, bone in (325°F)', 'oven': 325, 'per_lb': [18, 24], 'lb': [5, 8], 'done': '140°F (USDA, for a fully cooked ham)', 'rest': 15, 'src': 'USDA: 18 to 24 minutes per pound for a 5- to 7-lb half ham'},
    'brown-sugar-glazed-ham': {'label': 'Spiral-cut ham, fully cooked (325°F)', 'oven': 325, 'per_lb': [10, 18], 'lb': [7, 9], 'done': '140°F (USDA, for a fully cooked ham)', 'rest': 15, 'src': 'USDA: 10 to 18 minutes per pound for a 7- to 9-lb spiral ham'},
    'roast-chicken': {'label': 'Whole roast chicken (425°F)', 'oven': 425, 'per_lb': [15, 20], 'lb': [3, 6], 'done': '165°F in the thickest part of the thigh and breast (USDA)', 'rest': 15, 'src': 'our recipe’s time, about 15 to 20 minutes per pound at 425°F'},
}
# the cookie-swap planner: how many cookies one batch of each recipe makes (the servings above, or more for small cookies)
COOKIE_YIELD = {'sugar-cutout-cookies': 24, 'gingerbread-people': 24, 'butter-shortbread': 24, 'snickerdoodles': 24, 'jam-thumbprint-cookies': 24,
                'spritz-cookies': 48, 'chocolate-crinkle-cookies': 24, 'peanut-butter-cookies': 24, 'oatmeal-raisin-walnut-cookies': 24,
                'peppermint-bark': 24, 'chocolate-fudge': 24}
EXTRA = {'default_cookies': DEFAULT_COOKIES, 'cookie_yield': COOKIE_YIELD, 'tool': 'roast'}
EXTRA_IDS = DEFAULT_COOKIES + list(COOKIE_YIELD)
GOALS_EXCLUDE = [r['id'] for r in RECIPES if r['id'] not in ('roast-carrots-parsnips', 'horseradish-cream', 'overnight-breakfast-strata', 'crisp-roast-potatoes')]

SOURCES = [
    ('fsis-roast', 'Roasting Those “Other” Holiday Meats', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/roasting-those-other-holiday-meats'),
    ('fsis-ham', 'Hams and Food Safety', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/hams-and-food-safety'),
    ('fda-eggs', 'What You Need to Know About Egg Safety', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-egg-safety'),
    ('cdc-dough', 'Say No to Raw Dough (archived)', 'Centers for Disease Control and Prevention', 'https://webarchive.library.unt.edu/web/20210120082242/https://www.cdc.gov/foodsafety/communication/no-raw-dough.html'),
]

G = lambda t, what: {'name': t.replace('_', ' ').replace('(', '').replace(')', '') + ' (Grokipedia)', 'url': 'https://grokipedia.com/page/' + t, 'what': what}  # noqa: E731
U = {a: {'name': f'{b} ({c})', 'url': d, 'what': w} for a, b, c, d, w in [
    ('fsis-roast', 'Roasting Those “Other” Holiday Meats', 'USDA FSIS', SOURCES[0][3], 'roasting times, 145°F and the 3-minute rest'),
    ('fsis-ham', 'Hams and Food Safety', 'USDA FSIS', SOURCES[1][3], 'reheating ham to 140°F; leftovers'),
    ('fda-eggs', 'What You Need to Know About Egg Safety', 'FDA', SOURCES[2][3], 'pasteurized eggs for uncooked icing; egg dishes to 160°F'),
    ('cdc-dough', 'Say No to Raw Dough', 'CDC, archived', SOURCES[3][3], 'why not to taste raw dough'),
]}
COOKIE_G = G('Christmas_cookie', 'the holiday cookie tradition')
CREDITS = {
    'sugar-cutout-cookies': [U['fda-eggs'], U['cdc-dough'], G('Royal_icing', 'royal icing and how it got its name'), COOKIE_G],
    'gingerbread-people': [G('Gingerbread', 'background'), U['cdc-dough']],
    'gingerbread-house': [G('Gingerbread_house', 'the tradition and Hansel and Gretel'), U['fda-eggs']],
    'butter-shortbread': [G('Shortbread', 'Scottish background')],
    'snickerdoodles': [G('Snickerdoodle', 'background'), U['cdc-dough']],
    'jam-thumbprint-cookies': [COOKIE_G, U['cdc-dough']],
    'spritz-cookies': [G('Spritzgebäck', 'the name and the cookie press'), U['cdc-dough']],
    'chocolate-crinkle-cookies': [COOKIE_G, U['cdc-dough']],
    'chocolate-fudge': [G('Fudge', 'background')],
    'peppermint-bark': [G('Peppermint', 'background')],
    'standing-rib-roast': [U['fsis-roast'], G('Standing_rib_roast', 'the cut and its names')],
    'yorkshire-puddings': [G('Yorkshire_pudding', 'the 1737 and 1747 recipes')],
    'beef-pan-gravy': [G('Gravy', 'background')],
    'english-trifle': [G('Trifle', 'background'), U['fda-eggs']],
    'buche-de-noel': [G('Yule_log_(cake)', 'the cake’s Paris origins')],
    'overnight-breakfast-strata': [U['fda-eggs']],
}


NOTE = ('Christmas baking and holiday dinner (/meal-prep/christmas/): new recipes plus the page plan, which reuses recipes from the other files by id. '
        'Edit scripts/meals/src/build_christmas.py and run it; allergens, diet and guides are derived from the catalog.')
# recipes from my sibling collections (Easter), allowed before their file exists on a first run
SOFT = {'bone-in-glazed-ham'}


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


def existing_ids(skip):
    rec = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != skip:
            rec |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    return rec


def main():
    out = build(RECIPES)
    fname = SLUG + '.json'
    rec_ids = existing_ids(fname)
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    soft = SOFT
    sc_ids = {s['id'] for s in json.load(open(os.path.join(SITE, 'data/meals/scratch.json')))['recipes']}
    allr = []
    for c in COURSES:
        for it in c['items']:
            kind, _, i = it.partition(':')
            if (kind == 'r' and i not in rec_ids and i not in soft) or (kind == 's' and i not in sc_ids) or kind not in 'rs':
                raise SystemExit(f'course {c["id"]}: unknown {it}')
            if kind == 'r' and i not in allr:
                allr.append(i)
    for i in SCRATCH:
        if i not in sc_ids:
            raise SystemExit(f'unknown scratch page {i}')
    for i in DEFAULT_MENU + EXTRA_IDS + list(DAY) + [v.get('recipe', k) for k, v in ROASTS.items()]:
        if i not in rec_ids and i not in soft:
            raise SystemExit(f'unknown recipe {i}')
    for r in out:
        for p in r['pairs']:
            if p not in rec_ids:
                raise SystemExit(f'{r["id"]}: pairs with unknown {p}')
    missing = {r['id'] for r in out} - set(allr)
    if missing:
        raise SystemExit(f'new recipes not on the page: {missing}')
    coll = {'meta': META, 'courses': COURSES, 'scratch': SCRATCH, 'default_menu': DEFAULT_MENU,
            'day': DAY, 'roasts': ROASTS, 'goals_exclude': GOALS_EXCLUDE, **EXTRA,
            'all': allr, 'new': [r['id'] for r in out],
            'sources': [{'id': a, 'title': b, 'publisher': c, 'url': d} for a, b, c, d in SOURCES]}
    with open(os.path.join(SITE, 'data/meals/recipes', fname), 'w') as fh:
        json.dump({'note': NOTE,
                   'collection': coll, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(fname, len(out), 'new recipes;', len(allr), 'recipes on the page')


if __name__ == '__main__':
    main()
