#!/usr/bin/env python3
"""Builds data/meals/catalog.json and meta.json for the Meal Prep section.

Item lines:  id | name | section | keep | g_per_cup | counts | buy | allergens | diet | fdc | query | guides | aliases | note
  counts : "each=110 clove=3"   (grams per count unit); count label after '#': "each=110#medium onion"
  buy    : packs "label=amount unit; ..."   or loose "~unit step"
  diet   : v (vegetarian) vg (vegan) gf (gluten-free); dairy-free is derived from allergens
  fdc    : numeric id seen in search results / earlier site data, or "" (looked up by name), or "proxy:<item-id>"
  flags at end of name: "*" = check the label (allergens/gluten vary by brand)
Preserves existing nutrition/fdc fills in catalog.json when re-run.
"""
import json, os, sys

SITE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/site'
OUT = os.path.join(SITE, 'data/meals')

SECTIONS = [
 ('produce', 'Produce'), ('meat', 'Meat and seafood'), ('deli', 'Deli'), ('dairy', 'Dairy and eggs'),
 ('bakery', 'Bakery and bread'), ('grains', 'Pasta, rice and grains'), ('canned', 'Canned and jarred'),
 ('baking', 'Baking'), ('spices', 'Spices and herbs'), ('condiments', 'Oils, sauces and condiments'),
 ('international', 'International'), ('breakfast', 'Cereal and breakfast'), ('snacks', 'Snacks, nuts and dried fruit'),
 ('frozen', 'Frozen'), ('beverages', 'Beverages'),
]

