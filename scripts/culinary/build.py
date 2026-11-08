#!/usr/bin/env python3
"""Culinary Ladder: build data/culinary/topics/<course>.json, data/culinary/lessons/<course>.json and the problem
generators static/culinary/gen/<course>.js.

Skill maps (units and topics) are defined here. Lessons live in scripts/culinary/src/<course>.py (each defines LESSONS,
a dict topic slug -> {"blocks": [...], "sources": [...]}). Generators live in scripts/culinary/gen/<course>.js: this
script writes each one to static/culinary/gen/<course>.js with the shared prelude (scripts/culinary/gen/_prelude.js)
wrapped around it. Run:  python3 scripts/culinary/build.py
then:  node scripts/math/check-course.js culinary  and  node scripts/math/check-gen.js <course>

Safety rule for every lesson (the owner's): only established safety facts from the FDA Food Code 2022, USDA FSIS, FDA,
OSHA and fire departments; nothing an expert would push back on; no first-aid sections. Sanitizer strengths are never
given as numbers: follow the label and check with test strips. Recipes are not repeated here: lessons link to Meal Prep.
"""
import json, os, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRCDIR = os.path.join(os.path.dirname(__file__), 'src')
GENDIR = os.path.join(os.path.dirname(__file__), 'gen')

def T(slug, unit, title, short, prereqs, xp, trouble, viz=(), lab=None):
    t = {"slug": slug, "unit": unit, "title": title, "short": short, "prereqs": list(prereqs), "xp": xp, "trouble": trouble, "viz": list(viz)}
    if lab: t["lab"] = lab
    return t

