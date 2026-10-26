/* Generators for lifesci, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Life Science (Biology Ladder, course key lifesci), part A: units 1–6 (Studying Life, Cells, Classifying Life, Microbes,
   Plants, Animals and Adaptations), 36 topics. Built from /tmp/work_lifesci_A/src/gen_*.js by build.py; merged into
   static/bio/gen/lifesci.js by /tmp/merge_parts.js. Conventions: /tmp/work_bio/overview.md.
   Facts come from MathLadder.bio where the kit has them (THINGS, ORGANELLES, CELL_PARTS, TAXA, KINGDOMS, PHOTO, RESP,
   PLANT_GROUPS, GROUP_CLUES, mag, fov, cube, doubling, sharedRank), so pictures and answers agree. Levels:
     level 1  one clear case;  level 2  the topic's trouble spot;  level 3  several items, two steps, or a data reading. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function B() { return ML.bio; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function an(s) { return (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s; }
  // mc: right answer first; makeProblem shuffles the choices (keep: true keeps this order)
  function mc(right, wrong, keep) { var ch = [right].concat(wrong.filter(function (w, i, a) { return w !== right && a.indexOf(w) === i; })); return { t: 'mc', choices: ch, v: 0, keep: !!keep }; }
  // mc with several right answers: items [[text, isRight], ...]
  function mcAll(items, keep) { return { t: 'mc', choices: items.map(function (x) { return x[0]; }), v: items.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }), keep: !!keep }; }
  function tf(isTrue) { return { t: 'mc', choices: ['True', 'False'], v: isTrue ? 0 : 1, keep: true }; }
  function yn(yes) { return { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true }; }
  function num(v, extra) { return Object.assign({ t: 'num', v: typeof v === 'number' ? String(+v.toPrecision(10)) : String(v) }, extra || {}); }
  function qv(name, opts) { return { name: name, opts: Object.assign({ quiet: true, interactive: false }, opts || {}) }; }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function L3(s) { return String.fromCharCode(65 + s); } // 0 -> A
  function orderChoices(R, right, n) { // right: e.g. 'BADC'; returns 3 wrong orders of the same letters
    var letters = right.split(''), out = [], guard = 0;
    while (out.length < n && guard++ < 200) { var c = R.shuffle(letters).join(''); if (c !== right && out.indexOf(c) < 0) out.push(c); }
    return out;
  }
  function fmtN(x) { return ML.util && ML.util.fix ? String(ML.util.fix(x)) : String(x); }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function table(head, rows) { return '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr>' + head.map(function (x) { return '<th scope="col">' + x + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; }
  function job(O) { return /^(a|an|the) /.test(O.job) ? 'is ' + O.job : O.job; } // ORGANELLES job as a verb phrase
  /* =================================== Unit 1: Studying Life =================================== */

  /* ---------- 1. The Characteristics of Life ---------- */
  var CHARS = [
    { k: 'cells', name: 'It is made of cells.', obs: ['Under a microscope, a thin slice of onion skin shows tiny boxes packed side by side.', 'A drop of pond water holds a paramecium, a living thing that is just one cell.', 'A scientist looks at a scrape of moss and sees it is built of many small units, each with its own membrane.'] },
    { k: 'energy', name: 'It uses energy.', obs: ['A deer eats grass, and its body uses the energy in that food to run.', 'A sunflower uses the energy in sunlight to make sugar.', 'A yeast cell breaks down sugar and uses the energy it releases.'] },
    { k: 'grow', name: 'It grows and develops.', obs: ['A tadpole slowly changes into a frog.', 'A bean seed sprouts and becomes a plant with leaves.', 'A caterpillar becomes a butterfly.'] },
    { k: 'respond', name: 'It responds to its surroundings.', obs: ['A plant on a windowsill bends toward the light.', 'The pupils of a cat\'s eyes get smaller in bright light.', 'An earthworm moves away from a bright lamp.'] },
    { k: 'steady', name: 'It keeps its insides steady.', obs: ['A runner sweats on a hot day, and her body temperature stays about the same.', 'You shiver when you are cold, and the shivering warms your body.', 'A plant closes the tiny pores in its leaves on a dry day and holds on to its water.'] },
    { k: 'offspring', name: 'It produces offspring.', obs: ['A bacterium splits into two new bacteria.', 'An oak tree drops acorns that grow into new oak trees.', 'A spider\'s eggs hatch into tiny spiders.'] }
  ];
  var FAKES = [ // things that show one sign of life but are not alive
    { d: 'A salt crystal grows bigger in a jar of salty water.', sign: 'it grows', wrong: 'Yes, because it grows.' },
    { d: 'A campfire uses up wood and oxygen and gives off heat.', sign: 'it uses energy', wrong: 'Yes, because it uses fuel and gives off energy.' },
    { d: 'A robot vacuum turns away when it bumps into a chair.', sign: 'it responds', wrong: 'Yes, because it responds to its surroundings.' },
    { d: 'A storm cloud grows larger and drifts across the sky.', sign: 'it grows and moves', wrong: 'Yes, because it grows and moves.' },
    { d: 'A car burns gasoline and moves down the road.', sign: 'it uses energy and moves', wrong: 'Yes, because it uses energy and moves.' },
    { d: 'An icicle grows longer every cold night.', sign: 'it grows', wrong: 'Yes, because it gets bigger over time.' }
  ];
  var REALS = [ // living things that do not look busy
    { d: 'A bean seed sits in a dry packet for a year and seems to do nothing.', why: 'It is made of cells and uses a little energy even while resting; with water it sprouts and grows.' },
    { d: 'A mushroom stays in one spot on a log and never moves.', why: 'It is made of cells, uses energy from the wood it feeds on, grows and makes spores for new mushrooms.' },
    { d: 'A cactus sits in the desert and hardly seems to change for months.', why: 'It is made of cells, uses light energy, slowly grows, and makes flowers and seeds.' },
    { d: 'A sponge stays fixed to a rock on the sea floor.', why: 'It is an animal made of cells; it takes in food from the water, grows and produces young.' }
  ];
  var ALLSIGNS = ['made of cells', 'uses energy', 'grows and develops', 'responds to its surroundings', 'keeps its insides steady', 'produces offspring'];
  var NOTSIGNS = ['moves from place to place', 'breathes air with lungs', 'is green', 'has a brain', 'eats with a mouth', 'has legs'];
  G('lifesci.characteristics-of-life', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var c = R.pick(CHARS), o = R.pick(c.obs), wr = R.sample(CHARS.filter(function (x) { return x !== c; }), 3).map(function (x) { return x.name; });
      return { q: o + ' Which characteristic of life does this show?', a: mc(c.name, wr),
        hint: 'What is happening: building blocks, energy, change over time, a reaction, staying steady, or new life?',
        steps: ['The observation: ' + o, 'This shows that a living thing <b>' + c.name.replace(/^It /, '').replace(/\.$/, '') + '</b>.', 'A living thing shows all six characteristics; this observation shows one of them.'] };
    }
    if (L === 2) {
      if (R.chance(0.6)) {
        var f = R.pick(FAKES);
        return { q: f.d + ' Is it alive?', a: mc('No. It shows one sign, but it is not made of cells and does not produce offspring.', [f.wrong, 'Yes, because anything that changes is alive.', 'No, because it is not green.']),
          hint: 'One sign is not enough. Is it made of cells? Does it produce offspring?',
          steps: ['It is true that ' + f.sign + '.', 'But it is not made of cells, and it does not produce offspring that inherit its traits.', 'A living thing shows <b>all</b> the characteristics of life together, so it is <b>not alive</b>.'] };
      }
      var r = R.pick(REALS);
      return { q: r.d + ' Is it alive?', a: mc('Yes. ' + r.why, ['No, because it does not move from place to place.', 'No, because it is not doing anything right now.', 'Yes, but only when it is moving.']),
        hint: 'Moving is not one of the characteristics of life.',
        steps: ['Moving from place to place is not a test for life.', r.why, 'So it <b>is alive</b>.'] };
    }
    // level 3: choose all that are characteristics of every living thing
    var nr = R.int(2, 3), items = R.sample(ALLSIGNS, nr).map(function (s) { return [s, true]; }).concat(R.sample(NOTSIGNS, 5 - nr).map(function (s) { return [s, false]; }));
    items = R.shuffle(items);
    return { q: 'Which of these are true of <b>every</b> living thing? Choose all that are right.', a: mcAll(items),
      hint: 'Think of a bacterium, a tree and a mushroom. A sign must fit all of them.',
      steps: ['Every living thing is made of cells, uses energy, grows and develops, responds, keeps its insides steady and produces offspring.', 'Right here: ' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join('; ') + '.',
        'Not true of every living thing: ' + items.filter(function (x) { return !x[1]; }).map(function (x) { return x[0]; }).join('; ') + '. A tree does not move from place to place and has no legs, brain or mouth; a mushroom is not green; a bacterium has no lungs.'] };
  });

  /* ---------- 2. Fair Tests: Variables and Controls ---------- */
  var EXPS = [
    { who: 'Maya', q: 'Does the amount of light change how tall bean plants grow?', iv: 'the hours of light each day', dv: 'the height of the plants', ctrl: ['the kind of bean seed', 'the amount of water', 'the type of soil', 'the temperature'], other: 'more water', groups: ['0 hours', '6 hours', '12 hours'], ctl: '0 hours', unit: 'cm', base: [4, 15, 24], ylabel: 'Height (cm)', xlabel: 'Light each day' },
    { who: 'Leo', q: 'Does the amount of fertilizer change how many tomatoes a plant makes?', iv: 'the amount of fertilizer', dv: 'the number of tomatoes', ctrl: ['the kind of tomato plant', 'the amount of water', 'the hours of sunlight', 'the pot size'], other: 'a sunnier window', groups: ['0 g', '5 g', '10 g'], ctl: '0 g', unit: 'tomatoes', base: [8, 13, 17], ylabel: 'Tomatoes per plant', xlabel: 'Fertilizer' },
    { who: 'Ana', q: 'Does water temperature change how much gas yeast makes?', iv: 'the temperature of the water', dv: 'the amount of gas (how big the balloon gets)', ctrl: ['the amount of yeast', 'the amount of sugar', 'the amount of water', 'the size of the bottle'], other: 'twice as much sugar', groups: ['10 °C', '25 °C', '40 °C'], ctl: '25 °C', unit: 'cm', base: [6, 14, 22], ylabel: 'Balloon width (cm)', xlabel: 'Water temperature' },
    { who: 'Sam', q: 'Does salt in the water change how many radish seeds sprout?', iv: 'the amount of salt in the water', dv: 'the number of seeds that sprout', ctrl: ['the kind of seed', 'the number of seeds in each dish', 'the temperature', 'the amount of water'], other: 'a warmer room', groups: ['no salt', 'a little salt', 'a lot of salt'], ctl: 'no salt', unit: 'seeds', base: [18, 12, 4], ylabel: 'Seeds sprouted (of 20)', xlabel: 'Salt' },
    { who: 'Jo', q: 'Does how damp bread is change how fast mold grows on it?', iv: 'how damp the bread is', dv: 'the area covered by mold', ctrl: ['the kind of bread', 'the size of the slice', 'the temperature', 'the kind of bag'], other: 'a warmer shelf', groups: ['dry', 'a little damp', 'very damp'], ctl: 'dry', unit: 'cm²', base: [3, 9, 16], ylabel: 'Mold (cm²)', xlabel: 'Bread' },
    { who: 'Kai', q: 'Does the color of light change how fast pond plants give off oxygen bubbles?', iv: 'the color of the light', dv: 'the number of bubbles per minute', ctrl: ['the kind of plant', 'the size of the plant', 'the brightness of the lamp', 'the water temperature'], other: 'a brighter lamp', groups: ['white', 'red', 'green'], ctl: 'white', unit: 'bubbles', base: [22, 19, 6], ylabel: 'Bubbles per minute', xlabel: 'Light color' }
  ];
  G('lifesci.fair-tests', function (R, ctx) {
    var L = lv(ctx), e = R.pick(EXPS);
    if (L === 1) {
      var askIV = R.coin(), right = askIV ? e.iv : e.dv, wr = [askIV ? e.dv : e.iv].concat(R.sample(e.ctrl, 2));
      return { q: e.who + ' asks: "' + e.q + '" What is the <b>' + (askIV ? 'independent' : 'dependent') + ' variable</b>?', a: mc(cap(right), wr.map(cap)),
        hint: askIV ? 'The independent variable is the one thing the scientist changes on purpose.' : 'The dependent variable is what the scientist measures.',
        steps: ['The independent variable is what ' + e.who + ' changes on purpose: ' + e.iv + '.', 'The dependent variable is what ' + e.who + ' measures: ' + e.dv + '.', 'Everything else, like ' + e.ctrl.slice(0, 2).join(' and ') + ', is kept the same (controlled).', 'So the answer is <b>' + right + '</b>.'] };
    }
    if (L === 2) {
      var shape = R.int(0, 2);
      if (shape === 0) return { q: e.who + ' asks: "' + e.q + '" Group 1 gets ' + e.groups[0] + ' and group 2 gets ' + e.groups[2] + '. Group 2 also gets ' + e.other + '. Group 2 does better. What is wrong with this test?',
        a: mc('Two things were changed, so we cannot tell which one caused the difference.', ['Nothing. It is a fair test.', 'It needed more things changed at once to be sure.', 'The dependent variable should have been changed too.']),
        hint: 'How many things were different between the two groups?',
        steps: ['The groups differ in ' + e.iv + ' <b>and</b> in getting ' + e.other + '.', 'Either difference could explain the result.', 'In a fair test only the independent variable changes; ' + e.other + ' should be the same for both groups.'] };
      if (shape === 1) return { q: e.who + ' asks: "' + e.q + '" The groups get ' + e.groups.join(', ') + '. Why should ' + e.ctrl[1] + ' be the same for every group?',
        a: mc('So that only the independent variable could cause a difference in the results.', ['So the test finishes faster.', 'Because ' + e.ctrl[1] + ' is the dependent variable.', 'It does not matter; it can be different.']),
        hint: 'If it were different, could it change the results?',
        steps: [cap(e.ctrl[1]) + ' could affect ' + e.dv + '.', 'If it differed between groups, we would not know whether ' + e.iv + ' or ' + e.ctrl[1] + ' caused the result.', 'Keeping it the same makes it a <b>controlled variable</b>, so the test is fair.'] };
      return { q: e.who + ' asks: "' + e.q + '" The groups get ' + e.groups.join(', ') + '. Which group is the <b>control group</b>, the one the others are compared with?', a: mc(cap(e.ctl), e.groups.filter(function (g) { return g !== e.ctl; }).map(cap).concat(['There is no need for one'])),
        hint: 'The control group gets the usual treatment, or none of the thing being tested.',
        steps: ['The control group is the normal, untreated or usual case.', 'Here that is the group with <b>' + e.ctl + '</b>.', 'The other groups are compared with it to see the effect of ' + e.iv + '.'] };
    }
    // level 3: data. Three trials per group; find a group's mean, or a difference of means
    var gi = R.int(0, 2), trials = e.groups.map(function (g, i) { var m = e.base[i] + R.int(-1, 1), d = R.int(1, Math.min(2, m - 1)); return [m - d, m, m + d].map(function (x, j) { return x; }); });
    trials = trials.map(function (t) { var s = R.int(0, 1); return s ? [t[1] + (t[2] - t[1]), t[0], t[1]] : t; }); // vary the order a little
    var means = trials.map(function (t) { return (t[0] + t[1] + t[2]) / 3; });
    var tab = table([cap(e.xlabel), 'Trial 1', 'Trial 2', 'Trial 3'], e.groups.map(function (g, i) { return [g].concat(trials[i]); }));
    if (R.coin()) {
      return { q: e.who + ' asks: "' + e.q + '" ' + e.who + ' runs three trials for each group and measures ' + e.dv + '.' + tab + 'What is the mean (average) for the group with <b>' + e.groups[gi] + '</b>?', a: num(means[gi], { rtol: 0.02 }), unit: e.unit === 'cm²' ? 'cm²' : e.unit,
        hint: 'Add the three trials for that group, then divide by 3.',
        steps: ['Trials for ' + e.groups[gi] + ': ' + trials[gi].join(', ') + '.', 'Sum: $' + trials[gi].join(' + ') + ' = ' + (trials[gi][0] + trials[gi][1] + trials[gi][2]) + '$.', 'Mean: $' + (trials[gi][0] + trials[gi][1] + trials[gi][2]) + ' \\div 3 = ' + fmtN(+means[gi].toFixed(2)) + '$' + (means[gi] % 1 ? ' (about)' : '') + '.', 'Repeating trials and taking the mean makes one odd result matter less.'] };
    }
    var a = 0, b = 2, diff = Math.abs(means[b] - means[a]);
    var vz = { name: 'bi-chart', opts: { kind: 'bar', x: e.groups, series: [{ name: 'Mean of 3 trials', values: means.map(function (m) { return +m.toFixed(1); }) }], values: true, ylabel: e.ylabel, xlabel: e.xlabel, quiet: true, interactive: false } };
    return { q: e.who + ' asks: "' + e.q + '" The chart shows the mean of three trials for each group. How much bigger is the mean for <b>' + (means[b] > means[a] ? e.groups[b] : e.groups[a]) + '</b> than for <b>' + (means[b] > means[a] ? e.groups[a] : e.groups[b]) + '</b>?', viz: vz, a: num(+diff.toFixed(1), { rtol: 0.03 }), unit: e.unit,
      hint: 'Read both bars, then subtract the smaller from the larger.',
      steps: ['Mean for ' + e.groups[a] + ': ' + fmtN(+means[a].toFixed(1)) + '. Mean for ' + e.groups[b] + ': ' + fmtN(+means[b].toFixed(1)) + '.', 'Difference: $' + fmtN(+Math.max(means[a], means[b]).toFixed(1)) + ' - ' + fmtN(+Math.min(means[a], means[b]).toFixed(1)) + ' = ' + fmtN(+diff.toFixed(1)) + '$.', 'Since only ' + e.iv + ' changed, this difference was caused by ' + e.iv + ' (or by chance; more trials make us surer).'] };
  });

  /* ---------- 3. Using a Microscope ---------- */
  var MPARTS = { eyepiece: 'the lens you look through, usually 10×', objective: 'the lenses just above the slide, each with its own power', nosepiece: 'turns to switch from one objective lens to another', stage: 'the flat platform that holds the slide', clips: 'hold the slide still on the stage', diaphragm: 'controls how much light reaches the slide', light: 'shines light up through the slide', coarse: 'the large knob that moves the lens a lot, for focusing at low power', fine: 'the small knob for sharpening the focus, used at high power', arm: 'holds the top of the microscope; you carry it here', base: 'the bottom that supports the microscope' };
  G('lifesci.microscope', function (R, ctx) {
    var L = lv(ctx), eye = R.pick([10, 10, 10, 15, 5]), obj = R.pick([4, 10, 40, 100]), tot = B().mag(eye, obj);
    if (L === 1) return { q: R.pick(['A microscope has a ' + eye + '× eyepiece and a ' + obj + '× objective lens. What is the total magnification?', 'You look at an onion cell with a ' + eye + '× eyepiece and the ' + obj + '× objective. How many times wider than real does the cell look?', 'The eyepiece is marked ' + eye + '× and the objective in use is ' + obj + '×. What total magnification are you seeing?']), a: num(tot), unit: '×',
      hint: 'Multiply the two powers.', steps: ['Total magnification = eyepiece power × objective power.', '$' + eye + ' \\times ' + obj + ' = ' + tot + '$.', 'So the image looks <b>' + tot + ' times</b> as wide as the object.'] };
    if (L === 2) {
      var shape = R.int(0, 2);
      if (shape === 0) return { q: 'Lena uses a ' + eye + '× eyepiece and a ' + obj + '× objective. She says the total magnification is ' + eye + ' + ' + obj + ' = ' + (eye + obj) + '×. What is the right total magnification?', a: num(tot), unit: '×',
        hint: 'Each lens magnifies the image the one before it made.', steps: ['The objective makes an image ' + obj + ' times wider; the eyepiece magnifies that image ' + eye + ' times more.', 'So the powers multiply: $' + eye + ' \\times ' + obj + ' = ' + tot + '$.', 'Adding them (' + (eye + obj) + '×) is the mistake.'] };
      if (shape === 1) { var t2 = R.pick([40, 100, 400, 1000]), e2 = 10, o2 = t2 / e2;
        return { q: 'A student sees a cell at ' + t2 + '× total magnification with a ' + e2 + '× eyepiece. What objective lens is she using?', a: num(o2), unit: '×', hint: 'Total = eyepiece × objective, so objective = total ÷ eyepiece.',
          steps: ['Total = eyepiece × objective.', 'Objective = $' + t2 + ' \\div ' + e2 + ' = ' + o2 + '$.', 'So she is using the <b>' + o2 + '×</b> objective.'] }; }
      return { q: 'You switch from the 10× objective to the 40× objective. What happens to what you see?', a: mc('You see a smaller area of the slide, but it looks larger.', ['You see more of the slide, and it looks larger.', 'You see the same area, only sharper.', 'You see more of the slide, and it looks smaller.']),
        hint: 'Think of zooming in on a photo.', steps: ['Higher power makes everything look wider by 4 times.', 'The circle you look through stays the same size, so it now holds only a quarter as much of the slide across.', 'So you see <b>a smaller area, larger</b>. (It also often looks dimmer.)'] };
    }
    if (R.coin()) { var keys = Object.keys(MPARTS), p = R.pick(keys), wr = R.sample(keys.filter(function (k) { return k !== p; }), 3);
      var nm = function (k) { return cap(B().MICROSCOPE_PARTS[k]); };
      return { q: 'What is the part marked "?" called?', viz: qv('bi-microscope', { ask: p }), a: mc(nm(p), wr.map(nm)), hint: 'Think about what that part does.',
        steps: ['The "?" marks the ' + B().MICROSCOPE_PARTS[p] + '.', 'Its job: ' + MPARTS[p] + '.'] }; }
    var lo = R.pick([4, 10]), hi = R.pick([40, 100].filter(function (x) { return x > lo; })), e3 = R.pick([10, 15]);
    return { q: 'With a ' + e3 + '× eyepiece, how many times wider does a cell look with the ' + hi + '× objective than with the ' + lo + '× objective?', a: num(hi / lo), unit: '×',
      hint: 'Find both total magnifications, then divide.', steps: ['With the ' + lo + '× objective: $' + e3 + ' \\times ' + lo + ' = ' + e3 * lo + '$×.', 'With the ' + hi + '× objective: $' + e3 + ' \\times ' + hi + ' = ' + e3 * hi + '$×.', '$' + e3 * hi + ' \\div ' + e3 * lo + ' = ' + hi / lo + '$, so it looks <b>' + hi / lo + ' times</b> wider.'] };
  });

  /* ---------- 4. Measuring with a Microscope ---------- */
  G('lifesci.field-of-view', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var mm = R.pick([0.5, 0.25, 0.1, 0.05, 0.02, 1.5, 0.4, 0.08, 2, 0.006, 0.3, 0.15, 0.75, 0.012, 1.2, 0.035]), um = Math.round(mm * 1000);
        return { q: 'A plant cell is ' + mm + ' mm long. How long is it in micrometers (µm)?', a: num(um), unit: 'µm', hint: '1 mm = 1,000 µm.',
          steps: ['1 millimeter = 1,000 micrometers.', 'Multiply by 1,000: $' + mm + ' \\times 1000 = ' + commas(um) + '$.', 'So the cell is <b>' + commas(um) + ' µm</b> long.'] }; }
      var u2 = R.pick([20, 50, 80, 250, 400, 1500, 2, 7, 120, 600, 30, 75, 350, 900, 5, 15]), m2 = u2 / 1000;
      return { q: 'A cell is ' + commas(u2) + ' µm wide. How wide is it in millimeters?', a: num(m2, { rtol: 0.001 }), unit: 'mm', hint: 'There are 1,000 µm in 1 mm, so divide by 1,000.',
        steps: ['1 mm = 1,000 µm.', 'Divide by 1,000: $' + u2 + ' \\div 1000 = ' + fmtN(m2) + '$.', 'So it is <b>' + fmtN(m2) + ' mm</b> wide.'] };
    }
    var f40 = R.pick([4, 4.5, 5]);
    if (L === 2) {
      var pairs = [[40, 100], [40, 400], [100, 400], [40, 100], [100, 1000]], pr = R.pick(pairs), m1 = pr[0], mag2 = pr[1], f1 = m1 === 40 ? R.pick([4, 4.5, 5, 4.8, 5.2]) : R.pick([1.6, 1.8, 2, 2.2]), f2 = B().fov(f1, m1, mag2);
      var asUm = f2 < 1 && R.coin();
      return { q: 'At ' + m1 + '× the field of view is ' + fmtN(f1) + ' mm across. About how wide is it at ' + mag2 + '×' + (asUm ? ', in micrometers' : '') + '?', a: num(asUm ? Math.round(f2 * 1000) : f2, { rtol: 0.02 }), unit: asUm ? 'µm' : 'mm',
        hint: 'The power went up by some factor; the field of view shrinks by the same factor.',
        steps: ['The magnification grows $' + mag2 + ' \\div ' + m1 + ' = ' + fmtN(mag2 / m1) + '$ times.', 'So the field of view is ' + fmtN(mag2 / m1) + ' times narrower: $' + fmtN(f1) + ' \\div ' + fmtN(mag2 / m1) + ' = ' + fmtN(f2) + '$ mm.' + (asUm ? ' In micrometers: $' + fmtN(f2) + ' \\times 1000 = ' + Math.round(f2 * 1000) + '$ µm.' : ''), 'Higher power, smaller field: the answer must be smaller than ' + fmtN(f1) + ' mm.'] };
    }
    // level 3: estimate a cell's size from how many fit across the field
    var mag = R.pick([100, 400]), fov = B().fov(f40, 40, mag), fum = Math.round(fov * 1000), ns = [];
    for (var n = 3; n <= 12; n++) if (fum % n === 0) ns.push(n);
    var cnt = R.pick(ns), size = fum / cnt, two = R.coin();
    var vz = qv('bi-microscope', { mode: 'view', objective: mag / 10, fov40: f40, cellLength: fov / cnt, cellWidth: fov / cnt * 0.4, label: 'The view through the microscope: a row of cells across the field.' });
    if (two) return { q: 'At 40× the field of view of a microscope is ' + fmtN(f40) + ' mm. At ' + mag + '×, about ' + cnt + ' cells fit end to end across the field. About how long is one cell, in micrometers?', viz: vz, a: num(size, { rtol: 0.03 }), unit: 'µm',
      hint: 'First find the field of view at ' + mag + '×, change it to µm, then divide by the number of cells.',
      steps: ['Field at ' + mag + '×: $' + fmtN(f40) + ' \\div ' + mag / 40 + ' = ' + fmtN(fov) + '$ mm.', 'In micrometers: $' + fmtN(fov) + ' \\times 1000 = ' + commas(fum) + '$ µm.', 'One cell: $' + fum + ' \\div ' + cnt + ' = ' + fmtN(size) + '$ µm.', 'So each cell is about <b>' + fmtN(size) + ' µm</b> long.'] };
    return { q: 'At ' + mag + '× the field of view is ' + fmtN(fov) + ' mm across. About ' + cnt + ' cells fit end to end across it. About how long is one cell, in micrometers?', viz: vz, a: num(size, { rtol: 0.03 }), unit: 'µm',
      hint: 'Change the field of view to µm, then share it among the cells.',
      steps: ['Field of view: $' + fmtN(fov) + ' \\times 1000 = ' + commas(fum) + '$ µm.', 'One cell: $' + fum + ' \\div ' + cnt + ' = ' + fmtN(size) + '$ µm.', 'So each cell is about <b>' + fmtN(size) + ' µm</b> long.'] };
  });

  /* =================================== Unit 2: Cells =================================== */

  /* ---------- 5. The Cell Theory ---------- */
  var CT = ['All living things are made of one or more cells.', 'The cell is the basic unit of structure and function in living things.', 'All cells come from cells that already existed.'];
  var CT_FALSE = ['Only animals are made of cells.', 'Cells can form from nonliving matter, like broth or mud.', 'Large living things are made of larger cells than small living things.', 'Plants are made of cells, but fungi are not.', 'Every cell has a nucleus.', 'A single cell is too simple to be alive on its own.'];
  var CT_TF = [['A mushroom is made of cells.', true, 'Fungi, like every living thing, are made of cells.'], ['Bacteria are made of cells.', true, 'Each bacterium is one complete cell.'], ['New cells can form on their own from nonliving material.', false, 'Every new cell comes from a cell that already existed, by cell division.'],
    ['Only animals and plants are made of cells.', false, 'Every living thing is made of cells: fungi, protists and bacteria too.'], ['A moss plant is made of cells.', true, 'Plants of every size are made of cells.'], ['A blue whale has much bigger cells than a mouse.', false, 'Their cells are about the same size; the whale simply has far more of them.'],
    ['An amoeba, made of one cell, is a complete living thing.', true, 'One cell can carry out every job of life.'], ['The cells in your skin came from other cells.', true, 'New skin cells form when existing cells divide.']];
  var CT_OBS = [['A scientist watches one yeast cell split into two cells.', 2], ['Every sample examined, from pond water to leaves to skin, turns out to be made of cells.', 0], ['A single bacterium takes in food, gets rid of wastes and divides, all on its own.', 1],
    ['Broth that is boiled and sealed stays free of microbes; microbes grow only if living cells get in.', 2], ['Slices of cork, moss, onion and fish all show cells under the microscope.', 0], ['The smallest part of a leaf that can still carry out life\'s jobs is one leaf cell.', 1]];
  var PEOPLE = [['Robert Hooke', '1665', 'looked at thin slices of cork and named the tiny boxes he saw "cells"'], ['Matthias Schleiden', '1838', 'concluded that all plants are made of cells'], ['Theodor Schwann', '1839', 'concluded that animals are made of cells too'], ['Rudolf Virchow', '1855', 'argued that every cell comes from another cell']];
  G('lifesci.cell-theory', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var t = R.pick(CT);
      return { q: 'Which statement is part of the cell theory?', a: mc(t, R.sample(CT_FALSE, 3)), hint: 'The cell theory has three parts: what living things are made of, the basic unit, and where cells come from.',
        steps: ['The three parts of the cell theory:', '1. All living things are made of one or more cells. 2. The cell is the basic unit of life. 3. All cells come from existing cells.', 'So the answer is: <b>' + t + '</b>'] }; }
    if (L === 2) { var s = R.pick(CT_TF);
      return { q: 'True or false? ' + s[0], a: tf(s[1]), hint: 'The cell theory applies to every living thing.', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] }; }
    if (R.coin()) { var o = R.pick(CT_OBS);
      return { q: o[0] + ' Which part of the cell theory does this support best?', a: { t: 'mc', choices: CT.slice(), v: o[1], keep: true }, hint: 'Is it about what things are made of, the smallest unit of life, or where new cells come from?',
        steps: ['The observation is about ' + ['what living things are made of', 'the cell as the smallest unit that can do the jobs of life', 'where new cells come from'][o[1]] + '.', 'So it supports: <b>' + CT[o[1]] + '</b>'] }; }
    var p = R.pick(PEOPLE), wr = PEOPLE.filter(function (x) { return x !== p; }).map(function (x) { return x[0]; });
    return { q: 'In ' + p[1] + ', a scientist ' + p[2] + '. Who was it?', a: mc(p[0], wr), hint: 'Hooke came first, with cork; Virchow came last, with "cells from cells".',
      steps: PEOPLE.map(function (x) { return x[1] + ': ' + x[0] + ' ' + x[2] + '.'; }).concat(['So the answer is <b>' + p[0] + '</b>.']) };
  });

  /* ---------- 6. One Cell or Many ---------- */
  var UNI = ['an amoeba', 'a paramecium', 'a bacterium', 'a yeast cell', 'a diatom', 'a euglena'];
  var MULTI = ['an oak tree', 'a mushroom', 'a person', 'a moss', 'an earthworm', 'a goldfish', 'a sunflower', 'a housefly', 'a jellyfish'];
  var BIGSMALL = [['an elephant', 'a mouse'], ['a blue whale', 'a shrimp'], ['a horse', 'a hamster'], ['an oak tree', 'a blade of grass'], ['a giraffe', 'a squirrel']];
  var CELLJOBS = [['red blood cell', 'carries oxygen in the blood'], ['nerve cell', 'carries signals from one part of the body to another'], ['muscle cell', 'shortens (contracts) to move a body part'], ['root hair cell', 'takes in water from the soil'], ['guard cell', 'opens and closes a tiny pore in a leaf'], ['skin cell', 'covers and protects the body']];
  G('lifesci.one-or-many-cells', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var uni = R.coin(), o = uni ? R.pick(UNI) : R.pick(MULTI);
      return { q: 'Is ' + o + ' unicellular (one cell) or multicellular (many cells)?', a: { t: 'mc', choices: ['Unicellular', 'Multicellular'], v: uni ? 0 : 1, keep: true },
        hint: 'Could you see it without a microscope? Most unicellular organisms are too small to see.',
        steps: [uni ? cap(o) + ' is a single cell that does every job of life by itself.' : cap(o) + ' is built of many cells, each with its own job.', 'So it is <b>' + (uni ? 'unicellular' : 'multicellular') + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var p = R.pick(BIGSMALL);
        return { q: cap(p[0]) + ' is much bigger than ' + p[1] + '. Compared with ' + p[1] + ', ' + p[0] + ' has …', a: mc('many more cells, of about the same size', ['much bigger cells', 'the same number of bigger cells', 'fewer cells, but much larger ones']),
          hint: 'Cells must stay small to work. What can a big organism have more of?', steps: ['Cells of different animals and plants are about the same size range: most are far too small to see.', 'A big organism is big because it has <b>many more cells</b>, not bigger ones.'] }; }
      var u = R.pick(UNI.filter(function (x) { return x !== 'a yeast cell'; }));
      return { q: cap(u) + ' is a single cell. Which jobs of life must that one cell do?', a: mc('All of them: take in food, get rid of wastes, respond and make new cells', ['Only take in food; other cells do the rest', 'None; one cell is too simple to be alive', 'Only divide; it cannot respond to anything']),
        hint: 'There are no other cells to help.', steps: ['A unicellular organism has no other cells to share the work.', 'So its one cell must do <b>every job of life</b> itself.', 'In a multicellular organism, cells specialize and share the jobs.'] };
    }
    var j = R.pick(CELLJOBS), wr = R.sample(CELLJOBS.filter(function (x) { return x !== j; }), 3).map(function (x) { return cap(x[0]); });
    if (R.coin()) return { q: 'In a multicellular organism, cells specialize. Which kind of cell ' + j[1] + '?', a: mc(cap(j[0]), wr), hint: 'Match the cell to its job.',
      steps: ['A ' + j[0] + ' ' + j[1] + '.', 'Its shape fits the job, and it relies on other cells for the jobs it does not do.'] };
    return { q: 'What is the main job of a ' + j[0] + '?', a: mc(cap(j[1]), R.sample(CELLJOBS.filter(function (x) { return x !== j; }), 3).map(function (x) { return cap(x[1]); })), hint: 'Think about where that cell is found.',
      steps: ['A ' + j[0] + ' ' + j[1] + '.'] };
  });

  /* ---------- 7. Membrane, Cytoplasm and Nucleus ---------- */
  var NUC = [['a bacterium', false], ['a yeast cell', true], ['a skin cell', true], ['an amoeba', true], ['a leaf cell', true], ['an archaean from a hot spring', false], ['a nerve cell', true], ['a cell from a mushroom', true]];
  G('lifesci.cell-parts', function (R, ctx) {
    var L = lv(ctx), O = B().ORGANELLES;
    if (L === 1) {
      var p = R.pick(['membrane', 'cytoplasm', 'nucleus']), type = R.pick(['animal', 'plant']);
      if (R.coin()) return { q: 'What is the part marked "?" in this ' + type + ' cell?', viz: qv('bi-cell', { type: type, ask: p }), a: mc(cap(O[p].name), ['Cell membrane', 'Cytoplasm', 'Nucleus', 'Cell wall'].filter(function (x) { return x !== cap(O[p].name); }).slice(0, type === 'animal' ? 2 : 3)),
        hint: 'The membrane is the thin edge, the cytoplasm is the jelly inside, and the nucleus is the large round body.', steps: ['The "?" marks the <b>' + O[p].name + '</b>.', 'It ' + job(O[p]) + '.'] };
      return { q: 'Which part of a cell ' + job(O[p]) + '?', a: mc(cap(O[p].name), ['Cell membrane', 'Cytoplasm', 'Nucleus', 'Cell wall', 'Chloroplast'].filter(function (x) { return x !== cap(O[p].name); }).slice(0, 3)),
        hint: 'Three parts are in nearly every cell you will study: membrane, cytoplasm and nucleus.', steps: ['The ' + O[p].name + ' ' + job(O[p]) + '.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'Which statement about the cell membrane is right?', a: mc('It lets some materials in and out and keeps others out.', ['It is a solid wall that blocks everything.', 'It lets everything pass through freely.', 'Only plant cells have one.']),
        hint: 'Food has to get in and wastes have to get out.', steps: ['A cell needs to take in food and water and get rid of wastes.', 'The membrane lets some things through and holds others back: it is <b>selectively permeable</b>.', 'Every cell has a membrane, plant cells included (just inside the cell wall).'] };
      return { q: 'Which statement about the nucleus is right?', a: mc('It holds the DNA, the instructions the cell follows.', ['It does every job in the cell by itself.', 'It releases the energy from food.', 'It builds the cell wall.']),
        hint: 'The nucleus is like an office that keeps the plans, not the whole factory.', steps: ['The nucleus stores the DNA, the cell\'s instructions.', 'Other parts do most of the work, following those instructions: mitochondria release energy, ribosomes build proteins.', 'So the nucleus <b>holds the instructions</b>.'] };
    }
    if (R.coin()) { var no = R.pick(NUC.filter(function (x) { return !x[1]; })), yes = R.sample(NUC.filter(function (x) { return x[1]; }), 3);
      return { q: 'Which of these has <b>no</b> nucleus?', a: mc(cap(no[0]), yes.map(function (x) { return cap(x[0]); })), hint: 'Bacteria and archaea keep their DNA loose in the cytoplasm.',
        steps: ['Plants, animals, fungi and protists have cells with a nucleus.', 'Bacteria and archaea do not: their DNA lies in the cytoplasm.', 'So the answer is <b>' + no[0] + '</b>.'] }; }
    var right = R.sample(['a cell membrane', 'cytoplasm', 'DNA', 'ribosomes'], R.int(2, 3)), wrong = R.sample(['a nucleus', 'a cell wall', 'chloroplasts'], 2), items = R.shuffle(right.map(function (x) { return [x, true]; }).concat(wrong.map(function (x) { return [x, false]; })));
    return { q: 'Which of these does <b>every</b> cell have, from a bacterium to a nerve cell? Choose all that are right.', a: mcAll(items), hint: 'A bacterium has no nucleus, and an animal cell has no wall.',
      steps: ['Every cell has a cell membrane, cytoplasm, DNA and ribosomes.', 'A bacterium has no nucleus; animal cells have no cell wall; only plant and algae cells have chloroplasts.', 'So the right ones are: <b>' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join(', ') + '</b>.'] };
  });

  /* ---------- 8. Organelles and Their Jobs ---------- */
  var ORGJ = [['mitochondria', 'Mitochondria', 'release the energy stored in food, using oxygen', 'a power plant'], ['ribosomes', 'Ribosomes', 'build proteins', 'machines on an assembly line'], ['roughER', 'Rough endoplasmic reticulum', 'makes and folds proteins on its ribosome-studded membranes', 'the assembly hall'],
    ['golgi', 'Golgi apparatus', 'packages proteins and ships them where they are needed', 'the shipping department'], ['lysosome', 'Lysosomes', 'break down wastes and worn-out parts', 'the recycling crew'], ['vacuole', 'Vacuoles', 'store water, food and wastes', 'a storage room'], ['nucleus', 'Nucleus', 'holds the DNA, the instructions', 'the office that keeps the plans']];
  G('lifesci.organelles', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var o = R.pick(ORGJ), wr = R.sample(ORGJ.filter(function (x) { return x !== o; }), 3).map(function (x) { return x[1]; }), sh = R.int(0, 2);
      if (sh === 0) return { q: 'Which organelle ' + o[2].replace(/^(release|build|break|store)/, function (m) { return m + 's'; }).replace(/^releases the energy/, 'releases the energy') + '?', a: mc(o[1], wr), hint: 'Match the job to the part.', steps: [o[1] + ' ' + o[2] + '.', 'So the answer is <b>' + o[1].toLowerCase().replace('golgi', 'Golgi') + '</b>.'] };
      if (sh === 1) return { q: 'If a cell were a factory, which organelle would be like ' + o[3] + '?', a: mc(o[1], wr), hint: 'What does that part of a factory do?', steps: [cap(o[3]) + ' in a factory matches the job of the ' + o[1].toLowerCase().replace('golgi', 'Golgi') + ': it ' + o[2].replace(/^(release|build|break|store)/, function (m) { return m + 's'; }) + '.'] };
      var k = R.pick(['mitochondria', 'ribosomes', 'roughER', 'golgi', 'lysosome', 'vacuole', 'nucleus']), oo = ORGJ.filter(function (x) { return x[0] === k; })[0];
      return { q: 'What is the organelle marked "?" in this animal cell?', viz: qv('bi-cell', { type: 'animal', ask: k }), a: mc(oo[1], R.sample(ORGJ.filter(function (x) { return x !== oo; }), 3).map(function (x) { return x[1]; })),
        hint: 'Look at its shape: bean-shaped with folds, tiny dots, folded sheets, a stack of flat sacs, small round sacs, or the big round center?', steps: ['The "?" marks the <b>' + oo[1].toLowerCase().replace('golgi', 'Golgi') + '</b>.', 'Its job: it ' + oo[2].replace(/^(release|build|break|store)/, function (m) { return m + 's'; }) + '.'] };
    }
    if (L === 2) {
      var sh2 = R.int(0, 2);
      if (sh2 === 0) return { q: 'Mitochondria release energy for the cell. Where does that energy come from?', a: mc('From sugar and other food molecules the cell takes in', ['Mitochondria make new energy out of nothing', 'From the DNA in the nucleus', 'From the cell membrane']),
        hint: 'Energy is never made from nothing; it changes from one form to another.', steps: ['Food molecules like sugar store chemical energy.', 'Mitochondria use oxygen to break the sugar down and pass its energy to a molecule called ATP, which the cell uses.', 'So the energy comes <b>from food</b>: it changes form, it is not created.'] };
      if (sh2 === 1) { var cell = R.pick([['a muscle cell in a running leg', 'mitochondria', 'needs a lot of energy'], ['a cell that makes and sends out many proteins', 'ribosomes', 'builds a lot of protein'], ['a white blood cell that breaks down germs it swallows', 'lysosomes', 'breaks down a lot of material']]);
        return { q: 'Which organelle would you expect to find in large numbers in ' + cell[0] + '?', a: mc(cap(cell[1]), ['Mitochondria', 'Ribosomes', 'Lysosomes', 'Vacuoles'].filter(function (x) { return x.toLowerCase() !== cell[1]; }).slice(0, 3)),
          hint: 'What does that cell do a lot of?', steps: ['This cell ' + cell[2] + '.', 'So it has many <b>' + cell[1] + '</b>.'] }; }
      return { q: 'True or false? Mitochondria create energy out of nothing.', a: tf(false), hint: 'Where does the cell\'s energy really come from?', steps: ['Energy cannot be created; it only changes form.', 'Mitochondria release energy that was stored in food (sugar), using oxygen.', 'So the statement is <b>false</b>.'] };
    }
    // level 3: the path of a protein that leaves the cell
    var steps0 = ['A ribosome on the rough ER builds the protein', 'The rough ER folds the protein and sends it on in a small bubble', 'The Golgi apparatus packages the protein', 'A small bubble carries it to the cell membrane, and it leaves the cell'];
    var ord = R.shuffle([0, 1, 2, 3]); while (ord.join('') === '0123') ord = R.shuffle([0, 1, 2, 3]);
    var right = [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)); }).join('');
    return { q: 'A cell makes a protein to send out of the cell. Put the steps in order.' + '<ol type="A">' + ord.map(function (i) { return '<li>' + steps0[i] + '</li>'; }).join('') + '</ol>', a: mc(right, orderChoices(R, right, 3)),
      hint: 'Proteins are built first, then finished, then packed and shipped.', steps: [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)) + ': ' + steps0[i] + '.'; }).concat(['Order: <b>' + right + '</b>.']) };
  });

  /* ---------- 9. Plant Cells and Animal Cells ---------- */
  var PONLY = ['Cell wall', 'Chloroplasts', 'Large central vacuole'], BOTH = ['Cell membrane', 'Nucleus', 'Mitochondria', 'Ribosomes', 'Cytoplasm', 'Golgi apparatus', 'Endoplasmic reticulum'];
  G('lifesci.plant-animal-cells', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var p = R.pick(PONLY); return { q: 'Which part is found in plant cells but <b>not</b> in animal cells?', a: mc(p, R.sample(BOTH, 3)), hint: 'Three parts are special to plant cells.',
        steps: ['Plant cells have three parts animal cells lack: a cell wall, chloroplasts and a large central vacuole.', 'So the answer is the <b>' + p.toLowerCase() + '</b>.'] }; }
      var b = R.pick(BOTH); return { q: 'Which part is found in <b>both</b> plant and animal cells?', a: mc(b, PONLY), hint: 'Which one is not special to plants?',
        steps: ['A cell wall, chloroplasts and a large central vacuole are found only in plant cells (of these two kinds).', 'Both kinds have a membrane, cytoplasm, a nucleus, mitochondria, ribosomes, ER and a Golgi apparatus.', 'So the answer is <b>' + b.toLowerCase().replace('golgi', 'Golgi') + '</b>.'] };
    }
    if (L === 2) {
      var sh = R.int(0, 2);
      if (sh === 0) return { q: 'Do plant cells have mitochondria?', a: mc('Yes. Chloroplasts make sugar, and mitochondria release its energy.', ['No. Plants have chloroplasts instead of mitochondria.', 'Only at night; they turn into chloroplasts by day.', 'No. Only animal cells need energy.']),
        hint: 'Plant cells need energy too, all day and all night.', steps: ['Chloroplasts capture light energy and store it in sugar.', 'Mitochondria break that sugar down to release its energy for the cell, day and night.', 'So plant cells have <b>both</b>.'] };
      if (sh === 1) return { q: 'It is night. Which organelle is releasing energy from sugar in a leaf cell?', a: mc('Mitochondria', ['Chloroplasts', 'Cell wall', 'Central vacuole']), hint: 'Chloroplasts need light. Which organelle works in the dark?',
        steps: ['At night there is no light, so chloroplasts are not making sugar.', 'The <b>mitochondria</b> keep releasing energy from sugar made earlier, as they do all the time.'] };
      return { q: 'True or false? Plant cells have chloroplasts instead of mitochondria.', a: tf(false), hint: 'Making sugar and using sugar are two different jobs.', steps: ['Plant cells have chloroplasts <b>and</b> mitochondria.', 'So the statement is <b>false</b>.'] };
    }
    if (R.coin()) { var type = R.pick(['plant', 'animal']);
      return { q: 'Is this a plant cell or an animal cell, and what tells you?', viz: qv('bi-cell', { type: type, label: 'A cell with no labels.' }),
        a: mc(type === 'plant' ? 'A plant cell: it has a cell wall and chloroplasts.' : 'An animal cell: it has no cell wall and no chloroplasts.', [type === 'plant' ? 'An animal cell: it has a nucleus.' : 'A plant cell: it has mitochondria.', type === 'plant' ? 'A plant cell: it has mitochondria.' : 'A plant cell: it has a nucleus.', type === 'plant' ? 'An animal cell: it has a membrane.' : 'An animal cell: it has a cell wall.']),
        hint: 'A nucleus and mitochondria are in both. Look for a thick outer wall and green chloroplasts.', steps: ['Both kinds of cell have a nucleus, a membrane and mitochondria, so those do not tell them apart.', type === 'plant' ? 'This cell has a stiff wall outside its membrane, green chloroplasts and a large central vacuole.' : 'This cell has a flexible rounded edge with no wall, and no chloroplasts.', 'So it is <b>' + an(type) + ' cell</b>.'] }; }
    var part = R.pick(PONLY.concat(BOTH)), inP = PONLY.indexOf(part) >= 0;
    return { q: 'Where is this part found: <b>' + part.toLowerCase().replace('golgi', 'Golgi') + '</b>?', a: { t: 'mc', choices: ['Plant cells only', 'Animal cells only', 'Both plant and animal cells'], v: inP ? 0 : 2, keep: true },
      hint: 'Only three parts here are special to plant cells.', steps: [inP ? cap(part.toLowerCase()) + ' is one of the three parts special to plant cells.' : cap(part.toLowerCase().replace('golgi', 'Golgi')) + ' is in every plant and animal cell.', 'So the answer is <b>' + (inP ? 'plant cells only' : 'both') + '</b>.'] };
  });

  /* ---------- 10. Why Cells Are Small ---------- */
  G('lifesci.cell-size', function (R, ctx) {
    var L = lv(ctx), C = B().cube;
    if (L === 1 && R.coin()) { var l = R.int(2, 6), w = R.int(1, 4), hh = R.intNot(1, 5, [l, w]), aV = R.coin(), sa = 2 * (l * w + l * hh + w * hh), vol = l * w * hh;
      return { q: 'A box-shaped cell is ' + l + ' µm long, ' + w + ' µm wide and ' + hh + ' µm tall. What is its ' + (aV ? 'volume' : 'surface area') + '?', a: num(aV ? vol : sa), unit: aV ? 'µm³' : 'µm²',
        hint: aV ? 'Volume = length × width × height.' : 'A box has 6 faces in 3 matching pairs.',
        steps: aV ? ['Volume = length × width × height.', '$' + l + ' \\times ' + w + ' \\times ' + hh + ' = ' + vol + '$ µm³.'] : ['The three different faces: $' + l + ' \\times ' + w + ' = ' + l * w + '$, $' + l + ' \\times ' + hh + ' = ' + l * hh + '$, $' + w + ' \\times ' + hh + ' = ' + w * hh + '$ µm².', 'Each comes in a pair: $2 \\times (' + l * w + ' + ' + l * hh + ' + ' + w * hh + ') = ' + sa + '$ µm².'] }; }
    if (L === 1) { var s = R.int(1, 8), c = C(s), askV = R.coin();
      return { q: 'A cube-shaped cell has sides ' + s + ' µm long. What is its ' + (askV ? 'volume' : 'surface area') + '?', viz: qv('lifesci-cubes', { sides: [s] }), a: num(askV ? c.v : c.sa), unit: askV ? 'µm³' : 'µm²',
        hint: askV ? 'Volume = side × side × side.' : 'A cube has 6 square faces. Find one face, then multiply by 6.',
        steps: askV ? ['Volume = side × side × side.', '$' + s + ' \\times ' + s + ' \\times ' + s + ' = ' + c.v + '$ µm³.'] : ['One face: $' + s + ' \\times ' + s + ' = ' + s * s + '$ µm².', 'Six faces: $6 \\times ' + s * s + ' = ' + c.sa + '$ µm².'] }; }
    if (L === 2) { var k = R.pick([2, 3, 2, 4, 5, 10]), s0 = k > 4 ? 1 : R.int(1, 3), askV2 = R.coin();
      return { q: 'A cube-shaped cell grows from ' + s0 + ' µm to ' + s0 * k + ' µm on each side (' + k + ' times as wide). How many times larger does its ' + (askV2 ? 'volume' : 'surface area') + ' become?', viz: qv('lifesci-cubes', { sides: [s0, s0 * k] }), a: num(askV2 ? k * k * k : k * k), unit: '×',
        hint: askV2 ? 'Volume uses side three times: side × side × side.' : 'Surface area uses side twice: side × side.',
        steps: ['Before: surface area $6 \\times ' + s0 + '^2 = ' + C(s0).sa + '$ µm², volume $' + s0 + '^3 = ' + C(s0).v + '$ µm³.', 'After: surface area $6 \\times ' + s0 * k + '^2 = ' + C(s0 * k).sa + '$ µm², volume $' + s0 * k + '^3 = ' + C(s0 * k).v + '$ µm³.', askV2 ? 'Volume: $' + C(s0 * k).v + ' \\div ' + C(s0).v + ' = ' + k * k * k + '$, which is $' + k + '^3$.' : 'Surface area: $' + C(s0 * k).sa + ' \\div ' + C(s0).sa + ' = ' + k * k + '$, which is $' + k + '^2$.', 'Volume grows faster than surface, so a big cell has less surface for each bit of its inside.'] }; }
    if (R.coin()) { var s3 = R.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 20]), c3 = C(s3);
      return { q: 'For a cube-shaped cell with sides ' + s3 + ' µm, find its surface area divided by its volume (the surface-to-volume ratio).', viz: qv('lifesci-cubes', { sides: [s3] }), a: num(c3.ratio, { rtol: 0.01 }),
        hint: 'Find the surface area and the volume first.', steps: ['Surface area: $6 \\times ' + s3 + ' \\times ' + s3 + ' = ' + c3.sa + '$ µm².', 'Volume: $' + s3 + ' \\times ' + s3 + ' \\times ' + s3 + ' = ' + c3.v + '$ µm³.', 'Ratio: $' + c3.sa + ' \\div ' + c3.v + ' = ' + fmtN(c3.ratio) + '$ (per µm).', 'The smaller the cell, the bigger this number, and the easier it is to move materials in and out.'] }; }
    var a = R.pick([1, 2, 3]), b = R.pick([4, 6, 3, 8, 10, 12].filter(function (x) { return x > a && x % a === 0; })), ra = C(a).ratio, rb = C(b).ratio;
    return { q: 'Cube A has sides ' + a + ' µm and cube B has sides ' + b + ' µm. How many times more surface area for each unit of volume does cube A have than cube B?', viz: qv('lifesci-cubes', { sides: [a, b] }), a: num(ra / rb, { rtol: 0.01 }), unit: '×',
      hint: 'Find surface area ÷ volume for each cube, then divide.', steps: ['Cube A: $' + C(a).sa + ' \\div ' + C(a).v + ' = ' + fmtN(ra) + '$.', 'Cube B: $' + C(b).sa + ' \\div ' + C(b).v + ' = ' + fmtN(rb) + '$.', '$' + fmtN(ra) + ' \\div ' + fmtN(rb) + ' = ' + fmtN(ra / rb) + '$: the smaller cube has <b>' + fmtN(ra / rb) + ' times</b> as much surface for its size.'] };
  });

  /* ---------- 11. Diffusion and Osmosis ---------- */
  var DIFF = [['A drop of food coloring is placed in a glass of still water.', 'the coloring spreads from the drop out into the clear water'], ['Someone opens a jar of peanut butter at one end of a room.', 'the smell spreads from the jar across the room'], ['A tea bag sits in a cup of hot water.', 'the tea spreads out from the bag into the water'],
    ['Air in the tiny air sacs of the lungs has more oxygen than the blood passing by.', 'oxygen moves from the air sacs into the blood'], ['Working muscle cells make carbon dioxide, so they have more of it than the blood nearby.', 'carbon dioxide moves from the cells into the blood']];
  var DIFF_WRONG = ['the particles move from where there are fewer of them to where there are more', 'the particles stay where they are until something stirs them', 'the particles all move in one straight line and then stop'];
  G('lifesci.diffusion-osmosis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var d = R.pick(DIFF);
      return { q: d[0] + ' What happens, and why?', a: mc(cap(d[1]) + ': particles spread from where they are crowded to where they are less crowded.', DIFF_WRONG.map(cap)), hint: 'Where are the particles most crowded at the start?',
        steps: ['At the start the particles are crowded in one place.', 'They move about at random, so more of them wander out of the crowded place than into it.', 'So ' + d[1] + ': that is <b>diffusion</b>.'] }; }
    if (L === 2) {
      if (R.chance(0.75)) { var inside = R.pick([0.9, 1, 2, 3]), out = R.pick([0, 0.5, 5, 10, 20, inside]), dir = out > inside ? 'out' : out < inside ? 'in' : 'even';
        var sol = dir === 'out' ? 'hyper' : dir === 'in' ? 'hypo' : 'iso';
        return { q: 'A cell has ' + inside + '% salt inside. It is placed in water with ' + out + '% salt. The membrane lets water through but not salt. Which way does water move overall?', viz: qv('bi-membrane', { mode: 'tonicity', solution: sol, cell: 'animal' }),
          a: { t: 'mc', choices: ['Into the cell', 'Out of the cell', 'In and out at the same rate'], v: dir === 'in' ? 0 : dir === 'out' ? 1 : 2, keep: true },
          hint: 'Water moves toward the side with more dissolved material (the saltier side).',
          steps: ['Water moves toward the side with more dissolved salt.', dir === 'even' ? 'Both sides have ' + inside + '% salt, so water moves in and out at the same rate: no overall change.' : 'The ' + (dir === 'out' ? 'outside' : 'inside') + ' is saltier (' + Math.max(inside, out) + '% vs ' + Math.min(inside, out) + '%).', dir === 'even' ? 'The answer: <b>in and out at the same rate</b>.' : 'So water moves <b>' + (dir === 'out' ? 'out of' : 'into') + ' the cell</b>, and the cell ' + (dir === 'out' ? 'shrinks' : 'swells') + '.'] }; }
      return { q: 'Food coloring has spread evenly through a glass of water. What are the coloring particles doing now?', a: mc('Still moving, but as many move each way as the other, so the color stays even', ['They have stopped moving', 'They are all moving to the bottom', 'They are moving back into one drop']),
        hint: 'Particles in a liquid never stop moving.', steps: ['Particles in a liquid are always moving.', 'Once they are even, as many move one way as the other, so nothing changes overall.', 'This balance is called <b>equilibrium</b>; the motion goes on.'] };
    }
    if (R.coin()) { var a = R.pick([2, 5, 10, 15]), b = R.pick([1, 3, 8, 20, 25].filter(function (x) { return x !== a; })), hi = a > b ? 'A' : 'B';
      return { q: 'A tube is split in the middle by a membrane that lets water through but not sugar. Side A has ' + a + '% sugar water and side B has ' + b + '% sugar water, at the same height. Which side\'s water level will rise?', a: { t: 'mc', choices: ['Side A', 'Side B', 'Neither'], v: hi === 'A' ? 0 : 1, keep: true },
        hint: 'Sugar cannot cross. Which way does water move?', steps: ['Water moves by osmosis toward the side with more dissolved sugar.', 'Side ' + hi + ' has more sugar (' + Math.max(a, b) + '%).', 'So water moves into side ' + hi + ', and its level <b>rises</b>.'] }; }
    var cases = [['Slices of potato sit in very salty water for an hour.', 'They get soft and floppy and a little smaller.', 'Water moves out of the potato cells into the saltier water.'], ['Raisins soak in plain water overnight.', 'They swell and get plump.', 'The raisins have more dissolved sugar inside, so water moves into them.'], ['Limp celery sticks are put in plain water.', 'They become firm and crisp.', 'Water moves into the cells, and they press against their cell walls.'], ['Fresh lettuce leaves are sprinkled with salt and left for an hour.', 'They wilt and go limp.', 'Water moves out of the leaf cells toward the salt.']];
    var c = R.pick(cases), others = cases.filter(function (x) { return x !== c; }).map(function (x) { return x[1]; }).filter(function (x) { return x !== c[1]; });
    return { q: c[0] + ' What happens?', a: mc(c[1], R.sample(others, 2).concat(['Nothing changes.'])), hint: 'Which side has more dissolved material? Water moves toward it.',
      steps: [c[2], 'So: <b>' + c[1].toLowerCase() + '</b>'] };
  });

  /* ---------- 12. Cells, Tissues, Organs and Systems ---------- */
  var LEVEX = { cell: ['a muscle cell', 'a nerve cell', 'a red blood cell', 'a leaf cell', 'a root hair cell'], tissue: ['muscle tissue', 'nerve tissue', 'the lining of the stomach', 'xylem tissue in a stem', 'bone tissue'], organ: ['the heart', 'the stomach', 'a leaf', 'the brain', 'a lung', 'a root'], 'organ system': ['the digestive system', 'the circulatory system', 'the nervous system', 'the respiratory system', 'the root system of a plant'], organism: ['a dog', 'an oak tree', 'a person', 'a frog', 'a sunflower'] };
  var LEVSETS = [['a heart muscle cell', 'heart muscle tissue', 'the heart', 'the circulatory system'], ['a nerve cell', 'nerve tissue', 'the brain', 'the nervous system'], ['a cell from the stomach lining', 'stomach lining tissue', 'the stomach', 'the digestive system'], ['a cell from a leaf', 'a layer of food-making tissue', 'a leaf', 'the shoot system (stems and leaves)'], ['a cell from a lung', 'lung tissue', 'a lung', 'the respiratory system']];
  G('lifesci.levels-of-organization', function (R, ctx) {
    var L = lv(ctx), LV = B().LEVELS_ORG;
    if (L === 1) { var lvl = R.pick(LV), ex = R.pick(LEVEX[lvl]);
      return { q: 'Which level of organization is <b>' + ex + '</b>?', a: { t: 'mc', choices: LV.map(cap), v: LV.indexOf(lvl), keep: true }, hint: 'Cells make tissues, tissues make organs, organs make systems, systems make an organism.',
        steps: ['The levels, smallest to largest: cell, tissue, organ, organ system, organism.', cap(ex) + ' is ' + { cell: 'a single cell', tissue: 'a group of similar cells doing one job', organ: 'made of several tissues working together', 'organ system': 'several organs working together', organism: 'a whole living thing' }[lvl] + '.', 'So it is <b>' + an(lvl) + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var org = R.pick(['the stomach', 'the heart', 'a leaf', 'the brain']);
        return { q: 'What is ' + org + ' made of?', a: mc('Several kinds of tissue working together', ['One kind of cell only', 'Several organ systems', 'Organisms']),
          hint: 'An organ is one level up from tissues.', steps: [cap(org) + ' is an organ.', { 'the stomach': 'It has muscle tissue that churns, lining tissue that makes digestive juices, and nerve tissue that controls it.', 'the heart': 'It has muscle tissue that pumps, nerve tissue that sets the beat, and lining tissue inside its chambers.', 'a leaf': 'It has a skin-like outer layer, food-making tissue full of chloroplasts, and xylem and phloem for transport.', 'the brain': 'It has nerve tissue, supporting tissue and blood vessels.' }[org], 'So an organ is made of <b>several kinds of tissue</b>.'] }; }
      var right = LV.join(' → '), wr = [['tissue', 'cell', 'organ', 'organ system', 'organism'], ['cell', 'organ', 'tissue', 'organ system', 'organism'], ['cell', 'tissue', 'organ system', 'organ', 'organism']].map(function (x) { return x.join(' → '); });
      return { q: 'Which list puts the levels in order from smallest to largest?', a: mc(right, wr), hint: 'Organs are made of tissues.', steps: ['Similar cells form tissues.', 'Tissues form organs; organs form organ systems; systems make up an organism.', 'Order: <b>' + right + '</b>.'] };
    }
    var set = R.pick(LEVSETS), ord = R.shuffle([0, 1, 2, 3]); while (ord.join('') === '0123') ord = R.shuffle([0, 1, 2, 3]);
    var rt = [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)); }).join('');
    return { q: 'Put these in order from smallest to largest level.<ol type="A">' + ord.map(function (i) { return '<li>' + set[i] + '</li>'; }).join('') + '</ol>', a: mc(rt, orderChoices(R, rt, 3)),
      hint: 'Find the single cell first.', steps: [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)) + ': ' + set[i] + ' (' + LV[i] + ')'; }).concat(['Order: <b>' + rt + '</b>.']) };
  });

  /* =================================== Unit 3: Classifying Life =================================== */

  /* ---------- 13. From Domain to Species ---------- */
  var PAIRS = [['lion', 'tiger'], ['lion', 'cat'], ['wolf', 'coyote'], ['wolf', 'redfox'], ['wolf', 'cat'], ['human', 'lion'], ['human', 'robin'], ['human', 'honeybee'], ['human', 'redoak'], ['cat', 'yeast'], ['tiger', 'cat'], ['coyote', 'redfox'], ['robin', 'honeybee'], ['honeybee', 'redoak']];
  function taxRow(k) { var t = B().TAXA[k]; return [cap(t.common)].concat(B().RANKS.map(function (r) { return r === 'species' ? '<i>' + t.genus.charAt(0) + '. ' + t.species + '</i>' : r === 'genus' ? '<i>' + t.genus + '</i>' : t[r]; })); }
  G('lifesci.classification-ranks', function (R, ctx) {
    var L = lv(ctx), RK = B().RANKS;
    if (L === 1) {
      if (R.coin()) { var i = R.int(0, 6), wr = R.sample(RK.filter(function (r, j) { return j !== i + 1 && j !== i; }), 3);
        return { q: 'Going from the broadest group to the narrowest, which rank comes right after <b>' + RK[i] + '</b>?', a: mc(cap(RK[i + 1]), wr.map(cap)), hint: 'Dear King Philip Came Over For Good Soup: domain, kingdom, phylum, class, order, family, genus, species.',
          steps: ['The ranks from broadest to narrowest: ' + RK.join(', ') + '.', 'Right after ' + RK[i] + ' comes <b>' + RK[i + 1] + '</b>.'] }; }
      var j = R.pick([0, 7]);
      return { q: 'Which rank is the ' + (j === 0 ? 'broadest, holding the most kinds of organisms' : 'narrowest, holding only one kind of organism') + '?', a: mc(cap(RK[j]), R.sample(RK.filter(function (r, k) { return k !== j; }), 3).map(cap)),
        hint: 'The list runs domain, kingdom, phylum, class, order, family, genus, species.', steps: ['The ranks from broadest to narrowest: ' + RK.join(', ') + '.', 'The ' + (j === 0 ? 'broadest' : 'narrowest') + ' is <b>' + RK[j] + '</b>.'] };
    }
    if (L === 2) { var a = R.int(1, 5), b = R.int(a + 1, 7), askMore = R.coin();
      return { q: 'Which rank holds ' + (askMore ? 'more' : 'fewer') + ' kinds of organisms: ' + (R.coin() ? an(RK[a]) + ' or ' + an(RK[b]) : an(RK[b]) + ' or ' + an(RK[a])) + '?', a: { t: 'mc', choices: [cap(RK[a]), cap(RK[b])], v: askMore ? 0 : 1, keep: true },
        hint: 'Broader ranks hold more kinds of organisms; each step down holds fewer that share more traits.',
        steps: ['From broadest to narrowest: ' + RK.join(', ') + '.', cap(RK[a]) + ' is broader than ' + RK[b] + ', so it holds more kinds of organisms.', 'So the answer is <b>' + (askMore ? RK[a] : RK[b]) + '</b>.'] }; }
    var p = R.pick(PAIRS), sr = B().sharedRank(p[0], p[1]), T = B().TAXA;
    var tab = table(['Organism'].concat(RK.map(cap)), [taxRow(p[0]), taxRow(p[1])]);
    return { q: 'Here are the classifications of the ' + T[p[0]].common + ' and the ' + T[p[1]].common + '.' + tab + 'What is the narrowest rank they share?', a: { t: 'mc', choices: RK.slice(0, 7).map(cap), v: RK.indexOf(sr), keep: true },
      hint: 'Read across from the left. Where do the two rows first differ?',
      steps: ['Reading from domain down, both rows match through ' + sr + ' (' + T[p[0]][sr] + ').', RK.indexOf(sr) < 7 ? 'At ' + RK[RK.indexOf(sr) + 1] + ' they differ: ' + (RK[RK.indexOf(sr) + 1] === 'kingdom' && !T[p[1]].kingdom ? T[p[0]].kingdom + ' and none' : T[p[0]][RK[RK.indexOf(sr) + 1]] + ' and ' + T[p[1]][RK[RK.indexOf(sr) + 1]]) + '.' : '', 'So the narrowest shared rank is <b>' + sr + '</b>. The more ranks two organisms share, the more closely related they are.'].filter(Boolean) };
  });

  /* ---------- 14. Scientific Names ---------- */
  var SP = [['gray wolf', 'Canis', 'lupus'], ['coyote', 'Canis', 'latrans'], ['red fox', 'Vulpes', 'vulpes'], ['lion', 'Panthera', 'leo'], ['tiger', 'Panthera', 'tigris'], ['house cat', 'Felis', 'catus'], ['human', 'Homo', 'sapiens'], ['American black bear', 'Ursus', 'americanus'], ['brown bear', 'Ursus', 'arctos'], ['polar bear', 'Ursus', 'maritimus'],
    ['American lobster', 'Homarus', 'americanus'], ['northern red oak', 'Quercus', 'rubra'], ['white oak', 'Quercus', 'alba'], ['red maple', 'Acer', 'rubrum'], ['western honey bee', 'Apis', 'mellifera'], ['American robin', 'Turdus', 'migratorius'], ['house sparrow', 'Passer', 'domesticus'], ['house fly', 'Musca', 'domestica'], ['Eurasian tree sparrow', 'Passer', 'montanus']];
  function spk(n) { return SP.filter(function (x) { return x[0] === n; })[0]; }
  var TRAPS = [['American black bear', 'American lobster', 'brown bear'], ['northern red oak', 'red maple', 'white oak'], ['house sparrow', 'house fly', 'Eurasian tree sparrow'], ['polar bear', 'American lobster', 'American black bear'], ['gray wolf', 'red fox', 'coyote'], ['lion', 'house cat', 'tiger']];
  function nm(x) { return x[1] + ' ' + x[2]; }
  G('lifesci.scientific-names', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var s = R.pick(SP), g = s[1], e = s[2];
      return { q: 'Which is the right way to write the scientific name of the ' + s[0] + '?', a: mc(g + ' ' + e, [g + ' ' + cap(e), g.toLowerCase() + ' ' + e, cap(e) + ' ' + g]),
        hint: 'Genus first, with a capital letter; then the species word, all lowercase.',
        steps: ['A scientific name has two parts: the genus, then the specific (species) name.', 'Only the genus starts with a capital letter, and the whole name is printed in italics: <i>' + g + ' ' + e + '</i>.'] }; }
    if (L === 2) { var t = R.pick(TRAPS), xs = t.map(spk), order = R.shuffle([0, 1, 2]), shown = order.map(function (i) { return xs[i]; });
      var gi = shown.map(function (x) { return x[1]; }), pair = [], lt = ['A', 'B', 'C'];
      for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (gi[i] === gi[j]) pair = [i, j];
      var right = lt[pair[0]] + ' and ' + lt[pair[1]], all = ['A and B', 'A and C', 'B and C'];
      return { q: 'Which two of these are most closely related?<ol type="A">' + shown.map(function (x) { return '<li><i>' + nm(x) + '</i> (' + x[0] + ')</li>'; }).join('') + '</ol>', a: mc(right, all.filter(function (x) { return x !== right; })),
        hint: 'Close relatives share the first word, the genus. A shared second word means nothing by itself.',
        steps: ['The genus (the first word) groups close relatives.', lt[pair[0]] + ' and ' + lt[pair[1]] + ' are both in the genus <i>' + gi[pair[0]] + '</i>.', 'The second word alone does not show kinship: many unrelated species share words like "americanus" (from America) or "rubra" (red).', 'So the answer is <b>' + right + '</b>.'] }; }
    if (R.coin()) { var s3 = R.pick(SP);
      return { q: 'The scientific name of the ' + s3[0] + ' is <i>' + nm(s3) + '</i>. What is its genus?', a: { t: 'text', v: [s3[1]] }, hint: 'The genus is the first word.',
        steps: ['In a scientific name, the first word is the genus and the second is the specific name.', 'So the genus is <b><i>' + s3[1] + '</i></b>.'] }; }
    var RK = B().RANKS, sameAt = R.pick(['genus', 'family']), idx = RK.indexOf(sameAt), cand = RK.filter(function (r) { return r !== sameAt; }), items = R.shuffle(R.sample(cand, 5).map(function (r) { return [r, RK.indexOf(r) < idx]; }));
    if (!items.some(function (x) { return x[1]; })) items[0] = [RK[idx - 1], true];
    if (items.every(function (x) { return x[1]; })) items[items.length - 1] = ['species', false];
    return { q: 'Two animals are in the same <b>' + sameAt + '</b>. Which other ranks must they also share? Choose all that are right.', a: mcAll(items),
      hint: 'Each rank sits inside the one above it, like boxes inside boxes.', steps: ['Every ' + sameAt + ' sits inside one ' + RK[idx - 1] + ', which sits inside one ' + RK[idx - 2] + ', and so on up to the domain.', 'So they must share every broader rank: ' + RK.slice(0, idx).join(', ') + '.', 'They may or may not share a narrower rank (' + RK.slice(idx + 1).join(', ') + ').', 'Right here: <b>' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join(', ') + '</b>.'] };
  });

  /* ---------- 15. Dichotomous Keys ---------- */
  // each key: steps [a text, a goes to, b text, b goes to]; a number is a step (1-based), a string is a THINGS key
  var KEYS = [
    { name: 'small animals', steps: [['It has legs', 2, 'It has no legs', 4], ['It has six legs', 3, 'It has eight legs', 'spider'], ['It has wings', 5, 'It has no wings', 'ant'], ['It has a shell', 'snail', 'It has no shell', 'worm'], ['Its wings are covered with colored scales', 'butterfly', 'Its wings are clear and its body is fuzzy and striped', 'bee']] },
    { name: 'vertebrates', steps: [['It has feathers', 2, 'It has no feathers', 3], ['It can fly', 4, 'It cannot fly and swims with flipper-like wings', 'penguin'], ['It has fur', 5, 'It has no fur', 6], ['It has a hooked beak and sharp talons', 'hawk', 'It has a flat bill and webbed feet', 'duck'], ['It has wings of skin and flies', 'bat', 'It has no wings', 7], ['It has dry, scaly skin', 'lizard', 'It has smooth, moist skin', 'frog'], ['It lives in the sea and has flippers', 'seal', 'It lives on land and has long back legs for hopping', 'rabbit']] }
  ];
  function walk(key, target) { // the path to target: [[step, side], ...]
    function go(s, path) { var st = key.steps[s - 1]; for (var side = 0; side < 2; side++) { var to = st[side * 2 + 1], p = path.concat([[s, side]]); if (to === target) return p; if (typeof to === 'number') { var r = go(to, p); if (r) return r; } } return null; }
    return go(1, []);
  }
  function leaves(key) { var out = []; key.steps.forEach(function (st) { [st[1], st[3]].forEach(function (t) { if (typeof t === 'string') out.push(t); }); }); return out; }
  function kviz(key) { return qv('bi-key', { steps: key.steps.map(function (st) { return { a: st[0], an: st[1], b: st[2], bn: st[3] }; }), specimens: [], label: 'A dichotomous key with numbered steps.' }); }
  function describe(key, path) { return path.map(function (ps) { return key.steps[ps[0] - 1][ps[1] * 2].replace(/^It /, '').replace(/^Its /, 'its '); }); }
  G('lifesci.dichotomous-keys', function (R, ctx) {
    var L = lv(ctx), key = R.pick(KEYS), T = B().THINGS, lf = leaves(key);
    var pick = function (minLen, maxLen) { var c = lf.filter(function (x) { var p = walk(key, x); return p.length >= minLen && p.length <= maxLen; }); return R.pick(c); };
    if (L === 1) { var t = pick(1, 3), path = walk(key, t), d = describe(key, path);
      return { q: 'Use the key. A specimen ' + ML.util.list(d) + '. What is it?', viz: kviz(key), a: mc(cap(T[t].name), R.sample(lf.filter(function (x) { return x !== t; }), 3).map(function (x) { return cap(T[x].name); })),
        hint: 'Start at step 1. Read both choices, pick the one that fits, and go where it sends you.',
        steps: path.map(function (ps) { var st = key.steps[ps[0] - 1], to = st[ps[1] * 2 + 1]; return 'Step ' + ps[0] + ': "' + st[ps[1] * 2] + '" fits, so ' + (typeof to === 'number' ? 'go to step ' + to + '.' : 'it is the <b>' + T[to].name + '</b>.'); }) }; }
    if (L === 2) { var t2 = pick(2, 4), p2 = walk(key, t2), k = R.int(0, p2.length - 2), at = p2[k], st2 = key.steps[at[0] - 1], next = st2[at[1] * 2 + 1];
      var opts = ['Step ' + next].concat(R.sample(key.steps.map(function (s, i) { return i + 1; }).filter(function (n) { return n !== next && n !== at[0]; }), 2).map(function (n) { return 'Step ' + n; })).concat([cap(T[t2].name) + ': you can name it now']);
      return { q: 'You are using the key for a specimen that ' + ML.util.list(describe(key, p2)) + '. You are at step ' + at[0] + '. Where do you go next?', viz: kviz(key), a: mc(opts[0], opts.slice(1)),
        hint: 'Read only the two choices at step ' + at[0] + '. Which one fits?', steps: ['At step ' + at[0] + ' the choices are "' + st2[0] + '" and "' + st2[2] + '".', 'The specimen fits "' + st2[at[1] * 2] + '".', 'That choice says to go to <b>step ' + next + '</b>. Naming it early skips steps and can lead you wrong.'] }; }
    var t3 = pick(3, 5), p3 = walk(key, t3), rightPath = p3.map(function (ps) { return ps[0]; }).join(' → ') + ' → ' + T[t3].name;
    var wrongs = [], others = lf.filter(function (x) { return x !== t3; });
    others.forEach(function (o) { var pp = walk(key, o); var s = pp.map(function (ps) { return ps[0]; }).join(' → ') + ' → ' + T[o].name; if (wrongs.indexOf(s) < 0) wrongs.push(s); });
    wrongs = R.sample(wrongs, 2).concat([p3.map(function (ps) { return ps[0]; }).join(' → ') + ' → ' + T[R.pick(others)].name]);
    return { q: 'A specimen ' + ML.util.list(describe(key, p3)) + '. Which steps of the key do you use, and what is it?', viz: kviz(key), a: mc(rightPath, wrongs),
      hint: 'Follow the specimen from step 1, writing down each step you visit.', steps: p3.map(function (ps) { var st = key.steps[ps[0] - 1], to = st[ps[1] * 2 + 1]; return 'Step ' + ps[0] + ': "' + st[ps[1] * 2] + '" → ' + (typeof to === 'number' ? 'step ' + to : T[to].name) + '.'; }).concat(['Path: <b>' + rightPath + '</b>.']) };
  });

  /* ---------- 16. Three Domains and the Kingdoms ---------- */
  var KDESC = { Bacteria: 'Single cells with no nucleus, found almost everywhere, from soil to your gut.', Archaea: 'Single cells with no nucleus, chemically different from bacteria; many live in very hot, salty or airless places.', Protista: 'Mostly single cells with a nucleus; some make their own food and some take it in.',
    Fungi: 'Cells with a nucleus and cell walls made of chitin; they absorb food from what they grow on.', Plantae: 'Many cells with a nucleus and cell walls of cellulose; they make food by photosynthesis.', Animalia: 'Many cells with a nucleus and no cell walls; they eat other living things.' };
  var KORG = [['a mushroom', 'Fungi'], ['baker\'s yeast', 'Fungi'], ['bread mold', 'Fungi'], ['an amoeba', 'Protista'], ['a paramecium', 'Protista'], ['kelp, a giant seaweed', 'Protista'], ['a moss', 'Plantae'], ['a fern', 'Plantae'], ['a pine tree', 'Plantae'], ['a sponge', 'Animalia'], ['a jellyfish', 'Animalia'], ['a spider', 'Animalia'], ['<i>E. coli</i>, a gut bacterium', 'Bacteria'], ['the bacteria that turn milk into yogurt', 'Bacteria'], ['microbes in a boiling hot spring that are not bacteria', 'Archaea']];
  var KNAME = { Bacteria: 'Bacteria', Archaea: 'Archaea', Protista: 'Protists', Fungi: 'Fungi', Plantae: 'Plants', Animalia: 'Animals' };
  G('lifesci.domains-kingdoms', function (R, ctx) {
    var L = lv(ctx), K = B().KINGDOMS, ks = Object.keys(KDESC);
    if (L === 1) {
      if (R.coin()) { var k = R.pick(ks);
        return { q: 'Which kingdom fits this description? ' + KDESC[k], a: mc(KNAME[k], R.sample(ks.filter(function (x) { return x !== k; }), 3).map(function (x) { return KNAME[x]; })), hint: 'Check: nucleus or not, one cell or many, and how it gets food.',
          steps: [KDESC[k], 'That describes the kingdom <b>' + KNAME[k] + '</b>' + (K[k].domain !== k ? ', in the domain ' + K[k].domain : '') + '.'] }; }
      var o = R.pick(KORG);
      return { q: 'Which kingdom does ' + o[0] + ' belong to?', a: mc(KNAME[o[1]], R.sample(ks.filter(function (x) { return x !== o[1]; }), 3).map(function (x) { return KNAME[x]; })), hint: 'Think about its cells and how it gets food.',
        steps: [KDESC[o[1]], 'So ' + o[0] + ' is in the kingdom <b>' + KNAME[o[1]] + '</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) { var f = R.pick(['a mushroom', 'a shelf fungus on a tree', 'a puffball']);
        return { q: cap(f) + ' grows in one place, like a plant. Which kingdom is it in, and why?', a: mc('Fungi: it has no chlorophyll, absorbs its food, and has cell walls of chitin.', ['Plants: it grows in one place and has cell walls.', 'Plants: it grows out of the ground.', 'Animals: it eats other living things with a mouth.']),
          hint: 'Can it make its own food?', steps: ['Fungi cannot make food: they have no chlorophyll.', 'They absorb food from what they grow on, and their cell walls are made of chitin, not cellulose.', 'So it is in the kingdom <b>Fungi</b>, even though it stays in one place.'] }; }
      return { q: 'Studies of DNA show which kingdom is most closely related to the fungi?', viz: qv('bi-tree', { tree: ['bacteria', ['archaea', ['plants', ['fungi', 'animals']]]], traits: false, label: 'A tree of life with five groups.' }), a: mc('Animals', ['Plants', 'Bacteria', 'Archaea']),
        hint: 'On the tree, which branch joins the fungi branch first?', steps: ['On the tree, the fungi branch joins the animals branch before it joins any other.', 'So fungi share a more recent common ancestor with <b>animals</b> than with plants.', 'Fungi and animals both get their food from other living things instead of making it.'] };
    }
    if (R.coin()) { var cases = [['one cell with no nucleus, living in a boiling hot spring and chemically unlike bacteria', 'Archaea'], ['one cell with a nucleus, swimming in pond water', 'Eukarya'], ['one cell with no nucleus, living in the soil and helping plants get nitrogen', 'Bacteria'], ['a yeast: one cell with a nucleus', 'Eukarya'], ['a mushroom: many cells, each with a nucleus', 'Eukarya'], ['a microbe with no nucleus that makes methane gas in a cow\'s stomach and is chemically unlike bacteria', 'Archaea']];
      var c = R.pick(cases);
      return { q: 'Which domain does this organism belong to? It is ' + c[0] + '.', a: { t: 'mc', choices: ['Bacteria', 'Archaea', 'Eukarya'], v: ['Bacteria', 'Archaea', 'Eukarya'].indexOf(c[1]), keep: true },
        hint: 'A nucleus means Eukarya, even for a single cell. No nucleus: Bacteria or Archaea.', steps: [c[1] === 'Eukarya' ? 'Its cells have a nucleus, so it is a eukaryote, whether it has one cell or many.' : 'It has no nucleus, so it is in Bacteria or Archaea.', c[1] === 'Archaea' ? 'It is chemically different from bacteria, so it is in Archaea.' : c[1] === 'Bacteria' ? 'It is a bacterium.' : 'Protists, fungi, plants and animals are all in Eukarya.', 'So the domain is <b>' + c[1] + '</b>.'] }; }
    var k3 = R.pick(['Protista', 'Fungi', 'Plantae', 'Animalia', 'Bacteria', 'Archaea']);
    return { q: 'Which domain holds the kingdom ' + KNAME[k3] + '?', a: { t: 'mc', choices: ['Bacteria', 'Archaea', 'Eukarya'], v: ['Bacteria', 'Archaea', 'Eukarya'].indexOf(K[k3].domain), keep: true },
      hint: 'Only one domain has cells with a nucleus.', steps: [KNAME[k3] + ': ' + KDESC[k3], 'So it is in the domain <b>' + K[k3].domain + '</b>.'] };
  });

  /* =================================== Unit 4: Microbes =================================== */

  /* ---------- 17. Bacteria ---------- */
  var BHELP = ['Breaking down dead plants and animals so their nutrients return to the soil', 'Turning milk into yogurt', 'Turning nitrogen from the air into a form plants can use', 'Helping break down food in the gut', 'Breaking down fallen leaves in a compost pile'];
  var BNOT = ['Making bread dough rise (that is yeast, a fungus)', 'Carrying out photosynthesis inside the leaves of an oak tree (that is done by chloroplasts)', 'Causing every illness people get', 'Making all the mushrooms in a forest'];
  var SHAPES = [['round (a sphere)', 'coccus'], ['rod-shaped', 'bacillus'], ['spiral', 'spirillum']];
  G('lifesci.bacteria', function (R, ctx) {
    var L = lv(ctx), O = B().ORGANELLES;
    if (L === 1) {
      if (R.chance(0.6)) { var p = R.pick(['wall', 'membrane', 'cytoplasm', 'nucleoid', 'ribosomes', 'flagellum']), names = ['wall', 'membrane', 'cytoplasm', 'nucleoid', 'ribosomes', 'flagellum'].map(function (k) { return cap(O[k].name); });
        return { q: 'What is the part marked "?" in this bacterium?', viz: qv('bi-cell', { type: 'bacterium', ask: p }), a: mc(cap(O[p].name), R.sample(names.filter(function (x) { return x !== cap(O[p].name); }), 3)),
          hint: 'Bacteria have a wall outside the membrane, loose DNA, tiny ribosomes, and sometimes a whip-like tail.', steps: ['The "?" marks the <b>' + O[p].name + '</b>.', 'It ' + job(O[p]) + '.'] }; }
      return { q: 'Where is the DNA in a bacterium?', a: mc('In a loop in the cytoplasm; there is no nucleus', ['Inside a nucleus', 'In the cell wall', 'In the mitochondria']), hint: 'Bacteria are the classic cells without a nucleus.',
        steps: ['A bacterium has no nucleus.', 'Its DNA lies in a loop in the cytoplasm, in an area called the nucleoid.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'True or false? Most kinds of bacteria make people sick.', a: tf(false), hint: 'Think of yogurt, soil and your gut.',
        steps: ['Only a small share of bacteria cause disease.', 'Most are harmless or helpful: they recycle dead matter, help plants get nitrogen and help digest food.', 'So the statement is <b>false</b>.'] };
      var h = R.pick(BHELP);
      return { q: 'Which of these is a job that bacteria do?', a: mc(h, R.sample(BNOT, 3)), hint: 'Watch out for jobs done by other living things.',
        steps: [h + ' is done by bacteria.', 'Bread rising is done by yeast (a fungus), and photosynthesis in leaves happens in chloroplasts.'] };
    }
    if (R.coin()) { var s = R.pick(SHAPES);
      return { q: 'A bacterium that is ' + s[0] + ' is called a …', a: mc(cap(s[1]), SHAPES.filter(function (x) { return x !== s; }).map(function (x) { return cap(x[1]); }).concat(['Nucleus'])),
        hint: 'Coccus means berry, bacillus means little rod.', steps: ['Bacteria come in three main shapes: round (coccus), rod (bacillus) and spiral (spirillum).', 'So a ' + s[0].replace(/ \(.*\)/, '') + ' bacterium is a <b>' + s[1] + '</b>.'] }; }
    var miss = R.pick(['A nucleus', 'Mitochondria', 'Chloroplasts']), has = R.sample(['A cell membrane', 'Ribosomes', 'DNA', 'Cytoplasm', 'A cell wall'], 3);
    return { q: 'Which of these does a bacterium <b>not</b> have?', a: mc(miss, has), hint: 'Bacteria have no membrane-covered organelles inside.',
      steps: ['A bacterium has a cell membrane, cytoplasm, DNA, ribosomes and usually a cell wall.', 'It has no nucleus and no membrane-covered organelles like mitochondria or chloroplasts.', 'So the answer is <b>' + miss.toLowerCase() + '</b>.'] };
  });

  /* ---------- 18. How Bacteria Multiply ---------- */
  G('lifesci.bacteria-growth', function (R, ctx) {
    var L = lv(ctx), D = B().doubling;
    if (L === 1) { var n = R.int(3, 10), N = D(1, n);
      return { q: 'One bacterium divides into two every generation. If nothing runs out, how many bacteria are there after ' + n + ' generations?', viz: qv('bi-population', { model: 'doubling', gens: n, N0: 1 }), a: num(N), unit: 'bacteria',
        hint: 'Double the number ' + n + ' times: 1, 2, 4, 8, …', steps: ['Each generation the number doubles.', 'After ' + n + ' generations: $2^{' + n + '} = ' + commas(N) + '$.', 'So there are <b>' + commas(N) + '</b> bacteria.'] }; }
    if (L === 2) {
      var sh = R.int(0, 2);
      if (sh === 0) { var g = R.int(4, 7), N0 = R.pick([2, 3, 5, 10]), add = N0 + 2 * g, right = D(N0, g);
        return { q: 'A dish starts with ' + N0 + ' bacteria, and the number doubles each generation. Ravi says that after ' + g + ' generations there will be ' + add + ' (adding 2 each time). How many will there really be?', a: num(right), unit: 'bacteria',
          hint: 'Doubling means multiplying by 2 each time, not adding 2.', steps: ['Doubling multiplies by 2 each generation.', ['$' + N0 + '$'].concat([1, 2, 3, 4, 5, 6, 7].slice(0, g).map(function (i) { return '$' + commas(D(N0, i)) + '$'; })).join(', ') + '.', 'Or in one step: $' + N0 + ' \\times 2^{' + g + '} = ' + commas(right) + '$.', 'Adding 2 each time gives only ' + add + '.'] }; }
      var t = R.pick([20, 30]), H = R.pick(t === 20 ? [1, 2, 3] : [1, 2, 3, 4]), gens = 60 * H / t, N1 = R.pick([1, 2, 5, 10, 100]), res = D(N1, gens);
      return { q: 'In warm broth, a kind of bacteria divides every ' + t + ' minutes. A sample starts with ' + N1 + ' bacteri' + (N1 === 1 ? 'um' : 'a') + '. How many are there after ' + H + ' hour' + (H > 1 ? 's' : '') + ', if food and space do not run out?', a: num(res), unit: 'bacteria',
        hint: 'First find how many generations fit in ' + H + ' hour' + (H > 1 ? 's' : '') + '.', steps: ['Generations: $' + 60 * H + ' \\div ' + t + ' = ' + gens + '$.', 'Number: $' + N1 + ' \\times 2^{' + gens + '} = ' + N1 + ' \\times ' + commas(Math.pow(2, gens)) + ' = ' + commas(res) + '$.', 'So there are <b>' + commas(res) + '</b> bacteria.'] };
    }
    if (R.coin()) { var N2 = R.pick([1, 2, 3, 5, 10]), g2 = R.int(3, 10), target = D(N2, g2), t2 = R.pick([20, 30]), askTime = R.coin();
      return { q: 'A sample starts with ' + N2 + ' bacteri' + (N2 === 1 ? 'um' : 'a') + ' that divide every ' + t2 + ' minutes. How many ' + (askTime ? 'minutes' : 'generations') + ' until there are ' + commas(target) + '?', a: num(askTime ? g2 * t2 : g2), unit: askTime ? 'minutes' : 'generations',
        hint: 'How many times must you double ' + N2 + ' to reach ' + commas(target) + '?', steps: ['$' + commas(target) + ' \\div ' + N2 + ' = ' + commas(target / N2) + '$, and $' + commas(target / N2) + ' = 2^{' + g2 + '}$.', 'So it takes ' + g2 + ' generations.', askTime ? 'Time: $' + g2 + ' \\times ' + t2 + ' = ' + g2 * t2 + '$ minutes.' : 'The answer is <b>' + g2 + '</b> generations.'] }; }
    return { q: 'Bacteria in a dish of broth double again and again, but after a day their number stops growing. Why?', viz: qv('bi-population', { model: 'logistic', label: 'A growth curve that rises steeply, then levels off.' }),
      a: mc('Food and space run out and wastes build up, so fewer divide and more die.', ['Bacteria can only divide a fixed number of times in their lives.', 'They grow too big to divide.', 'They turn into viruses.']), hint: 'What does each new bacterium need?',
      steps: ['Each bacterium needs food and space, and each one adds wastes.', 'As the dish fills, food runs low and wastes build up, so division slows and deaths rise.', 'The number levels off: real populations cannot double forever.'] };
  });

  /* ---------- 19. Viruses ---------- */
  var VTF = [['A virus is a cell.', false, 'A virus is genetic material in a protein coat. It has no membrane, cytoplasm or ribosomes of its own.'], ['A virus can make copies of itself only inside a living host cell.', true, 'It uses the host cell\'s parts to build new viruses.'], ['Viruses are much smaller than bacteria.', true, 'Most viruses are about 20 to 300 nanometers across; a bacterium like E. coli is about 1,000 to 2,000 nanometers long.'],
    ['A virus is made of genetic material inside a protein coat.', true, 'That is the basic plan of every virus.'], ['A virus eats food and grows bigger before it divides.', false, 'A virus does not eat or grow. Its copies are assembled inside a host cell.']];
  G('lifesci.viruses', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var s = R.pick(VTF);
      var pr = { q: 'True or false? ' + s[0], a: tf(s[1]), hint: 'A virus is a coat of protein around genetic material.', steps: [s[2], 'So it is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
      if (R.coin()) pr.viz = { name: 'lifesci-scale', opts: { view: 'virus', quiet: true, interactive: false } };
      return pr; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'Do antibiotics act on viruses?', a: mc('No. Antibiotics act on bacteria; viruses are not cells and have none of the parts antibiotics attack.', ['Yes. Antibiotics kill every kind of germ.', 'Yes, because a virus is a small bacterium.', 'Only on viruses that are large.']),
        hint: 'Antibiotics attack parts of bacterial cells, like their walls or ribosomes.', steps: ['Antibiotics work by damaging parts of bacterial cells, such as the cell wall or ribosomes.', 'A virus has no cell wall and no ribosomes of its own.', 'So antibiotics <b>do not act on viruses</b> (CDC).'] };
      if (sh === 1) return { q: 'True or false? A virus is just a very small bacterium.', a: tf(false), hint: 'Is a virus a cell?', steps: ['A bacterium is a living cell with a membrane, cytoplasm and ribosomes.', 'A virus is not a cell: it is genetic material in a protein coat, far smaller.', 'So the statement is <b>false</b>.'] };
      return { q: 'Do all scientists agree on whether viruses are alive?', a: mc('No. It is still debated, because viruses are not cells and cannot copy themselves outside a host cell.', ['Yes. All scientists agree that viruses are alive.', 'Yes. All scientists agree that viruses are not alive.', 'No, because no one has ever seen a virus.']),
        hint: 'Which characteristics of life does a virus show, and which does it lack?', steps: ['Viruses have genetic material and can change over time.', 'But they are not made of cells, do not use energy on their own, and copy themselves only inside host cells.', 'So scientists <b>still debate</b> whether to call them alive.'] };
    }
    if (R.coin()) { var Lb = R.pick([1, 2, 3, 4]), d = R.pick([20, 50, 100, 200, 250].filter(function (x) { return (Lb * 1000) % x === 0; })), n = Lb * 1000 / d;
      return { q: 'A bacterium is ' + Lb + ' µm long. A virus is ' + d + ' nanometers (nm) across. About how many of these viruses would fit in a row along the bacterium? (1 µm = 1,000 nm)', viz: { name: 'lifesci-scale', opts: { view: 'virus', interactive: false } }, a: num(n), unit: 'viruses',
        hint: 'Change the bacterium\'s length to nanometers first.', steps: ['Bacterium: $' + Lb + ' \\times 1000 = ' + commas(Lb * 1000) + '$ nm.', 'Viruses in a row: $' + Lb * 1000 + ' \\div ' + d + ' = ' + n + '$.', 'So about <b>' + n + '</b> viruses fit along it.'] }; }
    var hasB = R.sample(['A cell membrane', 'Ribosomes', 'Cytoplasm'], 2), both = ['Genetic material (DNA or RNA)'], items = R.shuffle(hasB.map(function (x) { return [x, true]; }).concat([[both[0], false], ['A protein coat around its genes', false]]));
    return { q: 'Which of these does a bacterium have that a virus does <b>not</b>? Choose all that are right.', a: mcAll(items), hint: 'Both carry genes. Only one is a cell.',
      steps: ['A bacterium is a cell: it has a membrane, cytoplasm and ribosomes.', 'A virus has only genetic material in a protein coat (a bacterium has genes too, but no protein coat).', 'So the right ones are: <b>' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0].toLowerCase(); }).join(', ') + '</b>.'] };
  });

  /* ---------- 20. Protists ---------- */
  var PROT = [['an amoeba', 'Animal-like', 'It moves and engulfs food with its pseudopods (false feet).'], ['a paramecium', 'Animal-like', 'It swims with cilia and sweeps food into an opening.'], ['a diatom', 'Plant-like', 'It makes food by photosynthesis inside a glassy shell.'], ['kelp, a giant seaweed', 'Plant-like', 'It is a many-celled alga that makes food by photosynthesis.'], ['green algae in a pond', 'Plant-like', 'They make food by photosynthesis.'], ['a water mold', 'Fungus-like', 'It absorbs food from what it grows on, like a fungus.'], ['a slime mold', 'Fungus-like', 'It feeds on decaying matter and makes spores, like a fungus.']];
  var MOVE = [['an amoeba', 'pseudopods (false feet)'], ['a paramecium', 'cilia (many tiny hairs)'], ['a euglena', 'a flagellum (one whip-like tail)']];
  G('lifesci.protists', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1 && R.coin()) { var pp = R.pick(PROT), wr = R.sample(['a bacterium', 'a mushroom', 'a moss', 'a sponge', 'a yeast cell', 'a fern', 'an earthworm'], 3);
      return { q: 'Which of these is a protist?', a: mc(cap(pp[0]), wr.map(cap)), hint: 'Protists are mostly single cells with a nucleus that are not plants, animals or fungi.',
        steps: [cap(pp[0]) + ' is a protist: ' + pp[2], 'Bacteria have no nucleus; yeast and mushrooms are fungi; mosses and ferns are plants; sponges and earthworms are animals.'] }; }
    if (L === 1) { var p = R.pick(PROT);
      return { q: 'Which kind of protist is ' + p[0] + '?', a: { t: 'mc', choices: ['Animal-like', 'Plant-like', 'Fungus-like'], v: ['Animal-like', 'Plant-like', 'Fungus-like'].indexOf(p[1]), keep: true }, hint: 'Does it hunt and move, make food from light, or absorb food?',
        steps: [cap(p[0]) + ': ' + p[2].charAt(0).toLowerCase() + p[2].slice(1), 'So it is ' + an(p[1].toLowerCase()) + ' protist.'] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'A student sees a single-celled organism with a nucleus in pond water and calls it a bacterium. What is it more likely to be?', a: mc('A protist, because bacteria have no nucleus', ['A bacterium, because it has one cell', 'A virus, because it is tiny', 'A plant, because it lives in water']),
        hint: 'Which kinds of single cells have a nucleus?', steps: ['Bacteria never have a nucleus.', 'A single cell with a nucleus in pond water is most likely a <b>protist</b> (it could also be a yeast, a fungus).'] };
      if (sh === 1) return { q: 'True or false? Every living thing too small to see without a microscope is a bacterium.', a: tf(false), hint: 'Think of amoebas and yeast.', steps: ['Many tiny organisms are protists or fungi, with a nucleus.', 'Protists are often much larger than bacteria.', 'So the statement is <b>false</b>.'] };
      return { q: 'What do protists have that bacteria do not?', a: mc('A nucleus', ['A cell membrane', 'DNA', 'Ribosomes']), hint: 'Protists are in the domain Eukarya.', steps: ['Protists are eukaryotes: their DNA is inside a nucleus.', 'Bacteria have a membrane, DNA and ribosomes, but <b>no nucleus</b>.'] };
    }
    if (R.coin()) { var m = R.pick(MOVE);
      return { q: 'How does ' + m[0] + ' move?', a: mc('With ' + m[1], MOVE.filter(function (x) { return x !== m; }).map(function (x) { return 'With ' + x[1]; }).concat(['With legs'])), hint: 'Amoeba: false feet. Paramecium: many hairs. Euglena: one tail.',
        steps: ['Amoebas use pseudopods, paramecia use cilia, and euglenas use a flagellum.', 'So ' + m[0] + ' moves <b>with ' + m[1] + '</b>.'] }; }
    var d = R.pick([['It has chloroplasts and makes its own food from light.', 'Plant-like'], ['It hunts smaller cells and swallows them.', 'Animal-like'], ['It grows on dead matter and absorbs food from it.', 'Fungus-like'], ['It swims after bacteria with its cilia.', 'Animal-like'], ['It is green and floats near the surface of a pond, using sunlight.', 'Plant-like']]);
    return { q: 'A protist is described this way: ' + d[0] + ' Which kind of protist is it?', a: { t: 'mc', choices: ['Animal-like', 'Plant-like', 'Fungus-like'], v: ['Animal-like', 'Plant-like', 'Fungus-like'].indexOf(d[1]), keep: true },
      hint: 'How does it get food?', steps: ['Protists are grouped by how they get food: hunting (animal-like), photosynthesis (plant-like) or absorbing (fungus-like).', 'This one is <b>' + d[1].toLowerCase() + '</b>.'] };
  });

  /* ---------- 21. Fungi ---------- */
  G('lifesci.fungi', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'How do fungi get their food?', a: mc('They absorb it from what they grow on', ['They make it by photosynthesis', 'They catch and swallow it', 'They get it from sunlight']), hint: 'Think of mold on old bread.',
        steps: ['Fungi release juices that break down what they grow on.', 'Then they <b>absorb</b> the food through their cells.'] };
      if (sh === 1) return { q: 'Which fungus is made of a single cell?', a: mc('Yeast', ['A mushroom', 'Bread mold', 'A shelf fungus']), hint: 'One of these is used to make bread rise.', steps: ['Mushrooms and molds are made of many threadlike cells.', '<b>Yeast</b> lives as single cells.'] };
      var role = R.pick(['forest', 'meadow']);
      return { q: 'In this food web, what role does the mushroom play?', viz: qv('bi-foodweb', { web: role, label: 'A food web with decomposers.' }), a: mc('Decomposer: it breaks down dead matter and returns nutrients to the soil', ['Producer: it makes food from sunlight', 'Herbivore: it eats living plants', 'Predator: it hunts animals']),
        hint: 'What does a mushroom feed on?', steps: ['Mushrooms grow on dead logs, leaves and soil.', 'They break down dead matter and return its nutrients to the soil: they are <b>decomposers</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'Is a mushroom a plant?', a: mc('No. It has no chlorophyll, cannot make food, and has cell walls of chitin.', ['Yes, because it grows in the ground.', 'Yes, because it does not move.', 'No, because it is an animal.']), hint: 'Can a mushroom make its own food?',
        steps: ['Plants make food by photosynthesis; mushrooms have no chlorophyll and cannot.', 'Fungi absorb their food, and their cell walls are made of chitin, not cellulose.', 'So a mushroom is <b>not a plant</b>; it is a fungus.'] };
      return { q: 'True or false? The mushroom you see is the whole fungus.', a: tf(false), hint: 'What is under the ground or inside the log?', steps: ['Most of a fungus is a network of thin threads (hyphae) spreading through the soil or wood.', 'The mushroom is only the part that makes spores.', 'So the statement is <b>false</b>.'] };
    }
    var u = R.pick([['Yeast in bread dough', 'gives off carbon dioxide gas, which makes the dough rise'], ['The mold <i>Penicillium</i>', 'makes penicillin, an antibiotic that Alexander Fleming discovered in 1928'], ['Fungi on a fallen log', 'break down the wood and return nutrients to the soil'], ['Fungi in a compost pile', 'break down food scraps and leaves']]);
    var wr = ['makes oxygen by photosynthesis', 'eats insects that land on it', 'stores sunlight for winter'];
    return { q: cap(u[0]) + ' is useful because it …', a: mc(u[1], wr), hint: 'Fungi break things down and release substances.', steps: [cap(u[0]) + ' ' + u[1] + '.', 'Fungi never photosynthesize; they absorb food and release gases and other substances.'] };
  });

  /* ---------- 22. Helpful and Harmful Microbes ---------- */
  var HELP = ['Bacteria turn milk into yogurt.', 'Yeast makes bread dough rise.', 'Bacteria and fungi break down dead leaves into nutrients in the soil.', 'Bacteria in root bumps of bean plants turn nitrogen from the air into a form plants use.', 'Bacteria in the gut help break down food.', 'A mold makes the medicine penicillin.'];
  var HARM = ['A bacterium causes strep throat.', 'A virus causes the common cold.', 'A virus causes the flu.', 'A fungus causes athlete\'s foot.', 'A protist causes malaria.', 'Mold grows on bread and spoils it.'];
  var DIS = [['strep throat', 'Bacterium'], ['tuberculosis', 'Bacterium'], ['the common cold', 'Virus'], ['the flu', 'Virus'], ['chickenpox', 'Virus'], ['athlete\'s foot', 'Fungus'], ['ringworm (a skin rash)', 'Fungus'], ['malaria', 'Protist']];
  G('lifesci.helpful-harmful-microbes', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1 && R.coin()) { var nh = R.int(1, 3), its = R.shuffle(R.sample(HELP, nh).map(function (x) { return [x, true]; }).concat(R.sample(HARM, 4 - nh).map(function (x) { return [x, false]; })));
      return { q: 'Which of these microbes are <b>helpful</b> to people? Choose all that are right.', a: mcAll(its), hint: 'Helpful microbes make food or medicine, or recycle nutrients.',
        steps: ['Helpful: ' + its.filter(function (x) { return x[1]; }).map(function (x) { return x[0].replace(/\.$/, ''); }).join('; ') + '.', 'Harmful: ' + its.filter(function (x) { return !x[1]; }).map(function (x) { return x[0].replace(/\.$/, ''); }).join('; ') + '.'] }; }
    if (L === 1) { var help = R.coin(), s = help ? R.pick(HELP) : R.pick(HARM);
      return { q: s + ' Is this microbe helpful or harmful to people?', a: { t: 'mc', choices: ['Helpful', 'Harmful'], v: help ? 0 : 1, keep: true }, hint: 'Does it make something we use, or cause a problem?',
        steps: [help ? 'This microbe makes something useful or recycles nutrients.' : 'This microbe causes illness or spoils food.', 'So it is <b>' + (help ? 'helpful' : 'harmful') + '</b>. Most microbes are harmless or helpful; a few cause harm.'] }; }
    if (L === 2) {
      if (R.coin()) { var d = R.pick(DIS);
        return { q: 'Could an antibiotic act on what causes ' + d[0] + '?', a: { t: 'mc', choices: ['Yes', 'No'], v: d[1] === 'Bacterium' ? 0 : 1, keep: true }, hint: 'First decide what kind of microbe causes it.',
          steps: [cap(d[0]) + ' is caused by ' + an(d[1].toLowerCase()) + '.', 'Antibiotics act on bacteria only; they do nothing against viruses, and fungi and protists are treated with other kinds of medicine.', 'So the answer is <b>' + (d[1] === 'Bacterium' ? 'yes' : 'no') + '</b>.'] }; }
      return { q: 'What does washing hands with soap and water do?', a: mc('It removes many germs from the hands.', ['It makes hands free of all microbes for the rest of the day.', 'It works only on viruses.', 'Nothing; water alone does the same job.']), hint: 'Soap lifts dirt and microbes off the skin.',
        steps: ['Soap lifts dirt and microbes off the skin so water can rinse them away.', 'The CDC says washing with soap removes germs much better than water alone.', 'It <b>removes many germs</b>, though more will land on your hands later.'] };
    }
    var d3 = R.pick(DIS);
    return { q: 'What kind of microbe causes ' + d3[0] + '?', a: { t: 'mc', choices: ['Bacterium', 'Virus', 'Fungus', 'Protist'], v: ['Bacterium', 'Virus', 'Fungus', 'Protist'].indexOf(d3[1]), keep: true },
      hint: 'Colds, flu and chickenpox are viral; strep and tuberculosis are bacterial; athlete\'s foot is a fungus; malaria is a protist.', steps: [cap(d3[0]) + ' is caused by ' + an(d3[1].toLowerCase()) + '.', 'Knowing the kind of microbe matters: antibiotics act on bacteria only.'] };
  });

  /* =================================== Unit 5: Plants =================================== */

  /* ---------- 23. Photosynthesis ---------- */
  var PH_KEYS = { light: 'Light energy', co2: 'Carbon dioxide', water: 'Water', o2: 'Oxygen', sugar: 'Sugar (glucose)' };
  G('lifesci.photosynthesis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var k = R.pick(Object.keys(PH_KEYS)), names = Object.keys(PH_KEYS).map(function (x) { return PH_KEYS[x]; });
        return { q: 'This picture shows what goes into and comes out of a leaf during photosynthesis. What does the arrow marked "?" stand for?', viz: qv('bi-plant', { mode: 'photo', ask: k }), a: mc(PH_KEYS[k], R.sample(names.filter(function (x) { return x !== PH_KEYS[k]; }), 3)),
          hint: 'In: light, carbon dioxide (through the leaf) and water (up from the roots). Out: oxygen. Kept: sugar.',
          steps: ['Photosynthesis takes in light energy, carbon dioxide and water, and makes sugar and oxygen.', 'The "?" arrow is <b>' + PH_KEYS[k].toLowerCase() + '</b>.'] }; }
      var askIn = R.coin(), ins = ['Carbon dioxide', 'Water'], outs = ['Oxygen', 'Sugar (glucose)'], right = R.pick(askIn ? ins : outs);
      return { q: 'Which of these is ' + (askIn ? 'a raw material (input)' : 'a product (output)') + ' of photosynthesis?', a: mc(right, (askIn ? outs : ins).concat(['Soil'])), hint: 'Carbon dioxide + water + light → sugar + oxygen.',
        steps: ['Carbon dioxide + water (+ light energy) → sugar + oxygen.', 'So ' + right.toLowerCase() + ' is ' + (askIn ? 'an input' : 'an output') + '.'] };
    }
    if (L === 2) { var years = R.int(4, 8), gain = R.int(30, 90), lost = R.int(30, 90), share = lost / (gain * 1000) * 100;
      return { q: 'A young tree is planted in a big tub of dried, weighed soil. For ' + years + ' years it gets only rainwater. The tree gains ' + gain + ' kg, but the soil loses only ' + lost + ' g. Where did most of the tree\'s new mass come from?',
        a: mc('Carbon dioxide from the air, plus water', ['The soil', 'Sunlight', 'Minerals in the rainwater']), hint: 'The soil lost almost nothing. What else did the tree take in? Light carries energy, not mass.',
        steps: ['The soil lost $' + lost + '$ g, which is about $' + fmtN(+share.toFixed(2)) + '\\%$ of the $' + gain + '$ kg the tree gained.', 'Light is energy; it adds no mass.', 'In photosynthesis the tree builds sugar, and then wood and leaves, from <b>carbon dioxide from the air and water</b>.', 'Jan Baptist van Helmont did an experiment like this with a willow in the 1600s.'] }; }
    var g = R.int(2, 9), sh = R.int(0, 2);
    if (sh === 0) return { q: 'The equation for photosynthesis is ' + B().PHOTO.eq + '. How many molecules of oxygen are given off when a leaf makes ' + g + ' molecules of glucose?', a: num(6 * g), unit: 'molecules',
      hint: 'Each glucose comes with 6 oxygen molecules.', steps: ['One glucose comes with 6 molecules of O₂.', '$' + g + ' \\times 6 = ' + 6 * g + '$.', 'So <b>' + 6 * g + '</b> molecules of oxygen.'] };
    if (sh === 1) return { q: 'The equation for photosynthesis is ' + B().PHOTO.eq + '. How many molecules of carbon dioxide does a leaf use to make ' + g + ' molecules of glucose?', a: num(6 * g), unit: 'molecules',
      hint: 'Each glucose needs 6 carbon dioxide molecules.', steps: ['One glucose needs 6 molecules of CO₂ (its 6 carbon atoms come from them).', '$' + g + ' \\times 6 = ' + 6 * g + '$.', 'So <b>' + 6 * g + '</b> molecules of carbon dioxide.'] };
    return { q: 'The equation for photosynthesis is ' + B().PHOTO.eq + '. A leaf uses ' + 6 * g + ' molecules of carbon dioxide. How many molecules of glucose can it make?', a: num(g), unit: 'molecules',
      hint: 'It takes 6 carbon dioxide molecules for each glucose.', steps: ['6 molecules of CO₂ make 1 glucose.', '$' + 6 * g + ' \\div 6 = ' + g + '$.', 'So <b>' + g + '</b> molecules of glucose.'] };
  });

  /* ---------- 24. Cellular Respiration ---------- */
  G('lifesci.cellular-respiration', function (R, ctx) {
    var L = lv(ctx), RS = B().RESP;
    if (L === 1) { var sh = R.int(0, 2);
      if (sh === 0) { var askIn = R.coin(), ins = ['Glucose (sugar)', 'Oxygen'], outs = ['Carbon dioxide', 'Water'], right = R.pick(askIn ? ins : outs);
        return { q: 'Which of these is ' + (askIn ? 'an input' : 'a waste product') + ' of cellular respiration?', a: mc(right, (askIn ? outs : ins).concat(['Light'])), hint: 'Sugar + oxygen → carbon dioxide + water + energy.',
          steps: ['Glucose + oxygen → carbon dioxide + water + energy (ATP).', 'So ' + right.toLowerCase() + ' is ' + (askIn ? 'an input' : 'an output') + '.'] }; }
      if (sh === 1) return { q: 'In which organelle does most of cellular respiration happen?', a: mc('Mitochondria', ['Chloroplasts', 'Nucleus', 'Cell wall']), hint: 'Which organelle releases energy from food?',
        steps: ['Cellular respiration releases the energy in sugar.', 'Most of it happens in the <b>mitochondria</b>, in plant and animal cells alike.'] };
      var m = R.pick(['oxygen', 'carbon dioxide', 'water']);
      return { q: 'This picture shows a mitochondrion. What is the molecule marked "?"', viz: qv('bi-energy', { mode: 'resp', ask: m }), a: mc(cap(m), ['Oxygen', 'Carbon dioxide', 'Water', 'Glucose (sugar)'].filter(function (x) { return x.toLowerCase() !== m; })),
        hint: 'Inputs: glucose and oxygen. Outputs: carbon dioxide, water and ATP.', steps: [RS.eq, 'The "?" marks <b>' + m + '</b>, ' + (m === 'oxygen' ? 'an input' : 'an output') + '.'] };
    }
    if (L === 2) { var sh2 = R.int(0, 2);
      if (sh2 === 0) return { q: 'Do plant cells carry out cellular respiration?', a: mc('Yes, all the time, day and night', ['No. Plants do photosynthesis instead.', 'Only at night, when photosynthesis stops', 'Only in their flowers']),
        hint: 'Every living cell needs a steady supply of energy.', steps: ['Every living cell, plant cells included, needs energy all the time.', 'Plant cells release it from sugar by cellular respiration, <b>day and night</b>.', 'In daylight, photosynthesis happens too, often faster, so the leaf gives off more oxygen than it uses.'] };
      if (sh2 === 1) return { q: 'True or false? Cellular respiration is another word for breathing.', a: tf(false), hint: 'Where does cellular respiration happen?', steps: ['Breathing moves air in and out of the lungs.', 'Cellular respiration is a chemical process inside every cell that uses oxygen to release energy from sugar.', 'Breathing brings in the oxygen that respiration uses, but they are different. The statement is <b>false</b>.'] };
      var org = R.pick(['a mushroom', 'a yeast cell', 'an earthworm', 'a pine tree', 'a goldfish', 'a moss', 'a person']);
      return { q: 'Does ' + org + ' carry out cellular respiration?', a: yn(true), hint: 'Which living things need energy?', steps: ['Almost every living cell releases energy from food by cellular respiration.', 'So yes, ' + org + ' does.'] };
    }
    if (R.coin()) { var g = R.int(2, 9), what = R.pick([['oxygen molecules are used', 'O₂'], ['carbon dioxide molecules are given off', 'CO₂'], ['water molecules are made', 'H₂O']]);
      return { q: 'The equation for cellular respiration is ' + B().RESP.eq + '. When a cell breaks down ' + g + ' molecules of glucose, how many ' + what[0] + '?', a: num(6 * g), unit: 'molecules',
        hint: 'Each glucose goes with 6 of each of the others.', steps: ['One glucose goes with 6 molecules of ' + what[1] + '.', '$' + g + ' \\times 6 = ' + 6 * g + '$.', 'So <b>' + 6 * g + '</b>.'] }; }
    var jar = R.pick([['a bean plant, kept in a dark closet', 'It goes up.', 'In the dark the plant cannot photosynthesize, but its cells keep respiring and giving off carbon dioxide.'], ['a few germinating (sprouting) pea seeds', 'It goes up.', 'Sprouting seeds are living and growing fast; they respire and give off carbon dioxide.'], ['a small lump of bread dough made with yeast', 'It goes up.', 'Yeast cells break down sugar and give off carbon dioxide.'], ['some boiled (dead) pea seeds', 'It stays about the same.', 'Dead seeds do not respire, so nothing adds carbon dioxide.']]);
    return { q: 'A sealed jar holds ' + jar[0] + '. What happens to the amount of carbon dioxide in the jar over a day?', a: mc(jar[1], ['It goes up.', 'It goes down.', 'It stays about the same.'].filter(function (x) { return x !== jar[1]; })),
      hint: 'Which process is going on, if any?', steps: [jar[2], 'So: <b>' + jar[1].toLowerCase() + '</b>'] };
  });

  /* ---------- 25. Photosynthesis and Respiration Together ---------- */
  G('lifesci.photo-resp-together', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var c = R.pick([['the oxygen given off by photosynthesis', 'Cellular respiration'], ['the sugar made by photosynthesis', 'Cellular respiration'], ['the carbon dioxide given off by respiration', 'Photosynthesis'], ['the water made by respiration', 'Photosynthesis']]);
      return { q: 'Which process uses ' + c[0] + ' as an input?', viz: qv('bi-energy', { mode: 'both', label: 'Photosynthesis and respiration as a cycle.' }), a: { t: 'mc', choices: ['Photosynthesis', 'Cellular respiration'], v: c[1] === 'Photosynthesis' ? 0 : 1, keep: true },
        hint: 'The outputs of one are the inputs of the other.', steps: ['Photosynthesis: carbon dioxide + water + light → sugar + oxygen.', 'Respiration: sugar + oxygen → carbon dioxide + water + energy.', 'So ' + c[0] + ' is used by <b>' + c[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'Which statement is right?', a: mc('Photosynthesis happens in chloroplasts and needs light; respiration happens in mitochondria, day and night.', ['Both happen in the chloroplasts.', 'Respiration needs light; photosynthesis does not.', 'Plants do photosynthesis and animals do respiration, never both.']),
        hint: 'They form a cycle, but they happen in different places.', steps: ['Photosynthesis: chloroplasts, only in light.', 'Respiration: mitochondria, all the time.', 'Plant cells do both.'] };
      if (sh === 1) { var t = R.pick(['at midnight', 'in a dark cupboard', 'before sunrise']);
        return { q: 'Which process is going on in a leaf cell ' + t + '?', a: mc('Only cellular respiration', ['Only photosynthesis', 'Both, at full speed', 'Neither']), hint: 'Which process needs light?',
          steps: ['Photosynthesis needs light, so it stops in the dark.', 'Respiration goes on all the time.', 'So: <b>only cellular respiration</b>.'] }; }
      return { q: 'Which organisms carry out cellular respiration?', a: mc('Nearly all living things: plants, animals, fungi and most microbes', ['Only animals', 'Only animals and fungi', 'Only things that breathe with lungs']), hint: 'Which living things need energy from food?',
        steps: ['Every cell needs energy, and nearly all living things get it by respiration.', 'Only plants, algae and some bacteria also do photosynthesis.'] };
    }
    var setups = [['a water plant under a bright lamp', 'It goes down.', 'In bright light the plant photosynthesizes faster than it respires, so it uses up more carbon dioxide than it gives off.'], ['a water plant in the dark', 'It goes up.', 'With no light, only respiration happens, which gives off carbon dioxide.'], ['a pond snail under a bright lamp, with no plant', 'It goes up.', 'The snail only respires; light does not change that.'], ['only pond water, boiled to kill everything in it', 'It stays about the same.', 'Nothing in the tube is alive, so neither process happens.'], ['a pond snail in the dark, with no plant', 'It goes up.', 'The snail respires and gives off carbon dioxide.']];
    var s = R.pick(setups);
    return { q: 'A sealed tube of water holds ' + s[0] + '. After a few hours, what has happened to the carbon dioxide in the water?', a: mc(s[1], ['It goes up.', 'It goes down.', 'It stays about the same.'].filter(function (x) { return x !== s[1]; })),
      hint: 'Which processes happen here: photosynthesis (uses CO₂, needs light) or respiration (gives off CO₂)?', steps: [s[2], 'So: <b>' + s[1].toLowerCase() + '</b>'] };
  });

  /* ---------- 26. How Water and Food Move in a Plant ---------- */
  G('lifesci.plant-transport', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var c = R.pick([['Which tubes carry water and minerals up from the roots?', 'Xylem', 'carries water and minerals up from the roots'], ['Which tubes carry sugar from the leaves to the rest of the plant?', 'Phloem', 'carries sugar from the leaves to where it is used or stored'], ['What are the tiny pores in a leaf where water vapor leaves and carbon dioxide enters?', 'Stomata', 'are tiny pores in the leaf, opened and closed by guard cells'], ['Which parts of the roots take in most of the water from the soil?', 'Root hairs', 'are thin outgrowths of root cells that give the root a large surface for taking in water']]);
      return { q: c[0], viz: qv('bi-plant', { mode: 'transport', label: 'Tubes inside a plant.' }), a: mc(c[1], ['Xylem', 'Phloem', 'Stomata', 'Root hairs'].filter(function (x) { return x !== c[1]; })),
        hint: 'Xylem: water up. Phloem: food from the leaves.', steps: ['<b>' + c[1] + '</b> ' + c[2] + '.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'What mostly pulls water up to the top of a tall tree?', a: mc('Water evaporating from the leaves (transpiration) pulls the water column up.', ['The roots pump it up like a heart.', 'Gravity pulls it up.', 'The phloem pushes it up.']),
        hint: 'Where does water leave the plant?', steps: ['Water evaporates out of the leaves through the stomata.', 'Water molecules cling together, so each one that leaves pulls on the column of water below it in the xylem.', 'This pull from <b>transpiration</b> lifts most of the water; root pressure helps only a little.'] };
      return { q: 'True or false? Xylem and phloem carry the same materials.', a: tf(false), hint: 'One carries water, the other food.', steps: ['Xylem carries water and minerals up from the roots.', 'Phloem carries sugar from the leaves to where it is used or stored.', 'So the statement is <b>false</b>.'] };
    }
    var sh = R.int(0, 2);
    if (sh === 0) { var col = R.pick(['blue', 'red']);
      return { q: 'A celery stalk stands in water with ' + col + ' food coloring. After a day, small ' + col + ' dots show at the cut end and the leaves turn a bit ' + col + '. Which tubes carried the colored water?', a: mc('Xylem', ['Phloem', 'Stomata', 'Root hairs']),
        hint: 'Which tubes carry water up?', steps: ['The colored water moved up the stalk to the leaves.', 'Water moves up through the <b>xylem</b>.'] }; }
    if (sh === 1) { var dest = R.pick(['a potato growing underground', 'a ripening tomato', 'the roots', 'a new bud at the top of the stem']);
      return { q: 'Sugar is made in the leaves. Which tubes carry it to ' + dest + '?', a: mc('Phloem', ['Xylem', 'Stomata', 'Root hairs']), hint: 'Which tubes carry food?',
        steps: ['Phloem carries sugar from the leaves to wherever it is used or stored.', 'It can carry it down (to roots and potatoes) or up (to buds and fruit).', 'So the answer is <b>phloem</b>.'] }; }
    return { q: 'On a hot, dry day a plant closes its stomata. What happens to the water moving up its xylem?', viz: qv('bi-plant', { mode: 'stomata', water: 0.2, label: 'Stomata on a leaf.' }), a: mc('It slows down, because less water evaporates from the leaves.', ['It speeds up, because the roots push harder.', 'Nothing changes.', 'It starts flowing down.']),
      hint: 'The pull comes from water leaving the leaves.', steps: ['Closed stomata let much less water vapor out.', 'With less evaporation, there is less pull on the water in the xylem.', 'So the flow <b>slows down</b>. (The plant also takes in less carbon dioxide while its stomata are closed.)'] };
  });

  /* ---------- 27. How Plants Respond ---------- */
  var TROP = [['A houseplant leans toward a sunny window.', 'Phototropism'], ['A sprouting bean\'s root grows downward, whatever way the seed was planted.', 'Gravitropism'], ['A pea plant\'s tendril wraps around a fence wire.', 'Thigmotropism'], ['A seedling\'s stem grows straight up, even in the dark.', 'Gravitropism'], ['A morning glory vine coils around a pole.', 'Thigmotropism'], ['Sunflower seedlings on a windowsill all bend toward the glass.', 'Phototropism'], ['A bean seedling in a box with one hole in the side grows out through the hole.', 'Phototropism'], ['Cucumber tendrils curl around a garden string.', 'Thigmotropism'], ['Grass on a steep hillside still grows straight up.', 'Gravitropism'], ['The roots of a young tree grow down deep into the soil.', 'Gravitropism'], ['A grapevine\'s tendrils twist around a wire as they touch it.', 'Thigmotropism'], ['Seedlings under a lamp at one end of a table all lean toward the lamp.', 'Phototropism']];
  G('lifesci.plant-responses', function (R, ctx) {
    var L = lv(ctx), TN = ['Phototropism', 'Gravitropism', 'Thigmotropism'];
    if (L === 1) { var t = R.pick(TROP);
      return { q: t[0] + ' Which response is this?', a: { t: 'mc', choices: TN, v: TN.indexOf(t[1]), keep: true }, hint: 'Photo = light, gravi = gravity, thigmo = touch.',
        steps: ['Phototropism: growing toward light. Gravitropism: growing with gravity (roots down, shoots up). Thigmotropism: growing around what it touches.', 'This is <b>' + t[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'True or false? Plants cannot respond to their surroundings, because they cannot move from place to place.', a: tf(false), hint: 'Think of a plant on a windowsill.', steps: ['Plants respond by growing in a direction: toward light, with gravity, around a support.', 'Some move fast: a sensitive plant folds its leaves when touched.', 'So the statement is <b>false</b>.'] };
      if (sh === 1) return { q: 'Which plant responds to touch within a few seconds?', a: mc('A sensitive plant, which folds its leaves', ['An oak tree, which drops its acorns', 'A cactus, which grows taller', 'A moss, which turns brown']), hint: 'One of these folds up when you brush it.',
        steps: ['The sensitive plant (Mimosa pudica) folds its leaflets within seconds of being touched.', 'A Venus flytrap also snaps shut when its trigger hairs are touched.'] };
      var side = R.pick(['left', 'right', 'east', 'west', 'north', 'south']);
      return { q: 'A ' + R.pick(['bean', 'pea', 'sunflower', 'tomato', 'corn', 'radish']) + ' seedling sits by a window, with light coming only from the ' + side + '. Which way will its stem bend as it grows?', a: { t: 'mc', choices: ['Toward the ' + side, 'Away from the ' + side, 'Straight down'], v: 0, keep: true }, hint: 'Stems grow toward light.',
        steps: ['Stems show phototropism: they grow toward light.', 'Cells on the shaded side grow longer, which bends the stem <b>toward the ' + side + '</b>.'] };
    }
    var pl = R.pick(['bean', 'pea', 'sunflower', 'tomato', 'corn', 'radish', 'squash']);
    if (R.coin()) return { q: 'A potted ' + pl + ' seedling is laid on its side for a few days. What do its roots and stem do?', viz: qv('bi-plant', { mode: 'tropism', gravity: true, label: 'A seedling in a pot on its side.' }), a: mc('The roots curve down and the stem curves up.', ['Both curve up.', 'Both curve down.', 'The roots curve up and the stem curves down.']),
      hint: 'Roots grow with gravity; stems grow against it.', steps: ['Gravitropism: roots grow downward, with gravity.', 'Stems grow upward, against gravity.', 'So <b>the roots curve down and the stem curves up</b>.'] };
    return { q: 'Why does a ' + pl + ' seedling\'s stem bend toward the light from a window?', a: mc('A plant hormone gathers on the shaded side and makes those cells grow longer.', ['The stem wants to reach the sun.', 'Cells on the bright side grow longer and push the stem away.', 'The light pulls the stem toward it.']),
      hint: 'If one side grows longer than the other, which way does the stem bend?', steps: ['A plant hormone called auxin builds up on the shaded side of the stem.', 'Cells there grow longer than cells on the lit side.', 'The longer side pushes the stem over, so it bends <b>toward</b> the light.'] };
  });

  /* ---------- 28. Mosses, Ferns, Conifers and Flowering Plants ---------- */
  var PGDESC = { moss: 'It has no tubes for water, stays small and low, and spreads by spores in damp places.', fern: 'It has tubes for water, but no seeds; spores form in dots under its leaves (fronds).', conifer: 'It has tubes and makes seeds in cones, with no flowers; most have needle-like leaves.', flowering: 'It has tubes and flowers, and makes seeds inside fruits.' };
  var PGPL = { moss: 'no tubes for water; they stay small and low and spread by spores in damp places', fern: 'tubes for water but no seeds; spores form in dots under their fronds', conifer: 'tubes, and seeds in cones but no flowers; most have needle-like leaves', flowering: 'tubes and flowers, and seeds inside fruits' };
  var PGEX = { moss: ['a moss'], fern: ['a fern', 'a horsetail'], conifer: ['a pine tree', 'a spruce tree', 'a redwood'], flowering: ['an oak tree', 'grass', 'a rose', 'an apple tree', 'a sunflower', 'a cactus'] };
  G('lifesci.plant-groups', function (R, ctx) {
    var L = lv(ctx), PG = B().PLANT_GROUPS, keys = PG.map(function (g) { return g.key; }), nm = function (k) { return cap(PG.filter(function (g) { return g.key === k; })[0].name); };
    if (L === 1) { var k = R.pick(keys);
      if (R.coin()) return { q: 'Which plant group fits this description? ' + PGDESC[k], a: { t: 'mc', choices: keys.map(nm), v: keys.indexOf(k), keep: true }, hint: 'Tubes? Seeds? Cones or fruits?', steps: [PGDESC[k], 'That describes <b>' + nm(k).toLowerCase() + '</b>.'] };
      var ex = R.pick(PGEX[k]);
      return { q: 'Which plant group does ' + ex + ' belong to?', a: { t: 'mc', choices: keys.map(nm), v: keys.indexOf(k), keep: true }, hint: 'Does it make seeds? In cones or in fruits?', steps: [cap(nm(k)) + ' have ' + PGPL[k] + '.', cap(ex) + ' fits that description, so it is one of the <b>' + nm(k).toLowerCase() + '</b>.'] };
    }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'True or false? Every plant makes seeds.', a: tf(false), hint: 'How do mosses and ferns spread?', steps: ['Mosses and ferns spread by spores, not seeds.', 'Only conifers and flowering plants make seeds.', 'So the statement is <b>false</b>.'] };
      if (sh === 1) return { q: 'Where does a pine tree make its seeds?', a: mc('In cones', ['In flowers', 'In fruits', 'In spores under its needles']), hint: 'Pines are conifers.', steps: ['Pine trees are conifers: they have no flowers.', 'They make seeds in <b>cones</b>.'] };
      return { q: 'How does a fern spread to new places?', a: mc('By spores', ['By seeds in fruits', 'By seeds in cones', 'By pollen only']), hint: 'Look under a fern\'s leaves for brown dots.', steps: ['Ferns have tubes but make no seeds.', 'Brown dots under their fronds release <b>spores</b>, which grow into new plants.'] };
    }
    if (R.coin()) { var a = R.pick(keys), b = R.pick(keys.filter(function (x) { return x !== a; })), A = PG[keys.indexOf(a)], Bg = PG[keys.indexOf(b)];
      var tr = [['tubes for water (vascular tissue)', 'tubes'], ['seeds', 'seeds'], ['flowers', 'flowers']], items = tr.map(function (t) { return [t[0], !!(A[t[1]] && Bg[t[1]])]; }).concat([['living on land', true]]);
      return { q: 'Which traits do ' + A.name + ' and ' + Bg.name + ' share? Choose all that are right.', viz: qv('bi-tree', { tree: 'plants', label: 'A tree of plant groups.' }), a: mcAll(items),
        hint: 'Mosses: no tubes, no seeds. Ferns: tubes. Conifers: tubes and seeds. Flowering plants: tubes, seeds and flowers.',
        steps: [cap(A.name) + ': ' + PGPL[a] + '.', cap(Bg.name) + ': ' + PGPL[b] + '.', 'Shared: <b>' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join(', ') + '</b>.'] }; }
    return { q: 'Why do mosses stay small and grow in damp places?', a: mc('They have no tubes to carry water up, so water must soak through them from cell to cell.', ['They have no chlorophyll, so they grow slowly.', 'They make seeds that are too small.', 'They get too much sunlight.']), hint: 'Which group has no xylem?',
      steps: ['Mosses have no xylem or phloem.', 'Water can only move short distances from cell to cell, so mosses stay small and live where water is easy to get.'] };
  });

  /* ---------- 29. Flowers, Pollination and Seeds ---------- */
  var FPJ = { petal: ['Petal', 'is colorful and often scented, and draws in pollinators'], sepal: ['Sepal', 'is a small leaf-like part that protected the bud'], stamen: ['Stamen', 'makes pollen'], pistil: ['Pistil', 'receives pollen; seeds form at its base'] };
  var FRUITQ = [['tomato', true, 'grows from a flower and holds seeds'], ['cucumber', true, 'grows from a flower and holds seeds'], ['pumpkin', true, 'grows from a flower and holds seeds'], ['bell pepper', true, 'grows from a flower and holds seeds'], ['green bean pod', true, 'grows from a flower and holds the beans (seeds)'], ['apple', true, 'grows from a flower and holds seeds'],
    ['carrot', false, 'is a root'], ['potato', false, 'is an underground stem'], ['celery stalk', false, 'is a leaf stalk'], ['lettuce leaf', false, 'is a leaf'], ['broccoli', false, 'is a cluster of flower buds, with no seeds yet']];
  G('lifesci.flowers-seeds', function (R, ctx) {
    var L = lv(ctx), keys = Object.keys(FPJ);
    if (L === 1) { var p = R.pick(keys);
      if (R.coin()) return { q: 'What is the part of the flower marked "?"', viz: qv('bi-plant', { mode: 'flower', ask: p }), a: mc(FPJ[p][0], keys.filter(function (x) { return x !== p; }).map(function (x) { return FPJ[x][0]; })),
        hint: 'Stamens stand around the center; the pistil is in the middle.', steps: ['The "?" marks the <b>' + p + '</b>.', 'It ' + FPJ[p][1] + '.'] };
      return { q: 'Which flower part ' + FPJ[p][1] + '?', a: mc(FPJ[p][0], keys.filter(function (x) { return x !== p; }).map(function (x) { return FPJ[x][0]; })), hint: 'Stamens: pollen. Pistil: seeds. Petals: color.', steps: ['The <b>' + p + '</b> ' + FPJ[p][1] + '.'] };
    }
    if (L === 2) { var f = R.pick(FRUITQ);
      return { q: 'In botany, is ' + an(f[0]) + ' a fruit?', a: mc(f[1] ? 'Yes: it ' + f[2] + '.' : 'No: it ' + f[2] + '.', f[1] ? ['No: it is not sweet.', 'No: it is a vegetable, so it cannot be a fruit.'] : ['Yes: it is a plant part we eat.', 'Yes: it grows on a plant.']),
        hint: 'A fruit is the part that grows from a flower and holds seeds, sweet or not.', steps: ['In botany, a fruit is the part that develops from the base of the pistil and holds seeds.', 'The ' + f[0] + ' ' + f[2] + '.', 'So it is <b>' + (f[1] ? '' : 'not ') + 'a fruit</b>. ("Vegetable" is a kitchen word, not a botany word.)'] };
    }
    if (R.coin()) { var st = ['The stamens make pollen', 'Wind or an animal carries pollen to the pistil', 'A seed forms at the base of the pistil', 'The base of the pistil swells into a fruit around the seeds'], ord = R.shuffle([0, 1, 2, 3]); while (ord.join('') === '0123') ord = R.shuffle([0, 1, 2, 3]);
      var rt = [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)); }).join('');
      return { q: 'Put the steps in order, from flower to fruit.<ol type="A">' + ord.map(function (i) { return '<li>' + st[i] + '</li>'; }).join('') + '</ol>', a: mc(rt, orderChoices(R, rt, 3)), hint: 'Pollen must be made and carried before a seed can form.',
        steps: [0, 1, 2, 3].map(function (i) { return L3(ord.indexOf(i)) + ': ' + st[i] + '.'; }).concat(['Order: <b>' + rt + '</b>.']) }; }
    var wind = R.coin(), traits = wind ? R.pick(['small, dull flowers with no scent and huge amounts of light, dusty pollen', 'tiny green flowers with long, feathery pistils that catch pollen from the air']) : R.pick(['large, brightly colored petals, a sweet scent and nectar', 'red, tube-shaped flowers full of nectar', 'white flowers with a strong scent that open at night']);
    return { q: 'A flower has ' + traits + '. How is it most likely pollinated?', a: { t: 'mc', choices: ['By animals, such as insects, birds or bats', 'By the wind'], v: wind ? 1 : 0, keep: true },
      hint: 'Color, scent and nectar are signals for animals. The wind does not need them.', steps: [wind ? 'The wind does not notice color or scent, so wind-pollinated flowers are plain, and they make lots of light pollen (or have feathery parts to catch it).' : 'Color, scent and nectar draw in animals, which carry pollen from flower to flower.', 'So it is most likely pollinated <b>' + (wind ? 'by the wind' : 'by animals') + '</b>.'] };
  });

  /* ---------- 30. What Affects How a Plant Grows ---------- */
  var FACT = [['One group of seedlings gets 2 hours of light a day and another gets 12 hours.', 'Light'], ['Pots of the same seedlings get 50 mL, 100 mL or 200 mL of water a day.', 'Water'], ['Some plants get fertilizer and some get none.', 'Nutrients'], ['Trays of seeds are kept at 10 °C, 20 °C and 30 °C.', 'Temperature'], ['Ten seeds are planted in one pot, and one seed in another pot of the same size.', 'Space'], ['Some seedlings grow in rich garden soil and some in plain sand.', 'Nutrients']];
  var GENV = [['Seeds from one sunflower plant are grown in sun and in shade. The sunny ones grow much taller.', 'Its surroundings (light)'], ['A dwarf pea variety and a tall pea variety are grown side by side with the same care. The tall variety grows much taller.', 'Its genes'], ['Cuttings from one geranium plant are grown with and without fertilizer. The fertilized ones grow bigger.', 'Its surroundings (nutrients)'], ['Two kinds of tomato get the same soil, water and light. One kind always makes small cherry tomatoes and the other big ones.', 'Its genes']];
  G('lifesci.plant-growth-factors', function (R, ctx) {
    var L = lv(ctx), FN = ['Light', 'Water', 'Nutrients', 'Temperature', 'Space'];
    if (L === 1) { var f = R.pick(FACT);
      return { q: f[0] + ' Which growth factor is being tested?', a: mc(f[1], FN.filter(function (x) { return x !== f[1]; }).slice(0, 3)), hint: 'What is different between the groups?', steps: ['The only thing that differs between the groups is ' + f[1].toLowerCase() + '.', 'So the factor tested is <b>' + f[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var g = R.pick(GENV);
        return { q: g[0] + ' What explains the difference?', a: mc(g[1], [g[1] === 'Its genes' ? 'Its surroundings' : 'Its genes', 'Luck only', 'The size of the seed packet']), hint: 'Were the plants\' genes the same, or their surroundings?',
          steps: [g[1] === 'Its genes' ? 'The plants got the same care, so the difference comes from their genes.' : 'The plants came from the same parent, so their genes are alike; the difference comes from their surroundings.', 'Answer: <b>' + g[1].toLowerCase() + '</b>.'] }; }
      return { q: 'A tall variety of corn is planted in poor, dry soil and grows short. What does this show?', a: mc('Genes set what is possible, but conditions decide how much of it happens.', ['Its genes changed to the short kind.', 'Genes have nothing to do with height.', 'It was a short variety all along.']), hint: 'Could the same seed grow tall in good soil?',
        steps: ['Its genes allow it to grow tall.', 'Poor, dry soil limited how much it could grow.', 'A plant\'s growth depends on <b>both</b> its genes and its surroundings.'] };
    }
    var e = R.pick([['Fertilizer', ['None', '5 g', '10 g'], [12, 18, 22]], ['Hours of light', ['4 h', '8 h', '12 h'], [8, 15, 21]], ['Temperature', ['10 °C', '20 °C', '30 °C'], [6, 17, 14]], ['Seeds per pot', ['1', '5', '10'], [24, 18, 11]]]);
    var vals = e[2].map(function (v) { return v + R.int(-2, 2); }), i = R.int(0, 2), j = R.intNot(0, 2, i), hi = vals[i] >= vals[j] ? i : j, lo = hi === i ? j : i;
    if (vals[hi] === vals[lo]) vals[hi] += 1;
    return { q: 'A class grows bean plants, changing one factor (' + e[0].toLowerCase() + '), and measures their mean height after three weeks. How much taller, on average, were the plants with <b>' + e[1][hi] + '</b> than those with <b>' + e[1][lo] + '</b>?',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: e[1], series: [{ name: 'Mean height (cm)', values: vals }], values: true, xlabel: e[0], ylabel: 'Mean height (cm)', quiet: true, interactive: false } }, a: num(vals[hi] - vals[lo]), unit: 'cm',
      hint: 'Read the two bars, then subtract.', steps: [cap(e[1][hi]) + ': ' + vals[hi] + ' cm. ' + cap(e[1][lo]) + ': ' + vals[lo] + ' cm.', '$' + vals[hi] + ' - ' + vals[lo] + ' = ' + (vals[hi] - vals[lo]) + '$ cm.', 'So they were <b>' + (vals[hi] - vals[lo]) + ' cm</b> taller on average.'] };
  });

  /* =================================== Unit 6: Animals and Adaptations =================================== */
  function animals(test) { return B().where(function (t, k) { return t.kind === 'animal' && !t.stage && (!test || test(t, k)); }); }
  function aname(k) { return B().THINGS[k].name; }
  var VERT = ['mammal', 'bird', 'fish', 'reptile', 'amphibian'];
  var GNAME = { mammal: 'Mammals', bird: 'Birds', fish: 'Fish', reptile: 'Reptiles', amphibian: 'Amphibians', insect: 'Insects', arachnid: 'Arachnids', crustacean: 'Crustaceans', mollusk: 'Mollusks', cnidarian: 'Cnidarians', echinoderm: 'Echinoderms', worm: 'Segmented worms', sponge: 'Sponges' };

  /* ---------- 31. Animals With and Without Backbones ---------- */
  G('lifesci.backbones', function (R, ctx) {
    var L = lv(ctx), T = B().THINGS;
    if (L === 1) { var k = R.pick(animals()), yes = T[k].backbone;
      return { q: 'Does ' + an(aname(k)) + ' have a backbone?', viz: qv('bi-picture', { items: [k], labels: true }), a: yn(yes), hint: 'Fish, amphibians, reptiles, birds and mammals have backbones.',
        steps: [cap(an(aname(k))) + ' is ' + (yes ? an(T[k].group) + ', and every ' + T[k].group + ' has a backbone' : (T[k].group === 'cnidarian' || T[k].group === 'echinoderm' || T[k].group === 'worm' ? 'an invertebrate' : 'an invertebrate (' + an(T[k].group) + ')')) + '.', 'So it is ' + (yes ? 'a vertebrate: <b>yes</b>.' : 'an invertebrate: <b>no</b>.')] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Of all the animal species scientists have named, about what share are invertebrates (animals without a backbone)?', a: mc('About 95 out of every 100', ['About half', 'About 10 out of every 100', 'About 1 out of every 100']),
        hint: 'Insects alone number about a million named species.', steps: ['About 95% of named animal species are invertebrates.', 'Insects alone number about a million named species; vertebrates are a small share.', 'The animals we know best (pets, farm animals) are vertebrates, which makes them seem common.'] };
      return { q: 'True or false? Most kinds of animals have a backbone.', a: tf(false), hint: 'Count the kinds of insects.', steps: ['About 95% of named animal species are invertebrates.', 'So the statement is <b>false</b>.'] };
    }
    var inv = animals(function (t) { return !t.backbone; }), ver = animals(function (t) { return t.backbone; }), ni = R.int(1, 3), pick = R.shuffle(R.sample(inv, ni).concat(R.sample(ver, 4 - ni)));
    return { q: 'Which of these are invertebrates? Choose all that are right.', viz: qv('bi-picture', { items: pick, labels: true, letters: false }), a: mcAll(pick.map(function (k) { return [cap(aname(k)), !T[k].backbone]; })),
      hint: 'Invertebrates have no backbone: insects, spiders, worms, snails, crabs, jellyfish, sea stars.', steps: pick.map(function (k) { return cap(aname(k)) + ': ' + (T[k].backbone ? 'a ' + T[k].group + ', so it has a backbone.' : 'no backbone.'); }) };
  });

  /* ---------- 32. Invertebrate Groups ---------- */
  var INV_TRAITS = [['jointed legs, a hard exoskeleton, eight legs and two body parts', 'arachnid'], ['six legs, three body parts and usually wings', 'insect'], ['jointed legs, a hard exoskeleton, ten legs and two pairs of antennae', 'crustacean'], ['a soft body, often with a shell, and a muscular foot', 'mollusk'], ['spiny skin and arms arranged around the center in fives', 'echinoderm'], ['a soft, jelly-like body and stinging tentacles', 'cnidarian'], ['a body full of tiny pores that filters food from the water; it stays fixed in one place', 'sponge'], ['a long, soft body divided into many ring-shaped segments', 'worm']];
  var EXTRA = [['an octopus', 'mollusk'], ['a clam', 'mollusk'], ['a lobster', 'crustacean'], ['a scorpion', 'arachnid'], ['a tick', 'arachnid'], ['a sea urchin', 'echinoderm'], ['a sea anemone', 'cnidarian'], ['a coral', 'cnidarian'], ['a sponge', 'sponge'], ['a beetle', 'insect'], ['a dragonfly', 'insect'], ['a leech', 'worm']];
  G('lifesci.invertebrate-groups', function (R, ctx) {
    var L = lv(ctx), T = B().THINGS, groups = Object.keys(GNAME).filter(function (g) { return VERT.indexOf(g) < 0; });
    function pool() { return animals(function (t) { return !t.backbone; }).map(function (k) { return [an(aname(k)), T[k].group, k]; }).concat(EXTRA); }
    if (L === 1) { var a = R.pick(pool());
      var p = { q: 'Which group does ' + a[0] + ' belong to?', a: mc(GNAME[a[1]], R.sample(groups.filter(function (g) { return g !== a[1]; }), 3).map(function (g) { return GNAME[g]; })), hint: 'Count legs, look for a shell, spines, tentacles or segments.',
        steps: [cap(a[0]) + ' is in the group <b>' + GNAME[a[1]].toLowerCase() + '</b>.', 'Clues for that group: ' + INV_TRAITS.filter(function (x) { return x[1] === a[1]; })[0][0] + '.'] };
      if (a[2]) p.viz = qv('bi-picture', { items: [a[2]], labels: true });
      return p; }
    if (L === 2) { var c = R.pick([['jellyfish', 'cnidarian', 'No. It is a cnidarian: no backbone, gills or fins.', 'Yes, because it lives in the ocean.'], ['starfish', 'echinoderm', 'No. It is an echinoderm: spiny skin and five arms, with no backbone.', 'Yes, because it lives in the sea.']]);
      if (R.chance(0.4)) return { q: 'Is ' + an(aname(c[0])) + ' a fish?', viz: qv('bi-picture', { items: [c[0]], labels: true }), a: mc(c[2], [c[3], 'Yes, because it swims.', 'No. It is a plant.']), hint: 'Fish have backbones, gills and fins.',
        steps: ['Fish have a backbone, gills and fins.', 'The ' + aname(c[0]) + ' has none of these. Living in the sea does not make it a fish.', c[2].replace(/^No\. /, '')] };
      if (R.coin()) return { q: 'Is a spider an insect?', viz: qv('bi-picture', { items: ['spider'], labels: true }), a: mc('No. It has eight legs and two body parts, so it is an arachnid.', ['Yes, because it is a small animal with legs.', 'Yes, because it has an exoskeleton.', 'No, because it has no legs.']), hint: 'Count the legs.',
        steps: ['Insects have six legs and three body parts.', 'Spiders have eight legs and two body parts: they are <b>arachnids</b>.', 'Both are arthropods (jointed legs and an exoskeleton), but they are different groups.'] };
      var ar = R.shuffle([['an ant', true], ['a crab', true], ['a spider', true], ['a lobster', true], ['a snail', false], ['an earthworm', false], ['a jellyfish', false], ['a sea star', false]]).slice(0, 5);
      if (!ar.some(function (x) { return x[1]; })) ar[0] = ['a crab', true];
      if (ar.every(function (x) { return x[1]; })) ar[4] = ['a snail', false];
      return { q: 'Which of these are arthropods (jointed legs and a hard exoskeleton)? Choose all that are right.', a: mcAll(ar.map(function (x) { return [cap(x[0]), x[1]]; })), hint: 'Insects, arachnids and crustaceans are all arthropods.',
        steps: ['Arthropods include insects, arachnids (spiders) and crustaceans (crabs, lobsters).', 'Snails are mollusks, earthworms are worms, jellyfish are cnidarians, and sea stars are echinoderms.', 'Right: <b>' + ar.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join(', ') + '</b>.'] };
    }
    var t = R.pick(INV_TRAITS);
    return { q: 'An invertebrate has ' + t[0] + '. Which group is it in?', a: mc(GNAME[t[1]], R.sample(INV_TRAITS.filter(function (x) { return x !== t; }), 3).map(function (x) { return GNAME[x[1]]; })), hint: 'Use the clues one at a time.',
      steps: [cap(t[0]) + ': those are the traits of <b>' + GNAME[t[1]].toLowerCase() + '</b>.'] };
  });

  /* ---------- 33. Vertebrate Groups ---------- */
  var VCLUE = { mammal: 'hair or fur, and it feeds its young milk', bird: 'feathers, a beak and wings, and it lays hard-shelled eggs', fish: 'gills and fins, and it lives in water', reptile: 'dry, scaly skin, and it breathes with lungs', amphibian: 'smooth, moist skin, and its young usually live in water and breathe with gills' };
  G('lifesci.vertebrate-groups', function (R, ctx) {
    var L = lv(ctx), T = B().THINGS;
    if (L === 1) { var k = R.pick(animals(function (t) { return t.backbone && !t.trick; }));
      return { q: 'Which vertebrate group does ' + an(aname(k)) + ' belong to?', viz: qv('bi-picture', { items: [k], labels: true }), a: { t: 'mc', choices: VERT.map(function (g) { return GNAME[g]; }), v: VERT.indexOf(T[k].group), keep: true },
        hint: 'Look at its covering: fur, feathers, scales or moist skin.', steps: [cap(an(aname(k))) + ' has ' + VCLUE[T[k].group] + '.', 'So it is in the group <b>' + GNAME[T[k].group].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var k2 = R.pick(animals(function (t) { return t.backbone && t.trick; })), g = T[k2].group;
      var WG = { whale: ['fish', 'it lives and swims in water'], dolphin: ['fish', 'it lives and swims in water'], bat: ['bird', 'it has wings and flies'], penguin: ['fish', 'it swims in the sea'], salamander: ['reptile', 'it looks like a lizard'], turtle: ['amphibian', 'it lives in and out of water'], snake: ['amphibian', 'its skin is slimy'] }[k2] || [R.pick(VERT.filter(function (x) { return x !== g; })), 'it lives where they do'];
      var third = R.pick(VERT.filter(function (x) { return x !== g && x !== WG[0]; }));
      return { q: 'Which vertebrate group does ' + an(aname(k2)) + ' belong to?', viz: qv('bi-picture', { items: [k2], labels: true }), a: mc(GNAME[g] + ': it has ' + VCLUE[g] + '.', [GNAME[WG[0]] + ': ' + WG[1] + '.', GNAME[third] + ': it moves the way they do.']),
        hint: 'Body traits decide the group, not where it lives or how it moves.', steps: [cap(an(aname(k2))) + ' ' + (/^(a|an|the) /.test(T[k2].trick) ? 'is ' : '') + T[k2].trick + '.', 'What counts is its body: it has ' + VCLUE[g] + '.', 'So it is in the group <b>' + GNAME[g].toLowerCase() + '</b>.'] }; }
    var g3 = R.pick(VERT);
    if (R.coin()) return { q: 'A vertebrate has ' + VCLUE[g3] + '. Which group is it in?', a: { t: 'mc', choices: VERT.map(function (g) { return GNAME[g]; }), v: VERT.indexOf(g3), keep: true }, hint: 'Which covering does it have?',
      steps: ['Fur and milk: mammals. Feathers: birds. Gills and fins: fish. Dry scales and lungs: reptiles. Moist skin: amphibians.', 'So it is in the group <b>' + GNAME[g3].toLowerCase() + '</b>.'] };
    var trick = R.pick([['bat', 'It has fur and feeds its young milk.', ['It flies.', 'It has wings.', 'It sleeps upside down.']], ['whale', 'It breathes air with lungs, has a little hair and feeds its young milk.', ['It lives in the ocean.', 'It swims with flippers.', 'It is very large.']], ['penguin', 'It has feathers and a beak.', ['It swims well.', 'It cannot fly.', 'It lives where it is cold.']]]);
    return { q: 'Which fact shows that ' + an(aname(trick[0])) + ' is ' + an(T[trick[0]].group) + '?', a: mc(trick[1], trick[2]), hint: 'Look for a trait that every member of the group has.',
      steps: ['Group membership depends on body traits every member shares.', trick[1], 'So the ' + aname(trick[0]) + ' is ' + an(T[trick[0]].group) + '.'] };
  });

  /* ---------- 34. Body Adaptations ---------- */
  var ADAPT = [['ducks', 'webbed feet', 'paddling through water'], ['hawks', 'a hooked beak and sharp talons', 'catching and tearing prey'], ['hummingbirds', 'a long, thin beak', 'sipping nectar deep inside flowers'], ['herons', 'long legs', 'wading into water to hunt fish'], ['polar bears', 'thick fur and a layer of fat', 'staying warm in the Arctic cold'], ['camels', 'wide, padded feet', 'walking on soft sand'], ['cactuses', 'thick, juicy stems', 'storing water through dry months'], ['giraffes', 'long necks', 'reaching leaves high in trees'], ['snowshoe hares', 'white winter fur', 'hiding against the snow (camouflage)'], ['owls', 'large eyes', 'seeing in dim light'], ['beavers', 'large, strong front teeth', 'gnawing through trees']];
  var HAB = [['the Arctic', 'thick fur and a layer of fat', ['thin fur and very large ears', 'long, thin legs for wading', 'bright red feathers']], ['a hot desert', 'large ears that give off heat and the ability to go a long time without water', ['thick fur and a layer of fat', 'webbed feet', 'gills']], ['a pond', 'webbed feet for swimming', ['wide, padded feet for sand', 'thick fur for snow', 'a long, sticky tongue for ant hills']], ['a snowy forest in winter', 'white fur that blends in with snow', ['bright orange fur', 'webbed feet', 'thin skin with no fur']]];
  G('lifesci.structural-adaptations', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var a = R.pick(ADAPT), wr = R.sample(ADAPT.filter(function (x) { return x !== a; }), 3).map(function (x) { return cap(x[2]); });
      return { q: 'How do ' + a[1] + ' help ' + a[0] + '?', a: mc(cap(a[2]), wr), hint: 'Think about where it lives and how it gets food.', steps: [cap(a[0]) + ' have ' + a[1] + ', which help with <b>' + a[2] + '</b>.', 'A trait like this, inherited and helpful where the organism lives, is an adaptation.'] }; }
    if (L === 2) { var b = R.pick(ADAPT);
      return { q: cap(b[0]) + ' have ' + b[1] + '. Which explanation fits how this came about?', a: mc('Over many generations, those born with more of this trait survived and had more young, so the trait became common.', ['Each one grew the trait during its life because it needed it, and then passed it on.', 'They decided to change their bodies to fit their home.', 'One of them changed overnight, and all the rest copied it.']),
        hint: 'Can an animal pass on a change it made to its own body during its life?', steps: ['Traits come from genes, and individuals differ a little.', 'Those whose traits suited their home best survived and had more young, passing the trait on.', 'Over many generations the trait became common. Needing or wanting a trait does not make it appear, and changes made during one life are not inherited.'] }; }
    var h = R.pick(HAB);
    return { q: 'Which trait would best help a mammal survive in ' + h[0] + '?', a: mc(cap(h[1]), h[2].map(cap)), hint: 'What is the biggest challenge there: cold, heat, water or being seen?',
      steps: [cap(h[0]) + ' brings its own challenges.', '<b>' + cap(h[1]) + '</b> meets that challenge.', 'For example: the arctic fox and polar bear (fur and fat), the fennec fox (big ears), the beaver (webbed back feet), the snowshoe hare (white winter fur).'] };
  });

  /* ---------- 35. Behavior: Instinct and Learning ---------- */
  var INST = ['A spider spins its first web without ever seeing one made.', 'A newly hatched sea turtle crawls toward the ocean.', 'A baby bird opens its mouth wide when a parent lands on the nest.', 'A honeybee does a dance that tells other bees where to find flowers.', 'A groundhog goes into a long winter sleep (hibernation).', 'A newly hatched chick pecks at small spots on the ground.', 'A caterpillar spins a cocoon or forms a chrysalis.'];
  var LEARN = ['A dog sits when its owner says "Sit."', 'A crow learns which trash cans hold food.', 'A young chimpanzee learns to fish termites out of a mound with a stick by watching adults.', 'A horse comes when its owner whistles.', 'A raccoon figures out how to open the latch on a garbage can.', 'A parrot learns to say words.', 'A sea lion learns tricks for a fish reward.'];
  G('lifesci.behavioral-adaptations', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var ins = R.coin(), s = ins ? R.pick(INST) : R.pick(LEARN);
      return { q: s + ' Is this behavior an instinct or learned?', a: { t: 'mc', choices: ['Instinct', 'Learned'], v: ins ? 0 : 1, keep: true }, hint: 'Could the animal do it right the first time, with no teaching or practice?',
        steps: [ins ? 'The animal does this right the first time, without being taught.' : 'The animal learned this from experience, practice or watching others.', 'So it is <b>' + (ins ? 'an instinct' : 'learned') + '</b>.'] }; }
    if (L === 2) { var l = R.pick(LEARN);
      return { q: l + ' Will this animal\'s young know how to do it without being taught?', a: mc('No. Learned behavior is not passed on in genes; each animal must learn it.', ['Yes. Learned behavior is passed to the young in their genes.', 'Yes, but only the first-born young.', 'No, because animals cannot learn anything.']),
        hint: 'What is passed down in genes: instincts or learned tricks?', steps: ['Instincts are inherited; learned behaviors are not.', 'The young may learn the same thing, for example by watching, but they are not born knowing it.', 'So the answer is <b>no</b>.'] }; }
    var ni = R.int(1, 3), items = R.shuffle(R.sample(INST, ni).map(function (x) { return [x, true]; }).concat(R.sample(LEARN, 4 - ni).map(function (x) { return [x, false]; })));
    return { q: 'Which of these behaviors are instincts? Choose all that are right.', a: mcAll(items), hint: 'Instincts are done right the first time, without learning.',
      steps: ['Instincts: ' + items.filter(function (x) { return x[1]; }).map(function (x) { return x[0].replace(/\.$/, ''); }).join('; ') + '.', 'Learned: ' + items.filter(function (x) { return !x[1]; }).map(function (x) { return x[0].replace(/\.$/, ''); }).join('; ') + '.'] };
  });

  /* ---------- 36. Endotherms and Ectotherms ---------- */
  G('lifesci.body-temperature', function (R, ctx) {
    var L = lv(ctx), T = B().THINGS;
    if (L === 1) { var k = R.pick(animals(function (t) { return t.backbone; })), endo = T[k].group === 'mammal' || T[k].group === 'bird';
      return { q: 'Is ' + an(aname(k)) + ' an endotherm or an ectotherm?', viz: qv('bi-picture', { items: [k], labels: true }), a: { t: 'mc', choices: ['Endotherm', 'Ectotherm'], v: endo ? 0 : 1, keep: true },
        hint: 'Birds and mammals make their own body heat.', steps: [cap(an(aname(k))) + ' is ' + an(T[k].group) + '.', endo ? 'Birds and mammals make heat inside their bodies and keep a fairly steady temperature: endotherms.' : 'Fish, amphibians and reptiles get their heat from their surroundings: ectotherms.', 'So it is <b>' + (endo ? 'an endotherm' : 'an ectotherm') + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var air = R.int(30, 38), bask = air + R.int(1, 4);
        return { q: 'On a sunny afternoon, a desert lizard basking on a rock has a body temperature of ' + bask + ' °C. A person nearby has a body temperature of about 37 °C. What does this show?', a: mc('An ectotherm\'s temperature follows its surroundings; "cold-blooded" does not mean cold.', ['The lizard has become an endotherm.', 'The thermometer must be wrong, because reptiles are always cold.', 'Lizards make more heat than people.']),
          hint: 'Where does the lizard\'s heat come from?', steps: ['A lizard is an ectotherm: it takes in heat from the sun and warm rocks.', 'On a hot day its body can be as warm as a person\'s, or warmer.', '"Cold-blooded" only means its temperature depends on its surroundings.'] }; }
      return { q: 'True or false? "Cold-blooded" animals always have cold blood.', a: tf(false), hint: 'Think of a snake lying in the sun.', steps: ['Ectotherms get their heat from their surroundings.', 'In warm places their blood can be warm.', 'So the statement is <b>false</b>.'] };
    }
    var airs = [5, 15, 25, 35], endoT = R.pick([37, 38, 39, 40]), offs = airs.map(function () { return R.int(1, 3); }), ecto = airs.map(function (a, i) { return a + offs[i]; }), endoFirst = R.coin();
    var A = endoFirst ? airs.map(function () { return endoT; }) : ecto, Bv = endoFirst ? ecto : airs.map(function () { return endoT; });
    if (R.coin()) return { q: 'Scientists measure the body temperature of two animals at different air temperatures. Which animal is the ectotherm?' + table(['Air temperature', 'Animal A', 'Animal B'], airs.map(function (a, i) { return [a + ' °C', A[i] + ' °C', Bv[i] + ' °C']; })),
      a: { t: 'mc', choices: ['Animal A', 'Animal B'], v: endoFirst ? 1 : 0, keep: true }, hint: 'Whose temperature rises and falls with the air?',
      steps: ['Animal ' + (endoFirst ? 'A' : 'B') + ' stays at ' + endoT + ' °C whatever the air does: an endotherm.', 'Animal ' + (endoFirst ? 'B' : 'A') + ' goes from ' + ecto[0] + ' °C to ' + ecto[3] + ' °C as the air warms: its temperature follows its surroundings.', 'So <b>Animal ' + (endoFirst ? 'B' : 'A') + '</b> is the ectotherm.'] };
    var pair = R.pick([['a mouse', 'a lizard'], ['a robin', 'a frog'], ['a squirrel', 'a snake'], ['a bat', 'a salamander']]);
    return { q: 'Two animals of about the same size live side by side: ' + pair[0] + ' and ' + pair[1] + '. Which one needs much more food for its size?', a: { t: 'mc', choices: [cap(pair[0]), cap(pair[1])], v: 0, keep: true },
      hint: 'Making body heat uses energy, and energy comes from food.', steps: [cap(pair[0]) + ' is an endotherm: it burns food all the time to make body heat.', cap(pair[1]) + ' is an ectotherm: it warms up from its surroundings, so it needs far less food.', 'So <b>' + pair[0] + '</b> needs more food for its size.'] };
  });
})(window.MathLadder);

