/* Physics Ladder, Science Explorers (sciexp, ages 9 and 10): problem generators for every topic.
   Each topic has banks of facts written from its lesson (data/physics/lessons/sciexp.json) and, where the idea has numbers
   or a picture to read, problems made from a model (rulers, levers, circuits, food chains, the Moon's phases...).
     level 1  three choices; the wrong ones include the topic's most common mistake
     level 2  four choices, putting things in order, sorting
     level 3  four choices, longer orders, "choose all that are true", two-step numbers
   Pictures come from the course's own kit (static/physics/viz/sciexp.js), quiet so they never give the answer away. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var M = Math;

  // ---------------------------------------------------------------- shared helpers
  function letter(i) { return String.fromCharCode(65 + i); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; }
  function mcOf(right, wrongs) { return { t: 'mc', choices: uniq([right].concat(wrongs.filter(function (w) { return w !== right; }))), v: 0 }; }
  function pic(name, opts) { var o = { quiet: true, interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }
  function still(name, opts) { var o = { interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }
  function nWrong(ctx) { return (ctx.level || 1) === 1 ? 2 : 3; }
  function num(v, unit) { return { t: 'num', v: String(v), unit: unit }; }
  function fin(p, hint) { if (hint && !p.hint) p.hint = hint; if (!p.viz) delete p.viz; if (p.a && p.a.unit) { p.unit = p.a.unit; delete p.a.unit; } return p; }
  function nmr(R) { return R.pick(['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Kenji', 'Rosa', 'Omar', 'Lily', 'Diego', 'Nora', 'Eli', 'Zara', 'Ben', 'Mei']); }
  // fact: [question, right, [wrongs, the most common mistake first], why, viz?]
  function factQ(R, ctx, it) {
    var wr = it[2].slice(), k = M.min(nWrong(ctx), wr.length);
    var pickW = (ctx.level || 1) === 1 ? [wr[0]].concat(R.sample(wr.slice(1), M.min(k - 1, wr.length - 1))) : R.sample(wr, k);
    return { q: it[0], a: mcOf(it[1], pickW), steps: ['The answer: ' + it[1] + '.', it[3]], viz: it[4] };
  }
  // tf: [statement, true|false, why]
  function tfQ(R, ctx, it) { return { q: '<b>True or false?</b> ' + it[0], a: { t: 'tf', v: it[1] }, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] }; }
  // all: four statements from the tf bank, at least one true and one false: choose all that are true
  function allQ(R, ctx, bank) {
    var T = bank.filter(function (x) { return x[1]; }), F = bank.filter(function (x) { return !x[1]; });
    if (!T.length || !F.length || bank.length < 4) return tfQ(R, ctx, R.pick(bank));
    var nT = R.int(1, M.min(3, T.length)), nF = M.min(4 - nT, F.length), pick = R.shuffle(R.sample(T, nT).concat(R.sample(F, nF)));
    var v = []; pick.forEach(function (x, i) { if (x[1]) v.push(i); });
    return { q: '<b>Choose all that are true.</b>', a: { t: 'mc', choices: pick.map(function (x) { return x[0]; }), v: v, keep: true },
      steps: pick.map(function (x) { return (x[1] ? 'True: ' : 'False: ') + x[0] + ' ' + x[2]; }) };
  }
  // order: [prompt, [items, first to last], why]
  function orderQ(R, ctx, it) {
    var items = it[1], L = ctx.level || 1, n = L === 1 ? M.min(3, items.length) : L === 2 ? M.min(4, items.length) : items.length;
    var start = R.int(0, items.length - n), sub = items.slice(start, start + n), right = sub.join(' → '), wrongs = [], tries = 0;
    while (wrongs.length < nWrong(ctx) && tries++ < 80) { var s = R.shuffle(sub).join(' → '); if (s !== right && wrongs.indexOf(s) < 0) wrongs.push(s); }
    return { q: it[0] + ' <b>Which order is right, first to last?</b>', a: mcOf(right, wrongs), steps: sub.map(function (x, i) { return (i + 1) + '. ' + x; }).concat(it[2] ? [it[2]] : []) };
  }
  // sort: [question with {x}, [[thing, group], ...], [group names], why]
  function sortQ(R, ctx, it) {
    var pair = R.pick(it[1]), groups = it[2];
    return { q: it[0].replace('{x}', pair[0]), a: mcOf(pair[1], groups.filter(function (g) { return g !== pair[1]; })), steps: [cap(pair[0]) + ': ' + pair[1] + '.', it[3]] };
  }
  // pick: [question, [right things], [wrong things], why]
  function pickQ(R, ctx, it) {
    var right = R.pick(it[1]), wr = R.sample(it[2], M.min(nWrong(ctx), it[2].length));
    return { q: it[0], a: mcOf(right, wr), steps: ['The answer: ' + right + '.', it[3]] };
  }
  var DEF = {
    1: ['fact', 'fact', 'tf', 'sort', 'pick', 'c1', 'c1'],
    2: ['fact', 'tf', 'order', 'sort', 'pick', 'c2', 'c1', 'c2'],
    3: ['fact', 'order', 'sort', 'pick', 'all', 'c3', 'c2', 'c3']
  };
  // T(id, spec): spec.fact / tf / order / sort / pick are banks; c1, c2, c3 make problems from a model (c1 at levels 1 and 2,
  // c2 at 2 and 3, c3 at 3; a missing one is skipped); spec.hint
  function T(id, spec) {
    ML.gen(id, function (R, ctx) {
      var L = ctx.level || 1, plan = DEF[L], tries = 0;
      while (tries++ < 30) {
        var kind = R.pick(plan), fn = null;
        if (kind === 'c1' || kind === 'c2' || kind === 'c3') fn = spec[kind];
        else if (kind === 'all') fn = spec.tf && spec.tf.length >= 4 ? function () { return allQ(R, ctx, spec.tf); } : null;
        else if (spec[kind] && spec[kind].length) { var bank = spec[kind]; fn = function () { return ({ fact: factQ, tf: tfQ, order: orderQ, sort: sortQ, pick: pickQ })[kind](R, ctx, R.pick(bank)); }; }
        if (fn) return fin(fn(R, ctx), spec.hint);
      }
      return fin(factQ(R, ctx, R.pick(spec.fact)), spec.hint);
    });
  }

  // ================================================================ Unit 1: Thinking Like a Scientist
  T('sciexp.observe-question', {
    hint: 'An observation is what you notice with your senses or a tool. A hypothesis is a guess about why that you can test.',
    fact: [
      ['Which is an <b>observation</b>?', '"The puddle was 2 meters wide at 8 o\'clock."', ['"The sun dried the puddle."', '"Puddles are boring."', '"I think it will rain."'], 'An observation tells what you noticed or measured.'],
      ['Which is a <b>hypothesis</b>?', '"Warm air makes ice melt faster."', ['"The ice melted in 20 minutes."', '"The ice cube is square."', '"The plate is wet."'], 'A hypothesis is a guess about why, and you can test it.'],
      ['Which question can you test with an experiment?', '"Do bean seeds sprout faster in a warm room or a cool room?"', ['"Why are flowers pretty?"', '"Which color is the best?"', '"Are dogs nicer than cats?"'], 'You can test it with seeds, two rooms and a calendar. The others are opinions.'],
      ['Which tool helps you see tiny things up close?', 'a hand lens', ['a thermometer', 'a ruler', 'a timer'], 'A hand lens (magnifying glass) makes small things look bigger.'],
      ['Which tool measures how hot or cold something is?', 'a thermometer', ['a balance', 'a hand lens', 'a ruler'], 'A thermometer measures temperature.'],
      ['Which tool compares the mass of two things?', 'a balance', ['a thermometer', 'a timer', 'a hand lens'], 'A balance tips toward the side with more mass.'],
      ['Which sense should you <b>never</b> use on something in a science lab?', 'taste', ['sight', 'hearing', 'touch with care'], 'Never taste anything in a lab. Look, listen, and feel with care.'],
      ['Why do scientists write their observations in a notebook?', 'so they remember them exactly and can share them', ['so the teacher can grade the handwriting', 'because they forgot the question', 'to make the experiment shorter'], 'A notebook keeps a true record you can check later.']
    ],
    tf: [
      ['"The dog ate all its food in one minute" is an observation.', true, 'It tells what was seen and timed.'],
      ['"The dog was hungry" is an observation.', false, 'It is a guess about why the dog ate fast.'],
      ['A hypothesis is a guess you can test.', true, 'Scientists test their guesses with experiments.'],
      ['"Why are flowers pretty?" is easy to test.', false, 'It is an opinion, so there is nothing to measure.'],
      ['A ruler and a thermometer are tools that help our senses.', true, 'Tools measure things more exactly than our senses alone.'],
      ['You can taste things in a lab if they look safe.', false, 'Never taste anything in a lab.']
    ],
    sort: [
      ['Is this an observation or a hypothesis? {x}', [
        ['"The leaves of the plant are yellow."', 'observation'], ['"The snow melted by noon."', 'observation'], ['"The bird has a red chest."', 'observation'],
        ['"The ball rolled 3 meters."', 'observation'], ['"The water in the cup is 20 °C."', 'observation'], ['"The bread has green fuzz on it."', 'observation'],
        ['"The plant is yellow because it needs more sun."', 'hypothesis'], ['"The snow melted because the sun came out."', 'hypothesis'],
        ['"The ball rolled far because the floor is smooth."', 'hypothesis'], ['"Bread gets moldy faster in a warm place."', 'hypothesis'],
        ['"Birds come to the feeder more in the morning because they are hungry."', 'hypothesis']], ['observation', 'hypothesis'],
        'An observation is what you notice. A hypothesis is a guess about why.']
    ],
    c1: function (R, ctx) {
      var tools = [['🔍', 'a hand lens', 'see small things'], ['📏', 'a ruler', 'measure length'], ['🌡️', 'a thermometer', 'measure temperature'], ['⚖️', 'a balance', 'compare mass'], ['⏱️', 'a timer', 'measure time']];
      var it = R.pick(tools), others = tools.filter(function (t) { return t !== it; });
      return { q: 'Which tool would you use to <b>' + it[2] + '</b>?', a: mcOf(it[1], R.sample(others, nWrong(ctx)).map(function (t) { return t[1]; })), steps: [cap(it[1]) + ' is the tool to ' + it[2] + '.'] };
    }
  });

  var FT = [
    { q: 'whether plant food helps bean plants grow', ch: 'plant food or no plant food', same: ['the amount of water', 'the amount of light', 'the kind of seed', 'the size of the pot'], meas: 'the height of the plants' },
    { q: 'which paper towel soaks up the most water', ch: 'the brand of paper towel', same: ['the amount of water', 'the size of the towel pieces', 'how long each dips', 'the kind of cup'], meas: 'how high the water climbs' },
    { q: 'whether a ball bounces higher on carpet or on wood', ch: 'the floor (carpet or wood)', same: ['the ball', 'the drop height', 'how the ball is dropped'], meas: 'how high the ball bounces' },
    { q: 'whether salt makes ice melt faster', ch: 'salt or no salt on the ice', same: ['the size of the ice cubes', 'the room', 'the kind of plate'], meas: 'how long the ice takes to melt' },
    { q: 'whether a toy car rolls farther down a steeper ramp', ch: 'how steep the ramp is', same: ['the car', 'the floor', 'where the car starts on the ramp'], meas: 'how far the car rolls' },
    { q: 'which kind of cup keeps cocoa warm longest', ch: 'the kind of cup', same: ['the amount of cocoa', 'its starting temperature', 'the room'], meas: 'the temperature after 20 minutes' }
  ];
  T('sciexp.fair-test', {
    hint: 'In a fair test, change only one thing, keep everything else the same, and measure the result.',
    fact: [
      ['In a fair test, how many things do you change on purpose?', 'only one', ['two', 'as many as you can', 'none'], 'Change only the thing you are testing; then you know what made the difference.'],
      ['Sam gives one plant food and puts it in the sun. The other gets no food and sits in a dark corner. Why is this not a fair test?', 'he changed two things: the food and the light', ['he used only two plants', 'he forgot to name the plants', 'plants do not need food'], 'With two changes, he cannot tell which one made the plant grow.'],
      ['Why should you do a test more than once?', 'one try can go wrong by bad luck', ['to make it take longer', 'so you can change more things', 'the first try never counts'], 'Repeating the test, or using several plants each way, gives a fairer answer.'],
      ['Lily drops the red ball from her waist and the blue ball from over her head. What should she fix?', 'drop both from the same height', ['use two red balls', 'drop them on different floors', 'drop them faster'], 'She is testing the ball, so only the ball should change.']
    ],
    tf: [
      ['In a fair test, you keep everything the same except the one thing you are testing.', true, 'That way only one thing can make a difference.'],
      ['Testing with just one plant each way is as good as testing with three.', false, 'One plant can be sick by bad luck; more plants give a fairer answer.'],
      ['If you change two things at once, you cannot tell which one made the difference.', true, 'Both changes could matter.'],
      ['You should measure the result, not just guess it.', true, 'Measuring with a tool gives a number you can compare.'],
      ['It is fine to use a bigger pot for one plant if you are testing plant food.', false, 'The pot size must stay the same; only the plant food changes.']
    ],
    c1: function (R, ctx) {
      var f = R.pick(FT);
      return { q: 'You want to find out ' + f.q + '. What is the <b>one thing you change</b>?', a: mcOf(f.ch, R.sample(f.same, nWrong(ctx))), steps: ['You change only ' + f.ch + '.', 'Everything else stays the same: ' + f.same.join(', ') + '.'] };
    },
    c2: function (R, ctx) {
      var f = R.pick(FT), keep = R.pick(f.same), other = R.pick(FT.filter(function (g) { return g !== f; }));
      var ask = R.coin();
      if (ask) return { q: 'You want to find out ' + f.q + '. Which of these must you <b>keep the same</b>?', a: mcOf(keep, [f.ch, other.meas, 'nothing at all'].slice(0, nWrong(ctx))), steps: [cap(keep) + ' must stay the same.', 'Only ' + f.ch + ' changes.'] };
      return { q: 'You want to find out ' + f.q + '. What do you <b>measure</b>?', a: mcOf(f.meas, [f.ch, keep, other.meas].slice(0, nWrong(ctx))), steps: ['You measure ' + f.meas + '.', 'You change ' + f.ch + ' and keep ' + keep + ' the same.'] };
    },
    c3: function (R, ctx) {
      var a = R.int(10, 20), b = a + R.int(2, 9), c = R.int(8, 22), who = nmr(R);
      var fair = R.coin();
      var q = who + ' tests plant food on bean plants. The plant with food grew ' + b + ' cm; the plant without grew ' + a + ' cm. ' +
        (fair ? 'Both sat in the same window and got the same water.' : 'The plant with food sat in a sunny window; the other sat in a dark hall.') + ' Can ' + who + ' say the plant food helped?';
      var right = fair ? 'yes, but more plants each way would make it surer' : 'no: the light was different too';
      var w = fair ? ['no: the light was different too', 'no: plants never need food', 'yes: the difference proves it for every plant'] : ['yes, by ' + (b - a) + ' cm', 'yes: the plant with food is taller', 'no: plants never need food'];
      return { q: q, a: mcOf(right, w.slice(0, nWrong(ctx))), steps: [fair ? 'Only the food changed, so the test was fair.' : 'Two things changed: the food and the light.', fair ? 'One plant each way can still be luck; three plants each way would be better.' : 'The extra sun might be what helped. The test is not fair.'],
        viz: still('sciexp-bars', { title: 'Bean plant height', unit: 'cm', bars: [['With food', b], ['Without food', a]], max: M.max(25, M.ceil((b + 2) / 5) * 5) }) };
    }
  });

  T('sciexp.measure', {
    hint: 'Start at 0 on a ruler, read a liquid at eye level, and always write the unit. 1 m = 100 cm, 1 kg = 1,000 g, 1 L = 1,000 mL.',
    fact: [
      ['Which unit measures the length of a pencil?', 'centimeters', ['grams', 'milliliters', 'degrees'], 'Length is in centimeters or meters.'],
      ['Which unit measures the mass of an apple?', 'grams', ['centimeters', 'liters', 'degrees'], 'Mass is in grams or kilograms.'],
      ['Which unit measures the water in a glass?', 'milliliters', ['grams', 'centimeters', 'degrees'], 'Liquid volume is in milliliters or liters.'],
      ['How should you read a measuring cup?', 'with your eyes level with the water', ['from straight above', 'from far away', 'by tipping the cup'], 'Bend down so your eyes are level with the top of the liquid.'],
      ['Where do you line up an object on a ruler?', 'at the 0 mark', ['at the 1 mark', 'at the very end of the ruler', 'anywhere'], 'Start at 0, or your answer will be off.'],
      ['"The table is 2" is a poor answer. Why?', 'it has no unit', ['2 is too small', 'tables cannot be measured', 'it should be a fraction'], '2 meters and 2 centimeters are very different. Always write the unit.']
    ],
    tf: [
      ['1 meter is 100 centimeters.', true, 'Centi means a hundredth.'],
      ['1 kilogram is 100 grams.', false, '1 kilogram is 1,000 grams.'],
      ['1 liter is 1,000 milliliters.', true, 'Milli means a thousandth.'],
      ['Scientists around the world use the metric system so they can share results.', true, 'Everyone uses the same units.'],
      ['You should start measuring at the 1 on a ruler.', false, 'Start at 0.']
    ],
    sort: [
      ['Which tool would you use to measure {x}?', [['how long a desk is', 'a meter stick'], ['the width of a coin', 'a ruler'], ['how heavy a bag of rice is', 'a scale'], ['the mass of a rock', 'a scale'], ['how warm the bathwater is', 'a thermometer'], ['the temperature outside', 'a thermometer'], ['the milk for a recipe', 'a measuring cup'], ['how much juice is in a bottle', 'a measuring cup']],
        ['a meter stick', 'a ruler', 'a scale', 'a thermometer', 'a measuring cup'], 'Each tool measures one thing: length, mass, temperature or liquid volume.']
    ],
    c1: function (R, ctx) {
      var tool = R.pick(['ruler', 'cylinder', 'thermo']), v;
      if (tool === 'ruler') { v = R.int(4, 28) / 2; return { q: 'How long is the bar? (Its left end is at 0.)', a: num(v, 'cm'), steps: ['The bar starts at 0 and ends at ' + v + ' on the scale.', 'It is ' + v + ' cm long.'], viz: pic('sciexp-measure', { tool: 'ruler', value: v }) }; }
      if (tool === 'cylinder') { v = 5 * R.int(2, 19); return { q: 'How much water is in the cylinder? (Each small mark is 5 mL.)', a: num(v, 'mL'), steps: ['Read the scale at the top of the water, at eye level.', 'It is at ' + v + ' mL.'], viz: pic('sciexp-measure', { tool: 'cylinder', value: v }) }; }
      v = 2 * R.int(-8, 22); return { q: 'What temperature does the thermometer show, in °C? (Each small mark is 2 degrees.)', a: num(v, '°C'), steps: ['Find the top of the red line and read the °C scale beside it.', 'It shows ' + v + ' °C.'], viz: pic('sciexp-measure', { tool: 'thermo', value: v }) };
    },
    c2: function (R) {
      var k = R.int(0, 5), n;
      if (k === 0) { n = R.int(2, 9); return { q: 'A rope is ' + n + ' meters long. How many centimeters is that?', a: num(n * 100, 'cm'), steps: ['1 m = 100 cm.', n + ' × 100 = ' + (n * 100) + ' cm.'] }; }
      if (k === 1) { n = R.int(2, 9); return { q: 'A bag of potatoes has a mass of ' + n + ' kilograms. How many grams is that?', a: num(n * 1000, 'g'), steps: ['1 kg = 1,000 g.', n + ' × 1,000 = ' + (n * 1000).toLocaleString('en-US') + ' g.'] }; }
      if (k === 2) { n = R.int(2, 6); return { q: 'A jug holds ' + n + ' liters of water. How many milliliters is that?', a: num(n * 1000, 'mL'), steps: ['1 L = 1,000 mL.', n + ' × 1,000 = ' + (n * 1000).toLocaleString('en-US') + ' mL.'] }; }
      if (k === 3) { n = R.int(2, 9) * 100; return { q: 'A ribbon is ' + n + ' centimeters long. How many meters is that?', a: num(n / 100, 'm'), steps: ['100 cm = 1 m.', n + ' ÷ 100 = ' + (n / 100) + ' m.'] }; }
      if (k === 4) { var a = R.int(3, 9), b = R.int(10, 30); return { q: 'A plant was ' + a + ' cm tall. Two weeks later it was ' + (a + b) + ' cm tall. How much did it grow?', a: num(b, 'cm'), steps: ['Subtract: ' + (a + b) + ' − ' + a + ' = ' + b + '.', 'It grew ' + b + ' cm.'] }; }
      var s = R.int(2, 7) * 100, w = R.int(1, 5) * 100; return { q: 'A cup has ' + s + ' mL of water. You pour in ' + w + ' mL more. How much is in the cup now?', a: num(s + w, 'mL'), steps: [s + ' + ' + w + ' = ' + (s + w) + ' mL.'] };
    },
    c3: function (R) {
      var a = R.int(12, 30), b = a + 2 * R.int(1, 6), c = a + R.int(1, 2 * (b - a) - 1);
      if (c === b) c = a; var arr = [a, b, c], tot = a + b + c;
      if (tot % 3) { arr[2] += 3 - tot % 3; tot = arr[0] + arr[1] + arr[2]; }
      return { q: 'You measure the same plant three days in a row: ' + arr.join(' cm, ') + ' cm. A scientist takes the mean (average) of several measurements. What is the mean?', a: num(tot / 3, 'cm'), steps: ['Add them: ' + arr.join(' + ') + ' = ' + tot + '.', 'Divide by 3: ' + tot + ' ÷ 3 = ' + (tot / 3) + ' cm.'] };
    }
  });

  // ================================================================ Unit 2: Matter
  var MATTER = [['a rock', 'matter'], ['milk', 'matter'], ['the air in a balloon', 'matter'], ['steam over a hot bath', 'matter'], ['a pencil', 'matter'], ['orange juice', 'matter'], ['your shoe', 'matter'], ['a cloud', 'matter'], ['sand', 'matter'], ['a shadow', 'not matter'], ['a song', 'not matter'], ['sunlight', 'not matter'], ['an idea', 'not matter'], ['the heat from a stove', 'not matter'], ['a dream', 'not matter']];
  T('sciexp.what-is-matter', {
    hint: 'Matter is anything that has mass and takes up space, even if you cannot see it, like air.',
    fact: [
      ['What is matter?', 'anything that has mass and takes up space', ['anything you can see', 'only solid things', 'anything that moves'], 'Air is matter even though you cannot see it.'],
      ['How do we know air takes up space?', 'a balloon gets bigger when we blow air into it', ['air is see-through', 'air is cold', 'air smells like flowers'], 'The air pushes the balloon outward.'],
      ['A ball is pumped full of air. Compared with the same ball when it was flat, it is…', 'a little heavier', ['lighter', 'exactly the same', 'much lighter'], 'Air has mass, so adding air adds a little mass.'],
      ['What is all matter made of?', 'tiny particles too small to see', ['water', 'light', 'nothing at all'], 'All matter is made of particles far too small to see.'],
      ['Why can\'t we see air?', 'its particles are far apart and clear', ['it has no mass', 'it is not there', 'it is too fast'], 'We see what air does: wind, a sail, a full balloon.']
    ],
    tf: [
      ['Air is matter.', true, 'It has mass and takes up space.'],
      ['A shadow is matter.', false, 'A shadow is only where light is blocked.'],
      ['Sound is matter.', false, 'Sound is a kind of energy that travels through matter.'],
      ['Particles in a solid are moving, even though the solid looks still.', true, 'They wiggle in place.'],
      ['Matter must be something you can see.', false, 'Air is matter and you cannot see it.']
    ],
    sort: [['Is {x} matter?', MATTER, ['matter', 'not matter'], 'Matter has mass and takes up space. Light, sound, heat and ideas do not.']],
    pick: [['Which of these is matter?', ['a rock', 'milk', 'air', 'steam', 'a cloud', 'sand'], ['a shadow', 'a song', 'sunlight', 'an idea'], 'Matter has mass and takes up space.'],
      ['Which of these is <b>not</b> matter?', ['a shadow', 'a song', 'sunlight', 'a dream'], ['a rock', 'milk', 'air', 'steam'], 'Light, sound and ideas have no mass.']],
    c1: function (R, ctx) {
      var it = R.pick(MATTER.filter(function (m) { return m[1] === 'matter'; })), nots = R.sample(MATTER.filter(function (m) { return m[1] !== 'matter'; }), nWrong(ctx));
      return { q: 'Only one of these has mass and takes up space. Which one?', a: mcOf(it[0], nots.map(function (m) { return m[0]; })), steps: [cap(it[0]) + ' is matter.', 'The others are light, sound, heat or ideas, not matter.'] };
    }
  });

  var STATES = [['a brick', 'solid'], ['an ice cube', 'solid'], ['a wooden spoon', 'solid'], ['sand', 'solid'], ['sugar', 'solid'], ['a coin', 'solid'], ['salt', 'solid'], ['milk', 'liquid'], ['orange juice', 'liquid'], ['honey', 'liquid'], ['rain', 'liquid'], ['cooking oil', 'liquid'], ['the air in a balloon', 'gas'], ['water vapor', 'gas'], ['the bubbles in soda', 'gas'], ['the helium in a party balloon', 'gas']];
  T('sciexp.three-states', {
    hint: 'A solid keeps its shape. A liquid takes the shape of its container. A gas spreads out to fill the whole space.',
    fact: [
      ['Which keeps its own shape?', 'a solid', ['a liquid', 'a gas', 'all three'], 'A solid keeps its shape; a liquid and a gas do not.'],
      ['Which takes the shape of its container but keeps its amount?', 'a liquid', ['a solid', 'a gas', 'none of them'], 'Pour water from a glass to a bowl: the shape changes, the amount does not.'],
      ['Which spreads out to fill any container?', 'a gas', ['a liquid', 'a solid', 'sand'], 'Gas particles are far apart and zoom around.'],
      ['Sand pours from a bucket. What state is sand?', 'solid', ['liquid', 'gas', 'a bit of all three'], 'Each grain is a tiny solid that keeps its shape.'],
      ['In which state are particles packed tight, wiggling in place?', 'solid', ['liquid', 'gas', 'all three'], 'Solid particles stay in place and wiggle.'],
      ['In which state are particles far apart and zooming around?', 'gas', ['solid', 'liquid', 'none'], 'Gas particles spread out to fill their container.']
    ],
    tf: [
      ['Ice, liquid water and water vapor are all the same stuff: water.', true, 'They are three states of water.'],
      ['Anything that pours is a liquid.', false, 'Sugar and sand pour, but they are solid grains.'],
      ['A liquid keeps the same amount when you pour it into a different container.', true, 'Its shape changes, not its amount.'],
      ['A gas keeps its own shape.', false, 'A gas fills its whole container.'],
      ['Particles in a liquid can slide past each other.', true, 'That is why liquids flow.']
    ],
    sort: [['Is {x} a solid, a liquid or a gas?', STATES, ['solid', 'liquid', 'gas'], 'Solids keep their shape, liquids flow, and gases fill the whole space.']],
    c1: function (R, ctx) {
      var st = R.pick(['solid', 'liquid', 'gas']);
      if (R.coin()) { var it = R.pick(STATES.filter(function (x) { return x[1] === st; })), wr = R.sample(STATES.filter(function (x) { return x[1] !== st; }), nWrong(ctx));
        return { q: 'Which of these is a <b>' + st + '</b>?', a: mcOf(it[0], wr.map(function (x) { return x[0]; })), steps: [cap(it[0]) + ' is a ' + st + '.', wr.map(function (x) { return cap(x[0]) + ' is a ' + x[1] + '.'; }).join(' ')] }; }
      return { q: 'Which box shows the particles of a <b>' + st + '</b>?', a: { t: 'mc', choices: ['A', 'B', 'C'], v: ['solid', 'liquid', 'gas'].indexOf(st), keep: true }, steps: ['A: packed in rows (solid). B: close but jumbled at the bottom (liquid). C: far apart (gas).'], viz: pic('sciexp-particles', { state: 'all' }) };
    },
    c2: function (R, ctx) {
      var a = R.pick(STATES), b = R.pick(STATES.filter(function (s) { return s[1] !== a[1]; }));
      return { q: 'Are ' + a[0] + ' and ' + b[0] + ' in the same state?', a: mcOf('no: ' + a[0] + ' is a ' + a[1] + ', ' + b[0] + ' is a ' + b[1], ['yes, both are ' + a[1] + 's', 'yes, both are ' + b[1] + 's', 'no: both are gases'].slice(0, nWrong(ctx))), steps: [cap(a[0]) + ' is a ' + a[1] + '.', cap(b[0]) + ' is a ' + b[1] + '.'] };
    }
  });

  T('sciexp.changing-state', {
    hint: 'Heating: melting (solid to liquid), evaporating or boiling (liquid to gas). Cooling: condensing (gas to liquid), freezing (liquid to solid). Water freezes at 0 °C and boils at 100 °C.',
    fact: [
      ['What is it called when a solid turns into a liquid?', 'melting', ['freezing', 'condensing', 'evaporating'], 'Heating a solid can melt it.'],
      ['What is it called when a liquid turns into a solid?', 'freezing', ['melting', 'evaporating', 'condensing'], 'Cooling a liquid can freeze it.'],
      ['What is it called when a liquid turns into a gas?', 'evaporating', ['condensing', 'freezing', 'melting'], 'A puddle evaporates on a sunny day; boiling is fast evaporation with bubbles.'],
      ['What is it called when a gas turns into a liquid?', 'condensing', ['evaporating', 'melting', 'freezing'], 'Water vapor condenses into drops on a cold glass.'],
      ['At what temperature does water freeze?', '0 °C (32 °F)', ['100 °C (212 °F)', '32 °C', '10 °C (50 °F)'], 'Water freezes and ice melts at 0 °C, which is 32 °F.'],
      ['At what temperature does water boil at sea level?', '100 °C (212 °F)', ['0 °C (32 °F)', '50 °C', '212 °C'], 'Water boils at 100 °C, which is 212 °F.'],
      ['The white cloud over a kettle is…', 'tiny drops of liquid water', ['water vapor, a gas', 'smoke', 'air'], 'Water vapor is invisible. The cloud is vapor that cooled into tiny drops.'],
      ['You breathe on a cold mirror and it fogs up. What happened?', 'water vapor from your breath condensed', ['the mirror melted', 'the glass evaporated', 'the air froze'], 'The cold mirror cooled the vapor into tiny drops.']
    ],
    tf: [
      ['Heating makes particles move faster.', true, 'Fast particles break out of their pattern and melt or evaporate.'],
      ['When 100 g of ice melts, you get less than 100 g of water.', false, 'Melting does not change the mass: you get 100 g of water.'],
      ['Water vapor is invisible.', true, 'The white mist you see is liquid drops.'],
      ['Freezing happens when a liquid is heated.', false, 'Freezing happens when a liquid is cooled.'],
      ['A puddle drying up in the sun is evaporation.', true, 'The water turns to vapor and goes into the air.']
    ],
    order: [['Ice is heated in a pot until it is all gone.', ['solid ice', 'melting', 'liquid water', 'boiling', 'water vapor'], 'Heat melts the ice, then boils the water into vapor.']],
    c1: function (R, ctx) {
      var t = R.pick([-15, -10, -5, -2, 5, 10, 20, 25, 30, 40, 60, 80]), right = t < 0 ? 'ice (solid)' : 'liquid water';
      return { q: 'A dish of water sits outside at ' + String(t).replace('-', '−') + ' °C for a whole day. What is in the dish?', a: mcOf(right, [t < 0 ? 'liquid water' : 'ice (solid)', 'water vapor only', 'nothing at all'].slice(0, nWrong(ctx))), steps: ['Water freezes at 0 °C.', String(t).replace('-', '−') + ' °C is ' + (t < 0 ? 'colder' : 'warmer') + ' than 0 °C, so it is ' + right + '.'], viz: pic('sciexp-measure', { tool: 'thermo', value: t }) };
    },
    c2: function (R) {
      var g = R.int(4, 30) * 10, what = R.pick([['ice cube tray', 'melts'], ['block of ice', 'melts'], ['bowl of water', 'freezes']]);
      return { q: 'A ' + what[0] + ' with ' + g + ' g of ' + (what[1] === 'melts' ? 'ice' : 'water') + ' ' + what[1] + ' completely, and nothing spills or dries up. What is the mass now?', a: num(g, 'g'), steps: ['Changing state does not change the amount of matter.', 'The mass stays ' + g + ' g.'] };
    },
    c3: function (R) {
      var c = R.pick([0, 10, 20, 30, 40, 50, 100]), f = c * 9 / 5 + 32;
      return { q: 'To change °C to °F, multiply by 9, divide by 5, then add 32. What is ' + c + ' °C in °F?', a: num(f, '°F'), steps: [c + ' × 9 = ' + (c * 9) + '; ' + (c * 9) + ' ÷ 5 = ' + (c * 9 / 5) + '.', (c * 9 / 5) + ' + 32 = ' + f + ' °F.'] };
    }
  });

  T('sciexp.mixtures-solutions', {
    hint: 'A mixture keeps its parts; a solution is a mixture where one thing dissolves evenly. Dissolving does not destroy matter: the masses add up.',
    fact: [
      ['Raisins stirred into cereal make…', 'a mixture', ['a solution', 'a new substance', 'a gas'], 'You can still see the raisins and pick them out.'],
      ['Salt stirred into water until you cannot see it makes…', 'a solution', ['a new substance', 'nothing: the salt is gone', 'a solid'], 'The salt dissolved evenly into the water.'],
      ['How can you get the salt back out of salt water?', 'let the water evaporate', ['pour it through a sieve', 'use a magnet', 'freeze it for an hour'], 'When the water evaporates, salt crystals are left.'],
      ['How could you pull iron filings out of sand?', 'with a magnet', ['with a sieve', 'by adding water', 'by heating it'], 'A magnet pulls on iron but not on sand.'],
      ['How could you separate pebbles from sand?', 'with a sieve', ['with a magnet', 'by evaporating', 'by stirring'], 'Small sand grains fall through; pebbles stay in the sieve.'],
      ['Where is the salt after it dissolves in water?', 'spread through the water in pieces too small to see', ['gone forever', 'floating as a gas', 'turned into water'], 'Taste it, or let the water dry up: the salt is still there.']
    ],
    tf: [
      ['Dissolved salt has disappeared.', false, 'It is spread through the water in tiny pieces.'],
      ['In a mixture, each part keeps its own properties.', true, 'Raisins stay raisins in cereal.'],
      ['Sugar dissolved in tea is a solution.', true, 'It is spread evenly and you cannot see it.'],
      ['Salt water weighs the same as the water alone.', false, 'The salt adds its mass.'],
      ['A sieve can separate pebbles from sand.', true, 'The holes let the small grains through.']
    ],
    sort: [['Which tool separates {x}?', [['iron nails from sawdust', 'a magnet'], ['paper clips from rice', 'a magnet'], ['pebbles from sand', 'a sieve'], ['pasta from cooking water', 'a sieve'], ['salt from salt water', 'letting the water evaporate'], ['sugar from sugar water', 'letting the water evaporate']], ['a magnet', 'a sieve', 'letting the water evaporate'], 'Magnets pull iron, sieves catch big pieces, and evaporating leaves dissolved solids behind.']],
    c1: function (R) {
      var s = R.int(1, 6) * 5, w = R.int(1, 5) * 100, what = R.pick(['salt', 'sugar']);
      return { q: 'You stir ' + s + ' g of ' + what + ' into ' + w + ' g of water until it dissolves. What is the mass of the ' + what + ' water?', a: num(s + w, 'g'), steps: ['Dissolving does not destroy any matter.', s + ' g + ' + w + ' g = ' + (s + w) + ' g.'] };
    },
    c2: function (R) {
      var w = R.int(2, 6) * 100, s = R.int(2, 8) * 5, tot = w + s;
      return { q: 'A glass of salt water has a mass of ' + tot + ' g. The water alone was ' + w + ' g. How much salt was dissolved in it?', a: num(s, 'g'), steps: ['Salt + water = salt water.', tot + ' − ' + w + ' = ' + s + ' g of salt.'] };
    }
  });

  var CHANGES = [['cutting paper', 'physical'], ['melting butter', 'physical'], ['freezing juice', 'physical'], ['dissolving sugar in tea', 'physical'], ['crushing a can', 'physical'], ['tearing cloth', 'physical'], ['boiling water', 'physical'], ['folding a shirt', 'physical'], ['burning wood', 'chemical'], ['baking a cake', 'chemical'], ['an iron nail rusting', 'chemical'], ['baking soda fizzing in vinegar', 'chemical'], ['toasting bread', 'chemical'], ['a cut apple turning brown', 'chemical'], ['milk going sour', 'chemical'], ['frying an egg', 'chemical']];
  T('sciexp.new-substances', {
    hint: 'A physical change changes size, shape or state but not the substance. A chemical change makes a new substance: look for a new gas, color, smell, light or heat.',
    fact: [
      ['What does a chemical change make?', 'a new substance', ['only a new shape', 'only a new size', 'the same substance, melted'], 'Burning, baking and rusting make new substances.'],
      ['Which is a sign of a chemical change?', 'a new color and smell appear', ['the thing is cut in half', 'the thing melts', 'the thing is folded'], 'New colors, smells, gases, light or heat are signs of a chemical change.'],
      ['Why are bubbles alone not proof of a chemical change?', 'boiling water bubbles too, and it is still water', ['bubbles are never a sign', 'bubbles are always air', 'chemical changes never make gas'], 'Look for more than one sign.'],
      ['Baking soda fizzes in vinegar in an open cup. Afterward the cup is…', 'a little lighter, because the gas floated away', ['heavier', 'exactly the same mass', 'empty'], 'The new gas, carbon dioxide, escapes into the air.'],
      ['Which change can easily be turned back?', 'melting ice', ['burning toast', 'baking a cake', 'rusting a nail'], 'Melted ice can freeze again. Burnt toast cannot be bread again.']
    ],
    tf: [
      ['Melting is a chemical change.', false, 'Melted ice is still water.'],
      ['Rusting is a chemical change.', true, 'Iron and oxygen make a new reddish substance, rust.'],
      ['Cutting paper makes a new substance.', false, 'It is still paper, just smaller.'],
      ['Burning gives off light and heat, signs of a chemical change.', true, 'Ash and smoke are new substances.'],
      ['If nothing escapes, the total mass stays the same in any change.', true, 'Matter is not made or destroyed.']
    ],
    sort: [['Is {x} a physical change or a chemical change?', CHANGES, ['physical', 'chemical'], 'A chemical change makes something new; a physical change does not.']],
    c1: function (R, ctx) {
      var ch = R.pick(CHANGES.filter(function (c) { return c[1] === 'chemical'; })), ph = R.sample(CHANGES.filter(function (c) { return c[1] === 'physical'; }), nWrong(ctx));
      return { q: 'Which of these makes a <b>new substance</b>?', a: mcOf(ch[0], ph.map(function (c) { return c[0]; })), steps: [cap(ch[0]) + ' is a chemical change.', 'The others change only size, shape or state.'] };
    },
    c2: function (R, ctx) {
      var ph = R.pick(CHANGES.filter(function (c) { return c[1] === 'physical'; })), ch = R.sample(CHANGES.filter(function (c) { return c[1] === 'chemical'; }), nWrong(ctx));
      return { q: 'Which of these is a <b>physical</b> change?', a: mcOf(ph[0], ch.map(function (c) { return c[0]; })), steps: [cap(ph[0]) + ' does not make anything new.', 'The others are chemical changes.'] };
    }
  });

  // ================================================================ Unit 3: Forces and Simple Machines
  T('sciexp.pushes-pulls', {
    hint: 'A force is a push or a pull. Equal forces pushing opposite ways are balanced: nothing changes. Unequal forces are unbalanced: the thing moves toward the stronger side.',
    fact: [
      ['What is a force?', 'a push or a pull', ['a kind of matter', 'a kind of light', 'how fast something goes'], 'Kicking, pulling and lifting all use forces.'],
      ['Which of these can a force do?', 'all of these', ['start something moving', 'stop something', 'change its direction'], 'A force can start, stop, speed up, slow down or turn something.'],
      ['Two teams pull a rope with equal force. What happens?', 'the rope stays still', ['the rope moves left', 'the rope moves right', 'the rope breaks'], 'Equal and opposite forces are balanced.'],
      ['Which force works without touching?', 'a magnet pulling a paper clip', ['a hand pushing a door', 'a foot kicking a ball', 'a rope pulling a sled'], 'Magnets and gravity can pull from a distance.'],
      ['A puck glides across smooth ice and slowly stops. Why does it stop?', 'friction pushes against it', ['it ran out of push', 'gravity pulls it backward', 'ice is sticky'], 'Moving things keep moving unless a force like friction slows them.']
    ],
    tf: [
      ['A moving thing needs a push all the time to keep moving.', false, 'It keeps going until a force like friction slows it.'],
      ['Balanced forces do not change how something moves.', true, 'They cancel out.'],
      ['Gravity is a pull.', true, 'It pulls things toward the Earth.'],
      ['A force can change the direction something moves.', true, 'A push from the side turns a rolling car.'],
      ['When forces are unbalanced, nothing moves.', false, 'Unbalanced forces change the motion.']
    ],
    sort: [['Is {x} a push or a pull?', [['kicking a ball', 'push'], ['opening a drawer', 'pull'], ['pulling a wagon', 'pull'], ['pushing a swing', 'push'], ['a magnet picking up a nail', 'pull'], ['shoving a box', 'push'], ['Earth\'s gravity on an apple', 'pull'], ['pressing a doorbell', 'push'], ['dragging a sled', 'pull'], ['throwing a ball', 'push']], ['push', 'pull'], 'A push moves something away; a pull moves it closer.']],
    c1: function (R, ctx) {
      var a = R.int(2, 9) * 10, b = R.int(2, 9) * 10, L = R.pick(['the red team', 'Team Fox']), Rt = L === 'Team Fox' ? 'Team Owl' : 'the blue team';
      var right = a === b ? 'nobody: the forces are balanced' : (a > b ? L : Rt);
      return { q: 'In a tug-of-war, ' + L + ' pulls left with ' + a + ' units of force and ' + Rt + ' pulls right with ' + b + '. Which way does the rope move?', a: mcOf(right, [a === b ? L : (a > b ? Rt : L), 'nobody: the forces are balanced', 'up into the air', 'it breaks in half'].filter(function (x) { return x !== right; }).slice(0, nWrong(ctx))), steps: [a === b ? 'The pulls are equal, so they are balanced.' : 'The pulls are not equal: the forces are unbalanced.', a === b ? 'The rope stays still.' : 'The rope moves toward ' + right + '.'] };
    },
    c2: function (R) {
      var a = R.int(3, 12) * 10, b = R.int(1, 8) * 10; if (a === b) a += 20; var big = M.max(a, b), small = M.min(a, b);
      return { q: 'Two children push a box from opposite sides: one with ' + a + ' units of force, one with ' + b + '. How big is the unbalanced force left over?', a: num(big - small, ''), steps: ['Opposite forces partly cancel.', big + ' − ' + small + ' = ' + (big - small) + '. The box moves the way the bigger push points.'] };
    }
  });

  T('sciexp.friction-gravity', {
    hint: 'Friction acts against motion: rough surfaces make more, smooth ones less. Gravity pulls everything toward the center of the Earth.',
    fact: [
      ['A book slides on carpet and on a smooth table with the same push. Where does it go farther?', 'on the smooth table', ['on the carpet', 'the same on both', 'it does not move on either'], 'Smooth surfaces make less friction.'],
      ['Why do people put sand on an icy path?', 'to add friction so shoes grip', ['to melt the ice', 'to make it smoother', 'to make it warmer'], 'Rough sand makes more friction.'],
      ['Which way does Earth\'s gravity pull?', 'toward the center of the Earth', ['always toward the North Pole', 'toward the Sun', 'sideways'], '"Down" is toward the center of the Earth everywhere.'],
      ['On the Moon, a hammer and a feather were dropped together. What happened?', 'they landed at the same time', ['the hammer landed first', 'the feather landed first', 'they floated away'], 'The Moon has no air to slow the feather.'],
      ['Why does a feather fall slowly on Earth?', 'air pushes against it', ['it is too light for gravity', 'gravity does not pull feathers', 'it is magnetic'], 'Without air, it falls as fast as a hammer.'],
      ['What holds the Moon near the Earth?', 'gravity', ['friction', 'magnetism', 'air'], 'Gravity pulls the Moon toward the Earth.']
    ],
    tf: [
      ['Friction is always a bad thing.', false, 'It lets shoes grip and brakes stop.'],
      ['Oil between parts makes friction smaller.', true, 'It lets surfaces slide.'],
      ['People in Australia fall off the Earth.', false, 'Down is toward Earth\'s center everywhere.'],
      ['Every surface has tiny bumps, even ones that feel smooth.', true, 'The bumps catch when surfaces slide.'],
      ['Heavy things always fall much faster than light things.', false, 'Without air, all things fall at the same rate.']
    ],
    sort: [['Does {x} make friction bigger or smaller?', [['sand on an icy sidewalk', 'bigger'], ['rubber soles on shoes', 'bigger'], ['oil on a bike chain', 'smaller'], ['wax on a sled', 'smaller'], ['wheels under a heavy box', 'smaller'], ['a rough doormat', 'bigger'], ['ice on a sidewalk', 'smaller'], ['grippy tape on stairs', 'bigger']], ['bigger', 'smaller'], 'Rough surfaces make more friction; smooth, oily or rolling ones make less.']],
    c1: function (R, ctx) {
      var surf = R.shuffle([['a tile floor', 0], ['a towel', 0], ['a carpet', 0], ['a wood floor', 0], ['grass', 0]]).slice(0, 3);
      var d = R.shuffle([R.int(40, 90), R.int(100, 160), R.int(170, 260)]); surf.forEach(function (s, i) { s[1] = d[i]; });
      var most = R.coin(), best = surf.slice().sort(function (a, b) { return most ? a[1] - b[1] : b[1] - a[1]; })[0];
      return { q: 'A toy car rolls down the same ramp onto three surfaces. It goes ' + surf.map(function (s) { return s[1] + ' cm on ' + s[0]; }).join(', ') + '. Which surface has the <b>' + (most ? 'most' : 'least') + '</b> friction?', a: mcOf(best[0], surf.filter(function (s) { return s !== best; }).map(function (s) { return s[0]; })), steps: [most ? 'More friction stops the car sooner, so it goes the shortest distance.' : 'Less friction lets the car roll farthest.', cap(best[0]) + ': ' + best[1] + ' cm.'], viz: still('sciexp-bars', { title: 'How far the car rolled', unit: 'cm', bars: surf.map(function (s) { return [s[0], s[1]]; }) }) };
    }
  });

  T('sciexp.levers', {
    hint: 'A lever balances when load × its distance from the fulcrum = push × its distance. Push farther from the fulcrum to push less.',
    fact: [
      ['What is the point a lever turns on called?', 'the fulcrum', ['the load', 'the effort', 'the axle'], 'The bar turns on the fulcrum.'],
      ['To lift a heavy rock with a lever using less push, where should you push?', 'far from the fulcrum', ['right next to the fulcrum', 'on the rock', 'it makes no difference'], 'The farther your push is from the fulcrum, the less push you need.'],
      ['When a lever lets you push less, what is the trade?', 'your end moves a longer way', ['the rock gets lighter', 'you get free energy', 'nothing at all'], 'You trade distance for force.'],
      ['Which of these is a lever?', 'a seesaw', ['a ramp', 'a screw', 'a pulley'], 'A seesaw is a bar turning on a fulcrum in the middle.'],
      ['In your arm, which part is the fulcrum?', 'the elbow', ['the hand', 'the shoulder muscle', 'the fingers'], 'Your forearm turns at the elbow.'],
      ['How many simple machines are there in the usual list?', 'six', ['three', 'ten', 'two'], 'Lever, wheel and axle, pulley, inclined plane, wedge and screw.']
    ],
    tf: [
      ['A lever gives you free energy.', false, 'You push less, but over a longer distance.'],
      ['Scissors are made of two levers.', true, 'Each blade turns on the screw in the middle.'],
      ['A bottle opener is a lever.', true, 'It turns on the edge of the cap.'],
      ['Moving the fulcrum closer to the load makes lifting easier.', true, 'Your push is then farther from the fulcrum than the load.']
    ],
    pick: [['Which of these is a lever?', ['a seesaw', 'a crowbar', 'a bottle opener', 'a broom', 'scissors'], ['a ramp', 'a screw', 'a doorknob', 'a flagpole pulley'], 'A lever is a stiff bar that turns on a fulcrum.']],
    c1: function (R) {
      var la = R.int(1, 3), ea = R.int(la + 1, 6), e = R.int(1, 5), load = e * ea / la;
      if (load !== M.floor(load)) { la = 1; load = e * ea; }
      return { q: 'A load of ' + load + ' blocks sits ' + la + ' step' + (la > 1 ? 's' : '') + ' from the fulcrum. You push ' + ea + ' steps from the fulcrum on the other side. How many blocks of push balance it?', a: num(e, 'blocks'), steps: ['Load × distance: ' + load + ' × ' + la + ' = ' + (load * la) + '.', 'Push × ' + ea + ' must make ' + (load * la) + ', so push = ' + (load * la) + ' ÷ ' + ea + ' = ' + e + ' blocks.'], viz: pic('sciexp-lever', { load: load, loadAt: la, effortAt: ea }) };
    },
    c2: function (R) {
      var la = R.int(1, 3), e = R.int(1, 4), ea = R.int(la + 1, 6), load = e * ea / la;
      if (load !== M.floor(load)) { la = 1; load = e * ea; }
      return { q: 'A load of ' + load + ' blocks sits ' + la + ' step' + (la > 1 ? 's' : '') + ' from the fulcrum. You can push with ' + e + ' block' + (e > 1 ? 's' : '') + ' of force. How many steps from the fulcrum must you push to balance it?', a: num(ea, 'steps'), steps: ['Load × distance: ' + load + ' × ' + la + ' = ' + (load * la) + '.', e + ' × distance must make ' + (load * la) + ', so distance = ' + (load * la) + ' ÷ ' + e + ' = ' + ea + ' steps.'] };
    }
  });

  T('sciexp.wheels-pulleys', {
    hint: 'A big wheel turning a small axle takes less force. A fixed pulley changes the direction of your pull; a movable pulley halves the pull but you pull twice as much rope.',
    fact: [
      ['What does a single fixed pulley do?', 'changes the direction of your pull', ['halves the pull you need', 'makes the load lighter', 'makes the rope shorter'], 'You pull down to lift up.'],
      ['Why does a flagpole have a pulley at the top?', 'so you can pull down at the bottom to raise the flag', ['to make the flag lighter', 'to hold the flag still in the wind', 'to make the pole taller'], 'The fixed pulley changes the direction of the pull.'],
      ['Which is a wheel and axle?', 'a doorknob', ['a ramp', 'a seesaw', 'an ax'], 'The big knob turns the small rod inside.'],
      ['With one movable pulley, how does your pull compare with the load?', 'about half', ['about double', 'the same', 'zero'], 'Two ropes share the load, so you pull about half.'],
      ['With one movable pulley, to lift a load 1 meter you pull…', 'about 2 meters of rope', ['1 meter of rope', 'half a meter of rope', 'no rope'], 'You pull half as hard but twice as far.']
    ],
    tf: [
      ['A single fixed pulley makes a load feel lighter.', false, 'It only changes the direction of the pull.'],
      ['A screwdriver handle is a wheel and axle.', true, 'The wide handle turns the thin shaft.'],
      ['Turning the big wheel takes less force than turning the small axle directly.', true, 'That is why steering wheels are big.'],
      ['Real pulleys have no friction at all.', false, 'Real pulleys have a little friction.'],
      ['A steering wheel is big so that turning it takes less force.', true, 'The big wheel turns the small axle.'],
      ['A movable pulley moves up with the load.', true, 'It hangs from the rope with the load.'],
      ['With a movable pulley you pull less rope than the height you lift.', false, 'You pull about twice as much rope.']
    ],
    sort: [['What does {x} do?', [['one fixed pulley', 'changes the direction of the pull'], ['the pulley at the top of a flagpole', 'changes the direction of the pull'], ['the pulley on a window blind', 'changes the direction of the pull'], ['one movable pulley', 'halves the pull'], ['a pulley that rides up with a heavy load', 'halves the pull'], ['a big wheel on a small axle', 'turns the axle with less force'], ['a doorknob', 'turns the axle with less force']], ['changes the direction of the pull', 'halves the pull', 'turns the axle with less force'], 'Fixed pulleys turn the pull around, movable pulleys halve it, and wheels make turning easier.']],
    pick: [['Which of these is a wheel and axle?', ['a doorknob', 'a steering wheel', 'a screwdriver handle', 'a faucet handle', 'a pencil sharpener crank'], ['a seesaw', 'a ramp', 'a knife', 'a flagpole pulley'], 'A big wheel turns a small axle.']],
    c1: function (R) {
      var w = R.int(2, 15) * 4, mov = R.coin();
      return { q: 'You lift a ' + w + '-pound bucket with ' + (mov ? 'one movable pulley' : 'one fixed pulley') + '. Leaving out friction, about how hard do you pull?', a: num(mov ? w / 2 : w, 'pounds'), steps: [mov ? 'A movable pulley halves the pull.' : 'A fixed pulley only changes direction.', mov ? w + ' ÷ 2 = ' + (w / 2) + ' pounds.' : 'You still pull ' + w + ' pounds.'] };
    },
    c2: function (R) {
      var h = R.int(2, 9);
      if (R.coin()) { var n = R.int(2, 6), f = n * R.int(2, 10); return { q: 'Turning a faucet\'s thin stem by hand takes ' + f + ' units of force. Its handle is ' + n + ' times as wide as the stem. About how much force does turning the handle take? (Leave out friction.)', a: num(f / n, ''), steps: ['A wheel ' + n + ' times as wide needs about 1/' + n + ' of the force.', f + ' ÷ ' + n + ' = ' + (f / n) + '.'] }; }
      return { q: 'With one movable pulley, you lift a bucket ' + h + ' feet. About how much rope do you pull?', a: num(2 * h, 'feet'), steps: ['Half the pull, but twice the rope.', '2 × ' + h + ' = ' + (2 * h) + ' feet.'] };
    }
  });

  T('sciexp.ramps-wedges-screws', {
    hint: 'A longer ramp to the same height takes less push, over a longer path. A wedge is two ramps back to back; a screw is a ramp wrapped around a post.',
    fact: [
      ['Why do movers push boxes up a ramp instead of lifting them?', 'it takes a smaller push', ['it makes the box lighter', 'it is a shorter path', 'it takes no work'], 'A ramp trades a longer path for a smaller push.'],
      ['Ramp A is 2 m long, ramp B is 6 m long. Both reach the same truck. Which needs less push?', 'ramp B, the longer one', ['ramp A, the shorter one', 'both the same', 'neither needs a push'], 'The longer ramp is gentler.'],
      ['What is a wedge?', 'two ramps back to back', ['a ramp wrapped around a post', 'a wheel with a rope', 'a bar on a fulcrum'], 'An ax and a doorstop are wedges.'],
      ['What is a screw?', 'a ramp wrapped around a post', ['two ramps back to back', 'a bar on a fulcrum', 'a wheel and a rope'], 'The thread winds around like a spiral ramp.'],
      ['Why do mountain roads zig-zag?', 'a longer, gentler path is easier to climb', ['to make the trip shorter', 'to avoid the sun', 'to slow down the wind'], 'Zig-zags are long, gentle ramps.']
    ],
    tf: [
      ['A longer ramp to the same height is harder because it is longer.', false, 'Each step is easier; there are just more of them.'],
      ['A jar lid is a kind of screw.', true, 'Its threads are a ramp around the jar.'],
      ['A knife blade is a wedge.', true, 'It splits things apart.'],
      ['A ramp lets you raise a load with a smaller push over a longer path.', true, 'That is the trade.']
    ],
    sort: [['Which simple machine is {x}?', [['an ax', 'wedge'], ['a doorstop', 'wedge'], ['a knife', 'wedge'], ['a wheelchair ramp', 'inclined plane'], ['a slide at the park', 'inclined plane'], ['a loading ramp', 'inclined plane'], ['a jar lid', 'screw'], ['a corkscrew', 'screw'], ['a bolt', 'screw'], ['a seesaw', 'lever'], ['a crowbar', 'lever']], ['wedge', 'inclined plane', 'screw', 'lever'], 'A wedge splits, an inclined plane is a ramp, a screw is a ramp around a post, a lever turns on a fulcrum.']],
    c1: function (R) {
      var h = 1, L = R.pick([2, 3, 4, 5, 6]), w = R.pick([40, 60, 80, 100, 120]);
      if (w % L) w = L * R.int(10, 25);
      return { q: 'Lifting a box 1 meter straight up takes ' + w + ' units of force. About how much force does it take to push it up a ' + L + '-meter ramp to the same height? (Leave out friction.)', a: num(w / L, ''), steps: ['The ramp is ' + L + ' times as long as the height.', 'So the push is about ' + w + ' ÷ ' + L + ' = ' + (w / L) + '.'] };
    }
  });

  // ================================================================ Unit 4: Energy
  var FORMS = [['a rolling ball', 'motion'], ['wind', 'motion'], ['a running child', 'motion'], ['a battery', 'stored'], ['food', 'stored'], ['a stretched rubber band', 'stored'], ['a book on a high shelf', 'stored'], ['a warm mug', 'heat'], ['a stove burner', 'heat'], ['a lamp', 'light'], ['a firefly', 'light'], ['a drum', 'sound'], ['thunder', 'sound'], ['electricity in wires', 'electrical'], ['lightning', 'electrical']];
  T('sciexp.energy-forms', {
    hint: 'Energy makes things move, light up, heat up or make sound. Forms: motion, stored, heat, light, sound, electrical.',
    fact: [
      ['What does energy do?', 'makes things move, light up, heat up or make sound', ['takes up space', 'has mass', 'only makes things move'], 'Energy comes in many forms.'],
      ['Which has more motion energy?', 'a fast ball', ['a slow ball of the same size', 'a ball sitting still', 'they all have the same'], 'The faster something moves, the more motion energy it has.'],
      ['A stretched slingshot band holds…', 'stored energy', ['sound energy', 'light energy', 'no energy'], 'When it snaps back, the stored energy becomes motion.'],
      ['Food holds which form of energy?', 'stored energy', ['light energy', 'sound energy', 'electrical energy'], 'Your body uses the stored energy in food.'],
      ['A ball held high has stored energy. What does it turn into when the ball falls?', 'motion energy', ['light energy', 'electrical energy', 'nothing'], 'Falling, it speeds up.']
    ],
    tf: [
      ['Only moving things have energy.', false, 'Food and a held-up ball have stored energy.'],
      ['A faster ball hits harder because it has more motion energy.', true, 'Speed means more energy.'],
      ['A lamp gives off light and heat.', true, 'Many things give off more than one form.'],
      ['Sound is a form of energy.', true, 'It comes from vibrations.']
    ],
    sort: [['What form of energy is in {x}?', FORMS, ['motion', 'stored', 'heat', 'light', 'sound', 'electrical'], 'Look at what it does: move, wait to be used, warm, glow, make noise, or flow in wires.']],
    c1: function (R, ctx) {
      var a = R.int(2, 9), b = R.intNot(2, 9, a), w1 = nmr(R), w2 = R.pick(['her brother', 'his sister', 'a friend']);
      return { q: 'Two balls of the same size are rolled. One goes ' + a + ' meters each second and the other ' + b + ' meters each second. Which has more motion energy?', a: mcOf('the one going ' + M.max(a, b) + ' meters each second', ['the one going ' + M.min(a, b) + ' meters each second', 'they have the same', 'neither has energy'].slice(0, nWrong(ctx))), steps: ['Faster means more motion energy.', M.max(a, b) + ' is faster than ' + M.min(a, b) + '.'] };
    }
  });

  var DEVICES = [['a flashlight', 'stored (battery)', 'light'], ['a toaster', 'electrical', 'heat'], ['a fan', 'electrical', 'motion'], ['a wind turbine', 'motion (wind)', 'electrical'], ['a solar panel', 'light', 'electrical'], ['your body after breakfast', 'stored (food)', 'motion and heat'], ['a doorbell', 'electrical', 'sound'], ['a wind-up toy', 'stored (spring)', 'motion']];
  T('sciexp.energy-changes', {
    hint: 'Energy is never used up. It changes form or moves from one thing to another.',
    fact: [
      ['Where does the light in a flashlight come from?', 'energy stored in the battery', ['the bulb makes it from nothing', 'the air', 'the switch'], 'Stored → electrical → light (and heat).'],
      ['A ball rolls to a stop. What happened to its motion energy?', 'it turned into a little heat and sound', ['it vanished', 'it went back into the ball forever', 'it turned into matter'], 'Friction turns motion into heat.'],
      ['You rub your hands together fast. They get warm. What changed?', 'motion energy became heat', ['heat became motion', 'light became heat', 'nothing changed'], 'Friction changes motion into heat.'],
      ['Is energy ever used up?', 'no: it changes form or moves', ['yes, every time', 'only in batteries', 'only at night'], 'Energy is never used up.']
    ],
    tf: [
      ['A solar panel changes light into electrical energy.', true, 'That is what solar panels do.'],
      ['When a battery runs down, its energy has disappeared.', false, 'It changed into light, heat, sound or motion.'],
      ['A toaster changes electrical energy into heat.', true, 'The wires glow hot.'],
      ['A wind turbine changes electrical energy into wind.', false, 'It changes wind (motion) into electrical energy.']
    ],
    order: [['Follow the energy in a flashlight.', ['stored energy in the battery', 'electrical energy in the wires', 'light and heat from the bulb'], ''], ['Follow the energy from the Sun to your bike ride.', ['light from the Sun', 'stored energy in plants (food)', 'stored energy in your body', 'motion of the bike'], 'Plants store the Sun\'s energy as food.']],
    c1: function (R, ctx) {
      var d = R.pick(DEVICES), others = DEVICES.filter(function (x) { return x[2] !== d[2]; });
      return { q: 'What does ' + d[0] + ' mostly change energy <b>into</b>?', a: mcOf(d[2], R.sample(uniq(others.map(function (x) { return x[2]; })), nWrong(ctx))), steps: [cap(d[0]) + ': ' + d[1] + ' → ' + d[2] + '.'] };
    },
    c2: function (R, ctx) {
      var d = R.pick(DEVICES), others = DEVICES.filter(function (x) { return x[1] !== d[1]; });
      return { q: 'What energy goes <b>into</b> ' + d[0] + '?', a: mcOf(d[1], R.sample(uniq(others.map(function (x) { return x[1]; })), nWrong(ctx))), steps: [cap(d[0]) + ': ' + d[1] + ' → ' + d[2] + '.'] };
    }
  });

  var CONDH = [['a metal spoon', 'conductor'], ['an aluminum pan', 'conductor'], ['foil', 'conductor'], ['a steel pot', 'conductor'], ['a stone floor', 'conductor'], ['a wooden spoon', 'insulator'], ['a wool sweater', 'insulator'], ['a foam cup', 'insulator'], ['a plastic handle', 'insulator'], ['an oven mitt', 'insulator'], ['a down coat', 'insulator']];
  T('sciexp.heat-moves', {
    hint: 'Heat moves from warmer things to cooler things. Conductors (metals) pass heat quickly; insulators (wood, wool, trapped air) pass it slowly.',
    fact: [
      ['Which way does heat move by itself?', 'from warmer things to cooler things', ['from cooler things to warmer things', 'only upward', 'it does not move'], 'Heat flows from hot to cold.'],
      ['Your hand feels cold on an ice cube. Why?', 'heat leaves your hand and goes into the ice', ['cold moves from the ice into your hand', 'the ice makes cold', 'your hand stops making heat'], 'Cold does not move; heat leaves your hand.'],
      ['Does a sweater make heat?', 'no: it traps air so your body heat escapes slowly', ['yes: wool makes heat', 'yes, when it is new', 'only in winter'], 'A sweater is an insulator.'],
      ['How does sunshine warm the Earth across empty space?', 'by radiation (rays)', ['by touching', 'by moving air', 'by wires'], 'Radiation travels through space.'],
      ['A pot of soup heats the metal spoon in it all the way up. This is heat moving by…', 'conduction (touching)', ['radiation', 'convection', 'evaporation'], 'Heat passes along the metal from part to part.'],
      ['Warm air rising from a heater carries heat around a room. This is…', 'convection', ['conduction', 'radiation', 'condensation'], 'Moving air or water carrying heat is convection.']
    ],
    tf: [
      ['Metals are good heat conductors.', true, 'A metal spoon heats up quickly.'],
      ['Cold moves into your hand from ice.', false, 'Heat moves out of your hand into the ice.'],
      ['Wood is an insulator.', true, 'A wooden spoon stays cool at the top.'],
      ['A sock around an ice cube makes it melt faster.', false, 'The sock insulates the ice, so it melts more slowly.']
    ],
    sort: [['Is {x} a heat conductor or a heat insulator?', CONDH, ['conductor', 'insulator'], 'Metals and stone pass heat quickly; wood, plastic, wool and trapped air slow it.']],
    c1: function (R, ctx) {
      var a = R.int(30, 80), b = R.int(0, 25), things = R.pick([['a mug of cocoa', 'your hands'], ['a hot pan', 'the countertop'], ['warm soup', 'a cold spoon'], ['your hand', 'a snowball'], ['a warm room', 'a glass of ice water']]);
      var hot = things[0], cold = things[1]; if (things[0] === 'your hand') { a = 33; }
      return { q: cap(hot) + ' is at ' + a + ' °C and ' + cold + ' ' + (cold === 'your hands' ? 'are' : 'is') + ' at ' + b + ' °C. They touch. Which way does heat move?', a: mcOf('from ' + hot + ' to ' + cold, ['from ' + cold + ' to ' + hot, 'it does not move', 'both ways equally'].slice(0, nWrong(ctx))), steps: ['Heat moves from warmer to cooler.', a + ' °C is warmer than ' + b + ' °C.'] };
    },
    c2: function (R) {
      var a = R.int(60, 90), drop = R.int(10, 30), b = a - drop;
      return { q: 'Cocoa starts at ' + a + ' °C. After 20 minutes in a mug it is ' + b + ' °C. How many degrees did it cool?', a: num(drop, '°C'), steps: [a + ' − ' + b + ' = ' + drop + ' degrees.', 'The heat moved into the mug and the air.'] };
    }
  });

  // ================================================================ Unit 5: Electricity and Magnets
  var MAGS = [['a steel paper clip', 'pulled'], ['an iron nail', 'pulled'], ['a steel spoon', 'pulled'], ['a steel fridge door', 'pulled'], ['a steel can for soup', 'pulled'], ['a steel safety pin', 'pulled'], ['a copper penny', 'not pulled'], ['aluminum foil', 'not pulled'], ['an aluminum soda can', 'not pulled'], ['a plastic cup', 'not pulled'], ['a wooden block', 'not pulled'], ['a glass marble', 'not pulled'], ['a paper napkin', 'not pulled'], ['a gold ring', 'not pulled']];
  T('sciexp.magnets', {
    hint: 'Opposite poles attract; like poles repel. Magnets pull iron and steel (and a few other metals like nickel), not aluminum, copper, wood or plastic.',
    fact: [
      ['What happens when the north pole of one magnet faces the north pole of another?', 'they push apart', ['they pull together', 'nothing', 'they both turn south'], 'Like poles repel.'],
      ['What happens when a north pole faces a south pole?', 'they pull together', ['they push apart', 'nothing', 'they spin'], 'Opposite poles attract.'],
      ['Which does a magnet pull on?', 'a steel paper clip', ['an aluminum can', 'a copper penny', 'a plastic spoon'], 'Magnets pull iron and steel.'],
      ['Why does a compass needle point north?', 'it is a small magnet lining up with the Earth, a giant magnet', ['the wind blows it', 'it is heavier at one end', 'the Sun pulls it'], 'The Earth is a giant magnet.'],
      ['Does a magnet\'s pull work through paper?', 'yes', ['no, never', 'only through metal', 'only in the dark'], 'A fridge magnet holds a drawing through the paper.']
    ],
    tf: [
      ['Magnets attract all metals.', false, 'Aluminum, copper and gold are not pulled.'],
      ['Every magnet has a north pole and a south pole.', true, 'Even a small piece has both.'],
      ['Like poles attract.', false, 'Like poles repel; opposite poles attract.'],
      ['The Earth itself is a giant magnet.', true, 'That is why compasses work.'],
      ['A magnet can pull a paper clip through a sheet of paper.', true, 'The pull works through paper.'],
      ['A magnet pulls on an aluminum soda can.', false, 'Aluminum is not pulled by magnets.'],
      ['The north end of a compass needle points north.', true, 'It lines up with Earth\'s magnetism.']
    ],
    c2: function (R, ctx) {
      var it = R.pick(MAGS.filter(function (m) { return m[1] !== 'pulled'; })), wr = R.sample(MAGS.filter(function (m) { return m[1] === 'pulled'; }), nWrong(ctx));
      return { q: 'Which of these will a magnet <b>not</b> pick up?', a: mcOf(it[0], wr.map(function (m) { return m[0]; })), steps: [cap(it[0]) + ' has no iron or steel.', 'The others are iron or steel.'] };
    },
    sort: [['Does a magnet pull on {x}?', MAGS, ['pulled', 'not pulled'], 'Magnets pull iron and steel, not aluminum, copper, gold, wood, glass, plastic or paper.']],
    c1: function (R, ctx) {
      var a = R.pick(['NS', 'SN']), b = R.pick(['NS', 'SN']), facing = a.charAt(1) + ' and ' + b.charAt(0), like = a.charAt(1) === b.charAt(0);
      if (R.coin()) { var it = R.pick(MAGS.filter(function (m) { return m[1] === 'pulled'; })), wr = R.sample(MAGS.filter(function (m) { return m[1] !== 'pulled'; }), nWrong(ctx));
        return { q: 'You hold a magnet near each of these. Which one will it pick up?', a: mcOf(it[0], wr.map(function (m) { return m[0]; })), steps: [cap(it[0]) + ' has iron or steel in it.', 'Magnets do not pull ' + wr.map(function (m) { return m[0]; }).join(', ') + '.'] }; }
      return { q: 'Two bar magnets lie end to end as shown (poles left to right). The facing poles are ' + facing + '. What happens?', a: mcOf(like ? 'they push apart' : 'they pull together', [like ? 'they pull together' : 'they push apart', 'nothing happens', 'they both lose their poles'].slice(0, nWrong(ctx))), steps: [like ? 'The facing poles are the same: like poles repel.' : 'The facing poles are opposite: they attract.'], viz: pic('sciexp-magnets', { a: a, b: b }) };
    }
  });

  var MATS = [['foil', 'conductor'], ['clip', 'conductor'], ['coin', 'conductor'], ['key', 'conductor'], ['spoon', 'conductor'], ['nail', 'conductor'], ['eraser', 'insulator'], ['wood', 'insulator'], ['plastic', 'insulator'], ['paper', 'insulator'], ['glass', 'insulator'], ['band', 'insulator'], ['cloth', 'insulator']];
  var MATNAME = { foil: 'a strip of foil', clip: 'a steel paper clip', coin: 'a metal coin', key: 'a metal key', spoon: 'a metal spoon', nail: 'an iron nail', eraser: 'a rubber eraser', wood: 'a wooden stick', plastic: 'a plastic straw', paper: 'a strip of paper', glass: 'a glass rod', band: 'a rubber band', cloth: 'a cotton string' };
  T('sciexp.circuits', {
    hint: 'Electricity flows only around a complete loop (a closed circuit). A gap anywhere opens the circuit and the bulb goes dark.',
    fact: [
      ['What must a circuit have for the bulb to light?', 'a complete loop from the battery, through the bulb and back', ['one wire from the battery to the bulb', 'a gap in the wire', 'two bulbs'], 'Electricity must go out and come back.'],
      ['What does a switch do when you turn it off?', 'opens a gap in the loop', ['uses up the battery', 'adds more wire', 'cools the bulb'], 'The gap stops the current.'],
      ['A wire goes from the battery to the bulb, but no wire comes back. Does the bulb light?', 'no', ['yes', 'yes, but dimly', 'only if the switch is off'], 'With no path back, the loop is open.'],
      ['What is an open circuit?', 'a loop with a gap in it', ['a loop with no gaps', 'a circuit with the lid off', 'a very bright circuit'], 'In an open circuit, no current flows.'],
      ['What is a closed circuit?', 'a complete loop with no gaps', ['a loop with a gap', 'a circuit in a box', 'a circuit that is switched off'], 'Current flows only in a closed circuit.'],
      ['In a flashlight, what touches the ends of the batteries?', 'a metal spring and metal strips', ['plastic tabs', 'rubber bands', 'paper'], 'Metal strips carry the current around the loop.'],
      ['What part of a circuit pushes the electric charges around?', 'the battery', ['the bulb', 'the switch', 'the plastic case'], 'It is like a pump pushing water around pipes.'],
      ['Which should you never take apart to look inside?', 'anything that plugs into the wall', ['a flashlight, with a grown-up', 'a battery-powered toy, with a grown-up', 'a cardboard box'], 'Never take apart anything that plugs into the wall, and never put anything into an outlet.']
    ],
    tf: [
      ['Electricity needs a path out of the battery and a path back.', true, 'That is a closed circuit.'],
      ['One wire is enough to light a bulb.', false, 'It must go through the bulb and back.'],
      ['A break anywhere in a simple loop stops the whole flow.', true, 'Like a gap in a ring of pipes.'],
      ['A switch that is "on" closes the gap in the loop.', true, 'Then the current flows.'],
      ['The battery pushes electric charges around the loop like a pump.', true, 'Like water around a ring of pipes.'],
      ['A switch that is "off" makes the battery stronger.', false, 'It only opens a gap so no current flows.']
    ],
    sort: [['Does the bulb light? {x}', [['Wires go from the battery to the bulb and back, and the switch is on.', 'yes'], ['The flashlight switch is pushed to on and the batteries are new.', 'yes'], ['A foil strip closes the only gap in the loop.', 'yes'], ['The switch is off.', 'no'], ['One wire has come loose from the battery.', 'no'], ['A wire goes from the battery to the bulb, but none comes back.', 'no'], ['A rubber band fills the only gap in the loop.', 'no'], ['The battery has been taken out.', 'no']], ['yes', 'no'], 'The bulb lights only when there is a complete loop of conductors.']],
    order: [['Follow the current around a flashlight circuit.', ['out of one end of the battery', 'through the switch', 'through the bulb', 'back into the other end of the battery'], 'It is one complete loop.']],
    c1: function (R, ctx) {
      if (R.coin()) { var m = R.pick(MATS), on2 = m[1] === 'conductor';
        return { q: 'The gap in this circuit is bridged by ' + MATNAME[m[0]] + '. Is the circuit closed?', a: mcOf(on2 ? 'yes: the loop is complete' : 'no: the loop is still open', [on2 ? 'no: the loop is still open' : 'yes: the loop is complete', 'only if you shake it'].slice(0, nWrong(ctx))), steps: [cap(MATNAME[m[0]]) + ' is ' + (on2 ? 'a conductor, so it closes the loop.' : 'an insulator, so the loop stays open.')], viz: pic('sciexp-circuit', { closed: true, gap: m[0] }) }; }
      var k = R.int(0, 2), o = k === 0 ? { closed: true } : k === 1 ? { closed: false, switch: true } : { closed: true, broken: true };
      var on = k === 0;
      return { q: 'Will the bulb in this circuit light?', a: mcOf(on ? 'yes: the loop is complete' : 'no: the loop has a gap', [on ? 'no: the loop has a gap' : 'yes: the loop is complete', 'only if you shake it'].slice(0, nWrong(ctx))), steps: [k === 0 ? 'The wires make a complete loop through the bulb.' : k === 1 ? 'The switch is open: there is a gap.' : 'One wire is not connected: there is a gap.', on ? 'The bulb lights.' : 'No current flows, so the bulb stays dark.'], viz: pic('sciexp-circuit', o) };
    }
  });

  T('sciexp.conductors-insulators', {
    hint: 'Conductors (metals) let electricity flow; insulators (plastic, rubber, wood, glass, cloth, paper) stop it.',
    fact: [
      ['Why does a lamp cord have plastic on the outside?', 'plastic is an insulator that keeps the current in the wire and keeps people safe', ['plastic carries the current', 'to make it shiny', 'to make it heavy'], 'The copper inside carries the current.'],
      ['Which of these is a conductor?', 'copper', ['rubber', 'wood', 'glass'], 'Metals are conductors.'],
      ['Which of these is an insulator?', 'rubber', ['copper', 'aluminum', 'iron'], 'Rubber stops electricity.'],
      ['Why do we keep electrical things away from sinks and baths?', 'tap water carries electricity well enough to be dangerous', ['water makes them rust', 'water is an insulator', 'water makes them too cold'], 'Keep water and electricity apart.'],
      ['A shiny painted pencil is put in the gap of a circuit. Does the bulb light?', 'no: paint and wood are insulators', ['yes: shiny things conduct', 'yes, brightly', 'only if it is wet'], 'Shiny does not mean metal.']
    ],
    tf: [
      ['Anything shiny conducts electricity.', false, 'Shiny plastic does not; metal does, even dull metal.'],
      ['Metals are conductors.', true, 'Copper, aluminum, iron and silver all conduct.'],
      ['Paper is a conductor.', false, 'Paper is an insulator.'],
      ['A rusty-looking iron nail can still conduct.', true, 'It is still metal.']
    ],
    sort: [['Is {x} a conductor or an insulator?', MATS.map(function (m) { return [MATNAME[m[0]], m[1]]; }), ['conductor', 'insulator'], 'Metals conduct; plastic, rubber, wood, glass, paper and cloth insulate.']],
    c1: function (R, ctx) {
      var m = R.pick(MATS), on = m[1] === 'conductor';
      return { q: MATNAME[m[0]].charAt(0).toUpperCase() + MATNAME[m[0]].slice(1) + ' bridges the gap in this circuit. Does the bulb light?', a: mcOf(on ? 'yes: it is a conductor' : 'no: it is an insulator', [on ? 'no: it is an insulator' : 'yes: it is a conductor', 'only if it is shiny'].slice(0, nWrong(ctx))), steps: [cap(MATNAME[m[0]]) + ' is ' + (on ? 'metal, a conductor' : 'an insulator') + '.', on ? 'The current flows and the bulb lights.' : 'No current flows; the bulb stays dark.'], viz: pic('sciexp-circuit', { closed: true, gap: m[0] }) };
    }
  });

  T('sciexp.electromagnets', {
    hint: 'A coil of wire with current flowing is a magnet. More turns, more current or an iron core make it stronger. Switch it off and it lets go.',
    fact: [
      ['What is an electromagnet?', 'a coil of wire that is a magnet while current flows', ['a magnet that makes electricity', 'a battery that sticks to the fridge', 'a magnet made of plastic'], 'Current in a coil makes magnetism.'],
      ['Who noticed in 1820 that a current made a compass needle jump?', 'Hans Christian Ørsted', ['Isaac Newton', 'Galileo', 'William Gilbert'], 'Ørsted, a Danish professor, saw it during a lecture.'],
      ['Why does a scrapyard crane use an electromagnet?', 'it can be switched off to drop the load', ['it is lighter than a rock', 'it never needs electricity', 'it pulls aluminum'], 'A regular magnet cannot let go.'],
      ['What happens to an electromagnet when the current stops?', 'it stops being a strong magnet', ['it becomes stronger', 'it turns into a battery', 'it melts'], 'It is a magnet only while current flows.'],
      ['Which of these uses electromagnets?', 'an electric motor', ['a wooden spoon', 'a rubber band', 'a glass jar'], 'Motors, speakers and doorbells use electromagnets.']
    ],
    tf: [
      ['Wrapping the coil around an iron nail makes the electromagnet stronger.', true, 'The iron becomes a magnet too.'],
      ['An electromagnet stays magnetic forever after you switch it off.', false, 'It is a magnet only while current flows.'],
      ['More turns of wire make an electromagnet stronger.', true, 'Each turn adds to the magnet.'],
      ['Electricity can make magnetism.', true, 'Ørsted showed it in 1820.']
    ],
    c1: function (R, ctx) {
      var a = R.int(1, 6) * 10, b = R.intNot(1, 6, a / 10) * 10;
      return { q: 'Two electromagnets use the same battery and the same nail. Coil A has ' + a + ' turns of wire; coil B has ' + b + '. Which picks up more paper clips?', a: mcOf(a > b ? 'coil A' : 'coil B', [a > b ? 'coil B' : 'coil A', 'they pick up the same', 'neither picks up any'].slice(0, nWrong(ctx))), steps: ['More turns make a stronger electromagnet.', M.max(a, b) + ' turns is more than ' + M.min(a, b) + '.'], viz: still('sciexp-circuit', { closed: true, coil: true }) };
    },
    c2: function (R, ctx) {
      var thing = R.pick([['more turns of wire', 'stronger'], ['a stronger battery', 'stronger'], ['an iron nail inside the coil', 'stronger'], ['fewer turns of wire', 'weaker'], ['taking the nail out', 'weaker'], ['a weaker battery', 'weaker'], ['opening the switch', 'not a magnet at all']]);
      return { q: 'What does ' + thing[0] + ' do to an electromagnet?', a: mcOf('makes it ' + thing[1], ['makes it stronger', 'makes it weaker', 'makes it not a magnet at all'].filter(function (x) { return x !== 'makes it ' + thing[1]; }).slice(0, nWrong(ctx))), steps: ['More turns, more current and an iron core make it stronger; no current, no magnet.'] };
    }
  });

  // ================================================================ Unit 6: Light and Sound
  var SEE = [['clear window glass', 'transparent'], ['clean water', 'transparent'], ['plastic wrap', 'transparent'], ['wax paper', 'translucent'], ['a frosted shower door', 'translucent'], ['tissue paper', 'translucent'], ['a wooden door', 'opaque'], ['your hand', 'opaque'], ['a book', 'opaque'], ['a brick wall', 'opaque'], ['aluminum foil', 'opaque']];
  T('sciexp.light-shadows', {
    hint: 'Light travels in straight lines. A shadow is where an object blocks the light. Closer to the light means a bigger shadow.',
    fact: [
      ['What is a shadow?', 'the place behind an object that light cannot reach', ['a reflection of the object', 'a dark kind of matter', 'light bouncing off a wall'], 'Light travels in straight lines, so the object blocks it.'],
      ['You want a giant shadow puppet on the wall. Where do you hold your hand?', 'close to the flashlight', ['close to the wall', 'behind the flashlight', 'it does not matter'], 'Closer to the light means a bigger shadow.'],
      ['How does light travel?', 'in straight lines', ['in circles', 'around corners', 'only downward'], 'That is why objects block it and make shadows.'],
      ['What kind of thing makes the darkest shadow?', 'opaque', ['transparent', 'translucent', 'shiny'], 'Opaque things block all the light.'],
      ['What should you never do outdoors when looking for shadows?', 'look straight at the Sun', ['look at your shadow', 'measure a shadow', 'stand in the sun'], 'Never look straight at the Sun.']
    ],
    tf: [
      ['A shadow is made of something.', false, 'It is only the place light cannot reach.'],
      ['Clear glass lets light through.', true, 'It is transparent.'],
      ['Moving an object away from the light makes its shadow bigger.', false, 'Moving it closer to the light makes the shadow bigger.'],
      ['Wax paper lets some light through.', true, 'It is translucent.']
    ],
    sort: [['Is {x} transparent, translucent or opaque?', SEE, ['transparent', 'translucent', 'opaque'], 'Transparent lets light through, translucent lets some through, opaque blocks it.']],
    c1: function (R, ctx) {
      var d1 = R.int(1, 5), d2 = R.intNot(1, 5, d1);
      return { q: 'A block is moved from ' + d1 + ' steps away from a lamp to ' + d2 + ' steps away. What happens to its shadow on the wall behind it?', a: mcOf(d2 < d1 ? 'it gets bigger' : 'it gets smaller', [d2 < d1 ? 'it gets smaller' : 'it gets bigger', 'it stays the same size', 'it disappears'].slice(0, nWrong(ctx))), steps: ['Closer to the lamp, the block blocks a wider fan of rays.', 'It moved ' + (d2 < d1 ? 'closer, so the shadow grows.' : 'farther, so the shadow shrinks.')], viz: pic('sciexp-shadow', { mode: 'lamp', dist: d1 }) };
    }
  });

  T('sciexp.mirrors-bending', {
    hint: 'We see things when light bounces off them into our eyes. A mirror sends light off at the same angle it came in. Light bends when it goes from air into water or glass.',
    fact: [
      ['How do we see a page in a book?', 'light bounces off the page into our eyes', ['light shines out of our eyes onto the page', 'the page glows by itself', 'we see in the dark'], 'In a room with no light, we see nothing.'],
      ['A straw in a glass of water looks broken. Why?', 'light bends at the water\'s surface', ['the water breaks the straw', 'the glass is curved', 'the straw is bent'], 'Light bends (refracts) going from water into air.'],
      ['How many mirrors does a simple periscope use?', 'two', ['one', 'none', 'ten'], 'The top mirror bounces light down; the bottom one sends it to your eye.'],
      ['What is the bending of light called?', 'refraction', ['reflection', 'vibration', 'evaporation'], 'Reflection is bouncing; refraction is bending.'],
      ['What is the bouncing of light off a mirror called?', 'reflection', ['refraction', 'conduction', 'condensation'], 'A smooth mirror reflects light neatly.'],
      ['Glasses and magnifying glasses use…', 'lenses that bend light', ['mirrors that bounce light', 'magnets', 'electricity'], 'Lenses are curved glass that bend light.'],
      ['Why can\'t you see anything in a room with no light at all?', 'there is no light to bounce off things into your eyes', ['your eyes are closed', 'things disappear in the dark', 'mirrors stop working'], 'Seeing needs light coming into the eyes.'],
      ['Why does light bend going into water?', 'it slows down a little in water', ['water is magnetic', 'it speeds up in water', 'water is a mirror'], 'Like a cart rolling at a slant from pavement into sand.'],
      ['Which surface reflects light most neatly?', 'a smooth mirror', ['a wool blanket', 'a rough brick', 'a paper towel'], 'Smooth, shiny surfaces reflect neatly.']
    ],
    tf: [
      ['Light comes out of our eyes so we can see.', false, 'Light comes into our eyes.'],
      ['Light slows down a little in water and glass.', true, 'That is why it bends.'],
      ['A mirror sends light off at the same angle it came in.', true, 'Angle in equals angle out.'],
      ['A coin hidden by the rim of a cup can appear when water is poured in.', true, 'The water bends the light from the coin toward your eye.'],
      ['A periscope uses mirrors to reflect light.', true, 'Two mirrors pass light down the tube.'],
      ['Lenses bounce light like mirrors.', false, 'Lenses bend light.']
    ],
    sort: [['Is this reflection (bouncing) or refraction (bending)? {x}', [['You see your face in a mirror.', 'reflection'], ['A periscope lets you see over a wall.', 'reflection'], ['You see the trees upside down in a still lake.', 'reflection'], ['A spoon looks bent in a glass of water.', 'refraction'], ['A magnifying glass makes letters look big.', 'refraction'], ['Eyeglasses help someone read.', 'refraction'], ['A coin in a cup appears when water is poured in.', 'refraction']], ['reflection', 'refraction'], 'Mirrors and still water reflect; water, glass and lenses refract.']],
    c1: function (R) {
      var a = R.int(2, 16) * 5;
      if (R.coin()) return { q: 'A ray of light bounces off a flat mirror at ' + a + '° from the line straight out from the mirror. At what angle from that line did it hit the mirror?', a: num(a, '°'), steps: ['Angle in equals angle out.', 'So it hit at ' + a + '°.'] };
      return { q: 'A ray of light hits a flat mirror at ' + a + '° from the dashed line (the line straight out from the mirror). At what angle from that line does it bounce off?', a: num(a, '°'), steps: ['A mirror sends light off at the same angle it came in.', 'So it leaves at ' + a + '°.'], viz: pic('sciexp-light', { mode: 'mirror', angle: a }) };
    }
  });

  var RAIN = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  T('sciexp.colors', {
    hint: 'White light is a mix of all the colors (ROY G BIV). Things look a color because they reflect that color and soak up the rest.',
    fact: [
      ['What is white light?', 'a mix of all the colors', ['one color only', 'no color at all', 'a mix of black and yellow'], 'A prism spreads it into a rainbow.'],
      ['Who showed with prisms that sunlight holds all the colors?', 'Isaac Newton', ['Galileo', 'Hans Christian Ørsted', 'Archimedes'], 'Newton did it in 1666 with a beam through his window shutter.'],
      ['Why does a red apple look red?', 'it reflects red light and soaks up the other colors', ['it makes red light', 'it soaks up red light', 'it reflects all colors'], 'Its color is the light it reflects.'],
      ['Why do black clothes get hot in the sun?', 'they soak up nearly all the light', ['they reflect all the light', 'black is a warm color', 'they are always thicker'], 'Absorbed light turns into heat.'],
      ['Where must the Sun be for you to see a rainbow?', 'behind you', ['in front of you', 'straight above', 'it must be night'], 'Rain in front, Sun behind.'],
      ['Which color bends the most in a prism?', 'violet', ['red', 'yellow', 'green'], 'Violet bends most, red least.'],
      ['In a room lit only by red light, what color does white paper look?', 'red', ['white', 'blue', 'green'], 'White reflects whatever light hits it.']
    ],
    tf: [
      ['A prism adds colors to light.', false, 'The colors were in the white light already.'],
      ['Each raindrop acts like a tiny prism.', true, 'That makes a rainbow.'],
      ['A white shirt reflects all colors.', true, 'That is why it looks white.'],
      ['A second prism can mix the colors back into white light.', true, 'Newton showed this.']
    ],
    order: [['The colors of the rainbow, starting from red.', RAIN, 'ROY G BIV: red, orange, yellow, green, blue, indigo, violet.']],
    c1: function (R, ctx) {
      var i = R.int(0, 5), right = RAIN[i + 1];
      return { q: 'In a rainbow, which color comes right after <b>' + RAIN[i] + '</b> (going from red to violet)?', a: mcOf(right, R.sample(RAIN.filter(function (c) { return c !== right; }), nWrong(ctx))), steps: ['ROY G BIV: ' + RAIN.join(', ') + '.', 'After ' + RAIN[i] + ' comes ' + right + '.'] };
    },
    c2: function (R, ctx) {
      var obj = R.pick([['a ripe banana', 'yellow'], ['a leaf', 'green'], ['a ripe tomato', 'red'], ['a blueberry', 'blue'], ['an orange', 'orange']]);
      return { q: 'Which color of light does ' + obj[0] + ' mostly reflect?', a: mcOf(obj[1], R.sample(['red', 'yellow', 'green', 'blue', 'orange', 'violet'].filter(function (c) { return c !== obj[1]; }), nWrong(ctx))), steps: ['We see the color a thing reflects.', cap(obj[0]) + ' looks ' + obj[1] + ', so it reflects ' + obj[1] + ' light and soaks up most of the rest.'] };
    }
  });

  T('sciexp.sound', {
    hint: 'Sound is vibration. Fast vibrations make high pitch; slow ones make low pitch. Bigger vibrations are louder. Sound needs matter to travel through.',
    fact: [
      ['What makes sound?', 'something vibrating', ['light hitting a wall', 'something staying still', 'magnets'], 'Hum and feel your throat buzz.'],
      ['A tuba and a flute play. Which usually plays higher notes?', 'the flute', ['the tuba', 'they play the same notes', 'neither makes sound'], 'Small instruments vibrate faster.'],
      ['Why is there no sound in space?', 'there is no air to carry it', ['it is too cold', 'it is too dark', 'the Sun is too loud'], 'Astronauts talk by radio.'],
      ['Which makes a higher pitch on a guitar?', 'a shorter, tighter string', ['a longer, looser string', 'a thicker string', 'plucking harder'], 'Short, tight strings vibrate faster.'],
      ['Plucking a string harder makes the sound…', 'louder', ['higher', 'lower', 'quieter'], 'Bigger vibrations are louder.'],
      ['Sound travels fastest through…', 'a solid, like a table', ['air', 'empty space', 'smoke'], 'Put your ear on a table while someone taps the far end.']
    ],
    tf: [
      ['A lion\'s roar is loud and low.', true, 'Loudness and pitch are different.'],
      ['High pitch means loud.', false, 'A mouse squeak is high and soft.'],
      ['Sound can travel through water.', true, 'Whales hear each other far away.'],
      ['Slow vibrations make a low pitch.', true, 'Big drums vibrate slowly.'],
      ['Astronauts in space can hear each other shout without radios.', false, 'There is no air in space to carry sound.'],
      ['A glass with less water rings higher when you tap it.', true, 'Less water lets the glass vibrate faster.']
    ],
    c3: function (R, ctx) {
      var l1 = R.int(1, 5), l2 = R.intNot(1, 5, l1), p = R.int(2, 4);
      return { q: 'Waves A and B have the same pitch. Which sound is louder?', a: { t: 'mc', choices: ['A', 'B', 'they are the same'], v: l1 > l2 ? 0 : 1, keep: true }, steps: ['Louder sounds have bigger vibrations: taller waves.', (l1 > l2 ? 'A' : 'B') + ' has the taller waves.'], viz: pic('sciexp-sound', { compare: [[p, l1], [p, l2]] }) };
    },
    sort: [['Does this make the pitch higher or lower: {x}?', [['a shorter string', 'higher'], ['a tighter string', 'higher'], ['a smaller drum', 'higher'], ['a thinner rubber band', 'higher'], ['a longer string', 'lower'], ['a looser string', 'lower'], ['a bigger drum', 'lower'], ['a thicker rubber band', 'lower']], ['higher', 'lower'], 'Short, tight, small and thin vibrate faster: higher pitch.']],
    c1: function (R, ctx) {
      var p1 = R.int(1, 5), p2 = R.intNot(1, 5, p1), l = R.int(2, 4);
      return { q: 'Waves A and B are drawn the same height. Which sound has the higher pitch?', a: { t: 'mc', choices: ['A', 'B', 'they are the same'], v: p1 > p2 ? 0 : 1, keep: true }, steps: ['Higher pitch means faster vibration: the waves are closer together.', (p1 > p2 ? 'A' : 'B') + ' has the closer waves.'], viz: pic('sciexp-sound', { compare: [[p1, l], [p2, l]] }) };
    },
    c2: function (R) {
      var s = R.int(1, 10) * 3;
      if (R.coin()) { var sm = R.int(1, 6) * 5; return { q: 'Sound travels about 1 mile in 5 seconds. You see lightning and count ' + sm + ' seconds until the thunder. About how many miles away is the storm?', a: num(sm / 5, 'miles'), steps: [sm + ' ÷ 5 = ' + (sm / 5) + ' miles.'] }; }
      if (R.coin()) { var t = R.int(2, 9); return { q: 'Sound travels about 340 meters each second in air. About how far does it go in ' + t + ' seconds?', a: num(340 * t, 'm'), steps: ['340 × ' + t + ' = ' + (340 * t).toLocaleString('en-US') + ' meters.'] }; }
      return { q: 'Sound travels about 1 kilometer in 3 seconds. You see lightning and count ' + s + ' seconds until the thunder. About how far away is the storm?', a: num(s / 3, 'km'), steps: ['Light arrives almost at once; the sound takes 3 seconds for each kilometer.', s + ' ÷ 3 = ' + (s / 3) + ' km.'] };
    }
  });

  // ================================================================ Unit 7: Earth and Weather
  var WSTEPS = [['evaporation', 'the Sun warms water and it rises as invisible vapor'], ['condensation', 'vapor cools into tiny drops that make clouds'], ['precipitation', 'drops grow heavy and fall as rain, snow, sleet or hail'], ['collection', 'water gathers in oceans, lakes, rivers and under the ground']];
  T('sciexp.water-cycle', {
    hint: 'Evaporation, condensation, precipitation, collection, and around again. The Sun powers the water cycle.',
    fact: [
      ['Drops form on the outside of a glass of ice water. Which step is that?', 'condensation', ['evaporation', 'precipitation', 'collection'], 'Vapor in the air cooled into drops.'],
      ['A puddle dries up on a sunny day. Which step is that?', 'evaporation', ['condensation', 'precipitation', 'collection'], 'The water turned into vapor.'],
      ['What are clouds made of?', 'tiny drops of water or bits of ice', ['water vapor', 'smoke', 'cotton'], 'They are so small they float.'],
      ['What powers the water cycle?', 'the Sun', ['the Moon', 'the wind alone', 'volcanoes'], 'The Sun\'s heat evaporates the water.'],
      ['About how much of Earth\'s water is salty ocean water?', 'about 97 out of every 100 drops', ['about half', 'about 10 out of every 100', 'all of it'], 'Only a little is fresh water.'],
      ['Why is rain fresh even though much of it came from the salty sea?', 'the salt stays behind when water evaporates', ['clouds filter it', 'the wind takes the salt', 'rain is made in rivers'], 'Only the water rises as vapor.']
    ],
    tf: [
      ['Clouds are made of water vapor.', false, 'Clouds are tiny liquid drops or ice; vapor is invisible.'],
      ['Plants add water vapor to the air through tiny holes in their leaves.', true, 'That is part of the cycle too.'],
      ['Snow and hail are kinds of precipitation.', true, 'So are rain and sleet.'],
      ['The water in your glass may once have been in a cloud.', true, 'Water goes round and round.']
    ],
    order: [['The water cycle.', ['evaporation', 'condensation', 'precipitation', 'collection'], 'Then it starts again.']],
    c1: function (R, ctx) {
      var i = R.int(0, 3), st = WSTEPS[i];
      return { q: 'Which step of the water cycle is marked "?"', a: mcOf(st[0], R.sample(WSTEPS.filter(function (s) { return s !== st; }).map(function (s) { return s[0]; }), nWrong(ctx))), steps: [cap(st[0]) + ': ' + st[1] + '.'], viz: pic('sciexp-cycle', { kind: 'water', ask: st[0] }) };
    },
    c2: function (R, ctx) {
      var st = R.pick(WSTEPS);
      return { q: 'Which step is this: ' + st[1] + '?', a: mcOf(st[0], R.sample(WSTEPS.filter(function (s) { return s !== st; }).map(function (s) { return s[0]; }), nWrong(ctx))), steps: [cap(st[0]) + '.'] };
    }
  });

  var WTOOLS = [['temperature', 'a thermometer'], ['how much rain fell', 'a rain gauge'], ['which way the wind blows from', 'a wind vane'], ['how fast the wind blows', 'an anemometer'], ['air pressure', 'a barometer']];
  T('sciexp.weather', {
    hint: 'Weather is what the air is like now; climate is the usual weather over many years. A wind vane points to where the wind comes from.',
    fact: [
      ['"It snowed in our town last Tuesday." Weather or climate?', 'weather', ['climate', 'both', 'neither'], 'It tells about one day.'],
      ['"Our town has cold, snowy winters most years." Weather or climate?', 'climate', ['weather', 'both', 'neither'], 'Climate is the usual weather over many years.'],
      ['A "north wind" blows…', 'from the north toward the south', ['from the south toward the north', 'only at the North Pole', 'straight up'], 'Winds are named for where they come from.'],
      ['Tall, dark cumulonimbus clouds often mean…', 'thunderstorms', ['fair weather', 'a sunny week', 'no wind'], 'They are storm clouds.'],
      ['Puffy white cumulus clouds usually mean…', 'fair weather', ['a thunderstorm now', 'snow', 'a hurricane'], 'Small puffy clouds come with fair days.'],
      ['Where should a rain gauge go?', 'out in the open, away from trees', ['under a tree', 'inside the house', 'under the roof edge'], 'Trees and roofs would block or add water.']
    ],
    tf: [
      ['A desert has a dry climate even if it rains one day.', true, 'Climate is the usual weather.'],
      ['A wind vane points to where the wind is going.', false, 'It points to where the wind comes from.'],
      ['Weather is what the air is like at a place right now.', true, 'Hot or cold, windy or still, sunny or rainy.'],
      ['Climate and weather mean the same thing.', false, 'Weather is now; climate is over many years.']
    ],
    sort: [['Which tool measures {x}?', WTOOLS, WTOOLS.map(function (w) { return w[1]; }), 'Each weather tool measures one thing.']],
    c1: function (R, ctx) {
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], vals = R.ints(5, 0, 12, true), most = R.coin(), idx = vals.indexOf(most ? M.max.apply(null, vals) : M.min.apply(null, vals));
      return { q: 'A rain gauge was read each day (millimeters of rain). Which day had the <b>' + (most ? 'most' : 'least') + '</b> rain?', a: mcOf(days[idx], R.sample(days.filter(function (d, i) { return i !== idx; }), nWrong(ctx))), steps: [days.map(function (d, i) { return d + ' ' + vals[i]; }).join(', ') + '.', days[idx] + ' had ' + vals[idx] + ' mm.'], viz: still('sciexp-bars', { title: 'Rain each day', unit: 'mm', bars: days.map(function (d, i) { return [d, vals[i]]; }) }) };
    },
    c2: function (R) {
      var v = R.ints(4, 2, 14, false), tot = v.reduce(function (a, b) { return a + b; }, 0);
      return { q: 'A rain gauge caught ' + v.join(' mm, ') + ' mm on four rainy days. How much rain fell in all?', a: num(tot, 'mm'), steps: ['Add them: ' + v.join(' + ') + ' = ' + tot + ' mm.'] };
    },
    c3: function (R) {
      var hi = R.int(15, 30), lo = hi - R.int(5, 15);
      return { q: 'The high today was ' + hi + ' °C and the low was ' + lo + ' °C. How many degrees warmer was the high?', a: num(hi - lo, '°C'), steps: [hi + ' − ' + lo + ' = ' + (hi - lo) + ' degrees.'], viz: pic('sciexp-measure', { tool: 'thermo', value: hi }) };
    }
  });

  var ROCKS = [['granite', 'igneous'], ['basalt', 'igneous'], ['obsidian', 'igneous'], ['pumice', 'igneous'], ['sandstone', 'sedimentary'], ['limestone', 'sedimentary'], ['shale', 'sedimentary'], ['marble', 'metamorphic'], ['slate', 'metamorphic']];
  var RHOW = { igneous: 'melted rock cools and hardens', sedimentary: 'layers of sand, mud or shells are pressed and cemented together', metamorphic: 'heat and pressure change a rock without melting it' };
  T('sciexp.rocks-minerals', {
    hint: 'Igneous rock forms from melted rock; sedimentary from pressed layers; metamorphic from heat and pressure. Rocks are made of minerals.',
    fact: [
      ['A rock has layers like pancakes and a fossil shell in it. Which kind is it most likely?', 'sedimentary', ['igneous', 'metamorphic', 'a mineral'], 'Layers and fossils come from sediments.'],
      ['What are rocks made of?', 'one or more minerals', ['only sand', 'wood', 'water'], 'Quartz, mica and salt are minerals.'],
      ['Lava from a volcano cools and hardens. What kind of rock does it make?', 'igneous', ['sedimentary', 'metamorphic', 'a fossil'], 'Igneous means formed from melted rock.'],
      ['Marble forms when limestone is changed by heat and pressure. Marble is…', 'metamorphic', ['igneous', 'sedimentary', 'a liquid'], 'Metamorphic means changed.'],
      ['Where are fossils mostly found?', 'in sedimentary rock', ['in igneous rock', 'in lava', 'inside minerals'], 'Living things were buried in soft layers.'],
      ['Quartz is harder than steel. What happens if you scratch quartz with a steel nail?', 'the quartz is not scratched', ['the quartz breaks', 'the quartz melts', 'it makes a deep groove'], 'A harder mineral scratches a softer one.']
    ],
    tf: [
      ['Rocks never change.', false, 'They change slowly, over millions of years.'],
      ['Any kind of rock can become any other kind over a very long time.', true, 'That is the rock cycle.'],
      ['Salt is a mineral.', true, 'It is a natural solid with its own pattern of particles.'],
      ['Metamorphic rock forms when rock melts.', false, 'Melted rock makes igneous rock; metamorphic rock is changed without melting.'],
      ['Pumice is an igneous rock full of tiny air holes.', true, 'It formed from frothy lava.'],
      ['Sandstone is made of sand grains cemented together.', true, 'It is a sedimentary rock.']
    ],
    pick: [['Which of these is a sedimentary rock?', ['sandstone', 'limestone', 'shale'], ['granite', 'basalt', 'marble', 'slate', 'obsidian'], 'Sedimentary rocks form from pressed layers.'],
      ['Which of these is an igneous rock?', ['granite', 'basalt', 'obsidian', 'pumice'], ['sandstone', 'limestone', 'marble', 'slate', 'shale'], 'Igneous rocks form from melted rock.'],
      ['Which of these is a metamorphic rock?', ['marble', 'slate'], ['granite', 'basalt', 'sandstone', 'limestone', 'shale', 'pumice'], 'Metamorphic rocks are changed by heat and pressure.']],
    c2: function (R, ctx) {
      var r = R.pick(ROCKS), k = r[1];
      return { q: cap(r[0]) + ' is ' + (k === 'igneous' ? 'an ' : 'a ') + k + ' rock. How did it form?', a: mcOf(RHOW[k], ['igneous', 'sedimentary', 'metamorphic'].filter(function (x) { return x !== k; }).map(function (x) { return RHOW[x]; }).concat(['it fell from space']).slice(0, nWrong(ctx))), steps: [cap(k) + ' rock: ' + RHOW[k] + '.'] };
    },
    sort: [['What kind of rock is {x}?', ROCKS, ['igneous', 'sedimentary', 'metamorphic'], 'Granite, basalt, obsidian and pumice are igneous; sandstone, limestone and shale sedimentary; marble and slate metamorphic.']],
    c1: function (R, ctx) {
      var k = R.pick(['igneous', 'sedimentary', 'metamorphic']);
      return { q: 'Which kind of rock forms when ' + RHOW[k] + '?', a: mcOf(k, ['igneous', 'sedimentary', 'metamorphic'].filter(function (x) { return x !== k; })), steps: [cap(k) + ' rock: ' + RHOW[k] + '.'], viz: pic('sciexp-cycle', { kind: 'rock', ask: k }) };
    }
  });

  T('sciexp.weathering-erosion', {
    hint: 'Weathering breaks rock; erosion carries the pieces away; deposition drops them somewhere else.',
    fact: [
      ['Rain washes soil off a bare hill into a stream. Weathering or erosion?', 'erosion', ['weathering', 'deposition', 'melting'], 'The soil is being carried away.'],
      ['Water freezes in a crack, expands and splits the rock. What is that?', 'weathering', ['erosion', 'deposition', 'condensation'], 'The rock is being broken.'],
      ['A river drops sand where it meets the sea and builds new land. What is that?', 'deposition', ['weathering', 'erosion', 'evaporation'], 'That builds a delta.'],
      ['What dug most of the Grand Canyon?', 'a river, over millions of years', ['an earthquake in one day', 'people with machines', 'a glacier last year'], 'The Colorado River carved it a grain at a time.'],
      ['How do plant roots weather rock?', 'they grow into cracks and pry them open', ['they melt it', 'they freeze it', 'they eat it'], 'Growing roots push cracks wider.']
    ],
    tf: [
      ['Weathering and erosion are the same thing.', false, 'Weathering breaks; erosion moves.'],
      ['Wind can carry sand that scrapes rock.', true, 'Wind weathers and erodes.'],
      ['Plants on a hillside can slow erosion.', true, 'Roots hold the soil.'],
      ['Gravity can pull rocks downhill in landslides.', true, 'Gravity is a cause of erosion.']
    ],
    sort: [['Is this weathering, erosion or deposition? {x}', [['Ice splits a boulder in two.', 'weathering'], ['Roots crack a sidewalk.', 'weathering'], ['Rain slowly wears down a stone statue.', 'weathering'], ['A river carries pebbles downstream.', 'erosion'], ['Wind blows sand off a beach.', 'erosion'], ['A landslide moves soil downhill.', 'erosion'], ['A river drops mud at its mouth.', 'deposition'], ['Sand piles up into a dune.', 'deposition'], ['A glacier melts and leaves rocks behind.', 'deposition']], ['weathering', 'erosion', 'deposition'], 'Weathering breaks, erosion moves, deposition drops.']],
    order: [['How a mountain becomes a sandy beach.', ['rock is weathered into pieces', 'a river erodes the pieces and carries them', 'the river deposits sand where it slows down'], 'Break, move, drop.']]
  });

  // ================================================================ Unit 8: Living Things and the Body
  var PARTS = [['roots', 'hold the plant and take in water and minerals'], ['stem', 'holds the plant up and carries water and food'], ['leaves', 'make food from sunlight, water and air'], ['flower', 'makes seeds']];
  T('sciexp.plants-make-food', {
    hint: 'Plants make food (sugar) in their leaves from sunlight, water and carbon dioxide, and give off oxygen: photosynthesis.',
    fact: [
      ['Where does a plant make its food?', 'in its leaves', ['in the soil', 'in its roots', 'in its flowers'], 'Leaves use sunlight to make sugar.'],
      ['Which gas does a plant take in from the air to make food?', 'carbon dioxide', ['oxygen', 'helium', 'steam'], 'It gives off oxygen.'],
      ['Which gas does a plant give off while it makes food?', 'oxygen', ['carbon dioxide', 'smoke', 'helium'], 'The bubbles on a water plant in the sun are oxygen.'],
      ['What is the process of plants making food called?', 'photosynthesis', ['evaporation', 'digestion', 'condensation'], 'Photo means light; synthesis means putting together.'],
      ['Most of a tree\'s wood is built from…', 'carbon dioxide from the air and water', ['soil', 'sunlight only', 'rocks'], 'The soil loses almost nothing as a tree grows.'],
      ['A plant is kept in a dark closet for two weeks. What happens?', 'it turns pale and weak', ['it grows faster', 'nothing changes', 'it turns bright green'], 'Without light, it cannot make food.']
    ],
    tf: [
      ['Plants get their food from the soil.', false, 'Soil gives water and minerals; the food is made in the leaves.'],
      ['Plants need sunlight to make food.', true, 'Light gives the energy.'],
      ['Plants give off oxygen.', true, 'That is the oxygen we breathe.'],
      ['Roots make the plant\'s food.', false, 'Roots take in water and minerals.']
    ],
    sort: [['Which part of a plant does this job: {x}?', PARTS.map(function (p) { return [p[1], p[0]]; }), PARTS.map(function (p) { return p[0]; }), 'Roots take in water, the stem carries it, leaves make food, flowers make seeds.']],
    c1: function (R, ctx) {
      var p = R.pick(PARTS);
      return { q: 'Which part of the plant is marked "?"', a: mcOf(p[0], PARTS.filter(function (x) { return x !== p; }).map(function (x) { return x[0]; })), steps: ['The ' + p[0] + ' ' + p[1] + '.'], viz: pic('sciexp-plant', { ask: p[0] === 'leaves' ? 'leaves' : p[0], arrows: false }) };
    },
    c2: function (R, ctx) {
      var ins = ['sunlight', 'water', 'carbon dioxide'], outs = ['sugar (food)', 'oxygen'], isIn = R.coin(), right = R.pick(isIn ? ins : outs);
      return { q: 'Which of these <b>' + (isIn ? 'goes into' : 'comes out of') + '</b> a leaf making food?', a: mcOf(right, R.sample((isIn ? outs : ins).concat(['soil']), nWrong(ctx))), steps: ['In: sunlight, water, carbon dioxide.', 'Out: sugar (food) and oxygen.'] };
    }
  });

  var CHAINS = [['grass', 'rabbit', 'fox'], ['seeds', 'mouse', 'owl'], ['grass', 'grasshopper', 'frog', 'snake', 'hawk'], ['algae', 'tadpole', 'fish', 'heron'], ['acorn', 'squirrel', 'owl'], ['leaves', 'caterpillar', 'bird'], ['plankton', 'shrimp', 'fish', 'seal'], ['berries', 'mouse', 'snake', 'hawk'], ['grass', 'deer', 'wolf'], ['algae', 'snail', 'fish', 'heron']];
  var EATERS = [['a rabbit', 'herbivore'], ['a deer', 'herbivore'], ['a caterpillar', 'herbivore'], ['a grasshopper', 'herbivore'], ['a squirrel eating acorns', 'herbivore'], ['a fox', 'carnivore'], ['a hawk', 'carnivore'], ['an owl', 'carnivore'], ['a snake', 'carnivore'], ['a wolf', 'carnivore'], ['a bear eating berries and fish', 'omnivore'], ['a person eating salad and chicken', 'omnivore'], ['grass', 'producer'], ['an oak tree', 'producer'], ['algae', 'producer'], ['a mushroom', 'decomposer'], ['bacteria in the soil', 'decomposer']];
  var ONAME = { grass: 'grass', rabbit: 'rabbit', fox: 'fox', seeds: 'seeds', mouse: 'mouse', owl: 'owl', grasshopper: 'grasshopper', frog: 'frog', snake: 'snake', hawk: 'hawk', algae: 'algae', tadpole: 'tadpole', fish: 'fish', heron: 'heron', acorn: 'acorns', squirrel: 'squirrel', leaves: 'leaves', caterpillar: 'caterpillar', bird: 'bird', plankton: 'plankton', shrimp: 'shrimp', seal: 'seal', berries: 'berries', deer: 'deer', wolf: 'wolf', snail: 'snail' };
  T('sciexp.food-webs', {
    hint: 'Arrows point from the food to the eater. Producers make food from sunlight; consumers eat; decomposers break down dead things.',
    fact: [
      ['What do the arrows in a food chain show?', 'which way the energy goes: from the food to the eater', ['who is bigger', 'which way the animal walks', 'who eats first'], '"Grass → rabbit" means the rabbit eats the grass.'],
      ['Where does the energy in a food chain come from in the end?', 'the Sun', ['the soil', 'water', 'the biggest animal'], 'Plants capture sunlight; animals eat the plants.'],
      ['What do decomposers do?', 'break down dead plants and animals and return minerals to the soil', ['make food from sunlight', 'hunt other animals', 'eat only seeds'], 'Mushrooms and bacteria are decomposers.'],
      ['If all the rabbits disappeared from a meadow, what might happen to the foxes?', 'they would have less to eat', ['nothing at all', 'they would eat grass', 'there would be more foxes'], 'A change in one part of a web changes the others.'],
      ['What is a food web?', 'many food chains joined together', ['a spider\'s web', 'one long chain', 'a list of plants'], 'Most animals eat more than one thing.']
    ],
    tf: [
      ['Every food chain starts with a producer such as a plant.', true, 'Producers capture the Sun\'s energy.'],
      ['In "grass → rabbit", the grass eats the rabbit.', false, 'The arrow points to the eater: the rabbit eats the grass.'],
      ['An omnivore eats both plants and animals.', true, 'Bears and people are omnivores.'],
      ['Herbivores eat other animals.', false, 'Herbivores eat plants.']
    ],
    sort: [['What is {x} in a food web?', EATERS, ['producer', 'herbivore', 'carnivore', 'omnivore', 'decomposer'], 'Producers make food; herbivores eat plants; carnivores eat animals; omnivores eat both; decomposers break down dead things.']],
    c1: function (R, ctx) {
      var ch = R.pick(CHAINS), i = R.int(1, ch.length - 1), eater = ONAME[ch[i]], food = ONAME[ch[i - 1]];
      var pool = ch.filter(function (k, j) { return j !== i - 1 && j !== i; }).map(function (k) { return ONAME[k]; }).concat(['the Sun']); if (pool.length < 3) pool = pool.concat(R.sample(['seeds', 'leaves', 'berries'].filter(function (x) { return x !== food; }), 2)); var wr = R.sample(uniq(pool), nWrong(ctx));
      return { q: 'In this food chain, what does the <b>' + eater + '</b> eat?', a: mcOf(food, wr), steps: ['The arrow into the ' + eater + ' comes from the ' + food + '.', 'Arrows point from the food to the eater.'], viz: still('sciexp-chain', { items: ch }) };
    },
    c2: function (R, ctx) {
      var ch = R.pick(CHAINS), i = R.int(1, ch.length - 1);
      return { q: 'Which living thing is marked "?" in this food chain? (Arrows point from the food to the eater.)', a: mcOf(ONAME[ch[i]], R.sample(Object.keys(ONAME).filter(function (k) { return ch.indexOf(k) < 0; }).map(function (k) { return ONAME[k]; }), nWrong(ctx))), steps: ['It is the ' + ONAME[ch[i]] + ': ' + ch.map(function (k) { return ONAME[k]; }).join(' → ') + '.'], viz: still('sciexp-chain', { items: ch, ask: i }) };
    },
    c3: function (R, ctx) {
      var ch = R.pick(CHAINS.filter(function (c) { return c.length >= 3; }));
      return { q: 'Which is the <b>producer</b> in this chain: ' + ch.slice().reverse().map(function (k) { return ONAME[k]; }).join(', ') + ' (listed in no order)?', a: mcOf(ONAME[ch[0]], ch.slice(1).map(function (k) { return ONAME[k]; }).slice(0, nWrong(ctx))), steps: ['The producer makes food from sunlight: ' + ONAME[ch[0]] + '.', 'The chain: ' + ch.map(function (k) { return ONAME[k]; }).join(' → ') + '.'] };
    }
  });

  var ADAPT = [['webbed feet', 'a duck', 'paddling in water'], ['spines and a thick waxy stem', 'a cactus', 'saving water in the desert'], ['big eyes and silent feathers', 'an owl', 'hunting at night'], ['white winter fur', 'an arctic fox', 'hiding in the snow'], ['thick fur and a layer of fat', 'a polar bear', 'staying warm in the cold'], ['long eyelashes and a fatty hump', 'a camel', 'living in the dry, sandy desert'], ['a long sticky tongue and digging claws', 'an anteater', 'eating ants and termites'], ['a long neck', 'a giraffe', 'reaching leaves high in trees'], ['gills', 'a fish', 'breathing under water'], ['flying south in fall', 'geese', 'finding food in winter']];
  T('sciexp.adaptations', {
    hint: 'An adaptation is a body part or behavior that helps a living thing survive where it lives. Adaptations are passed down over many generations.',
    fact: [
      ['What is an adaptation?', 'a body part or behavior that helps a living thing survive where it lives', ['something an animal learns in one day', 'a kind of food', 'a change in the weather'], 'Webbed feet and migration are adaptations.'],
      ['Thick seed-cracking beaks help birds eat…', 'seeds', ['nectar deep in flowers', 'fish', 'leaves'], 'Thin beaks probe for insects and nectar.'],
      ['How do adaptations come about?', 'they are passed down from parents to young over many generations', ['an animal grows one because it wants it', 'by stretching every day', 'in one night'], 'A giraffe does not grow a longer neck by trying.'],
      ['Which is a behavior adaptation?', 'bears hibernating in winter', ['a duck\'s webbed feet', 'a cactus\'s spines', 'an owl\'s big eyes'], 'Hibernating and migrating are behaviors.'],
      ['Colors that help an animal hide are called…', 'camouflage', ['mimicry', 'migration', 'hibernation'], 'Mimicry is looking like something dangerous.']
    ],
    tf: [
      ['An animal grows an adaptation because it needs it right now.', false, 'Adaptations are passed down over many generations.'],
      ['Migration is an adaptation.', true, 'It is a behavior that helps animals survive.'],
      ['A cactus\'s waxy stem helps it save water.', true, 'Wax keeps water in.'],
      ['Possums playing dead is a behavior adaptation.', true, 'It can fool a predator.']
    ],
    c1: function (R, ctx) {
      var a = R.pick(ADAPT), others = R.sample(ADAPT.filter(function (x) { return x !== a; }), nWrong(ctx));
      return { q: 'Which living thing has ' + a[0] + ' that help' + (/s$/.test(a[0]) || / and /.test(a[0]) ? '' : 's') + ' it with ' + a[2] + '?', a: mcOf(a[1], others.map(function (x) { return x[1]; })), steps: [cap(a[1]) + ': ' + a[0] + ' for ' + a[2] + '.'] };
    },
    c2: function (R, ctx) {
      var a = R.pick(ADAPT), others = R.sample(ADAPT.filter(function (x) { return x !== a; }), nWrong(ctx));
      return { q: 'How do ' + a[0] + ' help ' + a[1] + '?', a: mcOf(a[2], others.map(function (x) { return x[2]; })), steps: [cap(a[0]) + ' help ' + a[1] + ' with ' + a[2] + '.'] };
    }
  });

  var ORGS = [['the heart', 'circulatory'], ['blood vessels', 'circulatory'], ['the lungs', 'respiratory'], ['the windpipe', 'respiratory'], ['the stomach', 'digestive'], ['the intestines', 'digestive'], ['the brain', 'nervous'], ['the nerves', 'nervous'], ['the spinal cord', 'nervous'], ['the bones', 'skeletal'], ['the skull', 'skeletal'], ['the muscles', 'muscular']];
  var SYSJOB = { circulatory: 'carries oxygen and food all around the body', respiratory: 'takes in oxygen and breathes out carbon dioxide', digestive: 'breaks food into pieces the body can use', nervous: 'senses, thinks and sends messages', skeletal: 'holds you up and protects your organs', muscular: 'moves the bones and pumps the heart' };
  T('sciexp.human-body', {
    hint: 'Body systems are teams of parts: skeletal, muscular, circulatory, respiratory, digestive and nervous. They work together.',
    fact: [
      ['Which system carries oxygen from your lungs to your toes?', 'circulatory', ['digestive', 'skeletal', 'respiratory'], 'The heart pumps blood through blood vessels.'],
      ['When you run, why do you breathe faster?', 'your muscles need more oxygen', ['your bones get heavier', 'your stomach is empty', 'the air is thinner'], 'Breathing and heartbeat speed up together.'],
      ['Muscles can only…', 'pull', ['push', 'push and pull equally', 'stay still'], 'That is why they work in pairs.'],
      ['About how big is your heart?', 'about the size of your fist', ['about the size of your head', 'about the size of a pea', 'as big as your chest'], 'It sits near the middle of the chest, tipped a little to the left.'],
      ['How many bones does an adult have?', '206', ['26', '600', '1,000'], 'A baby has more, which join as it grows.'],
      ['Which system controls all the others?', 'the nervous system', ['the digestive system', 'the skeletal system', 'the muscular system'], 'The brain sends messages through nerves.']
    ],
    tf: [
      ['Body systems work alone, one at a time.', false, 'They all work at once, together.'],
      ['The heart is a muscle.', true, 'It pumps blood all your life.'],
      ['The skull protects the brain.', true, 'Protecting organs is a job of the skeleton.'],
      ['The heart sits far over on the left side of the chest.', false, 'It is near the middle, tipped a little to the left.']
    ],
    sort: [['Which body system is {x} part of?', ORGS, ['circulatory', 'respiratory', 'digestive', 'nervous', 'skeletal', 'muscular'], 'Each organ belongs to a team.']],
    c1: function (R, ctx) {
      var k = R.pick(Object.keys(SYSJOB));
      return { q: 'Which system ' + SYSJOB[k] + '?', a: mcOf('the ' + k + ' system', R.sample(Object.keys(SYSJOB).filter(function (x) { return x !== k; }), nWrong(ctx)).map(function (x) { return 'the ' + x + ' system'; })), steps: ['The ' + k + ' system ' + SYSJOB[k] + '.'] };
    },
    c2: function (R) {
      var b = R.int(17, 25), t = R.pick([15, 15, 10, 20, 30]), m = 60 / t;
      return { q: 'You count ' + b + ' heartbeats in ' + t + ' seconds. How many beats is that in one minute?', a: num(b * m, 'beats'), steps: ['One minute is 60 seconds: ' + t + ' × ' + m + ' = 60.', b + ' × ' + m + ' = ' + (b * m) + ' beats a minute.'] };
    },
    c3: function (R, ctx) {
      var org = R.pick(['brain', 'lungs', 'heart', 'stomach', 'intestines']);
      return { q: 'Which organ is marked "?" in the picture?', a: mcOf(org === 'lungs' || org === 'intestines' ? 'the ' + org : 'the ' + org, R.sample(['brain', 'lungs', 'heart', 'stomach', 'intestines'].filter(function (x) { return x !== org; }), nWrong(ctx)).map(function (x) { return 'the ' + x; })), steps: ['It is the ' + org + '.'], viz: pic('sciexp-body', { show: ['brain', 'lungs', 'heart', 'stomach', 'intestines'], ask: org }) };
    }
  });

  // ================================================================ Unit 9: Earth in Space
  T('sciexp.day-night', {
    hint: 'The Earth spins once about every 24 hours. The half facing the Sun has day. The Sun seems to rise in the east and set in the west.',
    fact: [
      ['Why do we have day and night?', 'the Earth spins, turning us toward and away from the Sun', ['the Sun goes around the Earth each day', 'the Moon covers the Sun at night', 'the Sun turns off'], 'The half facing the Sun has day.'],
      ['How long does the Earth take to spin once?', 'about 24 hours', ['about one year', 'about one month', 'about one hour'], 'One spin is one day.'],
      ['Where does the Sun seem to rise?', 'in the east', ['in the west', 'in the north', 'in the south'], 'Earth spins toward the east.'],
      ['When are shadows shortest?', 'near noon, when the Sun is high', ['early morning', 'late evening', 'at night'], 'A high Sun makes short shadows.'],
      ['Which way does a shadow point?', 'away from the Sun', ['toward the Sun', 'always north', 'straight up'], 'The object blocks the light coming from the Sun.']
    ],
    tf: [
      ['The Sun goes around the Earth once a day.', false, 'The Earth spins; the Sun only seems to move.'],
      ['Shadows are long in the morning and evening.', true, 'The Sun is low then.'],
      ['When it is day on one side of the Earth, it is night on the other.', true, 'Half faces the Sun, half faces away.'],
      ['Night comes when the Moon blocks the Sun.', false, 'Night is our side turned away from the Sun.'],
      ['The Sun seems to set in the west.', true, 'Earth spins toward the east.'],
      ['Earth spins once a year.', false, 'It spins once a day and goes around the Sun once a year.']
    ],
    pick: [['Which of these is caused by the Earth spinning?', ['day and night', 'the Sun seeming to cross the sky', 'shadows moving during the day', 'sunrise in the east'], ['the phases of the Moon', 'the planets going around the Sun', 'the seasons of the year'], 'One spin a day turns us toward and away from the Sun.']],
    c3: function (R, ctx) {
      var t = R.pick([['7 in the morning', 'long'], ['8 in the morning', 'long'], ['noon', 'short'], ['1 in the afternoon', 'short'], ['6 in the evening', 'long'], ['5 in the afternoon', 'long']]);
      return { q: 'On a sunny summer day, is a flagpole\'s shadow long or short at ' + t[0] + '?', a: mcOf(t[1], [t[1] === 'long' ? 'short' : 'long', 'there is no shadow'].slice(0, nWrong(ctx))), steps: [t[1] === 'long' ? 'The Sun is low then, so the shadow is long.' : 'The Sun is high near midday, so the shadow is short.'] };
    },
    sort: [['When is a stick\'s shadow like this: {x}?', [['long and pointing west', 'early morning'], ['long and pointing east', 'late afternoon'], ['short', 'near noon']], ['early morning', 'near noon', 'late afternoon'], 'In the morning the Sun is low in the east, so shadows are long and point west; in the late afternoon it is low in the west.']],
    c1: function (R) {
      var d = R.int(2, 60);
      return { q: 'How many times does the Earth spin in ' + d + ' days?', a: num(d, 'times'), steps: ['It spins once a day.', d + ' days, ' + d + ' spins.'] };
    },
    c2: function (R) {
      var d = R.int(2, 12);
      if (R.coin()) { var h = R.pick([6, 12, 18]); return { q: 'The Earth spins once in about 24 hours. About what part of a full turn does it make in ' + h + ' hours?', a: mcOf(h === 6 ? 'a quarter turn' : h === 12 ? 'a half turn' : 'three quarters of a turn', ['a quarter turn', 'a half turn', 'three quarters of a turn', 'a full turn'].filter(function (x) { return x !== (h === 6 ? 'a quarter turn' : h === 12 ? 'a half turn' : 'three quarters of a turn'); }).slice(0, 3)), steps: [h + ' out of 24 hours is ' + (h / 24 === 0.5 ? 'one half' : h === 6 ? 'one quarter' : 'three quarters') + '.'] }; }
      return { q: 'The Earth spins once in about 24 hours. About how many hours are in ' + d + ' days?', a: num(24 * d, 'hours'), steps: ['24 × ' + d + ' = ' + (24 * d) + ' hours.'] };
    }
  });

  var PH = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'last quarter', 'waning crescent'];
  T('sciexp.moon-phases', {
    hint: 'The Moon reflects sunlight. Half of it is always lit; as it goes around the Earth (about 29½ days) we see more or less of that half.',
    fact: [
      ['Where does moonlight come from?', 'sunlight reflecting off the Moon', ['the Moon glows by itself', 'the Earth\'s lights', 'stars behind the Moon'], 'The Moon makes no light of its own.'],
      ['About how long does the Moon take to go through all its phases?', 'about 29½ days', ['about 24 hours', 'about a week', 'about a year'], 'That is about a month.'],
      ['Tonight is a full moon. About a week later the Moon will be…', 'last quarter (half lit)', ['new', 'full again', 'first quarter'], 'After full, the Moon wanes.'],
      ['What does "waxing" mean?', 'growing: more lit each night', ['shrinking', 'staying the same', 'disappearing'], 'Waning means shrinking.'],
      ['What causes the phases?', 'seeing different amounts of the Moon\'s lit half as it goes around the Earth', ['the Earth\'s shadow on the Moon', 'clouds covering part of the Moon', 'the Moon changing shape'], 'The Earth\'s shadow falls on the Moon only in an eclipse.'],
      ['What does "gibbous" mean?', 'more than half lit', ['less than half lit', 'not lit at all', 'exactly half lit'], 'Gibbous comes just before and after full.']
    ],
    tf: [
      ['The Earth\'s shadow makes the phases of the Moon.', false, 'That happens only in a lunar eclipse.'],
      ['Half of the Moon is always lit by the Sun.', true, 'We see different amounts of that half.'],
      ['At new moon we can hardly see the Moon at all.', true, 'Its lit side faces away from us.'],
      ['The Moon changes its shape each night.', false, 'It stays round; the lit part we see changes.']
    ],
    order: [['The phases of the Moon, starting from new moon.', PH, 'Then new moon again.']],
    c1: function (R, ctx) {
      var i = R.pick([0, 2, 4, 6]), nm = PH[i];
      return { q: 'Which phase of the Moon is this?', a: mcOf(nm, R.sample(PH.filter(function (p) { return p !== nm; }), nWrong(ctx))), steps: ['It is the ' + nm + '.', i === 0 ? 'Almost nothing is lit.' : i === 4 ? 'The whole face is lit.' : i === 2 ? 'The right half is lit (seen from the Northern Hemisphere).' : 'The left half is lit (seen from the Northern Hemisphere).'], viz: pic('sciexp-sky', { mode: 'phases', one: i }) };
    },
    c2: function (R, ctx) {
      var i = R.int(0, 7), k = R.pick([1, 2, 4]), j = (i + k) % 8, w = k === 1 ? 'about 4 days' : k === 2 ? 'about a week' : 'about two weeks';
      return { q: 'Tonight the Moon is ' + PH[i] + '. What will it be in ' + w + '?', a: mcOf(PH[j], R.sample(PH.filter(function (p) { return p !== PH[j]; }), nWrong(ctx))), steps: ['The phases go: ' + PH.join(', ') + ', and around again.', 'Each step is about 3½–4 days, so ' + w + ' is ' + k + ' step' + (k > 1 ? 's' : '') + ': ' + PH[j] + '.'] };
    },
    c3: function (R) {
      var d = R.int(2, 25);
      return { q: 'It was full moon ' + d + ' days ago. About how many more days until the next full moon? (One cycle is about 29½ days; use 30.)', a: num(30 - d, 'days'), steps: ['30 − ' + d + ' = ' + (30 - d) + ' days.'] };
    }
  });

  var PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  var PFACT = [['closest to the Sun, with a year of only 88 days', 'Mercury'], ['the hottest planet, with thick clouds', 'Venus'], ['the only planet known to have life', 'Earth'], ['the red planet, with a giant volcano', 'Mars'], ['the biggest planet, with a Great Red Spot', 'Jupiter'], ['the planet with bright, wide rings of ice and rock', 'Saturn'], ['the planet that spins tipped on its side', 'Uranus'], ['the farthest planet, and the windiest', 'Neptune']];
  T('sciexp.solar-system', {
    hint: 'My Very Eager Mother Just Served Us Noodles: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
    fact: [
      ['What is the Sun?', 'a star', ['a planet', 'a moon', 'a comet'], 'It is an ordinary star, the closest one to us.'],
      ['Why does the Sun look so much bigger and brighter than other stars?', 'it is much closer', ['it is the biggest star there is', 'it is the only hot star', 'other stars are not real'], 'Light from the next nearest star takes over 4 years to reach us.'],
      ['About how long does sunlight take to reach the Earth?', 'about 8 minutes', ['about 8 seconds', 'about 8 days', 'about 4 years'], 'The Sun is about 150 million kilometers away.'],
      ['What keeps the planets going around the Sun?', 'gravity', ['friction', 'magnetism', 'wind'], 'The Sun\'s gravity holds them.'],
      ['The four inner planets are…', 'small and rocky', ['giants of gas and ice', 'made of ice only', 'stars'], 'Mercury, Venus, Earth and Mars.'],
      ['What is Pluto called today?', 'a dwarf planet', ['the ninth planet', 'a star', 'a comet'], 'It is small and far out, beyond Neptune.']
    ],
    tf: [
      ['The Sun is a star.', true, 'The closest star to us.'],
      ['Jupiter is the smallest planet.', false, 'Jupiter is the biggest.'],
      ['The outer four planets are giants made mostly of gas or ice.', true, 'Jupiter, Saturn, Uranus and Neptune.'],
      ['Earth is the third planet from the Sun.', true, 'Mercury, Venus, Earth.']
    ],
    order: [['The planets, going out from the Sun.', PLANETS, 'My Very Eager Mother Just Served Us Noodles.']],
    c1: function (R, ctx) {
      var i = R.int(0, 7);
      return { q: 'Which planet is number ' + (i + 1) + ' from the Sun (marked "?")?', a: mcOf(PLANETS[i], R.sample(PLANETS.filter(function (p, j) { return j !== i; }), nWrong(ctx))), steps: ['Count out from the Sun: ' + PLANETS.slice(0, i + 1).join(', ') + '.'], viz: pic('sciexp-sky', { mode: 'planets', ask: i }) };
    },
    c2: function (R, ctx) {
      var f = R.pick(PFACT);
      return { q: 'Which planet is ' + f[0] + '?', a: mcOf(f[1], R.sample(PLANETS.filter(function (p) { return p !== f[1]; }), nWrong(ctx))), steps: [f[1] + ' is ' + f[0] + '.'] };
    },
    c3: function (R, ctx) {
      var i = R.int(0, 6), j = R.int(i + 1, 7);
      return { q: 'How many planets lie between ' + PLANETS[i] + ' and ' + PLANETS[j] + '?', a: num(j - i - 1, 'planets'), steps: ['In order: ' + PLANETS.slice(i, j + 1).join(', ') + '.', 'Between them: ' + (j - i - 1 ? PLANETS.slice(i + 1, j).join(', ') : 'none') + '.'] };
    }
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