COURSES = {
 "cufound": {
  "units": [
   ("tools", "The Kitchen and Its Tools", "Stations, ranges and ovens, knives and boards, pans and what they are made of, hand tools and machines."),
   ("working", "Working Like a Cook", "Measuring by weight, reading and scaling a recipe, mise en place and working clean."),
  ],
  "topics": [
   T("kitchen-tour", "tools", "The Kitchen and Its Stations", "A professional kitchen is laid out in stations around the range, ovens, broiler, fryer and cold storage; each machine has one job it does best.", [], 1,
     "New cooks think a salamander, a broiler and an oven are the same thing; they heat from different directions."),
   T("knives-boards", "tools", "Knives and Their Parts, Boards and Steels", "Four knives do most of the work: chef's, paring, serrated and boning. Know the tip, edge, heel, spine, bolster and tang, and keep the board from sliding.", ["cufound.kitchen-tour"], 1,
     "Beginners buy a big block of knives; a good chef's knife, a paring knife and a serrated knife cover nearly everything."),
   T("pans-materials", "tools", "Pans and What They Are Made Of", "Copper and aluminum spread heat fast, stainless resists acid, cast iron and carbon steel hold heat and season; the shape (sauté, saucepan, rondeau, stockpot, sheet pan) fits the job.", ["cufound.kitchen-tour"], 2,
     "Cooks crowd one small pan or use a thin pan for searing, then blame the stove for gray meat."),
   T("hand-tools", "tools", "Measuring and Hand Tools", "Scales, thermometers, measuring cups and spoons, ladles and scoops by size, sieves, the chinois, the mandoline with its guard, the spider and the fish spatula.", ["cufound.knives-boards"], 1,
     "People trust a thermometer they have never checked; a quick ice-water test tells you if it reads true."),
   T("machines", "tools", "Mixers, Blenders, Processors and Circulators", "The stand mixer's paddle, whisk and hook; blenders and immersion blenders; the food processor; the combi oven and the immersion circulator.", ["cufound.hand-tools"], 2,
     "Cooks use the whisk attachment for bread dough, or fill a blender with hot soup and seal the lid."),
   T("weighing", "working", "Measuring by Weight", "Professional recipes are written in grams or ounces because a cup of flour can weigh anywhere from about 120 to 160 grams; tare the scale and weigh.", ["cufound.hand-tools", "g6.convert-units-ratios"], 2,
     "Learners mix up fluid ounces (volume) and ounces (weight); they match only for water and liquids like it."),
   T("reading-recipes", "working", "Reading and Scaling a Recipe", "Read it all twice, find the times and temperatures, then scale with one conversion factor: new yield ÷ old yield.", ["cufound.weighing", "g7.solve-proportions"], 2,
     "People scale salt, spices and baking powder by the full factor in a huge batch and never taste; or forget pans and times change too.", ["cu-scale"]),
   T("mise-en-place", "working", "Mise en Place and Working Clean", "\"Everything in its place\": read, plan, gather, prep and set up your station before the heat goes on, and clean as you go.", ["cufound.reading-recipes"], 1,
     "Beginners start cooking and then chop, so the garlic burns while they hunt for the onion."),
  ]},
 "cuknife": {
  "units": [
   ("hands", "Hands and Basic Cuts", "The pinch grip, the claw, and the cuts every cook uses every day."),
   ("classic", "The Classic Cuts", "The named cuts with their sizes, and the decorative cuts."),
   ("edge", "Keeping an Edge", "Honing, sharpening and caring for knives."),
  ],
  "topics": [
   T("grip-guide", "hands", "The Grip and the Guide Hand", "Pinch the blade where it meets the handle; curl the guide hand into a claw so the knuckles guide the flat of the blade and the fingertips stay tucked.", ["cufound.knives-boards"], 1,
     "Beginners hold the knife by the handle with a pointing finger on the spine, and flatten the guide hand with fingertips out."),
   T("onion-mince", "hands", "Slicing, Dicing an Onion and Mincing", "The rocking cut and the push cut; how to dice an onion with its root holding it together; mincing garlic and herbs.", ["cuknife.grip-guide"], 1,
     "Cooks cut off the onion's root end first, so the layers fall apart before they can dice them."),
   T("classic-cuts", "classic", "The Classic Cuts and Their Sizes", "Julienne, batonnet, brunoise and the small, medium and large dice have standard sizes, so food cooks evenly and looks deliberate.", ["cuknife.onion-mince"], 2,
     "Learners mix up batonnet (¼ inch sticks) and julienne (⅛ inch sticks), or cut a dice that is really a pile of rough chunks.", ["cu-cuts"]),
   T("specialty-cuts", "classic", "Chiffonade, Paysanne, Tourné and Other Shaped Cuts", "Ribbons of leaves, thin flat squares, rounds, bias and oblique cuts, and the seven-sided tourné.", ["cuknife.classic-cuts"], 2,
     "Cooks chiffonade basil with a dull knife and bruise it black, or roll leaves loosely so the ribbons are uneven.", ["cu-cuts"]),
   T("sharpening-honing", "edge", "Honing and Sharpening", "Honing pushes a bent edge back into line; sharpening grinds new metal to make a new edge. Hold a steady angle, about 15 to 20 degrees per side.", ["cuknife.grip-guide", "geo.trig-ratios"], 2,
     "People think a steel sharpens; it only straightens. A knife that stays dull after honing needs a stone.", ["cu-angle"]),
   T("knife-care", "edge", "Whetstones and Knife Care", "Coarse, medium and fine grits; raising and removing a burr; washing by hand, drying, storing in a block, strip or guard, and never leaving a knife in the sink.", ["cuknife.sharpening-honing"], 2,
     "Cooks put good knives in the dishwasher or a drawer loose, and leave a knife under soapy water where someone can grab the blade."),
  ]},
 "cusafe": {
  "units": [
   ("hazards", "What Makes Food Unsafe", "Germs, chemicals and objects; time and temperature."),
   ("temps", "Time and Temperature", "Cooking, cooling, holding, reheating and date marking, by the FDA Food Code and USDA."),
   ("people", "People, Surfaces and Systems", "Cross-contamination, allergens, hygiene, cleaning and sanitizing, and HACCP."),
  ],
  "topics": [
   T("hazards", "hazards", "Biological, Chemical and Physical Hazards", "Germs (bacteria, viruses, parasites), chemicals (cleaners, pesticides, allergens) and objects (glass, bone, metal) can all make food unsafe; bacteria need food, warmth, time and moisture.", [], 1,
     "People think food that smells and looks fine is safe; the germs that cause illness usually don't change smell or look.", lab=None),
   T("danger-zone", "hazards", "The Temperature Danger Zone", "Bacteria grow fastest between 41°F and 135°F, the FDA Food Code's limits for restaurants; USDA tells home cooks 40°F to 140°F. Keep cold food cold and hot food hot.", ["cusafe.hazards", "lifesci.bacteria-growth"], 1,
     "Learners think the two sets of numbers disagree; they come from different documents, and both tell you to keep food out of the middle.", ["cu-cool"]),
   T("cooking-temps", "temps", "Safe Minimum Internal Temperatures", "Poultry 165°F; ground meat 160°F (USDA) or 155°F for 17 seconds (Food Code); whole cuts of beef, pork, veal and lamb and fish 145°F; check with a thermometer in the thickest part.", ["cusafe.danger-zone"], 2,
     "Cooks judge chicken by the color of its juices; only a thermometer tells you it reached 165°F.", ["cu-temps"]),
   T("cooling", "temps", "Cooling Food Safely", "The Food Code's two stages: from 135°F to 70°F within 2 hours, then to 41°F or below within 4 more hours. Shallow pans, ice baths and small portions make it work.", ["cusafe.danger-zone"], 2,
     "Cooks put a full stockpot of hot soup straight in the walk-in; the middle can stay warm for many hours.", ["cu-cool"]),
   T("holding-dating", "temps", "Holding, Reheating, Labeling and Date Marking", "Hold hot food at 135°F or above and cold food at 41°F or below; reheat for hot holding to 165°F within 2 hours; label and date, and use ready-to-eat food within 7 days; first in, first out.", ["cusafe.cooling"], 2,
     "Cooks reheat soup slowly in a steam table, which is built to hold food hot, not to heat it."),
   T("cross-contamination", "people", "Cross-Contamination and Storage Order", "Keep raw animal foods away from ready-to-eat food: separate boards, clean tools, and a refrigerator stored top to bottom by the temperature each food must be cooked to.", ["cusafe.hazards"], 1,
     "People store raw chicken above the salad greens, so its juices can drip down.", ["cu-shelf"]),
   T("allergens", "people", "The Nine Major Food Allergens", "Milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame (added in 2023). Cooking does not remove an allergen; separate tools and honest answers do.", ["cusafe.cross-contamination"], 1,
     "Cooks think picking the nuts off a plate makes it safe, or that the fryer oil can be shared with a shrimp order."),
   T("hygiene", "people", "Handwashing, Gloves and Personal Hygiene", "Wash hands for at least 20 seconds before work, after raw meat, the restroom, touching your face or trash, and before gloving; gloves don't replace handwashing; sick workers stay home.", ["cusafe.hazards"], 1,
     "Cooks put on gloves and then touch everything: raw meat, the phone, then the lettuce."),
   T("clean-sanitize", "people", "Cleaning and Sanitizing", "Cleaning removes dirt and food; sanitizing reduces germs to safe levels on a surface that is already clean. Three-compartment sink: wash, rinse, sanitize, air-dry. Mix sanitizer by the label and check with test strips.", ["cusafe.hygiene"], 1,
     "People spray sanitizer on a dirty board; food and grease shield germs, so the surface must be cleaned first."),
   T("haccp", "people", "HACCP: A Plan for Safe Food", "Hazard Analysis and Critical Control Points: seven principles that find where food could become unsafe, set limits there, check them and write it down.", ["cusafe.holding-dating", "cusafe.clean-sanitize"], 2,
     "Learners think a critical control point is any step; it is a step where control is essential to stop a hazard, such as cooking or cooling."),
  ]},
 "cuheat": {
  "units": [
   ("science", "How Heat Cooks", "Conduction, convection and radiation; browning reactions."),
   ("dry", "Dry-Heat Methods", "Sautéing, pan-frying, deep-frying, roasting, grilling and broiling."),
   ("moist", "Moist and Combination Methods", "Poaching, simmering, boiling, steaming, braising, stewing and sous vide."),
  ],
  "topics": [
   T("heat-transfer", "science", "Conduction, Convection and Radiation", "Pans conduct heat into food, air and liquids carry it by convection, and broilers and grills radiate it; most cooking uses all three.", ["cufound.pans-materials", "physsci.heat-transfer"], 1,
     "People think a hotter oven always cooks faster without a cost; the outside overcooks before heat reaches the center."),
   T("browning", "science", "Browning: the Maillard Reaction and Caramelization", "Above about 280°F to 300°F, proteins and sugars react to make brown color and roasted flavor (Maillard); sugar alone browns as it breaks down (caramelization). Water keeps the surface too cool, so dry the food.", ["cuheat.heat-transfer"], 2,
     "Cooks crowd a wet pan and wonder why the meat steams gray instead of browning."),
   T("saute-panfry", "dry", "Sautéing, Stir-Frying and Pan-Frying", "Sauté: a little fat, a hot pan, small pieces moving. Pan-fry: more fat, often a breading, cooked on one side and then the other.", ["cuheat.browning"], 2,
     "Beginners put food in a cold pan with cold oil, so it sticks and soaks up fat."),
   T("deep-fry", "dry", "Deep-Frying and Oil Safety", "Food submerged in oil at about 325°F to 375°F; dry the food, fry in small batches, and know the fire rules: never water on a grease fire, smother it with a lid, Class K extinguishers in commercial kitchens.", ["cuheat.saute-panfry"], 2,
     "People drop wet or frozen food with ice crystals into hot oil, which spatters and can boil over."),
   T("dry-oven", "dry", "Roasting, Grilling and Broiling", "Roast in hot air, grill over the heat, broil under it; sear, then finish at a lower temperature for large pieces, and use a thermometer.", ["cuheat.browning"], 2,
     "Cooks cut into meat to check it and lose the juices; a probe thermometer answers without a cut.", ["cu-carry"]),
   T("moist-heat", "moist", "Poaching, Simmering, Boiling and Steaming", "Poach at about 160°F to 180°F, simmer at about 185°F to 205°F, boil at 212°F at sea level; steam cooks by condensing vapor. Water boils at a lower temperature high in the mountains.", ["cuheat.heat-transfer", "gchem1.freezing-boiling-points"], 2,
     "Cooks boil what should be poached, which toughens fish and breaks up eggs."),
   T("braise-stew", "moist", "Braising and Stewing", "Brown first, then cook slowly, partly covered in liquid, until tough connective tissue turns to gelatin. Braises use large pieces in a little liquid; stews use smaller pieces covered in liquid.", ["cuheat.browning", "cuheat.moist-heat"], 2,
     "People braise at a hard boil, which dries the meat even though it sits in liquid."),
   T("sous-vide", "moist", "Sous Vide: Precise Low-Temperature Cooking", "Food sealed in a bag and cooked in a water bath held at an exact temperature. Safety comes from time at temperature: reach a safe minimum temperature, or hold long enough by a published table.", ["cuheat.moist-heat", "cusafe.cooking-temps"], 3,
     "Cooks think a low bath temperature is safe because the food is sealed; time at temperature is what makes it safe."),
  ]},
 "cusauce": {
  "units": [
   ("stocks", "Stocks and Thickeners", "The foundation of the French kitchen, and how sauces get their body."),
   ("sauces", "The Sauces", "The five mother sauces, their children, emulsions and pan sauces."),
   ("soups", "Soups", "Clear, cream, purée and bisque."),
  ],
  "topics": [
   T("stocks", "stocks", "Stocks: White, Brown, Fish and Vegetable", "Bones or vegetables, aromatic mirepoix and cold water, simmered (never boiled) and skimmed: chicken about 3 to 4 hours, beef or veal 6 to 8, fish 30 to 45 minutes.", ["cuheat.moist-heat"], 2,
     "Cooks boil stock hard, which clouds it with fat and particles."),
   T("thickeners", "stocks", "Roux, Slurries and Liaisons", "Roux is equal weights of fat and flour cooked to white, blond or brown; slurries are starch stirred into cold liquid; a liaison of yolks and cream enriches at the end.", ["cusauce.stocks"], 2,
     "Cooks add cold roux to cold liquid and get lumps, or boil a liaison and scramble the yolks."),
   T("mother-sauces", "sauces", "The Five Mother Sauces", "Escoffier's leading sauces: béchamel (milk and roux), velouté (white stock and roux), espagnole (brown stock and brown roux), tomato and hollandaise.", ["cusauce.thickeners"], 2,
     "Learners memorize five names without the pattern: each mother is a liquid plus a way to thicken it.", ["cu-sauces"]),
   T("small-sauces", "sauces", "Small Sauces: Children of the Mothers", "Add cheese to béchamel for Mornay, mushrooms and cream to velouté for suprême, shallots and wine to demi-glace for bordelaise, tarragon reduction to hollandaise for béarnaise.", ["cusauce.mother-sauces"], 2,
     "Learners mix up which mother a small sauce comes from; ask what liquid is in it.", ["cu-sauces"]),
   T("emulsions", "sauces", "Emulsions: Mayonnaise, Hollandaise, Vinaigrette, Beurre Blanc", "Tiny drops of fat held in water with help from an emulsifier such as egg yolk or mustard; add the fat slowly, and keep warm emulsions warm, not hot.", ["cusauce.mother-sauces"], 3,
     "Cooks pour the oil in too fast or let hollandaise get too hot, and the sauce breaks."),
   T("pan-sauces", "sauces", "Reductions and Pan Sauces", "Deglaze the browned bits (fond) with wine or stock, reduce, and finish with cold butter swirled in off the heat (monter au beurre).", ["cusauce.stocks", "cuheat.saute-panfry"], 2,
     "Cooks reduce with salt already in, so the sauce ends too salty; season at the end."),
   T("soups", "soups", "Clear, Cream and Purée Soups", "Broths and consommé are clear; cream soups are thickened; purées are thickened by the vegetables or beans themselves; bisques are shellfish soups.", ["cusauce.stocks", "cusauce.thickeners"], 2,
     "Cooks blend hot soup in a sealed blender full to the top; steam can force the lid off."),
  ]},
 "cuprot": {
  "units": [
   ("meat", "Meat", "Muscle and connective tissue, the primal cuts, brines and marinades."),
   ("birds-fish", "Poultry, Fish and Shellfish", "Breaking down a chicken, filleting a round fish, and shellfish basics."),
   ("doneness", "Doneness and Eggs", "Thermometers, resting and carryover; omelets and poached eggs."),
  ],
  "topics": [
   T("meat-structure", "meat", "Muscle, Connective Tissue and Tenderness", "Muscles that worked hard (shoulder, leg) have more connective tissue and want slow moist heat; tender ones (loin, rib) want quick dry heat. Slice across the grain.", ["cuheat.braise-stew", "hsbio.proteins"], 2,
     "Cooks grill a tough cut fast or braise a tender loin for hours and dry it out."),
   T("primal-cuts", "meat", "Beef, Pork and Lamb Primal Cuts", "Butchers split each carcass into primals (beef: chuck, rib, short loin, sirloin, round, brisket, plate, flank), then subprimals and portions.", ["cuprot.meat-structure"], 2,
     "Learners think a cut's name tells its cooking method without knowing where it comes from on the animal."),
   T("brines", "meat", "Brines, Marinades and Rubs", "A brine is salt dissolved in water by weight; it seasons inside and helps meat hold moisture. Marinades flavor the surface. Keep both refrigerated and discard used raw marinade unless boiled.", ["cuprot.meat-structure"], 2,
     "Cooks brine in a weak or extra-strong solution by guessing volume, or baste with marinade that held raw chicken."),
   T("poultry", "birds-fish", "Breaking Down a Chicken", "Legs off at the joint, thighs from drumsticks, breasts off the bone, wings at the joint: eight pieces, plus a frame for stock. Work clean and sanitize after.", ["cuprot.meat-structure", "cusafe.cross-contamination"], 2,
     "Beginners saw through bone instead of finding the joint with the knife tip."),
   T("fish", "birds-fish", "Fish: Freshness and Filleting a Round Fish", "Fresh fish smells like the sea, has firm flesh and bright, clear eyes. A round fish gives two fillets: cut behind the head, then along the backbone.", ["cuprot.poultry"], 2,
     "Cooks press too hard and leave half the flesh on the frame, or forget to pull pin bones."),
   T("shellfish", "birds-fish", "Shellfish Basics", "Live clams, mussels and oysters have closed shells or close when tapped; discard any that stay open or are cracked; keep shellstock tags 90 days; cook shrimp and lobster until opaque.", ["cuprot.fish", "cusafe.allergens"], 2,
     "Cooks store live shellfish in sealed plastic or fresh water, which kills them."),
   T("doneness", "doneness", "Doneness, Resting and Carryover Cooking", "Meat keeps rising in temperature after it leaves the heat, a few degrees for steaks and more for big roasts; pull early, rest, then slice.", ["cuheat.dry-oven", "cusafe.cooking-temps"], 2,
     "Cooks pull a roast at the final temperature they want and end up several degrees past it.", ["cu-carry"]),
   T("eggs", "doneness", "Eggs: Omelets and Poaching", "The French omelet is rolled, pale and creamy; the American omelet is folded and lightly browned. Poach in barely simmering water; egg dishes are safe at 160°F.", ["cuheat.moist-heat"], 2,
     "Cooks use too much heat, so the omelet browns and toughens before it sets."),
  ]},
 "cuveg": {
  "units": [
   ("veg", "Vegetables", "Blanching, glazing, roasting, purées and potatoes."),
   ("starch", "Grains, Pasta and Legumes", "Rice and risotto, fresh pasta from scratch, beans and lentils."),
  ],
  "topics": [
   T("blanch-shock", "veg", "Blanching and Shocking", "Cook green vegetables briefly in plenty of salted boiling water, then plunge them into ice water to stop the cooking and keep the color bright.", ["cuheat.moist-heat"], 1,
     "Cooks blanch too much at once, so the water stops boiling and the vegetables stew olive-green."),
   T("veg-methods", "veg", "Glazing, Roasting and Purées", "Glaze in a little water, butter and sugar until shiny; roast at high heat for browned edges; purée cooked vegetables and pass them through a sieve for smoothness.", ["cuveg.blanch-shock", "cuheat.browning"], 2,
     "Cooks crowd a roasting pan, so vegetables steam instead of browning."),
   T("potatoes", "veg", "Potatoes: Starchy and Waxy", "Starchy potatoes (russets) are fluffy for baking, mashing and frying; waxy ones hold their shape in salads and gratins. Classic fries are cooked twice: low, then high.", ["cuveg.veg-methods", "cuheat.deep-fry"], 2,
     "Cooks mash potatoes in a blender or food processor, which makes them gluey."),
   T("rice-grains", "starch", "Rice, Grains and Risotto", "Absorption, pilaf and pasta methods; risotto adds hot stock a little at a time to short-grain rice while stirring, so the starch makes it creamy.", ["cuheat.moist-heat"], 2,
     "Cooks rinse risotto rice or add cold stock, which slows it and spoils the creamy texture."),
   T("fresh-pasta", "starch", "Fresh Pasta from Scratch", "About 100 grams of flour for each large egg; knead until smooth, rest, roll thin, cut, and cook briefly in plenty of salted boiling water.", ["cufound.weighing"], 2,
     "Beginners roll pasta before it rests, and it springs back and tears."),
   T("legumes", "starch", "Beans and Lentils", "Sort and rinse; soak beans to shorten cooking; boil red kidney beans hard in fresh water to destroy a natural toxin; lentils need no soaking.", ["cuveg.rice-grains"], 1,
     "Cooks simmer raw kidney beans in a slow cooker that never gets them to a full boil."),
  ]},
 "cupastry": {
  "units": [
   ("dough", "Doughs and Baker's Math", "Baker's percentages, lean, enriched and laminated doughs, and pastry doughs."),
   ("creams", "Custards, Chocolate and Sugar", "Crème anglaise and pastry cream, tempering chocolate, and the stages of cooked sugar."),
   ("plated", "Plated Desserts", "Putting the parts together on a plate."),
  ],
  "topics": [
   T("bakers-percent", "dough", "Baker's Percentages", "Every ingredient is written as a percent of the flour's weight: flour is 100%, water 65% means 650 g of water for 1,000 g of flour.", ["cufound.weighing", "g6.percent-of-a-number"], 2,
     "Learners make the percents add up to 100; in baker's math the flour alone is 100%.", ["cu-bakers"]),
   T("lean-dough", "dough", "Lean Doughs: Flour, Water, Salt and Yeast", "Mix, knead to build gluten, ferment, shape, proof and bake. Hydration (water as a percent of flour) sets the texture; salt is about 2%.", ["cupastry.bakers-percent"], 2,
     "Bakers add salt straight onto the yeast, or judge proofing by the clock instead of the dough.", ["cu-bakers"]),
   T("enriched-laminated", "dough", "Enriched and Laminated Doughs", "Butter, eggs, milk and sugar make soft, rich doughs (brioche, challah); folding a sheet of butter into dough again and again makes layers (croissant, puff pastry).", ["cupastry.lean-dough"], 3,
     "Bakers let the butter get warm while laminating, so it melts into the dough and the layers disappear."),
   T("pastry-doughs", "dough", "Pie Dough, Pâte Sucrée and Pâte à Choux", "3-2-1 pie dough (flour, fat, water by weight), sweet tart dough made by creaming, and choux paste cooked on the stove, then beaten with eggs so it puffs in the oven.", ["cupastry.bakers-percent"], 2,
     "Bakers overwork pie dough, which toughens it, or open the oven while choux puffs and it collapses.", ["cu-bakers"]),
   T("custards", "creams", "Custards: Crème Anglaise and Pastry Cream", "Crème anglaise is milk, yolks and sugar stirred over gentle heat until it coats a spoon (about 170°F to 180°F); pastry cream adds starch and must come to a boil to thicken.", ["cuheat.moist-heat"], 2,
     "Cooks boil crème anglaise and curdle it, or stop pastry cream before it boils, so it thins later."),
   T("chocolate", "creams", "Chocolate and Tempering", "Tempering melts, cools and gently rewarms chocolate so the cocoa butter sets in its stable form: shiny, snapping, not streaky.", ["cupastry.custards"], 3,
     "Cooks let a drop of water get into melting chocolate, which makes it seize into a stiff paste."),
   T("sugar", "creams", "Sugar Stages and Caramel", "As syrup cooks, water boils off and the temperature rises: thread, soft ball, firm ball, hard ball, soft crack, hard crack, then caramel.", ["cupastry.custards"], 2,
     "Cooks stir a sugar syrup that is crystallizing, or leave the pan to answer the phone; caramel goes from perfect to burnt in seconds.", ["cu-sugar"]),
   T("plated-desserts", "plated", "Plated Desserts", "A main item, a sauce, something crisp, something cold, and a garnish that belongs: contrast in texture, temperature and color.", ["cupastry.sugar", "cupastry.pastry-doughs"], 2,
     "Cooks pile on garnish that adds nothing to the taste, such as a mint sprig on everything."),
  ]},
 "cugarde": {
  "units": [
   ("cold", "The Cold Kitchen", "Salads and dressings, cold appetizers and canapés."),
   ("preserve", "Preserving and Charcuterie", "Quick pickles, confit and terrines, cured meats and cheese, as they are described and served."),
  ],
  "topics": [
   T("salads-dressings", "cold", "Salads and Dressings", "Wash and dry greens well, dress them just before serving; a vinaigrette is about 3 parts oil to 1 part acid, and emulsified dressings stay mixed.", ["cusauce.emulsions"], 1,
     "Cooks dress wet greens, so the dressing slides off and pools at the bottom."),
   T("canapes", "cold", "Canapés and Hors d'Oeuvres", "A canapé is a base, a spread and a topping, small enough for one or two bites; cold food stays at 41°F or below until it is served.", ["cugarde.salads-dressings"], 2,
     "Cooks build canapés hours early on bread, which goes soggy."),
   T("pickles", "preserve", "Quick Pickles and Refrigerator Pickles", "Vegetables in a vinegar brine, kept in the refrigerator. Canning for the shelf is a separate skill: use only tested recipes from USDA or extension services.", ["cugarde.salads-dressings"], 2,
     "People invent a low-vinegar recipe and keep it on the shelf; only tested recipes are safe for canning."),
   T("confit-terrines", "preserve", "Confit, Pâtés and Terrines", "Confit is meat cooked slowly in fat; a terrine is a seasoned meat or vegetable mixture cooked in a mold and served cold. Both are kept refrigerated.", ["cugarde.pickles", "cusafe.cooling"], 3,
     "People think fat-covered confit keeps at room temperature; keep it in the refrigerator."),
   T("charcuterie-cheese", "preserve", "Charcuterie and Cheese Boards", "What dry-cured ham and salami are, why their making needs exact curing salts and controlled rooms, and how to build and serve a board of cured meats and cheese.", ["cugarde.confit-terrines"], 2,
     "Home cooks try to dry-cure sausage by guesswork; curing needs measured curing salt and controlled temperature and humidity."),
  ]},
 "cuflavor": {
  "units": [
   ("taste", "Tasting and Seasoning", "The basic tastes, salt, acid, fat and heat, herbs and spices, and how to taste and adjust."),
   ("menu", "Seasons and Menus", "Cooking with the seasons and writing a menu."),
  ],
  "topics": [
   T("tastes", "taste", "The Basic Tastes and Aroma", "Sweet, sour, salty, bitter and umami are tasted on the tongue; most of what we call flavor is aroma, smelled from the back of the mouth.", ["cufound.mise-en-place", "lifesci.nervous-system"], 1,
     "People think the tongue has a map with one taste per zone; each taste can be sensed all over the tongue."),
   T("seasoning", "taste", "Seasoning: Salt, Acid, Fat and Heat", "Salt makes food taste more like itself, acid brightens, fat carries flavor, and heat (both chile and cooking) adds depth. Season in layers.", ["cuflavor.tastes"], 2,
     "Cooks add all the salt at the end, when it sits on the surface instead of seasoning through."),
   T("tasting-adjusting", "taste", "Tasting and Adjusting", "Taste with a clean spoon every time, often; fix flat with salt or acid, too salty with more unsalted base, too sour with sweetness or fat.", ["cuflavor.seasoning"], 2,
     "Cooks double-dip a tasting spoon, or try to fix too much salt by adding sugar."),
   T("herbs-spices", "taste", "Herbs, Spices and Aromatics", "Hardy herbs go in early and tender herbs at the end; toast whole spices to wake them; about 1 part dried herb replaces 3 parts fresh.", ["cuflavor.seasoning"], 1,
     "Cooks add tender basil at the start of a long simmer, so its flavor is gone by serving time."),
   T("seasonality", "menu", "Seasonality and Sourcing", "Food tastes best and costs least at the height of its season; menus change with what farms and markets have.", ["cuflavor.tastes"], 1,
     "People write a menu that needs ripe tomatoes in winter."),
   T("menu-writing", "menu", "Writing a Menu", "Balance the menu in methods, colors, richness and station load; describe dishes honestly; price from food cost; and look at what sells.", ["cuflavor.seasonality", "cufound.reading-recipes"], 2,
     "New chefs put five fried dishes on one menu, all from one overloaded station.", ["cu-cost"]),
  ]},
 "cuplate": {
  "units": [
   ("plate", "The Plate", "Composition, sauce work and garnish."),
   ("table", "The Table", "The place setting, the courses of a tasting menu, service styles and the pass."),
  ],
  "topics": [
   T("composition", "plate", "Plate Composition", "Choose the plate, then build with color, height and texture; leave clear space; odd numbers of pieces look natural; keep the rim clean.", ["cuflavor.tastes"], 2,
     "Beginners fill every inch of the plate, or stack everything into a tall tower that falls over at the table.", ["cu-plate"]),
   T("sauce-garnish", "plate", "Sauce Work and Garnish", "Pools, dots, swooshes and spoon drags; every garnish should be edible and belong to the dish.", ["cuplate.composition"], 2,
     "Cooks pour the sauce over the crispy skin they worked to make crisp."),
   T("place-setting", "table", "The Place Setting: Utensils, Glasses and Plates", "Forks on the left, knives and spoons on the right, used from the outside in; glasses above the knives; the bread plate at upper left; dessert utensils above the plate.", ["cuplate.composition"], 1,
     "Diners and new servers mix up the bread plate and the glasses: solids on the left, liquids on the right.", ["cu-setting"]),
   T("tasting-menu", "table", "The Courses of a Tasting Menu", "Many small courses in an order that builds: a small bite from the chef, lighter to richer, savory to sweet, often with cheese before dessert and small sweets at the end.", ["cuplate.place-setting"], 2,
     "New cooks serve full portions on a tasting menu, and guests are full by course four."),
   T("service-styles", "table", "Service Styles: French, Russian, American and Family", "Plated (American) service comes from the kitchen on the plate; Russian service is served from platters at the table; French (guéridon) service finishes dishes on a cart beside the table; family style passes platters.", ["cuplate.place-setting"], 1,
     "Learners mix up French and Russian service, which in history meant something different from what they mean in restaurants today."),
   T("the-pass", "table", "The Pass: Firing and Calling Tickets", "The expediter calls each order, the stations answer \"heard\", courses are fired so they finish together, and every plate is checked before it leaves.", ["cuplate.composition"], 2,
     "Cooks start each dish when they see it instead of when it is fired, so a table's plates finish minutes apart."),
  ]},
 "cupro": {
  "units": [
   ("people", "The Brigade and Its Language", "Escoffier's brigade, titles and roles, and how cooks talk."),
   ("ops", "Running a Kitchen", "Stations and prep lists, ordering and inventory, costing, timing, cleaning and safety."),
   ("career", "Stars, Careers and the Capstone", "What Michelin stars mean, how cooks build careers, and a tasting menu to cook at home."),
  ],
  "topics": [
   T("brigade", "people", "The Brigade System", "Escoffier organized big kitchens into stations under one chef: chef de cuisine, sous-chef, chefs de partie such as saucier and pâtissier, cooks, commis and dishwashers.", ["cufound.kitchen-tour"], 1,
     "Learners think every restaurant has the full classical brigade; most kitchens today combine stations.", ["cu-brigade"]),
   T("kitchen-language", "people", "Kitchen Language", "Short calls keep people safe and orders moving: \"behind\", \"corner\", \"hot\", \"sharp\", \"heard\", \"fire\", \"all day\", \"86\" and \"on the fly\".", ["cupro.brigade"], 1,
     "New cooks stay silent when they walk behind someone carrying a hot pan."),
   T("station-prep", "ops", "Station Setup, Prep Lists and Par Levels", "A par level is how much you need on hand for a service; the prep list is par minus what you have; a station is set up so every item is in reach.", ["cufound.mise-en-place", "cupro.brigade"], 2,
     "Cooks prep by habit instead of by par, and run out of one thing while throwing away another."),
   T("ordering-inventory", "ops", "Ordering, Receiving and Inventory", "Order from pars, check deliveries for temperature, quality and count, rotate stock first in, first out, and count inventory on a schedule.", ["cupro.station-prep", "cusafe.holding-dating"], 2,
     "Receivers sign for a delivery without checking that cold food arrived cold."),
   T("recipe-costing", "ops", "Recipe Costing, Yield Tests and Food Cost", "Usable cost = purchase cost ÷ yield; add up a recipe, divide by portions, and food cost percent = cost ÷ menu price.", ["cupro.ordering-inventory", "g6.percent-of-a-number"], 3,
     "Cooks cost a recipe from the purchase price and forget the trim they throw away.", ["cu-cost"]),
   T("timing-service", "ops", "Timing a Service", "Work backward from the time food must leave the pass; know your ticket times; fire long-cooking items first so a table's plates finish together.", ["cupro.station-prep", "cuplate.the-pass"], 2,
     "Cooks start everything at once, so the fast items wait and die under the heat lamp.", ["cu-plan"]),
   T("cleaning-maintenance", "ops", "Cleaning Schedules and Equipment Care", "Clean as you go, a closing clean every night, and a deep-cleaning schedule; hoods, filters, fryers, ice machines and ovens are cleaned and serviced on the schedule set by the manufacturer and local code.", ["cusafe.clean-sanitize"], 1,
     "Kitchens let hood filters fill with grease, which is a fire risk."),
   T("working-safely", "ops", "Working Safely: Cuts, Burns, Slips and Lifting", "Prevention habits: sharp knives used with care, dry towels for hot handles, calls when moving, closed non-slip shoes, spills cleaned at once, and help with heavy pots.", ["cupro.kitchen-language", "cuheat.deep-fry"], 1,
     "Cooks grab a hot pan handle with a wet towel; water carries heat straight through to the hand."),
   T("michelin", "career", "What Michelin Stars Mean", "Anonymous inspectors award one star (\"worth a stop\"), two (\"worth a detour\") or three (\"worth a special journey\") for the food on the plate, judged on five published criteria.", ["cuplate.tasting-menu"], 1,
     "People think stars reward fancy rooms and service; Michelin says the stars are for the cooking."),
   T("careers", "career", "Stages, Careers and Certifications", "Most chefs learn by working, often starting as line cooks; staging (working a short trial), culinary programs, apprenticeships and ACF certification are other steps. Figures from the BLS.", ["cupro.brigade"], 1,
     "People think a culinary degree alone makes you a chef; most chefs and head cooks have years of kitchen work behind them."),
   T("capstone", "career", "Capstone: Cook a Tasting Menu at Home", "Plan, cost, prep and cook a five-course tasting menu for four to six people, with a timeline that starts three days ahead.", ["cupro.timing-service", "cupro.recipe-costing", "cuplate.tasting-menu"], 3,
     "First tasting menus try too many new techniques at once; cook each dish once before the big night.", ["cu-plan"]),
  ]},
}