ITEMS = r"""
# ---------- PRODUCE: vegetables ----------
onion | Yellow onion | produce | counter | 160 | each=110#medium onion | ~each 1 | | vg gf | 170000 | Onions, raw | | onions, cooking onion |
red-onion | Red onion | produce | counter | 160 | each=110#medium red onion | ~each 1 | | vg gf | proxy:onion | Onions, raw | | purple onion |
sweet-onion | Sweet onion | produce | counter | 160 | each=150#sweet onion | ~each 1 | | vg gf | | Onions, sweet, raw | | Vidalia-type onion |
green-onions | Green onions | produce | fridge | 100 | each=15#green onion; bunch=100 | bunch=1 bunch | | vg gf | | Onions, spring or scallions (includes tops and bulb), raw | | scallions |
shallot | Shallot | produce | counter | 160 | each=40#shallot | ~each 1 | | vg gf | | Shallots, raw | | |
garlic | Garlic | produce | counter | 136 | clove=3; head=40 | head=1 head | | vg gf | 169230 | Garlic, raw | | garlic cloves | A head has about 10 to 12 cloves.
minced-garlic-jar | Minced garlic (jar) | produce | fridge | 230 | | 4.5-oz jar=4.5 oz | | vg gf | proxy:garlic | Garlic, raw | | jarred garlic | About 1/2 teaspoon equals 1 clove.
ginger | Fresh ginger | produce | fridge | 96 | piece=28#1-inch piece | ~oz 2 | | vg gf | | Ginger root, raw | | ginger root |
leek | Leek | produce | fridge | 89 | each=90#leek | ~each 1 | | vg gf | | Leeks, (bulb and lower leaf-portion), raw | | |
russet-potato | Russet potatoes | produce | counter | 150 | each=213#medium russet potato | 5-lb bag=5 lb; 3-lb bag=3 lb |  | vg gf | 170027 | Potatoes, russet, flesh and skin, raw |  | baking potatoes, Idaho potatoes | 
yukon-potato | Yellow (Yukon-type) potatoes | produce | counter | 150 | each=170#medium yellow potato | 3-lb bag=3 lb; 5-lb bag=5 lb | | vg gf | 170026 | Potatoes, flesh and skin, raw | | gold potatoes |
red-potato | Red potatoes | produce | counter | 150 | each=170#medium red potato | 3-lb bag=3 lb; 5-lb bag=5 lb | | vg gf | | Potatoes, red, flesh and skin, raw | | |
baby-potatoes | Baby potatoes | produce | counter | 150 | | 1.5-lb bag=1.5 lb | | vg gf | | Potatoes, red, flesh and skin, raw | | new potatoes, creamer potatoes |
sweet-potato | Sweet potatoes | produce | counter | 133 | each=130#medium sweet potato | ~lb 0.5 | | vg gf | 168482 | Sweet potato, raw, unprepared | | yams |
carrot | Carrots | produce | fridge | 128 | each=61#medium carrot | 2-lb bag=2 lb; 1-lb bag=1 lb | | vg gf | 170393 | Carrots, raw | | |
baby-carrots | Baby carrots | produce | fridge | 128 | each=10#baby carrot | 1-lb bag=1 lb | | vg gf | | Carrots, baby, raw | | |
celery | Celery | produce | fridge | 101 | stalk=40#celery stalk; bunch=450 | bunch=1 bunch | | vg gf | | Celery, raw | | celery ribs |
green-bell-pepper | Green bell pepper | produce | fridge | 149 | each=119#green bell pepper | ~each 1 | | vg gf | | Peppers, sweet, green, raw | | |
red-bell-pepper | Red bell pepper | produce | fridge | 149 | each=119#red bell pepper | ~each 1 | | vg gf | | Peppers, sweet, red, raw | | |
yellow-bell-pepper | Yellow or orange bell pepper | produce | fridge | 149 | each=186#yellow bell pepper | ~each 1 | | vg gf | | Peppers, sweet, yellow, raw | | orange bell pepper |
jalapeno | Jalapeño pepper | produce | fridge | 90 | each=14#jalapeño | ~each 1 | | vg gf | | Peppers, jalapeno, raw | | |
poblano | Poblano pepper | produce | fridge | 90 | each=110#poblano | ~each 1 | | vg gf | | Peppers, hot chili, green, raw | | |
tomato | Tomatoes | produce | counter | 180 | each=123#medium tomato | ~each 1 | | vg gf | 170457 | Tomatoes, red, ripe, raw, year round average | | slicing tomatoes |
roma-tomato | Roma tomatoes | produce | counter | 180 | each=62#Roma tomato | ~each 1 | | vg gf | proxy:tomato | Tomatoes, red, ripe, raw, year round average | | plum tomatoes |
cherry-tomatoes | Cherry or grape tomatoes | produce | fridge | 149 | each=17#cherry tomato | 1-pint container=10 oz | | vg gf | proxy:tomato | Tomatoes, red, ripe, raw, year round average | | grape tomatoes |
romaine | Romaine lettuce | produce | fridge | 47 | head=626#head of romaine; heart=300#romaine heart; leaf=20#romaine leaf | ~head 1 | | vg gf | | Lettuce, cos or romaine, raw | | romaine hearts |
iceberg | Iceberg lettuce | produce | fridge | 72 | head=539#head of iceberg | ~head 1 | | vg gf | | Lettuce, iceberg (includes crisphead types), raw | | |
green-leaf-lettuce | Green leaf lettuce | produce | fridge | 36 | head=360#head of leaf lettuce; leaf=15#lettuce leaf | ~head 1 | | vg gf | | Lettuce, green leaf, raw | | |
salad-mix | Salad greens (bagged) | produce | fridge | 36 | | 5-oz bag=5 oz; 10-oz bag=10 oz | | vg gf | proxy:green-leaf-lettuce | Lettuce, green leaf, raw | | spring mix, mixed greens |
spinach | Baby spinach | produce | fridge | 30 | | 5-oz bag=5 oz; 10-oz bag=10 oz | | vg gf | 168462 | Spinach, raw | | spinach |
kale | Kale | produce | fridge | 21 | bunch=200 | bunch=1 bunch | | vg gf | 168421 | Kale, raw | | |
arugula | Arugula | produce | fridge | 20 | | 5-oz container=5 oz | | vg gf | | Arugula, raw | | rocket |
cabbage | Green cabbage | produce | fridge | 89 | head=900#head of cabbage | ~head 1 | | vg gf | 169975 | Cabbage, raw | | |
red-cabbage | Red cabbage | produce | fridge | 89 | head=900#head of red cabbage | ~head 1 | | vg gf | | Cabbage, red, raw | | purple cabbage |
coleslaw-mix | Coleslaw mix (bagged) | produce | fridge | 70 | | 14-oz bag=14 oz | | vg gf | proxy:cabbage | Cabbage, raw | | shredded cabbage |
bok-choy | Bok choy | produce | fridge | 70 | head=400#head of bok choy | ~lb 0.5 | | vg gf | | Cabbage, chinese (pak-choi), raw | | baby bok choy |
broccoli | Broccoli | produce | fridge | 91 | head=225#head of broccoli | ~head 1; 12-oz bag of florets=12 oz | | vg gf | 170379 | Broccoli, raw | | broccoli florets, broccoli crowns |
cauliflower | Cauliflower | produce | fridge | 107 | head=575#head of cauliflower | ~head 1 | | vg gf | | Cauliflower, raw | | |
brussels-sprouts | Brussels sprouts | produce | fridge | 88 | | 1-lb bag=1 lb | | vg gf | | Brussels sprouts, raw | | |
zucchini | Zucchini | produce | fridge | 124 | each=196#medium zucchini | ~each 1 | | vg gf | | Squash, summer, zucchini, includes skin, raw | | courgette |
yellow-squash | Yellow squash | produce | fridge | 113 | each=196#medium yellow squash | ~each 1 | | vg gf | | Squash, summer, crookneck and straightneck, raw | | summer squash |
butternut-squash | Butternut squash | produce | counter | 140 | each=1100#butternut squash | ~each 1 | | vg gf | | Squash, winter, butternut, raw | | |
acorn-squash | Acorn squash | produce | counter | 140 | each=630#acorn squash | ~each 1 | | vg gf | | Squash, winter, acorn, raw | | |
spaghetti-squash | Spaghetti squash | produce | counter | 101 | each=1300#spaghetti squash | ~each 1 | | vg gf | | Squash, winter, spaghetti, raw | | |
cucumber | Cucumber | produce | fridge | 104 | each=301#cucumber | ~each 1 | | vg gf | 168409 | Cucumber, with peel, raw | | |
mushrooms | White mushrooms | produce | fridge | 70 | each=18#mushroom | 8-oz package=8 oz; 16-oz package=16 oz | | vg gf | | Mushrooms, white, raw | | button mushrooms |
cremini | Cremini mushrooms | produce | fridge | 72 | each=20#cremini mushroom | 8-oz package=8 oz | | vg gf | | Mushrooms, brown, italian, or crimini, raw | | baby bella mushrooms |
corn-on-cob | Sweet corn on the cob | produce | fridge | 145 | ear=102#ear of corn | ~ear 1 | | vg gf | 169998 | Corn, sweet, yellow, raw | | ears of corn |
green-beans | Green beans (fresh) | produce | fridge | 110 | | ~lb 0.25; 12-oz bag=12 oz | | vg gf | 169961 | Beans, snap, green, raw | | string beans, snap beans |
asparagus | Asparagus | produce | fridge | 134 | each=16#spear | bunch=1 lb | | vg gf | 168389 | Asparagus, raw | | |
snap-peas | Snap peas | produce | fridge | 63 | | 8-oz bag=8 oz | | vg gf | | Peas, edible-podded, raw | | sugar snap peas, snow peas |
eggplant | Eggplant | produce | counter | 82 | each=458#eggplant | ~each 1 | | vg gf | 169228 | Eggplant, raw | | |
beets | Beets | produce | fridge | 136 | each=82#beet | bunch=1.5 lb | | vg gf | 169145 | Beets, raw | | |
radishes | Radishes | produce | fridge | 116 | each=5#radish | bunch=8 oz | | vg gf | 169276 | Radishes, raw | | |
parsnips | Parsnips | produce | fridge | 133 | each=170#parsnip | 1-lb bag=1 lb | | vg gf | 170417 | Parsnips, raw | | |
turnips | Turnips | produce | fridge | 130 | each=122#turnip | ~lb 0.5 | | vg gf | | Turnips, raw | | |
collards | Collard greens | produce | fridge | 36 | bunch=400 | bunch=1 bunch | | vg gf | 170406 | Collards, raw | | |
swiss-chard | Swiss chard | produce | fridge | 36 | bunch=300 | bunch=1 bunch | | vg gf | 169991 | Chard, swiss, raw | | chard |
okra | Okra | produce | fridge | 100 | | ~lb 0.5 | | vg gf | | Okra, raw | | |
pumpkin | Pie pumpkin | produce | counter | 116 | each=1800#pie pumpkin | ~each 1 | | vg gf | 168448 | Pumpkin, raw | | sugar pumpkin |
avocado | Avocado | produce | counter | 230 | each=150#avocado | ~each 1 | | vg gf | 171705 | Avocados, raw, all commercial varieties | | |
cilantro | Fresh cilantro | produce | fridge | 16 | bunch=60; sprig=1 | bunch=1 bunch | | vg gf | | Coriander (cilantro) leaves, raw | differences#herbs | coriander leaves |
parsley | Fresh parsley | produce | fridge | 60 | bunch=60; sprig=1 | bunch=1 bunch | | vg gf | 170416 | Parsley, fresh | differences#herbs | flat-leaf parsley, Italian parsley |
basil | Fresh basil | produce | fridge | 21 | bunch=30; leaf=0.5 | 0.75-oz package=0.75 oz | | vg gf | 172232 | Basil, fresh | differences#herbs | |
dill | Fresh dill | produce | fridge | 9 | sprig=1 | 0.75-oz package=0.75 oz | | vg gf | | Dill weed, fresh | differences#herbs | |
rosemary | Fresh rosemary | produce | fridge | 27 | sprig=1 | 0.75-oz package=0.75 oz | | vg gf | | Rosemary, fresh | differences#herbs | |
thyme | Fresh thyme | produce | fridge | 38 | sprig=0.5 | 0.75-oz package=0.75 oz | | vg gf | | Thyme, fresh | differences#herbs | |
mint | Fresh mint | produce | fridge | 54 | sprig=1; leaf=0.1 | 0.75-oz package=0.75 oz | | vg gf | | Spearmint, fresh | differences#herbs | |
chives | Fresh chives | produce | fridge | 48 | | 0.75-oz package=0.75 oz | | vg gf | | Chives, raw | differences#herbs | |
serrano | Serrano pepper | produce | fridge | 105 | each=6#serrano | ~each 1 | | vg gf | | Peppers, serrano, raw | | |
anaheim | Anaheim pepper | produce | fridge | 90 | each=45#Anaheim pepper | ~each 1 | | vg gf | | Peppers, hot chili, green, raw | | green chile |
fennel | Fennel bulb | produce | fridge | 87 | each=234#fennel bulb | ~each 1 | | vg gf | | Fennel, bulb, raw | | |
jicama | Jicama | produce | counter | 120 | each=600#jicama | ~each 1 | | vg gf | | Yambean (jicama), raw | | |
# ---------- PRODUCE: fruit ----------
lemon | Lemon | produce | fridge | 212 | each=84#lemon | ~each 1 | | vg gf | | Lemons, raw, without peel | | |
lime | Lime | produce | fridge | 210 | each=67#lime | ~each 1 | | vg gf | | Limes, raw | | |
orange | Orange | produce | fridge | 180 | each=131#orange | ~each 1; 4-lb bag=4 lb | | vg gf | | Oranges, raw, all commercial varieties | | navel orange |
clementine | Clementines | produce | fridge | 195 | each=74#clementine | 3-lb bag=3 lb | | vg gf | | Clementines, raw | | mandarins, cuties |
apple | Apples | produce | fridge | 125 | each=182#medium apple | ~each 1; 3-lb bag=3 lb | | vg gf | 171688 | Apples, raw, with skin (Includes foods for USDA's Food Distribution Program) | | |
banana | Bananas | produce | counter | 150 | each=118#medium banana | ~each 1 | | vg gf | | Bananas, raw | | |
grapes | Grapes | produce | fridge | 151 | | ~lb 1 | | vg gf | | Grapes, red or green (European type, such as Thompson seedless), raw | | seedless grapes |
strawberries | Strawberries | produce | fridge | 152 | each=12#strawberry | 1-lb container=1 lb | | vg gf | 167762 | Strawberries, raw | | |
blueberries | Blueberries | produce | fridge | 148 | | 1-pint container=11 oz; 6-oz container=6 oz | | vg gf | 171711 | Blueberries, raw | | |
raspberries | Raspberries | produce | fridge | 123 | | 6-oz container=6 oz | | vg gf | 167755 | Raspberries, raw | | |
blackberries | Blackberries | produce | fridge | 144 | | 6-oz container=6 oz | | vg gf | 173946 | Blackberries, raw | | |
pear | Pears | produce | counter | 140 | each=178#pear | ~each 1 | | vg gf | 169118 | Pears, raw | | |
peach | Peaches | produce | counter | 154 | each=150#peach | ~each 1 | | vg gf | 169928 | Peaches, yellow, raw | | |
nectarine | Nectarines | produce | counter | 143 | each=142#nectarine | ~each 1 | | vg gf | | Nectarines, raw | | |
plum | Plums | produce | counter | 165 | each=66#plum | ~each 1 | | vg gf | 169949 | Plums, raw | | |
cherries | Sweet cherries | produce | fridge | 138 | | ~lb 1 | | vg gf | 171719 | Cherries, sweet, raw | | |
cantaloupe | Cantaloupe | produce | counter | 160 | each=1100#cantaloupe | ~each 1 | | vg gf | 169092 | Melons, cantaloupe, raw | | muskmelon |
watermelon | Watermelon | produce | counter | 152 | each=4500#small watermelon | ~each 1 | | vg gf | 167765 | Watermelon, raw | | |
honeydew | Honeydew melon | produce | counter | 170 | each=1600#honeydew | ~each 1 | | vg gf | | Melons, honeydew, raw | | |
pineapple | Pineapple | produce | counter | 165 | each=905#pineapple | ~each 1 | | vg gf | | Pineapple, raw, all varieties | | |
mango | Mango | produce | counter | 165 | each=200#mango | ~each 1 | | vg gf | | Mangos, raw | | |
kiwi | Kiwifruit | produce | fridge | 180 | each=69#kiwi | ~each 1 | | vg gf | | Kiwifruit, green, raw | | kiwi |
grapefruit | Grapefruit | produce | fridge | 230 | each=246#grapefruit | ~each 1 | | vg gf | | Grapefruit, raw, pink and red, all areas | | |
cranberries | Fresh cranberries | produce | fridge | 100 | | 12-oz bag=12 oz | | vg gf | | Cranberries, raw | | |
apricot | Apricots | produce | counter | 155 | each=35#apricot | ~each 1 | | vg gf | | Apricots, raw | | |
pomegranate | Pomegranate | produce | counter | 174 | each=282#pomegranate | ~each 1 | | vg gf | | Pomegranates, raw | | |
dates | Medjool dates | snacks | pantry | 178 | each=24#date | 12-oz container=12 oz | | vg gf | | Dates, medjool | | |
# ---------- MEAT AND SEAFOOD ----------
ground-beef-80 | Ground beef, 80% lean | meat | fridge | 225 | | 1-lb package=1 lb; 2-lb package=2 lb; 3-lb package=3 lb | | gf | 174036 | Beef, ground, 80% lean meat / 20% fat, raw | differences#ground-beef | hamburger meat, ground chuck |
ground-beef-85 | Ground beef, 85% lean | meat | fridge | 225 |  | 1-lb package=1 lb; 2-lb package=2 lb |  | gf | 171796 | Beef, ground, 85% lean meat / 15% fat, raw | differences#ground-beef | ground round | 
ground-beef-90 | Ground beef, 90% lean | meat | fridge | 225 | | 1-lb package=1 lb | | gf | | Beef, ground, 90% lean meat / 10% fat, raw | differences#ground-beef | ground sirloin |
ground-beef-93 | Ground beef, 93% lean | meat | fridge | 225 | | 1-lb package=1 lb | | gf | | Beef, ground, 93% lean meat / 7% fat, raw | differences#ground-beef | extra-lean ground beef |
chuck-roast | Beef chuck roast | meat | fridge | | | ~lb 0.5 | | gf | | Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw | | pot roast, shoulder roast |
stew-beef | Beef stew meat | meat | fridge | 150 | | 1-lb package=1 lb; 2-lb package=2 lb | | gf | | Beef, chuck for stew, separable lean and fat, all grades, raw | | beef for stew |
beef-soup-bones | Beef soup bones (shank, neck or knuckle) | meat | fridge | | | ~lb 0.5 | | gf | proxy:stew-beef | Beef, chuck for stew, separable lean and fat, all grades, raw | | beef shanks, marrow bones | For stock. Nutrition is estimated from stew beef; the stock recipe uses USDA's figures for home-made stock.
sirloin-steak | Top sirloin steak | meat | fridge | | each=280#8-oz steak | ~lb 0.25 | | gf | | Beef, top sirloin, steak, separable lean and fat, trimmed to 1/8" fat, all grades, raw | | sirloin |
flank-steak | Flank steak | meat | fridge | | | ~lb 0.25 | | gf | | Beef, flank, steak, separable lean and fat, trimmed to 0" fat, choice, raw | | |
ribeye-steak | Ribeye steak | meat | fridge |  | each=340#12-oz steak | ~lb 0.25 |  | gf |  | Beef, rib, eye, small end (ribs 10-12), separable lean and fat, trimmed to 0" fat, choice, raw |  | rib eye | 
brisket | Beef brisket | meat | fridge |  |  | ~lb 0.5 |  | gf |  | Beef, brisket, flat half, boneless, separable lean and fat, trimmed to 0" fat, all grades, raw |  |  | 
beef-roast-round | Beef eye of round roast | meat | fridge | | | ~lb 0.5 | | gf | | Beef, round, eye of round, roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw | | round roast |
chicken-breast | Chicken breasts, boneless skinless | meat | fridge | 140 | breast=225#boneless chicken breast | ~lb 0.25; 2-lb package=2 lb |  | gf | 171077 | Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw | differences#chicken-cuts | chicken breast | 
chicken-tenders | Chicken tenderloins | meat | fridge | 140 | each=40#tenderloin | 1-lb package=1 lb; 2-lb package=2 lb | | gf | proxy:chicken-breast | Chicken, broilers or fryers, breast, meat only, raw | differences#chicken-cuts | chicken tenders |
chicken-thighs | Chicken thighs, boneless skinless | meat | fridge | 140 | thigh=110#boneless thigh | ~lb 0.25; 2-lb package=2 lb | | gf | | Chicken, broilers or fryers, dark meat, thigh, meat only, raw | differences#chicken-cuts | boneless thighs |
chicken-thighs-bone-in | Chicken thighs, bone-in skin-on | meat | fridge |  | thigh=170#bone-in thigh | ~lb 0.25; 3-lb package=3 lb |  | gf |  | Chicken, broilers or fryers, thigh, meat and skin, raw | differences#chicken-cuts |  | Weights are as bought, bone included, so nutrition estimates run a little high.
chicken-drumsticks | Chicken drumsticks | meat | fridge |  | each=115#drumstick | ~lb 0.25; 3-lb package=3 lb |  | gf |  | Chicken, broilers or fryers, drumstick, meat and skin, raw | differences#chicken-cuts | chicken legs | Weights are as bought, bone included, so nutrition estimates run a little high.
chicken-wings | Chicken wings | meat | fridge |  | each=90#wing | ~lb 0.25 |  | gf |  | Chicken, broilers or fryers, wing, meat and skin, raw |  |  | Weights are as bought, bone included, so nutrition estimates run a little high.
whole-chicken | Whole chicken | meat | fridge | | each=1800#4-lb chicken | ~each 1 | | gf | | Chicken, broilers or fryers, meat and skin, raw | | roaster, fryer |
ground-chicken | Ground chicken | meat | fridge | 225 | | 1-lb package=1 lb | | gf | | Chicken, ground, raw | | |
ground-turkey | Ground turkey, 93% lean | meat | fridge | 225 | | 1-lb package=1 lb; 3-lb package=3 lb | | gf | | Turkey, ground, 93% lean, 7% fat, raw | | |
turkey-breast | Turkey breast, bone-in | meat | fridge |  |  | ~lb 0.5 |  | gf |  | Turkey, whole, breast, meat only, raw |  |  | Weights are as bought, bone included, so nutrition estimates run a little high.
pork-chops | Pork chops, boneless | meat | fridge | | chop=170#boneless pork chop | ~lb 0.25 | | gf | | Pork, fresh, loin, center loin (chops), boneless, separable lean and fat, raw | | loin chops |
pork-chops-bone-in | Pork chops, bone-in | meat | fridge | | chop=225#bone-in pork chop | ~lb 0.25 | | gf | | Pork, fresh, loin, center loin (chops), bone-in, separable lean and fat, raw | | |
pork-shoulder | Pork shoulder (Boston butt) | meat | fridge | | | ~lb 0.5 | | gf | | Pork, fresh, shoulder, whole, separable lean and fat, raw | | pork butt |
pork-tenderloin | Pork tenderloin | meat | fridge | | each=550#pork tenderloin | ~each 1 | | gf | | Pork, fresh, loin, tenderloin, separable lean and fat, raw | | |
pork-loin-roast | Pork loin roast | meat | fridge | | | ~lb 0.5 | | gf | | Pork, fresh, loin, whole, separable lean and fat, raw | | |
ground-pork | Ground pork | meat | fridge | 225 | | 1-lb package=1 lb | | gf | | Pork, fresh, ground, raw | | |
bacon | Bacon* | meat | fridge | | strip=28#slice of bacon | 12-oz package=12 oz; 16-oz package=16 oz | | gf | | Pork, cured, bacon, unprepared | | |
italian-sausage | Italian sausage* | meat | fridge | 225 | link=100#sausage link | 1-lb package=1 lb; 19-oz package=19 oz |  |  | 171631 | Sausage, Italian, pork, mild, raw |  | sweet or hot Italian sausage | Sold as links or bulk; check the label for gluten.
breakfast-sausage | Breakfast sausage* | meat | fridge | 225 | link=25#breakfast link | 12-oz package=12 oz; 1-lb roll=1 lb |  |  | 172934 | Pork sausage, link/patty, unprepared |  | pork sausage | 
smoked-sausage | Smoked sausage* | meat | fridge | 140 | each=397#14-oz rope | 14-oz package=14 oz | | | | Sausage, smoked link sausage, pork | | kielbasa |
ham-steak | Ham steak* | meat | fridge | 140 | | 1-lb package=1 lb | | | | Ham, sliced, regular (approximately 11% fat) | | |
hot-dogs | Hot dogs* | meat | fridge | | each=45#hot dog | 8-count package=8 each | | | | Frankfurter, beef, unheated | | franks, wieners |
salmon | Salmon fillets | meat | fridge | | fillet=170#6-oz fillet | ~lb 0.25 | fish | gf | | Fish, salmon, Atlantic, farmed, raw | | |
cod | Cod fillets | meat | fridge | | fillet=170#6-oz fillet | ~lb 0.25 | fish | gf | | Fish, cod, Atlantic, raw | | white fish |
tilapia | Tilapia fillets | meat | fridge | | fillet=115#4-oz fillet | ~lb 0.25; 2-lb frozen bag=2 lb | fish | gf | | Fish, tilapia, raw | | |
shrimp | Shrimp, raw, peeled | meat | fridge | 145 | each=12#large shrimp | 1-lb bag=1 lb; 2-lb bag=2 lb | shellfish | gf | | Crustaceans, shrimp, raw | | prawns |
ground-lamb | Ground lamb | meat | fridge | 225 | | 1-lb package=1 lb | | gf | | Lamb, ground, raw | | |
short-ribs | Beef short ribs | meat | fridge |  |  | ~lb 0.5 |  | gf | 170826 | Beef, chuck, short ribs, boneless, separable lean and fat, trimmed to 0" fat, all grades, raw |  |  | FDC's entry is boneless short ribs; bone-in ribs weigh more for the same meat, so estimates run a little high.
cube-steak | Cube steak | meat | fridge | | each=113#cube steak | ~lb 0.25 | | gf | | Beef, round, top round, steak, separable lean and fat, trimmed to 1/8" fat, all grades, raw | | minute steak |
lamb-chops | Lamb loin chops | meat | fridge |  | chop=100#lamb chop | ~lb 0.25 |  | gf |  | Lamb, loin, separable lean and fat, trimmed to 1/4" fat, choice, raw |  |  | 
pork-ribs | Pork baby back ribs | meat | fridge |  |  | ~lb 0.5 |  | gf |  | Pork, fresh, backribs, separable lean and fat, raw |  | baby back ribs | Weights are as bought, bone included, so nutrition estimates run a little high.
spiral-ham | Spiral-cut ham (fully cooked)* | meat | fridge | | | ~lb 0.5 | | | | Ham, sliced, regular (approximately 11% fat) | | holiday ham |
turkey-bacon | Turkey bacon* | meat | fridge |  | strip=15#slice | 12-oz package=12 oz |  |  |  | Bacon, turkey, unprepared |  |  | 
chicken-sausage | Chicken sausage (fully cooked)* | meat | fridge | | link=85#link | 12-oz package=12 oz | | | | Sausage, chicken, beef, pork, skinless, smoked | | | FDC's closest entry mixes chicken, beef and pork; treat as rough.
catfish | Catfish fillets | meat | fridge | | fillet=140#fillet | ~lb 0.25 | fish | gf | | Fish, catfish, channel, farmed, raw | | |
scallops | Sea scallops | meat | fridge | | each=30#scallop | ~lb 0.25 | shellfish | gf | | Mollusks, scallop, mixed species, raw | | | Scallops are mollusks; FDA's major allergen rule covers crustacean shellfish, but many people allergic to shellfish avoid both.
# ---------- DELI ----------
deli-turkey | Sliced turkey (deli)* | deli | fridge | 140 | slice=28#slice | ~lb 0.25; 8-oz package=8 oz | | | | Turkey breast, sliced, prepackaged | | lunch meat, sandwich turkey |
deli-ham | Sliced ham (deli)* | deli | fridge | 140 | slice=28#slice | ~lb 0.25; 8-oz package=8 oz | | | | Ham, sliced, pre-packaged, deli meat (96%fat free, water added) | | |
deli-roast-beef | Sliced roast beef (deli)* | deli | fridge |  | slice=28#slice | ~lb 0.25 |  |  | 174570 | Roast beef, deli style, prepackaged, sliced |  |  | 
salami | Salami* | deli | fridge | | slice=10#slice | ~lb 0.25 | | | | Salami, cooked, beef and pork | | |
pepperoni | Pepperoni* | deli | fridge | 120 | slice=2#slice | 6-oz package=6 oz | | | | Pepperoni, beef and pork, sliced | | |
rotisserie-chicken | Rotisserie chicken* | deli | fridge | 140 | each=900#rotisserie chicken (meat) | 1 chicken=1 each |  |  | 171518 | Chicken, broilers or fryers, rotisserie, original seasoning, breast, meat only, cooked |  |  | One bird gives about 3 to 4 cups of meat.
deli-provolone | Sliced provolone (deli) | deli | fridge | | slice=21#slice | ~lb 0.25; 8-oz package=8 oz | milk | v gf | | Cheese, provolone | | |
hummus | Hummus* | deli | fridge | 246 | | 10-oz container=10 oz | sesame | vg gf | | Hummus, commercial | | |
fresh-salsa | Fresh salsa (refrigerated)* | deli | fridge | 260 | | 16-oz container=16 oz | | vg gf | proxy:salsa | Sauce, salsa, ready-to-serve | | pico de gallo |
# ---------- DAIRY AND EGGS ----------
eggs | Eggs, large | dairy | fridge | 243 | each=50#large egg | dozen=12 each; 18-count=18 each | eggs | v gf | | Egg, whole, raw, fresh | | |
pasteurized-eggs | Pasteurized eggs (in shell), large | dairy | fridge | 243 | each=50#large pasteurized egg | dozen=12 each | eggs | v gf | proxy:eggs | Egg, whole, raw, fresh | | pasteurized shell eggs | Heated in the shell to kill Salmonella; FDA advises them for anything served with raw egg, like homemade mayonnaise. Nutrition as for fresh eggs.
egg-whites | Liquid egg whites | dairy | fridge | 243 | | 16-oz carton=16 oz | eggs | v gf | | Egg, white, raw, fresh | | |
whole-milk | Whole milk | dairy | fridge | 244 | | half gallon=0.5 gallon; gallon=1 gallon | milk | v gf | | Milk, whole, 3.25% milkfat, with added vitamin D | | milk |
milk-2 | 2% milk | dairy | fridge | 244 | | half gallon=0.5 gallon; gallon=1 gallon | milk | v gf | | Milk, reduced fat, fluid, 2% milkfat, with added vitamin A and vitamin D | | reduced-fat milk |
milk-1 | 1% milk | dairy | fridge | 244 | | half gallon=0.5 gallon; gallon=1 gallon | milk | v gf | | Milk, lowfat, fluid, 1% milkfat, with added vitamin A and vitamin D | | low-fat milk |
skim-milk | Fat-free (skim) milk | dairy | fridge | 245 | | half gallon=0.5 gallon; gallon=1 gallon | milk | v gf | | Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim) | | nonfat milk |
buttermilk | Buttermilk | dairy | fridge | 245 | | 1-quart carton=1 quart | milk | v gf | | Milk, buttermilk, fluid, cultured, lowfat | | |
heavy-cream | Heavy cream | dairy | fridge | 238 | | 1-pint carton=1 pint; half pint=1 cup | milk | v gf | | Cream, fluid, heavy whipping | differences#cream | heavy whipping cream |
half-and-half | Half-and-half | dairy | fridge | 242 | | 1-pint carton=1 pint; 1-quart carton=1 quart | milk | v gf | | Cream, fluid, half and half | differences#cream | |
sour-cream | Sour cream | dairy | fridge | 230 | | 16-oz container=16 oz; 8-oz container=8 oz | milk | v gf | | Cream, sour, cultured | | |
cream-cheese | Cream cheese | dairy | fridge | 232 | | 8-oz block=8 oz | milk | v gf | | Cheese, cream | | |
cottage-cheese | Cottage cheese | dairy | fridge | 226 | | 16-oz container=16 oz; 24-oz container=24 oz | milk | v gf | | Cheese, cottage, lowfat, 2% milkfat | | |
ricotta | Ricotta cheese | dairy | fridge | 246 | | 15-oz container=15 oz; 32-oz container=32 oz | milk | v gf | | Cheese, ricotta, part skim milk | | |
mozzarella | Shredded mozzarella | dairy | fridge | 113 | | 8-oz bag=8 oz; 16-oz bag=16 oz | milk | v gf | | Cheese, mozzarella, low moisture, part-skim | | part-skim mozzarella |
fresh-mozzarella | Fresh mozzarella | dairy | fridge | 130 | | 8-oz ball=8 oz | milk | v gf | | Cheese, mozzarella, whole milk | | |
string-cheese | String cheese | dairy | fridge | | each=28#stick | 12-count=12 each | milk | v gf | proxy:mozzarella | Cheese, mozzarella, low moisture, part-skim | | cheese sticks |
cheddar | Shredded cheddar | dairy | fridge | 113 | slice=28#slice | 8-oz bag=8 oz; 16-oz bag=16 oz | milk | v gf | 173414 | Cheese, cheddar |  | sharp cheddar, mild cheddar | 
cheddar-block | Cheddar cheese (block) | dairy | fridge | 113 | | 8-oz block=8 oz | milk | v gf | proxy:cheddar | Cheese, cheddar | | |
monterey-jack | Monterey Jack cheese | dairy | fridge | 113 | | 8-oz bag=8 oz | milk | v gf | | Cheese, monterey | | pepper jack |
mexican-cheese | Mexican-style shredded cheese blend | dairy | fridge | 113 |  | 8-oz bag=8 oz; 16-oz bag=16 oz | milk | v gf |  | Cheese, Mexican blend |  | taco cheese | 
parmesan | Grated Parmesan | dairy | fridge | 100 | | 8-oz container=8 oz | milk | v gf | | Cheese, parmesan, grated | | parmigiano | Traditional Parmigiano-Reggiano is made with animal rennet; check the label if that matters to you.
parmesan-wedge | Parmesan (wedge) | dairy | fridge | 80 | | ~oz 4 | milk | v gf | | Cheese, parmesan, hard | | |
swiss | Swiss cheese | dairy | fridge | | slice=28#slice | 8-oz package=8 oz | milk | v gf | | Cheese, swiss | | |
american-cheese | American cheese slices | dairy | fridge | | slice=21#slice | 16-slice package=16 slice | milk | v gf | | Cheese, pasteurized process, American, fortified with vitamin D | | |
feta | Crumbled feta | dairy | fridge | 150 | | 4-oz container=4 oz | milk | v gf | | Cheese, feta | | |
plain-yogurt | Plain yogurt (whole milk) | dairy | fridge | 245 | | 32-oz container=32 oz | milk | v gf | | Yogurt, plain, whole milk | | |
greek-yogurt | Plain Greek yogurt | dairy | fridge | 245 | each=170#single cup | 32-oz container=32 oz; 5.3-oz cup=5.3 oz | milk | v gf | 170894 | Yogurt, Greek, plain, nonfat |  |  | 
vanilla-yogurt | Vanilla yogurt | dairy | fridge | 245 | each=170#single cup | 32-oz container=32 oz; 6-oz cup=6 oz | milk | v gf | 170888 | Yogurt, vanilla, low fat |  |  | 
butter | Butter, salted | dairy | fridge | 227 | stick=113#stick | 1-lb box (4 sticks)=4 stick | milk | v gf | 173410 | Butter, salted | fats; differences#butter | |
unsalted-butter | Butter, unsalted | dairy | fridge | 227 | stick=113#stick | 1-lb box (4 sticks)=4 stick | milk | v gf | 173430 | Butter, without salt | fats; differences#butter | sweet butter |
ghee | Ghee | condiments | pantry | 205 | | 13-oz jar=13 oz | milk | v gf | | Butter oil, anhydrous | fats | clarified butter | Ghee is nearly all fat; people with milk allergy should still avoid it unless a doctor says otherwise.
almond-milk | Almond milk, unsweetened | dairy | fridge | 240 | | half gallon=0.5 gallon | tree-nuts | vg gf | | Beverages, almond milk, unsweetened, shelf stable | | |
soy-milk | Soy milk | dairy | fridge | 243 | | half gallon=0.5 gallon | soybeans | vg gf | | Soymilk, original and vanilla, unfortified | | soymilk |
orange-juice | Orange juice | dairy | fridge | 248 | | 52-oz carton=52 fl-oz | | vg gf | | Orange juice, chilled, includes from concentrate | | OJ |
biscuit-dough | Refrigerated biscuit dough* | dairy | fridge |  | each=57#biscuit | 8-count can=8 each | wheat | v | 172668 | Biscuits, plain or buttermilk, refrigerated dough, higher fat |  |  | 
pie-crust | Refrigerated pie crust* | dairy | fridge | | sheet=220#9-inch crust | 2-crust box=2 sheet | wheat | v | | Pie crust, refrigerated, regular, unbaked | | |
tofu | Firm tofu | dairy | fridge | 252 | | 14-oz block=14 oz | soybeans | vg gf | | Tofu, raw, firm, prepared with calcium sulfate | | bean curd |
italian-cheese | Italian-style shredded cheese blend | dairy | fridge | 113 | | 8-oz bag=8 oz | milk | v gf | proxy:mozzarella | Cheese, mozzarella, low moisture, part-skim | | |
colby-jack | Colby Jack cheese | dairy | fridge | 113 | slice=21#slice | 8-oz bag=8 oz | milk | v gf | | Cheese, colby | | |
goat-cheese | Goat cheese | dairy | fridge | 150 | | 4-oz log=4 oz | milk | v gf | | Cheese, goat, soft type | | chevre | Goat's milk counts as milk for allergies.
blue-cheese | Crumbled blue cheese | dairy | fridge | 135 | | 4-oz container=4 oz | milk | v gf | | Cheese, blue | | |
whipped-cream | Whipped cream (aerosol) | dairy | fridge | 60 | | 6.5-oz can=6.5 oz | milk | v gf | | Cream, whipped, cream topping, pressurized | | |
kefir | Kefir, plain | dairy | fridge | 243 |  | 32-oz bottle=32 fl-oz | milk | v gf | 170904 | Kefir, lowfat, plain, LIFEWAY |  |  | 
margarine | Margarine or buttery spread* | dairy | fridge | 227 | stick=113#stick | 15-oz tub=15 oz |  | vg gf | 171434 | Margarine-like, vegetable oil spread, approximately 37% fat, unspecified oils, with salt, with added vitamin D | fats |  | Some spreads contain milk; check the label.
refrigerated-ravioli | Refrigerated cheese ravioli* | dairy | fridge |  |  | 20-oz package=20 oz | wheat milk eggs | v | 172094 | Tortellini, pasta with cheese filling, fresh-refrigerated, as purchased |  |  | Nutrition from FDC's prepared cheese-filled pasta; treat as rough.
# ---------- BAKERY AND BREAD ----------
white-bread | Sandwich bread, white* | bakery | counter | | slice=28#slice | 20-oz loaf=20 oz | wheat | v | | Bread, white, commercially prepared (includes soft bread crumbs) | | |
wheat-bread | Sandwich bread, whole wheat* | bakery | counter | | slice=32#slice | 20-oz loaf=20 oz | wheat | v | | Bread, whole-wheat, commercially prepared | | whole-grain bread |
hamburger-buns | Hamburger buns* | bakery | counter | | each=44#bun | 8-count bag=8 each | wheat | v | | Rolls, hamburger or hotdog, plain | | |
hot-dog-buns | Hot dog buns* | bakery | counter | | each=44#bun | 8-count bag=8 each | wheat | v | proxy:hamburger-buns | Rolls, hamburger or hotdog, plain | | |
french-bread | French bread* | bakery | counter | | loaf=450#loaf; slice=25#slice | loaf=1 loaf | wheat | vg | | Bread, french or vienna (includes sourdough) | | baguette, Italian bread |
dinner-rolls | Dinner rolls* | bakery | counter | | each=28#roll | 12-count bag=12 each | wheat | v | | Rolls, dinner, plain, commercially prepared (includes brown-and-serve) | | |
hoagie-rolls | Sub rolls* | bakery | counter | | each=85#roll | 6-count bag=6 each | wheat | v | | Rolls, hard (includes kaiser) | | hoagie rolls |
english-muffins | English muffins* | bakery | counter |  | each=57#English muffin | 6-count=6 each | wheat | v |  | Muffins, English, plain, enriched, with ca prop (includes sourdough) |  |  | 
bagels | Bagels* | bakery | counter | | each=105#bagel | 6-count=6 each | wheat | v | | Bagels, plain, enriched, with calcium propionate (includes onion, poppy, sesame) | | |
flour-tortillas | Flour tortillas, 8-inch* | bakery | counter | | each=49#8-inch tortilla | 10-count=10 each | wheat | v | | Tortillas, ready-to-bake or -fry, flour, refrigerated | | |
large-flour-tortillas | Flour tortillas, 10-inch* | bakery | counter | | each=72#10-inch tortilla | 8-count=8 each | wheat | v | proxy:flour-tortillas | Tortillas, ready-to-bake or -fry, flour, refrigerated | | burrito tortillas |
corn-tortillas | Corn tortillas* | bakery | counter | | each=26#6-inch tortilla | 30-count=30 each | | vg gf | | Tortillas, ready-to-bake or -fry, corn | | |
pita | Pita bread* | bakery | counter | | each=60#6-inch pita | 6-count=6 each | wheat | vg | | Bread, pita, white, enriched | | |
taco-shells | Hard taco shells* | bakery | pantry | | each=13#taco shell | 12-count box=12 each | | vg gf | | Taco shells, baked | | |
breadcrumbs | Dry breadcrumbs* | baking | pantry | 108 | | 15-oz canister=15 oz | wheat | v | | Bread, crumbs, dry, grated, plain | | |
panko | Panko breadcrumbs* | baking | pantry | 50 | | 8-oz box=8 oz | wheat | vg | proxy:breadcrumbs | Bread, crumbs, dry, grated, plain | | |
croutons | Croutons* | bakery | pantry | 30 | | 5-oz bag=5 oz | wheat milk | v | | Croutons, seasoned | | |
gf-bread | Gluten-free sandwich bread* | bakery | counter | | slice=30#slice | 16-oz loaf=16 oz | eggs | v gf | | Bread, gluten-free, white, made with rice flour, corn starch, and/or tapioca | | | Check the label; recipes vary.
croissants | Croissants* | bakery | counter | | each=57#croissant | 6-count=6 each | wheat milk eggs | v | | Croissants, butter | | |
whole-wheat-tortillas | Whole wheat tortillas* | bakery | counter | | each=49#8-inch tortilla | 8-count=8 each | wheat | v | | Tortillas, ready-to-bake or -fry, whole wheat | | |
naan | Naan* | bakery | counter | | each=90#naan | 2-count=2 each | wheat milk | v | | Bread, naan, plain, commercially prepared, refrigerated | | |
sourdough | Sourdough bread* | bakery | counter | | slice=50#slice; loaf=680#loaf | loaf=1 loaf | wheat | vg | proxy:french-bread | Bread, french or vienna (includes sourdough) | | |
# ---------- PASTA, RICE AND GRAINS ----------
spaghetti | Spaghetti | grains | pantry | | | 1-lb box=1 lb | wheat | vg | | Pasta, dry, enriched | | |
penne | Penne | grains | pantry | 100 | | 1-lb box=1 lb | wheat | vg | proxy:spaghetti | Pasta, dry, enriched | | ziti, rigatoni |
elbow-macaroni | Elbow macaroni | grains | pantry | 105 | | 1-lb box=1 lb | wheat | vg | proxy:spaghetti | Pasta, dry, enriched | | macaroni |
rotini | Rotini | grains | pantry | 90 | | 1-lb box=1 lb | wheat | vg | proxy:spaghetti | Pasta, dry, enriched | | spirals |
lasagna-noodles | Lasagna noodles | grains | pantry | | sheet=19#noodle | 1-lb box=1 lb | wheat | vg | proxy:spaghetti | Pasta, dry, enriched | | |
egg-noodles | Egg noodles | grains | pantry | 38 | | 12-oz bag=12 oz | wheat eggs | v | | Noodles, egg, dry, enriched | | wide egg noodles |
whole-wheat-pasta | Whole wheat pasta | grains | pantry | 100 | | 1-lb box=1 lb | wheat | vg | | Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program) | | |
gf-pasta | Gluten-free pasta* | grains | pantry | 100 |  | 12-oz box=12 oz |  | vg gf | 168899 | Pasta, gluten-free, corn, dry |  |  | FDC has dry corn gluten-free pasta; blends vary.
white-rice | Long-grain white rice | grains | pantry | 185 | | 2-lb bag=2 lb; 5-lb bag=5 lb | | vg gf | | Rice, white, long-grain, regular, raw, enriched | differences#rice | |
jasmine-rice | Jasmine rice | grains | pantry | 185 | | 2-lb bag=2 lb | | vg gf | proxy:white-rice | Rice, white, long-grain, regular, raw, enriched | differences#rice | basmati rice |
brown-rice | Brown rice | grains | pantry | 185 |  | 2-lb bag=2 lb |  | vg gf | 169703 | Rice, brown, long-grain, raw | differences#rice |  | 
instant-rice | Instant white rice | grains | pantry | 95 | | 14-oz box=14 oz | | vg gf | | Rice, white, long-grain, precooked or instant, enriched, dry | differences#rice | minute rice |
quinoa | Quinoa | grains | pantry | 170 | | 12-oz bag=12 oz | | vg gf | | Quinoa, uncooked | | |
couscous | Couscous | grains | pantry | 173 | | 10-oz box=10 oz | wheat | vg | | Couscous, dry | | |
barley | Pearl barley | grains | pantry | 200 | | 16-oz bag=16 oz | wheat | vg | | Barley, pearled, raw | | | Barley contains gluten.
rice-noodles | Rice noodles | international | pantry | | | 14-oz package=14 oz | | vg gf | | Rice noodles, dry | | |
lentils | Dried lentils | grains | pantry | 192 | | 1-lb bag=1 lb | | vg gf | | Lentils, raw | differences#beans | brown lentils |
split-peas | Dried split peas | grains | pantry | 196 |  | 1-lb bag=1 lb |  | vg gf |  | Peas, green, split, mature seeds, raw | differences#beans |  | 
dried-black-beans | Dried black beans | grains | pantry | 194 | | 1-lb bag=1 lb | | vg gf | | Beans, black, mature seeds, raw | differences#beans | |
dried-pinto-beans | Dried pinto beans | grains | pantry | 193 |  | 1-lb bag=1 lb; 2-lb bag=2 lb |  | vg gf | 175199 | Beans, pinto, mature seeds, raw | differences#beans |  | 
dried-kidney-beans | Dried red kidney beans | grains | pantry | 184 | | 1-lb bag=1 lb | | vg gf | 175193 | Beans, kidney, all types, mature seeds, raw | differences#beans | |
cornmeal | Yellow cornmeal | baking | pantry | 122 | | 2-lb bag=2 lb | | vg gf | | Cornmeal, whole-grain, yellow | | |
masa-harina | Masa harina (corn flour for tortillas)* | baking | pantry | 114 | | 4.4-lb bag=4.4 lb | | vg gf | 169694 | Corn flour, masa, enriched, white | | instant corn masa flour, masa flour | Corn cooked with lime, dried and ground; plain cornmeal won't make tortillas.
grits | Quick grits | breakfast | pantry | 156 | | 24-oz canister=24 oz | | vg gf | | Cereals, corn grits, white, regular and quick, enriched, dry | | |
orzo | Orzo | grains | pantry | 170 | | 16-oz box=16 oz | wheat | vg | proxy:spaghetti | Pasta, dry, enriched | | |
arborio-rice | Arborio rice | grains | pantry | 200 | | 2-lb bag=2 lb | | vg gf | | Rice, white, medium-grain, raw, enriched | differences#rice | risotto rice |
wild-rice | Wild rice | grains | pantry | 160 | | 8-oz box=8 oz | | vg gf | | Wild rice, raw | differences#rice | |
bulgur | Bulgur wheat | grains | pantry | 140 | | 24-oz bag=24 oz | wheat | vg | | Bulgur, dry | | |
# ---------- CANNED AND JARRED ----------
crushed-tomatoes | Crushed tomatoes | canned | pantry | 242 | can=794#28-oz can | 28-oz can=1 can | | vg gf | | Tomatoes, crushed, canned | | |
diced-tomatoes | Diced tomatoes | canned | pantry | 240 | can=411#14.5-oz can | 14.5-oz can=1 can | | vg gf | | Tomatoes, red, ripe, canned, packed in tomato juice | | |
whole-tomatoes | Whole peeled tomatoes | canned | pantry | 240 | can=794#28-oz can | 28-oz can=1 can | | vg gf | proxy:diced-tomatoes | Tomatoes, red, ripe, canned, packed in tomato juice | | |
tomato-sauce | Tomato sauce | canned | pantry | 245 | can=425#15-oz can; small-can=227#8-oz can | 15-oz can=1 can; 8-oz can=1 small-can | | vg gf | | Tomato products, canned, sauce | | |
tomato-paste | Tomato paste | canned | pantry | 262 | can=170#6-oz can | 6-oz can=1 can |  | vg gf | 170459 | Tomato products, canned, paste, without salt added |  |  | 
marinara | Marinara or pasta sauce (jar)* | canned | pantry | 250 | jar=680#24-oz jar | 24-oz jar=1 jar | | vg gf | | Sauce, pasta, spaghetti/marinara, ready-to-serve | | spaghetti sauce |
salsa | Salsa (jar) | canned | pantry | 260 | jar=454#16-oz jar | 16-oz jar=1 jar | | vg gf | | Sauce, salsa, ready-to-serve | | |
black-beans | Black beans (canned) | canned | pantry | 172 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Beans, black, mature seeds, canned, low sodium | differences#beans | | A drained 15-oz can gives about 1 1/2 cups of beans.
kidney-beans | Kidney beans (canned) | canned | pantry | 256 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Beans, kidney, red, mature seeds, canned, solids and liquids | differences#beans | red beans |
pinto-beans | Pinto beans (canned) | canned | pantry | 240 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Beans, pinto, mature seeds, canned, solids and liquids | differences#beans | |
chickpeas | Chickpeas (canned) | canned | pantry | 240 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, solids and liquids | differences#beans | garbanzo beans |
white-beans | White beans (canned) | canned | pantry | 262 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Beans, great northern, mature seeds, canned | differences#beans | cannellini, great northern beans |
refried-beans | Refried beans* | canned | pantry | 250 | can=454#16-oz can | 16-oz can=1 can | | gf | | Refried beans, canned, traditional style | differences#beans | | Traditional refried beans may contain lard; vegetarian versions are labeled.
refried-beans-veg | Vegetarian refried beans* | canned | pantry | 250 | can=454#16-oz can | 16-oz can=1 can | | vg gf | | Refried beans, canned, vegetarian | differences#beans | fat-free refried beans |
baked-beans | Baked beans* | canned | pantry | 254 | can=794#28-oz can; small-can=454#16-oz can | 28-oz can=1 can; 16-oz can=1 small-can | | v gf | | Beans, baked, canned, plain or vegetarian | | |
canned-corn | Corn (canned) | canned | pantry | 165 | can=432#15.25-oz can | 15.25-oz can=1 can | | vg gf | | Corn, sweet, yellow, canned, whole kernel, drained solids | | |
canned-green-beans | Green beans (canned) | canned | pantry | 135 | can=411#14.5-oz can | 14.5-oz can=1 can | | vg gf | | Beans, snap, green, canned, regular pack, drained solids | | |
chicken-broth | Chicken broth* | canned | pantry | 240 | | 32-oz carton=1 quart; 14.5-oz can=14.5 fl-oz | | gf | | Soup, chicken broth, ready-to-serve | differences#stock-broth | chicken stock |
beef-broth | Beef broth* | canned | pantry | 240 |  | 32-oz carton=1 quart; 14.5-oz can=14.5 fl-oz |  | gf |  | Soup, beef broth or bouillon canned, ready-to-serve | differences#stock-broth | beef stock | 
vegetable-broth | Vegetable broth* | canned | pantry | 240 | | 32-oz carton=1 quart | | vg gf | | Soup, vegetable broth, ready to serve | differences#stock-broth | |
cream-of-mushroom | Condensed cream of mushroom soup* | canned | pantry | 251 | can=298#10.5-oz can | 10.5-oz can=1 can | wheat milk | v | | Soup, cream of mushroom, canned, condensed | | |
cream-of-chicken | Condensed cream of chicken soup* | canned | pantry | 251 | can=298#10.5-oz can | 10.5-oz can=1 can | wheat milk | | | Soup, cream of chicken, canned, condensed | | |
tomato-soup | Condensed tomato soup* | canned | pantry | 251 | can=305#10.75-oz can | 10.75-oz can=1 can | | vg | | Soup, tomato, canned, condensed | | |
coconut-milk | Coconut milk (canned) | international | pantry | 240 | can=400#13.5-oz can | 13.5-oz can=1 can | | vg gf | | Nuts, coconut milk, canned (liquid expressed from grated meat and water) | | | The FDA no longer lists coconut as a tree nut for labeling (2025 guidance).
evaporated-milk | Evaporated milk | canned | pantry | 252 | can=354#12-oz can | 12-oz can=1 can | milk | v gf |  | Milk, canned, evaporated, with added vitamin A |  |  | 
condensed-milk | Sweetened condensed milk | canned | pantry | 306 | can=397#14-oz can | 14-oz can=1 can | milk | v gf | | Milk, canned, condensed, sweetened | | |
green-chiles | Diced green chiles | canned | pantry | 139 | can=113#4-oz can | 4-oz can=1 can | | vg gf | | Peppers, hot chili, green, canned, pods, excluding seeds, solids and liquids | | |
black-olives | Sliced black olives | canned | pantry | 135 | can=64#2.25-oz can | 2.25-oz can=1 can | | vg gf | | Olives, ripe, canned (small-extra large) | | |
dill-pickles | Dill pickles | canned | fridge | 143 | each=35#pickle spear | 24-oz jar=24 oz | | vg gf | | Pickles, cucumber, dill or kosher dill | | pickle chips |
pickle-relish | Sweet pickle relish | condiments | fridge | 245 | | 10-oz jar=10 oz | | vg gf | | Pickle relish, sweet | | |
peanut-butter | Peanut butter | condiments | pantry | 258 |  | 16-oz jar=16 oz; 28-oz jar=28 oz | peanuts | vg gf | 174266 | Peanut butter, smooth style, with salt |  |  | 
almond-butter | Almond butter | condiments | pantry | 250 | | 12-oz jar=12 oz | tree-nuts | vg gf | | Nuts, almond butter, plain, without salt added | | |
sunflower-butter | Sunflower seed butter | condiments | pantry | 256 | | 16-oz jar=16 oz | | vg gf | | Seeds, sunflower seed butter, with salt added (Includes foods for USDA's Food Distribution Program) | | | A peanut-free spread for schools that ban nuts.
jelly | Grape jelly | condiments | pantry | 300 | | 18-oz jar=18 oz | | vg gf | | Jellies | | |
jam | Strawberry jam | condiments | pantry | 320 | | 18-oz jar=18 oz | | vg gf | | Jams and preserves | | preserves |
honey | Honey | condiments | pantry | 339 | | 12-oz bottle=12 oz | | v gf | | Honey | check-foods#babies | | Do not give honey to babies under 12 months old.
maple-syrup | Maple syrup | condiments | pantry | 315 | | 12-oz bottle=12 fl-oz | | vg gf | | Syrups, maple | | pure maple syrup |
pancake-syrup | Pancake syrup | condiments | pantry | 315 | | 24-oz bottle=24 fl-oz | | vg gf | | Syrups, table blends, pancake | | |
applesauce | Applesauce, unsweetened | canned | pantry | 244 | each=113#4-oz cup | 24-oz jar=24 oz; 6-pack cups=6 each |  | vg gf |  | Applesauce, canned, unsweetened, without added ascorbic acid |  |  | 
canned-peaches | Peaches (canned in juice) | canned | pantry | 248 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Peaches, canned, juice pack, solids and liquids | | |
mandarin-oranges | Mandarin oranges (canned) | canned | pantry | 249 | can=312#11-oz can | 11-oz can=1 can | | vg gf | | Tangerines, (mandarin oranges), canned, juice pack | | |
canned-pineapple | Pineapple chunks (canned in juice) | canned | pantry | 249 | can=567#20-oz can | 20-oz can=1 can | | vg gf | | Pineapple, canned, juice pack, solids and liquids | | |
pumpkin-puree | Pumpkin puree (canned) | canned | pantry | 245 | can=425#15-oz can | 15-oz can=1 can | | vg gf | | Pumpkin, canned, without salt | | |
canned-tuna | Tuna, canned in water | canned | pantry | 154 | can=142#5-oz can (drained ~4 oz) | 5-oz can=1 can | fish | gf | 173709 | Fish, tuna, light, canned in water, drained solids |  |  | 
canned-salmon | Salmon, canned | canned | pantry | 150 | can=418#14.75-oz can | 14.75-oz can=1 can | fish | gf | | Fish, salmon, pink, canned, drained solids | | |
canned-chicken | Chicken, canned | canned | pantry | 140 | can=354#12.5-oz can | 12.5-oz can=1 can | | gf | | Chicken, canned, meat only, with broth | | |
roasted-red-peppers | Roasted red peppers (jar) | canned | pantry | 150 | jar=340#12-oz jar | 12-oz jar=1 jar | | vg gf | | Peppers, sweet, red, canned, solids and liquids | | |
water-chestnuts | Sliced water chestnuts | international | pantry | 140 | can=227#8-oz can | 8-oz can=1 can | | vg gf | | Waterchestnuts, chinese, canned, solids and liquids | | |
diced-tomatoes-chiles | Diced tomatoes with green chiles | canned | pantry | 240 | can=283#10-oz can | 10-oz can=1 can | | vg gf | proxy:diced-tomatoes | Tomatoes, red, ripe, canned, packed in tomato juice | | |
enchilada-sauce | Red enchilada sauce* | canned | pantry | 250 | can=283#10-oz can; large-can=539#19-oz can | 10-oz can=1 can; 19-oz can=1 large-can | | vg | | Sauce, enchilada, red, mild, ready to serve | | | Some brands thicken with wheat flour; check the label.
artichoke-hearts | Artichoke hearts (canned) | canned | pantry | 168 | can=397#14-oz can | 14-oz can=1 can |  | vg gf |  | Artichokes, (globe or french), cooked, boiled, drained, without salt |  |  | 
sauerkraut | Sauerkraut | canned | fridge | 142 | | 32-oz jar=32 oz | | vg gf | | Sauerkraut, canned, solids and liquids | | |
capers | Capers | canned | pantry | 136 | | 3.5-oz jar=3.5 oz | | vg gf | | Capers, canned | | |
cranberry-sauce | Cranberry sauce (canned) | canned | pantry | 277 | can=397#14-oz can | 14-oz can=1 can | | vg gf | | Cranberry sauce, canned, sweetened | | |
# ---------- BAKING ----------
flour | All-purpose flour | baking | pantry | 125 | | 5-lb bag=5 lb; 2-lb bag=2 lb | wheat | vg | | Wheat flour, white, all-purpose, enriched, bleached | differences#flour | plain flour |
bread-flour | Bread flour | baking | pantry | 127 | | 5-lb bag=5 lb | wheat | vg | | Wheat flour, white, bread, enriched | differences#flour | |
whole-wheat-flour | Whole wheat flour | baking | pantry | 120 | | 5-lb bag=5 lb | wheat | vg | | Wheat flour, whole-grain (Includes foods for USDA's Food Distribution Program) | differences#flour | |
self-rising-flour | Self-rising flour | baking | pantry | 125 | | 5-lb bag=5 lb | wheat | vg | | Wheat flour, white, all-purpose, self-rising, enriched | differences#flour | |
gf-flour | Gluten-free all-purpose flour blend* | baking | pantry | 140 | | 22-oz bag=22 oz | | vg gf | proxy:rice-flour | Rice flour, white, unenriched | | | Blends vary; a blend with xanthan gum works best in these recipes.
rice-flour | White rice flour | baking | pantry | 158 | | 24-oz bag=24 oz | | vg gf | | Rice flour, white, unenriched | | |
cornstarch | Cornstarch | baking | pantry | 128 | | 16-oz box=16 oz | | vg gf | | Cornstarch | | corn flour (UK) |
sugar | Granulated sugar | baking | pantry | 200 | | 4-lb bag=4 lb | | vg gf | | Sugars, granulated | | white sugar |
brown-sugar | Brown sugar | baking | pantry | 220 | | 2-lb bag=2 lb | | vg gf | | Sugars, brown | | light brown sugar | Measured packed.
powdered-sugar | Powdered sugar | baking | pantry | 120 | | 2-lb bag=2 lb | | vg gf | | Sugars, powdered | | confectioners' sugar |
baking-soda | Baking soda | baking | pantry | 220 | | 1-lb box=1 lb | | vg gf | | Leavening agents, baking soda | differences#leaveners | bicarbonate of soda |
baking-powder | Baking powder | baking | pantry | 192 | | 8.1-oz can=8.1 oz | | vg gf | | Leavening agents, baking powder, double-acting, sodium aluminum sulfate | differences#leaveners | |
yeast | Active dry yeast | baking | pantry | 149 | package=7#1/4-oz packet | 3-packet strip=3 package | | vg gf | | Leavening agents, yeast, baker's, active dry | | | A 7-g (1/4-oz) packet holds 2 1/4 teaspoons, as packets are labeled.
cream-of-tartar | Cream of tartar | baking | pantry | 192 | | 1.5-oz jar=1.5 oz | | vg gf | | Leavening agents, cream of tartar | differences#leaveners | |
vanilla | Vanilla extract | baking | pantry | 208 | | 2-oz bottle=2 fl-oz | | vg gf | | Vanilla extract | | |
chocolate-chips | Semisweet chocolate chips* | baking | pantry | 168 | | 12-oz bag=12 oz | milk soybeans | v gf | | Candies, semisweet chocolate | | | Many brands contain milk and soy; dairy-free chips are labeled.
cocoa | Unsweetened cocoa powder | baking | pantry | 86 | | 8-oz canister=8 oz | | vg gf | | Cocoa, dry powder, unsweetened | | |
shortening | Vegetable shortening | baking | pantry | 205 | | 16-oz can=16 oz | | vg gf | | Shortening, household, soybean (partially hydrogenated)-cottonseed (partially hydrogenated) | | | U.S. shortening is now made without partially hydrogenated oils; FDC's household entry is older, so treat its numbers as rough.
molasses | Molasses | baking | pantry | 337 | | 12-oz bottle=12 fl-oz | | vg gf | | Molasses | | |
coconut-flakes | Sweetened shredded coconut | baking | pantry | 93 | | 7-oz bag=7 oz | | vg gf | | Nuts, coconut meat, dried (desiccated), sweetened, shredded | | |
pancake-mix | Pancake mix* | breakfast | pantry | 120 | | 32-oz box=32 oz | wheat milk eggs | v | | Pancakes, plain, dry mix, complete (includes buttermilk) | | | Check the label; mixes vary.
marshmallows | Marshmallows* | baking | pantry | 50 | each=7#marshmallow | 10-oz bag=10 oz |  | gf | 167995 | Candies, marshmallows |  |  | Most contain gelatin, so they are not vegetarian.
raisins | Raisins | snacks | pantry | 165 | each=28#small box | 12-oz box=12 oz; 6-pack small boxes=6 each |  | vg gf | 168165 | Raisins, dark, seedless |  |  | 
dried-cranberries | Dried cranberries | snacks | pantry | 120 |  | 6-oz bag=6 oz |  | vg gf | 171723 | Cranberries, dried, sweetened |  |  | 
walnuts | Walnuts | snacks | pantry | 117 | | 8-oz bag=8 oz | tree-nuts | vg gf | | Nuts, walnuts, english | | |
pecans | Pecans | snacks | pantry | 109 | | 8-oz bag=8 oz | tree-nuts | vg gf | 170182 | Nuts, pecans | | |
almonds | Almonds | snacks | pantry | 143 | | 8-oz bag=8 oz; 16-oz bag=16 oz | tree-nuts | vg gf | | Nuts, almonds | | sliced almonds |
cashews | Cashews | snacks | pantry | 137 | | 8-oz bag=8 oz | tree-nuts | vg gf | | Nuts, cashew nuts, raw | | |
peanuts | Peanuts | snacks | pantry | 146 | | 16-oz jar=16 oz | peanuts | vg gf | 172430 | Peanuts, all types, raw | | |
pine-nuts | Pine nuts | snacks | pantry | 135 | | 2-oz bag=2 oz | tree-nuts | vg gf | | Nuts, pine nuts, dried | | |
hazelnuts | Hazelnuts | snacks | pantry | 135 | | 8-oz bag=8 oz | tree-nuts | vg gf | 170581 | Nuts, hazelnuts or filberts | | filberts |
sunflower-seeds | Sunflower seeds (shelled) | snacks | pantry | 140 | | 8-oz bag=8 oz | | vg gf | 170562 | Seeds, sunflower seed kernels, dried | | |
pumpkin-seeds | Pumpkin seeds (pepitas) | snacks | pantry | 129 | | 8-oz bag=8 oz | | vg gf | | Seeds, pumpkin and squash seed kernels, dried | | pepitas |
chia-seeds | Chia seeds | baking | pantry | 170 | | 12-oz bag=12 oz | | vg gf | | Seeds, chia seeds, dried | | |
flaxseed | Ground flaxseed | baking | pantry | 112 | | 16-oz bag=16 oz | | vg gf | | Seeds, flaxseed | | flax meal |
sesame-seeds | Sesame seeds | spices | pantry | 144 | | 2-oz jar=2 oz | sesame | vg gf | | Seeds, sesame seeds, whole, dried | | |
cake-flour | Cake flour | baking | pantry | 114 | | 2-lb box=2 lb | wheat | vg | | Wheat flour, white, cake, enriched | differences#flour | |
almond-flour | Almond flour | baking | pantry | 96 | | 16-oz bag=16 oz | tree-nuts | vg gf | | Nuts, almonds, blanched | | almond meal | FDC has blanched almonds; almond flour is ground blanched almonds.
white-chocolate-chips | White chocolate chips* | baking | pantry | 170 | | 11-oz bag=11 oz | milk soybeans | v gf | | Candies, white chocolate | | |
gelatin | Unflavored gelatin | baking | pantry | 150 | package=7#1/4-oz envelope | 4-envelope box=4 package | | gf | | Gelatins, dry powder, unsweetened | | | Made from animal collagen, so it is not vegetarian.
# ---------- SPICES AND HERBS ----------
salt | Table salt | spices | pantry | 292 | | 26-oz canister=26 oz | | vg gf | | Salt, table | differences#salt | iodized salt, fine salt | Recipes here mean table salt; see the salt guide before using kosher salt.
kosher-salt | Kosher salt | spices | pantry | 230 | | 3-lb box=3 lb | | vg gf | proxy:salt | Salt, table | differences#salt | coarse salt | Weight per teaspoon varies by brand; the catalog uses the denser flake kind (about 4.8 g per teaspoon).
sea-salt | Fine sea salt | spices | pantry | 254 | | 26-oz canister=26 oz | | vg gf | proxy:salt | Salt, table | differences#salt | |
black-pepper | Ground black pepper | spices | pantry | 110 | | 3-oz tin=3 oz | | vg gf | | Spices, pepper, black | | pepper |
garlic-powder | Garlic powder | spices | pantry | 149 | | 3-oz jar=3 oz | | vg gf | | Spices, garlic powder | | |
onion-powder | Onion powder | spices | pantry | 115 | | 2.5-oz jar=2.5 oz | | vg gf | | Spices, onion powder | | |
paprika | Paprika | spices | pantry | 110 | | 2-oz jar=2 oz | | vg gf | | Spices, paprika | | sweet paprika |
smoked-paprika | Smoked paprika | spices | pantry | 110 | | 2-oz jar=2 oz | | vg gf | proxy:paprika | Spices, paprika | | |
chili-powder | Chili powder* | spices | pantry | 130 | | 2.5-oz jar=2.5 oz | | vg gf | | Spices, chili powder | | | A blend of ground chiles and other spices.
cumin | Ground cumin | spices | pantry | 96 | | 1.5-oz jar=1.5 oz | | vg gf | | Spices, cumin seed | | |
oregano | Dried oregano | spices | pantry | 48 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, oregano, dried | differences#herbs | |
basil-dried | Dried basil | spices | pantry | 34 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, basil, dried | differences#herbs | |
thyme-dried | Dried thyme | spices | pantry | 48 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, thyme, dried | differences#herbs | |
rosemary-dried | Dried rosemary | spices | pantry | 58 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, rosemary, dried | differences#herbs | |
parsley-dried | Dried parsley | spices | pantry | 24 | | 0.5-oz jar=0.5 oz | | vg gf | | Spices, parsley, dried | differences#herbs | parsley flakes |
dill-dried | Dried dill weed | spices | pantry | 48 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, dill weed, dried | differences#herbs | |
sage | Ground sage | spices | pantry | 34 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, sage, ground | differences#herbs | |
italian-seasoning | Italian seasoning | spices | pantry | 48 | | 0.75-oz jar=0.75 oz | | vg gf | proxy:oregano | Spices, oregano, dried | differences#herbs | | A mix of dried herbs; nutrition estimated from dried oregano.
bay-leaves | Bay leaves | spices | pantry | | leaf=0.2#bay leaf | 0.15-oz jar=0.15 oz | | vg gf | | Spices, bay leaf | | |
cinnamon | Ground cinnamon | spices | pantry | 125 | | 2.4-oz jar=2.4 oz | | vg gf | | Spices, cinnamon, ground | cinnamon | | Most U.S. stores sell cassia cinnamon; see the cinnamon guide.
cinnamon-sticks | Cinnamon sticks | spices | pantry | | each=2.5#stick | 1-oz jar=1 oz | | vg gf | proxy:cinnamon | Spices, cinnamon, ground | cinnamon | |
nutmeg | Ground nutmeg | spices | pantry | 105 | | 1.1-oz jar=1.1 oz | | vg gf | | Spices, nutmeg, ground | | |
ginger-ground | Ground ginger | spices | pantry | 86 | | 0.8-oz jar=0.8 oz | | vg gf | | Spices, ginger, ground | | |
cloves | Ground cloves | spices | pantry | 101 | | 0.9-oz jar=0.9 oz | | vg gf | | Spices, cloves, ground | | |
allspice | Ground allspice | spices | pantry | 91 | | 0.9-oz jar=0.9 oz | | vg gf | | Spices, allspice, ground | | |
cayenne | Cayenne pepper | spices | pantry | 86 | | 1-oz jar=1 oz | | vg gf | | Spices, pepper, red or cayenne | | ground red pepper |
red-pepper-flakes | Crushed red pepper flakes | spices | pantry | 86 | | 1.5-oz jar=1.5 oz | | vg gf | proxy:cayenne | Spices, pepper, red or cayenne | | chili flakes |
turmeric | Ground turmeric | spices | pantry | 144 | | 1-oz jar=1 oz | | vg gf | | Spices, turmeric, ground | | |
curry-powder | Curry powder* | spices | pantry | 100 | | 1.75-oz jar=1.75 oz | | vg gf | | Spices, curry powder | | |
ground-mustard | Ground mustard | spices | pantry | 96 | | 1.75-oz jar=1.75 oz | | vg gf | | Spices, mustard seed, ground | | dry mustard |
pumpkin-pie-spice | Pumpkin pie spice | spices | pantry | 82 | | 1-oz jar=1 oz | | vg gf | | Spices, pumpkin pie spice | cinnamon | |
poultry-seasoning | Poultry seasoning | spices | pantry | 72 | | 0.75-oz jar=0.75 oz | | vg gf | | Spices, poultry seasoning | | |
taco-seasoning | Taco seasoning mix* | spices | pantry | 100 | package=28#1-oz packet | 1-oz packet=1 package | | vg | | Seasoning mix, dry, taco, original | | | Some packets contain wheat; check the label, or use the homemade mix in the taco recipe.
chicken-bouillon | Chicken bouillon cubes* | spices | pantry |  | each=4#cube | 25-cube jar=25 each |  |  | 171562 | Soup, chicken broth or bouillon, dry | differences#stock-broth |  | 
coriander | Ground coriander | spices | pantry | 86 | | 1.25-oz jar=1.25 oz | | vg gf | | Spices, coriander seed | | |
celery-seed | Celery seed | spices | pantry | 120 | | 1.5-oz jar=1.5 oz | | vg gf | | Spices, celery seed | | |
fennel-seed | Fennel seed | spices | pantry | 96 | | 1.5-oz jar=1.5 oz | | vg gf | | Spices, fennel seed | | |
cardamom | Ground cardamom | spices | pantry | 96 | | 1.5-oz jar=1.5 oz | | vg gf | | Spices, cardamom | | |
garlic-salt | Garlic salt | spices | pantry | 250 | | 5-oz jar=5 oz | | vg gf | proxy:salt | Salt, table | differences#salt | | Mostly salt; nutrition estimated as table salt.
# ---------- OILS, SAUCES AND CONDIMENTS ----------
canola-oil | Canola oil | condiments | pantry | 218 | | 48-oz bottle=48 fl-oz | | vg gf | | Oil, canola | fats | |
vegetable-oil | Vegetable oil (soybean) | condiments | pantry | 218 | | 48-oz bottle=48 fl-oz | | vg gf | | Oil, soybean, salad or cooking | fats | soybean oil | Bottles labeled "vegetable oil" in the U.S. are usually soybean oil. Highly refined soybean oil is exempt from allergen labeling.
corn-oil | Corn oil | condiments | pantry | 218 | | 48-oz bottle=48 fl-oz | | vg gf | | Oil, corn, industrial and retail, all purpose salad or cooking | fats | |
sunflower-oil | Sunflower oil | condiments | pantry | 218 | | 33.8-oz bottle=33.8 fl-oz | | vg gf | | Oil, sunflower, high oleic (70% and over) | fats | | Most U.S. sunflower oil sold for cooking is the high-oleic kind; the label says so.
safflower-oil | Safflower oil | condiments | pantry | 218 | | 32-oz bottle=32 fl-oz | | vg gf | | Oil, safflower, salad or cooking, high oleic (primary safflower oil of commerce) | fats | |
cottonseed-oil | Cottonseed oil | condiments | pantry | 218 | | 48-oz bottle=48 fl-oz | | vg gf | | Oil, cottonseed, salad or cooking | fats | | Mostly used in packaged and restaurant foods.
grapeseed-oil | Grapeseed oil | condiments | pantry | 218 | | 16.9-oz bottle=16.9 fl-oz | | vg gf | | Oil, grapeseed | fats | |
olive-oil | Olive oil | condiments | pantry | 216 | | 16.9-oz bottle=16.9 fl-oz; 33.8-oz bottle=33.8 fl-oz | | vg gf | | Oil, olive, salad or cooking | fats | extra-virgin olive oil, light olive oil |
avocado-oil | Avocado oil | condiments | pantry | 218 | | 16.9-oz bottle=16.9 fl-oz | | vg gf | | Oil, avocado | fats | |
coconut-oil | Coconut oil | condiments | pantry | 218 | | 14-oz jar=14 oz | | vg gf | | Oil, coconut | fats | |
peanut-oil | Peanut oil | condiments | pantry | 216 | | 24-oz bottle=24 fl-oz | peanuts | vg gf | | Oil, peanut, salad or cooking | fats | | Highly refined peanut oil is exempt from FDA allergen labeling; cold-pressed peanut oil is not.
sesame-oil | Toasted sesame oil | condiments | pantry | 218 | | 5-oz bottle=5 fl-oz | sesame | vg gf | | Oil, sesame, salad or cooking | fats | |
lard | Lard | condiments | fridge | 205 | | 16-oz package=16 oz | | gf | | Lard | fats | manteca |
tallow | Beef tallow | condiments | pantry | 205 | | 14-oz jar=14 oz | | gf | | Fat, beef tallow | fats | |
cooking-spray | Cooking spray | condiments | pantry | 218 | | 6-oz can=6 oz | | vg gf | proxy:canola-oil | Oil, canola | fats | nonstick spray |
white-vinegar | White vinegar | condiments | pantry | 238 | | 32-oz bottle=32 fl-oz | | vg gf | | Vinegar, distilled | | distilled vinegar |
cider-vinegar | Apple cider vinegar | condiments | pantry | 239 | | 16-oz bottle=16 fl-oz | | vg gf | | Vinegar, cider | | |
red-wine-vinegar | Red wine vinegar | condiments | pantry | 239 | | 12.7-oz bottle=12.7 fl-oz | | vg gf | | Vinegar, red wine | | |
balsamic-vinegar | Balsamic vinegar | condiments | pantry | 255 | | 8.5-oz bottle=8.5 fl-oz | | vg gf | | Vinegar, balsamic | | |
rice-vinegar | Rice vinegar | international | pantry | 239 | | 12-oz bottle=12 fl-oz | | vg gf | proxy:white-vinegar | Vinegar, distilled | | rice wine vinegar |
ketchup | Ketchup | condiments | fridge | 240 | | 20-oz bottle=20 oz | | vg gf | | Catsup | | catsup |
yellow-mustard | Yellow mustard | condiments | fridge | 250 | | 14-oz bottle=14 oz | | vg gf | | Mustard, prepared, yellow | | |
dijon-mustard | Dijon-style mustard | condiments | fridge | 250 | | 12-oz jar=12 oz | | vg gf | proxy:yellow-mustard | Mustard, prepared, yellow | | |
mayonnaise | Mayonnaise | condiments | fridge | 220 | | 30-oz jar=30 fl-oz | eggs | v gf | | Salad dressing, mayonnaise, regular | | mayo |
soy-sauce | Soy sauce | international | pantry | 255 | | 15-oz bottle=15 fl-oz | soybeans wheat | vg | | Soy sauce made from soy and wheat (shoyu) | | |
low-sodium-soy-sauce | Low-sodium soy sauce | international | pantry | 255 | | 15-oz bottle=15 fl-oz | soybeans wheat | vg | | Soy sauce made from soy and wheat (shoyu), low sodium | | |
tamari | Tamari* | international | pantry | 255 | | 10-oz bottle=10 fl-oz | soybeans | vg | | Soy sauce made from soy (tamari) | | gluten-free soy sauce | Often wheat-free, but not always; check for a gluten-free label.
worcestershire | Worcestershire sauce* | condiments | pantry | 275 | | 10-oz bottle=10 fl-oz | fish | gf | | Sauce, worcestershire | | | Usually contains anchovies (fish).
hot-sauce | Hot sauce | condiments | pantry | 240 | | 5-oz bottle=5 fl-oz | | vg gf | | Sauce, ready-to-serve, pepper or hot | | |
sriracha | Chili garlic sauce (sriracha-style) | international | fridge | 270 | | 17-oz bottle=17 oz | | vg gf | | Sauce, hot chile, sriracha | | |
bbq-sauce | Barbecue sauce* | condiments | pantry | 280 | | 18-oz bottle=18 oz | | vg gf | | Sauce, barbecue | | BBQ sauce |
teriyaki-sauce | Teriyaki sauce* | international | fridge | 280 | | 10-oz bottle=10 fl-oz | soybeans wheat | vg | | Sauce, teriyaki, ready-to-serve | | |
hoisin-sauce | Hoisin sauce* | international | fridge | 290 | | 8.5-oz jar=8.5 oz | soybeans wheat | vg | | Sauce, hoisin, ready-to-serve | | |
oyster-sauce | Oyster sauce* | international | fridge | 290 | | 9-oz bottle=9 oz | shellfish soybeans wheat | | | Sauce, oyster, ready-to-serve | | | Made from oyster extract (shellfish).
fish-sauce | Fish sauce | international | pantry | 288 | | 6.76-oz bottle=6.76 fl-oz | fish | gf | | Sauce, fish, ready-to-serve | | |
ranch-dressing | Ranch dressing* | condiments | fridge | 240 | | 16-oz bottle=16 fl-oz | milk eggs | v gf | | Salad dressing, ranch dressing, regular | | |
caesar-dressing | Caesar dressing* | condiments | fridge | 235 | | 16-oz bottle=16 fl-oz | milk eggs fish | gf | | Salad dressing, caesar dressing, regular | | | Most contain anchovies, egg and cheese.
italian-dressing | Italian dressing* | condiments | fridge | 235 | | 16-oz bottle=16 fl-oz | | vg gf | | Salad dressing, italian dressing, commercial, regular | | |
pesto | Basil pesto* | condiments | fridge | 260 | | 6-oz jar=6 oz | milk tree-nuts | v gf | | Sauce, pesto, ready-to-serve, refrigerated | | | Most contain cheese and pine nuts or other tree nuts.
tahini | Tahini | international | pantry | 240 | | 16-oz jar=16 oz | sesame | vg gf | | Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type) | | sesame paste |
horseradish | Prepared horseradish | condiments | fridge | 240 | | 8-oz jar=8 oz | | vg gf | | Horseradish, prepared | | |
buffalo-sauce | Buffalo wing sauce* | condiments | fridge | 240 | | 12-oz bottle=12 fl-oz | milk | v gf | proxy:hot-sauce | Sauce, ready-to-serve, pepper or hot | | | Many contain butter; nutrition estimated from hot sauce.
blue-cheese-dressing | Blue cheese dressing* | condiments | fridge | 245 | | 16-oz bottle=16 fl-oz | milk eggs | v gf | | Salad dressing, blue or roquefort cheese dressing, commercial, regular | | |
# ---------- CEREAL AND BREAKFAST ----------
rolled-oats | Old-fashioned rolled oats* | breakfast | pantry | 81 | | 42-oz canister=42 oz; 18-oz canister=18 oz | | vg | | Cereals, oats, regular and quick, not fortified, dry | | oatmeal | Oats are naturally gluten-free but often picked up wheat in fields and mills; buy oats labeled gluten-free if needed.
quick-oats | Quick oats* | breakfast | pantry | 81 | | 42-oz canister=42 oz | | vg | proxy:rolled-oats | Cereals, oats, regular and quick, not fortified, dry | | quick-cooking oats | Choose oats labeled gluten-free if needed.
steel-cut-oats | Steel-cut oats* | breakfast | pantry | 176 | | 30-oz canister=30 oz | | vg | proxy:rolled-oats | Cereals, oats, regular and quick, not fortified, dry | | Irish oats |
granola | Granola* | breakfast | pantry | 122 | | 12-oz bag=12 oz | | v | | Cereals ready-to-eat, granola, homemade | | |
toasted-oat-cereal | Toasted oat O's cereal* | breakfast | pantry | 28 |  | 12-oz box=12 oz |  | vg | 173884 | Cereals ready-to-eat, GENERAL MILLS, CHEERIOS |  |  | Generic toasted oat cereal; nutrition from FDC's best match.
corn-flakes | Corn flakes cereal* | breakfast | pantry | 28 |  | 12-oz box=12 oz |  | vg | 174648 | Cereals ready-to-eat, RALSTON Corn Flakes |  |  | Often contains malt (barley).
frozen-waffles | Frozen waffles* | frozen | freezer |  | each=35#waffle | 10-count box=10 each | wheat milk eggs | v |  | Waffles, plain, frozen, ready-to-heat |  |  | 
instant-oatmeal | Instant oatmeal packets* | breakfast | pantry | | package=43#packet | 10-packet box=10 package | | vg | | Cereals, QUAKER, Instant Oatmeal, Cinnamon Spice, reduced sugar | cinnamon | | Flavored packets vary; FDC's closest match is a branded entry. Check the label.
farina | Farina (hot wheat cereal) | breakfast | pantry | 170 | | 28-oz box=28 oz | wheat | vg | | Cereals, farina, enriched, assorted brands including CREAM OF WHEAT, quick (1-3 minutes), dry | | cream of wheat |
bran-flakes | Bran flakes cereal* | breakfast | pantry | 39 |  | 16-oz box=16 oz | wheat | vg | 173002 | Cereals ready-to-eat, RALSTON Enriched Wheat Bran flakes |  |  | 
miso | Miso | international | fridge | 275 | | 14-oz tub=14 oz | soybeans | vg | | Miso | | | Some miso is made with barley; check the label for gluten.
kimchi | Kimchi* | international | fridge | 150 | | 16-oz jar=16 oz | | | | Cabbage, kimchi | | | Traditional kimchi often contains fish sauce or shrimp; check the label.
ramen-noodles | Ramen noodles (instant)* | international | pantry | | package=85#3-oz block | 6-pack=6 package | wheat soybeans | v | | Soup, ramen noodle, any flavor, dry | | |
# ---------- FROZEN ----------
frozen-peas | Frozen peas | frozen | freezer | 134 | | 12-oz bag=12 oz; 16-oz bag=16 oz | | vg gf | | Peas, green, frozen, unprepared (Includes foods for USDA's Food Distribution Program) | | green peas |
frozen-corn | Frozen corn | frozen | freezer | 136 |  | 12-oz bag=12 oz; 16-oz bag=16 oz |  | vg gf | 168398 | Corn, sweet, yellow, frozen, kernels cut off cob, unprepared |  |  | 
frozen-mixed-veg | Frozen mixed vegetables | frozen | freezer | 135 | | 12-oz bag=12 oz; 16-oz bag=16 oz | | vg gf | | Vegetables, mixed, frozen, unprepared | | |
frozen-peas-carrots | Frozen peas and carrots | frozen | freezer | 134 | | 12-oz bag=12 oz | | vg gf | | Peas and carrots, frozen, unprepared | | |
frozen-broccoli | Frozen broccoli | frozen | freezer | 91 | | 12-oz bag=12 oz | | vg gf | | Broccoli, frozen, chopped, unprepared | | |
frozen-green-beans | Frozen green beans | frozen | freezer | 121 | | 12-oz bag=12 oz | | vg gf | | Beans, snap, green, frozen, all styles, unprepared (Includes foods for USDA's Food Distribution Program) | | |
frozen-spinach | Frozen chopped spinach | frozen | freezer | 156 |  | 10-oz box=10 oz |  | vg gf | 169287 | Spinach, frozen, chopped or leaf, unprepared |  |  | 
frozen-stir-fry-veg | Frozen stir-fry vegetables | frozen | freezer | 135 | | 16-oz bag=16 oz | | vg gf | proxy:frozen-mixed-veg | Vegetables, mixed, frozen, unprepared | | |
frozen-cauliflower-rice | Frozen riced cauliflower | frozen | freezer | 107 | | 12-oz bag=12 oz | | vg gf | proxy:cauliflower | Cauliflower, raw | | cauliflower rice |
frozen-edamame | Frozen shelled edamame | frozen | freezer | 155 | | 12-oz bag=12 oz | soybeans | vg gf | | Edamame, frozen, unprepared | | |
frozen-blueberries | Frozen blueberries | frozen | freezer | 155 | | 16-oz bag=16 oz | | vg gf | | Blueberries, frozen, unsweetened (Includes foods for USDA's Food Distribution Program) | | |
frozen-strawberries | Frozen strawberries | frozen | freezer | 149 | | 16-oz bag=16 oz | | vg gf | | Strawberries, frozen, unsweetened (Includes foods for USDA's Food Distribution Program) | | |
frozen-mixed-berries | Frozen mixed berries | frozen | freezer | 150 | | 16-oz bag=16 oz | | vg gf | proxy:frozen-blueberries | Blueberries, frozen, unsweetened (Includes foods for USDA's Food Distribution Program) | | |
frozen-mango | Frozen mango chunks | frozen | freezer | 165 | | 16-oz bag=16 oz | | vg gf | proxy:mango | Mangos, raw | | |
frozen-hash-browns | Frozen shredded hash browns | frozen | freezer | 72 | | 30-oz bag=30 oz | | vg gf | | Potatoes, hash brown, frozen, plain, unprepared | | |
frozen-fries | Frozen french fries* | frozen | freezer | 70 |  | 32-oz bag=32 oz |  | vg gf | 170523 | Potatoes, french fried, all types, salt not added in processing, frozen, as purchased |  |  | 
frozen-shrimp | Frozen cooked shrimp | frozen | freezer | | each=12#large shrimp | 1-lb bag=1 lb | shellfish | gf | proxy:shrimp | Crustaceans, shrimp, raw | | |
fish-sticks | Fish sticks* | frozen | freezer | | each=28#fish stick | 24-oz box=24 oz | fish wheat | | | Fish, fish sticks, frozen, prepared | | |
frozen-meatballs | Frozen cooked meatballs* | frozen | freezer | | each=28#meatball | 32-oz bag=32 oz | wheat milk eggs | | | Meatballs, frozen, Italian style | | |
puff-pastry | Frozen puff pastry* | frozen | freezer | | sheet=245#sheet | 17.3-oz box (2 sheets)=2 sheet | wheat | vg | | Puff pastry, frozen, ready-to-bake | | |
frozen-pie-crust | Frozen pie crust* | frozen | freezer | | each=180#9-inch crust | 2-pack=2 each | wheat | v | | Pie crust, standard-type, frozen, ready-to-bake, enriched | | |
vanilla-ice-cream | Vanilla ice cream | frozen | freezer | 132 | | 1.5-quart carton=1.5 quart | milk | v gf | | Ice creams, vanilla | | |
frozen-pizza-dough | Pizza dough* | frozen | freezer | | each=454#1-lb ball | 1-lb ball=1 each | wheat | vg | proxy:french-bread | Bread, french or vienna (includes sourdough) | | | FDC has no plain pizza dough; nutrition is estimated from French bread.
chicken-nuggets | Frozen chicken nuggets* | frozen | freezer |  | each=16#nugget | 29-oz bag=29 oz | wheat |  | 172111 | Chicken, nuggets, dark and white meat, precooked, frozen, not reheated |  |  | 
frozen-peppers-onions | Frozen pepper and onion blend | frozen | freezer | 115 | | 14-oz bag=14 oz | | vg gf | proxy:green-bell-pepper | Peppers, sweet, green, raw | | fajita vegetables |
tater-tots | Frozen potato puffs (tots)* | frozen | freezer | 80 |  | 32-oz bag=32 oz |  | vg gf | 170047 | Potato puffs, frozen, unprepared |  | tots | 
frozen-sweet-potato-fries | Frozen sweet potato fries* | frozen | freezer | 70 | | 20-oz bag=20 oz | | vg gf | | Sweet potato, frozen, unprepared (Includes foods for USDA's Food Distribution Program) | | |
# ---------- SNACKS ----------
saltines | Saltine crackers* | snacks | pantry | | each=3#cracker | 16-oz box=16 oz | wheat | vg | | Crackers, saltines (includes oyster, soda, soup) | | soda crackers |
graham-crackers | Graham crackers* | snacks | pantry | 84 | sheet=14#full sheet | 14.4-oz box=14.4 oz | wheat | v | 174957 | Cookies, graham crackers, plain or honey (includes cinnamon) |  |  | 
cheese-crackers | Cheese crackers* | snacks | pantry | 62 | | 12-oz box=12 oz | wheat milk | v | | Crackers, cheese, regular | | |
whole-grain-crackers | Whole wheat crackers* | snacks | pantry | | each=4#cracker | 9-oz box=9 oz | wheat | vg | | Crackers, whole-wheat | | |
tortilla-chips | Tortilla chips | snacks | pantry | 26 |  | 13-oz bag=13 oz |  | vg gf |  | Snacks, tortilla chips, plain, white corn, salted |  |  | 
potato-chips | Potato chips | snacks | pantry | 20 | | 8-oz bag=8 oz | | vg gf | | Snacks, potato chips, plain, salted | | |
pretzels | Pretzels* | snacks | pantry | 47 | | 16-oz bag=16 oz | wheat | vg | | Snacks, pretzels, hard, plain, salted | | |
popcorn-kernels | Popcorn kernels | snacks | pantry | 200 | | 30-oz jar=30 oz | | vg gf | | Snacks, popcorn, air-popped | | | FDC gives air-popped popcorn; kernels pop to about 15 times their volume.
rice-cakes | Rice cakes | snacks | pantry |  | each=9#rice cake | 4.5-oz package=4.5 oz |  | vg gf |  | Snacks, rice cakes, brown rice, plain, unsalted |  |  | 
granola-bars | Granola bars* | snacks | pantry | | each=24#bar | 12-count box=12 each | | v | | Snacks, granola bars, hard, plain | | |
animal-crackers | Animal crackers* | snacks | pantry | | | 13-oz box=13 oz | wheat | v | | Cookies, animal crackers (includes arrowroot, tea biscuits) | | |
dark-chocolate | Dark chocolate | snacks | pantry | | | 3.5-oz bar=3.5 oz | | vg gf | | Chocolate, dark, 70-85% cacao solids | | | Check the label for milk.
fruit-cups | Fruit cups in juice | snacks | pantry | | each=113#4-oz cup | 4-pack=4 each | | vg gf | | Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, juice pack, solids and liquids | | |
trail-mix | Trail mix* | snacks | pantry | 150 | | 16-oz bag=16 oz | peanuts tree-nuts | v gf | | Snacks, trail mix, regular | | | Usually contains peanuts and tree nuts; check the label.
beef-jerky | Beef jerky* | snacks | pantry | | | 2.85-oz bag=2.85 oz | soybeans wheat | | | Snacks, beef jerky, chopped and formed | | |
pistachios | Pistachios (shelled) | snacks | pantry | 123 | | 6-oz bag=6 oz | tree-nuts | vg gf | | Nuts, pistachio nuts, raw | | |
mixed-nuts | Mixed nuts* | snacks | pantry | 137 |  | 15-oz can=15 oz | peanuts tree-nuts | vg gf |  | Nuts, mixed nuts, dry roasted, with peanuts, with salt added |  |  | 
dried-apricots | Dried apricots | snacks | pantry | 130 | each=7#dried apricot half | 6-oz bag=6 oz | | vg gf | | Apricots, dried, sulfured, uncooked | | |
fruit-leather | Fruit leather* | snacks | pantry | | each=14#roll | 10-count box=10 each | | vg gf | | Snacks, fruit leather, pieces | | |
# ---------- BEVERAGES ----------
apple-juice | Apple juice | beverages | pantry | 248 | each=200#juice box | 64-oz bottle=64 fl-oz; 8-pack boxes=8 each | | vg gf | | Apple juice, canned or bottled, unsweetened, without added ascorbic acid | | |
coffee | Coffee (ground) | beverages | pantry | | | 12-oz bag=12 oz | | vg gf | | Beverages, coffee, brewed, prepared with tap water | | | FDC gives brewed coffee.
tea-bags | Tea bags | beverages | pantry | | each=2#tea bag | 100-count box=100 each | | vg gf | | Beverages, tea, black, brewed, prepared with tap water | | |
sparkling-water | Sparkling water | beverages | pantry | 237 | | 12-pack cans=144 fl-oz | | vg gf | | Beverages, carbonated, club soda | | seltzer |
lemon-juice | Lemon juice (bottled) | condiments | fridge | 244 | | 15-oz bottle=15 fl-oz | | vg gf | | Lemon juice from concentrate, bottled, REAL LEMON | | | Fresh lemons work too: one gives about 3 tablespoons.
lime-juice | Lime juice (bottled) | condiments | fridge | 246 | | 15-oz bottle=15 fl-oz | | vg gf | | Lime juice, raw | | |
grape-juice | Grape juice | beverages | pantry | 253 | | 64-oz bottle=64 fl-oz | | vg gf | | Grape juice, canned or bottled, unsweetened, without added ascorbic acid | | |
cranberry-juice | Cranberry juice cocktail | beverages | pantry | 253 | | 64-oz bottle=64 fl-oz | | vg gf | | Cranberry juice cocktail, bottled | | |
coconut-water | Coconut water | beverages | pantry | 240 | | 33.8-oz carton=33.8 fl-oz | | vg gf | | Nuts, coconut water (liquid from coconuts) | | |
water | Water | beverages | pantry | 237 | | | | vg gf | none | | | tap water |
"""

