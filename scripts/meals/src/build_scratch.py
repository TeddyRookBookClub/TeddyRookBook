#!/usr/bin/env python3
"""Builds data/meals/scratch.json (from-scratch recipes for things people usually buy) and
data/meals/garden-map.json (which catalog items the Food Garden Planner's crops, hens and bees can supply).

Run:  python3 scripts/meals/src/build_scratch.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

Every ingredient is a catalog item. Amounts for flour, sugar, fat, salt and yeast are written in grams so the
pages can show weight and volume (the catalog's g_per_cup turns grams into cups and spoons).
Storage times and safety notes come only from the sources listed in SOURCES; where no agency publishes a time,
the text says so instead of guessing. No canning: canning questions go to NCHFP's tested recipes.

Schema (one recipe):
  id, name, emoji, kind ("scratch" = the homemade version; "stand-in" = a pantry substitute), group, summary,
  makes: [{item, by, n, label}]   one batch makes n of `by` (a unit of that catalog item: slice, each, cup, g...)
  yield: text;  batch: {step, min, pans?: [{id, label, f}]}  (step and min are fractions of a batch)
  ingredients: [{item, amount, unit, prep, optional}];  equipment; steps
  cooked_later: true when the meal recipe cooks it (fresh pasta is boiled), so raw egg in the dough is fine
  stages: [{do, active, cook, wait, station, temp, bg}]   minutes; the prep-day planner schedules these
     active = hands-on; cook = on the station (oven, stove, simmer) and mostly hands-off; wait = rising, resting,
     cooling, incubating; bg = the cook can walk away (incubating, chilling)
  times: {active, total}  (derived from stages)
  plan: {keep_days, freeze, lead_days, thaw}  for scheduling: days it keeps after making (fridge or counter),
     whether the made food freezes, days it must be made ahead (pickles need a day to season)
  keeps: [text], scaling, old_way, safety: [text], notes: [text]
  nutrition: {from: "ingredients"} | {from: "item", why} | {from: "usda", fdc, per100, why}
  src: [source ids]
"""
import json, os, re, sys, csv, io, zipfile
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ACCESSED = '2026-10-25'

S = lambda *a: list(a)  # noqa: E731