# ---------- helpers handed to every lesson file in src/ (so each file just builds blocks)
def P(h): return {"t": "p", "html": h}
def K(h): return {"t": "key", "html": h}
def W(h): return {"t": "why", "html": h}
def M(h): return {"t": "mistake", "html": h}
def N(h): return {"t": "note", "html": h}
def H(x): return {"t": "h", "text": x}
def EX(title, q, steps, a): return {"t": "ex", "title": title, "q": q, "steps": list(steps), "a": a}
def V(name, opts=None, cap=None):
    b = {"t": "viz", "name": name}
    if opts: b["opts"] = opts
    if cap: b["cap"] = cap
    return b
def LI(*items): return {"t": "list", "items": list(items)}
def TB(head, rows, cap=None):
    b = {"t": "table", "head": list(head), "rows": [list(r) for r in rows]}
    if cap: b["cap"] = cap
    return b
TRY = {"t": "try"}
def _box(cls, icon, label, inner): return N('<div class="cu-box %s"><p class="cu-box-lab"><span aria-hidden="true">%s</span> %s</p>%s</div>' % (cls, icon, label, inner))
def _ul(items): return '<ul>%s</ul>' % ''.join('<li>%s</li>' % i for i in items)
def DRILL(*items):
    """Practice at home: drills you can do in your own kitchen."""
    return _box('cu-drill', '🏠', 'Practice at home', _ul(items))