/* ---- part B ---- */
/* Life Science (lifesci), part B: generators for units 7-11 (Ecosystems, Populations, The Human Body, Heredity, Evolution).
   Source parts: /tmp/work_lifesci_B/gen/*.js, joined by build_gen.js into out/gen.js, merged by /tmp/merge_parts.js.
   Facts come from MathLadder.bio (webs, cycles, biomes, body systems, genetics, the codon table) so pictures and answers agree.
   Levels: 1 one clear case; 2 the topic's trouble spot; 3 several items, a two-step calculation or a data reading. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  // registers with the literal topic id; drops an empty viz so problems stay clean
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); if (p && p.viz === undefined) delete p.viz; return p; }); }
  function B() { return ML.bio; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function an(s) { return (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s; }
  // one right answer among wrong ones, shuffled (keep: true keeps the given order, right answer first unless at is given)
  function mc(R, right, wrong, keep) { var ch = keep ? [right].concat(wrong) : R.shuffle([right].concat(wrong)); return { t: 'mc', choices: ch, v: ch.indexOf(right), keep: !!keep }; }
  function mcFixed(choices, right) { return { t: 'mc', choices: choices.slice(), v: choices.indexOf(right), keep: true }; }
  // choose all that apply: items [[text, ok]]; at least one right and one wrong
  function mcAll(R, items) { var it = R.shuffle(items.slice()); return { t: 'mc', choices: it.map(function (x) { return x[0]; }), v: it.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }), keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function num(v, rtol) { var o = { t: 'num', v: String(v) }; if (rtol) o.rtol = rtol; return o; }
  function fmtN(n) { n = Math.round(n * 1000) / 1000; var s = String(n), p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function quiet(name, opts) { return { name: name, opts: Object.assign({ quiet: true, interactive: false }, opts || {}) }; }
  function list(a) { return a.length < 2 ? a.join('') : a.length === 2 ? a[0] + ' and ' + a[1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function letters(n) { return 'ABCDEFGH'.slice(0, n).split(''); }
  // a pool item picked by level: lv1 pool, lv2 pool (the trouble spot)
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  // "choose the right order" with lettered items: returns { q, a, steps } pieces
  function orderMc(R, items, correctOrder, nWrong) {
    // items: array of labels in correct order; shows them shuffled with letters; answer is the letter sequence
    var shown = R.shuffle(items.map(function (x, i) { return i; })), tries = 0;
    while (shown.every(function (v, i) { return v === i; }) && tries++ < 10) shown = R.shuffle(shown);
    var L = letters(items.length), right = items.map(function (x, i) { return L[shown.indexOf(i)]; }).join(', ');
    var wrongs = [], guard = 0;
    while (wrongs.length < (nWrong || 3) && guard++ < 60) { var w = R.shuffle(L.slice()).join(', '); if (w !== right && wrongs.indexOf(w) < 0) wrongs.push(w); }
    return { list: shown.map(function (k, i) { return L[i] + ': ' + items[k]; }), a: mc(R, right, wrongs), right: right };
  }


  /* ======================= Unit 7: Ecosystems ======================= */
  var BIOTIC_NOW = ['an oak tree', 'an earthworm', 'moss on a rock', 'a mushroom', 'bacteria in the soil', 'algae in a pond', 'a deer', 'grass', 'a dragonfly', 'a fern', 'a squirrel', 'a cattail'];
  var ONCE = [['a fallen leaf', 'it grew on a tree'], ['a rotting log', 'it was part of a tree'], ['a bone', 'it was part of an animal'], ['a feather', 'it grew on a bird'],
    ['a seashell', 'a sea animal built it'], ['a pine cone', 'it grew on a pine tree'], ['a dead beetle', 'it was a living insect'], ['animal droppings', 'they are wastes made by an animal'], ['a dry corn husk', 'it grew on a corn plant']];
  var ABIOTIC = ['sunlight', 'rainwater', 'sand', 'a granite boulder', 'the air temperature', 'wind', 'minerals in the soil', 'oxygen gas in the air', 'river water', 'a pebble', 'snow', 'the amount of salt in the water'];

  G('lifesci.biotic-abiotic', function (R, ctx) {
    var L = lvl(ctx), ch = ['Biotic', 'Abiotic'];
    if (L === 1) {
      var bio = R.coin(), x = bio ? R.pick(BIOTIC_NOW) : R.pick(ABIOTIC);
      return { q: 'Is <b>' + x + '</b> a biotic or an abiotic part of an ecosystem?', a: mcFixed(ch, bio ? 'Biotic' : 'Abiotic'), hint: 'Biotic means living or once living. Abiotic means never living.',
        steps: [bio ? cap(x) + ' is alive.' : cap(x) + ' was never alive.', 'So it is <b>' + (bio ? 'biotic' : 'abiotic') + '</b>.'] };
    }
    if (L === 2) { // the trouble spot: once-living things are biotic
      var once = R.chance(0.65), o = R.pick(ONCE), y = once ? o[0] : R.pick(ABIOTIC);
      return { q: 'A student says <b>' + y + '</b> is abiotic because it is not alive now. Classify ' + y + '.', a: mcFixed(ch, once ? 'Biotic' : 'Abiotic'), hint: 'Ask: was it ever part of a living thing?',
        steps: once ? [cap(y) + ' is not alive now, but ' + o[1] + '.', 'Once-living matter is food for decomposers and counts as biotic.', 'So it is <b>biotic</b>; the student is wrong.'] : [cap(y) + ' was never part of a living thing.', 'So it is <b>abiotic</b>; the student is right this time.'] };
    }
    var items = R.sample(ABIOTIC, R.int(1, 2)).map(function (x) { return [x, true]; }).concat(R.sample(BIOTIC_NOW, 1).map(function (x) { return [x, false]; })).concat(R.sample(ONCE, R.int(1, 2)).map(function (x) { return [x[0], false]; }));
    var askAb = R.coin(); if (!askAb) items = items.map(function (x) { return [x[0], !x[1]]; });
    var A = mcAll(R, items);
    return { q: 'A pond-side survey lists the items below. Which are <b>' + (askAb ? 'abiotic' : 'biotic') + '</b>? Choose all that apply.', a: A, hint: 'Once-living things count as biotic.',
      steps: A.choices.map(function (c) { var isAb = ABIOTIC.indexOf(c) >= 0, once = ONCE.some(function (o) { return o[0] === c; }); return cap(c) + ': ' + (isAb ? 'never living, abiotic.' : once ? 'once living, biotic.' : 'living, biotic.'); }) };
  });

  var LEVEL_NAMES = ['Organism', 'Population', 'Community', 'Ecosystem'];
  var SPECIES = [['red fox', 'red foxes'], ['bluegill', 'bluegills'], ['white oak', 'white oaks'], ['monarch butterfly', 'monarch butterflies'], ['prairie dog', 'prairie dogs'], ['green frog', 'green frogs'], ['sugar maple', 'sugar maples'], ['mallard duck', 'mallard ducks'], ['honeybee', 'honeybees']];
  var PLACES = [['a pond', ['frogs', 'fish', 'algae', 'cattails', 'snails'], 'water, mud and sunlight'], ['a meadow', ['grasses', 'rabbits', 'grasshoppers', 'hawks', 'wildflowers'], 'soil, rain and sunlight'],
    ['a forest', ['oaks', 'deer', 'owls', 'ferns', 'mushrooms'], 'soil, streams and the weather'], ['a desert', ['cactuses', 'lizards', 'snakes', 'hawks', 'shrubs'], 'sand, rock and very little rain'], ['a coral reef', ['corals', 'fish', 'sea turtles', 'algae', 'crabs'], 'salt water, sand and sunlight']];
  G('lifesci.levels-ecology', function (R, ctx) {
    var L = lvl(ctx), sp = R.pick(SPECIES), pl = R.pick(PLACES);
    if (L === 1) {
      var k = R.int(0, 3), d = [ 'one ' + sp[0], 'all the ' + sp[1] + ' living in ' + pl[0], 'all the living things in ' + pl[0] + ': ' + list(R.sample(pl[1], 4)), 'the living things of ' + pl[0] + ' together with its ' + pl[2]][k];
      return { q: 'Which level of organization is <b>' + d + '</b>?', a: mcFixed(LEVEL_NAMES, LEVEL_NAMES[k]), hint: 'One living thing, one species, many species, or living plus nonliving?',
        steps: [['A single living thing is an organism.', 'Many members of one species in one area form a population.', 'Several species living together form a community.', 'A community plus its nonliving parts is an ecosystem.'][k], 'So the answer is <b>' + LEVEL_NAMES[k].toLowerCase() + '</b>.'] };
    }
    if (L === 2) { // population vs community
      var one = R.coin(), grp = one ? 'all the ' + sp[1] + ' in ' + pl[0] : 'all the ' + list(R.sample(pl[1], 3)) + ' in ' + pl[0];
      return { q: 'A student calls <b>' + grp + '</b> a population. Is that the right word?', a: mcFixed(['Yes, it is a population', 'No, it is a community'], one ? 'Yes, it is a population' : 'No, it is a community'), hint: 'How many species are named?',
        steps: one ? ['Only one species is named: ' + sp[1] + '.', 'One species in one area is a <b>population</b>.'] : ['Several species are named.', 'A population has only one species; several species together are a <b>community</b>.'] };
    }
    var sh = R.int(0, 1);
    if (sh === 0) {
      var o = orderMc(R, ['organism', 'population', 'community', 'ecosystem'], null, 3);
      return { q: 'Put these levels in order from smallest to largest:<br>' + o.list.join('<br>'), a: o.a, hint: 'Start with one living thing.', steps: ['Organism (one) → population (one species) → community (many species) → ecosystem (plus nonliving parts).', 'So the order is <b>' + o.right + '</b>.'] };
    }
    var i = R.int(0, 2), adds = ['more members of the same species', 'other species', 'the nonliving parts'];
    return { q: 'What do you add to ' + an(LEVEL_NAMES[i].toLowerCase()) + ' to get ' + an(LEVEL_NAMES[i + 1].toLowerCase()) + '?', a: mc(R, cap(adds[i]), adds.filter(function (x, j) { return j !== i; }).map(cap).concat(['Nothing; they are the same'])), hint: 'Think about what is new at the bigger level.',
      steps: [cap(an(LEVEL_NAMES[i + 1].toLowerCase())) + ' is ' + an(LEVEL_NAMES[i].toLowerCase()) + ' plus ' + adds[i] + '.'] };
  });

  var WEB_KEYS = ['meadow', 'pond', 'forest', 'desert', 'ocean'];
  function nm(k) { return B().THINGS[k].name; }
  function dietIn(web, k) { var f = B().eats(web, k); if (!f.length) return null; var p = f.filter(function (x) { return B().isProducer(web, x); }).length; return p === f.length ? 'herbivore' : p === 0 ? 'carnivore' : 'omnivore'; }
  G('lifesci.ecosystem-roles', function (R, ctx) {
    var L = lvl(ctx), roles = ['Producer', 'Consumer', 'Decomposer'];
    if (L === 1) {
      var bank = [['an oak tree making sugar from sunlight', 0], ['algae floating near the surface of a lake', 0], ['grass in a meadow', 0], ['a cactus', 0], ['a deer eating clover', 1], ['a hawk catching a snake', 1], ['a caterpillar chewing a leaf', 1], ['a heron spearing a fish', 1],
        ['a mushroom growing on a rotting stump', 2], ['bacteria breaking down a dead leaf', 2], ['mold growing on fallen fruit', 2], ['an earthworm eating dead leaves in the soil', 2]], b = R.pick(bank);
      return { q: 'What role does <b>' + b[0] + '</b> play in its ecosystem?', a: mcFixed(roles, roles[b[1]]), hint: 'Does it make its own food, eat living things, or break down dead matter?',
        steps: [['It makes its own food by photosynthesis.', 'It eats other living things.', 'It feeds on dead matter and wastes and returns nutrients to the soil.'][b[1]], 'So it is a <b>' + roles[b[1]].toLowerCase() + '</b>.'] };
    }
    if (L === 2) { // decomposers matter
      var sh = R.int(0, 1);
      if (sh === 0) return { q: 'Suppose every decomposer vanished from a forest. What would happen over many years?', a: mc(R, 'Dead matter would pile up, and plants would run short of nutrients', ['Nothing, because decomposers only eat things that are already dead', 'Plants would grow faster with no competition', 'The animals would make their own food']),
        hint: 'Where do plants get nutrients like nitrogen?', steps: ['Decomposers break down dead leaves, logs and wastes.', 'That releases nutrients back to the soil, where roots take them up.', 'Without them, nutrients stay locked in dead matter and <b>plants run short</b>; so do the animals that eat plants.'] };
      var w = R.pick(['meadow', 'forest']), d = R.pick(B().WEBS[w].decomposers);
      return { q: 'In ' + B().WEBS[w].name + ', which organism gets its food from the dead matter and wastes of <i>every</i> level of the food web?', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false } }, a: mc(R, cap(nm(d)), R.sample(B().WEBS[w].nodes, 3).map(function (k) { return cap(nm(k)); })),
        hint: 'Look for a decomposer.', steps: ['Decomposers feed on dead plants, dead animals and wastes from every level.', 'Here that is the <b>' + nm(d) + '</b>.'] };
    }
    var w3 = R.pick(['meadow', 'forest', 'desert', 'pond']), cons = B().WEBS[w3].nodes.filter(function (k) { return dietIn(w3, k); }), k3 = R.pick(cons), dt = dietIn(w3, k3), f3 = B().eats(w3, k3);
    return { q: 'In this food web of ' + B().WEBS[w3].name + ', is the ' + nm(k3) + ' a herbivore, a carnivore or an omnivore?', viz: { name: 'bi-foodweb', opts: { web: w3, quiet: true, interactive: false, highlight: [k3].concat(f3) } }, a: mcFixed(['Herbivore', 'Carnivore', 'Omnivore'], cap(dt)),
      hint: 'Follow the arrows that point into the ' + nm(k3) + '. Are its foods plants, animals or both?', steps: ['Arrows into the ' + nm(k3) + ' come from: ' + list(f3.map(nm)) + '.', dt === 'herbivore' ? 'All of those are producers.' : dt === 'carnivore' ? 'All of those are animals.' : 'Some are producers and some are animals.', 'So in this web it is ' + an('<b>' + dt + '</b>') + '.'] };
  });

  G('lifesci.food-webs', function (R, ctx) {
    var L = lvl(ctx), w = R.pick(WEB_KEYS), web = B().WEBS[w], chains = B().chains(w).filter(function (c) { return c.length >= 3 && c.length <= 5; });
    if (L === 1) {
      var c = R.pick(chains), i = R.int(0, c.length - 2), food = c[i], eater = c[i + 1], sh = R.int(0, 1);
      if (sh === 0) return { q: 'In the food chain ' + c.map(nm).join(' → ') + ', what does the ' + nm(eater) + ' eat?', a: mc(R, cap(nm(food)), c.filter(function (x) { return x !== food && x !== eater; }).map(function (x) { return cap(nm(x)); }).concat(c.length < 4 ? ['The sun'] : [])),
        hint: 'The arrow points from the food to the eater.', steps: ['The arrow ' + nm(food) + ' → ' + nm(eater) + ' points into the ' + nm(eater) + '.', 'So the ' + nm(eater) + ' eats the <b>' + nm(food) + '</b>.'] };
      return { q: 'The ' + nm(eater) + ' eats the ' + nm(food) + '. Which arrow is drawn the correct way in a food chain?', a: mc(R, nm(food) + ' → ' + nm(eater), [nm(eater) + ' → ' + nm(food)]),
        hint: 'Arrows show where the energy goes.', steps: ['Energy moves from the food into the eater.', 'So the arrow points from the ' + nm(food) + ' to the ' + nm(eater) + ': <b>' + nm(food) + ' → ' + nm(eater) + '</b>.'] };
    }
    if (L === 2) { // read the web: what does X eat (choose all), arrows into X
      var cand = web.nodes.filter(function (k) { return B().eats(w, k).length >= 1; }), x = R.pick(cand), foods = B().eats(w, x), others = web.nodes.filter(function (k) { return k !== x && foods.indexOf(k) < 0; });
      var items = foods.map(function (k) { return [cap(nm(k)), true]; }).concat(R.sample(others, Math.min(others.length, 4 - Math.min(foods.length, 2))).map(function (k) { return [cap(nm(k)), false]; }));
      return { q: 'Look at the food web of ' + web.name + '. Which does the ' + nm(x) + ' eat? Choose all that apply.', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false, decomposers: false } }, a: mcAll(R, items),
        hint: 'Find the arrows that point INTO the ' + nm(x) + '. Each starts at one of its foods.', steps: ['An arrow points from food to eater, so look for arrows ending at the ' + nm(x) + '.', 'They start at: <b>' + list(foods.map(nm)) + '</b>.', 'Arrows leaving the ' + nm(x) + ' go to the animals that eat it, not to its food.'] };
    }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) {
      var ends = {}; B().chains(w).forEach(function (c) { var e = c[c.length - 1]; if (c.length >= 3) ends[e] = (ends[e] || 0) + 1; });
      var all = B().chains(w), top = R.pick(Object.keys(ends)), n = all.filter(function (c) { return c[c.length - 1] === top; }).length;
      var thru = {}; all.forEach(function (c) { var i = c.indexOf(top); if (i > 0) thru[c.slice(0, i + 1).join('>')] = c.slice(0, i + 1); });
      var paths = Object.keys(thru).map(function (k) { return thru[k]; });
      return { q: 'In the food web of ' + web.name + ', how many different food chains run from a producer to the ' + nm(top) + '?', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false, decomposers: false } }, a: num(paths.length),
        hint: 'Start at each producer and follow every path of arrows that ends at the ' + nm(top) + '.', steps: paths.map(function (p) { return p.map(nm).join(' → '); }).concat(['That makes <b>' + paths.length + '</b> food chains.']) };
    }
    var c3 = R.pick(chains.filter(function (c) { return c.length >= 4; }).length ? chains.filter(function (c) { return c.length >= 4; }) : chains), j = R.int(1, c3.length - 1), LN = B().LEVEL_NAMES, one = LN.map(function (x) { return cap(x.replace(/s$/, '')); });
    return { q: 'In the food chain ' + c3.map(nm).join(' → ') + ', what is the ' + nm(c3[j]) + '?', a: mc(R, one[j], one.filter(function (x, i) { return i !== j && i < Math.max(4, c3.length); }).slice(0, 3)),
      hint: 'Producers are level 1; what eats a producer is a primary consumer.', steps: c3.slice(0, j + 1).map(function (k, i) { return cap(nm(k)) + ': ' + LN[i] + '.'; }).concat(['So the ' + nm(c3[j]) + ' is a <b>' + LN[j].replace(/s$/, '') + '</b> (level ' + (j + 1) + ').']) };
  });

  G('lifesci.web-changes', function (R, ctx) {
    var L = lvl(ctx), ch = ['It would increase', 'It would decrease', 'It would stay the same'];
    var w = R.pick(['meadow', 'forest', 'desert', 'pond']), web = B().WEBS[w];
    if (L === 1) {
      var preds = web.nodes.filter(function (k) { return B().eats(w, k).length; }), p = R.pick(preds), prey = R.pick(B().eats(w, p)), sh = R.int(0, 1);
      if (sh === 0) return { q: 'In ' + web.name + ', the ' + nm(p) + ' eats the ' + nm(prey) + '. If disease removed most of the ' + nm(p) + ' population, what would happen to the ' + nm(prey) + ' population at first?', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false, decomposers: false, highlight: [p, prey] } }, a: mcFixed(ch, ch[0]),
        hint: 'Fewer eaters means …', steps: ['Fewer ' + nm(p) + 's means fewer ' + nm(prey) + 's are eaten.', 'So the ' + nm(prey) + ' population would <b>increase</b> at first.'] };
      var preyOnly = web.nodes.filter(function (k) { var f = B().eats(w, k); return f.length === 1; }), e = preyOnly.length ? R.pick(preyOnly) : p, food = B().eats(w, e)[0];
      return { q: 'In ' + web.name + ', the only food of the ' + nm(e) + ' is the ' + nm(food) + '. If the ' + nm(food) + ' population crashed, what would happen to the ' + nm(e) + ' population?', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false, decomposers: false, highlight: [e, food] } }, a: mcFixed(ch, ch[1]),
        hint: 'Less food means …', steps: ['The ' + nm(e) + ' loses its only food.', 'So the ' + nm(e) + ' population would <b>decrease</b>.'] };
    }
    if (L === 2) { // two steps: predator removed -> prey up -> producer down
      var cases = []; web.nodes.forEach(function (p) { B().eats(w, p).forEach(function (q) { if (B().isProducer(w, q)) return; B().eats(w, q).forEach(function (r) { if (B().isProducer(w, r)) cases.push([p, q, r]); }); }); });
      var cs = R.pick(cases);
      return { q: 'In ' + web.name + ': ' + nm(cs[2]) + ' → ' + nm(cs[1]) + ' → ' + nm(cs[0]) + '. If people removed the ' + nm(cs[0]) + 's, what would most likely happen to the ' + nm(cs[2]) + ' after a few years?', a: mcFixed(ch, ch[1]),
        hint: 'Go one step at a time: first the ' + nm(cs[1]) + ', then what it eats.', steps: ['With fewer ' + nm(cs[0]) + 's, fewer ' + nm(cs[1]) + 's are eaten, so the ' + nm(cs[1]) + ' population grows.', 'More ' + nm(cs[1]) + 's eat more ' + nm(cs[2]) + '.', 'So the ' + nm(cs[2]) + ' would <b>decrease</b>: removing a predator affects plants two steps away.'] };
    }
    var cand = web.nodes.filter(function (k) { return B().eats(w, k).length && Object.keys(B().removeEffect(w, k)).length >= 2; }), k = R.pick(cand), eff = B().removeEffect(w, k), ups = Object.keys(eff).filter(function (x) { return eff[x] === 'up'; });
    var others = web.nodes.filter(function (x) { return x !== k && ups.indexOf(x) < 0; });
    var items = ups.map(function (x) { return [cap(nm(x)), true]; }).concat(R.sample(others, Math.min(others.length, 2)).map(function (x) { return [cap(nm(x)), false]; }));
    return { q: 'In the food web of ' + web.name + ', the ' + nm(k) + ' disappears. Which populations would most likely <b>increase</b> at first? Choose all that apply.', viz: { name: 'bi-foodweb', opts: { web: w, quiet: true, interactive: false, decomposers: false, ask: k } }, a: mcAll(R, items),
      hint: 'The populations the ' + nm(k) + ' ate are no longer eaten by it.', steps: ['The ' + nm(k) + ' ate: ' + list(B().eats(w, k).map(nm)) + '.', 'With the ' + nm(k) + ' gone, those are eaten less, so they <b>increase</b> at first.'].concat(Object.keys(eff).filter(function (x) { return eff[x] !== 'up'; }).length ? ['Animals that ate the ' + nm(k) + ' lose some food, so they may decrease.'] : []) };
  });

  var PYR = [['grass', 'grasshopper', 'mouse', 'snake', 'hawk'], ['algae', 'krill', 'fish', 'seal', 'shark'], ['tree', 'caterpillar', 'robin', 'owl'], ['grass', 'rabbit', 'fox'], ['algae', 'snail', 'fish', 'heron'], ['cactus', 'mouse', 'snake', 'hawk']];
  G('lifesci.energy-pyramids', function (R, ctx) {
    var L = lvl(ctx), ch = R.pick(PYR), base = R.pick([1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000]);
    if (L === 1) {
      var e2 = B().pyramid(base, 2)[1];
      return { q: 'The ' + nm(ch[0]) + ' in an area stores ' + fmtN(base) + ' kcal of energy. About how much energy is stored in the ' + nm(ch[1]) + 's that eat it?', unit: 'kcal', a: num(e2, 0.001),
        viz: { name: 'bi-pyramid', opts: { levels: ch.slice(0, 3), base: base, quiet: true, interactive: false, known: [0], ask: 1 } },
        hint: 'About 10% passes up one level.', steps: ['About 10% of the energy passes to the next level.', '10% of ' + fmtN(base) + ' = ' + fmtN(base) + ' × 0.1 = <b>' + fmtN(e2) + ' kcal</b>.'] };
    }
    if (L === 2) {
      var sh = R.int(0, 2);
      if (sh === 0) return { q: 'In an energy pyramid, about 90% of the energy at each level does not reach the next level. Where does most of it go?', a: mc(R, 'It is used for living and leaves as heat', ['It is recycled back to the producers', 'It is stored in the soil for next year', 'It is passed up to the top predator']),
        hint: 'Energy flows one way.', steps: ['Organisms use most of their energy to move, grow and keep their bodies running.', 'That energy leaves the ecosystem as <b>heat</b>; some is in parts that are never eaten.', 'Energy is not recycled; matter is.'] };
      if (sh === 1) return { q: 'True or false: energy in an ecosystem cycles from the top predators back to the producers, just like carbon does.', a: tf(false), hint: 'Which one cycles: matter or energy?',
        steps: ['Matter (like carbon and nitrogen) cycles: decomposers return it to the soil and air.', 'Energy enters as sunlight and leaves as heat at each level. It flows one way.', 'So the statement is <b>false</b>.'] };
      var n = R.int(3, Math.min(ch.length, 5)), pv = B().pyramid(base, n);
      return { q: 'Producers in a chain ' + ch.slice(0, n).map(nm).join(' → ') + ' store ' + fmtN(base) + ' kcal. About how much energy reaches the ' + nm(ch[n - 1]) + 's (level ' + n + ')?', unit: 'kcal', a: num(pv[n - 1], 0.001),
        viz: { name: 'bi-pyramid', opts: { levels: ch.slice(0, n), base: base, quiet: true, interactive: false, known: [0], ask: n - 1 } },
        hint: 'Take 10% once for each step up.', steps: pv.slice(1).map(function (v, i) { return 'Level ' + (i + 2) + ' (' + nm(ch[i + 1]) + '): 10% of ' + fmtN(pv[i]) + ' = ' + fmtN(v) + ' kcal.'; }).concat(['So about <b>' + fmtN(pv[n - 1]) + ' kcal</b> reaches level ' + n + '.']) };
    }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) { // work backward
      var nn = R.int(3, 4), top = R.pick([2, 3, 4, 5, 6, 8, 12, 15, 25]), prod = top * Math.pow(10, nn - 1), cc = R.pick(PYR.filter(function (c) { return c.length >= nn; }));
      return { q: 'The ' + nm(cc[nn - 1]) + 's at level ' + nn + ' of the chain ' + cc.slice(0, nn).map(nm).join(' → ') + ' get about ' + top + ' kcal. With about 10% passed up each step, how much energy did the producers store?', unit: 'kcal', a: num(prod, 0.001),
        hint: 'Going down one level, multiply by 10.', steps: ['Each step down, the energy is 10 times larger.', 'From level ' + nn + ' down to level 1 is ' + (nn - 1) + ' steps: ' + top + ' × ' + fmtN(Math.pow(10, nn - 1)) + '.', 'So the producers stored about <b>' + fmtN(prod) + ' kcal</b>.'] };
    }
    var eff = R.pick([0.05, 0.2]), b3 = R.pick([10000, 20000, 40000, 50000]), p3 = B().pyramid(b3, 3, eff);
    return { q: 'In one lake, about ' + eff * 100 + '% of the energy passes from each level to the next. The algae store ' + fmtN(b3) + ' kcal. How much reaches the level 3 consumers?', unit: 'kcal', a: num(p3[2], 0.001),
      hint: 'Take ' + eff * 100 + '% twice.', steps: ['Level 2: ' + eff * 100 + '% of ' + fmtN(b3) + ' = ' + fmtN(p3[1]) + ' kcal.', 'Level 3: ' + eff * 100 + '% of ' + fmtN(p3[1]) + ' = <b>' + fmtN(p3[2]) + ' kcal</b>.'] };
  });

  var INTER = ['Competition', 'Predation', 'Mutualism', 'Commensalism', 'Parasitism'];
  var INTER_BANK = [
    ['Two kinds of birds eat the same seeds in a meadow.', 0], ['Oak and maple seedlings grow side by side and shade each other.', 0], ['Lions and hyenas hunt the same zebras.', 0],
    ['An owl catches and eats a mouse.', 1], ['A heron spears and eats a fish.', 1], ['A wolf pack kills and eats a deer.', 1],
    ['Bees drink nectar from flowers and carry their pollen to other flowers.', 2], ['Bacteria in a cow\'s stomach digest grass; the cow gives them food and a home.', 2], ['A clownfish lives among an anemone\'s stinging tentacles and helps keep it clean.', 2], ['Bacteria in bean roots supply the plant with nitrogen; the plant feeds them sugar.', 2],
    ['Barnacles ride on a whale\'s skin and filter food from the water; the whale is barely affected.', 3], ['A bird builds its nest in a tree; the tree is not helped or harmed.', 3], ['Moss grows on the bark of a tree without harming it.', 3],
    ['A tick feeds on a deer\'s blood for days.', 4], ['A tapeworm lives in a dog\'s gut and absorbs its food.', 4], ['Fleas live in a cat\'s fur and bite its skin.', 4], ['Mistletoe grows on a tree and takes water and nutrients from it.', 4]];
  var PATTERN = ['− / −', '+ / −', '+ / +', '+ / 0', '+ / −'];
  G('lifesci.species-interactions', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var b = R.pick(INTER_BANK);
      return { q: 'Which kind of interaction is this?<br><i>' + b[0] + '</i>', a: mcFixed(INTER, INTER[b[1]]), hint: 'Score each species: does it gain (+), lose (−) or stay about the same (0)?',
        steps: ['Score it: ' + PATTERN[b[1]] + '.', ['Both species lose some of a shared resource: competition.', 'One kills and eats the other: predation.', 'Both benefit: mutualism.', 'One benefits and the other is unaffected: commensalism.', 'One lives on or in the other for a long time and harms it: parasitism.'][b[1]], 'So it is <b>' + INTER[b[1]].toLowerCase() + '</b>.'] };
    }
    if (L === 2) { // predation vs parasitism; mutualism vs commensalism
      var pair = R.coin() ? [1, 4] : [2, 3], k = R.pick(pair), b2 = R.pick(INTER_BANK.filter(function (x) { return x[1] === k; }));
      return { q: '<i>' + b2[0] + '</i><br>Is this ' + INTER[pair[0]].toLowerCase() + ' or ' + INTER[pair[1]].toLowerCase() + '?', a: mcFixed([INTER[pair[0]], INTER[pair[1]]], INTER[k]),
        hint: pair[0] === 1 ? 'Is the other animal killed and eaten, or fed on over a long time?' : 'Does the second species gain anything, or is it unaffected?',
        steps: [pair[0] === 1 ? (k === 1 ? 'The prey is killed and eaten in one meal.' : 'The host is fed on for a long time and is harmed but not killed right away.') : (k === 2 ? 'Both species gain something.' : 'One gains; the other is not helped or harmed.'), 'So it is <b>' + INTER[k].toLowerCase() + '</b>.'] };
    }
    var target = R.int(0, 4), right = R.pick(INTER_BANK.filter(function (x) { return x[1] === target; })), wrong = R.sample(INTER_BANK.filter(function (x) { return x[1] !== target && !(target === 1 && x[1] === 4) && !(target === 4 && x[1] === 1); }), 3);
    return { q: 'Which is an example of <b>' + INTER[target].toLowerCase() + '</b>?', a: mc(R, right[0], wrong.map(function (x) { return x[0]; })), hint: INTER[target] + ' scores ' + PATTERN[target] + '.',
      steps: [INTER[target] + ' means ' + ['both species lose some of a shared resource', 'one animal kills and eats another', 'both species benefit', 'one benefits and the other is unaffected', 'one lives on or in a host and harms it'][target] + '.', 'That fits: <b>' + right[0] + '</b>'] };
  });

  function cycleStep(c, i) { var s = B().MATTER[c].steps[i]; return { proc: s[0], from: B().MATTER[c].stores[s[1]], to: B().MATTER[c].stores[s[2]], i: i }; }
  G('lifesci.carbon-cycle', function (R, ctx) {
    var L = lvl(ctx), steps = B().MATTER.carbon.steps;
    if (L === 1) {
      var picks = [0, 1, 2, 3, 6, 7], i = R.pick(picks), s = cycleStep('carbon', i), procs = ['photosynthesis', 'eating', 'respiration', 'decomposition', 'burning (combustion)'];
      return { q: 'Which process moves carbon from <b>' + s.from + '</b> to <b>' + s.to + '</b>?', viz: quiet('bi-cycle', { cycle: 'carbon', ask: i }), a: mc(R, cap(s.proc), procs.filter(function (p) { return p !== s.proc; }).slice(0, 3).map(cap)),
        hint: 'The "?" marks the arrow. Think about what happens along it.', steps: [{ photosynthesis: 'Plants take in carbon dioxide and build it into sugar.', eating: 'Animals take in the carbon stored in the plants they eat.', respiration: 'Cells break down sugar and release carbon dioxide.', decomposition: 'Decomposers break down dead matter and release carbon dioxide.', 'burning (combustion)': 'Burning fuels releases their carbon as carbon dioxide.' }[s.proc], 'So the process is <b>' + s.proc + '</b>.'] };
    }
    if (L === 2) { // atoms are not destroyed
      var who = R.pick(['a deer', 'a rabbit', 'you', 'a bear', 'a robin']), food = R.pick(['clover', 'an apple', 'a sandwich', 'berries', 'seeds']);
      return { q: 'After ' + who + ' eat' + (who === 'you' ? '' : 's') + ' ' + food + ', cells use the sugar for energy. What happens to the carbon atoms in that sugar?', a: mc(R, 'They leave as carbon dioxide, which is breathed out', ['They are destroyed when the energy is used', 'They turn into energy', 'They stay in the body forever']),
        hint: 'Atoms are never used up.', steps: ['Respiration breaks sugar into carbon dioxide and water and releases the stored energy.', 'The carbon atoms are not destroyed; they leave in <b>carbon dioxide</b> that is breathed out.', 'A plant can take that carbon dioxide in again.'] };
    }
    var sh = R.int(0, 1);
    if (sh === 0) {
      var intoAir = ['respiration', 'decomposition', 'burning (combustion)'], notAir = ['photosynthesis', 'eating', 'burial over millions of years'];
      var items = R.sample(intoAir, 2).map(function (p) { return [cap(p), true]; }).concat(R.sample(notAir, 2).map(function (p) { return [cap(p), false]; }));
      return { q: 'Which processes return carbon to the air as carbon dioxide? Choose all that apply.', a: mcAll(R, items), hint: 'Which ones release carbon dioxide?',
        steps: ['Respiration, decomposition and burning all release carbon dioxide into the air.', 'Photosynthesis removes carbon dioxide from the air; eating moves carbon from plants to animals; burial locks it away.'] };
    }
    var paths = [[['photosynthesis', 'eating', 'respiration'], 'air → plants → animals → air'], [['photosynthesis', 'death and wastes', 'decomposition'], 'air → plants → dead matter → air'], [['photosynthesis', 'burial over millions of years', 'burning (combustion)'], 'air → plants → fossil fuels → air']];
    var pth = R.pick(paths), o = orderMc(R, pth[0].map(cap), null, 3);
    return { q: 'A carbon atom takes the path ' + pth[1] + '. Put the processes in order:<br>' + o.list.join('<br>'), a: o.a, hint: 'Which process takes carbon out of the air first?',
      steps: [pth[0].map(cap).join(' → ') + '.', 'So the order is <b>' + o.right + '</b>.'] };
  });

  G('lifesci.nitrogen-cycle', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var i = R.pick([0, 2, 3, 6, 7]), s = cycleStep('nitrogen', i), procs = B().MATTER.nitrogen.steps.map(function (x) { return x[0]; }).filter(function (p, j, a) { return a.indexOf(p) === j && p !== s.proc && p !== 'death and wastes'; });
      return { q: 'Which process moves nitrogen from <b>' + s.from + '</b> to <b>' + s.to + '</b>?', viz: quiet('bi-cycle', { cycle: 'nitrogen', ask: i }), a: mc(R, cap(s.proc), R.sample(procs, 3).map(cap)),
        hint: 'The "?" marks the arrow.', steps: [{ 'nitrogen fixation by bacteria': 'Nitrogen-fixing bacteria turn nitrogen gas into ammonium in the soil.', 'absorption by roots': 'Roots take up ammonium and nitrate from the soil.', eating: 'Animals get nitrogen from the proteins in the plants they eat.', 'decomposition (ammonification)': 'Decomposers break down dead matter and wastes and release ammonium.', 'denitrification by bacteria': 'Other bacteria turn nitrates back into nitrogen gas.' }[s.proc], 'So the process is <b>' + s.proc + '</b>.'] };
    }
    if (L === 2) {
      var sh = R.int(0, 1);
      if (sh === 0) return { q: 'Air is about 78% nitrogen. How do most plants get the nitrogen they need?', a: mc(R, 'Through their roots, as ammonium or nitrate made by bacteria', ['Through their leaves, straight from the air', 'From sunlight', 'By eating insects']),
        hint: 'Can a plant use nitrogen gas (N₂) directly?', steps: ['Nitrogen gas has a very strong triple bond that plants cannot break.', 'Bacteria in soil and root nodules turn it into ammonium (and other bacteria make nitrate).', 'Plants take those up <b>through their roots</b>.'] };
      return { q: 'True or false: plants take nitrogen gas in through their leaves and use it to build proteins.', a: tf(false), hint: 'Think about what bacteria do in the nitrogen cycle.',
        steps: ['Plants cannot use nitrogen gas.', 'They depend on bacteria that fix nitrogen into forms their roots absorb.', 'So the statement is <b>false</b>.'] };
    }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) {
      var ok = [['Nitrogen-fixing bacteria in root nodules', true], ['Bacteria that fix nitrogen in the soil', true], ['Lightning', true]], no = [['Photosynthesis in leaves', false], ['Animals breathing', false], ['Sunlight warming the soil', false]];
      var items = R.sample(ok, 2).concat(R.sample(no, 2));
      return { q: 'Which of these change nitrogen gas from the air into forms plants can use? Choose all that apply.', a: mcAll(R, items), hint: 'Breaking N₂ takes a lot of energy or a special enzyme.',
        steps: ['Nitrogen-fixing bacteria (in soil and in root nodules) have the enzyme that breaks N₂.', 'Lightning fixes a small amount too.', 'Photosynthesis, breathing and warm soil do not fix nitrogen.'] };
    }
    var crop = R.pick(['peas', 'beans', 'clover', 'alfalfa', 'peanuts']);
    return { q: 'A farmer grows corn one year and ' + crop + ' the next, and finds the soil has more usable nitrogen afterward. Why?', a: mc(R, 'Bacteria in the root nodules of the ' + crop + ' fix nitrogen from the air', ['The ' + crop + ' pull nitrogen in through their leaves', 'The corn left extra nitrogen behind', 'Rain removed the nitrogen from the soil']),
      hint: 'What lives in the roots of ' + crop + '?', steps: [cap(crop) + ' have root nodules filled with nitrogen-fixing bacteria.', 'The bacteria turn nitrogen gas into ammonium; some stays in the soil when the roots decompose.', 'So the soil gains nitrogen from the <b>bacteria in the nodules</b>.'] };
  });

  function biomeOf(key) { return B().BIOMES.filter(function (b) { return b.key === key; })[0]; }
  function inRange(v, r) { return v >= r[0] && v <= r[1]; }
  G('lifesci.biomes', function (R, ctx) {
    var L = lvl(ctx), BI = B().BIOMES, names = BI.map(function (b) { return cap(b.name); });
    if (L === 1) {
      var b = R.pick(BI), sh = R.int(0, 1);
      if (sh === 0) return { q: 'Which biome has <b>' + b.plants + '</b>?', a: mc(R, cap(b.name), R.sample(BI.filter(function (x) { return x !== b; }), 3).map(function (x) { return cap(x.name); })), hint: 'Which climate would those plants need?',
        steps: [cap(b.plants) + ' are typical of the ' + b.name + ' (' + b.rain[0] + '–' + b.rain[1] + ' cm of rain a year).', 'So the answer is <b>' + b.name + '</b>.'] };
      return { q: 'Which biome is known for <b>' + b.life + '</b>?', a: mc(R, cap(b.name), R.sample(BI.filter(function (x) { return x !== b; }), 3).map(function (x) { return cap(x.name); })), hint: 'Climate decides the plants, and the plants decide the animals.',
        steps: ['The ' + b.name + ' has ' + b.plants + ', and ' + b.life + '.', 'So the answer is <b>' + b.name + '</b>.'] };
    }
    if (L === 2) { // climate numbers decide the biome
      var t = null, rain, temp, guard = 0;
      while (!t && guard++ < 80) { var bb = R.pick(BI); rain = R.int(bb.rain[0], bb.rain[1]); temp = R.int(bb.temp[0], bb.temp[1]); var hits = BI.filter(function (x) { return inRange(rain, x.rain) && inRange(temp, x.temp); }); if (hits.length === 1 && B().biomeFor(rain, temp).key === bb.key) t = bb; }
      if (!t) { t = biomeOf('rainforest'); rain = 300; temp = 26; }
      return { q: 'A region gets about <b>' + rain + ' cm</b> of rain a year, and its average temperature is about <b>' + temp + ' °C</b>. Which biome is it most likely?', a: mc(R, cap(t.name), R.sample(BI.filter(function (x) { return x !== t; }), 3).map(function (x) { return cap(x.name); })),
        hint: 'Use rainfall first, then temperature.', steps: ['Temperature and rainfall decide a biome, not place names or animals.', 'The ' + t.name + ' gets about ' + t.rain[0] + '–' + t.rain[1] + ' cm of rain and averages about ' + t.temp[0] + ' to ' + t.temp[1] + ' °C.', 'So it is the <b>' + t.name + '</b>.'] };
    }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) return { q: 'The tundra and the desert both get less than about 25 cm of rain a year. What mainly makes them different biomes?', a: mc(R, 'Temperature', ['The animals that live there', 'Their names on a map', 'The color of the soil']),
      hint: 'Rain is the same; what else describes climate?', steps: ['Both are dry.', 'The tundra is very cold with frozen ground; most deserts are hot by day.', 'So <b>temperature</b> separates them.'] };
    var places = [['the Mojave in North America', 'desert'], ['the Sonoran Desert of Arizona', 'desert'], ['the Amazon basin', 'rainforest'], ['the Great Plains', 'grassland'], ['northern Canada\'s spruce forests', 'taiga'], ['the forests of the eastern United States', 'deciduous'], ['northern Alaska near the Arctic Ocean', 'tundra']];
    var p = R.pick(places), tb = biomeOf(p[1]);
    return { q: 'Biomes are defined by climate. Which description best matches ' + p[0] + '?', a: mc(R, cap(tb.name) + ': ' + tb.rain[0] + '–' + tb.rain[1] + ' cm of rain a year, ' + tb.plants, R.sample(BI.filter(function (x) { return x !== tb; }), 3).map(function (x) { return cap(x.name) + ': ' + x.rain[0] + '–' + x.rain[1] + ' cm of rain a year, ' + x.plants; })),
      hint: 'Think of the climate there.', steps: [cap(p[0]) + ' is in the ' + tb.name + ' biome.', 'It gets about ' + tb.rain[0] + '–' + tb.rain[1] + ' cm of rain a year and has ' + tb.plants + '.'] };
  });

  var PRIM = ['fresh lava rock on a new volcanic island', 'bare rock left behind by a melting glacier', 'a new sand dune at the edge of a lake', 'rock exposed by a landslide that stripped away all the soil'];
  var SECO = ['a forest after a wildfire', 'a farm field that nobody plows anymore', 'a meadow after a flood', 'a forest after a hurricane knocks down many trees', 'a hillside after logging', 'a lawn left unmowed for years'];
  G('lifesci.succession', function (R, ctx) {
    var L = lvl(ctx), ch = ['Primary succession', 'Secondary succession'];
    if (L === 1) {
      var p = R.coin(), s = p ? R.pick(PRIM) : R.pick(SECO);
      return { q: 'Life slowly returns to <b>' + s + '</b>. Is this primary or secondary succession?', a: mcFixed(ch, ch[p ? 0 : 1]), hint: 'Is there soil?',
        steps: [p ? 'There is no soil: life must start almost from scratch.' : 'The soil (with seeds and roots) is still there.', 'So it is <b>' + ch[p ? 0 : 1].toLowerCase() + '</b>.'] };
    }
    if (L === 2) {
      var sh = R.int(0, 1);
      if (sh === 0) return { q: 'A forest burns in a wildfire. Why does it usually recover faster than bare volcanic rock?', a: mc(R, 'Its soil, seeds and roots remain, so it skips the soil-making stages', ['Fire adds new rock for lichens', 'Succession after a fire always starts from bare rock', 'Burned forests never change again']),
        hint: 'What does a burned forest still have that lava rock lacks?', steps: ['After a fire, soil remains, with seeds and living roots in it.', 'That is secondary succession; it does not have to wait for lichens and mosses to make soil.', 'So it recovers <b>faster</b>.'] };
      return { q: 'True or false: once a mature forest forms, the ecosystem stays exactly the same forever.', a: tf(false), hint: 'Think of storms, fires and new species.',
        steps: ['Disturbances such as storms, fires, floods and new species keep changing communities.', 'Succession can start again after each one.', 'So the statement is <b>false</b>.'] };
    }
    var st = ['bare rock', 'lichens and mosses', 'grasses and small plants', 'shrubs', 'trees'], sh3 = R.int(0, 1);
    if (sh3 === 0) { var o = orderMc(R, st.slice(1).map(cap), null, 3); return { q: 'Primary succession begins on bare rock. Put the stages that follow in order:<br>' + o.list.join('<br>'), a: o.a, hint: 'What can grow on rock with no soil?', steps: ['Bare rock → lichens and mosses (they start soil) → grasses → shrubs → trees.', 'So the order is <b>' + o.right + '</b>.'] }; }
    var k = R.int(1, 3);
    return { q: 'In primary succession, which stage comes right after <b>' + st[k] + '</b>?', a: mc(R, cap(st[k + 1]), st.filter(function (x, i) { return i !== k + 1 && i !== k; }).map(cap)), hint: 'Each stage builds more soil and shade for the next.',
      steps: ['The stages run: ' + st.join(' → ') + '.', 'So after ' + st[k] + ' come <b>' + st[k + 1] + '</b>.'] };
  });

  var TREE_SP = ['oak', 'maple', 'pine', 'birch', 'hickory', 'beech', 'cedar', 'elm'];
  G('lifesci.biodiversity', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var a = R.int(2, 6), b = R.int(8, 30), ia = R.int(400, 1200), ib = R.int(150, 380), aFirst = R.coin();
      var A = aFirst ? [ia, a] : [ib, b], Bp = aFirst ? [ib, b] : [ia, a], right = A[1] > Bp[1] ? 'Plot A' : 'Plot B';
      return { q: 'Plot A has ' + A[0] + ' plants of ' + A[1] + ' species. Plot B has ' + Bp[0] + ' plants of ' + Bp[1] + ' species. Which plot has greater species diversity?', a: mcFixed(['Plot A', 'Plot B'], right),
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: ['Plot A', 'Plot B'], series: [{ name: 'Species', values: [A[1], Bp[1]] }], ylabel: 'Number of species', interactive: false } },
        hint: 'Count kinds, not individuals.', steps: ['Species diversity counts the number of different species.', 'Plot A: ' + A[1] + ' species. Plot B: ' + Bp[1] + ' species.', 'So <b>' + right + '</b>' + ((right === 'Plot A') === (A[0] > Bp[0]) ? '.' : ', even though it has fewer plants.')] };
    }
    if (L === 2) {
      var n = R.int(7, 10), kinds = R.sample(TREE_SP, R.int(3, 5)), trees = []; kinds.forEach(function (k) { trees.push(k); }); while (trees.length < n) trees.push(R.pick(kinds)); trees = R.shuffle(trees);
      return { q: 'A student records the trees along a trail: ' + trees.join(', ') + '. How many <b>species</b> did she find?', a: num(kinds.length), hint: 'Count each kind of tree once.',
        steps: ['She counted ' + trees.length + ' trees, but that is the number of individuals.', 'Different kinds: ' + list(kinds) + '.', 'That is <b>' + kinds.length + '</b> species.'] };
    }
    var svc = [['Bees pollinating apple trees', true], ['Wetlands filtering water', true], ['Tree roots holding soil on a hillside', true], ['Decomposers making soil fertile', true], ['Forests providing wood', true]], not = [['A parking lot storing cars', false], ['A factory making plastic', false], ['A highway carrying trucks', false]];
    var items = R.sample(svc, R.int(2, 3)).concat(R.sample(not, 2));
    return { q: 'Which are <b>ecosystem services</b>, benefits that people get from healthy ecosystems? Choose all that apply.', a: mcAll(R, items), hint: 'Which ones are done by living things and natural systems?',
      steps: ['Ecosystem services are benefits from nature: pollination, clean water, fertile and stable soil, food and wood.', 'Parking lots, factories and highways are things people build, not services of an ecosystem.'] };
  });

  var THREATS = ['Habitat loss', 'Invasive species', 'Pollution', 'Overharvesting'];
  var THREAT_BANK = [['A wetland is drained and paved for a parking lot.', 0], ['A forest is cleared to build houses.', 0], ['A river is dammed and the valley above it floods.', 0], ['Prairie is plowed for new farmland.', 0],
    ['Zebra mussels arrive in the Great Lakes in ships\' ballast water and crowd out native mussels.', 1], ['Pet pythons released in Florida\'s Everglades start eating native mammals.', 1], ['Kudzu vines from Asia spread over trees in the southern United States.', 1],
    ['Fertilizer washes off fields into a lake and feeds algae blooms.', 2], ['Oil spills from a damaged tanker.', 2], ['Trash and plastic collect in the ocean.', 2],
    ['A fishing fleet catches cod faster than they can reproduce.', 3], ['Hunters killed passenger pigeons by the millions in the 1800s.', 3], ['A rare orchid is dug up and sold until few are left in the wild.', 3]];
  var FIXES = [['Protect the remaining wetlands as a preserve', 0], ['Clean boats and drain ballast water before entering new lakes', 1], ['Plant strips of grass along streams to catch runoff from fields', 2], ['Set catch limits and closed seasons for the fishery', 3]];
  G('lifesci.human-impact', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var b = R.pick(THREAT_BANK);
      return { q: 'Which kind of threat to an ecosystem is this?<br><i>' + b[0] + '</i>', a: mcFixed(THREATS, THREATS[b[1]]), hint: 'Is a home destroyed, a species brought in, the water or air dirtied, or too many taken?',
        steps: [['The living space itself is destroyed.', 'A species is brought into a place where it did not live before and spreads.', 'Harmful substances are added to the environment.', 'Living things are taken faster than they can be replaced.'][b[1]], 'So it is <b>' + THREATS[b[1]].toLowerCase() + '</b>.'] };
    }
    if (L === 2) {
      var s = R.pick([['Any change people make to an ecosystem harms it.', false, 'Effects depend on the change. A well-managed fishery or a restored wetland can keep an ecosystem healthy.'], ['Nature always repairs itself, so people\'s effects do not matter.', false, 'Some damage, like an extinct species, cannot be undone, and recovery can take a very long time.'],
        ['An invasive species often spreads fast because the predators and diseases that controlled it at home are missing.', true, 'In its new home few things eat it, so its population grows quickly.'], ['Solutions to ecosystem problems usually have both costs and benefits that people weigh.', true, 'A preserve protects habitat but limits building; catch limits protect fish but reduce income for a while.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Think about whether the statement is always true.', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var f = R.pick(FIXES), prob = R.pick(THREAT_BANK.filter(function (x) { return x[1] === f[1]; }));
    return { q: 'Which solution is aimed most directly at this problem?<br><i>' + prob[0] + '</i>', a: mc(R, f[0], FIXES.filter(function (x) { return x !== f; }).map(function (x) { return x[0]; })),
      hint: 'First name the kind of threat.', steps: ['This is ' + THREATS[f[1]].toLowerCase() + '.', 'The matching solution: <b>' + f[0].toLowerCase() + '</b>.', 'Communities still compare its costs and benefits before choosing it.'] };
  });


  /* ======================= Unit 8: Populations ======================= */
  var POP_SP = [['deer', 'fawns'], ['prairie dogs', 'pups'], ['geese', 'goslings'], ['rabbits', 'kits'], ['wolves', 'pups'], ['sea otters', 'pups'], ['ducks', 'ducklings'], ['bison', 'calves']];
  G('lifesci.population-growth', function (R, ctx) {
    var L = lvl(ctx), sp = R.pick(POP_SP);
    if (L === 1) {
      var N = R.int(8, 40) * 10, b = R.int(3, 12) * 5, ar = R.int(0, 6) * 5, d = R.int(2, 10) * 5, lv = R.int(0, 5) * 5, end = N + b + ar - d - lv;
      return { q: 'A population of ' + N + ' ' + sp[0] + ' has ' + b + ' ' + sp[1] + ' born this year. ' + ar + ' ' + sp[0] + ' move in, ' + d + ' die and ' + lv + ' leave. How many ' + sp[0] + ' are there at the end of the year?', a: num(end),
        hint: 'Add births and arrivals; subtract deaths and departures.', steps: ['Added: ' + b + ' + ' + ar + ' = ' + (b + ar) + '.', 'Lost: ' + d + ' + ' + lv + ' = ' + (d + lv) + '.', 'Change: ' + (b + ar) + ' − ' + (d + lv) + ' = ' + (b + ar - d - lv) + '.', 'End: ' + N + ' + (' + (b + ar - d - lv) + ') = <b>' + end + '</b>.'] };
    }
    if (L === 2) { // the gain grows with the population
      var sh = R.int(0, 1);
      if (sh === 0) {
        var N0 = R.pick([100, 200, 400, 800, 40, 60]), pct = R.pick([50, 100]), yrs = 2, n1 = N0 * (1 + pct / 100), n2 = n1 * (1 + pct / 100);
        return { q: 'A population of ' + N0 + ' mice grows by ' + pct + '% each year while food is plentiful. How many mice are there after ' + yrs + ' years?', a: num(n2),
          viz: quiet('bi-population', { model: 'exp', N0: N0, r: Math.log(1 + pct / 100), T: 3, K: n2 * 1.6 }),
          hint: 'Find the ' + pct + '% of the NEW population each year.', steps: ['Year 1: ' + pct + '% of ' + N0 + ' = ' + (n1 - N0) + ', so ' + N0 + ' + ' + (n1 - N0) + ' = ' + n1 + '.', 'Year 2: ' + pct + '% of ' + n1 + ' = ' + (n2 - n1) + ', so ' + n1 + ' + ' + (n2 - n1) + ' = <b>' + n2 + '</b>.', 'The gain grew from ' + (n1 - N0) + ' to ' + (n2 - n1) + ': the growth itself grows.'] };
      }
      var g0 = R.pick([10, 20, 40, 50]);
      return { q: 'A pond plant population doubles every week: ' + g0 + ', ' + 2 * g0 + ', ' + 4 * g0 + ', ' + 8 * g0 + ' … A student says it grows by the same number, ' + g0 + ', each week. Is that right?', a: mc(R, 'No. The number added doubles each week too', ['Yes. It adds ' + g0 + ' every week', 'No. It adds fewer plants each week']),
        hint: 'Find how many are added each week.', steps: ['Added each week: ' + g0 + ', then ' + 2 * g0 + ', then ' + 4 * g0 + '.', 'Each plant makes new ones, so a bigger population adds more.', 'So <b>no</b>: the gain doubles each week.'] };
    }
    var dt = R.pick([20, 30]), hrs = R.pick([2, 3]), start = R.pick([1, 5, 10, 100]), gens = hrs * 60 / dt, endN = start * Math.pow(2, gens);
    return { q: 'A colony of ' + start + ' bacteri' + (start === 1 ? 'um' : 'a') + ' doubles every ' + dt + ' minutes with plenty of food. How many bacteria are there after ' + hrs + ' hours?', a: num(endN),
      viz: quiet('bi-population', { model: 'doubling', gens: Math.min(gens, 9), N0: 1 }),
      hint: 'First find how many doublings fit in ' + hrs + ' hours.', steps: [hrs + ' hours = ' + hrs * 60 + ' minutes; ' + hrs * 60 + ' ÷ ' + dt + ' = ' + gens + ' doublings.', start + ' × 2<sup>' + gens + '</sup> = ' + start + ' × ' + Math.pow(2, gens) + ' = <b>' + fmtN(endN) + '</b>.'] };
  });

  var LIMIT_BANK = [['A pond has plenty of insects and water for its frogs, but only a few logs and rocks where frogs can hide from herons.', 'Shelter'], ['A herd of elk has plenty of space and water, but deep snow buries most of the grass all winter.', 'Food'],
    ['A desert has lots of seeds for kangaroo rats, but almost no rain falls for two years.', 'Water'], ['Barn owls have plenty of mice to eat, but there are very few old barns or hollow trees to nest in.', 'Nesting space'],
    ['Mussels cover every bit of rock along a shore, and new young have nowhere to attach.', 'Space'], ['Rabbits have food and burrows, but a new disease spreads quickly through the crowded warren.', 'Disease']];
  G('lifesci.limiting-factors', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var b = R.pick(LIMIT_BANK), others = ['Food', 'Water', 'Shelter', 'Space', 'Disease', 'Nesting space', 'Sunlight'].filter(function (x) { return x !== b[1] && !(b[1] === 'Nesting space' && x === 'Shelter') && !(b[1] === 'Shelter' && x === 'Space') && !(b[1] === 'Space' && x === 'Shelter'); });
      return { q: b[0] + ' What is the limiting factor?', a: mc(R, b[1], R.sample(others, 3)), hint: 'Which need is in short supply?',
        steps: ['Everything else the population needs is plentiful.', 'What runs short first sets the limit: <b>' + b[1].toLowerCase() + '</b>.'] };
    }
    if (L === 2) {
      var K = R.pick([300, 400, 500, 600, 800, 1200]), N0 = Math.round(K / R.pick([8, 10, 12]) / 10) * 10 || 10, yrs = [], vals = [], r = 0.8;
      var offs = R.shuffle([-0.04, -0.02, 0.02, 0.04]);
      for (var t = 0; t <= 14; t += 2) { yrs.push(t); var v = B().logisticN(N0, r, K, t); if (t >= 8) v = K * (1 + offs[(t - 8) / 2]); vals.push(Math.round(v / 10) * 10); }
      return { q: 'A population was counted every 2 years: ' + vals.join(', ') + '. About what is the carrying capacity?', a: mc(R, fmtN(K), [fmtN(Math.max.apply(null, vals) + K / 2), fmtN(N0), fmtN(K * 2)]),
        viz: quiet('bi-population', { model: 'logistic', N0: N0, r: r, K: K, T: 14, points: yrs.map(function (t, i) { return [t, vals[i]]; }) }),
        hint: 'Where does the population level off?', steps: ['The population grows fast at first, then levels off.', 'From year 8 on it moves up and down between ' + Math.min.apply(null, vals.slice(4)) + ' and ' + Math.max.apply(null, vals.slice(4)) + '.', 'The level it rises and falls around is the carrying capacity: about <b>' + fmtN(K) + '</b>.'] };
    }
    var s = R.pick([['A population with plenty of food can keep growing forever.', false, 'Something else, such as water, space or disease, will run short and limit it.'], ['A population at its carrying capacity stays at exactly the same number every year.', false, 'Real populations rise and fall around the carrying capacity.'],
      ['The resource in shortest supply sets the limit on a population.', true, 'Plenty of one resource cannot make up for too little of another.'], ['Carrying capacity can change, for example in a drought.', true, 'A drought grows less food, so the environment supports fewer individuals.'], ['Disease spreads more easily in a crowded population, which helps limit it.', true, 'Close contact passes germs quickly, so disease is a limiting factor that gets stronger as numbers grow.']]);
    return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Think about what happens near carrying capacity.', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
  });

  G('lifesci.predator-prey', function (R, ctx) {
    var L = lvl(ctx), pair = R.pick([['snowshoe hares', 'lynx'], ['rabbits', 'foxes'], ['mice', 'owls'], ['moose', 'wolves'], ['aphids', 'ladybugs']]);
    if (L === 1) {
      var p1 = R.int(2, 6), per = R.pick([8, 10, 12]), lag = R.int(1, 3), p2 = p1 + per;
      return { q: 'In a study, the ' + pair[0] + ' peaked in years ' + p1 + ' and ' + p2 + '. The ' + pair[1] + ' peaked in years ' + (p1 + lag) + ' and ' + (p2 + lag) + '. How many years after the prey peak does the predator peak come?', a: num(lag), unit: 'years',
        hint: 'Subtract the prey peak year from the predator peak year.', steps: [(p1 + lag) + ' − ' + p1 + ' = ' + lag + ' and ' + (p2 + lag) + ' − ' + p2 + ' = ' + lag + '.', 'The predators peak <b>' + lag + '</b> year' + (lag > 1 ? 's' : '') + ' after the prey.'] };
    }
    if (L === 2) {
      var sh = R.int(0, 2);
      if (sh === 0) return { q: 'On a graph of ' + pair[0] + ' and ' + pair[1] + ', which usually peaks first?', viz: quiet('bi-population', { model: 'predprey', T: 30 }), a: mcFixed(['The prey (' + pair[0] + ')', 'The predators (' + pair[1] + ')', 'They peak at the same time'], 'The prey (' + pair[0] + ')'),
        hint: 'Predators need plenty of food before their numbers can rise.', steps: ['Plenty of prey feeds the predators, and their numbers rise afterward.', 'So the <b>prey peak first</b>; the predator peak comes later.'] };
      if (sh === 1) return { q: 'The ' + pair[0] + ' are falling fast and the ' + pair[1] + ' are at their highest number. What happens next?', a: mc(R, 'The ' + pair[1] + ' start to decrease', ['The ' + pair[1] + ' keep increasing forever', 'The ' + pair[0] + ' go extinct', 'Nothing changes']),
        hint: 'What happens to predators when their food gets scarce?', steps: ['Fewer prey means less food for each predator.', 'Fewer young predators survive, and some starve or leave.', 'So the <b>' + pair[1] + ' start to decrease</b>.'] };
      return { q: 'True or false: predators usually eat every last one of their prey.', a: tf(false), hint: 'What happens to predators when prey become hard to find?',
        steps: ['As prey get scarce, the last few are hard to find, and hungry predators decline first.', 'With fewer predators, the prey recover.', 'So the statement is <b>false</b>.'] };
    }
    var per3 = 10, lag3 = R.int(2, 3), pk = R.int(1, 3), rows = [], yrs = [];
    for (var y = 0; y <= 8; y++) { var prey = Math.round(60 + 40 * Math.cos(2 * Math.PI * (y - pk) / per3)), pred = Math.round(25 + 12 * Math.cos(2 * Math.PI * (y - pk - lag3) / per3)); rows.push([y, prey, pred]); yrs.push(y); }
    var predPeak = rows.reduce(function (b, r) { return r[2] > b[2] ? r : b; }), preyPeak = rows.reduce(function (b, r) { return r[1] > b[1] ? r : b; });
    return { q: 'Counts of ' + pair[0] + ' (prey) and ' + pair[1] + ' (predators), in hundreds:<br>' + rows.slice(0, 9).map(function (r) { return 'year ' + r[0] + ': ' + r[1] + ' and ' + r[2]; }).join('; ') + '.<br>How many years after the prey peak do the predators peak?', a: num(predPeak[0] - preyPeak[0]), unit: 'years',
      viz: { name: 'bi-chart', opts: { kind: 'line', x: yrs.slice(0, 9), series: [{ name: cap(pair[0]), values: rows.slice(0, 9).map(function (r) { return r[1]; }) }, { name: cap(pair[1]), values: rows.slice(0, 9).map(function (r) { return r[2]; }), color: 2 }], xlabel: 'Year', ylabel: 'Hundreds', interactive: false } },
      hint: 'Find the year with the highest count for each.', steps: ['Prey peak: year ' + preyPeak[0] + ' (' + preyPeak[1] + ').', 'Predator peak: year ' + predPeak[0] + ' (' + predPeak[2] + ').', predPeak[0] + ' − ' + preyPeak[0] + ' = <b>' + (predPeak[0] - preyPeak[0]) + '</b> years.'] };
  });

  G('lifesci.sampling-populations', function (R, ctx) {
    var L = lvl(ctx), org = R.pick(['clover plants', 'dandelions', 'snails', 'daisies', 'mushrooms', 'milkweed plants', 'ant hills']);
    function counts(n, mean) { var c = [], s = 0; for (var i = 0; i < n - 1; i++) { var v = Math.max(0, mean + R.int(-3, 3)); c.push(v); s += v; } var last = mean * n - s; if (last < 0 || last > mean + 6) return counts(n, mean); c.push(last); return R.shuffle(c); }
    if (L === 1) {
      var n = R.int(4, 5), mean = R.int(3, 9), cs = counts(n, mean), area = R.pick([50, 80, 100, 120, 200, 250, 500]), est = mean * area;
      return { q: n + ' quadrats of 1 m² are placed at random in a ' + area + ' m² field. They hold ' + list(cs.map(String)) + ' ' + org + '. Estimate the number of ' + org + ' in the field.', a: num(est, 0.01),
        hint: 'Average the counts, then multiply by the number of 1 m² squares in the field.', steps: ['Average: (' + cs.join(' + ') + ') ÷ ' + n + ' = ' + (mean * n) + ' ÷ ' + n + ' = ' + mean + ' per m².', 'Squares in the field: ' + area + ' ÷ 1 = ' + area + '.', 'Estimate: ' + mean + ' × ' + area + ' = <b>' + fmtN(est) + '</b>.'] };
    }
    if (L === 2) { // match units
      var side = R.pick([0.5, 0.25, 2]), qa = side * side, meanc = side === 2 ? R.int(8, 20) : R.int(2, 6), tot = R.pick([20, 40, 50, 100, 200]), nq = tot / qa, est2 = meanc * nq;
      return { q: 'Square quadrats ' + (side < 1 ? side * 100 + ' cm' : side + ' m') + ' on each side hold an average of ' + meanc + ' ' + org + '. The whole garden is ' + tot + ' m². Estimate the number of ' + org + ' in the garden.', a: num(est2, 0.01),
        hint: 'First find the area of one quadrat in m².', steps: ['One quadrat: ' + side + ' m × ' + side + ' m = ' + qa + ' m².', 'Quadrats that fit: ' + tot + ' ÷ ' + qa + ' = ' + fmtN(nq) + '.', 'Estimate: ' + meanc + ' × ' + fmtN(nq) + ' = <b>' + fmtN(est2) + '</b>.'] };
    }
    var sh = R.int(0, 1);
    if (sh === 0) {
      var one = R.int(2, 15), area3 = R.pick([100, 200, 400]), n3 = 5, mean3 = R.int(4, 8), c3 = counts(n3, mean3);
      return { q: 'Student A counted ' + one + ' ' + org + ' in one 1 m² quadrat and multiplied by the ' + area3 + ' m² field. Student B counted ' + n3 + ' random 1 m² quadrats: ' + list(c3.map(String)) + '. What is Student B\'s estimate?', a: num(mean3 * area3, 0.01),
        hint: 'Average all five counts before scaling up.', steps: ['Average: ' + (mean3 * n3) + ' ÷ ' + n3 + ' = ' + mean3 + ' per m².', 'Estimate: ' + mean3 + ' × ' + area3 + ' = <b>' + fmtN(mean3 * area3) + '</b>.', 'B\'s estimate is better: one square might land on a thick clump or a bare patch.'],
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: c3.map(function (v, i) { return 'Q' + (i + 1); }), series: [{ name: org, values: c3 }], ylabel: 'Count', values: true, interactive: false } } };
    }
    var den = R.int(2, 9), ar = R.pick([30, 60, 150, 250]);
    return { q: 'A survey finds a density of ' + den + ' ' + org + ' per square meter. How many would you expect in a ' + ar + ' m² meadow?', a: num(den * ar, 0.01), hint: 'Density × area.',
      steps: [den + ' per m² × ' + ar + ' m² = <b>' + fmtN(den * ar) + '</b>.'] };
  });


  /* ======================= Unit 9: The Human Body ======================= */
  function organAsk(R, sys, extra) {
    var org = B().SYSTEMS[sys].organs.filter(function (o) { return (extra || []).indexOf(o) < 0; }), o = R.pick(org);
    return { o: o, viz: quiet('bi-body', { system: sys, ask: o, label: 'The ' + B().SYSTEMS[sys].name + ' with one organ marked "?"' }), a: mc(R, cap(o), R.sample(org.filter(function (x) { return x !== o; }), Math.min(3, org.length - 1)).map(cap)) };
  }
  var BONE_JOB = [['the skull', 'Protects the brain'], ['the ribs', 'Protect the heart and lungs'], ['the red marrow inside the hip bones', 'Makes blood cells'], ['the femur (thigh bone)', 'Holds up the body\'s weight and moves with the leg muscles'], ['the spine', 'Holds the body upright and protects the spinal cord']];
  G('lifesci.skeletal-system', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var b = R.pick(BONE_JOB);
      return { q: 'What is the main job of <b>' + b[0] + '</b>?', a: mc(R, b[1], BONE_JOB.filter(function (x) { return x !== b; }).map(function (x) { return x[1]; }).slice(0, 3)), hint: 'Think about where it is and what lies under it.',
        steps: [cap(b[0]) + ': ' + b[1].toLowerCase() + '.'] };
    }
    if (L === 2) {
      var s = R.pick([['Bones are living organs with cells and blood vessels.', true, 'Living bone has bone cells, blood vessels and nerves.'], ['Bones are dead, dry material, like chalk.', false, 'The white skeletons in museums are only the mineral part left behind. Living bone has cells and blood vessels.'],
        ['A broken bone can grow back together.', true, 'Bone cells build new bone across the break, usually while a cast holds it still.'], ['Bones never change after they form.', false, 'Bone cells keep removing old bone and building new bone; bones grow and get stronger with use.'], ['Some bones make blood cells.', true, 'Red marrow inside bones such as the hips and ribs makes blood cells.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Is living bone alive?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    if (R.coin()) { var oa = organAsk(R, 'skeletal'); return { q: 'Which bone has the "?"', viz: oa.viz, a: oa.a, hint: 'Where in the body is the mark?', steps: ['The mark points to the <b>' + oa.o + '</b>.', 'It is part of the skeletal system, which ' + B().SYSTEMS.skeletal.job + '.'] }; }
    return { q: 'About how many bones does an adult human skeleton usually have?', a: mc(R, '206', ['26', '106', '600']), hint: 'Babies have more separate pieces, which fuse as they grow.',
      steps: ['An adult skeleton usually has <b>206</b> named bones.', 'Babies start with more separate pieces; many fuse together during childhood.'] };
  });

  var MUSCLE_KIND = [['moves your arm when you wave', 'Skeletal muscle'], ['squeezes food along the intestines', 'Smooth muscle'], ['pumps blood out of the heart', 'Cardiac muscle'], ['lets you kick a ball', 'Skeletal muscle'], ['narrows a blood vessel', 'Smooth muscle'], ['makes your heart beat faster when you run', 'Cardiac muscle'], ['moves your eyes to read this line', 'Skeletal muscle'], ['churns food in the stomach', 'Smooth muscle']];
  var PAIRS = [['bend the elbow', 'biceps', 'triceps', 'front of the upper arm'], ['straighten the elbow', 'triceps', 'biceps', 'back of the upper arm'], ['straighten the knee', 'quadriceps', 'hamstrings', 'front of the thigh'], ['bend the knee', 'hamstrings', 'quadriceps', 'back of the thigh']];
  G('lifesci.muscular-system', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var m = R.pick(MUSCLE_KIND); return { q: 'Which kind of muscle ' + m[0] + '?', a: mcFixed(['Skeletal muscle', 'Smooth muscle', 'Cardiac muscle'], m[1]), hint: 'Does it move a bone, line an organ, or make up the heart?',
      steps: [{ 'Skeletal muscle': 'It moves bones, and you can control it.', 'Smooth muscle': 'It lines organs and works without your control.', 'Cardiac muscle': 'It makes up the heart.' }[m[1]], 'So it is <b>' + m[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      var p = R.pick(PAIRS);
      return { q: 'Which muscle <b>shortens and pulls</b> to ' + p[0] + '?', a: mc(R, cap(p[1]), [cap(p[2]), 'Both muscles push', 'No muscle; the joint moves itself']), hint: 'Muscles only pull. Which side of the limb is pulling?',
        steps: ['Muscles can only shorten and pull; they never push.', 'To ' + p[0] + ', the ' + p[1] + ' (' + p[3] + ') shortens.', 'The ' + p[2] + ' relaxes and is stretched. So the answer is the <b>' + p[1] + '</b>.'] };
    }
    if (R.coin()) {
      var s = R.pick([['Muscles can push as well as pull.', false, 'Muscles only shorten and pull. A pair of muscles pulling in turns moves a joint both ways.'], ['Skeletal muscles work in pairs.', true, 'One muscle pulls a joint one way; its partner pulls it back.'], ['The heart is made of smooth muscle.', false, 'The heart is cardiac muscle, a kind found only in the heart.'], ['Smooth muscle works without your having to think about it.', true, 'It moves food and blood inside organs on its own.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Think about what a muscle cell can do.', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var oa = organAsk(R, 'muscular', ['heart muscle']);
    return { q: 'Which muscle has the "?"', viz: oa.viz, a: oa.a, hint: 'Where is the mark: arm, chest, belly or thigh?', steps: ['The mark points to the <b>' + oa.o + '</b>.'] };
  });

  var DIG_WHERE = [['Most nutrients are absorbed into the blood', 'Small intestine'], ['Most of the water left in the food is absorbed', 'Large intestine'], ['Starch digestion begins, with an enzyme in saliva', 'Mouth'], ['Acid and enzymes start digesting proteins', 'Stomach'], ['Muscles squeeze swallowed food down to the stomach', 'Esophagus'], ['Bile is made, which helps break up fats', 'Liver']];
  G('lifesci.digestive-system', function (R, ctx) {
    var L = lvl(ctx), ORG = ['Mouth', 'Esophagus', 'Stomach', 'Small intestine', 'Large intestine', 'Liver'];
    if (L === 1) { var d = R.pick(DIG_WHERE); return { q: 'Where does this happen?<br><i>' + d[0] + '.</i>', a: mc(R, d[1], R.sample(ORG.filter(function (x) { return x !== d[1]; }), 3)), hint: 'Picture the path of food through the body.',
      steps: [d[0] + ' in the <b>' + d[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Where are most nutrients from food absorbed into the blood?', viz: quiet('bi-body', { system: 'digestive', numbers: true, label: 'The digestive system with numbered organs' }), a: mc(R, 'Small intestine', ['Stomach', 'Large intestine', 'Esophagus']),
        hint: 'Which organ has a huge inner surface of tiny folds?', steps: ['The stomach mixes food and starts on proteins, but absorbs little.', 'The small intestine\'s wall is covered in tiny folds (villi) that take in nutrients.', 'So most absorption happens in the <b>small intestine</b>.'] };
      return { q: 'Where does digestion begin?', a: mc(R, 'In the mouth', ['In the stomach', 'In the small intestine', 'In the large intestine']), hint: 'What happens when you chew a cracker for a long time?',
        steps: ['Teeth break food into pieces, and an enzyme in saliva starts breaking starch into sugar.', 'So digestion begins <b>in the mouth</b>.'] };
    }
    if (R.coin()) {
      var path = B().DIGEST_PATH.map(cap), drop = R.int(0, 4), items = path.filter(function (x, i) { return i !== drop || path.length <= 4; }).slice(0, 4), o = orderMc(R, items, null, 3);
      return { q: 'Put these in the order food reaches them:<br>' + o.list.join('<br>'), a: o.a, hint: 'Food enters at the mouth and leaves after the large intestine.', steps: ['The path is ' + B().DIGEST_PATH.join(' → ') + '.', 'So the order is <b>' + o.right + '</b>.'] };
    }
    var oa = organAsk(R, 'digestive');
    return { q: 'Which digestive organ has the "?"', viz: oa.viz, a: oa.a, hint: 'Where is it along the path?', steps: ['The mark points to the <b>' + oa.o + '</b>.'] };
  });

  var VESSEL = [['carries blood away from the heart', 'Artery'], ['carries blood back to the heart', 'Vein'], ['has a wall only one cell thick, where oxygen passes to the cells', 'Capillary'], ['carries blood from the heart to the lungs', 'Artery'], ['carries blood from the lungs back to the heart', 'Vein'], ['is the tiny vessel where nutrients reach a muscle cell', 'Capillary']];
  G('lifesci.circulatory-system', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var v = R.pick(VESSEL); return { q: 'Which kind of blood vessel ' + v[0] + '?', a: mc(R, v[1], ['Artery', 'Vein', 'Capillary'].filter(function (x) { return x !== v[1]; })), hint: 'Arteries go away from the heart, veins go back, capillaries exchange.',
      steps: ['Arteries carry blood away from the heart; veins carry it back; capillaries are where materials pass to and from cells.', 'So it is ' + an('<b>' + v[1].toLowerCase() + '</b>') + '.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'What color is the blood inside your veins?', a: mc(R, 'Dark red', ['Blue', 'Purple', 'Clear']), hint: 'Is blood ever blue?',
        steps: ['Blood is always red. Blood with less oxygen is darker red.', 'Veins only look bluish through the skin because of how skin scatters light.', 'So the answer is <b>dark red</b>.'] };
      return { q: 'True or false: blood in veins is blue until it reaches the lungs and turns red.', a: tf(false), hint: 'Diagrams color veins blue, but what color is real blood?',
        steps: ['Blood is red everywhere in the body; with less oxygen it is a darker red.', 'Diagrams use blue only to show oxygen-poor blood.', 'So the statement is <b>false</b>.'] };
    }
    var P = B().BLOOD_PATH, i = R.int(1, 4), sh = R.int(0, 1);
    if (sh === 0) return { q: 'Blood is in the <b>' + P[i] + '</b>. Where does it go next?', a: mc(R, cap(P[i + 1]), P.filter(function (x, j) { return j !== i + 1 && j !== i && x !== 'body'; }).concat(['body']).filter(function (x, j, a) { return a.indexOf(x) === j && x !== P[i + 1]; }).slice(0, 3).map(cap)),
      viz: { name: 'bi-body', opts: { mode: 'heart', quiet: true, interactive: false } }, hint: 'Body → right side → lungs → left side → body.', steps: ['The path is ' + P.join(' → ') + '.', 'After the ' + P[i] + ' comes the <b>' + P[i + 1] + '</b>.'] };
    var chs = ['right atrium', 'right ventricle', 'left atrium', 'left ventricle'], c = R.pick(chs);
    return { q: 'Which chamber of the heart has the "?" (the heart is drawn as seen from the front, so its right side is on your left)?', viz: { name: 'bi-body', opts: { mode: 'heart', quiet: true, interactive: false, ask: c } }, a: mcFixed(chs.map(cap), cap(c)),
      hint: 'Atria are on top; ventricles below. The heart\'s right side is on the viewer\'s left.', steps: ['The "?" is in the ' + (c.indexOf('atrium') >= 0 ? 'top' : 'bottom') + ' chamber on the heart\'s ' + c.split(' ')[0] + ' side (the viewer\'s ' + (c.indexOf('right') === 0 ? 'left' : 'right') + ').', 'So it is the <b>' + c + '</b>.'] };
  });

  G('lifesci.respiratory-system', function (R, ctx) {
    var L = lvl(ctx), AP = B().AIR_PATH;
    if (L === 1) {
      var sh = R.int(0, 2);
      if (sh === 0) { var i = R.int(0, 3); return { q: 'Air passes the <b>' + AP[i] + '</b>. Where does it go next?', a: mc(R, cap(AP[i + 1]), AP.filter(function (x, j) { return j !== i + 1 && j !== i; }).slice(0, 2).map(cap).concat(['Stomach'])), hint: 'Nose → trachea → bronchi → lungs → alveoli.', steps: ['The path is ' + AP.join(' → ') + '.', 'After the ' + AP[i] + ' comes the <b>' + AP[i + 1] + '</b>.'] }; }
      if (sh === 1) return { q: 'Which muscle under the lungs shortens and flattens to pull air in?', a: mc(R, 'Diaphragm', ['Biceps', 'Heart', 'Stomach']), hint: 'It is a dome of muscle across the bottom of the chest.', steps: ['The <b>diaphragm</b> shortens and moves down, making the chest bigger, so air rushes in.'] };
      return { q: 'Where in the lungs does oxygen pass into the blood?', a: mc(R, 'In the alveoli (tiny air sacs)', ['In the trachea', 'In the nose', 'In the diaphragm']), hint: 'Think of the smallest spaces at the ends of the airways.', steps: ['Oxygen diffuses across the thin walls of the <b>alveoli</b> into the capillaries around them.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'About what percent of the air you breathe <b>out</b> is oxygen?', a: mc(R, 'About 16%', ['0%', 'About 21%', 'About 4%']), hint: 'Your body uses only some of the oxygen you breathe in.',
        steps: ['Air breathed in is about 21% oxygen.', 'The body takes up only part of it, so air breathed out is still about <b>16%</b> oxygen (and about 4% carbon dioxide).'] };
      var s = R.pick([['We breathe in only oxygen and breathe out only carbon dioxide.', false, 'Both kinds of air are mostly nitrogen (about 78%). Air out still has about 16% oxygen and only about 4% carbon dioxide.'], ['Air we breathe out still contains a lot of oxygen.', true, 'Exhaled air is still about 16% oxygen.'], ['Most of the air we breathe in is nitrogen.', true, 'Air is about 78% nitrogen, and the body does not use it.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'What is air made of?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var vol = R.pick([400, 500, 600, 800, 1000]), sh3 = R.int(0, 1);
    if (sh3 === 0) return { q: 'A breath brings ' + vol + ' mL of air into the lungs. Air is about 21% oxygen. About how many mL of that breath is oxygen?', a: num(vol * 0.21, 0.01), unit: 'mL', hint: 'Find 21% of ' + vol + '.',
      steps: ['21% of ' + vol + ' = 0.21 × ' + vol + ' = <b>' + fmtN(vol * 0.21) + ' mL</b>.'] };
    return { q: 'A breath of ' + vol + ' mL goes in at about 21% oxygen and comes out at about 16% oxygen. About how many mL of oxygen did the body take from that breath?', a: num(vol * 0.05, 0.01), unit: 'mL', hint: 'Find the oxygen in, the oxygen out, and subtract.',
      steps: ['In: 0.21 × ' + vol + ' = ' + fmtN(vol * 0.21) + ' mL.', 'Out: 0.16 × ' + vol + ' = ' + fmtN(vol * 0.16) + ' mL.', 'Taken up: ' + fmtN(vol * 0.21) + ' − ' + fmtN(vol * 0.16) + ' = <b>' + fmtN(vol * 0.05) + ' mL</b>.'] };
  });

  var NERVE_JOB = [['Sense receptors', 'detect a stimulus such as light, sound or heat'], ['Sensory nerves', 'carry signals from the senses to the brain and spinal cord'], ['The brain', 'interprets signals and decides what to do'], ['Motor nerves', 'carry signals from the brain or spinal cord to the muscles'], ['The spinal cord', 'carries signals between the body and the brain and handles reflexes']];
  G('lifesci.nervous-system', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var n = R.pick(NERVE_JOB); return { q: 'What is the job of <b>' + n[0].toLowerCase() + '</b>?', a: mc(R, cap(n[1]), NERVE_JOB.filter(function (x) { return x !== n; }).map(function (x) { return cap(x[1]); }).slice(0, 3)), hint: 'Detect, carry in, decide, carry out.', steps: [n[0] + ' ' + n[1] + '.'] }; }
    if (L === 2) {
      var c = R.pick([['You see an optical illusion: two equal lines look different lengths.', 'Your brain misreads correct signals from your eyes'], ['You hear your name across a noisy room.', 'Your ears detect the sound; your brain recognizes your name'], ['Your fingertip touches something soft.', 'Receptors in the skin detect it; the brain interprets "soft"']]);
      return { q: c[0] + ' Which explanation is right?', a: mc(R, c[1], ['Your eyes or ears decide what it means on their own', 'Your muscles interpret the signal', 'The signal never reaches the brain']), hint: 'Receptors detect; the brain interprets.',
        steps: ['Sense receptors only detect and send signals along nerves.', 'The brain interprets the signals, which is why it can be fooled.', 'So: <b>' + c[1].toLowerCase() + '</b>.'] };
    }
    if (R.coin()) {
      var st = ['Receptors in the skin detect heat', 'A sensory nerve carries the signal to the spinal cord', 'The spinal cord sends a signal back out', 'A motor nerve makes the arm muscles pull the hand away'], o = orderMc(R, st, null, 3);
      return { q: 'You touch a hot pan and jerk your hand away. Put the steps of this reflex in order:<br>' + o.list.join('<br>'), a: o.a, hint: 'Detect first, then carry in, then answer, then carry out.', steps: [st.join(' → ') + '.', 'So the order is <b>' + o.right + '</b>.', 'The brain hears about it a moment later, when you feel the pain.'] };
    }
    var r = R.pick([['Pulling your hand back from a hot pan', true], ['Your knee jerking when it is tapped', true], ['Blinking when something flies at your eye', true], ['Choosing a book to read', false], ['Answering a question in class', false], ['Catching a ball you decided to chase', false]]);
    return { q: 'Is this a reflex handled by the spinal cord before the brain decides? <i>' + r[0] + '.</i>', a: mcFixed(['Yes, a reflex', 'No, the brain decides'], r[1] ? 'Yes, a reflex' : 'No, the brain decides'), hint: 'A reflex is fast and automatic; you do not choose it.',
      steps: [r[1] ? 'It is fast and automatic, a reflex.' : 'It takes thinking and choosing, which the brain does.', 'So: <b>' + (r[1] ? 'yes, a reflex' : 'no, the brain decides') + '</b>.'] };
  });

  var DEF = [['Skin covers the body and keeps most germs out.', 0], ['Sticky mucus in the nose traps dust and germs.', 0], ['Stomach acid kills many germs in food.', 0], ['Tears wash germs out of the eyes.', 0],
    ['White blood cells swallow bacteria that got into a cut.', 1], ['The skin around a splinter gets red and swollen as white blood cells gather.', 1],
    ['Antibodies that fit one particular virus are made after an infection.', 2], ['Memory cells recognize a germ the body fought years ago and respond quickly.', 2],
    ['Tiny hairs (cilia) in the airways sweep mucus and trapped germs up and out.', 0], ['White blood cells travel in the blood to the place where germs got in.', 1], ['Body temperature rises in a fever while the body fights an infection.', 1], ['After a vaccine, the body keeps memory cells for that one germ.', 2], ['Antibodies stick to one kind of germ and mark it for destruction.', 2]];
  var DEFN = ['A barrier that keeps germs out', 'The general attack on any germ that gets in', 'The learned response that remembers one germ'];
  G('lifesci.immune-basics', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var d = R.pick(DEF); return { q: 'Which kind of defense is this?<br><i>' + d[0] + '</i>', a: mc(R, DEFN[d[1]], DEFN.filter(function (x, i) { return i !== d[1]; })), hint: 'Is it keeping germs out, attacking any germ, or remembering one germ?',
      steps: [['It stops germs before they enter the body.', 'It attacks any germ that gets in, without needing to know which one.', 'It targets one particular germ and remembers it.'][d[1]], 'So: <b>' + DEFN[d[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      var s = R.pick([['A fever during an illness is the germ itself.', false, 'A higher body temperature is part of the body\'s defense, not the germ.'], ['A runny nose during a cold helps wash germs out.', true, 'Extra mucus traps germs and carries them away.'], ['The body has only one kind of defense against germs.', false, 'It has barriers, a general attack, and a learned response that remembers germs.'], ['Antibiotics work against bacteria but not against viruses such as colds and flu.', true, 'The CDC states that antibiotics do not work on viruses.'], ['Redness and swelling around a cut mean white blood cells are gathering to fight germs.', true, 'This is inflammation, part of the general defense.'], ['Skin is part of the body\'s defense against germs.', true, 'Unbroken skin is a barrier that keeps most germs out.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Are symptoms the germ, or the body fighting back?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var sh3 = R.int(0, 2);
    if (sh3 === 2) { var bar = R.sample(['Skin', 'Mucus in the nose', 'Stomach acid', 'Tears'], 3), notb = R.pick(['Memory cells', 'Antibodies', 'White blood cells swallowing germs']);
      return { q: 'Which of these is <b>not</b> a barrier that keeps germs out of the body?', a: mc(R, notb, bar), hint: 'Barriers work before a germ gets in.', steps: [list(bar) + ' stop germs at the surface.', notb + ' work after germs are already inside, so the answer is <b>' + notb.toLowerCase() + '</b>.'] }; }
    if (sh3 === 0) return { q: 'Why does the body usually fight off a germ faster the second time it meets it?', a: mc(R, 'Memory cells from the first time recognize it and respond quickly', ['The germ gets weaker each time', 'The skin grows thicker after an illness', 'White blood cells only work the second time']),
      hint: 'Which part of the immune system learns?', steps: ['After the first infection, some white blood cells stay as memory cells.', 'They recognize the same germ and start making the right antibodies quickly.', 'So the body responds <b>faster and harder</b> the second time.'] };
    return { q: 'How does a vaccine help the immune system?', a: mc(R, 'It shows the body a harmless look-alike of a germ, so memory cells form without the illness', ['It kills every germ in the body at once', 'It replaces the white blood cells', 'It works as an antibiotic against viruses']),
      hint: 'Think about memory.', steps: ['A vaccine contains a weakened or killed germ, or just a piece of one, which cannot cause the illness.', 'The immune system learns to recognize it and makes memory cells.', 'If the real germ arrives later, the memory cells respond quickly.'] };
  });

  var WASTE = [['carbon dioxide from respiration', 'Lungs'], ['urea, a nitrogen waste from breaking down proteins', 'Kidneys'], ['extra water and salt in sweat', 'Skin'], ['urine until it leaves the body', 'Bladder']];
  G('lifesci.excretory-system', function (R, ctx) {
    var L = lvl(ctx), ORGS = ['Lungs', 'Kidneys', 'Skin', 'Bladder'];
    if (L === 1) { var w = R.pick(WASTE), verb = w[1] === 'Bladder' ? 'stores' : 'removes'; return { q: 'Which organ ' + verb + ' <b>' + w[0] + '</b>?', a: mc(R, w[1], ORGS.filter(function (x) { return x !== w[1]; })), hint: 'Lungs, kidneys or skin? (Or is the question about storage?)',
      steps: [{ Lungs: 'Carbon dioxide diffuses out of the blood in the alveoli and is breathed out.', Kidneys: 'The kidneys filter urea from the blood into urine.', Skin: 'Sweat glands in the skin release water and some salt.', Bladder: 'The bladder stores urine made by the kidneys.' }[w[1]], 'So the answer is the <b>' + w[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Which organs remove the wastes that the body\'s <b>cells</b> make, from the blood?', a: mc(R, 'The kidneys, lungs and skin', ['The large intestine only', 'The stomach and esophagus', 'The heart and arteries']), hint: 'Cell wastes travel in the blood.',
        steps: ['Cell wastes such as urea and carbon dioxide are carried in the blood.', 'The kidneys, lungs and skin take them out of the blood.', 'Solid waste from the intestines is mostly food that was never absorbed.'] };
      return { q: 'True or false: solid waste from digestion is mostly the wastes that the body\'s cells make.', a: tf(false), hint: 'Did that food ever enter the body\'s cells?',
        steps: ['Solid waste is mostly food the body never absorbed, plus gut bacteria.', 'Cell wastes travel in the blood and leave through the kidneys, lungs and skin.', 'So the statement is <b>false</b>.'] };
    }
    var sh = R.int(0, 1);
    if (sh === 0) { var u = R.pick([1, 1.5, 2]), days0 = R.pick([1, 2, 3, 7]), kept = (150 - u) * days0; return { q: 'The kidneys filter about 150 quarts of blood fluid a day and make about ' + u + ' quart' + (u === 1 ? '' : 's') + ' of urine a day. Over ' + days0 + ' day' + (days0 > 1 ? 's' : '') + ', how many quarts of the filtered fluid go back into the blood?', a: num(kept, 0.001), unit: 'quarts',
      hint: 'Kept each day = filtered − urine.', steps: ['Kept each day: 150 − ' + u + ' = ' + (150 - u) + ' quarts.', (days0 > 1 ? 'Over ' + days0 + ' days: ' + (150 - u) + ' × ' + days0 + ' = ' : 'So ') + '<b>' + fmtN(kept) + ' quarts</b>' + (days0 > 1 ? '' : ' a day') + '.', 'That is about 99% of what is filtered: most water, sugar and salt are taken back.'] }; }
    var days = R.pick([2, 3, 7, 10]);
    return { q: 'The kidneys filter about 150 quarts of blood a day. How many quarts do they filter in ' + days + ' days?', a: num(150 * days), unit: 'quarts', hint: 'Multiply.', steps: ['150 × ' + days + ' = <b>' + fmtN(150 * days) + ' quarts</b>.'] };
  });

  var EXER = [['your heart rate', 'It increases'], ['your breathing rate', 'It increases'], ['the amount you sweat', 'It increases'], ['the oxygen your leg muscles use', 'It increases'], ['the carbon dioxide your muscles make', 'It increases'], ['the heat your body makes', 'It increases'], ['the depth of each breath', 'It increases'], ['the blood flowing to your leg muscles', 'It increases'], ['the sugar your muscles use', 'It increases']];
  G('lifesci.systems-together', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var e = R.pick(EXER); return { q: 'You start running hard. What happens to <b>' + e[0] + '</b>?', a: mc(R, e[1], ['It decreases', 'It stays the same']), hint: 'Working muscles need more energy each second.',
      steps: ['Running muscles respire faster: they use more oxygen and sugar and make more carbon dioxide and heat.', 'So ' + e[0] + ' <b>increases</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Why does your breathing speed up when you run?', a: mc(R, 'Working muscles need more oxygen and make more carbon dioxide', ['Your lungs need exercise too', 'Running squeezes air out of your stomach', 'Your heart stops while you run']), hint: 'What do muscle cells use to release energy?',
        steps: ['Muscle cells release energy by respiration: sugar + oxygen → carbon dioxide + water + energy.', 'Running muscles need more energy, so more oxygen in and more carbon dioxide out.', 'The brain senses the change and speeds up breathing.'] };
      var sys = [['Muscular system', true], ['Respiratory system', true], ['Circulatory system', true], ['Nervous system', true]], pick = R.sample(sys, 3).concat([['None; each system works alone', false]]);
      return { q: 'Which systems change their activity when you run? Choose all that apply.', a: mcAll(R, pick), hint: 'Think about muscles, breathing, the heart and the signals that control them.',
        steps: ['Muscles work harder (muscular), breathing speeds up (respiratory), the heart beats faster (circulatory), and the brain controls the changes (nervous).', 'No system works alone.'] };
    }
    var rest = R.pick([60, 65, 70, 72, 75, 80]), mult = R.pick([1.5, 2, 2.5]), ex = rest * mult;
    if (ex !== Math.round(ex)) { rest = 70; ex = rest * mult; }
    if (R.coin()) return { q: 'A student\'s heart rate is ' + rest + ' beats per minute at rest and ' + ex + ' just after running. How many times faster is it beating?', a: num(mult, 0.01), hint: 'Divide the running rate by the resting rate.',
      steps: [ex + ' ÷ ' + rest + ' = <b>' + mult + '</b>.', 'The circulatory system speeds up to deliver more oxygen to the muscles.'] };
    var br = R.pick([12, 14, 15, 16]), br2 = br * R.pick([2, 3]);
    return { q: 'At rest you take ' + br + ' breaths a minute. After running you take ' + br2 + '. How many more breaths a minute is that?', a: num(br2 - br), unit: 'breaths', hint: 'Subtract.', steps: [br2 + ' − ' + br + ' = <b>' + (br2 - br) + '</b> more breaths a minute.'] };
  });


  /* ======================= Unit 10: Heredity ======================= */
  var INH = ['eye color', 'freckles', 'a dog\'s spotted coat', 'the shape of a maple leaf', 'flower color in a pea plant', 'blood type', 'a cat\'s striped fur', 'the number of petals on a lily', 'a horse\'s coat color', 'naturally curly hair'];
  var ACQ = [['a scar on the knee', 'it came from an injury'], ['speaking Spanish', 'a language is learned'], ['a weightlifter\'s big muscles', 'training built them'], ['a dog that sits on command', 'it was trained'], ['a tree bent by the wind', 'the wind shaped it'], ['being able to ride a bike', 'it is a learned skill'], ['a pierced ear', 'it was done during life'], ['a sunburn', 'it came from the sun'], ['a parrot that says "hello"', 'it learned the word']];
  G('lifesci.inherited-acquired', function (R, ctx) {
    var L = lvl(ctx), ch = ['Inherited', 'Acquired'];
    if (L === 1) { var inh = R.coin(), t = inh ? R.pick(INH) : R.pick(ACQ); return { q: 'Is <b>' + (inh ? t : t[0]) + '</b> an inherited trait or an acquired trait?', a: mcFixed(ch, inh ? ch[0] : ch[1]), hint: 'Was it passed on in genes, or gained during a lifetime?',
      steps: [inh ? cap(t) + ' is set by genes passed from the parents.' : cap(t[0]) + ': ' + t[1] + '.', 'So it is <b>' + (inh ? 'inherited' : 'acquired') + '</b>.'] }; }
    if (L === 2) {
      var c = R.pick([['A weightlifter trains for years and builds huge muscles.', 'Will the weightlifter\'s children be born with big muscles?', 'No'], ['A parent learns to play the piano very well.', 'Will the parent\'s baby be born knowing how to play?', 'No'], ['A dog loses part of its tail in an accident.', 'Will its puppies be born with short tails?', 'No'], ['Both parents have naturally curly hair, as their parents did.', 'Could their children inherit curly hair?', 'Yes']]);
      return { q: c[0] + ' ' + c[1], a: mcFixed(['Yes', 'No'], c[2]), hint: 'Only traits coded in genes are passed on.',
        steps: c[2] === 'No' ? ['That trait was acquired during the parent\'s life.', 'It did not change the DNA the parent passes on.', 'So <b>no</b>.'] : ['Curly hair is set largely by genes.', 'Genes are passed from parents to children, so <b>yes</b>.'] };
    }
    var items = R.sample(ACQ, R.int(1, 2)).map(function (x) { return [cap(x[0]), true]; }).concat(R.sample(INH, R.int(2, 3)).map(function (x) { return [cap(x), false]; }));
    return { q: 'Which of these are <b>acquired</b> traits? Choose all that apply.', a: mcAll(R, items), hint: 'Acquired traits come from experience, injury or the environment.',
      steps: items.map(function (x) { return x[0] + (x[1] ? ': acquired.' : ': inherited.'); }) };
  });

  G('lifesci.dna-genes', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var sh = R.int(0, 2);
      if (sh === 0) return { q: 'A section of DNA with the instructions for one protein is called a …', a: mc(R, 'Gene', ['Chromosome', 'Nucleus', 'Cell']), hint: 'It is part of a chromosome.', steps: ['A <b>gene</b> is a section of DNA that codes for one protein.', 'A chromosome is one long DNA molecule with many genes.'] };
      if (sh === 1) { var o = orderMc(R, ['Base (A, T, C or G)', 'Gene', 'Chromosome'], null, 3); return { q: 'Put these in order from smallest to largest:<br>' + o.list.join('<br>'), a: o.a, hint: 'A chromosome carries many genes; a gene is made of many bases.', steps: ['A base is one "letter"; a gene is a section of many bases; a chromosome carries many genes.', 'So the order is <b>' + o.right + '</b>.'] }; }
      return { q: 'In which part of a plant or animal cell are the chromosomes?', viz: quiet('bi-cell', { type: R.pick(['animal', 'plant']), ask: 'nucleus' }), a: mc(R, 'The nucleus', ['The cell membrane', 'The cytoplasm only', 'The cell wall']), hint: 'Which part is the control center?', steps: ['DNA is packed into chromosomes inside the <b>nucleus</b>.'] };
    }
    if (L === 2) {
      var s = R.pick([['A chromosome is one long DNA molecule that carries many genes.', true, 'Genes are sections of the DNA in a chromosome.'], ['Genes and chromosomes are separate things found in different parts of the cell.', false, 'A gene is part of a chromosome, like a sentence in a book.'], ['Only blood cells contain DNA.', false, 'Nearly every cell in the body carries a full set of DNA.'], ['A skin cell and a liver cell from the same person carry the same DNA.', true, 'Body cells come from copying and dividing, so they get the same full set.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Is a gene part of a chromosome?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    if (R.coin()) {
      var bases = 'ATCG', n = R.int(5, 8), seq = ''; for (var i = 0; i < n; i++) seq += R.pick(bases.split('')); var comp = B().complement(seq);
      var near = comp.split('').map(function (c, j) { return j === 1 ? ({ A: 'G', T: 'C', C: 'T', G: 'A' }[c]) : c; }).join(''), same = seq;
      return { q: 'One strand of DNA reads <b>' + seq + '</b>. What are the bases on the partner strand, in the same order?', viz: quiet('bi-dna', { seq: seq, ends: false }), a: mc(R, comp, [same, near, comp.split('').reverse().join('') === comp ? seq.split('').reverse().join('') : comp.split('').reverse().join('')].filter(function (x, j, a) { return x !== comp && a.indexOf(x) === j; })),
        hint: 'A pairs with T, and C pairs with G.', steps: [seq.split('').map(function (c, j) { return c + '–' + comp[j]; }).join(', ') + '.', 'So the partner strand is <b>' + comp + '</b>.'] };
    }
    var cell = R.pick(['skin cell', 'muscle cell', 'nerve cell', 'liver cell', 'bone cell']);
    return { q: 'Most human body cells have 23 pairs of chromosomes. How many chromosomes are in a human ' + cell + '?', a: num(46), hint: 'How many in 23 pairs?', steps: ['23 pairs × 2 = 46.', 'Body cells get the full set when cells copy their DNA and divide, so a ' + cell + ' has <b>46</b>.'] };
  });

  var MRNA_POOL = ['UUU', 'UUC', 'GGC', 'GGA', 'AAA', 'GAU', 'UGG', 'CAU', 'GCU', 'UAC', 'CCG', 'AGC', 'GUU', 'CUG'];
  function aa3(c) { return B().AA[B().CODE[c]][0]; }
  G('lifesci.genes-proteins-traits', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      if (R.coin()) { var o = orderMc(R, ['Gene (DNA instructions)', 'Protein', 'Trait'], null, 3); return { q: 'Put these in the order they lead from one to the next:<br>' + o.list.join('<br>'), a: o.a, hint: 'Instructions first, the worker next, what you see last.', steps: ['A gene holds the instructions; the cell builds the protein; the protein\'s work produces the trait.', 'So the order is <b>' + o.right + '</b>.'] }; }
      var p = R.pick([['an enzyme that helps make dark pigment', 'Speeds up a reaction (making pigment)'], ['hemoglobin in red blood cells', 'Carries oxygen'], ['keratin in hair and nails', 'Builds a structure'], ['an enzyme in saliva that breaks down starch', 'Speeds up a reaction (digestion)']]);
      return { q: 'What job does this protein do: <b>' + p[0] + '</b>?', a: mc(R, p[1], ['Carries oxygen', 'Builds a structure', 'Speeds up a reaction (making pigment)', 'Speeds up a reaction (digestion)'].filter(function (x) { return x !== p[1]; }).slice(0, 3)), hint: 'Is it an enzyme, a carrier or a building block?', steps: [cap(p[0]) + ': ' + p[1].toLowerCase() + '.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'What does a gene hold the instructions for?', a: mc(R, 'A protein', ['A tiny copy of a trait, such as a blue eye', 'A whole organ', 'A cell membrane only']), hint: 'Genes do not store traits directly.',
        steps: ['A gene is a recipe for a <b>protein</b>.', 'The trait appears when the protein does its job, for example by making pigment.'] };
      return { q: 'A rabbit\'s copies of the gene for a pigment-making enzyme both make an enzyme that does not work. What fur color would you expect?', a: mc(R, 'White (no dark pigment is made)', ['Darker than normal', 'The same as a normal rabbit', 'Striped']), hint: 'Gene → enzyme → pigment → color.',
        steps: ['The gene codes for the enzyme that makes the dark pigment.', 'If the enzyme does not work, little or no pigment is made.', 'So the fur is <b>white</b> (albinism).'] };
    }
    var n = R.int(2, 3), cods = R.sample(MRNA_POOL, n), mrna = 'AUG' + cods.join('') + R.pick(['UAA', 'UAG', 'UGA']), prot = ['Met'].concat(cods.map(aa3));
    var right = prot.join('–'), wrong1 = ['Met'].concat(cods.map(aa3).reverse()).join('–'), wrong2 = prot.slice(1).join('–'), wrong3 = prot.concat(['Stop']).join('–');
    var wr = [wrong1, wrong2, wrong3].filter(function (x, j, a) { return x !== right && a.indexOf(x) === j; });
    return { q: 'Use the codon table to translate this messenger RNA: <b>' + mrna.match(/.{3}/g).join(' ') + '</b>. What is the protein chain?', viz: { name: 'bi-central', opts: { mode: 'table', interactive: false } }, a: mc(R, right, wr),
      hint: 'Read three bases at a time from AUG until a stop codon.', steps: mrna.match(/.{3}/g).map(function (c) { var a = B().CODE[c]; return c + ' → ' + (a === '*' ? 'stop' : B().AA[a][0]); }).concat(['So the chain is <b>' + right + '</b> (stop adds no amino acid).']) };
  });

  var ONE_P = ['A bacterium divides into two cells', 'A yeast cell grows a bud that breaks off', 'A strawberry runner roots and grows a new plant', 'A piece of potato with an "eye" sprouts into a new plant', 'A gardener roots a cutting from a rose bush', 'A spider plant grows little plantlets that root', 'A sea star regrows a whole body from one arm'];
  var TWO_P = ['Apple seeds from a flower pollinated by another apple tree', 'A litter of kittens, each a little different', 'Sunflower seeds from flowers pollinated by bees carrying pollen from other plants', 'Ducklings that hatch from a nest of eggs', 'Corn kernels on an ear pollinated by wind from other corn plants'];
  G('lifesci.one-or-two-parents', function (R, ctx) {
    var L = lvl(ctx), ch = ['One parent: an exact copy', 'Two parents: a new mix'];
    if (L === 1) { var one = R.coin(), s = one ? R.pick(ONE_P) : R.pick(TWO_P); return { q: '<i>' + s + '.</i> Are these offspring from one parent or two?', a: mcFixed(ch, ch[one ? 0 : 1]), hint: 'Did genes come from one organism or from two?',
      steps: [one ? 'The new organism grows from part of a single parent.' : 'Each offspring gets half its genes from each of two parents.', 'So: <b>' + ch[one ? 0 : 1].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Offspring of two parents get a blend of every trait, like mixing two paints. True or false?', a: tf(false), hint: 'Do genes mix like paint, or are they passed on whole?',
        steps: ['Each parent passes on one of each pair of genes, whole.', 'That is why siblings can differ, and why a trait hidden in both parents can appear in a child.', 'So the statement is <b>false</b>.'] };
      var w = R.pick([['a prize rose', 'root cuttings'], ['a sweet-tasting apple tree', 'graft branches onto other trees'], ['a strawberry plant with big berries', 'plant its runners']]);
      return { q: 'A grower wants new plants exactly like ' + w[0] + '. Which works?', a: mc(R, cap(w[1]), ['Plant seeds from its flowers', 'Either way gives an exact copy', 'Neither; no plant can be copied']), hint: 'Seeds come from two parents.',
        steps: ['Seeds come from pollination, so they get genes from two parents: a new mix.', 'Cuttings, grafts and runners are parts of the plant itself: one parent, the same genes.', 'So: <b>' + w[1] + '</b>.'] };
    }
    var s3 = R.pick([['Why can brothers and sisters look different even with the same two parents?', 'Each child gets a different random mix of the parents\' genes', ['Each child gets all of the genes of one parent', 'Genes change while children grow', 'Only the youngest child gets genes from both parents']],
      ['A disease sweeps through a field of plants that are all copies of one parent. Why might they all be harmed?', 'They all share the same genes, so none has a way to resist', ['Copies are always weaker than other plants', 'Diseases only harm copies', 'Copies have no genes']],
      ['What is one advantage of one-parent reproduction?', 'One parent can make many offspring quickly, with no partner needed', ['Offspring vary more', 'Offspring always resist disease', 'Offspring get genes from many parents']]]);
    return { q: s3[0], a: mc(R, s3[1], s3[2]), hint: 'Think about copies and mixes.', steps: [s3[1] + '.'] };
  });

  var TRAITS = [['pea flower color', 'P', 'purple flowers', 'white flowers', 'pea plant'], ['pea seed shape', 'R', 'round seeds', 'wrinkled seeds', 'pea plant'], ['pea pod color', 'G', 'green pods', 'yellow pods', 'pea plant'], ['pea plant height', 'T', 'tall stems', 'short stems', 'pea plant'], ['guinea pig fur color', 'B', 'black fur', 'white fur', 'guinea pig'], ['rabbit fur length', 'S', 'short fur', 'long fur', 'rabbit'], ['fruit fly wing shape', 'W', 'normal wings', 'curled wings', 'fruit fly']];
  function domPhrase(t) { return 'the allele for ' + t[2] + ' (' + t[1] + ') is dominant over the allele for ' + t[3] + ' (' + t[1].toLowerCase() + ')'; }
  function geno(t, k) { var d = t[1], r = d.toLowerCase(); return [d + d, d + r, r + r][k]; }
  G('lifesci.alleles', function (R, ctx) {
    var L = lvl(ctx), t = R.pick(TRAITS), d = t[1], r = d.toLowerCase();
    if (L === 1) { var k = R.int(0, 2), g = geno(t, k), ph = k < 2 ? t[2] : t[3]; return { q: 'For ' + t[0] + ', ' + domPhrase(t) + '. What does ' + an(t[4]) + ' with <b>' + g + '</b> look like?', a: mcFixed([cap(t[2]), cap(t[3])], cap(ph)),
      viz: quiet('bi-punnett', { p1: geno(t, 1), p2: geno(t, 1), ask: [k === 2 ? 1 : 0, k === 0 ? 0 : 1] }),
      hint: 'One dominant allele is enough to show.', steps: [k === 2 ? 'There is no dominant allele; the recessive trait shows only with two copies.' : 'It has at least one dominant ' + d + ', and one copy is enough.', 'So it has <b>' + ph + '</b>.'] }; }
    if (L === 2) {
      var s = R.pick([['A dominant allele is always the most common one in a population.', false, 'Dominant only means it shows with one copy. Extra toes in cats come from a dominant allele, yet most cats have the usual number.'], ['A dominant allele is the "stronger" or better version of a gene.', false, 'Dominant says nothing about better. It only means the trait shows with one copy.'],
        ['A recessive trait shows only when an organism has two copies of the recessive allele.', true, 'With one dominant allele, the dominant trait shows instead.'], ['You get one allele of each gene from each parent.', true, 'That is why you have two alleles for each gene.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'What does "dominant" mean?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var right = d + r + ' and ' + d + r;
    return { q: 'Two ' + t[4] + 's with ' + t[2] + ' have an offspring with ' + t[3] + ' (' + t[0] + '; ' + t[3] + ' is recessive). What are the parents\' genotypes?', a: mc(R, right, [d + d + ' and ' + d + d, d + d + ' and ' + d + r, r + r + ' and ' + r + r]),
      hint: 'An offspring with ' + t[3] + ' is ' + r + r + '. Where did each ' + r + ' come from?', steps: ['The offspring is ' + r + r + ': one ' + r + ' from each parent.', 'Both parents have ' + t[2] + ', so each also has a ' + d + '.', 'So both parents are <b>' + d + r + '</b>.'] };
  });

  G('lifesci.genotype-phenotype', function (R, ctx) {
    var L = lvl(ctx), t = R.pick(TRAITS), d = t[1], r = d.toLowerCase(), names = ['Homozygous dominant', 'Heterozygous', 'Homozygous recessive'];
    if (L === 1) { var k = R.int(0, 2), g = geno(t, k); return { q: 'Which word describes the genotype <b>' + g + '</b>?', a: mcFixed(names, names[k]), hint: 'Alike alleles: homozygous. Different: heterozygous.',
      steps: [k === 1 ? 'The two alleles are different.' : 'The two alleles are alike (both ' + (k === 0 ? 'dominant' : 'recessive') + ').', 'So it is <b>' + names[k].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'For ' + t[0] + ', ' + domPhrase(t) + '. Do organisms with ' + d + d + ' and ' + d + r + ' look different?', a: mc(R, 'No, both have ' + t[2], ['Yes, ' + d + r + ' is in between', 'Yes, ' + d + d + ' has ' + t[2] + ' and ' + d + r + ' has ' + t[3]]), hint: 'One dominant allele is enough.',
        steps: ['Both genotypes have at least one ' + d + '.', 'With complete dominance, one copy shows the trait, so both have <b>' + t[2] + '</b>.'] };
      var k2 = R.int(0, 2), g2 = geno(t, k2), ph = k2 < 2 ? t[2] : t[3];
      return { q: 'A ' + t[4] + '\'s genotype is ' + g2 + ' (' + t[0] + '; ' + domPhrase(t) + '). What is its <b>phenotype</b>?', a: mc(R, cap(ph), [g2, cap(k2 < 2 ? t[3] : t[2])].concat(k2 === 1 ? [] : [geno(t, 1)])), hint: 'The phenotype is the trait you can see, in words.',
        steps: ['The phenotype is the trait that shows, described in words, not letters.', 'A ' + t[4] + ' with ' + g2 + ' has <b>' + ph + '</b>.'] };
    }
    var half = R.coin();
    return { q: 'A ' + t[4] + ' with ' + t[2] + ' is crossed with one with ' + t[3] + ' (' + t[0] + '; ' + t[3] + ' is recessive). ' + (half ? 'About half the offspring have ' + t[3] + '.' : 'All of many offspring have ' + t[2] + '.') + ' What is the most likely genotype of the parent with ' + t[2] + '?', a: mcFixed([d + d, d + r, r + r], half ? d + r : d + d),
      viz: quiet('bi-punnett', { p1: half ? d + r : d + d, p2: r + r, empty: true }),
      hint: 'The parent with ' + t[3] + ' can give only ' + r + '. What must the other parent give?', steps: half ? ['The offspring with ' + t[3] + ' are ' + r + r + ', so the parent with ' + t[2] + ' gave an ' + r + ' to some of them.', 'So it is <b>' + d + r + '</b>: ' + d + r + ' × ' + r + r + ' gives half ' + d + r + ' and half ' + r + r + '.'] : ['If the parent with ' + t[2] + ' carried an ' + r + ', about half the offspring would be ' + r + r + '.', 'None are, so it is most likely <b>' + d + d + '</b>.'] };
  });

  function crossOf(R) { var t = R.pick(TRAITS), d = t[1], r = d.toLowerCase(), pairs = [[d + r, d + r], [d + r, r + r], [d + d, r + r], [d + d, d + r], [r + r, r + r], [d + d, d + d]], p = R.pick(pairs); return { t: t, d: d, r: r, p1: p[0], p2: p[1], X: B().cross(p[0], p[1]) }; }
  G('lifesci.punnett-squares', function (R, ctx) {
    var L = lvl(ctx), c = crossOf(R), t = c.t, d = c.d, r = c.r;
    if (L === 1) {
      if (c.p1 === c.p2 && c.p1 !== d + r) c = { t: t, d: d, r: r, p1: d + r, p2: d + r, X: B().cross(d + r, d + r) };
      var i = R.int(0, 1), j = R.int(0, 1), g = c.X.grid[i][j];
      return { q: 'Cross ' + c.p1 + ' × ' + c.p2 + '. Which genotype goes in the box with the "?"', viz: quiet('bi-punnett', { p1: c.p1, p2: c.p2, ask: [i, j] }), a: mcFixed([d + d, d + r, r + r], g),
        hint: 'Take one allele from the side of its row and one from the top of its column.', steps: ['Row allele (side): ' + c.X.side[i] + '. Column allele (top): ' + c.X.top[j] + '.', 'Together: <b>' + g + '</b>.'] };
    }
    if (L === 2) {
      var gs = [d + d, d + r, r + r], g2 = R.pick(gs), n = c.X.genotypes[g2] || 0;
      return { q: 'In the Punnett square for ' + c.p1 + ' × ' + c.p2 + ', how many of the 4 boxes are <b>' + g2 + '</b>?', a: num(n), viz: quiet('bi-punnett', { p1: c.p1, p2: c.p2, empty: true }),
        hint: 'Fill every box with one allele from the top and one from the side.', steps: ['Boxes: ' + c.X.grid.map(function (row) { return row.join(', '); }).join('; ') + '.', g2 + ' appears in <b>' + n + '</b> box' + (n === 1 ? '' : 'es') + '.'] };
    }
    var dom = c.X.phenotypes.dom || 0, rec = c.X.phenotypes.rec || 0, right = rec === 0 ? 'All ' + t[2] : dom === 0 ? 'All ' + t[3] : dom + ' ' + t[2] + ' : ' + rec + ' ' + t[3];
    var opts = ['All ' + t[2], 'All ' + t[3], '3 ' + t[2] + ' : 1 ' + t[3], '2 ' + t[2] + ' : 2 ' + t[3], '1 ' + t[2] + ' : 3 ' + t[3]].filter(function (x) { return x !== right; });
    return { q: 'For ' + t[0] + ', ' + domPhrase(t) + '. Cross ' + c.p1 + ' × ' + c.p2 + '. What is the expected ratio of phenotypes among the 4 boxes?', a: mc(R, right, R.sample(opts, 3)), viz: quiet('bi-punnett', { p1: c.p1, p2: c.p2, empty: true }),
      hint: 'Fill the square, then sort the boxes by what they look like.', steps: ['Boxes: ' + c.X.grid.map(function (row) { return row.join(', '); }).join('; ') + '.', 'Any box with ' + d + ' has ' + t[2] + '; only ' + r + r + ' has ' + t[3] + '.', 'So: <b>' + right + '</b>.'] };
  });

  G('lifesci.punnett-probability', function (R, ctx) {
    var L = lvl(ctx), c = crossOf(R), t = c.t, d = c.d, r = c.r, PCT = ['0%', '25%', '50%', '75%', '100%'];
    while (c.p1 === c.p2 && c.p1 !== d + r) c = crossOf(R);
    if (L === 1) {
      var askRec = R.coin(), n = askRec ? (c.X.phenotypes.rec || 0) : (c.X.phenotypes.dom || 0), ph = askRec ? t[3] : t[2];
      return { q: 'Cross ' + c.p1 + ' × ' + c.p2 + ' (' + t[0] + ': ' + domPhrase(t) + '). What is the chance that one offspring has <b>' + ph + '</b>?', a: mcFixed(PCT, PCT[n]), viz: quiet('bi-punnett', { p1: c.p1, p2: c.p2 }),
        hint: 'Count the boxes, then divide by 4.', steps: ['Boxes: ' + c.X.grid.map(function (row) { return row.join(', '); }).join('; ') + '.', ph + ' boxes: ' + n + ' of 4.', n + ' ÷ 4 = <b>' + PCT[n] + '</b>.'] };
    }
    if (L === 2) { // the trouble spot: each offspring is a new chance
      var sp = R.pick([['guinea pigs', 'pups', 'black', 'white'], ['rabbits', 'kits', 'short-furred', 'long-furred'], ['dogs', 'puppies', 'black', 'brown']]), k = R.int(2, 4);
      if (R.coin()) return { q: 'Two ' + sp[0] + ', both Bb, have had ' + k + ' ' + sp[2] + ' ' + sp[1] + ' in a row (' + sp[3] + ', bb, is recessive). What is the chance the next one is ' + sp[3] + '?', a: mcFixed(PCT, '25%'),
        hint: 'Do the earlier offspring change the Punnett square?', steps: ['Each offspring is a new, independent chance from the same square.', 'bb is 1 box of 4, so the chance is still <b>25%</b>; no color is "due."'] };
      return { q: 'A Pp × Pp cross gives a 3 : 1 ratio of purple to white flowers. A gardener grows exactly 4 of these plants. True or false: exactly 3 will be purple and 1 white.', a: tf(false),
        hint: 'Is a ratio a promise for a small group?', steps: ['The ratio means each plant has a 3/4 chance of purple.', 'In a group of 4, any count from 0 to 4 purple can happen; exactly 3 happens only about 42% of the time.', 'So the statement is <b>false</b>.'] };
    }
    var tot = R.pick([40, 80, 100, 120, 200, 400, 800]), askR = R.coin(), nb = askR ? (c.X.phenotypes.rec || 0) : (c.X.phenotypes.dom || 0);
    if (nb === 0 || nb === 4) { c = { t: t, d: d, r: r, p1: d + r, p2: d + r, X: B().cross(d + r, d + r) }; nb = askR ? 1 : 3; }
    var exp = tot * nb / 4;
    return { q: 'A breeder makes ' + tot + ' offspring from the cross ' + c.p1 + ' × ' + c.p2 + ' (' + t[0] + ': ' + domPhrase(t) + '). About how many should have <b>' + (askR ? t[3] : t[2]) + '</b>?', a: num(exp),
      hint: 'Find the fraction of boxes, then multiply by ' + tot + '.', steps: ['Boxes: ' + c.X.grid.map(function (row) { return row.join(', '); }).join('; ') + '.', (askR ? t[3] : t[2]) + ': ' + nb + ' of 4 boxes.', nb + '/4 × ' + tot + ' = <b>' + exp + '</b> (the real count will be close to this, not exact).'] };
  });

  function randCodon(R, notStop) { var b = 'UCAG'.split(''), c; do { c = R.pick(b) + R.pick(b) + R.pick(b); } while (notStop && B().CODE[c] === '*'); return c; }
  var MUT_CH = ['No change to the protein', 'One amino acid changes', 'The protein stops early'];
  G('lifesci.mutations', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1 || L === 3 && R.coin()) {
      var want = R.int(0, 2), c0, c1, ty, guard = 0, map = { silent: 0, missense: 1, nonsense: 2 };
      do { c0 = randCodon(R, true); var pos = R.int(0, 2), b = 'UCAG'.split('').filter(function (x) { return x !== c0[pos]; }); c1 = c0.slice(0, pos) + R.pick(b) + c0.slice(pos + 1); ty = map[B().mutationType('AUG' + c0 + 'UAA', 'AUG' + c1 + 'UAA')]; } while (ty !== want && guard++ < 200);
      var a0 = B().CODE[c0], a1 = B().CODE[c1];
      return { q: 'A mutation changes the codon <b>' + c0 + '</b> to <b>' + c1 + '</b>. Use the codon table. What happens to the protein?', viz: { name: 'bi-central', opts: { mode: 'table', interactive: false } }, a: mcFixed(MUT_CH, MUT_CH[ty]),
        hint: 'Look up both codons.', steps: [c0 + ' → ' + B().AA[a0][0] + '.', c1 + ' → ' + (a1 === '*' ? 'stop' : B().AA[a1][0]) + '.', 'So: <b>' + MUT_CH[ty].toLowerCase() + '</b>' + (ty === 0 ? ' (a silent mutation).' : ty === 1 ? '.' : ': a stop codon cuts it short.')] };
    }
    if (L === 2) {
      var s = R.pick([['Every mutation is harmful.', false, 'Most mutations have little or no effect, some are harmful and a few are helpful.'], ['Some mutations are helpful, like the change that lets many adults digest milk sugar.', true, 'In places where people kept dairy animals, that change helped adults use milk as food.'],
        ['A mutation is a change in DNA.', true, 'It can change one base or a longer stretch of DNA.'], ['A mutation always creates a strange new kind of creature.', false, 'Most mutations change little or nothing that you can see.'], ['Whether a mutation helps can depend on the environment.', true, 'Dark color helps a moth on sooty bark but not on pale bark.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'Are mutations always bad?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var e = R.pick([['A mutation lets a mouse grow a darker coat. It lives on dark lava rock where owls hunt.', 'Helpful'], ['A mutation lets a mouse grow a darker coat. It lives on pale sand where owls hunt.', 'Harmful'], ['A mutation changes UUU to UUC in a gene. Both code for Phe.', 'Neutral (no effect)'], ['A mutation lets bacteria survive an antibiotic, and the antibiotic is in their surroundings.', 'Helpful'], ['A mutation stops a plant from making the green pigment it needs for photosynthesis.', 'Harmful']]);
    return { q: e[0] + ' For this organism, is the mutation helpful, harmful or neutral?', a: mcFixed(['Helpful', 'Harmful', 'Neutral (no effect)'], e[1]), hint: 'Think about the protein and about the environment.',
      steps: [{ Helpful: 'It helps the organism survive and reproduce where it lives.', Harmful: 'It makes survival harder where it lives.', 'Neutral (no effect)': 'The protein is unchanged.' }[e[1]], 'So it is <b>' + e[1].toLowerCase() + '</b>.'] };
  });

  var BREED = [['Farmers save seeds from the corn plants with the biggest ears, year after year.', 0], ['Breeders pair the gentlest dogs, generation after generation.', 0], ['Growers chose wild cabbage plants with big flower buds; over many generations this gave broccoli.', 0], ['Ranchers breed the cows that give the most milk.', 0],
    ['Scientists put the human insulin gene into bacteria, which then make human insulin.', 1], ['A gene for resisting an insect pest is moved into a crop plant.', 1], ['A gene from a jellyfish that makes a glowing protein is put into bacteria.', 1]];
  G('lifesci.breeding-engineering', function (R, ctx) {
    var L = lvl(ctx), ch = ['Selective breeding', 'Genetic engineering'];
    if (L === 1) { var b = R.pick(BREED); return { q: 'Which method is this?<br><i>' + b[0] + '</i>', a: mc(R, ch[b[1]], [ch[1 - b[1]]]), hint: 'Are people choosing parents, or moving a gene?',
      steps: [b[1] ? 'A specific gene is moved into another organism.' : 'People choose which individuals become parents, using variation already there.', 'So it is <b>' + ch[b[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Does selective breeding create new genes?', a: mc(R, 'No. It makes existing alleles more or less common', ['Yes. Choosing parents creates new genes', 'Yes. Every new generation gets brand-new genes from the breeder']), hint: 'Where does the variation come from?',
        steps: ['Selective breeding chooses among the alleles a population already has.', 'New alleles come from mutations; moving a gene from another species is genetic engineering.', 'So: <b>no</b>.'] };
      return { q: 'Why can bacteria make a human protein such as insulin once they carry the human gene?', a: mc(R, 'Nearly all living things use the same genetic code', ['Bacteria are tiny humans', 'The gene turns the bacteria into human cells', 'Insulin is made of DNA']), hint: 'How does a cell read a gene?',
        steps: ['The codon table is the same in nearly all living things.', 'So bacteria read the human gene and build the same protein.'] };
    }
    var t = R.pick(TRAITS.filter(function (x) { return x[0].indexOf('pea') < 0; })), d = t[1], r = d.toLowerCase();
    return { q: 'A breeder wants every offspring to have ' + t[3] + ' (' + t[0] + '; ' + t[3] + ' is recessive). Which pair of parents should she use?', a: mc(R, r + r + ' × ' + r + r, [d + r + ' × ' + d + r, d + r + ' × ' + r + r, d + d + ' × ' + r + r]),
      hint: 'Which cross has only ' + r + r + ' in every box?', steps: ['A recessive trait shows only in ' + r + r + '.', r + r + ' × ' + r + r + ' gives ' + r + r + ' in all 4 boxes.', 'Any parent with a ' + d + ' could pass it on. So use <b>' + r + r + ' × ' + r + r + '</b>.'] };
  });


  /* ======================= Unit 11: Evolution ======================= */
  var FOSSILS = ['trilobite', 'ammonite', 'fern', 'fish', 'shark tooth', 'dinosaur bone', 'clam shell', 'mammoth tooth', 'sea lily', 'coral', 'horsetail plant', 'early bird'];
  G('lifesci.fossil-record', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var f = R.sample(FOSSILS, 2), dA = R.int(12, 40), dB = R.int(2, dA - 4), deepFirst = R.coin();
      var X = deepFirst ? [f[0], dA] : [f[0], dB], Y = deepFirst ? [f[1], dB] : [f[1], dA], older = X[1] > Y[1] ? X[0] : Y[0];
      return { q: 'In an undisturbed cliff, a ' + X[0] + ' fossil is found ' + X[1] + ' m below the top and a ' + Y[0] + ' fossil ' + Y[1] + ' m below the top. Which organism lived first?', a: mcFixed(['The ' + X[0], 'The ' + Y[0]], 'The ' + older),
        hint: 'In undisturbed layers, deeper means older.', steps: ['Layers form on top of older layers, so deeper layers are older (superposition).', 'The ' + older + ' fossil is deeper.', 'So the <b>' + older + '</b> lived first.'] };
    }
    if (L === 2) {
      var s = R.pick([['The fossil record includes every species that ever lived.', false, 'Fossils form only in special conditions, such as quick burial of hard parts, so most organisms never fossilized.'], ['All kinds of living things appear together in the oldest rock layers.', false, 'Different groups appear at different times, in the same order around the world.'],
        ['Many species in the fossil record are now extinct.', true, 'Trilobites, for example, are found in old layers and in no young ones.'], ['In undisturbed rock, fossils in lower layers are generally older than fossils in higher layers.', true, 'Each layer settles on top of older ones.'], ['The fossil record has gaps, but the order it shows is consistent worldwide.', true, 'New finds keep fitting the same order.']]);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), hint: 'How do fossils form, and how do layers stack?', steps: [s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'] };
    }
    var fs = R.sample(FOSSILS, 3), layers = fs.map(function (f) { return { fossils: [f] }; }), names = ['C', 'B', 'A']; // bottom to top: C, B, A
    layers.forEach(function (l, i) { l.name = names[i]; });
    var askOld = R.coin(), sh = R.int(0, 1);
    if (sh === 0) return { q: 'The picture shows three undisturbed rock layers. Which fossil is the <b>' + (askOld ? 'oldest' : 'youngest') + '</b>?', viz: { name: 'lifesci-strata', opts: { layers: layers, quiet: true, interactive: false } }, a: mc(R, cap(askOld ? fs[0] : fs[2]), [cap(fs[1]), cap(askOld ? fs[2] : fs[0])]),
      hint: 'The bottom layer formed first.', steps: ['Bottom (layer C): ' + fs[0] + '. Middle (B): ' + fs[1] + '. Top (A): ' + fs[2] + '.', 'The ' + (askOld ? 'bottom' : 'top') + ' layer is the ' + (askOld ? 'oldest' : 'youngest') + ', so the answer is the <b>' + (askOld ? fs[0] : fs[2]) + '</b>.'] };
    var o = orderMc(R, fs.map(cap), null, 3);
    return { q: 'Use the rock layers in the picture. Put the fossils in order from oldest to youngest:<br>' + o.list.join('<br>'), viz: { name: 'lifesci-strata', opts: { layers: layers, quiet: true, interactive: false } }, a: o.a,
      hint: 'Start at the bottom layer.', steps: ['From the bottom up: ' + fs.join(', ') + '.', 'So the order is <b>' + o.right + '</b>.'] };
  });

  var HOMO = [['a human arm and a bat wing', true], ['a whale flipper and a cat\'s front leg', true], ['a bird wing and a human arm', true], ['a horse\'s front leg and a whale flipper', true], ['a bat wing and a bird wing (comparing their bones)', true], ['a frog\'s front leg and a lizard\'s front leg', true]];
  var ANALOG = [['a bird wing and a butterfly wing', false], ['a bat wing and a dragonfly wing', false], ['a shark fin and a penguin flipper (comparing their outer shape)', false], ['an octopus eye and a human eye', false]];
  G('lifesci.comparing-bodies', function (R, ctx) {
    var L = lvl(ctx), ch = ['Homologous: same bones, shared ancestry', 'Analogous: same job, built differently'];
    if (L === 1) { var x = R.coin() ? R.pick(HOMO) : R.pick(ANALOG); return { q: 'Are these homologous or analogous structures: <b>' + x[0] + '</b>?', a: mc(R, ch[x[1] ? 0 : 1], [ch[x[1] ? 1 : 0]]),
      viz: x[0].indexOf('butterfly') >= 0 || x[0].indexOf('dragonfly') >= 0 ? { name: 'lifesci-limbs', opts: { limbs: [x[0].indexOf('bat') >= 0 ? 'bat' : 'bird', 'insect'], interactive: false, quiet: true } } : undefined,
      hint: 'Look at the inner structure, not the job.', steps: [x[1] ? 'Both have the same plan of bones: upper arm, forearm, wrist and fingers.' : 'They may do a similar job, but they are built from different parts.', 'So they are <b>' + (x[1] ? 'homologous' : 'analogous') + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'Which is the best evidence that two animals share a common ancestor?', a: mc(R, 'Their limbs have the same bones in the same arrangement', ['Both of their limbs are used for flying', 'Both live in the same habitat', 'Both are about the same size']), hint: 'Similar jobs can evolve separately.',
        steps: ['Structures that do the same job can evolve separately (like bird and insect wings).', 'Shared inner structure, the same bones in the same order, points to a shared ancestor.'] };
      return { q: 'A bird and a butterfly both have wings for flying. Does that show they are close relatives?', a: mc(R, 'No. Their wings are built differently, so the likeness came separately', ['Yes. Anything that flies is closely related', 'Yes. Same job means same ancestor']),
        viz: { name: 'lifesci-limbs', opts: { limbs: ['bird', 'insect'], interactive: false, quiet: true } }, hint: 'Check the bones, not the job.', steps: ['A bird wing has vertebrate arm bones; an insect wing has no bones at all.', 'So the wings are <b>analogous</b>, not evidence of close kinship.'] };
    }
    var v = R.pick([['Whales have no back legs, yet many have small hip and leg bones inside their bodies.', 'Whales descend from ancestors that walked on four legs'], ['Some snakes, such as pythons, have tiny leftover hip bones and claw-like spurs.', 'Snakes descend from ancestors that had legs'], ['Many cave fish that live in total darkness have eyes that do not work.', 'Their ancestors lived where eyes were useful']]);
    return { q: v[0] + ' What does this suggest?', a: mc(R, v[1], ['The bones or eyes will grow back if needed', 'These animals are not related to any others', 'The structures were added recently because they are needed']), hint: 'Why would an animal have a part it does not use?',
      steps: ['A reduced structure that no longer does its old job is called vestigial.', 'It is a leftover from ancestors that used it: <b>' + v[1].toLowerCase() + '</b>.'] };
  });

  var NS_PARTS = ['Variation', 'Inheritance', 'More young than can survive', 'Selection'];
  var NS_BANK = [['Beetles in a population range from light to dark brown.', 0], ['Some sunflowers grow taller than others in the same field.', 0], ['Dark parent beetles tend to have dark offspring.', 1], ['Seed size in finches is passed from parents to their young.', 1],
    ['A frog lays hundreds of eggs, but only a few tadpoles grow up.', 2], ['A maple tree drops thousands of seeds, but few become trees.', 2], ['Birds catch more of the light beetles on dark soil, so dark beetles leave more young.', 3], ['During a drought, finches with bigger beaks crack more hard seeds and survive.', 3]];
  var SCEN = [['beetles', 'light brown to dark brown', 'dark soil', 'birds that hunt by sight', 'darker'], ['beetles', 'light brown to dark brown', 'pale sand', 'birds that hunt by sight', 'lighter'], ['mice', 'tan to dark brown fur', 'dark lava rock', 'owls', 'darker'], ['mice', 'tan to dark brown fur', 'pale beach sand', 'owls', 'lighter'], ['moths', 'pale to dark wings', 'soot-blackened tree bark', 'birds', 'darker'], ['moths', 'pale to dark wings', 'pale, lichen-covered bark', 'birds', 'lighter']];
  G('lifesci.natural-selection', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var b = R.pick(NS_BANK); return { q: 'Which part of natural selection does this describe?<br><i>' + b[0] + '</i>', a: mcFixed(NS_PARTS, NS_PARTS[b[1]]), hint: 'Differences? Passed on? Too many young? Some survive better?',
      steps: [['Individuals differ from each other.', 'A trait is passed from parents to offspring.', 'Many more young are born than can survive.', 'Individuals with a helpful trait survive and reproduce more.'][b[1]], 'So it is <b>' + NS_PARTS[b[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      var c = R.pick([['giraffes', 'longer necks', 'reach leaves high in trees'], ['cheetahs', 'faster legs', 'catch fast prey'], ['polar bears', 'thicker fur', 'stay warm'], ['cactuses', 'thicker stems', 'store more water']]);
      return { q: 'Which explanation of how ' + c[0] + ' came to have ' + c[1] + ' fits natural selection?', a: mc(R, 'Some ' + c[0] + ' were born with slightly ' + c[1] + '; they survived and reproduced more, and passed the trait on', ['Each ' + c[0].replace(/s$/, '') + ' stretched or worked to grow ' + c[1] + ' and passed them to its young', c[0][0].toUpperCase() + c[0].slice(1) + ' grew ' + c[1] + ' because they needed to ' + c[2], 'The environment gave every ' + c[0].replace(/s$/, '') + ' ' + c[1] + ' at once']),
        hint: 'Individuals do not change their inherited traits; populations change.', steps: ['Variation was already there: some were born with slightly ' + c[1] + '.', 'Those helped them ' + c[2] + ', so they survived and had more offspring, who inherited the trait.', 'Over generations the trait became common. Traits gained by effort during life are not inherited.'] };
    }
    var s = R.pick(SCEN);
    return { q: 'A population of ' + s[0] + ' varies from ' + s[1] + '. They live on ' + s[2] + ', and ' + s[3] + ' eat the ones they can spot. Color is inherited. After many generations, what will the population look like?', viz: s[0] === 'beetles' ? quiet('bi-selection', { background: s[2].indexOf('dark') >= 0 ? 'dark' : 'light' }) : undefined,
      a: mc(R, 'Mostly ' + s[4], ['Mostly ' + (s[4] === 'darker' ? 'lighter' : 'darker'), 'The same mix as now', 'Each one will change color to match']),
      hint: 'Which ones are easiest to spot?', steps: ['On ' + s[2] + ', the ' + (s[4] === 'darker' ? 'lighter' : 'darker') + ' ones stand out and are eaten more often.', 'The ' + s[4] + ' ones survive and reproduce more, passing on their color.', 'So the population becomes <b>mostly ' + s[4] + '</b>.'] };
  });

  G('lifesci.populations-change', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var up = R.coin(), y0 = R.pick([1950, 1960]), yrs = [0, 10, 20, 30, 40].map(function (x) { return x + y0; }), start = up ? R.int(5, 20) : R.int(80, 95), step = R.int(10, 18), vals = yrs.map(function (y, i) { return Math.max(1, Math.min(99, start + (up ? 1 : -1) * step * i)); });
      if (R.coin()) return { q: 'Moth surveys found these shares of dark moths (made-up data for practice): ' + yrs.map(function (y, i) { return y + ': ' + vals[i] + '%'; }).join(', ') + '. Is the dark form becoming more or less common?', a: mcFixed(['More common', 'Less common', 'Staying the same'], up ? 'More common' : 'Less common'),
        viz: { name: 'bi-chart', opts: { kind: 'line', x: yrs, series: [{ name: 'Dark moths (%)', values: vals }], ymin: 0, ymax: 100, xlabel: 'Year', ylabel: 'Dark moths (%)', interactive: false } }, hint: 'Compare the first and last values.', steps: ['From ' + vals[0] + '% to ' + vals[4] + '%.', 'So the dark form is becoming <b>' + (up ? 'more' : 'less') + ' common</b>.'] };
      var i1 = R.int(0, 2), i2 = R.int(i1 + 1, 4);
      return { q: 'Moth surveys found these shares of dark moths (made-up data for practice): ' + yrs.map(function (y, i) { return y + ': ' + vals[i] + '%'; }).join(', ') + '. By how many percentage points did the share change from ' + yrs[i1] + ' to ' + yrs[i2] + '?', a: num(Math.abs(vals[i2] - vals[i1])), unit: 'points',
        viz: { name: 'bi-chart', opts: { kind: 'line', x: yrs, series: [{ name: 'Dark moths (%)', values: vals }], ymin: 0, ymax: 100, xlabel: 'Year', ylabel: 'Dark moths (%)', interactive: false } }, hint: 'Subtract the smaller from the larger.', steps: [yrs[i1] + ': ' + vals[i1] + '%. ' + yrs[i2] + ': ' + vals[i2] + '%.', '|' + vals[i2] + ' − ' + vals[i1] + '| = <b>' + Math.abs(vals[i2] - vals[i1]) + '</b> percentage points.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: 'An antibiotic is used against a population of bacteria, and later most of the bacteria are resistant. What happened?', a: mc(R, 'A few bacteria already resisted it; the antibiotic killed the others, and the resistant ones multiplied', ['The antibiotic taught the bacteria to resist it', 'Each bacterium chose to become resistant', 'The antibiotic turned into new bacteria']),
        hint: 'Did the antibiotic create the resistance, or select it?', steps: ['Resistance comes from mutations some bacteria already have.', 'The antibiotic kills the bacteria without it.', 'The resistant survivors multiply, so the population becomes mostly resistant. The drug <b>selected</b> resistance; it did not cause it.'] };
      return { q: 'Why did dark peppered moths become common near Manchester in the 1800s, and pale ones common again after clean-air laws?', a: mc(R, 'Birds ate the moths that stood out most against the bark, and the bark color changed with the soot', ['Each moth changed its color to match the trees', 'Soot dyed the moths dark, and rain washed them pale', 'Dark moths were made by factories']),
        hint: 'Who was choosing which moths survived?', steps: ['Soot darkened the bark, so pale moths stood out and were eaten more; dark moths left more offspring.', 'After the air was cleaned, the bark grew pale again and selection favored pale moths.', 'Moth color is inherited; individual moths did not change.'] };
    }
    var start = R.pick([5, 10, 20, 25]), dt = R.pick([20, 30]), hrs = R.pick([2, 3]), g = hrs * 60 / dt, n = start * Math.pow(2, g);
    return { q: 'A colony of 1,000,000 bacteria includes ' + start + ' that resist an antibiotic. The antibiotic kills all the others. The resistant ones double every ' + dt + ' minutes. How many resistant bacteria are there ' + hrs + ' hours later?', a: num(n),
      hint: 'Count the doublings first.', steps: [hrs + ' hours = ' + hrs * 60 + ' minutes; ' + hrs * 60 + ' ÷ ' + dt + ' = ' + g + ' doublings.', start + ' × 2<sup>' + g + '</sup> = ' + start + ' × ' + Math.pow(2, g) + ' = <b>' + fmtN(n) + '</b>.', 'The new population is made almost entirely of resistant bacteria.'] };
  });

})(window.MathLadder);