SOURCES = [
    ('ndsu-fn579', 'Food Storage Guide (FN579)', 'NDSU Extension, reviewed January 2023', 'https://www.ndsu.edu/agriculture/sites/default/files/2023-01/fn579.pdf'),
    ('ndsu-fn616', 'Food Freezing Basics: Freezing Dairy Products, Eggs and Other Foods (FN616)', 'NDSU Extension, reviewed 2022', 'https://www.ndsu.edu/agriculture/extension/publications/food-freezing-basics-freezing-dairy-products-eggs-and-other-foods'),
    ('mu-gh1505', 'How to Freeze Home-Prepared Foods (GH1505)', 'University of Missouri Extension', 'https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/hesguide/foodnut/gh1505.pdf'),
    ('cornell-bread', 'Tips for Storing Bread', 'Cornell Cooperative Extension, Herkimer County, 2020', 'https://blogs.cornell.edu/cceherkimer/2020/05/04/tips-for-storing-bread/'),
    ('umn-storage', 'Storage times for food in the refrigerator and freezer', 'University of Minnesota Extension, reviewed 2021', 'https://extension.umn.edu/preserving-and-preparing/storage-times-food-refrigerator-and-freezer'),
    ('fs-cold', 'Cold Food Storage Chart', 'FoodSafety.gov (U.S. Department of Health and Human Services)', 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts'),
    ('fsis-leftovers', 'Leftovers and Food Safety', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety'),
    ('fsis-eggs', 'Shell Eggs from Farm to Table', 'USDA Food Safety and Inspection Service', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/eggs/shell-eggs-farm-table'),
    ('fda-eggs', 'What You Need to Know About Egg Safety', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-egg-safety'),
    ('fda-flour', 'Handling Flour Safely: What You Need to Know', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know'),
    ('fda-toxins', 'Natural Toxins in Food', 'U.S. Food and Drug Administration', 'https://www.fda.gov/food/chemical-contaminants-pesticides/natural-toxins-food'),
    ('ndsu-fn198', 'Ingredient Substitutions (NDSU Extension FN198, 2013; reprinted by Purdue Extension as HHS-784-W)', 'NDSU Extension', 'https://www.extension.purdue.edu/extmedia/HHS/HHS-784-W.pdf'),
    ('mu-mp564', 'In a Pinch: Ingredient Substitution (MP564)', 'University of Missouri Extension', 'https://extension.missouri.edu/publications/mp564'),
    ('csu-9329', 'Ingredient Substitutions (Fact Sheet 9.329)', 'Colorado State University Extension, 2013', 'https://elpaso.extension.colostate.edu/wp-content/uploads/sites/44/2020/03/Ingredient-substitutions.pdf'),
    ('usu-subs', 'List of Ingredient Substitutions for Cooking and Baking', 'Utah State University Extension', 'https://extension.usu.edu/archive/list-of-ingredient-substitutions-for-cooking-and-baking'),
    ('isu-noodles', 'Homemade Egg Noodles Made Safe', 'Iowa State University Extension and Outreach, AnswerLine (updated 2026)', 'https://blogs.extension.iastate.edu/answerline/2019/03/14/making-homemade-noodles-safely/'),
    ('isu-salsa', 'It’s Salsa Time!', 'Iowa State University Extension and Outreach, AnswerLine, 2024', 'https://blogs.extension.iastate.edu/answerline/2024/08/13/its-salsa-time/'),
    ('osu-salsa', 'Making Fresh Salsa', 'Ohio State University Extension, 2014', 'https://livesmartohio.osu.edu/food/extensionauthors/making-fresh-salsa/'),
    ('wsu-yogurt', 'Yogurt Made Simple (FS173E)', 'Washington State University Extension, 2015', 'https://extension.oregonstate.edu/sites/extd8/files/documents/8836/fs173emakingyogurt.pdf'),
    ('nmsu-cheese', 'Making Homemade Cheese (Guide E-216)', 'New Mexico State University Cooperative Extension, 2022', 'https://ucanr.edu/sites/default/files/2023-05/384783.pdf'),
    ('uw-pickles', 'Homemade Pickles & Relishes (B2267)', 'University of Wisconsin–Madison Extension', 'https://4h.extension.wisc.edu/files/2026/01/Homemade-Pickles-and-Relishes.pdf'),
    ('osu-pickles', 'Refrigerator Pickled Cucumbers', 'Oregon State University Extension', 'https://extension.oregonstate.edu/imported-publication/refrigerator-pickled-cucumbers'),
    ('ndsu-fn189', 'Food Preservation: Making Pickled Products (FN189)', 'NDSU Extension, 2024', 'https://www.ndsu.edu/agriculture/extension/publications/food-preservation-making-pickled-products'),
    ('osu-oil', 'Herbs and Vegetables in Oil (SP 50-701)', 'Oregon State University Extension, 2025', 'https://extension.oregonstate.edu/catalog/pub/sp-50-701-herbs-vegetables-oil'),
    ('nchfp-sauce', 'Standard Tomato Sauce', 'National Center for Home Food Preservation', 'https://nchfp.uga.edu/how/can/how-do-i-can-tomatoes/standard-tomato-sauce/'),
    ('nchfp-crushed', 'Crushed Tomatoes (with no added liquid)', 'National Center for Home Food Preservation', 'https://nchfp.uga.edu/how/can/how-do-i-can-tomatoes/crushed-tomatoes-with-no-added-liquid/'),
    ('nchfp-applesauce', 'Fall into the Season with Home-Canned Applesauce', 'National Center for Home Food Preservation', 'https://nchfp.uga.edu/blog/fall-into-the-season-with-home-canned-applesauce'),
    ('nchfp-headspace', 'Headspace to Allow (freezing)', 'National Center for Home Food Preservation', 'https://nchfp.uga.edu/how/freeze/freeze-general-information/headspace-to-allow/'),
    ('nchfp-frozen', 'How Long Can I Store Frozen Foods', 'National Center for Home Food Preservation', 'https://nchfp.uga.edu/how/freeze/freeze-general-information/how-long-can-i-store-frozen-foods/'),
    ('nchfp', 'National Center for Home Food Preservation (tested canning recipes)', 'University of Georgia', 'https://nchfp.uga.edu/'),
    ('ucd-butter', 'Making Goat Milk Butter at Home', 'UC Davis Dairy Research and Information Center', 'https://drinc.ucdavis.edu/goat-dairy-foods/making-goat-milk-butter-home'),
    ('uky-cultured', 'Dairy Foods Unit 4: Cultured Dairy Products', 'University of Kentucky Cooperative Extension Service, 1998', 'https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/4ji04pa.pdf'),
    ('wiki-brown', 'Brown sugar', 'Wikipedia', 'https://en.wikipedia.org/wiki/Brown_sugar'),
    ('wiki-powdered', 'Powdered sugar', 'Wikipedia', 'https://en.wikipedia.org/wiki/Powdered_sugar'),
    ('wiki-masa', 'Masa', 'Wikipedia', 'https://en.wikipedia.org/wiki/Masa'),
    ('wiki-buttermilk', 'Buttermilk', 'Wikipedia', 'https://en.wikipedia.org/wiki/Buttermilk'),
    ('wiki-fleischmann', 'Charles Louis Fleischmann', 'Wikipedia', 'https://en.wikipedia.org/wiki/Charles_Louis_Fleischmann'),
    ('wiki-lyeroll', 'Lye roll', 'Wikipedia', 'https://en.wikipedia.org/wiki/Lye_roll'),
    ('wiki-bicarbonate', 'Sodium bicarbonate', 'Wikipedia', 'https://en.wikipedia.org/wiki/Sodium_bicarbonate'),
    ('wiki-carbonate', 'Sodium carbonate', 'Wikipedia', 'https://en.wikipedia.org/wiki/Sodium_carbonate'),
    ('niosh-naoh', 'NIOSH Pocket Guide to Chemical Hazards: Sodium hydroxide', 'Centers for Disease Control and Prevention (NIOSH)', 'https://www.cdc.gov/niosh/npg/npgd0565.html'),
    ('clemson-sourdough', 'How to Make, Feed, and Bake With a Sourdough Starter: Sourdough 101 Guide', 'Clemson Cooperative Extension, Home & Garden Information Center, 2025', 'https://hgic.clemson.edu/how-to-make-feed-and-bake-with-a-sourdough-starter-sourdough-101-guide/'),
    ('uaf-sourdough', 'Sourdough (FNH-00061)', 'University of Alaska Fairbanks Cooperative Extension Service, 2024', 'https://www.uaf.edu/ces/publications/database/food/sourdough.php'),
    ('ucanr-starter', 'Can This Sourdough Starter Be Saved? Or Is This Starter a Goner?', 'UC Agriculture and Natural Resources, Master Food Preservers of San Luis Obispo and Santa Barbara Counties, 2020', 'https://ucanr.edu/blog/master-food-preserver-slo-sb-counties/article/can-sourdough-starter-be-saved-or-starter-goner'),
    ('isu-tangzhong', 'Tangzhong', 'Iowa State University Extension and Outreach, AnswerLine, 2018', 'https://blogs.extension.iastate.edu/answerline/2018/07/30/tangzhong/'),
    ('fdc', 'FoodData Central (SR Legacy)', 'USDA Agricultural Research Service', 'https://fdc.nal.usda.gov/'),
]


def I(item, amount, unit, prep='', optional=False, eaten=True, fixed=False):
    d = {'item': item, 'amount': amount, 'unit': unit}
    if fixed: d['fixed'] = True  # the same amount for any batch size
    if prep: d['prep'] = prep
    if optional: d['optional'] = True
    if not eaten: d['in_nutrition'] = False  # e.g. a pretzel bath: bought and used, but poured away
    return d


def st(do, active=0, cook=0, wait=0, station='counter', temp=None, bg=False, before=False):
    d = {'do': do, 'station': station}
    if before: d['before'] = True  # done the day before (an overnight chill); the prep-day timeline starts after it
    if active: d['active'] = active
    if cook: d['cook'] = cook
    if wait: d['wait'] = wait
    if temp: d['temp'] = temp
    if bg: d['bg'] = True
    return d


BREAD_KEEPS = [
    'Counter: wrapped, about 3 days (NDSU’s figure for bread and rolls). Cornell Extension advises against keeping bread in the refrigerator.',
    'Freezer: cool completely, wrap in plastic and then foil or a freezer bag, up to 3 months (University of Missouri). Slice first so you can take out what you need; a whole loaf thaws in its wrapping on the counter in about 3 hours (Cornell).',
]
BREAD_SRC = ['ndsu-fn579', 'cornell-bread', 'mu-gh1505', 'fda-flour']
FLOUR_SAFETY = 'Don’t taste raw dough or batter, and wash your hands and the counter after handling flour: raw flour can carry germs that only baking kills (FDA).'

R = []

# ------------------------------------------------------------------ breads
loaf_pans = [{'id': '9x5', 'label': '9 × 5-inch loaf pan', 'f': 1}, {'id': '8x4', 'label': '8½ × 4½-inch loaf pan', 'f': 0.75}]
R.append(dict(
    id='sandwich-bread', name='Sandwich bread', emoji='🍞', kind='scratch', group='Yeast breads',
    summary='A soft white loaf for toast and sandwiches, sized for the loaf pan you have.',
    makes=[{'item': 'white-bread', 'by': 'slice', 'n': 16, 'label': 'slices (about ½ inch thick)'}],
    yield_='One 9 × 5-inch loaf (about 1¾ lb), 16 slices about ½ inch thick. The same dough at ¾ size fills an 8½ × 4½-inch pan (12 slices).',
    batch={'step': 0.25, 'min': 0.75, 'pans': loaf_pans},
    ingredients=[I('flour', 480, 'g', 'or bread flour; spoon it into the cup and level it'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('sugar', 25, 'g'),
                 I('butter', 42, 'g', 'softened'), I('whole-milk', 1, 'cup'), I('water', 0.3333, 'cup')],
    equipment=['large bowl', 'loaf pan (9 × 5 or 8½ × 4½ inch)', 'instant-read thermometer (helpful)', 'cooling rack'],
    steps=[
        'Warm the milk and water to about 110°F: warm on your wrist, not hot. Stir in the sugar and yeast and let it stand 5 to 10 minutes, until foamy.',
        'Add the butter, salt and about two-thirds of the flour and stir until smooth. Work in the rest of the flour a little at a time until the dough pulls away from the bowl.',
        'Knead on a lightly floured counter 8 to 10 minutes (5 to 6 in a stand mixer with a dough hook), until smooth and springy. If it sticks, add flour a spoonful at a time; a slightly tacky dough makes a softer loaf.',
        'Put the dough in a greased bowl, cover, and let it rise in a warm spot until doubled, 1 to 1½ hours.',
        'Grease the pan. Press the dough into a rectangle as wide as the pan is long, roll it up tightly from the short side, pinch the seam, and set it seam side down in the pan.',
        'Cover and let it rise until the top crowns about 1 inch over the rim of the pan, 45 to 60 minutes. Heat the oven to 350°F for the last 20 minutes.',
        'Bake 35 to 40 minutes for a 9 × 5 pan (30 to 35 for 8½ × 4½), until deep golden and the center reads about 190°F. If the top browns fast, lay foil over it after 20 minutes.',
        'Turn the loaf out onto a rack and cool at least 1 hour before slicing; it is still setting inside.',
        'No loaf pan? Shape the dough into a 10-inch oval on a greased or parchment-lined baking sheet, let it rise 45 minutes, and bake 30 to 35 minutes.'],
    stages=[st('Mix and knead the dough', active=25, wait=90), st('Shape the loaves and set them in the pans', active=10, wait=50),
            st('Bake at 350°F', cook=38, station='oven', temp=350), st('Cool on a rack before slicing', wait=60, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, about 3 hours.'},
    keeps=BREAD_KEEPS,
    scaling='Yeast and salt go by the flour’s weight: 7 g yeast (a packet) and 9 g salt for every 480 g of flour. For two loaves, double everything and bake the pans side by side with space between them; rising and baking take the same time, not twice as long. Most stand mixers knead dough for two 9 × 5 loaves at most. For less than a full packet, weigh the yeast; a ¾ batch for an 8½ × 4½ pan takes about 5 g.',
    old_way='The first factory-made yeast in the United States went on sale in the late 1860s (the Fleischmann brothers in Cincinnati, 1868). Before that, home bakers raised their bread with a starter kept from batch to batch or with yeast from brewing.',
    safety=[FLOUR_SAFETY], notes=['Bread flour gives a taller, chewier loaf; all-purpose gives a softer one. Both work.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC + ['wiki-fleischmann']))

R.append(dict(
    id='whole-wheat-bread', name='Half whole-wheat sandwich bread', emoji='🍞', kind='scratch', group='Yeast breads',
    summary='Half whole-wheat, half white flour, sweetened with a little honey: a soft loaf for sandwiches.',
    makes=[{'item': 'wheat-bread', 'by': 'slice', 'n': 16, 'label': 'slices (about ½ inch thick)'}],
    yield_='One 9 × 5-inch loaf, 16 slices about ½ inch thick (¾ of the dough fills an 8½ × 4½-inch pan).',
    batch={'step': 0.25, 'min': 0.75, 'pans': loaf_pans},
    ingredients=[I('whole-wheat-flour', 240, 'g'), I('flour', 240, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('honey', 2, 'tbsp'),
                 I('butter', 42, 'g', 'softened'), I('whole-milk', 1, 'cup'), I('water', 0.5, 'cup')],
    equipment=['large bowl', 'loaf pan (9 × 5 or 8½ × 4½ inch)', 'instant-read thermometer (helpful)', 'cooling rack'],
    steps=[
        'Warm the milk and water to about 110°F. Stir in the honey and yeast and let it stand 5 to 10 minutes, until foamy.',
        'Stir in the whole-wheat flour, butter and salt, then add the white flour a little at a time until the dough comes together. Let it rest 10 minutes so the bran softens.',
        'Knead 8 to 10 minutes until smooth and elastic. Whole-wheat dough stays a little tacky; add flour sparingly.',
        'Cover and let it rise until doubled, 1 to 1½ hours (whole wheat can be a little slower).',
        'Shape it as for sandwich bread: press into a rectangle, roll up tightly, pinch the seam, and set it in a greased pan.',
        'Let it rise until it crowns about 1 inch over the rim, 45 to 60 minutes, while the oven heats to 350°F.',
        'Bake 35 to 40 minutes (8½ × 4½: 30 to 35), until the center reads about 190°F. Cool on a rack at least 1 hour before slicing.'],
    stages=[st('Mix, rest and knead the dough', active=25, wait=100), st('Shape the loaves and set them in the pans', active=10, wait=55),
            st('Bake at 350°F', cook=38, station='oven', temp=350), st('Cool on a rack before slicing', wait=60, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, about 3 hours.'},
    keeps=BREAD_KEEPS,
    scaling='Same rules as sandwich bread: 7 g yeast and 9 g salt for every 480 g of flour in all. Double for two loaves; the times stay the same.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['For an all whole-wheat loaf, see whole-wheat sandwich bread.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='crusty-loaf', name='French bread and baguettes', emoji='🥖', kind='scratch', group='Yeast breads',
    summary='Flour, water, yeast and salt, baked hot for a crackly crust: two French loaves or three thin baguettes.',
    makes=[{'item': 'french-bread', 'by': 'loaf', 'n': 2, 'label': 'loaves (about 1 lb each)'}],
    yield_='Two loaves, about 1 lb each, or three 15-inch baguettes.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 600, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 12, 'g'), I('water', 1.6667, 'cup', 'about 110°F')],
    equipment=['large bowl', 'baking sheet', 'metal pan for hot water', 'cooling rack'],
    steps=[
        'Stir the yeast into the warm water and let it stand 5 minutes. Add the flour and salt and mix to a shaggy dough.',
        'Knead about 10 minutes, until smooth and stretchy. The dough should be soft and a little sticky.',
        'Cover and let it rise until doubled, 1½ to 2 hours.',
        'Divide in two. Pat each piece into a rectangle and roll it up tightly into a 12- to 14-inch log, pinching the seam. Set them seam down on a floured or parchment-lined baking sheet, well apart.',
        'Baguettes instead: divide into 3, roll each up into a log, rest 10 minutes, then roll it under your palms from the middle out to a thin 15-inch rope. Bake them 20 to 25 minutes in the next steps.',
        'Cover loosely and let them rise until puffy, 45 to 60 minutes. Put an empty metal pan on the lowest rack and heat the oven to 450°F.',
        'Slash the tops 3 or 4 times with a sharp knife. Slide the loaves in and pour 1 cup of hot water into the metal pan for steam (stand back).',
        'Bake 25 to 30 minutes, until deep brown and hollow-sounding when tapped underneath (about 200°F inside). Cool on a rack at least 30 minutes.'],
    stages=[st('Mix and knead the dough', active=20, wait=105), st('Shape the loaves', active=10, wait=50),
            st('Bake at 450°F', cook=28, station='oven', temp=450), st('Cool on a rack', wait=30, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, then crisp it in a 350°F oven for 5 to 10 minutes.'},
    keeps=['Counter: best the day it’s baked; keep it in a paper bag up to about 3 days (NDSU’s figure for bread), crisping it in a hot oven before serving.', BREAD_KEEPS[1]],
    scaling='12 g salt and 7 g yeast per 600 g flour. A half batch makes one loaf (weigh 3.5 g yeast). Two batches bake fine on two sheets if you switch their places halfway.',
    old_way=None, safety=[FLOUR_SAFETY, 'Pour the steam water carefully and keep your face back from the oven door.'], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='soft-buns-rolls', name='Soft buns and dinner rolls', emoji='🍔', kind='scratch', group='Enriched breads',
    summary='One soft dough for hamburger buns, hot dog buns or a pan of dinner rolls.',
    makes=[{'item': 'hamburger-buns', 'by': 'each', 'n': 10, 'label': 'hamburger buns'},
           {'item': 'hot-dog-buns', 'by': 'each', 'n': 10, 'label': 'hot dog buns'},
           {'item': 'dinner-rolls', 'by': 'each', 'n': 16, 'label': 'dinner rolls'}],
    yield_='10 hamburger buns (about 3½ inches across), 10 hot dog buns, or 16 dinner rolls, or a mix of shapes from one batch.',
    batch={'step': 0.0625, 'min': 0.25},
    ingredients=[I('flour', 500, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('sugar', 38, 'g'), I('butter', 57, 'g', 'softened'),
                 I('eggs', 1, 'each'), I('whole-milk', 1, 'cup'), I('water', 0.25, 'cup')],
    equipment=['large bowl', '2 baking sheets (or a 9 × 13 pan for rolls)', 'cooling rack'],
    steps=[
        'Warm the milk and water to about 110°F. Stir in the sugar and yeast and let it stand 5 to 10 minutes, until foamy.',
        'Beat in the egg, butter and salt, then add the flour a little at a time to make a soft dough.',
        'Knead 8 to 10 minutes until smooth and springy. Cover and let it rise until doubled, about 1 to 1½ hours.',
        'Divide the dough. A kitchen scale makes even buns: for a full batch, about 95 g per hamburger or hot dog bun, or 60 g per dinner roll.',
        'Hamburger buns: round each piece into a tight ball, set it on a greased sheet, and flatten to about 3½ inches. Hot dog buns: roll each piece into a 6-inch log and set them 2 inches apart. Dinner rolls: round into balls and set them almost touching in a greased 9 × 13 pan.',
        'Cover and let rise until puffy, 40 to 50 minutes. Heat the oven to 375°F.',
        'Bake until golden brown, 15 to 18 minutes for buns and 15 to 20 for rolls (about 190°F in the center). Brush the tops with melted butter if you like, and cool on a rack.'],
    stages=[st('Mix and knead the dough', active=25, wait=75), st('Divide and shape the buns or rolls', active=20, wait=45),
            st('Bake at 375°F', cook=18, station='oven', temp=375), st('Cool on a rack', wait=30, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag on the counter, about 1 hour.'},
    keeps=['Counter: in a bag, about 3 days (NDSU’s figure for bread and rolls).', 'Freezer: bag them once cool, up to 3 months (University of Missouri).'],
    scaling='The planner adds up buns and rolls together: each hamburger or hot dog bun takes a tenth of a batch and each dinner roll a sixteenth. Yeast and salt follow the flour by weight (7 g yeast and 9 g salt per 500 g flour). Round the egg to a whole one; for a half batch, beat one egg and use half.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['Homemade buns are bigger and heavier than store buns, so nutrition per bun is higher.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='pizza-dough', name='Pizza dough', emoji='🍕', kind='scratch', group='Yeast breads',
    summary='A one-pound ball of dough, the size sold at the store, ready in about 1½ hours.',
    makes=[{'item': 'frozen-pizza-dough', 'by': 'each', 'n': 1, 'label': 'balls of dough (1 lb each)'}],
    yield_='One 1-lb ball of dough: one 14-inch round pizza or one 10 × 15-inch sheet pan.',
    batch={'step': 1, 'min': 1},
    ingredients=[I('flour', 280, 'g', 'or bread flour'), I('yeast', 4, 'g'), I('salt', 6, 'g'), I('olive-oil', 1, 'tbsp'), I('water', 0.75, 'cup', 'about 110°F')],
    equipment=['large bowl'],
    steps=[
        'Stir the yeast into the warm water and let it stand 5 minutes.',
        'Add the flour, salt and olive oil and mix to a rough dough. Knead 6 to 8 minutes until smooth.',
        'Put it in an oiled bowl, cover, and let it rise until doubled, 1 to 1½ hours. It is now ready to stretch and top.',
        'If the dough springs back as you stretch it, cover it and let it rest 10 minutes, then try again.'],
    stages=[st('Mix and knead the dough', active=15, wait=75)],
    plan={'keep_days': 1, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator overnight, then let it sit on the counter, covered, about 1 hour before stretching.'},
    keeps=['Refrigerator: in an oiled, covered container until the next day; it keeps rising slowly, so punch it down.', 'Freezer: wrap the risen ball airtight, up to about 1 month; longer, and the yeast weakens (NDSU and University of Missouri give about a month for unbaked yeast dough).'],
    scaling='Each 1-lb ball takes 280 g flour, 4 g yeast and 6 g salt. A packet (7 g) of yeast is close enough for two balls.',
    old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'mu-gh1505', 'fda-flour']))

R.append(dict(
    id='flour-tortillas', name='Flour tortillas', emoji='🫓', kind='scratch', group='Flatbreads and tortillas',
    summary='Soft flour tortillas from five pantry staples, cooked in a dry skillet.',
    makes=[{'item': 'flour-tortillas', 'by': 'each', 'n': 10, 'label': '8-inch tortillas'},
           {'item': 'large-flour-tortillas', 'by': 'each', 'n': 7, 'label': '10-inch tortillas'}],
    yield_='Ten 8-inch tortillas or seven 10-inch tortillas.',
    batch={'step': 0.1, 'min': 0.3},
    ingredients=[I('flour', 300, 'g'), I('baking-powder', 4, 'g'), I('salt', 4.5, 'g'), I('vegetable-oil', 0.3333, 'cup', 'or lard or shortening, cut in'), I('water', 0.75, 'cup', 'warm')],
    equipment=['bowl', 'rolling pin', 'heavy skillet or griddle (cast iron is best)', 'clean kitchen towel'],
    steps=[
        'Whisk the flour, baking powder and salt. Stir in the oil (or rub in the lard or shortening with your fingers), then the warm water, and mix to a soft dough.',
        'Knead 2 minutes until smooth. Divide into 10 balls for 8-inch tortillas or 7 for 10-inch. Cover and rest 30 minutes; rested dough rolls out without shrinking.',
        'Heat a dry skillet over medium-high. Roll one ball on a lightly floured counter into a thin round, turning it as you go.',
        'Cook 30 to 60 seconds, until bubbles puff and the underside has brown spots, then flip and cook 30 seconds more.',
        'Stack the cooked tortillas in a folded towel so they steam and stay soft. Roll the next one while each cooks.'],
    stages=[st('Mix the dough and let it rest', active=10, wait=30), st('Roll and cook the tortillas', active=25, station='stove')],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag on the counter, then warm in a dry skillet.'},
    keeps=['Counter: sealed in a bag once cool, about 3 days (NDSU’s figure for bread).', 'Freezer: stack with parchment between them in a freezer bag, up to about 3 months (the University of Missouri’s time for baked bread).'],
    scaling='Everything scales by the number of tortillas: each 8-inch tortilla is a tenth of the recipe. Divide the dough by weight for even rounds: about 55 g of dough for 8 inches, 80 g for 10.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['Lard gives the flakiest, most traditional tortillas; oil makes them vegan.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'mu-gh1505', 'fda-flour']))

R.append(dict(
    id='corn-tortillas', name='Corn tortillas', emoji='🌮', kind='scratch', group='Flatbreads and tortillas',
    summary='Masa harina, water and salt, pressed thin and cooked on a hot griddle.',
    makes=[{'item': 'corn-tortillas', 'by': 'each', 'n': 16, 'label': '6-inch tortillas'}],
    yield_='About sixteen 6-inch tortillas.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('masa-harina', 228, 'g', 'not cornmeal'), I('salt', 1.5, 'g'), I('water', 1.3333, 'cup', 'hot from the tap, plus more as needed')],
    equipment=['bowl', 'tortilla press, or a heavy skillet and a zip-top bag cut open', 'griddle or heavy skillet', 'clean kitchen towel'],
    steps=[
        'Mix the masa harina and salt, then stir in the hot water. Knead in the bowl for a minute: the dough should feel like soft play clay and not crack at the edges when pressed. Add water a spoonful at a time if it cracks, or masa if it sticks.',
        'Cover and rest 15 minutes. Divide into 16 balls about the size of a golf ball (about 34 g), keeping them covered.',
        'Heat a dry griddle over medium-high. Press each ball between two sheets of plastic in a tortilla press (or under a flat-bottomed pan) to about 6 inches across.',
        'Peel off the plastic and cook 30 seconds, flip and cook 45 to 60 seconds, then flip once more for 15 seconds; it often puffs. Keep them warm wrapped in a towel.'],
    stages=[st('Mix the dough and let it rest', active=10, wait=15), st('Press and cook the tortillas', active=30, station='stove')],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag, then reheat in a hot dry skillet until soft.'},
    keeps=['Counter: sealed in a bag once cool, about 3 days (NDSU’s figure for bread); they dry out, so reheat them in a skillet.', 'Freezer: stack with parchment between them in a freezer bag, up to 3 months.'],
    scaling='Masa and water scale together; the exact water changes with the brand and the weather, so add the last of it by feel.',
    old_way='Masa is made by cooking dried corn in water with slaked lime (calcium hydroxide), soaking it, and grinding it. Masa harina is that dough dried into flour. Untreated cornmeal can’t stand in: it won’t form a dough, and the lime treatment also frees the corn’s niacin.',
    safety=[], notes=['Masa harina is naturally free of wheat, but check the bag if you avoid gluten: some is milled near wheat.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'mu-gh1505', 'wiki-masa']))

R.append(dict(
    id='biscuits', name='Biscuits', emoji='🥯', kind='scratch', group='Quick breads',
    summary='Tall, flaky butter biscuits in about 30 minutes, in place of the refrigerated can.',
    makes=[{'item': 'biscuit-dough', 'by': 'each', 'n': 8, 'label': 'biscuits (2½ inch)'}],
    yield_='Eight 2½-inch biscuits.',
    batch={'step': 0.25, 'min': 0.5},
    ingredients=[I('flour', 250, 'g'), I('baking-powder', 12, 'g'), I('salt', 4.5, 'g'), I('butter', 85, 'g', 'very cold, cut in small cubes'), I('whole-milk', 0.75, 'cup', 'cold')],
    equipment=['bowl', 'pastry blender or two knives', '2½-inch biscuit cutter or a glass', 'baking sheet'],
    steps=[
        'Heat the oven to 450°F. Whisk the flour, baking powder and salt in a bowl.',
        'Cut in the cold butter with a pastry blender or your fingertips until the biggest pieces are the size of peas.',
        'Stir in the cold milk with a fork just until the dough comes together; it should look shaggy.',
        'Turn it out on a floured counter, pat it 1 inch thick, fold it in half, and pat it out again. Do this 3 times for flaky layers, ending 1 inch thick.',
        'Cut straight down with a floured cutter (don’t twist) and set the biscuits touching on the baking sheet. Press the scraps together once for the last biscuits.',
        'Bake 12 to 14 minutes, until tall and golden.'],
    stages=[st('Mix, fold and cut the biscuits', active=15), st('Bake at 450°F', cook=13, station='oven', temp=450)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Warm frozen biscuits, wrapped in foil, in a 350°F oven about 15 minutes.'},
    keeps=['Counter: best warm; in a bag, about 2 days.', 'Freezer: bake them first, cool, and freeze up to 2 to 3 months; frozen unbaked biscuits come out smaller and less tender (University of Missouri).'],
    scaling='Everything scales with the flour: 12 g (1 tablespoon) baking powder for every 250 g flour. Cold butter and a hot oven matter more than exact batch size.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['Buttermilk biscuits: use ¾ cup buttermilk instead of milk and add ¼ teaspoon baking soda to the flour.'],
    nutrition={'from': 'ingredients'}, src=['mu-gh1505', 'fda-flour']))

R.append(dict(
    id='pie-crust', name='Butter pie crust', emoji='🥧', kind='scratch', group='Pastry and crackers',
    summary='Enough flaky all-butter pastry for one double-crust pie or two single crusts.',
    makes=[{'item': 'pie-crust', 'by': 'sheet', 'n': 2, 'label': 'crusts (9-inch)'},
           {'item': 'frozen-pie-crust', 'by': 'each', 'n': 2, 'label': 'crusts (9-inch)'}],
    yield_='Two 9-inch crusts (one double-crust pie, or two single-crust pies).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 315, 'g'), I('salt', 3, 'g'), I('sugar', 12.5, 'g', '', True), I('butter', 226, 'g', 'very cold, cut in ½-inch cubes'), I('water', 0.375, 'cup', 'ice cold, plus up to 2 tablespoons more')],
    equipment=['bowl', 'pastry blender (or food processor)', 'rolling pin', 'plastic wrap'],
    steps=[
        'Whisk the flour, salt and sugar. Cut in the cold butter until most of it is pea-sized, with a few bigger flakes.',
        'Sprinkle in the ice water a tablespoon at a time, tossing with a fork, until the dough holds together when you squeeze a handful. Use only as much as you need.',
        'Divide in two, press each half into a flat disk, wrap, and chill at least 1 hour so the butter firms and the flour relaxes.',
        'Roll each disk on a floured counter to a 12-inch round, about ⅛ inch thick, turning it often. Fit it into the pie plate without stretching; fill and bake as your recipe says.'],
    stages=[st('Mix the dough and press it into disks', active=15), st('Chill', wait=60, station='fridge', bg=True)],
    plan={'keep_days': 1, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw wrapped disks in the refrigerator overnight.'},
    keeps=['Refrigerator: chill at least 1 hour; well wrapped, it waits overnight.', 'Freezer: unbaked dough or crusts fitted into pans, 6 to 8 weeks; baked crusts, 2 to 3 months (University of Missouri).'],
    scaling='Keep the butter about 70% of the flour’s weight. Make it one batch at a time if you mix by hand, so the butter stays cold.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['The salt is low because catalog butter is salted; with unsalted butter, use 1 teaspoon.'],
    nutrition={'from': 'ingredients'}, src=['mu-gh1505', 'fda-flour']))

# ------------------------------------------------------------------ pasta
PASTA_KEEPS = ['Refrigerator: cook it right away, or refrigerate it covered up to 3 days. Don’t leave it drying at room temperature more than 2 hours (Iowa State Extension).',
               'Freezer: dust with flour, make loose nests, freeze on a tray, then bag them, for 3 to 6 months. Cook straight from frozen, a minute or two longer.']
R.append(dict(
    id='egg-pasta', cooked_later=True, name='Fresh egg pasta', emoji='🍝', kind='scratch', group='Pasta and noodles',
    summary='Flour and eggs, rolled by hand and cut into fettuccine, spaghetti-style strands or lasagna sheets.',
    makes=[{'item': 'spaghetti', 'by': 'g', 'n': 340, 'label': 'g of dried pasta it stands in for'},
           {'item': 'lasagna-noodles', 'by': 'g', 'n': 340, 'label': 'g of dried lasagna noodles it stands in for'}],
    yield_='About 1 lb of fresh pasta, which stands in for about ¾ lb of dried (fresh pasta holds more water). Serves 4 as a main dish.',
    batch={'step': 1 / 3, 'min': 1 / 3},
    ingredients=[I('flour', 300, 'g'), I('eggs', 3, 'each'), I('salt', 1.5, 'g'), I('water', 1, 'tbsp', 'only if the dough is dry', True)],
    equipment=['large board or clean counter', 'fork', 'rolling pin (a long, thin one is easiest)', 'sharp knife', 'baking sheet'],
    steps=[
        'Mound the flour on the counter with the salt and make a wide well in the middle. Crack the eggs into the well and beat them with a fork, pulling in flour from the inside wall a little at a time.',
        'When it gets too thick to stir, push it together with your hands. Knead 8 to 10 minutes until smooth and firm, like modeling clay. Add water a few drops at a time only if it won’t come together.',
        'Wrap it and rest 30 minutes at room temperature so it rolls out easily.',
        'Cut the dough in quarters; keep the others wrapped. On a lightly floured counter roll one piece from the center outward, turning it often, until it is thin enough to see your hand through, about 1/16 inch.',
        'Fettuccine: dust the sheet with flour, roll it up loosely into a flat log, and slice it ¼ inch wide. Shake out the strands.',
        'Spaghetti-style: roll the sheet a little thicker (about ⅛ inch) and cut ⅛-inch strips. They come out square-edged, like the pasta Italian cooks cut on a wire frame; perfectly round spaghetti needs an extruder.',
        'Lasagna sheets: cut the rolled sheet into rectangles to fit your pan, about 4 × 12 inches for a 9 × 13. Boil them 1 minute, or layer them in unboiled when the sauce is on the loose side.',
        'Cook fresh pasta in plenty of boiling salted water 2 to 4 minutes, until tender with a little bite.'],
    stages=[st('Mix and knead the dough', active=15, wait=30), st('Roll and cut the pasta', active=30)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Cook it straight from frozen.'},
    keeps=PASTA_KEEPS,
    scaling='Use 100 g (about ¾ cup) flour per large egg and scale by whole eggs: 2 eggs for about ½ lb of dried-pasta’s worth, 4 eggs for about 1 lb. Don’t scale rolling by hand much past 4 eggs at once; roll in batches.',
    old_way=None, safety=[FLOUR_SAFETY, 'Raw egg dough is a raw food until it is cooked; cooking is the step that makes it safe (Iowa State Extension).'], notes=[],
    nutrition={'from': 'ingredients'}, src=['isu-noodles', 'fda-flour']))

R.append(dict(
    id='egg-noodles', cooked_later=True, name='Egg noodles', emoji='🍜', kind='scratch', group='Pasta and noodles',
    summary='Thick, tender egg noodles for chicken noodle soup and buttered noodles.',
    makes=[{'item': 'egg-noodles', 'by': 'g', 'n': 250, 'label': 'g of dried egg noodles they stand in for'}],
    yield_='About 14 oz of fresh noodles, which stands in for about 9 oz of dried egg noodles (about 6 cups dry).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 250, 'g'), I('eggs', 2, 'each'), I('whole-milk', 0.25, 'cup'), I('salt', 3, 'g')],
    equipment=['bowl', 'rolling pin', 'sharp knife or pizza cutter'],
    steps=[
        'Beat the eggs, milk and salt in a bowl. Stir in the flour to make a stiff dough.',
        'Knead on a floured counter about 5 minutes until smooth. Cover and rest 20 minutes.',
        'Roll it out about ⅛ inch thick. Let the sheet air-dry 20 to 30 minutes, turning once, until it feels leathery but still bends.',
        'Dust with flour, roll it up loosely, and cut ¼-inch strips (or wider, if you like them that way). Shake them apart.',
        'Cook in boiling salted water or simmering broth until tender, 4 to 8 minutes depending on thickness.'],
    stages=[st('Mix, knead and rest the dough', active=10, wait=20), st('Roll, dry and cut the noodles', active=20, wait=25)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Cook them straight from frozen.'},
    keeps=PASTA_KEEPS,
    scaling='Scale by whole eggs: each egg goes with about 125 g (1 cup) of flour and 2 tablespoons of milk.',
    old_way=None, safety=[FLOUR_SAFETY, 'The drying time on the counter is part of the 2-hour limit for raw egg dough (Iowa State Extension).'], notes=[],
    nutrition={'from': 'ingredients'}, src=['isu-noodles', 'fda-flour']))

# ------------------------------------------------------------------ dairy
R.append(dict(
    id='butter', name='Butter (and the buttermilk it leaves)', emoji='🧈', kind='scratch', group='Dairy',
    summary='Whip cream past whipped cream until it breaks into butter and a thin, sweet buttermilk.',
    makes=[{'item': 'butter', 'by': 'g', 'n': 210, 'label': 'g of butter (about 2 sticks is 226 g)'},
           {'item': 'unsalted-butter', 'by': 'g', 'n': 210, 'label': 'g of unsalted butter'}],
    yield_='About 7½ oz of butter (a little under 2 sticks) and about 1 cup of buttermilk from 1 pint of cream.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('heavy-cream', 2, 'cup', 'not ultra-pasteurized if you can find it; it churns faster'), I('salt', 3, 'g', 'for salted butter', True), I('water', 2, 'cup', 'ice cold, for washing')],
    equipment=['stand mixer with whisk, hand mixer, or a 1-quart jar with a tight lid', 'fine strainer', 'bowl of ice water', 'spatula'],
    steps=[
        'Let the cream sit out about 20 minutes so it is cool but not fridge-cold, about 55 to 60°F.',
        'Whip it on medium-high. It turns to whipped cream, then stiff and grainy, then suddenly breaks: yellow clumps and splashing thin liquid, usually 8 to 12 minutes. Drape a towel over the mixer once it starts to splash. (Or shake it hard in the jar, 10 to 20 minutes.)',
        'Pour everything into a strainer over a bowl. The liquid is the buttermilk; save it in the fridge.',
        'Wash the butter: put it in a bowl, add about ½ cup ice water, and press and fold it with a spatula, then pour the cloudy water off. Repeat until the water stays clear, usually 3 or 4 times. Leftover buttermilk is what makes butter go sour.',
        'Knead in the salt if you are using it, press out the last of the water, shape it, wrap it and refrigerate.'],
    stages=[st('Warm the cream a little', wait=20), st('Churn, wash and shape the butter', active=25)],
    plan={'keep_days': 30, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator.'},
    keeps=['Refrigerator: 1 to 2 months, wrapped (NDSU’s figure for butter); homemade butter lasts longest when every bit of buttermilk is washed out.', 'Freezer: 6 to 9 months (NDSU). Unsalted butter loses flavor sooner (NDSU).', 'The buttermilk: keep it cold and use it within about 5 days, as for milk (NDSU).'],
    scaling='Each pint of cream makes about 7½ oz of butter. Churn no more than the mixer bowl can hold at one-third full, since cream more than doubles before it breaks.',
    old_way='On farms, cream was skimmed from milk, often allowed to sour a little, and churned by hand in a wooden churn. The thin liquid left behind was the original buttermilk; today’s thick store buttermilk is made instead by adding cultures to milk.',
    safety=[], notes=['The buttermilk from churning sweet cream is thin and mild, not the tangy cultured buttermilk sold in stores. Use it like milk in pancakes, biscuits or bread. In a recipe that counts on buttermilk’s acid to work with baking soda, it won’t do the same job.'],
    nutrition={'from': 'item', 'why': 'Most of the cream’s water, sugar and some protein leave with the buttermilk, so the numbers are USDA’s for butter.'},
    src=['ucd-butter', 'ndsu-fn579', 'ndsu-fn616', 'wiki-buttermilk']))

R.append(dict(
    id='whipped-cream', name='Whipped cream', emoji='🍦', kind='scratch', group='Dairy',
    summary='One cup of cream, a little sugar and vanilla, whipped to soft peaks in a few minutes.',
    makes=[{'item': 'whipped-cream', 'by': 'cup', 'n': 2, 'label': 'cups whipped'}],
    yield_='About 2 cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('heavy-cream', 1, 'cup', 'cold'), I('powdered-sugar', 15, 'g', 'or granulated sugar'), I('vanilla', 0.5, 'tsp')],
    equipment=['chilled bowl', 'whisk or mixer'],
    steps=['Chill the bowl and whisk (or beaters) for 10 minutes if you can.',
           'Beat the cold cream with the sugar and vanilla on medium-high until it holds soft peaks that droop at the tip, 2 to 4 minutes.',
           'Stop there for spooning; beat a little longer for firmer peaks to pipe. Past that it turns grainy and heads toward butter.'],
    stages=[st('Whip the cream', active=5)],
    plan={'keep_days': 0, 'freeze': True, 'lead_days': 0, 'thaw': 'Frozen dollops can go straight onto a warm dessert or into cocoa.'},
    keeps=['Refrigerator: best within a few hours; covered, it holds about a day before it weeps (whisk it a few strokes to bring it back).', 'Freezer: pipe or spoon sweetened mounds onto a tray, freeze, then bag them (NDSU).'],
    scaling='One cup of cream makes about 2 cups whipped (USU). Whip up to 2 cups of cream at once with a hand mixer; more fits a stand mixer.',
    old_way=None, safety=[], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn616', 'usu-subs']))

R.append(dict(
    id='yogurt', name='Plain yogurt', emoji='🥛', kind='scratch', group='Dairy',
    summary='A quart of milk and a few spoonfuls of yogurt with live cultures, kept warm for 6 to 8 hours.',
    makes=[{'item': 'plain-yogurt', 'by': 'cup', 'n': 4, 'label': 'cups'}],
    yield_='About 1 quart (4 cups).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('whole-milk', 4, 'cup', 'pasteurized'), I('plain-yogurt', 3, 'tbsp', 'plain, with live active cultures (store-bought or from your last batch)')],
    equipment=['heavy pot', 'thermometer', 'clean jars or a bowl with a lid', 'a warm spot: oven with the light on, a cooler with warm water, or a multicooker’s yogurt setting'],
    steps=[
        'Heat the milk in a heavy pot over medium, stirring often, to 180°F. Hold it near 180°F for 10 minutes for thinner yogurt or 20 for thicker, stirring.',
        'Cool it to 108 to 112°F; set the pot in a sink of cold water to speed it up.',
        'Stir a little warm milk into the starter yogurt, then stir that back into the pot. Pour into clean jars and cover.',
        'Keep it at 108 to 112°F, undisturbed, 6 to 8 hours, until it sets like soft custard.',
        'Refrigerate it as soon as it sets; chilling stops it from getting more sour. It firms up as it chills.',
        'Save 3 tablespoons to start the next batch within 5 to 7 days. After 5 or 6 batches, start again with fresh store-bought yogurt.'],
    stages=[st('Heat and hold the milk', active=10, cook=25, station='stove'), st('Cool the milk and stir in the starter', active=5, wait=30),
            st('Keep warm while it sets', wait=420, bg=True), st('Chill', wait=120, station='fridge', bg=True)],
    plan={'keep_days': 10, 'freeze': True, 'lead_days': 1, 'thaw': 'Thaw in the refrigerator; stir well (it turns a little grainy).'},
    keeps=['Refrigerator: 1 to 2 weeks (NDSU); WSU Extension gives 10 to 21 days for yogurt made with care.', 'Freezer: 1 to 2 months (NDSU); it turns grainy, so use thawed yogurt in smoothies and baking.'],
    scaling='Use 2 to 3 teaspoons of starter per cup of milk (WSU). More starter doesn’t make it set faster; it can make it sour.',
    old_way=None, safety=['Use pasteurized milk and very clean jars and spoons (WSU).'], notes=['For thicker yogurt, stir some nonfat dry milk powder into the cold milk before heating (WSU).'],
    nutrition={'from': 'ingredients'}, src=['wsu-yogurt', 'ndsu-fn579']))

R.append(dict(
    id='greek-yogurt', name='Greek-style yogurt', emoji='🥣', kind='scratch', group='Dairy',
    summary='Homemade yogurt strained in the refrigerator until thick.',
    makes=[{'item': 'greek-yogurt', 'by': 'cup', 'n': 2, 'label': 'cups'}],
    yield_='About 2 cups thick yogurt (and about 2 cups of whey) from 1 quart of milk.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('whole-milk', 4, 'cup', 'pasteurized'), I('plain-yogurt', 3, 'tbsp', 'with live active cultures')],
    equipment=['heavy pot', 'thermometer', 'clean jars or bowl', 'strainer lined with a coffee filter or a double layer of cheesecloth'],
    steps=['Make plain yogurt (heat the milk to 180°F, cool to 108 to 112°F, stir in the starter, keep warm 6 to 8 hours until set, then chill).',
           'Spoon the cold yogurt into the lined strainer set over a bowl, cover, and refrigerate.',
           'Strain 2 to 4 hours for thick yogurt, or overnight for something close to soft cheese. Spoon it into a container; the whey can replace water in bread.'],
    stages=[st('Heat and hold the milk', active=10, cook=25, station='stove'), st('Cool the milk and stir in the starter', active=5, wait=30),
            st('Keep warm while it sets', wait=420, bg=True), st('Chill, then strain in the refrigerator', active=5, wait=240, station='fridge', bg=True)],
    plan={'keep_days': 10, 'freeze': True, 'lead_days': 1, 'thaw': 'Thaw in the refrigerator and stir.'},
    keeps=['Refrigerator: 1 to 2 weeks, like plain yogurt (NDSU).', 'Freezer: 1 to 2 months; it turns grainy (NDSU).'],
    scaling='Straining halves the volume, so make twice as much plain yogurt as the thick yogurt you need.',
    old_way=None, safety=['Strain it in the refrigerator, not on the counter.'], notes=[],
    nutrition={'from': 'item', 'why': 'Straining pours off whey (water, some sugar and minerals), so the numbers are USDA’s for plain Greek yogurt.'},
    src=['wsu-yogurt', 'ndsu-fn579']))

R.append(dict(
    id='ricotta', name='Fresh ricotta-style cheese', emoji='🧀', kind='scratch', group='Dairy',
    summary='Hot milk and cream curdled with lemon juice and drained: soft, fresh cheese in under an hour.',
    makes=[{'item': 'ricotta', 'by': 'cup', 'n': 2, 'label': 'cups'}],
    yield_='About 2 cups (about 1 lb), depending on how long it drains.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('whole-milk', 8, 'cup', 'pasteurized, not ultra-pasteurized'), I('heavy-cream', 1, 'cup'), I('salt', 3, 'g'), I('lemon-juice', 0.3333, 'cup', 'or white vinegar')],
    equipment=['large heavy pot', 'thermometer', 'strainer lined with a double layer of cheesecloth', 'slotted spoon'],
    steps=[
        'Heat the milk, cream and salt in a heavy pot over medium, stirring often so the bottom doesn’t scorch, to 185 to 190°F (steaming, with small bubbles at the edge).',
        'Take it off the heat. Pour in the lemon juice and stir gently just two or three times. Curds should separate from the yellowish whey within a minute; if it still looks milky, stir in another tablespoon of lemon juice.',
        'Let it stand 10 minutes without stirring.',
        'Ladle the curds into the lined strainer set over a bowl. Drain 10 to 15 minutes for soft, creamy cheese or 30 to 60 minutes for a firmer one to use in lasagna.',
        'Refrigerate it in a covered container right away.'],
    stages=[st('Heat the milk and cream', active=5, cook=25, station='stove'), st('Curdle, rest and drain', active=10, wait=30)],
    plan={'keep_days': 7, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator and drain; it turns crumbly, so cook with it.'},
    keeps=['Refrigerator: about 1 week (NDSU’s figure for ricotta).', 'Freezer: about 1 month; the texture turns crumbly, fine for baked dishes (NDSU).'],
    scaling='Scale the milk, cream and lemon together. Ultra-pasteurized milk forms weak, small curds, so use regular pasteurized milk.',
    old_way=None, safety=['Use pasteurized milk and very clean equipment; fresh cheeses are watched for Listeria and other germs, which sanitation and proper heating control (NMSU).'], notes=['Without the cream it still works, with smaller, firmer curds and about 1½ cups of cheese.'],
    nutrition={'from': 'usda', 'fdc': 170851, 'why': 'Much of the milk’s water and sugar drains off with the whey, so the numbers are USDA’s for whole-milk ricotta.'},
    src=['nmsu-cheese', 'ndsu-fn579', 'ndsu-fn616']))

# ------------------------------------------------------------------ stocks and sauces
STOCK_SAFETY = ['Cool it fast: divide it into shallow containers and refrigerate within 2 hours of cooking (USDA).', 'Bring stock to a rolling boil when you reheat it (USDA).']
R.append(dict(
    id='chicken-stock', name='Chicken stock', emoji='🍲', kind='scratch', group='Stocks and sauces',
    summary='Chicken wings or saved bones simmered slowly with vegetables: about 3 quarts.',
    makes=[{'item': 'chicken-broth', 'by': 'cup', 'n': 12, 'label': 'cups'}],
    yield_='About 3 quarts (12 cups).',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('chicken-wings', 3, 'lb', 'or backs and necks, or the bones of 2 roast chickens'), I('onion', 1, 'each', 'quartered, skin on'), I('carrot', 2, 'each', 'in chunks'),
                 I('celery', 2, 'stalk', 'in chunks'), I('bay-leaves', 2, 'leaf'), I('thyme-dried', 0.5, 'tsp'), I('parsley', 4, 'sprig', '', True), I('water', 16, 'cup', 'cold')],
    equipment=['large stockpot (8 quarts)', 'fine strainer', 'shallow containers'],
    steps=[
        'Put the chicken in the pot with the cold water. Bring it slowly just to a boil over medium heat, then turn it down to the barest simmer. Skim off the gray foam for the first 15 minutes.',
        'Add the vegetables and herbs. Simmer uncovered 3 to 4 hours, with only a bubble or two breaking the surface; add water if the bones peek out.',
        'Strain it, pressing lightly on the solids, and throw the solids away.',
        'Cool it quickly in shallow containers and refrigerate within 2 hours. The next day, lift off the fat that hardens on top.',
        'Leave it unsalted and salt the dish you use it in.'],
    stages=[st('Start the stock and skim it', active=20, station='stove'), st('Simmer', cook=210, station='simmer', bg=True), st('Strain and cool in shallow containers', active=15, wait=60, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator, then bring to a rolling boil.'},
    keeps=['Refrigerator: 1 to 2 days (the University of Minnesota’s figure for meat broth; NDSU allows 3 to 4), so freeze what you won’t use soon.', 'Freezer: 2 to 3 months (University of Minnesota). Freeze it in 1- and 2-cup containers, leaving room for it to expand.'],
    scaling='Scale the chicken, vegetables and water together; keep the water just covering the bones. A double batch needs a 12- to 16-quart pot and the same simmering time.',
    old_way=None, safety=STOCK_SAFETY, notes=['Save the bones from a roast chicken in the freezer until you have enough for a pot.'],
    nutrition={'from': 'usda', 'fdc': 172884, 'why': 'Most of the chicken and vegetables are strained out, so the numbers are USDA’s for home-made chicken stock (USDA’s version has a little salt; unsalted stock has less sodium).'},
    src=['umn-storage', 'ndsu-fn579', 'fsis-leftovers', 'fdc']))

R.append(dict(
    id='beef-stock', name='Beef stock', emoji='🍲', kind='scratch', group='Stocks and sauces',
    summary='Roasted beef bones simmered for hours into a rich, brown stock.',
    makes=[{'item': 'beef-broth', 'by': 'cup', 'n': 12, 'label': 'cups'}],
    yield_='About 3 quarts (12 cups).',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('beef-soup-bones', 4, 'lb', 'shank, neck or knuckle bones'), I('onion', 1, 'each', 'quartered'), I('carrot', 2, 'each', 'in chunks'), I('celery', 2, 'stalk', 'in chunks'),
                 I('tomato-paste', 2, 'tbsp'), I('bay-leaves', 2, 'leaf'), I('thyme-dried', 0.5, 'tsp'), I('water', 16, 'cup', 'cold')],
    equipment=['roasting pan', 'large stockpot (8 quarts)', 'fine strainer', 'shallow containers'],
    steps=[
        'Heat the oven to 425°F. Roast the bones in a single layer 30 minutes. Add the onion, carrots and celery, smear the tomato paste over the bones, and roast 15 minutes more, until well browned.',
        'Move everything to the pot. Pour a cup of the water into the hot pan, scrape up the browned bits, and add it to the pot with the rest of the water and the herbs.',
        'Bring it just to a boil, skim, and simmer uncovered at the barest bubble 5 to 6 hours, adding water to keep the bones covered.',
        'Strain, cool quickly in shallow containers, and refrigerate within 2 hours. Lift off the fat once it hardens.'],
    stages=[st('Roast the bones at 425°F', active=10, cook=45, station='oven', temp=425), st('Start the stock and skim it', active=15, station='stove'),
            st('Simmer', cook=330, station='simmer', bg=True), st('Strain and cool in shallow containers', active=15, wait=60, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator, then bring to a rolling boil.'},
    keeps=['Refrigerator: 1 to 2 days (the University of Minnesota’s figure for meat broth; NDSU allows 3 to 4).', 'Freezer: 2 to 3 months (University of Minnesota).'],
    scaling='Scale the bones and water together; the simmering time stays the same.',
    old_way=None, safety=STOCK_SAFETY, notes=[],
    nutrition={'from': 'usda', 'fdc': 172883, 'why': 'The bones and vegetables are strained out, so the numbers are USDA’s for home-made beef stock.'},
    src=['umn-storage', 'ndsu-fn579', 'fsis-leftovers', 'fdc']))

R.append(dict(
    id='vegetable-stock', name='Vegetable stock', emoji='🥕', kind='scratch', group='Stocks and sauces',
    summary='Onions, carrots, celery, mushrooms and herbs, simmered an hour.',
    makes=[{'item': 'vegetable-broth', 'by': 'cup', 'n': 10, 'label': 'cups'}],
    yield_='About 2½ quarts (10 cups).',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('olive-oil', 1, 'tbsp'), I('onion', 2, 'each', 'chopped'), I('carrot', 3, 'each', 'chopped'), I('celery', 3, 'stalk', 'chopped'), I('mushrooms', 8, 'oz', 'sliced'),
                 I('garlic', 4, 'clove', 'smashed'), I('parsley', 6, 'sprig'), I('bay-leaves', 2, 'leaf'), I('thyme-dried', 0.5, 'tsp'), I('water', 12, 'cup')],
    equipment=['large pot', 'fine strainer'],
    steps=['Warm the oil in a large pot over medium. Cook the onions, carrots, celery and mushrooms, stirring now and then, until they soften and brown a little, about 10 minutes.',
           'Add the garlic, herbs and water. Bring to a boil, then simmer uncovered 1 hour.',
           'Strain, pressing on the vegetables to get all the liquid. Cool in shallow containers and refrigerate within 2 hours.'],
    stages=[st('Brown the vegetables', active=15, station='stove'), st('Simmer', cook=60, station='simmer', bg=True), st('Strain and cool', active=10, wait=45, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator, then bring to a boil.'},
    keeps=['Refrigerator: 3 to 4 days, as for soups (FoodSafety.gov).', 'Freezer: 2 to 3 months (FoodSafety.gov).'],
    scaling='Scale the vegetables and water together; keep the simmer at 1 hour (longer can turn it bitter).',
    old_way=None, safety=STOCK_SAFETY, notes=['Onion skins add color; strong vegetables like cabbage and broccoli take over the flavor, so leave them out.'],
    nutrition={'from': 'item', 'why': 'The vegetables are strained out, so the numbers are USDA’s for vegetable broth; yours has much less sodium unless you salt it.'},
    src=['fs-cold', 'fsis-leftovers']))

R.append(dict(
    id='tomato-sauce', name='Tomato sauce from fresh tomatoes', emoji='🍅', kind='scratch', group='Stocks and sauces',
    summary='Ripe tomatoes cooked down into plain sauce: a good use for a garden full of them.',
    makes=[{'item': 'tomato-sauce', 'by': 'cup', 'n': 4, 'label': 'cups'}],
    yield_='About 1 quart (4 cups) of thin sauce, like canned tomato sauce. Cook it down to half for a thick sauce (about 3 cups).',
    batch={'step': 0.125, 'min': 0.125},
    ingredients=[I('roma-tomato', 5, 'lb', 'or any ripe tomatoes; paste types cook down fastest'), I('salt', 6, 'g', '', True)],
    equipment=['large wide pot', 'food mill, or a sieve and spoon', 'shallow containers'],
    steps=['Wash the tomatoes, cut out the cores, and quarter them.',
           'Simmer them covered in a wide pot, stirring, until they collapse and turn juicy, about 15 minutes.',
           'Press them through a food mill or sieve to remove the skins and seeds.',
           'Return the purée to the pot and boil it gently, uncovered, stirring often and more as it thickens, until the volume drops by about a third (thin sauce, 1 to 1½ hours) or by half (thick sauce).',
           'Salt it if you like. Cool in shallow containers and refrigerate within 2 hours.'],
    stages=[st('Core and quarter the tomatoes', active=20), st('Cook and press the tomatoes', active=15, cook=15, station='stove'), st('Cook down the sauce', active=10, cook=75, station='stove'), st('Cool', wait=45, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator.'},
    keeps=['Refrigerator: 3 to 5 days (NDSU’s figure for tomato-based sauce).', 'Freezer: leave ½ inch of space in a wide-mouth pint container (1 inch in a quart) and freeze up to 8 to 12 months for best quality (NCHFP’s figure for frozen fruits and vegetables).'],
    scaling='Plan on about 5 lb of tomatoes per quart of thin sauce and 6½ lb per quart of thick sauce (NCHFP). A wider pot cooks it down faster than a tall one; the time depends on the pot, not just the amount.',
    old_way=None, safety=['This recipe is for the refrigerator and freezer. To can tomato sauce, use NCHFP’s tested Standard Tomato Sauce, which adds acid; don’t can this one.'], notes=[],
    nutrition={'from': 'usda', 'fdc': 170460, 'why': 'The skins and seeds stay in the food mill, so the numbers are USDA’s for unsalted tomato purée, the closest match.'}, src=['nchfp-sauce', 'ndsu-fn579', 'nchfp-headspace', 'nchfp-frozen', 'nchfp']))

R.append(dict(
    id='marinara', name='Marinara and pizza sauce', emoji='🥫', kind='scratch', group='Stocks and sauces',
    summary='A 20-minute sauce from a can of crushed tomatoes, garlic and herbs, about a jar’s worth.',
    makes=[{'item': 'marinara', 'by': 'cup', 'n': 3, 'label': 'cups'}],
    yield_='About 3 cups (a 24-oz jar holds about 2¾).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('olive-oil', 2, 'tbsp'), I('garlic', 3, 'clove', 'minced'), I('onion', 0.5, 'each', 'finely chopped', True), I('crushed-tomatoes', 1, 'can'),
                 I('oregano', 1, 'tsp'), I('basil-dried', 1, 'tsp'), I('salt', 3, 'g'), I('red-pepper-flakes', 1, 'pinch', '', True)],
    equipment=['medium saucepan'],
    steps=['Warm the oil in a saucepan over medium-low. Cook the onion, if using, until soft, about 5 minutes; add the garlic and cook 1 minute without letting it brown.',
           'Stir in the tomatoes, herbs, salt and pepper flakes. Simmer, partly covered and stirring now and then, 20 minutes. Taste for salt.',
           'Pizza sauce: skip the onion and the simmering. Stir the crushed tomatoes with the oil, garlic, herbs and salt and spread it on the raw dough; it cooks on the pizza.'],
    stages=[st('Soften the garlic and onion', active=8, station='stove'), st('Simmer the sauce', active=2, cook=20, station='stove'), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator.'},
    keeps=['Refrigerator: 3 to 5 days (NDSU’s figure for tomato-based sauce).', 'Freezer: 2 to 3 months for best quality (FoodSafety.gov’s time for soups and stews, the closest entry). Frozen food kept at 0°F stays safe longer; it just loses quality.'],
    scaling='Scale by cans of tomatoes. A double batch takes a few minutes longer to simmer down.',
    old_way=None, safety=[], notes=['From the garden: about 3 lb of fresh, ripe tomatoes, peeled and chopped, can replace the can; simmer 30 to 40 minutes longer.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'fs-cold']))

R.append(dict(
    id='salsa', name='Fresh tomato salsa', emoji='💃', kind='scratch', group='Stocks and sauces',
    summary='Chopped ripe tomatoes, onion, jalapeño, cilantro and lime: about 3 cups.',
    makes=[{'item': 'salsa', 'by': 'cup', 'n': 3, 'label': 'cups'}, {'item': 'fresh-salsa', 'by': 'cup', 'n': 3, 'label': 'cups'}],
    yield_='About 3 cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('tomato', 1.5, 'lb', 'ripe, cored and finely chopped'), I('red-onion', 0.5, 'each', 'finely chopped'), I('jalapeno', 1, 'each', 'seeded for less heat, minced'),
                 I('garlic', 1, 'clove', 'minced'), I('cilantro', 0.25, 'cup', 'chopped'), I('lime', 1, 'each', 'juiced (about 2 tablespoons)'), I('salt', 3, 'g')],
    equipment=['cutting board and knife', 'bowl', 'rubber or plastic gloves for the jalapeño'],
    steps=['Wash the vegetables and herbs under running water.',
           'Wear gloves to seed and mince the jalapeño, and don’t touch your eyes.',
           'Stir everything together in a bowl. Let it stand 15 minutes, taste, and add more lime or salt as you like. Drain off extra juice before serving if it’s very wet.'],
    stages=[st('Chop and mix', active=20)],
    plan={'keep_days': 7, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator and drain the extra liquid.'},
    keeps=['Refrigerator: keep it cold; Iowa State Extension allows up to 2 weeks for fresh salsa, and Ohio State says “a couple of weeks.” It’s best in the first few days.', 'Freezer: the only safe way to keep a home salsa recipe long-term; thawed, it is watery, so drain it (Iowa State).'],
    scaling='Scales evenly. Add the jalapeño and lime a little at a time in big batches, since peppers vary a lot in heat.',
    old_way=None, safety=['Don’t can this salsa: only tested recipes like NCHFP’s are safe to can.'], notes=[],
    nutrition={'from': 'ingredients'}, src=['isu-salsa', 'osu-salsa', 'nchfp']))

R.append(dict(
    id='refrigerator-pickles', name='Refrigerator dill pickles', emoji='🥒', kind='scratch', group='Stocks and sauces',
    summary='Cucumber slices in a hot vinegar brine with dill and garlic, kept in the fridge: no canning.',
    makes=[{'item': 'dill-pickles', 'by': 'g', 'n': 340, 'label': 'g of pickles (about 1 quart jar)'}],
    yield_='One quart jar (about ¾ lb of pickles).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('cucumber', 0.75, 'lb', 'firm, sliced ¼ inch thick (about 3 cups); pickling cucumbers are best'), I('white-vinegar', 1.3333, 'cup', '5% acidity'), I('water', 0.6667, 'cup'),
                 I('salt', 12, 'g', 'pickling salt if you have it'), I('sugar', 4, 'tsp'), I('dill', 4, 'sprig', 'or 2 teaspoons dried dill'), I('garlic', 2, 'clove', 'peeled'), I('red-pepper-flakes', 0.25, 'tsp', '', True)],
    equipment=['1-quart glass jar with lid', 'small saucepan'],
    steps=['Wash the jar and lid in hot soapy water and rinse well, then sterilize the jar by boiling it 10 minutes, as UW Extension advises for refrigerator pickles.',
           'Heat the vinegar, water, salt and sugar until it simmers, stirring until they dissolve. Take it off the heat.',
           'Put the dill, garlic and pepper flakes in the jar. Pack the cucumber slices in closely, leaving about ½ inch at the top.',
           'Pour in the warm brine to cover the cucumbers. Close the jar and refrigerate.',
           'Wait 1 to 3 days for the flavor to develop before eating. Keep them in the refrigerator.'],
    stages=[st('Slice, pack and pour the brine', active=20, station='stove'), st('Cool and refrigerate', wait=30, station='fridge', bg=True)],
    plan={'keep_days': 30, 'freeze': False, 'lead_days': 1, 'thaw': ''},
    keeps=['Refrigerator: up to 1 month (UW Extension); Oregon State’s recipe allows up to 3 months.', 'Don’t freeze: they turn soft.'],
    scaling='Keep the vinegar-to-water ratio exactly as written (2 to 1): don’t cut the vinegar, and use vinegar labeled 5% acidity (UW Extension, NDSU). Scale by jars.',
    old_way=None, safety=['These are not canned and must stay refrigerated. For shelf-stable pickles, use a tested recipe from NCHFP.'], notes=['Table salt works, but its additives can cloud the brine; pickling salt keeps it clear (UW Extension).'],
    nutrition={'from': 'item', 'why': 'Much of the brine’s salt stays in the jar, so the numbers are USDA’s for dill pickles; this recipe’s pickles are likely lower in sodium.'},
    src=['osu-pickles', 'uw-pickles', 'ndsu-fn189', 'nchfp']))

# ------------------------------------------------------------------ dressings and spreads
R.append(dict(
    id='mayonnaise', name='Mayonnaise', emoji='🥚', kind='scratch', group='Dressings and spreads',
    summary='Pasteurized egg, lemon, mustard and oil, blended in under a minute.',
    makes=[{'item': 'mayonnaise', 'by': 'cup', 'n': 1.25, 'label': 'cups'}],
    yield_='About 1¼ cups.',
    batch={'step': 1, 'min': 1},
    ingredients=[I('pasteurized-eggs', 1, 'each', 'at room temperature'), I('lemon-juice', 1, 'tbsp', 'or white vinegar'), I('dijon-mustard', 1, 'tsp'), I('salt', 1.5, 'g'),
                 I('vegetable-oil', 1, 'cup', 'or another neutral oil')],
    equipment=['immersion blender and a tall jar that just fits it, or a bowl and whisk'],
    steps=['Use pasteurized eggs: mayonnaise is eaten raw, and FDA and USDA advise pasteurized eggs for anything served with raw egg.',
           'Immersion blender: put the egg, lemon juice, mustard and salt in the jar and pour the oil on top. Set the blender on the bottom, run it, and slowly lift it as the mayonnaise thickens, about 30 seconds.',
           'By hand: whisk the egg, lemon, mustard and salt, then whisk in the oil a few drops at a time until it thickens, then in a thin stream.',
           'Taste and add lemon or salt. Refrigerate right away.'],
    stages=[st('Blend', active=5)],
    plan={'keep_days': 2, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Refrigerator: no agency publishes a time for homemade mayonnaise. We go by USDA’s nearest entries, raw egg yolks and homemade eggnog: 2 to 4 days.', 'Don’t freeze it; it separates.'],
    scaling='One egg holds up to about 1 cup of oil; make one batch at a time.',
    old_way=None, safety=['Use pasteurized shell eggs (FDA, USDA). Refrigerate it right away and don’t leave it out more than 2 hours (USDA).'], notes=[],
    nutrition={'from': 'ingredients'}, src=['fda-eggs', 'fsis-eggs', 'fsis-leftovers']))

R.append(dict(
    id='ranch-dressing', name='Ranch dressing', emoji='🥗', kind='scratch', group='Dressings and spreads',
    summary='Buttermilk, mayonnaise and sour cream with dried herbs: dressing or dip.',
    makes=[{'item': 'ranch-dressing', 'by': 'cup', 'n': 1.25, 'label': 'cups'}],
    yield_='About 1¼ cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('mayonnaise', 0.5, 'cup'), I('sour-cream', 0.25, 'cup'), I('buttermilk', 0.5, 'cup'), I('parsley-dried', 1, 'tsp'), I('dill-dried', 0.5, 'tsp'),
                 I('garlic-powder', 0.5, 'tsp'), I('onion-powder', 0.5, 'tsp'), I('salt', 1.5, 'g'), I('black-pepper', 0.125, 'tsp'), I('chives', 1, 'tbsp', 'snipped', True)],
    equipment=['bowl and whisk, or a jar'],
    steps=['Whisk everything together.',
           'Chill at least 30 minutes so the dried herbs soften and flavor it.',
           'For a dip, use half the buttermilk; for a thinner dressing, add a little more.'],
    stages=[st('Whisk', active=5), st('Chill', wait=30, station='fridge', bg=True)],
    plan={'keep_days': 2, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Refrigerator: use it within a few days and by the earliest date on the dairy you used; NDSU’s figure for homemade dips is 2 days.', 'Don’t freeze it.'],
    scaling='Scales evenly.',
    old_way=None, safety=[], notes=['Uses store or homemade mayonnaise.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='vinaigrette', name='Italian-style vinaigrette', emoji='🫒', kind='scratch', group='Dressings and spreads',
    summary='Three parts oil to one part vinegar, shaken with mustard, garlic and herbs.',
    makes=[{'item': 'italian-dressing', 'by': 'cup', 'n': 1, 'label': 'cups'}],
    yield_='About 1 cup.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('olive-oil', 0.75, 'cup'), I('red-wine-vinegar', 0.25, 'cup'), I('dijon-mustard', 1, 'tsp'), I('garlic', 1, 'clove', 'minced'), I('italian-seasoning', 1, 'tsp'),
                 I('sugar', 0.5, 'tsp'), I('salt', 3, 'g'), I('black-pepper', 0.25, 'tsp')],
    equipment=['jar with a tight lid'],
    steps=['Put everything in the jar, close it, and shake hard until it looks creamy.',
           'Taste on a leaf of lettuce and add salt or vinegar. Shake again just before using.'],
    stages=[st('Shake', active=5)],
    plan={'keep_days': 4, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Refrigerator: use within 4 days. Garlic and herbs in oil can grow the germ that causes botulism, so Oregon State Extension says to keep any homemade oil with garlic or herbs, fresh or dried, cold and use it within 4 days.', 'Olive oil firms up in the fridge: let it stand 10 minutes and shake.'],
    scaling='Keep the 3-to-1 oil-to-vinegar ratio; scale everything else with it.',
    old_way=None, safety=['Keep it refrigerated and use it within 4 days (Oregon State Extension).'], notes=[],
    nutrition={'from': 'ingredients'}, src=['osu-oil']))

# ------------------------------------------------------------------ crumbs, mixes, breakfast
R.append(dict(
    id='breadcrumbs', name='Dry breadcrumbs', emoji='🍞', kind='scratch', group='Pantry mixes',
    summary='Day-old bread dried in a low oven and ground: the plain crumbs for meatloaf and breading.',
    makes=[{'item': 'breadcrumbs', 'by': 'g', 'n': 150, 'label': 'g (about 1⅓ cups)'}],
    yield_='About 1⅓ cups (about 5 oz) from 8 slices.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('white-bread', 8, 'slice', 'day-old is best; any bread or crusts work')],
    equipment=['baking sheet', 'food processor or blender (or a zip-top bag and rolling pin)'],
    steps=['Heat the oven to 300°F. Tear the bread into pieces and spread them on a baking sheet.',
           'Bake 15 to 25 minutes, stirring once, until completely dry and crisp all the way through and only lightly golden.',
           'Cool, then grind in a food processor or blender, or crush in a bag with a rolling pin. Sift out big pieces for fine crumbs.',
           'Italian-style: stir in 1 teaspoon Italian seasoning and ¼ teaspoon garlic powder.'],
    stages=[st('Tear the bread', active=5), st('Dry at 300°F', cook=20, station='oven', temp=300), st('Cool and grind', active=5, wait=15)],
    plan={'keep_days': 90, 'freeze': True, 'lead_days': 0, 'thaw': 'Use straight from the freezer.'},
    keeps=['Pantry: airtight once completely cool. NDSU gives dried bread crumbs about 6 months; if yours aren’t bone-dry, freeze them instead.', 'Freezer: in a bag, use straight from the freezer.'],
    scaling='8 slices of sandwich bread make about 1⅓ cups. Dry them in a single layer; crowded crumbs steam instead of drying.',
    old_way=None, safety=[], notes=['Uses store or homemade bread; the planner counts the slices.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='panko-crumbs', name='Panko-style crumbs', emoji='🍤', kind='scratch', group='Pantry mixes',
    summary='Crustless white bread pulsed into coarse flakes and dried without browning, for a light, crisp coating.',
    makes=[{'item': 'panko', 'by': 'cup', 'n': 2, 'label': 'cups'}],
    yield_='About 2 cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('white-bread', 8, 'slice', 'crusts cut off')],
    equipment=['food processor, or the large holes of a box grater', 'baking sheet'],
    steps=['Heat the oven to 300°F. Pulse the crustless bread in a food processor into coarse flakes (or grate it).',
           'Spread them on a baking sheet and bake 8 to 12 minutes, stirring once, until dry but still pale.',
           'Cool completely before storing.'],
    stages=[st('Make the flakes', active=5), st('Dry at 300°F', cook=10, station='oven', temp=300), st('Cool', wait=15)],
    plan={'keep_days': 90, 'freeze': True, 'lead_days': 0, 'thaw': 'Use straight from the freezer.'},
    keeps=['Pantry: airtight once completely dry (NDSU gives dried bread crumbs about 6 months); freeze them if you’re not sure.'],
    scaling='8 slices make about 2 cups of flakes.',
    old_way=None, safety=[], notes=['Save the crusts for dry breadcrumbs.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='croutons', name='Croutons', emoji='🥗', kind='scratch', group='Pantry mixes',
    summary='Cubes of bread tossed with olive oil and seasoning, baked crisp.',
    makes=[{'item': 'croutons', 'by': 'cup', 'n': 3, 'label': 'cups'}],
    yield_='About 3 cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('white-bread', 6, 'slice', 'or any day-old bread, in ¾-inch cubes'), I('olive-oil', 2, 'tbsp'), I('italian-seasoning', 0.5, 'tsp'), I('garlic-powder', 0.25, 'tsp'), I('salt', 1.5, 'g')],
    equipment=['bowl', 'baking sheet'],
    steps=['Heat the oven to 375°F. Toss the bread cubes with the oil, seasoning, garlic powder and salt.',
           'Spread them in one layer and bake 12 to 15 minutes, stirring once, until golden and crisp. They crisp more as they cool.'],
    stages=[st('Cube and season the bread', active=10), st('Bake at 375°F', cook=14, station='oven', temp=375), st('Cool', wait=15)],
    plan={'keep_days': 7, 'freeze': True, 'lead_days': 0, 'thaw': 'Use from the freezer; crisp them a few minutes in the oven.'},
    keeps=['Pantry: airtight, about 1 week for the best crunch; the oil goes stale after that.', 'Freezer: in a bag; recrisp in a 350°F oven for a few minutes.'],
    scaling='Scales evenly; use two baking sheets for a double batch so they toast instead of steam.',
    old_way=None, safety=[], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='pancake-mix', name='Pancake and waffle mix', emoji='🥞', kind='scratch', group='Pantry mixes',
    summary='A jar of dry mix for quick pancakes or waffles: add an egg, milk and butter.',
    makes=[{'item': 'pancake-mix', 'by': 'cup', 'n': 5, 'label': 'cups of mix'}],
    yield_='About 5 cups of mix, enough for 5 batches of about eight 4-inch pancakes.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('flour', 500, 'g'), I('sugar', 50, 'g'), I('baking-powder', 32, 'g'), I('salt', 12, 'g')],
    equipment=['large bowl and whisk', 'airtight container'],
    steps=['Whisk everything together very well, so the baking powder is spread evenly. Store airtight, labeled with the date and the directions below.',
           'Pancakes: whisk 1 cup mix with 1 egg, ¾ cup milk and 2 tablespoons melted butter or oil, just until no dry flour remains (a few lumps are fine). Cook ¼-cup scoops on a greased griddle over medium heat, flipping when bubbles pop on top.',
           'Waffles: 1 cup mix, 1 egg, ¾ cup milk and 3 tablespoons melted butter, in a hot waffle iron.',
           'Buttermilk pancakes: use buttermilk instead of milk and add ¼ teaspoon baking soda per cup of mix.'],
    stages=[st('Whisk the mix', active=5)],
    plan={'keep_days': 90, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Pantry: airtight in a cool, dry place. Use it within about 3 months, because opened baking powder loses strength in 3 to 6 months (NDSU).'],
    scaling='Each cup of flour takes 2 teaspoons baking powder and ½ teaspoon salt; scale by the cup.',
    old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'fda-flour']))

R.append(dict(
    id='granola', name='Granola', emoji='🥣', kind='scratch', group='Pantry mixes',
    summary='Oats, nuts, honey and a little oil baked slow until golden, with raisins stirred in after.',
    makes=[{'item': 'granola', 'by': 'g', 'n': 570, 'label': 'g (about 4½ cups)'}],
    yield_='About 4½ cups (about 1¼ lb).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('rolled-oats', 3, 'cup', 'old-fashioned'), I('walnuts', 0.75, 'cup', 'chopped (or more oats for nut-free)'), I('honey', 0.3333, 'cup', 'or maple syrup'), I('vegetable-oil', 0.25, 'cup'),
                 I('cinnamon', 1, 'tsp'), I('salt', 3, 'g'), I('vanilla', 1, 'tsp'), I('raisins', 0.5, 'cup', 'stirred in after baking')],
    equipment=['large bowl', 'rimmed baking sheet lined with parchment'],
    steps=['Heat the oven to 300°F. Stir the oats, nuts, cinnamon and salt in a large bowl.',
           'Warm the honey and oil together until runny, stir in the vanilla, and pour it over the oats. Mix until everything is coated.',
           'Spread it on the lined sheet and press it flat with a spatula.',
           'Bake 35 to 40 minutes, turning the pan halfway, until golden. For clusters, don’t stir; for loose granola, stir every 15 minutes.',
           'Cool completely on the pan (it crisps as it cools), then break it up and stir in the raisins.'],
    stages=[st('Mix and spread', active=10), st('Bake at 300°F', cook=38, station='oven', temp=300), st('Cool on the pan', wait=30, bg=True)],
    plan={'keep_days': 14, 'freeze': True, 'lead_days': 0, 'thaw': 'Use straight from the freezer.'},
    keeps=['Pantry: airtight, about 2 weeks for the best crunch.', 'Freezer: in a bag for longer.'],
    scaling='Scales evenly; bake a double batch on two sheets, switching racks halfway.',
    old_way=None, safety=['Honey is not for babies under 12 months old.'], notes=[],
    nutrition={'from': 'ingredients'}, src=[]))

R.append(dict(
    id='applesauce', name='Applesauce', emoji='🍎', kind='scratch', group='Pantry mixes',
    summary='Apples simmered soft and mashed, sweetened only if you like.',
    makes=[{'item': 'applesauce', 'by': 'cup', 'n': 4, 'label': 'cups'}],
    yield_='About 1 quart (4 cups) from 3 lb of apples.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('apple', 3, 'lb', 'about 7 medium, a mix of sweet and tart'), I('water', 0.5, 'cup'), I('lemon-juice', 1, 'tbsp', '', True), I('cinnamon', 0.5, 'tsp', '', True), I('sugar', 2, 'tbsp', '', True)],
    equipment=['large pot with a lid', 'potato masher, food mill or blender'],
    steps=['Peel, core and slice the apples (or leave the peels on if you’ll press the sauce through a food mill).',
           'Put them in the pot with the water and lemon juice, cover, and simmer, stirring now and then, until very soft, 15 to 20 minutes.',
           'Mash for chunky sauce, or purée or press through a food mill for smooth. Stir in cinnamon and sugar to taste, if using.',
           'Cool in shallow containers and refrigerate within 2 hours.'],
    stages=[st('Peel and slice the apples', active=20), st('Simmer', active=5, cook=18, station='stove'), st('Mash and cool', active=5, wait=30, bg=True)],
    plan={'keep_days': 5, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator.'},
    keeps=['Refrigerator: about 5 to 7 days (NDSU’s figure for opened canned fruit, the closest entry it has).', 'Freezer: leave ½ inch of space in a wide-mouth pint container (1 inch in a quart) and freeze up to 8 to 12 months for best quality (NCHFP).'],
    scaling='Plan on about 3 lb of apples per quart (NCHFP’s average). Tart apples make a tangier sauce; 1 to 2 lb of tart apples per 3 lb of sweet ones balances it.',
    old_way=None, safety=['To can applesauce, follow NCHFP’s tested recipe; this one is for the refrigerator and freezer.'], notes=[],
    nutrition={'from': 'item', 'why': 'The peels and cores are left behind, so the numbers are USDA’s for unsweetened applesauce (sugar, if you add it, isn’t counted).'}, src=['nchfp-applesauce', 'ndsu-fn579', 'nchfp-headspace', 'nchfp-frozen', 'nchfp']))

R.append(dict(
    id='simple-syrup', name='Simple syrup', emoji='🍯', kind='scratch', group='Pantry mixes',
    summary='Equal parts sugar and water, for lemonade and iced tea.',
    makes=[],
    yield_='About 1½ cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('sugar', 1, 'cup'), I('water', 1, 'cup')],
    equipment=['small saucepan', 'clean jar'],
    steps=['Heat the sugar and water, stirring, just until the sugar dissolves and the syrup is clear. It doesn’t need to boil.',
           'Cool and pour into a clean jar. For a richer syrup, use 2 parts sugar to 1 part water.'],
    stages=[st('Heat and dissolve', active=5, station='stove'), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 14, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Refrigerator: covered, in a clean jar. We didn’t find a published storage time for it, so make small batches and throw it out if it turns cloudy or grows mold.'],
    scaling='Scales evenly.', old_way=None, safety=[], notes=[],
    nutrition={'from': 'ingredients'}, src=[]))

# ------------------------------------------------------------------ seasonings
SPICE_KEEPS = ['Pantry: airtight, away from heat and light, about 6 months (NDSU’s figure for herb and spice blends).']
R.append(dict(
    id='taco-seasoning', name='Taco seasoning', emoji='🌶️', kind='scratch', group='Seasonings and stand-ins',
    summary='The packet’s worth of chili powder, cumin, paprika, garlic, onion and oregano, without fillers.',
    makes=[{'item': 'taco-seasoning', 'by': 'package', 'n': 1, 'label': 'packets’ worth (seasons 1 lb of meat)'}],
    yield_='About 3 tablespoons, the same job as one 1-oz packet: seasons 1 lb of meat.',
    batch={'step': 1, 'min': 1},
    ingredients=[I('chili-powder', 1, 'tbsp'), I('cumin', 1.5, 'tsp'), I('paprika', 1, 'tsp'), I('garlic-powder', 0.5, 'tsp'), I('onion-powder', 0.5, 'tsp'), I('oregano', 0.5, 'tsp'),
                 I('salt', 4.5, 'g'), I('black-pepper', 0.25, 'tsp'), I('cayenne', 1, 'pinch', '', True)],
    equipment=['small jar'],
    steps=['Stir everything together.', 'To use: brown 1 lb of meat, drain, then stir in the seasoning with ⅔ cup water and simmer until thick, about 5 minutes.'],
    stages=[st('Mix', active=3)],
    plan={'keep_days': 180, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=SPICE_KEEPS, scaling='Scales evenly. Mix a big jar and use 3 tablespoons per pound of meat.',
    old_way=None, safety=[], notes=['Chili powder is itself a blend that varies by brand; adjust the cayenne to your family.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='chili-seasoning', name='Chili seasoning', emoji='🌶️', kind='scratch', group='Seasonings and stand-ins',
    summary='A blend for a pot of chili made with 2 lb of meat or beans.',
    makes=[],
    yield_='About ⅓ cup: one pot of chili (2 lb of meat or 4 cans of beans).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('chili-powder', 2, 'tbsp'), I('cumin', 1, 'tbsp'), I('paprika', 1, 'tsp'), I('oregano', 1, 'tsp'), I('garlic-powder', 1, 'tsp'), I('onion-powder', 1, 'tsp'),
                 I('salt', 6, 'g'), I('black-pepper', 0.5, 'tsp'), I('cayenne', 0.25, 'tsp', '', True)],
    equipment=['small jar'],
    steps=['Stir everything together.', 'Add it with the tomatoes and simmer the chili at least 30 minutes so the spices mellow.'],
    stages=[st('Mix', active=3)],
    plan={'keep_days': 180, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=SPICE_KEEPS, scaling='Scales evenly.', old_way=None, safety=[], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='italian-seasoning', name='Italian seasoning', emoji='🌿', kind='scratch', group='Seasonings and stand-ins',
    summary='Dried oregano, basil, thyme and rosemary in one jar.',
    makes=[{'item': 'italian-seasoning', 'by': 'tbsp', 'n': 6, 'label': 'tablespoons'}],
    yield_='About 6 tablespoons.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('oregano', 2, 'tbsp'), I('basil-dried', 2, 'tbsp'), I('thyme-dried', 1, 'tbsp'), I('rosemary-dried', 1, 'tbsp', 'crushed')],
    equipment=['small jar'],
    steps=['Crush the rosemary between your fingers or in a mortar, then stir everything together.'],
    stages=[st('Mix', active=3)],
    plan={'keep_days': 180, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=SPICE_KEEPS, scaling='Scales evenly. Dried herbs from your own garden work well here.',
    old_way=None, safety=[], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579']))

R.append(dict(
    id='powdered-sugar', name='Powdered sugar', emoji='🍬', kind='stand-in', group='Seasonings and stand-ins',
    summary='Granulated sugar and a spoonful of cornstarch, ground fine in a blender.',
    makes=[{'item': 'powdered-sugar', 'by': 'cup', 'n': 1.75, 'label': 'cups'}],
    yield_='About 1¾ cups.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('sugar', 200, 'g'), I('cornstarch', 1, 'tbsp')],
    equipment=['blender or clean spice grinder'],
    steps=['Blend the sugar and cornstarch on high 1 to 2 minutes, until fine as flour.',
           'Let the dust settle a minute before you open the lid. Sift before using in frosting.'],
    stages=[st('Blend', active=5)],
    plan={'keep_days': 365, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Pantry: airtight, like any sugar (NDSU gives sugars 18 to 24 months).'],
    scaling='Store powdered sugar has 2 to 5% starch to keep it from caking (Wikipedia); a tablespoon per cup of sugar is about 4%. It comes out a little less fine than store powdered sugar.',
    old_way=None, safety=[], notes=['For whipped cream and dusting, granulated sugar ground alone works too.'],
    nutrition={'from': 'ingredients'}, src=['wiki-powdered', 'ndsu-fn579']))

R.append(dict(
    id='brown-sugar', name='Brown sugar', emoji='🟫', kind='stand-in', group='Seasonings and stand-ins',
    summary='White sugar with a little molasses worked in: light or dark.',
    makes=[{'item': 'brown-sugar', 'by': 'cup', 'n': 1, 'label': 'cups, packed'}],
    yield_='About 1 cup, packed.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('sugar', 200, 'g'), I('molasses', 1, 'tbsp', 'for dark brown; use 1½ teaspoons for light')],
    equipment=['bowl and fork, or a mixer'],
    steps=['Work the molasses into the sugar with a fork (or a mixer on low) until the color is even and there are no streaks.'],
    stages=[st('Mix', active=5)],
    plan={'keep_days': 365, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Pantry: airtight, or it dries out and hardens (NDSU gives sugars 18 to 24 months).'],
    scaling='Store brown sugar is white sugar with molasses added: about 3.5% molasses for light and 6.5% for dark, by volume (Wikipedia). That is about 1½ teaspoons (light) or 1 tablespoon (dark) per cup. NDSU’s chart uses ¼ cup molasses per cup of sugar, which makes a much darker, wetter sugar.',
    old_way=None, safety=[], notes=['In a pinch, plain white sugar also works cup for cup (USU, Missouri), with less caramel flavor.'],
    nutrition={'from': 'ingredients'}, src=['wiki-brown', 'ndsu-fn198', 'usu-subs', 'mu-mp564', 'ndsu-fn579']))

R.append(dict(
    id='self-rising-flour', name='Self-rising flour', emoji='🌾', kind='stand-in', group='Seasonings and stand-ins',
    summary='All-purpose flour with the baking powder and salt already in it.',
    makes=[{'item': 'self-rising-flour', 'by': 'cup', 'n': 1, 'label': 'cups'}],
    yield_='1 cup.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('flour', 120, 'g', '1 cup minus 2 teaspoons'), I('baking-powder', 1.5, 'tsp'), I('salt', 0.5, 'tsp')],
    equipment=['bowl and whisk'],
    steps=['Whisk the flour, baking powder and salt together very well.'],
    stages=[st('Whisk', active=2)],
    plan={'keep_days': 30, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Mix it as you need it: it lasts only as long as the baking powder, which loses strength 3 to 6 months after opening (NDSU).'],
    scaling='Per cup: 1 cup minus 2 teaspoons all-purpose flour, 1½ teaspoons baking powder and ½ teaspoon salt (NDSU and University of Missouri; Colorado State uses 1¼ teaspoons baking powder and ¼ teaspoon salt).',
    old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn198', 'mu-mp564', 'csu-9329', 'ndsu-fn579']))

R.append(dict(
    id='cake-flour', name='Cake flour', emoji='🎂', kind='stand-in', group='Seasonings and stand-ins',
    summary='Less all-purpose flour, sifted, for a tender cake.',
    makes=[{'item': 'cake-flour', 'by': 'cup', 'n': 1, 'label': 'cups'}],
    yield_='1 cup.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('flour', 109, 'g', '1 cup minus 2 tablespoons, sifted')],
    equipment=['sifter or fine strainer'],
    steps=['For each cup of cake flour, measure 1 cup minus 2 tablespoons of all-purpose flour and sift it.'],
    stages=[st('Measure and sift', active=2)],
    plan={'keep_days': 180, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Pantry: as for flour (NDSU: 6 to 8 months once opened).'],
    scaling='1 cup cake flour = 1 cup minus 2 tablespoons all-purpose (NDSU, Missouri, Colorado State).',
    old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn198', 'mu-mp564', 'csu-9329', 'ndsu-fn579']))

R.append(dict(
    id='buttermilk-substitute', name='Buttermilk stand-in', emoji='🥛', kind='stand-in', group='Seasonings and stand-ins',
    summary='Milk soured with lemon juice or vinegar, for baking when you’re out of buttermilk.',
    makes=[{'item': 'buttermilk', 'by': 'cup', 'n': 1, 'label': 'cups'}],
    yield_='1 cup.',
    batch={'step': 0.25, 'min': 0.25},
    ingredients=[I('lemon-juice', 1, 'tbsp', 'or white vinegar'), I('whole-milk', 0.9375, 'cup', 'enough to make 1 cup with the lemon')],
    equipment=['measuring cup'],
    steps=['Put the lemon juice in a measuring cup and add milk to the 1-cup line.', 'Stir and let it stand 5 to 10 minutes, until slightly thickened.'],
    stages=[st('Stir and wait', active=2, wait=10)],
    plan={'keep_days': 0, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Use it right away, in the recipe.'],
    scaling='1 tablespoon lemon juice or vinegar per cup (NDSU, Missouri, Colorado State, USU). Plain yogurt also stands in cup for cup (Missouri).',
    old_way=None, safety=[], notes=['It works in pancakes, biscuits and cakes, where the acid reacts with baking soda. It’s thinner than cultured buttermilk.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn198', 'mu-mp564', 'csu-9329', 'usu-subs']))

# ------------------------------------------------------------------ beans from dry
for bid, dry, name, cook_t in (('black', 'dried-black-beans', 'Black beans', '1 to 1½ hours'), ('pinto', 'dried-pinto-beans', 'Pinto beans', '1½ to 2 hours'), ('kidney', 'dried-kidney-beans', 'Red kidney beans', '1½ to 2 hours')):
    R.append(dict(
        id=bid + '-beans-from-dry', name=name + ' from dry', emoji='🫘', kind='scratch', group='Beans',
        summary='A pound of dried beans soaked and simmered: about as much as four cans, for a fraction of the cost.',
        makes=[{'item': bid + '-beans', 'by': 'can', 'n': 4, 'label': 'cans’ worth (15 oz each)'}],
        yield_='About 6 cups of cooked beans, drained: about the same as four 15-oz cans.',
        batch={'step': 0.25, 'min': 0.25},
        ingredients=[I(dry, 1, 'lb', 'sorted and rinsed'), I('salt', 6, 'g'), I('bay-leaves', 1, 'leaf', '', True), I('water', 20, 'cup', 'about 10 cups to soak and 10 to cook')],
        equipment=['large pot', 'colander'],
        steps=['Spread the beans on a tray and pick out any small stones or shriveled beans, then rinse them.',
               'Soak them in plenty of cold water (about 10 cups) at least 5 hours or overnight.',
               'Drain and rinse. Cover with fresh water by about 2 inches, add the bay leaf, and bring to a boil. Boil hard for at least 30 minutes: soaking and then boiling in fresh water for at least 30 minutes destroys a natural toxin in raw beans, especially kidney beans (FDA).',
               'Turn the heat down and simmer, partly covered, until tender all the way through, ' + cook_t + ' in all depending on the age of the beans. Add the salt in the last 15 minutes.',
               'Cool them in their liquid in shallow containers and refrigerate within 2 hours. Freeze them in their liquid in can-sized portions (about 1½ cups each).'],
        stages=[st('Sort, rinse and soak', active=10, wait=480, bg=True), st('Boil hard, then simmer until tender', active=10, cook=90, station='simmer'), st('Cool in shallow containers', wait=45, bg=True)],
        plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the refrigerator, or warm them straight from frozen in a covered pot.'},
        keeps=['Refrigerator: 3 to 4 days, as for other cooked leftovers (USDA).', 'Freezer: 3 to 4 months in their liquid (USDA’s time for leftovers).'],
        scaling='1 lb of dried beans makes about 6 cups cooked, about four 15-oz cans. Use a pot big enough that the beans stay covered by 2 inches of water.',
        old_way=None, safety=['Never eat raw or undercooked dried beans. Soak at least 5 hours and boil in fresh water at least 30 minutes (FDA).', 'Cool in shallow containers and refrigerate within 2 hours (USDA).'], notes=[],
        nutrition={'from': 'ingredients'}, src=['fda-toxins', 'fsis-leftovers']))


# ------------------------------------------------------------------ more breads (added with soft pretzels)
QUICK_KEEPS = ['Counter: wrapped, about 3 days (NDSU’s figure for bread).', 'Freezer: wrapped once cool, 2 to 4 months (University of Missouri’s time for quick breads); thaw in the wrapping, 1 to 2 hours.']
QUICK_SRC = ['ndsu-fn579', 'mu-gh1505', 'fda-flour']
ROLL_KEEPS = ['Counter: in a bag, about 3 days (NDSU’s figure for bread and rolls).', 'Freezer: bag them once cool, up to 3 months (University of Missouri).']
LOAF_PLAN = {'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, about 3 hours.'}
ROLL_PLAN = {'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag on the counter, about 1 hour.'}

R.append(dict(
    id='whole-wheat-sandwich-bread', name='Whole-wheat sandwich bread', emoji='🍞', kind='scratch', group='Yeast breads',
    summary='All whole-wheat flour, a little honey, and a rest before kneading so the bran softens.',
    makes=[{'item': 'wheat-bread', 'by': 'slice', 'n': 16, 'label': 'slices (about ½ inch thick)'}],
    yield_='One 9 × 5-inch loaf, 16 slices about ½ inch thick (¾ of the dough fills an 8½ × 4½-inch pan).',
    batch={'step': 0.25, 'min': 0.75, 'pans': loaf_pans},
    ingredients=[I('whole-wheat-flour', 480, 'g'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('honey', 3, 'tbsp'), I('butter', 42, 'g', 'softened, or 3 tablespoons vegetable oil'),
                 I('whole-milk', 1, 'cup'), I('water', 0.6667, 'cup')],
    equipment=['large bowl', 'loaf pan (9 × 5 or 8½ × 4½ inch)', 'instant-read thermometer (helpful)', 'cooling rack'],
    steps=['Warm the milk and water to about 110°F. Stir in the honey and yeast and let it stand 5 to 10 minutes, until foamy.',
           'Stir in the flour, butter and salt to make a sticky, shaggy dough. Cover and let it rest 20 minutes: whole-wheat flour soaks up water slowly, and the dough gets easier to knead.',
           'Knead 8 to 10 minutes until smooth and stretchy but still a little tacky. Add flour only a spoonful at a time; too much makes a dry, heavy loaf.',
           'Cover and let it rise until doubled, 1 to 1½ hours.',
           'Shape it like sandwich bread (press into a rectangle, roll up tightly, pinch the seam) and set it in a greased pan.',
           'Let it rise until it crowns about 1 inch over the rim, 45 to 60 minutes, while the oven heats to 350°F.',
           'Bake 35 to 40 minutes (8½ × 4½: 30 to 35), until the center reads about 190°F. Cool on a rack at least 1 hour before slicing.'],
    stages=[st('Mix, rest and knead the dough', active=25, wait=110), st('Shape the loaves and set them in the pans', active=10, wait=55),
            st('Bake at 350°F', cook=38, station='oven', temp=350), st('Cool on a rack before slicing', wait=60, bg=True)],
    plan=LOAF_PLAN, keeps=BREAD_KEEPS,
    scaling='7 g yeast and 9 g salt for every 480 g of flour. Whole wheat rises a little slower in a cool kitchen; go by the size of the dough, not the clock.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['Half whole-wheat and half white flour gives a lighter loaf: see the half whole-wheat recipe.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='oatmeal-bread', name='Oatmeal bread', emoji='🍞', kind='scratch', group='Yeast breads',
    summary='Rolled oats soaked in hot water with honey and butter make a soft, faintly sweet, moist loaf.',
    makes=[], yield_='One 9 × 5-inch loaf, about 16 slices.',
    batch={'step': 0.25, 'min': 0.75, 'pans': loaf_pans},
    ingredients=[I('rolled-oats', 1, 'cup'), I('water', 1, 'cup', 'boiling'), I('honey', 0.25, 'cup'), I('butter', 28, 'g'), I('whole-milk', 0.5, 'cup'),
                 I('salt', 9, 'g'), I('yeast', 7, 'g'), I('flour', 420, 'g', 'or bread flour')],
    equipment=['large bowl', 'loaf pan (9 × 5 or 8½ × 4½ inch)', 'cooling rack'],
    steps=['Pour the boiling water over the oats, honey, butter and salt in a large bowl. Let it stand until just warm, about 110°F, 20 to 30 minutes.',
           'Warm the milk to about 110°F, stir in the yeast, and let it stand 5 minutes. Add it to the oats.',
           'Stir in the flour a cup at a time. Knead 8 minutes until smooth; the oats keep it a little sticky.',
           'Cover and let it rise until doubled, about 1 to 1½ hours.',
           'Shape into a loaf, set it in a greased pan, and let it rise until it crowns 1 inch over the rim, 45 to 60 minutes. Heat the oven to 350°F.',
           'Sprinkle a few oats on top if you like. Bake 35 to 40 minutes, until the center reads about 190°F. Cool at least 1 hour.'],
    stages=[st('Soak the oats and cool', active=5, wait=25), st('Mix and knead the dough', active=20, wait=80), st('Shape and set in the pan', active=10, wait=50),
            st('Bake at 350°F', cook=38, station='oven', temp=350), st('Cool on a rack', wait=60, bg=True)],
    plan=LOAF_PLAN, keeps=BREAD_KEEPS,
    scaling='Scales by the loaf; keep 7 g yeast and 9 g salt per batch.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='potato-bread', name='Potato bread', emoji='🥔', kind='scratch', group='Yeast breads',
    summary='Mashed potato and its cooking water make a tender, moist loaf that stays soft for days.',
    makes=[{'item': 'potato-bread', 'by': 'slice', 'n': 16, 'label': 'slices (about ½ inch thick)'}],
    yield_='One 9 × 5-inch loaf, 16 slices.',
    batch={'step': 0.25, 'min': 0.75, 'pans': loaf_pans},
    ingredients=[I('russet-potato', 1, 'each', 'peeled and cut in chunks'), I('whole-milk', 0.5, 'cup'), I('butter', 42, 'g'), I('sugar', 25, 'g'), I('eggs', 1, 'each'),
                 I('salt', 9, 'g'), I('yeast', 7, 'g'), I('flour', 450, 'g', 'or bread flour')],
    equipment=['small saucepan', 'masher or fork', 'large bowl', 'loaf pan (9 × 5 or 8½ × 4½ inch)'],
    steps=['Boil the potato in water until very tender, about 15 minutes. Save ½ cup of the cooking water, drain, and mash the potato smooth (about ¾ cup).',
           'Stir the butter and sugar into the warm potato, then the milk and saved potato water. Let it cool to about 110°F and stir in the yeast.',
           'Beat in the egg and salt, then the flour a little at a time. Knead 8 minutes; the dough is soft and slightly sticky.',
           'Cover and let it rise until doubled, about 1 hour (potato dough is quick).',
           'Shape into a loaf, set it in a greased pan, and let it rise until it crowns about 1 inch over the rim, 40 to 50 minutes. Heat the oven to 375°F.',
           'Bake 30 to 35 minutes, until golden and about 190°F in the center. Cool at least 1 hour.'],
    stages=[st('Boil and mash the potato', active=10, cook=15, station='stove'), st('Cool, mix and knead the dough', active=20, wait=60),
            st('Shape and set in the pan', active=10, wait=45), st('Bake at 375°F', cook=33, station='oven', temp=375), st('Cool on a rack', wait=60, bg=True)],
    plan=LOAF_PLAN, keeps=BREAD_KEEPS,
    scaling='One medium russet (about ¾ cup mashed) per loaf. Leftover plain mashed potato works; skip the boiling.', old_way=None, safety=[FLOUR_SAFETY], notes=['A good use for garden potatoes.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='rye-bread', name='Deli-style rye bread', emoji='🥪', kind='scratch', group='Yeast breads',
    summary='A light rye with caraway seeds, the kind for corned beef or turkey sandwiches.',
    makes=[{'item': 'rye-bread', 'by': 'slice', 'n': 16, 'label': 'slices'}],
    yield_='One oval loaf (or a 9 × 5-inch pan loaf), about 16 slices.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 300, 'g'), I('rye-flour', 150, 'g'), I('caraway-seeds', 1, 'tbsp'), I('yeast', 7, 'g'), I('salt', 9, 'g'),
                 I('molasses', 2, 'tbsp', 'or honey'), I('vegetable-oil', 2, 'tbsp'), I('water', 1.3333, 'cup', 'about 110°F')],
    equipment=['large bowl', 'baking sheet or 9 × 5-inch loaf pan', 'cooling rack'],
    steps=['Stir the yeast and molasses into the warm water and let it stand 5 minutes.',
           'Add the oil, salt, caraway, rye flour and bread flour and mix to a soft dough. Rye dough is stickier than wheat dough; wet your hands instead of adding much flour.',
           'Knead about 6 minutes until fairly smooth. Cover and let it rise until about doubled, 1 to 1½ hours.',
           'Shape into an oval loaf on a baking sheet dusted with cornmeal or flour (or into a greased loaf pan). Cover and let it rise until puffy, 45 to 60 minutes. Heat the oven to 375°F.',
           'Brush the top with water and slash it 3 times. Bake 35 to 40 minutes, until it sounds hollow underneath and reads about 190°F.',
           'Cool completely, 2 hours, before slicing; rye stays gummy while warm.'],
    stages=[st('Mix and knead the dough', active=20, wait=80), st('Shape the loaf', active=10, wait=50), st('Bake at 375°F', cook=38, station='oven', temp=375), st('Cool completely', wait=120, bg=True)],
    plan=LOAF_PLAN, keeps=BREAD_KEEPS,
    scaling='Keep rye at about a third of the flour; more rye makes a denser loaf that needs a different method.', old_way=None,
    safety=[FLOUR_SAFETY, 'Rye has gluten, and this bread is mostly wheat flour: it isn’t gluten-free.'], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='italian-bread', name='Italian bread', emoji='🥖', kind='scratch', group='Yeast breads',
    summary='A soft-crusted, golden loaf with a little olive oil and sugar, often topped with sesame seeds.',
    makes=[{'item': 'italian-bread', 'by': 'g', 'n': 780, 'label': 'g of bread'}],
    yield_='One large loaf, about 1¾ lb (or two smaller ones).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 500, 'g'), I('yeast', 7, 'g'), I('salt', 10, 'g'), I('sugar', 12.5, 'g'), I('olive-oil', 2, 'tbsp'), I('water', 1.3333, 'cup', 'about 110°F'),
                 I('sesame-seeds', 1, 'tbsp', '', True)],
    equipment=['large bowl', 'baking sheet', 'cooling rack'],
    steps=['Stir the yeast and sugar into the warm water and let it stand 5 minutes. Add the oil, salt and flour and mix.',
           'Knead 8 to 10 minutes until smooth and elastic. Cover and let it rise until doubled, about 1 to 1½ hours.',
           'Shape into a 14-inch log (or two 10-inch logs), set on a baking sheet dusted with cornmeal, and let it rise until puffy, 45 to 60 minutes. Heat the oven to 425°F.',
           'Brush with water, sprinkle with sesame seeds if you like, and slash one long cut down the top.',
           'Bake 25 to 30 minutes, until golden and hollow-sounding (about 200°F). Cool 30 minutes.'],
    stages=[st('Mix and knead the dough', active=20, wait=80), st('Shape the loaf', active=10, wait=50), st('Bake at 425°F', cook=28, station='oven', temp=425), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping, then warm in a 350°F oven for 5 to 10 minutes.'}, keeps=BREAD_KEEPS,
    scaling='10 g salt and 7 g yeast per 500 g flour.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='focaccia', name='Focaccia', emoji='🫒', kind='scratch', group='Yeast breads',
    summary='A wet, olive-oil dough baked in a sheet pan: crisp underneath, airy inside, dimpled on top.',
    makes=[], yield_='One 9 × 13-inch pan, 12 to 15 pieces.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 500, 'g', 'or all-purpose'), I('yeast', 7, 'g'), I('salt', 12, 'g'), I('water', 1.6667, 'cup', 'about 100°F'), I('olive-oil', 0.375, 'cup', 'divided'),
                 I('rosemary-dried', 1, 'tsp'), I('kosher-salt', 0.5, 'tsp', 'for the top')],
    equipment=['large bowl', '9 × 13-inch metal pan'],
    steps=['Stir the flour, yeast and salt in a bowl, add the water, and mix until no dry flour is left. The dough will be very wet; that’s right.',
           'Cover and rest 30 minutes. With a wet hand, lift one side of the dough and fold it over the middle; turn the bowl and repeat 4 times. Do this 3 times, 30 minutes apart.',
           'Pour ¼ cup of the oil into the pan, tip the dough in, and turn it once to coat. Let it rest 20 minutes, then gently stretch it toward the corners.',
           'Cover and let it rise until puffy and bubbly, 45 to 60 minutes. Heat the oven to 450°F.',
           'Drizzle with the rest of the oil, press deep dimples all over with oiled fingers, and sprinkle with rosemary and coarse salt.',
           'Bake 20 to 25 minutes, until deep golden on top and underneath. Cool 10 minutes in the pan, then move it to a rack.'],
    stages=[st('Mix the dough', active=10, wait=30), st('Stretch and fold 3 times', active=6, wait=90), st('Pan it and let it rise', active=5, wait=65),
            st('Dimple and top', active=5), st('Bake at 450°F', cook=23, station='oven', temp=450), st('Cool', wait=15)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw, then warm in a 375°F oven 5 to 8 minutes.'},
    keeps=['Counter: best the day it’s baked; wrapped, about 2 days, recrisped in the oven.', BREAD_KEEPS[1]],
    scaling='Double it in a half-sheet pan (13 × 18 inch); the baking time stays about the same.', old_way=None, safety=[FLOUR_SAFETY], notes=['The wet dough is what makes the big holes; resist adding flour.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='ciabatta', name='Ciabatta', emoji='🥖', kind='scratch', group='Yeast breads',
    summary='Very wet dough, folded instead of kneaded, baked into two flat, open-holed loaves.',
    makes=[], yield_='Two loaves, about 14 oz each, or 8 sandwich rolls.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 500, 'g'), I('yeast', 4, 'g'), I('salt', 10, 'g'), I('water', 1.75, 'cup', 'about 90°F'), I('olive-oil', 1, 'tbsp')],
    equipment=['large bowl or square container', 'baking sheet', 'parchment paper', 'bench scraper (helpful)'],
    steps=['Mix the flour, yeast, salt, water and oil until no dry flour remains. Cover and rest 30 minutes.',
           'With a wet hand, stretch and fold the dough over itself 4 times, turning the bowl. Repeat 3 more times, every 30 minutes. Then let it rise undisturbed until doubled and bubbly, about 1 more hour.',
           'Tip it onto a well-floured counter. With floured hands, gently pat it into a rectangle and cut it in two. Fold each piece in thirds like a letter and set them seam side down on floured parchment.',
           'Cover and let them rise 45 minutes while the oven heats to 450°F with a baking sheet inside.',
           'Flip each loaf over onto the hot sheet (parchment and all) so the floured side is up. Bake 22 to 25 minutes, until deep golden. Cool at least 30 minutes.'],
    stages=[st('Mix and rest', active=10, wait=30), st('Stretch and fold 4 times, then rise', active=8, wait=150), st('Shape the loaves', active=10, wait=45),
            st('Bake at 450°F', cook=24, station='oven', temp=450), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw, then crisp in a 350°F oven 5 to 10 minutes.'},
    keeps=['Counter: best the day it’s baked; in a paper bag, about 2 days.', BREAD_KEEPS[1]],
    scaling='Don’t add flour to make it easier to handle; flour your hands and the counter instead.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='hoagie-rolls', name='Sub rolls', emoji='🥖', kind='scratch', group='Yeast breads',
    summary='Long, soft-crusted rolls for subs, hoagies and meatball sandwiches.',
    makes=[{'item': 'hoagie-rolls', 'by': 'each', 'n': 8, 'label': 'sub rolls (about 8 inches)'}],
    yield_='Eight 8-inch rolls.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('bread-flour', 500, 'g'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('sugar', 12.5, 'g'), I('vegetable-oil', 2, 'tbsp'), I('water', 1.25, 'cup', 'about 110°F')],
    equipment=['large bowl', '2 baking sheets', 'cooling rack'],
    steps=['Stir the yeast and sugar into the warm water and let it stand 5 minutes. Add the oil, salt and flour and mix.',
           'Knead 8 to 10 minutes until smooth. Cover and let it rise until doubled, about 1 hour.',
           'Divide into 8 pieces (about 100 g each). Pat each into a rectangle, roll it up tightly into an 8-inch log, and set them 2 inches apart on the sheets.',
           'Cover and let rise until puffy, 40 to 50 minutes. Heat the oven to 400°F.',
           'Brush with water and slash each down the middle if you like. Bake 18 to 20 minutes, until golden. Cool on a rack.'],
    stages=[st('Mix and knead the dough', active=20, wait=60), st('Shape the rolls', active=15, wait=45), st('Bake at 400°F', cook=19, station='oven', temp=400), st('Cool', wait=30, bg=True)],
    plan=ROLL_PLAN, keeps=ROLL_KEEPS,
    scaling='Each roll is an eighth of the dough; the planner counts rolls.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='breadsticks', name='Soft breadsticks', emoji='🥖', kind='scratch', group='Yeast breads',
    summary='Pizza-style dough cut into sticks and brushed with garlic butter and Parmesan.',
    makes=[], yield_='12 breadsticks.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 280, 'g'), I('yeast', 4, 'g'), I('salt', 6, 'g'), I('olive-oil', 1, 'tbsp'), I('water', 0.75, 'cup', 'about 110°F'),
                 I('butter', 42, 'g', 'melted'), I('garlic-powder', 0.5, 'tsp'), I('parmesan', 2, 'tbsp', '', True)],
    equipment=['bowl', 'baking sheet', 'pastry brush'],
    steps=['Make the dough: stir the yeast into the warm water, add the flour, salt and oil, and knead 6 to 8 minutes. Cover and let it rise until doubled, about 1 hour.',
           'Pat it into a 12 × 8-inch rectangle on a greased baking sheet and cut it into 12 strips with a pizza cutter (leave them side by side). Let rise 20 minutes. Heat the oven to 400°F.',
           'Brush with half the garlic butter and sprinkle with Parmesan. Bake 15 to 18 minutes, until golden. Brush with the rest of the butter and pull apart.'],
    stages=[st('Mix and knead the dough', active=15, wait=60), st('Shape and cut', active=10, wait=20), st('Bake at 400°F', active=3, cook=16, station='oven', temp=400)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Warm frozen breadsticks in a 350°F oven about 10 minutes.'}, keeps=ROLL_KEEPS,
    scaling='Same dough as one 1-lb ball of pizza dough.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='english-muffins', name='English muffins', emoji='🧇', kind='scratch', group='Yeast breads',
    summary='A soft, wet dough cut into rounds, rolled in cornmeal and cooked slowly on a griddle.',
    makes=[{'item': 'english-muffins', 'by': 'each', 'n': 10, 'label': 'English muffins'}],
    yield_='About ten 3-inch muffins.',
    batch={'step': 0.1, 'min': 0.5},
    ingredients=[I('flour', 450, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 7, 'g'), I('sugar', 12.5, 'g'), I('butter', 28, 'g', 'melted'),
                 I('whole-milk', 1.25, 'cup', 'warm'), I('water', 0.25, 'cup', 'warm'), I('cornmeal', 3, 'tbsp', 'for dusting')],
    equipment=['bowl', '3-inch round cutter or a glass', 'griddle or large heavy skillet', 'baking sheet'],
    steps=['Stir the yeast and sugar into the warm milk and water and let it stand 5 minutes. Add the butter, salt and flour and beat to a soft, sticky dough.',
           'Knead about 5 minutes (in a mixer is easiest). Cover and let it rise until doubled, about 1 hour.',
           'Pat it ¾ inch thick on a floured counter and cut 3-inch rounds. Press the scraps together once for the last few.',
           'Set the rounds on a sheet dusted with cornmeal, dust the tops, cover, and let them rise 30 to 45 minutes.',
           'Heat a dry griddle over medium-low. Cook the muffins a few at a time, 7 to 8 minutes per side, until browned and the sides spring back (about 200°F in the middle). Keep the heat low so the inside cooks before the outside burns.',
           'Cool on a rack. Split them with a fork for the craggy, crisp-toasting inside.'],
    stages=[st('Mix and knead the dough', active=15, wait=60), st('Cut and rest in cornmeal', active=15, wait=40), st('Cook on the griddle', active=35, station='stove'), st('Cool', wait=20, bg=True)],
    plan=ROLL_PLAN, keeps=ROLL_KEEPS,
    scaling='Each muffin is a tenth of the dough. Cook in batches; a griddle holds 4 to 6.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

# ------------------------------------------------------------------ enriched breads
R.append(dict(
    id='milk-bread', name='Japanese-style milk bread', emoji='🍞', kind='scratch', group='Enriched breads',
    summary='A cooked flour-and-milk paste (tangzhong) makes an extra-soft, fluffy loaf that stays fresh longer.',
    makes=[], yield_='One 8½ × 4½-inch loaf, about 12 thick slices.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 350, 'g', '20 g of it for the paste'), I('whole-milk', 0.9, 'cup', '100 g of it for the paste'), I('eggs', 1, 'each'), I('sugar', 40, 'g'), I('salt', 6, 'g'),
                 I('yeast', 7, 'g'), I('butter', 40, 'g', 'softened')],
    equipment=['small saucepan and whisk', 'bowl or stand mixer', '8½ × 4½-inch loaf pan'],
    steps=['Paste: whisk 20 g (2 tablespoons plus 1 teaspoon) of the flour into 100 g (scant ½ cup) of the milk in a small pan. Cook over medium-low, whisking, until it thickens like pudding and the whisk leaves lines, 2 to 3 minutes. Cool to lukewarm.',
           'Warm the rest of the milk to about 110°F and stir in the yeast. Add the paste, egg, sugar, salt and the rest of the flour and mix.',
           'Knead 10 minutes (it starts sticky), then knead in the butter a little at a time and knead 5 to 10 minutes more, until very smooth and stretchy.',
           'Cover and let it rise until doubled, about 1 hour.',
           'Divide into 3 pieces. Roll each into an oval, fold in the long sides, and roll it up from the short end. Set the 3 rolls side by side in the greased pan.',
           'Let rise until the top is about ½ inch over the rim, 45 to 60 minutes. Heat the oven to 350°F. Brush with milk.',
           'Bake 30 to 35 minutes, until deep golden and about 190°F in the middle. Cool in the pan 10 minutes, then on a rack.'],
    stages=[st('Cook the paste and cool it', active=5, cook=3, station='stove', wait=15), st('Mix and knead in the butter', active=25, wait=60),
            st('Shape the three rolls', active=10, wait=50), st('Bake at 350°F', cook=33, station='oven', temp=350), st('Cool', wait=60, bg=True)],
    plan=LOAF_PLAN, keeps=BREAD_KEEPS,
    scaling='The paste is about 6% of the flour cooked with five times its weight in milk; scale both with the loaf.', old_way=None,
    safety=[FLOUR_SAFETY], notes=['Iowa State Extension notes the cooked-paste method makes bread softer and helps it keep longer.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC + ['isu-tangzhong']))

R.append(dict(
    id='challah', name='Challah', emoji='🥨', kind='scratch', group='Enriched breads',
    summary='A braided egg bread sweetened with honey, shiny with egg wash.',
    makes=[{'item': 'challah', 'by': 'g', 'n': 850, 'label': 'g of bread'}],
    yield_='One large braided loaf, about 1¾ lb.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 500, 'g'), I('yeast', 7, 'g'), I('salt', 9, 'g'), I('honey', 0.25, 'cup'), I('vegetable-oil', 0.25, 'cup'),
                 I('eggs', 3, 'each', '2 for the dough, 1 for brushing'), I('water', 0.75, 'cup', 'about 110°F')],
    equipment=['large bowl', 'baking sheet lined with parchment', 'pastry brush'],
    steps=['Stir the yeast and a spoonful of the honey into the warm water and let it stand 5 minutes.',
           'Beat in the rest of the honey, the oil, 2 eggs and the salt, then the flour. Knead 8 to 10 minutes until smooth and elastic.',
           'Cover and let it rise until doubled, 1½ to 2 hours.',
           'Divide into 3 (or 6) equal pieces and roll each into a 16-inch rope. Pinch the ends together and braid loosely, then pinch and tuck the other end under.',
           'Set on the sheet, brush with beaten egg, and let rise until puffy, about 1 hour. Heat the oven to 350°F. Brush again.',
           'Bake 30 to 35 minutes, until deep brown and about 190°F in the thickest part. Cool on a rack.'],
    stages=[st('Mix and knead the dough', active=20, wait=100), st('Braid the loaf', active=15, wait=60), st('Bake at 350°F', active=2, cook=33, station='oven', temp=350), st('Cool', wait=45, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, about 3 hours.'}, keeps=BREAD_KEEPS,
    scaling='Two loaves: double it and braid two. A day-old loaf makes excellent French toast.', old_way=None, safety=[FLOUR_SAFETY], notes=['Made with oil, so it has no dairy.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='brioche', name='Brioche (loaf or buns)', emoji='🍞', kind='scratch', group='Enriched breads',
    summary='Eggs and lots of butter make a rich, tender bread; the dough rests overnight in the refrigerator.',
    makes=[], yield_='One 9 × 5-inch loaf or 8 burger buns.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 375, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 7, 'g'), I('sugar', 50, 'g'), I('whole-milk', 0.25, 'cup', 'warm'),
                 I('eggs', 5, 'each', '4 for the dough, 1 for brushing'), I('butter', 170, 'g', 'soft, in pieces')],
    equipment=['stand mixer with dough hook (strongly recommended)', 'loaf pan or baking sheet', 'plastic wrap'],
    steps=['Mix the flour, yeast, salt and sugar in the mixer bowl. Add the milk and 4 eggs and knead on medium-low about 5 minutes, until smooth.',
           'With the mixer running, add the butter a piece at a time, waiting until each disappears. Knead 8 to 10 minutes more, until the dough is glossy and pulls from the sides.',
           'Cover and let it rise 1 hour at room temperature, then press it down, cover tightly, and refrigerate overnight (8 to 16 hours). Cold dough is much easier to shape.',
           'Shape while cold: a loaf (8 small balls in two rows in a greased 9 × 5 pan) or 8 buns flattened to 3½ inches on a lined sheet.',
           'Let rise in a warm spot until puffy, 1½ to 2 hours. Heat the oven to 375°F for buns or 350°F for a loaf. Brush with beaten egg.',
           'Bake buns 15 to 18 minutes; a loaf 35 to 40 minutes (cover with foil if it browns too fast). It’s done at about 190°F. Cool on a rack.'],
    stages=[st('Mix and knead in the butter', active=25, wait=60, before=True), st('Chill overnight', active=2, wait=720, station='fridge', before=True), st('Shape while cold', active=15, wait=100),
            st('Bake at 375°F (buns)', active=2, cook=17, station='oven', temp=375), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag on the counter.'}, keeps=ROLL_KEEPS,
    scaling='Keep the butter about 45% of the flour’s weight. A stand mixer handles up to a double batch.', old_way=None, safety=[FLOUR_SAFETY], notes=['Brioche buns are a favorite for burgers.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='cinnamon-rolls', name='Cinnamon rolls', emoji='🌀', kind='scratch', group='Enriched breads',
    summary='A soft milk dough rolled around butter, brown sugar and cinnamon, finished with a simple glaze.',
    makes=[{'item': 'cinnamon-rolls', 'by': 'each', 'n': 12, 'label': 'cinnamon rolls'}],
    yield_='12 large rolls in a 9 × 13-inch pan.',
    batch={'step': 0.25, 'min': 0.5},
    ingredients=[I('flour', 500, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 6, 'g'), I('sugar', 50, 'g'), I('whole-milk', 1, 'cup', 'warm'), I('eggs', 1, 'each'),
                 I('butter', 113, 'g', 'softened: half for the dough, half for the filling'), I('brown-sugar', 0.75, 'cup', 'packed'), I('cinnamon', 1, 'tbsp'),
                 I('powdered-sugar', 120, 'g', 'for the glaze'), I('whole-milk', 2, 'tbsp', 'for the glaze'), I('vanilla', 0.5, 'tsp')],
    equipment=['large bowl', 'rolling pin', '9 × 13-inch pan', 'unflavored dental floss or a sharp knife'],
    steps=['Stir the yeast into the warm milk. Add the sugar, egg, half the butter (4 tablespoons), salt and flour and knead 8 minutes until soft and smooth.',
           'Cover and let it rise until doubled, about 1 hour.',
           'Roll it into an 18 × 12-inch rectangle. Spread with the rest of the soft butter and sprinkle evenly with the brown sugar and cinnamon.',
           'Roll it up tightly from the long side and pinch the seam. Cut into 12 slices (dental floss cuts cleanly) and set them in a greased 9 × 13 pan.',
           'Cover and let rise until puffy and touching, 45 to 60 minutes. (Or refrigerate overnight and let them rise 1 to 1½ hours in the morning.) Heat the oven to 375°F.',
           'Bake 22 to 25 minutes, until golden and the middle roll reads about 190°F.',
           'Stir the powdered sugar, milk and vanilla into a thick glaze and spread it over the warm rolls.'],
    stages=[st('Mix and knead the dough', active=15, wait=60), st('Fill, roll and cut', active=20, wait=50), st('Bake at 375°F', cook=23, station='oven', temp=375), st('Glaze', active=5, wait=10)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw, then warm 10 minutes at 300°F.'},
    keeps=['Counter: covered, about 2 days; best warm the first day.', 'Freezer: bake them, cool, and freeze unglazed up to 3 months (University of Missouri’s time for baked yeast rolls); glaze after warming.'],
    scaling='Each roll is a twelfth of the recipe.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='sweet-rolls', name='Sweet rolls (Hawaiian-style)', emoji='🍞', kind='scratch', group='Enriched breads',
    summary='Soft, slightly sweet pull-apart rolls made with honey, butter and eggs.',
    makes=[{'item': 'hawaiian-rolls', 'by': 'each', 'n': 16, 'label': 'rolls'}],
    yield_='16 pull-apart rolls in a 9 × 13-inch pan.',
    batch={'step': 0.25, 'min': 0.5},
    ingredients=[I('flour', 500, 'g'), I('yeast', 7, 'g'), I('salt', 7, 'g'), I('honey', 0.25, 'cup'), I('sugar', 25, 'g'), I('whole-milk', 0.75, 'cup', 'warm'),
                 I('eggs', 2, 'each'), I('butter', 57, 'g', 'softened, plus more for brushing')],
    equipment=['large bowl', '9 × 13-inch pan'],
    steps=['Stir the yeast into the warm milk with the honey and sugar and let it stand 5 minutes.',
           'Beat in the eggs, butter and salt, then the flour. Knead 8 to 10 minutes; the dough stays soft.',
           'Cover and let it rise until doubled, about 1 to 1½ hours.',
           'Divide into 16 pieces (about 55 g each), round them into tight balls, and set them in rows in a greased 9 × 13 pan.',
           'Let rise until puffy and touching, 45 to 60 minutes. Heat the oven to 350°F.',
           'Bake 20 to 25 minutes, until golden (about 190°F). Brush with melted butter.'],
    stages=[st('Mix and knead the dough', active=20, wait=75), st('Shape the rolls', active=15, wait=50), st('Bake at 350°F', cook=23, station='oven', temp=350), st('Cool', wait=20, bg=True)],
    plan=ROLL_PLAN, keeps=ROLL_KEEPS,
    scaling='Each roll is a sixteenth of the dough. Many recipes use pineapple juice for part of the milk; this one keeps to pantry staples.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

# ------------------------------------------------------------------ sourdough
R.append(dict(
    id='sourdough-starter', name='Sourdough starter', emoji='🫙', kind='scratch', group='Sourdough',
    summary='Flour and water, fed daily until wild yeast and bacteria make it bubble and rise: then keep it in the refrigerator for years.',
    makes=[], yield_='A jar of active starter; you keep about 50 to 100 g and feed it.',
    batch={'step': 1, 'min': 1},
    ingredients=[I('flour', 1300, 'g', 'about 100 g a day for 2 weeks'), I('water', 5.5, 'cup', 'about 100 g a day')],
    equipment=['clean glass jar (1 quart) with a loose lid', 'kitchen scale', 'spoon (not metal is best)', 'rubber band to mark the level'],
    steps=['Day 1: stir 100 g flour and 100 g lukewarm water in the jar into a thick batter. Cover loosely and leave it in a warm spot for 24 hours.',
           'Day 2: stir it, then keep only 50 g and throw out the rest. Feed it 50 g flour and 50 g water, stir, and mark the level with a rubber band.',
           'Keep feeding once a day the same way (equal weights of starter, flour and water: 1:1:1). When it starts bubbling and smelling yeasty, after about 3 days, feed it twice a day, about every 12 hours.',
           'It’s ready to bake with when it doubles within 4 to 6 hours after a feeding, is bubbly all through, and smells pleasantly sour. That usually takes about 2 weeks (Clemson Extension).',
           'Keeping it: store it in the refrigerator in a clean glass jar with a loose lid, and feed it once a week (Clemson, University of Alaska). Before baking, take it out, feed it, and let it double.',
           'Gray liquid on top is normal (it’s called hooch): stir it back in for a more sour starter, or pour it off.',
           'Throw it out and start over if it turns green (University of Alaska), grows fuzzy mold, or smells rotten rather than sour. When in doubt, throw it out.',
           'Use the starter you remove at each feeding (the discard) in pancakes, waffles or crackers, or throw it away.'],
    stages=[st('Mix the first batch', active=5, wait=1440, bg=True), st('Feed daily, then twice a day, until it doubles in 4 to 6 hours', active=75, wait=18720, bg=True)],
    plan={'keep_days': 365, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Refrigerator: keep it in a covered glass jar and feed it once a week (Clemson Extension; University of Alaska Extension). Metal containers and spoons aren’t recommended, since the acid can react with the metal (University of Alaska).'],
    scaling='Keep a small amount (50 to 100 g) and feed it 1:1:1 by weight. To build up starter for baking, feed it 6 to 12 hours before you mix the dough: for example 20 g starter, 50 g flour, 50 g water.',
    old_way='In Alaska, “sourdough” also means an old-timer: miners, trappers and homesteaders kept starters going because bread couldn’t be made without them, and supplies came by ship only once or twice a year (University of Alaska Extension).',
    safety=['Use a clean jar, and don’t add baking soda to the starter itself (University of Alaska).'], notes=[],
    nutrition={'from': 'ingredients'}, src=['clemson-sourdough', 'uaf-sourdough', 'ucanr-starter']))

R.append(dict(
    id='sourdough-bread', name='Sourdough bread', emoji='🥖', kind='scratch', group='Sourdough',
    summary='A crusty round loaf raised only with sourdough starter, shaped one day and baked the next.',
    makes=[{'item': 'sourdough', 'by': 'g', 'n': 800, 'label': 'g of bread'}],
    yield_='One round loaf, about 1¾ lb.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('bread-flour', 500, 'g', '50 g of it to feed the starter'), I('water', 1.5833, 'cup', '50 g of it to feed the starter'), I('salt', 10, 'g')],
    equipment=['kitchen scale', 'large bowl', 'bowl or basket lined with a well-floured towel', 'Dutch oven (5 to 6 quart) with lid', 'parchment paper', 'razor blade or sharp knife'],
    steps=['The day before baking, in the morning (6 to 12 hours ahead), feed your starter: 20 g of starter from the jar, 50 g of the flour and 50 g of the water. It’s ready when it has doubled and is bubbly.',
           'Mix all of the risen starter (about 120 g) with the remaining water (about 325 g) and flour (450 g) until no dry flour is left. Cover and rest 1 hour.',
           'Add the salt with a splash of water and squeeze it in. Over the next 2 hours, every 30 minutes, stretch one side of the dough up and fold it over; turn the bowl and repeat 4 times.',
           'Let it rise, covered, until it has grown by about half and has bubbles on the sides, 2 to 4 more hours (longer in a cool kitchen).',
           'In the evening, turn it out, shape it into a tight ball, and set it seam side up in the floured, towel-lined bowl. Cover and refrigerate overnight, 8 to 16 hours.',
           'Next morning, heat the oven to 475°F with the Dutch oven inside for 45 minutes. Turn the cold dough onto parchment, slash the top, and lower it into the pot.',
           'Bake covered 20 minutes, then uncovered 20 to 25 minutes, until very dark brown and about 205°F inside. Cool at least 2 hours before cutting.'],
    stages=[st('Feed the starter in the morning', active=5, wait=480, before=True), st('Mix the dough and rest', active=10, wait=60, before=True), st('Add the salt, then stretch and fold 4 times', active=10, wait=120, before=True),
            st('Let it rise until it grows by half', wait=180, before=True), st('Shape it and chill it overnight', active=10, wait=600, station='fridge', before=True), st('Heat the oven with the pot inside', wait=45), st('Bake at 475°F', cook=45, station='oven', temp=475), st('Cool', wait=120, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in its wrapping on the counter, then crisp in a 375°F oven 10 minutes.'},
    keeps=['Counter: cut side down on a board or in a paper bag, about 3 days (NDSU’s figure for bread).', BREAD_KEEPS[1]],
    scaling='75% water, 2% salt and about 20% starter by the flour’s weight. Times depend on your starter and your kitchen: go by how the dough looks.',
    old_way='Before factory-made yeast went on sale in the United States in the late 1860s, home bakers raised their bread with starters like this one or with yeast from brewing.',
    safety=[FLOUR_SAFETY, 'Use oven mitts that cover your wrists for the 475°F pot.'], notes=['You need an active starter first: see the sourdough starter recipe.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC + ['wiki-fleischmann', 'clemson-sourdough']))

# ------------------------------------------------------------------ flatbreads
R.append(dict(
    id='pita', name='Pita bread', emoji='🫓', kind='scratch', group='Flatbreads and tortillas',
    summary='Rounds of simple dough baked on a hot sheet until they puff into pockets.',
    makes=[{'item': 'pita', 'by': 'each', 'n': 8, 'label': 'pitas (6½ inch)'}],
    yield_='Eight 6½-inch pitas.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('flour', 360, 'g'), I('yeast', 4, 'g'), I('salt', 6, 'g'), I('sugar', 1, 'tsp'), I('olive-oil', 1, 'tbsp'), I('water', 1, 'cup', 'about 110°F')],
    equipment=['bowl', 'rolling pin', 'heavy baking sheet or baking stone (or a cast-iron skillet)'],
    steps=['Stir the yeast and sugar into the warm water. Add the oil, salt and flour and knead 8 minutes until smooth.',
           'Cover and let it rise until doubled, about 1 to 1½ hours.',
           'Heat the oven to 475°F with the baking sheet on the lowest rack for at least 30 minutes.',
           'Divide into 8 balls and rest them 10 minutes, covered. Roll each to a 6-inch round about ¼ inch thick, without creasing.',
           'Bake 2 or 3 at a time on the hot sheet, 3 to 5 minutes, until puffed and just starting to color. (On the stove: cook in a hot dry skillet 1 to 2 minutes per side.)',
           'Stack them in a towel so they stay soft as they cool.'],
    stages=[st('Mix and knead the dough', active=15, wait=75), st('Shape the rounds', active=15, wait=10), st('Bake at 475°F in batches', active=15, cook=15, station='oven', temp=475)],
    plan=ROLL_PLAN, keeps=['Counter: in a bag once cool, about 3 days (NDSU’s figure for bread).', 'Freezer: bag them, up to 3 months; warm in a skillet or toaster.'],
    scaling='Each pita is an eighth of the dough (about 75 g).', old_way=None, safety=[FLOUR_SAFETY], notes=['Uneven thickness or creases keep them from puffing; they still taste fine as flatbread.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='naan', name='Naan', emoji='🫓', kind='scratch', group='Flatbreads and tortillas',
    summary='A soft yogurt dough cooked in a very hot skillet and brushed with butter.',
    makes=[{'item': 'naan', 'by': 'each', 'n': 8, 'label': 'naan'}],
    yield_='8 naan, about 8 inches long.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('flour', 375, 'g'), I('yeast', 4, 'g'), I('salt', 6, 'g'), I('sugar', 1, 'tsp'), I('plain-yogurt', 0.5, 'cup'), I('water', 0.5, 'cup', 'warm'),
                 I('vegetable-oil', 2, 'tbsp'), I('butter', 28, 'g', 'melted, for brushing'), I('garlic', 2, 'clove', 'minced, for garlic naan', True)],
    equipment=['bowl', 'rolling pin', 'cast-iron skillet with a lid'],
    steps=['Stir the yeast and sugar into the warm water and let it stand 5 minutes. Add the yogurt, oil, salt and flour and knead 5 minutes into a soft dough.',
           'Cover and let it rise until doubled, about 1½ hours.',
           'Divide into 8 balls. Roll each into an oval about ¼ inch thick.',
           'Heat the skillet over medium-high until very hot. Cook one naan at a time: when big bubbles form, about 1 minute, flip it, cover the pan, and cook 1 minute more, until charred in spots.',
           'Brush with butter (stir the garlic into the butter for garlic naan) and keep them wrapped in a towel.'],
    stages=[st('Mix and knead the dough', active=10, wait=90), st('Roll and cook', active=25, station='stove')],
    plan=ROLL_PLAN, keeps=['Counter: wrapped, about 3 days (NDSU’s figure for bread).', 'Freezer: with parchment between them, up to 3 months; warm in a skillet.'],
    scaling='Each naan is an eighth of the dough.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='lavash', name='Flatbread (lavash)', emoji='🫓', kind='scratch', group='Flatbreads and tortillas',
    summary='An unleavened dough rolled paper-thin: soft from a skillet for wraps, crisp from the oven for crackers.',
    makes=[], yield_='8 large thin flatbreads.',
    batch={'step': 0.25, 'min': 0.5},
    ingredients=[I('flour', 250, 'g'), I('salt', 4, 'g'), I('olive-oil', 2, 'tbsp'), I('water', 0.6667, 'cup', 'warm')],
    equipment=['bowl', 'rolling pin', 'large skillet or baking sheets'],
    steps=['Mix the flour and salt, add the oil and water, and knead 5 minutes until smooth. Cover and rest 30 minutes.',
           'Divide into 8 pieces and roll each as thin as you can, about 10 inches across.',
           'Soft: cook in a hot dry skillet about 1 minute per side, until bubbled with a few brown spots; stack in a towel.',
           'Crisp: bake on a sheet at 400°F 5 to 8 minutes, sprinkled with sesame seeds or salt, until browned; break into crackers.'],
    stages=[st('Mix and rest', active=10, wait=30), st('Roll and cook', active=25, station='stove')],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the bag.'},
    keeps=['Soft: in a bag, about 3 days (NDSU’s figure for bread); freeze for longer.', 'Crisp: airtight; crispest within a week or two.'],
    scaling='Each flatbread is an eighth of the dough.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

# ------------------------------------------------------------------ quick breads
R.append(dict(
    id='cornbread', name='Cornbread', emoji='🌽', kind='scratch', group='Quick breads',
    summary='Cornmeal and flour, lightly sweet, baked in a hot pan in about half an hour.',
    makes=[], yield_='One 8-inch square pan (or 9-inch skillet), 9 pieces.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('cornmeal', 1, 'cup'), I('flour', 125, 'g'), I('sugar', 25, 'g', 'up to 50 g for sweeter'), I('baking-powder', 12, 'g'), I('salt', 3, 'g'),
                 I('whole-milk', 1, 'cup'), I('eggs', 1, 'each'), I('butter', 57, 'g', 'melted, or vegetable oil')],
    equipment=['bowl', '8-inch square pan or 9-inch cast-iron skillet'],
    steps=['Heat the oven to 400°F. Grease the pan (for a crisp crust, heat a greased skillet in the oven).',
           'Whisk the cornmeal, flour, sugar, baking powder and salt. Whisk the milk, egg and melted butter separately, then stir them into the dry mix just until combined.',
           'Pour into the pan and bake 20 to 25 minutes, until golden and a toothpick in the middle comes out clean. Cool 10 minutes.'],
    stages=[st('Mix', active=10), st('Bake at 400°F', cook=22, station='oven', temp=400), st('Cool', wait=10)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw wrapped, then warm in a 350°F oven.'}, keeps=QUICK_KEEPS,
    scaling='Double it in a 9 × 13 pan; bake 25 to 30 minutes.', old_way=None, safety=[FLOUR_SAFETY], notes=['Garden flint or dent corn ground to meal works here.'],
    nutrition={'from': 'ingredients'}, src=QUICK_SRC))

R.append(dict(
    id='irish-soda-bread', name='Irish soda bread', emoji='🍞', kind='scratch', group='Quick breads',
    summary='Four ingredients, no yeast: baking soda and buttermilk raise a round loaf in under an hour.',
    makes=[], yield_='One round loaf, about 1½ lb.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 500, 'g'), I('baking-soda', 1, 'tsp'), I('salt', 6, 'g'), I('buttermilk', 1.75, 'cup', 'plus a little more if dry')],
    equipment=['bowl', 'baking sheet or cast-iron skillet'],
    steps=['Heat the oven to 425°F and flour a baking sheet.',
           'Whisk the flour, baking soda and salt. Pour in the buttermilk and stir with your hand or a spoon just until a soft, shaggy dough forms; don’t knead it.',
           'Turn it out, shape it gently into a round about 2 inches high, and cut a deep cross in the top.',
           'Bake 35 to 40 minutes, until browned and hollow-sounding underneath. Wrap in a towel for a soft crust, or cool on a rack for a crisp one.'],
    stages=[st('Mix and shape', active=10), st('Bake at 425°F', cook=38, station='oven', temp=425), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 2, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw wrapped; toast slices.'},
    keeps=['Counter: wrapped, best within 2 days; it stales faster than yeast bread.', QUICK_KEEPS[1]],
    scaling='The buttermilk’s acid is what makes the baking soda work: use real buttermilk or the buttermilk stand-in, not plain milk.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=QUICK_SRC))

R.append(dict(
    id='banana-bread', name='Banana bread', emoji='🍌', kind='scratch', group='Quick breads',
    summary='Very ripe bananas, butter and a little brown sugar in a moist loaf.',
    makes=[], yield_='One 9 × 5-inch loaf, about 10 slices.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('banana', 3, 'each', 'very ripe, mashed (about 1⅓ cups)'), I('butter', 76, 'g', 'melted'), I('brown-sugar', 0.6667, 'cup', 'packed'), I('eggs', 2, 'each'), I('vanilla', 1, 'tsp'),
                 I('flour', 190, 'g'), I('baking-soda', 1, 'tsp'), I('salt', 3, 'g'), I('cinnamon', 0.5, 'tsp', '', True), I('walnuts', 0.5, 'cup', 'chopped', True)],
    equipment=['bowl', '9 × 5-inch loaf pan'],
    steps=['Heat the oven to 350°F and grease the pan.',
           'Mash the bananas in a bowl, then stir in the melted butter, brown sugar, eggs and vanilla.',
           'Sprinkle the baking soda, salt and cinnamon over the top and stir, then stir in the flour (and nuts) just until no dry flour shows.',
           'Bake 55 to 65 minutes, until a toothpick in the middle comes out clean. Cool 15 minutes in the pan, then on a rack.'],
    stages=[st('Mix', active=15), st('Bake at 350°F', cook=60, station='oven', temp=350), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the wrapping, 1 to 2 hours.'}, keeps=QUICK_KEEPS,
    scaling='Double it for two pans. The darker the bananas, the sweeter the bread.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=QUICK_SRC))

R.append(dict(
    id='zucchini-bread', name='Zucchini bread', emoji='🥒', kind='scratch', group='Quick breads',
    summary='A spiced quick bread that uses up a big garden zucchini.',
    makes=[], yield_='One 9 × 5-inch loaf, about 10 slices.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('zucchini', 1, 'each', 'medium, grated (about 1½ cups), not peeled'), I('vegetable-oil', 0.5, 'cup'), I('sugar', 150, 'g'), I('eggs', 2, 'each'), I('vanilla', 1, 'tsp'),
                 I('flour', 190, 'g'), I('baking-soda', 1, 'tsp'), I('baking-powder', 0.5, 'tsp'), I('salt', 3, 'g'), I('cinnamon', 1, 'tsp'), I('walnuts', 0.5, 'cup', 'chopped', True)],
    equipment=['box grater', 'bowl', '9 × 5-inch loaf pan'],
    steps=['Heat the oven to 350°F and grease the pan. Grate the zucchini; there’s no need to squeeze it.',
           'Whisk the oil, sugar, eggs and vanilla. Stir in the zucchini.',
           'Sprinkle the baking soda, baking powder, salt and cinnamon over the top and stir, then stir in the flour (and nuts) just until combined.',
           'Bake 50 to 60 minutes, until a toothpick in the middle comes out clean. Cool 15 minutes in the pan, then on a rack.'],
    stages=[st('Grate and mix', active=15), st('Bake at 350°F', cook=55, station='oven', temp=350), st('Cool', wait=30, bg=True)],
    plan={'keep_days': 3, 'freeze': True, 'lead_days': 0, 'thaw': 'Thaw in the wrapping, 1 to 2 hours.'}, keeps=QUICK_KEEPS,
    scaling='A big garden zucchini makes several loaves: about 1½ cups grated per loaf.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=QUICK_SRC))

# ------------------------------------------------------------------ boiled breads
R.append(dict(
    id='soft-pretzels', name='Soft pretzels (twists, bites and buns)', emoji='🥨', kind='scratch', group='Boiled breads: pretzels and bagels',
    summary='A firm dough shaped into twists, bites or buns, dipped in a hot baking-soda bath and baked deep brown.',
    makes=[{'item': 'soft-pretzels', 'by': 'each', 'n': 8, 'label': 'large pretzels'},
           {'item': 'pretzel-rolls', 'by': 'each', 'n': 8, 'label': 'pretzel buns'}],
    yield_='8 large twisted pretzels, 8 pretzel buns, or about 64 bites.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('flour', 500, 'g', 'or bread flour'), I('yeast', 7, 'g'), I('salt', 7, 'g'), I('brown-sugar', 1, 'tbsp'), I('butter', 28, 'g', 'melted'), I('water', 1.25, 'cup', 'about 110°F'),
                 I('baking-soda', 0.5, 'cup', 'for the bath: bake it first for a darker crust (see the steps)', eaten=False, fixed=True), I('water', 8, 'cup', 'for the bath', eaten=False, fixed=True), I('kosher-salt', 1, 'tbsp', 'coarse, for topping')],
    equipment=['large bowl', 'baking sheet (for baking the soda)', 'wide stainless-steel or enameled pot (not aluminum)', 'slotted spoon or spider', '2 baking sheets lined with parchment', 'kitchen gloves (for handling baked baking soda)'],
    steps=['For a darker, more traditional crust, bake the baking soda first (you can do this days ahead): spread the ½ cup on a parchment-lined baking sheet and bake at 250°F for 1 hour. Heat turns baking soda into washing soda (sodium carbonate), which is more alkaline; fully changed, it weighs about a third less. Let it cool, then store it in a closed jar labeled “baked baking soda: not for eating”, out of children’s reach. Plain baking soda works too, with a lighter crust.',
           'Dough: stir the yeast and brown sugar into the warm water and let it stand 5 minutes. Add the butter, salt and flour and knead 8 minutes into a smooth, firm dough.',
           'Cover and let it rise until doubled, about 1 hour.',
           'Shape. Twists: divide into 8, roll each into a 24-inch rope, make a U, cross the ends twice, and press them onto the bottom of the U. Buns: 8 tight balls. Bites: roll ropes and cut into 1-inch pieces.',
           'Set them on the parchment-lined sheets and refrigerate, uncovered, 15 to 20 minutes; firm dough holds its shape in the bath. Heat the oven to 425°F.',
           'Bath: in the stainless pot, bring the 8 cups of water to a simmer and stir in ¼ cup of baked baking soda (or ½ cup plain baking soda) a little at a time; it foams. Keep it at a gentle simmer.',
           'Dip 2 or 3 at a time for 20 to 30 seconds (buns 30 seconds a side), lift out with the slotted spoon, drain, and set back on the parchment. Keep children away from the hot pot.',
           'Sprinkle with coarse salt. Slash the buns across the top. Bake twists 12 to 15 minutes, bites 10 to 12, buns 18 to 20, until deep brown.',
           'Let the bath cool, then pour it down the drain with running water.'],
    stages=[st('Mix and knead the dough', active=15, wait=60), st('Shape and chill', active=20, wait=20, station='fridge'), st('Dip in the soda bath', active=15, station='stove'),
            st('Bake at 425°F', cook=14, station='oven', temp=425), st('Cool', wait=10)],
    plan={'keep_days': 1, 'freeze': True, 'lead_days': 0, 'thaw': 'Warm frozen pretzels in a 350°F oven 5 to 10 minutes.'},
    keeps=['Counter: best the day they’re baked; uncovered or in a paper bag for a day (salt draws moisture in a closed bag).', 'Freezer: freeze them baked and unsalted, up to 3 months (University of Missouri’s time for baked yeast bread); add salt after warming.'],
    scaling='Each pretzel or bun is an eighth of the dough (about 105 g). The bath doesn’t scale with the dough: 8 cups of water does a full batch or a half.',
    old_way='Southern German bakers dip pretzels and rolls in a weak solution of food-grade lye (sodium hydroxide), which makes the glossy, mahogany crust. Lye is caustic: it burns skin and eyes and attacks aluminum (CDC/NIOSH). Because it needs gloves, eye protection and careful measuring of a hazardous chemical, we describe it here as history only and use baked baking soda at home, which bakers also use in place of lye (Wikipedia).',
    safety=['Don’t taste baked baking soda or the bath, and keep both away from children; store the baked soda in a labeled jar.', FLOUR_SAFETY],
    notes=['The alkaline bath is what browns the crust and gives the pretzel flavor; without it you get a breadstick.', 'The nutrition numbers leave out the bath, which is poured away.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC + ['wiki-bicarbonate', 'wiki-carbonate', 'wiki-lyeroll', 'niosh-naoh']))

R.append(dict(
    id='bagels', name='Bagels', emoji='🥯', kind='scratch', group='Boiled breads: pretzels and bagels',
    summary='A stiff dough shaped into rings, boiled a minute a side, then baked for a chewy crust.',
    makes=[{'item': 'bagels', 'by': 'each', 'n': 8, 'label': 'bagels'}],
    yield_='8 bagels.',
    batch={'step': 0.125, 'min': 0.25},
    ingredients=[I('bread-flour', 500, 'g'), I('yeast', 7, 'g'), I('salt', 10, 'g'), I('honey', 1, 'tbsp', 'plus 1 tablespoon for the water'), I('water', 1.25, 'cup', 'about 100°F'),
                 I('sesame-seeds', 2, 'tbsp', 'or other toppings', True)],
    equipment=['bowl or stand mixer', 'large wide pot', 'slotted spoon', 'baking sheet with parchment'],
    steps=['Stir the yeast and honey into the warm water. Add the flour and salt and knead 10 minutes; the dough is stiff and smooth.',
           'Cover and let it rise until about 1½ times bigger, about 1 hour.',
           'Divide into 8 pieces (about 100 g). Roll each into a 9-inch rope, wrap it around your hand so the ends overlap under your palm, and roll the overlap on the counter to seal. Set them on parchment.',
           'Cover and rest 20 to 30 minutes, until they float when dropped in a bowl of water. (Or refrigerate overnight for more flavor; boil them straight from the fridge.) Heat the oven to 425°F.',
           'Bring a large pot of water to a boil with 1 tablespoon honey. Boil 2 or 3 bagels at a time, 1 minute per side (2 minutes for chewier bagels). Lift out, drain, and add toppings while wet.',
           'Bake 18 to 22 minutes, until deep golden. Cool on a rack at least 20 minutes.'],
    stages=[st('Mix and knead the dough', active=15, wait=60), st('Shape the bagels', active=20, wait=25), st('Boil', active=15, station='stove'),
            st('Bake at 425°F', cook=20, station='oven', temp=425), st('Cool', wait=20, bg=True)],
    plan=ROLL_PLAN, keeps=['Counter: in a paper or plastic bag, about 3 days (NDSU’s figure for bread).', 'Freezer: slice them first, bag them, up to 3 months (University of Missouri); toast from frozen.'],
    scaling='Each bagel is an eighth of the dough. Bakeries use barley malt syrup in the water and dough; honey or brown sugar is the home stand-in.', old_way=None, safety=[FLOUR_SAFETY], notes=[],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

# ------------------------------------------------------------------ pastry and crackers
R.append(dict(
    id='croissants', name='Croissants', emoji='🥐', kind='scratch', group='Pastry and crackers',
    summary='A yeast dough folded around a slab of butter three times for flaky layers. A weekend project.',
    makes=[{'item': 'croissants', 'by': 'each', 'n': 12, 'label': 'croissants'}],
    yield_='12 croissants.',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 500, 'g', 'or bread flour'), I('yeast', 10, 'g'), I('salt', 10, 'g'), I('sugar', 50, 'g'), I('whole-milk', 275, 'g', 'cold (about 1⅛ cups)'),
                 I('butter', 310, 'g', '30 g softened for the dough, 280 g cold for the butter block (use unsalted if you have it)'), I('eggs', 1, 'each', 'for brushing')],
    equipment=['stand mixer or bowl', 'rolling pin', 'ruler', 'parchment', '2 baking sheets', 'pastry brush'],
    steps=['Day 1, evening: mix the flour, yeast, salt, sugar, milk and 30 g soft butter into a smooth dough, about 5 minutes. Pat it into a rectangle, wrap it, and refrigerate overnight.',
           'Day 2: pound and roll the 280 g of cold butter between parchment into a 7-inch square; refrigerate until firm but bendable.',
           'Roll the dough to a 10-inch square, set the butter on it like a diamond, fold the corners over it, and pinch the seams to seal.',
           'Roll it into an 8 × 24-inch strip, fold it in thirds like a letter, wrap, and chill 30 minutes. Do this twice more (three folds in all), chilling 30 minutes after each. If butter breaks through or gets soft, chill longer.',
           'Chill 1 hour, then roll to a 10 × 24-inch rectangle about ¼ inch thick. Cut 12 long triangles (about 4 inches at the base).',
           'Cut a ½-inch notch in the middle of each base, roll each up from the base to the tip, and set them tip-down on the sheets, curved if you like.',
           'Cover loosely and let them rise at cool room temperature (below about 78°F, so the butter stays solid) until puffy and wobbly, 1½ to 2½ hours.',
           'Heat the oven to 400°F. Brush with beaten egg and bake 18 to 22 minutes, until deep golden brown. Cool 20 minutes.'],
    stages=[st('Mix the dough; chill overnight', active=15, wait=600, station='fridge', before=True), st('Make the butter block and lock it in', active=20, wait=20, station='fridge'),
            st('Three folds, chilling 30 minutes after each', active=30, wait=150, station='fridge'), st('Roll, cut and shape', active=30, wait=120),
            st('Bake at 400°F', active=3, cook=20, station='oven', temp=400), st('Cool', wait=20)],
    plan={'keep_days': 1, 'freeze': True, 'lead_days': 0, 'thaw': 'Warm frozen baked croissants in a 350°F oven 8 to 10 minutes.'},
    keeps=['Counter: best the day they’re baked; in a paper bag up to 2 days, recrisped in the oven.', 'Freezer: baked, up to 3 months (University of Missouri’s time for baked yeast bread). Shaped, unbaked croissants can be frozen up to about 1 month (NDSU’s time for unbaked rolls); thaw and rise them overnight in the refrigerator, then let them finish rising before baking.'],
    scaling='About 2 hours of work over 2 days. Keep the butter block 56% of the flour’s weight. A cool kitchen is the main trick: stop and chill whenever the butter softens.',
    old_way=None, safety=[FLOUR_SAFETY], notes=['Roll in one direction and keep the edges square; the layers come from the folds, so neat folds bake into neat layers.'],
    nutrition={'from': 'ingredients'}, src=BREAD_SRC))

R.append(dict(
    id='crackers', name='Crisp crackers', emoji='🍘', kind='scratch', group='Pastry and crackers',
    summary='Half whole-wheat flour, olive oil and salt, rolled thin and baked crisp.',
    makes=[{'item': 'whole-grain-crackers', 'by': 'g', 'n': 300, 'label': 'g of crackers'}],
    yield_='About 10 oz of crackers (about 60 two-inch squares).',
    batch={'step': 0.5, 'min': 0.5},
    ingredients=[I('flour', 125, 'g'), I('whole-wheat-flour', 125, 'g'), I('salt', 3, 'g'), I('olive-oil', 3, 'tbsp'), I('water', 0.625, 'cup'), I('kosher-salt', 0.5, 'tsp', 'for sprinkling', True),
                 I('sesame-seeds', 1, 'tbsp', '', True)],
    equipment=['bowl', 'rolling pin', 'pizza cutter', '2 baking sheets', 'fork'],
    steps=['Heat the oven to 400°F. Mix the flours and salt, add the oil and water, and knead briefly into a smooth, firm dough. Rest 10 minutes.',
           'Divide in half. Roll each half on parchment as thin as you can, about 1/16 inch. Slide the parchment onto a baking sheet.',
           'Prick all over with a fork, cut into 2-inch squares with the pizza cutter (no need to separate them), and sprinkle with coarse salt and seeds.',
           'Bake 12 to 16 minutes, until browned and crisp; edges brown first, so take those off early if needed. Cool on the pan, then break apart.'],
    stages=[st('Mix and rest', active=10, wait=10), st('Roll and cut', active=15), st('Bake at 400°F', cook=14, station='oven', temp=400), st('Cool', wait=15)],
    plan={'keep_days': 14, 'freeze': False, 'lead_days': 0, 'thaw': ''},
    keeps=['Pantry: airtight once completely cool. NDSU gives opened crackers about 1 month; homemade ones are crispest within the first week or two.'],
    scaling='Thinner dough makes crisper crackers; thick spots stay soft, so roll evenly.', old_way=None, safety=[FLOUR_SAFETY], notes=['Discard from a sourdough starter can replace up to half the water and some flour.'],
    nutrition={'from': 'ingredients'}, src=['ndsu-fn579', 'fda-flour']))

GROUPS = ['Yeast breads', 'Enriched breads', 'Sourdough', 'Flatbreads and tortillas', 'Quick breads', 'Boiled breads: pretzels and bagels', 'Pastry and crackers',
          'Pasta and noodles', 'Dairy', 'Stocks and sauces', 'Dressings and spreads', 'Pantry mixes', 'Seasonings and stand-ins', 'Beans']
FIRST = ['sandwich-bread', 'whole-wheat-sandwich-bread', 'whole-wheat-bread']  # the all whole-wheat loaf is the one the planner makes for whole-wheat bread
R.sort(key=lambda r: (GROUPS.index(r['group']), FIRST.index(r['id']) if r['id'] in FIRST else len(FIRST)))

OMITTED = [
    {'name': 'Sour cream and crème fraîche', 'why': 'The home methods we found culture cream at room temperature for many hours. The one extension method (University of Kentucky) gives no storage time, and the popular “cream plus buttermilk on the counter” method has no tested food-safety guidance behind it, so we left both out.', 'src': ['uky-cultured']},
    {'name': 'Home-canned anything', 'why': 'Canning is safe only with tested recipes and times. For canned tomatoes, sauce, salsa, pickles and applesauce, use the National Center for Home Food Preservation’s recipes.', 'src': ['nchfp']},
]


# ------------------------------------------------------------------ build
def frac(x):
    return x


def main():
    catalog = {i['id']: i for i in json.load(open(os.path.join(SITE, 'data/meals/catalog.json')))['items']}
    meta = json.load(open(os.path.join(SITE, 'data/meals/meta.json')))
    MASS, VOL = meta['units']['mass'], meta['units']['volume']
    usda = usda_values({r['nutrition']['fdc'] for r in R if r['nutrition'].get('from') == 'usda'})
    out = []
    for r in R:
        r = dict(r)
        r['yield'] = r.pop('yield_')
        act = sum(s.get('active', 0) for s in r['stages'])
        tot = sum(s.get('active', 0) + s.get('cook', 0) + s.get('wait', 0) for s in r['stages'])
        r['times'] = {'active': act, 'total': tot}
        for i in r['ingredients']:
            it = catalog[i['item']]
            u = i['unit']
            if not (u in MASS or (u in VOL and it.get('g_per_cup')) or u in (it.get('counts') or {})):
                raise SystemExit(f"{r['id']}: {i['amount']} {u} of {i['item']} is not convertible")
        for m in r['makes']:
            it = catalog[m['item']]
            u = m['by']
            if not (u in MASS or (u in VOL and it.get('g_per_cup')) or u in (it.get('counts') or {})):
                raise SystemExit(f"{r['id']}: makes {m['item']} by {u} not convertible")
        if r['nutrition'].get('from') == 'usda':
            r['nutrition'] = dict(r['nutrition'], per100=usda[r['nutrition']['fdc']]['nutrition'], description=usda[r['nutrition']['fdc']]['description'])
        out.append(r)
    srcs = [{'id': a, 'title': b, 'publisher': c, 'url': d, 'accessed': ACCESSED} for a, b, c, d in SOURCES]
    used = {s for r in out for s in r['src']} | {s for o in OMITTED for s in o['src']}
    srcs = [s for s in srcs if s['id'] in used]
    data = {'version': 1, 'updated': ACCESSED,
            'note': 'From-scratch recipes for /meal-prep/scratch/. Edit scripts/meals/src/build_scratch.py, not this file.',
            'sources': srcs, 'omitted': OMITTED, 'recipes': out}
    with open(os.path.join(SITE, 'data/meals/scratch.json'), 'w') as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(f'scratch.json: {len(out)} recipes, {len(srcs)} sources')
    build_garden_map(catalog)


def usda_values(ids):
    """Nutrition per 100 g for USDA SR Legacy foods, using scripts/meals/fetch-nutrition.py's own reader."""
    if not ids:
        return {}
    import importlib.util
    spec = importlib.util.spec_from_file_location('fetchn', os.path.join(SITE, 'scripts/meals/fetch-nutrition.py'))
    fn = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fn)
    zp = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'trb-fdc-cache', os.path.basename(fn.SR_ZIP_URL))
    old = os.path.join(SITE, 'data/meals/scratch.json')
    if not os.path.exists(zp) and os.path.exists(old):  # keep values already fetched
        prev = {r['nutrition']['fdc']: {'description': r['nutrition']['description'], 'nutrition': r['nutrition']['per100']}
                for r in json.load(open(old))['recipes'] if r['nutrition'].get('from') == 'usda'}
        if ids <= set(prev):
            return prev
    foods = fn.load_bulk(zp if os.path.exists(zp) else None, os.path.dirname(zp))
    return {i: {'description': foods[i]['description'], 'nutrition': fn.to_nutrition(foods[i], i, 'id')} for i in ids}


# ------------------------------------------------------------------ garden map
# item -> crop key in data/garden/crops.json (or an animal), the part used, and f = grams of harvest per gram of
# the catalog item (canned crushed tomatoes: NCHFP's 2¾ lb of fresh tomatoes per quart; canned beans: 1 lb dry
# makes about four 15-oz cans).
GMAP = [
    ('tomato', 'tomatoes', 'ripe fruit', 1, ''), ('roma-tomato', 'tomatoes', 'ripe fruit (paste types)', 1, ''), ('cherry-tomatoes', 'cherry_tomatoes', 'ripe fruit', 1, ''),
    ('crushed-tomatoes', 'tomatoes', 'ripe fruit, cooked down and canned', round(2.75 * 453.592 / (4 * 242), 3), 'NCHFP: about 2¾ lb of fresh tomatoes per quart of crushed tomatoes.'),
    ('diced-tomatoes', 'tomatoes', 'ripe fruit, canned', round(2.75 * 453.592 / (4 * 240), 3), 'Counted like crushed tomatoes (NCHFP: about 2¾ lb per quart).'),
    ('russet-potato', 'potatoes', 'tubers', 1, ''), ('yukon-potato', 'potatoes', 'tubers', 1, ''), ('red-potato', 'potatoes', 'tubers', 1, ''), ('baby-potatoes', 'potatoes', 'young tubers', 1, ''),
    ('sweet-potato', 'sweet_potatoes', 'storage roots', 1, ''), ('carrot', 'carrots', 'roots', 1, ''), ('baby-carrots', 'carrots', 'roots', 1, ''),
    ('beets', 'beets', 'roots', 1, ''), ('parsnips', 'parsnips', 'roots', 1, ''), ('turnips', 'turnips_rutabaga', 'roots', 1, ''),
    ('onion', 'onions', 'cured bulbs', 1, ''), ('red-onion', 'onions', 'cured bulbs', 1, ''), ('sweet-onion', 'onions', 'cured bulbs', 1, ''), ('shallot', 'onions', 'bulbs', 1, ''),
    ('garlic', 'garlic', 'cured bulbs', 1, ''),
    ('butternut-squash', 'winter_squash', 'mature fruit', 1, ''), ('acorn-squash', 'winter_squash', 'mature fruit', 1, ''), ('spaghetti-squash', 'winter_squash', 'mature fruit', 1, ''),
    ('pumpkin', 'pumpkins', 'mature fruit', 1, ''), ('zucchini', 'summer_squash', 'young fruit', 1, ''), ('yellow-squash', 'summer_squash', 'young fruit', 1, ''),
    ('dried-black-beans', 'dry_beans', 'dry seeds', 1, ''), ('dried-pinto-beans', 'dry_beans', 'dry seeds', 1, ''), ('dried-kidney-beans', 'dry_beans', 'dry seeds', 1, ''),
    ('black-beans', 'dry_beans', 'dry seeds, cooked', round(453.592 / (4 * 425), 3), '1 lb of dry beans makes about four 15-oz cans.'),
    ('pinto-beans', 'dry_beans', 'dry seeds, cooked', round(453.592 / (4 * 425), 3), '1 lb of dry beans makes about four 15-oz cans.'),
    ('kidney-beans', 'dry_beans', 'dry seeds, cooked', round(453.592 / (4 * 425), 3), '1 lb of dry beans makes about four 15-oz cans.'),
    ('green-beans', 'snap_beans', 'young pods', 1, ''), ('snap-peas', 'peas', 'pods', 1, ''), ('frozen-peas', 'peas', 'shelled peas', 1, 'Frozen peas are shelled garden peas.'),
    ('corn-on-cob', 'sweet_corn', 'ears', 1, ''), ('frozen-corn', 'sweet_corn', 'kernels', round(1 / 0.36, 3), 'Kernels are roughly a third of an ear’s weight.'),
    ('cornmeal', 'flint_dent_corn', 'dry kernels, ground', 1, ''),
    ('green-bell-pepper', 'peppers', 'fruit', 1, ''), ('red-bell-pepper', 'peppers', 'fruit', 1, ''), ('yellow-bell-pepper', 'peppers', 'fruit', 1, ''), ('jalapeno', 'peppers', 'fruit', 1, ''), ('poblano', 'peppers', 'fruit', 1, ''),
    ('eggplant', 'eggplant', 'fruit', 1, ''), ('cucumber', 'cucumbers', 'young fruit', 1, ''),
    ('kale', 'kale', 'leaves', 1, ''), ('collards', 'collards', 'leaves', 1, ''), ('swiss-chard', 'swiss_chard', 'leaves and stems', 1, ''), ('spinach', 'spinach', 'leaves', 1, ''),
    ('romaine', 'lettuce', 'leaves', 1, ''), ('iceberg', 'lettuce', 'heads', 1, ''), ('green-leaf-lettuce', 'lettuce', 'leaves', 1, ''), ('salad-mix', 'lettuce', 'young leaves', 1, ''),
    ('cabbage', 'cabbage', 'heads', 1, ''), ('red-cabbage', 'cabbage', 'heads', 1, ''), ('coleslaw-mix', 'cabbage', 'shredded heads', 1, ''),
    ('broccoli', 'broccoli', 'heads and side shoots', 1, ''), ('radishes', 'radishes', 'roots', 1, ''),
    ('basil', 'culinary_herbs', 'leaves', 1, ''), ('parsley', 'culinary_herbs', 'leaves', 1, ''), ('cilantro', 'culinary_herbs', 'leaves', 1, ''), ('thyme', 'culinary_herbs', 'sprigs', 1, ''),
    ('chives', 'culinary_herbs', 'leaves', 1, ''), ('dill', 'culinary_herbs', 'fronds', 1, ''), ('mint', 'culinary_herbs', 'leaves', 1, ''),
    ('strawberries', 'strawberries', 'fruit', 1, ''), ('blueberries', 'blueberries', 'fruit', 1, ''), ('raspberries', 'raspberries_blackberries', 'fruit', 1, ''),
    ('grapes', 'grapes', 'fruit', 1, ''), ('asparagus', 'asparagus', 'spears', 1, ''), ('cantaloupe', 'cantaloupe', 'fruit', 1, ''), ('watermelon', 'watermelon', 'fruit', 1, ''),
    ('apple', 'apple', 'fruit', 1, ''), ('applesauce', 'apple', 'fruit, cooked down', round(3 * 453.592 / (4 * 244), 3), 'NCHFP: about 3 lb of apples per quart of applesauce.'),
    ('pear', 'pear', 'fruit', 1, ''), ('peach', 'peach', 'fruit', 1, ''), ('plum', 'plum_cherry', 'fruit', 1, ''), ('cherries', 'plum_cherry', 'fruit', 1, ''),
    ('lemon', 'citrus', 'fruit', 1, ''), ('lime', 'citrus', 'fruit', 1, ''), ('orange', 'citrus', 'fruit', 1, ''), ('clementine', 'citrus', 'fruit', 1, ''),
    ('avocado', 'avocado', 'fruit', 1, ''), ('pecans', 'pecan', 'nut kernels', 1, ''), ('hazelnuts', 'hazelnut', 'nut kernels', 1, ''),
    ('eggs', 'hens', 'eggs', 1, ''), ('pasteurized-eggs', None, '', 0, ''), ('honey', 'bees', 'honey', 1, ''),
]
# months a crop keeps in storage after its harvest, read from the storage note in data/garden/crops.json
# (University of Minnesota Extension and others); 0 = eat it fresh
STORE = {'potatoes': 6, 'sweet_potatoes': 4, 'carrots': 8, 'beets': 5, 'parsnips': 4, 'turnips_rutabaga': 4, 'onions': 4, 'winter_squash': 2, 'pumpkins': 2,
         'cabbage': 5, 'dry_beans': 12, 'radishes': 1}
STORE_NOTE = {'sweet_potatoes': 'The storage note doesn’t give months; we count 4, the low end for cured sweet potatoes kept at 55 to 60°F.',
              'dry_beans': 'The storage note says dry beans keep several years; we count 12 months.', 'flint_dent_corn': 'The storage note gives no time for dried corn, so stored corn isn’t counted.',
              'garlic': 'Cured garlic keeps for months; the storage note doesn’t give a number, so we don’t count stored garlic.'}
EXAMPLE_FROST = (105, 288)  # April 15 and October 15, the garden planner's example frost dates (day of year)


def doy_month(d):
    import datetime
    d = int(round(d))
    while d > 365: d -= 365
    while d < 1: d += 365
    return (datetime.date(2025, 1, 1) + datetime.timedelta(days=d - 1)).month


def harvest_months(c, v):
    """The garden planner's planting-calendar math (static/garden/viz/model.js cropCal) with its example frost dates."""
    if not v or not v.get('pw') or not c.get('dh') or c['dh'][0] is None:
        return []
    L, F = EXAMPLE_FROST
    tender = c.get('fr') == 'tender'
    pw = v['pw']; dh = c['dh']; d1 = dh[1] if dh[1] is not None else dh[0]
    p0, p1 = L + 7 * pw[0], L + 7 * pw[1]; pm = (p0 + p1) / 2
    h0, h1 = pm + dh[0], pm + d1
    if v.get('hv') == 'pick': h1 = max(h1, F)
    if tender: h1 = min(h1, F)
    wins = [(h0, h1)] if h1 > h0 else []
    if v.get('fall') or v.get('fd'):
        tf = 14 if tender else 0
        if v.get('fd'):
            f0, f1 = F - v['fd'][0], F - v['fd'][1]
            fall = (max(f0, p0), f1) if f1 > p0 else None
        else:
            f0, f1 = F - 14 - tf - d1, F - 14 - tf - dh[0]
            fall = (max(f0, p1 + 14), f1) if f1 > p1 + 14 else None
        if fall:
            wins.append((fall[0] + dh[0], F))
    ms = set()
    for a, b in wins:
        d = a
        while d <= b:
            ms.add(doy_month(d)); d += 7
        ms.add(doy_month(b))
    return sorted(ms)


def build_garden_map(catalog):
    crops = {c['k']: c for c in json.load(open(os.path.join(SITE, 'data/garden/crops.json')))['crops']}
    viz = json.load(open(os.path.join(SITE, 'data/garden/viz.json')))['crops']
    items, used = [], {}
    for iid, crop, part, f, note in GMAP:
        if crop is None:
            continue
        assert iid in catalog, iid
        e = {'item': iid, 'part': part, 'f': f}
        if crop in ('hens', 'bees'): e['animal'] = crop
        else:
            assert crop in crops, crop
            e['crop'] = crop
            used[crop] = 1
        if note: e['note'] = note
        items.append(e)
    cdef = {}
    for k in used:
        c = crops[k]
        cdef[k] = {'months': harvest_months(c, viz.get(k)), 'store_months': STORE.get(k, 0), 'store_note': STORE_NOTE.get(k, ''), 'sto': c.get('sto') or ''}
    data = {'version': 1, 'updated': ACCESSED,
            'note': 'Which catalog items the Food Garden Planner (data/garden) can supply. f = grams of harvest per gram of the item. months = example harvest months from the garden planner\'s own calendar math and its example frost dates (April 15 and October 15); store_months = months it keeps after harvest, from the storage notes in data/garden/crops.json. Edit scripts/meals/src/build_scratch.py, not this file.',
            'example_frost': ['04-15', '10-15'],
            'crops': cdef,
            'animals': {'hens': {'months': list(range(1, 13)), 'store_months': 1, 'note': 'Hens lay all year, fewer in winter. Fresh eggs keep 3 to 5 weeks in the refrigerator (USDA).'},
                        'bees': {'months': [], 'store_months': 24, 'note': 'Honey keeps about 2 years (NDSU), so once you harvest, it can cover the whole year. Little or no honey the first year.'}},
            'items': items}
    with open(os.path.join(SITE, 'data/meals/garden-map.json'), 'w') as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(f'garden-map.json: {len(items)} items, {len(cdef)} crops')


if __name__ == '__main__':
    main()