def SAFE(*items):
    """Established safety facts (FDA Food Code, USDA, OSHA, fire departments), prevention only."""
    return _box('cu-safe', '🛡️', 'Safety', _ul(items))
def MP(items, label='In Meal Prep'):
    """Links to Meal Prep recipes and guides: items = [(path under /meal-prep/, title, text)]."""
    def u(p): return p if p.startswith('/') else '/meal-prep/' + p
    return _box('cu-mp', '🍲', label, _ul([('<a href="%s">%s</a>: %s' % (u(p), t, x)) if x else '<a href="%s">%s</a>' % (u(p), t) for p, t, x in items]))
def SCI(items):
    """Links to the science ladders: items = [(url, title, text)]."""
    return _box('cu-sci', '🔬', 'The science behind it', _ul(['<a href="%s">%s</a>: %s' % (u, t, x) for u, t, x in items]))
def Q(text, who, work, src, url=None):
    """A public-domain quotation with its source."""
    cap = '%s, <cite>%s</cite>. %s.' % (who, work, src)
    if url: cap += ' <a href="%s" rel="noopener">Read it</a>.' % url
    return N('<figure class="cu-quote"><blockquote><p>%s</p></blockquote><figcaption>%s</figcaption></figure>' % (text, cap))
def GK(title, label=None):
    """A Grokipedia link (checked to exist before use; see RESEARCH notes)."""
    return '<a href="https://grokipedia.com/page/%s" rel="noopener">%s</a>' % (title, label or title.replace('_', ' '))