EDIBLE = {'whole-chicken': (0.61, 'USDA SR Legacy: 1 lb ready-to-cook chicken yields 276 g meat and skin'), 'pork-chops-bone-in': (0.77, 'USDA SR Legacy: a 259 g raw chop yields 199 g without bone')}

ALLERGENS = ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans', 'sesame']
ALLERGEN_NAMES = {'milk': 'Milk', 'eggs': 'Eggs', 'fish': 'Fish', 'shellfish': 'Crustacean shellfish', 'tree-nuts': 'Tree nuts',
                  'peanuts': 'Peanuts', 'wheat': 'Wheat', 'soybeans': 'Soybeans', 'sesame': 'Sesame'}

MASS = {'g': 1, 'kg': 1000, 'oz': 28.3495, 'lb': 453.592}
VOL = {'ml': 1, 'l': 1000, 'tsp': 4.92892, 'tbsp': 14.7868, 'fl-oz': 29.5735, 'cup': 236.588,
       'pint': 473.176, 'quart': 946.353, 'gallon': 3785.41, 'pinch': 0.308, 'dash': 0.616}
COUNT_LABELS = {
 'each': ['', ''], 'clove': ['clove', 'cloves'], 'slice': ['slice', 'slices'], 'stick': ['stick', 'sticks'],
 'can': ['can', 'cans'], 'large-can': ['large can', 'large cans'], 'small-can': ['small can', 'small cans'], 'jar': ['jar', 'jars'], 'package': ['package', 'packages'],
 'bunch': ['bunch', 'bunches'], 'head': ['head', 'heads'], 'heart': ['heart', 'hearts'], 'ear': ['ear', 'ears'],
 'sprig': ['sprig', 'sprigs'], 'leaf': ['leaf', 'leaves'], 'piece': ['piece', 'pieces'], 'loaf': ['loaf', 'loaves'],
 'link': ['link', 'links'], 'fillet': ['fillet', 'fillets'], 'breast': ['breast', 'breasts'], 'thigh': ['thigh', 'thighs'],
 'chop': ['chop', 'chops'], 'strip': ['slice', 'slices'], 'sheet': ['sheet', 'sheets'], 'stalk': ['stalk', 'stalks'],
}

