/* Life Science for Young Learners (Biology Ladder, course key lifek): problem generators for all 51 topics.
   Built from /tmp/work_lifek/gen/*.js by /tmp/work_lifek/build_gen.sh (the first 6 topics are the designer's model).
   Conventions: /tmp/work_bio/overview.md ("Young course problems").
   Read-aloud problems for ages 5 to 9: a "Read to me" note for the grown-up, one short question in big type, two or three
   choices, and a quiet picture from the kit (bi-picture, bi-plant, bi-lifecycle, bi-habitat, bi-foodweb). Facts come from
   MathLadder.bio where the kit has them (animal groups, coverings, homes, life cycles, food webs), and from small fact
   tables in this file otherwise, so the pictures and the answers always agree. Shapes by level:
     level 1  one clear case with two choices (or Yes / No)
     level 2  the case the topic's trouble note is about (things that move but are not alive, a seed, the soil), three choices
     level 3  several pictures, lettered, and "which one …", "choose all", an order, or a short why question */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function B() { return ML.bio; }
  var READ = '<p class="bi-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
  function big(s) { return READ + '<span class="bi-big">' + s + '</span>'; }
  function name(k) { return B().THINGS[k].name; }
  function a_(k) { var n = name(k); return (/^[aeiou]/i.test(n) ? 'an ' : 'a ') + n; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function pic(items, extra) { return { name: 'bi-picture', opts: Object.assign({ items: items, quiet: true, interactive: false, big: items.length === 1 }, extra || {}) }; }
  // multiple choice with the right answer placed at random; keep: true keeps the order (for reading aloud)
  function mc(R, right, wrong, keep) { var ch = R.shuffle([right].concat(wrong)); return { t: 'mc', choices: ch, v: ch.indexOf(right), keep: !!keep }; }
  function yesNo(yes) { return { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true }; }
  function keys(test) { return B().where(test); }
  // familiar living things (no foods, seeds or fruits, which a child could fairly argue about)
  var LIVING = function () { return keys(function (t, k) { return t.life === 'living' && (t.kind === 'animal' || t.kind === 'plant' || t.kind === 'fungus') && !t.stage && !t.part && ['maple', 'burr', 'coconut', 'peapod', 'algae', 'krill'].indexOf(k) < 0; }); };
  var NEVER = function () { return keys(function (t) { return t.life === 'never'; }); };
  var MOVERS = ['car', 'robot', 'cloud', 'fire', 'water', 'ball'];          // things that move (or seem to) but are not alive
  var STILL = ['tree', 'pine', 'cactus', 'grass', 'mushroom', 'flower', 'fern', 'seed']; // living things that stay still
  var WHY_ALIVE = 'it grows, it needs food and water, and it can make new living things like itself';

  /* ---------- 1. Living or Not Living? ---------- */
  G('lifek.living-nonliving', function (R, ctx) {
    var L = ctx.level || 1, T = B().THINGS;
    if (L === 1) {
      var alive = R.coin(), k = alive ? R.pick(LIVING().filter(function (x) { return STILL.indexOf(x) < 0; })) : R.pick(['rock', 'coin', 'crystal', 'ball']);
      return { q: big('Is ' + a_(k) + ' living or not living?'), viz: pic([k]), a: { t: 'mc', choices: ['Living', 'Not living'], v: alive ? 0 : 1, keep: true },
        hint: 'Does it grow? Does it need food and water?', steps: [cap(a_(k)) + (alive ? ' grows, needs food and water, and makes more of its own kind.' : ' does not grow, eat, drink or make more of its kind.'), 'So ' + a_(k) + ' is <b>' + (alive ? 'living' : 'not living') + '</b>.'] };
    }
    if (L === 2) { // the trouble spot: movement is not the test
      var mover = R.coin(), k2 = mover ? R.pick(MOVERS) : R.pick(STILL);
      var moveTxt = { car: 'A toy car zooms across the floor.', robot: 'A toy robot walks and beeps.', cloud: 'A cloud moves across the sky.', fire: 'A fire flickers and grows bigger.', water: 'Water flows down a stream.', ball: 'A ball rolls down a hill.',
        tree: 'A tree stands still all day.', pine: 'A pine tree never walks anywhere.', cactus: 'A cactus sits still in the sand.', grass: 'Grass stays in one place.', mushroom: 'A mushroom does not move.', flower: 'A flower stays in its pot.', fern: 'A fern stays in one spot.', seed: 'A seed sits still in a packet.' }[k2];
      return { q: big(moveTxt + ' Is ' + (k2 === 'water' ? 'water' : 'it') + ' alive?'), viz: pic([k2]), a: yesNo(!mover),
        hint: 'Moving is not the test. Ask: does it grow, eat or drink, and make more of its kind?',
        steps: mover ? ['It moves, but moving does not make something alive.', cap({ car: 'a toy car', robot: 'a toy robot', cloud: 'a cloud', fire: 'a fire', water: 'water', ball: 'a ball' }[k2]) + ' does not grow from food and water, and it cannot make new ones like itself.', 'So it is <b>not alive</b>.'] :
          ['It does not move from place to place, but that is fine.', cap(a_(k2)) + ' grows, needs water, and makes new living things like itself' + (k2 === 'seed' ? ': a seed is resting, and it grows into a plant when it gets water.' : '.'), 'So it <b>is alive</b>.'] };
    }
    // level 3: several pictures; which one is living (or not living)?
    var askLiving = R.coin(), one = askLiving ? R.pick(LIVING()) : R.pick(NEVER().filter(function (x) { return T[x].tri !== false || MOVERS.indexOf(x) >= 0; }));
    var others = askLiving ? R.sample(NEVER(), 2) : R.sample(LIVING(), 2), items = R.shuffle([one].concat(others)), idx = items.indexOf(one);
    return { q: big('Which one is ' + (askLiving ? 'living' : 'not living') + '?'), viz: pic(items, { letters: true }),
      a: { t: 'mc', choices: items.map(function (k, i) { return String.fromCharCode(65 + i) + ': ' + name(k); }), v: idx, keep: true },
      hint: 'For each picture, ask: does it grow and need food and water?',
      steps: items.map(function (k) { var al = T[k].life === 'living'; return cap(a_(k)) + (al ? ' grows and needs food and water: living.' : ' does not grow, eat or drink: not living.'); }).concat(['So the answer is <b>' + name(one) + '</b>.']) };
  });

  /* ---------- 2. What Living Things Need ---------- */
  G('lifek.needs', function (R, ctx) {
    var L = ctx.level || 1;
    var animals = keys(function (t) { return t.kind === 'animal' && !t.stage; });
    if (L === 1) {
      var shape = R.int(0, 2), k = R.pick(animals);
      if (shape === 0) return { q: big('Does ' + a_(k) + ' need water to live?'), viz: pic([k]), a: yesNo(true), hint: 'Think about every living thing you know.', steps: ['All living things need water.', 'So yes, ' + a_(k) + ' needs water.'] };
      if (shape === 1) { var toy = R.pick(['car', 'robot', 'ball']); return { q: big('Does ' + a_(toy) + ' need food and water?'), viz: pic([toy]), a: yesNo(false), hint: 'Is it alive?', steps: [cap(a_(toy)) + ' is not alive.', 'Only living things need food and water, so the answer is <b>no</b>.'] }; }
      var thing = R.pick(['food', 'water', 'air']); return { q: big('Does ' + a_(k) + ' need ' + thing + '?'), viz: pic([k]), a: yesNo(true), hint: 'Animals need food, water and air.', steps: ['Animals need food, water, air and a safe place to live.', 'So yes, ' + a_(k) + ' needs ' + thing + '.'] };
    }
    if (L === 2) { // the trouble spot: plants make their own food
      var p = R.pick(['tree', 'flower', 'grass', 'sunflower', 'cactus']), shape2 = R.int(0, 1);
      if (shape2 === 0) return { q: big('How does ' + a_(p) + ' get its food?'), viz: pic([p]), a: mc(R, 'It makes its own food in its leaves.', ['It eats dirt.', 'People feed it snacks.'], true),
        hint: 'Plants do not eat the way animals do.', steps: ['Plants do not eat.', 'A plant uses light, air and water to make its own food in its green leaves (a cactus makes it in its green stem).', 'So it <b>makes its own food</b>.'] };
      var need = R.pick([['light', true], ['water', true], ['candy', false], ['a blanket', false]]);
      return { q: big('Does ' + a_(p) + ' need ' + need[0] + ' to live?'), viz: pic([p]), a: yesNo(need[1]), hint: 'Plants need light, water, air and room to grow.',
        steps: [need[1] ? 'Plants need light and water to make their food and grow.' : 'Plants need light, water, air and room to grow, not ' + need[0] + '.', 'So the answer is <b>' + (need[1] ? 'yes' : 'no') + '</b>.'] };
    }
    // level 3: what do animals need? choose all
    var opts = R.shuffle([['food', 1], ['water', 1], ['air', 1], ['toys', 0], ['a TV', 0]]).slice(0, 4);
    if (!opts.some(function (x) { return x[1]; })) opts[0] = ['water', 1];
    if (opts.every(function (x) { return x[1]; })) opts[3] = ['toys', 0];
    var k3 = R.pick(animals);
    return { q: big('What does ' + a_(k3) + ' need to live? Choose all that are right.'), viz: pic([k3]),
      a: { t: 'mc', choices: opts.map(function (x) { return x[0]; }), v: opts.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }), keep: true },
      hint: 'Animals need food, water, air and shelter.', steps: ['Animals need food, water, air and a safe place to live.', 'An animal does not need ' + opts.filter(function (x) { return !x[1]; }).map(function (x) { return x[0]; }).join(' or ') + ' to live.'] };
  });

  /* ---------- 3. Once Living ---------- */
  var ONCE_WHY = { log: 'it is wood, which came from a tree', leaf: 'it grew on a tree and fell off', shell: 'a sea animal grew it to live in', feather: 'it grew on a bird', core: 'it is part of an apple, which grew on a tree', chair: 'it is made of wood, which came from a tree', paper: 'paper is made from wood, which came from trees', bone: 'it was part of an animal' };
  function onceWhy(k) { return cap(a_(k)) + ' was once part of a living thing: ' + ONCE_WHY[k] + '.'; }
  function nm2(k) { return k === 'water' ? 'water' : k === 'paper' ? 'paper' : a_(k); }
  G('lifek.once-living', function (R, ctx) {
    var L = ctx.level || 1, T = B().THINGS, ONCE = keys(function (t) { return t.life === 'once'; }), NEV = ['rock', 'coin', 'crystal', 'water'];
    if (L === 1) {
      var once = R.coin(), k = once ? R.pick(ONCE) : R.pick(NEV);
      return { q: big('Was ' + (k === 'paper' ? 'paper' : k === 'water' ? 'this water' : 'this ' + name(k)) + ' ever part of a living thing?'), viz: pic([k]), a: yesNo(once), hint: 'Did it come from a plant or an animal?',
        steps: [once ? onceWhy(k) : cap(nm2(k)) + ' never grew or came from a plant or an animal.', 'So the answer is <b>' + (once ? 'yes' : 'no') + '</b>.'] };
    }
    if (L === 2) { // three groups
      var pool = R.pick([0, 1, 2]), k2 = pool === 0 ? R.pick(LIVING()) : pool === 1 ? R.pick(ONCE) : R.pick(NEV);
      return { q: big('Is ' + a_(k2) + ' living, once living, or never living?'), viz: pic([k2]), a: { t: 'mc', choices: ['Living', 'Once living', 'Never living'], v: pool, keep: true },
        hint: 'Living things grow now. Once-living things came from something that grew.',
        steps: [pool === 0 ? cap(a_(k2)) + ' is growing and needs water right now.' : pool === 1 ? onceWhy(k2) + ' It does not grow anymore.' : cap(nm2(k2)) + ' never grew and never came from a living thing.', 'So it is <b>' + ['living', 'once living', 'never living'][pool] + '</b>.'] };
    }
    var one = R.pick(ONCE), others = R.sample(NEV, 2), items = R.shuffle([one].concat(others)), idx = items.indexOf(one);
    return { q: big('Which one was once part of a living thing?'), viz: pic(items, { letters: true }), a: { t: 'mc', choices: items.map(function (k, i) { return String.fromCharCode(65 + i) + ': ' + name(k); }), v: idx, keep: true },
      hint: 'Which one came from a plant or an animal?', steps: [onceWhy(one), cap(others.map(nm2).join(' and ')) + ' never came from a living thing.', 'So the answer is <b>' + name(one) + '</b>.'] };
  });

  /* ---------- 4. Living Things Grow and Change ---------- */
  var GROWS = [['tadpole', 'frog', 'fish'], ['caterpillar', 'butterfly', 'bee'], ['seed', 'sunflower', 'rock'], ['sprout', 'tree', 'mushroom']];
  G('lifek.grow-change', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(GROWS), young = g[0], adult = g[1], wrong = g[2];
    if (L === 1) {
      var tru = R.coin(), into = tru ? adult : wrong;
      return { q: big('Can ' + a_(young) + ' grow into ' + a_(into) + '?'), viz: pic([young]), a: yesNo(tru),
        hint: 'Living things grow into grown-ups of their own kind.', steps: [cap(a_(young)) + ' grows into ' + a_(adult) + '.', tru ? 'So yes, that is true.' : 'It can never become ' + a_(wrong) + ', so the answer is <b>no</b>.'] };
    }
    if (L === 2) {
      g = R.pick(GROWS.slice(0, 2)); young = g[0]; adult = g[1]; wrong = g[2];
      var ch = mc(R, name(adult), [name(wrong), name(R.pick(['snake', 'spider', 'turtle']))]);
      return { q: big('What does ' + a_(young) + ' grow into?'), viz: pic([young]), a: ch, hint: 'Young living things grow into grown-ups of their own kind, even when they look different now.',
        steps: [cap(a_(young)) + (young === 'tadpole' || young === 'caterpillar' ? ' looks very different from its parents, but it is a young ' + name(adult) + '.' : ' is how a ' + name(adult) + ' starts.'), 'It grows into <b>' + a_(adult) + '</b>.'] };
    }
    // level 3: order from youngest to oldest
    var cyc = R.pick(['frog', 'butterfly', 'plant']), st = B().cycle(cyc), pick3 = cyc === 'frog' ? [0, 1, 4] : cyc === 'butterfly' ? [0, 1, 3] : [0, 1, 3];
    var ord = R.shuffle([0, 1, 2]); while (ord[0] === 0 && ord[1] === 1) ord = R.shuffle([0, 1, 2]);
    var letters = ['A', 'B', 'C'], right = [0, 1, 2].map(function (s) { return letters[ord.indexOf(s)]; }).join(', ');
    var wrongs = ['A, B, C', 'C, B, A', 'B, A, C', 'A, C, B', 'B, C, A', 'C, A, B'].filter(function (x) { return x !== right; });
    return { q: big('Put the pictures in order, from youngest to oldest.'), viz: { name: 'bi-lifecycle', opts: { cycle: cyc, order: ord.map(function (i) { return pick3[i]; }), quiet: true, interactive: false, label: 'Three life stages, lettered A, B and C.' } },
      a: mc(R, right, R.sample(wrongs, 2)), hint: 'Which one is the smallest and youngest? Start there.',
      steps: [0, 1, 2].map(function (s) { return letters[ord.indexOf(s)] + ' shows the ' + st[pick3[s]].name.replace(/ \(.*\)/, '') + '.'; }).concat(['From youngest to oldest: <b>' + right + '</b>.']) };
  });

  /* ---------- 5. What Plants Need ---------- */
  G('lifek.plant-needs', function (R, ctx) {
    var L = ctx.level || 1, PL = ['tree', 'flower', 'sunflower', 'cactus', 'grass', 'fern', 'pine'], k = R.pick(PL), nm = name(k);
    if (L === 1) {
      var n = R.pick([['light', true], ['water', true], ['air', true], ['room to grow', true], ['nutrients from the soil', true], ['candy', false], ['a toy', false], ['milk', false], ['a hat', false], ['music', false]]);
      return { q: big('Does ' + a_(k) + ' need ' + n[0] + ' to grow?'), viz: pic([k]), a: yesNo(n[1]),
        hint: 'Plants need light, water, air, nutrients from the soil and room to grow.', steps: ['Plants need light, water, air, nutrients from the soil and room to grow.', n[1] ? 'So yes, ' + a_(k) + ' needs ' + n[0] + '.' : cap(a_(k)) + ' does not need ' + n[0] + ', so the answer is <b>no</b>.'] };
    }
    if (L === 2) { // the trouble spot: food comes from the leaves, not the soil
      var shape = R.int(0, 2), green = k === 'cactus' ? 'green stem' : k === 'pine' ? 'green needles' : 'leaves';
      if (shape === 0) return { q: big('Where does ' + a_(k) + ' make its food?'), viz: pic([k]), a: mc(R, 'In its ' + green, ['In the soil', k === 'cactus' ? 'In its spines' : 'In its roots'], true),
        hint: 'Which part catches the sunlight?', steps: ['The green parts of a plant catch sunlight.', 'They use light, air and water to make the plant\'s food.', 'So ' + a_(k) + ' makes its food <b>in its ' + green + '</b>.'] };
      var what = R.pick([['in a dark closet', 'light', 'It turns pale and droopy.'], ['with no water', 'water', 'It wilts.'], ['in a tiny cup, crowded with other plants', 'room to grow', 'It grows small and weak.']]), days = R.pick(['two weeks', 'three weeks', 'a month']);
      if (shape === 1) return { q: big(cap(a_(k)) + ' is kept ' + what[0] + ' for ' + days + '. What happens?'), viz: pic([k]), a: mc(R, what[2], ['It grows big and green.', 'Nothing changes.'], true), hint: 'What does a plant need to stay healthy?',
        steps: ['A plant needs ' + what[1] + ' to stay healthy.', 'Without it, the plant cannot grow well: <b>' + what[2].toLowerCase() + '</b>'] };
      return { q: big('What does the soil give ' + a_(k) + '?'), viz: pic([k]), a: mc(R, 'Water and some nutrients', ['All of its food', 'Light'], true), hint: 'The roots take things in from the soil.',
        steps: ['Roots take in water and a few nutrients from the soil.', 'The plant makes its own food in its green parts, so the soil gives <b>water and some nutrients</b>, not its food.'] };
    }
    // level 3: a fair-test story with two plants
    var cases = [['by a sunny window', 'in a dark closet', 'light'], ['watered every few days', 'never watered', 'water'], ['in its own big pot', 'squeezed into a tiny cup with five others', 'room to grow']], c = R.pick(cases), firstGood = R.coin();
    var A = firstGood ? c[0] : c[1], Bp = firstGood ? c[1] : c[0], sp = R.pick(['bean', 'sunflower', 'tomato', 'pea', 'marigold']);
    return { q: big('Two ' + sp + ' plants start the same. Plant A is ' + A + '. Plant B is ' + Bp + '. Which one grows better?'), a: { t: 'mc', choices: ['Plant A', 'Plant B'], v: firstGood ? 0 : 1, keep: true },
      hint: 'Which plant gets what it needs?', steps: ['Plants need ' + c[2] + ' to grow well.', 'The plant ' + c[0] + ' gets ' + c[2] + '.', 'So <b>Plant ' + (firstGood ? 'A' : 'B') + '</b> grows better.'] };
  });

  /* ---------- 6. Parts of a Plant ---------- */
  var PARTS = ['roots', 'stem', 'leaves', 'flower'];
  G('lifek.plant-parts', function (R, ctx) {
    var L = ctx.level || 1, P = B().PLANT_PARTS;
    if (L === 1) {
      var withFruit = R.coin(), all = withFruit ? PARTS.concat(['fruit']) : PARTS, p = R.pick(all), others = R.sample(all.filter(function (x) { return x !== p; }), 1);
      return { q: big('What part of the plant has the "?"'), viz: { name: 'bi-plant', opts: { quiet: true, interactive: false, ask: p, fruit: withFruit, label: 'A plant with a question mark on one part.' } }, a: mc(R, cap(P[p].name), [cap(P[others[0]].name)]),
        hint: 'Is it under the ground? Is it green and flat? Is it colorful?', steps: ['The "?" points to the ' + P[p].name + '.', 'The ' + P[p].name + ' ' + P[p].job + '.'] };
    }
    if (L === 2) {
      var q = R.pick([['Which part is under the ground?', 'roots'], ['Which part makes the seeds?', 'flower'], ['Which part catches sunlight to make food?', 'leaves'], ['Which part holds the plant up?', 'stem'], ['Which part takes in water from the soil?', 'roots']]);
      var wr = R.sample(PARTS.filter(function (x) { return x !== q[1]; }), 2);
      return { q: big(q[0]), viz: { name: 'bi-plant', opts: { quiet: true, interactive: false, label: 'A plant.' } }, a: mc(R, cap(P[q[1]].name), wr.map(function (x) { return cap(P[x].name); })),
        hint: 'Think about what each part does.', steps: ['The ' + P[q[1]].name + ' ' + P[q[1]].job + '.', 'So the answer is the <b>' + P[q[1]].name + '</b>.'] };
    }
    var t = R.pick([['The trunk of a tree is which part?', 'stem', 'A tree trunk is a big, woody stem: it holds the tree up and carries water.'], ['A tree has roots. Is that true?', 'yes', 'Trees have roots under the ground, often spreading wider than the branches.'], ['Is a tree a plant?', 'yes', 'A tree has roots, a stem (its trunk), leaves and flowers, so it is a plant.']]);
    if (t[1] === 'yes') return { q: big(t[0]), viz: pic(['tree']), a: yesNo(true), hint: 'Big and woody plants are still plants.', steps: [t[2], 'So the answer is <b>yes</b>.'] };
    return { q: big(t[0]), viz: pic(['tree']), a: mc(R, 'Stem', ['Root', 'Leaf']), hint: 'Which part holds a plant up?', steps: [t[2], 'So the answer is the <b>stem</b>.'] };
  });

  /* =====================================================================================================================
     Shared helpers for topics 7 to 51 (written by the course builder; the model's helpers above are used too)
     ===================================================================================================================== */
  function LT(i) { return String.fromCharCode(65 + i); }
  function lcf(s) { s = String(s); return /^[A-Z](:|,)/.test(s) || /^(Plant|Stage) [A-Z]\b/.test(s) || /^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  var MASS = { corn: 1, lettuce: 1, broccoli: 1, grass: 1, algae: 1, krill: 1, celery: 1, paper: 1 };
  function the(k) { return MASS[k] ? name(k) : 'the ' + name(k); }
  function art(w) { return (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w; }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function perms(n) { if (n === 1) return [[0]]; var out = []; perms(n - 1).forEach(function (p) { for (var i = 0; i <= p.length; i++) out.push(p.slice(0, i).concat([n - 1], p.slice(i))); }); return out; }
  // a bank item becomes a problem. it: { q, a, w: [wrong choices] } or { q, yn: true | false }; s: steps (string or array);
  // pic: [THINGS keys] or a full viz object; h: hint; keep: keep the choices in the written order (for reading aloud)
  function bank(R, it, hint) {
    var yn = it.yn !== undefined, ans = yn ? yesNo(it.yn) : mc(R, it.a, it.w, it.keep);
    var end = yn ? 'So the answer is <b>' + (it.yn ? 'yes' : 'no') + '</b>.' : it.a.split(' ').length <= 5 ? 'So the answer is <b>' + lcf(it.a.replace(/\.$/, '')) + '</b>.' : 'The answer: <b>' + it.a + '</b>';
    var p = { q: big(it.q), a: ans, hint: it.h || hint || 'Read each choice and think about what you learned.', steps: (it.s ? [].concat(it.s) : []).concat([end]) };
    if (it.pic) p.viz = Array.isArray(it.pic) ? pic(it.pic) : it.pic;
    return p;
  }
  // one of several lettered pictures is the answer; why(k) explains each picture in one short sentence
  function whichPic(R, right, wrongs, question, why, hint) {
    var items = R.shuffle([right].concat(wrongs)), idx = items.indexOf(right);
    return { q: big(question), viz: pic(items, { letters: true }), a: { t: 'mc', choices: items.map(function (k, i) { return LT(i) + ': ' + name(k); }), v: idx, keep: true },
      hint: hint, steps: items.map(function (k, i) { return LT(i) + ' shows ' + the(k) + '. ' + cap(why(k)); }).concat(['So the answer is <b>' + LT(idx) + ': ' + name(right) + '</b>.']) };
  }
  // choose all that are right: opts [[text, right?, why]]; shows n choices with at least one right and one wrong
  function chooseAll(R, question, opts, n, hint, lead) {
    var rt = opts.filter(function (x) { return x[1]; }), wr = opts.filter(function (x) { return !x[1]; });
    var k = R.int(Math.max(1, n - wr.length), Math.min(rt.length, n - 1)), o = R.shuffle(R.sample(rt, k).concat(R.sample(wr, n - k)));
    return { q: big(question + ' Choose all that are right.'), a: { t: 'mc', choices: o.map(function (x) { return x[0]; }), v: o.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }), keep: true },
      hint: hint, steps: (lead ? [lead] : []).concat(o.map(function (x) { return (x[1] ? 'Yes: ' : 'No: ') + x[0] + (x[2] ? ' (' + x[2] + ')' : '') + '.'; })).concat(['So the right ones are <b>' + o.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join(', ') + '</b>.']) };
  }
  // put steps (given in the right order) into order: they are shown lettered in a shuffled order; three choices of orders
  function orderQ(R, question, steps, hint, vizFor) {
    var n = steps.length, ord = R.shuffle(range(n));
    while (ord.every(function (v, i) { return v === i; })) ord = R.shuffle(range(n));
    var right = range(n).map(function (s) { return LT(ord.indexOf(s)); }).join(', ');
    var others = perms(n).map(function (p) { return p.map(LT).join(', '); }).filter(function (x) { return x !== right; });
    var shown = vizFor ? '' : '<br>' + ord.map(function (s, pos) { return '<b>' + LT(pos) + '</b>&nbsp; ' + cap(steps[s]); }).join('<br>');
    var p = { q: big(question + shown), a: mc(R, right, R.sample(others, 2)), hint: hint || 'Which one happens first? Start there.',
      steps: range(n).map(function (s, i) { return (i === 0 ? 'First: ' : i === n - 1 ? 'Last: ' : 'Then: ') + LT(ord.indexOf(s)) + ' (' + steps[s] + ').'; }).concat(['In order: <b>' + right + '</b>.']) };
    if (vizFor) p.viz = vizFor(ord);
    return p;
  }
  function qpic(k, extra) { return pic([k], extra); }

  /* ---------- 7. What Roots Do ---------- */
  G('lifek.roots', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Do roots hold a plant in the ground?', yn: true, s: 'Roots spread out in the soil and hold on, so wind and rain do not knock the plant over.', pic: { name: 'bi-plant', opts: { quiet: true, interactive: false, ask: 'roots', label: 'A plant with a question mark on its roots.' } } },
        { q: 'Do roots take in water from the soil?', yn: true, s: 'Roots soak up water from the soil, and the stem carries it up.', pic: ['carrot'] },
        { q: 'Do roots catch sunlight to make food?', yn: false, s: 'Roots are under the ground, in the dark. The leaves catch sunlight.' },
        { q: 'Do roots grow up toward the sky?', yn: false, s: 'Roots grow down into the soil. The stem grows up toward the light.' },
        { q: 'Where are most of a plant\'s roots?', a: 'Under the ground', w: ['On top of the flower'], keep: true, s: 'Roots grow down into the soil, where the water is.', pic: { name: 'bi-plant', opts: { quiet: true, interactive: false, label: 'A plant.' } } },
        { q: 'Is a carrot a root?', yn: true, s: 'The orange carrot we eat is a big root. It grows down into the soil and stores food for the plant.', pic: ['carrot'] }
      ]), 'Think about where roots are and what they reach.');
    }
    if (L === 2) { // the trouble spot: roots drink the water; they are not only for holding on
      return bank(R, R.pick([
        { q: 'What do roots do? They hold the plant in the ground, and…', a: 'they take in water.', w: ['they make seeds.', 'they catch sunlight.'], keep: true, s: ['Roots have two big jobs.', 'They hold the plant in place, and they take in water and nutrients from the soil.'] },
        { q: 'Sam sprays water only on a plant\'s leaves. The soil stays dry. Will the plant get the water it needs?', yn: false, s: ['Most of a plant\'s water comes in through its roots.', 'The roots are in the soil, so the soil needs the water.'] },
        { q: 'How does most of the water get into a plant?', a: 'Through its roots', w: ['Through its flowers', 'Through its leaves'], keep: true, s: 'Roots soak up water from the soil. The stem carries it up to the leaves.' },
        { q: 'A strong wind blows. What keeps a tree from falling over?', a: 'Its roots', w: ['Its leaves', 'Its flowers'], keep: true, s: 'Big roots spread out under the ground and hold on tight.', pic: ['tree'] },
        { q: 'A plant\'s pot is watered. Which part drinks the water first?', a: 'The roots', w: ['The flower', 'The leaves'], keep: true, s: 'The water soaks into the soil, and the roots in the soil take it in.' }
      ]), 'Roots hold on, and they drink.');
    }
    // level 3: which one is a root we eat? (a potato is a stem)
    var others = R.sample(['potato', 'lettuce', 'broccoli', 'tomato', 'apple', 'corn'], 2);
    var why = { carrot: 'It is a root that grows down into the soil', potato: 'It grows under the ground, but it is a stem, not a root', lettuce: 'We eat its leaves', broccoli: 'It is a bunch of flower buds', tomato: 'It is a fruit with seeds', apple: 'It is a fruit with seeds', corn: 'We eat its seeds' };
    var p = whichPic(R, 'carrot', others, 'Which one is a root that we eat?', function (k) { return why[k] + '.'; }, 'Which one grew down into the soil?');
    if (others.indexOf('potato') >= 0) p.hint = 'A potato grows under the ground, but it is not a root. Look for another.';
    return p;
  });

  /* ---------- 8. What Stems and Leaves Do ---------- */
  G('lifek.stems-leaves', function (R, ctx) {
    var L = ctx.level || 1, plantPic = { name: 'bi-plant', opts: { quiet: true, interactive: false, label: 'A plant.' } };
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Which part catches sunlight to make the plant\'s food?', a: 'The leaves', w: ['The roots'], keep: true, s: 'Green leaves spread out flat to catch the light. They use it to make food.', pic: plantPic },
        { q: 'Which part holds a plant up tall?', a: 'The stem', w: ['The flower'], keep: true, s: 'The stem stands up and holds the leaves and flowers up to the light.', pic: plantPic },
        { q: 'What part of a tree is its trunk?', a: 'The stem', w: ['The roots'], keep: true, s: 'A tree trunk is a big, woody stem. It holds the tree up.', pic: ['tree'] },
        { q: 'What color are most leaves in summer?', a: 'Green', w: ['Blue'], keep: true, s: 'Leaves are green because of the green stuff that catches sunlight.' },
        { q: 'Do leaves make food for the plant?', yn: true, s: 'Leaves use sunlight, air and water to make the plant\'s food.', pic: plantPic }
      ]), 'Think about where each part is and what it does.');
    }
    if (L === 2) { // the trouble spot: the stem is a pipe, not just a stick
      return bank(R, R.pick([
        { q: 'Is a stem just a stick with no job?', yn: false, s: ['A stem holds the leaves up to the light.', 'It is also a pipe: it carries water up and food down.'] },
        { q: 'What does a stem carry up from the roots to the leaves?', a: 'Water', w: ['Sunlight', 'Seeds'], keep: true, s: 'Tiny tubes inside the stem carry water up from the roots.' },
        { q: 'A white flower stands in a cup of water with blue food coloring. A day later, its petals have blue edges. How did the blue water get up?', a: 'Up through the stem', w: ['Through the air', 'The petals jumped in the cup'], keep: true, s: ['The cut stem was in the blue water.', 'Tubes in the stem carried the water all the way up to the petals.'] },
        { q: 'The leaves make food. Where does the stem carry some of that food?', a: 'Down to the roots', w: ['Out to the sky', 'Into the soil to feed worms'], keep: true, s: 'The stem carries water up and food down, so the roots get food too.' },
        { q: 'Why does a stem grow up tall?', a: 'To lift the leaves up to the light', w: ['To reach the water in the soil', 'To make the roots'], keep: true, s: 'Leaves need light to make food. The stem lifts them up toward it.' }
      ]), 'A stem holds the plant up, and it is a pipe.');
    }
    // level 3: the path of water, or an underground stem
    if (R.coin()) return orderQ(R, 'Put the path of water in a plant in order.', ['the roots take water in from the soil', 'the stem carries it up', 'the leaves use it to make food'], 'Where does the water come in?');
    var oth = R.sample(['carrot', 'lettuce', 'apple', 'tomato'], 2), why = { potato: 'It is a stem that grows under the ground', carrot: 'It is a root', lettuce: 'We eat its leaves', apple: 'It is a fruit', tomato: 'It is a fruit' };
    var p = whichPic(R, 'potato', oth, 'Which one is a stem that grows under the ground?', function (k) { return why[k] + '.'; }, 'One of these has little buds called eyes. New shoots grow from them, and buds grow on stems.');
    p.steps.splice(p.steps.length - 1, 0, 'A potato has buds (its "eyes") that grow into new shoots. Buds grow on stems, so a potato is a stem.');
    return p;
  });

  /* ---------- 9. Flowers, Fruits and Seeds ---------- */
  var FRUITS = ['tomato', 'pumpkin', 'apple', 'peapod', 'coconut'], NOTFRUIT = { carrot: 'a root', lettuce: 'a bunch of leaves', potato: 'an underground stem', broccoli: 'flower buds' };
  G('lifek.flowers-fruits-seeds', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Which part of a plant makes seeds?', a: 'The flower', w: ['The roots'], keep: true, s: 'A flower makes seeds. Then a fruit grows around them.', pic: { name: 'bi-plant', opts: { quiet: true, interactive: false, ask: 'flower', label: 'A plant with a question mark on its flower.' } } },
        { q: 'Does an apple have seeds inside?', yn: true, s: 'Cut an apple open and you find small brown seeds in the middle.', pic: ['apple'] },
        { q: 'Does a pumpkin have seeds inside?', yn: true, s: 'A pumpkin is full of flat white seeds.', pic: ['pumpkin'] },
        { q: 'What does a fruit hold?', a: 'Seeds', w: ['Roots'], keep: true, s: 'A fruit holds and protects the plant\'s seeds.' },
        { q: 'Can a seed grow into a new plant?', yn: true, s: 'A seed holds a tiny new plant inside. With water and warmth it starts to grow.', pic: ['seed'] }
      ]), 'Flowers make seeds, and fruits hold them.');
    }
    if (L === 2) { // the trouble spot: a fruit holds seeds, sweet or not
      var k = R.pick(FRUITS.filter(function (x) { return x !== 'apple'; }).concat(['tomato', 'peapod'])), nm = name(k);
      var shape = R.int(0, 2);
      if (shape === 0) return bank(R, { q: 'Is ' + a_(k) + ' a fruit?', yn: true, s: [cap(a_(k)) + ' holds seeds inside.', 'To a scientist, the part of a plant that holds the seeds is a fruit, even if it is not sweet.'], pic: [k] });
      if (shape === 1) return bank(R, { q: 'Why is ' + a_(k) + ' called a fruit?', a: 'It holds seeds.', w: ['It is sweet.', 'It grows under the ground.'], keep: true, s: 'A fruit is the part of a plant that holds the seeds. Sweet or not does not matter.', pic: [k] });
      var nf = R.pick(Object.keys(NOTFRUIT));
      return bank(R, { q: 'Is ' + a_(name(nf)) + ' a fruit?', yn: false, s: [cap(art(name(nf))) + ' is ' + NOTFRUIT[nf] + '.', 'It does not hold the plant\'s seeds, so it is not a fruit.'], pic: [nf] });
    }
    // level 3: which one is a fruit?
    var f = R.pick(FRUITS), oth = R.sample(Object.keys(NOTFRUIT), 2);
    return whichPic(R, f, oth, 'Which one is a fruit?', function (k) { return NOTFRUIT[k] ? 'It is ' + NOTFRUIT[k] + ', with no seeds inside.' : 'It holds seeds, so it is a fruit.'; }, 'Which one has seeds inside?');
  });

  /* ---------- 10. Bees, Butterflies and Pollen ---------- */
  G('lifek.pollinators', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(['bee', 'butterfly', 'hummingbird', 'rock', 'ball', 'car']), yes = ['bee', 'butterfly', 'hummingbird'].indexOf(k) >= 0;
      return bank(R, { q: 'Can ' + a_(k) + ' carry pollen from flower to flower?', yn: yes, pic: [k],
        s: yes ? cap(a_(k)) + ' visits flowers to drink their sweet nectar. Pollen sticks to it and goes along to the next flower.' : cap(a_(k)) + ' does not visit flowers, so it does not carry pollen.' }, 'Does it visit flowers?');
    }
    if (L === 2) { // the trouble spot: the bee comes for nectar; carrying pollen happens along the way
      return bank(R, R.pick([
        { q: 'Why does a bee visit flowers?', a: 'To drink nectar, a sweet juice', w: ['To help the flower on purpose', 'To take a nap'], keep: true, s: ['A bee visits flowers to get food: sweet nectar, and some pollen to take home.', 'While it drinks, pollen sticks to its fuzzy body and travels to the next flower.'], pic: ['bee'] },
        { q: 'A bee drinks nectar from a flower. What sticks to its fuzzy body?', a: 'Pollen', w: ['Seeds', 'Leaves'], keep: true, s: 'Pollen is a yellow powder made in the flower. It sticks to the bee and rides along to the next flower.', pic: ['bee'] },
        { q: 'Pollen moves from one flower to another. What does that help the plant make?', a: 'Seeds', w: ['Roots', 'Leaves'], keep: true, s: 'When pollen reaches another flower of the same kind, the flower can make seeds.', pic: ['flower'] },
        { q: 'Corn and grass have no bright petals and no nectar. What carries their pollen?', a: 'The wind', w: ['Bees', 'Fish'], keep: true, s: 'Corn and grass make lots of light pollen, and the wind blows it from plant to plant.', pic: ['grass'] },
        { q: 'A hummingbird sips nectar from a red flower. Does it help the flower?', yn: true, s: 'Pollen gets on the hummingbird\'s head and beak and goes with it to the next flower.', pic: ['hummingbird'] }
      ]), 'Think about what sticks to an animal as it drinks.');
    }
    return chooseAll(R, 'Which of these carry pollen from flower to flower?', [
      ['a bee', true, 'pollen sticks to its fuzzy body'], ['a butterfly', true, 'it sips nectar and pollen sticks to it'], ['a hummingbird', true, 'pollen sticks to its head and beak'], ['the wind', true, 'it blows the pollen of grass and corn'],
      ['a rock', false, 'it does not move or visit flowers'], ['a goldfish in a bowl', false, 'it never visits flowers'], ['a toy car', false, 'it does not visit flowers']], 4, 'Which ones visit flowers or blow past them?');
  });

  /* ---------- 11. How Seeds Travel ---------- */
  var TRAVEL = { dandelion: 'wind', maple: 'wind', coconut: 'water', burr: 'animal-fur', apple: 'animal-eat', peapod: 'pop' };
  var TRAVEL_TXT = { wind: 'The wind blows it', water: 'It floats on water', 'animal-fur': 'It sticks to an animal\'s fur', 'animal-eat': 'An animal eats the fruit and drops the seeds', pop: 'The pod dries and pops open' };
  var TRAVEL_WHY = { dandelion: 'A dandelion seed has a fluffy top like a little umbrella, so the wind carries it.', maple: 'A maple seed has a wing. It spins like a helicopter as the wind carries it.', coconut: 'A coconut is light and waterproof. It can float across the sea to a new beach.', burr: 'A burr is covered with tiny hooks that catch on fur and socks.', apple: 'Animals eat apples and drop or leave the seeds somewhere new.', peapod: 'A pea pod dries out and splits open along its seams, and the peas fall out.' };
  G('lifek.seeds-travel', function (R, ctx) {
    var L = ctx.level || 1, keysT = Object.keys(TRAVEL);
    if (L === 1) {
      var k = R.pick(keysT), right = TRAVEL_TXT[TRAVEL[k]], wrong = TRAVEL_TXT[R.pick(Object.keys(TRAVEL_TXT).filter(function (t) { return t !== TRAVEL[k]; }))];
      return bank(R, { q: 'How does ' + (k === 'burr' ? 'a burr' : k === 'peapod' ? 'a pea seed' : k === 'maple' ? 'a maple seed' : k === 'apple' ? 'an apple seed' : k === 'coconut' ? 'a coconut' : 'a dandelion seed') + ' get to a new place?', a: right + '.', w: [wrong + '.'], keep: true, s: TRAVEL_WHY[k], pic: [k] }, 'Look at its shape. Is it fluffy, winged, hooked, or inside a fruit?');
    }
    if (L === 2) { // the trouble spot: seeds go farther than the ground under the parent plant
      return bank(R, R.pick([
        { q: 'Why is it good for a seed to travel away from its parent plant?', a: 'The new plant gets room and light.', w: ['Seeds do not like their parents.', 'It is not good. Seeds should stay close.'], keep: true, s: ['Under a big plant it is shady and crowded.', 'Far away, a new plant has more room, light and water.'] },
        { q: 'A burr sticks to a dog\'s fur on a walk. What happens next?', a: 'The dog carries it to a new place.', w: ['The burr grows on the dog.', 'The burr turns into a flower right away.'], keep: true, s: 'The burr rides along. Later it falls off far from its parent plant and may grow there.', pic: ['burr'] },
        { q: 'Do all seeds just drop to the ground right under their parent plant?', yn: false, s: 'Many seeds travel: on the wind, on water, on fur, inside animals, or popped out of pods.' },
        { q: 'A bird eats a cherry and flies away. Where might the cherry seed end up?', a: 'Far away, where the bird drops it', w: ['Back on the same branch', 'Nowhere, because birds keep seeds'], keep: true, s: 'Birds and other animals carry seeds inside fruit and drop them in new places.', pic: ['robin'] }
      ]), 'Think about the shade under a big tree.');
    }
    // level 3: three seeds, lettered; which one travels this way?
    var way = R.pick(['wind', 'water', 'animal-fur', 'pop']), right3 = R.pick(keysT.filter(function (k) { return TRAVEL[k] === way; }));
    var wr = R.sample(keysT.filter(function (k) { return TRAVEL[k] !== way; }), 2);
    var qt = { wind: 'Which seed is carried by the wind?', water: 'Which seed floats on water to a new place?', 'animal-fur': 'Which seed sticks to an animal\'s fur?', pop: 'Which seed is popped out of a pod?' }[way];
    return whichPic(R, right3, wr, qt, function (k) { return TRAVEL_WHY[k]; }, 'Look at each shape. How could it travel?');
  });

  /* ---------- 12. A Seed Starts to Grow ---------- */
  G('lifek.seed-grows', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'What does a seed need to start growing?', a: 'Water', w: ['Candy'], keep: true, s: 'A seed soaks up water, swells, and wakes up. It also needs warmth and air.', pic: ['seed'] },
        { q: 'Is there a tiny plant inside a seed?', yn: true, s: 'Every seed holds a tiny new plant and food for it, wrapped in a seed coat.', pic: ['seed'] },
        { q: 'Does a seed need warmth to start growing?', yn: true, s: 'Most seeds wait for warm weather. Cold seeds stay asleep.', pic: ['seed'] },
        { q: 'A seed starts to grow. What do we call the little plant that comes up?', a: 'A sprout', w: ['A fruit'], keep: true, s: 'A seed that starts to grow is sprouting. The young plant is a sprout.', pic: ['sprout'] }
      ]), 'Think about what wakes a seed up.');
    }
    if (L === 2) { // the trouble spot: most seeds sprout in the dark soil
      return bank(R, R.pick([
        { q: 'A bean seed is planted in dark, damp soil. Can it sprout there?', yn: true, s: ['A bean seed does not need light to sprout.', 'It uses the food stored inside it until its first leaves reach the light.'], pic: ['seed'] },
        { q: 'Where does a sprouting bean get its first food?', a: 'From food stored inside the seed', w: ['From sunlight on its roots', 'From candy in the soil'], keep: true, s: 'A seed packs its own lunch: food for the tiny plant until its leaves can make more.' },
        { q: 'What grows out of a bean seed first?', a: 'A root', w: ['A flower', 'A fruit'], keep: true, s: 'The root comes out first and grows down. Then the shoot grows up toward the light.' },
        { q: 'When does a young plant start to need light?', a: 'When its first leaves come up', w: ['Before the seed gets wet', 'Never'], keep: true, s: 'Under the soil it lives on stored food. Once its leaves are up, it needs light to make food.' },
        { q: 'Which way does the root of a sprouting seed grow?', a: 'Down into the soil', w: ['Up into the air', 'Sideways out of the pot'], keep: true, s: 'Roots grow down toward the water. The shoot grows up.' }
      ]), 'The seed has food stored inside.');
    }
    return orderQ(R, 'A bean seed starts to grow. Put the steps in order.', ['the seed soaks up water and swells', 'a root grows down', 'a shoot grows up', 'the first leaves open in the light'], 'What has to happen before anything grows?');
  });

  /* ---------- 13. The Life Cycle of a Plant ---------- */
  G('lifek.plant-life-cycle', function (R, ctx) {
    var L = ctx.level || 1, st = B().cycle('plant'), nm = function (i) { return st[i].name; };
    if (L === 1) {
      var i = R.int(0, st.length - 1), w = R.pick(range(st.length).filter(function (j) { return j !== i; }));
      return bank(R, { q: 'What goes where the "?" is?', a: cap(nm(i)), w: [cap(nm(w))], pic: { name: 'bi-lifecycle', opts: { cycle: 'plant', ask: i, quiet: true, interactive: false, label: 'The life cycle of a bean plant, with one stage hidden.' } },
        s: ['Go around the circle: seed, sprout, young plant, adult plant with flowers, pod with seeds.', 'The "?" is stage ' + (i + 1) + ': the ' + nm(i) + '.'], h: 'Start at the seed at the top and go around.' });
    }
    if (L === 2) { // the trouble spot: flowers come after the young plant, and the cycle comes back to seeds
      return bank(R, R.pick([
        { q: 'Which comes first: the young plant or the flowers?', a: 'The young plant', w: ['The flowers'], keep: true, s: 'A plant grows leaves and gets bigger first. Flowers come when it is grown.' },
        { q: 'What grows after the flowers?', a: 'A pod (fruit) with seeds', w: ['A sprout', 'The roots'], keep: true, s: 'Flowers make seeds, and a pod grows around them.' },
        { q: 'The seeds from the pod are planted. What happens next?', a: 'They sprout, and the cycle starts again.', w: ['Nothing grows.', 'They turn into flowers right away.'], keep: true, s: 'New seeds start new plants. That is why it is called a cycle: it comes back around.' },
        { q: 'What comes right after the sprout?', a: 'A young plant', w: ['A pod with seeds', 'Flowers'], keep: true, s: 'The sprout grows more leaves and becomes a young plant.' }
      ]), 'Seed, sprout, young plant, flowers, pod with seeds.');
    }
    var pick3 = R.pick([[0, 1, 3], [1, 2, 4], [0, 2, 3], [0, 3, 4]]);
    return orderQ(R, 'Put the pictures in order, starting with the youngest.', pick3.map(nm), 'Which one is the youngest?', function (ord) {
      return { name: 'bi-lifecycle', opts: { cycle: 'plant', order: ord.map(function (j) { return pick3[j]; }), quiet: true, interactive: false, label: 'Three stages of a bean plant, lettered A, B and C.' } };
    });
  });

  /* ---------- 14. Plants Make Their Own Food ---------- */
  var PHOTO_NAME = { light: 'Light from the sun', co2: 'Air (carbon dioxide) going in', water: 'Water coming up from the roots', o2: 'Oxygen going out', sugar: 'Sugar, the plant\'s food' };
  G('lifek.plants-make-food', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Where does a plant make its food?', a: 'In its green leaves', w: ['In the soil'], keep: true, s: 'Green leaves use light, air and water to make the plant\'s food.', pic: ['tree'] },
        { q: 'Can a rabbit make its own food from sunlight?', yn: false, s: 'Only plants (and a few tiny living things) can do that. A rabbit must eat plants.', pic: ['rabbit'] },
        { q: 'Does a plant use sunlight to make food?', yn: true, s: 'Light gives the leaves the energy to put air and water together into sugar.', pic: ['sunflower'] },
        { q: 'Does a plant eat soil for its food?', yn: false, s: 'The soil gives water and a few nutrients. The plant makes its food in its leaves.', pic: ['flower'] }
      ]), 'Plants do not eat. They make.');
    }
    if (L === 2) { // the trouble spot: a tree is built from air and water, not soil
      var shape = R.int(0, 2);
      if (shape === 0) return bank(R, { q: 'A huge oak tree grew from one small acorn. Where did most of the stuff in the tree come from?', a: 'Air and water', w: ['The soil', 'Rocks'], keep: true, pic: ['tree'],
        s: ['The leaves take in air (carbon dioxide) and water.', 'Using the energy of sunlight, they turn it into sugar, and the tree builds wood from that sugar.'], h: 'What do the leaves take in?' });
      if (shape === 1) return chooseAll(R, 'What does a plant use to make its food?', [['sunlight', true], ['water', true], ['air', true], ['candy', false], ['milk', false], ['soil it eats', false]], 4, 'Think of the arrows going into a leaf.', 'Leaves make food from light, air and water.');
      return bank(R, { q: 'A leaf makes food. What gas does it give out into the air?', a: 'Oxygen', w: ['Smoke', 'Steam from a kettle'], keep: true, s: 'When leaves make sugar, they give off oxygen, the gas we breathe in.', pic: { name: 'bi-plant', opts: { mode: 'photo', quiet: true, interactive: false, ask: 'o2', show: ['light', 'co2', 'water', 'o2'], label: 'A plant with arrows; one arrow is marked with a question mark.' } } });
    }
    if (R.coin()) { // what is the arrow with the "?"
      var k = R.pick(['light', 'co2', 'water', 'o2']), wr = R.sample(['light', 'co2', 'water', 'o2', 'sugar'].filter(function (x) { return x !== k; }), 2);
      return bank(R, { q: 'What does the arrow with the "?" show?', a: PHOTO_NAME[k], w: wr.map(function (x) { return PHOTO_NAME[x]; }), pic: { name: 'bi-plant', opts: { mode: 'photo', quiet: true, interactive: false, ask: k, show: ['light', 'co2', 'water', 'o2'], label: 'A plant with arrows going in and out; one arrow is marked with a question mark.' } },
        s: ['Light comes from the sun. Air goes into the leaves. Water comes up from the roots. Oxygen goes out.', 'The "?" arrow is ' + lcf(PHOTO_NAME[k]) + '.'], h: 'Where does the arrow start, and where does it point?' });
    }
    return bank(R, { q: 'Long ago, a scientist named van Helmont grew a willow tree in a pot of soil for five years. The tree grew from 5 pounds to 169 pounds. The soil lost only about 2 ounces. Did the tree\'s new weight come from the soil?', yn: false,
      s: ['The tree gained about 164 pounds (169 − 5 = 164).', 'The soil lost only about 2 ounces, much less than one pound.', 'The new weight came mostly from air and water, put together by the leaves.'], h: 'Compare what the tree gained with what the soil lost.' });
  });

  /* ---------- 15. Plant Parts We Eat ---------- */
  var EAT = { carrot: 'root', potato: 'stem', lettuce: 'leaf', broccoli: 'flower', apple: 'fruit', tomato: 'fruit', pumpkin: 'fruit', corn: 'seed', peapod: 'seed' };
  var EAT_WHY = { carrot: 'A carrot is a big root that grows down into the soil.', potato: 'A potato is a stem that grows under the ground. Its "eyes" are buds, and buds grow on stems.', lettuce: 'We eat the leaves of lettuce.', broccoli: 'Broccoli is a bunch of tiny flower buds on thick stalks.', apple: 'An apple holds seeds, so it is a fruit.', tomato: 'A tomato holds seeds, so it is a fruit.', pumpkin: 'A pumpkin holds seeds, so it is a fruit.', corn: 'Corn kernels are seeds.', peapod: 'Peas are the seeds inside the pod.' };
  function eatName(k) { return k === 'peapod' ? 'peas' : k === 'corn' ? 'corn kernels' : name(k); }
  G('lifek.plants-we-eat', function (R, ctx) {
    var L = ctx.level || 1, PARTS6 = ['root', 'stem', 'leaf', 'flower', 'fruit', 'seed'];
    if (L === 1) {
      var k = R.pick(['carrot', 'lettuce', 'apple', 'tomato', 'pumpkin', 'corn', 'peapod']), w = R.pick(PARTS6.filter(function (p) { return p !== EAT[k] && p !== 'stem'; }));
      var many = k === 'peapod' || k === 'corn' || k === 'lettuce', PL = { root: 'Roots', stem: 'Stems', leaf: 'Leaves', flower: 'Flowers', fruit: 'Fruits', seed: 'Seeds' };
      return bank(R, { q: 'What part of a plant ' + (many ? 'are ' + (k === 'lettuce' ? 'lettuce leaves' : eatName(k)) : 'is ' + a_(k)) + '?', a: many ? PL[EAT[k]] : cap(art(EAT[k])), w: [many ? PL[w] : cap(art(w))], s: EAT_WHY[k], pic: [k] }, 'Did it grow under the ground? Is it green and flat? Does it hold seeds?');
    }
    if (L === 2) { // the trouble spot: a potato is a stem; ask which part, not root or leaf by habit
      var k2 = R.pick(['potato', 'potato', 'broccoli', 'tomato', 'pumpkin']);
      var ch = { potato: ['A stem', ['A root', 'A fruit']], broccoli: ['Flowers', ['Roots', 'Seeds']], tomato: ['A fruit', ['A leaf', 'A root']], pumpkin: ['A fruit', ['A root', 'A stem']] }[k2];
      return bank(R, { q: 'What part of the plant is ' + (k2 === 'broccoli' ? 'broccoli' : a_(k2)) + '?', a: ch[0], w: ch[1], keep: true, s: EAT_WHY[k2], pic: [k2] }, k2 === 'potato' ? 'Look for its little "eyes". What grows from them?' : 'Think about what it holds or how it grew.');
    }
    // level 3: lettered pictures, which one is a … we eat?
    var part = R.pick(['root', 'leaf', 'flower', 'fruit', 'seed', 'stem']), right = R.pick(Object.keys(EAT).filter(function (k) { return EAT[k] === part; }));
    var wr = R.sample(Object.keys(EAT).filter(function (k) { return EAT[k] !== part; }), 2);
    return whichPic(R, right, wr, 'Which one is ' + art(part) + ' we eat?', function (k) { return EAT_WHY[k]; }, 'For each picture, ask: which part of the plant is it?');
  });

  /* ---------- 16. What Animals Need ---------- */
  G('lifek.animal-needs', function (R, ctx) {
    var L = ctx.level || 1, AN = ['dog', 'cat', 'cow', 'rabbit', 'deer', 'owl', 'duck', 'frog', 'turtle', 'bee', 'snake', 'mouse'];
    if (L === 1) {
      var k = R.pick(AN), need = R.pick([['food', true], ['water', true], ['air', true], ['a safe place to rest', true], ['a toy', false], ['a television', false], ['shoes', false]]);
      return bank(R, { q: 'Does ' + a_(k) + ' need ' + need[0] + ' to live?', yn: need[1], pic: [k],
        s: need[1] ? 'Animals need food, water, air and shelter, a safe place to rest.' : 'Animals need food, water, air and shelter. ' + cap(need[0]) + ' is not one of them.' }, 'Animals need food, water, air and shelter.');
    }
    if (L === 2) { // the trouble spot: fish and other water animals need oxygen too
      return bank(R, R.pick([
        { q: 'Does a fish need oxygen, the part of air we breathe?', yn: true, s: ['All animals need oxygen.', 'A fish gets it from the water: a little oxygen is mixed into the water, and its gills take it out.'], pic: ['fish'] },
        { q: 'How does a fish get the oxygen it needs?', a: 'Its gills take oxygen from the water.', w: ['It does not need any.', 'It eats it with its food.'], keep: true, s: 'Water flows over a fish\'s gills, and the gills take out the oxygen mixed in the water.', pic: ['fish'] },
        { q: 'A whale lives in the ocean. How does it get air?', a: 'It comes up and breathes through a blowhole.', w: ['It uses gills like a fish.', 'It never needs air.'], keep: true, s: 'Whales breathe air with lungs, like you. They swim up and breathe through the blowhole on top of the head.', pic: ['whale'] },
        { q: 'Does a goldfish in a bowl need clean water with air in it?', yn: true, s: 'A goldfish takes oxygen from its water. Dirty water with little oxygen makes it sick.', pic: ['fish'] },
        { q: 'Which animals need air (oxygen) to live?', a: 'All animals', w: ['Only animals on land', 'Only birds'], keep: true, s: 'Land animals breathe it in. Fish take it from the water with their gills. Every animal needs it.' }
      ]), 'Every animal needs oxygen. Where does a water animal get it?');
    }
    if (R.coin()) return chooseAll(R, 'What does a rabbit need to live?', [['food', true, 'grass and other plants'], ['water', true], ['air', true], ['shelter', true, 'a burrow to hide and rest in'], ['a toy car', false], ['a TV', false], ['candy', false]], 4, 'Animals need food, water, air and shelter.');
    var sh = R.pick([['rabbit', 'a burrow under the ground'], ['bee', 'a hive'], ['robin', 'a nest in a tree'], ['beaver', 'a lodge of sticks and mud'], ['bear', 'a den']]);
    var wr = R.sample(['a burrow under the ground', 'a hive', 'a nest in a tree', 'a lodge of sticks and mud', 'a den'].filter(function (x) { return x !== sh[1]; }), 2);
    return bank(R, { q: 'Where does ' + a_(sh[0]) + ' find shelter?', a: cap(sh[1]), w: wr.map(cap), pic: [sh[0]], s: 'Shelter is a safe place to rest and hide. ' + cap(a_(sh[0])) + ' uses ' + sh[1] + '.' }, 'Shelter is a safe place to rest and hide.');
  });

  /* ---------- 17. Plant-Eaters, Meat-Eaters and Both ---------- */
  // diets checked for each animal (animals whose diet is often argued about are left out)
  var DIET = { cow: 'h', rabbit: 'h', deer: 'h', camel: 'h', beaver: 'h', goose: 'h', grasshopper: 'h', caterpillar: 'h',
    wolf: 'c', cat: 'c', owl: 'c', hawk: 'c', shark: 'c', 'polar-bear': 'c', snake: 'c', frog: 'c', spider: 'c', heron: 'c', seal: 'c', penguin: 'c',
    bear: 'o', fox: 'o', mouse: 'o', robin: 'o', hen: 'o', duck: 'o' };
  var DIET_NAME = { h: 'Plants', c: 'Other animals', o: 'Both plants and animals' }, DIET_WORD = { h: 'plant-eater (herbivore)', c: 'meat-eater (carnivore)', o: 'eats both (omnivore)' };
  var DIET_WHY = { cow: 'A cow eats grass.', rabbit: 'A rabbit eats grass, clover and other plants.', deer: 'A deer eats leaves, twigs and acorns.', camel: 'A camel eats desert plants.', beaver: 'A beaver eats bark, twigs and water plants.', goose: 'A goose eats grass and seeds.', grasshopper: 'A grasshopper eats leaves and grass.', caterpillar: 'A caterpillar eats leaves.',
    wolf: 'A wolf hunts deer and other animals.', cat: 'A cat eats meat: in the wild, mice and birds.', owl: 'An owl hunts mice and other small animals.', hawk: 'A hawk hunts mice, rabbits and snakes.', shark: 'A shark eats fish, seals and other sea animals.', 'polar-bear': 'A polar bear hunts seals.', snake: 'A snake eats mice, frogs, eggs or insects.', frog: 'A frog catches insects with its sticky tongue.', spider: 'A spider eats insects caught in its web.', heron: 'A heron spears fish and frogs.', seal: 'A seal eats fish.', penguin: 'A penguin eats fish and krill.',
    bear: 'A bear eats berries, roots and nuts, and fish too.', fox: 'A fox eats mice and rabbits, and berries too.', mouse: 'A mouse eats seeds and grains, and insects too.', robin: 'A robin eats worms and insects, and berries too.', hen: 'A chicken eats seeds and grain, and bugs and worms too.', duck: 'A duck eats water plants and seeds, and snails and bugs too.' };
  function dietOf(k) { return DIET[k]; }
  G('lifek.animal-diets', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(DIET);
    if (L === 1) {
      var k = R.pick(ks.filter(function (x) { return DIET[x] !== 'o'; })), d = DIET[k];
      return { q: big('Does ' + a_(k) + ' eat plants or other animals?'), viz: qpic(k), a: { t: 'mc', choices: ['Plants', 'Other animals'], v: d === 'h' ? 0 : 1, keep: true },
        hint: 'Think about what it eats in the wild.', steps: [DIET_WHY[k], 'So ' + a_(k) + ' eats <b>' + (d === 'h' ? 'plants' : 'other animals') + '</b>. It is a ' + DIET_WORD[d] + '.'] };
    }
    if (L === 2) { // the trouble spot: big is not the same as meat-eater
      var k2 = R.pick(['cow', 'deer', 'camel', 'bear', 'bear', 'beaver']);
      var d2 = DIET[k2], intro = { cow: 'A cow is big and strong.', deer: 'A deer can run fast and has big antlers.', camel: 'A camel is huge and tall.', bear: 'A bear is big and has sharp claws.', beaver: 'A beaver has big, sharp front teeth.' }[k2];
      return { q: big(intro + ' What does it eat?'), viz: qpic(k2), a: { t: 'mc', choices: ['Plants', 'Other animals', 'Both plants and animals'], v: { h: 0, c: 1, o: 2 }[d2], keep: true },
        hint: 'Being big or having sharp teeth does not tell you. Think about what it really eats.', steps: [DIET_WHY[k2], 'So it eats <b>' + DIET_NAME[d2].toLowerCase() + '</b>. Big or strong does not mean meat-eater.'] };
    }
    if (R.coin()) {
      var k3 = R.pick(ks), d3 = DIET[k3];
      return { q: big('Is ' + a_(k3) + ' a plant-eater, a meat-eater, or does it eat both?'), viz: qpic(k3), a: { t: 'mc', choices: ['Plant-eater (herbivore)', 'Meat-eater (carnivore)', 'Eats both (omnivore)'], v: { h: 0, c: 1, o: 2 }[d3], keep: true },
        hint: 'Does it eat plants, animals, or some of each?', steps: [DIET_WHY[k3], d3 === 'o' ? 'So it <b>eats both (omnivore)</b>.' : 'So it is a <b>' + DIET_WORD[d3] + '</b>.'] };
    }
    var want = R.pick(['h', 'c']), right = R.pick(ks.filter(function (x) { return DIET[x] === want; })), wr = R.sample(ks.filter(function (x) { return DIET[x] !== want; }), 2);
    return whichPic(R, right, wr, 'Which one eats only ' + (want === 'h' ? 'plants' : 'other animals') + '?', function (k) { return DIET_WHY[k]; }, 'Think about what each one eats.');
  });

  /* ---------- 18. Body Parts That Help ---------- */
  var BODY_PARTS = [ // [animal, its body part, the job, wrong jobs]
    ['hawk', 'a hooked beak and sharp claws', 'catching and tearing meat', ['sipping nectar', 'cracking seeds open']],
    ['hummingbird', 'a long, thin beak', 'sipping nectar from flowers', ['tearing meat', 'digging in the dirt']],
    ['heron', 'long legs and a long, sharp beak', 'wading in water and spearing fish', ['climbing trees', 'digging burrows']],
    ['duck', 'webbed feet', 'paddling through water', ['climbing trees', 'catching mice']],
    ['fish', 'fins and a tail', 'swimming', ['flying', 'digging']],
    ['cow', 'wide, flat teeth', 'grinding grass and leaves', ['tearing meat', 'sipping nectar']],
    ['wolf', 'long, sharp teeth', 'catching and tearing meat', ['grinding grass', 'sipping nectar']],
    ['camel', 'wide, padded feet', 'walking on soft sand', ['swimming fast', 'climbing trees']],
    ['turtle', 'a hard shell', 'staying safe from animals that want to eat it', ['flying', 'catching fish with it']],
    ['owl', 'big eyes', 'seeing in dim light at night', ['smelling flowers', 'digging holes']],
    ['beaver', 'strong front teeth', 'chewing through wood', ['sipping nectar', 'tearing meat']]
  ];
  G('lifek.body-parts', function (R, ctx) {
    var L = ctx.level || 1, it = R.pick(BODY_PARTS);
    if (L === 1) return bank(R, { q: (it[0] === 'fish' ? 'A fish has ' : cap(a_(it[0])) + ' has ') + it[1] + '. What does that help it do?', a: cap(it[2]), w: [cap(R.pick(it[3]))], keep: true, pic: [it[0]],
      s: 'It uses ' + it[1] + ' for ' + it[2] + '. The shape fits the job.' }, 'Look at the shape. What job could that shape do?');
    if (L === 2) { // the trouble spot: the shape tells the job
      var beaks = [['A bird has a long, thin beak. What does it most likely eat?', 'Nectar from flowers', ['Meat', 'Hard nuts'], 'A long, thin beak reaches deep into a flower, like a straw. Hummingbirds have beaks like this.'],
        ['A bird has a strong, hooked beak. What does it most likely eat?', 'Meat', ['Nectar from flowers', 'Grass'], 'A hooked beak tears meat. Hawks and owls have beaks like this.'],
        ['An animal has wide, flat teeth. What does it most likely eat?', 'Plants', ['Meat', 'Fish only'], 'Flat teeth grind leaves and grass. Cows, deer and horses have teeth like this.'],
        ['An animal has long, sharp, pointed teeth. What does it most likely eat?', 'Meat', ['Grass', 'Nectar'], 'Sharp, pointed teeth grab and tear meat. Wolves and cats have teeth like this.'],
        ['A bird has a short, thick, strong beak. What is it good at?', 'Cracking seeds open', ['Sipping nectar', 'Spearing fish'], 'A thick, strong beak cracks hard seeds, like a nutcracker. Many finches and sparrows have beaks like this.'],
        ['Do all birds have the same kind of beak?', null, null, 'No. Beak shapes are different because birds eat different foods: hooks for meat, straws for nectar, nutcrackers for seeds.']];
      var b = R.pick(beaks);
      if (!b[1]) return bank(R, { q: b[0], yn: false, s: b[3] }, 'Think of a hawk and a hummingbird.');
      return bank(R, { q: b[0], a: b[1], w: b[2], keep: true, s: b[3] }, 'Picture the shape. What could it grab, tear, crack or sip?');
    }
    var right = R.pick(BODY_PARTS), wr = R.sample(BODY_PARTS.filter(function (x) { return x[0] !== right[0] && x[2] !== right[2]; }), 2).map(function (x) { return x[0]; });
    var jobOf = {}; BODY_PARTS.forEach(function (x) { jobOf[x[0]] = x; });
    return whichPic(R, right[0], wr, 'Which animal has a body part for ' + right[2] + '?', function (k) { return 'It has ' + jobOf[k][1] + ', for ' + jobOf[k][2] + '.'; }, 'Look at each animal\'s beak, teeth, feet or shell.');
  });

  /* ---------- 19. Fur, Feathers, Scales and Skin ---------- */
  var COVER = { dog: 'fur', cat: 'fur', cow: 'fur', rabbit: 'fur', fox: 'fur', deer: 'fur', bear: 'fur', wolf: 'fur', mouse: 'fur', squirrel: 'fur', 'polar-bear': 'fur', camel: 'fur', beaver: 'fur',
    owl: 'feathers', robin: 'feathers', penguin: 'feathers', duck: 'feathers', goose: 'feathers', hawk: 'feathers', heron: 'feathers', hen: 'feathers',
    fish: 'scales', snake: 'scales', lizard: 'scales', crocodile: 'scales', frog: 'moist skin', salamander: 'moist skin' };
  var COVER_TXT = { fur: 'Fur', feathers: 'Feathers', scales: 'Dry scales', 'moist skin': 'Smooth, moist skin' };
  COVER_TXT.fishscales = 'Scales';
  function coverTxt(k) { return k === 'fish' ? 'Scales' : COVER_TXT[COVER[k]]; }
  G('lifek.coverings', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(COVER);
    if (L === 1) {
      var k = R.pick(ks), wrongC = R.pick(['fur', 'feathers', 'scales', 'moist skin'].filter(function (c) { return c !== COVER[k]; }));
      return bank(R, { q: 'What covers ' + a_(k) + '\'s body?', a: coverTxt(k), w: [COVER_TXT[wrongC]], pic: [k], s: cap(a_(k)) + ' is covered with ' + coverTxt(k).toLowerCase() + '.' }, 'Is it soft and hairy, fluffy with quills, hard and scaly, or smooth and wet?');
    }
    if (L === 2) { // the trouble spot: snakes are dry; amphibians are moist
      return bank(R, R.pick([
        { q: 'Is a snake\'s skin slimy and wet?', yn: false, s: ['A snake is covered with dry scales.', 'It may look shiny, but it feels dry and smooth.'], pic: ['snake'] },
        { q: 'Which animal has smooth, moist skin?', a: 'A frog', w: ['A snake', 'A lizard'], keep: true, s: 'Frogs and other amphibians have moist skin. Snakes and lizards have dry scales.' },
        { q: 'A salamander and a lizard look alike. Which one has moist skin with no scales?', a: 'The salamander', w: ['The lizard'], keep: true, s: 'A salamander is an amphibian: moist skin, no scales. A lizard is a reptile with dry scales.', pic: ['salamander'] },
        { q: 'What covers a snake?', a: 'Dry scales', w: ['Smooth, moist skin', 'Fur'], keep: true, s: 'Snakes are reptiles, and reptiles have dry, scaly skin.', pic: ['snake'] },
        { q: 'Why does a frog stay near water or damp places?', a: 'Its skin must stay moist.', w: ['It has fur that gets hot.', 'It is afraid of the sun.'], keep: true, s: 'A frog\'s thin, moist skin dries out easily, so frogs stay where it is damp.', pic: ['frog'] }
      ]), 'Reptiles are dry and scaly. Amphibians are moist.');
    }
    var cov = R.pick(['fur', 'feathers', 'moist skin', 'scales']), right = R.pick(ks.filter(function (k) { return COVER[k] === cov; }));
    var wr = R.sample(ks.filter(function (k) { return COVER[k] !== cov; }), 2);
    return whichPic(R, right, wr, 'Which one is covered with ' + (cov === 'scales' ? 'scales' : cov === 'moist skin' ? 'smooth, moist skin' : cov) + '?', function (k) { return 'It has ' + coverTxt(k).toLowerCase() + '.'; }, 'Think about how each one would feel if you could touch it.');
  });

  /* ---------- 20. How Animals Move ---------- */
  var MOVE = { fish: 'swim', shark: 'swim', snake: 'slither', rabbit: 'hop', frog: 'hop', grasshopper: 'hop', hawk: 'fly', owl: 'fly', butterfly: 'fly', bee: 'fly', worm: 'crawl', snail: 'crawl', caterpillar: 'crawl', deer: 'run', wolf: 'run' };
  var MOVE_TXT = { swim: 'It swims', slither: 'It slithers on its belly', hop: 'It hops', fly: 'It flies', crawl: 'It crawls', run: 'It runs on four legs' };
  G('lifek.moving', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(MOVE);
    if (L === 1) {
      var k = R.pick(ks), w = R.pick(Object.keys(MOVE_TXT).filter(function (m) { return m !== MOVE[k]; }));
      return bank(R, { q: 'How does ' + a_(k) + ' move from place to place?', a: MOVE_TXT[MOVE[k]] + '.', w: [MOVE_TXT[w] + '.'], pic: [k], s: cap(a_(k)) + ' ' + { swim: 'swims with fins and a tail', slither: 'has no legs, so it slithers on its belly', hop: 'hops on strong back legs', fly: 'flies with its wings', crawl: 'crawls slowly along the ground', run: 'runs on four long legs' }[MOVE[k]] + '.' }, 'Look at its body. Legs? Wings? Fins? No legs at all?');
    }
    if (L === 2) { // the trouble spot: wings do not always mean flying; tails swim different ways
      return bank(R, R.pick([
        { q: 'A penguin has wings. What does it use them for?', a: 'Swimming under water', w: ['Flying high in the sky', 'Digging holes'], keep: true, s: ['A penguin cannot fly.', 'Its wings are stiff flippers that push it fast through the water.'], pic: ['penguin'] },
        { q: 'Can every animal with wings fly?', yn: false, s: 'Penguins and ostriches have wings but cannot fly. Penguins swim with theirs.', pic: ['penguin'] },
        { q: 'How does a whale move its tail to swim?', a: 'Up and down', w: ['Side to side'], keep: true, s: 'A whale\'s wide tail goes up and down. A fish\'s tail goes side to side.', pic: ['whale'] },
        { q: 'How does a fish move its tail to swim?', a: 'Side to side', w: ['Up and down'], keep: true, s: 'A fish swishes its tail from side to side. A whale moves its tail up and down.', pic: ['fish'] },
        { q: 'A snake has no legs. How does it move?', a: 'It slithers, pushing with its body.', w: ['It cannot move at all.', 'It hops.'], keep: true, s: 'A snake bends its long body and pushes against the ground to slither along.', pic: ['snake'] },
        { q: 'A duck can walk, swim and fly. Is that true?', yn: true, s: 'A duck walks on land, paddles with its webbed feet, and flies with its wings.', pic: ['duck'] }
      ]), 'Look closely: what does each body part really do?');
    }
    var mv = R.pick(['swim', 'fly', 'hop', 'slither', 'crawl']), right = R.pick(ks.filter(function (k) { return MOVE[k] === mv; }));
    var wr = R.sample(ks.filter(function (k) { return MOVE[k] !== mv; }), 2);
    return whichPic(R, right, wr, 'Which animal ' + { swim: 'swims', fly: 'flies', hop: 'hops', slither: 'slithers on its belly', crawl: 'crawls slowly along the ground' }[mv] + '?', function (k) { return MOVE_TXT[MOVE[k]] + '.'; }, 'Look at each body: legs, wings, fins, or no legs?');
  });

  /* ---------- 21. Young Animals and Their Parents ---------- */
  var YOUNG = [['cat', 'kitten', true], ['dog', 'puppy', true], ['cow', 'calf', true], ['deer', 'fawn', true], ['bear', 'cub', true], ['duck', 'duckling', true], ['goose', 'gosling', true],
    ['frog', 'tadpole', false], ['butterfly', 'caterpillar', false]];
  G('lifek.parents-young', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var y = R.pick(YOUNG), picK = y[1] === 'tadpole' || y[1] === 'caterpillar' ? y[1] : y[0];
      return bank(R, { q: 'Does ' + art(y[1]) + ' look a lot like its parent, ' + a_(y[0]) + '?', yn: y[2], pic: [picK],
        s: y[2] ? cap(art(y[1])) + ' looks like a small ' + name(y[0]) + '. It grows bigger as it gets older.' : cap(art(y[1])) + ' looks very different from ' + a_(y[0]) + '. It changes shape as it grows.' }, 'Picture the young one and the grown-up side by side.');
    }
    if (L === 2) { // the trouble spot: not all young are small copies; parents help in different ways
      return bank(R, R.pick([
        { q: 'Which young animal looks very different from its parents?', a: 'A tadpole', w: ['A kitten', 'A puppy'], keep: true, s: 'A tadpole has a tail and no legs, and it lives in water. It grows into a frog.', pic: ['tadpole'] },
        { q: 'Which young animal looks very different from its parents?', a: 'A caterpillar', w: ['A calf', 'A duckling'], keep: true, s: 'A caterpillar has no wings. It grows into a butterfly.', pic: ['caterpillar'] },
        { q: 'Baby robins sit in the nest with their mouths open. How do their parents help them?', a: 'They bring them food.', w: ['They leave them alone.', 'They teach them to swim.'], keep: true, s: 'Robin parents fly back and forth all day with worms and bugs for their chicks.', pic: ['robin'] },
        { q: 'Baby sea turtles hatch on a beach. Do their parents take care of them?', yn: false, s: ['Sea turtle babies hatch from eggs buried in the sand.', 'They crawl to the sea on their own. Many young animals, like most fish, grow up with no help from parents.'], pic: ['turtle'] },
        { q: 'How does a mother duck keep her ducklings safe?', a: 'They follow her, and she watches over them.', w: ['She leaves them in the nest all summer.', 'She carries them in her beak all day.'], keep: true, s: 'Ducklings follow their mother in a line. She leads them to food and watches for danger.', pic: ['duck'] }
      ]), 'Think about how each young animal grows and who helps it.');
    }
    var y3 = R.pick(YOUNG), wr = R.sample(YOUNG.filter(function (x) { return x[0] !== y3[0]; }), 2).map(function (x) { return cap(art(x[1])); });
    if (R.coin()) return bank(R, { q: 'What do we call a young ' + name(y3[0]) + '?', a: cap(art(y3[1])), w: wr, pic: [y3[0]], s: 'A young ' + name(y3[0]) + ' is called ' + art(y3[1]) + '.' }, 'Each kind of animal has a name for its young.');
    var y4 = R.pick(YOUNG), ow = R.sample(YOUNG.filter(function (x) { return x[0] !== y4[0]; }), 2).map(function (x) { return cap(art(name(x[0]))); });
    return bank(R, { q: cap(art(y4[1])) + ' grows up to be…', a: cap(a_(y4[0])), w: ow, s: cap(art(y4[1])) + ' is a young ' + name(y4[0]) + '. Living things grow into grown-ups of their own kind.' }, 'Young living things grow into grown-ups of their own kind.');
  });

  /* ---------- 22–27. Mammals, Birds, Fish, Reptiles, Amphibians, Insects; 28. Sorting Animals ---------- */
  var ONE = { mammal: 'mammal', bird: 'bird', fish: 'fish', reptile: 'reptile', amphibian: 'amphibian', insect: 'insect' };
  var MANY = { mammal: 'Mammals', bird: 'Birds', fish: 'Fish', reptile: 'Reptiles', amphibian: 'Amphibians', insect: 'Insects' };
  var CLUE = { mammal: 'it has hair or fur, breathes air, and feeds its babies milk', bird: 'it has feathers, a beak and two legs', fish: 'it lives in water, breathes with gills and swims with fins',
    reptile: 'it has dry, scaly skin and breathes air with lungs', amphibian: 'it has smooth, moist skin and starts life in water', insect: 'it has six legs and three body parts' };
  var SHORTCLUE = { mammal: 'Hair or fur, and milk for its babies', bird: 'Feathers and a beak', fish: 'Gills and fins', reptile: 'Dry, scaly skin', amphibian: 'Smooth, moist skin', insect: 'Six legs and three body parts' };
  function grp(k) { var t = B().THINGS[k]; return t && t.kind === 'animal' && !t.stage ? t.group : null; }
  function animalsIn(g) { return keys(function (t, k) { return grp(k) === g; }); }
  function animalsNotIn(g) { return keys(function (t, k) { return t.kind === 'animal' && !t.stage && t.group !== g; }); }
  function groupName(k) { var g = grp(k); return ONE[g] || { arachnid: 'arachnid (like a spider)', worm: 'worm', mollusk: 'mollusk (like a snail)', crustacean: 'crustacean (like a crab)', cnidarian: 'jellyfish (not a fish at all)', echinoderm: 'sea star (not a fish at all)' }[g]; }
  function whyGroup(k) { var g = grp(k); return ONE[g] ? cap(a_(k)) + ' is ' + art(ONE[g]) + ': ' + CLUE[g] + '.' : cap(a_(k)) + ' is not in one of the six groups here: it is ' + art(groupName(k)) + '.'; }
  // tricks: [animal, member?, why] for level 2 (the topic's trouble note)
  var TRICKS = {
    mammal: [['whale', true, 'A whale lives in the ocean, but it breathes air with lungs and feeds its babies milk.'], ['dolphin', true, 'A dolphin breathes air through a blowhole and feeds its babies milk.'], ['bat', true, 'A bat flies, but it has fur and feeds its babies milk.'], ['seal', true, 'A seal swims, but it has fur, breathes air and feeds its pups milk.'], ['shark', false, 'A shark breathes with gills and has fins: it is a fish.'], ['penguin', false, 'A penguin has feathers and a beak: it is a bird.']],
    bird: [['penguin', true, 'A penguin cannot fly, but it has feathers and a beak.'], ['hen', true, 'A chicken flies only a little, but it has feathers and a beak.'], ['bat', false, 'A bat flies, but it has fur, not feathers. It is a mammal.'], ['butterfly', false, 'A butterfly flies, but it has six legs and no feathers. It is an insect.'], ['bee', false, 'A bee flies, but it has six legs and no feathers. It is an insect.']],
    fish: [['shark', true, 'A shark has gills, fins and a backbone: it is a fish.'], ['whale', false, 'A whale breathes air with lungs and feeds its babies milk: it is a mammal.'], ['dolphin', false, 'A dolphin breathes air and feeds its babies milk: it is a mammal.'], ['jellyfish', false, 'A jellyfish has no backbone, no gills and no fins. It is not a fish, even with "fish" in its name.'], ['starfish', false, 'A sea star has no backbone, gills or fins. It is not a fish.'], ['crab', false, 'A crab has ten legs and a hard shell. It is not a fish.']],
    reptile: [['turtle', true, 'A turtle swims, but it has dry scales and breathes air with lungs all its life.'], ['crocodile', true, 'A crocodile lives in rivers, but it has dry, scaly skin and breathes air.'], ['snake', true, 'A snake has no legs, but it has dry scales and breathes air.'], ['salamander', false, 'A salamander looks like a lizard, but its skin is moist with no scales: it is an amphibian.'], ['frog', false, 'A frog has moist skin with no scales: it is an amphibian.']],
    amphibian: [['salamander', true, 'A salamander looks like a lizard, but it has smooth, moist skin and no scales.'], ['frog', true, 'A frog has moist skin and starts life in water as a tadpole.'], ['lizard', false, 'A lizard has dry scales: it is a reptile.'], ['turtle', false, 'A turtle has dry scales and breathes air all its life: it is a reptile.'], ['snake', false, 'A snake has dry scales: it is a reptile.']],
    insect: [['ladybug', true, 'A ladybug has six legs and three body parts.'], ['ant', true, 'An ant has six legs and three body parts.'], ['bee', true, 'A bee has six legs, three body parts and wings.'], ['spider', false, 'A spider has eight legs and two body parts: it is not an insect.'], ['worm', false, 'An earthworm has no legs at all: it is not an insect.'], ['snail', false, 'A snail has a shell and no legs: it is not an insect.']]
  };
  function groupTopic(g) {
    return function (R, ctx) {
      var L = ctx.level || 1, tricks = TRICKS[g], trickKeys = tricks.map(function (x) { return x[0]; });
      if (L === 1 && g === 'insect' && R.coin()) {
        var ik = R.pick(['ant', 'bee', 'ladybug', 'grasshopper', 'butterfly', 'spider']), legs = ik === 'spider' ? 8 : 6;
        return bank(R, { q: 'How many legs does ' + a_(ik) + ' have?', a: String(legs), w: [String(legs === 6 ? R.pick([4, 8]) : R.pick([6, 4]))], pic: [ik], s: cap(a_(ik)) + ' has ' + legs + ' legs' + (legs === 6 ? ', like every insect.' : ', so it is not an insect.') }, 'Count the legs on one side, then double it.');
      }
      if (L === 1) {
        var yes = R.coin(), pool = yes ? animalsIn(g).filter(function (k) { return g === 'insect' || trickKeys.indexOf(k) < 0; }) : animalsNotIn(g).filter(function (k) { return trickKeys.indexOf(k) < 0 && ONE[grp(k)]; });
        if (!pool.length) pool = animalsIn(g);
        var k = R.pick(pool); yes = grp(k) === g;
        return bank(R, { q: k === 'fish' ? 'This animal lives in a pond. It has fins and gills. Is it ' + art(ONE[g]) + '?' : 'Is ' + a_(k) + ' ' + art(ONE[g]) + '?', yn: yes, pic: [k], s: k === 'fish' && g === 'fish' ? 'It lives in water, breathes with gills and swims with fins: it is a fish.' : whyGroup(k) }, cap(art(ONE[g])) + ': ' + CLUE[g] + '.');
      }
      if (L === 2) {
        var t = R.pick(tricks);
        return bank(R, { q: 'Is ' + a_(t[0]) + ' ' + art(ONE[g]) + '?', yn: t[1], pic: [t[0]], s: t[2] }, 'Do not go by where it lives or how it moves. Look for the body clues.');
      }
      if (g === 'insect' && R.coin()) {
        var spider = R.coin();
        return { q: big('How many legs does ' + (spider ? 'a spider' : 'an insect') + ' have?'), viz: qpic(spider ? 'spider' : R.pick(['ant', 'ladybug', 'bee', 'grasshopper'])), a: { t: 'num', v: spider ? '8' : '6' },
          hint: spider ? 'Count the legs on both sides. It is more than an insect has.' : 'Count the legs: three on each side.', steps: [spider ? 'A spider has four legs on each side: 4 + 4 = 8.' : 'An insect has three legs on each side: 3 + 3 = 6.', 'So the answer is <b>' + (spider ? 8 : 6) + '</b>' + (spider ? ', which is why a spider is not an insect.' : '.')] };
      }
      if (R.coin()) {
        var right = R.pick(animalsIn(g)), wr = R.sample(animalsNotIn(g).filter(function (k) { return ONE[grp(k)] || g === 'insect' || g === 'fish'; }), 2);
        return whichPic(R, right, wr, 'Which one is ' + art(ONE[g]) + '?', whyGroup, 'Look for the clue: ' + CLUE[g] + '.');
      }
      var others = R.sample(Object.keys(SHORTCLUE).filter(function (x) { return x !== g; }), 2);
      return bank(R, { q: 'Which clue tells you an animal is ' + art(ONE[g]) + '?', a: SHORTCLUE[g], w: others.map(function (x) { return SHORTCLUE[x]; }), s: cap(art(ONE[g])) + ': ' + CLUE[g] + '.' }, 'Think of a ' + name(animalsIn(g)[0]) + '. What does its body have?');
    };
  }
  G('lifek.mammals', groupTopic('mammal'));
  G('lifek.birds', groupTopic('bird'));
  G('lifek.fish', groupTopic('fish'));
  G('lifek.reptiles', groupTopic('reptile'));
  G('lifek.amphibians', groupTopic('amphibian'));
  G('lifek.insects', groupTopic('insect'));

  G('lifek.sorting-animals', function (R, ctx) {
    var L = ctx.level || 1, SIX = ['mammal', 'bird', 'fish', 'reptile', 'amphibian', 'insect'];
    var all = keys(function (t, k) { return ONE[grp(k)]; });
    if (L === 1) {
      var k = R.pick(all.filter(function (x) { return ['whale', 'dolphin', 'bat', 'seal', 'penguin', 'salamander', 'turtle', 'shark'].indexOf(x) < 0; })), g = grp(k), w = R.pick(SIX.filter(function (x) { return x !== g; }));
      return bank(R, { q: 'Which group is ' + a_(k) + ' in?', a: MANY[g], w: [MANY[w]], pic: [k], s: whyGroup(k) }, 'Fur? Feathers? Scales? Moist skin? Gills? Six legs?');
    }
    if (L === 2) { // the trouble spot: body clues decide the group, not the home or the way it moves
      var t = R.pick([['whale', 'mammal', 'fish'], ['dolphin', 'mammal', 'fish'], ['bat', 'mammal', 'bird'], ['penguin', 'bird', 'fish'], ['salamander', 'amphibian', 'reptile'], ['turtle', 'reptile', 'amphibian'], ['shark', 'fish', 'mammal'], ['seal', 'mammal', 'fish']]);
      var third = R.pick(SIX.filter(function (x) { return x !== t[1] && x !== t[2]; }));
      var why = TRICKS[t[1]].filter(function (x) { return x[0] === t[0]; })[0];
      return bank(R, { q: 'Which group is ' + a_(t[0]) + ' in?', a: MANY[t[1]], w: [MANY[t[2]], MANY[third]], pic: [t[0]], s: [why ? why[2] : whyGroup(t[0]), 'Body clues decide the group, not where it lives or how it moves.'] }, 'Where it lives does not decide. Look at the body clues.');
    }
    // level 3: a riddle made of clues
    var g3 = R.pick(SIX), riddle = { mammal: R.pick(['This animal has fur and feeds its babies milk. It swims in the ocean.', 'This animal has fur and flies at night.', 'This animal has hair, breathes air and feeds its babies milk.']),
      bird: R.pick(['This animal has feathers and a beak, but it cannot fly. It swims.', 'This animal has feathers, a beak and two legs.']), fish: 'This animal lives in water, breathes with gills, and swims with fins.',
      reptile: R.pick(['This animal has dry, scaly skin and breathes air. It lays eggs on land.', 'This animal has no legs and dry scales.']), amphibian: R.pick(['This animal has smooth, moist skin. It started life in water with gills.', 'This animal looks like a lizard, but its skin is moist with no scales.']),
      insect: R.pick(['This animal has six legs, three body parts and wings.', 'This tiny animal has six legs and three body parts.']) }[g3];
    var wr3 = R.sample(SIX.filter(function (x) { return x !== g3; }), 2);
    return bank(R, { q: riddle + ' What group is it in?', a: MANY[g3], w: wr3.map(function (x) { return MANY[x]; }), s: [cap(art(ONE[g3])) + ': ' + CLUE[g3] + '.'] }, 'Which clue belongs to only one group?');
  });

  /* ---------- 29–34. Habitats ---------- */
  // where each living thing lives (for these problems): every place listed, so a wrong choice never lives in the place asked about
  var PLACES = { deer: ['forest'], owl: ['forest'], squirrel: ['forest'], bear: ['forest'], fern: ['forest'], mushroom: ['forest'],
    camel: ['desert'], lizard: ['desert', 'forest'], cactus: ['desert'],
    'polar-bear': ['polar'], penguin: ['polar', 'ocean'], seal: ['polar', 'ocean'],
    grasshopper: ['grassland'], rabbit: ['grassland', 'forest'],
    whale: ['ocean'], dolphin: ['ocean'], shark: ['ocean'], crab: ['ocean'], jellyfish: ['ocean'], starfish: ['ocean'],
    frog: ['pond'], duck: ['pond'], beaver: ['pond'], heron: ['pond'] };
  var PLACE_NAME = { forest: 'a forest', desert: 'a desert', polar: 'an icy polar place', grassland: 'a grassland', ocean: 'the ocean', pond: 'a pond' };
  var PLACE_WHY = { forest: 'lives among the trees of the forest', desert: 'lives in the dry desert', polar: 'lives in icy polar places', grassland: 'lives in wide, grassy places', ocean: 'lives in the salty ocean', pond: 'lives in or beside a fresh-water pond' };
  function livesIn(k, place) { return (PLACES[k] || []).indexOf(place) >= 0; }
  function inPlace(place) { return Object.keys(PLACES).filter(function (k) { return livesIn(k, place); }); }
  function notIn(place) { return Object.keys(PLACES).filter(function (k) { return !livesIn(k, place); }); }
  function homeWhy(k) { return cap(a_(k)) + ' ' + PLACE_WHY[PLACES[k][0]] + (PLACES[k].length > 1 ? ' (and ' + PLACES[k].slice(1).map(function (p) { return PLACE_NAME[p]; }).join(', ') + ')' : '') + '.'; }
  function itWhy(k) { return 'It ' + PLACE_WHY[PLACES[k][0]] + (PLACES[k].length > 1 ? ' (and ' + PLACES[k].slice(1).map(function (p) { return PLACE_NAME[p]; }).join(', ') + ')' : '') + '.'; }
  function scene(place, things, extra) { return { name: 'bi-habitat', opts: Object.assign({ place: place, things: things, quiet: true, interactive: false, title: false, label: 'A habitat scene.' }, extra || {}) }; }

  G('lifek.habitats', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var place = R.pick(['forest', 'pond', 'desert', 'ocean']), k = R.pick(inPlace(place).filter(function (x) { return B().THINGS[x].kind === 'animal'; }));
      return bank(R, R.pick([
        { q: cap(a_(k)) + ' lives in ' + PLACE_NAME[place] + '. Does it find its food, water and shelter there?', yn: true, s: 'A habitat is the place where a living thing finds everything it needs. ' + cap(PLACE_NAME[place]) + ' is the habitat of ' + a_(k) + '.', pic: scene(place, [k]) },
        { q: 'Is a habitat the place where a plant or animal finds food, water and shelter?', yn: true, s: 'Yes. A forest, a pond and a desert are all habitats.', pic: scene(place, inPlace(place).slice(0, 3)) },
        { q: 'Is a toy box a habitat for a wild animal?', yn: false, s: 'A wild animal cannot find food, water and shelter in a toy box. Its habitat is a place like a forest or a pond.' }
      ]), 'A habitat has food, water and shelter.');
    }
    if (L === 2) { // the trouble spot: a habitat is the whole place, not only the nest or burrow
      return bank(R, R.pick([
        { q: 'A robin builds a nest in a tree in the forest. What is the robin\'s habitat?', a: 'The whole forest, with its trees, bugs and water', w: ['Just the nest', 'The sky'], keep: true, s: 'The nest is the robin\'s home for its eggs. Its habitat is the whole place where it finds food, water and shelter.', pic: ['robin'] },
        { q: 'Is a rabbit\'s burrow its whole habitat?', yn: false, s: ['The burrow is its shelter.', 'Its habitat is the whole meadow or forest, where it also finds plants to eat and water to drink.'], pic: ['rabbit'] },
        { q: 'Which one is a habitat: a pond or a nest?', a: 'A pond', w: ['A nest'], keep: true, s: 'A pond is a whole place with water, food and shelter for many living things. A nest is just one bird\'s home.', pic: scene('pond', ['frog', 'duck', 'fish']) },
        { q: 'What is a frog\'s habitat?', a: 'The pond and the land around it', w: ['A lily pad', 'A jar'], keep: true, s: 'A frog uses the water, the plants and the bugs in and around the pond. All of it is its habitat.', pic: ['frog'] }
      ]), 'A habitat is the whole place, not just one home.');
    }
    var pl = R.pick(['forest', 'pond', 'desert', 'ocean', 'polar']), rt = inPlace(pl).filter(function (x) { return B().THINGS[x].kind === 'animal'; }), wr = notIn(pl).filter(function (x) { return B().THINGS[x].kind === 'animal'; });
    var p = chooseAll(R, 'This is ' + PLACE_NAME[pl] + '. Which of these animals live here?', rt.map(function (k) { return [name(k), true, 'it ' + PLACE_WHY[pl]]; }).concat(wr.map(function (k) { return [name(k), false, 'it ' + PLACE_WHY[PLACES[k][0]]]; })), 4, 'Which ones could find food, water and shelter here?');
    p.viz = scene(pl, []); return p;
  });

  G('lifek.land-habitats', function (R, ctx) {
    var L = ctx.level || 1, LAND = ['forest', 'desert', 'polar', 'grassland'];
    if (L === 1) {
      var pl = R.pick(LAND), wrongPl = R.pick(LAND.filter(function (x) { return x !== pl; }));
      var only = inPlace(pl).filter(function (k) { return PLACES[k].length === 1 || pl === 'grassland'; }), things = R.sample(only, Math.min(2, only.length));
      return bank(R, { q: 'Which habitat is this?', a: cap(PLACE_NAME[pl]), w: [cap(PLACE_NAME[wrongPl])], pic: scene(pl, things),
        s: { forest: 'Many tall trees grow close together: it is a forest.', desert: 'It is dry and sandy, with a cactus: it is a desert.', polar: 'It is white with ice and snow: it is an icy polar place.', grassland: 'It is wide and covered in grass, with few trees: it is a grassland.' }[pl] }, 'Look at the ground and the plants. Trees? Sand? Snow? Grass?');
    }
    if (L === 2) { // the trouble spot: deserts are not always hot, and they are full of life
      return bank(R, R.pick([
        { q: 'Do plants and animals live in deserts?', yn: true, s: 'Cactuses, lizards, snakes, hawks and kangaroo rats all live in deserts. They are good at saving water.', pic: scene('desert', ['cactus', 'lizard', 'snake']) },
        { q: 'Is a desert always hot?', yn: false, s: ['A desert is a place that gets very little rain.', 'Many deserts get cold at night, and some are cold all winter.'], pic: scene('desert', []) },
        { q: 'What makes a place a desert?', a: 'It gets very little rain.', w: ['It is always hot.', 'It has no living things.'], keep: true, s: 'A desert is a dry place. Some deserts are hot, some get cold, and all have living things.' },
        { q: 'A kangaroo rat lives in the desert. Where does it get its water?', a: 'From the seeds it eats', w: ['From a big lake', 'It never needs water'], keep: true, s: 'Kangaroo rats get the water they need from their food, so they almost never need to drink.' }
      ]), 'A desert is a dry place.');
    }
    var pl3 = R.pick(LAND), right = R.pick(inPlace(pl3)), wr3 = R.sample(notIn(pl3).filter(function (k) { return LAND.indexOf(PLACES[k][0]) >= 0 || PLACES[k][0] === 'ocean'; }), 2);
    return whichPic(R, right, wr3, 'Which one lives in ' + PLACE_NAME[pl3] + '?', itWhy, 'Think about what each one needs: shade, sand, snow or grass?');
  });

  G('lifek.water-habitats', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Is ocean water salty?', yn: true, s: 'Ocean water is salty. You could taste the salt if you swam in the sea.', pic: scene('ocean', ['whale']) },
        { q: 'Is the water in a pond salty?', yn: false, s: 'Ponds, lakes and rivers hold fresh water, which is not salty.', pic: scene('pond', ['duck']) },
        { q: 'Does a whale live in a pond or in the ocean?', a: 'In the ocean', w: ['In a pond'], keep: true, s: 'A whale is huge. It lives in the salty ocean.', pic: ['whale'] },
        { q: 'Does a duck live in a pond or in the ocean?', a: 'In a pond', w: ['In the ocean'], keep: true, s: 'A duck paddles on ponds and lakes and nests on the bank.', pic: ['duck'] },
        { q: 'Does the water in a river flow, or stay still?', a: 'It flows', w: ['It stays still'], keep: true, s: 'River water flows downhill to a lake or the sea. Pond water stays mostly still.' }
      ]), 'Ponds and rivers are fresh water. The ocean is salty.');
    }
    if (L === 2) { // the trouble spot: salty and fresh water are different homes
      return bank(R, R.pick([
        { q: 'Could a shark from the ocean live in a small pond?', yn: false, s: ['A shark needs the salty ocean, and lots of room to swim.', 'Most ocean animals cannot live in fresh water.'], pic: ['shark'] },
        { q: 'Which water is salty?', a: 'The ocean', w: ['A pond', 'A river'], keep: true, s: 'The ocean is salty. Ponds, lakes and rivers are fresh water.' },
        { q: 'Is all water the same kind of home for fish?', yn: false, s: 'Ocean fish need salty water. Pond and river fish need fresh water. Most cannot switch.', pic: ['fish'] },
        { q: 'Where would you find a sea star?', a: 'In the ocean', w: ['In a pond', 'In a river'], keep: true, s: 'Sea stars live in salty ocean water, on rocks and the sea floor.', pic: ['starfish'] }
      ]), 'Is the water salty or fresh?');
    }
    var pl = R.pick(['ocean', 'pond']), right = R.pick(inPlace(pl)), wr = R.sample(inPlace(pl === 'ocean' ? 'pond' : 'ocean').filter(function (k) { return !livesIn(k, pl); }).concat(R.coin() ? ['camel'] : []), 2);
    return whichPic(R, right, wr, 'Which one lives in ' + PLACE_NAME[pl] + '?', itWhy, pl === 'ocean' ? 'Which one needs salty water?' : 'Which one lives in fresh, still water?');
  });

  var FIT = [ // [living thing, body feature, its habitat, how the feature helps]
    ['polar-bear', 'thick fur and a layer of fat', 'polar', 'They keep it warm on the ice.'],
    ['camel', 'wide feet, and it can go a long time without drinking', 'desert', 'Wide feet do not sink in sand, and it saves water.'],
    ['cactus', 'a thick stem that stores water, and spines', 'desert', 'It saves water for dry times, and the spines keep animals from eating it.'],
    ['duck', 'webbed feet and waterproof feathers', 'pond', 'It paddles and stays dry on the water.'],
    ['penguin', 'thick, waterproof feathers and a layer of fat', 'polar', 'They keep it warm in icy water.'],
    ['heron', 'long legs and a long, sharp beak', 'pond', 'It wades in shallow water and spears fish.'],
    ['fish', 'gills and fins', 'pond', 'Gills take oxygen from the water, and fins help it swim.']
  ];
  G('lifek.fit-habitat', function (R, ctx) {
    var L = ctx.level || 1, f = R.pick(FIT);
    if (L === 1) {
      var it = R.pick([['What helps a polar bear stay warm?', 'Thick fur and fat', ['Big, thin ears', 'Webbed feet', 'Thin, short hair'], 'polar-bear'], ['What helps a duck paddle in the pond?', 'Webbed feet', ['Long claws', 'Thick fur', 'A hard shell'], 'duck'],
        ['What helps a cactus live where it is dry?', 'A thick stem that stores water', ['Big, thin leaves', 'Roots that need wet mud', 'Bright petals'], 'cactus'], ['What helps a fish breathe under water?', 'Gills', ['A blowhole', 'Feathers', 'A long neck'], 'fish'],
        ['What helps a camel walk on soft sand?', 'Wide feet', ['Webbed feet', 'Tiny hooves', 'Sharp claws'], 'camel'], ['What helps a penguin stay warm in icy water?', 'Thick feathers and fat', ['Big, thin ears', 'Bare skin', 'Long legs'], 'penguin'],
        ['What helps a heron catch fish in shallow water?', 'Long legs and a sharp beak', ['Webbed feet and a flat beak', 'Thick fur', 'Short legs'], 'heron']]);
      return bank(R, { q: it[0], a: it[1], w: [R.pick(it[2])], pic: [it[3]], s: FIT.filter(function (x) { return x[0] === it[3]; })[0][3] }, 'Which body part fits the place it lives?');
    }
    if (L === 2) { // the trouble spot: living things are suited to their own habitats
      return bank(R, R.pick([
        { q: 'Could a polar bear live well in a hot desert?', yn: false, s: ['Its thick fur and fat are made for the ice.', 'In a hot desert it would get far too hot, and there are no seals to hunt.'], pic: ['polar-bear'] },
        { q: 'Could a cactus grow well in a wet swamp?', yn: false, s: ['A cactus is made to store water where it is dry.', 'In soggy ground its roots would rot.'], pic: ['cactus'] },
        { q: 'What does a camel\'s hump store?', a: 'Fat', w: ['Water', 'Sand'], keep: true, s: 'Many people think the hump holds water, but it stores fat. The camel can use the fat when food is hard to find.', pic: ['camel'] },
        { q: 'Could a fish live on dry land?', yn: false, s: 'A fish\'s gills work only in water. On land it cannot breathe.', pic: ['fish'] },
        { q: 'Could any animal live anywhere if it just moved there?', yn: false, s: 'Each living thing has a body made for its own kind of place. In a very different place it may not survive.' }
      ]), 'Think about the animal\'s body. Would it work in a very different place?');
    }
    f = R.pick(FIT.filter(function (x) { return x[0] !== 'fish'; }));
    var wrongPl = R.sample(['polar', 'desert', 'pond', 'forest'].filter(function (p) { return p !== f[2]; }), 2);
    return bank(R, { q: cap(a_(f[0])) + ' has ' + f[1] + '. Which habitat is it made for?', a: cap(PLACE_NAME[f[2]]), w: wrongPl.map(function (p) { return cap(PLACE_NAME[p]); }), pic: [f[0]], s: [f[3], 'Those are just right for ' + PLACE_NAME[f[2]] + '.'] }, 'Where would that body part help the most?');
  });

  var HOMES = { robin: 'a nest', bee: 'a hive', rabbit: 'a burrow', spider: 'a web', beaver: 'a lodge', bear: 'a den', ant: 'an anthill' };
  var HOME_WHY = { robin: 'A robin builds a cup-shaped nest of twigs, grass and mud.', bee: 'Honey bees build a hive with wax rooms called cells.', rabbit: 'A rabbit digs or uses a burrow, a tunnel under the ground.', spider: 'A spider spins a web of silk to rest on and catch insects.', beaver: 'A beaver builds a lodge of sticks and mud in the water.', bear: 'A bear rests in a den, like a cave or a hollow under a fallen tree.', ant: 'Ants dig tunnels and pile up the dirt into an anthill.' };
  G('lifek.animal-homes', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(HOMES);
    if (L === 1) {
      var k = R.pick(ks), w = HOMES[R.pick(ks.filter(function (x) { return x !== k && HOMES[x] !== HOMES[k]; }))];
      return bank(R, { q: 'What kind of home does ' + a_(k) + ' make or use?', a: cap(HOMES[k]), w: [cap(w)], pic: [k], s: HOME_WHY[k] }, 'Think of where you have seen this animal resting.');
    }
    if (L === 2) { // the trouble spot: not every animal lives in a nest
      return bank(R, R.pick([
        { q: 'Does every animal live in a nest?', yn: false, s: 'Bees build hives, rabbits dig burrows, spiders spin webs and beavers build lodges. Each kind has its own shelter.' },
        { q: 'Does every animal build a home?', yn: false, s: 'Many fish never build a home. Deer rest in thick bushes or tall grass instead of building one.', pic: ['deer'] },
        { q: 'Which animal spins a web of silk for its home?', a: 'A spider', w: ['A robin', 'A rabbit'], keep: true, s: HOME_WHY.spider },
        { q: 'Which animal digs a burrow under the ground?', a: 'A rabbit', w: ['A robin', 'A bee'], keep: true, s: HOME_WHY.rabbit },
        { q: 'A robin builds a nest. What is the nest mostly for?', a: 'Keeping its eggs and chicks safe', w: ['Storing nuts for winter', 'Catching insects'], keep: true, s: 'A bird\'s nest holds its eggs and young chicks. When the chicks grow up, they leave it.', pic: ['robin'] }
      ]), 'Each kind of animal has its own kind of shelter.');
    }
    var right = R.pick(ks), wr = R.sample(ks.filter(function (x) { return x !== right; }), 2);
    var qtxt = { robin: 'Which animal builds a nest of twigs and grass?', bee: 'Which animal builds a hive?', rabbit: 'Which animal lives in a burrow under the ground?', spider: 'Which animal spins a web?', beaver: 'Which animal builds a lodge of sticks and mud?', bear: 'Which animal rests in a den?', ant: 'Which animal builds an anthill?' }[right];
    return whichPic(R, right, wr, qtxt, function (k) { return HOME_WHY[k]; }, 'Think about what each one builds or uses.');
  });

  var CHANGES = [ // [what happened, who made it: plant | animal | people, explanation]
    ['A beaver builds a dam across a stream, and a pond fills up behind it.', 'animal', 'A beaver is an animal.'],
    ['Tree roots grow under a sidewalk and crack it.', 'plant', 'A tree is a plant. Its growing roots push the sidewalk up.'],
    ['Earthworms dig tunnels that let air and water into the soil.', 'animal', 'Earthworms are animals.'],
    ['A squirrel buries acorns, and some it forgets grow into oak trees.', 'animal', 'The squirrel is an animal. It planted the acorns without meaning to.'],
    ['A family plants a vegetable garden in the yard.', 'people', 'People planted it.'],
    ['Workers build a road through a field.', 'people', 'People built it.'],
    ['Vines grow up and over an old fence until it is green.', 'plant', 'Vines are plants.'],
    ['Prairie dogs dig a town of tunnels under a grassland.', 'animal', 'Prairie dogs are animals.'],
    ['Ants dig tunnels and pile up the dirt into a hill.', 'animal', 'Ants are animals.'],
    ['Moss grows over a rock and slowly helps break it into soil.', 'plant', 'Moss is a plant.'],
    ['A woodpecker drills holes in a dead tree, and other birds nest in them later.', 'animal', 'A woodpecker is an animal.'],
    ['Children plant trees along a street.', 'people', 'People planted them.'],
    ['Grass roots hold the soil in place on a hill, so rain does not wash it away.', 'plant', 'Grass is a plant.'],
    ['A family builds a house where a field used to be.', 'people', 'People built it.']
  ];
  G('lifek.change-surroundings', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.coin()) {
      var c1 = R.pick(CHANGES), WHO = { plant: 'A plant', animal: 'An animal', people: 'People' };
      return bank(R, { q: c1[0] + ' Who made this change?', a: WHO[c1[1]], w: [WHO[R.pick(['plant', 'animal', 'people'].filter(function (x) { return x !== c1[1]; }))]], s: c1[2] }, 'Who did the work?');
    }
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Can a beaver change a stream by building a dam?', yn: true, s: 'The dam holds back the water, and a pond forms behind it.', pic: ['beaver'] },
        { q: 'Can tree roots crack a sidewalk?', yn: true, s: 'Roots grow thicker every year and push up whatever is on top of them.', pic: ['tree'] },
        { q: 'Do earthworms change the soil?', yn: true, s: 'Their tunnels let air and water into the soil, and they mix dead leaves into it.', pic: ['worm'] },
        { q: 'Do people change the land when they build a road?', yn: true, s: 'A road covers the ground where plants grew.' }
      ]), 'Living things change the places where they live.');
    }
    if (L === 2) { // the trouble spot: not only people change the land
      return bank(R, R.pick([
        { q: 'Who changes the land?', a: 'People, animals and plants', w: ['Only people', 'Nobody'], s: 'Beavers build dams, roots crack rocks and sidewalks, and people build roads and gardens.' },
        { q: 'A beaver builds a dam across a stream. What happens?', a: 'A pond forms behind the dam.', w: ['The stream flows faster.', 'Nothing changes.'], s: 'The dam holds the water back, so it spreads out into a pond, a new home for frogs, ducks and fish.', pic: ['beaver'] },
        { q: 'A squirrel buries acorns in fall and forgets some of them. What can happen?', a: 'New oak trees can grow.', w: ['The acorns turn into rocks.', 'Nothing at all.'], s: 'A forgotten acorn is a seed planted in the soil. In spring it can sprout into a new oak.', pic: ['squirrel'] },
        { q: 'Do only people change the land?', yn: false, s: 'Animals and plants change it too, a little at a time, as they meet their needs.' }
      ]), 'Think of a beaver, a squirrel and a tree.');
    }
    if (R.coin()) {
      var who = R.pick(['animal', 'plant']);
      return chooseAll(R, 'Which of these changes were made by ' + (who === 'animal' ? 'animals' : 'plants') + '?', CHANGES.map(function (x) { return [x[0].replace(/\.$/, ''), x[1] === who, x[2].replace(/\.$/, '')]; }), 4, 'Who did the work in each one?');
    }
    var c = R.pick(CHANGES);
    return { q: big(c[0] + ' Who made this change?'), a: { t: 'mc', choices: ['A plant', 'An animal', 'People'], v: { plant: 0, animal: 1, people: 2 }[c[1]], keep: true },
      hint: 'Who did the work: something growing, an animal, or people?', steps: [c[2], 'So the change was made by <b>' + { plant: 'a plant', animal: 'an animal', people: 'people' }[c[1]] + '</b>.'] };
  });

  /* ---------- 35–38. Food Chains ---------- */
  // three-link chains from the kit's food webs (each link is in B.WEBS, so the picture and the answer agree)
  function chains3() {
    var out = [];
    ['meadow', 'pond', 'forest', 'desert', 'ocean'].forEach(function (w) { B().chains(w).forEach(function (c) { if (c.length >= 3 && c[0] !== 'algae') out.push(c.slice(0, 3)); }); });
    var seen = {}; return out.filter(function (c) { var k = c.join('>'); if (seen[k]) return false; seen[k] = 1; return true; });
  }
  function chainViz(c, extra) { return { name: 'bi-foodweb', opts: Object.assign({ chain: c, quiet: true, interactive: false, label: 'A food chain. Arrows point from the food to the eater.' }, extra || {}) }; }
  function chainTxt(c) { return c.map(name).join(' → '); }
  function isPlant(k) { return B().THINGS[k].kind === 'plant'; }

  G('lifek.sun-energy', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Where does a plant get the energy to make its food?', a: 'From sunlight', w: ['From the soil'], keep: true, s: 'Green leaves catch sunlight and use its energy to make food.', pic: ['sunflower'] },
        { q: 'Does a rabbit get its energy from the food it eats?', yn: true, s: 'A rabbit eats grass and other plants. The food gives it energy to hop and grow.', pic: ['rabbit'] },
        { q: 'Can a fox make its own food from sunlight?', yn: false, s: 'Only plants can do that. A fox gets energy by eating other animals and some berries.', pic: ['fox'] },
        { q: 'Where does all the energy in a food chain start?', a: 'The sun', w: ['The fox'], keep: true, s: 'Plants catch the sun\'s energy. Animals get it by eating plants, or by eating animals that ate plants.', pic: chainViz(['grass', 'rabbit', 'fox'], { sun: true }) }
      ]), 'Plants catch sunlight. Animals eat.');
    }
    if (L === 2) { // the trouble spot: animals get energy from food, not by warming in the sun
      return bank(R, R.pick([
        { q: 'A lizard lies on a warm rock in the sun. Where does it get the energy to run and grow?', a: 'From the food it eats', w: ['From lying in the sun', 'It makes its own food'], keep: true, s: ['The sun warms the lizard, but warmth is not food.', 'Its energy comes from the insects it eats, and their energy came from plants.'], pic: ['lizard'] },
        { q: 'A rabbit gets its energy from…', a: 'the grass it eats', w: ['sunshine on its fur', 'making its own food'], keep: true, s: 'A rabbit cannot make food. It eats grass, and the grass got its energy from the sun.', pic: ['rabbit'] },
        { q: 'Where did the energy in a hawk\'s food start?', a: 'With the sun', w: ['With the hawk', 'With the soil'], keep: true, s: ['The hawk ate a mouse. The mouse ate grass seeds.', 'The grass made its food with sunlight. So the energy started with the sun.'], pic: ['hawk'] },
        { q: 'Do animals make their own food from sunlight, like plants?', yn: false, s: 'Animals must eat. Only plants (and some tiny living things) make food from sunlight.' }
      ]), 'Warmth is not food. Where does the food come from?');
    }
    var c = R.pick(chains3()), top = c[2];
    if (R.coin()) return whichPic(R, c[0], [c[1], c[2]], 'Which one can use sunlight to make its own food?', function (k) { return isPlant(k) ? 'It is a plant: it makes food from sunlight.' : 'It is an animal: it must eat to get energy.'; }, 'Which one is a plant?');
    return bank(R, { q: 'Look at this food chain: ' + chainTxt(c) + '. Where did the ' + name(top) + '\'s energy start?', a: 'The sun', w: [cap(the(c[0])), cap(the(c[1]))], keep: true, pic: chainViz(c),
      s: ['The ' + name(top) + ' got energy by eating the ' + name(c[1]) + '.', 'The ' + name(c[1]) + ' got it by eating ' + the(c[0]) + '.', cap(the(c[0])) + ' made food using sunlight.'] }, 'Follow the arrows back to the start, and one step more.');
  });

  G('lifek.food-chains', function (R, ctx) {
    var L = ctx.level || 1, c = R.pick(chains3());
    if (L === 1) {
      var who = R.int(1, 2);
      return bank(R, { q: 'In this food chain, what does the ' + name(c[who]) + ' eat?', a: cap(the(c[who - 1])), w: [cap(the(c[who === 1 ? 2 : 0]))], pic: chainViz(c),
        s: ['The arrow goes from ' + the(c[who - 1]) + ' to the ' + name(c[who]) + '.', 'That means the ' + name(c[who]) + ' eats ' + the(c[who - 1]) + '.'] }, 'Find the arrow that points to it. Where does that arrow start?');
    }
    if (L === 2) { // the trouble spot: arrows point from the food to the eater
      var i = R.int(0, 1), food = c[i], eater = c[i + 1], shape = R.int(0, 1);
      if (shape === 0) return bank(R, { q: 'In a food chain, an arrow goes from ' + the(food) + ' to the ' + name(eater) + '. What does it mean?', a: 'The ' + name(eater) + ' eats ' + the(food) + '.', w: [cap(the(food)) + ' eats the ' + name(eater) + '.', 'They are friends.'], keep: true, pic: chainViz(c),
        s: ['Arrows point from the food to the eater.', 'They show the energy moving from ' + the(food) + ' into the ' + name(eater) + '.'] }, 'Arrows point the way the energy goes.');
      return bank(R, { q: 'In a food chain, which way does the arrow between ' + the(food) + ' and the ' + name(eater) + ' point?', a: 'From ' + the(food) + ' to the ' + name(eater), w: ['From the ' + name(eater) + ' to ' + the(food)], keep: true,
        s: ['The ' + name(eater) + ' eats ' + the(food) + ', so energy goes from ' + the(food) + ' into the ' + name(eater) + '.', 'The arrow points the way the energy goes: from the food to the eater.'] }, 'Think: where does the energy go?');
    }
    // level 3: what is missing from the chain?
    var miss = R.int(0, 2), LINK = {};
    ['meadow', 'pond', 'forest', 'desert', 'ocean'].forEach(function (w) { B().WEBS[w].links.forEach(function (l) { LINK[l[0] + '>' + l[1]] = 1; }); });
    var fits = function (k) { return (miss === 0 ? isPlant(k) : true) && (miss === 0 || LINK[c[miss - 1] + '>' + k]) && (miss === 2 || LINK[k + '>' + c[miss + 1]]); };
    var pool = []; chains3().forEach(function (x) { x.forEach(function (k) { if (pool.indexOf(k) < 0 && c.indexOf(k) < 0 && !fits(k) && !isPlant(k)) pool.push(k); }); });
    var wr = R.sample(pool, 1).concat(R.sample(['rock', 'cloud', 'car', 'coin'], 1));
    return bank(R, { q: 'What is missing where the "?" is?', a: cap(name(c[miss])), w: wr.map(function (k) { return cap(name(k)); }), pic: chainViz(c, { ask: c[miss] }),
      s: [miss === 0 ? 'A food chain starts with a plant, and the ' + name(c[1]) + ' eats it.' : miss === 1 ? 'The ' + name(c[2]) + ' eats it, and it eats ' + the(c[0]) + '.' : 'It eats the ' + name(c[1]) + '.', 'The chain is ' + chainTxt(c) + '.'] }, 'Read the arrows: who eats what?');
  });

  G('lifek.producers-consumers', function (R, ctx) {
    var L = ctx.level || 1, c = R.pick(chains3());
    if (L === 1) {
      var k = R.pick(c), plant = isPlant(k);
      return { q: big('Is ' + (MASS[k] ? name(k) : a_(k)) + ' a producer or a consumer?'), viz: qpic(k), a: { t: 'mc', choices: ['Producer', 'Consumer'], v: plant ? 0 : 1, keep: true },
        hint: 'Does it make its own food, or does it eat?', steps: [plant ? cap(MASS[k] ? name(k) : a_(k)) + ' is a plant. It makes its own food from sunlight.' : cap(a_(k)) + ' is an animal. It eats to get its food.', 'So it is a <b>' + (plant ? 'producer' : 'consumer') + '</b>.'] };
    }
    if (L === 2) { // the trouble spot: the producer is the plant at the start, not the biggest animal
      var long = R.pick(['meadow', 'forest', 'desert'].map(function (w) { return B().chains(w).filter(function (x) { return x.length >= 4; })[0]; }).filter(Boolean));
      var wr = [cap(the(long[long.length - 1])), cap(the(long[1]))];
      return bank(R, { q: 'Look at this food chain: ' + chainTxt(long) + '. Which one is the producer?', a: cap(the(long[0])), w: wr, keep: true, pic: chainViz(long),
        s: ['The producer makes its own food from sunlight.', cap(the(long[0])) + ' is the plant at the start. The ' + name(long[long.length - 1]) + ' at the end is the strongest, but it is a consumer: it eats.'] }, 'Which one makes its own food?');
    }
    var opts = ['grass', 'tree', 'cactus', 'fern', 'sunflower'].map(function (k) { return [name(k), false, 'a plant makes its own food: a producer']; })
      .concat(['rabbit', 'fox', 'hawk', 'deer', 'mouse', 'frog', 'snake', 'owl', 'grasshopper'].map(function (k) { return [name(k), true, 'an animal eats: a consumer']; }));
    return chooseAll(R, 'Which of these are consumers?', opts, 4, 'Consumers eat. Producers make their own food.');
  });

  G('lifek.decomposers', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(['mushroom', 'worm', 'fox', 'hawk', 'rabbit', 'deer']), dec = k === 'mushroom' || k === 'worm';
      return bank(R, { q: 'Is ' + a_(k) + ' a decomposer?', yn: dec, pic: [k], s: dec ? cap(a_(k)) + ' breaks down dead leaves, logs and other dead things and puts nutrients back into the soil.' : cap(a_(k)) + ' eats living plants or animals. It is a consumer, not a decomposer.' }, 'Does it break down dead things?');
    }
    if (L === 2) { // the trouble spot: dead things do not just disappear
      return bank(R, R.pick([
        { q: 'A log lies on the forest floor for many years. What happens to it?', a: 'Decomposers break it down into the soil.', w: ['It disappears all by itself.', 'It turns into a rock.'], keep: true, s: 'Mushrooms, worms, insects and tiny bacteria eat the wood bit by bit, until it becomes part of the soil.', pic: ['log'] },
        { q: 'What do decomposers give back to the soil?', a: 'Nutrients for new plants', w: ['Sunlight', 'Rocks'], keep: true, s: 'When decomposers break down dead things, the nutrients in them go back into the soil, and new plants use them.' },
        { q: 'Do fallen leaves just vanish by themselves?', yn: false, s: 'Worms, mushrooms and bacteria eat them. That is why the leaves are gone by the next summer.', pic: ['leaf'] },
        { q: 'Which tiny living things help break down dead plants and animals, even though we cannot see them without a microscope?', a: 'Bacteria', w: ['Clouds', 'Pebbles'], keep: true, s: 'Bacteria are living things far too small to see. Many of them are decomposers.' }
      ]), 'Who eats dead leaves and logs?');
    }
    return chooseAll(R, 'Which of these are decomposers?', [['a mushroom', true, 'it breaks down dead wood and leaves'], ['an earthworm', true, 'it eats dead leaves in the soil'], ['bacteria', true, 'tiny living things that break down dead matter'],
      ['a rabbit', false, 'it eats living plants'], ['a hawk', false, 'it hunts living animals'], ['an oak tree', false, 'it is a producer'], ['a rock', false, 'it is not alive']], 4, 'Decomposers break down dead things.');
  });

  /* ---------- 39–42. Life Cycles ---------- */
  function stageShort(cyc, i) { return B().cycle(cyc)[i].name.replace(/ \(.*\)/, ''); }
  // "What goes where the '?' is?" on a life-cycle circle
  function askStage(R, cyc, i, extraSteps) {
    var st = B().cycle(cyc), w = R.sample(range(st.length).filter(function (j) { return j !== i; }), 1)[0];
    return bank(R, { q: 'What goes where the "?" is?', a: cap(stageShort(cyc, i)), w: [cap(stageShort(cyc, w))], pic: { name: 'bi-lifecycle', opts: { cycle: cyc, ask: i, quiet: true, interactive: false, label: 'The life cycle of ' + B().CYCLES[cyc].name + ', with one stage hidden.' } },
      s: ['Go around the circle from the top: ' + st.map(function (s, j) { return stageShort(cyc, j); }).join(', ') + '.', 'The "?" is stage ' + (i + 1) + ': the ' + stageShort(cyc, i) + '.'].concat(extraSteps || []), h: 'Start at the top and go around in the direction of the arrows.' });
  }
  function orderStages(R, cyc, idx, question) {
    return orderQ(R, question || 'Put the pictures in order, starting with the youngest.', idx.map(function (i) { return stageShort(cyc, i); }), question ? 'Spring, summer, fall, winter, then spring again.' : 'Which one is the youngest? Start there.', function (ord) {
      return { name: 'bi-lifecycle', opts: { cycle: cyc, order: ord.map(function (j) { return idx[j]; }), quiet: true, interactive: false, label: 'Stages of ' + B().CYCLES[cyc].name + ', lettered.' } };
    });
  }

  G('lifek.butterfly-cycle', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.coin()) return askStage(R, 'butterfly', R.int(0, 3));
      return bank(R, R.pick([
        { q: 'What hatches out of a butterfly\'s egg?', a: 'A caterpillar', w: ['A butterfly'], keep: true, s: 'A tiny caterpillar hatches from the egg and starts eating leaves.', pic: ['caterpillar'] },
        { q: 'What does a caterpillar make around itself before it becomes a butterfly?', a: 'A chrysalis', w: ['A nest'], keep: true, s: 'The caterpillar hangs still and forms a hard case called a chrysalis.' },
        { q: 'What comes out of the chrysalis?', a: 'A butterfly', w: ['A caterpillar'], keep: true, s: 'Inside the chrysalis the body changes. A butterfly comes out.', pic: ['butterfly'] }
      ]), 'Egg, caterpillar, chrysalis, butterfly.');
    }
    if (L === 2) { // the trouble spot: one animal; all the growing happens as a caterpillar
      return bank(R, R.pick([
        { q: 'Are a caterpillar and the butterfly it becomes the same animal?', yn: true, s: ['It is one animal all along.', 'It changes shape inside the chrysalis.'], pic: ['caterpillar'] },
        { q: 'Does a butterfly grow bigger after it comes out of the chrysalis?', yn: false, s: ['All of its growing happens while it is a caterpillar.', 'A butterfly comes out full size and stays that size.'], pic: ['butterfly'] },
        { q: 'At which stage does a butterfly do its growing?', a: 'As a caterpillar', w: ['As a butterfly', 'Inside the egg only'], keep: true, s: 'A caterpillar eats and eats, and grows much bigger. The butterfly does not grow.', pic: ['caterpillar'] },
        { q: 'A big butterfly and a small butterfly land on a flower. Is the small one a baby?', yn: false, s: ['Butterflies do not grow after they come out of the chrysalis.', 'The small one is a grown-up of a smaller kind, or one that was a smaller caterpillar.'] }
      ]), 'Which stage eats and grows?');
    }
    return orderStages(R, 'butterfly', R.pick([[0, 1, 2], [1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2, 3]]));
  });

  G('lifek.frog-cycle', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.coin()) return askStage(R, 'frog', R.int(0, 4));
      return bank(R, R.pick([
        { q: 'What hatches out of a frog\'s egg?', a: 'A tadpole', w: ['A frog with legs'], keep: true, s: 'A tadpole hatches. It has a tail and lives in the water.', pic: ['tadpole'] },
        { q: 'Where do many frogs lay their eggs?', a: 'In the water', w: ['In a nest in a tree'], keep: true, s: 'Many frogs lay their eggs in ponds, in a clump of jelly.' },
        { q: 'Which legs grow first on a tadpole?', a: 'The back legs', w: ['The front legs'], keep: true, s: 'The back legs pop out first, then the front legs.', pic: ['tadpole'] }
      ]), 'Eggs, tadpole, tadpole with legs, froglet, frog.');
    }
    if (L === 2) { // the trouble spot: a tadpole is a young frog, not a fish
      return bank(R, R.pick([
        { q: 'Is a tadpole a kind of fish?', yn: false, s: ['A tadpole swims and breathes with gills, like a fish.', 'But it is a young frog. It grows legs and becomes a frog.'], pic: ['tadpole'] },
        { q: 'What happens to a tadpole\'s tail as it grows up?', a: 'It shrinks away.', w: ['It grows longer.', 'It turns into a leg.'], keep: true, s: 'The tail gets shorter and shorter until the young frog does not have one.', pic: ['tadpole'] },
        { q: 'A tadpole breathes with gills. How does a grown frog breathe?', a: 'With lungs, breathing air', w: ['With gills only', 'It does not breathe'], keep: true, s: 'As it changes, the young frog starts breathing air with lungs (and some through its skin).', pic: ['frog'] },
        { q: 'Does a tadpole grow up to be a fish?', yn: false, s: 'A tadpole can only grow into a frog, the same kind of animal as its parents.', pic: ['tadpole'] }
      ]), 'A tadpole is a young frog.');
    }
    return orderStages(R, 'frog', R.pick([[0, 1, 4], [1, 2, 3], [0, 2, 4], [0, 1, 2, 4], [1, 2, 3, 4]]));
  });

  G('lifek.chicken-cycle', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.coin()) return askStage(R, 'chicken', R.int(0, 4));
      return bank(R, R.pick([
        { q: 'What hatches out of a chicken\'s egg?', a: 'A chick', w: ['A tadpole'], keep: true, s: 'A fluffy chick pecks its way out of the shell.', pic: ['hen'] },
        { q: 'Does a chick grow up to be a chicken?', yn: true, s: 'A chick grows into a young chicken, and then into a grown hen or rooster.', pic: ['hen'] },
        { q: 'What does a chick use to break out of its egg?', a: 'Its beak', w: ['Its wings'], keep: true, s: 'A chick pecks a hole in the shell with its beak, then pushes its way out.' }
      ]), 'Egg, hatching, chick, young chicken, hen.');
    }
    if (L === 2) { // the trouble spot: chicks hatch in soft down and grow feathers later
      return bank(R, R.pick([
        { q: 'When a chick hatches, what covers its body?', a: 'Soft, fluffy down', w: ['Long grown-up feathers', 'Dry scales'], keep: true, s: 'A new chick is covered in soft down. Its grown-up feathers come in over the next several weeks.' },
        { q: 'Is a chick born with all its grown-up feathers?', yn: false, s: 'A chick hatches in fluffy down. Feathers grow in over several weeks.' },
        { q: 'About how long does a chick grow inside its egg before it hatches?', a: 'About three weeks', w: ['About one hour', 'About one year'], keep: true, s: 'A chicken egg is kept warm for about 21 days, three weeks, before the chick hatches.' },
        { q: 'What does a chicken egg need to hatch?', a: 'To be kept warm for about three weeks', w: ['To be kept in a cold fridge', 'To be put in water'], keep: true, s: 'A hen sits on her eggs (or a warm box called an incubator keeps them warm) while the chick grows inside.' }
      ]), 'Think about a fluffy yellow chick.');
    }
    return orderStages(R, 'chicken', R.pick([[0, 2, 4], [0, 1, 2], [1, 2, 3], [2, 3, 4], [0, 2, 3, 4]]));
  });

  var CHANGERS = [['butterfly', true, 'egg, caterpillar, chrysalis, butterfly: it changes shape completely'], ['frog', true, 'egg, tadpole, frog: it changes shape as it grows'], ['ladybug', true, 'it starts as a larva that looks very different, then changes inside a pupa'], ['bee', true, 'it starts as a larva and changes inside a pupa'],
    ['cat', false, 'a kitten looks like a small cat and just grows'], ['dog', false, 'a puppy looks like a small dog and just grows'], ['hen', false, 'a chick looks like a small chicken and grows feathers'], ['snake', false, 'a young snake looks like a small snake'], ['cow', false, 'a calf looks like a small cow']];
  G('lifek.compare-cycles', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var c = R.pick(CHANGERS);
      return bank(R, { q: 'Does ' + a_(c[0]) + ' change shape completely as it grows up?', yn: c[1], pic: [c[0]], s: cap(c[2]) + '.' }, 'Does the young one look like the grown-up?');
    }
    if (L === 2) { // the trouble spot: different animals have different numbers of stages
      return bank(R, R.pick([
        { q: 'How many stages does a butterfly\'s life cycle have?', a: 'Four', w: ['Two', 'Ten'], keep: true, s: 'Egg, caterpillar, chrysalis, butterfly: four stages.' },
        { q: 'Which one changes shape completely as it grows: a butterfly or a kitten?', a: 'A butterfly', w: ['A kitten'], keep: true, s: 'A kitten just grows. A butterfly goes from caterpillar to chrysalis to butterfly.' },
        { q: 'Does every animal have the same number of life stages?', yn: false, s: 'A butterfly has four very different stages. A chick just grows bigger and gets feathers.' },
        { q: 'A frog and a butterfly both change shape. Which one makes a chrysalis?', a: 'The butterfly', w: ['The frog'], keep: true, s: 'Only the butterfly makes a chrysalis. A tadpole changes little by little in the water.' },
        { q: 'What do the life cycles of a plant, a frog and a chicken all have?', a: 'They start small, grow, and make new young.', w: ['They all start as a seed.', 'They all have a chrysalis.'], keep: true, s: 'Every life cycle begins, grows, and comes around again with new young (or new seeds).' }
      ]), 'Picture each life cycle, stage by stage.');
    }
    return chooseAll(R, 'Which of these change shape completely as they grow up?', CHANGERS.map(function (c) { return [name(c[0]), c[1], c[2]]; }), 4, 'Does the young one look like the grown-up?');
  });

  /* ---------- 43–45. Senses ---------- */
  var ORGAN = { eye: ['sight', 'Seeing'], ear: ['hearing', 'Hearing'], nose: ['smell', 'Smelling'], tongue: ['taste', 'Tasting'], hand: ['touch', 'Feeling by touch'] };
  var ORGAN_NAME = { eye: 'your eyes', ear: 'your ears', nose: 'your nose', tongue: 'your tongue', hand: 'your skin (like the skin on your hands)' };
  var SITUATION = [['You see a red leaf fall.', 'eye'], ['You watch a bird fly by.', 'eye'], ['You hear a dog bark.', 'ear'], ['You hear thunder far away.', 'ear'], ['You smell cookies baking.', 'nose'], ['You smell a rose.', 'nose'],
    ['You taste a sour lemon.', 'tongue'], ['You taste something salty.', 'tongue'], ['You feel that a rock is smooth.', 'hand'], ['You feel the cold snow on your mittens and fingers.', 'hand']];
  G('lifek.five-senses', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(ORGAN);
    if (L === 1) {
      var k = R.pick(ks), w = R.pick(ks.filter(function (x) { return x !== k; }));
      return bank(R, { q: 'What do you do with ' + ORGAN_NAME[k] + '?', a: ORGAN[k][1], w: [ORGAN[w][1]], pic: [k], s: 'You use ' + ORGAN_NAME[k] + ' for the sense of ' + ORGAN[k][0] + '.' }, 'Point to that part of your body. What does it do?');
    }
    if (L === 2) { // the trouble spot: smell helps us taste
      return bank(R, R.pick([
        { q: 'Your nose is stuffed up from a cold. How does your food taste?', a: 'Flat, with less flavor', w: ['Much stronger than before', 'Exactly the same'], keep: true, s: ['When you chew, smells from the food rise up into your nose.', 'With a stuffed nose they cannot get there, so food seems to have less flavor.'], pic: ['nose'] },
        { q: 'Which two senses work together to give food its flavor?', a: 'Taste and smell', w: ['Sight and hearing', 'Hearing and touch'], keep: true, s: 'Your tongue tastes sweet, salty, sour and bitter. Your nose adds the smells that make each food taste like itself.' },
        { q: 'Do we taste food only with our tongue?', yn: false, s: 'The tongue tastes, and the nose smells the food as we chew. Together they make the flavor.', pic: ['tongue'] },
        { q: 'You hold your nose and eat a bite of apple. What happens?', a: 'It tastes less like apple.', w: ['It tastes more like apple.', 'You cannot chew.'], keep: true, s: 'Without smell, it is harder to tell what food you are eating. Try it with a grown-up!', pic: ['apple'] }
      ]), 'Think about your nose when you eat.');
    }
    var sit = R.pick(SITUATION), wr = R.sample(ks.filter(function (x) { return x !== sit[1]; }), 2);
    return whichPic(R, sit[1], wr, sit[0] + ' Which body part are you using?', function (k) { return 'You use ' + ORGAN_NAME[k] + ' for ' + ORGAN[k][0] + '.'; }, 'Which sense is it: seeing, hearing, smelling, tasting or touching?');
  });

  var ANSENSE = [ // [animal, its special sense, what it helps with, the sense]
    ['owl', 'very big eyes', 'see in dim light at night', 'sight'], ['dog', 'a nose much stronger than ours', 'follow smells we cannot notice at all', 'smell'],
    ['bat', 'sharp ears', 'find insects in the dark by listening for echoes of its own calls', 'hearing'], ['cat', 'long whiskers', 'feel what is close by, even in the dark', 'touch'],
    ['snake', 'a forked tongue', 'pick up smells from the air', 'smell'], ['butterfly', 'taste sensors on its feet', 'taste a leaf by standing on it', 'taste']];
  G('lifek.animal-senses', function (R, ctx) {
    var L = ctx.level || 1, a = R.pick(ANSENSE);
    if (L === 1) {
      var w = R.pick(['sight', 'smell', 'hearing', 'touch', 'taste'].filter(function (x) { return x !== a[3]; }));
      return bank(R, { q: cap(a_(a[0])) + ' has ' + a[1] + '. Which sense do they help with?', a: cap(a[3]), w: [cap(w)], pic: [a[0]], s: cap(a[1]) + ' help ' + a_(a[0]) + ' ' + a[2] + '.' }, 'Seeing, hearing, smelling, tasting or touching?');
    }
    if (L === 2) { // the trouble spot: animals sense things we cannot
      return bank(R, R.pick([
        { q: 'Can a dog smell things that people cannot?', yn: true, s: 'A dog\'s nose is far stronger than ours. It can follow a smell we would never notice.', pic: ['dog'] },
        { q: 'Can many bats find insects in total darkness?', yn: true, s: 'Many bats make high calls and listen for the echoes that bounce back from insects and trees.', pic: ['bat'] },
        { q: 'Do all animals sense the world the same way we do?', yn: false, s: 'Many animals see, hear or smell things we cannot. Each sense helps them find food and stay safe.' },
        { q: 'Why does a snake keep flicking its tongue in and out?', a: 'To pick up smells from the air', w: ['To cool off', 'To say hello'], keep: true, s: 'A snake\'s forked tongue gathers smells and brings them into its mouth, where it senses them.', pic: ['snake'] },
        { q: 'How does a butterfly taste a leaf?', a: 'With sensors on its feet', w: ['With its wings', 'It cannot taste'], keep: true, s: 'Butterflies have taste sensors on their feet. They can taste a leaf just by standing on it.', pic: ['butterfly'] }
      ]), 'Animals can have senses much stronger than ours.');
    }
    var wr = R.sample(ANSENSE.filter(function (x) { return x[0] !== a[0] && x[3] !== a[3]; }), 2).map(function (x) { return x[0]; });
    var by = {}; ANSENSE.forEach(function (x) { by[x[0]] = x; });
    return whichPic(R, a[0], wr, 'Which animal uses ' + a[1] + ' to ' + a[2] + '?', function (k) { return 'It uses ' + by[k][1] + ' to ' + by[k][2] + '.'; }, 'Think about each animal\'s special body part.');
  });

  var OBS = [['The beetle has six legs.', true], ['The leaf is green.', true], ['The flower smells sweet.', true], ['The rock feels rough.', true], ['The worm is about as long as my finger.', true], ['The bird sang three times.', true], ['The puddle is gone after the sunny day.', true],
    ['The bug is sad.', false], ['The bird wants to go home.', false], ['The beetle likes me.', false], ['The ant is the best ant.', false], ['The worm is bored.', false], ['The flower is happy in the sun.', false]];
  G('lifek.observing', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var o = R.pick(OBS);
      return bank(R, { q: 'Is this an observation, something you can see, hear, smell, feel or measure? "' + o[0] + '"', yn: o[1], s: o[1] ? 'You can check it with your senses or a ruler. That makes it an observation.' : 'You cannot see or measure a feeling. It is a guess, not an observation.' }, 'Could you check it with your eyes, ears, nose, hands or a ruler?');
    }
    if (L === 2) { // the trouble spot: observations versus guesses and feelings
      var right = R.pick(OBS.filter(function (x) { return x[1]; })), wr = R.sample(OBS.filter(function (x) { return !x[1]; }), 2);
      return bank(R, { q: 'Which one is an observation?', a: right[0], w: wr.map(function (x) { return x[0]; }), s: ['"' + right[0] + '" is something you can check with your senses.', 'The other two are guesses about feelings. You cannot see a feeling.'] }, 'Which one could a friend check by looking, listening or measuring?');
    }
    return bank(R, R.pick([
      { q: 'Which tool helps you see the tiny hairs on a bee\'s leg?', a: 'A magnifying glass', w: ['A ruler', 'A thermometer'], keep: true, s: 'A magnifying glass makes small things look bigger.' },
      { q: 'Which tool helps you find out how long a leaf is?', a: 'A ruler', w: ['A magnifying glass', 'A spoon'], keep: true, s: 'A ruler measures length.' },
      { q: 'You want to know how hot or cold the water in a pond is. Which tool do you use?', a: 'A thermometer', w: ['A ruler', 'A magnifying glass'], keep: true, s: 'A thermometer measures how warm or cold something is.' },
      { q: 'A scientist sees a frog. Which is the best thing to write down?', a: 'It is green with brown spots.', w: ['It is the nicest frog.', 'It is thinking about lunch.'], keep: true, s: 'Scientists write what they can see, hear or measure, so others can check it.' },
      { q: 'You watch an ant for one minute. It carries a crumb three times. Is "It carried a crumb three times" an observation?', yn: true, s: 'You saw it and counted it. That is an observation.' }
    ]), 'Which tool or note helps you see or measure?');
  });

  /* ---------- 46–48. Seasons and Living Things ---------- */
  var SEASONS = ['spring', 'summer', 'fall', 'winter'];
  G('lifek.trees-seasons', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var s = R.pick(SEASONS), w = R.pick(SEASONS.filter(function (x) { return x !== s; }));
      return bank(R, { q: 'Which season is it in the picture?', a: cap(s), w: [cap(w)], pic: { name: 'bi-plant', opts: { mode: 'seasons', season: s, quiet: true, interactive: false, label: 'A tree in one season.' } },
        s: { spring: 'Small new leaves and blossoms are opening: it is spring.', summer: 'The tree is full of big green leaves: it is summer.', fall: 'The leaves are orange, red and yellow, and some have fallen: it is fall.', winter: 'The branches are bare and snow is falling: it is winter.' }[s] }, 'Look at the leaves. New and small? Full and green? Colorful and falling? Gone?');
    }
    if (L === 2) { // the trouble spot: bare trees in winter are resting, not dead
      return bank(R, R.pick([
        { q: 'A maple tree has no leaves in winter. Is it dead?', yn: false, s: ['It is resting.', 'Its buds for next spring\'s leaves are already on its branches.'], pic: { name: 'bi-plant', opts: { mode: 'seasons', season: 'winter', quiet: true, interactive: false, label: 'A bare tree in winter.' } } },
        { q: 'Where are next spring\'s leaves during winter?', a: 'Tucked inside buds on the branches', w: ['Under the snow', 'Nowhere yet'], keep: true, s: 'The tree makes its buds before winter. In spring the buds open into new leaves.' },
        { q: 'Does a pine tree lose all its needles in fall?', yn: false, s: 'A pine is an evergreen. It stays green all year.', pic: ['pine'] },
        { q: 'Why do many trees drop their leaves in fall?', a: 'To rest through the cold winter', w: ['Because they died', 'Because the wind is angry'], keep: true, s: 'In winter there is less light and the water is often frozen. The tree drops its leaves and rests until spring.' }
      ]), 'Look closely at the branches of a bare tree.');
    }
    if (R.coin()) {
      var s3 = R.int(0, 3);
      return bank(R, { q: 'Which season comes after ' + SEASONS[s3] + '?', a: cap(SEASONS[(s3 + 1) % 4]), w: [cap(SEASONS[(s3 + 3) % 4]), cap(SEASONS[(s3 + 2) % 4])], keep: true, s: 'The seasons go around: spring, summer, fall, winter, and then spring again.' }, 'Spring, summer, fall, winter, and around again.');
    }
    var sx = R.pick([[0, 1, 2], [1, 2, 3], [0, 1, 2, 3], [0, 2, 3]]);
    return orderStages(R, 'tree', sx, 'Put the pictures in order, starting with ' + SEASONS[sx[0]] + '.');
  });

  var WINTER = { goose: 'migrate', hummingbird: 'migrate', whale: 'migrate', groundhog: 'hibernate', bat: 'hibernate', deer: 'active', fox: 'active', squirrel: 'active', rabbit: 'active', wolf: 'active' };
  var WINTER_TXT = { migrate: 'It travels to a warmer place (migrates).', hibernate: 'It hibernates: it sleeps deeply all winter.', active: 'It stays active and finds food.' };
  var WINTER_WHY = { goose: 'Many geese fly south in a V and come back in spring.', hummingbird: 'Many hummingbirds fly south to where flowers still bloom.', whale: 'Many whales swim to warm seas for the winter.', groundhog: 'A groundhog sleeps deeply in its burrow all winter, living on its stored fat.',
    bat: 'Many bats that live in cold places hibernate in caves.', deer: 'A deer stays active. It eats twigs and buds in the snow.', fox: 'A fox stays active and hunts in the snow, warm in its thick coat.', squirrel: 'A squirrel stays active and digs up the nuts it buried.', rabbit: 'A rabbit stays active and nibbles bark and twigs.', wolf: 'A wolf stays active and hunts with its pack.' };
  G('lifek.animals-winter', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(WINTER);
    if (L === 1) {
      var k = R.pick(ks), w = R.pick(['migrate', 'hibernate', 'active'].filter(function (x) { return x !== WINTER[k]; }));
      return bank(R, { q: 'What does ' + a_(k) + ' do in winter?', a: WINTER_TXT[WINTER[k]], w: [WINTER_TXT[w]], pic: [k], s: WINTER_WHY[k] }, 'Does it fly away, sleep, or keep going?');
    }
    if (L === 2) { // the trouble spot: most animals do not sleep all winter
      return bank(R, R.pick([
        { q: 'Do all animals sleep through the winter?', yn: false, s: 'Most animals stay active. Many birds fly to warmer places. Only some, like groundhogs, sleep deeply all winter.' },
        { q: 'Does a deer hibernate in winter?', yn: false, s: WINTER_WHY.deer, pic: ['deer'] },
        { q: 'Which of these animals sleeps deeply all winter?', a: 'A groundhog', w: ['A deer', 'A fox'], keep: true, s: WINTER_WHY.groundhog + ' Deer and foxes stay active.', pic: ['groundhog'] },
        { q: 'A goose flies south in the fall. What is that called?', a: 'Migrating', w: ['Hibernating', 'Hiding'], keep: true, s: 'Traveling to a new place for the season is called migrating.', pic: ['goose'] }
      ]), 'Most animals stay active in winter.');
    }
    if (R.coin()) {
      var way = R.pick(['migrate', 'hibernate', 'active']), r3 = R.pick(ks.filter(function (k) { return WINTER[k] === way; })), w3 = R.sample(ks.filter(function (k) { return WINTER[k] !== way; }), 2);
      return whichPic(R, r3, w3, { migrate: 'Which one travels to a warmer place for the winter?', hibernate: 'Which one hibernates, sleeping deeply all winter?', active: 'Which one stays active all winter?' }[way], function (k) { return WINTER_WHY[k]; }, 'Does it fly or swim away, sleep deeply, or keep finding food?');
    }
    var k3 = R.pick(ks);
    return { q: big('What does ' + a_(k3) + ' do in winter?'), viz: qpic(k3), a: { t: 'mc', choices: ['Migrates to a warmer place', 'Hibernates', 'Stays active'], v: { migrate: 0, hibernate: 1, active: 2 }[WINTER[k3]], keep: true },
      hint: 'Does it fly or swim away, sleep deeply, or keep finding food?', steps: [WINTER_WHY[k3], 'So it <b>' + { migrate: 'migrates', hibernate: 'hibernates', active: 'stays active' }[WINTER[k3]] + '</b>.'] };
  });

  G('lifek.getting-ready', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'In fall, what does a squirrel do to get ready for winter?', a: 'It buries nuts to eat later.', w: ['It builds a snowman.'], keep: true, s: 'A squirrel hides nuts and acorns all fall, then digs them up in winter.', pic: ['squirrel'] },
        { q: 'In fall, many geese gather in big flocks. What are they getting ready to do?', a: 'Fly south', w: ['Dig burrows'], keep: true, s: 'Geese gather and then fly to warmer places for the winter.', pic: ['goose'] },
        { q: 'Does a fox grow a thicker coat for winter?', yn: true, s: 'Many animals, like foxes, grow thicker fur in fall to stay warm.', pic: ['fox'] },
        { q: 'Does a groundhog eat extra food in late summer and fall?', yn: true, s: 'A groundhog eats a lot and gets fat. It lives on that fat while it sleeps all winter.', pic: ['groundhog'] }
      ]), 'Think of food, coats and trips.');
    }
    if (L === 2) { // the trouble spot: animals start getting ready early
      return bank(R, R.pick([
        { q: 'When do many animals start getting ready for winter?', a: 'In late summer and fall', w: ['On the first snowy day', 'In the middle of winter'], keep: true, s: 'They get ready while food is still easy to find, long before the snow.' },
        { q: 'What tells many animals that winter is coming?', a: 'The days get shorter and cooler.', w: ['A calendar on the wall', 'Nothing. They are surprised.'], keep: true, s: 'In fall, the sun sets earlier each day and the air gets colder. Animals respond to those changes.' },
        { q: 'Are animals surprised when winter comes?', yn: false, s: 'Many start getting ready in late summer and fall: storing food, growing coats, eating extra or flying away.' },
        { q: 'Why does a squirrel store nuts in the fall?', a: 'Food is hard to find in winter.', w: ['It likes to dig.', 'Nuts grow in winter.'], keep: true, s: 'In winter, plants stop making nuts and seeds. The squirrel saves food while there is plenty.', pic: ['squirrel'] }
      ]), 'Is food easy to find in fall or in winter?');
    }
    return chooseAll(R, 'Which of these are ways animals get ready for winter?', [['storing food', true], ['growing a thicker coat', true], ['eating extra food to build fat', true], ['flying to a warmer place', true],
      ['buying a coat at the store', false, 'only people do that'], ['planting a garden', false, 'animals do not plant on purpose'], ['turning on a heater', false, 'only people do that']], 4, 'Think about squirrels, foxes, groundhogs and geese.');
  });

  /* ---------- 49–51. Caring for Living Things ---------- */
  G('lifek.pet-care', function (R, ctx) {
    var L = ctx.level || 1, pet = R.pick(['dog', 'cat', 'rabbit']);
    if (L === 1) {
      var n = R.pick([['fresh water every day', true], ['food every day', true], ['a clean home', true], ['gentle hands', true], ['to be yelled at', false], ['to be squeezed tight', false], ['to be left with no water', false]]);
      return bank(R, { q: 'Does a pet ' + name(pet) + ' need ' + n[0] + '?', yn: n[1], pic: [pet], s: n[1] ? 'Pets need food, fresh water, a clean home, kind and gentle care, and visits to the vet.' : 'A pet needs kind, gentle care, food and fresh water. It does not need ' + n[0] + '.' }, 'What do you need every day? Pets need many of the same things.');
    }
    if (L === 2) { // the trouble spot: pets need care every day, not only when we feel like it
      return bank(R, R.pick([
        { q: 'You are very busy today. Does your pet still need food and fresh water?', yn: true, s: 'A pet needs food and water every single day, busy days too.', pic: [pet] },
        { q: 'When does a pet need care?', a: 'Every day', w: ['Only when you want to play', 'Only on weekends'], keep: true, s: 'Pets depend on us every day for food, water and a clean home.', pic: [pet] },
        { q: 'Who helps keep a pet healthy with checkups?', a: 'A vet (animal doctor)', w: ['A mail carrier', 'A bus driver'], keep: true, s: 'A vet is a doctor for animals.', pic: [pet] },
        { q: 'A dog needs to run and play. Is a walk part of caring for a dog?', yn: true, s: 'Dogs need exercise, like walks and play, every day.', pic: ['dog'] }
      ]), 'Pets depend on us every day.');
    }
    return chooseAll(R, 'Which of these does a pet need from you?', [['food', true], ['fresh water', true], ['a clean home', true], ['gentle hands', true], ['visits to the vet', true],
      ['candy', false, 'it can make pets sick'], ['being left alone for a week', false, 'pets need care every day'], ['loud yelling', false, 'pets need kind care']], 4, 'What keeps a pet healthy and safe?');
  });

  G('lifek.plant-care', function (R, ctx) {
    var L = ctx.level || 1, plantPic = R.pick(['flower', 'cactus', 'fern', 'sunflower']);
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'Does a potted plant need light?', yn: true, s: 'A plant needs light to make its food. Put it near a window.', pic: [plantPic] },
        { q: 'Does a potted plant need water?', yn: true, s: 'Plants need water, but not too much.', pic: [plantPic] },
        { q: 'Where is a good spot for most potted plants?', a: 'Near a sunny window', w: ['In a dark closet'], keep: true, s: 'Most potted plants need light to make food.', pic: [plantPic] },
        { q: 'Does a plant need room for its roots to grow?', yn: true, s: 'When a plant gets too big for its pot, it needs a bigger one.', pic: [plantPic] }
      ]), 'Plants need light, water, air and room.');
    }
    if (L === 2) { // the trouble spot: more water is not always better
      return bank(R, R.pick([
        { q: 'Is more water always better for a plant?', yn: false, s: ['Roots need air in the soil, too.', 'Too much water fills those spaces, and the roots can rot.'], pic: [plantPic] },
        { q: 'Why does a flower pot have holes in the bottom?', a: 'So extra water can drain out', w: ['So bugs can get in', 'So the soil can fall out'], keep: true, s: 'Extra water runs out the holes, so the roots do not sit in water.' },
        { q: 'When should you water most potted plants?', a: 'When the top of the soil feels dry', w: ['Every hour', 'Never'], keep: true, s: 'Poke a finger into the soil. If the top feels dry, it is time to water.' },
        { q: 'A plant\'s leaves are turning yellow, and its soil is always soggy. What could help?', a: 'Water it less often.', w: ['Water it more often.', 'Put it in a dark closet.'], keep: true, s: 'Soggy soil can drown the roots. Let the top of the soil dry a little before watering again.', pic: [plantPic] }
      ]), 'Roots need air too.');
    }
    return chooseAll(R, 'Which of these are good ways to care for a potted plant?', [['water it when the top of the soil feels dry', true], ['give it light near a window', true], ['use a pot with holes in the bottom', true], ['move it to a bigger pot when it outgrows its pot', true],
      ['water it every hour', false, 'too much water drowns the roots'], ['keep it in a dark closet', false, 'it needs light'], ['let it sit in a puddle of water', false, 'its roots could rot']], 4, 'Light, the right amount of water, and room to grow.');
  });

  G('lifek.caring-nature', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      return bank(R, R.pick([
        { q: 'You see a squirrel in the park. Should you chase it?', yn: false, s: 'Watch it quietly from a distance. Chasing scares wild animals.', pic: ['squirrel'] },
        { q: 'Should you leave a bird\'s nest alone?', yn: true, s: 'Look from far away and leave it alone, so the parents can care for their eggs and chicks.', pic: ['robin'] },
        { q: 'Should you take your trash home after a picnic?', yn: true, s: 'Trash can hurt animals and plants. Take it with you or put it in a trash can.' },
        { q: 'Is it kind to pick every wildflower you see?', yn: false, s: 'Leave the flowers for bees and butterflies, and so they can make seeds.', pic: ['flower'] }
      ]), 'Watch, enjoy, and leave things as you found them.');
    }
    if (L === 2) { // the trouble spot: leave young wild animals alone and tell a grown-up; put rocks back
      return bank(R, R.pick([
        { q: 'You find a young bird hopping on the ground. What should you do?', a: 'Leave it alone and tell a grown-up.', w: ['Take it home as a pet.', 'Chase it back into a tree.'], keep: true, s: ['Many young birds hop on the ground while they learn to fly.', 'Their parents are usually close by, feeding them. Leave it where it is.'], pic: ['robin'] },
        { q: 'You lift a rock to look at the bugs under it. What should you do next?', a: 'Put it back gently, the way it was.', w: ['Keep the rock.', 'Throw the rock in the pond.'], keep: true, s: 'The rock is a roof for the bugs and worms under it. Put their home back.', pic: ['rock'] },
        { q: 'Is a rock in the woods just a rock?', a: 'No. It can be a home for small animals.', w: ['Yes. Nothing lives near rocks.'], keep: true, s: 'Beetles, worms and salamanders often live under rocks and logs.', pic: ['salamander'] },
        { q: 'A baby bird is alone in the grass. Is it always lost?', yn: false, s: 'Its parents are often nearby, watching and bringing food. Leave it alone and tell a grown-up.', pic: ['robin'] }
      ]), 'Wild animals have their own homes and families.');
    }
    return chooseAll(R, 'Which of these are kind ways to care for nature?', [['watch animals quietly from far away', true], ['put rocks and logs back the way you found them', true], ['take your trash home', true], ['leave nests alone', true],
      ['chase the ducks', false, 'it scares them'], ['take a baby bird home', false, 'its parents are usually nearby'], ['break branches off trees', false, 'it hurts the tree']], 4, 'Would the animal or plant be better off?');
  });
})(window.MathLadder);