SRC = {
 "foodcode": {"name": "U.S. Food and Drug Administration, Food Code 2022 (the model code most state and local health departments adopt)", "url": "https://www.fda.gov/food/fda-food-code/food-code-2022"},
 "fda_cool": {"name": "FDA, Cooling Cooked Time/Temperature Control for Safety Foods and the FDA Food Code: for Food Employees (July 2024)", "url": "https://www.fda.gov/media/181882/download"},
 "usda_temps": {"name": "USDA Food Safety and Inspection Service, Safe Minimum Internal Temperature Chart (printable chart at FoodSafety.gov)", "url": "https://www.foodsafety.gov/print/pdf/node/10"},
 "usda_dz": {"name": "USDA Food Safety and Inspection Service, \"Danger Zone\" (40°F to 140°F)", "url": "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f"},
 "mn_roast": {"name": "Minnesota Department of Health, Cooking Whole Meat Roasts (the Food Code's time and temperature table)", "url": "https://www.health.mn.gov/communities/environment/food/docs/fs/cookroastsfs.pdf"},
 "va_code": {"name": "Virginia Food Regulations 12VAC5-421-700 to 760, which adopt the Food Code's cooking and reheating rules", "url": "https://law.lis.virginia.gov/admincodefull/title12/agency5/chapter421/partIII/article4/"},
 "fda_allergen": {"name": "FDA, Food Allergies: the nine major food allergens and the FASTER Act", "url": "https://www.fda.gov/food/food-labeling-nutrition/food-allergies"},
 "osha": {"name": "OSHA, Young Worker Safety in Restaurants eTool: Cooking", "url": "https://www.osha.gov/etools/young-workers-restaurant-safety/cooking"},
 "cfd": {"name": "Cambridge (Massachusetts) Fire Department, Kitchen grease fire safety tips (2023)", "url": "https://www.cambridgema.gov/cfd/News/2023/05/cookingfiresafety"},
 "escoffier": {"name": "A. Escoffier, A Guide to Modern Cookery (London: Heinemann, 1907), Project Gutenberg #71395 (public domain)", "url": "https://www.gutenberg.org/ebooks/71395"},
 "escoffier_ia": {"name": "A. Escoffier, A Guide to Modern Cookery (1907), scan from Cornell University Library, Internet Archive", "url": "https://archive.org/details/cu31924000610117"},
 "cia": {"name": "The Culinary Institute of America, Culinary Arts (AOS) curriculum (course list)", "url": "https://catalog.ciachef.edu/node/1273"},
 "acf": {"name": "American Culinary Federation, Certification levels (Certified Executive Chef requirements)", "url": "https://www.acfchefs.org/ACF/Certify/Levels/CEC/"},
 "bls": {"name": "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook: Chefs and Head Cooks (page modified August 27, 2026)", "url": "https://www.bls.gov/ooh/food-preparation-and-serving/chefs-and-head-cooks.htm"},
 "michelin": {"name": "MICHELIN Guide, \"The MICHELIN Guide 101\" (September 15, 2025)", "url": "https://guide.michelin.com/en/article/features/the-michelin-guide-101"},
 "explo": {"name": "Exploratorium, The Accidental Scientist: Science of Cooking, Sugar Stages", "url": "https://annex.exploratorium.edu/cooking/candy/sugar-stages.html"},
 "nist": {"name": "National Institute of Standards and Technology, Metric Kitchen: cooking measurement equivalencies", "url": "https://www.nist.gov/pml/owm/metric-kitchen-cooking-measurement-equivalencies"},
 "g_maillard": {"name": "Grokipedia, Maillard reaction; Caramelization", "url": "https://grokipedia.com/page/Maillard_reaction"},
 "g_mise": {"name": "Grokipedia, Mise en place", "url": "https://grokipedia.com/page/Mise_en_place"},
 "g_knife": {"name": "Grokipedia, Kitchen knife; Knife sharpening", "url": "https://grokipedia.com/page/Knife_sharpening"},
 "g_cuts": {"name": "Grokipedia, Julienning; Brunoise; Chiffonade", "url": "https://grokipedia.com/page/Julienning"},
 "g_sauces": {"name": "Grokipedia, French mother sauces", "url": "https://grokipedia.com/page/French_mother_sauces"},
 "g_stock": {"name": "Grokipedia, Stock (food); Roux", "url": "https://grokipedia.com/page/Stock_(food)"},
 "g_emulsion": {"name": "Grokipedia, Emulsion; Hollandaise sauce; Beurre blanc", "url": "https://grokipedia.com/page/Emulsion"},
 "g_sousvide": {"name": "Grokipedia, Sous vide", "url": "https://grokipedia.com/page/Sous_vide"},
 "g_braise": {"name": "Grokipedia, Braising; Poaching (cooking); Sautéing; Deep frying", "url": "https://grokipedia.com/page/Braising"},
 "g_primal": {"name": "Grokipedia, Primal cut", "url": "https://grokipedia.com/page/Primal_cut"},
 "g_carry": {"name": "Grokipedia, Carryover cooking", "url": "https://grokipedia.com/page/Carryover_cooking"},
 "g_omelette": {"name": "Grokipedia, Omelette", "url": "https://grokipedia.com/page/Omelette"},
 "g_brine": {"name": "Grokipedia, Brining", "url": "https://grokipedia.com/page/Brining"},
 "g_risotto": {"name": "Grokipedia, Risotto; Pasta", "url": "https://grokipedia.com/page/Risotto"},
 "g_bakers": {"name": "Grokipedia, Baker percentage", "url": "https://grokipedia.com/page/Baker_percentage"},
 "g_laminated": {"name": "Grokipedia, Laminated dough; Choux pastry; Shortcrust pastry", "url": "https://grokipedia.com/page/Laminated_dough"},
 "g_anglaise": {"name": "Grokipedia, Crème anglaise", "url": "https://grokipedia.com/page/Crème_anglaise"},
 "g_garde": {"name": "Grokipedia, Garde manger", "url": "https://grokipedia.com/page/Garde_manger"},
 "g_pickling": {"name": "Grokipedia, Pickling", "url": "https://grokipedia.com/page/Pickling"},
 "g_confit": {"name": "Grokipedia, Confit; Terrine (food)", "url": "https://grokipedia.com/page/Confit"},
 "g_charc": {"name": "Grokipedia, Charcuterie; Curing (food preservation)", "url": "https://grokipedia.com/page/Charcuterie"},
 "g_plating": {"name": "Grokipedia, Food presentation", "url": "https://grokipedia.com/page/Food_presentation"},
 "g_table": {"name": "Grokipedia, Table setting", "url": "https://grokipedia.com/page/Table_setting"},
 "g_russe": {"name": "Grokipedia, Service à la russe", "url": "https://grokipedia.com/page/Service_à_la_russe"},
 "g_tasting": {"name": "Grokipedia, Tasting menu", "url": "https://grokipedia.com/page/Tasting_menu"},
 "g_escoffier": {"name": "Grokipedia, Auguste Escoffier", "url": "https://grokipedia.com/page/Auguste_Escoffier"},
 "w_brigade": {"name": "Wikipedia, Brigade de cuisine", "url": "https://en.wikipedia.org/wiki/Brigade_de_cuisine"},
 "w_haccp": {"name": "Wikipedia, Hazard analysis and critical control points", "url": "https://en.wikipedia.org/wiki/Hazard_analysis_and_critical_control_points"},
 "g_michelin": {"name": "Grokipedia, Michelin Guide", "url": "https://grokipedia.com/page/Michelin_Guide"},
 "g_dz": {"name": "Grokipedia, Danger zone (food safety)", "url": "https://grokipedia.com/page/Danger_zone_(food_safety)"},
 "g_combi": {"name": "Grokipedia, Combi steamer; Chinois; Mandoline", "url": "https://grokipedia.com/page/Combi_steamer"},
 "nchfp": {"name": "National Center for Home Food Preservation (University of Georgia), tested recipes and guidance", "url": "https://nchfp.uga.edu/"},
}
def LES(blocks, *src): return {"blocks": list(blocks), "sources": [SRC[s] for s in src]}
HELP = dict(P=P, K=K, W=W, M=M, N=N, H=H, EX=EX, V=V, LI=LI, TB=TB, TRY=TRY, DRILL=DRILL, SAFE=SAFE, MP=MP, SCI=SCI, Q=Q, GK=GK, SRC=SRC, LES=LES)

