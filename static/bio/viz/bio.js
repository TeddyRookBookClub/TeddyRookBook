/* Biology Ladder: the shared visual kit (names prefixed bi-) and a model (MathLadder.bio), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ bio/viz/bio.css). Biology topic pages always load this file, and
   practice pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.bio.
   The model also runs in node: global.window = global; require('…/static/bio/viz/bio.js').
   Vanilla JS, no libraries, no network; every drawing is original SVG or canvas made here. Source parts: /tmp/work_bio/src/*.js
   (build: /tmp/work_bio/build.sh). Conventions and content rules for course builders: /tmp/work_bio/overview.md.

   Embed:  <div class="ml-viz" data-viz="bi-cell" data-opts='{"type":"plant","mode":"show"}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: labels that name the answer,
                  verdicts, readouts, Check buttons, controls. What the problem asks about stays visible. The aria-label never names
                  the answer in quiet mode. Use quiet: true (and usually interactive: false) in a problem's p.viz.opts.
     interactive: false   a still picture.   task: a line above the visual.   caption: HTML under it.   label: aria-label.
     big: true    large, read-aloud text (Life Science for Young Learners).   readme: a note for the grown-up ("Read to me").
     speak: true  a Read aloud button (the browser's own voice, when it has one; bi-picture and bi-classify).
     ask: …       marks the one thing a problem asks about with "?" (a part key, a stage index, a node, a box …; see each visual).
     numbers: true  numbers the labeled things 1, 2, 3 … instead of naming them (for "What is part 3?" problems).

   THE VISUALS AND THEIR OPTIONS
   bi-picture    things in tiles. items: ['frog', 'rock'] or [{ icon, label, note }] (icon = a key of MathLadder.bio.THINGS; see
                 B.ICON_KEYS); labels (default: shown unless quiet); size 'big' | 'medium' | 'small'; numbers; letters (quiet with
                 several items letters them A, B, C …); ask: index. choose: { ok: [indexes], prompt, why, hint }: learners tap the
                 right tiles, then Check.
   bi-classify   sort cards into groups. bins: ['Living', 'Not living']; cards: ['frog', …] (THINGS keys) or [{ icon?, text?, bin
                 (index, or [indexes] when several are right), why }]; shuffle (default true); reveal (a Show me button); solved;
                 columns; prompt; done (message when all right). Tap a card, then a group; keyboard: focus a card and press the
                 group's number (0 puts it back). quiet: the cards as a lettered list and the groups numbered, no game.
   bi-habitat    a habitat scene. place: forest | grassland | desert | polar | ocean | pond | rainforest | tundra | taiga |
                 deciduous | farm | home; things: [THINGS keys] (fliers go in the sky, swimmers in the water); labels; ask:
                 index; title: false. choices: [keys] with ok: [keys] (default: those whose THINGS habitat lists this place):
                 learners pick which live here, then Check.
   bi-key        a dichotomous key. steps: [{ a: 'has six legs', an: 2 (go to step 2) | 'ant' (a THINGS key or a name), b, bn }];
                 specimens: [THINGS keys] (lettered tiles; tap one, then walk it through the key); names: true shows specimen names.
                 quiet: the key as a numbered table and the lettered specimens.
   bi-plant      mode 'parts' (default: flower, leaves, stem, roots with labels; fruit: true adds a pod with seeds; parts: [...];
                 find: part (learners tap it); ask: part) | 'photo' (light, CO₂ in, water up, O₂ out, sugar: show: [keys of
                 light co2 water o2 sugar]; ask: key; quiet letters the arrows A–E) | 'transport' (xylem up, phloem down,
                 animated) | 'tropism' (light: 'left' | 'top' | 'right'; gravity: true for a pot on its side) | 'flower' (petal,
                 sepal, stamen, pistil, pollen, seedbase (where seeds form); bee: true) | 'seasons' (season: spring | summer | fall | winter;
                 evergreen: true) | 'stomata' (water: 0–1, guard cells open and close).
   bi-lifecycle  cycle: 'plant' | 'butterfly' | 'frog' | 'chicken' | 'tree' (seasons); stages from MathLadder.bio.CYCLES.
                 mode 'show' (a circle with arrows) | 'step' (Back/Next with notes: [...]) | 'order' (a row in a shuffled
                 order: tap two to swap, Check). order: [stage indexes] shows that order (quiet: lettered A, B, C …); ask:
                 index (that stage becomes "?"); numbers; labels.
   bi-foodweb    web: 'meadow' | 'pond' | 'ocean' | 'forest' | 'desert' (MathLadder.bio.WEBS) or { nodes, links: [[food,
                 eater]], decomposers }; chain: [keys] draws one food chain left to right; sun: true; roles: true colors by
                 role with a legend; mode 'show' | 'trace' (tap a node: its food and its eaters) | 'remove' (tap a node to
                 remove it: ▲ ▼ show the first effects, from B.removeEffect); ask: key; highlight: [keys]; numbers;
                 decomposers: false. Arrows always point from the food to the eater.
   bi-pyramid    levels: [THINGS keys or { icon, name }] from producers up; base (energy at level 1, default 10000);
                 unit ('kcal'); eff (0.1); values: [...] (overrides the computed ones); known: [indexes] (which values to
                 print; quiet default [0]); ask: index; show: 'energy' | 'biomass' | 'numbers'. A slider sets the share passed up.
   bi-cycle      cycle: 'carbon' | 'nitrogen' | 'water' | 'phosphorus' (MathLadder.bio.MATTER: stores and steps [process,
                 from, to]); quiet numbers the arrows (step index + 1); ask: step index or process name ("?"); askStore:
                 store key; only: [process names or indexes]; atoms: true animates dots along the arrows.
   bi-population model 'exp' | 'logistic' | 'compare' | 'predprey' | 'doubling'; r, K, N0, T (time span); gens (doubling);
                 half: true marks K/2; markK; points: [[t, N]] data points; values: true (doubling bars show counts in quiet).
   bi-chart      kind 'bar' | 'line' | 'scatter'; x: categories (or numbers for line and scatter); series: [{ name, values,
                 err (± error bar half-lengths), color (0–5) }]; xlabel, ylabel, title, ymin, ymax, ystep, xstep; values:
                 true prints values; note (a line under, not in quiet).
   bi-cell       type 'animal' | 'plant' | 'bacterium'; mode 'show' (labels with leader lines) | 'explore' (no labels; tap
                 parts); find: part (learners tap it); parts: [...] (which to label); highlight: part or [parts]; ask: part;
                 numbers; compare: true adds a cell-type switch. Part keys: MathLadder.bio.ORGANELLES, per type CELL_PARTS.
   bi-microscope mode 'parts' (eyepiece, nosepiece, objective, stage, clips, diaphragm, light, base, arm, coarse, fine; ask,
                 numbers, parts) | 'view' (eyepiece 10, objective 4 | 10 | 40, fov40: field of view in mm at 40× total
                 (default 4.5), cellLength and cellWidth in mm, ruler: false; quiet hides the readout and ruler).
   bi-membrane   mode 'diffusion' | 'osmosis' | 'facilitated' | 'active' (animated particles; left, right: counts; settled:
                 true starts near the end) | 'tonicity' (solution 'hypo' | 'iso' | 'hyper'; cell 'animal' | 'plant') |
                 'bilayer' (the fluid mosaic membrane).
   bi-enzyme     mode 'fit' (lock and key: Bind, React, Release; inhibitor 'comp' | 'non'; denatured: true) | 'temp' (activity
                 against temperature; opt) | 'ph' (enzymes: ['pepsin', 'amylase', 'trypsin', 'lipase']) | 'substrate' (rate
                 against [S], with competitive and noncompetitive inhibitor sliders) | 'energy' (activation energy with and
                 without an enzyme; endergonic: true). at: x draws a dashed marker line.
   bi-molecule   mode 'water' (polarity, δ+ and δ−, hydrogen bonds) | 'polymer' (n monomers; joined: true; buttons for
                 dehydration synthesis and hydrolysis) | 'macro' (the four kinds; quiet letters them A–D) | 'protein'
                 (level 1–4) | 'phospholipid'.
   bi-punnett    p1 (rows), p2 (columns): genotypes like 'Aa', 'AaBb', 'XAXa' × 'XaY', 'IAi' × 'IBi'; dominance
                 'complete' | 'incomplete' | 'co'; traits: { T: 'tall', t: 'short', het: 'pink' } (names for the summary);
                 phenoNames: { 'dom/rec': '…' } overrides; mode 'show' | 'fill' (tap each box to choose; Check) | 'empty';
                 empty: true (gametes only); ask: [row, col]; colors: true colors boxes by phenotype even when quiet.
                 Do not use the letter i for an ordinary gene (it is the ABO allele).
   bi-pedigree   people: [{ id, sex: 'm' | 'f', aff: true, carrier: true, gen: 1 | 2 | 3, parents: [id, id], label, g, x (0–1) }]
                 listed in order within each generation (put partners side by side); genotypes: true prints g; carriers:
                 false hides carrier dots; hideCarriers (quiet); ask: id; key: false hides the legend.
   bi-dna        seq: one strand (5′→3′); mode 'pair' (both strands; quiet shows the partner strand as "?"; ask: index or
                 'all') | 'fill' (learners build the partner strand; Check) | 'replicate' (Start, Unzip, Build, Done) |
                 'helix' (an animated double helix) | 'nucleotide'; ends: false hides the 5′ and 3′ labels.
   bi-central    template (DNA template strand, read 3′→5′ left to right) or coding (5′→3′) or mrna; mode 'transcribe' |
                 'translate' | 'both' (step through codon by codon) | 'table' (the codon table; highlight: ['AUG']) |
                 'mutation' (mutant: the changed mRNA; table: true adds the table); fromStart: false reads from base 1
                 instead of the first AUG; steps: false shows everything at once; ask: 'mrna' | 'protein' | codon index;
                 table: true adds the codon table under any mode.
   bi-mitosis    the stages of MathLadder.bio.MITOSIS with Back/Next/Play; pairs: 1–3 (2n = 2–6); stage: key (one still stage,
                 no controls); quiet hides the stage name and counts (for "Which stage is this?").
   bi-meiosis    the stages of MathLadder.bio.MEIOSIS; pairs: 1–3; cross: false (no crossing over); flip: [true, false]
                 (which way each pair lines up in metaphase I); stage: key; a Flip a pair button shows independent assortment.
   bi-tree       tree: 'vertebrates' | 'plants' | 'primates' | 'animals' (MathLadder.bio.TREES) or nested arrays of names
                 (['lamprey', ['shark', ['frog', ['lizard', 'mouse']]]]); marks: [{ clade: [names], text }] (presets carry
                 their traits); traits: false hides marks; mode 'show' | 'mrca' (tap two tips: their most recent common
                 ancestor lights up) | 'rotate' (tap a node to swap its branches); ask: tip name.
   bi-selection  a population of beetles on dark soil or light sand; birds catch the ones they see. background 'dark' |
                 'light'; n (40); start (0 light … 1 dark; average starting color); gen (run this many generations first);
                 mode 'sim' (Next generation, Run 10) | 'hunt' (the learner is the bird); seed.
   bi-body       system: skeletal | muscular | digestive | circulatory | respiratory | nervous | excretory | immune |
                 endocrine (MathLadder.bio.SYSTEMS; there is no reproductive system); mode 'show' | 'path' (step through the
                 digestive or respiratory path) | 'heart' (the four chambers and the path of blood; ask: chamber name); find:
                 organ; parts; highlight; ask: organ; numbers; systems: [keys] or false (the system switch).
   bi-gel        lanes: [{ name, bands: [bp, …] }]; ladder: false; ladderBands; mode 'run' (bands travel from the wells);
                 labelBands: true; hideNames (quiet: lanes lettered); sizes: false hides the ladder sizes.
   bi-energy     mode 'photo' | 'resp' (inputs and outputs; ask: a molecule name from B.PHOTO / B.RESP) | 'both' (the cycle;
                 ask: 'top' | 'bottom' | 'light' | 'atp') | 'resp-stages' (glycolysis to the electron transport chain; ask:
                 stage key) | 'photo-stages' (ask: 'light' | 'calvin') | 'atp'.
   bi-feedback   loop: 'temperature' | 'glucose' | 'water' (negative) | 'clotting' | 'ripening' (positive) (MathLadder.bio.LOOPS);
                 side: 'high' | 'low'; ask: box index (0 change, 1 sensor, 2 control center, 3 effector, 4 response; positive:
                 0 start, 1… steps); mode 'chain' with steps: ['…'] draws any pathway as numbered boxes (signal transduction,
                 the endomembrane path, a reflex arc); title; note.

   THE MODEL: MathLadder.bio (pure data and functions; no DOM; works in node). Generators should take facts from here so the
   pictures and the answers always agree.
     THINGS {key: { name, kind, life, group, backbone, cover, diet, moves, legs, habitat, home, winter, young, part, seeds,
       pollinator, decomposer, fit, trick, tri }}; thing(k); where(test); GROUPS; GROUP_CLUES; SENSES; ICON_KEYS (keys the kit draws)
     PLANT_PARTS, FLOWER_PARTS, PLANT_NEEDS, SEED_TRAVEL, TROPISMS, PLANT_GROUPS; CYCLES, cycle(k), stageKeys(k), METAMORPHOSIS
     HABITATS, BIOMES (rain cm, temp °C ranges), biomeFor(rain, temp); WEBS, eats(web, k), eatenBy(web, k), isProducer, level(web,
       k), role(web, k), chains(web), removeEffect(web, k); pyramid(base, n, eff), LEVEL_NAMES; MATTER (cycles: stores, steps)
     ORGANELLES {key: { name, job, where ('a' animal 'p' plant 'b' bacterium 'f' fungus) }}, CELL_PARTS, inCell(part, type),
       LEVELS_ORG, LEVELS_ECO, mag(eye, obj), fov(fov0, mag0, mag1), MICROSCOPE_PARTS, cube(s) -> { sa, v, ratio }
     RANKS, TAXA (well-known classifications), sciName(k), sharedRank(a, b), DOMAINS, KINGDOMS
     SYSTEMS (no reproductive system), DIGEST_PATH, BLOOD_PATH, AIR_PATH
     genetics: tokens(g), genes(g), canon(g), gametes(g), uniqueGametes(g), pheno(g, mode), fuse(g1, g2), cross(p1, p2, mode) ->
       { side, top, grid, genotypes, phenotypes, total }, ratio(counts), gcd, isXLinked, BLOOD
     DNA: complement, revcomp, transcribe(template), codingToMRNA, CODE (64 codons -> one-letter amino acid, '*' stop), AA
       (one letter -> [three, name]), codon(c), three(a), codonsFor(a), translate(mrna, { start, keepStop }), codons(mrna, from),
       mutationType(m0, m1) -> 'silent' | 'missense' | 'nonsense' | 'frameshift', chargaff(pctA), pcr(start, cycles)
     division: MITOSIS, MEIOSIS (stage keys, names, what happens), counts(2n, stage) -> { chromosomes, chromatids },
       assortments(n) = 2ⁿ
     populations: expN, logisticN, dNdtExp, dNdtLog, doubling, density, quadrat(counts, quadArea, totalArea), hw({ q2 | q | p |
       p2 }) -> { p, q, p2, q2, pq2 }, alleleFreq(nAA, nAa, naa), simpson(counts), chi2(obs, exp), CHI_CRIT (p = 0.05 by df),
       recombFreq, psiS(i, C, T) (bars), se(sd, n), mean, sd
     energy: MACRO, PHOTO, RESP, RESP_STAGES, PHOTO_STAGES, FERMENT, activity(x, opt, width, kind), ENZYMES, michaelis(S, Vmax,
       Km, { competitive, noncompetitive }), LOOPS
     gels and trees: gelPos(bp), gelSize(pos), LADDER, digest(L, cuts), tips(tree), mrca(tree, names), closer(tree, a, b, c),
       TREES
     SKIN, SKIN_LINE: the site's one cartoon skin color for drawn people and hands (#ffcc4d, #e8a93a).                       */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.bio (pure data and functions; no DOM; works in node)
     ===================================================================================================================== */
  var B = ML.bio = ML.bio || {};

  /* ---------- THINGS: every picture the kit can draw (bi-picture, bi-classify, bi-habitat, bi-foodweb, bi-pyramid) ----------
     name; kind 'animal' | 'plant' | 'fungus' | 'protist' (algae: producer: true) | 'object' | 'body'; life 'living' | 'once' | 'never';
     animals: group ('mammal' 'bird' 'fish' 'reptile' 'amphibian' 'insect' 'arachnid' 'worm' 'mollusk' 'crustacean' 'cnidarian'
     'echinoderm'), backbone, cover ('fur' 'feathers' 'scales' 'moist skin' 'shell' 'exoskeleton' 'soft body'), diet ('herbivore'
     'carnivore' 'omnivore' 'decomposer' 'filter'; left out where it depends on the kind; dietNote says more), moves [...], legs, habitat [...], home, winter ('migrate' 'hibernate' 'active'),
     young ('looks like parent' | 'changes'); plants: part (the part we eat: 'root' 'stem' 'leaf' 'flower' 'fruit' 'seed'), seeds
     (how its seeds travel: 'wind' 'water' 'animal-fur' 'animal-eat' 'pop'); tri: false = leave out of living/once/never sorts
     (made things whose material is arguable).                                                                                */
  function A(name, group, o) { return Object.assign({ name: name, kind: 'animal', life: 'living', group: group, backbone: ['mammal', 'bird', 'fish', 'reptile', 'amphibian'].indexOf(group) >= 0 }, o); }
  function PLT(name, o) { return Object.assign({ name: name, kind: 'plant', life: 'living' }, o); }
  function OBJ(name, life, o) { return Object.assign({ name: name, kind: 'object', life: life }, o || {}); }
  var THINGS = {
    dog: A('dog', 'mammal', { cover: 'fur', diet: 'omnivore', moves: ['walk', 'run', 'swim'], legs: 4, habitat: ['home'], home: 'house', young: 'looks like parent', pet: true, sense: 'smell' }),
    cat: A('cat', 'mammal', { cover: 'fur', diet: 'carnivore', moves: ['walk', 'run', 'climb'], legs: 4, habitat: ['home'], home: 'house', young: 'looks like parent', pet: true, sense: 'whiskers' }),
    cow: A('cow', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['walk'], legs: 4, habitat: ['farm', 'grassland'], young: 'looks like parent' }),
    rabbit: A('rabbit', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['hop'], legs: 4, habitat: ['grassland', 'forest'], home: 'burrow', winter: 'active', young: 'looks like parent', pet: true }),
    fox: A('fox', 'mammal', { cover: 'fur', diet: 'omnivore', moves: ['walk', 'run'], legs: 4, habitat: ['forest', 'grassland'], home: 'den', winter: 'active', young: 'looks like parent' }),
    deer: A('deer', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['walk', 'run'], legs: 4, habitat: ['forest'], winter: 'active', young: 'looks like parent' }),
    bear: A('bear', 'mammal', { cover: 'fur', diet: 'omnivore', moves: ['walk', 'swim', 'climb'], legs: 4, habitat: ['forest'], home: 'den', young: 'looks like parent' }),
    wolf: A('wolf', 'mammal', { cover: 'fur', diet: 'carnivore', moves: ['walk', 'run'], legs: 4, habitat: ['forest', 'grassland'], home: 'den', winter: 'active', young: 'looks like parent' }),
    mouse: A('mouse', 'mammal', { cover: 'fur', diet: 'omnivore', moves: ['walk', 'run', 'climb'], legs: 4, habitat: ['grassland', 'forest', 'desert'], home: 'burrow', winter: 'active', young: 'looks like parent' }),
    squirrel: A('squirrel', 'mammal', { cover: 'fur', diet: 'omnivore', dietNote: 'mostly nuts and seeds, and some insects and eggs', moves: ['climb', 'run'], legs: 4, habitat: ['forest'], home: 'nest', winter: 'active', young: 'looks like parent', stores: true }),
    groundhog: A('groundhog', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['walk'], legs: 4, habitat: ['grassland', 'forest'], home: 'burrow', winter: 'hibernate', young: 'looks like parent' }),
    bat: A('bat', 'mammal', { cover: 'fur', dietNote: 'depends on the kind: most bats eat insects; fruit bats eat fruit and nectar', moves: ['fly'], legs: 2, habitat: ['forest'], home: 'cave', winter: 'hibernate', young: 'looks like parent', sense: 'hearing', trick: 'flies but is a mammal' }),
    whale: A('whale', 'mammal', { cover: 'skin and a little hair', diet: 'carnivore', moves: ['swim'], legs: 0, habitat: ['ocean'], winter: 'migrate', young: 'looks like parent', trick: 'lives in water but is a mammal' }),
    dolphin: A('dolphin', 'mammal', { cover: 'skin and a little hair', diet: 'carnivore', moves: ['swim'], legs: 0, habitat: ['ocean'], young: 'looks like parent', trick: 'lives in water but is a mammal' }),
    seal: A('seal', 'mammal', { cover: 'fur', diet: 'carnivore', moves: ['swim', 'crawl'], legs: 0, habitat: ['ocean', 'polar'], young: 'looks like parent' }),
    'polar-bear': A('polar bear', 'mammal', { cover: 'fur', diet: 'carnivore', moves: ['walk', 'swim'], legs: 4, habitat: ['polar'], home: 'den', young: 'looks like parent', fit: 'thick fur and fat keep it warm' }),
    camel: A('camel', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['walk'], legs: 4, habitat: ['desert'], young: 'looks like parent', fit: 'wide feet for sand; it can go a long time without water' }),
    beaver: A('beaver', 'mammal', { cover: 'fur', diet: 'herbivore', moves: ['swim', 'walk'], legs: 4, habitat: ['pond'], home: 'lodge', winter: 'active', young: 'looks like parent' }),
    owl: A('owl', 'bird', { cover: 'feathers', diet: 'carnivore', moves: ['fly'], legs: 2, habitat: ['forest'], home: 'nest', winter: 'active', young: 'looks like parent', sense: 'sight' }),
    robin: A('robin', 'bird', { cover: 'feathers', diet: 'omnivore', moves: ['fly', 'hop'], legs: 2, habitat: ['forest', 'home'], home: 'nest', winter: 'migrate', young: 'looks like parent' }),
    penguin: A('penguin', 'bird', { cover: 'feathers', diet: 'carnivore', moves: ['swim', 'walk'], legs: 2, habitat: ['polar', 'ocean'], young: 'looks like parent', trick: 'a bird that cannot fly' }),
    duck: A('duck', 'bird', { cover: 'feathers', diet: 'omnivore', moves: ['fly', 'swim', 'walk'], legs: 2, habitat: ['pond'], home: 'nest', winter: 'migrate', young: 'looks like parent', fit: 'webbed feet for paddling' }),
    goose: A('goose', 'bird', { cover: 'feathers', diet: 'herbivore', moves: ['fly', 'swim', 'walk'], legs: 2, habitat: ['pond', 'grassland'], home: 'nest', winter: 'migrate', young: 'looks like parent' }),
    hawk: A('hawk', 'bird', { cover: 'feathers', diet: 'carnivore', moves: ['fly'], legs: 2, habitat: ['grassland', 'forest', 'desert'], home: 'nest', winter: 'active', young: 'looks like parent', fit: 'a hooked beak and sharp claws (talons)', sense: 'sight' }),
    heron: A('heron', 'bird', { cover: 'feathers', diet: 'carnivore', moves: ['fly', 'walk'], legs: 2, habitat: ['pond'], home: 'nest', winter: 'migrate', young: 'looks like parent', fit: 'long legs for wading and a spear-like beak' }),
    hummingbird: A('hummingbird', 'bird', { cover: 'feathers', diet: 'omnivore', dietNote: 'nectar, and small insects and spiders', moves: ['fly'], legs: 2, habitat: ['forest', 'home'], home: 'nest', winter: 'migrate', young: 'looks like parent', fit: 'a long, thin beak for sipping nectar', pollinator: true }),
    hen: A('chicken', 'bird', { cover: 'feathers', diet: 'omnivore', moves: ['walk'], legs: 2, habitat: ['farm'], home: 'nest', young: 'looks like parent' }),
    fish: A('fish', 'fish', { cover: 'scales', diet: 'omnivore', moves: ['swim'], legs: 0, habitat: ['pond', 'ocean'], young: 'looks like parent', fit: 'gills and fins' }),
    shark: A('shark', 'fish', { cover: 'scales', diet: 'carnivore', moves: ['swim'], legs: 0, habitat: ['ocean'], young: 'looks like parent' }),
    frog: A('frog', 'amphibian', { cover: 'moist skin', diet: 'carnivore', moves: ['hop', 'swim'], legs: 4, habitat: ['pond'], winter: 'hibernate', young: 'changes' }),
    salamander: A('salamander', 'amphibian', { cover: 'moist skin', diet: 'carnivore', moves: ['walk', 'swim'], legs: 4, habitat: ['pond', 'forest'], young: 'changes', trick: 'looks like a lizard but has moist skin' }),
    tadpole: A('tadpole', 'amphibian', { cover: 'moist skin', diet: 'herbivore', moves: ['swim'], legs: 0, habitat: ['pond'], stage: true, trick: 'a young frog, not a fish' }),
    snake: A('snake', 'reptile', { cover: 'scales', diet: 'carnivore', moves: ['slither', 'swim'], legs: 0, habitat: ['grassland', 'desert', 'forest'], home: 'burrow', winter: 'hibernate', young: 'looks like parent', trick: 'dry scales, not slimy' }),
    turtle: A('turtle', 'reptile', { cover: 'scales', diet: 'omnivore', moves: ['walk', 'swim'], legs: 4, habitat: ['pond', 'ocean'], winter: 'hibernate', young: 'looks like parent', trick: 'a reptile even when it lives in water' }),
    lizard: A('lizard', 'reptile', { cover: 'scales', diet: 'carnivore', moves: ['walk', 'run', 'climb'], legs: 4, habitat: ['desert', 'forest'], young: 'looks like parent' }),
    crocodile: A('crocodile', 'reptile', { cover: 'scales', diet: 'carnivore', moves: ['walk', 'swim'], legs: 4, habitat: ['pond'], young: 'looks like parent' }),
    butterfly: A('butterfly', 'insect', { cover: 'exoskeleton', diet: 'herbivore', moves: ['fly'], legs: 6, habitat: ['grassland', 'forest', 'home'], winter: 'migrate', young: 'changes', pollinator: true }),
    caterpillar: A('caterpillar', 'insect', { cover: 'exoskeleton', diet: 'herbivore', moves: ['crawl'], legs: 6, habitat: ['forest', 'grassland'], stage: true, trick: 'a young butterfly' }),
    bee: A('bee', 'insect', { cover: 'exoskeleton', diet: 'herbivore', moves: ['fly'], legs: 6, habitat: ['grassland', 'home'], home: 'hive', winter: 'active', young: 'changes', pollinator: true }),
    ant: A('ant', 'insect', { cover: 'exoskeleton', diet: 'omnivore', moves: ['crawl'], legs: 6, habitat: ['grassland', 'forest', 'desert'], home: 'anthill', young: 'changes' }),
    ladybug: A('ladybug', 'insect', { cover: 'exoskeleton', diet: 'carnivore', moves: ['crawl', 'fly'], legs: 6, habitat: ['grassland', 'home'], young: 'changes' }),
    dragonfly: A('dragonfly', 'insect', { cover: 'exoskeleton', diet: 'carnivore', moves: ['fly'], legs: 6, habitat: ['pond'], young: 'changes', fit: 'big eyes and fast wings for catching insects in the air' }),
    grasshopper: A('grasshopper', 'insect', { cover: 'exoskeleton', diet: 'herbivore', moves: ['hop', 'fly'], legs: 6, habitat: ['grassland'], young: 'looks like parent' }),
    spider: A('spider', 'arachnid', { cover: 'exoskeleton', diet: 'carnivore', moves: ['crawl'], legs: 8, habitat: ['home', 'forest', 'grassland'], home: 'web', young: 'looks like parent', trick: 'eight legs, so not an insect' }),
    worm: A('earthworm', 'worm', { cover: 'soft body', diet: 'decomposer', moves: ['crawl'], legs: 0, habitat: ['forest', 'grassland', 'home'], home: 'burrow', young: 'looks like parent', decomposer: true }),
    snail: A('snail', 'mollusk', { cover: 'shell', diet: 'herbivore', moves: ['crawl'], legs: 0, habitat: ['pond', 'forest'], young: 'looks like parent' }),
    crab: A('crab', 'crustacean', { cover: 'exoskeleton', diet: 'omnivore', moves: ['walk', 'swim'], legs: 10, habitat: ['ocean'], young: 'changes' }),
    krill: A('krill', 'crustacean', { cover: 'exoskeleton', diet: 'filter', moves: ['swim'], legs: 10, habitat: ['ocean'], young: 'changes' }),
    jellyfish: A('jellyfish', 'cnidarian', { cover: 'soft body', diet: 'carnivore', moves: ['swim'], legs: 0, habitat: ['ocean'], trick: 'not a fish' }),
    starfish: A('sea star', 'echinoderm', { cover: 'spiny skin', diet: 'carnivore', moves: ['crawl'], legs: 0, habitat: ['ocean'], trick: 'not a fish' }),
    // plants and fungi
    tree: PLT('oak tree', { habitat: ['forest'], seeds: 'animal-eat', leaves: 'deciduous' }),
    pine: PLT('pine tree', { habitat: ['forest', 'taiga'], seeds: 'wind', leaves: 'evergreen' }),
    maple: PLT('maple seed', { habitat: ['forest'], seeds: 'wind' }),
    flower: PLT('flower', { habitat: ['grassland', 'home'] }),
    sunflower: PLT('sunflower', { habitat: ['grassland', 'farm'], part: 'seed' }),
    grass: PLT('grass', { habitat: ['grassland'] }),
    cactus: PLT('cactus', { habitat: ['desert'], fit: 'stores water in a thick stem; spines instead of leaves' }),
    fern: PLT('fern', { habitat: ['forest'] }),
    algae: { name: 'algae', kind: 'protist', life: 'living', producer: true, habitat: ['pond', 'ocean'], trick: 'makes food from sunlight like a plant, but algae are protists, not plants' },
    dandelion: PLT('dandelion', { habitat: ['grassland', 'home'], seeds: 'wind' }),
    burr: PLT('burr', { habitat: ['grassland'], seeds: 'animal-fur' }),
    coconut: PLT('coconut', { habitat: ['ocean'], seeds: 'water', part: 'fruit' }),
    peapod: PLT('pea pod', { habitat: ['farm'], seeds: 'pop', part: 'seed' }),
    seed: PLT('seed', { stage: true, trick: 'a seed is alive, resting until it sprouts' }),
    sprout: PLT('sprout', { stage: true }),
    carrot: PLT('carrot', { part: 'root', habitat: ['farm'] }),
    potato: PLT('potato', { part: 'stem', habitat: ['farm'], trick: 'a potato is an underground stem, not a root' }),
    celery: PLT('celery', { part: 'leaf', habitat: ['farm'], trick: 'the stalk we eat is a leaf stalk (petiole) that holds up the leaf, not a stem' }),
    lettuce: PLT('lettuce', { part: 'leaf', habitat: ['farm'] }),
    broccoli: PLT('broccoli', { part: 'flower', habitat: ['farm'] }),
    apple: PLT('apple', { part: 'fruit', habitat: ['farm'], seeds: 'animal-eat' }),
    tomato: PLT('tomato', { part: 'fruit', habitat: ['farm'], trick: 'a fruit, because it holds seeds' }),
    corn: PLT('corn', { part: 'seed', habitat: ['farm'] }),
    pumpkin: PLT('pumpkin', { part: 'fruit', habitat: ['farm'] }),
    mushroom: { name: 'mushroom', kind: 'fungus', life: 'living', habitat: ['forest'], decomposer: true, trick: 'a fungus, not a plant' },
    // once living
    log: OBJ('log', 'once'), leaf: OBJ('fallen leaf', 'once'), shell: OBJ('seashell', 'once'), feather: OBJ('feather', 'once'),
    core: OBJ('apple core', 'once'), chair: OBJ('wooden chair', 'once'), paper: OBJ('paper', 'once'), bone: OBJ('bone', 'once'),
    // never living
    rock: OBJ('rock', 'never'), cloud: OBJ('cloud', 'never', { moves: true }), sun: OBJ('sun', 'never'), fire: OBJ('fire', 'never', { moves: true, grows: true }),
    water: OBJ('water drop', 'never'), coin: OBJ('coin', 'never'), car: OBJ('toy car', 'never', { moves: true, tri: false }),
    robot: OBJ('toy robot', 'never', { moves: true, tri: false }), ball: OBJ('ball', 'never', { tri: false }), crystal: OBJ('crystal', 'never', { grows: true }),
    // body parts for the senses (drawn in the site's cartoon skin color)
    eye: { name: 'eye', kind: 'body', sense: 'sight' }, ear: { name: 'ear', kind: 'body', sense: 'hearing' }, nose: { name: 'nose', kind: 'body', sense: 'smell' },
    tongue: { name: 'tongue', kind: 'body', sense: 'taste' }, hand: { name: 'hand', kind: 'body', sense: 'touch' }
  };
  B.THINGS = THINGS;
  B.ICON_KEYS = Object.keys(THINGS); // the kit draws an icon for every key (checked in the browser test)
  B.thing = function (k) { return THINGS[k] || null; };
  B.where = function (test) { return Object.keys(THINGS).filter(function (k) { return test(THINGS[k], k); }); };
  B.GROUPS = { mammal: 'mammals', bird: 'birds', fish: 'fish', reptile: 'reptiles', amphibian: 'amphibians', insect: 'insects', arachnid: 'arachnids',
    worm: 'worms', mollusk: 'mollusks', crustacean: 'crustaceans', cnidarian: 'cnidarians', echinoderm: 'echinoderms' };
  B.GROUP_CLUES = {
    mammal: 'hair or fur; breathes air; feeds its babies milk', bird: 'feathers, a beak and two legs; hatches from a hard-shelled egg',
    fish: 'lives in water; breathes with gills; fins; most have scales', reptile: 'dry, scaly skin; breathes air with lungs; most hatch from eggs laid on land',
    amphibian: 'smooth, moist skin; young usually live in water with gills', insect: 'six legs and three body parts; many have wings',
    arachnid: 'eight legs and two body parts'
  };
  B.SENSES = { sight: ['eyes', 'eye'], hearing: ['ears', 'ear'], smell: ['nose', 'nose'], taste: ['tongue', 'tongue'], touch: ['skin', 'hand'] };

  /* ---------- plants ---------- */
  B.PLANT_PARTS = {
    roots: { name: 'roots', job: 'hold the plant in the ground and take in water and nutrients from the soil' },
    stem: { name: 'stem', job: 'holds the plant up and carries water up and food down' },
    leaves: { name: 'leaves', job: 'catch sunlight and make the plant\'s food' },
    flower: { name: 'flower', job: 'makes seeds' },
    fruit: { name: 'fruit', job: 'holds and protects the seeds' },
    seeds: { name: 'seeds', job: 'hold a tiny new plant and food for it' }
  };
  B.FLOWER_PARTS = { petal: 'petal', sepal: 'sepal', stamen: 'stamen (makes pollen)', pistil: 'pistil (where seeds form)', pollen: 'pollen' };
  B.PLANT_NEEDS = ['light', 'water', 'air', 'nutrients', 'space'];
  B.SEED_TRAVEL = { wind: 'blown by the wind', water: 'carried by water', 'animal-fur': 'stuck to an animal\'s fur', 'animal-eat': 'eaten in fruit and dropped by animals', pop: 'popped out of a pod' };
  B.TROPISMS = { phototropism: 'toward light', gravitropism: 'with gravity (roots down, shoots up)', thigmotropism: 'around what it touches' };
  B.PLANT_GROUPS = [
    { key: 'moss', name: 'mosses', tubes: false, seeds: false, flowers: false, spreads: 'spores' },
    { key: 'fern', name: 'ferns', tubes: true, seeds: false, flowers: false, spreads: 'spores' },
    { key: 'conifer', name: 'conifers', tubes: true, seeds: true, flowers: false, spreads: 'seeds in cones' },
    { key: 'flowering', name: 'flowering plants', tubes: true, seeds: true, flowers: true, spreads: 'seeds in fruits' }
  ];

  /* ---------- life cycles (stages in order; each stage: key, name, icon drawn by bi-lifecycle) ---------- */
  B.CYCLES = {
    plant: { name: 'a bean plant', stages: [['seed', 'seed'], ['sprout', 'sprout'], ['young', 'young plant'], ['adult', 'adult plant with flowers'], ['fruit', 'pod (fruit) with seeds']] },
    butterfly: { name: 'a butterfly', stages: [['egg', 'egg'], ['larva', 'caterpillar (larva)'], ['pupa', 'chrysalis (pupa)'], ['adult', 'butterfly (adult)']] },
    frog: { name: 'a frog', stages: [['eggs', 'eggs'], ['tadpole', 'tadpole'], ['legs', 'tadpole with legs'], ['froglet', 'froglet'], ['adult', 'frog (adult)']] },
    chicken: { name: 'a chicken', stages: [['egg', 'egg'], ['hatch', 'chick hatching'], ['chick', 'chick'], ['young', 'young chicken'], ['adult', 'hen (adult)']] },
    tree: { name: 'a tree through the seasons', stages: [['spring', 'spring: buds and new leaves'], ['summer', 'summer: full green leaves'], ['fall', 'fall: leaves change color and drop'], ['winter', 'winter: bare branches with buds']] }
  };
  B.cycle = function (k) { var c = B.CYCLES[k]; return c ? c.stages.map(function (s) { return { key: s[0], name: s[1] }; }) : []; };
  B.METAMORPHOSIS = { butterfly: 'complete', frog: 'yes', chicken: 'no', plant: 'no' };

  /* ---------- habitats and biomes ---------- */
  B.HABITATS = { forest: 'forest', grassland: 'grassland', desert: 'desert', polar: 'icy polar land', ocean: 'ocean', pond: 'pond', farm: 'farm', home: 'home and yard' };
  // biomes: typical yearly precipitation (cm) and average temperature (°C), as ranges; values follow standard textbook climate charts
  B.BIOMES = [
    { key: 'rainforest', name: 'tropical rainforest', rain: [200, 450], temp: [20, 30], plants: 'tall broadleaf trees in layers', life: 'more species than any other land biome' },
    { key: 'desert', name: 'desert', rain: [0, 25], temp: [-5, 35], plants: 'shrubs, succulents and other plants that store or save water (cactuses in the Americas)', life: 'animals active at night' },
    { key: 'grassland', name: 'grassland', rain: [25, 75], temp: [0, 25], plants: 'grasses, few trees', life: 'grazing animals and burrowers' },
    { key: 'deciduous', name: 'temperate deciduous forest', rain: [75, 150], temp: [5, 20], plants: 'trees that drop their leaves in fall', life: 'animals that migrate, hibernate or store food' },
    { key: 'taiga', name: 'taiga (boreal forest)', rain: [30, 85], temp: [-10, 5], plants: 'evergreen conifers', life: 'animals with thick fur' },
    { key: 'tundra', name: 'tundra', rain: [10, 25], temp: [-25, 0], plants: 'mosses, lichens and low shrubs over frozen ground', life: 'migrating birds and animals with thick coats' }
  ];
  B.biomeFor = function (rainCm, tempC) { // the biome whose ranges contain both values best (nearest by normalized distance)
    var best = null, bd = 1e9;
    B.BIOMES.forEach(function (b) {
      function d(v, r, s) { return v < r[0] ? (r[0] - v) / s : v > r[1] ? (v - r[1]) / s : 0; }
      var dd = d(rainCm, b.rain, 50) + d(tempC, b.temp, 10); if (dd < bd) { bd = dd; best = b; }
    });
    return best;
  };

  /* ---------- food webs (links go from food to eater: the way energy moves) ---------- */
  B.WEBS = {
    meadow: { name: 'a meadow', nodes: ['grass', 'flower', 'grasshopper', 'rabbit', 'mouse', 'robin', 'snake', 'fox', 'hawk'],
      links: [['grass', 'grasshopper'], ['grass', 'rabbit'], ['grass', 'mouse'], ['flower', 'grasshopper'], ['grasshopper', 'robin'], ['grasshopper', 'mouse'], ['mouse', 'snake'], ['mouse', 'fox'], ['mouse', 'hawk'], ['rabbit', 'fox'], ['rabbit', 'hawk'], ['snake', 'hawk'], ['robin', 'hawk']],
      decomposers: ['mushroom', 'worm'] },
    pond: { name: 'a pond', nodes: ['algae', 'tadpole', 'snail', 'dragonfly', 'fish', 'frog', 'duck', 'heron'],
      links: [['algae', 'tadpole'], ['algae', 'snail'], ['algae', 'duck'], ['tadpole', 'fish'], ['tadpole', 'dragonfly'], ['dragonfly', 'frog'], ['dragonfly', 'fish'], ['snail', 'fish'], ['snail', 'duck'], ['fish', 'heron'], ['frog', 'heron'], ['tadpole', 'heron']],
      decomposers: ['worm'] },
    ocean: { name: 'the ocean', nodes: ['algae', 'krill', 'fish', 'whale', 'penguin', 'seal', 'shark'],
      links: [['algae', 'krill'], ['krill', 'fish'], ['krill', 'whale'], ['krill', 'penguin'], ['fish', 'penguin'], ['fish', 'seal'], ['penguin', 'seal'], ['seal', 'shark'], ['fish', 'shark']],
      decomposers: [] },
    forest: { name: 'a forest', nodes: ['tree', 'fern', 'caterpillar', 'deer', 'squirrel', 'robin', 'fox', 'owl', 'wolf'],
      links: [['tree', 'caterpillar'], ['tree', 'deer'], ['tree', 'squirrel'], ['fern', 'deer'], ['caterpillar', 'robin'], ['squirrel', 'fox'], ['squirrel', 'owl'], ['robin', 'owl'], ['robin', 'fox'], ['deer', 'wolf']],
      decomposers: ['mushroom', 'worm'] },
    desert: { name: 'a desert', nodes: ['cactus', 'grass', 'grasshopper', 'mouse', 'lizard', 'snake', 'hawk'],
      links: [['cactus', 'mouse'], ['grass', 'grasshopper'], ['grass', 'mouse'], ['grasshopper', 'lizard'], ['grasshopper', 'mouse'], ['mouse', 'snake'], ['lizard', 'snake'], ['lizard', 'hawk'], ['mouse', 'hawk'], ['snake', 'hawk']],
      decomposers: [] }
  };
  function webOf(w) { return typeof w === 'string' ? B.WEBS[w] : w; }
  B.eats = function (web, k) { web = webOf(web); return web.links.filter(function (l) { return l[1] === k; }).map(function (l) { return l[0]; }); };
  B.eatenBy = function (web, k) { web = webOf(web); return web.links.filter(function (l) { return l[0] === k; }).map(function (l) { return l[1]; }); };
  B.isProducer = function (web, k) { var t = THINGS[k]; return !!t && (t.kind === 'plant' || !!t.producer); };
  // trophic level: 1 for producers, otherwise 1 + the longest chain below (the "highest" level it reaches)
  B.level = function (web, k) {
    web = webOf(web); var memo = {};
    function L(x, seen) { if (memo[x]) return memo[x]; var f = B.eats(web, x); if (!f.length) return (memo[x] = 1); var m = 0; f.forEach(function (y) { if (seen.indexOf(y) < 0) m = Math.max(m, L(y, seen.concat([x]))); }); return (memo[x] = m + 1); }
    return L(k, []);
  };
  B.role = function (web, k) {
    web = webOf(web); if ((web.decomposers || []).indexOf(k) >= 0) return 'decomposer';
    if (B.isProducer(web, k)) return 'producer';
    var f = B.eats(web, k), plants = f.filter(function (x) { return B.isProducer(web, x); }).length;
    return plants === f.length ? 'primary consumer' : plants ? 'omnivore' : 'secondary consumer';
  };
  // every chain from a producer to a top consumer, as arrays of keys
  B.chains = function (web) {
    web = webOf(web); var out = [];
    function go(path) { var last = path[path.length - 1], up = B.eatenBy(web, last); if (!up.length) { out.push(path); return; } up.forEach(function (u) { if (path.indexOf(u) < 0) go(path.concat([u])); }); }
    web.nodes.filter(function (n) { return !B.eats(web, n).length; }).forEach(function (p) { go([p]); });
    return out;
  };
  // first effect of removing a species: its foods (prey) rise, its eaters (predators) fall, others "?" (can't tell from one step)
  B.removeEffect = function (web, k) {
    web = webOf(web); var r = {};
    B.eats(web, k).forEach(function (x) { r[x] = 'up'; });
    B.eatenBy(web, k).forEach(function (x) { if (B.eats(web, x).length === 1) r[x] = 'down'; else if (!r[x]) r[x] = 'down?'; });
    return r;
  };

  /* ---------- energy pyramid ---------- */
  // energy at each level, starting from base (level 1), passing eff (default 0.1) up each step
  B.pyramid = function (base, n, eff) { eff = eff === undefined ? 0.1 : eff; var a = [base]; for (var i = 1; i < n; i++) a.push(+(a[i - 1] * eff).toPrecision(12)); return a; };
  B.LEVEL_NAMES = ['producers', 'primary consumers', 'secondary consumers', 'tertiary consumers', 'quaternary consumers'];

  /* ---------- matter cycles (processes with from, to) ---------- */
  B.MATTER = {
    carbon: { name: 'carbon cycle', stores: { air: 'carbon dioxide in the air', plants: 'plants', animals: 'animals', dead: 'dead matter and wastes', soil: 'soil', fossil: 'fossil fuels', ocean: 'ocean' },
      steps: [['photosynthesis', 'air', 'plants'], ['eating', 'plants', 'animals'], ['respiration', 'plants', 'air'], ['respiration', 'animals', 'air'], ['death and wastes', 'animals', 'dead'], ['death and wastes', 'plants', 'dead'], ['decomposition', 'dead', 'air'], ['burning (combustion)', 'fossil', 'air'], ['dissolving', 'air', 'ocean'], ['release', 'ocean', 'air'], ['burial over millions of years', 'dead', 'fossil']] },
    nitrogen: { name: 'nitrogen cycle', stores: { air: 'nitrogen gas (N₂) in the air', soil: 'ammonium and nitrates in soil', plants: 'plants', animals: 'animals', dead: 'dead matter and wastes' },
      steps: [['nitrogen fixation by bacteria', 'air', 'soil'], ['lightning', 'air', 'soil'], ['absorption by roots', 'soil', 'plants'], ['eating', 'plants', 'animals'], ['death and wastes', 'animals', 'dead'], ['death and wastes', 'plants', 'dead'], ['decomposition (ammonification)', 'dead', 'soil'], ['denitrification by bacteria', 'soil', 'air']] },
    water: { name: 'water cycle', stores: { ocean: 'oceans and lakes', air: 'water vapor in the air', cloud: 'clouds', land: 'land and soil', ground: 'groundwater', plants: 'plants' },
      steps: [['evaporation', 'ocean', 'air'], ['condensation', 'air', 'cloud'], ['precipitation', 'cloud', 'land'], ['runoff', 'land', 'ocean'], ['infiltration', 'land', 'ground'], ['uptake by roots', 'ground', 'plants'], ['transpiration', 'plants', 'air']] },
    phosphorus: { name: 'phosphorus cycle', stores: { rock: 'rocks', soil: 'soil and water', plants: 'plants', animals: 'animals', sediment: 'ocean sediment' },
      steps: [['weathering', 'rock', 'soil'], ['absorption by roots', 'soil', 'plants'], ['eating', 'plants', 'animals'], ['decomposition', 'animals', 'soil'], ['runoff and settling', 'soil', 'sediment'], ['uplift over millions of years', 'sediment', 'rock']] }
  };

  /* ---------- cells ---------- */
  // where: a (animal) p (plant) b (bacterium) f (fungus)
  B.ORGANELLES = {
    membrane: { name: 'cell membrane', job: 'controls what goes into and out of the cell', where: 'apbf' },
    cytoplasm: { name: 'cytoplasm', job: 'the jelly-like inside of the cell where many reactions happen', where: 'apbf' },
    nucleus: { name: 'nucleus', job: 'holds the DNA, the cell\'s instructions', where: 'apf' },
    nucleolus: { name: 'nucleolus', job: 'makes the parts of ribosomes', where: 'apf' },
    mitochondria: { name: 'mitochondrion', job: 'releases energy from food (cellular respiration)', where: 'apf' },
    ribosomes: { name: 'ribosomes', job: 'build proteins', where: 'apbf' },
    roughER: { name: 'rough endoplasmic reticulum', job: 'a folded membrane with ribosomes; makes and folds proteins', where: 'apf' },
    smoothER: { name: 'smooth endoplasmic reticulum', job: 'makes lipids and breaks down some toxins', where: 'apf' },
    golgi: { name: 'Golgi apparatus', job: 'packages and ships proteins', where: 'apf' },
    lysosome: { name: 'lysosome', job: 'breaks down wastes and worn-out parts', where: 'a' },
    vacuole: { name: 'vacuole', job: 'stores water and materials', where: 'apf' },
    centralVacuole: { name: 'central vacuole', job: 'a large sac of water that keeps the plant cell firm', where: 'p' },
    chloroplast: { name: 'chloroplast', job: 'captures light energy to make sugar (photosynthesis)', where: 'p' },
    wall: { name: 'cell wall', job: 'a stiff outer layer that supports and protects the cell', where: 'pbf' },
    centrioles: { name: 'centrioles', job: 'help organize cell division', where: 'a' },
    nucleoid: { name: 'nucleoid (DNA)', job: 'a loop of DNA lying in the cytoplasm, with no nucleus around it', where: 'b' },
    flagellum: { name: 'flagellum', job: 'a whip-like tail that moves the cell', where: 'b' },
    plasmid: { name: 'plasmid', job: 'a small ring of extra DNA', where: 'b' }
  };
  B.CELL_PARTS = { animal: ['membrane', 'cytoplasm', 'nucleus', 'nucleolus', 'mitochondria', 'ribosomes', 'roughER', 'smoothER', 'golgi', 'lysosome', 'vacuole', 'centrioles'],
    plant: ['wall', 'membrane', 'cytoplasm', 'nucleus', 'nucleolus', 'mitochondria', 'ribosomes', 'roughER', 'smoothER', 'golgi', 'centralVacuole', 'chloroplast'],
    bacterium: ['wall', 'membrane', 'cytoplasm', 'nucleoid', 'ribosomes', 'plasmid', 'flagellum'] };
  B.inCell = function (part, type) { return (B.CELL_PARTS[type] || []).indexOf(part) >= 0; };
  B.LEVELS_ORG = ['cell', 'tissue', 'organ', 'organ system', 'organism'];
  B.LEVELS_ECO = ['organism', 'population', 'community', 'ecosystem', 'biome', 'biosphere'];
  // microscope: total magnification and field of view
  B.mag = function (eye, obj) { return eye * obj; };
  B.fov = function (fov0, mag0, mag1) { return fov0 * mag0 / mag1; }; // field of view shrinks in proportion to magnification
  B.MICROSCOPE_PARTS = { eyepiece: 'eyepiece (ocular lens)', nosepiece: 'revolving nosepiece', objective: 'objective lenses', stage: 'stage', clips: 'stage clips', coarse: 'coarse focus knob', fine: 'fine focus knob', light: 'light', arm: 'arm', base: 'base', diaphragm: 'diaphragm' };
  // surface area and volume of a cube of side s, and its ratio
  B.cube = function (s) { return { sa: 6 * s * s, v: s * s * s, ratio: 6 / s }; };

  /* ---------- classification ---------- */
  B.RANKS = ['domain', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
  B.TAXA = { // well-known examples (standard classifications)
    wolf: { common: 'gray wolf', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'lupus' },
    dog: { common: 'dog', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'familiaris', note: 'some scientists treat the dog as a subspecies of the gray wolf, Canis lupus familiaris' },
    coyote: { common: 'coyote', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'latrans' },
    redfox: { common: 'red fox', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Vulpes', species: 'vulpes' },
    cat: { common: 'house cat', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Felis', species: 'catus' },
    lion: { common: 'lion', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'leo' },
    tiger: { common: 'tiger', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'tigris' },
    human: { common: 'human', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Homo', species: 'sapiens' },
    robin: { common: 'American robin', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Passeriformes', family: 'Turdidae', genus: 'Turdus', species: 'migratorius' },
    honeybee: { common: 'western honey bee', domain: 'Eukarya', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Insecta', order: 'Hymenoptera', family: 'Apidae', genus: 'Apis', species: 'mellifera' },
    redoak: { common: 'northern red oak', domain: 'Eukarya', kingdom: 'Plantae', phylum: 'Tracheophyta', class: 'Magnoliopsida', order: 'Fagales', family: 'Fagaceae', genus: 'Quercus', species: 'rubra' },
    yeast: { common: 'baker\'s yeast', domain: 'Eukarya', kingdom: 'Fungi', phylum: 'Ascomycota', class: 'Saccharomycetes', order: 'Saccharomycetales', family: 'Saccharomycetaceae', genus: 'Saccharomyces', species: 'cerevisiae' },
    ecoli: { common: 'E. coli', domain: 'Bacteria', kingdom: null, phylum: 'Pseudomonadota', class: 'Gammaproteobacteria', order: 'Enterobacterales', family: 'Enterobacteriaceae', genus: 'Escherichia', species: 'coli' }
  };
  B.sciName = function (k) { var t = B.TAXA[k]; return t ? t.genus + ' ' + t.species : ''; };
  // the lowest rank two organisms share (null if not even the domain)
  B.sharedRank = function (a, b) { a = B.TAXA[a]; b = B.TAXA[b]; var r = null; for (var i = 0; i < B.RANKS.length; i++) { var k = B.RANKS[i]; if (k === 'species') { if (a.genus === b.genus && a.species === b.species) r = k; break; } if (a[k] && a[k] === b[k]) r = k; else break; } return r; };
  B.DOMAINS = { Bacteria: 'single cells with no nucleus; many kinds everywhere', Archaea: 'single cells with no nucleus, chemically different from bacteria; many live in extreme places', Eukarya: 'cells with a nucleus: protists, fungi, plants and animals' };
  B.KINGDOMS = {
    Bacteria: { domain: 'Bacteria', cells: 'one', nucleus: false, food: 'many ways' }, Archaea: { domain: 'Archaea', cells: 'one', nucleus: false, food: 'many ways' },
    Protista: { domain: 'Eukarya', cells: 'mostly one', nucleus: true, food: 'make or take in food' }, Fungi: { domain: 'Eukarya', cells: 'one or many', nucleus: true, food: 'absorb food', wall: 'chitin' },
    Plantae: { domain: 'Eukarya', cells: 'many', nucleus: true, food: 'make food (photosynthesis)', wall: 'cellulose' }, Animalia: { domain: 'Eukarya', cells: 'many', nucleus: true, food: 'eat other organisms', wall: 'none' }
  };

  /* ---------- the human body (no reproductive system) ---------- */
  B.SYSTEMS = {
    skeletal: { name: 'skeletal system', organs: ['skull', 'ribs', 'spine', 'pelvis', 'femur', 'humerus'], job: 'supports, protects, works with muscles to move, makes blood cells' },
    muscular: { name: 'muscular system', organs: ['biceps', 'triceps', 'quadriceps', 'heart muscle'], job: 'moves the body and the organs inside it' },
    digestive: { name: 'digestive system', organs: ['mouth', 'esophagus', 'stomach', 'liver', 'small intestine', 'large intestine'], job: 'breaks food down and absorbs nutrients' },
    circulatory: { name: 'circulatory system', organs: ['heart', 'arteries', 'veins', 'capillaries'], job: 'carries oxygen, nutrients and wastes in the blood' },
    respiratory: { name: 'respiratory system', organs: ['nose', 'trachea', 'lungs', 'diaphragm'], job: 'takes in oxygen and gets rid of carbon dioxide' },
    nervous: { name: 'nervous system', organs: ['brain', 'spinal cord', 'nerves'], job: 'senses, thinks and controls the body with signals' },
    excretory: { name: 'excretory system', organs: ['kidneys', 'bladder'], job: 'filters wastes from the blood' },
    immune: { name: 'immune system', organs: ['white blood cells', 'lymph nodes', 'spleen', 'skin'], job: 'defends the body against germs' },
    endocrine: { name: 'endocrine system', organs: ['pancreas', 'thyroid', 'adrenal glands'], job: 'sends chemical signals (hormones) in the blood' }
  };
  B.DIGEST_PATH = ['mouth', 'esophagus', 'stomach', 'small intestine', 'large intestine'];
  B.BLOOD_PATH = ['body', 'right atrium', 'right ventricle', 'lungs', 'left atrium', 'left ventricle', 'body'];
  B.AIR_PATH = ['nose', 'trachea', 'bronchi', 'lungs', 'alveoli'];

  /* ---------- genetics ---------- */
  // tokens: X-linked alleles 'XA' 'Xa' (and 'Y'), ABO alleles 'IA' 'IB' 'i', or single letters (case = dominant/recessive)
  function isABO(g) { return /^(I[AB]|i)+$/.test(g); }
  function tokens(g) {
    g = String(g).replace(/\s+/g, '');
    if (/X/.test(g)) return g.match(/X[A-Za-z]|Y/g) || [];
    if (isABO(g)) return g.match(/I[AB]|i/g) || [];
    return g.split('');
  }
  B.tokens = tokens;
  B.isYchr = isYchr;
  // genes: [[allele, allele], ...] pairing by letter (case-insensitive); X-linked and ABO are one gene
  B.genes = function (g) {
    g = String(g).replace(/\s+/g, ''); var t = tokens(g);
    if (/X/.test(g) || isABO(g)) return [t];
    var by = {}, order = [];
    t.forEach(function (a) { var k = a.toLowerCase(); if (!by[k]) { by[k] = []; order.push(k); } by[k].push(a); });
    return order.sort().map(function (k) { return by[k]; });
  };
  // 'Y' is the Y chromosome only next to X-linked alleles (a genotype or gamete written with X, like XAY); anywhere else
  // a capital Y is an ordinary dominant allele (Mendel's RrYy). A lone 'Y' gamete comes from an X-linked father.
  function sexLinked(t) { return t.some(function (x) { return /^X/.test(x); }); }
  function isYchr(a, t) { return a === 'Y' && sexLinked(t); }
  function dominanceRank(a, sx) { if (sx && a === 'Y') return 3; if (/^I[AB]$/.test(a)) return 0; if (a === 'i') return 1; var b = a.length > 1 ? a.slice(1) : a; return b === b.toUpperCase() ? 0 : 1; }
  // a gene's two alleles in standard order (dominant first, X before Y, IA before IB before i)
  B.pairOrder = function (p) { var sx = sexLinked(p); return p.slice().sort(function (x, y) { var d = dominanceRank(x, sx) - dominanceRank(y, sx); return d || (x < y ? -1 : x > y ? 1 : 0); }); };
  B.canon = function (g) { return B.genes(g).map(function (p) { return B.pairOrder(p).join(''); }).join(''); };
  // gametes: one allele of each gene, all combinations, with repeats (so each is equally likely); order like FOIL
  B.gametes = function (g) {
    var G = B.genes(g), out = [''];
    G.forEach(function (p) { var nx = []; out.forEach(function (s) { p.forEach(function (a) { nx.push(s + a); }); }); out = nx; });
    return out;
  };
  B.uniqueGametes = function (g) { var s = []; B.gametes(g).forEach(function (x) { if (s.indexOf(x) < 0) s.push(x); }); return s; };
  // phenotype key of a genotype: per gene 'dom' | 'rec' (complete), 'het' for incomplete or co dominance; X-linked: 'dom' | 'rec';
  // ABO: 'A' | 'B' | 'AB' | 'O'
  B.pheno = function (g, mode) {
    return B.genes(g).map(function (p) {
      var t = p.join('');
      if (/I[AB]|^i/.test(t) && p.every(function (x) { return /^(I[AB]|i)$/.test(x); })) { var A = p.indexOf('IA') >= 0, Bb = p.indexOf('IB') >= 0; return A && Bb ? 'AB' : A ? 'A' : Bb ? 'B' : 'O'; }
      var al = p.filter(function (x) { return !isYchr(x, p); }), dom = al.filter(function (x) { return dominanceRank(x) === 0; }).length;
      if (mode === 'incomplete' || mode === 'co') return dom === al.length ? 'dom' : dom === 0 ? 'rec' : 'het';
      return dom ? 'dom' : 'rec';
    }).join('/');
  };
  // combine two gametes into a genotype (canonical order)
  B.fuse = function (g1, g2) {
    var t = tokens(g1).concat(tokens(g2));
    if (/X/.test(g1 + g2)) { var xs = t.filter(function (x) { return x !== 'Y'; }), ys = t.filter(function (x) { return x === 'Y'; }); return B.pairOrder(xs).join('') + ys.join(''); }
    return B.canon(t.join(''));
  };
  // a cross: side = parent 1's gametes (rows), top = parent 2's gametes (columns)
  B.cross = function (p1, p2, mode) {
    var side = B.gametes(p1), top = B.gametes(p2), grid = [], gen = {}, phe = {}, n = 0;
    side.forEach(function (a) { var row = []; top.forEach(function (b) { var g = B.fuse(a, b); row.push(g); gen[g] = (gen[g] || 0) + 1; var ph = B.pheno(g, mode); phe[ph] = (phe[ph] || 0) + 1; n++; }); grid.push(row); });
    return { side: side, top: top, grid: grid, genotypes: gen, phenotypes: phe, total: n };
  };
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  B.gcd = gcd;
  // counts in a given order -> reduced ratio string "9:3:3:1"
  B.ratio = function (counts) { var g = counts.reduce(function (s, c) { return gcd(s, c); }, 0) || 1; return counts.map(function (c) { return c / g; }).join(':'); };
  B.isXLinked = function (g) { return /X/.test(g); };
  // ABO: the alleles a blood type can have
  B.BLOOD = { A: ['IAIA', 'IAi'], B: ['IBIB', 'IBi'], AB: ['IAIB'], O: ['ii'] };

  /* ---------- DNA and the genetic code ---------- */
  var COMP = { A: 'T', T: 'A', G: 'C', C: 'G', U: 'A' };
  B.complement = function (s) { return String(s).toUpperCase().split('').map(function (c) { return COMP[c] || c; }).join(''); };
  B.revcomp = function (s) { return B.complement(s).split('').reverse().join(''); };
  // mRNA from the template strand (complementary, U for T), and from the coding strand (same, U for T)
  B.transcribe = function (template) { return String(template).toUpperCase().split('').map(function (c) { return { A: 'U', T: 'A', G: 'C', C: 'G' }[c] || c; }).join(''); };
  B.codingToMRNA = function (coding) { return String(coding).toUpperCase().replace(/T/g, 'U'); };
  var BASES = 'UCAG', AAS = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  var CODE = {}; for (var i = 0; i < 64; i++) CODE[BASES[i >> 4] + BASES[(i >> 2) & 3] + BASES[i & 3]] = AAS[i];
  B.CODE = CODE;
  B.AA = { A: ['Ala', 'alanine'], R: ['Arg', 'arginine'], N: ['Asn', 'asparagine'], D: ['Asp', 'aspartic acid'], C: ['Cys', 'cysteine'], Q: ['Gln', 'glutamine'], E: ['Glu', 'glutamic acid'],
    G: ['Gly', 'glycine'], H: ['His', 'histidine'], I: ['Ile', 'isoleucine'], L: ['Leu', 'leucine'], K: ['Lys', 'lysine'], M: ['Met', 'methionine'], F: ['Phe', 'phenylalanine'],
    P: ['Pro', 'proline'], S: ['Ser', 'serine'], T: ['Thr', 'threonine'], W: ['Trp', 'tryptophan'], Y: ['Tyr', 'tyrosine'], V: ['Val', 'valine'], '*': ['Stop', 'stop'] };
  B.codon = function (c) { return CODE[String(c).toUpperCase().replace(/T/g, 'U')] || null; };
  B.three = function (aa1) { return (B.AA[aa1] || ['?'])[0]; };
  B.codonsFor = function (aa1) { return Object.keys(CODE).filter(function (c) { return CODE[c] === aa1; }); };
  // translate mRNA: from the first AUG (start: true) or from position 0; stop at a stop codon; returns one-letter string
  B.translate = function (mrna, o) {
    o = o || {}; var s = String(mrna).toUpperCase().replace(/T/g, 'U'), i = 0, out = '';
    if (o.start !== false) { i = s.indexOf('AUG'); if (i < 0) return ''; }
    for (; i + 3 <= s.length; i += 3) { var a = CODE[s.substr(i, 3)]; if (a === '*') { if (o.keepStop) out += '*'; break; } out += a; }
    return out;
  };
  B.codons = function (mrna, from) { var s = String(mrna).toUpperCase(), a = []; for (var i = from || 0; i + 3 <= s.length; i += 3) a.push(s.substr(i, 3)); return a; };
  // classify a point mutation of an mRNA reading frame (both strings the same length; frame from 0)
  B.mutationType = function (mrna0, mrna1) {
    if (mrna0.length !== mrna1.length) return 'frameshift';
    var a = B.translate(mrna0, { start: false, keepStop: true }), b = B.translate(mrna1, { start: false, keepStop: true });
    if (a === b) return 'silent';
    for (var i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return b[i] === '*' ? 'nonsense' : 'missense';
    return a.length > b.length ? 'nonsense' : 'missense';
  };
  B.chargaff = function (pctA) { var g = (100 - 2 * pctA) / 2; return { A: pctA, T: pctA, G: g, C: g }; };
  B.pcr = function (start, cycles) { return start * Math.pow(2, cycles); };

  /* ---------- cell division ---------- */
  B.MITOSIS = [
    { key: 'interphase', name: 'interphase', what: 'the cell grows and copies its DNA; chromosomes are loose and thin' },
    { key: 'prophase', name: 'prophase', what: 'chromosomes coil up and become visible; the nuclear envelope breaks down; spindle fibers form' },
    { key: 'metaphase', name: 'metaphase', what: 'chromosomes line up across the middle of the cell' },
    { key: 'anaphase', name: 'anaphase', what: 'sister chromatids are pulled apart to opposite ends' },
    { key: 'telophase', name: 'telophase', what: 'two new nuclei form and the chromosomes loosen' },
    { key: 'cytokinesis', name: 'cytokinesis', what: 'the cytoplasm divides, making two identical cells' }
  ];
  B.MEIOSIS = [
    { key: 'interphase', name: 'interphase', what: 'the DNA is copied' },
    { key: 'prophase1', name: 'prophase I', what: 'homologous chromosomes pair up and cross over' },
    { key: 'metaphase1', name: 'metaphase I', what: 'homologous pairs line up in the middle, each pair facing either way' },
    { key: 'anaphase1', name: 'anaphase I', what: 'homologous chromosomes separate (sister chromatids stay together)' },
    { key: 'telophase1', name: 'telophase I and cytokinesis', what: 'two haploid cells form, each chromosome still two chromatids' },
    { key: 'prophase2', name: 'prophase II', what: 'chromosomes condense again in each cell' },
    { key: 'metaphase2', name: 'metaphase II', what: 'chromosomes line up in the middle of each cell' },
    { key: 'anaphase2', name: 'anaphase II', what: 'sister chromatids separate' },
    { key: 'telophase2', name: 'telophase II and cytokinesis', what: 'four haploid cells, each genetically different' }
  ];
  // chromosome and chromatid counts per cell at each stage, for a cell with diploid number 2n
  B.counts = function (twoN, stage) {
    var n = twoN / 2;
    var T = { interphaseG1: [twoN, twoN], interphase: [twoN, 2 * twoN], prophase: [twoN, 2 * twoN], metaphase: [twoN, 2 * twoN], anaphase: [2 * twoN, 2 * twoN], telophase: [twoN, twoN], cytokinesis: [twoN, twoN],
      prophase1: [twoN, 2 * twoN], metaphase1: [twoN, 2 * twoN], anaphase1: [twoN, 2 * twoN], telophase1: [n, twoN], prophase2: [n, twoN], metaphase2: [n, twoN], anaphase2: [twoN, twoN], telophase2: [n, n] };
    var c = T[stage]; return c ? { chromosomes: c[0], chromatids: c[1] } : null;
  }; // anaphase counts are for the whole (still single) cell; telophase counts are per new nucleus
  B.assortments = function (n) { return Math.pow(2, n); };

  /* ---------- populations and evolution ---------- */
  B.expN = function (N0, r, t) { return N0 * Math.exp(r * t); };
  B.logisticN = function (N0, r, K, t) { return K / (1 + (K - N0) / N0 * Math.exp(-r * t)); };
  B.dNdtExp = function (r, N) { return r * N; };
  B.dNdtLog = function (r, N, K) { return r * N * (K - N) / K; };
  B.doubling = function (N0, gens) { return N0 * Math.pow(2, gens); };
  B.density = function (n, area) { return n / area; };
  B.quadrat = function (counts, quadArea, totalArea) { var m = counts.reduce(function (s, c) { return s + c; }, 0) / counts.length; return { mean: m, estimate: m * totalArea / quadArea }; };
  B.hw = function (o) { // give one of q2, q, p, p2; returns all
    var q; if (o.q !== undefined) q = o.q; else if (o.q2 !== undefined) q = Math.sqrt(o.q2); else if (o.p !== undefined) q = 1 - o.p; else if (o.p2 !== undefined) q = 1 - Math.sqrt(o.p2);
    var p = 1 - q; return { p: p, q: q, p2: p * p, q2: q * q, pq2: 2 * p * q };
  };
  B.alleleFreq = function (nAA, nAa, naa) { var N = nAA + nAa + naa; return { p: (2 * nAA + nAa) / (2 * N), q: (2 * naa + nAa) / (2 * N) }; };
  B.simpson = function (counts) { var N = counts.reduce(function (s, c) { return s + c; }, 0); return 1 - counts.reduce(function (s, c) { return s + (c / N) * (c / N); }, 0); };
  B.chi2 = function (obs, exp) { return obs.reduce(function (s, o, i) { return s + (o - exp[i]) * (o - exp[i]) / exp[i]; }, 0); };
  B.CHI_CRIT = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49, 5: 11.07, 6: 12.59 }; // p = 0.05
  B.recombFreq = function (recomb, total) { return recomb / total; };
  B.psiS = function (i, C, T) { return -i * C * 0.0831 * T; }; // bars; C in mol/L, T in kelvin
  B.se = function (sd, n) { return sd / Math.sqrt(n); };
  B.mean = function (a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; };
  B.sd = function (a) { var m = B.mean(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); };

  /* ---------- macromolecules and energy ---------- */
  B.MACRO = {
    carbohydrate: { name: 'carbohydrates', monomer: 'monosaccharides (simple sugars such as glucose)', examples: ['glucose', 'starch', 'glycogen', 'cellulose'], jobs: 'quick energy, energy storage, plant cell walls', elements: 'C, H, O' },
    lipid: { name: 'lipids', monomer: 'not a polymer (fats are glycerol and fatty acids)', examples: ['fats', 'oils', 'phospholipids', 'steroids', 'waxes'], jobs: 'long-term energy storage, membranes, some hormones', elements: 'mostly C, H, O' },
    protein: { name: 'proteins', monomer: 'amino acids', examples: ['enzymes', 'hemoglobin', 'collagen', 'antibodies', 'keratin'], jobs: 'enzymes, structure, transport, signals, defense', elements: 'C, H, O, N, often S' },
    nucleic: { name: 'nucleic acids', monomer: 'nucleotides', examples: ['DNA', 'RNA'], jobs: 'store and use genetic information', elements: 'C, H, O, N, P' }
  };
  B.PHOTO = { inputs: ['carbon dioxide', 'water', 'light energy'], outputs: ['glucose (sugar)', 'oxygen'], where: 'chloroplast', eq: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂' };
  B.RESP = { inputs: ['glucose (sugar)', 'oxygen'], outputs: ['carbon dioxide', 'water', 'ATP (energy)'], where: 'mitochondrion', eq: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (ATP)' };
  B.RESP_STAGES = [
    { key: 'glycolysis', name: 'glycolysis', where: 'cytoplasm', in: 'glucose', out: '2 pyruvate, 2 ATP (net), 2 NADH', o2: false },
    { key: 'oxidation', name: 'pyruvate oxidation', where: 'mitochondrial matrix', in: '2 pyruvate', out: '2 acetyl-CoA, 2 CO₂, 2 NADH', o2: true },
    { key: 'krebs', name: 'Krebs (citric acid) cycle', where: 'mitochondrial matrix', in: '2 acetyl-CoA', out: '4 CO₂, 2 ATP, 6 NADH, 2 FADH₂', o2: true },
    { key: 'etc', name: 'electron transport chain and chemiosmosis', where: 'inner mitochondrial membrane', in: 'NADH, FADH₂, O₂', out: 'about 26–28 ATP, water', o2: true }
  ];
  B.PHOTO_STAGES = [
    { key: 'light', name: 'light-dependent reactions', where: 'thylakoid membranes', in: 'light, water, ADP, NADP⁺', out: 'oxygen, ATP, NADPH' },
    { key: 'calvin', name: 'Calvin cycle', where: 'stroma', in: 'CO₂, ATP, NADPH', out: 'G3P (sugar), ADP, NADP⁺' }
  ];
  B.FERMENT = { lactic: { who: 'muscle cells and some bacteria', products: ['lactic acid'], atp: 2 }, alcoholic: { who: 'yeast', products: ['ethanol', 'carbon dioxide'], atp: 2 } };
  // enzyme activity (0..1) with a bell around an optimum: temperature (°C, denatures sharply above) or pH
  B.activity = function (x, opt, width, kind) {
    if (kind === 'temp') { if (x <= opt) return Math.exp(-Math.pow((x - opt) / width, 2)); var d = (x - opt) / (width * 0.45); return Math.max(0, Math.exp(-d * d)); }
    return Math.exp(-Math.pow((x - opt) / width, 2));
  };
  B.ENZYMES = { amylase: { name: 'salivary amylase', where: 'mouth', substrate: 'starch', pH: 7, temp: 37 }, pepsin: { name: 'pepsin', where: 'stomach', substrate: 'proteins', pH: 2, temp: 37 },
    trypsin: { name: 'trypsin', where: 'small intestine', substrate: 'proteins', pH: 8, temp: 37 }, lipase: { name: 'pancreatic lipase', where: 'small intestine', substrate: 'fats', pH: 8, temp: 37 } };
  B.michaelis = function (S, Vmax, Km, inhib) { inhib = inhib || {}; var km = Km * (inhib.competitive ? 1 + inhib.competitive : 1), vm = Vmax / (inhib.noncompetitive ? 1 + inhib.noncompetitive : 1); return vm * S / (km + S); };

  /* ---------- feedback loops ---------- */
  B.LOOPS = {
    temperature: { name: 'body temperature', kind: 'negative', setpoint: 'about 37 °C', sensor: 'temperature sensors in the skin and brain', control: 'the hypothalamus in the brain',
      high: { effector: 'sweat glands and skin blood vessels', response: 'sweating; blood vessels in the skin widen', result: 'body temperature falls' },
      low: { effector: 'skeletal muscles and skin blood vessels', response: 'shivering; blood vessels in the skin narrow', result: 'body temperature rises' } },
    glucose: { name: 'blood glucose', kind: 'negative', setpoint: 'a steady blood sugar level', sensor: 'cells in the pancreas', control: 'the pancreas',
      high: { effector: 'insulin acting on body cells and the liver', response: 'cells take up glucose; the liver stores it as glycogen', result: 'blood glucose falls' },
      low: { effector: 'glucagon acting on the liver', response: 'the liver breaks down glycogen and releases glucose', result: 'blood glucose rises' } },
    water: { name: 'water balance', kind: 'negative', setpoint: 'a steady amount of water in the blood', sensor: 'sensors in the brain', control: 'the brain (hypothalamus and pituitary)',
      low: { effector: 'ADH acting on the kidneys', response: 'the kidneys keep more water', result: 'blood water rises' },
      high: { effector: 'less ADH reaching the kidneys', response: 'the kidneys let more water go', result: 'blood water falls' } },
    clotting: { name: 'blood clotting', kind: 'positive', start: 'a damaged blood vessel', steps: ['platelets stick to the damaged spot', 'they release chemicals', 'the chemicals attract more platelets', 'until a clot seals the wound'] },
    ripening: { name: 'fruit ripening', kind: 'positive', start: 'a ripening fruit releases ethylene gas', steps: ['ethylene makes nearby fruit ripen', 'ripening fruit release more ethylene', 'ripening speeds up', 'until the fruit are ripe'] }
  };

  /* ---------- gels and trees ---------- */
  // distance a fragment travels (0 = well, 1 = far end) on a log scale between bp limits
  B.gelPos = function (bp, lo, hi) { lo = lo || 100; hi = hi || 10000; var t = (Math.log(hi) - Math.log(bp)) / (Math.log(hi) - Math.log(lo)); return Math.max(0.03, Math.min(0.97, 0.05 + 0.9 * t)); };
  B.gelSize = function (pos, lo, hi) { lo = lo || 100; hi = hi || 10000; var t = (pos - 0.05) / 0.9; return Math.exp(Math.log(hi) - t * (Math.log(hi) - Math.log(lo))); };
  B.LADDER = [10000, 5000, 3000, 2000, 1500, 1000, 700, 500, 300, 200, 100];
  // cut a linear DNA of length L at positions (bp) -> fragment lengths, largest first
  B.digest = function (L, cuts) { var c = cuts.slice().sort(function (a, b) { return a - b; }), f = [], p = 0; c.forEach(function (x) { f.push(x - p); p = x; }); f.push(L - p); return f.sort(function (a, b) { return b - a; }); };
  // trees: nested arrays of tip names, e.g. [['lamprey'], [['shark'], [['frog'], ['lizard', 'mouse']]]] -> tips and the MRCA test
  B.tips = function (t) { return Array.isArray(t) ? t.reduce(function (a, x) { return a.concat(B.tips(x)); }, []) : [t]; };
  // the smallest clade (subtree) holding all names; returns that subtree
  B.mrca = function (t, names) { if (!Array.isArray(t)) return t; for (var i = 0; i < t.length; i++) { var s = B.tips(t[i]); if (names.every(function (n) { return s.indexOf(n) >= 0; })) return B.mrca(t[i], names); } return t; };
  // which of b, c is more closely related to a (by the most recent common ancestor); 'tie' if equal
  B.closer = function (t, a, b, c) { var ab = B.tips(B.mrca(t, [a, b])).length, ac = B.tips(B.mrca(t, [a, c])).length; return ab < ac ? b : ac < ab ? c : 'tie'; };
  B.TREES = {
    vertebrates: { tree: ['lamprey', ['shark', ['perch', ['frog', ['lizard', 'mouse']]]]], traits: [['vertebrae', 0], ['jaws', 1], ['bony skeleton', 2], ['four limbs', 3], ['claws or nails', 4], ['hair', 5, 'mouse']], outgroup: 'lancelet' },
    plants: { tree: ['green alga', ['moss', ['fern', ['pine', 'rose']]]], traits: [['living on land', 0], ['tubes (vascular tissue)', 1], ['seeds', 2], ['flowers and fruit', 3]] },
    primates: { tree: ['lemur', ['monkey', ['gibbon', ['orangutan', ['gorilla', ['chimpanzee', 'human']]]]]] },
    animals: { tree: ['sponge', ['jellyfish', [[['earthworm', 'snail'], 'insect'], ['sea star', 'fish']]]] }
  };
  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math;
  var NS = 'http://www.w3.org/2000/svg';
  var SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a'; // the site's one cartoon skin color for drawn people and hands
  B.SKIN = SKIN; B.SKIN_LINE = SKIN_LINE;
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  function cap1(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function okMark(good) { return '<span class="' + (good ? 'bv-ok' : 'bv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function seeded(str) { var x = 0; str = String(str); for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) { var idx = []; for (var i = 0; i < n; i++) idx.push(i); for (var t = 0; t < 20; t++) { var s = shuffle(idx, key + '#' + t); if (n < 2 || s.some(function (v, j) { return v !== j; })) return s; } return idx.slice(1).concat([0]); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function svgRoot(w, hh, label, cls) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'bv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function arrowHead(parent, id, cls) { var defs = parent.querySelector('defs') || sv('defs', null, parent); var mk = sv('marker', { id: id, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0,0 L10,5 L0,10 z', class: cls || 'bv-arrowhead' }, mk); return 'url(#' + id + ')'; }
  var uidN = 0; function uid(p) { return 'bv-' + (p || 'x') + '-' + (++uidN); }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }

  // the frame every visual shares: classes, aria-label, read-to-me note, task, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('bv', 'bv-' + name); if (o.big) el.classList.add('bv-big');
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (!el.getAttribute('aria-label') || F.quiet) el.setAttribute('aria-label', o.label || label);
    if (o.readme) el.appendChild(h('p', 'bv-readme', '<span class="bv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'bv-task', o.task));
    F.body = h('div', 'bv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl bv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout bv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; if (html && ML.typeset) try { ML.typeset(F.out); } catch (e) { } };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.speak = function (getText) {
      if (!o.speak || !W.speechSynthesis || !W.SpeechSynthesisUtterance) return;
      var b = btn(null, '🔊 Read aloud', function () { try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(getText().replace(/<[^>]+>/g, ' ')); u.rate = 0.9; W.speechSynthesis.speak(u); } catch (e) { } }, 'bv-speak');
      F.ctl.insertBefore(b, F.ctl.firstChild);
    };
    return F;
  }
  // a small step-through bar (Back / Next / counter)
  function stepper(parent, n, go, o) {
    o = o || {}; var bar = h('div', 'bv-nav'), i = o.start || 0;
    var back = btn(bar, '‹ Back', function () { set(i - 1); }), lab = h('span', 'bv-navn'), next = btn(bar, 'Next ›', function () { set(i + 1); }, 'pri');
    bar.insertBefore(lab, next);
    var play = null, timer = null;
    if (o.play) { play = btn(bar, '▶ Play', function () { if (timer) stop(); else { if (i >= n - 1) set(0); timer = W.setInterval(function () { if (i >= n - 1) stop(); else set(i + 1); }, o.play); play.textContent = '❚❚ Pause'; } }); }
    function stop() { if (timer) W.clearInterval(timer); timer = null; if (play) play.textContent = '▶ Play'; }
    function set(k) { i = M.max(0, M.min(n - 1, k)); back.disabled = i === 0; next.disabled = i === n - 1; lab.textContent = (o.label ? o.label(i) : 'Step ' + (i + 1) + ' of ' + n); go(i); }
    parent.appendChild(bar); set(i);
    return { set: set, get: function () { return i; }, stop: stop };
  }
  // numbered (or "?") badges drawn right on the parts, and an HTML key under the picture: used when labels with leader
  // lines would be too small (narrow screens) and in quiet mode with numbers or ask
  function badge(svg, x, y, tag, asked) { var g = sv('g', { class: 'bv-mark' + (asked ? ' ask' : ''), transform: 'translate(' + x + ',' + y + ')' }, svg); sv('circle', { r: asked ? 16 : 13 }, g); txt(g, 0, asked ? 7 : 5, tag, { 'text-anchor': 'middle' }); return g; }
  function keyList(parent, rows) { var ol = h('ol', 'bv-keylist'); rows.forEach(function (r) { ol.appendChild(h('li', '', '<b>' + esc(r[0]) + '</b> ' + esc(r[1]))); }); parent.appendChild(ol); return ol; }
  function narrow(el) { return (el.clientWidth || 600) < 560; }
  /* ---------- the icon library: every key of MathLadder.bio.THINGS, drawn in a 100 × 100 box (original SVG) ----------
     class o = the outline stroke, class k = dark details (eyes), both themed in bio.css. Hands use the site's skin color. */
  var OL = ' class="o"', DK = ' class="k"';
  function eye(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '"' + DK + '/><circle cx="' + (x + (r || 3) * 0.35) + '" cy="' + (y - (r || 3) * 0.35) + '" r="' + ((r || 3) * 0.35) + '" fill="#fff"/>'; }
  function legs4(x1, x2, y, c, len) { var s = ''; [x1, x1 + 9, x2 - 9, x2].forEach(function (x) { s += '<rect x="' + (x - 3.5) + '" y="' + y + '" width="7" height="' + (len || 16) + '" rx="3" fill="' + c + '"' + OL + '/>'; }); return s; }
  function sixLegs(cx, cy, w) { var s = ''; [-1, 1].forEach(function (d) { [-8, 0, 8].forEach(function (dx, i) { s += '<path d="M' + (cx + dx) + ',' + cy + ' q' + (d * (w * 0.5)) + ',' + (i - 1) * 4 + ' ' + (d * w) + ',' + (6 + (i - 1) * 6) + '" fill="none"' + OL + '/>'; }); }); return s; }
  var ICONS = {
    dog: '<path d="M78,38 q14,-6 12,-20" fill="none" stroke="#b07a4a" stroke-width="6" stroke-linecap="round"/>' + legs4(30, 74, 58, '#b07a4a', 20) + '<ellipse cx="52" cy="52" rx="28" ry="15" fill="#c48a55"' + OL + '/><circle cx="28" cy="36" r="15" fill="#c48a55"' + OL + '/><ellipse cx="14" cy="42" rx="8" ry="6" fill="#c48a55"' + OL + '/><circle cx="9" cy="40" r="3"' + DK + '/><path d="M30,22 q8,-4 8,14 q-8,2 -8,-14z" fill="#7a5230"' + OL + '/>' + eye(25, 33),
    cat: '<path d="M78,52 q18,-4 14,-26" fill="none" stroke="#9aa3ab" stroke-width="6" stroke-linecap="round"/>' + legs4(32, 72, 60, '#9aa3ab', 18) + '<ellipse cx="54" cy="55" rx="25" ry="13" fill="#aab3bb"' + OL + '/><circle cx="30" cy="40" r="15" fill="#aab3bb"' + OL + '/><path d="M19,31 l-2,-14 l11,8z M39,30 l3,-14 l-11,7z" fill="#aab3bb"' + OL + '/>' + eye(25, 38, 2.6) + eye(36, 38, 2.6) + '<path d="M28,45 l2,2 l2,-2" fill="none"' + OL + '/><path d="M14,44 h8 M14,48 h8 M38,44 h8 M38,48 h8" stroke="#555" stroke-width="1"/>',
    cow: legs4(28, 74, 60, '#f4f4f0', 22) + '<rect x="24" y="36" width="56" height="28" rx="12" fill="#f4f4f0"' + OL + '/><path d="M44,38 q8,8 0,18 q-10,-4 0,-18z M64,44 q8,4 4,14 q-8,0 -4,-14z" fill="#3a3330"/><rect x="6" y="30" width="24" height="24" rx="9" fill="#f4f4f0"' + OL + '/><ellipse cx="16" cy="50" rx="11" ry="6" fill="#f2a7b5"' + OL + '/><path d="M8,30 l-4,-8 M26,30 l4,-8" stroke="#d9c38f" stroke-width="4" stroke-linecap="round"/>' + eye(12, 38, 2.4) + eye(23, 38, 2.4),
    rabbit: '<ellipse cx="56" cy="64" rx="24" ry="18" fill="#c9b8a6"' + OL + '/><circle cx="80" cy="62" r="6" fill="#fff"' + OL + '/><circle cx="36" cy="46" r="14" fill="#c9b8a6"' + OL + '/><ellipse cx="30" cy="20" rx="5" ry="16" fill="#c9b8a6"' + OL + ' transform="rotate(-12 30 20)"/><ellipse cx="42" cy="20" rx="5" ry="16" fill="#c9b8a6"' + OL + ' transform="rotate(10 42 20)"/><ellipse cx="42" cy="20" rx="2" ry="11" fill="#f2a7b5" transform="rotate(10 42 20)"/>' + eye(32, 44, 2.6) + '<circle cx="24" cy="50" r="2" fill="#e07a8a"/><ellipse cx="44" cy="80" rx="10" ry="4" fill="#c9b8a6"' + OL + '/>',
    fox: '<path d="M70,60 q26,0 24,-22 q-6,14 -24,10z" fill="#e07a2e"' + OL + '/><path d="M92,40 q2,-4 0,-6 q-4,0 -4,6z" fill="#fff"/>' + legs4(30, 66, 62, '#3a2a20', 18) + '<ellipse cx="50" cy="56" rx="24" ry="12" fill="#e07a2e"' + OL + '/><path d="M8,44 L30,30 L36,52 Z" fill="#e07a2e"' + OL + '/><path d="M8,44 L22,46 L18,50z" fill="#fff"/><path d="M22,32 l2,-14 l9,12z" fill="#e07a2e"' + OL + '/><circle cx="8" cy="44" r="2.5"' + DK + '/>' + eye(24, 38, 2.4),
    deer: legs4(32, 70, 56, '#a8703f', 28) + '<ellipse cx="52" cy="52" rx="24" ry="12" fill="#b9814b"' + OL + '/><path d="M30,48 l-6,-20" stroke="#b9814b" stroke-width="10" stroke-linecap="round"/><ellipse cx="20" cy="26" rx="11" ry="8" fill="#b9814b"' + OL + '/><path d="M20,18 q-2,-10 -10,-12 M20,14 q4,-8 12,-8 M26,18 q4,-10 14,-10" fill="none" stroke="#7a5230" stroke-width="2.6" stroke-linecap="round"/>' + eye(18, 25, 2.2) + '<circle cx="10" cy="28" r="2"' + DK + '/><circle cx="48" cy="48" r="2" fill="#fff"/><circle cx="58" cy="50" r="2" fill="#fff"/>',
    bear: legs4(26, 74, 60, '#6b4a33', 22) + '<ellipse cx="54" cy="56" rx="30" ry="18" fill="#7a5638"' + OL + '/><circle cx="24" cy="44" r="15" fill="#7a5638"' + OL + '/><circle cx="16" cy="31" r="5" fill="#7a5638"' + OL + '/><circle cx="32" cy="30" r="5" fill="#7a5638"' + OL + '/><ellipse cx="18" cy="50" rx="7" ry="5" fill="#b08a68"/><circle cx="14" cy="48" r="2.5"' + DK + '/>' + eye(22, 40, 2.4),
    wolf: '<path d="M74,52 q20,6 22,-10" fill="none" stroke="#8a8f96" stroke-width="7" stroke-linecap="round"/>' + legs4(30, 70, 60, '#8a8f96', 20) + '<ellipse cx="52" cy="56" rx="25" ry="12" fill="#9aa0a7"' + OL + '/><path d="M6,46 L28,32 L36,56 Z" fill="#9aa0a7"' + OL + '/><path d="M6,46 l14,4 l-6,4z" fill="#e8e8e8"/><path d="M22,34 l1,-14 l9,13z" fill="#9aa0a7"' + OL + '/><circle cx="6" cy="46" r="2.5"' + DK + '/>' + eye(23, 40, 2.4),
    mouse: '<path d="M74,66 q20,4 20,-12" fill="none" stroke="#e8a0a8" stroke-width="2.5"/><ellipse cx="54" cy="64" rx="22" ry="14" fill="#9e9a96"' + OL + '/><path d="M18,62 Q24,46 40,52 L36,70 Z" fill="#9e9a96"' + OL + '/><circle cx="38" cy="46" r="9" fill="#9e9a96"' + OL + '/><circle cx="38" cy="46" r="5" fill="#e8a0a8"/><circle cx="18" cy="62" r="2.5" fill="#e07a8a"/>' + eye(28, 56, 2.2) + '<path d="M44,78 v4 M62,78 v4" stroke="#e8a0a8" stroke-width="3" stroke-linecap="round"/>',
    squirrel: '<path d="M60,74 q34,0 30,-34 q-4,-20 -20,-16 q8,8 4,20 q-4,14 -14,18z" fill="#b5652e"' + OL + '/><ellipse cx="46" cy="64" rx="16" ry="14" fill="#c4743a"' + OL + '/><circle cx="36" cy="42" r="11" fill="#c4743a"' + OL + '/><path d="M36,32 l2,-8 l5,8z" fill="#c4743a"' + OL + '/><circle cx="26" cy="46" r="2"' + DK + '/>' + eye(34, 40, 2.2) + '<ellipse cx="34" cy="62" rx="5" ry="6" fill="#8a5a2b"' + OL + '/><ellipse cx="44" cy="80" rx="8" ry="3" fill="#c4743a"' + OL + '/>',
    groundhog: '<ellipse cx="50" cy="64" rx="26" ry="22" fill="#8a6a48"' + OL + '/><circle cx="50" cy="38" r="15" fill="#8a6a48"' + OL + '/><circle cx="38" cy="26" r="4" fill="#8a6a48"' + OL + '/><circle cx="62" cy="26" r="4" fill="#8a6a48"' + OL + '/><ellipse cx="50" cy="46" rx="7" ry="5" fill="#b8987a"/><rect x="47" y="49" width="6" height="5" fill="#fff"' + OL + '/>' + eye(44, 36, 2.3) + eye(56, 36, 2.3) + '<circle cx="50" cy="43" r="2"' + DK + '/><ellipse cx="50" cy="66" rx="14" ry="14" fill="#a58866"/>',
    bat: '<path d="M50,44 Q30,26 6,34 Q16,40 14,50 Q22,46 28,54 Q34,48 42,56 Z M50,44 Q70,26 94,34 Q84,40 86,50 Q78,46 72,54 Q66,48 58,56 Z" fill="#5a4a6a"' + OL + '/><ellipse cx="50" cy="52" rx="9" ry="13" fill="#6a5a7a"' + OL + '/><circle cx="50" cy="38" r="8" fill="#6a5a7a"' + OL + '/><path d="M44,32 l-2,-8 l6,5z M56,32 l2,-8 l-6,5z" fill="#6a5a7a"' + OL + '/>' + eye(47, 37, 1.8) + eye(53, 37, 1.8),
    whale: '<path d="M8,52 Q10,28 46,30 Q76,32 82,50 Q88,42 96,38 Q92,52 96,66 Q86,62 80,58 Q70,74 40,72 Q10,72 8,52 Z" fill="#5a7ea6"' + OL + '/><path d="M12,58 Q30,70 60,66" fill="none" stroke="#c9d6e4" stroke-width="5" stroke-linecap="round"/>' + eye(24, 50, 2.4) + '<path d="M36,30 q0,-10 -6,-14 M36,30 q2,-10 8,-13" fill="none" stroke="#7ab8e8" stroke-width="2.5" stroke-linecap="round"/>',
    dolphin: '<path d="M6,56 Q8,46 18,46 Q40,30 70,38 L76,26 L80,40 Q90,44 94,56 L84,52 Q86,62 92,68 Q80,66 76,58 Q56,66 34,62 Q20,62 14,58 Z" fill="#7d9bb8"' + OL + '/><path d="M18,54 Q40,62 70,52" fill="none" stroke="#d6e2ee" stroke-width="4" stroke-linecap="round"/>' + eye(24, 50, 2.2),
    seal: '<path d="M14,40 Q22,30 36,36 Q60,44 80,62 Q92,70 96,62 Q94,76 80,74 Q50,80 30,70 Q14,60 14,40 Z" fill="#8a8f96"' + OL + '/><circle cx="24" cy="38" r="12" fill="#8a8f96"' + OL + '/>' + eye(22, 35, 2.4) + '<circle cx="14" cy="41" r="2.2"' + DK + '/><path d="M40,66 q-4,10 -12,10" fill="none"' + OL + ' stroke-width="3"/><path d="M8,42 h8 M8,46 h8" stroke="#555" stroke-width="1"/>',
    'polar-bear': legs4(26, 74, 60, '#ece8de', 22) + '<ellipse cx="54" cy="56" rx="30" ry="17" fill="#f2efe6"' + OL + '/><path d="M8,46 Q12,30 30,32 L36,52 Q20,56 8,46 Z" fill="#f2efe6"' + OL + '/><circle cx="26" cy="30" r="4" fill="#f2efe6"' + OL + '/><circle cx="9" cy="44" r="2.6"' + DK + '/>' + eye(22, 38, 2.2),
    camel: legs4(30, 74, 58, '#d2a868', 30) + '<path d="M26,58 Q24,40 38,40 Q44,22 52,36 Q60,22 68,38 Q80,40 80,58 Z" fill="#d9b070"' + OL + '/><path d="M28,50 Q18,40 18,24" fill="none" stroke="#d9b070" stroke-width="9" stroke-linecap="round"/><ellipse cx="12" cy="22" rx="10" ry="6" fill="#d9b070"' + OL + '/>' + eye(12, 20, 2) + '<ellipse cx="30" cy="88" rx="6" ry="3" fill="#b88f50"/><ellipse cx="74" cy="88" rx="6" ry="3" fill="#b88f50"/>',
    beaver: '<ellipse cx="82" cy="70" rx="14" ry="7" fill="#5a4636"' + OL + ' transform="rotate(-20 82 70)"/><path d="M84,66 l8,-3 M80,70 l10,-2" stroke="#3a2a20" stroke-width="1"/><ellipse cx="54" cy="62" rx="24" ry="16" fill="#8a5a36"' + OL + '/><circle cx="30" cy="50" r="14" fill="#8a5a36"' + OL + '/><circle cx="34" cy="38" r="4" fill="#8a5a36"' + OL + '/><rect x="18" y="56" width="8" height="8" fill="#f4e6b0"' + OL + '/>' + eye(26, 46, 2.3) + '<circle cx="17" cy="52" r="2.4"' + DK + '/>',
    owl: '<ellipse cx="50" cy="56" rx="26" ry="32" fill="#9a7450"' + OL + '/><ellipse cx="50" cy="66" rx="16" ry="20" fill="#d9c0a0"/><path d="M28,30 l2,-12 l10,10z M72,30 l-2,-12 l-10,10z" fill="#9a7450"' + OL + '/><circle cx="40" cy="40" r="10" fill="#fff"' + OL + '/><circle cx="60" cy="40" r="10" fill="#fff"' + OL + '/><circle cx="40" cy="40" r="5" fill="#f2b32e"/><circle cx="60" cy="40" r="5" fill="#f2b32e"/><circle cx="40" cy="40" r="2.6"' + DK + '/><circle cx="60" cy="40" r="2.6"' + DK + '/><path d="M50,46 l-4,6 h8z" fill="#e0952e"/><path d="M40,88 l-2,6 M46,88 v6 M54,88 v6 M60,88 l2,6" stroke="#e0952e" stroke-width="3" stroke-linecap="round"/>',
    robin: '<path d="M74,52 L96,44 L94,56 Z" fill="#5a4a40"' + OL + '/><ellipse cx="54" cy="54" rx="26" ry="18" fill="#6a5a50"' + OL + '/><path d="M32,56 Q34,74 56,72 Q44,62 40,50 Z" fill="#e0672e"/><circle cx="30" cy="40" r="14" fill="#5a4a40"' + OL + '/><path d="M16,40 L4,44 L16,46 Z" fill="#f2c230"' + OL + '/>' + eye(26, 37, 2.4) + '<path d="M50,72 v14 M60,72 v14 M46,86 h8 M56,86 h8" stroke="#c98a3a" stroke-width="2.5" stroke-linecap="round"/><path d="M56,46 q14,4 18,12" fill="none" stroke="#4a3a30" stroke-width="2"/>',
    penguin: '<ellipse cx="50" cy="56" rx="24" ry="34" fill="#2b2f38"' + OL + '/><ellipse cx="50" cy="62" rx="16" ry="26" fill="#fafafa"/><circle cx="50" cy="28" r="15" fill="#2b2f38"' + OL + '/><ellipse cx="50" cy="32" rx="9" ry="8" fill="#fafafa"/><path d="M47,36 h6 l-3,6z" fill="#f2a62e"' + OL + '/>' + eye(44, 28, 2) + eye(56, 28, 2) + '<path d="M26,50 q-10,16 -2,26" fill="none" stroke="#2b2f38" stroke-width="7" stroke-linecap="round"/><path d="M74,50 q10,16 2,26" fill="none" stroke="#2b2f38" stroke-width="7" stroke-linecap="round"/><ellipse cx="42" cy="91" rx="7" ry="3" fill="#f2a62e"/><ellipse cx="58" cy="91" rx="7" ry="3" fill="#f2a62e"/>',
    duck: '<ellipse cx="56" cy="62" rx="30" ry="18" fill="#f4f4f0"' + OL + '/><path d="M74,52 q16,-10 20,4 q-8,4 -20,6z" fill="#f4f4f0"' + OL + '/><circle cx="30" cy="38" r="14" fill="#2f7d4a"' + OL + '/><path d="M18,40 Q4,40 6,48 Q14,48 22,46 Z" fill="#f2a62e"' + OL + '/>' + eye(28, 34, 2.4) + '<path d="M36,50 h16" stroke="#fff" stroke-width="3"/><path d="M44,62 q14,8 28,0" fill="none"' + OL + '/><path d="M48,80 l-6,10 h12z M64,80 l-6,10 h12z" fill="#f2a62e"' + OL + '/>',
    goose: '<ellipse cx="58" cy="64" rx="28" ry="16" fill="#9a8f84"' + OL + '/><path d="M36,60 Q28,40 30,22" fill="none" stroke="#2b2b2b" stroke-width="9" stroke-linecap="round"/><ellipse cx="26" cy="20" rx="10" ry="7" fill="#2b2b2b"' + OL + '/><path d="M16,20 L6,23 L16,25z" fill="#2b2b2b"/><path d="M24,24 q4,4 10,2" fill="none" stroke="#fff" stroke-width="3"/>' + eye(22, 18, 1.8) + '<path d="M46,58 q16,8 32,0" fill="none" stroke="#6a6058" stroke-width="2"/><path d="M52,78 v10 M66,78 v10" stroke="#2b2b2b" stroke-width="3"/>',
    hawk: '<path d="M50,46 Q24,30 4,40 Q20,46 28,56 Z M50,46 Q76,30 96,40 Q80,46 72,56 Z" fill="#8a5a36"' + OL + '/><ellipse cx="50" cy="56" rx="13" ry="22" fill="#c9a07a"' + OL + '/><path d="M40,74 L50,92 L60,74 Z" fill="#b5652e"' + OL + '/><circle cx="50" cy="36" r="10" fill="#8a5a36"' + OL + '/><path d="M46,40 q4,8 8,0 q-2,6 -4,8z" fill="#f2c230"' + OL + '/>' + eye(46, 34, 1.8) + eye(54, 34, 1.8),
    heron: '<path d="M48,64 L44,96 M58,64 L62,96" stroke="#6a6a6a" stroke-width="3"/><ellipse cx="56" cy="54" rx="24" ry="13" fill="#9fb1c2"' + OL + '/><path d="M74,50 L96,58 L74,60z" fill="#7e93a6"/><path d="M38,50 Q24,40 32,24 Q36,16 30,12" fill="none" stroke="#9fb1c2" stroke-width="7" stroke-linecap="round"/><circle cx="28" cy="12" r="7" fill="#c9d6e2"' + OL + '/><path d="M22,12 L2,16 L22,15z" fill="#f2c230"' + OL + '/>' + eye(28, 10, 1.6) + '<path d="M32,8 q8,-4 14,0" fill="none" stroke="#2b2b2b" stroke-width="2"/>',
    hummingbird: '<path d="M54,40 Q64,10 84,8 Q78,30 60,46 Z" fill="#7ac0c8"' + OL + '/><ellipse cx="52" cy="52" rx="18" ry="11" fill="#2f9a6a"' + OL + '/><path d="M68,56 L88,68 L70,62z" fill="#2f7d5a"' + OL + '/><circle cx="34" cy="46" r="9" fill="#2f9a6a"' + OL + '/><path d="M26,46 L2,50" stroke="#2b2b2b" stroke-width="2.4" stroke-linecap="round"/><path d="M36,54 q6,4 12,0" fill="#d8473b"/>' + eye(33, 43, 1.8),
    hen: '<path d="M70,48 Q88,30 92,50 Q86,58 74,60 Z" fill="#c9653a"' + OL + '/><ellipse cx="54" cy="58" rx="26" ry="20" fill="#e8d6b8"' + OL + '/><circle cx="32" cy="38" r="12" fill="#e8d6b8"' + OL + '/><path d="M26,28 q2,-8 6,-2 q2,-8 6,0 q4,-4 4,4z" fill="#d8473b"' + OL + '/><path d="M20,40 L12,43 L20,46z" fill="#f2a62e"' + OL + '/><path d="M24,46 q2,8 6,2z" fill="#d8473b"/>' + eye(30, 36, 2.2) + '<path d="M48,78 v12 M60,78 v12" stroke="#f2a62e" stroke-width="3"/><path d="M48,56 q12,10 22,0" fill="none"' + OL + '/>',
    fish: '<path d="M70,50 L94,32 L90,50 L94,68 Z" fill="#e8932e"' + OL + '/><ellipse cx="46" cy="50" rx="30" ry="18" fill="#f2a43e"' + OL + '/><path d="M40,34 q10,-10 22,-2" fill="#e8932e"' + OL + '/><path d="M30,38 q-4,12 0,24" fill="none"' + OL + '/>' + eye(24, 46, 3) + '<path d="M44,46 q6,4 0,8 M54,44 q6,6 0,12" fill="none" stroke="#c96a1e" stroke-width="1.6"/>',
    shark: '<path d="M4,56 Q20,40 50,40 L58,20 L66,42 Q84,46 88,52 L98,34 L96,56 L98,76 L86,60 Q60,70 30,66 Q12,64 4,56 Z" fill="#7d8b99"' + OL + '/><path d="M8,58 Q30,66 60,62" fill="none" stroke="#e4e8ec" stroke-width="5" stroke-linecap="round"/>' + eye(20, 50, 2.2) + '<path d="M30,50 v6 M34,49 v7 M38,49 v7" stroke="#5a6672" stroke-width="1.4"/><path d="M50,64 l-8,12 l14,-8z" fill="#7d8b99"' + OL + '/>',
    frog: '<ellipse cx="50" cy="62" rx="30" ry="18" fill="#5aa04a"' + OL + '/><path d="M20,70 q-12,8 -6,18 h16 M80,70 q12,8 6,18 h-16" fill="#4e8f40"' + OL + '/><circle cx="36" cy="42" r="10" fill="#5aa04a"' + OL + '/><circle cx="64" cy="42" r="10" fill="#5aa04a"' + OL + '/><circle cx="36" cy="41" r="5" fill="#fff"/><circle cx="64" cy="41" r="5" fill="#fff"/><circle cx="36" cy="41" r="2.8"' + DK + '/><circle cx="64" cy="41" r="2.8"' + DK + '/><path d="M34,62 q16,10 32,0" fill="none"' + OL + '/><path d="M36,80 l-6,8 M64,80 l6,8" stroke="#4e8f40" stroke-width="5" stroke-linecap="round"/>',
    salamander: '<path d="M10,52 Q30,40 50,50 Q70,60 96,48 Q76,66 52,62 Q30,58 14,62 Z" fill="#e0672e"' + OL + '/><ellipse cx="18" cy="54" rx="12" ry="8" fill="#e0672e"' + OL + '/>' + eye(14, 51, 2) + '<path d="M30,58 l-6,12 M44,60 l-4,12 M60,60 l4,12 M72,58 l8,10 M30,48 l-6,-10 M58,54 l6,-10" stroke="#e0672e" stroke-width="4" stroke-linecap="round"/><circle cx="36" cy="52" r="2.5" fill="#f2c230"/><circle cx="52" cy="55" r="2.5" fill="#f2c230"/><circle cx="66" cy="56" r="2.5" fill="#f2c230"/>',
    tadpole: '<path d="M44,50 Q66,30 96,46 Q70,46 66,52 Q72,58 96,58 Q66,72 44,54 Z" fill="#6a7a5a"' + OL + '/><ellipse cx="34" cy="52" rx="20" ry="16" fill="#5a6a4a"' + OL + '/>' + eye(24, 48, 2.6),
    snake: '<path d="M14,70 Q14,50 34,52 Q54,54 56,40 Q58,24 40,22 Q26,22 30,32" fill="none" stroke="#5a9a3a" stroke-width="12" stroke-linecap="round"/><path d="M14,70 Q14,86 40,82 Q70,78 86,82" fill="none" stroke="#5a9a3a" stroke-width="12" stroke-linecap="round"/><ellipse cx="30" cy="30" rx="10" ry="7" fill="#5a9a3a"' + OL + '/><path d="M20,30 l-8,2 l-2,-3 M12,32 l-2,3" stroke="#d8473b" stroke-width="1.6"/>' + eye(30, 27, 2) + '<path d="M40,52 l4,-6 M60,82 l4,-6 M24,62 l6,-2" stroke="#3a7a2a" stroke-width="2"/>',
    turtle: '<ellipse cx="22" cy="58" rx="12" ry="9" fill="#8ab060"' + OL + '/>' + eye(18, 55, 2.2) + '<path d="M30,68 l-6,12 M70,68 l6,12 M40,70 v10 M60,70 v10" stroke="#8ab060" stroke-width="7" stroke-linecap="round"/><path d="M84,64 l10,4" stroke="#8ab060" stroke-width="5" stroke-linecap="round"/><path d="M26,68 Q28,32 54,32 Q82,32 84,68 Z" fill="#6a8a3a"' + OL + '/><path d="M42,40 l12,-4 l12,4 l2,14 l-14,6 l-14,-6z M30,60 l12,-6 M78,60 l-12,-6 M54,60 v8" fill="none" stroke="#4a6a2a" stroke-width="2"/>',
    lizard: '<path d="M60,54 Q80,58 96,74" fill="none" stroke="#7aa63a" stroke-width="6" stroke-linecap="round"/><ellipse cx="48" cy="52" rx="20" ry="9" fill="#8ab84a"' + OL + '/><path d="M8,50 Q16,40 30,46 L32,56 Q18,60 8,50 Z" fill="#8ab84a"' + OL + '/>' + eye(20, 47, 2) + '<path d="M36,58 l-8,14 l-4,0 M58,58 l6,14 l4,0 M38,46 l-8,-12 l-4,0 M58,46 l6,-12 l4,0" fill="none" stroke="#7aa63a" stroke-width="4" stroke-linecap="round"/><path d="M40,50 h16" stroke="#5a8a2a" stroke-width="2" stroke-dasharray="3 3"/>',
    crocodile: '<path d="M4,52 L36,46 Q60,42 80,50 L98,58 L80,62 Q60,68 36,62 L4,58 Z" fill="#4e7a3a"' + OL + '/><path d="M6,54 h28" stroke="#2f4f22" stroke-width="1.4"/><path d="M8,52 l3,-3 l3,3 l3,-3 l3,3 l3,-3 l3,3" fill="none" stroke="#fff" stroke-width="1.4"/>' + eye(32, 44, 2.4) + '<path d="M40,62 l-4,12 M70,62 l4,12" stroke="#4e7a3a" stroke-width="6" stroke-linecap="round"/><path d="M44,46 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4" fill="none" stroke="#2f4f22" stroke-width="2"/>',
    butterfly: '<path d="M50,48 Q30,8 10,22 Q4,42 48,52 Z M50,48 Q70,8 90,22 Q96,42 52,52 Z" fill="#f2a43e"' + OL + '/><path d="M48,54 Q20,60 22,80 Q36,86 49,58 Z M52,54 Q80,60 78,80 Q64,86 51,58 Z" fill="#e8742e"' + OL + '/><circle cx="26" cy="28" r="5" fill="#2b2b2b"/><circle cx="74" cy="28" r="5" fill="#2b2b2b"/><circle cx="32" cy="72" r="3.5" fill="#fff"/><circle cx="68" cy="72" r="3.5" fill="#fff"/><ellipse cx="50" cy="54" rx="4" ry="18" fill="#3a3030"' + OL + '/><path d="M48,38 q-6,-12 -12,-14 M52,38 q6,-12 12,-14" fill="none"' + OL + '/>',
    caterpillar: '<circle cx="84" cy="56" r="11" fill="#5aa04a"' + OL + '/><circle cx="70" cy="60" r="10" fill="#7ac05a"' + OL + '/><circle cx="56" cy="62" r="10" fill="#5aa04a"' + OL + '/><circle cx="42" cy="62" r="10" fill="#7ac05a"' + OL + '/><circle cx="28" cy="58" r="10" fill="#5aa04a"' + OL + '/><circle cx="16" cy="50" r="11" fill="#7ac05a"' + OL + '/>' + eye(12, 47, 2.2) + '<path d="M14,40 l-4,-10 M20,40 l4,-10" stroke="#3a3030" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="30" r="2"' + DK + '/><circle cx="24" cy="30" r="2"' + DK + '/><path d="M28,68 v6 M42,72 v6 M56,72 v6 M70,70 v6" stroke="#3a3030" stroke-width="2.5" stroke-linecap="round"/>',
    bee: '<ellipse cx="38" cy="30" rx="16" ry="11" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(-20 38 30)"/><ellipse cx="60" cy="28" rx="16" ry="11" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(20 60 28)"/><ellipse cx="54" cy="56" rx="28" ry="18" fill="#f2c230"' + OL + '/><path d="M44,40 q-4,16 0,32 M58,38 q-4,18 0,36 M72,44 q-3,12 0,24" fill="none" stroke="#2b2b2b" stroke-width="6"/><path d="M82,56 l10,0" stroke="#2b2b2b" stroke-width="3"/><circle cx="26" cy="54" r="11" fill="#2b2b2b"' + OL + '/><circle cx="22" cy="52" r="2.4" fill="#fff"/><path d="M22,44 q-6,-10 -12,-10 M28,44 q0,-12 6,-14" fill="none"' + OL + '/>',
    ant: sixLegs(50, 60, 18) + '<ellipse cx="74" cy="56" rx="16" ry="12" fill="#6a2a20"' + OL + '/><ellipse cx="50" cy="58" rx="9" ry="7" fill="#7a3428"' + OL + '/><circle cx="28" cy="52" r="10" fill="#7a3428"' + OL + '/><path d="M24,44 q-6,-12 -14,-12 M30,43 q2,-12 10,-14" fill="none"' + OL + '/><circle cx="24" cy="50" r="2" fill="#fff"/>',
    ladybug: sixLegs(52, 64, 22) + '<circle cx="52" cy="58" r="28" fill="#d8473b"' + OL + '/><path d="M52,30 v56" stroke="#2b2b2b" stroke-width="2.5"/><path d="M28,40 Q52,26 76,40 L74,36 Q52,20 30,36 Z" fill="#2b2b2b"/><circle cx="52" cy="28" r="11" fill="#2b2b2b"' + OL + '/><circle cx="47" cy="25" r="2.4" fill="#fff"/><circle cx="57" cy="25" r="2.4" fill="#fff"/><circle cx="38" cy="54" r="5"' + DK + '/><circle cx="66" cy="54" r="5"' + DK + '/><circle cx="40" cy="72" r="4.5"' + DK + '/><circle cx="64" cy="72" r="4.5"' + DK + '/>',
    dragonfly: '<ellipse cx="28" cy="28" rx="7" ry="21" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(-14 28 46)"/><ellipse cx="28" cy="72" rx="7" ry="21" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(14 28 54)"/><ellipse cx="42" cy="29" rx="6.5" ry="20" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(14 42 46)"/><ellipse cx="42" cy="71" rx="6.5" ry="20" fill="#d6ecf7" opacity=".9"' + OL + ' transform="rotate(-14 42 54)"/><rect x="38" y="46.5" width="56" height="7" rx="3.5" fill="#3a78c8"' + OL + '/><path d="M50,47 v6 M60,47 v6 M70,47 v6 M80,47 v6" stroke="#24508a" stroke-width="1.4"/><ellipse cx="32" cy="50" rx="10" ry="7.5" fill="#2f9a8a"' + OL + '/><circle cx="16" cy="50" r="8" fill="#2f9a8a"' + OL + '/><circle cx="13" cy="44.5" r="4.2"' + DK + '/><circle cx="13" cy="55.5" r="4.2"' + DK + '/><circle cx="14" cy="43.4" r="1.3" fill="#fff"/><circle cx="14" cy="54.4" r="1.3" fill="#fff"/>',
    grasshopper: '<path d="M60,54 L84,30 L96,70" fill="none" stroke="#6aa63a" stroke-width="5" stroke-linejoin="round"/><ellipse cx="54" cy="56" rx="34" ry="10" fill="#7ab84a"' + OL + '/><path d="M34,50 Q60,40 82,52" fill="#5a9a3a"' + OL + '/><ellipse cx="18" cy="52" rx="12" ry="10" fill="#7ab84a"' + OL + '/>' + eye(14, 49, 2.6) + '<path d="M12,44 q-6,-18 4,-30 M18,43 q4,-18 16,-26" fill="none"' + OL + '/><path d="M30,62 l-6,14 M44,64 l-2,14" stroke="#6aa63a" stroke-width="3" stroke-linecap="round"/>',
    spider: (function () { var s = ''; [-1, 1].forEach(function (d) { [0, 1, 2, 3].forEach(function (i) { var y = 46 + i * 6; s += '<path d="M50,' + y + ' q' + d * 18 + ',' + (-14 + i * 6) + ' ' + d * 36 + ',' + (-4 + i * 12) + '" fill="none"' + OL + ' stroke-width="3"/>'; }); }); return s; })() + '<ellipse cx="50" cy="64" rx="15" ry="14" fill="#3a3030"' + OL + '/><circle cx="50" cy="44" r="9" fill="#4a4040"' + OL + '/><circle cx="46" cy="42" r="2" fill="#fff"/><circle cx="54" cy="42" r="2" fill="#fff"/><circle cx="48" cy="38" r="1.3" fill="#fff"/><circle cx="52" cy="38" r="1.3" fill="#fff"/>',
    worm: '<path d="M8,64 Q20,40 36,56 Q52,72 66,52 Q78,36 92,48" fill="none" stroke="#c9707a" stroke-width="12" stroke-linecap="round"/><path d="M50,62 l4,-6" stroke="#a8505a" stroke-width="5" stroke-linecap="round"/>' + eye(88, 46, 1.8) + '<path d="M20,52 l3,4 M30,52 l-2,5 M64,56 l4,3 M74,44 l2,5" stroke="#a8505a" stroke-width="1.6"/>',
    snail: '<path d="M6,76 Q10,66 26,66 L84,66 Q94,66 94,76 Z" fill="#b8a07a"' + OL + '/><path d="M20,66 Q14,50 18,40" fill="none" stroke="#b8a07a" stroke-width="8" stroke-linecap="round"/><path d="M14,42 l-6,-10 M22,40 l2,-12" stroke="#b8a07a" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="32" r="2.4"' + DK + '/><circle cx="24" cy="28" r="2.4"' + DK + '/><circle cx="58" cy="44" r="24" fill="#c9783a"' + OL + '/><path d="M58,44 m-14,0 a14,14 0 1,1 14,14 a9,9 0 1,1 -9,-9 a4,4 0 1,1 4,4" fill="none" stroke="#8a4a20" stroke-width="2.5"/>',
    crab: '<path d="M30,60 l-16,10 l-6,12 M34,66 l-12,14 M66,66 l12,14 M70,60 l16,10 l6,12" fill="none" stroke="#d8473b" stroke-width="4" stroke-linecap="round"/><path d="M34,46 L18,30 M66,46 L82,30" stroke="#d8473b" stroke-width="5" stroke-linecap="round"/><path d="M10,28 Q12,14 24,18 L18,26 L26,28 Q20,36 10,28 Z M90,28 Q88,14 76,18 L82,26 L74,28 Q80,36 90,28 Z" fill="#e05a3b"' + OL + '/><ellipse cx="50" cy="58" rx="24" ry="16" fill="#e05a3b"' + OL + '/><path d="M44,44 v-10 M56,44 v-10" stroke="#d8473b" stroke-width="2.5"/><circle cx="44" cy="33" r="3"' + DK + '/><circle cx="56" cy="33" r="3"' + DK + '/>',
    krill: '<path d="M14,56 Q30,30 62,36 Q86,40 92,56 Q72,52 62,58 Q40,66 14,56 Z" fill="#f29a8a"' + OL + ' opacity=".95"/><path d="M92,56 l6,-8 M92,56 l6,6" stroke="#e07a6a" stroke-width="2.5"/><path d="M30,58 v12 M40,60 v12 M50,60 v12 M60,58 v12" stroke="#e07a6a" stroke-width="2"/><path d="M18,48 Q4,30 2,20 M22,46 Q12,26 14,14" fill="none" stroke="#e07a6a" stroke-width="1.6"/>' + eye(24, 46, 2.4) + '<path d="M44,40 v16 M56,38 v18 M68,40 v16" stroke="#e07a6a" stroke-width="1.4"/>',
    jellyfish: '<path d="M18,50 Q18,16 50,16 Q82,16 82,50 Q74,46 66,52 Q58,46 50,52 Q42,46 34,52 Q26,46 18,50 Z" fill="#c9a0e8"' + OL + ' opacity=".95"/><path d="M28,52 q-6,14 2,26 q6,10 -2,18 M42,52 q-4,16 2,30 M58,52 q4,16 -2,30 M72,52 q6,14 -2,26 q-6,10 2,18" fill="none" stroke="#b07ad8" stroke-width="3" stroke-linecap="round"/>' + eye(40, 36, 2) + eye(60, 36, 2),
    starfish: '<path d="M50,8 L61,38 L94,38 L67,57 L77,90 L50,70 L23,90 L33,57 L6,38 L39,38 Z" fill="#e8742e"' + OL + ' stroke-linejoin="round"/><circle cx="50" cy="30" r="2.4" fill="#f2c230"/><circle cx="70" cy="44" r="2.4" fill="#f2c230"/><circle cx="62" cy="68" r="2.4" fill="#f2c230"/><circle cx="38" cy="68" r="2.4" fill="#f2c230"/><circle cx="30" cy="44" r="2.4" fill="#f2c230"/><circle cx="50" cy="50" r="5" fill="#f2a43e"/>',
    // plants and fungi
    tree: '<rect x="42" y="56" width="16" height="38" rx="3" fill="#8a6440"' + OL + '/><path d="M50,64 l-12,-10 M50,70 l12,-12" stroke="#8a6440" stroke-width="4"/><circle cx="50" cy="34" r="26" fill="#5aa04a"' + OL + '/><circle cx="28" cy="48" r="16" fill="#4e9442"' + OL + '/><circle cx="72" cy="48" r="16" fill="#4e9442"' + OL + '/><circle cx="40" cy="30" r="3.4" fill="#a8703f"/><circle cx="62" cy="40" r="3.4" fill="#a8703f"/><circle cx="30" cy="50" r="3.4" fill="#a8703f"/>',
    pine: '<rect x="44" y="76" width="12" height="18" fill="#8a6440"' + OL + '/><path d="M50,6 L72,36 L62,36 L80,58 L66,58 L86,80 L14,80 L34,58 L20,58 L38,36 L28,36 Z" fill="#2f7d3a"' + OL + ' stroke-linejoin="round"/>',
    maple: '<path d="M44,62 Q20,40 26,14 Q44,20 50,56 Z" fill="#c9a060"' + OL + '/><path d="M56,62 Q80,40 74,14 Q56,20 50,56 Z" fill="#c9a060"' + OL + '/><path d="M30,20 q12,14 18,34 M70,20 q-12,14 -18,34" fill="none" stroke="#a88040" stroke-width="1.4"/><ellipse cx="44" cy="62" rx="8" ry="6" fill="#9a7040"' + OL + '/><ellipse cx="56" cy="62" rx="8" ry="6" fill="#9a7040"' + OL + '/>',
    flower: '<path d="M50,52 V94" stroke="#3f8f3a" stroke-width="5"/><path d="M50,76 Q30,62 22,74 Q36,82 50,76 Z M50,84 Q70,70 78,82 Q64,90 50,84 Z" fill="#5aa04a"' + OL + '/>' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="50" cy="20" rx="10" ry="16" fill="#e86a9a"' + OL + ' transform="rotate(' + a + ' 50 36)"/>'; }).join('') + '<circle cx="50" cy="36" r="9" fill="#f2c230"' + OL + '/>',
    sunflower: '<path d="M50,56 V96" stroke="#3f8f3a" stroke-width="6"/><path d="M50,80 Q28,64 18,78 Q34,88 50,80 Z" fill="#5aa04a"' + OL + '/>' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<ellipse cx="50" cy="12" rx="6" ry="13" fill="#f2c230"' + OL + ' transform="rotate(' + a + ' 50 34)"/>'; }).join('') + '<circle cx="50" cy="34" r="13" fill="#6a4a2a"' + OL + '/><circle cx="46" cy="30" r="1.6" fill="#a87a4a"/><circle cx="54" cy="32" r="1.6" fill="#a87a4a"/><circle cx="48" cy="38" r="1.6" fill="#a87a4a"/>',
    grass: '<path d="M8,94 Q12,60 6,34 Q20,60 20,94 M20,94 Q24,50 34,20 Q32,60 32,94 M32,94 Q40,56 30,40 Q46,60 44,94 M44,94 Q50,46 64,16 Q58,60 56,94 M56,94 Q66,60 60,40 Q74,62 68,94 M68,94 Q74,54 90,30 Q82,64 80,94 M80,94 Q88,64 96,52 Q94,74 92,94 Z" fill="#6ab04a"' + OL + ' stroke-linejoin="round"/>',
    cactus: '<path d="M38,94 V30 Q38,14 50,14 Q62,14 62,30 V94 Z" fill="#5a9a4a"' + OL + '/><path d="M38,58 H26 Q18,58 18,48 V36 Q18,30 24,30 Q30,30 30,36 V46 H38 M62,50 H74 Q82,50 82,40 V30 Q82,24 76,24 Q70,24 70,30 V38 H62" fill="#5a9a4a"' + OL + '/><path d="M50,22 v66 M44,30 v58 M56,30 v58" stroke="#3f7a32" stroke-width="1.4"/><path d="M38,40 l-5,-2 M62,66 l5,-2 M38,74 l-5,1 M62,34 l5,-3" stroke="#2b2b2b" stroke-width="1.2"/><circle cx="50" cy="12" r="5" fill="#e86a9a"' + OL + '/><path d="M30,94 H70" stroke="#c9a060" stroke-width="4"/>',
    fern: '<path d="M50,94 Q46,50 30,10" fill="none" stroke="#3f8f3a" stroke-width="3"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var y = 84 - i * 9.5, x = 49 - i * 2.4, L = 26 - i * 2.4; return '<path d="M' + x + ',' + y + ' q' + (-L * 0.6) + ',' + (-6) + ' ' + (-L) + ',' + (-2) + ' q' + (L * 0.5) + ',' + 6 + ' ' + L + ',' + 2 + 'z M' + x + ',' + y + ' q' + (L * 0.6) + ',' + (-8) + ' ' + L + ',' + (-6) + ' q' + (-L * 0.4) + ',' + 7 + ' ' + (-L) + ',' + 6 + 'z" fill="#5aa04a"' + OL + ' stroke-width="1.2"/>'; }).join(''),
    algae: '<rect x="4" y="4" width="92" height="92" rx="14" fill="#cfe9f2"/>' + [[22, 28, 8], [44, 20, 6], [70, 32, 9], [30, 56, 7], [58, 54, 10], [80, 66, 6], [20, 80, 9], [50, 78, 7], [76, 86, 5]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#5aa04a"' + OL + ' stroke-width="1.4"/><circle cx="' + (c[0] - c[2] * 0.3) + '" cy="' + (c[1] - c[2] * 0.3) + '" r="' + (c[2] * 0.3) + '" fill="#8ad06a"/>'; }).join(''),
    dandelion: '<path d="M50,50 V96" stroke="#5a9a4a" stroke-width="3"/>' + (function () { var s = ''; for (var i = 0; i < 18; i++) { var a = i * 20 * M.PI / 180, x = 50 + M.cos(a) * 30, y = 34 + M.sin(a) * 30; s += '<path d="M50,34 L' + x.toFixed(1) + ',' + y.toFixed(1) + '" stroke="#b8b8b8" stroke-width="1"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="#f4f4f4" stroke="#b8b8b8" stroke-width="0.8"/>'; } return s; })() + '<circle cx="50" cy="34" r="5" fill="#a8a070"' + OL + '/><path d="M80,12 l10,-6 M84,20 l12,-4" stroke="#b8b8b8" stroke-width="1"/><circle cx="91" cy="5" r="2.5" fill="#f4f4f4" stroke="#b8b8b8" stroke-width=".8"/>',
    burr: (function () { var s = ''; for (var i = 0; i < 24; i++) { var a = i * 15 * M.PI / 180; s += '<path d="M' + (50 + M.cos(a) * 20).toFixed(1) + ',' + (50 + M.sin(a) * 20).toFixed(1) + ' L' + (50 + M.cos(a) * 36).toFixed(1) + ',' + (50 + M.sin(a) * 36).toFixed(1) + ' l' + (M.cos(a + 2) * 4).toFixed(1) + ',' + (M.sin(a + 2) * 4).toFixed(1) + '" fill="none" stroke="#8a7a40" stroke-width="2"/>'; } return s; })() + '<circle cx="50" cy="50" r="22" fill="#a89a50"' + OL + '/>',
    coconut: '<ellipse cx="50" cy="54" rx="34" ry="30" fill="#8a5a30"' + OL + '/><path d="M24,42 Q50,30 76,42" fill="none" stroke="#6a4020" stroke-width="2"/><circle cx="42" cy="50" r="4" fill="#4a2a10"/><circle cx="58" cy="50" r="4" fill="#4a2a10"/><circle cx="50" cy="62" r="4" fill="#4a2a10"/><path d="M8,90 q20,-8 42,0 t42,0" fill="none" stroke="#5aa0d8" stroke-width="4"/>',
    peapod: '<path d="M8,60 Q30,28 70,30 Q92,32 94,44 Q70,72 30,70 Q14,70 8,60 Z" fill="#7ac05a"' + OL + '/><circle cx="30" cy="56" r="8" fill="#5aa04a"' + OL + '/><circle cx="48" cy="50" r="9" fill="#5aa04a"' + OL + '/><circle cx="66" cy="45" r="8" fill="#5aa04a"' + OL + '/><path d="M94,44 q4,-12 -4,-20" fill="none" stroke="#5a9a3a" stroke-width="3"/>',
    seed: '<ellipse cx="50" cy="56" rx="26" ry="20" fill="#c9a070"' + OL + '/><path d="M30,52 Q50,40 70,52" fill="none" stroke="#a87a4a" stroke-width="2"/><ellipse cx="62" cy="62" rx="5" ry="3" fill="#8a5a30"/><path d="M14,88 Q50,80 86,88" fill="none" stroke="#8a6440" stroke-width="3"/>',
    sprout: '<path d="M8,80 H92 V96 H8 Z" fill="#8a6440"/><path d="M50,80 V44" stroke="#5aa04a" stroke-width="5"/><path d="M50,48 Q26,22 14,40 Q30,52 50,48 Z M50,44 Q72,16 86,32 Q72,46 50,44 Z" fill="#7ac05a"' + OL + '/><path d="M50,80 q-8,8 -16,10 M50,80 q6,8 14,12 M50,82 v10" fill="none" stroke="#e8e0c0" stroke-width="2"/>',
    carrot: '<path d="M30,30 L70,30 L52,96 Z" fill="#f08a2e"' + OL + ' stroke-linejoin="round"/><path d="M38,44 h10 M58,54 h-8 M44,66 h8 M54,78 h-6" stroke="#c96a1e" stroke-width="2"/><path d="M50,30 Q40,10 30,6 M50,30 Q50,8 54,2 M50,30 Q60,12 72,8" fill="none" stroke="#5aa04a" stroke-width="5" stroke-linecap="round"/>',
    potato: '<path d="M14,54 Q12,30 40,28 Q62,24 80,34 Q94,44 88,62 Q80,78 50,76 Q18,76 14,54 Z" fill="#c9a06a"' + OL + '/><circle cx="34" cy="44" r="2.4" fill="#8a6a3a"/><circle cx="60" cy="40" r="2.4" fill="#8a6a3a"/><circle cx="72" cy="60" r="2.4" fill="#8a6a3a"/><circle cx="44" cy="62" r="2.4" fill="#8a6a3a"/><path d="M60,40 q4,-8 10,-10" fill="none" stroke="#7ac05a" stroke-width="2"/>',
    celery: '<path d="M30,94 Q26,50 34,30 L44,30 Q40,60 42,94 Z M44,94 Q42,50 48,28 L58,28 Q54,60 56,94 Z M58,94 Q58,54 64,32 L74,32 Q68,60 70,94 Z" fill="#9ad06a"' + OL + '/><path d="M36,30 Q24,10 30,4 Q40,8 40,28 M52,28 Q48,6 56,2 Q62,10 56,28 M68,32 Q74,10 82,10 Q82,22 70,32" fill="#5aa04a"' + OL + '/>',
    lettuce: '<path d="M14,62 Q8,40 28,34 Q30,16 50,18 Q70,16 72,34 Q92,40 86,62 Q80,84 50,84 Q20,84 14,62 Z" fill="#8ad06a"' + OL + '/><path d="M24,58 Q36,40 50,52 Q64,40 76,58 Q60,70 50,62 Q40,70 24,58 Z" fill="#6ab04a"' + OL + '/><path d="M50,84 V52" stroke="#c8e8a0" stroke-width="3"/>',
    broccoli: '<path d="M42,94 L44,60 L56,60 L58,94 Z" fill="#9ad06a"' + OL + '/><circle cx="34" cy="44" r="16" fill="#3f8f3a"' + OL + '/><circle cx="66" cy="44" r="16" fill="#3f8f3a"' + OL + '/><circle cx="50" cy="30" r="18" fill="#4e9a42"' + OL + '/><circle cx="44" cy="26" r="3" fill="#2f7d3a"/><circle cx="56" cy="34" r="3" fill="#2f7d3a"/><circle cx="30" cy="44" r="3" fill="#2f7d3a"/><circle cx="68" cy="46" r="3" fill="#2f7d3a"/>',
    apple: '<path d="M50,30 Q30,16 16,36 Q6,62 26,84 Q38,96 50,88 Q62,96 74,84 Q94,62 84,36 Q70,16 50,30 Z" fill="#d8473b"' + OL + '/><path d="M50,30 Q50,16 56,8" fill="none" stroke="#6a4020" stroke-width="4" stroke-linecap="round"/><path d="M54,18 Q70,8 78,18 Q66,26 54,18 Z" fill="#5aa04a"' + OL + '/><ellipse cx="32" cy="46" rx="5" ry="9" fill="#f08a80" opacity=".7"/>',
    tomato: '<circle cx="50" cy="56" r="34" fill="#e0412e"' + OL + '/><path d="M50,24 l-14,-6 l8,10 l-14,4 l14,2 l6,8 l6,-8 l14,-2 l-14,-4 l8,-10z" fill="#4e9a42"' + OL + '/><ellipse cx="34" cy="48" rx="6" ry="9" fill="#f08a80" opacity=".6"/>',
    corn: '<path d="M50,8 Q70,14 70,52 Q70,86 50,94 Q30,86 30,52 Q30,14 50,8 Z" fill="#f2c230"' + OL + '/>' + (function () { var s = ''; for (var r = 0; r < 8; r++) for (var c = -1; c <= 1; c++) s += '<circle cx="' + (50 + c * 9) + '" cy="' + (22 + r * 9) + '" r="3.6" fill="#f8d860" stroke="#d8a020" stroke-width="1"/>'; return s; })() + '<path d="M50,94 Q22,80 18,40 Q32,62 44,88 M50,94 Q78,80 82,40 Q68,62 56,88" fill="#6ab04a"' + OL + '/>',
    pumpkin: '<path d="M50,30 Q50,18 58,12" fill="none" stroke="#5a7a30" stroke-width="5" stroke-linecap="round"/><ellipse cx="30" cy="60" rx="20" ry="28" fill="#e8742e"' + OL + '/><ellipse cx="70" cy="60" rx="20" ry="28" fill="#e8742e"' + OL + '/><ellipse cx="50" cy="60" rx="18" ry="30" fill="#f08a3e"' + OL + '/>',
    mushroom: '<path d="M38,58 L36,92 Q50,96 64,92 L62,58 Z" fill="#f2ead8"' + OL + '/><path d="M8,58 Q8,14 50,14 Q92,14 92,58 Q50,66 8,58 Z" fill="#d8473b"' + OL + '/><circle cx="32" cy="36" r="6" fill="#fff"/><circle cx="56" cy="26" r="5" fill="#fff"/><circle cx="72" cy="44" r="6" fill="#fff"/><circle cx="46" cy="48" r="4" fill="#fff"/>',
    // once living
    log: '<rect x="10" y="40" width="74" height="34" rx="6" fill="#8a6440"' + OL + '/><ellipse cx="84" cy="57" rx="10" ry="17" fill="#c9a070"' + OL + '/><ellipse cx="84" cy="57" rx="6" ry="10" fill="none" stroke="#8a6440" stroke-width="1.6"/><ellipse cx="84" cy="57" rx="2" ry="4" fill="#8a6440"/><path d="M18,50 h30 M30,62 h40 M20,68 h18" stroke="#6a4a2a" stroke-width="2"/><path d="M40,40 q2,-12 12,-14" fill="none" stroke="#6a4a2a" stroke-width="3"/>',
    leaf: '<path d="M16,84 Q10,30 60,14 Q92,8 88,20 Q84,70 30,82 Z" fill="#c9783a"' + OL + '/><path d="M16,84 Q50,50 84,18 M36,62 l-4,-18 M52,46 l-2,-20 M44,56 l18,2 M60,38 l16,4" fill="none" stroke="#8a4a20" stroke-width="2"/><path d="M60,40 q6,6 2,12" fill="none" stroke="#6a3a18" stroke-width="2"/>',
    shell: '<path d="M50,88 L14,40 Q20,12 50,10 Q80,12 86,40 Z" fill="#f2c9a8"' + OL + ' stroke-linejoin="round"/><path d="M50,88 L26,20 M50,88 L40,12 M50,88 L60,12 M50,88 L74,20 M50,88 L18,40 M50,88 L82,40" stroke="#d89a78" stroke-width="2"/><path d="M38,84 h24 v8 h-24z" fill="#e8b898"' + OL + '/>',
    feather: '<path d="M80,10 Q40,10 22,60 Q16,76 14,92 Q30,70 44,64 Q78,50 80,10 Z" fill="#9ab8d8"' + OL + '/><path d="M14,92 Q40,46 80,10" fill="none" stroke="#5a7898" stroke-width="2"/><path d="M40,50 l-10,-4 M50,40 l-8,-8 M60,30 l-4,-10 M36,58 l12,0 M48,48 l12,2" stroke="#5a7898" stroke-width="1.4"/>',
    core: '<path d="M36,22 Q28,30 38,40 Q44,50 38,62 Q28,74 36,84 L64,84 Q72,74 62,62 Q56,50 62,40 Q72,30 64,22 Z" fill="#f4ecc8"' + OL + '/><path d="M36,22 Q50,14 64,22 M36,84 Q50,92 64,84" fill="#d8473b"' + OL + '/><path d="M50,20 Q50,10 56,6" fill="none" stroke="#6a4020" stroke-width="3"/><ellipse cx="46" cy="52" rx="3" ry="5" fill="#4a2a10"/><ellipse cx="55" cy="54" rx="3" ry="5" fill="#4a2a10"/>',
    chair: '<rect x="28" y="10" width="44" height="40" rx="4" fill="#b8865a"' + OL + '/><path d="M34,20 h32 M34,30 h32 M34,40 h32" stroke="#8a6440" stroke-width="2"/><rect x="22" y="50" width="56" height="10" rx="2" fill="#a8764a"' + OL + '/><path d="M28,60 V94 M72,60 V94 M30,80 H70" stroke="#8a6440" stroke-width="6" stroke-linecap="round"/>',
    paper: '<path d="M22,8 H66 L80,22 V92 H22 Z" fill="#fafaf6"' + OL + '/><path d="M66,8 V22 H80" fill="#e8e8e0"' + OL + '/><path d="M32,34 H70 M32,46 H70 M32,58 H70 M32,70 H58" stroke="#a8b8c8" stroke-width="2.4"/>',
    bone: '<path d="M30,40 L70,60" stroke="#f2ead8" stroke-width="14" stroke-linecap="round"/><circle cx="24" cy="32" r="9" fill="#f2ead8"' + OL + '/><circle cx="18" cy="44" r="9" fill="#f2ead8"' + OL + '/><circle cx="76" cy="68" r="9" fill="#f2ead8"' + OL + '/><circle cx="82" cy="56" r="9" fill="#f2ead8"' + OL + '/><path d="M30,34 L76,58 M24,46 L70,70" stroke="#c9b898" stroke-width="2"/>',
    // never living
    rock: '<path d="M8,82 Q4,58 22,46 Q30,24 54,26 Q80,24 90,48 Q98,68 88,84 Z" fill="#9aa0a6"' + OL + '/><path d="M30,52 q12,-8 22,0 M60,40 q10,4 14,14 M40,70 q10,4 20,0" fill="none" stroke="#7a8086" stroke-width="2.4"/><ellipse cx="34" cy="40" rx="6" ry="3" fill="#c0c6cc"/>',
    cloud: '<path d="M18,74 Q2,72 6,56 Q10,42 26,46 Q28,24 50,24 Q70,24 74,42 Q94,40 96,58 Q96,74 80,74 Z" fill="#f4f6fa"' + OL + '/><path d="M24,82 l-4,8 M44,82 l-4,8 M64,82 l-4,8" stroke="#5aa0d8" stroke-width="3" stroke-linecap="round"/>',
    sun: (function () { var s = ''; for (var i = 0; i < 12; i++) { var a = i * 30 * M.PI / 180; s += '<path d="M' + (50 + M.cos(a) * 30).toFixed(1) + ',' + (50 + M.sin(a) * 30).toFixed(1) + ' L' + (50 + M.cos(a) * 44).toFixed(1) + ',' + (50 + M.sin(a) * 44).toFixed(1) + '" stroke="#f2a62e" stroke-width="5" stroke-linecap="round"/>'; } return s; })() + '<circle cx="50" cy="50" r="24" fill="#f6c445"' + OL + '/>',
    fire: '<path d="M50,8 Q60,30 74,38 Q90,56 80,76 Q70,94 50,94 Q30,94 20,76 Q10,56 28,40 Q30,56 40,58 Q34,30 50,8 Z" fill="#f08a2e"' + OL + '/><path d="M50,40 Q58,56 64,62 Q72,76 62,86 Q56,92 50,92 Q38,92 36,80 Q34,68 46,60 Q44,52 50,40 Z" fill="#f6c445"/><path d="M20,94 H80" stroke="#6a4020" stroke-width="5" stroke-linecap="round"/>',
    water: '<path d="M50,8 Q76,44 78,62 Q78,90 50,92 Q22,90 22,62 Q24,44 50,8 Z" fill="#5aa8e8"' + OL + '/><path d="M36,62 Q36,76 48,80" fill="none" stroke="#d6ecfa" stroke-width="5" stroke-linecap="round"/>',
    coin: '<circle cx="50" cy="50" r="38" fill="#d8b04a"' + OL + '/><circle cx="50" cy="50" r="30" fill="none" stroke="#b8902a" stroke-width="2.4"/><path d="M50,30 v40 M58,38 q-8,-6 -14,0 q-4,6 6,10 q10,4 6,10 q-6,6 -14,0" fill="none" stroke="#a8801a" stroke-width="3"/>',
    car: '<path d="M8,66 V54 Q8,48 16,46 L28,30 Q32,26 40,26 H62 Q70,26 74,32 L84,46 Q92,48 92,56 V66 Z" fill="#4a8fd8"' + OL + '/><path d="M32,44 L40,32 H50 V44 Z M56,44 V32 H64 L72,44 Z" fill="#d6ecfa"' + OL + '/><circle cx="28" cy="68" r="10" fill="#3a3a3a"' + OL + '/><circle cx="72" cy="68" r="10" fill="#3a3a3a"' + OL + '/><circle cx="28" cy="68" r="4" fill="#c0c0c0"/><circle cx="72" cy="68" r="4" fill="#c0c0c0"/>',
    robot: '<rect x="26" y="40" width="48" height="38" rx="6" fill="#a8b4c0"' + OL + '/><rect x="32" y="12" width="36" height="26" rx="6" fill="#c0cad4"' + OL + '/><path d="M50,12 V4" stroke="#7a8696"/><circle cx="50" cy="4" r="3" fill="#d8473b"/><circle cx="42" cy="24" r="4.5" fill="#5ad0e8"' + OL + '/><circle cx="58" cy="24" r="4.5" fill="#5ad0e8"' + OL + '/><rect x="42" y="31" width="16" height="3" fill="#5a6676"/><path d="M26,48 H12 V68 M74,48 H88 V68" fill="none" stroke="#7a8696" stroke-width="6" stroke-linecap="round"/><rect x="34" y="78" width="10" height="16" fill="#7a8696"' + OL + '/><rect x="56" y="78" width="10" height="16" fill="#7a8696"' + OL + '/><rect x="38" y="50" width="24" height="10" rx="2" fill="#f2c230"' + OL + '/>',
    ball: '<circle cx="50" cy="52" r="38" fill="#d8473b"' + OL + '/><path d="M14,46 Q50,30 86,46 M14,58 Q50,74 86,58" fill="none" stroke="#fff" stroke-width="6"/><ellipse cx="36" cy="32" rx="8" ry="5" fill="#f08a80" opacity=".8"/>',
    crystal: '<path d="M30,92 L22,40 L40,14 L50,40 L48,92 Z" fill="#c8a8f0"' + OL + ' stroke-linejoin="round"/><path d="M48,92 L52,30 L66,8 L80,34 L72,92 Z" fill="#b08ae8"' + OL + ' stroke-linejoin="round"/><path d="M22,40 H50 M52,30 H80" stroke="#8a6ac8" stroke-width="1.6"/><path d="M14,92 H86" stroke="#7a8086" stroke-width="5" stroke-linecap="round"/>',
    // body parts (cartoon skin color #ffcc4d, line #e8a93a)
    eye: '<path d="M6,50 Q50,8 94,50 Q50,92 6,50 Z" fill="#fff"' + OL + '/><circle cx="50" cy="50" r="19" fill="#5a8ac8"' + OL + '/><circle cx="50" cy="50" r="9"' + DK + '/><circle cx="56" cy="44" r="4" fill="#fff"/>',
    ear: '<path d="M36,90 Q14,80 18,50 Q20,14 54,12 Q86,14 84,46 Q82,66 66,72 Q60,76 60,86 Q58,96 36,90 Z" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3"/><path d="M44,70 Q34,52 44,36 Q58,26 68,40 Q72,52 62,58 Q54,62 56,72" fill="none" stroke="' + SKIN_LINE + '" stroke-width="4" stroke-linecap="round"/>',
    nose: '<path d="M46,10 Q44,40 30,64 Q22,78 36,82 Q44,86 50,80 Q56,86 64,82 Q78,78 70,64 Q58,46 56,10 Z" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3"/><ellipse cx="40" cy="74" rx="6" ry="4" fill="#d89a3a"/><ellipse cx="60" cy="74" rx="6" ry="4" fill="#d89a3a"/>',
    tongue: '<path d="M10,40 Q50,20 90,40 Q86,60 50,62 Q14,60 10,40 Z" fill="#d8473b"' + OL + '/><path d="M28,50 Q26,88 50,92 Q74,88 72,50 Z" fill="#f08a9a"' + OL + '/><path d="M50,54 V82" stroke="#d86a7a" stroke-width="3"/><rect x="18" y="30" width="64" height="8" rx="3" fill="#fff"/>',
    hand: '<path d="M30,92 L26,58 Q22,46 14,40 Q10,34 18,32 Q26,32 34,46 L34,20 Q34,12 41,12 Q48,12 48,20 L48,40 L48,14 Q48,6 55,6 Q62,6 62,14 L62,40 L62,18 Q62,10 69,10 Q76,10 76,18 L76,44 L76,28 Q76,22 82,22 Q88,22 88,30 L88,62 Q88,84 74,92 Z" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3" stroke-linejoin="round"/><path d="M48,40 V46 M62,40 V46 M76,44 V48" stroke="' + SKIN_LINE + '" stroke-width="2"/>'
  };
  B.ICON_KEYS.forEach(function (k) { if (!ICONS[k] && W.console) W.console.warn('bio kit: no icon for ' + k); });
  B._icons = ICONS;
  // draw an icon into parent (an SVG element) at x, y with size s (px); returns the group
  function icon(parent, key, x, y, s, at) {
    var g = sv('g', Object.assign({ class: 'bvi bvi-' + key, transform: 'translate(' + x + ',' + y + ') scale(' + (s / 100) + ')' }, at || {}), parent);
    g.innerHTML = ICONS[key] || '<circle cx="50" cy="50" r="40" fill="#ccc" class="o"/><text x="50" y="62" text-anchor="middle" font-size="40">?</text>';
    return g;
  }
  // a standalone small SVG icon (for cards and buttons)
  function iconSvg(key, size, label) { var s = svgRoot(100, 100, label || (B.THINGS[key] ? B.THINGS[key].name : key), 'bv-icon'); if (size) { s.setAttribute('width', size); s.setAttribute('height', size); } icon(s, key, 0, 0, 100); return s; }
  /* =========================== bi-picture: one or more things in tiles =========================== */
  function itemOf(it) { if (typeof it === 'string') return { icon: it, label: (B.THINGS[it] || {}).name || it }; var t = B.THINGS[it.icon] || {}; return Object.assign({ label: t.name || it.icon }, it); }
  V.register('bi-picture', function (el, o) {
    var items = (o.items || (o.item ? [o.item] : ['frog'])).map(itemOf), F = frame(el, o, 'picture', 'A picture of ' + items.map(function (i) { return i.label; }).join(', '));
    var showLab = o.labels !== undefined ? o.labels : !F.quiet, size = o.size || (items.length === 1 ? 'big' : items.length <= 4 ? 'medium' : 'small');
    if (F.quiet && o.labels === undefined) el.setAttribute('aria-label', o.label || (items.length === 1 ? 'A picture for the question.' : 'Pictures for the question, labeled ' + items.map(function (x, i) { return letter(i); }).join(', ') + '.'));
    var grid = h('div', 'bv-tiles bv-tiles-' + size); F.body.appendChild(grid);
    var chosen = {}, okSet = o.choose ? o.choose.ok || [] : null;
    items.forEach(function (it, i) {
      var tile = h(okSet && F.interactive ? 'button' : 'div', 'bv-tile'); if (okSet && F.interactive) { tile.type = 'button'; tile.setAttribute('aria-pressed', 'false'); }
      var s = iconSvg(it.icon, null, it.label); tile.appendChild(s);
      if (o.numbers || (F.quiet && items.length > 1 && o.letters !== false)) tile.appendChild(h('span', 'bv-badge', o.numbers ? String(i + 1) : letter(i)));
      if (o.ask === i) tile.appendChild(h('span', 'bv-ask', '?'));
      if (showLab) tile.appendChild(h('span', 'bv-tile-lab', esc(it.label)));
      if (it.note && !F.quiet) tile.appendChild(h('span', 'bv-tile-note', esc(it.note)));
      if (okSet && F.interactive) tile.addEventListener('click', function () { chosen[i] = !chosen[i]; tile.setAttribute('aria-pressed', String(!!chosen[i])); tile.classList.remove('ok', 'no'); F.say(''); });
      grid.appendChild(tile);
    });
    if (okSet && F.interactive && !F.quiet) {
      if (o.choose.prompt) F.body.insertBefore(h('p', 'bv-prompt', esc(o.choose.prompt)), grid);
      btn(F.ctl, 'Check', function () {
        var right = 0, wrong = 0;
        grid.childNodes.forEach(function (t, i) { var want = okSet.indexOf(i) >= 0, got = !!chosen[i]; t.classList.toggle('ok', want && got); t.classList.toggle('no', got !== want); if (want === got) right++; else wrong++; });
        F.say(wrong ? okMark(false) + ' ' + plural(wrong, 'picture') + ' to look at again. ' + (o.choose.hint || '') : okMark(true) + ' ' + (o.choose.why || 'All right!'));
      }, 'pri');
      btn(F.ctl, 'Start over', function () { chosen = {}; grid.childNodes.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); t.classList.remove('ok', 'no'); }); F.say(''); });
    }
    F.speak(function () { return (o.readme || '') + ' ' + items.map(function (i) { return i.label; }).join(', '); });
  });

  /* =========================== bi-classify: sort cards into groups =========================== */
  V.register('bi-classify', function (el, o) {
    var bins = o.bins || ['Living', 'Not living'], cards = (o.cards || []).map(function (c) { if (typeof c === 'string') c = B.THINGS[c] ? { icon: c } : { text: c }; var t = c.icon && B.THINGS[c.icon]; return Object.assign({ text: c.text || (t ? t.name : '') }, c); });
    var F = frame(el, o, 'classify', 'A sorting game: ' + bins.join(' or ') + '.'), order = o.shuffle === false ? cards.map(function (c, i) { return i; }) : shuffle(cards.map(function (c, i) { return i; }), 'cls' + cards.length + bins.join(''));
    if (o.prompt) F.body.appendChild(h('p', 'bv-prompt', o.prompt));
    if (F.quiet) {
      var ul = h('ol', 'bv-qcards'); order.forEach(function (ci, j) { var c = cards[ci], li = h('li', 'bv-qcard'); li.appendChild(h('span', 'bv-badge', letter(j))); if (c.icon) li.appendChild(iconSvg(c.icon, 44, c.text)); li.appendChild(h('span', '', esc(c.text))); ul.appendChild(li); });
      F.body.appendChild(ul); if (o.showBins !== false) F.body.appendChild(h('p', 'bv-qbins', 'Groups: ' + bins.map(function (b, i) { return '<b>' + (i + 1) + '</b> ' + esc(b); }).join(' · ')));
      return;
    }
    var place = {}, sel = null, pool = h('div', 'bv-pool'), binWrap = h('div', 'bv-bins'), binEls = [];
    pool.setAttribute('aria-label', 'Cards to sort'); F.body.appendChild(pool); F.body.appendChild(binWrap);
    binWrap.style.setProperty('--cols', o.columns || M.min(bins.length, 3));
    bins.forEach(function (b, i) {
      var be = h('div', 'bv-bin'), hd = h('button', 'bv-bin-h', '<span class="bv-bin-n">' + (i + 1) + '</span> ' + esc(b)); hd.type = 'button';
      hd.addEventListener('click', function () { if (sel != null) { place[sel] = i; sel = null; draw(); } });
      be.appendChild(hd); var list = h('div', 'bv-bin-list'); be.appendChild(list); binWrap.appendChild(be); binEls.push(list);
    });
    function card(ci) {
      var c = cards[ci], b = h('button', 'bv-card' + (c.icon ? ' has-icon' : '')); b.type = 'button'; b.dataset.ci = ci;
      if (c.icon) b.appendChild(iconSvg(c.icon, 46, c.text)); if (c.text) b.appendChild(h('span', 'bv-card-t', esc(c.text)));
      b.setAttribute('aria-pressed', String(sel === ci));
      b.addEventListener('click', function () { sel = sel === ci ? null : ci; if (place[ci] !== undefined && sel === ci) { delete place[ci]; sel = ci; } draw(); var n = binWrap.querySelector('.bv-bin-h'); if (sel != null && n) F.say('Now tap a group' + (bins.length < 10 ? ' (or press its number)' : '') + '.'); });
      b.addEventListener('keydown', function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= bins.length) { place[ci] = n - 1; sel = null; draw(); e.preventDefault(); } else if (e.key === '0') { delete place[ci]; draw(); } });
      return b;
    }
    function draw() {
      pool.innerHTML = ''; binEls.forEach(function (l) { l.innerHTML = ''; });
      order.forEach(function (ci) { var b = card(ci); if (place[ci] === undefined) pool.appendChild(b); else binEls[place[ci]].appendChild(b); });
      if (!pool.childNodes.length) pool.appendChild(h('p', 'bv-pool-done', 'All sorted. Press Check.'));
      F.say('');
    }
    if (o.solved) cards.forEach(function (c, i) { place[i] = c.bin; });
    draw();
    if (F.interactive) {
      btn(F.ctl, 'Check', function () {
        var wrong = [], left = 0;
        cards.forEach(function (c, i) { if (place[i] === undefined) left++; else if (c.bin !== undefined && place[i] !== c.bin && !(Array.isArray(c.bin) && c.bin.indexOf(place[i]) >= 0)) wrong.push(i); });
        binEls.forEach(function (l) { l.querySelectorAll('.bv-card').forEach(function (b) { var i = +b.dataset.ci; b.classList.toggle('no', wrong.indexOf(i) >= 0); b.classList.toggle('ok', wrong.indexOf(i) < 0); }); });
        if (wrong.length) F.say(okMark(false) + ' ' + plural(wrong.length, 'card') + ' in the wrong group. ' + wrong.map(function (i) { return cards[i].why ? '<br><b>' + esc(cards[i].text) + ':</b> ' + cards[i].why : ''; }).join(''));
        else F.say(left ? 'So far so good. ' + plural(left, 'card') + ' left to sort.' : okMark(true) + ' ' + (o.done || 'Every card is in the right group.'));
      }, 'pri');
      if (o.reveal) btn(F.ctl, 'Show me', function () { cards.forEach(function (c, i) { place[i] = Array.isArray(c.bin) ? c.bin[0] : c.bin; }); sel = null; draw(); F.say(o.done || 'Here is how they sort.'); });
      btn(F.ctl, 'Start over', function () { place = {}; sel = null; draw(); });
    }
    F.speak(function () { return (o.readme || '') + ' Sort into ' + bins.join(' or ') + '. ' + cards.map(function (c) { return c.text; }).join(', '); });
  });

  /* =========================== bi-habitat: a habitat scene with the things that live there =========================== */
  var HAB = {
    forest: { sky: '#cfe8f7', ground: '#7aa85a', name: 'forest' }, grassland: { sky: '#d7ecfb', ground: '#b8c870', name: 'grassland' },
    desert: { sky: '#f7e2b8', ground: '#e8c27a', name: 'desert' }, polar: { sky: '#dfeaf5', ground: '#f4f8fc', name: 'icy polar land' },
    ocean: { sky: '#cfe8f7', water: '#3f86c6', name: 'ocean' }, pond: { sky: '#d7ecfb', ground: '#8ab86a', water: '#5aa0c8', name: 'pond' },
    rainforest: { sky: '#cfe8d8', ground: '#4e8a3a', name: 'tropical rainforest' }, tundra: { sky: '#e4ecf2', ground: '#b8b89a', name: 'tundra' },
    taiga: { sky: '#dce8f0', ground: '#e8eef2', name: 'taiga' }, deciduous: { sky: '#e8e0c8', ground: '#a88a4a', name: 'deciduous forest in fall' },
    farm: { sky: '#d7ecfb', ground: '#9ac06a', name: 'farm' }, home: { sky: '#d7ecfb', ground: '#9ac87a', name: 'backyard' }
  };
  function backdrop(svg, place, W0, H0) {
    var P = HAB[place] || HAB.forest, g = sv('g', { class: 'bv-hab' }, svg), gy = H0 * 0.62;
    sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: P.sky, class: 'bv-sky' }, g);
    if (place === 'ocean') { sv('rect', { x: 0, y: H0 * 0.22, width: W0, height: H0 * 0.78, fill: P.water, class: 'bv-water' }, g); sv('path', { d: 'M0,' + H0 * 0.22 + ' q25,-8 50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0', fill: 'none', stroke: '#9ccbea', 'stroke-width': 4 }, g); sv('path', { d: 'M0,' + H0 + ' L0,' + (H0 - 26) + ' Q150,' + (H0 - 44) + ' 300,' + (H0 - 30) + ' T600,' + (H0 - 34) + ' L600,' + H0 + 'Z', fill: '#d8c08a' }, g); return { ground: H0 - 24, water: [H0 * 0.3, H0 - 40], sky: H0 * 0.1 }; }
    sv('circle', { cx: W0 - 60, cy: 44, r: 24, fill: place === 'desert' ? '#f6b845' : '#f6c445' }, g);
    if (place === 'polar' || place === 'taiga' || place === 'tundra') { sv('path', { d: 'M0,' + gy + ' L80,' + (gy - 60) + ' L150,' + (gy - 20) + ' L240,' + (gy - 80) + ' L330,' + gy + 'Z', fill: '#c9d6e2' }, g); }
    sv('rect', { x: 0, y: gy, width: W0, height: H0 - gy, fill: P.ground, class: 'bv-ground' }, g);
    if (place === 'pond') { sv('ellipse', { cx: W0 * 0.58, cy: H0 * 0.84, rx: W0 * 0.36, ry: H0 * 0.15, fill: P.water }, g); [[W0 * 0.3, 0.8], [W0 * 0.88, 0.78]].forEach(function (c) { for (var i = 0; i < 4; i++) sv('path', { d: 'M' + (c[0] + i * 6) + ',' + H0 * c[1] + ' q' + (i - 2) * 3 + ',-40 ' + (i - 1) * 2 + ',-60', stroke: '#4e8a3a', 'stroke-width': 3, fill: 'none' }, g); }); return { ground: gy + 20, water: [H0 * 0.84 - 70, H0 * 0.84 - 70], sky: H0 * 0.12, pond: [W0 * 0.58, H0 * 0.84] }; }
    if (place === 'forest' || place === 'rainforest' || place === 'deciduous' || place === 'taiga') {
      var col = place === 'deciduous' ? ['#d8842e', '#c9653a', '#e0a83a'] : place === 'rainforest' ? ['#2f7d3a', '#3f8f3a', '#2a6a32'] : ['#4e9442', '#5aa04a', '#3f8a3a'];
      for (var i = 0; i < 7; i++) { var x = 30 + i * 90 + (i % 2) * 20; if (place === 'taiga') { sv('path', { d: 'M' + x + ',' + (gy - 120) + ' l30,60 h-12 l26,50 h-88 l26,-50 h-12z', fill: '#2f6a3a' }, g); sv('rect', { x: x - 5, y: gy - 10, width: 10, height: 14, fill: '#6a4a2a' }, g); } else { sv('rect', { x: x - 7, y: gy - 70, width: 14, height: 74, fill: '#7a5a3a' }, g); sv('circle', { cx: x, cy: gy - 90, r: place === 'rainforest' ? 48 : 38, fill: col[i % 3] }, g); } }
      if (place === 'taiga') for (var s = 0; s < 30; s++) sv('circle', { cx: (s * 53) % W0, cy: (s * 29) % (gy - 20), r: 2, fill: '#fff' }, g);
    }
    if (place === 'grassland' || place === 'farm' || place === 'home') for (var j = 0; j < 40; j++) sv('path', { d: 'M' + (j * 15 + 4) + ',' + (gy + 6 + (j % 3) * 18) + ' l3,-10 l3,10', stroke: '#6a9a3a', fill: 'none', 'stroke-width': 2 }, g);
    if (place === 'farm') { sv('rect', { x: 40, y: gy - 80, width: 90, height: 80, fill: '#c9483b' }, g); sv('path', { d: 'M30,' + (gy - 80) + ' L85,' + (gy - 120) + ' L140,' + (gy - 80) + 'Z', fill: '#8a3a30' }, g); sv('rect', { x: 72, y: gy - 44, width: 26, height: 44, fill: '#f4f0e8' }, g); }
    if (place === 'home') { sv('rect', { x: 30, y: gy - 90, width: 120, height: 90, fill: '#e8dcc8' }, g); sv('path', { d: 'M20,' + (gy - 90) + ' L90,' + (gy - 140) + ' L160,' + (gy - 90) + 'Z', fill: '#7a5a4a' }, g); sv('rect', { x: 50, y: gy - 66, width: 30, height: 26, fill: '#cfe7f7' }, g); sv('rect', { x: 100, y: gy - 50, width: 26, height: 50, fill: '#8a5a3a' }, g); }
    if (place === 'desert') { sv('path', { d: 'M0,' + gy + ' Q120,' + (gy - 40) + ' 260,' + gy + ' T600,' + (gy - 10) + ' V' + gy + 'Z', fill: '#e0b468' }, g); }
    if (place === 'tundra') for (var t = 0; t < 30; t++) sv('circle', { cx: (t * 41) % W0, cy: gy + 10 + (t * 17) % (H0 - gy - 16), r: 4, fill: '#8a9a6a' }, g);
    return { ground: gy + 30, sky: H0 * 0.12 };
  }
  B.HABITAT_DRAW = Object.keys(HAB);
  V.register('bi-habitat', function (el, o) {
    var place = o.place || 'forest', P = HAB[place] || HAB.forest, F = frame(el, o, 'habitat', 'A ' + P.name + ' habitat');
    var W0 = 600, H0 = 300, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-scene'); F.body.appendChild(svg);
    var L = backdrop(svg, place, W0, H0), things = o.things || [], showLab = o.labels !== undefined ? o.labels : !F.quiet;
    function placeOf(key, i, n) {
      var t = B.THINGS[key] || {}, mv = t.moves || [], x = 60 + (n > 1 ? i * (W0 - 140) / (n - 1) : (W0 - 140) / 2), s = 84, y;
      if (mv.indexOf('fly') >= 0 && mv.indexOf('walk') < 0 && mv.indexOf('hop') < 0) y = L.sky + (i % 2) * 30;
      else if (L.water && mv.indexOf('swim') >= 0 && mv.indexOf('walk') < 0 && mv.indexOf('hop') < 0) y = L.water[0] + (i % 2) * 28;
      else y = M.min(H0 - s - 6, L.ground - s + 24 + (i % 2) * 10);
      return [x - s / 2 + 20, y, s];
    }
    things.forEach(function (k, i) { var p = placeOf(k, i, things.length); var g = icon(svg, k, p[0], p[1], p[2]); if (showLab) txt(svg, p[0] + p[2] / 2, M.min(H0 - 4, p[1] + p[2] + 12), (B.THINGS[k] || {}).name || k, { class: 'bv-name', 'text-anchor': 'middle' }); if (o.ask === i) txt(svg, p[0] + p[2] - 6, p[1] + 14, '?', { class: 'bv-askt' }); g.setAttribute('aria-hidden', 'true'); });
    if (!F.quiet && o.title !== false) txt(svg, 12, 26, cap1(P.name), { class: 'bv-scene-title' });
    if (o.choices && F.interactive && !F.quiet) {
      var ok = o.ok || o.choices.filter(function (k) { return ((B.THINGS[k] || {}).habitat || []).indexOf(place) >= 0; });
      var c = { items: o.choices, choose: { ok: o.choices.map(function (k, i) { return ok.indexOf(k) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }), prompt: o.prompt || 'Which of these live in a ' + P.name + '? Tap them, then Check.', why: o.why } };
      var sub = h('div', 'ml-viz'); sub.dataset.viz = 'bi-picture'; sub.dataset.opts = JSON.stringify(c); sub.style.border = '0'; sub.style.padding = '0'; sub.style.background = 'none'; F.body.appendChild(sub); V.mount(sub);
    }
  });

  /* =========================== bi-key: a dichotomous key =========================== */
  // steps: [{ a: 'has six legs', an: 2 (go to step 2) | 'ant' (an answer: a THINGS key or a name), b: '…', bn: … }], numbered from 1
  V.register('bi-key', function (el, o) {
    var steps = o.steps || [], specs = (o.specimens || []).map(itemOf), F = frame(el, o, 'key', 'A dichotomous key with ' + steps.length + ' steps');
    function nm(x) { return typeof x === 'number' ? 'go to ' + x : (B.THINGS[x] ? B.THINGS[x].name : x); }
    var tbl = h('table', 'bv-keytbl'), tb = h('tbody'); tbl.appendChild(tb);
    steps.forEach(function (s, i) {
      [['a', s.a, s.an], ['b', s.b, s.bn]].forEach(function (r) { var tr = h('tr'); tr.dataset.step = i + 1; tr.dataset.side = r[0]; tr.innerHTML = '<th>' + (i + 1) + r[0] + '</th><td>' + esc(r[1]) + '</td><td class="bv-keygo">' + (typeof r[2] === 'number' ? '→ ' + r[2] : '<b>' + esc(nm(r[2])) + '</b>') + '</td>'; tb.appendChild(tr); });
    });
    if (specs.length) {
      var grid = h('div', 'bv-tiles bv-tiles-small'), cur = null; F.body.appendChild(grid);
      specs.forEach(function (it, i) { var t = h(F.quiet || !F.interactive ? 'div' : 'button', 'bv-tile'); if (t.tagName === 'BUTTON') { t.type = 'button'; t.setAttribute('aria-pressed', 'false'); } t.appendChild(iconSvg(it.icon, null, F.quiet ? 'Specimen ' + letter(i) : it.label)); t.appendChild(h('span', 'bv-badge', letter(i))); if (!F.quiet && o.names) t.appendChild(h('span', 'bv-tile-lab', esc(it.label))); grid.appendChild(t);
        if (t.tagName === 'BUTTON') t.addEventListener('click', function () { cur = i; grid.querySelectorAll('.bv-tile').forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === i)); }); walk(1); }); });
    }
    F.body.appendChild(tbl);
    var walkBox = h('div', 'bv-keywalk'); F.body.appendChild(walkBox);
    function walk(n) {
      tb.querySelectorAll('tr').forEach(function (tr) { tr.classList.toggle('on', +tr.dataset.step === n); });
      var s = steps[n - 1]; walkBox.innerHTML = '';
      if (!s) return;
      walkBox.appendChild(h('p', 'bv-prompt', 'Step ' + n + ': which is true of specimen ' + letter(cur) + '?'));
      [['a', s.a, s.an], ['b', s.b, s.bn]].forEach(function (r) {
        btn(walkBox, esc(r[1]), function () {
          if (typeof r[2] === 'number') walk(r[2]);
          else { tb.querySelectorAll('tr').forEach(function (tr) { tr.classList.toggle('on', +tr.dataset.step === n && tr.dataset.side === r[0]); }); walkBox.innerHTML = ''; var want = specs[cur] && specs[cur].icon, got = r[2];
            F.say('Specimen ' + letter(cur) + ' is <b>' + esc(nm(got)) + '</b>.' + (want && !o.noCheck ? ' ' + (want === got || (B.THINGS[want] && B.THINGS[want].name === got) ? okMark(true) + ' The key led to the right name.' : okMark(false) + ' Check each step again: read both choices before you pick.') : '')); }
        });
      });
    }
    if (!specs.length || F.quiet || !F.interactive) walkBox.hidden = true;
    else F.say('Tap a specimen to walk it through the key.');
  });
  /* =========================== bi-plant: parts, photosynthesis, transport, tropisms, flowers, seasons, stomata =========================== */
  function drawPlant(g, o) { // a flowering plant in a 400 × 360 box; soil line y = 250
    var bend = o.bend || 0, ink = 'class="o"';
    var stem = 'M200,250 C200,200 ' + (200 + bend * 0.5) + ',150 ' + (200 + bend) + ',95';
    var s = '<rect x="0" y="250" width="400" height="110" class="bv-soil"/>' +
      '<path d="M200,252 C196,280 176,300 150,322 M200,256 C204,284 226,304 252,326 M200,258 C200,290 198,316 202,346 M180,290 C172,300 160,304 146,304 M220,292 C232,300 244,302 258,300 M150,322 l-14,6 M252,326 l14,4" fill="none" stroke="#c9a070" stroke-width="5" stroke-linecap="round" class="bv-part" data-part="roots"/>' +
      '<path d="' + stem + '" fill="none" stroke="#3f8f3a" stroke-width="9" stroke-linecap="round" class="bv-part" data-part="stem"/>' +
      '<g class="bv-part" data-part="leaves"><path d="M' + (200 + bend * 0.15) + ',205 Q150,160 110,190 Q150,224 ' + (200 + bend * 0.15) + ',205 Z" fill="#5aa04a" ' + ink + '/><path d="M' + (200 + bend * 0.3) + ',165 Q250,118 292,148 Q250,184 ' + (200 + bend * 0.3) + ',165 Z" fill="#5aa04a" ' + ink + '/><path d="M' + (200 + bend * 0.15) + ',205 Q160,196 120,190 M' + (200 + bend * 0.3) + ',165 Q240,156 282,148" fill="none" stroke="#3f7a32" stroke-width="2"/></g>';
    var fx = 200 + bend, fy = 78;
    s += '<g class="bv-part" data-part="flower">' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="' + fx + '" cy="' + (fy - 22) + '" rx="13" ry="22" fill="#e86a9a" ' + ink + ' transform="rotate(' + a + ' ' + fx + ' ' + fy + ')"/>'; }).join('') + '<circle cx="' + fx + '" cy="' + fy + '" r="12" fill="#f2c230" ' + ink + '/></g>';
    if (o.fruit) s += '<g class="bv-part" data-part="fruit"><path d="M' + (200 + bend * 0.45) + ',128 q24,-2 34,18" fill="none" stroke="#3f8f3a" stroke-width="4"/><path d="M226,146 Q236,132 254,140 Q272,152 264,184 Q254,206 240,200 Q224,190 226,146 Z" fill="#7ac05a" ' + ink + '/><g class="bv-part" data-part="seeds"><circle cx="245" cy="160" r="6" fill="#4e8f3a"/><circle cx="249" cy="176" r="6" fill="#4e8f3a"/><circle cx="246" cy="191" r="5" fill="#4e8f3a"/></g></g>';
    g.innerHTML = s;
    return { roots: [150, 318], stem: [200 + bend * 0.2, 232], leaves: [124, 190], flower: [fx, fy - 24], fruit: [262, 170], seeds: [248, 176] };
  }
  var PLANT_LABEL = { roots: [60, 330], stem: [330, 236], leaves: [34, 150], flower: [330, 50], fruit: [350, 196], seeds: [350, 170] };
  V.register('bi-plant', function (el, o) {
    var mode = o.mode || 'parts', F = frame(el, o, 'plant', { parts: 'A plant with its roots, stem, leaves and flower', photo: 'Photosynthesis: what goes into a leaf and what comes out', transport: 'Xylem carries water up; phloem carries sugar', tropism: 'A plant growing toward light', flower: 'The parts of a flower', seasons: 'A tree through the seasons', stomata: 'Stomata on a leaf, opened and closed by guard cells' }[mode] || 'A plant');
    var W0 = 400, H0 = 360, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-plant-svg'); F.body.appendChild(svg);
    var showLab = o.labels !== undefined ? o.labels : !F.quiet;
    if (mode === 'parts' || mode === 'photo' || mode === 'transport') {
      sv('rect', { x: 0, y: 0, width: W0, height: 250, class: 'bv-air' }, svg);
      var g = sv('g', null, svg), pos = drawPlant(g, { fruit: o.fruit || mode === 'parts' && o.fruit !== false && o.seeds });
      var parts = o.parts || ['flower', 'leaves', 'stem', 'roots'].concat(o.fruit ? ['fruit'] : []);
      if (mode === 'parts') {
        parts.forEach(function (p, i) {
          var L = PLANT_LABEL[p], a = pos[p]; if (!L || !a) return;
          var asked = o.ask === p, tag = o.numbers ? String(i + 1) : asked ? '?' : showLab ? (B.PLANT_PARTS[p] || { name: p }).name : '';
          if (!tag && !asked) return;
          sv('line', { x1: L[0] + (L[0] < 200 ? 30 : -6), y1: L[1] - 5, x2: a[0], y2: a[1], class: 'bv-lead' }, svg);
          txt(svg, L[0], L[1], cap1(tag), { class: 'bv-lab' + (asked ? ' bv-asklab' : ''), 'text-anchor': L[0] < 200 ? 'start' : 'start' });
        });
        if (o.find && F.interactive && !F.quiet) { // tap the part named in find
          var target = o.find; F.say('Tap the <b>' + esc((B.PLANT_PARTS[target] || { name: target }).name) + '</b>.');
          svg.querySelectorAll('.bv-part').forEach(function (pe) { pe.style.cursor = 'pointer'; pe.addEventListener('click', function (e) { e.stopPropagation(); var p = pe.dataset.part; F.say(p === target ? okMark(true) + ' Yes, those are the ' + esc(B.PLANT_PARTS[p].name) + '. They ' + esc(B.PLANT_PARTS[p].job) + '.' : okMark(false) + ' That is the ' + esc((B.PLANT_PARTS[p] || { name: p }).name) + '. Try again.'); }); });
        } else if (showLab && F.interactive && !F.quiet) {
          svg.querySelectorAll('.bv-part').forEach(function (pe) { pe.style.cursor = 'pointer'; pe.addEventListener('click', function (e) { e.stopPropagation(); var p = B.PLANT_PARTS[pe.dataset.part]; if (p) F.say('<b>' + cap1(esc(p.name)) + '</b> ' + esc(p.job) + '.'); }); });
          F.say('Tap a part to see its job.');
        }
      }
      if (mode === 'photo') {
        var mk = arrowHead(svg, uid('ar'));
        sv('circle', { cx: 46, cy: 44, r: 26, fill: '#f6c445' }, svg);
        var A = [ // [key, label, x1, y1, x2, y2, class, label x, label y, anchor]
          ['light', 'light energy', 72, 58, 140, 176, 'bv-ar-light', 104, 112, 'start'], ['co2', 'carbon dioxide in', 380, 196, 296, 162, 'bv-ar-in', 396, 222, 'end'], ['water', 'water up from roots', 200, 330, 200, 222, 'bv-ar-water', 210, 300, 'start'],
          ['o2', 'oxygen out', 268, 136, 330, 62, 'bv-ar-out', 396, 50, 'end'], ['sugar', 'sugar made in leaves', 116, 200, 64, 244, 'bv-ar-sugar', 8, 274, 'start']];
        var only = o.show || A.map(function (a) { return a[0]; });
        A.forEach(function (a, i) {
          if (only.indexOf(a[0]) < 0) return;
          sv('line', { x1: a[2], y1: a[3], x2: a[4], y2: a[5], class: 'bv-ar ' + a[6], 'marker-end': mk }, svg);
          var lab = o.ask === a[0] ? '?' : F.quiet ? letter(i) : a[1];
          var short = lab.length <= 1, mxp = (a[2] + a[4]) / 2 + 14, myp = (a[3] + a[5]) / 2 - 8; txt(svg, short ? mxp : a[7], short ? myp : a[8], lab, { class: 'bv-lab' + (short ? ' bv-asklab' : ' bv-lab-sm'), 'text-anchor': short ? 'middle' : a[9] });
        });
        if (!F.quiet && o.equation !== false) F.say('<b>Photosynthesis:</b> carbon dioxide + water + light energy → sugar + oxygen. It happens in the chloroplasts of green leaves.');
      }
      if (mode === 'transport') {
        var up = sv('g', null, svg), down = sv('g', null, svg), dots = [];
        for (var i = 0; i < 8; i++) { dots.push({ g: sv('circle', { r: 5, class: 'bv-xylem' }, up), t: i / 8, up: true }); dots.push({ g: sv('circle', { r: 5, class: 'bv-phloem' }, down), t: i / 8, up: false }); }
        function at(t, up) { // along the stem: from root (t = 0) to leaf (t = 1)
          var y = 330 - t * 160; return [up ? 194 : 206, y];
        }
        function draw(dt) { dots.forEach(function (d) { d.t = (d.t + dt * 0.18) % 1; var p = at(d.up ? d.t : 1 - d.t, d.up); d.g.setAttribute('cx', p[0]); d.g.setAttribute('cy', p[1]); }); }
        draw(0); if (!V.reduced && F.interactive) V.loop(el, draw);
        if (showLab) { txt(svg, 8, 300, 'xylem: water and minerals ↑', { class: 'bv-lab bv-lab-sm bv-xylem-t' }); txt(svg, 392, 336, 'phloem: sugar ↓', { class: 'bv-lab bv-lab-sm bv-phloem-t', 'text-anchor': 'end' }); txt(svg, 396, 112, 'water vapor out', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'end' }); sv('path', { d: 'M286,150 q10,-14 0,-26 M296,152 q10,-14 0,-26', class: 'bv-vapor' }, svg); }
      }
      return;
    }
    if (mode === 'tropism') {
      var side = o.light || 'left', grav = !!o.gravity;
      var gg = sv('g', null, svg);
      function drawT() {
        gg.innerHTML = ''; sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'bv-air' }, gg);
        if (grav) { // a pot on its side: shoot curves up, roots curve down
          sv('rect', { x: 40, y: 190, width: 120, height: 80, rx: 8, fill: '#c0571f' }, gg); sv('rect', { x: 150, y: 196, width: 10, height: 68, fill: '#8a3a10' }, gg);
          sv('path', { d: 'M160,224 C220,224 250,200 254,120', fill: 'none', stroke: '#3f8f3a', 'stroke-width': 8, 'stroke-linecap': 'round' }, gg);
          sv('path', { d: 'M254,120 Q220,90 200,108 Q226,124 254,120 Z M254,130 Q292,100 312,122 Q284,140 254,130Z', fill: '#5aa04a', class: 'o' }, gg);
          sv('path', { d: 'M160,236 C200,240 214,262 218,320 M180,240 C192,256 190,280 196,300', fill: 'none', stroke: '#c9a070', 'stroke-width': 5, 'stroke-linecap': 'round' }, gg);
          if (showLab) { txt(gg, 268, 100, 'shoot grows up', { class: 'bv-lab bv-lab-sm' }); txt(gg, 226, 320, 'roots grow down', { class: 'bv-lab bv-lab-sm' }); txt(gg, 20, 30, 'Gravitropism', { class: 'bv-scene-title' }); }
          return;
        }
        var lx = side === 'left' ? 40 : side === 'right' ? 360 : 200, ly = side === 'top' ? 30 : 70, b = side === 'left' ? -70 : side === 'right' ? 70 : 0;
        sv('circle', { cx: lx, cy: ly, r: 22, fill: '#f6c445' }, gg);
        for (var r = 0; r < 3; r++) sv('line', { x1: lx + (side === 'left' ? 30 : side === 'right' ? -30 : -20 + r * 20), y1: ly + 10 + r * 16, x2: lx + (side === 'left' ? 90 : side === 'right' ? -90 : -20 + r * 20), y2: ly + 30 + r * 30, class: 'bv-ray' }, gg);
        var pg = sv('g', null, gg); drawPlant(pg, { bend: b });
        if (showLab) txt(gg, 20, 345, 'Phototropism: the stem bends toward the light', { class: 'bv-lab bv-lab-sm' });
      }
      drawT();
      if (F.interactive && !F.quiet && !grav) V.seg(F.ctl, { label: 'Where is the light?', items: [['left', 'Light on the left'], ['top', 'Light above'], ['right', 'Light on the right']], value: side, change: function (v) { side = v; drawT(); } });
      return;
    }
    if (mode === 'flower') {
      sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'bv-air' }, svg);
      var fg = sv('g', null, svg); var cx = 200, cy = 200;
      fg.innerHTML = '<path d="M200,360 V250" stroke="#3f8f3a" stroke-width="10"/>' +
        '<path d="M150,250 Q170,206 200,226 Q230,206 250,250 Q200,270 150,250 Z" fill="#5aa04a" class="o bv-part" data-part="sepal"/>' +
        '<path d="M196,226 Q110,200 90,110 Q150,110 196,206 Z" fill="#e86a9a" class="o bv-part" data-part="petal"/><path d="M204,226 Q290,200 310,110 Q250,110 204,206 Z" fill="#e86a9a" class="o bv-part" data-part="petal"/>' +
        '<path d="M188,236 Q182,196 186,170 Q200,150 214,170 Q218,196 212,236 Z" fill="#9ad06a" class="o bv-part" data-part="pistil"/><path d="M196,170 V112" stroke="#9ad06a" stroke-width="8" class="bv-part" data-part="pistil"/><ellipse cx="200" cy="108" rx="14" ry="7" fill="#7ab84a" class="o bv-part" data-part="pistil"/>' +
        '<ellipse cx="200" cy="212" rx="9" ry="7" fill="#f4f0e0" class="o"/><path d="M168,236 Q150,170 150,140 M232,236 Q250,170 250,140" fill="none" stroke="#e8d070" stroke-width="4" class="bv-part" data-part="stamen"/><ellipse cx="150" cy="134" rx="12" ry="8" fill="#f2b32e" class="o bv-part" data-part="stamen"/><ellipse cx="250" cy="134" rx="12" ry="8" fill="#f2b32e" class="o bv-part" data-part="stamen"/>' +
        '<circle cx="138" cy="118" r="3.5" fill="#f2c230"/><circle cx="262" cy="120" r="3.5" fill="#f2c230"/><circle cx="196" cy="102" r="3" fill="#f2c230"/>';
      var FL = { petal: [[300, 70], [300, 112]], sepal: [[270, 300], [240, 252]], stamen: [[20, 100], [150, 134]], pistil: [[290, 170], [212, 160]], pollen: [[230, 66], [198, 101]], seedbase: [[20, 300], [190, 214]] };
      var names = { petal: 'petal', sepal: 'sepal', stamen: 'stamen (makes pollen)', pistil: 'pistil', pollen: 'pollen', seedbase: 'base of pistil (seeds form here)' };
      (o.parts || ['petal', 'sepal', 'stamen', 'pistil', 'pollen', 'seedbase']).forEach(function (p, i) { var L = FL[p]; if (!L) return; var asked = o.ask === p, lab = o.numbers ? String(i + 1) : asked ? '?' : showLab ? names[p] : ''; if (!lab) return; sv('line', { x1: L[0][0] + (L[0][0] < 200 ? 40 : -4), y1: L[0][1] - 5, x2: L[1][0], y2: L[1][1], class: 'bv-lead' }, svg); txt(svg, L[0][0], L[0][1], cap1(lab), { class: 'bv-lab bv-lab-sm' + (asked ? ' bv-asklab' : '') }); });
      if (o.bee) { icon(svg, 'bee', 296, 230, 70); if (showLab) txt(svg, 392, 336, 'pollen sticks to the bee', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'end' }); }
      return;
    }
    if (mode === 'seasons') {
      var season = o.season || 'spring', SG = sv('g', null, svg);
      function drawS() {
        SG.innerHTML = ''; var sky = { spring: '#d7ecfb', summer: '#cfe8f7', fall: '#efe2c8', winter: '#e4ecf4' }[season];
        sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: sky }, SG); sv('rect', { x: 0, y: 290, width: W0, height: 70, fill: season === 'winter' ? '#f4f8fc' : season === 'fall' ? '#b89a5a' : '#8ab86a' }, SG);
        SG.insertAdjacentHTML('beforeend', '<path d="M190,292 L194,190 Q160,150 130,140 M194,200 Q230,160 268,150 M194,190 L200,110 M200,150 Q170,120 150,92 M200,140 Q236,110 250,84" fill="none" stroke="#7a5a3a" stroke-width="12" stroke-linecap="round"/><path d="M182,292 L186,190 L202,190 L206,292 Z" fill="#7a5a3a"/>');
        var col = { spring: '#9ad06a', summer: '#3f8f3a', fall: ['#d8842e', '#c9483b', '#e0b83a'], winter: null }[season];
        var spots = [[130, 136], [160, 100], [150, 88], [200, 96], [240, 84], [260, 146], [224, 120], [176, 140], [210, 150], [120, 160], [280, 130], [190, 70]];
        if (col) spots.forEach(function (p, i) { var c = Array.isArray(col) ? col[i % 3] : col; sv('circle', { cx: p[0], cy: p[1], r: season === 'spring' ? 14 : 30, fill: c, opacity: season === 'spring' ? 0.95 : 0.92 }, SG); });
        if (season === 'spring') spots.forEach(function (p, i) { if (i % 3 === 0) sv('circle', { cx: p[0] + 8, cy: p[1] - 6, r: 5, fill: '#f6c6d8' }, SG); });
        if (season === 'fall') for (var i = 0; i < 9; i++) sv('ellipse', { cx: 60 + i * 34, cy: 300 + (i % 3) * 14, rx: 8, ry: 4, fill: ['#d8842e', '#c9483b', '#e0b83a'][i % 3] }, SG);
        if (season === 'winter') { spots.forEach(function (p) { sv('circle', { cx: p[0], cy: p[1], r: 3, fill: '#8a6a4a' }, SG); }); for (var j = 0; j < 40; j++) sv('circle', { cx: (j * 47) % W0, cy: (j * 31) % 280, r: 2.5, fill: '#fff' }, SG); }
        if (o.evergreen) { SG.insertAdjacentHTML('beforeend', '<path d="M330,180 l30,50 h-14 l26,40 h-84 l26,-40 h-14z" fill="#2f6a3a"/><rect x="324" y="270" width="12" height="22" fill="#6a4a2a"/>'); }
        if (showLab) txt(SG, 16, 30, cap1(season), { class: 'bv-scene-title' });
        if (!F.quiet && showLab) F.say({ spring: 'Spring: buds open and new leaves grow.', summer: 'Summer: full green leaves make food all day.', fall: 'Fall: leaves change color and drop; the tree gets ready to rest.', winter: 'Winter: bare branches, but next spring\'s buds are already there.' }[season] + (o.evergreen ? ' The evergreen keeps its needles all year.' : ''));
      }
      drawS();
      if (F.interactive && !F.quiet) V.seg(F.ctl, { label: 'Season', items: [['spring', 'Spring'], ['summer', 'Summer'], ['fall', 'Fall'], ['winter', 'Winter']], value: season, change: function (v) { season = v; drawS(); } });
      return;
    }
    if (mode === 'stomata') {
      var water = o.water === undefined ? 1 : o.water, SG2 = sv('g', null, svg);
      function drawSt() {
        SG2.innerHTML = ''; sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: '#e8f4dc', class: 'bv-leafbg' }, SG2);
        for (var i = 0; i < 20; i++) sv('path', { d: 'M' + ((i % 5) * 90 - 10) + ',' + (M.floor(i / 5) * 95) + ' q40,-10 80,6 q6,40 -6,84 q-40,8 -76,-6 q-8,-40 2,-84z', fill: 'none', stroke: '#b8d4a0', 'stroke-width': 2 }, SG2);
        var gap = 4 + water * 22, cx = 200, cy = 180;
        sv('ellipse', { cx: cx, cy: cy, rx: 26, ry: gap + 2, fill: '#3a4a3a' }, SG2);
        [-1, 1].forEach(function (s) { sv('path', { d: 'M' + cx + ',' + (cy - 70) + ' Q' + (cx + s * (gap + 70)) + ',' + cy + ' ' + cx + ',' + (cy + 70) + ' Q' + (cx + s * (gap + 6)) + ',' + cy + ' ' + cx + ',' + (cy - 70) + 'Z', fill: '#7ac05a', class: 'o', transform: 'translate(' + s * (gap * 0.6) + ',0)' }, SG2); });
        for (var c = 0; c < 6; c++) sv('ellipse', { cx: cx + (c < 3 ? -1 : 1) * (gap * 0.6 + 34), cy: cy - 40 + (c % 3) * 40, rx: 6, ry: 5, fill: '#3f8f3a' }, SG2);
        if (showLab) { txt(SG2, 12, 30, water > 0.5 ? 'Plenty of water: guard cells swell,' : 'Short of water: guard cells go limp,', { class: 'bv-lab bv-lab-sm' }); txt(SG2, 12, 48, water > 0.5 ? 'and the stoma opens' : 'and the stoma closes', { class: 'bv-lab bv-lab-sm' }); txt(SG2, 268, 120, 'guard cell', { class: 'bv-lab bv-lab-sm' }); txt(SG2, 160, 300, 'stoma (pore)', { class: 'bv-lab bv-lab-sm' }); if (water > 0.3) { txt(SG2, 392, 330, 'CO₂ in · water vapor out', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'end' }); } }
      }
      drawSt();
      if (F.interactive && !F.quiet) V.slider(F.ctl, { label: 'Water in the plant', min: 0, max: 1, step: 0.05, value: water, fmt: function (v) { return v > 0.66 ? 'plenty' : v > 0.33 ? 'some' : 'little'; }, input: function (v) { water = v; drawSt(); } });
    }
  });

  /* =========================== bi-lifecycle: the stages of a life cycle =========================== */
  var STAGE = {
    'plant-seed': 'seed', 'plant-sprout': 'sprout', 'butterfly-larva': 'caterpillar', 'butterfly-adult': 'butterfly', 'frog-tadpole': 'tadpole', 'frog-adult': 'frog', 'chicken-adult': 'hen',
    'plant-young': '<path d="M10,82 H90 V96 H10 Z" fill="#8a6440"/><path d="M50,82 V30" stroke="#3f8f3a" stroke-width="5"/><path d="M50,64 Q26,44 16,60 Q32,72 50,64 Z M50,52 Q74,32 86,48 Q70,60 50,52 Z M50,36 Q34,18 26,30 Q38,40 50,36 Z M50,34 Q66,16 76,26 Q64,38 50,34 Z" fill="#5aa04a" class="o"/>',
    'plant-adult': '<path d="M10,84 H90 V96 H10 Z" fill="#8a6440"/><path d="M50,84 V20" stroke="#3f8f3a" stroke-width="5"/><path d="M50,70 Q26,50 14,66 Q32,78 50,70 Z M50,56 Q74,36 88,52 Q70,64 50,56 Z M50,42 Q30,26 22,38 Q36,48 50,42 Z" fill="#5aa04a" class="o"/>' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="50" cy="8" rx="5" ry="8" fill="#f2f2f2" class="o" transform="rotate(' + a + ' 50 16)"/>'; }).join('') + '<circle cx="50" cy="16" r="4" fill="#f2c230"/>',
    'plant-fruit': '<path d="M50,6 V30" stroke="#3f8f3a" stroke-width="4"/><path d="M26,30 Q50,20 74,30 Q90,60 74,88 Q50,96 30,86 Q12,60 26,30 Z" fill="#7ac05a" class="o" transform="rotate(20 50 60)"/><circle cx="44" cy="44" r="7" fill="#4e8f3a"/><circle cx="50" cy="60" r="7" fill="#4e8f3a"/><circle cx="56" cy="76" r="6" fill="#4e8f3a"/>',
    'butterfly-egg': '<path d="M8,74 Q40,30 92,40 Q60,86 8,74 Z" fill="#5aa04a" class="o"/><path d="M8,74 Q50,56 92,40" fill="none" stroke="#3f7a32" stroke-width="2"/><ellipse cx="44" cy="54" rx="6" ry="8" fill="#f2e6b8" class="o"/><ellipse cx="58" cy="52" rx="6" ry="8" fill="#f2e6b8" class="o"/><ellipse cx="51" cy="64" rx="6" ry="8" fill="#f2e6b8" class="o"/>',
    'butterfly-pupa': '<path d="M50,6 V16" stroke="#7a5a3a" stroke-width="4"/><path d="M8,8 H92" stroke="#7a5a3a" stroke-width="6" stroke-linecap="round"/><path d="M50,16 Q72,26 68,54 Q66,80 50,92 Q34,80 32,54 Q28,26 50,16 Z" fill="#7ab86a" class="o"/><path d="M40,30 Q50,26 60,30 M38,46 Q50,42 62,46 M40,62 Q50,58 60,62" fill="none" stroke="#e0c040" stroke-width="2"/>',
    'frog-eggs': (function () { var s = '<rect x="4" y="4" width="92" height="92" rx="14" fill="#cfe7f2"/>'; [[30, 36], [50, 30], [70, 38], [24, 56], [44, 52], [64, 56], [80, 58], [36, 72], [56, 74], [74, 78]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#e8f4f8" stroke="#a8c8d8" stroke-width="1.4"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="#2b2b2b"/>'; }); return s; })(),
    'frog-legs': '<path d="M44,50 Q66,30 96,46 Q70,46 66,52 Q72,58 96,58 Q66,72 44,54 Z" fill="#6a7a5a" class="o"/><path d="M50,62 l6,12 l8,2 M40,64 l-2,14 l-8,2" fill="none" stroke="#5a6a4a" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="52" rx="20" ry="16" fill="#5a6a4a" class="o"/><circle cx="26" cy="47" r="3" class="k"/>',
    'frog-froglet': '<path d="M66,64 Q84,62 92,54" fill="none" stroke="#5a8a4a" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="64" rx="22" ry="13" fill="#6aa65a" class="o"/><path d="M30,70 q-10,6 -6,14 h12 M70,70 q10,6 6,14 h-12" fill="#5a9a4a" class="o"/><circle cx="40" cy="50" r="8" fill="#6aa65a" class="o"/><circle cx="60" cy="50" r="8" fill="#6aa65a" class="o"/><circle cx="40" cy="49" r="3" class="k"/><circle cx="60" cy="49" r="3" class="k"/>',
    'chicken-egg': '<ellipse cx="50" cy="56" rx="28" ry="36" fill="#f4e8d4" class="o"/><path d="M14,92 H86" stroke="#c9a070" stroke-width="4"/><path d="M20,92 q10,-10 20,0 q10,-10 20,0 q10,-10 20,0" fill="none" stroke="#d8b878" stroke-width="3"/>',
    'chicken-hatch': '<path d="M22,58 L30,52 L38,60 L48,50 L58,60 L66,52 L78,58 Q80,92 50,92 Q20,92 22,58 Z" fill="#f4e8d4" class="o"/><path d="M28,44 L24,30 L36,34 Z" fill="#f4e8d4" class="o"/><circle cx="50" cy="44" r="16" fill="#f8de5a" class="o"/><path d="M34,44 L26,46 L34,49z" fill="#f2a62e"/><circle cx="44" cy="40" r="2.4" class="k"/>',
    'chicken-chick': '<ellipse cx="54" cy="62" rx="24" ry="20" fill="#f8de5a" class="o"/><circle cx="34" cy="40" r="14" fill="#f8de5a" class="o"/><path d="M20,40 L10,43 L20,46z" fill="#f2a62e" class="o"/><circle cx="31" cy="37" r="2.4" class="k"/><path d="M50,82 v10 M60,82 v10" stroke="#f2a62e" stroke-width="3"/><path d="M60,58 q12,6 18,0" fill="none" stroke="#e0b830" stroke-width="2"/>',
    'chicken-young': '<path d="M70,52 Q84,40 88,54 Q82,60 72,62 Z" fill="#e0c8a0" class="o"/><ellipse cx="54" cy="60" rx="24" ry="18" fill="#efe0c0" class="o"/><circle cx="34" cy="40" r="11" fill="#efe0c0" class="o"/><path d="M30,30 q2,-5 6,0z" fill="#e8806a"/><path d="M22,40 L14,43 L22,46z" fill="#f2a62e" class="o"/><circle cx="32" cy="38" r="2" class="k"/><path d="M48,78 v12 M60,78 v12" stroke="#f2a62e" stroke-width="3"/><circle cx="62" cy="52" r="3" fill="#f8de5a"/><circle cx="52" cy="66" r="3" fill="#f8de5a"/>'
  };
  function stageArt(cycle, key) { if (cycle === 'tree') return null; var s = STAGE[cycle + '-' + key]; if (!s) return null; return ICONS[s] ? ICONS[s] : s; }
  function treeArt(season) { var col = { spring: '#9ad06a', summer: '#3f8f3a', fall: '#d8842e', winter: null }[season]; var s = '<path d="M50,94 V50 M50,64 L34,48 M50,58 L66,44" stroke="#7a5a3a" stroke-width="6" stroke-linecap="round" fill="none"/>'; if (col) s += '<circle cx="50" cy="38" r="' + (season === 'spring' ? 18 : 28) + '" fill="' + col + '" opacity=".95"/><circle cx="32" cy="48" r="' + (season === 'spring' ? 10 : 16) + '" fill="' + col + '"/><circle cx="68" cy="46" r="' + (season === 'spring' ? 10 : 16) + '" fill="' + col + '"/>'; if (season === 'fall') s += '<ellipse cx="22" cy="90" rx="6" ry="3" fill="#c9483b"/><ellipse cx="78" cy="92" rx="6" ry="3" fill="#e0b83a"/>'; if (season === 'winter') s += '<circle cx="34" cy="48" r="2.4" fill="#8a6a4a"/><circle cx="66" cy="44" r="2.4" fill="#8a6a4a"/><circle cx="50" cy="40" r="2.4" fill="#8a6a4a"/><path d="M8,94 H92" stroke="#f4f8fc" stroke-width="6"/>'; return s; }
  B.stageKeys = function (cycle) { return B.cycle(cycle).map(function (s) { return s.key; }); };
  V.register('bi-lifecycle', function (el, o) {
    var cyc = o.cycle || 'butterfly', stages = B.cycle(cyc), n = stages.length, mode = o.mode || 'show';
    var F = frame(el, o, 'lifecycle', 'The life cycle of ' + (B.CYCLES[cyc] || {}).name), showLab = o.labels !== undefined ? o.labels : !F.quiet;
    function art(i) { return cyc === 'tree' ? treeArt(stages[i].key) : stageArt(cyc, stages[i].key); }
    if (mode === 'order' || o.order) {
      // a row of stages in a given or shuffled order, lettered; interactive: tap two to swap, then Check
      var ord = o.order || derange(n, 'lc' + cyc), selI = null, row = h('div', 'bv-lcrow'); F.body.appendChild(row);
      function drawRow() {
        row.innerHTML = '';
        ord.forEach(function (si, pos) {
          var b = h(F.interactive && !F.quiet ? 'button' : 'div', 'bv-lccard'); if (b.tagName === 'BUTTON') { b.type = 'button'; b.setAttribute('aria-pressed', String(selI === pos)); }
          var s = svgRoot(100, 100, F.quiet ? 'Stage ' + letter(pos) : stages[si].name, 'bv-icon'); var g = sv('g', null, s); g.innerHTML = art(si); b.appendChild(s);
          b.appendChild(h('span', 'bv-badge', F.quiet || !F.interactive ? letter(pos) : String(pos + 1)));
          if (showLab && !F.quiet) b.appendChild(h('span', 'bv-tile-lab', esc(cap1(stages[si].name))));
          if (b.tagName === 'BUTTON') b.addEventListener('click', function () { if (selI === null) selI = pos; else { var t = ord[selI]; ord[selI] = ord[pos]; ord[pos] = t; selI = null; } drawRow(); F.say(''); });
          row.appendChild(b);
        });
      }
      ord = ord.slice(); drawRow();
      if (F.interactive && !F.quiet) {
        F.say('Tap two pictures to swap them. Put the stages in order, starting with the ' + esc(stages[0].name) + '.');
        btn(F.ctl, 'Check', function () { var bad = ord.map(function (si, p) { return si === p ? 0 : 1; }).reduce(function (a, b) { return a + b; }, 0); row.childNodes.forEach(function (c, p) { c.classList.toggle('ok', ord[p] === p); c.classList.toggle('no', ord[p] !== p); }); F.say(bad ? okMark(false) + ' ' + plural(bad, 'picture') + ' out of place.' : okMark(true) + ' That is the life cycle in order: ' + stages.map(function (s) { return esc(s.name); }).join(' → ') + (cyc === 'tree' ? '.' : ', and around again.')); }, 'pri');
        btn(F.ctl, 'Show me', function () { ord = stages.map(function (s, i) { return i; }); drawRow(); });
      }
      return;
    }
    var S = 420, svg = svgRoot(S, S, el.getAttribute('aria-label'), 'bv-lc-svg'); F.body.appendChild(svg);
    var R = n <= 4 ? 128 : 140, cx = S / 2, cy = S / 2, sz = n <= 4 ? 108 : 92, mk = arrowHead(svg, uid('lc'));
    var pos = stages.map(function (s, i) { var a = -M.PI / 2 + i * 2 * M.PI / n; return [cx + R * M.cos(a), cy + R * M.sin(a), a]; });
    pos.forEach(function (p, i) { // arrows between stages (around the circle)
      var a0 = p[2] + 0.42, a1 = pos[(i + 1) % n][2] - 0.42 + (i === n - 1 ? 2 * M.PI : 0);
      if (cyc === 'tree' || i < n - 1 || o.loop !== false) sv('path', { d: 'M' + (cx + (R + 4) * M.cos(a0)) + ',' + (cy + (R + 4) * M.sin(a0)) + ' A' + (R + 4) + ',' + (R + 4) + ' 0 0 1 ' + (cx + (R + 4) * M.cos(a1)) + ',' + (cy + (R + 4) * M.sin(a1)), class: 'bv-lcarrow', 'marker-end': mk }, svg);
    });
    var groups = [];
    pos.forEach(function (p, i) {
      var g = sv('g', { class: 'bv-lcstage', transform: 'translate(' + (p[0] - sz / 2) + ',' + (p[1] - sz / 2) + ')' }, svg); groups.push(g);
      sv('circle', { cx: sz / 2, cy: sz / 2, r: sz / 2 + 4, class: 'bv-lcbg' }, g);
      if (o.ask === i) { txt(g, sz / 2, sz / 2 + 16, '?', { class: 'bv-askbig', 'text-anchor': 'middle' }); }
      else { var ig = sv('g', { transform: 'translate(' + sz * 0.1 + ',' + sz * 0.1 + ') scale(' + sz * 0.8 / 100 + ')' }, g); ig.innerHTML = art(i); }
      if (showLab) txt(svg, p[0], p[1] + sz / 2 + 18, cap1(stages[i].name.replace(/ \(.*\)/, '').replace(/:.*/, '')), { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
      if (o.numbers) txt(g, 6, 14, String(i + 1), { class: 'bv-num' });
    });
    if (showLab && o.center !== false) txt(svg, cx, cy + 6, cyc === 'tree' ? 'The seasons' : 'Life cycle', { class: 'bv-lc-center', 'text-anchor': 'middle' });
    if (mode === 'step' && F.interactive && !F.quiet) {
      stepper(F.ctl, n, function (i) { groups.forEach(function (g, j) { g.classList.toggle('bv-dim', j !== i); }); F.say('<b>' + cap1(esc(stages[i].name)) + '.</b> ' + esc((o.notes || [])[i] || '')); }, { label: function (i) { return 'Stage ' + (i + 1) + ' of ' + n; } });
    }
  });
  /* =========================== bi-foodweb: food chains and webs =========================== */
  V.register('bi-foodweb', function (el, o) {
    var web = o.web ? (typeof o.web === 'string' ? B.WEBS[o.web] : o.web) : null, mode = o.mode || (o.chain ? 'chain' : 'show');
    if (!web && o.chain) { web = { nodes: o.chain.slice(), links: [] }; for (var i = 0; i < o.chain.length - 1; i++) web.links.push([o.chain[i], o.chain[i + 1]]); }
    web = web || B.WEBS.meadow;
    var F = frame(el, o, 'foodweb', (mode === 'chain' ? 'A food chain: ' + web.nodes.map(function (k) { return (B.THINGS[k] || {}).name || k; }).join(', then ') : 'A food web of ' + (web.name || 'an ecosystem')) + '. Arrows point from the food to the eater.');
    var showLab = o.labels !== undefined ? o.labels : true, roles = o.roles && !F.quiet, removed = {}, sel = null;
    var nodes = web.nodes.slice(), pos = {}, Wd = narrow(el) ? 390 : 600, Ht;
    if (mode === 'chain') {
      var n = nodes.length + (o.sun ? 1 : 0), step = (Wd - 40) / n; Ht = 170;
      if (o.sun) pos.sun = [20 + step / 2, 80];
      nodes.forEach(function (k, i) { pos[k] = [20 + step * (i + (o.sun ? 1.5 : 0.5)), 80]; });
    } else {
      var lv = {}, maxL = 1; nodes.forEach(function (k) { lv[k] = B.level(web, k); maxL = M.max(maxL, lv[k]); });
      var rows = []; for (var L = 1; L <= maxL; L++) rows.push(nodes.filter(function (k) { return lv[k] === L; }));
      var dec = (web.decomposers || []).filter(function () { return o.decomposers !== false; }), decH = dec.length ? 100 : 0, sunH = o.sun ? 96 : 0;
      Ht = 50 + maxL * 116 + decH + sunH;
      rows.forEach(function (r, ri) { var y = Ht - decH - sunH - 66 - ri * 116;
        if (ri > 0) { var bx = {}; r.forEach(function (k) { var f = B.eats(web, k).filter(function (x) { return pos[x]; }); bx[k] = f.length ? f.reduce(function (s2, x) { return s2 + pos[x][0]; }, 0) / f.length : Wd / 2; }); r.sort(function (a2, b2) { return bx[a2] - bx[b2]; }); }
        r.forEach(function (k, j) { pos[k] = [Wd * (j + 1) / (r.length + 1) + (ri % 2 ? 18 : -18) * (r.length > 1 ? 1 : 0), y]; }); });
      if (o.sun) pos.sun = [Wd / 2, Ht - decH - 56];
      dec.forEach(function (k, j) { pos[k] = [Wd * (j + 1) / (dec.length + 1), Ht - 54]; nodes.push(k); });
    }
    var svg = svgRoot(Wd, Ht, el.getAttribute('aria-label'), 'bv-web'), mk = arrowHead(svg, uid('fw')), mkHi = arrowHead(svg, uid('fwh'), 'bv-arrowhead-hi'), mkLo = arrowHead(svg, uid('fwl'), 'bv-arrowhead-lo'); F.body.appendChild(svg);
    var linkG = sv('g', null, svg), nodeG = sv('g', null, svg), R = mode === 'chain' ? M.min(40, (Wd - 40) / (nodes.length + (o.sun ? 1 : 0)) * 0.4) : 34;
    function edge(a, b, cls, m) { var p = pos[a], q = pos[b]; if (!p || !q) return; var dx = q[0] - p[0], dy = q[1] - p[1], d = M.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d; return sv('line', { x1: p[0] + ux * (R + 2), y1: p[1] + uy * (R + 2), x2: q[0] - ux * (R + 6), y2: q[1] - uy * (R + 6), class: 'bv-link ' + (cls || ''), 'marker-end': m || mk }, linkG); }
    function draw() {
      linkG.innerHTML = ''; nodeG.innerHTML = '';
      if (o.sun && pos.sun) { icon(nodeG, 'sun', pos.sun[0] - 32, pos.sun[1] - 32, 64); if (showLab) txt(nodeG, pos.sun[0], pos.sun[1] + 46, 'sun', { class: 'bv-name', 'text-anchor': 'middle' }); nodes.forEach(function (k) { if (B.isProducer(web, k)) edge('sun', k, 'bv-link-sun'); }); }
      web.links.forEach(function (l) {
        var cls = '', m = mk;
        if (removed[l[0]] || removed[l[1]]) cls = 'bv-link-gone';
        if (sel) { if (l[1] === sel) { cls += ' bv-link-food'; m = mkLo; } else if (l[0] === sel) { cls += ' bv-link-eater'; m = mkHi; } else cls += ' bv-link-dim'; }
        edge(l[0], l[1], cls, m);
      });
      var eff = mode === 'remove' && Object.keys(removed).length ? B.removeEffect(web, Object.keys(removed)[0]) : {};
      nodes.forEach(function (k, i) {
        var p = pos[k]; if (!p) return; var role = B.role(web, k);
        var g = sv('g', { class: 'bv-node' + (removed[k] ? ' gone' : '') + (sel === k ? ' sel' : '') + (roles ? ' r-' + role.split(' ')[0] : '') + ((o.highlight || []).indexOf(k) >= 0 ? ' hi' : ''), transform: 'translate(' + p[0] + ',' + p[1] + ')' }, nodeG);
        sv('circle', { r: R, class: 'bv-node-bg' }, g);
        if (o.ask === k) txt(g, 0, 14, '?', { class: 'bv-askbig', 'text-anchor': 'middle' }); else icon(g, k, -R * 0.78, -R * 0.78, R * 1.56);
        if (showLab && o.ask !== k) txt(g, 0, R + 15, (B.THINGS[k] || {}).name || k, { class: 'bv-name', 'text-anchor': 'middle' });
        if (o.numbers) txt(g, -R + 2, -R + 12, String(i + 1), { class: 'bv-num' });
        if (eff[k]) txt(g, R - 4, -R + 16, eff[k] === 'up' ? '▲' : eff[k] === 'down' ? '▼' : '▼?', { class: 'bv-eff ' + (eff[k] === 'up' ? 'up' : 'down') });
        if (F.interactive && !F.quiet && (mode === 'trace' || mode === 'remove' || mode === 'show')) {
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', (B.THINGS[k] || {}).name || k);
          var act = function () { if (mode === 'remove') { var was = removed[k]; removed = {}; if (!was) removed[k] = true; report(k, !was); } else { sel = sel === k ? null : k; report(k); } draw(); };
          g.addEventListener('click', act); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        }
      });
    }
    function nm(k) { return (B.THINGS[k] || {}).name || k; }
    function list(a) { return a.length ? a.map(nm).join(', ') : 'nothing here'; }
    function report(k, on) {
      if (mode === 'remove') { if (!on) { F.say('Tap a living thing to take it out of the web.'); return; } var e = B.removeEffect(web, k), ups = Object.keys(e).filter(function (x) { return e[x] === 'up'; }), downs = Object.keys(e).filter(function (x) { return e[x] !== 'up'; });
        F.say('Without the <b>' + esc(nm(k)) + '</b>: ' + (ups.length ? 'what it ate (' + esc(list(ups)) + ') may increase at first' : 'nothing it ate is in this web') + (downs.length ? '; what ate it (' + esc(list(downs)) + ') may decrease' + (downs.some(function (x) { return e[x] === 'down?'; }) ? ', unless they switch to other food' : '') : '') + '. The changes then ripple on through the web.'); return; }
      if (!sel) { F.say(''); return; }
      var r = B.role(web, k), fd = B.eats(web, k), ea = B.eatenBy(web, k);
      F.say('<b>' + cap1(esc(nm(k))) + '</b> (' + r + ')' + (fd.length ? ' eats ' + esc(list(fd)) : B.isProducer(web, k) ? ' makes its own food from sunlight' : '') + '. ' + (ea.length ? 'It is eaten by ' + esc(list(ea)) + '.' : (web.decomposers || []).indexOf(k) >= 0 ? 'It breaks down dead plants and animals.' : 'Nothing in this web eats it.'));
    }
    draw();
    if (roles) { var lg = h('p', 'bv-legend'); lg.innerHTML = '<span class="r-producer">producer</span> <span class="r-primary">plant-eater (primary consumer)</span> <span class="r-secondary">meat-eater (secondary consumer)</span> <span class="r-omnivore">omnivore</span>' + ((web.decomposers || []).length ? ' <span class="r-decomposer">decomposer</span>' : ''); F.body.appendChild(lg); }
    if (F.interactive && !F.quiet) { if (mode === 'remove') F.say('Tap a living thing to take it out of the web.'); else if (mode !== 'chain') F.say('Tap a living thing: green arrows show its food, gold arrows show what eats it.'); }
  });

  /* =========================== bi-pyramid: energy (or biomass or numbers) by trophic level =========================== */
  V.register('bi-pyramid', function (el, o) {
    var lev = (o.levels || ['grass', 'grasshopper', 'mouse', 'snake', 'hawk']).map(function (x) { return typeof x === 'string' ? { icon: x, name: (B.THINGS[x] || {}).name || x } : x; });
    var n = lev.length, eff = o.eff === undefined ? 0.1 : o.eff, base = o.base || 10000, unit = o.unit || 'kcal', show = o.show || 'energy';
    var F = frame(el, o, 'pyramid', 'An ' + show + ' pyramid with ' + n + ' levels'), svg = svgRoot(600, 60 + n * 66, el.getAttribute('aria-label'), 'bv-pyr'); F.body.appendChild(svg);
    var known = o.known || (F.quiet ? [0] : null);
    function draw() {
      svg.innerHTML = ''; var vals = o.values || B.pyramid(base, n, eff), H0 = 60 + n * 66;
      lev.forEach(function (L, i) {
        var y = H0 - 30 - (i + 1) * 66, wB = 440 - i * 300 / n, wT = 440 - (i + 1) * 300 / n, cx = 230;
        sv('path', { d: 'M' + (cx - wB / 2) + ',' + (y + 66) + ' L' + (cx + wB / 2) + ',' + (y + 66) + ' L' + (cx + wT / 2) + ',' + y + ' L' + (cx - wT / 2) + ',' + y + ' Z', class: 'bv-pyr-l bv-pyr-' + i }, svg);
        if (L.icon) icon(svg, L.icon, cx - wB / 2 + 22, y + 10, 46);
        var v = vals[i], vs = (known ? known.indexOf(i) >= 0 : true) && o.ask !== i ? V.fmt(v, 3) + ' ' + unit : o.ask === i ? '?' : '';
        txt(svg, cx - wB / 2 + 74, y + 30, cap1(L.name || ''), { class: 'bv-lab bv-lab-sm' });
        if (o.levelNames !== false && !F.quiet) txt(svg, cx - wB / 2 + 74, y + 50, B.LEVEL_NAMES[i] || '', { class: 'bv-sub' });
        if (vs) txt(svg, 592, y + 40, vs, { class: 'bv-val' + (vs === '?' ? ' bv-asklab' : ''), 'text-anchor': 'end' });
      });
      if (!F.quiet && show === 'energy') { txt(svg, 300, 22, 'About ' + M.round(eff * 100) + '% of the energy at each level is stored in the next', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
    }
    draw();
    if (F.interactive && !F.quiet && !o.values) V.slider(F.ctl, { label: 'Share passed up each level', min: 0.05, max: 0.2, step: 0.01, value: eff, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { eff = v; draw(); } });
    if (!F.quiet) F.say('Energy flows one way, up the pyramid; most of it is used for living and leaves as heat at each step. Matter, by contrast, is recycled by decomposers.');
  });

  /* =========================== bi-cycle: the carbon, nitrogen, water and phosphorus cycles =========================== */
  // hand-laid diagrams: store centers, and for each step (in MATTER order) the arrow [x1, y1, x2, y2, (cx, cy)] and its label [x, y, anchor]
  var CYPOS = {
    carbon: { air: [300, 40], plants: [80, 175], animals: [240, 175], ocean: [520, 175], dead: [240, 315], fossil: [470, 315] },
    nitrogen: { air: [300, 40], plants: [95, 175], animals: [505, 175], soil: [300, 315], dead: [505, 315] },
    water: { cloud: [300, 40], air: [105, 130], ocean: [105, 305], land: [430, 215], ground: [430, 318], plants: [525, 110] },
    phosphorus: { rock: [100, 305], soil: [280, 225], plants: [150, 75], animals: [430, 75], sediment: [490, 305] }
  };
  var CYARR = {
    carbon: [[[228, 50, 92, 153, 130, 50], [146, 86, 'end']], [[145, 175, 175, 175], [160, 204, 'middle']], [[118, 153, 248, 62], [178, 124, 'start']], [[252, 153, 290, 62], [276, 104, 'start']],
      [[240, 197, 240, 293], [246, 252, 'start']], [[92, 197, 196, 293], [126, 258, 'end']], [[290, 293, 342, 62, 382, 220], [366, 196, 'start']], [[470, 293, 372, 62], [432, 262, 'start']],
      [[372, 34, 522, 153, 500, 30], [492, 72, 'start']], [[492, 153, 368, 58], [436, 126, 'end']], [[305, 315, 405, 315], [355, 354, 'middle']]],
    nitrogen: [[[270, 62, 270, 293], [262, 112, 'end']], [[300, 62, 300, 293], [262, 140, 'end']], [[235, 300, 118, 197], [150, 272, 'end']], [[160, 175, 440, 175], [392, 166, 'middle']],
      [[505, 197, 505, 293], [498, 252, 'end']], [[130, 197, 440, 300], [190, 228, 'start']], [[440, 318, 365, 318], [402, 352, 'middle']], [[330, 293, 330, 62], [338, 112, 'start']]],
    water: [[[105, 283, 105, 152], [112, 222, 'start']], [[150, 108, 235, 58], [176, 70, 'end']], [[340, 62, 410, 193], [384, 138, 'start']], [[365, 228, 168, 292], [262, 284, 'middle']],
      [[430, 237, 430, 296], [437, 274, 'start']], [[485, 300, 545, 132, 560, 260], [598, 236, 'end']], [[474, 112, 175, 128], [312, 112, 'middle']]],
    phosphorus: [[[140, 283, 240, 247], [168, 252, 'end']], [[260, 203, 165, 97], [196, 160, 'end']], [[215, 75, 365, 75], [290, 66, 'middle']], [[410, 97, 305, 203], [380, 160, 'start']],
      [[345, 238, 470, 283], [422, 248, 'start']], [[490, 327, 100, 327, 295, 380], [295, 352, 'middle']]]
  };
  V.register('bi-cycle', function (el, o) {
    var key = o.cycle || 'carbon', C = B.MATTER[key], P = CYPOS[key], F = frame(el, o, 'cycle', 'The ' + C.name), svg = svgRoot(600, 362, el.getAttribute('aria-label'), 'bv-cyc'); F.body.appendChild(svg);
    var mk = arrowHead(svg, uid('cy')), steps = C.steps, boxW = 136, boxH = 44, nar = narrow(el), keyRows = [];
    var linkG = sv('g', null, svg), boxG = sv('g', null, svg), labG = sv('g', null, svg), paths = [];
    steps.forEach(function (s, i) {
      if (o.only && o.only.indexOf(s[0]) < 0 && o.only.indexOf(i) < 0) return;
      var A = CYARR[key][i], d = A[0], L = A[1];
      var path = sv('path', { d: 'M' + d[0] + ',' + d[1] + (d.length > 4 ? ' Q' + d[4] + ',' + d[5] + ' ' : ' L') + d[2] + ',' + d[3], class: 'bv-cyc-ar bv-cyc-' + i, 'marker-end': mk }, linkG); paths.push(path);
      var label = o.ask === i || o.ask === s[0] ? '?' : F.quiet || o.numbers || nar ? String(i + 1) : s[0];
      if (nar && !F.quiet) keyRows.push([String(i + 1), s[0] + ': ' + C.stores[s[1]] + ' → ' + C.stores[s[2]]]);
      var t = txt(labG, L[0], L[1], label, { class: 'bv-cyc-lab' + (label === '?' ? ' bv-asklab' : '') + (label.length <= 2 ? ' bv-cyc-num' : ''), 'text-anchor': label.length <= 2 ? 'middle' : L[2] });
      if (F.interactive && !F.quiet) { t.style.cursor = 'pointer'; t.addEventListener('click', function () { F.say('<b>' + cap1(esc(s[0])) + '</b> moves ' + (key === 'water' ? 'water' : key) + ' from ' + esc(C.stores[s[1]]) + ' to ' + esc(C.stores[s[2]]) + '.'); }); }
    });
    Object.keys(P).forEach(function (k) {
      var p = P[k], g = sv('g', { class: 'bv-store bv-store-' + k, transform: 'translate(' + p[0] + ',' + p[1] + ')' }, boxG);
      sv('rect', { x: -boxW / 2, y: -boxH / 2, width: boxW, height: boxH, rx: 12, class: 'bv-store-bg' }, g);
      var nm = C.stores[k]; if (o.askStore === k) nm = '?';
      var words = nm.split(' '), lines = [''], maxc = 18; words.forEach(function (w) { if ((lines[lines.length - 1] + ' ' + w).trim().length > maxc) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
      lines.slice(0, 2).forEach(function (L, j) { txt(g, 0, (lines.length > 1 ? -4 : 5) + j * 15, L, { class: 'bv-store-t', 'text-anchor': 'middle' }); });
    });
    if (keyRows.length) keyList(F.body, keyRows);
    if (F.interactive && !F.quiet) F.say('Tap a process to see what it moves.');
    if (F.quiet && !o.noKey) F.body.appendChild(h('p', 'bv-sub', 'Arrows are numbered.'));
    if (o.atoms && !V.reduced && F.interactive) { // a few dots that travel the arrows
      var dots = paths.map(function (pth, i) { return { p: pth, t: i / paths.length, c: sv('circle', { r: 4, class: 'bv-atom' }, svg) }; });
      V.loop(el, function (dt) { dots.forEach(function (d) { d.t = (d.t + dt * 0.25) % 1; var L = d.p.getTotalLength(), pt = d.p.getPointAtLength(L * d.t); d.c.setAttribute('cx', pt.x); d.c.setAttribute('cy', pt.y); }); });
    }
  });

  /* =========================== bi-population: growth curves and predator and prey =========================== */
  V.register('bi-population', function (el, o) {
    var mode = o.model || 'logistic', F = frame(el, o, 'population', { exp: 'Exponential growth: a J-shaped curve', logistic: 'Logistic growth: an S-shaped curve that levels off at the carrying capacity', compare: 'Exponential and logistic growth compared', predprey: 'Predator and prey populations rising and falling in turns', doubling: 'Bacteria doubling each generation' }[mode] || 'Population growth');
    var r = o.r || 0.5, K = o.K || 1000, N0 = o.N0 || 20, T = o.T || 20, gens = o.gens || 6, c = V.canvas(F.body, { aspect: 1.7, max: 360 });
    var P = V.plane(c, { xmin: -T * 0.08, xmax: T * 1.04, ymin: -K * 0.1, ymax: K * 1.3 });
    var ro = !F.quiet ? h('p', 'bv-sub') : null; if (ro) F.body.appendChild(ro);
    function lv() { // Lotka-Volterra by small steps
      var a = 1, b = 0.02, d = 0.01, g = 0.8, x = o.prey || 60, y = o.pred || 15, dt = 0.01, pts = [[0, x, y]];
      for (var t = 0; t < T; t += dt) { var dx = a * x - b * x * y, dy = d * x * y - g * y; x += dx * dt; y += dy * dt; if (M.round(t / dt) % 10 === 0) pts.push([t + dt, x, y]); }
      return pts;
    }
    function draw() {
      var k = V.colors(); P.clear();
      if (mode === 'doubling') {
        var mx = B.doubling(N0 > 20 ? 1 : N0, gens); P.set({ xmin: -0.8, xmax: gens + 0.8, ymin: -mx * 0.08, ymax: mx * 1.18 }); P.grid({ minor: false }); P.axes({ labels: true });
        for (var gi = 0; gi <= gens; gi++) { var v = B.doubling(N0 > 20 ? 1 : N0, gi); P.poly([[gi - 0.35, 0], [gi + 0.35, 0], [gi + 0.35, v], [gi - 0.35, v]], { fill: 'greenSoft', color: 'green', width: 2 }); if (!F.quiet || o.values) P.text(String(v), gi, v, { align: 'center', base: 'bottom', dy: -4, size: 13, bold: true }); }
        P.text('generation', gens + 0.7, -mx * 0.04, { align: 'right', size: 12, color: 'muted' });
        return;
      }
      var top = mode === 'exp' ? B.expN(N0, r, T) : mode === 'predprey' ? 0 : K * 1.25, pp = mode === 'predprey' ? lv() : null;
      if (pp) top = pp.reduce(function (m, q) { return M.max(m, q[1], q[2]); }, 0) * 1.15;
      if (mode === 'exp') top = M.min(top, K * 1.25) || K;
      P.set({ xmin: -T * 0.08, xmax: T * 1.04, ymin: -top * 0.08, ymax: top * 1.08 }); P.grid(); P.axes({ x: 'time', y: 'N' });
      if (pp) {
        c.ctx.save(); c.ctx.lineWidth = 2.5; [[1, k.green], [2, k.red]].forEach(function (s) { c.ctx.strokeStyle = s[1]; c.ctx.beginPath(); pp.forEach(function (q, i) { c.ctx[i ? 'lineTo' : 'moveTo'](P.X(q[0]), P.Y(q[s[0]])); }); c.ctx.stroke(); }); c.ctx.restore();
        P.text('prey', T * 0.02, pp[0][1], { color: 'green', bold: true, dy: -12 }); P.text('predators', T * 0.02, pp[0][2], { color: 'red', bold: true, dy: 14 });
        return;
      }
      if (mode === 'logistic' || mode === 'compare') { P.seg(P.view().xmin, K, P.view().xmax, K, { color: 'gold', dash: [6, 5], width: 2 }); if (!F.quiet || o.markK) P.text('carrying capacity K' + (F.quiet ? '' : ' = ' + V.fmt(K, 0)), T * 0.02, K, { color: 'gold', dy: -10, size: 13, bold: true }); if (o.half && !F.quiet) { P.seg(P.view().xmin, K / 2, P.view().xmax, K / 2, { color: 'muted', dash: [3, 4], width: 1.5 }); P.text('K/2: fastest growth', T * 0.6, K / 2, { color: 'muted', dy: 12, size: 12 }); } }
      if (mode === 'exp' || mode === 'compare') P.plot(function (t) { return B.expN(N0, r, t); }, { color: 'red', from: 0, to: T });
      if (mode === 'logistic' || mode === 'compare') P.plot(function (t) { return B.logisticN(N0, r, K, t); }, { color: 'green', from: 0, to: T });
      (o.points || []).forEach(function (q) { P.point(q[0], q[1], { color: 'blue', r: 4 }); });
      if (mode === 'compare' && !F.quiet) { P.text('J-curve (exponential)', T * 0.42, M.min(B.expN(N0, r, T * 0.5), top * 0.9), { color: 'red', bold: true, size: 13 }); P.text('S-curve (logistic)', T * 0.62, K * 0.8, { color: 'green', bold: true, size: 13 }); }
      if (ro) ro.innerHTML = mode === 'exp' ? 'dN/dt = rN. Growth is proportional to the population, so it keeps speeding up.' : 'dN/dt = rN(K − N)/K. Growth is fastest at N = K/2 = ' + V.fmt(K / 2, 0) + ' and stops at N = K.';
    }
    c.onResize(draw); draw(); V.onTheme(draw);
    if (F.interactive && !F.quiet && (mode === 'exp' || mode === 'logistic' || mode === 'compare')) {
      V.slider(F.ctl, { label: 'growth rate r', min: 0.1, max: 1.2, step: 0.05, value: r, input: function (v) { r = v; draw(); } });
      if (mode !== 'exp') V.slider(F.ctl, { label: 'carrying capacity K', min: 200, max: 2000, step: 50, value: K, input: function (v) { K = v; draw(); } });
    }
    if (mode === 'predprey' && !F.quiet) F.say('The predator peaks come after the prey peaks: predators thrive when prey are plentiful, then prey fall, then predators follow.');
  });

  /* =========================== bi-chart: data as bars, lines or points, with error bars =========================== */
  function niceStep(span, n) { var raw = span / M.max(1, n), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  V.register('bi-chart', function (el, o) {
    var kind = o.kind || 'bar', series = o.series || [{ name: '', values: [3, 5, 2] }], cats = o.x || series[0].values.map(function (v, i) { return String(i + 1); });
    var F = frame(el, o, 'chart', o.title || ('A ' + kind + ' chart' + (o.ylabel ? ' of ' + o.ylabel : '')));
    var W0 = 600, H0 = 340, padL = 64, padB = 56, padT = o.title ? 34 : 18, padR = 16, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-chart'); F.body.appendChild(svg);
    var all = []; series.forEach(function (s) { s.values.forEach(function (v, i) { if (v == null) return; var e = s.err ? s.err[i] || 0 : 0; all.push(v + e, v - e); }); });
    var isNumX = kind !== 'bar' && cats.every(function (c) { return typeof c === 'number'; });
    var ymin = o.ymin !== undefined ? o.ymin : M.min(0, M.min.apply(null, all)), ymax = o.ymax !== undefined ? o.ymax : M.max.apply(null, all) * 1.12 || 1;
    var st = o.ystep || niceStep(ymax - ymin, 5); ymax = M.ceil(ymax / st - 1e-9) * st;
    var xmin = isNumX ? (o.xmin !== undefined ? o.xmin : M.min.apply(null, cats)) : 0, xmax = isNumX ? (o.xmax !== undefined ? o.xmax : M.max.apply(null, cats)) : cats.length;
    function X(v, i) { return isNumX ? padL + (v - xmin) / (xmax - xmin || 1) * (W0 - padL - padR - 10) + 5 : padL + (i + 0.5) * (W0 - padL - padR) / cats.length; }
    function Y(v) { return H0 - padB - (v - ymin) / (ymax - ymin) * (H0 - padB - padT); }
    if (o.title) txt(svg, W0 / 2, 20, o.title, { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
    for (var y = ymin; y <= ymax + 1e-9; y += st) { sv('line', { x1: padL, y1: Y(y), x2: W0 - padR, y2: Y(y), class: 'bv-grid' }, svg); txt(svg, padL - 6, Y(y) + 4, V.fmt(y, 4), { class: 'bv-tick', 'text-anchor': 'end' }); }
    sv('line', { x1: padL, y1: Y(ymin), x2: W0 - padR, y2: Y(ymin), class: 'bv-axis' }, svg); sv('line', { x1: padL, y1: padT - 4, x2: padL, y2: Y(ymin), class: 'bv-axis' }, svg);
    if (isNumX) { var xs = o.xstep || niceStep(xmax - xmin, 6); for (var x = M.ceil(xmin / xs) * xs; x <= xmax + 1e-9; x += xs) txt(svg, X(x), H0 - padB + 18, V.fmt(x, 4), { class: 'bv-tick', 'text-anchor': 'middle' }); }
    else cats.forEach(function (c, i) { txt(svg, X(0, i), H0 - padB + 18, String(c), { class: 'bv-tick', 'text-anchor': 'middle' }); });
    if (o.xlabel) txt(svg, padL + (W0 - padL - padR) / 2, H0 - 12, o.xlabel, { class: 'bv-axl', 'text-anchor': 'middle' });
    if (o.ylabel) txt(svg, 16, padT + (H0 - padB - padT) / 2, o.ylabel, { class: 'bv-axl', 'text-anchor': 'middle', transform: 'rotate(-90 16 ' + (padT + (H0 - padB - padT) / 2) + ')' });
    var ns = series.length, bw = (W0 - padL - padR) / cats.length * 0.7 / ns;
    series.forEach(function (s, si) {
      var cls = 'bv-s' + (s.color !== undefined ? s.color : si), pts = [];
      s.values.forEach(function (v, i) {
        if (v == null) return; var cx = isNumX ? X(cats[i]) : X(0, i) - bw * ns / 2 + bw * (si + 0.5);
        if (kind === 'bar') sv('rect', { x: cx - bw / 2 + 2, y: M.min(Y(v), Y(M.max(0, ymin))), width: bw - 4, height: M.abs(Y(v) - Y(M.max(0, ymin))), class: 'bv-bar ' + cls }, svg);
        else sv('circle', { cx: cx, cy: Y(v), r: 5, class: 'bv-pt ' + cls }, svg);
        pts.push([cx, Y(v)]);
        var e = s.err && s.err[i]; if (e) { sv('line', { x1: cx, y1: Y(v - e), x2: cx, y2: Y(v + e), class: 'bv-err' }, svg); sv('line', { x1: cx - 7, y1: Y(v - e), x2: cx + 7, y2: Y(v - e), class: 'bv-err' }, svg); sv('line', { x1: cx - 7, y1: Y(v + e), x2: cx + 7, y2: Y(v + e), class: 'bv-err' }, svg); }
        if (o.values) txt(svg, cx, Y(v + (e || 0)) - 6, V.fmt(v, 3), { class: 'bv-val', 'text-anchor': 'middle' });
      });
      if (kind === 'line' && pts.length > 1) sv('polyline', { points: pts.map(function (p) { return p.join(','); }).join(' '), class: 'bv-line ' + cls }, svg);
    });
    if (ns > 1 || series[0].name) { var lg = h('p', 'bv-legend'); lg.innerHTML = series.map(function (s, si) { return '<span class="bv-key bv-s' + (s.color !== undefined ? s.color : si) + '">' + esc(s.name || '') + '</span>'; }).join(' '); F.body.appendChild(lg); }
    if (o.note && !F.quiet) F.say(o.note);
  });
  /* =========================== bi-cell: animal, plant and bacterial cells =========================== */
  function mito(x, y, rot, s) { s = s || 1; return '<g class="bv-part" data-part="mitochondria" transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')"><ellipse rx="30" ry="15" fill="#e8925a" class="o"/><path d="M-22,0 q5,-12 9,0 q5,12 9,0 q5,-12 9,0 q5,12 9,0 q5,-12 8,0" fill="none" stroke="#b8582a" stroke-width="2.2"/></g>'; }
  function chloro(x, y, rot) { return '<g class="bv-part" data-part="chloroplast" transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><ellipse rx="30" ry="15" fill="#5aa04a" class="o"/><rect x="-18" y="-6" width="8" height="12" rx="2" fill="#2f7d3a"/><rect x="-5" y="-7" width="8" height="14" rx="2" fill="#2f7d3a"/><rect x="8" y="-6" width="8" height="12" rx="2" fill="#2f7d3a"/></g>'; }
  function golgi(x, y) { var s = '<g class="bv-part" data-part="golgi" transform="translate(' + x + ',' + y + ')">'; for (var i = 0; i < 4; i++) s += '<path d="M' + (-32 + i * 3) + ',' + (i * 9) + ' Q0,' + (-12 + i * 9) + ' ' + (32 - i * 3) + ',' + (i * 9) + '" fill="none" stroke="#d8a020" stroke-width="6" stroke-linecap="round"/>'; return s + '<circle cx="38" cy="30" r="5" fill="#f2c230" class="o"/><circle cx="-36" cy="32" r="4" fill="#f2c230" class="o"/></g>'; }
  function rer(x, y) { var s = '<g class="bv-part" data-part="roughER" transform="translate(' + x + ',' + y + ')">'; for (var i = 0; i < 3; i++) { s += '<path d="M' + (-6 - i * 12) + ',-46 Q' + (-30 - i * 12) + ',0 ' + (-6 - i * 12) + ',46" fill="none" stroke="#7a9ad8" stroke-width="6" stroke-linecap="round"/>'; for (var j = -3; j <= 3; j++) s += '<circle cx="' + (-12 - i * 12 - (3 - M.abs(j)) * 4.5) + '" cy="' + j * 13 + '" r="2" fill="#3a4a8a"/>'; } return s + '</g>'; }
  function ser(x, y) { return '<g class="bv-part" data-part="smoothER" transform="translate(' + x + ',' + y + ')"><path d="M0,0 q10,-16 24,-4 q12,12 26,-2 q14,-14 26,4 M4,14 q12,-10 24,2 q12,12 28,0" fill="none" stroke="#9ab8e8" stroke-width="6" stroke-linecap="round"/></g>'; }
  var CELLS = {
    animal: { w: 680, h: 400, draw: function () { var s = '<path class="bv-part bv-cyto" data-part="cytoplasm" d="M340,40 C470,36 560,90 572,190 C584,300 480,368 340,362 C200,368 100,310 108,200 C116,90 210,44 340,40 Z" fill="#fbe3e3"/><path class="bv-part" data-part="membrane" d="M340,40 C470,36 560,90 572,190 C584,300 480,368 340,362 C200,368 100,310 108,200 C116,90 210,44 340,40 Z" fill="none" stroke="#c96a7a" stroke-width="6"/>';
      s += rer(286, 205) + ser(150, 150) + golgi(440, 120) + '<g class="bv-part" data-part="nucleus"><circle cx="320" cy="205" r="58" fill="#c8b8e8" class="o"/></g><circle class="bv-part" data-part="nucleolus" cx="332" cy="196" r="18" fill="#7a5ab8"/>' + mito(190, 270, 20) + mito(470, 280, -25) + mito(230, 100, -10, 0.9);
      s += '<g class="bv-part" data-part="lysosome"><circle cx="500" cy="190" r="14" fill="#9ad06a" class="o"/><circle cx="160" cy="210" r="11" fill="#9ad06a" class="o"/></g><g class="bv-part" data-part="vacuole"><ellipse cx="390" cy="320" rx="22" ry="14" fill="#cfe7f7" class="o"/></g><g class="bv-part" data-part="centrioles"><rect x="400" y="200" width="22" height="9" rx="2" fill="#8a7a5a" class="o"/><rect x="408" y="210" width="9" height="22" rx="2" fill="#8a7a5a" class="o"/></g><g class="bv-part" data-part="ribosomes">';
      [[250, 320], [300, 80], [420, 70], [520, 240], [140, 290], [380, 280], [460, 340], [210, 160]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="#3a4a8a"/>'; });
      return s + '</g>'; },
      at: { membrane: [566, 160], cytoplasm: [470, 230], nucleus: [290, 160], nucleolus: [332, 196], mitochondria: [190, 270], ribosomes: [300, 80], roughER: [256, 240], smoothER: [176, 140], golgi: [440, 124], lysosome: [500, 190], vacuole: [390, 320], centrioles: [412, 212] } },
    plant: { w: 680, h: 400, draw: function () { var s = '<rect class="bv-part" data-part="wall" x="90" y="30" width="500" height="340" rx="22" fill="#a8d08a"/><rect class="bv-part bv-cyto" data-part="cytoplasm" x="104" y="44" width="472" height="312" rx="14" fill="#eef7e4"/><rect class="bv-part" data-part="membrane" x="104" y="44" width="472" height="312" rx="14" fill="none" stroke="#7aa65a" stroke-width="3" stroke-dasharray="1 0"/>';
      s += '<g class="bv-part" data-part="centralVacuole"><rect x="250" y="110" width="250" height="190" rx="60" fill="#d6ecfa" class="o"/></g><g class="bv-part" data-part="nucleus"><circle cx="175" cy="120" r="42" fill="#c8b8e8" class="o"/></g><circle class="bv-part" data-part="nucleolus" cx="183" cy="114" r="13" fill="#7a5ab8"/>' + rer(206, 210) + golgi(170, 300) + ser(470, 70) + chloro(320, 80, 8) + chloro(540, 200, 80) + chloro(420, 335, -6) + chloro(140, 230, 70) + mito(540, 90, 30, 0.8) + mito(240, 335, 0, 0.8);
      s += '<g class="bv-part" data-part="ribosomes">'; [[210, 70], [520, 300], [130, 330], [300, 320], [560, 140]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="#3a4a8a"/>'; });
      return s + '</g>'; },
      at: { wall: [588, 250], membrane: [575, 330], cytoplasm: [520, 330], nucleus: [150, 100], nucleolus: [183, 114], centralVacuole: [375, 205], chloroplast: [320, 80], mitochondria: [540, 90], ribosomes: [210, 70], roughER: [178, 245], smoothER: [496, 72], golgi: [170, 304] } },
    bacterium: { w: 680, h: 320, draw: function () { var s = '<path class="bv-part" data-part="flagellum" d="M560,160 q30,-30 50,0 t50,0" fill="none" stroke="#8a6a4a" stroke-width="4"/><rect class="bv-part" data-part="wall" x="100" y="70" width="470" height="180" rx="90" fill="#d8b878"/><rect class="bv-part bv-cyto" data-part="cytoplasm" x="114" y="84" width="442" height="152" rx="76" fill="#f6ecd6"/><rect class="bv-part" data-part="membrane" x="114" y="84" width="442" height="152" rx="76" fill="none" stroke="#c99a50" stroke-width="3"/>';
      s += '<path class="bv-part" data-part="nucleoid" d="M260,150 q20,-40 50,-10 q30,30 60,-6 q24,-30 40,10 q10,30 -30,36 q-40,6 -60,-10 q-24,-20 -50,6 q-20,14 -10,-26" fill="none" stroke="#7a5ab8" stroke-width="4"/><g class="bv-part" data-part="plasmid"><circle cx="190" cy="130" r="14" fill="none" stroke="#c9483b" stroke-width="3"/><circle cx="470" cy="200" r="11" fill="none" stroke="#c9483b" stroke-width="3"/></g><g class="bv-part" data-part="ribosomes">';
      [[170, 190], [220, 210], [460, 120], [500, 160], [400, 210], [240, 110], [330, 210], [430, 100]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#3a4a8a"/>'; });
      return s + '</g>'; },
      at: { wall: [560, 120], membrane: [140, 210], cytoplasm: [200, 220], nucleoid: [320, 130], ribosomes: [170, 190], plasmid: [190, 130], flagellum: [640, 160] } }
  };
  V.register('bi-cell', function (el, o) {
    var type = o.type || 'animal', C = CELLS[type], mode = o.mode || 'show', F = frame(el, o, 'cell', 'A diagram of ' + (type === 'bacterium' ? 'a bacterial cell' : 'an ' + (type === 'plant' ? 'plant' : 'animal') + ' cell').replace('an plant', 'a plant'));
    var showLab0 = o.labels !== undefined ? o.labels : !F.quiet, useMarks = !!(o.numbers || o.ask || (mode === 'show' && showLab0 && narrow(el)));
    var labW = 150, W0 = C.w + ((mode === 'show' && showLab0) && !useMarks ? 2 * labW - 120 : 0), off = (W0 - C.w) / 2, svg = svgRoot(W0, C.h, el.getAttribute('aria-label'), 'bv-cell'); F.body.appendChild(svg);
    var g = sv('g', { transform: 'translate(' + off + ',0)' }, svg); g.innerHTML = C.draw();
    var parts = (o.parts || B.CELL_PARTS[type]).filter(function (p) { return C.at[p]; }), showLab = o.labels !== undefined ? o.labels : !F.quiet;
    if (o.highlight) svg.querySelectorAll('.bv-part').forEach(function (pe) { if ([].concat(o.highlight).indexOf(pe.dataset.part) >= 0) pe.classList.add('bv-hi'); else if (!pe.classList.contains('bv-cyto')) pe.classList.add('bv-dimp'); });
    if (useMarks) {
      var rowsK = [];
      parts.forEach(function (p, i) { var a = C.at[p], asked = o.ask === p; if (o.ask && !o.numbers && !asked) return; badge(svg, a[0] + off, a[1], asked ? '?' : String(i + 1), asked); if (!F.quiet && !asked) rowsK.push([String(i + 1), cap1(B.ORGANELLES[p].name)]); });
      if (rowsK.length) keyList(F.body, rowsK);
    } else if (mode === 'show' && showLab0) {
      var L = [], Rr = [];
      parts.forEach(function (p, i) { var a = C.at[p]; ((a[0] < C.w / 2) ? L : Rr).push({ p: p, i: i, a: [a[0] + off, a[1]] }); });
      [[L, 8, 'start'], [Rr, W0 - 8, 'end']].forEach(function (side) {
        var arr = side[0].sort(function (a, b) { return a.a[1] - b.a[1]; }), n = arr.length;
        arr.forEach(function (it, j) {
          var y = n === 1 ? it.a[1] : 30 + j * (C.h - 50) / M.max(1, n - 1), asked = o.ask === it.p;
          var tag = o.numbers ? String(it.i + 1) : asked ? '?' : showLab ? cap1(B.ORGANELLES[it.p].name) : null; if (tag === null) return;
          var tx = side[1], lx = side[2] === 'start' ? tx + M.min(labW - 18, 8 + tag.length * 7.2) : tx - M.min(labW - 18, 8 + tag.length * 7.2);
          sv('line', { x1: lx + (side[2] === 'start' ? 4 : -4), y1: y - 4, x2: it.a[0], y2: it.a[1], class: 'bv-lead' }, svg);
          sv('circle', { cx: it.a[0], cy: it.a[1], r: 3, class: 'bv-leaddot' }, svg);
          txt(svg, tx, y, tag, { class: 'bv-lab bv-lab-sm' + (asked ? ' bv-asklab' : ''), 'text-anchor': side[2] });
        });
      });
    }
    if (F.interactive && !F.quiet) {
      var target = o.find;
      svg.querySelectorAll('.bv-part').forEach(function (pe) {
        pe.style.cursor = 'pointer';
        pe.addEventListener('click', function (e) { e.stopPropagation(); var p = pe.dataset.part, O = B.ORGANELLES[p];
          svg.querySelectorAll('.bv-part').forEach(function (q) { q.classList.toggle('bv-sel', q.dataset.part === p); });
          if (target) F.say(p === target ? okMark(true) + ' Yes: the <b>' + esc(O.name) + '</b> ' + esc(O.job) + '.' : okMark(false) + ' That is the ' + esc(O.name) + '. Try again.');
          else F.say('<b>' + cap1(esc(O.name)) + '</b>: ' + esc(O.job) + '.'); });
      });
      F.say(target ? 'Tap the <b>' + esc(B.ORGANELLES[target].name) + '</b>.' : 'Tap any part of the cell to see its name and job.');
      if (o.compare) V.seg(F.ctl, { label: 'Cell type', items: [['animal', 'Animal cell'], ['plant', 'Plant cell'], ['bacterium', 'Bacterium']], value: type, change: function (v) { el.innerHTML = ''; el.className = 'ml-viz ml-viz-on'; V.registerAgain(el, Object.assign({}, o, { type: v })); } });
    }
  });
  // remount helper for visuals that switch their whole drawing
  V.registerAgain = V.registerAgain || function (el, opts) { el.removeAttribute('data-mounted'); el.dataset.opts = JSON.stringify(opts); el.innerHTML = ''; V.mount(el); };

  /* =========================== bi-microscope: its parts, and the view at each power =========================== */
  V.register('bi-microscope', function (el, o) {
    var mode = o.mode || 'parts', F = frame(el, o, 'microscope', mode === 'parts' ? 'A light microscope and its parts' : 'The view through a microscope'), showLab = o.labels !== undefined ? o.labels : !F.quiet;
    if (mode === 'parts') {
      var svg = svgRoot(560, 440, el.getAttribute('aria-label'), 'bv-mic'); F.body.appendChild(svg);
      svg.insertAdjacentHTML('beforeend', '<g class="bv-micg"><rect x="160" y="400" width="220" height="26" rx="10" fill="#4a5568" class="o bv-part" data-part="base"/><path d="M330,400 L330,330 Q330,250 300,190 L270,130 L300,118 L340,190 Q370,250 370,330 L370,400 Z" fill="#5a6678" class="o bv-part" data-part="arm"/>' +
        '<rect x="150" y="290" width="200" height="16" rx="3" fill="#3a4454" class="o bv-part" data-part="stage"/><path d="M168,286 l40,-6 M300,286 l-40,-6" stroke="#c0c6cc" stroke-width="4" class="bv-part" data-part="clips"/><rect x="214" y="306" width="72" height="8" fill="#2a3240" class="bv-part" data-part="diaphragm"/>' +
        '<circle cx="250" cy="352" r="16" fill="#f6e08a" class="o bv-part" data-part="light"/><path d="M250,336 V316" stroke="#f6e08a" stroke-width="4"/>' +
        '<path d="M226,104 L290,116 L304,150 L262,170 L214,160 Z" fill="#5a6678" class="o"/>' + '<rect x="196" y="40" width="44" height="80" rx="4" fill="#6a7688" class="o" transform="rotate(-20 218 80)"/><rect x="176" y="10" width="40" height="34" rx="4" fill="#3a4454" class="o bv-part" data-part="eyepiece" transform="rotate(-20 196 27)"/>' +
        '<ellipse cx="250" cy="170" rx="44" ry="16" fill="#4a5568" class="o bv-part" data-part="nosepiece"/><g class="bv-part" data-part="objective"><rect x="214" y="180" width="16" height="44" rx="3" fill="#c0c6cc" class="o"/><rect x="242" y="182" width="16" height="64" rx="3" fill="#c0c6cc" class="o"/><rect x="270" y="180" width="16" height="34" rx="3" fill="#c0c6cc" class="o"/></g>' +
        '<circle cx="372" cy="250" r="22" fill="#2a3240" class="o bv-part" data-part="coarse"/><circle cx="372" cy="250" r="9" fill="#5a6678"/><circle cx="378" cy="320" r="13" fill="#2a3240" class="o bv-part" data-part="fine"/></g>');
      var LB = { eyepiece: [[10, 30], [190, 26]], nosepiece: [[10, 150], [208, 168]], objective: [[10, 210], [230, 214]], stage: [[10, 300], [154, 298]], clips: [[10, 270], [178, 282]], diaphragm: [[10, 330], [214, 310]], light: [[10, 368], [236, 356]], base: [[10, 420], [162, 414]], arm: [[548, 160], [330, 200]], coarse: [[548, 240], [394, 250]], fine: [[548, 320], [392, 320]] };
      var mkm = !!(o.numbers || o.ask || (showLab && narrow(el))), rowsM = [];
      if (mkm) { (o.parts || Object.keys(LB)).forEach(function (p, i) { var L = LB[p]; if (!L) return; var asked = o.ask === p; if (o.ask && !o.numbers && !asked) return; badge(svg, L[1][0], L[1][1], asked ? '?' : String(i + 1), asked); if (!F.quiet && !asked) rowsM.push([String(i + 1), cap1(B.MICROSCOPE_PARTS[p])]); }); if (rowsM.length) keyList(F.body, rowsM); }
      else (o.parts || Object.keys(LB)).forEach(function (p, i) { var L = LB[p]; if (!L) return; var asked = o.ask === p, tag = o.numbers ? String(i + 1) : asked ? '?' : showLab ? cap1(B.MICROSCOPE_PARTS[p]) : ''; if (!tag) return; var right = L[0][0] > 280; sv('line', { x1: right ? L[0][0] - tag.length * 6.6 - 6 : L[0][0] + M.min(140, tag.length * 6.6 + 6), y1: L[0][1] - 4, x2: L[1][0], y2: L[1][1], class: 'bv-lead' }, svg); txt(svg, L[0][0], L[0][1], tag, { class: 'bv-lab bv-lab-sm' + (asked ? ' bv-asklab' : ''), 'text-anchor': right ? 'end' : 'start' }); });
      if (F.interactive && !F.quiet) { svg.querySelectorAll('.bv-part').forEach(function (pe) { pe.style.cursor = 'pointer'; pe.addEventListener('click', function () { F.say('<b>' + cap1(esc(B.MICROSCOPE_PARTS[pe.dataset.part])) + '</b>'); }); }); F.say('Tap a part to see its name.'); }
      return;
    }
    // view mode: a field of view with cells, at a chosen objective
    var eye = o.eyepiece || 10, obj = o.objective || 4, fov40 = o.fov40 || 4.5, cellL = o.cellLength || 0.25, cellW = o.cellWidth || 0.08;
    var svg2 = svgRoot(400, 400, 'The view through the eyepiece', 'bv-fov'); F.body.appendChild(svg2); var rd = !F.quiet ? h('p', 'bv-sub') : null; if (rd) F.body.appendChild(rd);
    function drawV() {
      svg2.innerHTML = ''; var mag = B.mag(eye, obj), fov = B.fov(fov40, 40, mag), pxmm = 360 / fov, cid = uid('clip');
      sv('rect', { x: 0, y: 0, width: 400, height: 400, fill: '#1a1a1a' }, svg2);
      var cp = sv('clipPath', { id: cid }, sv('defs', null, svg2)); sv('circle', { cx: 200, cy: 200, r: 180 }, cp);
      var g2 = sv('g', { 'clip-path': 'url(#' + cid + ')' }, svg2); sv('rect', { x: 0, y: 0, width: 400, height: 400, fill: '#f4f0e0' }, g2);
      var cw = cellL * pxmm, chh = cellW * pxmm, rows = M.ceil(400 / chh) + 2, cols = M.ceil(400 / cw) + 2;
      if (rows * cols < 4000) for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var x = (c - 1) * cw + (r % 2) * cw / 2 + 200 - M.floor(cols / 2) * cw, y = (r - 1) * chh + 200 - M.floor(rows / 2) * chh; sv('rect', { x: x, y: y, width: cw, height: chh, fill: '#efe2c0', stroke: '#b89a60', 'stroke-width': M.max(0.6, M.min(3, cw / 40)) }, g2); if (cw > 40) sv('ellipse', { cx: x + cw * 0.5, cy: y + chh * 0.5, rx: M.min(chh * 0.25, 14), ry: M.min(chh * 0.2, 11), fill: '#b8a0d0' }, g2); }
      else sv('rect', { x: 0, y: 0, width: 400, height: 400, fill: '#e8dcc0' }, g2);
      sv('circle', { cx: 200, cy: 200, r: 180, fill: 'none', stroke: '#000', 'stroke-width': 4 }, svg2);
      if (o.ruler !== false && !F.quiet) { sv('line', { x1: 20, y1: 200, x2: 380, y2: 200, stroke: '#c9483b', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg2); txt(svg2, 200, 192, V.fmt(fov, 3) + ' mm = ' + V.fmt(fov * 1000, 0) + ' µm across', { class: 'bv-fovlab', 'text-anchor': 'middle' }); }
      if (rd) rd.innerHTML = 'Eyepiece ' + eye + '× × objective ' + obj + '× = <b>' + mag + '×</b> total. Field of view about <b>' + V.fmt(fov, 3) + ' mm</b> (' + V.fmt(fov * 1000, 0) + ' µm). Higher power: you see a smaller area, larger.';
    }
    drawV();
    if (F.interactive && !F.quiet) V.seg(F.ctl, { label: 'Objective lens', items: (o.objectives || [4, 10, 40]).map(function (x) { return [x, x + '× objective']; }), value: obj, change: function (v) { obj = +v; drawV(); } });
  });

  /* =========================== bi-membrane: diffusion, osmosis, channels, pumps and tonicity =========================== */
  V.register('bi-membrane', function (el, o) {
    var mode = o.mode || 'diffusion', F = frame(el, o, 'membrane', { diffusion: 'Particles diffusing across a membrane from the crowded side to the less crowded side', osmosis: 'Osmosis: water crossing a membrane toward the side with more dissolved solute', facilitated: 'Facilitated diffusion through channel proteins', active: 'Active transport: a pump using ATP to move particles against the gradient', tonicity: 'A cell in a solution', bilayer: 'The phospholipid bilayer with proteins (fluid mosaic model)' }[mode] || 'A membrane');
    if (mode === 'tonicity') return tonicity(el, o, F);
    if (mode === 'bilayer') return bilayer(el, o, F);
    var c = V.canvas(F.body, { aspect: 1.9, max: 300 }), parts = [], rnd = seeded('mem' + mode), ro = !F.quiet ? h('p', 'bv-sub') : null; if (ro) F.body.appendChild(ro);
    var nL = o.left !== undefined ? o.left : mode === 'active' ? 10 : mode === 'osmosis' ? 6 : 40, nR = o.right !== undefined ? o.right : mode === 'active' ? 30 : mode === 'osmosis' ? 22 : 4;
    var lvlL = 0.7, lvlR = 0.7, wL = 0, wR = 0;
    function add(side, kind) { parts.push({ x: side ? 0.55 + rnd() * 0.4 : 0.05 + rnd() * 0.4, y: 0.1 + rnd() * 0.8, vx: rnd() - 0.5, vy: rnd() - 0.5, k: kind }); }
    function reset() { parts = []; for (var i = 0; i < nL; i++) add(0, 's'); for (i = 0; i < nR; i++) add(1, 's'); if (mode === 'osmosis') { for (i = 0; i < 70; i++) add(i % 2, 'w'); } lvlL = lvlR = 0.7; }
    reset();
    var pumping = mode === 'active' && o.atp !== false, chans = mode === 'facilitated' ? [0.3, 0.7] : [];
    function step(dt) {
      var sp = 0.35 * dt;
      parts.forEach(function (p) {
        p.vx += (rnd() - 0.5) * 0.9; p.vy += (rnd() - 0.5) * 0.9; var v = M.hypot(p.vx, p.vy) || 1; p.vx /= v; p.vy /= v;
        var nx = p.x + p.vx * sp * (p.k === 'w' ? 1.4 : 1), ny = p.y + p.vy * sp * (p.k === 'w' ? 1.4 : 1);
        var top = mode === 'osmosis' ? 1 - (p.x < 0.5 ? lvlL : lvlR) : 0.04;
        if (ny < top + 0.02 || ny > 0.97) { p.vy = -p.vy; ny = M.max(top + 0.02, M.min(0.97, ny)); }
        if (nx < 0.02 || nx > 0.98) { p.vx = -p.vx; nx = M.max(0.02, M.min(0.98, nx)); }
        var cross = (p.x < 0.5) !== (nx < 0.5);
        if (cross) {
          var ok = mode === 'diffusion' ? true : mode === 'osmosis' ? p.k === 'w' && rnd() < 0.5 : mode === 'facilitated' ? chans.some(function (cy) { return M.abs(ny - cy) < 0.07; }) : false;
          if (!ok) { p.vx = -p.vx; nx = p.x; } else if (mode === 'osmosis' && p.k === 'w') { var solL = parts.filter(function (q) { return q.k === 's' && q.x < 0.5; }).length, solR = nL + nR - solL; var biasToR = solR > solL; if ((nx >= 0.5) !== biasToR && rnd() < 0.55) { p.vx = -p.vx; nx = p.x; } }
        }
        p.x = nx; p.y = ny;
      });
      if (pumping) { var cand = parts.filter(function (p) { return p.x < 0.5 && p.x > 0.4 && M.abs(p.y - 0.5) < 0.1; }); if (cand.length && rnd() < dt * 3) { cand[0].x = 0.56; cand[0].vx = 1; pumpFlash = 0.4; } }
      if (mode === 'osmosis') { wL = parts.filter(function (p) { return p.k === 'w' && p.x < 0.5; }).length; wR = 70 - wL; lvlL += ((0.4 + 0.6 * wL / 70) - lvlL) * dt * 2; lvlR += ((0.4 + 0.6 * wR / 70) - lvlR) * dt * 2; }
    }
    var pumpFlash = 0;
    function draw() {
      var k = V.colors(), ctx = c.ctx, W1 = c.w, H1 = c.h; ctx.clearRect(0, 0, W1, H1); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, W1, H1);
      if (mode === 'osmosis') { ctx.fillStyle = k.blueSoft; ctx.fillRect(0, H1 * (1 - lvlL), W1 / 2, H1 * lvlL); ctx.fillRect(W1 / 2, H1 * (1 - lvlR), W1 / 2, H1 * lvlR); }
      ctx.strokeStyle = k.gold; ctx.lineWidth = 6; ctx.setLineDash(mode === 'diffusion' || mode === 'osmosis' ? [10, 7] : []); ctx.beginPath(); ctx.moveTo(W1 / 2, 0); ctx.lineTo(W1 / 2, H1); ctx.stroke(); ctx.setLineDash([]);
      chans.forEach(function (cy) { ctx.fillStyle = k.purple; ctx.fillRect(W1 / 2 - 9, H1 * cy - 22, 18, 12); ctx.fillRect(W1 / 2 - 9, H1 * cy + 10, 18, 12); });
      if (mode === 'active') { ctx.fillStyle = pumpFlash > 0 ? k.orange : k.purple; ctx.beginPath(); ctx.arc(W1 / 2, H1 / 2, 18, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('ATP', W1 / 2, H1 / 2 + 4); }
      parts.forEach(function (p) { ctx.fillStyle = p.k === 'w' ? k.blue : k.red; ctx.beginPath(); ctx.arc(p.x * W1, p.y * H1, p.k === 'w' ? 3 : 6, 0, 7); ctx.fill(); });
      if (!F.quiet) { var sL = parts.filter(function (p) { return p.k === 's' && p.x < 0.5; }).length, sR = parts.filter(function (p) { return p.k === 's' && p.x >= 0.5; }).length;
        ctx.fillStyle = k.ink; ctx.font = '600 13px system-ui'; ctx.textAlign = 'left'; ctx.fillText(mode === 'osmosis' ? 'solute ' + sL : sL + ' particles', 8, 16); ctx.textAlign = 'right'; ctx.fillText(mode === 'osmosis' ? 'solute ' + sR : sR + ' particles', W1 - 8, 16);
        if (ro) ro.innerHTML = { diffusion: 'Net movement is from the crowded side to the less crowded side. At equilibrium particles still cross, equally both ways.', osmosis: 'The membrane lets water (small blue dots) through but not the solute (red). Water moves toward the side with more solute, so that side rises.', facilitated: 'These particles cannot cross the lipid layer; they pass only through channel proteins, down the gradient, with no energy used.', active: 'The pump uses ATP to move particles from the side with fewer to the side with more: against the gradient.' }[mode]; }
    }
    function frameFn(dt) { step(dt); if (pumpFlash > 0) pumpFlash -= dt; draw(); }
    c.onResize(draw); V.onTheme(draw); for (var i = 0; i < (o.settled ? 600 : 0); i++) step(0.03); draw();
    if (!V.reduced && F.interactive) { var L0 = V.loop(el, frameFn); if (!F.quiet) { btn(F.ctl, 'Start over', function () { reset(); draw(); }); } } else if (!F.quiet) btn(F.ctl, 'Step', function () { for (var j = 0; j < 30; j++) step(0.03); draw(); });
  });
  function tonicity(el, o, F) {
    var sol = o.solution || 'iso', cellT = o.cell || 'animal', svg = svgRoot(560, 300, 'A cell in a ' + sol + 'tonic solution', 'bv-ton'); F.body.appendChild(svg);
    function draw() {
      svg.innerHTML = ''; var mk = arrowHead(svg, uid('tn')), sc = sol === 'hypo' ? 1.22 : sol === 'hyper' ? 0.72 : 1;
      svg.insertAdjacentHTML('beforeend', '<path d="M60,30 V270 Q60,290 80,290 H480 Q500,290 500,270 V30" fill="none" class="bv-beaker"/><rect x="62" y="70" width="436" height="218" class="bv-solution"/>');
      var nOut = sol === 'hyper' ? 26 : sol === 'iso' ? 12 : 3, r = seeded('tn' + sol);
      for (var i = 0; i < nOut; i++) { var x = 80 + r() * 400, y = 90 + r() * 180; if (M.hypot(x - 280, y - 180) > 110) sv('circle', { cx: x, cy: y, r: 5, class: 'bv-solute' }, svg); }
      var g = sv('g', { transform: 'translate(280,180)' }, svg);
      if (cellT === 'plant') { var vs = sol === 'hyper' ? 0.55 : sol === 'iso' ? 0.85 : 1; sv('rect', { x: -80, y: -60, width: 160, height: 120, rx: 8, class: 'bv-wall' }, g); sv('rect', { x: -74 * vs, y: -54 * vs, width: 148 * vs, height: 108 * vs, rx: 10, class: 'bv-cytoplasm' }, g); sv('rect', { x: -50 * vs, y: -34 * vs, width: 100 * vs, height: 68 * vs, rx: 24, class: 'bv-vacuole' }, g); }
      else { sv('ellipse', { cx: 0, cy: 0, rx: 70 * sc, ry: (sol === 'hyper' ? 40 : 56) * sc, class: 'bv-rbc' + (sol === 'hyper' ? ' shrunk' : '') }, g); for (i = 0; i < 6; i++) sv('circle', { cx: (r() - 0.5) * 70 * sc, cy: (r() - 0.5) * 50 * sc, r: 5, class: 'bv-solute' }, g); }
      var dir = sol === 'hypo' ? 1 : sol === 'hyper' ? -1 : 0;
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { var x0 = 280 + d[0] * 150, y0 = 180 + d[1] * 100, x1 = 280 + d[0] * 100, y1 = 180 + d[1] * 72; if (dir === 0) { sv('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'bv-ar bv-ar-water', 'marker-end': mk }, svg); sv('line', { x1: x1 + d[0] * 6, y1: y1 + d[1] * 6, x2: x0 - d[0] * 6, y2: y0 - d[1] * 6, class: 'bv-ar bv-ar-water', 'marker-end': mk, opacity: 0.6 }, svg); } else sv('line', { x1: dir > 0 ? x0 : x1, y1: dir > 0 ? y0 : y1, x2: dir > 0 ? x1 : x0, y2: dir > 0 ? y1 : y0, class: 'bv-ar bv-ar-water', 'marker-end': mk }, svg); });
      if (!F.quiet) { txt(svg, 280, 22, { hypo: 'Hypotonic solution: less solute outside', iso: 'Isotonic solution: the same solute inside and out', hyper: 'Hypertonic solution: more solute outside' }[sol], { class: 'bv-lab', 'text-anchor': 'middle' });
        F.say({ hypo: 'Water moves <b>into</b> the cell. ' + (cellT === 'plant' ? 'The plant cell swells against its wall and becomes firm (turgid), which is how plants stand up.' : 'An animal cell swells and may burst.'), iso: 'Water moves in and out at the same rate: no net change.', hyper: 'Water moves <b>out of</b> the cell. ' + (cellT === 'plant' ? 'The cytoplasm shrinks away from the wall (plasmolysis), and the plant wilts.' : 'An animal cell shrinks and shrivels.') }[sol]); }
    }
    draw();
    if (F.interactive && !F.quiet) { V.seg(F.ctl, { label: 'Solution', items: [['hypo', 'Hypotonic'], ['iso', 'Isotonic'], ['hyper', 'Hypertonic']], value: sol, change: function (v) { sol = v; draw(); } }); V.seg(F.ctl, { label: 'Cell', items: [['animal', 'Red blood cell'], ['plant', 'Plant cell']], value: cellT, change: function (v) { cellT = v; draw(); } }); }
  }
  function bilayer(el, o, F) {
    var svg = svgRoot(600, 260, el.getAttribute('aria-label'), 'bv-bil'); F.body.appendChild(svg); var showLab = !F.quiet;
    var s = ''; for (var i = 0; i < 30; i++) { var x = 10 + i * 20; if (i >= 9 && i <= 11 || i >= 20 && i <= 21) continue; s += '<circle cx="' + x + '" cy="70" r="8" class="bv-head"/><path d="M' + (x - 3) + ',78 v40 M' + (x + 3) + ',78 q3,20 0,40" class="bv-tail"/><circle cx="' + x + '" cy="190" r="8" class="bv-head"/><path d="M' + (x - 3) + ',182 v-40 M' + (x + 3) + ',182 q3,-20 0,-40" class="bv-tail"/>'; }
    s += '<rect x="186" y="50" width="52" height="160" rx="20" class="bv-protein"/><path d="M212,50 V210" stroke="#fff" stroke-width="6" opacity=".6"/><rect x="398" y="54" width="34" height="152" rx="14" class="bv-protein"/>';
    svg.insertAdjacentHTML('beforeend', s);
    if (showLab) [['phospholipid head (water-loving)', 592, 24, 470, 62], ['fatty acid tails (water-fearing)', 592, 252, 452, 150], ['channel protein', 140, 24, 200, 60], ['outside the cell', 10, 24], ['inside the cell', 10, 252]].forEach(function (L) { var end = L[1] > 300; txt(svg, L[1], L[2], L[0], { class: 'bv-lab bv-lab-sm', 'text-anchor': end ? 'end' : 'start' }); if (L[3]) sv('line', { x1: end ? L[3] + 10 : L[1] + 10, y1: L[2] + (L[2] > 100 ? -14 : 4), x2: L[3], y2: L[4], class: 'bv-lead' }, svg); });
  }

  /* =========================== bi-enzyme: active sites, conditions, kinetics, activation energy =========================== */
  V.register('bi-enzyme', function (el, o) {
    var mode = o.mode || 'fit', F = frame(el, o, 'enzyme', { fit: 'An enzyme and its substrate', temp: 'Enzyme activity against temperature', ph: 'Enzyme activity against pH', substrate: 'Reaction rate against substrate concentration', energy: 'Activation energy with and without an enzyme' }[mode]);
    if (mode === 'fit') {
      var svg = svgRoot(600, 280, el.getAttribute('aria-label'), 'bv-enz'); F.body.appendChild(svg); var stage = 0, inh = o.inhibitor || null;
      function draw() {
        svg.innerHTML = ''; var den = !!o.denatured;
        var site = inh === 'non' ? 'M220,120 Q236,148 260,140 Q284,132 300,118' : 'M220,120 L236,120 L248,150 L272,150 L284,120 L300,120';
        sv('path', { d: den ? 'M120,200 Q130,90 220,96 Q300,140 330,90 Q430,80 450,170 Q440,250 300,250 Q140,260 120,200 Z' : 'M120,200 Q120,110 200,110 L220,120 ' + site.slice(1).replace(/^[^L Q]*/, '') + ' L320,110 Q420,110 430,190 Q440,256 290,256 Q130,262 120,200 Z', class: 'bv-enzyme' }, svg);
        if (inh === 'non') sv('circle', { cx: 400, cy: 236, r: 18, class: 'bv-inhib' }, svg);
        if (inh === 'comp') sv('path', { d: 'M236,90 L236,120 L248,150 L272,150 L284,120 L284,90 Z', class: 'bv-inhib' }, svg);
        var sx = stage === 0 ? 120 : 0, sy = stage === 0 ? -40 : 0;
        if (stage < 2 && inh !== 'comp') sv('path', { d: 'M' + (232 + sx) + ',' + (60 + sy) + ' h56 v60 l-12,0 l-12,30 h-24 l-12,-30 h4z', class: 'bv-substrate', transform: '' }, svg);
        if (stage === 1 && inh !== 'comp' && inh !== 'non') sv('line', { x1: 260, y1: 70, x2: 260, y2: 140, stroke: '#c9483b', 'stroke-width': 3, 'stroke-dasharray': '4 4' }, svg);
        if (stage === 2) { sv('path', { d: 'M150,40 h24 v54 l-10,0 l-6,-14z', class: 'bv-substrate' }, svg); sv('path', { d: 'M390,40 h24 v40 l-8,14 h-16z', class: 'bv-substrate' }, svg); }
        if (!F.quiet) { txt(svg, 160, 236, 'enzyme', { class: 'bv-lab' }); txt(svg, 300, 274, den ? 'denatured: the active site has lost its shape' : 'active site', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); if (stage < 2 && inh !== 'comp') txt(svg, 352 + sx - 120, 60 + sy + 20, 'substrate', { class: 'bv-lab bv-lab-sm' }); if (stage === 2) txt(svg, 300, 30, 'products leave; the enzyme is unchanged and ready again', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); if (inh) txt(svg, inh === 'comp' ? 300 : 430, inh === 'comp' ? 80 : 236, inh === 'comp' ? 'competitive inhibitor blocks the site' : 'noncompetitive inhibitor changes the shape', { class: 'bv-lab bv-lab-sm' }); }
      }
      draw();
      if (F.interactive && !F.quiet) {
        stepper(F.ctl, 3, function (i) { stage = i; draw(); F.say(['The substrate fits the active site, like a key in a lock.', 'In the active site the bond is strained, lowering the activation energy.', 'The products leave. The enzyme is not used up.'][i] + (inh === 'comp' ? ' (With the competitive inhibitor in the site, the substrate cannot bind.)' : inh === 'non' ? ' (The noncompetitive inhibitor bent the site; the substrate no longer fits.)' : '')); }, { label: function (i) { return ['Bind', 'React', 'Release'][i]; } });
        V.seg(F.ctl, { label: 'Inhibitor', items: [['none', 'No inhibitor'], ['comp', 'Competitive'], ['non', 'Noncompetitive']], value: inh || 'none', change: function (v) { inh = v === 'none' ? null : v; draw(); } });
      }
      return;
    }
    var c = V.canvas(F.body, { aspect: 1.7, max: 340 }), P = V.plane(c, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 }), x0 = o.at;
    var opt = o.opt || (mode === 'temp' ? 37 : 7), comp = 0, non = 0;
    function draw2() {
      P.clear();
      if (mode === 'temp') { P.set({ xmin: -6, xmax: 82, ymin: -0.1, ymax: 1.15 }); P.grid({ step: 10, stepY: 0.25 }); P.axes({ x: '°C', y: 'rate' }); P.plot(function (t) { return t < 0 ? NaN : B.activity(t, opt, opt * 0.55, 'temp'); }, { color: 'green' }); if (!F.quiet) P.text('optimum ≈ ' + opt + ' °C', opt, 1.04, { align: 'center', color: 'green', bold: true, size: 13 }); }
      if (mode === 'ph') { P.set({ xmin: -0.6, xmax: 14.4, ymin: -0.1, ymax: 1.15 }); P.grid({ step: 1, stepY: 0.25 }); P.axes({ x: 'pH', y: 'rate' }); (o.enzymes || ['pepsin', 'amylase', 'trypsin']).forEach(function (e, i) { var E = B.ENZYMES[e]; P.plot(function (p) { return B.activity(p, E.pH, 1.6); }, { color: ['red', 'blue', 'purple', 'orange'][i] }); }); }
      if (mode === 'substrate') { var Vm = 1, Km = 2; P.set({ xmin: -0.6, xmax: 20.5, ymin: -0.08, ymax: 1.18 }); P.grid({ step: 2, stepY: 0.25 }); P.axes({ x: '[S]', y: 'rate' }); P.seg(0, Vm, 20.5, Vm, { color: 'gold', dash: [6, 5], width: 1.5 }); if (!F.quiet) P.text('Vmax', 18.5, Vm, { color: 'gold', dy: -10, bold: true }); P.plot(function (s) { return s < 0 ? NaN : B.michaelis(s, Vm, Km); }, { color: 'green' }); if (comp) P.plot(function (s) { return s < 0 ? NaN : B.michaelis(s, Vm, Km, { competitive: comp }); }, { color: 'blue', dash: [7, 5] }); if (non) P.plot(function (s) { return s < 0 ? NaN : B.michaelis(s, Vm, Km, { noncompetitive: non }); }, { color: 'red', dash: [3, 4] }); }
      if (mode === 'energy') { P.set({ xmin: 0, xmax: 10, ymin: -0.5, ymax: 6 }); P.axes({ labels: false, x: 'progress of reaction', y: 'energy' }); var R0 = 2, Pd = o.endergonic ? 3 : 1;
        P.plot(function (x) { var s = 1 / (1 + M.exp(-(x - 5) * 1.6)); return R0 + (Pd - R0) * s + 3.2 * M.exp(-M.pow((x - 5) / 1.2, 2)); }, { color: 'red' });
        P.plot(function (x) { var s = 1 / (1 + M.exp(-(x - 5) * 1.6)); return R0 + (Pd - R0) * s + 1.3 * M.exp(-M.pow((x - 5) / 1.2, 2)); }, { color: 'green', dash: [7, 5] });
        if (!F.quiet) { P.text('without enzyme', 6.3, 4.6, { color: 'red', bold: true, size: 13 }); P.text('with enzyme', 6.4, 2.9, { color: 'green', bold: true, size: 13 }); P.text('reactants', 0.4, R0 + 0.35, { size: 12 }); P.text('products', 8.2, Pd + 0.35, { size: 12 }); P.text('The enzyme lowers the hill (activation energy); ΔG stays the same.', 0.3, 5.6, { size: 12, color: 'muted' }); } }
      if (x0 !== undefined && mode !== 'energy') P.seg(x0, P.view().ymin, x0, P.view().ymax, { color: 'muted', dash: [4, 4], width: 1.5 });
    }
    c.onResize(draw2); V.onTheme(draw2); draw2();
    if (mode === 'ph' && !F.quiet) { var lgp = h('p', 'bv-legend'); lgp.innerHTML = (o.enzymes || ['pepsin', 'amylase', 'trypsin']).map(function (e, i) { var E = B.ENZYMES[e]; return '<span class="bv-key bv-s' + [5, 2, 3, 1][i] + '">' + esc(E.name) + ' (' + esc(E.where) + ', best near pH ' + E.pH + ')</span>'; }).join(' '); F.body.appendChild(lgp); }
    if (F.interactive && !F.quiet && mode === 'temp') V.slider(F.ctl, { label: 'optimum temperature', min: 20, max: 75, step: 1, value: opt, fmt: function (v) { return v + ' °C'; }, input: function (v) { opt = v; draw2(); } });
    if (F.interactive && !F.quiet && mode === 'substrate') { V.slider(F.ctl, { label: 'competitive inhibitor', min: 0, max: 4, step: 0.5, value: 0, input: function (v) { comp = v; draw2(); } }); V.slider(F.ctl, { label: 'noncompetitive inhibitor', min: 0, max: 2, step: 0.25, value: 0, input: function (v) { non = v; draw2(); } }); F.say('Green: no inhibitor. Blue dashed: a competitive inhibitor (enough substrate still reaches Vmax). Red dotted: a noncompetitive inhibitor (Vmax itself falls).'); }
    if (!F.quiet && mode === 'temp') F.say('Rate rises with temperature as molecules collide more often, then falls steeply above the optimum as the enzyme denatures.');
  });

  /* =========================== bi-molecule: water, polymers, macromolecules, protein structure =========================== */
  V.register('bi-molecule', function (el, o) {
    var mode = o.mode || 'water', F = frame(el, o, 'molecule', { water: 'Water molecules joined by hydrogen bonds', polymer: 'Monomers joined into a polymer', macro: 'The four kinds of large biological molecules', protein: 'The levels of protein structure', phospholipid: 'A phospholipid' }[mode]), showLab = !F.quiet || o.labels;
    var svg = svgRoot(600, 300, el.getAttribute('aria-label'), 'bv-mol'); F.body.appendChild(svg);
    if (mode === 'water') {
      var mols = [[150, 110, 20], [300, 80, -30], [450, 130, 160], [220, 220, 200], [380, 225, 60]];
      function hPos(m, side) { var a = m[2] * M.PI / 180, x = side * 30, y = 22; return [m[0] + x * M.cos(a) - y * M.sin(a), m[1] + x * M.sin(a) + y * M.cos(a)]; }
      var hb = sv('g', null, svg);
      [[0, 1], [0, 3], [1, 2], [3, 4], [2, 4], [4, 1]].forEach(function (p) { var A2 = mols[p[0]], O2 = mols[p[1]], best = null, bd = 1e9; [-1, 1].forEach(function (sd) { var q = hPos(A2, sd), d = M.hypot(q[0] - O2[0], q[1] - O2[1]); if (d < bd) { bd = d; best = q; } }); var ux = (O2[0] - best[0]) / bd, uy = (O2[1] - best[1]) / bd; sv('line', { x1: best[0] + ux * 13, y1: best[1] + uy * 13, x2: O2[0] - ux * 22, y2: O2[1] - uy * 22, class: 'bv-hbond' }, hb); });
      mols.forEach(function (m) { var g = sv('g', null, svg); [-1, 1].forEach(function (sd) { var q = hPos(m, sd); sv('line', { x1: m[0], y1: m[1], x2: q[0], y2: q[1], class: 'bv-bond' }, g); }); sv('circle', { cx: m[0], cy: m[1], r: 20, class: 'bv-O' }, g); [-1, 1].forEach(function (sd) { var q = hPos(m, sd); sv('circle', { cx: q[0], cy: q[1], r: 12, class: 'bv-H' }, g); if (showLab) txt(g, q[0] + (q[0] > m[0] ? 12 : -12), q[1] + (q[1] > m[1] ? 18 : -10), 'δ+', { class: 'bv-delta', 'text-anchor': 'middle' }); });
        if (showLab) { txt(g, m[0], m[1] + 6, 'O', { class: 'bv-atomt', 'text-anchor': 'middle' }); var a = m[2] * M.PI / 180; txt(g, m[0] + 30 * M.sin(a), m[1] - 30 * M.cos(a) + 5, 'δ−', { class: 'bv-delta', 'text-anchor': 'middle' }); } });
      if (showLab) F.say('Dashed lines: hydrogen bonds between molecules, from a slightly positive hydrogen (δ+) to a slightly negative oxygen (δ−). They are weak. Solid lines: the strong covalent bonds inside each molecule.');
      return;
    }
    if (mode === 'polymer') {
      var n = o.n || 4, joined = !!o.joined, G = sv('g', null, svg);
      function drawP() { G.innerHTML = ''; var sp = joined ? 92 : 120, x0 = 300 - (n - 1) * sp / 2; for (var i = 0; i < n; i++) { var x = x0 + i * sp; sv('path', { d: 'M' + (x - 30) + ',150 l15,-26 h30 l15,26 l-15,26 h-30z', class: 'bv-mono' }, G); if (!joined) { txt(G, x - 44, 158, 'H', { class: 'bv-atomt' }); txt(G, x + 32, 158, 'OH', { class: 'bv-atomt' }); } else if (i < n - 1) sv('line', { x1: x + 30, y1: 150, x2: x + sp - 30, y2: 150, class: 'bv-bond' }, G); }
        if (joined && showLab) { for (var j = 0; j < n - 1; j++) { var wx = x0 + j * sp + sp / 2; txt(G, wx, 220 + (j % 2) * 26, 'H₂O', { class: 'bv-water', 'text-anchor': 'middle' }); } }
        if (showLab) F.say(joined ? '<b>Dehydration synthesis:</b> each new bond releases one water molecule (' + (n - 1) + ' for ' + n + ' monomers).' : '<b>Hydrolysis:</b> adding a water molecule breaks each bond, freeing the monomers.'); }
      drawP();
      if (F.interactive && !F.quiet) { btn(F.ctl, 'Dehydration synthesis (join)', function () { joined = true; drawP(); }); btn(F.ctl, 'Hydrolysis (split)', function () { joined = false; drawP(); }); }
      return;
    }
    if (mode === 'macro') {
      var cols = [['carbohydrate', '#f2c230'], ['lipid', '#e8925a'], ['protein', '#7a9ad8'], ['nucleic', '#9ad06a']];
      cols.forEach(function (c, i) { var x = 12 + i * 147, g = sv('g', { transform: 'translate(' + x + ',30)' }, svg); sv('rect', { width: 138, height: 240, rx: 14, class: 'bv-macro-card' }, g);
        if (c[0] === 'carbohydrate') for (var k2 = 0; k2 < 4; k2++) sv('path', { d: 'M' + (20 + k2 * 26) + ',70 l8,-12 h14 l8,12 l-8,12 h-14z', fill: c[1], class: 'o' }, g);
        if (c[0] === 'lipid') { sv('rect', { x: 18, y: 40, width: 22, height: 60, rx: 4, fill: c[1], class: 'o' }, g); [48, 70, 92].forEach(function (y) { sv('path', { d: 'M40,' + (y - 6) + ' l12,-6 l12,6 l12,-6 l12,6 l12,-6 l12,6', fill: 'none', stroke: c[1], 'stroke-width': 4 }, g); }); }
        if (c[0] === 'protein') sv('path', { d: 'M20,60 q20,-30 40,0 t40,0 q10,30 -20,40 t-40,0', fill: 'none', stroke: c[1], 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
        if (c[0] === 'nucleic') for (var k3 = 0; k3 < 5; k3++) { sv('circle', { cx: 22 + k3 * 22, cy: 50, r: 7, fill: '#f2c230', class: 'o' }, g); sv('rect', { x: 16 + k3 * 22, y: 62, width: 12, height: 22, fill: c[1], class: 'o' }, g); }
        if (showLab) { var Mm = B.MACRO[c[0]]; txt(g, 69, 130, cap1(Mm.name), { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); var words = ('Units: ' + Mm.monomer).split(' '), lines = [''], y0 = 152; words.forEach(function (w) { if ((lines[lines.length - 1] + ' ' + w).length > 20) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }); lines.slice(0, 5).forEach(function (L, j) { txt(g, 10, y0 + j * 16, L, { class: 'bv-sub' }); }); }
        else txt(g, 69, 130, letter(i), { class: 'bv-lab', 'text-anchor': 'middle' }); });
      return;
    }
    if (mode === 'protein') {
      var lv = o.level || 1, G2 = sv('g', null, svg);
      function drawL() { G2.innerHTML = ''; var cl = ['#7a9ad8', '#e8925a', '#9ad06a', '#f2c230', '#c97ad8'];
        if (lv === 1) { for (var i = 0; i < 12; i++) { sv('circle', { cx: 50 + i * 46, cy: 150, r: 17, fill: cl[(i * 7) % 5], class: 'o' }, G2); if (i < 11) sv('line', { x1: 67 + i * 46, y1: 150, x2: 79 + i * 46, y2: 150, class: 'bv-bond' }, G2); } }
        if (lv === 2) { var d = 'M40,150'; for (var j = 0; j < 8; j++) d += ' c10,-50 30,-50 30,0 s-20,50 -10,0'; sv('path', { d: d, fill: 'none', stroke: '#7a9ad8', 'stroke-width': 7 }, G2); for (var k = 0; k < 4; k++) { var yk = 90 + k * 30; sv('path', { d: k % 2 ? 'M540,' + (yk - 6) + ' H360 V' + (yk - 12) + ' L336,' + yk + ' L360,' + (yk + 12) + ' V' + (yk + 6) + ' H540 Z' : 'M330,' + (yk - 6) + ' H510 V' + (yk - 12) + ' L534,' + yk + ' L510,' + (yk + 12) + ' V' + (yk + 6) + ' H330 Z', fill: '#e8925a', class: 'o' }, G2); } if (showLab) { txt(G2, 60, 240, 'α-helix', { class: 'bv-lab' }); txt(G2, 380, 240, 'β-pleated sheet', { class: 'bv-lab' }); } }
        if (lv === 3) sv('path', { d: 'M150,200 c-60,-40 -20,-140 60,-120 c80,20 20,80 90,90 c80,10 120,-90 60,-120 c-50,-26 -60,60 -110,90 c-50,30 -10,110 70,90', fill: 'none', stroke: '#7a9ad8', 'stroke-width': 9, 'stroke-linecap': 'round' }, G2);
        if (lv === 4) { sv('path', { d: 'M130,190 c-50,-30 -20,-110 50,-100 c60,10 20,60 70,70 c40,6 30,60 -20,60z', fill: 'none', stroke: '#7a9ad8', 'stroke-width': 9 }, G2); sv('path', { d: 'M330,190 c-50,-30 -20,-110 50,-100 c60,10 20,60 70,70 c40,6 30,60 -20,60z', fill: 'none', stroke: '#e8925a', 'stroke-width': 9 }, G2); sv('path', { d: 'M230,250 c-40,-20 -10,-80 40,-70 c50,10 30,50 60,60', fill: 'none', stroke: '#9ad06a', 'stroke-width': 9 }, G2); }
        if (showLab) txt(G2, 300, 30, ['', 'Primary: the sequence of amino acids', 'Secondary: helices and sheets held by backbone hydrogen bonds', 'Tertiary: the whole chain folded by R-group interactions', 'Quaternary: two or more chains together'][lv], { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
      drawL();
      if (F.interactive && !F.quiet) V.seg(F.ctl, { label: 'Level', items: [[1, 'Primary'], [2, 'Secondary'], [3, 'Tertiary'], [4, 'Quaternary']], value: lv, change: function (v) { lv = +v; drawL(); } });
      return;
    }
    if (mode === 'phospholipid') { svg.insertAdjacentHTML('beforeend', '<circle cx="300" cy="80" r="40" class="bv-head"/><path d="M286,120 V260 M314,120 Q330,190 314,260" class="bv-tail" stroke-width="10"/>'); if (showLab) { txt(svg, 360, 84, 'hydrophilic head (phosphate): faces water', { class: 'bv-lab bv-lab-sm' }); txt(svg, 340, 200, 'two hydrophobic fatty acid tails', { class: 'bv-lab bv-lab-sm' }); } }
  });
  /* =========================== bi-punnett: Punnett squares =========================== */
  function fmtG(g) { return esc(g).replace(/X([A-Za-z])/g, 'X<sup>$1</sup>').replace(/I([AB])/g, 'I<sup>$1</sup>'); }
  B.fmtGenotype = fmtG;
  V.register('bi-punnett', function (el, o) {
    var p1 = o.p1 || 'Aa', p2 = o.p2 || 'Aa', dom = o.dominance || 'complete', X = B.cross(p1, p2, dom), mode = o.mode || 'show';
    var F = frame(el, o, 'punnett', 'A Punnett square for ' + p1 + ' × ' + p2), traits = o.traits || {};
    var phNames = {}; Object.keys(X.phenotypes).forEach(function (k, i) { phNames[k] = i; });
    function phName(g) {
      var key = B.pheno(g, dom); if (o.phenoNames && o.phenoNames[key]) return o.phenoNames[key];
      return key.split('/').map(function (v, gi) { var gene = B.genes(g)[gi], L = gene.filter(function (a) { return !B.isYchr(a, gene); }); var base = (L[0] || '').replace(/^X/, ''); var lk = base.toLowerCase(), up = base.toUpperCase(); if (v === 'dom') return traits[up] || traits['X' + up] || 'dominant'; if (v === 'rec') return traits[lk] || traits['X' + lk] || 'recessive'; if (v === 'het') return traits.het || 'in between'; return 'type ' + v; }).join(', ');
    }
    var tbl = h('table', 'bv-pun' + (X.top.length > 2 ? ' bv-pun-big' : '')), head = h('tr'); head.appendChild(h('th', 'bv-pun-corner', '<span>' + fmtG(p1) + ' ×<br>' + fmtG(p2) + '</span>'));
    X.top.forEach(function (g) { head.appendChild(h('th', 'bv-pun-g', fmtG(g))); }); tbl.appendChild(head);
    var cells = [], choices = Object.keys(X.genotypes);
    X.grid.forEach(function (row, r) {
      var tr = h('tr'); tr.appendChild(h('th', 'bv-pun-g', fmtG(X.side[r])));
      row.forEach(function (g, c) {
        var td = h('td', 'bv-pun-c'), asked = o.ask && o.ask[0] === r && o.ask[1] === c, empty = o.empty || mode === 'fill' || mode === 'empty';
        if (asked) td.innerHTML = '<b class="bv-asklab">?</b>';
        else if (mode === 'fill' && F.interactive && !F.quiet) { var b = h('button', 'bv-pun-btn', '…'); b.type = 'button'; b.dataset.i = -1; b.addEventListener('click', function () { var i = (+b.dataset.i + 1) % choices.length; b.dataset.i = i; b.innerHTML = fmtG(choices[i]); b.dataset.g = choices[i]; td.classList.remove('ok', 'no'); }); td.appendChild(b); cells.push([b, g, td]); }
        else if (!empty) { td.innerHTML = fmtG(g); if (!F.quiet || o.colors) td.classList.add('bv-ph' + phNames[B.pheno(g, dom)]); }
        tr.appendChild(td);
      });
      tbl.appendChild(tr);
    });
    var wrap = h('div', 'bv-pun-wrap'); wrap.appendChild(tbl); F.body.appendChild(wrap);
    function summary() {
      var gk = Object.keys(X.genotypes).sort(function (a, b) { return B.canon(a) < B.canon(b) ? -1 : 1; }), pk = Object.keys(X.phenotypes);
      return '<b>Genotypes:</b> ' + gk.map(function (g) { return X.genotypes[g] + ' ' + fmtG(g); }).join(', ') + ' (' + B.ratio(gk.map(function (g) { return X.genotypes[g]; })) + ')' +
        '<br><b>Phenotypes:</b> ' + pk.map(function (p) { var g0 = gk.filter(function (g) { return B.pheno(g, dom) === p; })[0]; return '<span class="bv-ph' + phNames[p] + ' bv-chip">' + X.phenotypes[p] + ' ' + esc(phName(g0)) + '</span>'; }).join(' ') + ' (' + B.ratio(pk.map(function (p) { return X.phenotypes[p]; })) + ') out of ' + X.total + ' boxes';
    }
    if (mode === 'show' && !F.quiet && !o.empty) F.say(summary());
    if (mode === 'fill' && F.interactive && !F.quiet) {
      F.say('Tap each box to choose its genotype: one allele from the top, one from the side.');
      btn(F.ctl, 'Check', function () { var bad = 0; cells.forEach(function (c) { var ok = c[0].dataset.g === c[1]; c[2].classList.toggle('ok', ok); c[2].classList.toggle('no', !ok); if (!ok) bad++; }); F.say(bad ? okMark(false) + ' ' + plural(bad, 'box', 'boxes') + ' to fix.' : okMark(true) + ' ' + summary()); }, 'pri');
      btn(F.ctl, 'Show me', function () { cells.forEach(function (c) { c[0].innerHTML = fmtG(c[1]); c[0].dataset.g = c[1]; c[2].classList.add('bv-ph' + phNames[B.pheno(c[1], dom)]); }); F.say(summary()); });
    }
  });

  /* =========================== bi-pedigree: a family pedigree =========================== */
  // people: [{ id, sex: 'm' | 'f', aff: true, carrier: true, gen: 1, parents: [id, id], label, g (genotype) }]; listed in order within each generation
  V.register('bi-pedigree', function (el, o) {
    var ppl = o.people || [], F = frame(el, o, 'pedigree', 'A pedigree of ' + ppl.length + ' people across ' + (ppl.reduce(function (m, p) { return M.max(m, p.gen); }, 1)) + ' generations. Squares are males, circles are females, shaded means the trait shows.');
    var byId = {}, gens = {}; ppl.forEach(function (p) { byId[p.id] = p; (gens[p.gen] = gens[p.gen] || []).push(p); });
    var G = Object.keys(gens).map(Number).sort(), W0 = 600, rowH = 120, H0 = 30 + G.length * rowH, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-ped'); F.body.appendChild(svg);
    var pos = {}, R = 18, roman = ['I', 'II', 'III', 'IV', 'V'];
    G.forEach(function (g, gi) { var row = gens[g], n = row.length; row.forEach(function (p, i) { pos[p.id] = [p.x !== undefined ? 60 + p.x * (W0 - 90) : 70 + (W0 - 110) * (n === 1 ? 0.5 : i / (n - 1)) * (n <= 2 ? 0.5 : 1) + (n <= 2 ? (W0 - 110) * 0.25 : 0), 50 + gi * rowH]; }); txt(svg, 14, 56 + gi * rowH, roman[gi] || String(g), { class: 'bv-ped-gen' }); });
    // couples: pairs of parents of anyone
    var couples = {}; ppl.forEach(function (p) { if (p.parents) { var k = p.parents.slice().sort().join('+'); (couples[k] = couples[k] || []).push(p.id); } });
    Object.keys(couples).forEach(function (k) {
      var pr = k.split('+'), a = pos[pr[0]], b = pos[pr[1]]; if (!a || !b) return;
      sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'bv-ped-line' }, svg);
      var mx = (a[0] + b[0]) / 2, my = a[1], kids = couples[k].map(function (id) { return pos[id]; }), ky = kids[0][1] - 40;
      sv('line', { x1: mx, y1: my, x2: mx, y2: ky, class: 'bv-ped-line' }, svg);
      var xs = kids.map(function (q) { return q[0]; }).concat([mx]); sv('line', { x1: M.min.apply(null, xs), y1: ky, x2: M.max.apply(null, xs), y2: ky, class: 'bv-ped-line' }, svg);
      kids.forEach(function (q) { sv('line', { x1: q[0], y1: ky, x2: q[0], y2: q[1] - R, class: 'bv-ped-line' }, svg); });
    });
    ppl.forEach(function (p, i) {
      var q = pos[p.id], g = sv('g', { class: 'bv-ped-p' + (p.aff ? ' aff' : ''), transform: 'translate(' + q[0] + ',' + q[1] + ')' }, svg);
      if (p.sex === 'm') sv('rect', { x: -R, y: -R, width: 2 * R, height: 2 * R, class: 'bv-ped-shape' }, g); else sv('circle', { r: R, class: 'bv-ped-shape' }, g);
      if (p.carrier && !p.aff && (o.carriers !== false) && !(F.quiet && o.hideCarriers)) sv('circle', { r: 5, class: 'bv-ped-dot' }, g);
      var lab = p.label || ((roman[G.indexOf(p.gen)] || '') + '-' + (gens[p.gen].indexOf(p) + 1));
      txt(g, 0, R + 16, lab, { class: 'bv-ped-lab', 'text-anchor': 'middle' });
      if (p.g && (o.genotypes || (!F.quiet && o.genotypes !== false && p.showG))) txt(g, 0, R + 32, p.g, { class: 'bv-ped-g', 'text-anchor': 'middle' });
      if (o.ask === p.id) txt(g, R + 4, -R + 2, '?', { class: 'bv-askt' });
    });
    if (!F.quiet && o.key !== false) F.body.appendChild(h('p', 'bv-legend', '<span class="bv-ped-k sq"></span> male <span class="bv-ped-k ci"></span> female <span class="bv-ped-k sh"></span> has the trait' + (ppl.some(function (p) { return p.carrier; }) ? ' <span class="bv-ped-k dt"></span> carrier' : '')));
  });

  /* =========================== bi-dna: base pairing, replication, the double helix, nucleotides =========================== */
  var BASECLS = { A: 'bA', T: 'bT', G: 'bG', C: 'bC', U: 'bU' };
  V.register('bi-dna', function (el, o) {
    var seq = String(o.seq || 'ATGCGTAC').toUpperCase(), comp = B.complement(seq), mode = o.mode || 'pair', n = seq.length;
    var F = frame(el, o, 'dna', { pair: 'A DNA strand ' + seq + ' and its complementary strand', fill: 'Build the complementary strand of ' + seq, replicate: 'DNA replication: the helix unzips and each strand is a template', helix: 'The DNA double helix', nucleotide: 'A nucleotide: phosphate, sugar and base' }[mode]);
    if (mode === 'helix') {
      var svg = svgRoot(600, 260, el.getAttribute('aria-label'), 'bv-helix'); F.body.appendChild(svg); var ph = 0, G = sv('g', null, svg);
      function drawH() { G.innerHTML = ''; var pts1 = [], pts2 = []; for (var i = 0; i <= 120; i++) { var x = 20 + i * 4.7, a = i * 0.16 + ph; pts1.push([x, 130 + 80 * M.sin(a)]); pts2.push([x, 130 - 80 * M.sin(a)]); }
        for (var j = 0; j < 120; j += 5) { var p = pts1[j], q = pts2[j], b = seq[(j / 5) % n]; sv('line', { x1: p[0], y1: p[1], x2: p[0], y2: (p[1] + q[1]) / 2, class: 'bv-rung ' + BASECLS[b] }, G); sv('line', { x1: q[0], y1: (p[1] + q[1]) / 2, x2: q[0], y2: q[1], class: 'bv-rung ' + BASECLS[B.complement(b)] }, G); }
        sv('polyline', { points: pts1.map(function (p) { return p.join(','); }).join(' '), class: 'bv-backbone' }, G); sv('polyline', { points: pts2.map(function (p) { return p.join(','); }).join(' '), class: 'bv-backbone b2' }, G);
        if (!F.quiet) { txt(G, 20, 252, 'Sugar-phosphate backbones outside; base pairs inside: A with T, G with C', { class: 'bv-lab bv-lab-sm' }); } }
      drawH(); if (!V.reduced && F.interactive) V.loop(el, function (dt) { ph += dt * 0.8; drawH(); });
      return;
    }
    if (mode === 'nucleotide') {
      var s2 = svgRoot(600, 220, el.getAttribute('aria-label'), 'bv-nuc'); F.body.appendChild(s2);
      s2.insertAdjacentHTML('beforeend', '<circle cx="140" cy="110" r="34" class="bv-phos"/><line x1="174" y1="110" x2="236" y2="110" class="bv-bond"/><path d="M236,110 l30,-34 h44 l16,34 l-30,30 h-44z" class="bv-sugar"/><line x1="326" y1="110" x2="390" y2="110" class="bv-bond"/><rect x="390" y="78" width="80" height="64" rx="10" class="bv-base bA"/>');
      if (!F.quiet || o.labels) { txt(s2, 140, 116, 'P', { class: 'bv-atomt dark', 'text-anchor': 'middle' }); [['phosphate', 140, 172], ['sugar', 280, 172], ['base', 430, 172]].forEach(function (L) { txt(s2, L[1], L[2], L[0], { class: 'bv-lab', 'text-anchor': 'middle' }); }); txt(s2, 300, 204, 'Sugar: deoxyribose in DNA, ribose in RNA. Base: A, T, G or C (U instead of T in RNA).', { class: 'bv-sub', 'text-anchor': 'middle' }); }
      return;
    }
    var stepI = mode === 'replicate' ? 0 : -1, grid = h('div', 'bv-dna'), fillSel = [];
    F.body.appendChild(grid);
    function row(cls, letters, opts) { var r = h('div', 'bv-dna-row ' + cls); if (opts && opts.lab) r.appendChild(h('span', 'bv-dna-end', opts.lab[0])); letters.forEach(function (b, i) { var c = typeof b === 'object' ? b : h('span', 'bv-base-t ' + (BASECLS[b] || 'bq'), b); r.appendChild(c); }); if (opts && opts.lab) r.appendChild(h('span', 'bv-dna-end', opts.lab[1])); return r; }
    function rungs(k, show) { var r = h('div', 'bv-dna-row bv-dna-rungs'); r.appendChild(h('span', 'bv-dna-end', '')); for (var i = 0; i < n; i++) r.appendChild(h('span', 'bv-rung-t' + (show(i) ? '' : ' off'), show(i) ? (seq[i] === 'G' || seq[i] === 'C' ? '⋮' : ':') : '')); r.appendChild(h('span', 'bv-dna-end', '')); return r; }
    var ends = o.ends !== false ? [["5′", "3′"], ["3′", "5′"]] : null;
    function draw() {
      grid.innerHTML = '';
      if (mode === 'pair' || mode === 'fill') {
        grid.appendChild(row('', seq.split(''), { lab: ends && ends[0] }));
        grid.appendChild(rungs(0, function () { return true; }));
        if (mode === 'fill' && F.interactive && !F.quiet) { var cs = []; for (var i = 0; i < n; i++) { (function (i) { var b = h('button', 'bv-base-t bq', '?'); b.type = 'button'; b.dataset.v = ''; b.addEventListener('click', function () { var nx = { '': 'A', A: 'T', T: 'G', G: 'C', C: 'A' }[b.dataset.v]; b.dataset.v = nx; b.textContent = nx; b.className = 'bv-base-t ' + BASECLS[nx]; }); cs.push(b); fillSel[i] = b; })(i); } grid.appendChild(row('', cs, { lab: ends && ends[1] })); }
        else grid.appendChild(row('', comp.split('').map(function (b, i) { return F.quiet && (o.ask === undefined || o.ask === 'all' || o.ask === i) ? '?' : b; }), { lab: ends && ends[1] }));
      }
      if (mode === 'replicate') {
        var k = stepI; // 0: double helix; 1: unzipped; 2: half built; 3: two copies
        var built = k <= 1 ? 0 : k === 2 ? M.ceil(n / 2) : n;
        if (k === 0) { grid.appendChild(row('', seq.split(''), { lab: ends && ends[0] })); grid.appendChild(rungs(0, function () { return true; })); grid.appendChild(row('', comp.split(''), { lab: ends && ends[1] })); }
        else {
          var c1 = h('div', 'bv-dna-copy'), c2 = h('div', 'bv-dna-copy');
          c1.appendChild(row('old', seq.split(''), { lab: ends && ends[0] })); c1.appendChild(rungs(0, function (i) { return i < built; })); c1.appendChild(row('new', comp.split('').map(function (b, i) { return i < built ? b : '·'; }), { lab: ends && ends[1] }));
          c2.appendChild(row('new', seq.split('').map(function (b, i) { return i < built ? b : '·'; }), { lab: ends && ends[0] })); c2.appendChild(rungs(0, function (i) { return i < built; })); c2.appendChild(row('old', comp.split(''), { lab: ends && ends[1] }));
          grid.appendChild(c1); grid.appendChild(h('div', 'bv-dna-gap', k === 1 ? 'helicase unzips ↕' : '')); grid.appendChild(c2);
        }
      }
    }
    draw();
    if (mode === 'replicate' && F.interactive) stepper(F.ctl, 4, function (i) { stepI = i; draw(); if (!F.quiet) F.say(['The double helix, with its two strands paired.', 'Helicase unzips the two strands by breaking the hydrogen bonds between bases.', 'DNA polymerase adds matching nucleotides to each old strand: A with T, G with C.', 'Two identical DNA molecules, each with one old strand (dark) and one new strand (light): semiconservative replication.'][i]); }, { label: function (i) { return ['Start', 'Unzip', 'Build', 'Done'][i]; } });
    if (mode === 'fill' && F.interactive && !F.quiet) {
      F.say('Tap each box to choose the base that pairs with the one above it.');
      btn(F.ctl, 'Check', function () { var bad = 0; fillSel.forEach(function (b, i) { var ok = b.dataset.v === comp[i]; b.classList.toggle('no', !ok); if (!ok) bad++; }); F.say(bad ? okMark(false) + ' ' + plural(bad, 'base') + ' to fix. Remember: A pairs with T, G pairs with C.' : okMark(true) + ' The complementary strand is ' + comp + '.'); }, 'pri');
    }
    if (mode === 'pair' && !F.quiet) F.say('A pairs with T (two hydrogen bonds) and G pairs with C (three). The strands run in opposite directions (antiparallel).');
  });

  /* =========================== bi-central: transcription, translation and the codon table =========================== */
  function codonTable(parent, hi, F) {
    var t = h('table', 'bv-codons'), L = 'UCAG', hdr = h('tr'); hdr.appendChild(h('th', '', '1st')); for (var a = 0; a < 4; a++) hdr.appendChild(h('th', '', '2nd: ' + L[a])); hdr.appendChild(h('th', '', '3rd')); t.appendChild(hdr);
    for (var i = 0; i < 4; i++) { var tr = h('tr'); tr.appendChild(h('th', 'bv-cod-1', L[i])); for (var j = 0; j < 4; j++) { var td = h('td'); for (var k = 0; k < 4; k++) { var cd = L[i] + L[j] + L[k], aa = B.CODE[cd], sp = h('span', 'bv-cod' + (hi && hi.indexOf(cd) >= 0 ? ' hi' : '') + (aa === '*' ? ' stop' : cd === 'AUG' ? ' start' : ''), cd + ' ' + B.three(aa)); td.appendChild(sp); } tr.appendChild(td); } var th3 = h('th', 'bv-cod-3', 'U<br>C<br>A<br>G'); tr.appendChild(th3); t.appendChild(tr); }
    var w = h('div', 'bv-cod-wrap'); w.appendChild(t); parent.appendChild(w); return t;
  }
  V.register('bi-central', function (el, o) {
    var mode = o.mode || 'both', F = frame(el, o, 'central', { transcribe: 'Transcription: DNA to mRNA', translate: 'Translation: mRNA to protein', both: 'From DNA to mRNA to protein', table: 'The genetic code: the codon table', mutation: 'A mutation and its effect on the protein' }[mode]);
    if (mode === 'table') { codonTable(F.body, o.highlight || [], F); if (!F.quiet) F.say('Read the first base on the left, the second across the top, the third down the right. AUG (methionine) starts; UAA, UAG and UGA stop.'); return; }
    var tmpl = o.template ? String(o.template).toUpperCase() : null, coding = o.coding ? String(o.coding).toUpperCase() : null, mrna = o.mrna ? String(o.mrna).toUpperCase() : null;
    if (!mrna) mrna = tmpl ? B.transcribe(tmpl) : coding ? B.codingToMRNA(coding) : 'AUGGCUUUCGGAUAA';
    if (!tmpl && mode !== 'translate') tmpl = B.complement(mrna.replace(/U/g, 'T'));
    var start = o.fromStart === false ? 0 : M.max(0, mrna.indexOf('AUG')), cods = B.codons(mrna, start), aas = []; for (var i = 0; i < cods.length; i++) { var a = B.CODE[cods[i]]; aas.push(a); if (a === '*') break; }
    var box = h('div', 'bv-cd'); F.body.appendChild(box);
    function strand(lab, letters, ends, cls) { var r = h('div', 'bv-cd-row ' + (cls || '')); r.appendChild(h('span', 'bv-cd-lab', lab)); var s = h('span', 'bv-cd-seq'); if (ends) s.appendChild(h('span', 'bv-dna-end', ends[0])); letters.forEach(function (x) { s.appendChild(x); }); if (ends) s.appendChild(h('span', 'bv-dna-end', ends[1])); r.appendChild(s); box.appendChild(r); return r; }
    var shown = o.steps === false || F.quiet ? cods.length : 0, hideOut = F.quiet ? (o.ask || 'out') : null;
    function draw() {
      box.innerHTML = '';
      if (mode === 'transcribe' || mode === 'both' || mode === 'mutation') {
        strand('DNA template', tmpl.split('').map(function (b) { return h('span', 'bv-base-t ' + BASECLS[b], b); }), ["3′", "5′"]);
        strand('mRNA', mrna.split('').map(function (b, i) { var vis = (mode === 'transcribe' ? i < shown * 3 + start || shown >= cods.length : true) && !(hideOut === 'mrna' || (hideOut === 'out' && mode === 'transcribe')); return h('span', 'bv-base-t ' + (vis ? BASECLS[b] : 'bq'), vis ? b : '?'); }), ["5′", "3′"], 'bv-cd-mrna');
      }
      if (mode === 'translate') strand('mRNA', mrna.split('').map(function (b, i) { var inC = i >= start && (i - start) < cods.length * 3, ci = M.floor((i - start) / 3); return h('span', 'bv-base-t ' + BASECLS[b] + (inC && ci % 2 ? ' alt' : ''), b); }), ["5′", "3′"]);
      if (mode !== 'transcribe') {
        var r = h('div', 'bv-cd-row bv-cd-aa'); r.appendChild(h('span', 'bv-cd-lab', 'protein')); var s = h('span', 'bv-cd-seq');
        s.appendChild(h('span', 'bv-dna-end', '')); for (var p = 0; p < start; p++) s.appendChild(h('span', 'bv-aa-pad', ''));
        aas.forEach(function (a, i) { var vis = i < shown && !(hideOut === 'out' || hideOut === 'protein' || hideOut === i); s.appendChild(h('span', 'bv-aa' + (a === '*' ? ' stop' : '') + (vis ? '' : ' q'), vis ? (a === '*' ? 'Stop' : B.three(a)) : (hideOut === i || hideOut === 'out' || hideOut === 'protein' ? '?' : ''))); });
        r.appendChild(s); box.appendChild(r);
      }
    }
    if (mode === 'mutation') {
      var m2 = String(o.mutant || mrna).toUpperCase(), c2 = B.codons(m2, start), a2 = []; for (var j = 0; j < c2.length; j++) { var b2 = B.CODE[c2[j]] || '?'; a2.push(b2); if (b2 === '*') break; }
      shown = cods.length; draw();
      var box2 = h('div', 'bv-cd bv-cd-mut'); F.body.appendChild(box2);
      var r1 = h('div', 'bv-cd-row'); r1.appendChild(h('span', 'bv-cd-lab', 'mutated mRNA')); var s1 = h('span', 'bv-cd-seq'); s1.appendChild(h('span', 'bv-dna-end', "5′")); m2.split('').forEach(function (b, i) { s1.appendChild(h('span', 'bv-base-t ' + BASECLS[b] + (b !== mrna[i] ? ' changed' : ''), b)); }); r1.appendChild(s1); box2.appendChild(r1);
      var r2 = h('div', 'bv-cd-row bv-cd-aa'); r2.appendChild(h('span', 'bv-cd-lab', 'protein')); var s3 = h('span', 'bv-cd-seq'); s3.appendChild(h('span', 'bv-dna-end', '')); for (var q = 0; q < start; q++) s3.appendChild(h('span', 'bv-aa-pad', '')); a2.forEach(function (a, i) { var vis = !F.quiet; s3.appendChild(h('span', 'bv-aa' + (a === '*' ? ' stop' : '') + (vis && a !== aas[i] ? ' changed' : '') + (vis ? '' : ' q'), vis ? (a === '*' ? 'Stop' : B.three(a)) : '?')); }); r2.appendChild(s3); box2.appendChild(r2);
      if (!F.quiet) { var t = B.mutationType(mrna.slice(start), m2.slice(start)); F.say('This is a <b>' + t + '</b> mutation. ' + { silent: 'The codon changed but still codes for the same amino acid.', missense: 'One amino acid is replaced by another.', nonsense: 'A codon became a stop codon, so the protein is cut short.', frameshift: 'A base was added or lost, so every codon after it is read in a new frame.' }[t]); }
      if (o.table) codonTable(F.body, [], F);
      return;
    }
    draw();
    if (F.interactive && !F.quiet && o.steps !== false) {
      stepper(F.ctl, cods.length + 1, function (i) { shown = i; draw(); if (i === 0) F.say(mode === 'translate' ? 'The ribosome starts at the start codon, AUG.' : 'RNA polymerase reads the template strand.'); else { var cd = cods[i - 1], a = B.CODE[cd]; F.say(mode === 'transcribe' ? 'Template ' + B.complement(cd.replace(/U/g, 'T')) + ' → mRNA <b>' + cd + '</b> (A→U, T→A, G→C, C→G).' : 'Codon <b>' + cd + '</b> → ' + (a === '*' ? '<b>stop</b>: the protein is released.' : 'a tRNA with anticodon ' + B.complement(cd).replace(/T/g, 'U') + ' brings <b>' + B.AA[a][1] + '</b> (' + B.three(a) + ').')); } }, { label: function (i) { return i === 0 ? 'Start' : 'Codon ' + i + ' of ' + cods.length; } });
    } else if (!F.quiet) { shown = cods.length; draw(); }
    if (o.table && mode !== 'transcribe') codonTable(F.body, o.highlight || [], F);
  });

  /* =========================== bi-gel: gel electrophoresis =========================== */
  V.register('bi-gel', function (el, o) {
    var lanes = o.lanes || [{ name: 'Sample', bands: [3000, 800] }], ladder = o.ladder !== false, L = ladder ? [{ name: 'Ladder', bands: o.ladderBands || B.LADDER, ladder: true }].concat(lanes) : lanes;
    var F = frame(el, o, 'gel', 'A gel with ' + L.length + ' lanes. DNA moves from the wells toward the positive end; shorter pieces move farther.');
    var W0 = 600, H0 = 360, top = 50, bot = 330, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-gel'); F.body.appendChild(svg);
    var lw = M.min(90, (W0 - 120) / L.length), x0 = 70 + ((W0 - 100) - lw * L.length) / 2, t = o.mode === 'run' && !V.reduced && F.interactive ? 0 : 1, G = sv('g', null, svg);
    function draw() {
      G.innerHTML = ''; sv('rect', { x: 60, y: 30, width: W0 - 90, height: 310, rx: 8, class: 'bv-gelbg' }, G);
      txt(G, 20, 46, '−', { class: 'bv-pole' }); txt(G, 18, 336, '+', { class: 'bv-pole' });
      L.forEach(function (ln, i) {
        var x = x0 + i * lw; sv('rect', { x: x + 8, y: top - 12, width: lw - 16, height: 8, class: 'bv-well' }, G);
        txt(G, x + lw / 2, 22, F.quiet && o.hideNames ? letter(i) : ln.name, { class: 'bv-gel-lane', 'text-anchor': 'middle' });
        ln.bands.forEach(function (bp) { var y = top + (bot - top) * B.gelPos(bp) * t; sv('rect', { x: x + 10, y: y - 3, width: lw - 20, height: 6, rx: 2, class: 'bv-band' + (ln.ladder ? ' lad' : '') }, G); if (ln.ladder && t === 1 && (o.sizes !== false)) txt(G, x0 - 6, y + 4, bp >= 1000 ? (bp / 1000) + ' kb' : bp + ' bp', { class: 'bv-tick', 'text-anchor': 'end' }); else if (!ln.ladder && t === 1 && !F.quiet && o.labelBands) txt(G, x + lw - 6, y - 5, bp + ' bp', { class: 'bv-tick', 'text-anchor': 'end' }); });
      });
    }
    draw();
    if (t < 1 && F.interactive) { var lp = V.loop(el, function (dt) { t = M.min(1, t + dt * 0.35); draw(); if (t >= 1) lp.stop(); }); btn(F.ctl, 'Run again', function () { t = 0; lp.start(); }); }
    if (!F.quiet) F.say('Read sizes against the ladder. Distance is roughly proportional to the logarithm of size: each halving of size moves a band about the same distance farther.');
  });
  /* =========================== bi-mitosis and bi-meiosis: chromosomes through cell division =========================== */
  var PAIRC = [['#2f6fc0', '#8fb8ea'], ['#d0661e', '#f2b07a'], ['#2f8a4a', '#94d0a4']]; // each pair: two homologs (one from each parent), dark and light
  var PAIRL = [74, 56, 40];
  function chromatid(g, x, y, ang, L, col, tip) { // a rod centered at its centromere point (x, y); tip: the end segment in another color
    var t = sv('g', { transform: 'translate(' + x + ',' + y + ') rotate(' + ang + ')' }, g);
    sv('rect', { x: -4.5, y: -L / 2, width: 9, height: L, rx: 4.5, fill: col, class: 'bv-chr' }, t);
    if (tip) sv('rect', { x: -4.5, y: L / 2 - L * 0.32, width: 9, height: L * 0.32, rx: 4.5, fill: tip }, t);
    return t;
  }
  function xchrom(g, x, y, ang, L, col, tips) { // a duplicated chromosome: two sister chromatids joined at the centromere
    chromatid(g, x - 4.5, y, ang - 8, L, col, tips && tips[0]); chromatid(g, x + 4.5, y, ang + 8, L, col, tips && tips[1]);
    sv('circle', { cx: x, cy: y, r: 4, class: 'bv-centromere' }, g);
  }
  function cellShape(g, cx, cy, rx, ry, cls) { sv('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, class: 'bv-dcell ' + (cls || '') }, g); }
  function nucleus(g, cx, cy, r, dashed) { sv('circle', { cx: cx, cy: cy, r: r, class: 'bv-nuc' + (dashed ? ' dashed' : '') }, g); }
  function fiber(g, x1, y1, x2, y2) { sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: 'bv-fiber' }, g); }
  function loose(g, cx, cy, r, pairs, seed) { var rr = seeded(seed); for (var p = 0; p < pairs; p++) for (var hh = 0; hh < 2; hh++) { var a = rr() * 6.28, d = rr() * r * 0.5, x = cx + M.cos(a) * d, y = cy + M.sin(a) * d, s = 'M' + x + ',' + y; for (var k = 0; k < 4; k++) s += ' q' + ((rr() - 0.5) * 30) + ',' + ((rr() - 0.5) * 30) + ' ' + ((rr() - 0.5) * 24) + ',' + ((rr() - 0.5) * 24); sv('path', { d: s, fill: 'none', stroke: PAIRC[p][hh], 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); } }
  function drawMitosis(g, stage, pairs) {
    var cx = 300, cy = 150, n2 = pairs * 2;
    var items = []; for (var p = 0; p < pairs; p++) for (var hh = 0; hh < 2; hh++) items.push({ p: p, h: hh, L: PAIRL[p], col: PAIRC[p][hh] });
    if (stage === 'interphase' || stage === 'interphaseG1') { cellShape(g, cx, cy, 200, 120); nucleus(g, cx, cy, 72); loose(g, cx, cy, 72, pairs, 'int'); return; }
    if (stage === 'prophase') { cellShape(g, cx, cy, 200, 120); nucleus(g, cx, cy, 82, true); var rr = seeded('pro'); items.forEach(function (it, i) { var a = i / n2 * 6.28 + 0.4, d = 40; xchrom(g, cx + M.cos(a) * d, cy + M.sin(a) * d, rr() * 180, it.L * 0.8, it.col); }); return; }
    if (stage === 'metaphase') { cellShape(g, cx, cy, 200, 120); items.forEach(function (it, i) { var y = cy - (n2 - 1) * 24 + i * 48; fiber(g, 110, cy, cx - 6, y); fiber(g, 490, cy, cx + 6, y); xchrom(g, cx, y, 0, it.L * 0.62, it.col); }); sv('line', { x1: cx, y1: 30, x2: cx, y2: 270, class: 'bv-plate' }, g); return; }
    if (stage === 'anaphase') { cellShape(g, cx, cy, 214, 112); items.forEach(function (it, i) { var y = cy - (n2 - 1) * 15 + i * 30; [-1, 1].forEach(function (s) { var x = cx + s * 95; fiber(g, cx + s * 190, cy, x, y); chromatid(g, x + s * it.L * 0.3, y, 90, it.L * 0.8, it.col); }); }); return; }
    if (stage === 'telophase') { sv('path', { d: 'M300,60 C230,20 80,40 80,150 C80,260 230,280 300,240 C370,280 520,260 520,150 C520,40 370,20 300,60 Z', class: 'bv-dcell' }, g); [-1, 1].forEach(function (s) { nucleus(g, cx + s * 120, cy, 62, true); items.forEach(function (it, i) { chromatid(g, cx + s * 120 + (i - (n2 - 1) / 2) * 14, cy, 0, it.L * 0.7, it.col); }); }); return; }
    if (stage === 'cytokinesis') { [-1, 1].forEach(function (s) { cellShape(g, cx + s * 150, cy, 128, 104); nucleus(g, cx + s * 150, cy, 52); loose(g, cx + s * 150, cy, 52, pairs, 'cyt' + s); }); return; }
  }
  function drawMeiosis(g, stage, pairs, cross, flip) {
    var cx = 300, cy = 150, tipsOf = function (p, hh) { if (!cross) return null; var other = PAIRC[p][1 - hh]; return hh === 0 ? [null, other] : [other, null]; }; // crossing over swaps the end of one chromatid of each homolog
    if (stage === 'interphase') { cellShape(g, cx, cy, 200, 120); nucleus(g, cx, cy, 72); loose(g, cx, cy, 72, pairs, 'mint'); return; }
    if (stage === 'prophase1') { cellShape(g, cx, cy, 200, 120); nucleus(g, cx, cy, 92, true); for (var p = 0; p < pairs; p++) { var y = cy - (pairs - 1) * 34 + p * 68; xchrom(g, cx - 13, y, 0, PAIRL[p] * 0.85, PAIRC[p][0], tipsOf(p, 0)); xchrom(g, cx + 13, y, 0, PAIRL[p] * 0.85, PAIRC[p][1], tipsOf(p, 1)); if (cross) sv('path', { d: 'M' + (cx - 6) + ',' + (y + PAIRL[p] * 0.18) + ' l12,6', stroke: '#c9483b', 'stroke-width': 2 }, g); } return; }
    if (stage === 'metaphase1') { cellShape(g, cx, cy, 200, 120); sv('line', { x1: cx, y1: 30, x2: cx, y2: 270, class: 'bv-plate' }, g); for (var q = 0; q < pairs; q++) { var y1 = cy - (pairs - 1) * 40 + q * 80, f = flip && flip[q] ? 1 : 0; [0, 1].forEach(function (hh) { var s = (hh === f ? -1 : 1), x = cx + s * 16; fiber(g, cx + s * 190, cy, x, y1); xchrom(g, x, y1, 0, PAIRL[q] * 0.85, PAIRC[q][hh], tipsOf(q, hh)); }); } return; }
    if (stage === 'anaphase1') { cellShape(g, cx, cy, 214, 112); for (var a = 0; a < pairs; a++) { var y2 = cy - (pairs - 1) * 36 + a * 72, f2 = flip && flip[a] ? 1 : 0; [0, 1].forEach(function (hh) { var s = (hh === f2 ? -1 : 1), x = cx + s * 100; fiber(g, cx + s * 190, cy, x, y2); xchrom(g, x, y2, 0, PAIRL[a] * 0.85, PAIRC[a][hh], tipsOf(a, hh)); }); } return; }
    // after meiosis I: two cells; the left gets homolog (flip ? 1 : 0) of each pair
    function side(s, pp) { var f3 = flip && flip[pp] ? 1 : 0; return s < 0 ? f3 : 1 - f3; }
    if (stage === 'telophase1' || stage === 'prophase2' || stage === 'metaphase2' || stage === 'anaphase2') {
      [-1, 1].forEach(function (s) {
        var ccx = cx + s * 150; cellShape(g, ccx, cy, 132, 112, stage === 'anaphase2' ? 'wide' : '');
        if (stage === 'telophase1') nucleus(g, ccx, cy, 70, true);
        for (var p2 = 0; p2 < pairs; p2++) { var hh = side(s, p2), L = PAIRL[p2] * 0.8, yy = cy - (pairs - 1) * 30 + p2 * 60;
          if (stage === 'telophase1' || stage === 'prophase2') xchrom(g, ccx + (p2 - (pairs - 1) / 2) * 34, cy + (p2 % 2 ? 14 : -14), 0, L, PAIRC[p2][hh], tipsOf(p2, hh));
          if (stage === 'metaphase2') { fiber(g, ccx - 110, cy, ccx - 5, yy); fiber(g, ccx + 110, cy, ccx + 5, yy); xchrom(g, ccx, yy, 0, L * 0.8, PAIRC[p2][hh], tipsOf(p2, hh)); }
          if (stage === 'anaphase2') { var tp = tipsOf(p2, hh) || [null, null]; [-1, 1].forEach(function (t2, k) { var x = ccx + t2 * 62; fiber(g, ccx + t2 * 112, cy, x, yy); chromatid(g, x, yy, 90, L, PAIRC[p2][hh], tp[k]); }); }
        }
        if (stage === 'metaphase2') sv('line', { x1: ccx, y1: 50, x2: ccx, y2: 250, class: 'bv-plate' }, g);
      });
      return;
    }
    if (stage === 'telophase2') {
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c4, ci) {
        var ccx = cx + c4[0] * 150 + c4[1] * 70, ccy = cy + c4[1] * 72; cellShape(g, ccx, ccy, 66, 64); nucleus(g, ccx, ccy, 44);
        for (var p3 = 0; p3 < pairs; p3++) { var hh = side(c4[0], p3), tp = tipsOf(p3, hh) || [null, null]; chromatid(g, ccx + (p3 - (pairs - 1) / 2) * 16, ccy, 0, PAIRL[p3] * 0.62, PAIRC[p3][hh], tp[c4[1] < 0 ? 0 : 1]); }
      });
    }
  }
  function divisionVisual(kind) {
    return function (el, o) {
      var list = kind === 'mitosis' ? B.MITOSIS : B.MEIOSIS, pairs = M.max(1, M.min(3, o.pairs || 2)), cross = kind === 'meiosis' && o.cross !== false, flip = o.flip || [];
      var F = frame(el, o, kind, kind === 'mitosis' ? 'Mitosis, step by step, in a cell with ' + 2 * pairs + ' chromosomes' : 'Meiosis, step by step, in a cell with ' + 2 * pairs + ' chromosomes');
      var svg = svgRoot(600, 300, el.getAttribute('aria-label'), 'bv-div'); F.body.appendChild(svg); var g = sv('g', null, svg);
      var showLab = !F.quiet || o.labels, idx = o.stage ? M.max(0, list.map(function (s) { return s.key; }).indexOf(o.stage)) : 0, title = h('p', 'bv-div-title'); if (showLab) F.body.insertBefore(title, svg);
      function draw(i) {
        g.innerHTML = ''; var st = list[i].key; (kind === 'mitosis' ? drawMitosis : drawMeiosis)(g, st, pairs, cross, flip);
        if (showLab) title.innerHTML = '<b>' + cap1(list[i].name) + '</b>: ' + esc(list[i].what) + '.';
        if (!F.quiet) { var c = B.counts(2 * pairs, st === 'cytokinesis' ? 'telophase' : st), where = { anaphase: 'In the cell, as it divides', telophase: 'In each new nucleus', cytokinesis: 'In each new cell', telophase1: 'In each of the two cells', prophase2: 'In each of the two cells', metaphase2: 'In each of the two cells', anaphase2: 'In each of the two cells, as it divides', telophase2: 'In each of the four cells' }[st] || 'In the cell';
          F.say(c ? where + ': ' + c.chromosomes + ' chromosomes, ' + c.chromatids + ' chromatids.' + (kind === 'meiosis' && st === 'telophase2' ? ' Four haploid cells (n = ' + pairs + '), each genetically different.' : kind === 'mitosis' && st === 'cytokinesis' ? ' Two identical diploid cells (2n = ' + 2 * pairs + ').' : '') : ''); }
      }
      if (F.interactive && !F.quiet && o.steps !== false && !o.stage) stepper(F.ctl, list.length, draw, { start: idx, label: function (i) { return 'Step ' + (i + 1) + ' of ' + list.length; }, play: V.reduced ? 0 : 1800 });
      else draw(idx);
      if (kind === 'meiosis' && F.interactive && !F.quiet && !o.stage) { btn(F.ctl, 'Flip a pair', function () { flip[0] = !flip[0]; var cur = F.ctl.querySelector('.bv-navn'); var i = cur ? parseInt(cur.textContent.replace(/\D+/, ''), 10) - 1 : 0; draw(i || 0); F.say('Pair 1 now lines up the other way round. Each pair lines up on its own, so a cell with ' + pairs + ' pairs can sort them ' + B.assortments(pairs) + ' ways (independent assortment).'); }); }
    };
  }
  V.register('bi-mitosis', divisionVisual('mitosis'));
  V.register('bi-meiosis', divisionVisual('meiosis'));
  /* =========================== bi-tree: phylogenetic trees and cladograms =========================== */
  function toNode(t, id) { id = id || { n: 0 }; if (Array.isArray(t) && t.length === 1) return toNode(t[0], id); if (!Array.isArray(t)) return { name: t, leaf: true, id: id.n++ }; return { children: t.map(function (c) { return toNode(c, id); }), id: id.n++ }; }
  function leaves(n) { return n.leaf ? [n] : n.children.reduce(function (a, c) { return a.concat(leaves(c)); }, []); }
  function height(n) { return n.leaf ? 0 : 1 + M.max.apply(null, n.children.map(height)); }
  V.register('bi-tree', function (el, o) {
    var pre = typeof o.tree === 'string' ? B.TREES[o.tree] : null, raw = pre ? pre.tree : o.tree || B.TREES.vertebrates.tree, root = toNode(raw), mode = o.mode || 'show';
    var marks = o.marks || (pre && pre.traits ? pre.traits.map(function (t) { var tips = B.tips(raw); return { clade: t[2] ? [t[2]] : tips.slice(t[1]), text: t[0] }; }) : []);
    var F = frame(el, o, 'tree', 'A phylogenetic tree of ' + B.tips(raw).join(', ') + '. Branch points are common ancestors.'), showMarks = o.traits !== undefined ? o.traits : !F.quiet;
    var W0 = 600, lv = leaves(root), n = lv.length, H0 = 40 + n * 44, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-tree'); F.body.appendChild(svg);
    var G = sv('g', null, svg), sel = [], swaps = {};
    function layout() {
      var tips = leaves(root), Hh = height(root), xL = 84, xR = W0 - 150, step = (xR - xL) / M.max(1, Hh), pos = {};
      tips.forEach(function (t, i) { pos[t.id] = [xR, 30 + i * 44]; });
      (function place(nd) { if (nd.leaf) return pos[nd.id]; var ps = nd.children.map(place), y = (ps[0][1] + ps[ps.length - 1][1]) / 2; pos[nd.id] = [xR - height(nd) * step, y]; return pos[nd.id]; })(root);
      return pos;
    }
    function cladeNode(names) { var best = null; (function walk(nd) { var L = leaves(nd).map(function (x) { return x.name; }); if (names.every(function (q) { return L.indexOf(q) >= 0; })) { best = nd; if (!nd.leaf) nd.children.forEach(walk); } })(root); return best; }
    function draw() {
      G.innerHTML = ''; var pos = layout(), hiNode = sel.length === 2 ? cladeNode(sel) : null;
      sv('line', { x1: 30, y1: pos[root.id][1], x2: pos[root.id][0], y2: pos[root.id][1], class: 'bv-branch' }, G);
      (function edges(nd) { if (nd.leaf) return; var p = pos[nd.id]; var ys = nd.children.map(function (c) { return pos[c.id][1]; }); sv('line', { x1: p[0], y1: M.min.apply(null, ys), x2: p[0], y2: M.max.apply(null, ys), class: 'bv-branch' }, G); nd.children.forEach(function (c) { var q = pos[c.id]; sv('line', { x1: p[0], y1: q[1], x2: q[0], y2: q[1], class: 'bv-branch' }, G); edges(c); }); })(root);
      (function nodes(nd) { if (nd.leaf) return; var p = pos[nd.id], g = sv('circle', { cx: p[0], cy: p[1], r: hiNode === nd ? 9 : 6, class: 'bv-tnode' + (hiNode === nd ? ' hi' : '') }, G);
        if (mode === 'rotate' && F.interactive && !F.quiet) { g.style.cursor = 'pointer'; g.addEventListener('click', function () { nd.children.reverse(); draw(); F.say('Rotated the branches at that node. The tree is the same tree: who shares which ancestor has not changed.'); }); }
        nd.children.forEach(nodes); })(root);
      leaves(root).forEach(function (t) { var q = pos[t.id], asked = o.ask === t.name, on = sel.indexOf(t.name) >= 0;
        var tx = txt(G, q[0] + 8, q[1] + 5, asked ? '?' : t.name, { class: 'bv-tip' + (on ? ' on' : '') + (asked ? ' bv-asklab' : '') });
        if (mode === 'mrca' && F.interactive && !F.quiet) { tx.style.cursor = 'pointer'; tx.addEventListener('click', function () { var i = sel.indexOf(t.name); if (i >= 0) sel.splice(i, 1); else { if (sel.length === 2) sel = []; sel.push(t.name); } draw(); report(); }); } });
      if (showMarks) marks.forEach(function (m) { var nd = cladeNode(m.clade); if (!nd) return; var q = pos[nd.id], parent = null; (function find(x) { if (x.leaf) return; x.children.forEach(function (c) { if (c === nd) parent = x; find(c); }); })(root); var px = parent ? pos[parent.id][0] : 30, mx = (px + q[0]) / 2;
        sv('line', { x1: mx, y1: q[1] - 9, x2: mx, y2: q[1] + 9, class: 'bv-trait' }, G); txt(G, mx, q[1] - 12, m.text, { class: 'bv-trait-t', 'text-anchor': 'middle' }); });
    }
    function report() { if (sel.length < 2) { F.say(sel.length ? 'Now tap a second organism.' : 'Tap two organisms to find their most recent common ancestor.'); return; } var c = cladeNode(sel), L = leaves(c).map(function (x) { return x.name; }); F.say('The most recent common ancestor of <b>' + esc(sel[0]) + '</b> and <b>' + esc(sel[1]) + '</b> is the gold node. Every organism that branches from it (' + esc(L.join(', ')) + ') shares that ancestor.'); }
    draw();
    if (mode === 'mrca' && F.interactive && !F.quiet) report();
    if (mode === 'rotate' && F.interactive && !F.quiet) F.say('Tap a branch point to rotate its branches. The order of the tips changes; the relationships do not.');
    if (mode === 'show' && !F.quiet && showMarks && marks.length) F.say('Each mark is a new trait that appeared on that branch; everything to the right of it inherited the trait.');
  });

  /* =========================== bi-selection: natural selection in a population of beetles =========================== */
  V.register('bi-selection', function (el, o) {
    var bgK = o.background || 'dark', N = o.n || 40, mode = o.mode || 'sim', F = frame(el, o, 'selection', 'A population of beetles of different colors on ' + (bgK === 'dark' ? 'dark soil' : 'light sand') + '. Birds catch the beetles they can see.');
    var rnd = seeded(o.seed || 'sel' + bgK), pop = [], gen = 0, hist = [];
    function startPop() { pop = []; for (var i = 0; i < N; i++) pop.push({ c: o.start !== undefined ? M.max(0, M.min(1, o.start + (rnd() - 0.5) * 0.5)) : rnd(), x: rnd(), y: rnd(), a: rnd() * 6.28 }); gen = 0; hist = [mean()]; }
    function mean() { return pop.reduce(function (s, b) { return s + b.c; }, 0) / pop.length; }
    var bgv = function () { return bgK === 'dark' ? 0.85 : 0.12; };
    function shade(c) { var v = M.round(235 - c * 200); return 'rgb(' + v + ',' + M.round(v * 0.92) + ',' + M.round(v * 0.72) + ')'; }
    function hunt(k) { // birds catch the k most visible beetles, with some chance
      for (var j = 0; j < k && pop.length > 4; j++) { var best = -1, bw = -1; pop.forEach(function (b, i) { var w = M.abs(b.c - bgv()) + rnd() * 0.25; if (w > bw) { bw = w; best = i; } }); pop.splice(best, 1); }
    }
    function breed() { var kids = []; while (pop.length + kids.length < N) { var p = pop[M.floor(rnd() * pop.length)]; kids.push({ c: M.max(0, M.min(1, p.c + (rnd() - 0.5) * 0.12)), x: rnd(), y: rnd(), a: rnd() * 6.28 }); } pop = pop.concat(kids); pop.forEach(function (b) { b.x = rnd(); b.y = rnd(); }); gen++; hist.push(mean()); }
    startPop(); for (var g0 = 0; g0 < (o.gen || 0); g0++) { hunt(M.round(N / 2)); breed(); }
    var c = V.canvas(F.body, { aspect: 1.9, max: 300 }), chart = V.canvas(F.body, { aspect: 4.2, max: 140 });
    function draw() {
      var ctx = c.ctx, W1 = c.w, H1 = c.h; ctx.fillStyle = bgK === 'dark' ? '#3a2e24' : '#e8d8b0'; ctx.fillRect(0, 0, W1, H1);
      var rr = seeded('bgspeck' + bgK); for (var i = 0; i < 260; i++) { ctx.fillStyle = bgK === 'dark' ? 'rgba(90,70,50,.6)' : 'rgba(200,180,140,.6)'; ctx.beginPath(); ctx.arc(rr() * W1, rr() * H1, 1 + rr() * 3, 0, 7); ctx.fill(); }
      pop.forEach(function (b, i) { var x = 14 + b.x * (W1 - 28), y = 14 + b.y * (H1 - 28); ctx.save(); ctx.translate(x, y); ctx.rotate(b.a); ctx.fillStyle = shade(b.c); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(10, 0, 4, 0, 7); ctx.fill(); ctx.strokeStyle = shade(b.c); ctx.lineWidth = 1.5; [-5, 0, 5].forEach(function (lx) { ctx.beginPath(); ctx.moveTo(lx, -6); ctx.lineTo(lx - 2, -11); ctx.moveTo(lx, 6); ctx.lineTo(lx - 2, 11); ctx.stroke(); }); ctx.restore(); b._x = x; b._y = y; });
      var k = V.colors(), x2 = chart.ctx, W2 = chart.w, H2 = chart.h;
      function fit(list, w) { for (var i = 0; i < list.length; i++) if (x2.measureText(list[i]).width <= w) return list[i]; return list[list.length - 1]; } // the longest label that fits (narrow screens) x2.fillStyle = k.bg; x2.fillRect(0, 0, W2, H2);
      if (!F.quiet) {
        var bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; pop.forEach(function (b) { bins[M.min(9, M.floor(b.c * 10))]++; }); var bw = (W2 * 0.5 - 20) / 10, mx = M.max.apply(null, bins) || 1;
        bins.forEach(function (v, i) { x2.fillStyle = shade((i + 0.5) / 10); x2.fillRect(10 + i * bw, H2 - 18 - (H2 - 34) * v / mx, bw - 2, (H2 - 34) * v / mx); });
        x2.fillStyle = k.muted; x2.font = (W2 < 420 ? 11 : 12) + 'px system-ui'; x2.textAlign = 'left'; x2.fillText('light', 10, H2 - 4); x2.textAlign = 'right'; x2.fillText('dark', 10 + 10 * bw, H2 - 4); x2.textAlign = 'center'; x2.fillText(fit(['beetle colors now', 'colors now'], 10 * bw), 10 + 5 * bw, 12);
        var gx = W2 * 0.55, gw = W2 * 0.42; x2.strokeStyle = k.axis; x2.lineWidth = 1; x2.strokeRect(gx, 18, gw, H2 - 36); x2.strokeStyle = k.green; x2.lineWidth = 2.5; x2.beginPath(); hist.forEach(function (m, i) { var xx = gx + gw * i / M.max(10, hist.length - 1), yy = H2 - 18 - (H2 - 36) * m; x2[i ? 'lineTo' : 'moveTo'](xx, yy); }); x2.stroke();
        x2.fillStyle = k.muted; x2.fillText(fit(['average color by generation (up = darker)', 'average color (up = darker)', 'avg. color (up = darker)', 'average color', 'average'], gw), gx + gw / 2, 12);
        F.say('Generation ' + gen + ': ' + pop.length + ' beetles; average color ' + M.round(mean() * 100) + '% dark.');
      }
    }
    c.onResize(draw); chart.onResize(draw); V.onTheme(draw); draw();
    if (F.interactive && !F.quiet) {
      if (mode === 'hunt') {
        var caught = 0; F.say('You are the bird. Tap 20 beetles you can spot, then press Next generation.');
        c.cv.addEventListener('click', function (e) { var r = c.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 18; pop.forEach(function (b, i) { var d = M.hypot(b._x - x, b._y - y); if (d < bd) { bd = d; best = i; } }); if (best >= 0 && caught < M.round(N / 2)) { pop.splice(best, 1); caught++; draw(); F.say('Caught ' + caught + ' of ' + M.round(N / 2) + '.'); } });
        btn(F.ctl, 'Next generation', function () { breed(); caught = 0; draw(); }, 'pri');
      } else {
        btn(F.ctl, 'Next generation', function () { hunt(M.round(N / 2)); breed(); draw(); }, 'pri');
        btn(F.ctl, 'Run 10', function () { for (var i = 0; i < 10; i++) { hunt(M.round(N / 2)); breed(); } draw(); });
      }
      V.seg(F.ctl, { label: 'Ground', items: [['dark', 'Dark soil'], ['light', 'Light sand']], value: bgK, change: function (v) { bgK = v; draw(); } });
      btn(F.ctl, 'Start over', function () { rnd = seeded('sel' + bgK + Date.now()); startPop(); draw(); });
    }
  });
  /* =========================== bi-body: the human body and its organ systems (no reproductive system) =========================== */
  // a front-view outline figure in the site's cartoon skin color; organs are drawn as viewed from the front, so the person's
  // right side is on the viewer's left
  var FIG = '<g class="bv-fig"><circle cx="150" cy="60" r="40" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3"/><rect x="134" y="96" width="32" height="22" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3"/>' +
    '<path d="M98,124 Q150,108 202,124 L210,300 Q150,316 90,300 Z" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="3"/>' +
    '<path d="M100,128 Q76,140 70,220 L60,300 M200,128 Q224,140 230,220 L240,300" fill="none" stroke="' + SKIN + '" stroke-width="26" stroke-linecap="round"/><path d="M100,128 Q76,140 70,220 L60,300 M200,128 Q224,140 230,220 L240,300" fill="none" stroke="' + SKIN_LINE + '" stroke-width="2" stroke-linecap="round" opacity=".0"/>' +
    '<path d="M122,300 L116,500 M178,300 L184,500" stroke="' + SKIN + '" stroke-width="40" stroke-linecap="round"/><path d="M110,302 Q150,316 190,302" fill="none" stroke="' + SKIN_LINE + '" stroke-width="0"/>' +
    '<circle cx="58" cy="306" r="13" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="2.5"/><circle cx="242" cy="306" r="13" fill="' + SKIN + '" stroke="' + SKIN_LINE + '" stroke-width="2.5"/>' +
    '<path d="M136,52 h0 M164,52 h0" stroke="#2b2420" stroke-width="6" stroke-linecap="round"/><path d="M138,78 Q150,86 162,78" fill="none" stroke="#2b2420" stroke-width="2.5" stroke-linecap="round"/><path d="M114,30 Q150,6 186,30 Q170,22 150,24 Q130,22 114,30 Z" fill="#6a4a30"/></g>';
  function O(part, sys, svgs) { return '<g class="bv-organ" data-part="' + part + '" data-sys="' + sys + '">' + svgs + '</g>'; }
  var SYS_DRAW = {
    skeletal: O('skull', 'skeletal', '<ellipse cx="150" cy="56" rx="30" ry="34" fill="#f4eedf" class="o"/>') + O('spine', 'skeletal', '<path d="M150,96 V300" stroke="#f4eedf" stroke-width="9" stroke-dasharray="9 3"/>') + O('ribs', 'skeletal', [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M150,' + (138 + i * 15) + ' q-44,-4 -48,20 M150,' + (138 + i * 15) + ' q44,-4 48,20" fill="none" stroke="#f4eedf" stroke-width="5"/>'; }).join('')) + O('pelvis', 'skeletal', '<path d="M112,282 Q150,262 188,282 L176,310 Q150,300 124,310 Z" fill="#f4eedf" class="o"/>') + O('humerus', 'skeletal', '<path d="M98,130 L74,214 M202,130 L226,214" stroke="#f4eedf" stroke-width="7" stroke-linecap="round"/><path d="M74,218 L62,296 M226,218 L238,296" stroke="#f4eedf" stroke-width="5" stroke-linecap="round"/>') + O('femur', 'skeletal', '<path d="M126,312 L120,400 M174,312 L180,400" stroke="#f4eedf" stroke-width="9" stroke-linecap="round"/><path d="M120,408 L117,494 M180,408 L183,494" stroke="#f4eedf" stroke-width="6" stroke-linecap="round"/>'),
    muscular: O('biceps', 'muscular', '<ellipse cx="82" cy="172" rx="9" ry="26" fill="#c9584a" transform="rotate(16 82 172)"/><ellipse cx="218" cy="172" rx="9" ry="26" fill="#c9584a" transform="rotate(-16 218 172)"/>') + O('pectorals', 'muscular', '<path d="M106,140 Q128,132 148,140 L146,170 Q120,176 106,160 Z M194,140 Q172,132 152,140 L154,170 Q180,176 194,160 Z" fill="#c9584a"/>') + O('abdominals', 'muscular', '<rect x="132" y="186" width="36" height="96" rx="8" fill="#c9584a"/><path d="M150,188 V280 M134,210 H166 M134,234 H166 M134,258 H166" stroke="#a8403a" stroke-width="2"/>') + O('quadriceps', 'muscular', '<ellipse cx="122" cy="360" rx="15" ry="46" fill="#c9584a"/><ellipse cx="178" cy="360" rx="15" ry="46" fill="#c9584a"/>') + O('heart muscle', 'muscular', '<path d="M158,182 c-10,-12 -24,-2 -16,12 l16,16 l16,-16 c8,-14 -6,-24 -16,-12z" fill="#a8302a"/>'),
    digestive: O('mouth', 'digestive', '<ellipse cx="150" cy="80" rx="12" ry="6" fill="#d8473b"/>') + O('esophagus', 'digestive', '<path d="M150,90 C150,140 162,180 168,222" fill="none" stroke="#e8925a" stroke-width="7"/>') + O('liver', 'digestive', '<path d="M104,214 Q130,200 160,214 Q150,246 112,244 Q100,232 104,214 Z" fill="#8a3a2a" class="o"/>') + O('stomach', 'digestive', '<path d="M164,220 Q196,214 194,240 Q190,262 162,258 Q150,254 158,242 Q176,240 170,228 Z" fill="#f08a7a" class="o"/>') + O('small intestine', 'digestive', '<path d="M130,262 q20,-8 40,0 q10,8 -6,14 q-26,6 -34,0 q-10,10 6,16 q22,6 38,-2 q10,8 -6,14 q-24,6 -34,-2" fill="none" stroke="#f2b07a" stroke-width="7" stroke-linecap="round"/>') + O('large intestine', 'digestive', '<path d="M118,304 V258 Q118,250 128,250 H174 Q184,250 184,258 V300 Q170,312 156,306" fill="none" stroke="#c9783a" stroke-width="9" stroke-linecap="round"/>'),
    circulatory: O('arteries', 'circulatory', '<path d="M160,196 V120 M160,130 Q120,128 96,140 L72,214 L62,290 M160,130 Q190,128 204,140 L228,214 L238,290 M160,196 V300 L126,320 L120,494 M160,300 L176,320 L182,494 M154,120 V70" fill="none" stroke="#d8473b" stroke-width="3.2"/>') + O('veins', 'circulatory', '<path d="M142,196 V122 M142,130 Q112,132 92,146 L68,218 L56,292 M142,130 Q196,134 210,146 L234,218 L244,292 M142,200 V298 L118,318 L112,494 M142,298 L184,318 L188,494 M146,120 V72" fill="none" stroke="#3d74c8" stroke-width="3.2"/>') + O('heart', 'circulatory', '<path d="M154,180 c-12,-14 -30,-2 -20,14 l20,20 l20,-20 c10,-16 -8,-28 -20,-14z" fill="#c9302a" class="o"/>') + O('capillaries', 'circulatory', '<path d="M54,300 q4,6 8,0 q4,6 8,0 M232,300 q4,6 8,0 q4,6 8,0" fill="none" stroke="#a04ab0" stroke-width="2"/>'),
    respiratory: O('nose', 'respiratory', '<path d="M150,56 l-6,16 h12z" fill="#e8a93a"/>') + O('trachea', 'respiratory', '<path d="M150,96 V150 M150,150 L132,166 M150,150 L168,166" fill="none" stroke="#9ab8d8" stroke-width="8" stroke-linecap="round"/>') + O('lungs', 'respiratory', '<path d="M134,150 Q106,156 104,206 Q106,222 130,218 Q142,190 140,160 Z M166,150 Q194,156 196,206 Q194,222 170,218 Q158,190 160,160 Z" fill="#f2a7b5" class="o"/>') + O('diaphragm', 'respiratory', '<path d="M100,226 Q150,200 200,226" fill="none" stroke="#a8403a" stroke-width="5"/>'),
    nervous: O('brain', 'nervous', '<path d="M122,52 Q120,24 150,22 Q180,24 178,52 Q176,74 150,72 Q124,74 122,52 Z" fill="#f2b7c4" class="o"/><path d="M134,36 q8,8 0,16 M150,28 q-6,12 4,20 M164,36 q-8,10 2,18" fill="none" stroke="#c9849a" stroke-width="2"/>') + O('spinal cord', 'nervous', '<path d="M150,72 V300" stroke="#e8c840" stroke-width="5"/>') + O('nerves', 'nervous', '<path d="M150,132 Q110,134 96,146 L72,218 L60,298 M150,132 Q190,134 204,146 L228,218 L240,298 M150,300 L124,320 L118,496 M150,300 L176,320 L182,496 M150,180 L112,200 M150,180 L188,200 M150,240 L114,256 M150,240 L186,256" fill="none" stroke="#e8c840" stroke-width="2"/>'),
    excretory: O('kidneys', 'excretory', '<path d="M118,250 q-12,10 0,24 q10,6 12,-4 q-6,-8 0,-16 q-2,-10 -12,-4 Z M182,250 q12,10 0,24 q-10,6 -12,-4 q6,-8 0,-16 q2,-10 12,-4 Z" fill="#a8403a" class="o"/>') + O('ureters', 'excretory', '<path d="M128,270 Q136,290 146,304 M172,270 Q164,290 154,304" fill="none" stroke="#e8c070" stroke-width="3"/>') + O('bladder', 'excretory', '<ellipse cx="150" cy="306" rx="13" ry="10" fill="#f2d070" class="o"/>'),
    immune: O('lymph nodes', 'immune', [[132, 106], [168, 106], [104, 140], [196, 140], [140, 230], [160, 236], [120, 280], [180, 280]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#7ac05a" class="o"/>'; }).join('') + '<path d="M132,106 L104,140 L120,280 M168,106 L196,140 L180,280" fill="none" stroke="#7ac05a" stroke-width="1.6"/>') + O('spleen', 'immune', '<ellipse cx="194" cy="232" rx="9" ry="14" fill="#8a4a8a" class="o"/>') + O('thymus', 'immune', '<ellipse cx="150" cy="140" rx="10" ry="12" fill="#c9a0d8" class="o"/>') + O('tonsils', 'immune', '<circle cx="140" cy="88" r="4" fill="#d87a9a"/><circle cx="160" cy="88" r="4" fill="#d87a9a"/>'),
    endocrine: O('pituitary', 'endocrine', '<circle cx="150" cy="58" r="5" fill="#a05ad8" class="o"/>') + O('thyroid', 'endocrine', '<path d="M138,110 q12,10 24,0 q-2,8 -12,8 q-10,0 -12,-8z" fill="#a05ad8" class="o"/>') + O('adrenal glands', 'endocrine', '<path d="M114,246 l8,-8 l6,8z M186,246 l-8,-8 l-6,8z" fill="#a05ad8" class="o"/>') + O('pancreas', 'endocrine', '<path d="M138,252 Q160,244 186,250 Q170,262 140,260 Z" fill="#e8b07a" class="o"/>')
  };
  var BODY_AT = { skull: [176, 40], spine: [150, 262], ribs: [112, 170], pelvis: [180, 290], humerus: [80, 190], femur: [122, 360], biceps: [218, 172], pectorals: [180, 150], abdominals: [160, 230], quadriceps: [178, 360], 'heart muscle': [160, 190],
    mouth: [160, 80], esophagus: [156, 140], liver: [118, 228], stomach: [186, 236], 'small intestine': [150, 284], 'large intestine': [184, 280], arteries: [228, 214], veins: [68, 218], heart: [158, 196], capillaries: [244, 302],
    nose: [150, 66], trachea: [150, 120], lungs: [186, 192], diaphragm: [196, 224], brain: [170, 40], 'spinal cord': [150, 200], nerves: [72, 218], kidneys: [184, 262], ureters: [164, 286], bladder: [150, 306],
    'lymph nodes': [104, 140], spleen: [194, 232], thymus: [150, 140], tonsils: [160, 88], pituitary: [150, 58], thyroid: [150, 112], 'adrenal glands': [184, 242], pancreas: [176, 254] };
  V.register('bi-body', function (el, o) {
    var mode = o.mode || 'show', sys = o.system || 'digestive', F = frame(el, o, 'body', mode === 'heart' ? 'The heart, seen from the front: its four chambers and the path of blood' : 'The ' + (B.SYSTEMS[sys] || { name: 'human body' }).name + ' in an outline of the body');
    if (mode === 'heart') return heart(el, o, F);
    var W0 = 520, H0 = 520, svg = svgRoot(W0, H0, el.getAttribute('aria-label'), 'bv-bodysvg'); F.body.appendChild(svg);
    var g = sv('g', { transform: 'translate(110,6)' }, svg), showLab = o.labels !== undefined ? o.labels : !F.quiet;
    function draw() {
      g.innerHTML = FIG + (SYS_DRAW[sys] || ''); svg.querySelectorAll('.bv-lab,.bv-lead,.bv-leaddot,.bv-mark').forEach(function (x) { x.remove(); });
      var parts = (o.parts || B.SYSTEMS[sys].organs).filter(function (p) { return BODY_AT[p]; });
      var useMarks = !!(o.numbers || o.ask || (showLab && narrow(el)));
      F.body.querySelectorAll('.bv-keylist').forEach(function (x) { x.remove(); });
      svg.setAttribute('viewBox', useMarks ? (['digestive', 'respiratory', 'excretory', 'endocrine', 'immune'].indexOf(sys) >= 0 ? '110 0 300 340' : '110 0 300 520') : '0 0 ' + W0 + ' ' + H0);
      if (useMarks) { var rowsK = []; parts.forEach(function (p, i) { var a = BODY_AT[p], asked = o.ask === p; if (o.ask && !o.numbers && !asked) return; badge(svg, a[0] + 110, a[1] + 6, asked ? '?' : String(i + 1), asked); if (!F.quiet && !asked) rowsK.push([String(i + 1), cap1(p)]); }); if (rowsK.length) keyList(F.body, rowsK); }
      else if (showLab) {
        var L = [], R = []; parts.forEach(function (p, i) { var a = BODY_AT[p]; (a[0] < 150 ? L : R).push({ p: p, i: i, a: [a[0] + 110, a[1] + 6] }); });
        [[L, 6, 'start'], [R, W0 - 6, 'end']].forEach(function (S) { var arr = S[0].sort(function (a, b) { return a.a[1] - b.a[1]; }); arr.forEach(function (it, j) { var asked = o.ask === it.p, tag = o.numbers ? String(it.i + 1) : asked ? '?' : showLab ? cap1(it.p) : ''; if (!tag) return; var y = M.max(20, M.min(H0 - 10, arr.length === 1 ? it.a[1] : 40 + j * M.min(70, (H0 - 80) / M.max(1, arr.length - 1)))), lx = S[2] === 'start' ? S[1] + tag.length * 7.4 + 4 : S[1] - tag.length * 7.4 - 4;
          sv('line', { x1: lx, y1: y - 4, x2: it.a[0], y2: it.a[1], class: 'bv-lead' }, svg); sv('circle', { cx: it.a[0], cy: it.a[1], r: 2.6, class: 'bv-leaddot' }, svg); txt(svg, S[1], y, tag, { class: 'bv-lab bv-lab-sm' + (asked ? ' bv-asklab' : ''), 'text-anchor': S[2] }); }); });
      }
      if (o.highlight) g.querySelectorAll('.bv-organ').forEach(function (q) { q.classList.toggle('bv-dimp', [].concat(o.highlight).indexOf(q.dataset.part) < 0); });
      if (F.interactive && !F.quiet) g.querySelectorAll('.bv-organ').forEach(function (q) { q.style.cursor = 'pointer'; q.addEventListener('click', function () { var p = q.dataset.part; g.querySelectorAll('.bv-organ').forEach(function (z) { z.classList.toggle('bv-sel', z === q); }); F.say(o.find ? (p === o.find ? okMark(true) + ' Yes, the <b>' + esc(p) + '</b>.' : okMark(false) + ' That is the ' + esc(p) + '. Try again.') : '<b>' + cap1(esc(p)) + '</b>, part of the ' + esc(B.SYSTEMS[sys].name) + ', which ' + esc(B.SYSTEMS[sys].job) + '.'); }); });
    }
    draw();
    if (F.interactive && !F.quiet && o.systems !== false && !o.find) V.seg(F.ctl, { label: 'Organ system', items: (o.systems || Object.keys(B.SYSTEMS)).map(function (s) { return [s, cap1(s)]; }), value: sys, change: function (v) { sys = v; draw(); F.say('The ' + esc(B.SYSTEMS[v].name) + ' ' + esc(B.SYSTEMS[v].job) + '.'); } });
    if (o.find && F.interactive && !F.quiet) F.say('Tap the <b>' + esc(o.find) + '</b>.');
    else if (F.interactive && !F.quiet) F.say('The ' + esc(B.SYSTEMS[sys].name) + ' ' + esc(B.SYSTEMS[sys].job) + '. Tap an organ to name it. Diagrams show the body from the front, so its right side is on your left.');
    if (mode === 'path' && F.interactive && !F.quiet) { var path = sys === 'respiratory' ? ['nose', 'trachea', 'lungs'] : B.DIGEST_PATH; stepper(F.ctl, path.length, function (i) { g.querySelectorAll('.bv-organ').forEach(function (z) { z.classList.toggle('bv-dimp', z.dataset.part !== path[i]); }); F.say('Step ' + (i + 1) + ': the <b>' + esc(path[i]) + '</b>.'); }, { label: function (i) { return cap1(path[i]); } }); }
  });
  function heart(el, o, F) {
    var svg = svgRoot(560, 420, el.getAttribute('aria-label'), 'bv-heart'), showLab = !F.quiet; F.body.appendChild(svg);
    var mk = arrowHead(svg, uid('ht')), CH = { 'right atrium': [190, 150], 'right ventricle': [210, 280], 'left atrium': [360, 140], 'left ventricle': [340, 280] };
    svg.insertAdjacentHTML('beforeend', '<path d="M280,80 C200,40 110,90 130,190 C140,270 220,340 280,380 C340,340 430,270 440,190 C460,90 360,40 280,80 Z" class="bv-heartbody"/>' +
      '<path d="M140,190 C150,120 210,100 260,120 L262,200 Z" class="bv-ch bv-ch-ra"/><path d="M300,120 C350,96 420,110 432,190 L298,200 Z" class="bv-ch bv-ch-la"/><path d="M146,206 L262,206 L272,350 C220,320 160,270 146,206 Z" class="bv-ch bv-ch-rv"/><path d="M298,206 L428,206 C414,270 350,320 290,352 Z" class="bv-ch bv-ch-lv"/>' +
      '<path d="M210,104 V20 M246,104 V30" class="bv-vessel blue"/><path d="M300,110 Q300,30 360,30 Q420,30 420,60" class="bv-vessel red"/><path d="M262,110 Q240,40 180,44" class="bv-vessel blue2"/><path d="M380,110 L470,96" class="bv-vessel red2"/>');
    if (showLab) { Object.keys(CH).forEach(function (k) { var p = CH[k]; k.split(' ').forEach(function (w, j) { txt(svg, p[0], p[1] + j * 22, w, { class: 'bv-lab bv-heart-lab', 'text-anchor': 'middle' }); }); }); [['from the body', 120, 18], ['aorta: to the body', 440, 18], ['to the lungs', 120, 62], ['from the lungs', 470, 130]].forEach(function (L) { txt(svg, L[1], L[2], L[0], { class: 'bv-lab bv-heart-sub', 'text-anchor': 'middle' }); }); txt(svg, 280, 412, 'Seen from the front: its right side is on your left.', { class: 'bv-lab bv-heart-sub', 'text-anchor': 'middle' }); }
    if (o.ask) { var p = CH[o.ask]; if (p) txt(svg, p[0], p[1] + 24, '?', { class: 'bv-askt', 'text-anchor': 'middle' }); }
    if (F.interactive && !F.quiet) {
      var path = B.BLOOD_PATH, cls = { 'right atrium': 'bv-ch-ra', 'right ventricle': 'bv-ch-rv', 'left atrium': 'bv-ch-la', 'left ventricle': 'bv-ch-lv' };
      stepper(F.ctl, path.length, function (i) { svg.querySelectorAll('.bv-ch').forEach(function (c) { c.classList.toggle('on', c.classList.contains(cls[path[i]])); }); F.say({ 0: 'Oxygen-poor blood returns from the body through the vena cavae.', 1: 'It enters the <b>right atrium</b>.', 2: 'It passes a valve into the <b>right ventricle</b>, which pumps it to the lungs.', 3: 'In the <b>lungs</b> it picks up oxygen and drops off carbon dioxide.', 4: 'Oxygen-rich blood returns to the <b>left atrium</b>.', 5: 'The <b>left ventricle</b>, the thickest chamber, pumps it out through the aorta.', 6: 'It travels to the whole <b>body</b>, then comes back to the right side again.' }[i]); }, { label: function (i) { return cap1(path[i]); } });
    }
  }
  /* =========================== bi-energy: photosynthesis, respiration and ATP =========================== */
  function flowBox(svg, x, y, w, hh, title, cls, lines) { var g = sv('g', { transform: 'translate(' + x + ',' + y + ')' }, svg); sv('rect', { width: w, height: hh, rx: 16, class: 'bv-ebox ' + (cls || '') }, g); var tl = [''], mxc = M.round(w / 8.4); String(title).split(' ').forEach(function (wd) { if ((tl[tl.length - 1] + ' ' + wd).trim().length > mxc) tl.push(wd); else tl[tl.length - 1] = (tl[tl.length - 1] + ' ' + wd).trim(); }); tl.forEach(function (L, i) { txt(g, w / 2, 24 + i * 16, L, { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }); var y0 = 30 + tl.length * 16; (lines || []).forEach(function (L, i) { txt(g, w / 2, y0 + i * 17, L, { class: 'bv-sub', 'text-anchor': 'middle' }); }); return g; }
  function mol(svg, x, y, text, cls, asked) { var t = txt(svg, x, y, asked ? '?' : text, { class: 'bv-moltag ' + (cls || '') + (asked ? ' bv-asklab' : ''), 'text-anchor': 'middle' }); return t; }
  V.register('bi-energy', function (el, o) {
    var mode = o.mode || 'both', F = frame(el, o, 'energy', { photo: 'Photosynthesis in a chloroplast: inputs and outputs', resp: 'Cellular respiration in a mitochondrion: inputs and outputs', both: 'Photosynthesis and cellular respiration form a cycle', 'resp-stages': 'The stages of cellular respiration', 'photo-stages': 'The two stages of photosynthesis', atp: 'The ATP and ADP cycle' }[mode]);
    var svg = svgRoot(600, mode === 'resp-stages' ? 330 : 300, el.getAttribute('aria-label'), 'bv-en'); F.body.appendChild(svg); var mk = arrowHead(svg, uid('en')), ask = o.ask, Q = F.quiet;
    function A(x1, y1, x2, y2, cls) { sv('path', { d: 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2, class: 'bv-ar ' + (cls || ''), 'marker-end': mk }, svg); }
    function chloroplast(x, y) { svg.insertAdjacentHTML('beforeend', '<g transform="translate(' + x + ',' + y + ')"><ellipse rx="110" ry="62" fill="#7ac05a" class="o"/>' + [-60, -20, 20, 60].map(function (dx) { return '<g transform="translate(' + dx + ',0)">' + [0, 1, 2, 3].map(function (k) { return '<rect x="-14" y="' + (-22 + k * 11) + '" width="28" height="8" rx="3" fill="#2f7d3a"/>'; }).join('') + '</g>'; }).join('') + '</g>'); }
    function mitochondrion(x, y) { svg.insertAdjacentHTML('beforeend', '<g transform="translate(' + x + ',' + y + ')"><ellipse rx="110" ry="58" fill="#f2a06a" class="o"/><path d="M-84,0 q12,-36 24,0 q12,36 24,0 q12,-36 24,0 q12,36 24,0 q12,-36 24,0 q12,36 24,0 q12,-36 24,0" fill="none" stroke="#b8582a" stroke-width="4"/></g>'); }
    if (mode === 'photo' || mode === 'resp') {
      var isP = mode === 'photo', S = isP ? B.PHOTO : B.RESP;
      (isP ? chloroplast : mitochondrion)(300, 150); if (!Q || o.labels) txt(svg, 300, 236, isP ? 'chloroplast' : 'mitochondrion', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
      S.inputs.forEach(function (m, i) { var y = 70 + i * 70; A(110, y, 180, 150 - (1 - i) * 26); var t0 = mol(svg, 8, y - 8, m, 'in', ask === m); t0.setAttribute('text-anchor', 'start'); });
      S.outputs.forEach(function (m, i) { var y = 80 + i * (S.outputs.length === 2 ? 110 : 70); A(420, 150 + (i - (S.outputs.length - 1) / 2) * 30, 488, y); var t1 = mol(svg, 594, y - 10, m, 'out', ask === m); t1.setAttribute('text-anchor', 'end'); });
      if (!Q) F.say((isP ? 'Photosynthesis' : 'Cellular respiration') + ': ' + esc(S.eq) + '.');
      return;
    }
    if (mode === 'both') {
      chloroplast(150, 150); mitochondrion(450, 150);
      sv('path', { d: 'M230,96 Q300,40 370,96', class: 'bv-ar', 'marker-end': mk }, svg); sv('path', { d: 'M370,204 Q300,262 230,204', class: 'bv-ar', 'marker-end': mk }, svg);
      mol(svg, 300, 46, 'glucose + oxygen', 'out', ask === 'top'); mol(svg, 300, 266, 'carbon dioxide + water', 'in', ask === 'bottom');
      mol(svg, 150, 26, 'light energy in', 'light', ask === 'light'); A(150, 32, 150, 82, 'bv-ar-light'); mol(svg, 450, 292, 'ATP: energy for the cell', 'atp', ask === 'atp'); A(450, 212, 450, 272);
      if (!Q || o.labels) { txt(svg, 150, 240, 'photosynthesis (chloroplast)', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); txt(svg, 450, 82, 'respiration (mitochondrion)', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
      if (!Q) F.say('Matter cycles: the products of each process are the raw materials of the other. Energy does not cycle: it enters as light and leaves as heat after cells use ATP.');
      return;
    }
    if (mode === 'resp-stages') {
      var st = B.RESP_STAGES, xs = [10, 160, 310, 460];
      st.forEach(function (s, i) { var asked = ask === s.key; flowBox(svg, xs[i], 54, 130, 222, asked ? '?' : cap1(s.name).replace(' and chemiosmosis', ''), i === 0 ? 'cyto' : 'mito', Q ? [] : [s.where, 'in: ' + s.in, 'out: ' + s.out].join('|').split('|').reduce(function (a, L) { var w = L.split(' '), cur = ''; w.forEach(function (x) { if ((cur + ' ' + x).length > 18) { a.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); a.push(cur); return a; }, []).slice(0, 9)); if (i < 3) A(xs[i] + 132, 165, xs[i + 1] - 4, 165); });
      if (!Q) { txt(svg, 75, 40, 'cytoplasm', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 385, 40, 'mitochondrion', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 300, 296, 'Total: about 30–32 ATP per glucose with oxygen;', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); txt(svg, 300, 316, 'only 2 ATP from glycolysis alone (fermentation).', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
      return;
    }
    if (mode === 'photo-stages') {
      var ps = B.PHOTO_STAGES;
      ps.forEach(function (s, i) { var x = i ? 330 : 30, asked = ask === s.key; flowBox(svg, x, 50, 240, 170, asked ? '?' : cap1(s.name), i ? 'stroma' : 'thyl', Q ? [] : ['where: ' + s.where, 'in: ' + s.in, 'out: ' + s.out]); });
      A(272, 110, 328, 110); A(328, 170, 272, 170); if (!Q) { mol(svg, 300, 98, 'ATP, NADPH', 'out'); mol(svg, 300, 196, 'ADP, NADP⁺', 'in'); mol(svg, 150, 254, 'H₂O in → O₂ out', 'in'); mol(svg, 450, 254, 'CO₂ in → sugar out', 'out'); }
      return;
    }
    if (mode === 'atp') {
      svg.insertAdjacentHTML('beforeend', '<g transform="translate(150,150)"><rect x="-60" y="-24" width="50" height="48" rx="8" class="bv-adenine"/><path d="M-10,0 h14" class="bv-bond"/><circle cx="20" cy="0" r="16" class="bv-phos"/><circle cx="56" cy="0" r="16" class="bv-phos"/><circle cx="92" cy="0" r="16" class="bv-phos hi"/><path d="M36,0 h4 M72,0 h4" class="bv-bond"/></g><g transform="translate(410,150)"><rect x="-60" y="-24" width="50" height="48" rx="8" class="bv-adenine"/><path d="M-10,0 h14" class="bv-bond"/><circle cx="20" cy="0" r="16" class="bv-phos"/><circle cx="56" cy="0" r="16" class="bv-phos"/><path d="M36,0 h4" class="bv-bond"/><circle cx="110" cy="-30" r="16" class="bv-phos hi"/></g>');
      sv('path', { d: 'M270,110 Q330,60 380,110', class: 'bv-ar', 'marker-end': mk }, svg); sv('path', { d: 'M380,200 Q330,250 270,200', class: 'bv-ar', 'marker-end': mk }, svg);
      if (!Q) { txt(svg, 200, 200, 'ATP', { class: 'bv-lab', 'text-anchor': 'middle' }); txt(svg, 400, 200, 'ADP + Pi', { class: 'bv-lab', 'text-anchor': 'middle' }); txt(svg, 325, 56, 'energy released for work', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 325, 266, 'energy from food (respiration) recharges it', { class: 'bv-sub', 'text-anchor': 'middle' }); }
    }
  });

  /* =========================== bi-feedback: feedback loops and step-by-step pathways =========================== */
  V.register('bi-feedback', function (el, o) {
    var key = o.loop || (o.steps ? null : 'temperature'), Lp = key ? B.LOOPS[key] : null, mode = o.mode || (o.steps ? 'chain' : Lp && Lp.kind === 'positive' ? 'positive' : 'loop');
    var F = frame(el, o, 'feedback', mode === 'chain' ? (o.title || 'A pathway, step by step') : 'A ' + (Lp ? Lp.kind : 'negative') + ' feedback loop: ' + (Lp ? Lp.name : ''));
    var Q = F.quiet, ask = o.ask;
    if (mode === 'chain') {
      var steps = o.steps || [], ol = h('ol', 'bv-chain'); steps.forEach(function (s, i) { var li = h('li', 'bv-chain-step' + (ask === i ? ' asked' : ''), ask === i ? '?' : esc(s)); if (o.numbers !== false) li.setAttribute('data-n', i + 1); ol.appendChild(li); }); F.body.appendChild(ol);
      if (o.note && !Q) F.say(o.note); return;
    }
    var svg = svgRoot(600, mode === 'positive' ? 420 : 350, el.getAttribute('aria-label'), 'bv-fb'); F.body.appendChild(svg); var mk = arrowHead(svg, uid('fb')), side = o.side || 'high';
    function box(x, y, w, title, body, i) { var words = (ask === i ? '?' : body).split(' '), lines = [''], mx = M.round(w / 6.9); words.forEach(function (wd) { if ((lines[lines.length - 1] + ' ' + wd).trim().length > mx) lines.push(wd); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + wd).trim(); }); lines = lines.slice(0, 4); var hh = 30 + lines.length * 14, g = sv('g', { transform: 'translate(' + x + ',' + y + ')' }, svg); sv('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 14, class: 'bv-fbbox' + (ask === i ? ' asked' : '') }, g); if (!(Q && ask === i)) txt(g, 0, -hh / 2 + 18, title, { class: 'bv-fbt', 'text-anchor': 'middle' }); lines.forEach(function (L, j) { txt(g, 0, -hh / 2 + 34 + j * 14, L, { class: 'bv-sub', 'text-anchor': 'middle' }); }); }
    function draw() {
      svg.innerHTML = ''; mk = arrowHead(svg, uid('fb'));
      if (mode === 'positive') {
        var st = Lp.steps; box(300, 44, 300, 'Start', Lp.start, 0);
        st.forEach(function (s, i) { box(300, 44 + (i + 1) * 80, 360 - i * 20, i === st.length - 1 ? 'End' : 'Step ' + (i + 1), s, i + 1); sv('path', { d: 'M300,' + (78 + i * 80) + ' V' + (90 + i * 80), class: 'bv-ar', 'marker-end': mk }, svg); });
        sv('path', { d: 'M480,190 C580,190 580,80 460,60', class: 'bv-ar bv-ar-pos', 'marker-end': mk }, svg); if (!Q) txt(svg, 590, 140, 'more → more', { class: 'bv-sub', 'text-anchor': 'end' });
        if (!Q) F.say('Positive feedback: the response adds to the change, so it speeds up until an outside event ends it.'); return;
      }
      var S = Lp[side], pos = [[300, 40, 'Change', (side === 'high' ? Lp.name + ' rises above normal' : Lp.name + ' falls below normal')], [490, 140, 'Sensor', Lp.sensor], [410, 292, 'Control center', Lp.control], [190, 292, 'Effector', S.effector], [110, 140, 'Response', S.response + '; ' + S.result]];
      pos.forEach(function (p, i) { box(p[0], p[1], i === 0 ? 300 : 200, p[2], p[3], i); });
      [[440, 56, 490, 100], [490, 184, 440, 250], [304, 292, 296, 292], [160, 250, 110, 186], [110, 96, 150, 60]].forEach(function (a, i) { sv('path', { d: 'M' + a[0] + ',' + a[1] + ' L' + a[2] + ',' + a[3], class: 'bv-ar' + (i === 4 ? ' bv-ar-neg' : ''), 'marker-end': mk }, svg); });
      if (!Q) { txt(svg, 300, 196, 'set point: ' + Lp.setpoint, { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); txt(svg, 300, 216, 'the response reverses the change', { class: 'bv-sub', 'text-anchor': 'middle' }); }
    }
    draw();
    if (F.interactive && !Q && mode === 'loop') V.seg(F.ctl, { label: 'Which change?', items: [['high', 'Too high'], ['low', 'Too low']], value: side, change: function (v) { side = v; draw(); } });
    if (!Q && mode === 'loop') F.say('Negative feedback: whichever way the value moves, the response pushes it back toward the set point.');
  });
})(window, typeof document !== 'undefined' ? document : null);