NUTRIENTS = [
 # id, name, unit, FDC nutrient numbers (first found wins), FDA Daily Value (adults and children 4+)
 ('kcal', 'Calories', 'kcal', ['208', '957', '958'], 2000),
 ('protein', 'Protein', 'g', ['203'], 50),
 ('fat', 'Total fat', 'g', ['204'], 78),
 ('satfat', 'Saturated fat', 'g', ['606'], 20),
 ('carb', 'Total carbohydrate', 'g', ['205'], 275),
 ('fiber', 'Dietary fiber', 'g', ['291'], 28),
 ('sugars', 'Total sugars', 'g', ['269', '269.3'], None),
 ('sodium', 'Sodium', 'mg', ['307'], 2300),
 ('calcium', 'Calcium', 'mg', ['301'], 1300),
 ('iron', 'Iron', 'mg', ['303'], 18),
 ('potassium', 'Potassium', 'mg', ['306'], 4700),
 ('mufa', 'Monounsaturated fat', 'g', ['645'], None),
 ('pufa', 'Polyunsaturated fat', 'g', ['646'], None),
 ('la', 'Linoleic acid (omega-6, 18:2)', 'g', ['618', '675'], None),
 ('ala', 'Alpha-linolenic acid (omega-3, 18:3)', 'g', ['619', '851'], None),
]