def build():
    out_t = os.path.join(ROOT, 'data', 'culinary', 'topics'); out_l = os.path.join(ROOT, 'data', 'culinary', 'lessons')
    out_g = os.path.join(ROOT, 'static', 'culinary', 'gen')
    for d in (out_t, out_l, out_g): os.makedirs(d, exist_ok=True)
    pre = open(os.path.join(GENDIR, '_prelude.js')).read()
    for key, c in COURSES.items():
        units = [{"key": k, "title": t, "blurb": b} for k, t, b in c["units"]]
        topics = []
        for t in c["topics"]:
            d = {"id": key + "." + t["slug"]}; d.update(t); topics.append(d)
        with open(os.path.join(out_t, key + '.json'), 'w') as f:
            json.dump({"course": key, "units": units, "topics": topics}, f, ensure_ascii=False, indent=1); f.write('\n')
        src = os.path.join(SRCDIR, key + '.py')
        nl = 0
        if os.path.exists(src):
            spec = importlib.util.spec_from_file_location('cu_' + key, src); m = importlib.util.module_from_spec(spec); m.__dict__.update(HELP); spec.loader.exec_module(m)
            les = {}
            for t in c["topics"]:
                if t["slug"] in m.LESSONS: les[key + "." + t["slug"]] = m.LESSONS[t["slug"]]
            extra = set(m.LESSONS) - {t["slug"] for t in c["topics"]}
            if extra: print('WARNING', key, 'lessons for unknown topics:', sorted(extra))
            with open(os.path.join(out_l, key + '.json'), 'w') as f:
                json.dump(les, f, ensure_ascii=False, indent=1); f.write('\n')
            nl = len(les)
        g = os.path.join(GENDIR, key + '.js')
        if os.path.exists(g):
            body = open(g).read()
            head = '/* Culinary Ladder: generators for %s (course key %s). Built by scripts/culinary/build.py from\n   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/%s.js: edit those, not this file. */\n' % (key, key, key)
            with open(os.path.join(out_g, key + '.js'), 'w') as f:
                f.write(head + pre.replace('/*BODY*/', body))
        print(key, len(topics), 'topics,', nl, 'lessons,', 'gen' if os.path.exists(g) else 'no gen')

if __name__ == '__main__':
    build()
