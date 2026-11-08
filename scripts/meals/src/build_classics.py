#!/usr/bin/env python3
"""Builds two recipe files for /meal-prep/ from this script:

  data/meals/recipes/classics.json   "From the great kitchens": our own adaptations of public-domain recipes by
                                     Escoffier (Savoy and Carlton, London), Ranhofer (Delmonico's, New York),
                                     Tschirky (the Waldorf, New York) and Hirtzler (Hotel St. Francis, San Francisco)
  data/meals/recipes/smores.json     S'mores from scratch (uses the from-scratch marshmallows, chocolate and graham
                                     crackers in data/meals/scratch.json)

Run:  python3 scripts/meals/src/build_classics.py [site_dir]      (build the catalog first)
Then: node scripts/meals/check-data.js

Ingredient lines and the recipe fields are the ones build_recipes.py uses (see recipes_a.py). Each classic also
carries `origin`, shown on its recipe page and on /meal-prep/classics/:
  kitchen  key into KITCHENS (chef, restaurant, book, edition, status of the text, scan links)
  ref      where in the book (recipe number and page)
  title    the dish's name in the book
  excerpt  a short quotation of the original (public domain), spelling as printed; None when the book has none
  story    the origin story, told neutrally, with disputes noted
  changes  what we changed and why
  links    extra reading [(label, url)]
Only well-established facts. None of these kitchens held Michelin stars: the Guide's first stars came in 1926 and the
one-to-three-star scale in 1931, after Escoffier's London years and after Delmonico's closed.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

T_EGG_SAUCE = ('egg-yolk sauces', 160, 0)
T_POULTRY = ('chicken', 165, 0)
T_FISH = ('fish', 145, 0)
T_WHOLE_CUT = ('beef steaks', 145, 3)
T_LEFTOVERS = ('leftovers, reheated', 165, 0)

ESC_IA = 'https://archive.org/details/cu31924000610117'
KITCHENS = {
    'escoffier': {
        'chef': 'Auguste Escoffier (1846–1935)', 'place': 'the Savoy (1890–1898) and Carlton (1899–1919) hotels, London',
        'book': 'A Guide to Modern Cookery', 'edition': 'London: William Heinemann, 1907; the English edition of Le Guide culinaire, Paris, 1903',
        'status': 'Public domain: published in 1907 (before 1931, so public domain in the United States), and Escoffier died in 1935, so his works are out of copyright in countries that use life plus 70 years.',
        'scans': [('Internet Archive scan (Cornell University Library)', ESC_IA), ('Project Gutenberg text', 'https://www.gutenberg.org/ebooks/71395'),
                  ('Le Guide culinaire, 1903 (Internet Archive)', 'https://archive.org/details/b21525912')],
        'about': ('Auguste Escoffier', 'https://grokipedia.com/page/Auguste_Escoffier'),
        'stars': 'Escoffier did this work in London before Michelin gave out its first stars (1926), so no star ratings apply.',
    },
    'delmonicos': {
        'chef': 'Charles Ranhofer (1836–1899)', 'place': 'Delmonico’s, New York (chef 1862–1876 and 1879–1896)',
        'book': 'The Epicurean', 'edition': 'New York: Charles Ranhofer, 1894',
        'status': 'Public domain: published in the United States in 1894, and Ranhofer died in 1899.',
        'scans': [('Internet Archive scan', 'https://archive.org/details/epicureancomplet00ranh'), ('HathiTrust record', 'https://catalog.hathitrust.org/Record/100784757')],
        'about': ('Charles Ranhofer', 'https://grokipedia.com/page/Charles_Ranhofer'),
        'stars': 'Delmonico’s closed in 1923, before Michelin awarded its first stars (1926), so no star ratings apply.',
    },
    'waldorf': {
        'chef': 'Oscar Tschirky (1866–1950), maître d’hôtel', 'place': 'the Waldorf Hotel, New York',
        'book': 'The Cook Book by “Oscar” of the Waldorf', 'edition': 'Chicago and New York: The Werner Company, 1896',
        'status': 'Public domain: published in the United States in 1896, and Tschirky died in 1950.',
        'scans': [('Internet Archive scan', 'https://archive.org/details/cookbookbyoscaro00tsch')],
        'about': ('Oscar Tschirky', 'https://grokipedia.com/page/Oscar_Tschirky'),
        'stars': 'This is a 19th-century hotel dining room, decades before Michelin stars existed.',
    },
    'st-francis': {
        'chef': 'Victor Hirtzler (1875–1931), chef', 'place': 'the Hotel St. Francis, San Francisco',
        'book': 'The Hotel St. Francis Cook Book', 'edition': 'Chicago: The Hotel Monthly Press, 1919',
        'status': 'Public domain: published in the United States in 1919 (before 1931), and Hirtzler died in 1931.',
        'scans': [('Internet Archive scan', 'https://archive.org/details/hotelstfrancisco00hirtrich'), ('Project Gutenberg text', 'https://www.gutenberg.org/ebooks/39550')],
        'about': None,
        'stars': 'Hirtzler cooked decades before Michelin rated any American restaurant (its first U.S. guide came in 2005).',
    },
}

RECIPES = []


def R(**kw):
    RECIPES.append(kw)


# =====================================================================  Escoffier: the leading sauces
R(id='bechamel-sauce', name='Béchamel Sauce', emoji='🥛', servings=8, serving_size='¼ cup (makes 2 cups)',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=5, cook=20,
  equipment=['heavy 2-quart saucepan', 'small saucepan', 'whisk', 'fine strainer'],
  summary='Escoffier’s white sauce: milk thickened with a butter-and-flour roux and simmered with onion and bay. The base for mac and cheese, lasagna and creamed vegetables.',
  ingredients='''
2 cup whole-milk
1/4 each onion | in one piece
1 leaf bay-leaves
3 tbsp unsalted-butter
3 tbsp flour
1/2 tsp salt
~1 pinch nutmeg
~1 pinch black-pepper | or white pepper
''',
  steps=[
    'Warm the milk with the onion and bay leaf in the small saucepan until it steams and small bubbles form at the edge. Turn off the heat and let it steep while you make the roux.',
    'Melt the butter in the heavy saucepan over medium-low heat. Whisk in the flour and cook, whisking, 2 minutes. It should bubble and smell nutty but stay pale: this is Escoffier’s white roux.',
    'Take the pan off the heat and let the roux cool for a minute. Lift out the onion and bay, then pour the hot milk into the roux a little at a time, whisking hard so no lumps form.',
    'Bring it to a gentle boil, whisking, then turn the heat to low and simmer 10 to 15 minutes, stirring often and reaching into the corners, until it coats a spoon and no longer tastes floury.',
    'Season with the salt, nutmeg and pepper. Strain it if any lumps remain. Press plastic wrap on the surface or dot it with butter so a skin doesn’t form.',
  ],
  safety=[],
  make_ahead='Make up to 3 days ahead and refrigerate with plastic wrap pressed on the surface. Rewarm over low heat, whisking in a splash of milk.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and use within 3 to 4 days, in a gratin, a pot pie or creamed spinach.', None),
  kids='A good first sauce: a child can whisk while a grown-up pours the hot milk.',
  swaps={'gluten_free': 'Use 2 tablespoons cornstarch mixed into ¼ cup of the cold milk instead of the roux; whisk it into the rest of the hot milk and simmer 2 minutes.',
         'cheese_sauce': 'Off the heat, stir in 1 cup shredded cheddar or Gruyère-style cheese for a Mornay-style cheese sauce.'},
  prep_day=dict(ahead='Make the sauce and refrigerate it with wrap on the surface.', station='stove', oven_f=None, active=20, keeps_days=3),
  origin=dict(kitchen='escoffier', group='sauces', ref='No. 28, p. 21', title='Béchamel Sauce',
    excerpt='Pour the boiling milk on the roux, which should be almost cold, and whisk it well so as to avoid lumps. Let it boil, then cook on the side of the fire.',
    story='Escoffier listed béchamel as one of the basic sauces of his kitchen, with espagnole, velouté, tomato and hollandaise. Today these five are often called the “mother sauces.” The sauce itself is older and is traditionally named for the Marquis de Béchameil, a steward at the court of Louis XIV; whether he had anything to do with it is not known.',
    changes='Escoffier made four quarts and simmered diced veal in it for an hour; we make 2 cups, leave out the veal (as he did for meatless days) and simmer 15 minutes.',
    links=[('Béchamel sauce', 'https://grokipedia.com/page/B%C3%A9chamel_sauce')]))

R(id='chicken-veloute', name='Chicken Velouté', emoji='🍲', servings=8, serving_size='¼ cup (makes 2 cups)',
  meal=['side'], protein='chicken', method=['stovetop'], tags=['make-ahead'], prep=5, cook=30,
  equipment=['heavy 2-quart saucepan', 'whisk', 'ladle', 'fine strainer'],
  summary='A silky sauce of good chicken stock thickened with a pale roux and skimmed as it simmers. Spoon it over chicken, fish or vegetables, or use it to start a pot pie.',
  ingredients='''
3 tbsp unsalted-butter
3 tbsp flour
3 cup chicken-broth | homemade stock is best, cold
?2 oz mushrooms | trimmings or sliced caps
1/4 tsp salt | more if the stock is unsalted
~1 pinch nutmeg
~1 pinch black-pepper | or white pepper
''',
  steps=[
    'Melt the butter in the saucepan over medium-low heat, whisk in the flour, and cook 3 to 4 minutes, whisking, until it turns the color of straw: a pale roux. Let it cool a few minutes.',
    'Whisk in the cold stock a little at a time, then bring to a boil, whisking so it doesn’t catch on the bottom.',
    'Add the mushrooms if using. Turn the heat down so the sauce bubbles on one side of the pan only, and simmer 25 minutes, skimming off the skin and foam that gather on the quiet side.',
    'When it has reduced to about 2 cups and coats a spoon, strain it. Season with salt, nutmeg and pepper. Stir now and then as it cools so a skin doesn’t form.',
  ],
  safety=[],
  make_ahead='Make up to 3 days ahead; refrigerate with plastic wrap on the surface. Rewarm gently, whisking in a little stock if it’s thick.',
  freezer=(True, 'Freeze up to 3 months for best quality. Thaw in the fridge and whisk well as it rewarms.'),
  leftovers=('Refrigerate within 2 hours and use within 3 to 4 days; it makes a quick chicken pot pie or creamed chicken on toast.', None),
  kids=None,
  swaps={'gluten_free': 'Thicken with 2 tablespoons cornstarch stirred into ¼ cup cold stock instead of the roux; simmer 2 minutes.',
         'meatless': 'Use vegetable stock for a vegetable velouté.'},
  prep_day=dict(ahead='Make and refrigerate the velouté.', station='stove', oven_f=None, active=15, keeps_days=3),
  origin=dict(kitchen='escoffier', group='sauces', ref='Nos. 25 and 26, p. 20', title='Ordinary Velouté Sauce; Velouté de Volaille',
    excerpt='Now boil and move to a corner of the fire to despumate slowly for one and a half hours… I am not partial to garnishing Velouté Sauce with carrots, an onion with a clove stuck into it, and a faggot, as many do. The stock should be sufficiently fragrant of itself.',
    story='Velouté means “velvety.” Escoffier’s plain velouté used white veal stock; his chicken velouté is the same sauce made with chicken stock. “Despumate,” his word, means to skim off the scum as it rises.',
    changes='We make 2 cups instead of four quarts and simmer 25 minutes instead of two hours, which works for a home batch. Mushroom trimmings are his own optional touch.',
    links=[('Velouté sauce', 'https://grokipedia.com/page/Velout%C3%A9_sauce')]))

R(id='espagnole-demi-glace', name='Espagnole and Demi-Glace (Brown Sauce)', emoji='🫕', servings=8, serving_size='¼ cup (makes 2 cups)',
  meal=['side'], protein='beef', method=['stovetop'], tags=['make-ahead'], prep=15, cook=120,
  equipment=['heavy 3-quart saucepan', 'whisk', 'ladle', 'fine strainer', 'small saucepan (for demi-glace)'],
  summary='Escoffier’s brown sauce: brown stock, a browned roux, vegetables, bacon and tomato, simmered and skimmed. Reduce it with more stock and it becomes demi-glace, the base of steak sauces.',
  ingredients='''
Espagnole:
2 strip bacon | diced
1 each carrot | diced
1/2 each onion | diced
1 stalk celery | diced
3 tbsp unsalted-butter
1/4 cup flour
5 cup beef-broth | homemade brown stock is best, unsalted
2 tbsp tomato-paste
1 leaf bay-leaves
1/4 tsp thyme-dried
~1 pinch black-pepper
For demi-glace (optional):
?1 cup beef-broth
''',
  steps=[
    'Cook the bacon in the saucepan over medium heat until it gives up its fat, about 4 minutes. Add the carrot, onion and celery and cook until golden, 8 to 10 minutes. This bacon-and-vegetable mix is Escoffier’s mirepoix.',
    'Add the butter. When it melts, stir in the flour and keep stirring over medium-low heat 6 to 8 minutes, until the roux turns the brown of a paper bag and smells toasty. Don’t let it scorch; burnt roux is bitter.',
    'Whisk in the stock a cup at a time, then the tomato paste, bay leaf, thyme and pepper. Bring to a boil, whisking.',
    'Turn it down so it bubbles gently on one side of the pan. Simmer 1½ hours, skimming the foam and fat from the quiet side every 15 minutes, until it has reduced to about 2 cups and coats a spoon.',
    'Strain, pressing on the vegetables. Taste; add salt only at the end, since it concentrates as it cooks. This is espagnole.',
    'For demi-glace: simmer 1 cup of the espagnole with 1 cup more stock in the small saucepan until it is reduced by about half, 20 to 25 minutes, and is glossy and thick enough to coat a spoon. Escoffier finished his with a little sherry; we leave it out.',
  ],
  safety=[],
  make_ahead='Make up to 4 days ahead; refrigerate in a covered container. It sets to a jelly when cold and melts back when warmed.',
  freezer=(True, 'Freeze in ice-cube trays, then bag the cubes, up to 3 months; drop a cube or two into a pan sauce.'),
  leftovers=('Refrigerate within 2 hours and use within 3 to 4 days. Bring to a boil before using.', None),
  kids=None,
  swaps={'gluten_free': 'Skip the roux; thicken the strained sauce with 2 tablespoons cornstarch stirred into ¼ cup cold stock and simmer 2 minutes.',
         'no_pork': 'Leave out the bacon and brown the vegetables in 1 tablespoon more butter; Escoffier did the same for meatless days, using mushroom trimmings instead.'},
  prep_day=dict(ahead='Simmer the espagnole while other things cook; freeze some as demi-glace cubes.', station='stove', oven_f=None, active=25, keeps_days=4),
  origin=dict(kitchen='escoffier', group='sauces', ref='No. 22, p. 18 (espagnole); No. 23, p. 19 (half glaze, or demi-glace)', title='Brown Sauce or Espagnole; Half Glaze',
    excerpt='This is the Espagnole sauce, having reached the limit of perfection by final despumation. It is obtained by reducing one quart of Espagnole and one quart of first-class brown stock until its volume is reduced to nine-tenths of a quart.',
    story='Espagnole means “Spanish,” though nobody is sure why the French sauce got the name. Escoffier called demi-glace “the base of all the smaller brown sauces.”',
    changes='Escoffier made four quarts and skimmed it for up to six hours with a flour roux. We make 2 cups in 1½ hours, and leave out the sherry he added to the demi-glace.',
    links=[('Espagnole sauce', 'https://grokipedia.com/page/Espagnole_sauce'), ('Demi-glace', 'https://grokipedia.com/page/Demi-glace')]))

R(id='escoffier-tomato-sauce', name='Escoffier’s Tomato Sauce', emoji='🍅', servings=12, serving_size='½ cup (makes about 6 cups)',
  meal=['side'], protein='pork', method=['stovetop', 'oven'], tags=['make-ahead', 'budget'], prep=20, cook=100,
  equipment=['heavy ovenproof pot with a lid (5 quarts)', 'wooden spoon', 'food mill, sieve or blender'],
  summary='The French classic tomato sauce: bacon, carrot and onion, a little flour, tomatoes and stock, cooked slowly in the oven, then passed through a sieve. Smooth, rich and mild.',
  ingredients='''
3 strip bacon | diced
1 tbsp unsalted-butter
1 each carrot | diced
1 each onion | diced
1 leaf bay-leaves
1/4 tsp thyme-dried
3 tbsp flour
2 can whole-tomatoes | 28-oz cans, with juice, crushed by hand (or 5 lb ripe tomatoes, chopped)
2 cup chicken-broth
1 clove garlic | crushed
2 tsp sugar
1/2 tsp salt
~1/4 tsp black-pepper
''',
  steps=[
    'Heat the oven to 325°F. In the pot over medium heat, cook the bacon in the butter until the fat runs, about 4 minutes.',
    'Add the carrot, onion, bay leaf and thyme and cook, stirring, until soft, about 8 minutes. Sprinkle in the flour and stir 2 to 3 minutes, until it just begins to brown.',
    'Stir in the tomatoes and stock, scraping the bottom, then the garlic, sugar, salt and pepper. Bring to a boil.',
    'Cover and move the pot to the oven. Cook 1½ hours, stirring once halfway.',
    'Take out the bay leaf. Pass the sauce through a food mill or press it through a sieve (or blend it smooth). Bring it back to a boil on the stove, stirring, and taste for salt.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Make up to 4 days ahead and refrigerate; it tastes even better the next day.',
  freezer=(True, 'Freeze in 1- or 2-cup containers, leaving ½ inch of room, up to 4 months for best quality. Thaw in the fridge and reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days on pasta, eggs, chicken or pizza, reheated to 165°F.', 'dinner'),
  kids='Kids can crush the canned tomatoes by hand in a big bowl (it’s messy and they love it).',
  swaps={'gluten_free': 'Leave out the flour and cook the sauce uncovered for the last 30 minutes so it thickens by reducing.',
         'meatless': 'Leave out the bacon, use 2 tablespoons butter or olive oil, and use vegetable broth.'},
  prep_day=dict(ahead='Make a batch for the week and freeze the rest.', station='oven', oven_f=325, active=25, keeps_days=4),
  origin=dict(kitchen='escoffier', group='sauces', ref='No. 29, p. 22', title='Tomato Sauce',
    excerpt='Fry the pork with the butter in a tall, thick-bottomed saucepan. When the pork is nearly melted, add the carrots, onions, and aromatics… cover the saucepan, and place in a moderate oven, where it may cook for one and one-half hours.',
    story='Escoffier counted tomato sauce among his basic sauces, a sign of how far tomatoes had come in French cooking by 1900.',
    changes='His batch was four quarts from 10 pounds of tomatoes with salted pork breast; we make about 6 cups with bacon and canned tomatoes, which are good all year.',
    links=[]))

R(id='hollandaise-sauce', name='Hollandaise Sauce', emoji='🍋', servings=4, serving_size='about 3 tablespoons',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=[], prep=5, cook=15,
  equipment=['small saucepan', 'heatproof bowl that sits over a saucepan', 'whisk', 'instant-read thermometer'],
  summary='Egg yolks whisked over gentle heat until thick, then beaten with warm butter and lemon. Rich and tangy, for eggs Benedict, asparagus and fish.',
  ingredients='''
2 tbsp white-vinegar
2 tbsp water
1/8 tsp black-pepper | coarsely cracked
3 each egg-yolks
1/2 cup unsalted-butter | melted and kept warm
2 tsp lemon-juice
1/4 tsp salt
?1 pinch cayenne
''',
  steps=[
    'Simmer the vinegar, water and pepper in the small saucepan until only about 1 tablespoon is left. Let it cool a minute.',
    'Bring an inch of water to a bare simmer in a saucepan. In the heatproof bowl, whisk the yolks with the vinegar reduction and 1 tablespoon cold water.',
    'Set the bowl over the barely simmering water (it shouldn’t touch the water) and whisk constantly, lifting the bowl off the heat now and then, until the yolks are thick, pale and foamy and reach 160°F, 3 to 5 minutes. If they start to look grainy, lift the bowl off and keep whisking.',
    'Off the heat, pour in the warm butter in a thin stream, whisking all the time, until the sauce is thick and smooth.',
    'Whisk in the lemon juice, salt and cayenne. If it’s too thick, whisk in a teaspoon of warm water. Serve right away, or keep it in a warm (not hot) spot for up to 1 hour, whisking now and then.',
  ],
  safety=[T_EGG_SAUCE],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=None,
  kids=None,
  swaps={'blender': 'Cook the yolks to 160°F as above, then pour them into a blender, and with it running pour in the hot butter.'},
  prep_day=None,
  origin=dict(kitchen='escoffier', group='sauces', ref='No. 30, p. 22', title='Hollandaise Sauce',
    excerpt='Work the whole with a whisk until the yolks thicken and have the consistence of cream. Then remove the saucepan to a tepid place and gradually pour the butter on the yolks while briskly stirring the sauce.',
    story='Escoffier included hollandaise among his basic sauces; béarnaise is its herb-and-shallot cousin. The name means “Dutch,” and why is not certain.',
    changes='He used 1½ pounds of butter to six yolks for a quart; we use ½ cup of butter to three yolks for four servings, and we heat the yolks to 160°F, the temperature USDA gives for egg dishes.',
    links=[('Hollandaise sauce', 'https://grokipedia.com/page/Hollandaise_sauce')]))

# =====================================================================  Escoffier: dishes
R(id='peach-melba', name='Peach Melba', emoji='🍑', servings=4, serving_size='1 peach with ice cream and sauce',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=20, cook=10, inactive=60,
  equipment=['saucepan wide enough for the peaches', 'slotted spoon', 'blender or sieve', 'bowls'],
  summary='Escoffier’s famous dessert: peaches poached in vanilla syrup, served on vanilla ice cream under a fresh raspberry purée.',
  ingredients='''
Peaches:
4 each peach | ripe but firm
^3 cup water
^200 g sugar | for the poaching syrup
^2 tsp vanilla
Raspberry sauce:
12 oz raspberries | fresh or frozen and thawed
1/3 cup powdered-sugar
1 tsp lemon-juice
To serve:
2 cup vanilla-ice-cream
''',
  steps=[
    'Bring the water and sugar to a boil in the saucepan, stirring until the sugar dissolves. Add the vanilla.',
    'Lower the peaches into the syrup and simmer gently 5 to 8 minutes, turning them, until a knife slides in easily. Lift them out, let them cool a few minutes, and slip off the skins. Halve and pit them.',
    'Cool the peaches in a little of the syrup, then chill at least 1 hour. (Save the rest of the syrup for iced tea or fruit salad.)',
    'For the sauce, purée the raspberries with the powdered sugar and lemon juice, then press through a sieve to remove the seeds. Chill.',
    'To serve, put a scoop of ice cream in each bowl, set two peach halves on top, and spoon the raspberry sauce over.',
  ],
  safety=[],
  make_ahead='Poach the peaches and make the sauce up to 2 days ahead; keep them covered in the fridge.',
  freezer=(True, 'The raspberry sauce freezes well for up to 3 months.'),
  leftovers=('Refrigerate poached peaches in their syrup up to 3 days.', None),
  kids='Kids can press the raspberry purée through the sieve with the back of a spoon.',
  swaps={'shortcut': 'Out of season, use canned peach halves in juice, drained, and skip the poaching.'},
  prep_day=dict(ahead='Poach the peaches and make the raspberry sauce.', station='stove', oven_f=None, active=25, keeps_days=2),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 2699, p. 778', title='Pêches Melba',
    excerpt='Poach the peaches in vanilla-flavoured syrup. Dish them in a timbale upon a layer of vanilla ice-cream, and coat them with a raspberry purée.',
    story='Escoffier created the dish at the Savoy in London in the 1890s for the Australian soprano Nellie Melba; the year is usually given as 1892 or 1893. His own recipe is just these three things.',
    changes='Measurements and times are ours; we strain the raspberries, as most cooks do.',
    links=[('Peach Melba', 'https://grokipedia.com/page/Peach_Melba'), ('Nellie Melba', 'https://grokipedia.com/page/Nellie_Melba')]))

R(id='pears-belle-helene', name='Pears Belle-Hélène', emoji='🍐', servings=4, serving_size='1 pear with ice cream and sauce',
  meal=['snack'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=15, cook=25, inactive=60,
  equipment=['saucepan that holds the pears upright or on their sides', 'vegetable peeler', 'melon baller or small spoon', 'small saucepan'],
  summary='Pears poached in vanilla syrup, chilled, and served on vanilla ice cream with hot chocolate sauce poured over at the table.',
  ingredients='''
Pears:
4 each pear | firm-ripe, such as Bosc
^4 cup water
^200 g sugar | for the poaching syrup
^1 tbsp lemon-juice
^2 tsp vanilla
Chocolate sauce:
4 oz dark-chocolate | chopped
1/2 cup heavy-cream
To serve:
2 cup vanilla-ice-cream
''',
  steps=[
    'Bring the water, sugar and lemon juice to a boil in the saucepan, stirring until the sugar dissolves. Add the vanilla.',
    'Peel the pears, leaving the stems on. Scoop out the cores from the bottom with the melon baller.',
    'Simmer the pears in the syrup, turning now and then, 15 to 25 minutes, until a knife slides in easily. Let them cool in the syrup, then chill at least 1 hour.',
    'Just before serving, heat the cream in the small saucepan until it steams, take it off the heat, add the chocolate, and stir until smooth.',
    'Set each pear on a scoop of ice cream and pour the warm chocolate sauce over it.',
  ],
  safety=[],
  make_ahead='Poach the pears up to 3 days ahead and keep them in their syrup in the fridge.',
  freezer=(False, ''),
  leftovers=('Pears keep in their syrup, refrigerated, up to 3 days; rewarm the chocolate sauce gently.', None),
  kids='Kids can stir the chocolate sauce smooth once a grown-up has poured in the hot cream.',
  swaps={'dairy_free': 'Use coconut milk in the sauce and a dairy-free frozen dessert.'},
  prep_day=dict(ahead='Poach and chill the pears.', station='stove', oven_f=None, active=15, keeps_days=3),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 2711, p. 780', title='Poires Hélène',
    excerpt='Poach the pears in vanilla-flavoured syrup and let them cool. When about to serve, dish them in a timbale upon a layer of vanilla ice-cream, sprinkled with crystallised violets. Serve a hot, chocolate sauce separately.',
    story='Escoffier printed it as “Poires Hélène.” The name is usually linked to Jacques Offenbach’s 1864 operetta La Belle Hélène; who first made the dish is not certain.',
    changes='We leave out the candied violets and give measurements and a simple chocolate sauce.',
    links=[('Poire belle Hélène', 'https://grokipedia.com/page/Poire_belle_H%C3%A9l%C3%A8ne')]))

R(id='crepes-suzette', name='Crêpes Suzette', emoji='🥞', servings=4, serving_size='3 crêpes',
  meal=['snack', 'breakfast'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=15, cook=30, inactive=30,
  equipment=['blender or bowl and whisk', '8-inch nonstick skillet', 'large skillet', 'zester or fine grater'],
  summary='Thin crêpes warmed in a buttery orange sauce. Escoffier’s 1907 version brushes them with orange butter; ours makes it a glossy pan sauce, with no liqueur and no flames.',
  ingredients='''
Crêpes:
125 g flour
2 each eggs
1 1/4 cup whole-milk
2 tbsp unsalted-butter | melted, plus a little for the pan
1 tbsp sugar
1 pinch salt
Orange butter sauce:
6 tbsp unsalted-butter | softened
1/4 cup sugar
1 each orange | zest finely grated
3/4 cup orange-juice | or the juice of clementines or tangerines
1 tbsp lemon-juice
''',
  steps=[
    'Blend or whisk the flour, eggs, milk, melted butter, sugar and salt until smooth. Rest the batter 30 minutes (or overnight in the fridge).',
    'Heat the 8-inch skillet over medium and brush it with butter. Pour in 3 tablespoons of batter and swirl to coat the pan thinly. Cook about 1 minute, until the edges lift and the bottom is lightly browned, then flip and cook 20 seconds. Stack the crêpes on a plate. You’ll have about 12.',
    'For the sauce, mash the soft butter with the sugar and orange zest. Melt it in the large skillet over medium heat, add the orange and lemon juice, and simmer 3 to 4 minutes, until slightly syrupy.',
    'Fold each crêpe in quarters, lay them in the sauce, and spoon it over. Warm 1 to 2 minutes, turning once, and serve with the sauce.',
  ],
  safety=[],
  make_ahead='Cook the crêpes up to 2 days ahead; stack with wax paper between, wrap and refrigerate.',
  freezer=(True, 'Freeze cooked crêpes, stacked with wax paper and wrapped well, up to 2 months. Thaw in the fridge.'),
  leftovers=('Refrigerate leftovers within 2 hours and eat within 2 days.', None),
  kids='Kids can zest the orange and fold the crêpes into triangles.',
  swaps={'dairy_free': 'Use a plant milk in the batter and a dairy-free butter in the pan and the sauce.'},
  prep_day=dict(ahead='Make the batter and cook the crêpes.', station='stove', oven_f=None, active=30, keeps_days=2),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 2450, p. 723', title='Suzette Pancakes',
    excerpt='Make these from preparation A, flavoured with curaçoa and tangerine juice. Coat them, like Gil-Blas pancakes, with softened butter, flavoured with curaçoa and tangerine juice.',
    story='The origin is disputed. Henri Charpentier said he created the dish by accident in 1895 as a young waiter at the Café de Paris in Monte Carlo, serving the Prince of Wales. Another account ties the name to the actress Suzanne Reichenberg, known as Suzette, in Paris in the 1890s. Escoffier’s book printed a recipe in 1907; flaming it at the table came later.',
    changes='Escoffier flavored the crêpes and butter with curaçao, an orange liqueur. We use orange zest and juice, cook the butter into a sauce, and skip the flaming.',
    links=[('Crêpes Suzette', 'https://grokipedia.com/page/Cr%C3%AApes_Suzette')]))

R(id='melba-toast', name='Melba Toast', emoji='🍞', servings=4, serving_size='4 crisp halves',
  meal=['snack', 'side'], protein='vegetarian', method=['oven'], tags=['budget', 'kid-friendly', 'quick'], prep=5, cook=15,
  equipment=['toaster', 'serrated knife', 'baking sheet'],
  summary='Toast split into paper-thin slices and baked until crisp and curled. A light partner for soup, pâté or cheese.',
  ingredients='''
8 slice white-bread | thin-sliced sandwich bread
''',
  steps=[
    'Heat the oven to 325°F. Toast the bread lightly in the toaster.',
    'While it’s warm, cut off the crusts. Lay a slice flat and, holding it with your palm, slice it in half through the middle with a serrated knife to make two thin slices.',
    'Lay the slices on the baking sheet, untoasted side up. Bake 8 to 12 minutes, until dry, golden and curling at the edges. Watch the last few minutes; they brown fast.',
    'Cool completely; they crisp as they cool.',
  ],
  safety=[],
  make_ahead='Make up to a week ahead and keep airtight.',
  freezer=(False, ''),
  leftovers=('Store airtight at room temperature up to 1 week.', None),
  kids='With a grown-up holding the bread, older kids can practice the careful split.',
  swaps={'gluten_free': 'Use gluten-free sandwich bread; it splits more easily when cold.'},
  prep_day=None,
  origin=dict(kitchen='escoffier', group='dishes', ref=None, title='Toast Melba',
    excerpt=None,
    story='Melba toast is usually credited to Escoffier at the Savoy around 1897, for Nellie Melba when she was ill and wanted something very light. Accounts differ on the details, and it isn’t in his 1907 Guide, so this page has no original to quote.',
    changes='The method is the classic one, in our own words.',
    links=[('Melba toast', 'https://grokipedia.com/page/Melba_toast')]))

R(id='potage-parmentier', name='Potato and Leek Soup (Potage Parmentier)', emoji='🥔', servings=6, serving_size='1⅓ cups',
  meal=['lunch', 'dinner'], protein='vegetarian', method=['stovetop', 'one-pot'], tags=['budget', 'freezer-friendly'], prep=15, cook=30,
  equipment=['large pot', 'blender, immersion blender or potato masher', 'skillet (for croutons)'],
  summary='Leeks softened in butter, simmered with potatoes and stock, puréed and finished with cream. Escoffier topped it with butter-fried croutons.',
  ingredients='''
Soup:
2 each leek | white and light green parts, sliced and well rinsed
2 tbsp unsalted-butter
2 lb russet-potato | peeled and cut in chunks
4 cup vegetable-broth | or chicken broth
1 cup water
1/2 cup heavy-cream | or whole milk
1/2 tsp salt
~1/4 tsp black-pepper
Croutons:
3 slice white-bread | cut in small cubes
1 tbsp unsalted-butter
?2 tbsp chives | snipped
''',
  steps=[
    'Melt the butter in the pot over medium-low heat. Cook the leeks, stirring, until soft but not browned, about 8 minutes.',
    'Add the potatoes, broth and water. Bring to a boil, then simmer, partly covered, 15 to 20 minutes, until the potatoes fall apart when poked.',
    'Purée the soup in the pot with an immersion blender, or in batches in a blender with the lid vented and covered with a towel (hot liquid expands). For a rustic soup, mash it instead.',
    'Stir in the cream, bring just back to a simmer, and season with salt and pepper.',
    'For the croutons, fry the bread cubes in the butter in the skillet, stirring, until golden, 4 to 5 minutes. Serve the soup topped with croutons and chives.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Make the soup up to 3 days ahead without the cream; add the cream when you reheat it.',
  freezer=(True, 'Freeze without the cream up to 3 months (potato soups can turn a little grainy). Thaw in the fridge, reheat to 165°F, then add the cream.'),
  leftovers=('Refrigerate within 2 hours; keeps 3 to 4 days. Reheat to 165°F.', 'lunch'),
  kids='Kids can snip the chives with clean kitchen scissors.',
  swaps={'escoffier_style': 'Use chicken broth, closer to the white consommé Escoffier used.', 'gluten_free': 'Leave off the croutons or use gluten-free bread.', 'cold_soup': 'Chill it, thin with a little more cream or milk, and serve cold with chives. Served cold this way, it is close to vichyssoise.'},
  prep_day=dict(ahead='Make the soup base; add cream when serving.', station='stove', oven_f=None, active=20, keeps_days=3),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 658, p. 232', title='Purée de Pommes de Terre, otherwise Parmentier',
    excerpt='Finely mince the white of two medium-sized leeks, and fry them without colouration in one oz. of butter. Add three medium-sized peeled and quartered potatoes, one pint of white consommé, and cook quickly.',
    story='The name honors Antoine-Augustin Parmentier, the 18th-century French pharmacist who championed the potato in France. A cold, creamy version, vichyssoise, became famous at the Ritz-Carlton in New York under chef Louis Diat around 1917; his recipe is still under copyright, so this is Escoffier’s hot soup.',
    changes='We use vegetable or chicken broth for his white consommé and blend rather than rub the soup through a cloth sieve.',
    links=[('Vichyssoise', 'https://grokipedia.com/page/Vichyssoise')]))

R(id='chicken-chasseur', name='Hunter’s Chicken (Chicken Chasseur)', emoji='🍗', servings=4, serving_size='2 thighs with sauce',
  meal=['dinner'], protein='chicken', method=['stovetop'], tags=['freezer-friendly'], prep=15, cook=40,
  equipment=['large heavy skillet with a lid', 'tongs', 'instant-read thermometer'],
  summary='Chicken browned in butter and oil, then finished in a sauce of mushrooms, shallots, tomato and parsley. A classic French bistro dinner.',
  ingredients='''
Chicken:
8 thigh chicken-thighs-bone-in | skin on
3/4 tsp salt
1/4 tsp black-pepper
1 tbsp olive-oil
1 tbsp unsalted-butter
Sauce:
8 oz mushrooms | sliced
2 each shallot | minced
1 tbsp flour
1 1/4 cup chicken-broth
2 tbsp tomato-paste
1 tsp lemon-juice
1 tbsp unsalted-butter
2 tbsp parsley | chopped
''',
  steps=[
    'Pat the chicken dry and season with the salt and pepper. Wash your hands after handling raw chicken.',
    'Heat the oil and butter in the skillet over medium-high. Brown the chicken skin side down, 6 to 8 minutes, then turn and brown 3 minutes more. Move it to a plate.',
    'Pour off all but 2 tablespoons of fat. Cook the mushrooms over medium-high until browned, about 6 minutes. Add the shallots and cook 1 minute, then stir in the flour.',
    'Stir in the broth, tomato paste and lemon juice, scraping up the browned bits. Return the chicken, skin side up, with its juices.',
    'Cover and simmer gently 20 to 25 minutes, until a thermometer in the thickest thigh (not touching bone) reads 165°F. Move the chicken to a platter.',
    'Simmer the sauce 2 to 3 minutes to thicken, then swirl in the last tablespoon of butter and the parsley. Spoon over the chicken.',
  ],
  safety=[T_POULTRY],
  make_ahead='Make it a day ahead; the flavor improves. Reheat covered to 165°F.',
  freezer=(True, 'Freeze cooked chicken in sauce for up to 3 months. Thaw in the fridge and reheat to 165°F.'),
  leftovers=('Refrigerate within 2 hours; keeps 3 to 4 days. Reheat to 165°F and serve over noodles or rice.', 'dinner'),
  kids='Serve the sauce on the side for kids who don’t like mushrooms.',
  swaps={'gluten_free': 'Leave out the flour and simmer the sauce a few minutes longer to thicken.', 'dairy_free': 'Use all olive oil instead of butter.'},
  prep_day=dict(ahead='Slice the mushrooms and mince the shallots.', station='stove', oven_f=None, active=15, keeps_days=2),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 1543, p. 499 (and Chasseur sauce, No. 33, p. 25)', title='Poulet Sauté Chasseur',
    excerpt='Sauté the chicken in equal quantities of butter and oil, and dish it. Swill the saucepan with a few tablespoonfuls of white wine, and reduce; add one-quarter pint of Chasseur Sauce Escoffier; heat; pour over the chicken, and sprinkle the latter with a pinch of concussed parsley.',
    story='“Chasseur” means hunter: the mushrooms suggest a meal from the woods. Escoffier’s own chasseur sauce adds mushrooms, shallots, wine and tarragon to his demi-glace.',
    changes='We use broth and a little lemon in place of the white wine, tomato paste for the tomato sauce and demi-glace, and bone-in thighs, which stay juicy.',
    links=[('Chicken chasseur', 'https://grokipedia.com/page/Chicken_chasseur')]))

R(id='fish-bonne-femme', name='Fish Bonne Femme', emoji='🐟', servings=4, serving_size='1 fillet with sauce',
  meal=['dinner'], protein='fish', method=['stovetop'], tags=['quick'], prep=10, cook=20,
  equipment=['large skillet with a lid', 'wide spatula', 'instant-read thermometer'],
  summary='White fish fillets poached on a bed of shallots and mushrooms, then coated with the pan juices made into a creamy sauce. Escoffier’s “good wife’s” sole, for any mild white fish.',
  ingredients='''
2 tbsp unsalted-butter
2 each shallot | minced
6 oz mushrooms | thinly sliced
2 tbsp parsley | chopped, divided
4 fillet cod | about 6 oz each, or sole, flounder or tilapia
1/2 tsp salt
1/8 tsp black-pepper
3/4 cup vegetable-broth | or fish stock
1 tbsp lemon-juice
1/3 cup heavy-cream
''',
  steps=[
    'Butter the skillet with 1 tablespoon of the butter and scatter the shallots, mushrooms and half the parsley over the bottom.',
    'Season the fish with the salt and pepper and lay it on the vegetables. Pour in the broth and lemon juice.',
    'Bring to a simmer over medium heat, cover, and poach gently 6 to 10 minutes, until the fish flakes and reaches 145°F in the thickest part. Lift the fish to warm plates with the spatula.',
    'Turn the heat to high and boil the pan juices and mushrooms until reduced by half, about 4 minutes. Add the cream and boil 2 minutes more, until it coats a spoon. Swirl in the rest of the butter.',
    'Spoon the sauce over the fish and sprinkle with the rest of the parsley.',
  ],
  safety=[T_FISH],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and eat within 2 days, reheated gently to 165°F.', None),
  kids='Mild white fish in a creamy sauce is a good start for kids new to fish.',
  swaps={'dairy_free': 'Leave out the cream and finish the sauce with 1 tablespoon olive oil.', 'glazed_top': 'For Escoffier’s finish, set the plates under a hot broiler for a minute to glaze the sauce.'},
  prep_day=dict(ahead='Slice the mushrooms and mince the shallots.', station='none', oven_f=None, active=10, keeps_days=1),
  origin=dict(kitchen='escoffier', group='dishes', ref='No. 862, p. 291', title='Sole Bonne Femme',
    excerpt='Butter the bottom of the dish intended for the sole, and besprinkle it with two chopped shallots, one pinch of parsley, and one and one-half oz. of raw minced mushrooms. Lay the sole upon this garnish, moisten with one-quarter pint of white wine and as much fish fumet, and poach gently.',
    story='“Bonne femme” means “good wife,” the French name for simple home-style dishes. Escoffier used a whole sole.',
    changes='We use fillets of any mild white fish, broth and lemon instead of white wine and fish fumet, and cream in place of his fish velouté.',
    links=[]))

# =====================================================================  Ranhofer, Delmonico's
R(id='lobster-newberg', name='Lobster Newberg', emoji='🦞', servings=4, serving_size='about ¾ cup on toast',
  meal=['dinner'], protein='fish', method=['stovetop'], tags=['quick'], prep=10, cook=15,
  equipment=['large skillet', 'bowl and whisk', 'instant-read thermometer', 'toaster'],
  summary='Cooked lobster warmed in butter, simmered in cream, and thickened with egg yolks and a pinch of cayenne. Delmonico’s showpiece, served on toast.',
  ingredients='''
1 lb lobster | cooked meat, in 1-inch pieces
3 tbsp unsalted-butter
1 1/2 cup heavy-cream
3 each egg-yolks
1/4 tsp salt
1/8 tsp cayenne
1/4 tsp paprika
1 tsp lemon-juice
To serve:
4 slice white-bread | toasted and cut in triangles, or 2 cups cooked rice
''',
  steps=[
    'Melt the butter in the skillet over medium heat. Add the lobster and warm it gently 2 minutes, turning, without letting it brown.',
    'Pour in 1¼ cups of the cream and simmer until it has reduced by about a third, 5 to 6 minutes.',
    'Whisk the yolks with the remaining ¼ cup cream in the bowl. Whisk a ladle of the hot cream into the yolks, then pour it all back into the pan.',
    'Stir over low heat without letting it boil, until the sauce thickens and reaches 160°F, 2 to 3 minutes. Season with salt, cayenne, paprika and lemon juice.',
    'Spoon over the toast and serve right away.',
  ],
  safety=[T_EGG_SAUCE],
  make_ahead=None,
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and eat within 1 to 2 days; reheat gently to 165°F, stirring, without boiling.', None),
  kids=None,
  swaps={'shrimp': 'Use 1 lb cooked, peeled shrimp, or a mix of shrimp and scallops seared through first.', 'gluten_free': 'Serve over rice instead of toast.'},
  prep_day=None,
  origin=dict(kitchen='delmonicos', group='dishes', ref='No. 1037, p. 411', title='Lobster à la Newberg or Delmonico',
    excerpt='Moisten to their height with good raw cream; reduce quickly to half and then add two or three spoonfuls of Madeira wine; boil the liquid once more only, then remove and thicken with a thickening of egg-yolks and raw cream.',
    story='A popular story says a sea captain, Ben Wenberg, showed the dish to Charles Delmonico in the 1870s and that, after a quarrel, the name on the menu was changed from “Wenberg” to “Newberg.” No early source confirms it. Ranhofer’s book is the earliest printed recipe.',
    changes='Ranhofer boiled six live lobsters; we start with cooked lobster meat. We leave out the Madeira wine and add a little lemon and paprika, and we cook the yolks to 160°F.',
    links=[('Lobster Newberg', 'https://grokipedia.com/page/Lobster_Newberg'), ('Delmonico’s', 'https://grokipedia.com/page/Delmonico%27s')]))

R(id='eggs-benedict', name='Eggs Benedict', emoji='🍳', servings=4, serving_size='2 halves',
  meal=['breakfast'], protein='pork', method=['stovetop'], tags=[], prep=10, cook=25,
  equipment=['deep skillet or saucepan (for poaching)', 'slotted spoon', 'heatproof bowl over a saucepan', 'whisk', 'instant-read thermometer', 'baking sheet'],
  summary='Toasted English muffins topped with ham, a poached egg and hollandaise. Delmonico’s chef printed it in 1894 as “Eggs à la Benedick.”',
  ingredients='''
Hollandaise:
3 each egg-yolks
1 tbsp lemon-juice
1/2 cup unsalted-butter | melted and kept warm
1/4 tsp salt
?1 pinch cayenne
Eggs and muffins:
4 each english-muffins | split
8 slice deli-ham | thick-sliced cooked ham or Canadian bacon
1 tbsp white-vinegar
8 each eggs | very fresh
''',
  steps=[
    'Make the hollandaise: in a heatproof bowl over barely simmering water, whisk the yolks, lemon juice and 1 tablespoon water constantly until thick and foamy and they reach 160°F. Off the heat, whisk in the warm butter in a thin stream, then the salt and cayenne. Keep it in a warm spot.',
    'Heat the oven to 200°F. Toast the muffin halves lightly, top each with ham, and keep them warm on the baking sheet in the oven.',
    'Bring 3 inches of water and the vinegar to a gentle simmer in the deep skillet. Crack each egg into a cup and slide it in. Poach 4 to 5 minutes, until the whites are completely set and the yolks have begun to thicken. USDA advises cooking eggs until both the yolk and white are firm; for runny yolks, use pasteurized eggs.',
    'Lift the eggs out with the slotted spoon, drain them on a towel, and set one on each muffin. Spoon hollandaise over and serve.',
  ],
  safety=[T_EGG_SAUCE],
  make_ahead='Poach the eggs ahead, chill them in ice water, and refrigerate up to 1 day; rewarm in simmering water 1 minute.',
  freezer=(False, ''),
  leftovers=None,
  kids='For kids, cook the eggs until the yolks are firm and serve the sauce on the side.',
  swaps={'gluten_free': 'Use gluten-free English muffins.', 'meatless': 'Use sautéed spinach or sliced tomato instead of ham (eggs Florentine).'},
  prep_day=None,
  origin=dict(kitchen='delmonicos', group='dishes', ref='No. 2925, p. 858', title='Eggs à la Benedick',
    excerpt='Cut some muffins in halves crosswise, toast them without allowing to brown, then place a round of cooked ham an eighth of an inch thick and of the same diameter as the muffins on each half. Heat in a moderate oven and put a poached egg on each toast. Cover the whole with Hollandaise sauce.',
    story='Two main stories compete. One says Ranhofer made it at Delmonico’s for regular customers, Mr. and Mrs. LeGrand Benedict. The other says a stockbroker, Lemuel Benedict, ordered something like it at the Waldorf in 1894 and the hotel added it to the menu. Ranhofer’s book has the earliest printed recipe.',
    changes='Measurements, times and the 160°F hollandaise are ours.',
    links=[('Eggs Benedict', 'https://grokipedia.com/page/Eggs_Benedict')]))

R(id='baked-alaska', name='Baked Alaska', emoji='🍨', servings=8, serving_size='1 wedge',
  meal=['snack'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=40, cook=25, inactive=300,
  equipment=['8-inch round cake pan', 'parchment', '7-inch bowl and plastic wrap', 'stand or hand mixer', 'ovenproof platter or baking sheet', 'kitchen torch (optional)'],
  summary='Ice cream on sponge cake, sealed in meringue and browned in a very hot oven for just a few minutes. Delmonico’s “Alaska, Florida”: cold inside, warm outside.',
  ingredients='''
Sponge cake:
3 each eggs
100 g sugar
1/2 tsp vanilla
65 g cake-flour
1 pinch salt
Filling:
1 quart vanilla-ice-cream
1/4 cup jam | apricot, warmed
Meringue:
4 each egg-whites | from pasteurized eggs, or carton whites labeled for whipping
150 g sugar
1/4 tsp cream-of-tartar
''',
  steps=[
    'Line the bowl with plastic wrap. Soften the ice cream a few minutes, pack it into the bowl, cover, and freeze until very firm, at least 4 hours.',
    'Heat the oven to 350°F and line the cake pan with parchment. Beat the eggs, sugar and vanilla on high 5 to 7 minutes, until thick, pale and tripled. Sift the flour and salt over and fold in gently. Spread in the pan and bake 15 to 18 minutes, until springy. Cool completely.',
    'Set the cake on the ovenproof platter and brush it with the jam. Unmold the ice cream dome onto the cake and peel off the plastic. Return to the freezer.',
    'Heat the oven to 475°F. Beat the egg whites and cream of tartar to soft peaks, then beat in the sugar a spoonful at a time and keep beating to stiff, glossy peaks.',
    'Spread the meringue over the ice cream and cake right down to the platter, sealing it completely; swirl the top. (You can freeze it now, up to 1 day.)',
    'Bake 3 to 5 minutes, until the peaks are golden brown, or brown it with a torch. Slice with a hot knife and serve at once.',
  ],
  safety=[],
  make_ahead='Assemble and freeze the meringue-covered dessert up to 1 day ahead; bake straight from the freezer.',
  freezer=(True, 'Freeze leftovers, covered, up to 1 week; the meringue softens over time.'),
  leftovers=('Keep leftovers frozen and eat within a few days.', None),
  kids='Kids can swirl the meringue peaks with the back of a spoon.',
  swaps={'shortcut': 'Use a store-bought pound cake, sliced ½ inch thick, in place of the sponge.'},
  prep_day=dict(ahead='Bake the sponge and freeze the ice cream dome.', station='oven', oven_f=350, active=30, keeps_days=1),
  origin=dict(kitchen='delmonicos', group='dishes', ref='No. 3538, p. 1007', title='Alaska, Florida',
    excerpt='Prepare also a meringue with twelve egg-whites and one pound of sugar. A few moments before serving place each biscuit with its ice on a small lace paper, and cover one after the other with the meringue… color this meringue for two minutes in a hot oven, and when a light golden brown remove and serve at once.',
    story='Delmonico’s is often said to have named the dessert in 1867, the year the United States bought Alaska; the story is popular but not documented from that year. The idea is older: Benjamin Thompson (Count Rumford) wrote about meringue’s insulating power in the early 1800s, and French cooks made a similar “Norwegian omelet.” Ranhofer’s 1894 book gives his “Alaska, Florida,” with banana and vanilla ice cream in little sponge cakes.',
    changes='Ranhofer made individual cakes with apricot marmalade and two ice creams; we make one large dome. We use pasteurized egg whites for the meringue, since it browns for only a few minutes.',
    links=[('Baked Alaska', 'https://grokipedia.com/page/Baked_Alaska')]))

R(id='delmonico-steak', name='Delmonico Steak with Parsley Butter', emoji='🥩', servings=4, serving_size='about 5 oz of steak',
  meal=['dinner'], protein='beef', method=['grill', 'stovetop'], tags=['quick'], prep=10, cook=15, inactive=5,
  equipment=['broiler pan, grill or heavy skillet', 'instant-read thermometer', 'tongs'],
  summary='A thick sirloin steak, salted, brushed with butter and broiled, served with lemony parsley butter. Ranhofer’s plain steak, the way Delmonico’s served it.',
  ingredients='''
Steak:
2 each sirloin-steak | about 1 1/4 inches thick
1 tsp salt
1/2 tsp black-pepper
1 tbsp olive-oil
Parsley butter (maître d’hôtel butter):
4 tbsp unsalted-butter | softened
1 tbsp parsley | finely chopped
1 tsp lemon-juice
1 pinch salt
''',
  steps=[
    'Mash the butter with the parsley, lemon juice and a pinch of salt. Shape into a log on plastic wrap and chill.',
    'Pat the steaks dry, season both sides with the salt and pepper, and brush with the oil. Let them sit while the broiler, grill or skillet heats.',
    'Broil 3 to 4 inches from the heat, or cook on a hot grill or skillet, 5 to 7 minutes per side, until an instant-read thermometer in the center reads 145°F.',
    'Rest the steaks 3 minutes, then slice and top with coins of the parsley butter.',
  ],
  safety=[T_WHOLE_CUT],
  make_ahead='Make the parsley butter up to 1 week ahead (or freeze it for 2 months).',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; use within 3 to 4 days, sliced cold on salads or sandwiches or reheated to 165°F.', 'lunch'),
  kids='Slice kids’ portions thin across the grain.',
  swaps={'dairy_free': 'Skip the parsley butter and serve with lemon and olive oil.'},
  prep_day=dict(ahead='Make the parsley butter.', station='none', oven_f=None, active=5, keeps_days=7),
  origin=dict(kitchen='delmonicos', group='dishes', ref='No. 1375, p. 424', title='Delmonico Sirloin Steak of Twenty Ounces, Plain',
    excerpt='Cut from a sirloin slices two inches in thickness; beat them to flatten them to an inch and a half thick, trim nicely… salt them on both sides, baste them over with oil or melted butter, and broil them on a moderate fire.',
    story='Which cut a “Delmonico steak” means has been argued about for more than a century: today it may be sold as a boneless rib eye or a strip steak. Ranhofer’s book calls for a thick sirloin steak.',
    changes='Ranhofer gives times for rare to well done; we cook to 145°F with a 3-minute rest, USDA’s safe minimum for steak.',
    links=[('Delmonico steak', 'https://grokipedia.com/page/Delmonico_steak')]))

# =====================================================================  Tschirky, the Waldorf
R(id='original-waldorf-salad', name='The Original Waldorf Salad (1896)', emoji='🍏', servings=4, serving_size='about ¾ cup',
  meal=['side', 'lunch'], protein='vegetarian', method=['no-cook'], tags=['quick', 'budget', 'kid-friendly'], prep=15, cook=0,
  equipment=['cutting board and knife', 'bowl'],
  summary='The Waldorf’s first version: just apples and celery in mayonnaise. Walnuts and grapes came later.',
  ingredients='''
2 each apple | crisp and tart-sweet, peeled and cored
3 stalk celery | from the pale inner stalks
1/2 cup mayonnaise | homemade or store-bought
1 tsp lemon-juice
1 pinch salt
?4 leaf green-leaf-lettuce | to serve
''',
  steps=[
    'Cut the apples into ½-inch cubes and toss them with the lemon juice so they don’t brown. Check that no seeds or core are left.',
    'Cut the celery into pieces about the same size.',
    'Fold the apples, celery and salt into the mayonnaise. Serve right away on lettuce leaves, or chill up to 2 hours.',
  ],
  safety=[],
  make_ahead='Cut the celery a day ahead; cut the apples and dress the salad within 2 hours of serving.',
  freezer=(False, ''),
  leftovers=('Refrigerate and eat within 1 day; the apples soften.', None),
  kids='Kids can cube the apples with a kid-safe knife and stir it all together.',
  swaps={'walnuts_and_grapes': 'Add ½ cup toasted walnuts and a handful of halved grapes for the salad most people know today.'},
  prep_day=None,
  origin=dict(kitchen='waldorf', group='dishes', ref='Salads chapter', title='Waldorf Salad',
    excerpt='Peel two raw apples and cut them into small pieces, say about half an inch square, also cut some celery the same way, and mix it with the apple. Be very careful not to let any seeds of the apples be mixed with it. The salad must be dressed with a good mayonnaise.',
    story='Tschirky, the Waldorf’s famous maître d’hôtel, published this recipe in 1896, a few years after the hotel opened in 1893. Walnuts were added by the 1920s.',
    changes='The lemon juice is ours, to keep the apples white.',
    links=[('Waldorf salad', 'https://grokipedia.com/page/Waldorf_salad')]))

# =====================================================================  Hirtzler, Hotel St. Francis
R(id='celery-victor', name='Celery Victor', emoji='🥬', servings=4, serving_size='about 4 oz of celery',
  meal=['side'], protein='vegetarian', method=['stovetop'], tags=['make-ahead'], prep=10, cook=20, inactive=60,
  equipment=['wide saucepan or skillet with a lid', 'tongs', 'small jar or bowl'],
  summary='Celery hearts simmered in stock, cooled in it, and dressed with oil, vinegar and herbs. A cool, savory salad from San Francisco’s Hotel St. Francis.',
  ingredients='''
1 lb celery | the pale inner stalks (hearts) of 2 bunches, halved lengthwise
^3 cup vegetable-broth | or chicken broth, closer to the original
3 tbsp olive-oil
1 tbsp red-wine-vinegar | or white wine vinegar
1/4 tsp salt
~1/4 tsp black-pepper | freshly ground
1 tbsp parsley | chopped
1 tbsp chives | snipped
''',
  steps=[
    'Trim the celery hearts so they lie flat, leaving the base on to hold the stalks together. Lay them in the pan and pour in the broth.',
    'Bring to a simmer, cover, and cook gently 15 to 20 minutes, until a knife slides in easily.',
    'Let the celery cool in the broth, then chill at least 1 hour.',
    'Lift the celery out and press it gently to squeeze out the broth (save the broth for soup). Lay it on plates.',
    'Shake the oil, vinegar, salt and pepper together, spoon over the celery, and scatter with the parsley and chives.',
  ],
  safety=[],
  make_ahead='Cook the celery up to 2 days ahead and keep it in its broth in the fridge; dress it just before serving.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours and eat within 3 days.', None),
  kids=None,
  swaps={'original_flavor': 'Simmer the celery in chicken broth, as Hirtzler did with his hen-and-veal stock.'},
  prep_day=dict(ahead='Simmer and chill the celery in its broth.', station='stove', oven_f=None, active=10, keeps_days=2),
  origin=dict(kitchen='st-francis', group='dishes', ref='menu for November 4', title='Celery Victor (Salad)',
    excerpt='Place celery in vessel and strain broth over same, and boil until soft. Allow to cool in the broth. When cold press the broth out of the celery gently with the hands, and place on plate. Season with salt, fresh-ground black pepper, chervil, and one-quarter white wine tarragon vinegar to three-quarters of olive oil.',
    story='Hirtzler, chef of the Hotel St. Francis in the early 1900s, named the dish after himself. His book is arranged as a year of daily menus, with recipes under each day.',
    changes='Hirtzler made his own stock from a hen and veal bones; we use vegetable or chicken broth. Chervil and tarragon vinegar can be hard to find, so we use parsley, chives and red or white wine vinegar.',
    links=[]))

R(id='delmonico-potatoes', name='Delmonico Potatoes', emoji='🥔', servings=6, serving_size='about ⅔ cup',
  meal=['side'], protein='vegetarian', method=['oven'], tags=['make-ahead'], prep=15, cook=50,
  equipment=['saucepan', '2-quart shallow baking dish', 'large skillet'],
  summary='Diced potatoes simmered in cream, topped with Parmesan and baked until golden. The St. Francis version of a Delmonico’s favorite.',
  ingredients='''
2 lb russet-potato | peeled
1 1/2 cup half-and-half | or 1 cup cream and ½ cup milk
1 tbsp unsalted-butter | plus more for the dish
1/2 tsp salt
~1/8 tsp black-pepper
~1 pinch nutmeg
1/2 cup parmesan | grated
''',
  steps=[
    'Boil the whole potatoes in salted water until just tender, 20 to 25 minutes. Drain, cool until you can handle them, and cut into ¼-inch dice.',
    'Heat the oven to 400°F and butter the baking dish.',
    'Simmer the half-and-half with the butter, salt, pepper and nutmeg in the skillet. Add the potatoes and simmer, stirring gently, until the cream thickens and coats them, 5 to 8 minutes. (This is “hashed in cream” potatoes.)',
    'Spread in the dish, sprinkle with the Parmesan, and bake 15 to 20 minutes, until bubbling and golden brown.',
  ],
  safety=[T_LEFTOVERS],
  make_ahead='Boil and dice the potatoes up to 2 days ahead and refrigerate.',
  freezer=(False, ''),
  leftovers=('Refrigerate within 2 hours; keeps 3 to 4 days. Reheat to 165°F.', None),
  kids='Kids can sprinkle the cheese.',
  swaps={},
  prep_day=dict(ahead='Boil, cool and dice the potatoes.', station='oven', oven_f=400, active=15, keeps_days=2),
  origin=dict(kitchen='st-francis', group='dishes', ref='menu for November 4', title='Delmonico Potatoes',
    excerpt='Put hashed in cream potatoes in a buttered shirred egg dish, sprinkle with grated Parmesan cheese, and bake in oven until brown.',
    story='The name points back to Delmonico’s in New York, though recipes under this name vary a great deal. This one is from Hirtzler’s 1919 book, printed with his Celery Victor.',
    changes='Hirtzler assumed the cook knew “hashed in cream” potatoes; we spell out that step.',
    links=[]))


# =====================================================================  S'mores (data/meals/recipes/smores.json)
SMORES = []
SMORES.append(dict(id='smores-from-scratch', name='S’mores from Scratch', emoji='🔥', servings=4, serving_size='2 s’mores',
  meal=['snack'], protein='', method=['grill', 'oven'], tags=['kid-friendly', 'quick'], prep=5, cook=5,
  equipment=['long roasting sticks or skewers (campfire)', 'or a baking sheet lined with foil (broiler)', 'kitchen torch (optional, for the plated version)'],
  summary='Homemade marshmallows, chocolate and graham crackers, toasted over a campfire or under the oven broiler. Plus a restaurant-style plate for a special night.',
  ingredients='''
S’mores:
8 sheet graham-crackers | homemade or store-bought, broken in half
8 each marshmallows | homemade 1½-inch squares, or large marshmallows
3 oz dark-chocolate | homemade or store-bought, in squares
Restaurant-style plate (optional):
?1/3 cup heavy-cream | for a quick ganache
?1 pinch sea-salt | flaky
''',
  steps=[
    'Campfire: let the fire burn down to glowing coals. Put a marshmallow on a long stick and hold it a few inches above the coals, turning slowly, until golden all over, 1 to 2 minutes. (If it catches fire, blow it out; some people like it charred.)',
    'Set a square of chocolate on half a graham cracker, slide the hot marshmallow on top, cap with the other half, and pull out the stick. Wait a minute; the marshmallow is very hot.',
    'Broiler: move a rack 4 to 6 inches below the broiler and heat it. Lay 8 cracker halves on the foil-lined sheet and top each with chocolate and a marshmallow.',
    'Broil 30 seconds to 2 minutes, watching the whole time, until the marshmallows are puffed and golden. Cap with the other cracker halves and press gently.',
    'Restaurant-style plate: heat the cream until it steams, pour it over 2 oz of the chopped chocolate, and stir into a smooth ganache. Swoosh a spoonful across each plate, crumble a graham cracker over it, stand two marshmallows on top, and brown them with a kitchen torch. Finish with a few flakes of salt.',
  ],
  safety=[],
  make_ahead='Make the marshmallows, chocolate and graham crackers days ahead; they keep for weeks.',
  freezer=(False, ''),
  leftovers=None,
  kids='A grown-up should supervise the fire and the broiler and work the torch. Teach kids to toast slowly above the coals, keep the stick pointed away from people, and let the marshmallow cool before biting.',
  swaps={'gluten_free': 'Use gluten-free graham-style crackers.', 'vegetarian': 'Marshmallows are made with gelatin, usually from pork or beef. For vegetarian s’mores, use store-bought marshmallows labeled gelatin-free.', 'milk_chocolate': 'Use milk chocolate, homemade (see the chocolate recipe’s note) or store-bought.'},
  prep_day=None,
  origin=None))


def build(lst, site):
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
        if lo and lo[1] and 'leftovers' not in tags:
            tags.append('leftovers')
        d = {
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
        }
        o = r.get('origin')
        if o:
            k = KITCHENS[o['kitchen']]
            d['origin'] = dict(o, chef=k['chef'], place=k['place'], book=k['book'], edition=k['edition'], status=k['status'],
                               scans=[{'label': a, 'url': b} for a, b in k['scans']], stars=k['stars'],
                               about={'label': k['about'][0], 'url': k['about'][1]} if k['about'] else None,
                               links=[{'label': a, 'url': b} for a, b in o.get('links', [])])
        out.append(d)
    return out


def main():
    for fn, lst, note in (('classics.json', RECIPES, 'From the great kitchens: our own adaptations of public-domain recipes (Escoffier 1907, Ranhofer 1894, Tschirky 1896, Hirtzler 1919).'),
                          ('smores.json', SMORES, 'S’mores from scratch.')):
        out = build(lst, SITE)
        path = os.path.join(SITE, 'data/meals/recipes', fn)
        with open(path, 'w') as fh:
            data = {'note': note + ' Edit scripts/meals/src/build_classics.py and run it; allergens, diet and guides are derived from the catalog.'}
            if fn == 'classics.json':
                data['kitchens'] = {k: dict(v, scans=[{'label': a, 'url': b} for a, b in v['scans']],
                                            about={'label': v['about'][0], 'url': v['about'][1]} if v['about'] else None) for k, v in KITCHENS.items()}
            data['recipes'] = out
            json.dump(data, fh, indent=1, ensure_ascii=False)
            fh.write('\n')
        print(fn, len(out), 'recipes')


if __name__ == '__main__':
    main()