def parse_counts(s):
    out, labels = {}, {}
    for tok in [p.strip() for p in s.split(';') if p.strip()]:
        u, rest = tok.split('=', 1)
        g, _, label = rest.partition('#')
        out[u.strip()] = float(g)
        if label:
            labels[u.strip()] = label.strip()
    return out, labels


def parse_buy(s):
    packs, loose = [], None
    for part in [p.strip() for p in s.split(';') if p.strip()]:
        if part.startswith('~'):
            u, step = part[1:].split()
            loose = {'unit': u, 'step': float(step)}
        else:
            label, rest = part.rsplit('=', 1)
            amt, unit = rest.split()
            packs.append({'label': label.strip(), 'amount': float(amt), 'unit': unit})
    return {'packs': packs, 'loose': loose}


def num(x):
    return int(x) if float(x).is_integer() else round(float(x), 4)


def build():
    items, seen = [], set()
    for raw in ITEMS.strip().splitlines():
        if not raw.strip() or raw.startswith('#'):
            continue
        f = [x.strip() for x in raw.split('|')]
        f += [''] * (14 - len(f))
        iid, name, section, keep, cup, counts, buy, alg, diet, fdc, query, guides, aliases, note = f[:14]
        assert iid not in seen, iid
        seen.add(iid)
        check_label = name.endswith('*')
        name = name.rstrip('*')
        cts, labels = parse_counts(counts) if counts else ({}, {})
        d = set(diet.split())
        diets = []
        if 'vg' in d or 'v' in d: diets.append('vegetarian')
        if 'vg' in d: diets.append('vegan')
        if 'gf' in d: diets.append('gluten-free')
        algs = alg.split()
        for a in algs: assert a in ALLERGENS, (iid, a)
        if 'milk' not in algs: diets.append('dairy-free')
        fdc_obj = {'id': None, 'dataType': 'SR Legacy', 'query': query or None, 'status': 'by-name', 'proxy': None}
        if fdc.isdigit():
            fdc_obj.update(id=int(fdc), status='search-verified')
        elif fdc.startswith('proxy:'):
            fdc_obj.update(proxy=fdc[6:], status='proxy')
        elif fdc == 'none':
            fdc_obj.update(query=None, status='none', dataType=None)
        edible = EDIBLE.get(iid)
        count_label = None
        if 'each' in labels: count_label = labels['each']
        it = {
            'id': iid, 'name': name, 'section': section,
            'aliases': [a.strip() for a in aliases.split(',') if a.strip()],
            'keep': keep, 'g_per_cup': num(cup) if cup else None,
            'counts': {k: num(v) for k, v in cts.items()},
            'count_labels': labels, 'count_label': count_label,
            'buy': parse_buy(buy) if buy else {'packs': [], 'loose': None},
            'allergens': algs, 'diet': diets,
            'check_label': check_label,
            'guides': [g.strip() for g in guides.split(';') if g.strip()],
            'note': note or None,
            'edible': edible[0] if edible else None,
            'edible_src': edible[1] if edible else None,
            'fdc': fdc_obj,
            'nutrition': {'kcal': 0, 'protein': 0, 'fat': 0, 'satfat': 0, 'carb': 0, 'fiber': 0, 'sugars': 0, 'sodium': 0,
                          'calcium': 0, 'iron': 0, 'potassium': 0, 'src': 'water (no nutrients)'} if fdc == 'none' else None,
        }
        for p in it['buy']['packs']:
            p['amount'] = num(p['amount'])
        if it['buy']['loose']:
            it['buy']['loose']['step'] = num(it['buy']['loose']['step'])
        items.append(it)
    return items


def main():
    items = build()
    path = os.path.join(OUT, 'catalog.json')
    old = {}
    if os.path.exists(path):
        for it in json.load(open(path))['items']:
            old[it['id']] = it
    for it in items:
        o = old.get(it['id'])
        if o and o.get('nutrition') and it['nutrition'] is None:
            # keep fetched nutrition when the query/id did not change
            same = (o['fdc'].get('query') == it['fdc']['query'] and o['fdc'].get('proxy') == it['fdc']['proxy']
                    and (it['fdc']['id'] in (None, o['fdc'].get('id'))))
            if same:
                it['nutrition'] = o['nutrition']
                for k in ('id', 'status', 'description', 'match', 'dataType'):
                    if k in o['fdc']:
                        it['fdc'][k] = o['fdc'][k]
    os.makedirs(OUT, exist_ok=True)
    with open(path, 'w') as fh:
        json.dump({'version': 1, 'note': 'Grocery catalog for /meal-prep/. Nutrition per 100 g edible portion from USDA FoodData Central (SR Legacy) via scripts/meals/fetch-nutrition.py. Edit scripts/meals/src/build_catalog.py, not this file.', 'items': items}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    meta = {
     'version': 1,
     'sections': [{'id': s, 'name': n, 'order': i + 1} for i, (s, n) in enumerate(SECTIONS)],
     'allergens': [{'id': a, 'name': ALLERGEN_NAMES[a]} for a in ALLERGENS],
     'diets': [{'id': 'vegetarian', 'name': 'Vegetarian'}, {'id': 'vegan', 'name': 'Vegan'},
               {'id': 'gluten-free', 'name': 'Gluten-free'}, {'id': 'dairy-free', 'name': 'Dairy-free'}],
     'tags': {
       'protein': ['beef', 'chicken', 'pork', 'turkey', 'fish', 'vegetarian'],
       'meal': ['breakfast', 'lunch', 'dinner', 'snack', 'side'],
       'method': ['stovetop', 'oven', 'sheet-pan', 'one-pot', 'slow-cooker', 'grill', 'no-cook'],
       'other': ['budget', 'quick', 'kid-friendly', 'freezer-friendly', 'make-ahead', 'lunchbox', 'leftovers'],
     },
     'units': {'mass': MASS, 'volume': VOL, 'count': sorted(COUNT_LABELS), 'labels': COUNT_LABELS},
     'nutrients': [{'id': i, 'name': n, 'unit': u, 'fdc': f, 'dv': dv} for i, n, u, f, dv in NUTRIENTS],
     'dv_note': 'Daily Values are the FDA values for adults and children 4 years and older, based on a 2,000-calorie diet.',
     'dv_source': 'https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels',
     'portion_factors': {'adult': 1, 'teen': 1.25, 'child': 0.6, 'toddler': 0.4},
     'portion_note': 'Starting points only; adjust to your family. Children\'s needs vary a lot with age and activity.',
    }
    with open(os.path.join(OUT, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(len(items), 'items')


if __name__ == '__main__':
    main()
