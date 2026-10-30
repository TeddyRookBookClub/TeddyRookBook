/* Generators for hsbio, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* High School Biology (Biology Ladder, course key hsbio), part A: units 1-6 (Biology as a Science, The Chemistry of Life,
   Cell Structure, Membranes and Transport, Cellular Energy, Cell Division). Problem generators.
   Source parts: /tmp/work_hsbio_A/gen/*.js (built by build_gen.sh into out/gen.js, then merged by /tmp/merge_parts.js).
   Conventions: /tmp/work_bio/overview.md. Facts that the pictures also use come from MathLadder.bio (ML.bio).
   Levels: 1 one clear case; 2 the topic's trouble spot; 3 several items, a two-step calculation or a data reading. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function B() { return ML.bio; }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  // multiple choice: right answer first (makeProblem shuffles the choices)
  function mc(right, wrongs) { return { t: 'mc', choices: [right].concat(wrongs), v: 0 }; }
  // multiple choice in a fixed order (orders, scales)
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  // choose all that are right: items [[text, true|false]]
  function all(items) { return { t: 'mc', choices: items.map(function (x) { return x[0]; }), v: items.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function num(v, o) { return Object.assign({ t: 'num', v: String(typeof v === 'number' ? fix(v, 9) : v) }, o || {}); }
  function quiet(name, opts) { return { name: name, opts: Object.assign({ quiet: true, interactive: false }, opts || {}) }; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fix(x, dp) { var f = Math.pow(10, dp === undefined ? 6 : dp); return Math.round(x * f) / f; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // a problem from a bank item { q, r (right), w: [wrongs], s: [steps], h: hint, viz? }; k = number of wrong choices shown
  function fromBank(R, it, k) {
    var w = it.w.length > (k || 3) ? R.sample(it.w, k || 3) : it.w.slice();
    var p = { q: it.q, a: mc(it.r, w), steps: it.s, hint: it.h };
    if (it.viz) p.viz = it.viz;
    return p;
  }
  // a true/false problem from [statement, true|false, explanation]
  function tfItem(it, hint) { return { q: '<b>True or false?</b> ' + it[0], a: tf(it[1]), steps: [it[2], 'So the statement is <b>' + (it[1] ? 'true' : 'false') + '</b>.'], hint: hint }; }
  // choose all: pool of [text, ok]; picks n items with at least one right and one wrong
  function chooseAll(R, pool, n) {
    for (var t = 0; t < 50; t++) {
      var s = R.sample(pool, Math.min(n, pool.length));
      var r = s.filter(function (x) { return x[1]; }).length;
      if (r >= 1 && r < s.length) return s;
    }
    return pool.slice(0, n);
  }
  function listAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  /* ================= Unit 1: Biology as a Science ================= */
  // experiments: iv (changed), dv (measured), cv (kept the same), ctl (control group), who
  var EXPTS = [
    { s: 'A student grows bean seedlings under red, blue and green light for three weeks and measures their heights.', iv: 'the color of the light', dv: 'the height of the seedlings', cv: ['the amount of water', 'the kind of soil', 'the temperature', 'the size of the pots'], ctl: null },
    { s: 'A class mixes yeast and sugar into water at 10, 20, 30 and 40 °C and measures the volume of gas each flask makes in 20 minutes.', iv: 'the temperature of the water', dv: 'the volume of gas made', cv: ['the amount of yeast', 'the amount of sugar', 'the volume of water', 'the time allowed'], ctl: null },
    { s: 'A biologist puts brine shrimp eggs in water with 1%, 2%, 3% and 4% salt and counts the share that hatch in two days.', iv: 'the salt concentration', dv: 'the percent of eggs that hatch', cv: ['the number of eggs', 'the temperature', 'the light', 'the volume of water'], ctl: null },
    { s: 'A gardener soaks radish seeds for 0, 2, 4 and 8 hours before planting and counts how many sprout within a week.', iv: 'the soaking time', dv: 'the number of seeds that sprout', cv: ['the number of seeds planted', 'the soil', 'the watering', 'the temperature'], ctl: 'the seeds soaked for 0 hours' },
    { s: 'A student places a water plant (Elodea) 10, 20, 30 and 40 cm from a lamp and counts the oxygen bubbles it gives off per minute.', iv: 'the distance from the lamp', dv: 'the number of bubbles per minute', cv: ['the size of the plant', 'the water temperature', 'the kind of lamp', 'the time of counting'], ctl: null },
    { s: 'Researchers give tomato plants 0, 5 or 10 g of fertilizer each week and weigh the fruit each plant makes.', iv: 'the amount of fertilizer', dv: 'the mass of fruit', cv: ['the tomato variety', 'the watering', 'the sunlight', 'the pot size'], ctl: 'the plants given no fertilizer' },
    { s: 'A student cuts potato cubes of the same size, puts them in sugar solutions of different strengths for an hour, and measures how their mass changes.', iv: 'the strength of the sugar solution', dv: 'the change in mass of the cubes', cv: ['the size of the cubes', 'the time in the solution', 'the temperature', 'the kind of potato'], ctl: null },
    { s: 'A class tests whether mulch keeps soil moist: half the garden beds get mulch, half get none, and each day they measure the water in the soil.', iv: 'whether a bed has mulch', dv: 'the amount of water in the soil', cv: ['the kind of soil', 'the watering', 'the sunlight', 'the size of the beds'], ctl: 'the beds with no mulch' },
    { s: 'A student adds the same amount of an enzyme to starch solutions at pH 3, 5, 7 and 9 and times how long the starch takes to disappear.', iv: 'the pH', dv: 'the time for the starch to disappear', cv: ['the amount of enzyme', 'the amount of starch', 'the temperature', 'the volume of solution'], ctl: null },
    { s: 'Ecologists fence some plots of a meadow so deer cannot enter, leave other plots open, and count the young trees in each plot after three years.', iv: 'whether deer can enter the plot', dv: 'the number of young trees', cv: ['the plot size', 'the kind of meadow', 'the time span', 'the counting method'], ctl: 'the open plots that deer can enter' }
  ];
  var CONCL = [
    ['The results agree with the prediction.', 'The data support the hypothesis.', ['The hypothesis is proved true.', 'The hypothesis is now a theory.', 'The experiment shows nothing at all.'], 'Agreeing data support a hypothesis; they never prove it for good. More trials and repeated experiments build confidence.'],
    ['The results disagree with the prediction in every trial.', 'The data do not support the hypothesis.', ['The hypothesis is still proved, since one test is not enough.', 'The data support the hypothesis.', 'The independent variable must be changed to make it agree.'], 'A careful result that disagrees with the prediction is evidence against the hypothesis (it refutes it), as long as the test was fair.'],
    ['Three repeated trials all agree with the prediction, and another lab gets the same result.', 'The hypothesis is well supported, though a later test could still show a problem.', ['The hypothesis is proved and can never change.', 'The hypothesis is now a law.', 'Nothing can be said until a hundred labs repeat it.'], 'Repeated agreement by different people makes a hypothesis well supported. Science still stays open to new evidence.']
  ];
  var FLAWS = [
    ['A student puts one plant in sunlight and waters it daily, and one plant in shade and waters it weekly, to test the effect of light on growth.', 'Two variables (light and water) were changed at once.', ['There was no dependent variable.', 'The plants should have been different kinds.', 'Nothing: it is a fair test.'], 'Both light and water differ between the plants, so a difference in growth could come from either one. Change only one variable.'],
    ['To test a new fertilizer, a student gives it to one tomato plant and measures that plant\'s fruit.', 'There is only one plant and no control group to compare with.', ['Fruit mass cannot be measured.', 'Two variables were changed at once.', 'Nothing: it is a fair test.'], 'With one plant and nothing to compare it with, any result could be chance or would have happened anyway. Use many plants in each group, including a group with no fertilizer.'],
    ['A student tests whether music helps plants grow by playing music to one group of five plants and not the other. The music group sits by a sunny window; the other group sits in a dim hallway.', 'The light was not kept the same for both groups.', ['Five plants per group is too many.', 'Music cannot be an independent variable.', 'Nothing: it is a fair test.'], 'Light is a controlled variable that was not controlled: the sunny group could grow more because of the light, not the music.'],
    ['A student tests three temperatures on yeast but uses a different amount of sugar in each flask.', 'The amount of sugar should have been kept the same.', ['Temperature cannot be tested on yeast.', 'There should be only one flask.', 'Nothing: it is a fair test.'], 'Sugar is food for the yeast, so changing it along with temperature mixes two causes. Keep the sugar constant.'],
    ['A student soaks 50 seeds in each of three solutions, but checks the first group after two days and the others after five days.', 'The time before counting was not kept the same.', ['50 seeds is too many.', 'The seeds should have been different kinds.', 'Nothing: it is a fair test.'], 'More seeds sprout with more time, so the groups must be checked after the same time.']
  ];
  var TESTABLE = [
    ['If brine shrimp eggs are kept in water above 3% salt, fewer of them will hatch than in 2% salt.', ['Brine shrimp are the most interesting animals.', 'Salt water is better than fresh water.', 'Brine shrimp feel happier in salty water.']],
    ['If radish seeds are soaked in water for four hours, more of them will sprout within a week than unsoaked seeds.', ['Radishes taste better than carrots.', 'Seeds want to grow.', 'Soaking is a good idea.']],
    ['If duckweed gets more fertilizer, then the number of plants will grow faster over two weeks.', ['Duckweed is a beautiful plant.', 'Fertilizer is either good or bad.', 'Plants prefer fertilizer.']],
    ['If yeast is kept at 35 °C, it will make more gas in 20 minutes than yeast at 15 °C.', ['Yeast is a living thing.', 'Bread is better when homemade.', 'Yeast enjoys warm water.']]
  ];
  G('hsbio.hypotheses-experiments', function (R, ctx) {
    var L = lv(ctx), e = R.pick(EXPTS);
    if (L === 1) {
      var ask = R.int(0, 2), others = EXPTS.filter(function (x) { return x !== e; }), other = R.pick(others);
      if (ask === 0) return { q: e.s + '<br>What is the <b>independent variable</b>?', a: mc(cap(e.iv), [cap(e.dv), cap(R.pick(e.cv)), cap(other.iv)]), hint: 'The independent variable is the one factor the experimenter changes on purpose.',
        steps: ['The experimenter changes ' + e.iv + ' on purpose.', 'What is measured (' + e.dv + ') is the dependent variable.', 'So the independent variable is <b>' + e.iv + '</b>.'] };
      if (ask === 1) return { q: e.s + '<br>What is the <b>dependent variable</b>?', a: mc(cap(e.dv), [cap(e.iv), cap(R.pick(e.cv)), cap(other.dv)]), hint: 'The dependent variable is what is measured.',
        steps: ['The factor changed on purpose is ' + e.iv + '.', 'What is measured to see the effect is <b>' + e.dv + '</b>: the dependent variable.'] };
      var cv = R.pick(e.cv);
      return { q: e.s + '<br>Which of these should be a <b>controlled variable</b> (kept the same)?', a: mc(cap(cv), [cap(e.iv), cap(e.dv)]), hint: 'Controlled variables are the things that could matter but are not being tested.',
        steps: [cap(e.iv) + ' is changed on purpose, and ' + e.dv + ' is measured.', cap(cv) + ' could also affect the result, so it must be kept the same: a <b>controlled variable</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) {
        var c = R.pick(CONCL);
        return { q: 'A student tests the hypothesis in this experiment: ' + e.s.charAt(0).toLowerCase() + e.s.slice(1) + '<br>' + c[0] + ' What is the best conclusion?', a: mc(c[1], c[2]), hint: 'Can one experiment prove a hypothesis?', steps: [c[3], 'So the best conclusion: <b>' + c[1] + '</b>'] };
      }
      var t = R.pick(TESTABLE);
      return { q: 'Which statement is a <b>testable hypothesis</b>?', a: mc(t[0], t[1]), hint: 'A testable hypothesis makes a prediction about something you can measure.',
        steps: ['A testable hypothesis predicts a measurable result that an experiment could support or refute.', 'Opinions, feelings and value words ("better", "happier") cannot be measured.', 'So the testable one is: <b>' + t[0] + '</b>'] };
    }
    if (R.coin()) {
      var f = R.pick(FLAWS);
      return { q: f[0] + '<br>What is the biggest problem with this experiment?', a: mc(f[1], f[2]), hint: 'Look for anything besides the independent variable that differs between groups, or a missing comparison.', steps: [f[3], 'So the problem: <b>' + f[1] + '</b>'] };
    }
    var pool = [[cap(e.iv), false], [cap(e.dv), false]].concat(e.cv.map(function (x) { return [cap(x), true]; }));
    var pick = R.sample(e.cv, 2).map(function (x) { return [cap(x), true]; }).concat([[cap(e.iv), false], [cap(e.dv), false]]);
    return { q: e.s + '<br>Which of these must be kept the same in every group? Choose all that apply.', a: all(pick), hint: 'Everything except the one factor being tested, and the thing being measured, must stay the same.',
      steps: ['The factor tested is ' + e.iv + ': it must differ between groups.', 'The result measured is ' + e.dv + ': it is allowed to differ.', 'Keep the rest constant: <b>' + listAnd(pick.filter(function (x) { return x[1]; }).map(function (x) { return x[0].toLowerCase(); })) + '</b>.'] };
  });

  /* ---- reading data ---- */
  var TRIALS = [['an enzyme reaction made', 'mL of oxygen', 'mL'], ['bean seedlings grew', 'cm', 'cm'], ['a yeast flask made', 'mL of gas', 'mL'], ['a student counted', 'Elodea bubbles per minute', 'bubbles per minute'], ['a duckweed tank grew to', 'plants', 'plants']];
  var CORR = [
    ['Towns that sell more ice cream also have more sunburns.', 'Hot, sunny weather could cause both.', ['Ice cream causes sunburn.', 'Sunburn makes people buy ice cream.', 'The two cannot be related at all.']],
    ['Students who sleep more tend to have higher test scores.', 'The data show a correlation; only a controlled experiment could show that sleep causes higher scores.', ['More sleep is proved to cause higher scores.', 'Higher scores cause students to sleep more.', 'There is no relationship.']],
    ['In a survey, gardens with more bird feeders had fewer aphids on their roses.', 'The feeders are linked with fewer aphids, but another factor (such as gardeners who also spray their roses) could explain it.', ['Bird feeders kill aphids.', 'Aphids scare birds away.', 'The survey proves birds eat aphids.']],
    ['Over 50 years, both the number of televisions sold and the number of people wearing glasses rose.', 'Both rose over the same years; that alone does not show that one caused the other.', ['Televisions cause poor eyesight.', 'Glasses make people buy televisions.', 'The trend proves a cause.']],
    ['Lakes with more algae have less oxygen in their deep water.', 'This is a correlation; experiments and other evidence are needed to show the cause.', ['Algae is proved to remove oxygen directly.', 'Low oxygen causes algae.', 'There is no relationship.']]
  ];
  G('hsbio.reading-data', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var t = R.pick(TRIALS), n = R.pick([3, 4, 5]), m = R.int(6, 40), vals;
      for (var k = 0; k < 40; k++) { vals = []; for (var i = 0; i < n - 1; i++) vals.push(m + R.int(-4, 4)); var last = m * n - vals.reduce(function (a, b) { return a + b; }, 0); if (last > 0 && Math.abs(last - m) <= 5) { vals.push(last); break; } }
      if (vals.length < n) { vals = []; for (var j = 0; j < n; j++) vals.push(m); }
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      var pm = { q: 'In ' + n + ' trials, ' + t[0] + ' ' + listAnd(vals.map(String)) + ' ' + t[1] + '. What is the mean?', a: num(sum / n),
        hint: 'Add the trials, then divide by how many there are.', steps: ['Add: $' + vals.join(' + ') + ' = ' + sum + '$.', 'Divide by ' + n + ': $' + sum + ' \\div ' + n + ' = ' + (sum / n) + '$.', 'The mean is <b>' + (sum / n) + ' ' + t[1] + '</b>.'] };
      if (t[2] === 'mL' || t[2] === 'cm') pm.unit = t[2];
      return pm;
    }
    if (L === 2) {
      var shape = R.int(0, 1);
      if (shape === 0) { var c = R.pick(CORR); return { q: c[0] + '<br>Which conclusion is best supported?', a: mc(c[1], c[2]), hint: 'Was anything changed on purpose, with the rest held constant?', steps: ['These data come from observing, not from a controlled experiment.', 'Two things changing together is a correlation. A third factor may drive both.', 'So: <b>' + c[1] + '</b>'] }; }
      // read a line graph: where is the peak? (axes first)
      var opt = R.pick([20, 25, 30, 35, 40, 45]), xs = [0, 10, 20, 30, 40, 50, 60], peak = Math.round(opt / 10) * 10;
      if (opt % 10 !== 0) opt = peak; // keep the peak on a measured point
      var vmax = R.int(30, 60), ys = xs.map(function (x) { return Math.round(vmax * B().activity(x, opt, 14, 'temp')); });
      var best = xs[ys.indexOf(Math.max.apply(null, ys))];
      return { q: 'The graph shows an enzyme\'s reaction rate at seven temperatures. At which temperature was the rate highest?', viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Rate', values: ys }], xlabel: 'Temperature (°C)', ylabel: 'Rate (mL O₂ per min)', quiet: true, interactive: false } },
        a: num(best), unit: '°C', hint: 'Find the highest point of the line, then read straight down to the temperature axis.', steps: ['The x-axis is temperature in °C; the y-axis is the rate.', 'The highest point of the line is above ' + best + ' °C (a rate of about ' + Math.max.apply(null, ys) + ' mL per minute).', 'So the rate was highest at <b>' + best + ' °C</b>.'] };
    }
    var s3 = R.int(0, 1);
    if (s3 === 0) { // error bars
      var m1 = R.int(18, 30), e1 = R.int(1, 3), overlap = R.coin(), e2 = R.int(1, 4), m2 = overlap ? m1 - R.int(1, e1 + e2 - 1) : m1 - (e1 + e2 + R.int(2, 6));
      var lo1 = m1 - e1, hi2 = m2 + e2;
      return { q: 'Plants in group A grew a mean of ' + m1 + ' cm (error bar ± ' + e1 + ' cm). Plants in group B grew ' + m2 + ' cm (± ' + e2 + ' cm). Do the error bars overlap, and what does that suggest?',
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: ['Group A', 'Group B'], series: [{ name: 'Mean growth (cm)', values: [m1, m2], err: [e1, e2] }], ylabel: 'Growth (cm)', ymin: 0, quiet: true, interactive: false } },
        a: overlap ? mc('They overlap, so the difference might be due to chance.', ['They do not overlap, so the difference is likely real.', 'They overlap, so group A grew twice as much.', 'Error bars say nothing about the groups.']) : mc('They do not overlap, so the difference is likely real.', ['They overlap, so the difference might be due to chance.', 'They do not overlap, so the experiment failed.', 'Error bars say nothing about the groups.']),
        hint: 'Work out the lowest end of group A\'s bar and the highest end of group B\'s.', steps: ['Group A reaches down to $' + m1 + ' - ' + e1 + ' = ' + lo1 + '$ cm.', 'Group B reaches up to $' + m2 + ' + ' + e2 + ' = ' + hi2 + '$ cm.', overlap ? 'Since $' + hi2 + ' \\ge ' + lo1 + '$, the bars <b>overlap</b>: the difference might be chance.' : 'Since $' + hi2 + ' < ' + lo1 + '$, the bars <b>do not overlap</b>: the difference is likely real.'] };
    }
    var a0 = R.pick([20, 25, 40, 50, 80]), pct = R.pick([10, 20, 25, 40, 50, 60, 75]) * R.pick([1, 1, -1]), a1 = fix(a0 * (1 + pct / 100));
    return { q: 'The mean mass of a group of seedlings went from ' + a0 + ' g to ' + a1 + ' g. What is the percent change? (Use a negative number for a decrease.)', a: num(pct, { pct: true }),
      hint: 'Percent change = (new − old) ÷ old × 100.', steps: ['Change: $' + a1 + ' - ' + a0 + ' = ' + fix(a1 - a0) + '$ g.', 'Divide by the starting value and multiply by 100: $' + fix(a1 - a0) + ' \\div ' + a0 + ' \\times 100 = ' + pct + '$.', 'The percent change is <b>' + pct + '%</b>.'] };
  });

  /* ---- scientific theories ---- */
  var KINDS = ['Observation', 'Hypothesis', 'Law', 'Theory'];
  var STMTS = [
    ['A leaf placed in the dark for two days turned pale.', 0], ['Under the microscope, the cheek cells had no cell walls.', 0], ['The yeast flask at 30 °C made 18 mL of gas.', 0], ['Three of the ten seedlings bent toward the window.', 0], ['The beaker of salt water weighed 105 g.', 0],
    ['If the duckweed gets more light, then it will multiply faster.', 1], ['If ants follow scent trails, then wiping the trail away will make them wander.', 1], ['If bean seeds need light to sprout, then seeds in a dark box will not sprout.', 1], ['If catalase is a protein, then boiling it will stop it from working.', 1],
    ['In a chemical reaction, matter is neither created nor destroyed.', 2], ['Energy is neither created nor destroyed; it only changes form.', 2], ['The pressure of a gas rises when it is squeezed into a smaller space at constant temperature.', 2],
    ['All living things are made of cells, and every cell comes from an existing cell.', 3], ['Living things share common ancestors and change over generations, mainly by natural selection.', 3], ['Many diseases are caused by microorganisms that pass from one host to another.', 3], ['Mitochondria and chloroplasts descend from bacteria that once lived inside other cells.', 3]
  ];
  var THEORY_TF = [
    ['In science, a theory is a well-tested explanation that ties many observations together.', true, 'That is the scientific meaning of "theory".'],
    ['A theory becomes a law once it has been proved.', false, 'Laws and theories are different kinds of ideas: a law describes a pattern, a theory explains it. Theories do not "graduate" into laws.'],
    ['"Theory" in science means about the same as "guess".', false, 'A guess is closer to a hypothesis, and even a hypothesis must be testable. A theory is well tested and widely supported.'],
    ['A scientific theory can be revised if strong new evidence calls for it.', true, 'All scientific knowledge stays open to new evidence. Well-supported theories are usually refined, not thrown out.'],
    ['The cell theory and the theory of evolution are both supported by many independent lines of evidence.', true, 'Both explain enormous numbers of observations from different methods.'],
    ['A law explains why a pattern happens.', false, 'A law describes what happens (often as an equation); a theory explains why.'],
    ['One experiment is enough to establish a scientific theory.', false, 'A theory is built from many hypotheses tested many times by many people.'],
    ['A hypothesis is narrower than a theory: it is a testable explanation for one question.', true, 'Hypotheses are tested one at a time; a theory ties many supported results together.']
  ];
  G('hsbio.scientific-theories', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var s = R.pick(STMTS);
      return { q: 'What kind of scientific idea is this statement?<br><i>"' + s[0] + '"</i>', a: mcKeep(KINDS, s[1]), hint: 'Is it something seen, a testable if-then idea, a description of a pattern, or a broad explanation?',
        steps: [['It reports something seen or measured.', 'It is an if-then prediction that one test could support or refute.', 'It describes a pattern that always holds, without saying why.', 'It is a broad, well-tested explanation that ties many observations together.'][s[1]], 'So it is a <b>' + KINDS[s[1]].toLowerCase() + '</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) return tfItem(R.pick(THEORY_TF), 'Remember: laws describe, theories explain, and both are well tested.');
      return { q: 'A friend says, "Evolution is just a theory, so it is only a guess." Which reply uses the scientific meaning of "theory"?', a: mc(R.pick(['In science, a theory is a well-tested explanation supported by many lines of evidence, not a guess.', 'A scientific theory is a broad explanation that has survived many tests; that is the strongest kind of explanation science has.']), ['You are right: once it is proved, it will become a law.', 'A theory is a guess, but a popular one.', 'Theories cannot be tested, so they are matters of opinion.']),
        hint: 'How does the everyday meaning of "theory" differ from the scientific one?', steps: ['In everyday speech "theory" can mean a hunch.', 'In science, a theory is a well-tested explanation, such as the cell theory or the theory of evolution, supported by fossils, anatomy, DNA and observed change.', 'Theories do not turn into laws; laws describe patterns and theories explain them.'] };
    }
    var pool = THEORY_TF.map(function (x) { return [x[0], x[1]]; }), sel = chooseAll(R, pool, 4);
    return { q: 'Which statements about scientific ideas are true? Choose all that apply.', a: all(sel), hint: 'Laws describe, theories explain; theories are well tested but open to revision.',
      steps: sel.map(function (x) { var it = THEORY_TF.filter(function (y) { return y[0] === x[0]; })[0]; return (it[1] ? 'True: ' : 'False: ') + it[2]; }) };
  });

  /* ================= Unit 2: The Chemistry of Life ================= */
  var BONDS = [
    ['the bond between the oxygen and a hydrogen inside one water molecule', 'Covalent bond', 'The two atoms share a pair of electrons inside one molecule: a (polar) covalent bond.'],
    ['the attraction between the oxygen of one water molecule and a hydrogen of a neighboring water molecule', 'Hydrogen bond', 'It joins two separate molecules through a δ+ hydrogen and a δ− oxygen: a hydrogen bond.'],
    ['the attraction between Na⁺ and Cl⁻ in a crystal of table salt', 'Ionic bond', 'Two ions with opposite charges attract: an ionic bond.'],
    ['the bond between two carbon atoms in a glucose molecule', 'Covalent bond', 'The carbons share electrons in the backbone of one molecule: covalent.'],
    ['the attraction that holds base A on one DNA strand to base T on the other', 'Hydrogen bond', 'The two strands are held by hydrogen bonds between paired bases, which is why they can unzip.'],
    ['the attraction between K⁺ and Cl⁻ ions in a dry salt crystal', 'Ionic bond', 'A positive and a negative ion attract: ionic.'],
    ['the bond between carbon and hydrogen in methane, CH₄', 'Covalent bond', 'Carbon and hydrogen share electrons: covalent.'],
    ['the attraction between a hydrogen on one part of a folded protein chain and an oxygen on another part of the same chain', 'Hydrogen bond', 'A weak attraction between δ+ H and δ− O on parts far apart along a chain: a hydrogen bond.'],
    ['the bond that links one amino acid to the next in a protein', 'Covalent bond', 'A peptide bond is a covalent bond.']
  ];
  var VALENCE = [['hydrogen (H)', 1], ['oxygen (O)', 2], ['nitrogen (N)', 3], ['carbon (C)', 4]];
  var ELEM_TF = [
    ['Oxygen, carbon, hydrogen and nitrogen make up about 96% of the mass of the human body.', true, 'Oxygen about 65%, carbon 18%, hydrogen 10% and nitrogen 3%.'],
    ['A hydrogen bond is a covalent bond between hydrogen and another atom.', false, 'A hydrogen bond is a weak attraction between a δ+ hydrogen that already belongs to one molecule and a δ− O or N of another molecule (or another part of a big one).'],
    ['Hydrogen bonds are much weaker than covalent bonds.', true, 'They break and re-form constantly at body temperature, while covalent bonds hold molecules together.'],
    ['Carbon can form four covalent bonds, so it can build chains, branches and rings.', true, 'That is why carbon is the backbone of life\'s large molecules.'],
    ['In a water molecule, the oxygen end is slightly positive.', false, 'Oxygen pulls the shared electrons closer, so the oxygen end is slightly negative (δ−) and the hydrogens slightly positive (δ+).'],
    ['Phosphorus is found in nucleic acids such as DNA.', true, 'The phosphate groups of the backbone contain phosphorus.'],
    ['Sulfur is found in some amino acids, and so in many proteins.', true, 'Two of the 20 amino acids contain sulfur.'],
    ['Hydrogen bonds join the two strands of DNA.', true, 'Paired bases are held by hydrogen bonds, so the strands can separate for copying.']
  ];
  G('hsbio.elements-bonds', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var v = R.pick(VALENCE); return { q: 'How many covalent bonds does an atom of ' + v[0] + ' usually form?', a: num(v[1]), hint: 'Think of methane (CH₄), water (H₂O) and ammonia (NH₃).', steps: ['Methane CH₄: carbon forms 4, each H forms 1. Water H₂O: oxygen forms 2. Ammonia NH₃: nitrogen forms 3.', 'So ' + v[0] + ' usually forms <b>' + v[1] + '</b>.'] }; }
      var b = R.pick(BONDS.filter(function (x) { return x[1] !== 'Hydrogen bond'; }));
      return { q: 'What kind of bond is ' + b[0] + '?', a: mc(b[1], ['Covalent bond', 'Ionic bond', 'Hydrogen bond'].filter(function (x) { return x !== b[1]; })), hint: 'Shared electrons, attracted ions, or a weak attraction between molecules?', steps: [b[2]] };
    }
    if (L === 2) {
      if (R.coin()) { var hb = R.pick(BONDS.filter(function (x) { return /water|DNA|protein/.test(x[0]); })); return { q: 'What kind of bond is ' + hb[0] + '?', a: mc(hb[1], ['Covalent bond', 'Ionic bond', 'Hydrogen bond'].filter(function (x) { return x !== hb[1]; })), hint: 'Is it inside one molecule, or between two molecules (or two distant parts of one chain)?', steps: [hb[2]] }; }
      return tfItem(R.pick(ELEM_TF.slice(1, 5)), 'A hydrogen bond is an attraction between molecules, not a bond inside one.');
    }
    var shape = R.int(0, 2);
    if (shape === 0) {
      var sel = chooseAll(R, ELEM_TF.map(function (x) { return [x[0], x[1]]; }), 4);
      return { q: 'Which statements are true? Choose all that apply.', a: all(sel), hint: 'Check each one: shared electrons (covalent), ions (ionic), weak attraction between molecules (hydrogen bond).',
        steps: sel.map(function (x) { var it = ELEM_TF.filter(function (y) { return y[0] === x[0]; })[0]; return (it[1] ? 'True: ' : 'False: ') + it[2]; }) };
    }
    if (shape === 1) { // valence of a small molecule: how many H on a carbon chain
      var nC = R.int(1, 4), nH = 2 * nC + 2, names = ['methane', 'ethane', 'propane', 'butane'];
      return { q: 'A straight chain of ' + nC + ' carbon atom' + (nC > 1 ? 's' : '') + ' joined by single bonds is filled with hydrogens (' + names[nC - 1] + '). Each carbon forms 4 bonds and each hydrogen 1. How many hydrogen atoms does it have?', a: num(nH), hint: 'Count the bonds each carbon uses on its carbon neighbors; the rest go to hydrogen.',
        steps: ['The two end carbons each bond to one carbon' + (nC === 1 ? ' (here the single carbon bonds to none)' : '') + '; middle carbons bond to two.', nC === 1 ? 'One carbon with 4 bonds to hydrogen: 4 H.' : 'Ends: $2 \\times 3 = 6$ H. Middle: $' + (nC - 2) + ' \\times 2 = ' + 2 * (nC - 2) + '$ H.', 'Total: $2(' + nC + ') + 2 = ' + nH + '$ hydrogen atoms.'] };
    }
    var which = R.pick([['nitrogen', 'proteins and nucleic acids', 'carbohydrates', 'Carbohydrates and most lipids are made of C, H and O only.'], ['phosphorus', 'nucleic acids (and phospholipids)', 'proteins', 'Phosphorus is in the phosphate groups of DNA, RNA, ATP and phospholipids.'], ['sulfur', 'some proteins', 'nucleic acids', 'Sulfur is in two amino acids, so it turns up in many proteins.']]);
    return { q: 'An element is found in ' + which[1] + ' but not in ' + which[2] + '. Which element could it be?', a: mc(cap(which[0]), ['Carbon', 'Oxygen', 'Hydrogen']), hint: 'Carbon, hydrogen and oxygen are in all four kinds of large molecule.', steps: ['Carbon, hydrogen and oxygen are in every kind of biological molecule.', which[3], 'So the element is <b>' + which[0] + '</b>.'] };
  });

  /* ---- water ---- */
  var WATER_EX = [
    ['A water strider walks across the surface of a pond without sinking.', 'Surface tension (cohesion)', 'Hydrogen bonds pull the surface molecules together into a film strong enough to hold the insect.'],
    ['Water rises up the narrow xylem tubes of a tall tree, clinging to the tube walls.', 'Adhesion', 'Water molecules are attracted to the polar walls of the tubes.'],
    ['A column of water in a tree holds together as it is pulled up from the roots.', 'Cohesion', 'Hydrogen bonds hold each water molecule to the next, so the column does not break.'],
    ['A lake freezes at the surface while fish keep swimming in liquid water below.', 'Ice is less dense than liquid water', 'In ice, hydrogen bonds hold molecules apart in an open lattice, so ice floats and insulates the water below.'],
    ['Sweat evaporating from your skin cools you down.', 'High heat of vaporization', 'Each molecule that escapes must break its hydrogen bonds, carrying a lot of heat away.'],
    ['Coastal cities have milder summers and winters than inland cities.', 'High specific heat', 'The ocean warms and cools slowly, steadying the air temperature nearby.'],
    ['Table salt and sugar dissolve easily in a glass of water.', 'Water is a good solvent', 'The δ+ and δ− ends of water molecules surround ions and polar molecules and pull them apart.'],
    ['Water in a narrow glass tube curves up at the edges (a meniscus).', 'Adhesion', 'Water is attracted to the polar glass.'],
    ['Your body temperature stays steady even when the room warms up quickly.', 'High specific heat', 'Your body is mostly water, which absorbs a lot of heat with a small temperature change.'],
    ['A drop of water on a waxy leaf beads up into a ball.', 'Cohesion', 'Water molecules cling to each other more than to the nonpolar wax.']
  ];
  var PROPS = ['Surface tension (cohesion)', 'Adhesion', 'Cohesion', 'Ice is less dense than liquid water', 'High heat of vaporization', 'High specific heat', 'Water is a good solvent'];
  var BOIL = [
    ['When water boils, what breaks?', 'The hydrogen bonds between water molecules', ['The covalent bonds inside each water molecule', 'The water molecules split into hydrogen and oxygen gas', 'Nothing breaks; the molecules just shrink'], 'Steam is still H₂O. Boiling breaks the weak attractions between molecules so they can escape as a gas.'],
    ['What is in the bubbles of boiling water?', 'Water molecules (H₂O) as a gas', ['Hydrogen gas', 'Oxygen gas', 'A mix of hydrogen and oxygen gas'], 'The bubbles are water vapor. The covalent bonds inside each molecule stay whole; only hydrogen bonds between molecules break.'],
    ['Why does ice float on liquid water?', 'Hydrogen bonds hold ice molecules in an open lattice, so ice is less dense', ['Ice has air trapped in it, and pure ice would sink', 'Ice molecules are lighter than liquid water molecules', 'Freezing breaks the covalent bonds inside the molecules'], 'Each molecule in ice is locked to four neighbors at a distance, making the solid about 9% larger in volume than the liquid.'],
    ['Why does water take so much energy to warm up?', 'Much of the energy goes into breaking hydrogen bonds before the molecules speed up', ['Water molecules are very heavy', 'The covalent bonds in water must break first', 'Water is a poor conductor, so heat cannot enter'], 'Heat first loosens the hydrogen bonds; only the rest makes the molecules move faster, which is what raises the temperature.']
  ];
  G('hsbio.water-properties', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var e = R.pick(WATER_EX), wr = R.sample(PROPS.filter(function (x) { return x !== e[1] && !(e[1].indexOf('ohesion') >= 0 && x.indexOf('ohesion') >= 0); }), 3);
      return { q: e[0] + '<br>Which property of water explains this?', a: mc(e[1], wr), hint: 'Every property comes from hydrogen bonds. Which effect is this one?', steps: [e[2], 'So the property is <b>' + e[1].toLowerCase() + '</b>.'] };
    }
    if (L === 2) { var b = R.pick(BOIL); return { q: b[0], a: mc(b[1], b[2]), viz: quiet('bi-molecule', { mode: 'water' }), hint: 'Inside a molecule: covalent bonds. Between molecules: hydrogen bonds.', steps: [b[3]] }; }
    var m = R.pick([50, 100, 150, 200, 250, 500]), t0 = R.int(10, 25), dT = R.pick([5, 10, 15, 20, 25]), c = 4.18, q = fix(m * c * dT, 4);
    if (R.coin()) return { q: 'How much heat energy is needed to warm ' + m + ' g of water from ' + t0 + ' °C to ' + (t0 + dT) + ' °C? Use $c = 4.18$ J/(g·°C).', a: num(q, { rtol: 0.01 }), unit: 'J',
      hint: 'Use $q = m \\times c \\times \\Delta T$.', steps: ['$\\Delta T = ' + (t0 + dT) + ' - ' + t0 + ' = ' + dT + '$ °C.', '$q = ' + m + ' \\times 4.18 \\times ' + dT + ' = ' + q + '$ J.', 'About <b>' + commas(q) + ' J</b>.'] };
    var E = fix(m * c * dT, 4);
    return { q: 'A sample of ' + m + ' g of water absorbs ' + commas(E) + ' J of heat. By how many degrees does its temperature rise? Use $c = 4.18$ J/(g·°C).', a: num(dT, { rtol: 0.01 }), unit: '°C',
      hint: 'Rearrange $q = m c \\Delta T$ to $\\Delta T = q \\div (m c)$.', steps: ['$\\Delta T = q \\div (m \\times c)$.', '$m \\times c = ' + m + ' \\times 4.18 = ' + fix(m * c) + '$ J/°C.', '$\\Delta T = ' + E + ' \\div ' + fix(m * c) + ' = ' + dT + '$ °C.'] };
  });

  /* ---- pH ---- */
  var SUBST = [['stomach acid', 2], ['lemon juice', 2], ['vinegar', 3], ['tomato juice', 4], ['black coffee', 5], ['rainwater', 5.6], ['milk', 6.5], ['pure water', 7], ['blood', 7.4], ['seawater', 8], ['baking soda in water', 8.5], ['milk of magnesia', 10], ['household ammonia', 11.5]];
  G('hsbio.ph', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var shape = R.int(0, 1);
      if (shape === 0) { var p = R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]), kind = p < 7 ? 0 : p === 7 ? 1 : 2;
        return { q: 'A solution has a pH of ' + p + '. Is it acidic, neutral or basic?', a: mcKeep(['Acidic', 'Neutral', 'Basic'], kind), hint: '7 is neutral; below 7 is acidic; above 7 is basic.', steps: ['On the pH scale, 7 is neutral.', p + (p < 7 ? ' is below 7, so the solution is <b>acidic</b>.' : p === 7 ? ' is exactly 7: <b>neutral</b>.' : ' is above 7, so the solution is <b>basic</b>.')] }; }
      var two = R.sample(SUBST.filter(function (x) { return x[1] !== 7.4 && x[1] !== 5.6; }), 2); if (two[0][1] === two[1][1]) two = [SUBST[0], SUBST[12]];
      var more = two[0][1] < two[1][1] ? two[0] : two[1], less = more === two[0] ? two[1] : two[0];
      return { q: cap(two[0][0]) + ' has a pH of about ' + two[0][1] + ', and ' + two[1][0] + ' about ' + two[1][1] + '. Which has more hydrogen ions (H⁺)?', a: mc(cap(more[0]), [cap(less[0]), 'They have the same amount']), hint: 'A lower pH means more H⁺.', steps: ['Lower pH means more H⁺.', cap(more[0]) + ' has the lower pH (' + more[1] + '), so it has <b>more H⁺</b>.'] };
    }
    if (L === 2) {
      var a = R.int(1, 9), d = R.int(1, 4), b = a + d, f = Math.pow(10, d);
      var tw = R.coin();
      return { q: 'How many times more H⁺ does a solution at pH ' + a + ' have than one at pH ' + b + '?', a: num(f), hint: 'Each step of 1 on the pH scale is a factor of 10.', steps: ['The pH values differ by $' + b + ' - ' + a + ' = ' + d + '$.', 'Each step is ten times: $10^{' + d + '} = ' + commas(f) + '$.', 'The pH ' + a + ' solution has <b>' + commas(f) + ' times</b> more H⁺ (not ' + (d * 2) + ' or ' + fix(b / a, 2) + ' times).'] };
    }
    var shape3 = R.int(0, 2);
    if (shape3 === 0) { var ph = R.int(2, 9); return { q: 'What is the hydrogen ion concentration of a solution at pH ' + ph + '? (Type it like 1e-5.)', a: num('1e-' + ph, { rtol: 0.01 }), unit: 'mol/L', hint: '$[\\text{H}^+] = 10^{-\\text{pH}}$.', steps: ['$[\\text{H}^+] = 10^{-\\text{pH}}$.', 'So $[\\text{H}^+] = 10^{-' + ph + '}$ mol/L.'] }; }
    if (shape3 === 1) { var h = R.int(2, 10); return { q: 'A solution has $[\\text{H}^+] = 10^{-' + h + '}$ mol/L. What is its pH?', a: num(h), hint: 'The pH is the power of ten, without the minus sign.', steps: ['$[\\text{H}^+] = 10^{-\\text{pH}}$, so the pH is the exponent without the sign.', 'pH = <b>' + h + '</b> (' + (h < 7 ? 'acidic' : h === 7 ? 'neutral' : 'basic') + ').'] }; }
    var p0 = R.int(5, 8), drop = R.int(1, 3), p1 = p0 - drop, where = R.pick(['Acid rain falls on a pond', 'Acid rain falls on a lake', 'Runoff from a mine drains into a stream', 'A gardener adds sulfur to the soil water in a pot', 'Carbon dioxide bubbles into a fish tank', 'Lemon juice is stirred into a glass of water']);
    if (R.chance(0.3)) { var up0 = R.int(3, 6), rise = R.int(1, 3), what = R.pick(['Lime is added to an acidic lake', 'Baking soda is stirred into an acidic solution', 'A farmer spreads lime on acidic soil, and the soil water changes']);
      return { q: what + ', and the pH rises from ' + up0 + ' to ' + (up0 + rise) + '. By what factor does the H⁺ concentration go down?', a: num(Math.pow(10, rise)), hint: 'Each step up in pH means ten times less H⁺.', steps: ['The pH rose by ' + rise + '.', 'Each unit is a factor of 10, so H⁺ went down by $10^{' + rise + '} = ' + Math.pow(10, rise) + '$ times.'] }; }
    return { q: where + ', and its pH drops from ' + p0 + ' to ' + p1 + '. By what factor does the H⁺ concentration change?', a: num(Math.pow(10, drop)), hint: 'Did H⁺ go up or down? By how many powers of ten?', steps: ['The pH fell by ' + drop + ', so H⁺ rose.', 'Factor: $10^{' + drop + '} = ' + commas(Math.pow(10, drop)) + '$.', 'The water has <b>' + commas(Math.pow(10, drop)) + ' times</b> as much H⁺ as before.'] };
  });

  /* ---- monomers and polymers ---- */
  var JOIN = [
    ['Two amino acids are linked, and a water molecule is released.', 'Dehydration synthesis'], ['A cell links glucose units into a starch chain.', 'Dehydration synthesis'], ['Two nucleotides are joined to lengthen a strand of DNA.', 'Dehydration synthesis'], ['Glycerol and three fatty acids are joined into a fat.', 'Dehydration synthesis'],
    ['Enzymes in your gut break starch into sugars.', 'Hydrolysis'], ['A protein in food is broken into amino acids during digestion.', 'Hydrolysis'], ['Sucrose is split into glucose and fructose.', 'Hydrolysis'], ['A water molecule is used to break the bond between two sugars.', 'Hydrolysis']
  ];
  var POLY = [['glucose', 'starch', 'carbohydrates'], ['amino acids', 'a protein', 'proteins'], ['nucleotides', 'DNA', 'nucleic acids'], ['glucose', 'cellulose', 'carbohydrates'], ['glucose', 'glycogen', 'carbohydrates'], ['nucleotides', 'RNA', 'nucleic acids']];
  function sub(n) { return String(n).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join(''); }
  G('hsbio.monomers-polymers', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var j = R.pick(JOIN); return { q: j[0] + '<br>Which reaction is this?', a: mc(j[1], [j[1] === 'Hydrolysis' ? 'Dehydration synthesis' : 'Hydrolysis', 'Denaturation', 'Photosynthesis']), hint: 'Is a bond being made or broken?', steps: [j[1] === 'Hydrolysis' ? 'A bond is broken by adding water: <b>hydrolysis</b>.' : 'A bond is made and water is released: <b>dehydration synthesis</b>.'] }; }
      var pp = R.pick(POLY);
      return { q: 'What are the monomers of ' + pp[1] + '?', a: mc(cap(pp[0]), ['Glucose', 'Amino acids', 'Nucleotides', 'Fatty acids'].filter(function (x) { return x.toLowerCase() !== pp[0]; })), hint: 'Which family of large molecules is ' + pp[1] + ' in?', steps: [cap(pp[1]) + ' belongs to the ' + pp[2] + '.', 'Its monomers are <b>' + pp[0] + '</b>.'] };
    }
    if (L === 2) {
      var q2 = R.pick([
        ['When two monomers are joined by dehydration synthesis, what happens to water?', 'A water molecule is released.', ['A water molecule is added.', 'Water is not involved.', 'Two water molecules are added.'], 'Dehydration means water removed: an –OH and an –H leave as H₂O as the bond forms.'],
        ['When a polymer is broken down by hydrolysis, what happens to water?', 'A water molecule is used up for each bond broken.', ['A water molecule is released for each bond broken.', 'Water is not involved.', 'The polymer turns into water.'], 'Hydro-lysis means water-splitting: water is split and its –H and –OH go onto the two pieces.'],
        ['Digestion breaks food proteins into amino acids. Which reaction is this, and does it use or release water?', 'Hydrolysis, which uses water', ['Hydrolysis, which releases water', 'Dehydration synthesis, which uses water', 'Dehydration synthesis, which releases water'], 'Breaking bonds by adding water is hydrolysis.'],
        ['A cell builds a protein from amino acids. Which reaction is this, and does it use or release water?', 'Dehydration synthesis, which releases water', ['Dehydration synthesis, which uses water', 'Hydrolysis, which releases water', 'Hydrolysis, which uses water'], 'Building a bond between monomers releases a water molecule: dehydration synthesis.']]);
      return { q: q2[0], a: mc(q2[1], q2[2]), viz: quiet('bi-molecule', { mode: 'polymer', n: 3 }), hint: '"Dehydration" means water taken out; "hydrolysis" means splitting with water.', steps: [q2[3], 'So: <b>' + q2[1] + '</b>'] };
    }
    var shape = R.int(0, 2), n = R.int(3, 30);
    if (shape === 0) return { q: 'A chain of ' + n + ' amino acids is built by dehydration synthesis. How many water molecules are released?', a: num(n - 1), hint: 'How many links join ' + n + ' units in a row?', steps: ['Each new bond between neighbors releases one water.', 'A chain of ' + n + ' units has ' + (n - 1) + ' bonds.', 'So <b>' + (n - 1) + '</b> water molecules.'] };
    if (shape === 1) { var m = R.int(20, 300); return { q: 'A starch chain of ' + m + ' glucose units is completely hydrolyzed into glucose. How many water molecules are used?', a: num(m - 1), hint: 'One water for each bond broken.', steps: ['The chain has $' + m + ' - 1 = ' + (m - 1) + '$ bonds.', 'Hydrolysis uses one water per bond: <b>' + (m - 1) + '</b>.'] }; }
    var k = R.int(2, 6), C = 6 * k, H = 12 * k - 2 * (k - 1), O = 6 * k - (k - 1), f = 'C' + C + 'H' + H + 'O' + O;
    return { q: 'Glucose is C₆H₁₂O₆. What is the formula of the molecule made by joining ' + k + ' glucose molecules in a chain by dehydration synthesis?', a: { t: 'formula', v: f }, hint: 'Add up the atoms of the glucose molecules, then subtract one H₂O for each new bond.',
      steps: [k + ' glucose: C' + sub(C) + 'H' + sub(12 * k) + 'O' + sub(6 * k) + '.', k + ' units in a chain have ' + (k - 1) + ' bond' + (k > 2 ? 's' : '') + ', so ' + (k - 1) + ' H₂O leave' + (k > 2 ? '' : 's') + ': subtract H' + sub(2 * (k - 1)) + 'O' + (k > 2 ? sub(k - 1) : '') + '.', 'The product is <b>C' + sub(C) + 'H' + sub(H) + 'O' + sub(O) + '</b>.'] };
  });

  /* ---- carbohydrates ---- */
  var CARBS = [['glucose', 0], ['fructose', 0], ['galactose', 0], ['ribose', 0], ['sucrose', 1], ['lactose', 1], ['maltose', 1], ['starch', 2], ['glycogen', 2], ['cellulose', 2], ['chitin', 2]];
  var CNOTE = { glucose: 'a single six-carbon sugar', fructose: 'fruit sugar, a single sugar', galactose: 'a single sugar', ribose: 'a single five-carbon sugar (in RNA)', sucrose: 'glucose + fructose', lactose: 'glucose + galactose', maltose: 'glucose + glucose', starch: 'a long glucose chain that stores energy in plants', glycogen: 'a branched glucose chain that stores energy in animals', cellulose: 'long glucose chains in plant cell walls', chitin: 'a long chain in insect shells and fungal cell walls' };
  var CJOB = [
    ['Which carbohydrate do animals store in the liver and muscles?', 'Glycogen', ['Starch', 'Cellulose', 'Sucrose']], ['Which carbohydrate do plants store in seeds and potatoes?', 'Starch', ['Glycogen', 'Cellulose', 'Chitin']],
    ['Which carbohydrate makes up most of plant cell walls?', 'Cellulose', ['Starch', 'Glycogen', 'Lactose']], ['Which carbohydrate builds the hard outer skeleton of insects?', 'Chitin', ['Cellulose', 'Glycogen', 'Starch']],
    ['Which sugar is the main fuel for cellular respiration?', 'Glucose', ['Cellulose', 'Chitin', 'Lactose']], ['Which sugar is found in milk?', 'Lactose', ['Sucrose', 'Starch', 'Cellulose']]
  ];
  var CTROUBLE = [
    ['Starch and cellulose are both polymers of which monomer?', 'Glucose', ['Fructose', 'Amino acids', 'Fatty acids'], 'Both are chains of glucose. Break either one completely and you get only glucose.'],
    ['Why can people digest starch but not cellulose?', 'The glucose units are linked differently, and our enzymes fit only starch\'s links.', ['Cellulose is made of a different sugar.', 'Cellulose is a protein.', 'Starch is a monosaccharide.'], 'In cellulose every other glucose is flipped. Amylase does not fit those links.'],
    ['How do cows get energy from the cellulose in grass?', 'Microbes in their gut make an enzyme that breaks cellulose\'s links.', ['Cows make amylase that digests cellulose.', 'Grass contains no cellulose.', 'Cellulose turns into starch in the stomach.'], 'The microbes break cellulose into glucose and other products the cow can use.'],
    ['What makes cellulose strong enough to build cell walls?', 'Its straight chains line up side by side and hydrogen-bond into fibers.', ['Its chains are made of amino acids.', 'It has more phosphorus than starch.', 'It is a single giant sugar molecule with no chains.'], 'The straight chains pack tightly into fibers held together by many hydrogen bonds.']
  ];
  G('hsbio.carbohydrates', function (R, ctx) {
    var L = lv(ctx), K = ['Monosaccharide', 'Disaccharide', 'Polysaccharide'];
    if (L === 1) { var c = R.pick(CARBS); return { q: 'Is ' + c[0] + ' a monosaccharide, a disaccharide or a polysaccharide?', a: mcKeep(K, c[1]), hint: 'One sugar, two sugars, or a long chain?', steps: [cap(c[0]) + ' is ' + CNOTE[c[0]] + '.', 'So it is a <b>' + K[c[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var t = R.pick(CTROUBLE); return { q: t[0], a: mc(t[1], t[2]), hint: 'Look at what the chains are made of, and how the units are joined.', steps: [t[3]] }; }
    if (R.coin()) { var j = R.pick(CJOB); return { q: j[0], a: mc(j[1], j[2]), hint: 'Storage: starch (plants) and glycogen (animals). Structure: cellulose and chitin.', steps: ['Energy is stored as starch in plants and glycogen in animals; cellulose and chitin build structures; glucose is fuel; lactose is milk sugar.', 'So the answer is <b>' + j[1].toLowerCase() + '</b>.'] }; }
    var sel = R.sample(CARBS, 4), want = R.int(0, 2), items = sel.map(function (x) { return [cap(x[0]), x[1] === want]; });
    if (!items.some(function (x) { return x[1]; })) { var add = R.pick(CARBS.filter(function (x) { return x[1] === want; })); items[0] = [cap(add[0]), true]; }
    if (items.every(function (x) { return x[1]; })) { var o = R.pick(CARBS.filter(function (x) { return x[1] !== want; })); items[3] = [cap(o[0]), false]; }
    items = items.filter(function (x, i) { return items.findIndex(function (y) { return y[0] === x[0]; }) === i; });
    return { q: 'Which of these are <b>' + K[want].toLowerCase() + 's</b>? Choose all that apply.', a: all(items), hint: 'Mono: one sugar. Di: two. Poly: a long chain.',
      steps: items.map(function (x) { var c2 = CARBS.filter(function (y) { return cap(y[0]) === x[0]; })[0]; return x[0] + ': ' + CNOTE[c2[0]] + ' (' + K[c2[1]].toLowerCase() + ').'; }) };
  });

  /* ---- lipids ---- */
  var LIPID_ID = [
    ['A molecule of glycerol joined to three fatty acids, used to store energy.', 'A fat (triglyceride)'], ['The main molecule of cell membranes, with a water-loving head and two water-fearing tails.', 'A phospholipid'],
    ['A molecule of four fused carbon rings, such as cholesterol.', 'A steroid'], ['A waterproof coating on leaves and feathers.', 'A wax'], ['Olive oil, liquid at room temperature.', 'A fat (triglyceride)'], ['Cortisol, a hormone with four fused rings.', 'A steroid']
  ];
  var LTYPES = ['A fat (triglyceride)', 'A phospholipid', 'A steroid', 'A wax'];
  var LIPID_TF = [
    ['Fats are polymers made of many identical repeating monomers.', false, 'A fat is one glycerol and three fatty acids. It is not a long chain of one repeating monomer.'],
    ['What all lipids have in common is that they do not mix well with water.', true, 'Lipids are grouped by a property (hydrophobic), not by a monomer.'],
    ['Steroids are built from glycerol and fatty acids.', false, 'Steroids are four fused carbon rings, not glycerol and fatty acids.'],
    ['Fats are built by dehydration synthesis, releasing three water molecules.', true, 'Each fatty acid joins glycerol with the loss of one water: three in all.'],
    ['Saturated fatty acids have C=C double bonds that bend their tails.', false, 'Saturated tails have no double bonds and are straight; unsaturated tails have double bonds and kinks.'],
    ['A gram of fat stores about twice as much energy as a gram of carbohydrate.', true, 'About 9 kcal per gram against about 4.']
  ];
  G('hsbio.lipids', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var it = R.pick(LIPID_ID); return { q: 'Which kind of lipid is this?<br><i>' + it[0] + '</i>', a: mc(it[1], LTYPES.filter(function (x) { return x !== it[1]; })), hint: 'Glycerol and three fatty acids? A phosphate head? Four rings? A waterproof coat?', steps: ['Fats: glycerol + 3 fatty acids. Phospholipids: a phosphate head and 2 tails. Steroids: 4 fused rings. Waxes: waterproof coats.', 'So it is <b>' + it[1].toLowerCase() + '</b>.'] }; }
    if (L === 2) return tfItem(R.pick(LIPID_TF), 'Lipids share a property (they avoid water), not a repeating monomer.');
    var shape = R.int(0, 2);
    if (shape === 0) { var g = R.int(5, 60); return { q: 'A seed stores ' + g + ' g of fat. Fat holds about 9 kcal per gram. About how much energy is stored?', a: num(9 * g, { rtol: 0.01 }), unit: 'kcal', hint: 'Multiply the mass by the energy per gram.', steps: ['$' + g + ' \\times 9 = ' + 9 * g + '$ kcal.', 'About <b>' + 9 * g + ' kcal</b>.'] }; }
    if (shape === 1) { var e = 36 * R.int(1, 10); return { q: 'An animal needs to store ' + e + ' kcal. How many more grams would it take to store this as carbohydrate (4 kcal/g) than as fat (9 kcal/g)?', a: num(e / 4 - e / 9, { rtol: 0.01 }), unit: 'g', hint: 'Find each mass by dividing the energy by the energy per gram, then subtract.', steps: ['As fat: $' + e + ' \\div 9 = ' + e / 9 + '$ g.', 'As carbohydrate: $' + e + ' \\div 4 = ' + e / 4 + '$ g.', 'Difference: $' + e / 4 + ' - ' + e / 9 + ' = ' + (e / 4 - e / 9) + '$ g more.'] }; }
    var db = R.int(0, 3), sat = db === 0;
    return { q: 'A fatty acid tail has ' + (db === 0 ? 'no' : db) + ' C=C double bond' + (db === 1 ? '' : 's') + '. Is it saturated or unsaturated, and is a fat made of such tails more likely solid or liquid at room temperature?',
      a: mc(sat ? 'Saturated; solid' : 'Unsaturated; liquid', [sat ? 'Saturated; liquid' : 'Unsaturated; solid', sat ? 'Unsaturated; solid' : 'Saturated; liquid', sat ? 'Unsaturated; liquid' : 'Saturated; solid']),
      hint: 'Double bonds put kinks in the tail, so the molecules cannot pack tightly.', steps: [sat ? 'No double bonds: the tail holds all the hydrogen it can, so it is <b>saturated</b>.' : 'Double bonds mean the tail is <b>unsaturated</b>.', sat ? 'Straight tails pack tightly, so the fat is <b>solid</b> (like butter).' : 'Each double bond bends the tail, so the molecules pack loosely and stay <b>liquid</b> (an oil).'] };
  });

  /* ---- proteins ---- */
  var PJOB = [['amylase', 'Enzyme: speeds up the breakdown of starch'], ['pepsin', 'Enzyme: speeds up the breakdown of proteins in the stomach'], ['hemoglobin', 'Transport: carries oxygen in red blood cells'], ['collagen', 'Structure: gives skin, bone and tendons strength'], ['keratin', 'Structure: builds hair and nails'], ['antibodies', 'Defense: bind to germs and mark them for destruction'], ['insulin', 'Signal: a hormone that tells cells to take up glucose'], ['actin and myosin', 'Movement: slide past each other to contract muscles'], ['channel proteins', 'Transport: let ions cross the cell membrane']];
  var PLEVEL = [['the order of amino acids in the chain', 0], ['an α helix formed by hydrogen bonds along the backbone', 1], ['a β pleated sheet in one part of the chain', 1], ['the whole chain folded into its 3-D shape by interactions between R groups', 2], ['four chains fitted together, as in hemoglobin', 3], ['the folding that puts nonpolar R groups in the middle of the protein', 2]];
  var LEVELS = ['Primary', 'Secondary', 'Tertiary', 'Quaternary'];
  var PTROUBLE = [
    ['In sickle cell disease, one amino acid in each of hemoglobin\'s beta chains is replaced by another. Why does one change matter?', 'It can change how the protein folds and sticks, and so how it works.', ['It doesn\'t; only the number of amino acids matters.', 'It removes the protein from the cell.', 'It changes every amino acid in the chain.'], 'Sequence decides shape, and shape decides job: one swap lets hemoglobin molecules clump into rods.'],
    ['Cooking an egg white turns it from clear to white and firm. What has changed in its proteins?', 'Their folded shape (they denatured); the amino acid sequence is the same.', ['The amino acid sequence was rewritten.', 'The proteins turned into fats.', 'Nothing changed; it is just hotter.'], 'Heat breaks the weak bonds that hold the fold, not the peptide bonds of the chain.'],
    ['Two proteins contain exactly the same amino acids in different orders. Will they have the same shape?', 'Probably not: the order decides how the chain folds.', ['Yes: the same parts always make the same shape.', 'Yes, if they are the same length.', 'Proteins have no particular shape.'], 'The sequence (primary structure) decides where the chain coils and folds.'],
    ['What decides what job a protein can do?', 'Its folded shape, which comes from its amino acid sequence', ['Only how many amino acids it has', 'Only which cell made it', 'The sugar it is attached to'], 'Shape decides job, and the sequence decides the shape.']
  ];
  G('hsbio.proteins', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var p = R.pick(PJOB), w = R.sample(PJOB.filter(function (x) { return x[1].split(':')[0] !== p[1].split(':')[0]; }), 3); return { q: 'What is the main job of ' + p[0] + '?', a: mc(p[1], w.map(function (x) { return x[1]; })), hint: 'Enzyme, structure, transport, signal, defense or movement?', steps: ['<b>' + cap(p[0]) + '</b>: ' + p[1].toLowerCase() + '.'] }; }
    if (L === 2) { if (R.coin()) { var t = R.pick(PTROUBLE); return { q: t[0], a: mc(t[1], t[2]), hint: 'Sequence → shape → job.', steps: [t[3]] }; } var lv2 = R.pick(PLEVEL); return { q: 'Which level of protein structure is ' + lv2[0] + '?', a: mcKeep(LEVELS, lv2[1]), viz: quiet('bi-molecule', { mode: 'protein', level: lv2[1] + 1 }), hint: 'Sequence, local coils and sheets, the whole fold, or several chains?', steps: ['Primary: sequence. Secondary: helices and sheets. Tertiary: the whole 3-D fold. Quaternary: several chains together.', 'So it is <b>' + LEVELS[lv2[1]].toLowerCase() + '</b> structure.'] }; }
    var shape = R.int(0, 1);
    if (shape === 0) { var n = R.int(20, 400); return { q: 'A protein chain has ' + n + ' amino acids. How many peptide bonds does it have?', a: num(n - 1), hint: 'How many links join ' + n + ' units in a row?', steps: ['A chain of $n$ units has $n - 1$ bonds between neighbors.', '$' + n + ' - 1 = ' + (n - 1) + '$ peptide bonds (and ' + (n - 1) + ' water molecules were released making it).'] }; }
    var k = R.int(2, 4), cnt = Math.pow(20, k);
    return { q: 'With 20 kinds of amino acids, how many different chains of exactly ' + k + ' amino acids are possible?', a: num(cnt), hint: 'Each position can be any of the 20.', steps: ['Each of the ' + k + ' positions has 20 choices.', '$20^{' + k + '} = ' + commas(cnt) + '$.', 'That is why proteins can be so varied: a chain of 100 has $20^{100}$ possibilities.'] };
  });

  /* ---- nucleic acids ---- */
  var NA = [['has the sugar deoxyribose', 'DNA'], ['has the sugar ribose', 'RNA'], ['contains the base thymine (T)', 'DNA'], ['contains the base uracil (U)', 'RNA'], ['is usually two strands wound into a double helix', 'DNA'], ['is usually a single strand', 'RNA'], ['stores genes long term in the nucleus', 'DNA'], ['carries a gene\'s message to the ribosomes', 'RNA']];
  var NA_SHARED = [['A phosphate group in each nucleotide', true], ['The bases adenine, guanine and cytosine', true], ['A sugar-phosphate backbone', true], ['The base thymine', false], ['The sugar ribose', false], ['Two strands in a double helix', false], ['Nucleotides as monomers', true], ['The base uracil', false]];
  G('hsbio.nucleic-acids', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var x = R.pick(NA); return { q: 'Which nucleic acid ' + x[0] + '?', a: mcKeep(['DNA', 'RNA', 'Both'], x[1] === 'DNA' ? 0 : 1), hint: 'DNA: deoxyribose, T, two strands. RNA: ribose, U, one strand.', steps: ['DNA has deoxyribose, thymine and two strands; RNA has ribose, uracil and one strand.', 'So the answer is <b>' + x[1] + '</b>.'] }; }
    if (L === 2) {
      var sel = chooseAll(R, NA_SHARED, 5);
      return { q: 'Which of these do <b>both</b> DNA and RNA have? Choose all that apply.', a: all(sel), hint: 'They share the nucleotide plan and three of the four bases.', steps: ['Both are chains of nucleotides (sugar, phosphate, base) with a sugar-phosphate backbone and the bases A, G and C.', 'Only DNA has thymine and (usually) two strands; only RNA has ribose and uracil.'] };
    }
    var bp = R.int(10, 500), shape = R.int(0, 2);
    if (shape === 0) return { q: 'A double-stranded DNA molecule is ' + bp + ' base pairs long. How many nucleotides does it contain?', a: num(2 * bp), hint: 'Each base pair is two nucleotides, one on each strand.', steps: ['$' + bp + ' \\times 2 = ' + 2 * bp + '$ nucleotides.'] };
    if (shape === 1) return { q: 'A single strand of RNA has ' + bp + ' nucleotides. How many phosphate groups does it have?', a: num(bp), hint: 'Each nucleotide has one phosphate.', steps: ['One phosphate per nucleotide: <b>' + bp + '</b>.'] };
    return { q: 'A DNA molecule has ' + 2 * bp + ' nucleotides in all. How many sugar molecules (deoxyribose) does it contain?', a: num(2 * bp), hint: 'Each nucleotide has one sugar.', steps: ['Each nucleotide has exactly one sugar, one phosphate and one base.', 'So there are <b>' + 2 * bp + '</b> deoxyribose sugars.'] };
  });

  /* ---- enzymes ---- */
  var ENZ1 = [
    ['What is the substrate of an enzyme?', 'The molecule the enzyme acts on', ['The enzyme\'s active site', 'The energy the enzyme supplies', 'The product of the reaction']],
    ['Where on an enzyme does the substrate bind?', 'The active site', ['The substrate site at the end of the chain', 'Anywhere on the surface', 'The nucleus']],
    ['How does an enzyme speed up a reaction?', 'It lowers the activation energy.', ['It adds energy to the reaction.', 'It raises the temperature of the cell.', 'It changes the products into new ones.']],
    ['Most enzymes are which kind of molecule?', 'Proteins', ['Lipids', 'Carbohydrates', 'Nucleic acids']],
    ['The enzyme lactase acts on which substrate?', 'Lactose', ['Lipids', 'Proteins', 'Starch']],
    ['The enzyme lipase acts on which substrate?', 'Lipids (fats)', ['Lactose', 'Proteins', 'DNA']],
    ['Why does each enzyme act on only one kind of substrate (or a few)?', 'Only molecules that fit the shape and chemistry of the active site can bind.', ['Enzymes are too small for other molecules.', 'Other molecules have no energy.', 'Each enzyme is used up after one reaction.']]
  ];
  var ENZ_TF = [
    ['An enzyme is used up in the reaction it speeds up.', false, 'The enzyme comes out unchanged and can work again and again.'],
    ['Enzymes supply the energy that makes a reaction happen.', false, 'Enzymes supply no energy; they lower the activation energy barrier.'],
    ['An enzyme does not change the overall energy released by a reaction.', true, 'The start and end energy levels are the same with or without the enzyme.'],
    ['One enzyme molecule can catalyze the same reaction many times.', true, 'It releases the products unchanged and binds a new substrate.'],
    ['An enzyme makes a reaction release more energy.', false, 'Only the peak (activation energy) changes; the energy released is the same.'],
    ['A competitive inhibitor blocks an enzyme by sitting in its active site.', true, 'It competes with the substrate for the active site.']
  ];
  G('hsbio.enzymes', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var it = R.pick(ENZ1); return { q: it[0], a: mc(it[1], it[2]), hint: 'Enzyme = protein catalyst; substrate = what it acts on; active site = where it binds.', steps: ['Enzymes are protein catalysts: the substrate binds the active site, and the enzyme lowers the activation energy.', 'So: <b>' + it[1] + '</b>'] }; }
    if (L === 2) return tfItem(R.pick(ENZ_TF), 'Look at the start and end of the energy diagram: does the enzyme move them?');
    var r0 = 10 * R.int(2, 8), p0 = r0 - 10 * R.int(1, Math.min(5, r0 / 10)), peak = r0 + 10 * R.int(6, 12), peakE = r0 + 10 * R.int(1, Math.floor((peak - r0) / 10) - 2);
    var Ea = peak - r0, EaE = peakE - r0, ask = R.int(0, 2), dE = r0 - p0;
    var qs = 'In an energy diagram, the reactants sit at ' + r0 + ' kJ and the products at ' + p0 + ' kJ. Without an enzyme, the peak is at ' + peak + ' kJ; with the enzyme it is at ' + peakE + ' kJ. ';
    var steps = ['Activation energy without the enzyme: $' + peak + ' - ' + r0 + ' = ' + Ea + '$ kJ.', 'With the enzyme: $' + peakE + ' - ' + r0 + ' = ' + EaE + '$ kJ.', 'Energy released: $' + r0 + ' - ' + p0 + ' = ' + dE + '$ kJ, the same with or without the enzyme.'];
    if (ask === 0) return { q: qs + 'What is the activation energy <b>with</b> the enzyme?', a: num(EaE), unit: 'kJ', hint: 'Activation energy = peak − reactants.', steps: steps };
    if (ask === 1) return { q: qs + 'By how much does the enzyme lower the activation energy?', a: num(Ea - EaE), unit: 'kJ', hint: 'Find both activation energies and subtract.', steps: steps.slice(0, 2).concat(['Lowered by $' + Ea + ' - ' + EaE + ' = ' + (Ea - EaE) + '$ kJ.']) };
    return { q: qs + 'How much energy does the reaction release <b>with</b> the enzyme?', a: num(dE), unit: 'kJ', hint: 'Does the enzyme change where the reaction starts or ends?', steps: steps.slice(2).concat(['The enzyme lowers only the peak, so the answer is <b>' + dE + ' kJ</b>, the same as without it.']) };
  });

  /* ---- temperature, pH and enzymes ---- */
  var ECOND = [
    ['A human enzyme is kept at 5 °C. What happens to its activity, and why?', 'It slows down because molecules move slowly, but the enzyme keeps its shape.', ['It denatures and is destroyed.', 'It dies.', 'It works faster than at 37 °C.']],
    ['A human enzyme is heated to 70 °C. What happens to it?', 'It denatures: its shape changes and the active site no longer fits the substrate.', ['It dies, because enzymes are alive.', 'It works faster than ever.', 'Nothing; enzymes are not affected by heat.']],
    ['Why does an enzyme\'s rate rise from 10 °C to 30 °C?', 'Molecules move faster and collide more often.', ['The enzyme is coming back to life.', 'The enzyme is denaturing.', 'Heat adds amino acids to the enzyme.']],
    ['A boiled enzyme is cooled back to 37 °C. Does it work again?', 'Usually not: the change in shape from denaturing stays.', ['Yes, it comes back to life.', 'Yes, cooling always undoes denaturing.', 'It works twice as fast.']],
    ['Which word describes what heat does to an enzyme?', 'Denatures', ['Kills', 'Digests', 'Reproduces']],
    ['Pepsin works in the stomach at pH 2. What happens to pepsin in the small intestine at pH 8?', 'It loses its working shape and stops working well.', ['It works faster, because 8 is more than 2.', 'It turns into trypsin.', 'Nothing; pH does not affect enzymes.']]
  ];
  G('hsbio.enzyme-conditions', function (R, ctx) {
    var L = lv(ctx), Ez = B().ENZYMES;
    if (L === 1) {
      var opt = R.pick([30, 35, 40, 45, 50, 60, 70]), xs = [10, 20, 30, 40, 50, 60, 70, 80];
      if (xs.indexOf(opt) < 0) opt = Math.round(opt / 10) * 10;
      var top = R.int(30, 80), ys = xs.map(function (x) { return Math.round(top * B().activity(x, opt, 16, 'temp')); }), best = xs[ys.indexOf(Math.max.apply(null, ys))];
      return { q: 'The graph shows an enzyme\'s activity at different temperatures. What is its optimal temperature?', viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Activity', values: ys }], xlabel: 'Temperature (°C)', ylabel: 'Activity', quiet: true, interactive: false } }, a: num(best), unit: '°C',
        hint: 'The optimum is where the line peaks.', steps: ['Find the highest point of the curve: it is above ' + best + ' °C.', 'So the optimal temperature is <b>' + best + ' °C</b>.' + (best > 45 ? ' (Not every enzyme comes from a human: bacteria from hot springs have enzymes that work at far higher temperatures.)' : '')] };
    }
    if (L === 2) { var it = R.pick(ECOND); return { q: it[0], a: mc(it[1], it[2]), hint: 'Enzymes are molecules, not living things. Heat changes their shape; cold slows them down.', steps: ['Cold slows molecules down; the enzyme keeps its shape. Past the optimum, heat breaks the weak bonds that hold the shape, and the enzyme denatures.', 'So: <b>' + it[1] + '</b>'] }; }
    var keys = ['pepsin', 'amylase', 'trypsin'], ph = R.pick([1.5, 2, 2.5, 3, 6.5, 7, 8, 8.5, 9]), best2 = keys.reduce(function (b, k) { return Math.abs(Ez[k].pH - ph) < Math.abs(Ez[b].pH - ph) ? k : b; }, keys[0]);
    if (R.coin()) return { q: 'Pepsin works best near pH 2, salivary amylase near pH 7, and trypsin near pH 8. Which would work best in a solution at pH ' + ph + '?', a: mc(cap(Ez[best2].name), keys.filter(function (k) { return k !== best2; }).map(function (k) { return cap(Ez[k].name); })), viz: quiet('bi-enzyme', { mode: 'ph', enzymes: keys }),
      hint: 'Which optimum is closest to pH ' + ph + '?', steps: ['Compare the optima with pH ' + ph + ': pepsin 2, amylase 7, trypsin 8.', 'The closest is <b>' + Ez[best2].name + '</b> (optimum ' + Ez[best2].pH + ').'] };
    var k2 = R.pick(keys), e = Ez[k2];
    return { q: cap(e.name) + ' works in the ' + e.where + '. Near which pH does it work best?', a: mc('About ' + e.pH, keys.filter(function (k) { return Ez[k].pH !== e.pH; }).map(function (k) { return 'About ' + Ez[k].pH; }).concat(['About 12'])), hint: 'An enzyme\'s optimum matches the place it works.', steps: ['The ' + e.where + ' has a pH near ' + e.pH + ' (' + (e.pH < 7 ? 'acidic' : e.pH === 7 ? 'about neutral' : 'slightly basic') + ').', cap(e.name) + ' works best at <b>about pH ' + e.pH + '</b>.'] };
  });

  /* ================= Unit 3: Cell Structure ================= */
  var PE_FEAT = [['a nucleus', 'e'], ['ribosomes', 'b'], ['DNA', 'b'], ['a cell membrane', 'b'], ['cytoplasm', 'b'], ['mitochondria', 'e'], ['a Golgi apparatus', 'e'], ['an endoplasmic reticulum', 'e'], ['a nucleoid region (DNA not enclosed by a membrane)', 'p'], ['several linear chromosomes inside a nuclear envelope', 'e'], ['plasmids (small rings of DNA) in most cells', 'p'], ['membrane-bound organelles', 'e']];
  var PE_ORG = [['a bacterium such as E. coli', 'p'], ['an archaeon living in a hot spring', 'p'], ['a yeast cell', 'e'], ['a cell from an oak leaf', 'e'], ['an amoeba', 'e'], ['a human skin cell', 'e'], ['a cyanobacterium', 'p'], ['a mushroom cell', 'e'], ['a paramecium', 'e'], ['a bacterium that lives in yogurt', 'p']];
  var PE_TF = [
    ['Prokaryotic cells have no DNA because they have no nucleus.', false, 'Their DNA lies in the cytoplasm, in a region called the nucleoid.'],
    ['Prokaryotic cells have ribosomes.', true, 'Every cell has ribosomes; without them it could not make proteins.'],
    ['A cell wall shows that a cell is a plant cell.', false, 'Most bacteria and all fungi have cell walls too, made of different materials.'],
    ['Bacteria and archaea are both prokaryotes.', true, 'Neither has a nucleus or membrane-bound organelles.'],
    ['Prokaryotic cells are usually much smaller than eukaryotic cells.', true, 'About 1–5 µm against about 10–100 µm.'],
    ['Prokaryotes have mitochondria, which are smaller than those of eukaryotes.', false, 'Prokaryotes have no membrane-bound organelles at all; they carry out respiration on their cell membrane.']
  ];
  G('hsbio.prokaryotes-eukaryotes', function (R, ctx) {
    var L = lv(ctx), K = { p: 'Prokaryotic cells only', e: 'Eukaryotic cells only', b: 'Both' };
    if (L === 1) {
      if (R.coin()) { var o = R.pick(PE_ORG); return { q: 'Is ' + o[0] + ' a prokaryotic or a eukaryotic cell?', a: mcKeep(['Prokaryotic', 'Eukaryotic'], o[1] === 'p' ? 0 : 1), hint: 'Bacteria and archaea are prokaryotes; animals, plants, fungi and protists are eukaryotes.', steps: [o[1] === 'p' ? 'Bacteria (including cyanobacteria) and archaea have no nucleus.' : 'Animals, plants, fungi (including yeast and mushrooms) and protists (such as amoebas and paramecia) have a nucleus.', 'So it is <b>' + (o[1] === 'p' ? 'prokaryotic' : 'eukaryotic') + '</b>.'] }; }
      var f = R.pick(PE_FEAT.filter(function (x) { return x[1] !== 'b'; }));
      return { q: 'Which cells have ' + f[0] + '?', a: mcKeep([K.p, K.e, K.b], f[1] === 'p' ? 0 : f[1] === 'e' ? 1 : 2), hint: 'Only eukaryotes have a nucleus and membrane-bound organelles; all cells share a few basics.', steps: [f[1] === 'p' ? 'This is a prokaryote feature: DNA lies in the cytoplasm, often with plasmids.' : 'This needs a nucleus or membrane-bound organelles, which only eukaryotes have.', 'Answer: <b>' + (f[1] === 'p' ? K.p : K.e).toLowerCase() + '</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) { var f2 = R.pick(PE_FEAT.filter(function (x) { return x[1] === 'b'; })); return { q: 'Which cells have ' + f2[0] + '?', a: mcKeep([K.p, K.e, K.b], 2), viz: quiet('bi-cell', { type: 'bacterium' }), hint: 'What does every living cell need?', steps: ['Every cell has a membrane, cytoplasm, ribosomes and DNA.', 'So <b>both</b> kinds of cell have ' + f2[0] + '.'] }; }
      return tfItem(R.pick(PE_TF), 'No nucleus does not mean no DNA.');
    }
    if (R.coin()) {
      var pool = [['A cell membrane', true], ['Ribosomes', true], ['DNA', true], ['Cytoplasm', true], ['A nucleus', false], ['Mitochondria', false], ['A cell wall', false], ['Chloroplasts', false]], sel = chooseAll(R, pool, 5);
      return { q: 'Which of these do <b>all</b> cells have, from bacteria to people? Choose all that apply.', a: all(sel), hint: 'Four things are found in every cell.', steps: ['All cells have a cell membrane, cytoplasm, ribosomes and DNA.', 'A nucleus and mitochondria are eukaryote features; cell walls and chloroplasts are found only in some cells.'] };
    }
    var big = R.pick([10, 20, 30, 40, 50, 60, 80, 100]), small = R.pick([1, 2, 4, 5].filter(function (s) { return big % s === 0; }));
    return { q: 'A eukaryotic cell is ' + big + ' µm across and a bacterium is ' + small + ' µm long. How many bacteria would fit end to end across the eukaryotic cell?', a: num(big / small), hint: 'Divide the larger length by the smaller.', steps: ['$' + big + ' \\div ' + small + ' = ' + (big / small) + '$.', 'About <b>' + (big / small) + '</b> bacteria.'] };
  });

  /* ---- the endomembrane system ---- */
  var EM_PATH = ['Rough ER', 'Golgi apparatus', 'Secretory vesicle', 'Cell membrane'];
  var EM_JOB = [['builds proteins', 'Ribosomes'], ['folds new proteins made for export and sends them on in vesicles', 'Rough endoplasmic reticulum'], ['modifies, tags and sorts proteins, then ships them in vesicles', 'Golgi apparatus'], ['makes lipids, with no ribosomes on its surface', 'Smooth endoplasmic reticulum'], ['holds the DNA with the instructions for each protein', 'Nucleus'], ['is a vesicle full of digestive enzymes, made by the Golgi', 'Lysosome'], ['fuses with the cell membrane to release its contents outside', 'Secretory vesicle']];
  var EM_NAMES = ['Ribosomes', 'Rough endoplasmic reticulum', 'Golgi apparatus', 'Smooth endoplasmic reticulum', 'Nucleus', 'Lysosome', 'Secretory vesicle', 'Mitochondrion'];
  var EXPORTS = ['a digestive enzyme from a pancreas cell', 'an antibody from a white blood cell', 'mucus from a cell in the lining of the nose', 'insulin from a pancreas cell', 'a milk protein from a cow\'s milk-gland cell', 'collagen from a skin cell'];
  G('hsbio.endomembrane', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var j = R.pick(EM_JOB); return { q: 'Which part of the cell ' + j[0] + '?', a: mc(j[1], R.sample(EM_NAMES.filter(function (x) { return x !== j[1]; }), 3)), viz: quiet('bi-cell', { type: 'animal' }), hint: 'Nucleus: instructions. Ribosomes: building. ER and Golgi: folding, tagging, shipping.', steps: ['The <b>' + j[1].toLowerCase() + '</b> ' + j[0] + '.'] }; }
    if (L === 2) {
      var ex = R.pick(EXPORTS), right = 'Rough ER → Golgi apparatus → vesicle → cell membrane';
      return { q: 'Which path does ' + ex + ' follow after the ribosome starts building it?', a: mc(right, ['Nucleus → Golgi apparatus → rough ER → cell membrane', 'Golgi apparatus → rough ER → vesicle → cell membrane', 'Rough ER → nucleus → Golgi apparatus → cell membrane', 'Smooth ER → lysosome → vesicle → cell membrane']), hint: 'Which comes first, the ER or the Golgi? And does the protein go back to the nucleus?',
        steps: ['Ribosomes on the rough ER build the protein into the ER, which folds it.', 'A vesicle carries it to the Golgi, which modifies and sorts it.', 'A secretory vesicle carries it to the membrane and releases it: <b>' + right + '</b>.'] };
    }
    // pulse-chase data: where is the label at each time?
    var t = [3, 20, 120].map(function (x, i) { return x + R.int(0, 2) * [1, 5, 20][i]; }), ask = R.int(0, 2), places = ['rough ER', 'Golgi apparatus', 'secretory vesicles near the membrane'];
    if (R.coin()) {
      var order = R.shuffle([0, 1, 2]), letters = ['A', 'B', 'C'], lab = order.map(function (i, k) { return letters[k] + ': ' + places[i]; }), right2 = [0, 1, 2].map(function (i) { return letters[order.indexOf(i)]; }).join('');
      var wrongs = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'].filter(function (x) { return x !== right2; });
      return { q: 'Pancreas cells are given radioactive amino acids for 3 minutes, then ordinary ones. Where does the radioactive label appear, from first to last?<br>' + lab.join('<br>'), a: mc(right2, R.sample(wrongs, 3)), hint: 'Proteins are built at the rough ER, then shipped.', steps: ['The label first appears in proteins being built on the rough ER.', 'It then moves to the Golgi apparatus, then to secretory vesicles.', 'In letters: <b>' + right2 + '</b>.'] };
    }
    return { q: 'Pancreas cells are given radioactive amino acids for 3 minutes, then ordinary ones. Samples are taken at ' + t[0] + ', ' + t[1] + ' and ' + t[2] + ' minutes. Where is most of the label at ' + t[ask] + ' minutes?', a: mc(cap(places[ask]), places.filter(function (x, i) { return i !== ask; }).map(cap).concat(['Nucleus'])), hint: 'The label moves along the export path over time.', steps: ['The path is rough ER → Golgi → secretory vesicles → outside.', 'The earliest sample shows the rough ER, the middle one the Golgi, the latest one secretory vesicles.', 'At ' + t[ask] + ' minutes: <b>' + places[ask] + '</b>.'] };
  });

  /* ---- endosymbiosis ---- */
  var ES_EV = [
    ['Mitochondria have their own small, circular DNA.', true], ['Chloroplasts have ribosomes like those of bacteria.', true], ['Mitochondria are surrounded by two membranes.', true], ['Chloroplasts divide by splitting in two, like bacteria.', true], ['Chloroplast genes are most similar to the genes of cyanobacteria.', true], ['Mitochondrial genes are most similar to those of a group of bacteria called alphaproteobacteria.', true],
    ['Mitochondria are found in muscle cells.', false], ['Chloroplasts are green.', false], ['Chloroplasts are found in leaves.', false], ['Mitochondria release energy from food.', false], ['Cells have many mitochondria.', false]
  ];
  var ES_TR = [
    ['Mitochondria came from which kind of ancient cell?', 'Bacteria that used oxygen (relatives of today\'s alphaproteobacteria)', ['Chloroplasts', 'Viruses', 'Cyanobacteria']],
    ['Chloroplasts came from which kind of ancient cell?', 'Cyanobacteria, which photosynthesize', ['Mitochondria', 'Viruses', 'Archaea that used oxygen']],
    ['Which came first in the history of eukaryotic cells?', 'Mitochondria; chloroplasts were taken in later by a cell that already had mitochondria', ['Chloroplasts; mitochondria later evolved from them', 'Both at the same moment, from one bacterium', 'Neither: both were built from the cell membrane']],
    ['Why do scientists think mitochondria were taken in before chloroplasts?', 'Almost all eukaryotes have mitochondria (or traces of them), but only plants and algae have chloroplasts.', ['Chloroplasts are bigger.', 'Mitochondria are found in the nucleus.', 'Chloroplasts have no DNA.']],
    ['Is the endosymbiosis theory a guess?', 'No: several independent lines of evidence support it.', ['Yes: there is no evidence either way.', 'Yes, until it is proved and becomes a law.', 'No, because mitochondria are still free-living bacteria.']]
  ];
  G('hsbio.endosymbiosis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var right = R.pick(ES_EV.filter(function (x) { return x[1]; })), wrong = R.sample(ES_EV.filter(function (x) { return !x[1]; }), 3);
      return { q: 'Which observation is evidence that mitochondria and chloroplasts descend from bacteria?', a: mc(right[0], wrong.map(function (x) { return x[0]; })), hint: 'Look for a feature that bacteria also have.', steps: ['Evidence for a bacterial origin is a bacterial feature: circular DNA, bacterial ribosomes, two membranes, division by splitting, or bacterial gene sequences.', 'So: <b>' + right[0] + '</b>', 'What an organelle does or where it is found does not tell us where it came from.'] };
    }
    if (L === 2) { var t = R.pick(ES_TR); return { q: t[0], a: mc(t[1], t[2]), viz: quiet('bi-tree', { tree: [['E. coli', ['Alphaproteobacteria', 'Mitochondria']], ['Other cyanobacteria', 'Chloroplasts']], traits: false }), hint: 'Two separate events, from two different kinds of bacteria.', steps: ['Mitochondria came from oxygen-using bacteria (alphaproteobacteria); chloroplasts later came from cyanobacteria.', 'So: <b>' + t[1] + '</b>'] }; }
    var sel = chooseAll(R, ES_EV.map(function (x) { return x; }), 5);
    return { q: 'Which of these are evidence that mitochondria or chloroplasts were once free-living bacteria? Choose all that apply.', a: all(sel), hint: 'Evidence about ancestry is a feature shared with bacteria.', steps: sel.map(function (x) { return (x[1] ? 'Evidence: ' : 'Not evidence of ancestry: ') + x[0]; }) };
  });

  /* ================= Unit 4: Membranes and Transport ================= */
  var MEM_PART = [
    ['forms the basic double-layered sheet of the membrane', 'Phospholipids'], ['spans the membrane and lets certain ions through', 'Channel proteins'], ['sits between the phospholipid tails in animal cells and keeps the membrane from getting too fluid or too stiff', 'Cholesterol'],
    ['is attached to proteins on the outside surface and acts as an ID tag', 'Carbohydrate chains'], ['uses ATP to move ions against their gradient', 'Pump proteins'], ['binds a signal molecule such as a hormone', 'Receptor proteins']
  ];
  var MEM_NAMES = ['Phospholipids', 'Channel proteins', 'Cholesterol', 'Carbohydrate chains', 'Pump proteins', 'Receptor proteins', 'Ribosomes', 'Cellulose'];
  var CROSS = [['oxygen (O₂)', true, 'small and nonpolar'], ['carbon dioxide (CO₂)', true, 'small and nonpolar'], ['nitrogen gas (N₂)', true, 'small and nonpolar'], ['a sodium ion (Na⁺)', false, 'charged'], ['a potassium ion (K⁺)', false, 'charged'], ['a chloride ion (Cl⁻)', false, 'charged'], ['glucose', false, 'large and polar'], ['an amino acid', false, 'polar or charged'], ['a protein', false, 'very large'], ['steroid hormones such as cortisol', true, 'lipids, which dissolve in the bilayer']];
  var MEM_TF = [
    ['The membrane is a rigid wall with holes in it.', false, 'It is fluid: lipids and many proteins drift sideways, and small nonpolar molecules pass through the lipid layer itself.'],
    ['Phospholipid heads face the water on both sides of the membrane.', true, 'The heads are hydrophilic; the tails hide in the middle.'],
    ['Phospholipid tails face the cytoplasm.', false, 'The cytoplasm is mostly water, so the tails point into the middle of the bilayer, away from it.'],
    ['Proteins in the membrane can drift sideways within it.', true, 'That is the "fluid" part of the fluid mosaic model.'],
    ['Oxygen must pass through a protein channel to enter a cell.', false, 'Oxygen is small and nonpolar, so it diffuses straight through the lipid bilayer.'],
    ['Ions such as Na⁺ cannot cross the lipid bilayer without a protein.', true, 'Their charge keeps them out of the oily middle.']
  ];
  G('hsbio.membrane-structure', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var p = R.pick(MEM_PART); return { q: 'Which part of the membrane ' + p[0] + '?', a: mc(p[1], R.sample(MEM_NAMES.filter(function (x) { return x !== p[1]; }), 3)), viz: quiet('bi-membrane', { mode: 'bilayer' }), hint: 'Lipids make the sheet; proteins do the moving and signaling; carbohydrates label.', steps: ['<b>' + p[1] + '</b>: ' + p[0] + '.'] }; }
    if (L === 2) {
      if (R.coin()) return tfItem(R.pick(MEM_TF), 'Think of a thin film of oil, not a wall.');
      var c = R.pick(CROSS);
      return { q: 'Can ' + c[0] + ' cross the lipid bilayer directly, without a protein?', a: mcKeep(['Yes', 'No'], c[1] ? 0 : 1), hint: 'The middle of the membrane is oily. What dissolves in oil?', steps: [cap(c[0]) + ' is ' + c[2] + '.', c[1] ? 'It dissolves in the oily middle, so it <b>crosses directly</b>.' : 'It cannot pass the oily middle, so it needs a channel or carrier protein: <b>no</b>.'] };
    }
    var sel = R.sample(CROSS, 5); if (sel.every(function (x) { return x[1]; }) || sel.every(function (x) { return !x[1]; })) sel = [CROSS[0], CROSS[3], CROSS[6], CROSS[1], CROSS[8]];
    return { q: 'Which of these can cross a cell membrane directly through the lipid bilayer? Choose all that apply.', a: all(sel.map(function (x) { return [cap(x[0]), x[1]]; })), hint: 'Small, nonpolar or lipid: crosses. Charged, polar and large: needs a protein.', steps: sel.map(function (x) { return cap(x[0]) + ' is ' + x[2] + ': ' + (x[1] ? 'crosses directly.' : 'needs a protein.'); }) };
  });

  /* ---- diffusion ---- */
  G('hsbio.diffusion', function (R, ctx) {
    var L = lv(ctx), mol = R.pick(['oxygen', 'carbon dioxide', 'dye', 'perfume']);
    if (L === 1) {
      var a = R.int(12, 40), b = R.int(2, a - 6), left = R.coin(), l = left ? a : b, r = left ? b : a;
      return { q: 'A membrane that ' + mol + ' can cross has ' + l + ' ' + mol + ' particles on the left side and ' + r + ' on the right. Which way is the <b>net</b> movement?', a: mcKeep(['Left to right', 'Right to left', 'No net movement'], l > r ? 0 : 1), viz: quiet('bi-membrane', { mode: 'diffusion', left: Math.min(l, 40), right: Math.min(r, 40), settled: false }),
        hint: 'Net diffusion goes from higher to lower concentration.', steps: ['The ' + (l > r ? 'left' : 'right') + ' side has more particles (' + Math.max(l, r) + ' against ' + Math.min(l, r) + ').', 'Net movement is down the gradient: <b>' + (l > r ? 'left to right' : 'right to left') + '</b>.'] };
    }
    if (L === 2) {
      var it = R.pick([
        ['A drop of dye has spread evenly through a glass of water. What are the dye molecules doing now?', 'Still moving in all directions, with no net change', ['They have stopped moving.', 'They are all moving toward the bottom.', 'They are moving back to where the drop started.'], 'At equilibrium particles keep moving randomly; equal numbers go each way, so nothing changes overall.'],
        ['At dynamic equilibrium, oxygen molecules cross a membrane how?', 'Both ways, at equal rates', ['Not at all', 'Only one way', 'Only through pumps'], 'Particles keep crossing both ways; the two rates are equal.'],
        ['Why does net diffusion stop when the two sides are equal?', 'Just as many particles cross each way, so the totals stay the same.', ['The particles run out of energy.', 'The membrane closes.', 'The cell switches off its pumps.'], 'Movement continues; only the net change stops.'],
        ['Does diffusion need energy from the cell?', 'No: the random motion of particles drives it.', ['Yes: it needs ATP.', 'Only when the gradient is steep.', 'Only in plant cells.'], 'Diffusion is passive: particles move by their own random motion.']]);
      return { q: it[0], a: mc(it[1], it[2]), viz: quiet('bi-membrane', { mode: 'diffusion', left: 18, right: 18, settled: true }), hint: 'Do the particles ever stop moving?', steps: [it[3], 'So: <b>' + it[1] + '</b>'] };
    }
    if (R.coin()) {
      var a3 = R.int(10, 30) * 2, b3 = R.int(1, a3 / 2 - 2) * 2, eq = (a3 + b3) / 2, moved = a3 - eq;
      return { q: 'A membrane separates ' + a3 + ' ' + mol + ' particles on one side from ' + b3 + ' on the other (equal volumes). At equilibrium, what is the net number of particles that have moved across?', a: num(moved), hint: 'At equilibrium each side has half the total.', steps: ['Total: $' + a3 + ' + ' + b3 + ' = ' + (a3 + b3) + '$; each side at equilibrium: $' + (a3 + b3) + ' \\div 2 = ' + eq + '$.', 'The crowded side drops from ' + a3 + ' to ' + eq + ': a net <b>' + moved + '</b> particles moved.'] };
    }
    var f = R.pick([
      ['Which change makes oxygen diffuse into a cell faster?', 'A bigger difference in oxygen concentration across the membrane', ['A smaller difference in concentration', 'A thicker membrane', 'A lower temperature']],
      ['Which change slows diffusion?', 'Lowering the temperature', ['Raising the temperature', 'Making the concentration difference bigger', 'Shortening the distance']],
      ['Why are the walls of the tiny air sacs in the lungs only one cell thick?', 'A shorter distance lets gases diffuse across faster.', ['Thin walls pump oxygen in.', 'Thick walls would let in too much oxygen.', 'Diffusion only works through one cell.']],
      ['Which diffuses fastest, all else equal?', 'A small molecule at a high temperature', ['A large molecule at a low temperature', 'A small molecule at a low temperature', 'A large molecule at a high temperature']],
      ['A cell keeps using oxygen. Why does oxygen keep diffusing in?', 'The cell keeps the oxygen concentration inside low, so the gradient stays.', ['Pumps push oxygen in.', 'Oxygen is attracted to the nucleus.', 'Diffusion never reaches equilibrium.']]]);
    return { q: f[0], a: mc(f[1], f[2]), hint: 'Steeper gradients, higher temperatures, smaller particles and shorter distances all speed diffusion.', steps: ['Diffusion is faster with a steeper gradient, a higher temperature, smaller particles and a shorter distance.', 'So: <b>' + f[1] + '</b>'] };
  });

  /* ---- osmosis and tonicity ---- */
  var TON = ['Hypotonic', 'Isotonic', 'Hypertonic'];
  G('hsbio.osmosis-tonicity', function (R, ctx) {
    var L = lv(ctx), cell = R.pick(['red blood cell', 'animal cell', 'plant cell', 'onion cell', 'cheek cell']), plant = /plant|onion/.test(cell);
    var inside = plant ? R.pick([1, 1.5, 2]) : 0.9, outside = R.pick([0, 0.5, 0.2, inside, inside, 3, 5, 10, 2 * inside]), kind = outside < inside ? 0 : outside === inside ? 1 : 2;
    if (L === 1) return { q: 'A ' + cell + ' contains ' + inside + '% solute. It is placed in a solution with ' + outside + '% solute. Is the solution hypotonic, isotonic or hypertonic to the cell?', a: mcKeep(TON, kind), hint: 'Compare the solution outside with the cell: more, less or the same solute?',
      steps: ['Outside ' + outside + '%, inside ' + inside + '%.', ['The solution has less solute: <b>hypotonic</b>.', 'They are equal: <b>isotonic</b>.', 'The solution has more solute: <b>hypertonic</b>.'][kind]] };
    if (L === 2) {
      var res = plant ? ['It gains water and becomes firm (turgid); the wall keeps it from bursting.', 'No net change; it stays limp (flaccid).', 'It loses water and its membrane pulls away from the wall (plasmolysis).'] : ['It gains water, swells and may burst.', 'No net change in its size.', 'It loses water and shrivels.'];
      var wrongs = res.filter(function (x, i) { return i !== kind; }).concat(plant ? ['Salt moves into the cell until it bursts.'] : ['Salt moves out of the cell, and it shrinks.']);
      return { q: 'A ' + cell + ' (' + inside + '% solute) is placed in a solution with ' + outside + '% solute. What happens to it?', a: mc(res[kind], wrongs), viz: quiet('bi-membrane', { mode: 'tonicity', solution: ['hypo', 'iso', 'hyper'][kind], cell: plant ? 'plant' : 'animal' }),
        hint: 'Water moves toward the side with more solute. The solute stays put.', steps: ['The solution is ' + TON[kind].toLowerCase() + ' to the cell (' + outside + '% outside, ' + inside + '% inside).', ['Water moves into the cell, toward its extra solute.', 'Water moves both ways equally.', 'Water moves out, toward the extra solute outside.'][kind], '<b>' + res[kind] + '</b>'] };
    }
    if (R.coin()) {
      var m0 = R.pick([2.0, 2.4, 2.5, 3.0, 4.0, 5.0]), pc = R.pick([-20, -15, -10, -8, -5, 5, 8, 10, 12, 15, 20]), m1 = fix(m0 * (1 + pc / 100), 4);
      return { q: 'A potato cube weighs ' + m0.toFixed(1) + ' g. After an hour in a sugar solution it weighs ' + m1 + ' g. What is the percent change in mass? (Negative for a loss.) Was the solution hypotonic or hypertonic to the potato cells?',
        a: { t: 'multi', parts: [{ label: 'Percent change', a: num(pc, { pct: true, rtol: 0.01 }) }, { label: 'The solution was', a: mcKeep(['Hypotonic', 'Hypertonic'], pc > 0 ? 0 : 1) }] },
        hint: 'Percent change = (final − initial) ÷ initial × 100. Gaining mass means water went in.', steps: ['Change: $' + m1 + ' - ' + m0 + ' = ' + fix(m1 - m0, 4) + '$ g.', '$' + fix(m1 - m0, 4) + ' \\div ' + m0 + ' \\times 100 = ' + pc + '\\%$.', pc > 0 ? 'The cube gained water, so the solution had less solute than the cells: <b>hypotonic</b>.' : 'The cube lost water, so the solution had more solute than the cells: <b>hypertonic</b>.'] };
    }
    // find the isotonic concentration from two data points either side of zero
    var c1 = R.pick([0.1, 0.2]), c2 = fix(c1 + R.pick([0.2, 0.3]), 2), g1 = R.int(3, 12), g2 = -R.int(3, 12), c0 = fix(c1 + (c2 - c1) * g1 / (g1 - g2), 4);
    return { q: 'Potato cubes change mass by ' + (g1 > 0 ? '+' : '') + g1 + '% in ' + c1 + ' M sugar and by ' + g2 + '% in ' + c2 + ' M sugar. Assuming a straight line between these points, at what concentration would the mass not change (the isotonic point)?',
      viz: { name: 'bi-chart', opts: { kind: 'line', x: [c1, c2], series: [{ name: 'Mass change (%)', values: [g1, g2] }], xlabel: 'Sugar (M)', ylabel: 'Mass change (%)', quiet: true, interactive: false } },
      a: num(c0, { rtol: 0.03 }), unit: 'M', hint: 'Zero lies between the two points. What fraction of the way from the first point is it?', steps: ['The change goes from +' + g1 + '% to ' + g2 + '%, a drop of ' + (g1 - g2) + ' points over $' + c2 + ' - ' + c1 + ' = ' + fix(c2 - c1, 2) + '$ M.', 'Zero is $\\frac{' + g1 + '}{' + (g1 - g2) + '}$ of the way along.', '$' + c1 + ' + \\frac{' + g1 + '}{' + (g1 - g2) + '} \\times ' + fix(c2 - c1, 2) + ' \\approx ' + fix(c0, 3) + '$ M.'] };
  });

  /* ---- channels, carriers and pumps ---- */
  var TRANS = [
    ['Oxygen diffuses from the blood into a muscle cell, through the lipid bilayer.', 0], ['Carbon dioxide leaves a cell through the lipid bilayer.', 0],
    ['Glucose enters a red blood cell through a carrier protein, from higher to lower concentration.', 1], ['Potassium ions flow out of a nerve cell through open channels, down their gradient.', 1], ['Water rushes into a cell through aquaporin channels.', 1], ['Chloride ions pass through a channel protein from where they are crowded to where they are scarce.', 1],
    ['The sodium-potassium pump moves Na⁺ out of a cell that already has less Na⁺ inside.', 2], ['Root cells take in minerals from soil water that has a lower concentration of them than the cells.', 2], ['Cells lining the stomach pump H⁺ into the stomach, where H⁺ is already far more concentrated.', 2], ['A protein uses ATP to move calcium ions out of a muscle cell\'s cytoplasm into storage.', 2]
  ];
  var TKIND = ['Simple diffusion', 'Facilitated diffusion', 'Active transport'];
  G('hsbio.channels-pumps', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var t = R.pick(TRANS); return { q: t[0] + '<br>Which kind of transport is this?', a: mcKeep(TKIND, t[1]), hint: 'Down or up the gradient? Through the bilayer or through a protein?', steps: [['Down the gradient, straight through the bilayer, no protein: <b>simple diffusion</b>.', 'Down the gradient through a channel or carrier, no energy: <b>facilitated diffusion</b>.', 'Against the gradient, using energy: <b>active transport</b>.'][t[1]]] }; }
    if (L === 2) {
      var it = R.pick([
        ['Glucose moves through a carrier protein from high to low concentration. Does the cell spend ATP?', 'No: it is facilitated diffusion, driven by the gradient.', ['Yes: every protein uses ATP.', 'Yes: carriers always need energy.', 'Only if the cell is large.']],
        ['Which transport needs energy from the cell?', 'Moving a substance against its concentration gradient', ['Any transport through a protein', 'Facilitated diffusion through a channel', 'Osmosis through aquaporins']],
        ['Ions flow through a channel protein down their gradient. What kind of transport is this?', 'Passive transport (facilitated diffusion)', ['Active transport, because a protein is used', 'Endocytosis', 'Simple diffusion through the lipids']],
        ['What decides whether transport is active or passive?', 'Whether the substance moves against its gradient (active) or down it (passive)', ['Whether a protein is involved', 'The size of the cell', 'Whether the substance is a gas']]]);
      return { q: it[0], a: mc(it[1], it[2]), viz: quiet('bi-membrane', { mode: R.coin() ? 'facilitated' : 'active' }), hint: 'A protein does not mean energy. Direction decides.', steps: ['Facilitated diffusion uses proteins but no energy; only moving against the gradient costs ATP.', 'So: <b>' + it[1] + '</b>'] };
    }
    var atp = R.int(2, 60) * 10, ask = R.int(0, 2);
    if (ask === 0) return { q: 'Each cycle of the sodium-potassium pump uses 1 ATP to move 3 Na⁺ out and 2 K⁺ in. If a cell\'s pumps use ' + commas(atp) + ' ATP, how many Na⁺ ions do they move out?', a: num(3 * atp), hint: '3 Na⁺ per ATP.', steps: ['$' + commas(atp) + ' \\times 3 = ' + commas(3 * atp) + '$ Na⁺ out.'] };
    if (ask === 1) { var k = R.int(10, 200) * 2; return { q: 'The sodium-potassium pump moves 3 Na⁺ out and 2 K⁺ in for each ATP. How many ATP does it take to bring ' + commas(k) + ' K⁺ ions into a cell?', a: num(k / 2), hint: '2 K⁺ per ATP.', steps: ['$' + commas(k) + ' \\div 2 = ' + commas(k / 2) + '$ ATP.', '(Those cycles also move $' + commas(3 * k / 2) + '$ Na⁺ out.)'] }; }
    return { q: 'The sodium-potassium pump moves 3 Na⁺ out and 2 K⁺ in for each ATP. After ' + commas(atp) + ' cycles, by how many positive charges has the inside of the cell changed? (Use a negative number for a loss.)', a: num(-atp), hint: 'Compare the charges going out with those coming in each cycle.', steps: ['Each cycle: 3 positive charges out, 2 in, a net loss of 1.', '$' + commas(atp) + ' \\times (-1) = ' + (-atp) + '$.', 'The inside becomes more negative; this helps give cells their membrane voltage.'] };
  });

  /* ---- endocytosis and exocytosis ---- */
  var BULK = [
    ['A white blood cell wraps its membrane around a bacterium and takes it in.', 'Phagocytosis (endocytosis)'], ['An amoeba surrounds a smaller protist and takes it inside a food vacuole.', 'Phagocytosis (endocytosis)'],
    ['A cell takes in small droplets of the fluid around it in tiny vesicles.', 'Pinocytosis (endocytosis)'], ['Receptors on a liver cell catch cholesterol-carrying particles, and that patch of membrane folds in.', 'Receptor-mediated endocytosis'],
    ['A pancreas cell releases insulin from vesicles that fuse with its membrane.', 'Exocytosis'], ['A nerve cell releases signal molecules into the gap next to another cell.', 'Exocytosis'], ['A cell in the lining of the nose releases mucus.', 'Exocytosis'], ['A plant cell sends cell-wall material out of the cell in vesicles from the Golgi.', 'Exocytosis']
  ];
  var BNAMES = ['Phagocytosis (endocytosis)', 'Pinocytosis (endocytosis)', 'Receptor-mediated endocytosis', 'Exocytosis', 'Facilitated diffusion', 'Osmosis'];
  G('hsbio.bulk-transport', function (R, ctx) {
    var L = lv(ctx), b = R.pick(BULK), out = b[1] === 'Exocytosis';
    if (L === 1) return { q: b[0] + '<br>Is this endocytosis or exocytosis?', a: mcKeep(['Endocytosis', 'Exocytosis'], out ? 1 : 0), hint: 'Endo = in; exo = out. Where does the cargo start?', steps: [out ? 'The cargo starts inside the cell and ends up outside.' : 'The cargo starts outside the cell and ends up inside.', 'So it is <b>' + (out ? 'exocytosis' : 'endocytosis') + '</b>.'] };
    if (L === 2) {
      var it = R.pick([
        ['In exocytosis, what happens to the vesicle?', 'It fuses with the cell membrane and releases its contents outside.', ['It forms when the membrane folds inward around food.', 'It is digested by a lysosome.', 'It passes through a channel protein.']],
        ['In endocytosis, what happens to the cell membrane?', 'It folds inward around material and pinches off as a vesicle inside the cell.', ['A vesicle inside joins it and empties outside.', 'It opens a hole for the material.', 'It stays still while a pump moves the material.']],
        ['Do endocytosis and exocytosis use energy?', 'Yes, both do.', ['No, both are passive.', 'Only exocytosis does.', 'Only endocytosis does.']],
        ['A cell must release a large protein made in its Golgi. Which process does it use?', 'Exocytosis', ['Endocytosis', 'Facilitated diffusion', 'Simple diffusion']]]);
      return { q: it[0], a: mc(it[1], it[2]), hint: 'Endo means in; exo means out.', steps: ['Endocytosis: the membrane folds in and makes a vesicle inside. Exocytosis: a vesicle fuses with the membrane and empties outside. Both use energy.', 'So: <b>' + it[1] + '</b>'] };
    }
    return { q: b[0] + '<br>Which process is this?', a: mc(b[1], R.sample(BNAMES.filter(function (x) { return x !== b[1]; }), 3)), hint: 'Large particle in: phagocytosis. Fluid in: pinocytosis. One specific substance caught by receptors: receptor-mediated. Out: exocytosis.', steps: ['<b>' + b[1] + '</b>.', out ? 'A vesicle from inside fuses with the membrane.' : 'The membrane folds inward and pinches off a vesicle.'] };
  });

  /* ================= Unit 5: Cellular Energy ================= */
  var ATP_Q = [
    ['What is left when ATP loses its last phosphate group?', 'ADP and a free phosphate', ['AMP and two phosphates', 'Glucose', 'ATP with more energy']],
    ['What are the three parts of ATP?', 'Adenine, ribose and three phosphate groups', ['Adenine, deoxyribose and one phosphate', 'Glucose, oxygen and phosphate', 'Three amino acids']],
    ['Where does the energy to recharge ADP into ATP come from?', 'Breaking down food (cellular respiration), or light in photosynthesis', ['From the ATP itself', 'From the cell membrane', 'From water alone']],
    ['Which job is powered directly by ATP?', 'The sodium-potassium pump moving ions against their gradient', ['Oxygen diffusing into a cell', 'Water moving by osmosis', 'Glucose moving down its gradient through a carrier']],
    ['How do cells store energy for the long term?', 'As fats, starch or glycogen; ATP is short-term currency', ['As huge stockpiles of ATP', 'As ADP', 'As water']],
    ['ATP is a close relative of which kind of molecule?', 'The nucleotides of RNA', ['Fatty acids', 'Amino acids', 'Steroids']]
  ];
  var ATP_TF = [
    ['ATP stores energy in one high-energy bond that releases energy when it breaks.', false, 'Breaking any bond takes energy. ATP hydrolysis releases energy overall because ADP and phosphate are much more stable than ATP.'],
    ['Breaking a chemical bond always takes energy.', true, 'Energy is released only when new, more stable bonds form.'],
    ['ATP hydrolysis releases energy overall because the products are more stable than ATP.', true, 'The crowded negative phosphates make ATP unstable; ADP and phosphate in water are lower in energy.'],
    ['A cell keeps a large stockpile of ATP that lasts for days.', false, 'A cell holds only a small supply and recycles ADP back into ATP constantly.'],
    ['Cells couple ATP hydrolysis to reactions that need energy, often by moving a phosphate onto another molecule.', true, 'That is how the energy released does useful work.']
  ];
  G('hsbio.atp', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick(ATP_Q); return { q: q[0], a: mc(q[1], q[2]), viz: quiet('bi-energy', { mode: 'atp' }), hint: 'ATP → ADP + phosphate + energy; food energy recharges ADP.', steps: ['ATP (adenine, ribose, three phosphates) releases energy when it becomes ADP and phosphate; energy from food recharges ADP.', 'So: <b>' + q[1] + '</b>'] }; }
    if (L === 2) return tfItem(R.pick(ATP_TF), 'Does breaking a bond release energy or take it in?');
    if (R.coin()) { var n = R.int(2, 25); return { q: 'Under standard conditions, hydrolyzing 1 mole of ATP releases about 7.3 kcal. How much energy do ' + n + ' moles release?', a: num(fix(7.3 * n, 3), { rtol: 0.01 }), unit: 'kcal', hint: 'Multiply the moles by 7.3 kcal.', steps: ['$' + n + ' \\times 7.3 = ' + fix(7.3 * n, 3) + '$ kcal.'] }; }
    var need = R.int(5, 45), k = Math.ceil(need / 7.3);
    return { q: 'A reaction needs ' + need + ' kcal/mol to go forward. Each ATP hydrolysis supplies about 7.3 kcal/mol. What is the smallest whole number of ATP the cell must spend per reaction?', a: num(k), hint: 'How many 7.3s does it take to reach ' + need + '?', steps: [(k - 1) + ' ATP give $' + (k - 1) + ' \\times 7.3 = ' + fix((k - 1) * 7.3, 2) + '$ kcal: not enough.', k + ' ATP give $' + k + ' \\times 7.3 = ' + fix(k * 7.3, 2) + '$ kcal: enough.', 'So <b>' + k + '</b> ATP.'] };
  });

  /* ---- photosynthesis ---- */
  var PS_WHERE = [
    ['Where do the light-dependent reactions happen?', 'The thylakoid membranes', ['The stroma', 'The mitochondria', 'The nucleus']], ['Where does the Calvin cycle happen?', 'The stroma of the chloroplast', ['The thylakoid membranes', 'The cytoplasm', 'The mitochondrial matrix']],
    ['Which stage of photosynthesis releases oxygen?', 'The light-dependent reactions', ['The Calvin cycle', 'Glycolysis', 'Both stages equally']], ['Which stage of photosynthesis uses carbon dioxide?', 'The Calvin cycle', ['The light-dependent reactions', 'Both stages equally', 'Neither stage']],
    ['What two molecules do the light reactions make for the Calvin cycle?', 'ATP and NADPH', ['Glucose and oxygen', 'CO₂ and water', 'ADP and NADP⁺']], ['Which enzyme attaches CO₂ to a five-carbon sugar in the Calvin cycle?', 'Rubisco', ['ATP synthase', 'Amylase', 'Pepsin']],
    ['Which colors of light does chlorophyll absorb most?', 'Red and blue', ['Green', 'Green and yellow', 'Only ultraviolet']], ['What are the inputs of photosynthesis?', 'Carbon dioxide, water and light', ['Glucose and oxygen', 'Oxygen and light', 'Carbon dioxide and oxygen']]
  ];
  var PS_O2 = [
    ['Where does the oxygen released in photosynthesis come from?', 'Water, split in the light-dependent reactions', ['Carbon dioxide, split in the Calvin cycle', 'Glucose', 'The air spaces in the leaf']],
    ['Algae are given water labeled with heavy oxygen (oxygen-18) and ordinary CO₂. Where does the label show up first?', 'In the O₂ gas the algae release', ['In the sugar the algae make', 'In the CO₂ the algae take in', 'Nowhere: water is not used']],
    ['In photosynthesis, where do the oxygen atoms of carbon dioxide end up?', 'In the sugar', ['In the O₂ released', 'In the chlorophyll', 'They are destroyed']],
    ['Why must water be split in the light reactions?', 'To replace the electrons chlorophyll loses when light excites them; O₂ is released as a result', ['To make carbon dioxide', 'To cool the leaf', 'To make glucose directly']]
  ];
  G('hsbio.photosynthesis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var it = R.pick(PS_WHERE); return { q: it[0], a: mc(it[1], it[2]), viz: quiet('bi-energy', { mode: 'photo-stages' }), hint: 'Light reactions: thylakoids, water split, O₂ out, ATP and NADPH made. Calvin cycle: stroma, CO₂ in, sugar made.', steps: ['The light reactions (thylakoid membranes) split water and make O₂, ATP and NADPH; the Calvin cycle (stroma) uses ATP and NADPH to fix CO₂ into sugar.', 'So: <b>' + it[1] + '</b>'] }; }
    if (L === 2) { var o = R.pick(PS_O2); return { q: o[0], a: mc(o[1], o[2]), hint: 'Which molecule is split in the light reactions?', steps: ['The light reactions split water: its oxygen leaves as O₂. The carbon and oxygen of CO₂ are built into sugar in the Calvin cycle.', 'So: <b>' + o[1] + '</b>'] }; }
    var g = R.int(2, 15), ask = R.int(0, 3), co2 = 6 * g;
    if (ask === 0) return { q: 'A plant makes ' + g + ' glucose molecules by photosynthesis. How many CO₂ molecules did it fix?', a: num(co2), hint: 'Use the equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', steps: ['Each glucose needs 6 CO₂.', '$' + g + ' \\times 6 = ' + co2 + '$ CO₂.'] };
    if (ask === 1) return { q: 'A leaf fixes ' + co2 + ' molecules of CO₂. How many glucose molecules can it make?', a: num(g), hint: 'Each glucose has 6 carbons.', steps: ['$' + co2 + ' \\div 6 = ' + g + '$ glucose.'] };
    if (ask === 2) return { q: 'A plant makes ' + g + ' glucose molecules. How many O₂ molecules does it release?', a: num(co2), hint: 'Use the equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', steps: ['6 O₂ for each glucose.', '$' + g + ' \\times 6 = ' + co2 + '$ O₂.'] };
    return { q: 'How many turns of the Calvin cycle does it take to make ' + g + ' glucose molecules? (Each turn fixes one CO₂.)', a: num(co2), hint: 'How many CO₂ are in one glucose?', steps: ['One glucose has 6 carbons, so it takes 6 turns.', '$' + g + ' \\times 6 = ' + co2 + '$ turns.'] };
  });

  /* ---- limiting factors ---- */
  function satCurve(xs, top, k) { return xs.map(function (x) { return Math.round(top * (1 - Math.exp(-x / k))); }); }
  G('hsbio.photosynthesis-factors', function (R, ctx) {
    var L = lv(ctx), xs = [0, 10, 20, 30, 40, 50, 60, 70, 80], hi = R.int(40, 60), lo = R.int(18, hi - 14), k = R.pick([12, 15, 18]);
    var yH = satCurve(xs, hi, k), yL = xs.map(function (x, i) { return Math.min(yH[i], lo); });
    if (L === 1) {
      var region = R.coin(), xq = region ? R.pick([5, 10]) : R.pick([60, 70, 80]);
      return { q: 'A plant\'s rate of photosynthesis is measured at different light intensities (see the graph). At ' + xq + '% light, does adding more light raise the rate?', viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Rate', values: yL }], xlabel: 'Light intensity (% of full sun)', ylabel: 'Rate of photosynthesis', quiet: true, interactive: false } },
        a: mcKeep(['Yes: light is the limiting factor there', 'No: the curve is flat there, so something else is limiting'], region ? 0 : 1), hint: 'Is the curve rising or flat at ' + xq + '%?', steps: [region ? 'At ' + xq + '% the curve rises steeply, so more light means a faster rate.' : 'At ' + xq + '% the curve is level: more light changes nothing.', region ? 'Light is the <b>limiting factor</b> there.' : 'Another factor (CO₂ or temperature) is <b>limiting</b> there.'] };
    }
    if (L === 2) {
      var it = R.pick([
        ['On the flat part of a light-response curve, what limits the rate of photosynthesis?', 'Something other than light, such as CO₂ or temperature', ['Light, because there is never enough', 'Nothing: the plant has stopped photosynthesizing', 'The amount of oxygen in the air']],
        ['A plant in bright light is given more light, but its rate stays the same. Which change would most likely raise the rate?', 'Adding carbon dioxide', ['Adding even more light', 'Removing carbon dioxide', 'Cooling it close to freezing']],
        ['Why does the rate of photosynthesis fall at very high temperatures?', 'The enzymes of the Calvin cycle begin to denature.', ['The light gets weaker.', 'The plant runs out of chlorophyll at once.', 'CO₂ stops existing at high temperature.']],
        ['Which statement about light and photosynthesis is right?', 'More light raises the rate only until another factor becomes limiting.', ['More light always means more photosynthesis.', 'Light has no effect on photosynthesis.', 'More light always lowers the rate.']]]);
      return { q: it[0], viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Rate', values: yL }], xlabel: 'Light intensity (%)', ylabel: 'Rate', quiet: true, interactive: false } }, a: mc(it[1], it[2]), hint: 'Only raising the limiting factor raises the rate.', steps: ['Light raises the rate until the curve levels off; then CO₂ or temperature limits it. Very high temperatures denature the enzymes.', 'So: <b>' + it[1] + '</b>'] };
    }
    if (R.coin()) {
      var plateau = lo, x2 = R.pick([60, 70, 80]);
      return { q: 'The graph shows the rate at high and low CO₂. At ' + x2 + '% light, what is the limiting factor for the low-CO₂ plant?', viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'High CO₂', values: yH }, { name: 'Low CO₂', values: yL }], xlabel: 'Light intensity (%)', ylabel: 'Rate', quiet: true, interactive: false } },
        a: mc('Carbon dioxide', ['Light', 'Water', 'Oxygen']), hint: 'Is the low-CO₂ curve still rising there? Is the high-CO₂ curve higher?', steps: ['At ' + x2 + '% the low-CO₂ curve is flat (about ' + plateau + '), so more light does not help.', 'The high-CO₂ curve is higher at the same light, so adding CO₂ raises the rate.', 'The limiting factor is <b>carbon dioxide</b>.'] };
    }
    var d = [40, 30, 20, 10], top = R.int(28, 40), b = [Math.round(top * 0.25) + R.int(0, 2), Math.round(top * 0.5) + R.int(0, 2), top - R.int(1, 3), top], gap = b[3] - b[2];
    return { q: 'A water plant gives off ' + b.join(', ') + ' oxygen bubbles per minute with a lamp ' + d.join(', ') + ' cm away. Between 20 cm and 10 cm, the rate rises by only ' + gap + ' bubble' + (gap === 1 ? '' : 's') + '. What is the best explanation?',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: d.map(function (x) { return x + ' cm'; }), series: [{ name: 'Bubbles per minute', values: b }], xlabel: 'Lamp distance', ylabel: 'Bubbles per minute', quiet: true, interactive: false } },
      a: mc('Light is no longer the limiting factor; CO₂ or temperature now limits the rate.', ['The plant has used up all its light.', 'The lamp is too close, so the plant has died.', 'Light has stopped affecting photosynthesis because the plant is full of oxygen.']), hint: 'Closer lamp = more light. What does a leveling-off curve mean?', steps: ['From 40 to 20 cm, more light raised the rate a lot: light was limiting.', 'From 20 to 10 cm the rate barely rose.', 'So another factor, such as CO₂ or temperature, is now <b>limiting</b>.'] };
  });

  /* ---- cellular respiration ---- */
  var RS = [
    ['glycolysis', 'Glycolysis', 'the cytoplasm'], ['pyruvate oxidation', 'Pyruvate oxidation', 'the mitochondrial matrix'], ['the Krebs cycle', 'Krebs cycle', 'the mitochondrial matrix'], ['the electron transport chain', 'Electron transport chain', 'the inner mitochondrial membrane']
  ];
  var RS_FACT = [
    ['splits glucose into two pyruvate molecules', 0], ['works without oxygen and makes a net 2 ATP', 0], ['releases 4 CO₂ per glucose as acetyl groups are broken down', 2], ['makes most of the cell\'s ATP using a flow of H⁺ through ATP synthase', 3], ['is where oxygen accepts electrons and becomes water', 3], ['turns each pyruvate into acetyl-CoA, releasing one CO₂', 1], ['takes in NADH and FADH₂ and uses their electrons to pump H⁺', 3], ['makes 6 NADH and 2 FADH₂ per glucose', 2]
  ];
  var RS_TR = [
    ['Where does the carbon in the CO₂ you breathe out come from?', 'The carbon atoms of glucose (and other food molecules)', ['The oxygen you breathe in', 'The air in your lungs', 'Water']],
    ['What happens to the O₂ you breathe in, inside your cells?', 'It accepts electrons at the end of the electron transport chain and becomes water.', ['It becomes the carbon dioxide you breathe out.', 'It becomes glucose.', 'It is stored as ATP.']],
    ['Which stages of respiration release CO₂?', 'Pyruvate oxidation and the Krebs cycle', ['Glycolysis and the electron transport chain', 'Only the electron transport chain', 'Only glycolysis']],
    ['In C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O, where do the oxygen atoms of O₂ end up?', 'In the water', ['In the carbon dioxide', 'In the glucose', 'In the ATP']]
  ];
  G('hsbio.cellular-respiration', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var s = R.pick(RS); return { q: 'Where in the cell does ' + s[0] + ' happen?', a: mc(cap(s[2]), ['The cytoplasm', 'The mitochondrial matrix', 'The inner mitochondrial membrane', 'The nucleus'].filter(function (x) { return x.toLowerCase() !== s[2]; }).slice(0, 3)), viz: quiet('bi-energy', { mode: 'resp-stages' }), hint: 'Only the first stage is outside the mitochondrion.', steps: ['Glycolysis: cytoplasm. Pyruvate oxidation and Krebs cycle: mitochondrial matrix. Electron transport chain: inner mitochondrial membrane.', 'So ' + s[0] + ' happens in <b>' + s[2] + '</b>.'] }; }
      var f = R.pick(RS_FACT); return { q: 'Which stage of cellular respiration ' + f[0] + '?', a: mcKeep(RS.map(function (x) { return x[1]; }), f[1]), hint: 'Glycolysis splits glucose; the Krebs cycle releases CO₂; the electron transport chain makes most ATP.', steps: ['<b>' + RS[f[1]][1] + '</b> ' + f[0] + '.'] };
    }
    if (L === 2) { var t = R.pick(RS_TR); return { q: t[0], a: mc(t[1], t[2]), viz: quiet('bi-energy', { mode: 'resp', ask: 'oxygen' }), hint: 'Follow the carbon: O₂ has none.', steps: ['The CO₂ comes from glucose\'s carbon (2 from pyruvate oxidation, 4 from the Krebs cycle). Oxygen accepts electrons at the end of the chain and becomes water.', 'So: <b>' + t[1] + '</b>'] }; }
    var g = R.int(2, 20), ask = R.int(0, 3);
    if (ask === 0) return { q: 'A cell breaks down ' + g + ' glucose molecules completely by aerobic respiration. About how many ATP does it make? (Use about 30 ATP per glucose.)', a: num(30 * g, { rtol: 0.07 }), hint: 'Multiply by about 30.', steps: ['$' + g + ' \\times 30 = ' + 30 * g + '$ ATP (about; the true yield is 30–32 per glucose).'] };
    if (ask === 1) return { q: 'How many CO₂ molecules are released when ' + g + ' glucose molecules are completely broken down?', a: num(6 * g), hint: 'Each glucose has 6 carbons.', steps: ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O: 6 CO₂ per glucose.', '$' + g + ' \\times 6 = ' + 6 * g + '$ CO₂.'] };
    if (ask === 2) return { q: 'How many O₂ molecules are used when ' + g + ' glucose molecules are completely broken down?', a: num(6 * g), hint: 'Look at the balanced equation.', steps: ['6 O₂ per glucose.', '$' + g + ' \\times 6 = ' + 6 * g + '$ O₂.'] };
    var stage = R.pick([['the Krebs cycle', 4], ['pyruvate oxidation', 2]]);
    return { q: 'Of the 6 CO₂ made from one glucose, how many are released in ' + stage[0] + '? How many in all from ' + g + ' glucose molecules?', a: { t: 'multi', parts: [{ label: 'Per glucose', a: num(stage[1]) }, { label: 'From ' + g + ' glucose', a: num(stage[1] * g) }] }, hint: 'Pyruvate oxidation releases one carbon from each pyruvate; the Krebs cycle releases the rest.', steps: ['Pyruvate oxidation: 2 CO₂ per glucose. Krebs cycle: 4 CO₂ per glucose.', 'In ' + stage[0] + ': <b>' + stage[1] + '</b> per glucose.', '$' + g + ' \\times ' + stage[1] + ' = ' + stage[1] * g + '$.'] };
  });

  /* ---- fermentation ---- */
  var FER = [
    ['Muscle cells working hard without enough oxygen', 'Lactic acid fermentation', 'lactic acid'], ['Bacteria that turn milk into yogurt', 'Lactic acid fermentation', 'lactic acid'], ['Yeast in bread dough', 'Alcoholic fermentation', 'ethanol and carbon dioxide'], ['Yeast in a sealed bottle of sugar water', 'Alcoholic fermentation', 'ethanol and carbon dioxide'], ['Bacteria that turn cabbage into sauerkraut', 'Lactic acid fermentation', 'lactic acid']
  ];
  var FER_TR = [
    ['How many ATP does fermentation yield per glucose?', '2, all from glycolysis', ['About 30, the same as aerobic respiration', '0', '36']],
    ['What is the main job of the fermentation step itself?', 'Turning NADH back into NAD⁺ so glycolysis can keep going', ['Making lots of extra ATP', 'Using oxygen', 'Making glucose']],
    ['Why does a muscle cell that switches to fermentation use glucose much faster?', 'It gets only 2 ATP per glucose instead of about 30.', ['Fermentation makes no ATP at all.', 'Fermentation needs more oxygen.', 'It stores the extra glucose as fat.']],
    ['Which stage of cellular respiration does fermentation keep running?', 'Glycolysis', ['The Krebs cycle', 'The electron transport chain', 'Pyruvate oxidation']]
  ];
  G('hsbio.fermentation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var f = R.pick(FER); if (R.coin()) return { q: f[0] + ': which kind of fermentation?', a: mcKeep(['Lactic acid fermentation', 'Alcoholic fermentation'], f[1][0] === 'L' ? 0 : 1), hint: 'Muscle cells and yogurt bacteria make lactic acid; yeast make ethanol and CO₂.', steps: ['<b>' + f[1] + '</b>, which makes ' + f[2] + '.'] };
      return { q: f[0] + ' carry out fermentation. What do they make from pyruvate?', a: mc(cap(f[2]), ['Lactic acid', 'Ethanol and carbon dioxide', 'Oxygen and water', 'Glucose'].filter(function (x) { return x.toLowerCase() !== f[2]; }).slice(0, 3)), hint: 'Muscle and yogurt: one product. Yeast: two.', steps: [f[1] + ' turns pyruvate into <b>' + f[2] + '</b>.'] }; }
    if (L === 2) { var t = R.pick(FER_TR); return { q: t[0], a: mc(t[1], t[2]), hint: 'Fermentation keeps glycolysis going; glycolysis makes 2 ATP.', steps: ['Glycolysis makes 2 ATP per glucose and uses NAD⁺. Fermentation recycles the NAD⁺ but makes no ATP itself.', 'So: <b>' + t[1] + '</b>'] }; }
    var shape = R.int(0, 1);
    if (shape === 0) { var g = R.int(2, 30); return { q: 'A cell has ' + g + ' glucose molecules. How many ATP does it get by fermentation, and about how many with oxygen (about 30 per glucose)?', a: { t: 'multi', parts: [{ label: 'Fermentation', a: num(2 * g) }, { label: 'Aerobic (about)', a: num(30 * g, { rtol: 0.07 }) }] }, hint: '2 per glucose without oxygen; about 30 with it.', steps: ['Fermentation: $' + g + ' \\times 2 = ' + 2 * g + '$ ATP.', 'Aerobic: $' + g + ' \\times 30 = ' + 30 * g + '$ ATP (about).'] }; }
    var atp = 2 * R.int(5, 150);
    return { q: 'A muscle cell needs ' + atp + ' ATP. How many glucose molecules must it use by fermentation alone?', a: num(atp / 2), hint: 'Fermentation gives 2 ATP per glucose.', steps: ['$' + atp + ' \\div 2 = ' + atp / 2 + '$ glucose.', 'With oxygen it would need only about $' + atp + ' \\div 30 \\approx ' + fix(atp / 30, 1) + '$.'] };
  });

  /* ---- photosynthesis, respiration and the carbon cycle ---- */
  var PRC = [
    ['Plant leaves in sunlight', 'Removes CO₂ overall (photosynthesis is faster than respiration)'], ['A plant at night', 'Adds CO₂ (respiration only)'], ['A deer eating and running', 'Adds CO₂ (respiration)'], ['Fungi breaking down a fallen log', 'Adds CO₂ (respiration by decomposers)'], ['Algae in a sunny pond', 'Removes CO₂ overall (photosynthesis)'], ['Burning wood or fossil fuels', 'Adds CO₂ (combustion)'], ['Bacteria decomposing dead leaves in the soil', 'Adds CO₂ (respiration by decomposers)']
  ];
  var PRC_TF = [
    ['Plants only photosynthesize, and animals only respire.', false, 'Plant cells have mitochondria and respire all the time; they also photosynthesize in the light.'],
    ['Plants respire both day and night.', true, 'Every living cell respires to make ATP.'],
    ['In the dark, a plant gives off carbon dioxide.', true, 'With no light there is no photosynthesis, only respiration.'],
    ['Over a whole day, a growing plant takes in more CO₂ than it gives off.', true, 'The extra carbon becomes new leaves, stems and roots.'],
    ['A plant in bright light gives off more CO₂ than it takes in.', false, 'In good light, photosynthesis outpaces respiration, so the plant takes in CO₂ overall.'],
    ['The oxygen made by photosynthesis is used by respiration, and the CO₂ made by respiration is used by photosynthesis.', true, 'The two processes are mirror images.']
  ];
  G('hsbio.photo-resp-carbon', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var p = R.pick(PRC), opts = ['Removes CO₂ overall (photosynthesis is faster than respiration)', 'Adds CO₂ (respiration only)', 'Adds CO₂ (respiration)', 'Adds CO₂ (respiration by decomposers)', 'Removes CO₂ overall (photosynthesis)', 'Adds CO₂ (combustion)'];
      var adds = /^Adds/.test(p[1]); return { q: p[0] + ': does this add CO₂ to the air or remove it?', a: mcKeep(['Adds CO₂ to the air', 'Removes CO₂ from the air'], adds ? 0 : 1), viz: quiet('bi-cycle', { cycle: 'carbon' }), hint: 'Respiration and burning release CO₂; photosynthesis takes it in.', steps: ['<b>' + p[1] + '</b>.'] }; }
    if (L === 2) return tfItem(R.pick(PRC_TF), 'Every living cell respires, plant cells included.');
    var net = R.int(8, 60), resp = R.int(2, Math.max(3, Math.floor(net / 2))), hL = R.pick([10, 12, 14, 16]), hD = 24 - hL;
    if (R.coin()) return { q: 'In the light, a plant takes up ' + net + ' mg of CO₂ per hour (net). In the dark it gives off ' + resp + ' mg per hour. Assuming it respires at the same rate in the light, what is its gross rate of photosynthesis?', a: num(net + resp), unit: 'mg/h', hint: 'Gross = net + respiration.', steps: ['In the light, the sensor sees photosynthesis minus respiration (net).', 'Gross $= ' + net + ' + ' + resp + ' = ' + (net + resp) + '$ mg of CO₂ per hour.'] };
    var tot = net * hL - resp * hD;
    return { q: 'A plant takes up ' + net + ' mg of CO₂ per hour in the light (net) and gives off ' + resp + ' mg per hour in the dark. In a day with ' + hL + ' hours of light and ' + hD + ' of dark, what is its net CO₂ uptake? (Negative if it loses CO₂.)', a: num(tot), unit: 'mg', hint: 'Multiply each rate by its hours, then subtract.', steps: ['Light: $' + hL + ' \\times ' + net + ' = ' + hL * net + '$ mg taken up.', 'Dark: $' + hD + ' \\times ' + resp + ' = ' + hD * resp + '$ mg given off.', 'Net: $' + hL * net + ' - ' + hD * resp + ' = ' + tot + '$ mg.' + (tot > 0 ? ' The plant gains carbon and can grow.' : '')] };
  });

  /* ================= Unit 6: Cell Division ================= */
  // diploid numbers (Grokipedia, List of organisms by chromosome count, read 2026-10-26)
  var SPECIES = [['fruit fly', 8], ['thale cress (Arabidopsis)', 10], ['onion', 16], ['corn', 20], ['rice', 24], ['cat', 38], ['human', 46], ['chimpanzee', 48], ['elephant', 56], ['dog', 78], ['chicken', 78],
    ['garden pea', 14], ['tomato', 24], ['mosquito (Aedes aegypti)', 6], ['house mouse', 40], ['cow', 60], ['horse', 64]];
  var CHR_TF = [
    ['Homologous chromosomes are identical copies of each other.', false, 'Homologs carry the same genes in the same order, but one came from each parent and they may carry different alleles. Identical copies are sister chromatids.'],
    ['Sister chromatids are identical copies made when DNA is copied.', true, 'They are joined at the centromere until they separate.'],
    ['After S phase, a human cell has 92 chromosomes.', false, 'It still has 46 chromosomes (46 centromeres), but 92 chromatids.'],
    ['To count chromosomes, count centromeres.', true, 'One centromere is one chromosome, whether it holds one chromatid or two.'],
    ['A haploid cell has one chromosome from each homologous pair.', true, 'That is one full set, n.'],
    ['An X-shaped copied chromosome counts as two chromosomes.', false, 'It is one chromosome made of two sister chromatids: one centromere.']
  ];
  G('hsbio.chromosomes', function (R, ctx) {
    var L = lv(ctx), sp = R.pick(SPECIES), tn = sp[1], n = tn / 2;
    if (L === 1) {
      var s1 = R.int(0, 2);
      if (s1 === 2) return { q: 'A ' + sp[0] + ' body cell has ' + tn + ' chromosomes. How many homologous pairs is that?', a: num(n), hint: 'Each pair is two chromosomes, one from each parent.', steps: ['$' + tn + ' \\div 2 = ' + n + '$ pairs.', 'That is also the haploid number, $n = ' + n + '$.'] };
      if (s1 === 0) return { q: 'A ' + sp[0] + ' body cell has ' + tn + ' chromosomes ($2n = ' + tn + '$). How many chromosomes are in one of its gametes?', a: num(n), hint: 'Gametes are haploid: one set.', steps: ['Body cells are diploid: $2n = ' + tn + '$.', 'Gametes have one set: $n = ' + tn + ' \\div 2 = ' + n + '$.'] };
      return { q: 'A ' + sp[0] + ' gamete has ' + n + ' chromosomes. How many are in its body cells?', a: num(tn), hint: 'Body cells have two sets.', steps: ['Gametes are haploid: $n = ' + n + '$.', 'Body cells are diploid: $2n = 2 \\times ' + n + ' = ' + tn + '$.'] };
    }
    if (L === 2) {
      if (R.coin()) return tfItem(R.pick(CHR_TF), 'Count centromeres to count chromosomes.');
      var pairs = R.int(1, 3), ask = R.pick(['chromosomes', 'chromatids']), c = B().counts(2 * pairs, 'prophase');
      return { q: 'The picture shows a cell after its DNA has been copied. How many <b>' + ask + '</b> does it have?', viz: quiet('bi-mitosis', { pairs: pairs, stage: 'prophase' }), a: num(ask === 'chromosomes' ? c.chromosomes : c.chromatids), hint: 'Each X shape is one chromosome made of two sister chromatids.', steps: ['Count the centromeres: ' + c.chromosomes + ' chromosomes.', 'Each is two sister chromatids: $' + c.chromosomes + ' \\times 2 = ' + c.chromatids + '$ chromatids.', 'So the answer is <b>' + (ask === 'chromosomes' ? c.chromosomes : c.chromatids) + '</b>.'] };
    }
    var g2 = R.coin(), what = R.int(0, 2);
    var vals = [tn, g2 ? 2 * tn : tn, n], names = ['chromosomes', 'chromatids', 'homologous pairs'];
    return { q: 'A ' + sp[0] + ' body cell ($2n = ' + tn + '$) is in ' + (g2 ? 'G2, after its DNA has been copied' : 'G1, before its DNA is copied') + '. How many <b>' + names[what] + '</b> does it have?', a: num(vals[what]), hint: 'Copying doubles the chromatids, not the chromosomes.',
      steps: ['Chromosomes (centromeres): ' + tn + '.', 'Chromatids: ' + (g2 ? '$' + tn + ' \\times 2 = ' + 2 * tn + '$ (each chromosome is now two sister chromatids)' : tn + ' (one per chromosome before copying)') + '.', 'Homologous pairs: $' + tn + ' \\div 2 = ' + n + '$.', 'So the answer is <b>' + vals[what] + '</b>.'] };
  });

  /* ---- the cell cycle ---- */
  var PHASE = [['The cell copies all of its DNA.', 'S'], ['The cell grows and carries out its normal work, before the DNA is copied.', 'G1'], ['The cell grows more, makes the proteins needed for division and checks the copied DNA.', 'G2'], ['The nucleus divides and the cytoplasm splits into two cells.', 'M'], ['A nerve cell leaves the cycle and stops dividing.', 'G0']];
  var CC_TR = [
    ['Is interphase a resting phase?', 'No: the cell grows, works and copies its DNA during interphase.', ['Yes: nothing happens until mitosis.', 'Yes: the cell sleeps until it is needed.', 'Only in plant cells.']],
    ['In which part of the cell cycle does a typical dividing cell spend most of its time?', 'Interphase', ['Mitosis', 'Cytokinesis', 'Metaphase']],
    ['Why must a cell copy its DNA before dividing?', 'So each new cell gets a complete set of chromosomes', ['So the cell can rest', 'To halve its chromosome number', 'To make the cell smaller']],
    ['During which phase is the DNA copied?', 'S phase, part of interphase', ['Prophase', 'Anaphase', 'Cytokinesis']]
  ];
  G('hsbio.cell-cycle', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var p = R.pick(PHASE); return { q: 'In which phase does this happen?<br><i>' + p[0] + '</i>', a: mcKeep(['G1', 'S', 'G2', 'M', 'G0'], ['G1', 'S', 'G2', 'M', 'G0'].indexOf(p[1])), hint: 'G1 growth, S DNA synthesis, G2 preparation, M division, G0 out of the cycle.', steps: ['G1: growth. S: DNA copied. G2: preparation. M: mitosis and cytokinesis. G0: out of the cycle.', 'So: <b>' + p[1] + '</b>.'] }; }
    if (L === 2) { var t = R.pick(CC_TR); return { q: t[0], a: mc(t[1], t[2]), hint: 'What does S stand for?', steps: ['Interphase (G1, S, G2) is most of the cycle: the cell grows, works and copies its DNA in S.', 'So: <b>' + t[1] + '</b>'] }; }
    var total = R.pick([200, 250, 400, 500, 1000]), fr = R.pick([0.04, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2]), inM = fix(total * fr, 0), T = R.pick([12, 16, 20, 24]), tM = fix(inM / total * T, 4);
    if (R.coin()) return { q: 'In a slide of an onion root tip, ' + inM + ' of ' + total + ' cells are in mitosis and the rest are in interphase. If one cell cycle takes ' + T + ' hours, about how long does mitosis take?', a: num(tM, { rtol: 0.02 }), unit: 'h', hint: 'The share of cells in a phase is about the share of time spent in it.', steps: ['Share in mitosis: $' + inM + ' \\div ' + total + ' = ' + fix(inM / total, 4) + '$.', 'Time: $' + fix(inM / total, 4) + ' \\times ' + T + ' = ' + fix(tM, 3) + '$ hours.'] };
    var tI = fix(T - tM, 4);
    return { q: 'In a slide, ' + (total - inM) + ' of ' + total + ' cells are in interphase. If the cycle takes ' + T + ' hours, about how many hours is interphase?', a: num(tI, { rtol: 0.02 }), unit: 'h', hint: 'Multiply the share of cells in interphase by the cycle time.', steps: ['Share in interphase: $' + (total - inM) + ' \\div ' + total + ' = ' + fix((total - inM) / total, 4) + '$.', 'Time: $' + fix((total - inM) / total, 4) + ' \\times ' + T + ' = ' + fix(tI, 3) + '$ hours.'] };
  });

  /* ---- mitosis ---- */
  var MSTAGES = ['prophase', 'metaphase', 'anaphase', 'telophase'];
  var MDESC = [['Chromosomes condense and become visible; the nuclear envelope breaks down.', 0], ['Chromosomes line up across the middle of the cell.', 1], ['Sister chromatids are pulled apart toward opposite ends of the cell.', 2], ['Two new nuclei form, and the chromosomes loosen.', 3], ['Spindle fibers begin to form.', 0], ['Each chromosome is attached to spindle fibers from both poles at the cell\'s equator.', 1]];
  var MIT_TR = [
    ['A human skin cell (46 chromosomes) divides by mitosis. How many chromosomes does each new cell have?', '46', ['23', '92', '12']],
    ['What separates in anaphase of mitosis?', 'Sister chromatids', ['Homologous pairs', 'Whole cells', 'Nucleotides']],
    ['Do homologous chromosomes pair up in mitosis?', 'No: chromosomes line up one by one, and sister chromatids separate.', ['Yes: homologs pair up and separate, halving the number.', 'Yes, in metaphase.', 'Only in plant cells.']],
    ['How do the two cells made by mitosis compare with the parent cell?', 'They have the same chromosome number and the same DNA.', ['They have half the chromosome number.', 'They each have different DNA.', 'They have twice the chromosome number.']]
  ];
  G('hsbio.mitosis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      if (R.coin()) { var d = R.pick(MDESC); return { q: 'Which stage of mitosis is this?<br><i>' + d[0] + '</i>', a: mcKeep(MSTAGES.map(cap), d[1]), hint: 'PMAT: prophase, metaphase, anaphase, telophase.', steps: ['Prophase: condense. Metaphase: line up in the middle. Anaphase: chromatids pull apart. Telophase: two nuclei.', 'So: <b>' + MSTAGES[d[1]] + '</b>.'] }; }
      var st = R.int(0, 3); return { q: 'Which stage of mitosis does the picture show?', viz: quiet('bi-mitosis', { pairs: R.int(2, 3), stage: MSTAGES[st] }), a: mcKeep(MSTAGES.map(cap), st), hint: 'Are the chromosomes scattered, lined up, moving apart, or in two new nuclei?', steps: ['Scattered and condensed: prophase. A line in the middle: metaphase. Two groups moving apart: anaphase. Two nuclei forming: telophase.', 'This is <b>' + MSTAGES[st] + '</b>.'] };
    }
    if (L === 2) { var t = R.pick(MIT_TR); return { q: t[0], a: mc(t[1], t[2]), viz: quiet('bi-mitosis', { pairs: 2, stage: 'anaphase' }), hint: 'In mitosis, sister chromatids separate, so the number stays the same.', steps: ['Mitosis separates sister chromatids, so each new cell gets one copy of every chromosome: the same number and the same DNA as the parent.', 'So: <b>' + t[1] + '</b>'] }; }
    var sp = R.pick(SPECIES), tn = sp[1], ask = R.int(0, 2);
    if (ask === 0) { var right = 'Prophase, metaphase, anaphase, telophase', w = ['Metaphase, prophase, anaphase, telophase', 'Prophase, anaphase, metaphase, telophase', 'Telophase, anaphase, metaphase, prophase', 'Anaphase, metaphase, prophase, telophase'];
      return { q: 'Which is the correct order of the stages of mitosis?', a: mc(right, R.sample(w, 3)), hint: 'PMAT.', steps: ['Chromosomes condense (prophase), line up (metaphase), separate (anaphase), and form two nuclei (telophase).', '<b>' + right + '</b>.'] }; }
    var stage = ask === 1 ? 'metaphase' : 'anaphase', c = B().counts(tn, stage);
    return { q: 'A ' + sp[0] + ' cell ($2n = ' + tn + '$) is in ' + stage + ' of mitosis. How many chromosomes are in the whole cell at that moment? (Count each separated chromatid as a chromosome.)', a: num(c.chromosomes), hint: stage === 'anaphase' ? 'Once sister chromatids separate, each one counts as a chromosome.' : 'Each chromosome is still two chromatids, joined at a centromere.',
      steps: stage === 'anaphase' ? ['In metaphase there are ' + tn + ' chromosomes, each two chromatids.', 'In anaphase the chromatids separate, and each counts as a chromosome: $' + tn + ' \\times 2 = ' + c.chromosomes + '$.', 'Each new cell will get ' + tn + '.'] : ['In metaphase the chromatids are still joined: ' + tn + ' centromeres, so <b>' + c.chromosomes + '</b> chromosomes (' + c.chromatids + ' chromatids).'] };
  });

  /* ---- controlling the cell cycle ---- */
  var CHK = [['Is all the DNA copied, and copied correctly?', 'G2 checkpoint'], ['Is the cell big enough, with enough nutrients and growth signals, to copy its DNA?', 'G1 checkpoint'], ['Is every chromosome attached to spindle fibers from both poles?', 'M (spindle) checkpoint'], ['Is the DNA undamaged before the cell commits to copying it?', 'G1 checkpoint'], ['Are the chromosomes lined up and ready to be pulled apart?', 'M (spindle) checkpoint'], ['Has the cell received a signal from the body that more cells are needed?', 'G1 checkpoint'], ['Were any stretches of DNA skipped or copied with errors in S phase?', 'G2 checkpoint'], ['Is one chromosome still unattached to the spindle, so that both copies might end up in the same cell?', 'M (spindle) checkpoint']];
  var CHKN = ['G1 checkpoint', 'G2 checkpoint', 'M (spindle) checkpoint'];
  var CAN_TR = [
    ['Where do cancer cells come from?', 'They are the body\'s own cells whose controls on division have broken.', ['They are germs that invade from outside.', 'They are cells from another person.', 'They form from nonliving matter.']],
    ['What usually has to happen before a cell becomes a cancer cell?', 'Several mutations build up in genes that control the cell cycle.', ['One germ enters the cell.', 'The cell stops dividing.', 'The cell becomes haploid.']],
    ['What does the protein p53 do when it finds damaged DNA?', 'It halts the cell cycle (and can tell a badly damaged cell to destroy itself).', ['It speeds up division.', 'It copies the damaged DNA.', 'It turns the cell into a bacterium.']],
    ['A tumor suppressor gene is like which part of a car?', 'A brake', ['A gas pedal', 'The steering wheel', 'The fuel tank']],
    ['A proto-oncogene is like which part of a car?', 'A gas pedal, used only when the body signals for growth', ['A brake', 'The steering wheel', 'The headlights']],
    ['What is cancer, in terms of the cell cycle?', 'Cells dividing without the normal limits, because their controls have failed', ['Cells that have stopped dividing', 'Cells that divide by meiosis', 'Cells with no DNA']],
    ['Why do most cancers become more common with age?', 'Mutations in several control genes usually have to build up in one cell, and that takes time.', ['Older cells divide faster on purpose.', 'Cancer cells come from outside the body later in life.', 'Checkpoints only exist in young people.']],
    ['Which proteins build up and switch on the enzymes that push a cell into the next phase?', 'Cyclins', ['Antibodies', 'Hemoglobin', 'Amylase']]
  ];
  var GENES = [['A mutation makes a growth-signal protein stay switched on even with no signal.', 'Gas pedal stuck down (an oncogene)'], ['A mutation breaks the gene for p53, so damaged cells are no longer stopped.', 'Broken brake (a tumor suppressor gene lost)'], ['A mutation makes a receptor send "divide" signals constantly.', 'Gas pedal stuck down (an oncogene)'], ['A mutation destroys a protein that normally stops the cycle at the G1 checkpoint.', 'Broken brake (a tumor suppressor gene lost)'], ['A mutation makes a cyclin-activated enzyme work even when cyclin is absent.', 'Gas pedal stuck down (an oncogene)'], ['A mutation removes a protein that tells badly damaged cells to destroy themselves.', 'Broken brake (a tumor suppressor gene lost)'], ['A mutation makes a cell produce extra copies of a growth-factor receptor, so it divides at the faintest signal.', 'Gas pedal stuck down (an oncogene)']];
  G('hsbio.cell-cycle-control', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var c = R.pick(CHK); return { q: 'Which checkpoint asks this question?<br><i>' + c[0] + '</i>', a: mcKeep(CHKN, CHKN.indexOf(c[1])), hint: 'G1: ready to copy? G2: copied correctly? M: attached to the spindle?', steps: ['G1: size, nutrients, signals, DNA damage. G2: DNA copied completely and correctly. M: every chromosome attached to the spindle.', 'So: <b>' + c[1] + '</b>.'] }; }
    if (L === 2) { var t = R.pick(CAN_TR); return { q: t[0], a: mc(t[1], t[2]), viz: quiet('bi-feedback', { mode: 'chain', steps: ['Growth signal', 'Cyclins switch on the cycle', 'Checkpoint proteins inspect', 'Next phase'] }), hint: 'Cancer is uncontrolled division of the body\'s own cells.', steps: ['Cancer cells are the body\'s own cells whose gas pedals (proto-oncogenes turned oncogenes) or brakes (tumor suppressor genes such as p53) have been damaged by several mutations.', 'So: <b>' + t[1] + '</b>'] }; }
    if (R.coin()) { var sc = R.pick([['A cell has finished S phase, but one chromosome was only partly copied.', 'G2 checkpoint'], ['A small cell with too few nutrients is about to start copying its DNA.', 'G1 checkpoint'], ['In metaphase, one chromosome is attached to spindle fibers from only one pole.', 'M (spindle) checkpoint'], ['Ultraviolet light has damaged the DNA of a skin cell in G1.', 'G1 checkpoint'], ['A cell has copied its DNA, but some of the copies contain errors.', 'G2 checkpoint']]);
      return { q: sc[0] + '<br>Which checkpoint should stop this cell, and what happens if that checkpoint fails?', a: mc(sc[1] + '; the cell may divide anyway and pass on the problem', CHKN.filter(function (x) { return x !== sc[1]; }).map(function (x) { return x + '; the cell may divide anyway and pass on the problem'; }).concat([sc[1] + '; nothing, because checkpoints have no effect'])), hint: 'Where in the cycle is the cell, and what is wrong?', steps: ['G1 checks size, nutrients, signals and DNA damage before copying; G2 checks the copying; M checks the spindle attachments.', 'So the <b>' + sc[1] + '</b>. If it fails, the faulty cell can divide and pass the problem to its daughter cells.'] }; }
    var g = R.pick(GENES); return { q: g[0] + '<br>Which describes this mutation?', a: mcKeep(['Gas pedal stuck down (an oncogene)', 'Broken brake (a tumor suppressor gene lost)'], /^Gas/.test(g[1]) ? 0 : 1), hint: 'Does the normal gene push the cycle forward or stop it?', steps: [/^Gas/.test(g[1]) ? 'The normal protein pushes the cycle forward only when signaled; now it pushes all the time.' : 'The normal protein stops the cycle when something is wrong; now it cannot.', 'So: <b>' + g[1].toLowerCase() + '</b>.'] };
  });

  /* ---- meiosis ---- */
  var MEI_Q = [
    ['How many cells does meiosis make from one cell?', 'Four', ['Two', 'One', 'Eight']], ['Are the cells made by meiosis haploid or diploid?', 'Haploid', ['Diploid', 'Tetraploid', 'Some of each']],
    ['How many divisions happen in meiosis?', 'Two', ['One', 'Three', 'Four']], ['What separates in meiosis I?', 'Homologous chromosomes', ['Sister chromatids', 'Whole cells only', 'Nucleotides']],
    ['What separates in meiosis II?', 'Sister chromatids', ['Homologous chromosomes', 'Ribosomes', 'Nothing']], ['When do homologous chromosomes pair up?', 'Prophase I', ['Prophase II', 'Telophase II', 'Interphase']]
  ];
  var MEI_TR = [
    ['In which division of meiosis is the chromosome number halved?', 'Meiosis I, when homologs separate', ['Meiosis II, when sister chromatids separate', 'Both divisions halve it', 'Neither: the number never changes']],
    ['A human cell (46 chromosomes) finishes meiosis I. How many chromosomes are in each of the two cells?', '23', ['46', '92', '12']],
    ['A human cell (46 chromosomes) finishes meiosis II. How many chromosomes are in each of the four cells?', '23', ['11', '46', '12']],
    ['Is the DNA copied again between meiosis I and meiosis II?', 'No', ['Yes, in a second S phase', 'Only in plants', 'Yes, twice']]
  ];
  var MEI_ST = [['prophase1', 'prophase I'], ['metaphase1', 'metaphase I'], ['anaphase1', 'anaphase I'], ['telophase1', 'telophase I'], ['metaphase2', 'metaphase II'], ['anaphase2', 'anaphase II'], ['telophase2', 'telophase II']];
  G('hsbio.meiosis', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick(MEI_Q); return { q: q[0], a: mc(q[1], q[2]), viz: quiet('bi-meiosis', { pairs: 2, stage: 'telophase2' }), hint: 'Two divisions, four haploid cells; homologs part first, then chromatids.', steps: ['Meiosis is two divisions: homologs separate in meiosis I, sister chromatids in meiosis II, giving four haploid cells.', 'So: <b>' + q[1] + '</b>'] }; }
    if (L === 2) { var t = R.pick(MEI_TR); return { q: t[0], a: mc(t[1], t[2]), hint: 'The number halves only once.', steps: ['Homologs separate in meiosis I, so each cell gets one of each pair: the number halves there (46 → 23). Meiosis II separates sister chromatids, so the number stays 23.', 'So: <b>' + t[1] + '</b>'] }; }
    var sp = R.pick(SPECIES), tn = sp[1], st = R.pick(MEI_ST), c = B().counts(tn, st[0]), ask = R.coin() ? 'chromosomes' : 'chromatids', per = /telophase|2$/.test(st[0]) ? 'in each cell' : 'in the cell';
    return { q: 'A ' + sp[0] + ' cell ($2n = ' + tn + '$) goes through meiosis. How many <b>' + ask + '</b> are there ' + per + ' at ' + st[1] + '? (Once sister chromatids separate, count each as a chromosome.)', a: num(c[ask]), hint: 'The number halves in meiosis I; meiosis II separates chromatids.',
      steps: ['Start: ' + tn + ' chromosomes, copied in interphase to ' + 2 * tn + ' chromatids.', st[0].slice(-1) === '1' && st[0] !== 'telophase1' ? 'In meiosis I before the cell splits, all ' + tn + ' chromosomes (' + 2 * tn + ' chromatids) are still in one cell.' : st[0] === 'telophase1' ? 'After meiosis I each cell has one of each pair: $' + tn + ' \\div 2 = ' + tn / 2 + '$ chromosomes, still ' + tn + ' chromatids.' : st[0] === 'metaphase2' ? 'In metaphase II each cell has ' + tn / 2 + ' chromosomes, each still two chromatids (' + tn + ').' : st[0] === 'anaphase2' ? 'In anaphase II the ' + tn + ' chromatids in each cell separate, each counted as a chromosome: ' + tn + ' chromosomes.' : 'After meiosis II each of four cells has ' + tn / 2 + ' single-chromatid chromosomes.',
        'So the answer is <b>' + c[ask] + '</b>.'] };
  });

  /* ---- variation from meiosis ---- */
  var VAR_TR = [
    ['Crossing over happens between which chromosomes?', 'Homologous chromosomes (non-sister chromatids)', ['Sister chromatids of one chromosome', 'Any two chromosomes in the cell', 'Chromosomes in two different cells']],
    ['Why would crossing over between sister chromatids create no new combinations?', 'Sister chromatids are identical copies.', ['Sister chromatids are on different cells.', 'Sister chromatids have no genes.', 'It would create too many combinations.']],
    ['In metaphase I, how does the way one homologous pair lines up affect the next pair?', 'It does not: each pair lines up independently.', ['The next pair must line up the same way.', 'The next pair must line up the opposite way.', 'Only the first pair can line up.']],
    ['When does crossing over happen?', 'Prophase I, while homologs are paired', ['Anaphase II', 'Telophase I', 'Interphase, during S']],
    ['Which two processes in meiosis make gametes genetically different?', 'Crossing over and independent assortment', ['DNA copying and cytokinesis', 'Mitosis and cytokinesis', 'Osmosis and diffusion']]
  ];
  G('hsbio.meiosis-variation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var n = R.int(1, 10); var pv = { q: 'A species has ' + n + ' homologous pair' + (n > 1 ? 's' : '') + ' of chromosomes ($n = ' + n + '$). How many different chromosome combinations can its gametes have from independent assortment alone?', a: num(Math.pow(2, n)), hint: 'Each pair can line up two ways.', steps: ['Each pair sorts 2 ways, independently of the others.', '$2^{' + n + '} = ' + Math.pow(2, n) + '$ combinations.'] }; if (n <= 3) pv.viz = quiet('bi-meiosis', { pairs: n, stage: 'metaphase1' }); return pv; }
    if (L === 2) { var t = R.pick(VAR_TR); return { q: t[0], a: mc(t[1], t[2]), viz: quiet('bi-meiosis', { pairs: 2, stage: 'prophase1' }), hint: 'Crossing over: between homologs. Assortment: each pair on its own.', steps: ['Crossing over swaps pieces between non-sister chromatids of homologs in prophase I; each pair lines up independently in metaphase I.', 'So: <b>' + t[1] + '</b>'] }; }
    var sp = R.pick(SPECIES.filter(function (s) { return s[1] <= 24; }).concat([['human', 46]])), tn = sp[1], n = tn / 2, comb = Math.pow(2, n), shape = R.coin() && n <= 8;
    if (shape) return { q: 'A ' + sp[0] + ' has $2n = ' + tn + '$. Counting independent assortment only, how many chromosome combinations are possible when one gamete from each of two parents combine?', a: num(comb * comb), hint: 'Find the combinations for one gamete first, then multiply for two.', steps: ['Pairs: $n = ' + tn + ' \\div 2 = ' + n + '$.', 'One gamete: $2^{' + n + '} = ' + commas(comb) + '$.', 'Two gametes: $' + commas(comb) + ' \\times ' + commas(comb) + ' = ' + commas(comb * comb) + '$.'] };
    return { q: 'A ' + sp[0] + ' has $2n = ' + tn + '$. How many different chromosome combinations can one of its gametes have from independent assortment alone?', a: num(comb), hint: 'First find the number of pairs, n.', steps: ['Pairs: $n = ' + tn + ' \\div 2 = ' + n + '$.', '$2^{' + n + '} = ' + commas(comb) + '$.', 'Crossing over adds far more variety on top of this.'] };
  });

  /* ---- mitosis and meiosis compared ---- */
  var CMP = [
    ['Makes two identical daughter cells', 0], ['Makes four haploid daughter cells', 1], ['Includes crossing over between homologs', 1], ['Homologous pairs line up in the middle of the cell', 1], ['Used for growth and repair', 0], ['Makes gametes', 1], ['Daughter cells have the same chromosome number as the parent', 0], ['Has two divisions', 1],
    ['The DNA is copied once beforehand, in S phase', 2], ['Sister chromatids separate at some point', 2], ['Spindle fibers move the chromosomes', 2], ['Daughter cells are genetically different from each other', 1]
  ];
  G('hsbio.mitosis-vs-meiosis', function (R, ctx) {
    var L = lv(ctx), K = ['Mitosis', 'Meiosis', 'Both'];
    if (L === 1) { var c = R.pick(CMP); return { q: 'Mitosis, meiosis or both?<br><i>' + c[0] + '</i>', a: mcKeep(K, c[1]), hint: 'Mitosis: 1 division, 2 identical diploid cells. Meiosis: 2 divisions, 4 different haploid cells.', steps: ['Mitosis: one division of sister chromatids, two identical cells. Meiosis: homologs pair and separate, then chromatids; four different haploid cells.', 'So: <b>' + K[c[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      var it = R.pick([
        ['Which outcome is impossible for either kind of division?', 'Four identical diploid cells', ['Two identical diploid cells', 'Four different haploid cells', 'Two cells with the same chromosome number as the parent']],
        ['A cell divides once and makes two cells, each with the parent\'s chromosome number. Which division was it?', 'Mitosis', ['Meiosis', 'Meiosis I only', 'Both']],
        ['Which pairs a division with its result correctly?', 'Meiosis: four genetically different haploid cells', ['Meiosis: four identical cells', 'Mitosis: two haploid cells', 'Mitosis: four diploid cells']],
        ['In which division do homologous chromosomes separate?', 'Meiosis I only', ['Mitosis only', 'Meiosis II only', 'Both mitosis and meiosis II']]]);
      return { q: it[0], a: mc(it[1], it[2]), hint: 'Count the divisions and ask what separates.', steps: ['Mitosis: one division separating sister chromatids, two identical diploid cells. Meiosis: homologs separate in meiosis I, chromatids in meiosis II, four different haploid cells.', 'So: <b>' + it[1] + '</b>'] };
    }
    var sp = R.pick(SPECIES), tn = sp[1], mei = R.coin();
    return { q: 'A ' + sp[0] + ' cell ($2n = ' + tn + '$) divides by <b>' + (mei ? 'meiosis' : 'mitosis') + '</b>. How many cells are made, and how many chromosomes are in each?', a: { t: 'multi', parts: [{ label: 'Number of cells', a: num(mei ? 4 : 2) }, { label: 'Chromosomes in each cell', a: num(mei ? tn / 2 : tn) }] }, hint: mei ? 'Two divisions; the number halves once.' : 'One division; the number stays the same.',
      steps: mei ? ['Meiosis: two divisions make 4 cells.', 'Each is haploid: $' + tn + ' \\div 2 = ' + tn / 2 + '$ chromosomes.'] : ['Mitosis: one division makes 2 cells.', 'Each keeps the parent\'s number: ' + tn + ' chromosomes.'] };
  });
})(typeof window !== "undefined" ? window.MathLadder : global.MathLadder);

/* ---- part B ---- */
/* High School Biology (Biology Ladder, course key hsbio), part B: units 7-12 (Genetics, DNA and Gene Expression,
   Biotechnology, Evolution, Ecology, Homeostasis and the Body). Problem generators for all 51 topics of those units.
   Source files: /tmp/work_hsbio_B/gen/u7.js … u12.js, joined by /tmp/work_hsbio_B/build.sh into out/gen.js, merged with
   part A by /tmp/merge_parts.js. Conventions: /tmp/work_bio/overview.md. Facts come from MathLadder.bio (crosses, the
   codon table, mutation types, Hardy-Weinberg, gels, trees, Simpson's index, feedback loops), so pictures and answers agree.
   Levels: 1 one clear case; 2 the topic's trouble spot; 3 several items, a two-step calculation or a data reading.
   Independent checks: /tmp/work_hsbio_B/verify.js recomputes every answer by a different route. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T;
  function B() { return ML.bio; }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  function fix(x) { return +(+x).toPrecision(12); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  // multiple choice: right answer first (makeProblem shuffles), duplicates dropped
  function mc(right, wrongs) { var ch = [right]; wrongs.forEach(function (w) { if (ch.indexOf(w) < 0) ch.push(w); }); return { t: 'mc', choices: ch, v: 0 }; }
  // multiple choice in a fixed order (for lists that read best in order)
  function mcKeep(choices, right) { return { t: 'mc', choices: choices, v: choices.indexOf(right), keep: true }; }
  // choose all that apply: items [[text, isRight], …]
  function mcAll(items) { return { t: 'mc', choices: items.map(function (x) { return x[0]; }), v: items.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) }; }
  function num(v, o) { var a = { t: 'num', v: String(fix(v)) }; if (o) Object.keys(o).forEach(function (k) { a[k] = o[k]; }); return a; }
  // a fraction answer (any equal form accepted: 1/4, 0.25, 25%)
  function fracA(n, d) { var g = gcd(n, d) || 1; return { t: 'num', v: (n / g) + '/' + (d / g) }; }
  function fracTex(n, d) { return T.frac(n, d); }
  // a base sequence typed by the learner: accept it run together, split in codons, or letter by letter
  function seqA(s) { var c = s.match(/.{1,3}/g).join(' '), l = s.split('').join(' '); return { t: 'text', v: uniq([s, c, l, s.match(/.{1,3}/g).join('-')]), strict: true }; }
  // a protein typed as three-letter names: Met-Phe-Gly, Met Phe Gly, Met, Phe, Gly
  function protA(names) { return { t: 'text', v: uniq([names.join('-'), names.join(' '), names.join(', '), names.join(','), names.join(' - '), names.join('')]), strict: true }; }
  function fmtG(g) { return String(g).replace(/X([A-Za-z])/g, 'X<sup>$1</sup>').replace(/I([AB])/g, 'I<sup>$1</sup>'); } // same as the kit's B.fmtGenotype (that one loads with the visuals only)
  function letterOf(i) { return String.fromCharCode(65 + i); }
  function randSeq(R, n, avoid) { // random DNA bases, avoiding substrings in avoid
    for (var tries = 0; tries < 200; tries++) { var s = ''; for (var i = 0; i < n; i++) s += R.pick(['A', 'T', 'G', 'C']); if (!(avoid || []).some(function (x) { return s.indexOf(x) >= 0; })) return s; }
    return s;
  }
  function pct(x) { return T.num(fix(x)) + '%'; }
  /* ===================================== Unit 7: Genetics ===================================== */
  // pea traits [dominant letter, recessive letter, dominant form, recessive form] (Mendel's seven traits; no letter i: ABO uses it)
  var PEA = [['R', 'r', 'round seeds', 'wrinkled seeds'], ['Y', 'y', 'yellow seeds', 'green seeds'], ['P', 'p', 'purple flowers', 'white flowers'],
    ['T', 't', 'tall stems', 'short stems'], ['G', 'g', 'green pods', 'yellow pods'], ['F', 'f', 'inflated pods', 'constricted pods'], ['A', 'a', 'flowers along the stem', 'flowers at the stem tip']];
  // other one-gene traits with complete dominance [organism, D, d, dominant, recessive]
  var MONO = [['pea plants', 'T', 't', 'tall', 'short'], ['pea plants', 'P', 'p', 'purple flowers', 'white flowers'], ['guinea pigs', 'B', 'b', 'black fur', 'brown fur'],
    ['pea plants', 'R', 'r', 'round seeds', 'wrinkled seeds'], ['tomato plants', 'H', 'h', 'hairy stems', 'smooth stems'], ['fruit flies', 'N', 'n', 'normal wings', 'curly wings'],
    ['rabbits', 'E', 'e', 'black fur', 'brown fur'], ['corn plants', 'S', 's', 'smooth kernels', 'wrinkled kernels']];
  function pg(D, d, k) { return k === 2 ? D + D : k === 1 ? D + d : d + d; } // genotype with k dominant alleles
  function word(t) { return t.replace(/s$/, ''); }

  /* ---------- Mendel's Experiments ---------- */
  G('hsbio.mendel', function (R, ctx) {
    var L = lvl(ctx), t = R.pick(PEA), D = t[0], d = t[1], dom = t[2], rec = t[3];
    var setup = 'Mendel crossed true-breeding pea plants with ' + dom + ' and true-breeding plants with ' + rec + '. Every F1 plant had ' + dom + '.';
    if (L === 1) {
      var s = R.int(0, 2);
      if (s === 0) return { q: setup + ' Which form is dominant?', a: mc(cap(dom), [cap(rec), 'Neither: the two forms blended', 'Both equally']),
        hint: 'The dominant form is the one that shows in the F1.', steps: ['The F1 got one allele from each parent, yet all showed ' + dom + '.', 'The form that shows when both alleles are present is <b>dominant</b>: ' + dom + '.'] };
      if (s === 1) return { q: setup + ' What is the genotype of the F1 plants? (' + D + ' stands for the ' + word(dom) + ' allele.)', a: mc(D + d, [D + D, d + d, D + ' only']),
        hint: 'Each F1 plant got one allele from each true-breeding parent.', steps: ['The true-breeding parents are ' + D + D + ' and ' + d + d + '.', 'Each gives one allele, so every F1 plant is <b>' + D + d + '</b>.'] };
      return { q: setup + ' The F1 plants pollinate themselves. What fraction of the F2 plants are expected to have ' + rec + '?', a: fracA(1, 4),
        hint: 'Cross ' + D + d + ' × ' + d.toUpperCase() + d + ' in a Punnett square.', steps: ['The F1 are ' + D + d + '. ' + D + d + ' × ' + D + d + ' gives ' + D + D + ', ' + D + d + ', ' + D + d + ', ' + d + d + '.', 'Only ' + d + d + ' shows ' + rec + ': 1 box of 4, so <b>¼</b>.'] };
    }
    if (L === 2) {
      if (R.coin()) return { q: setup + ' What did Mendel see when the F1 plants pollinated themselves?', a: mc('About 3 with ' + dom + ' for every 1 with ' + rec, ['All ' + dom + ': the ' + word(rec) + ' allele had been lost', 'All plants in between the two forms: the traits blended', 'About 1 with ' + dom + ' for every 1 with ' + rec]),
        hint: 'Was the recessive allele lost in the F1, or only hidden?', steps: ['The F1 are ' + D + d + ': the ' + d + ' allele is hidden, not lost.', 'In the F2, ' + d + d + ' plants appear in about ¼ of the offspring.', 'So the F2 is about <b>3 ' + dom + ' : 1 ' + rec + '</b>.'] };
      var N = 4 * R.int(25, 300), askRec = R.coin();
      return { q: setup + ' The F1 plants pollinate themselves and give ' + T.commas(N) + ' F2 plants. About how many are expected to have ' + (askRec ? rec : dom) + '?', a: num(askRec ? N / 4 : 3 * N / 4), unit: 'plants',
        hint: 'What fraction of an ' + D + d + ' × ' + D + d + ' cross shows each form?', steps: [D + d + ' × ' + D + d + ' gives ¾ ' + dom + ' and ¼ ' + rec + '.', (askRec ? '¼' : '¾') + ' of ' + T.commas(N) + ' = <b>' + T.commas(askRec ? N / 4 : 3 * N / 4) + '</b>.'] };
    }
    var tot = R.int(600, 1600), rc = Math.round(tot / 4 + R.int(-tot / 25, tot / 25)), dc = tot - rc, ratio = Math.round(dc / rc * 100) / 100;
    return { q: 'In an F2 generation, ' + T.commas(dc) + ' plants had ' + dom + ' and ' + T.commas(rc) + ' had ' + rec + '. Divide to find the ratio of ' + dom + ' to ' + rec + ', to 2 decimal places (the number x in x : 1).',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: [cap(dom), cap(rec)], series: [{ name: 'F2 plants', values: [dc, rc] }], ylabel: 'Plants', values: true, quiet: true, interactive: false } },
      a: { t: 'num', v: ratio.toFixed(2), tol: 0.011 }, hint: 'Divide the larger count by the smaller one.',
      steps: [T.commas(dc) + ' ÷ ' + T.commas(rc) + ' ≈ ' + ratio.toFixed(2) + '.', 'The ratio is about <b>' + ratio.toFixed(2) + ' : 1</b>, close to the 3 : 1 expected from ' + D + d + ' × ' + D + d + '. Chance keeps real counts from being exact.'] };
  });

  /* ---------- Monohybrid Crosses ---------- */
  function monoSummary(p1, p2) { // counts of genotypes [kk, Kk, kk] in boxes of 4, and phenotype counts
    var X = B().cross(p1, p2), gk = Object.keys(X.genotypes);
    return { X: X, geno: gk, dom: X.phenotypes.dom || 0, rec: X.phenotypes.rec || 0 };
  }
  function phRatio(dom, rec, dn, rn) { if (!rec) return 'All ' + dn; if (!dom) return 'All ' + rn; var g = gcd(dom, rec); return (dom / g) + ' ' + dn + ' : ' + (rec / g) + ' ' + rn; }
  function gRatio(X, D, d) { var order = [D + D, D + d, d + d].filter(function (g) { return X.genotypes[g]; }), c = order.map(function (g) { return X.genotypes[g]; }), gg = c.reduce(gcd, 0); return order.length === 1 ? 'All ' + order[0] : order.map(function (g, i) { return (c[i] / gg) + ' ' + g; }).join(' : '); }
  G('hsbio.monohybrid', function (R, ctx) {
    var L = lvl(ctx), t = R.pick(MONO), org = t[0], D = t[1], d = t[2], dn = t[3], rn = t[4];
    var pairs = L === 1 ? [[1, 1], [1, 0], [2, 0], [2, 1]] : [[1, 1], [1, 0], [0, 1], [1, 2]], pr = R.pick(pairs), p1 = pg(D, d, pr[0]), p2 = pg(D, d, pr[1]);
    var S = monoSummary(p1, p2), X = S.X, intro = 'In ' + org + ', ' + dn + ' (' + D + ') is dominant to ' + rn + ' (' + d + '). Cross ' + p1 + ' × ' + p2 + '.';
    var boxes = X.grid[0].concat(X.grid[1] || []), stepBox = 'Gametes: ' + uniq(X.side).join(' or ') + ' from ' + p1 + '; ' + uniq(X.top).join(' or ') + ' from ' + p2 + '. Boxes: ' + boxes.join(', ') + '.';
    if (L === 1) {
      if (R.coin()) { var g = R.pick(uniq(boxes)); return { q: intro + ' What fraction of the offspring are expected to be ' + g + '?', a: fracA(X.genotypes[g], 4),
        hint: 'Fill the 4-box Punnett square and count the boxes.', steps: [stepBox, g + ' fills ' + X.genotypes[g] + ' of 4 boxes: <b>' + T.frac(X.genotypes[g], 4) + '</b>.'] }; }
      var wantDom = S.dom && (R.coin() || !S.rec);
      return { q: intro + ' What fraction of the offspring are expected to have ' + (wantDom ? dn : rn) + '?', a: fracA(wantDom ? S.dom : S.rec, 4),
        hint: 'Which genotypes show ' + (wantDom ? dn : rn) + '?', steps: [stepBox, (wantDom ? D + D + ' and ' + D + d + ' show ' + dn : d + d + ' shows ' + rn) + ': ' + (wantDom ? S.dom : S.rec) + ' of 4 boxes, so <b>' + T.frac(wantDom ? S.dom : S.rec, 4) + '</b>.'] };
    }
    if (L === 2) {
      var askPh = R.coin(), right = askPh ? phRatio(S.dom, S.rec, dn, rn) : gRatio(X, D, d);
      var pool = ['3 ' + dn + ' : 1 ' + rn, '1 ' + dn + ' : 1 ' + rn, '1 ' + D + D + ' : 2 ' + D + d + ' : 1 ' + d + d, '1 ' + D + d + ' : 1 ' + d + d, 'All ' + dn, '1 ' + D + D + ' : 1 ' + D + d, '1 ' + dn + ' : 2 ' + dn + ' : 1 ' + rn];
      var wrong = R.shuffle(pool.filter(function (x) { return x !== right; }));
      if (askPh && S.rec && S.dom) wrong.unshift(gRatio(X, D, d)); // the classic slip: the genotype ratio for the phenotype ratio
      return { q: intro + ' What is the ' + (askPh ? '<b>phenotype</b>' : '<b>genotype</b>') + ' ratio of the offspring?', a: mc(right, wrong.slice(0, 3)),
        hint: askPh ? 'Phenotype means the look: ' + D + D + ' and ' + D + d + ' look the same.' : 'Genotype means the alleles: count ' + D + D + ', ' + D + d + ' and ' + d + d + ' separately.',
        steps: [stepBox, 'Genotypes: <b>' + gRatio(X, D, d) + '</b>.', 'Phenotypes: <b>' + phRatio(S.dom, S.rec, dn, rn) + '</b>' + (S.dom > 1 && pr[0] + pr[1] >= 2 ? ' (' + D + D + ' and ' + D + d + ' look alike).' : '.')] };
    }
    if (R.coin()) {
      var r = R.int(0, 1), c = R.int(0, 1), gq = X.grid[r][c], others = [D + D, D + d, d + d].filter(function (x) { return x !== gq; });
      return { q: intro + ' What genotype belongs in the box marked "?"', viz: { name: 'bi-punnett', opts: { p1: p1, p2: p2, quiet: true, interactive: false, ask: [r, c] } },
        a: mc(gq, others), hint: 'Join the gamete on the left of that row with the gamete at the top of that column.', steps: ['Row gamete: ' + X.side[r] + '. Column gamete: ' + X.top[c] + '.', 'Together: <b>' + gq + '</b>.'] };
    }
    var N = 4 * R.int(10, 60), want = S.rec && R.coin() ? 'rec' : 'dom', cnt = want === 'rec' ? S.rec : S.dom;
    if (!cnt) { want = 'rec'; cnt = S.rec; }
    return { q: intro + ' The cross gives ' + N + ' offspring. About how many are expected to have ' + (want === 'rec' ? rn : dn) + '?', a: num(N * cnt / 4),
      hint: 'Find the fraction from the Punnett square, then take that fraction of ' + N + '.', steps: [stepBox, 'Fraction with ' + (want === 'rec' ? rn : dn) + ': ' + T.frac(cnt, 4) + '.', T.frac(cnt, 4) + ' of ' + N + ' = <b>' + (N * cnt / 4) + '</b>.'] };
  });

  /* ---------- The Test Cross ---------- */
  G('hsbio.test-cross', function (R, ctx) {
    var L = lvl(ctx), t = R.pick(MONO), org = t[0], D = t[1], d = t[2], dn = t[3], rn = t[4], one = org.replace(/s$/, '').replace(/ plant$/, ' plant');
    var intro = 'In ' + org + ', ' + dn + ' (' + D + ') is dominant to ' + rn + ' (' + d + '). ';
    if (L === 1) {
      if (R.coin()) return { q: intro + 'You want to find out whether one with ' + dn + ' is ' + D + D + ' or ' + D + d + '. What should you cross it with?', a: mc('One with ' + rn + ' (' + d + d + ')', ['One that is ' + D + D, 'One that is ' + D + d, 'Another one with ' + dn + ', genotype unknown']),
        hint: 'Which partner can never hide an allele?', steps: ['A ' + d + d + ' partner gives only ' + d + ', so each offspring shows the allele it got from the unknown parent.', 'So cross it with a <b>homozygous recessive (' + d + d + ')</b> one.'] };
      var isHet = R.coin();
      return { q: intro + 'An individual with ' + dn + ' is crossed with a ' + d + d + ' one. If the unknown parent is ' + (isHet ? D + d : D + D) + ', what offspring are expected?', a: mc(isHet ? 'About half ' + dn + ', half ' + rn : 'All ' + dn, isHet ? ['All ' + dn, 'About 3 ' + dn + ' : 1 ' + rn, 'All ' + rn] : ['About half ' + dn + ', half ' + rn, 'About 3 ' + dn + ' : 1 ' + rn, 'All ' + rn]),
        hint: 'Write the gametes of each parent.', steps: [(isHet ? D + d + ' gives ' + D + ' or ' + d : D + D + ' gives only ' + D) + '; ' + d + d + ' gives only ' + d + '.', isHet ? 'Offspring: ' + D + d + ' and ' + d + d + ' in equal numbers: <b>half ' + dn + ', half ' + rn + '</b>.' : 'Every offspring is ' + D + d + ': <b>all ' + dn + '</b>.'] };
    }
    if (L === 2) {
      var kind = R.pick(['some', 'few', 'many']), n, k;
      if (kind === 'some') { n = R.int(4, 12); k = R.int(1, Math.max(1, Math.floor(n / 2))); }
      else if (kind === 'few') { n = R.int(2, 3); k = 0; } else { n = R.int(14, 30); k = 0; }
      var res = (n - k) + ' with ' + dn + (k ? ' and ' + k + ' with ' + rn : ' and none with ' + rn);
      var right = kind === 'some' ? D + d + ', for certain' : kind === 'few' ? 'It could be ' + D + D + ' or ' + D + d + ': too few offspring to tell' : 'Almost surely ' + D + D;
      var all = [D + d + ', for certain', 'It could be ' + D + D + ' or ' + D + d + ': too few offspring to tell', 'Almost surely ' + D + D, D + D + ', for certain', d + d];
      var steps = kind === 'some' ? ['Each ' + rn + ' offspring is ' + d + d + ', so it got ' + d + ' from the unknown parent.', 'So the unknown parent carries ' + d + ': it is <b>' + D + d + '</b>. One recessive offspring settles it.'] :
        ['If the unknown were ' + D + d + ', each offspring would have ' + rn + ' with chance ½.', 'The chance that all ' + n + ' would still have ' + dn + ' is ' + T.frac(1, Math.pow(2, n)) + '.', kind === 'few' ? 'That happens often, so <b>' + n + ' offspring cannot tell ' + D + D + ' from ' + D + d + '</b>.' : 'That is very unlikely, so the parent is <b>almost surely ' + D + D + '</b> (never proven, only very likely).'];
      return { q: intro + 'An individual with ' + dn + ' is test-crossed with a ' + d + d + ' one. The offspring: ' + res + '. What can you conclude about the ' + dn + ' parent?',
        a: mc(right, all.filter(function (x) { return x !== right; }).slice(0, 3)), hint: 'What would a ' + rn + ' offspring tell you? What if there are none?', steps: steps };
    }
    var n3 = R.int(3, 8), what = R.pick([dn, 'the dominant trait']);
    return { q: intro + 'A ' + D + d + ' individual is crossed with a ' + d + d + ' one and has ' + n3 + ' offspring. What is the probability that all ' + n3 + ' have ' + what + '? (A tester who saw that might wrongly conclude ' + D + D + '.)',
      a: fracA(1, Math.pow(2, n3)), hint: 'Each offspring has ' + dn + ' with chance ½, independently.',
      steps: ['Each offspring of ' + D + d + ' × ' + d + d + ' is ' + D + d + ' with chance ½.', 'Independent events multiply: $\\left(\\frac{1}{2}\\right)^{' + n3 + '} = ' + T.frac(1, Math.pow(2, n3)) + '$.'] };
  });

  /* ---------- Probability Rules for Genetics ---------- */
  var GENE_L = ['A', 'B', 'C'];
  var CROSSES = [[1, 1], [1, 1], [1, 0], [2, 1], [1, 2], [0, 1], [2, 0]];
  function geneProb(k1, k2, target, D, d) { // chance (out of 4) of target: 'dom', 'rec' or a genotype string
    var X = B().cross(pg(D, d, k1), pg(D, d, k2)), c = target === 'dom' ? X.phenotypes.dom || 0 : target === 'rec' ? X.phenotypes.rec || 0 : X.genotypes[target] || 0;
    return c;
  }
  function targetText(t, D, d) { return t === 'dom' ? 'shows the dominant ' + D + ' trait' : t === 'rec' ? 'is ' + d + d : 'is ' + t; }
  G('hsbio.probability-rules', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 2 && R.coin()) {
      var t = R.pick(MONO), k = R.int(2, 4), dn = t[3], rn = t[4], Dd = t[1] + t[2];
      if (R.coin()) return { q: 'In ' + t[0] + ', ' + dn + ' is dominant to ' + rn + '. Two ' + Dd + ' parents already have ' + k + ' offspring, all with ' + dn + '. What is the probability that their next offspring has ' + rn + '?', a: fracA(1, 4),
        hint: 'Do the earlier offspring change the alleles in the next gamete?', steps: ['Each offspring is a new, independent event.', Dd + ' × ' + Dd + ' gives ' + t[2] + t[2] + ' with chance ¼ every time, whatever came before.', 'So the answer is <b>¼</b>, not more.'] };
      var het = R.coin();
      return { q: 'From ' + Dd + ' × ' + Dd + ', what is the probability that an offspring ' + (het ? 'is heterozygous (' + Dd + ')' : 'has ' + dn + ' (' + t[1] + t[1] + ' or ' + Dd + ')') + '?', a: het ? fracA(1, 2) : fracA(3, 4),
        hint: 'Add the chances of the separate ways it can happen.', steps: het ? ['Two separate ways: ' + t[1] + ' from the first parent and ' + t[2] + ' from the second (¼), or the reverse (¼).', 'Sum rule: ¼ + ¼ = <b>½</b>.'] : [t[1] + t[1] + ': ¼. ' + Dd + ': ½.', 'Sum rule: ¼ + ½ = <b>¾</b>.'] };
    }
    var ng = L === 3 ? 3 : 2, p1 = '', p2 = '', parts = [], num_ = 1, den = 1, steps = [];
    for (var i = 0; i < ng; i++) {
      var D = GENE_L[i], d = D.toLowerCase(), cr = R.pick(CROSSES), g1 = pg(D, d, cr[0]), g2 = pg(D, d, cr[1]);
      var X = B().cross(g1, g2), opts = ['dom', 'rec'].concat(Object.keys(X.genotypes)).filter(function (o) { return geneProb(cr[0], cr[1], o, D, d) > 0; });
      var tg = R.pick(opts), c = geneProb(cr[0], cr[1], tg, D, d);
      p1 += g1; p2 += g2; parts.push(targetText(tg, D, d)); num_ *= c; den *= 4;
      steps.push('Gene ' + D + ': ' + g1 + ' × ' + g2 + ' → ' + (tg === 'dom' ? 'dominant look' : tg === 'rec' ? d + d : tg) + ' with chance ' + T.frac(c, 4) + '.');
    }
    var two = L === 1 && R.chance(0.3);
    if (two) { // two children in a row
      var t2 = R.pick(MONO), Dd2 = t2[1] + t2[2], first = R.pick(['dom', 'rec']), second = R.pick(['dom', 'rec']), c1 = first === 'dom' ? 3 : 1, c2 = second === 'dom' ? 3 : 1;
      return { q: 'In ' + t2[0] + ', ' + t2[3] + ' is dominant to ' + t2[4] + '. Two ' + Dd2 + ' parents have two offspring. What is the probability that the first has ' + (first === 'dom' ? t2[3] : t2[4]) + ' and the second has ' + (second === 'dom' ? t2[3] : t2[4]) + '?',
        a: fracA(c1 * c2, 16), hint: 'Each offspring is independent: multiply.', steps: ['First: ' + T.frac(c1, 4) + '. Second: ' + T.frac(c2, 4) + '.', 'Product rule: ' + T.frac(c1, 4) + ' × ' + T.frac(c2, 4) + ' = <b>' + T.frac(c1 * c2, 16) + '</b>.'] };
    }
    var g = gcd(num_, den);
    steps.push('The genes are on different chromosomes, so multiply: <b>' + (num_ ? T.frac(num_, den) : '0') + '</b>.');
    return { q: 'Genes ' + GENE_L.slice(0, ng).join(', ').replace(/, (\w)$/, ' and $1') + ' are on different chromosomes, and each capital letter is a dominant allele. In the cross ' + p1 + ' × ' + p2 + ', what is the probability that an offspring ' + parts.join(', ').replace(/, ([^,]*)$/, ' and $1') + '?',
      a: fracA(num_, den), hint: 'Find the chance for each gene on its own, then multiply.', steps: steps };
  });

  /* ---------- Dihybrid Crosses ---------- */
  // Mendel's letters: R (round) and Y (yellow)
  var DI = [['RrYy', 'RrYy'], ['RrYy', 'rryy'], ['RrYy', 'Rryy'], ['RrYy', 'rrYy'], ['Rryy', 'rrYy'], ['RrYy', 'RRYY'], ['RRYy', 'rrYy']];
  var DI_NAMES = { 'dom/dom': 'round yellow', 'dom/rec': 'round green', 'rec/dom': 'wrinkled yellow', 'rec/rec': 'wrinkled green' };
  function diRatio(X) { var c = Object.keys(X.phenotypes).map(function (k) { return X.phenotypes[k]; }).sort(function (a, b) { return b - a; }); return c.length === 1 ? 'All one phenotype' : B().ratio(c).replace(/:/g, ' : '); }
  G('hsbio.dihybrid', function (R, ctx) {
    var L = lvl(ctx), key = 'In peas, round seeds (R) are dominant to wrinkled (r), and yellow seeds (Y) are dominant to green (y). The genes are on different chromosomes.';
    if (L === 1) {
      var pool = ['AaBb', 'AABb', 'AaBB', 'Aabb', 'aaBb', 'AaBbCc', 'AaBbcc', 'AABbCc'], g = R.pick(pool), gm = B().uniqueGametes(g);
      if (g.length === 6 || R.coin()) return { q: 'How many different kinds of gametes can an organism with genotype ' + g + ' make? (The genes are on different chromosomes.)', a: num(gm.length),
        hint: 'Each heterozygous gene doubles the number of kinds.', steps: ['A gamete gets one allele of each gene.', 'Heterozygous genes: ' + B().genes(g).filter(function (p) { return p[0] !== p[1]; }).map(function (p) { return p.join(''); }).join(', ') + '. Each gives 2 choices; a homozygous gene gives 1.', 'Kinds: ' + gm.join(', ') + ': <b>' + gm.length + '</b>.'] };
      var genes = B().genes(g), wrong1 = genes.map(function (p) { return p.join(''); }).join(', '), wrong2 = uniq([].concat.apply([], genes)).join(', ');
      var wrong3 = gm.length > 2 ? [gm[0], gm[gm.length - 1]].join(', ') : uniq(genes.map(function (p) { return p[0] + p[0]; }).concat(genes.map(function (p) { return p[1] + p[1]; }))).join(', ');
      return { q: 'Which list gives all the gametes of ' + g + '?', a: mc(gm.join(', '), [wrong1, wrong2, wrong3]),
        hint: 'Each gamete has exactly one allele of each gene.', steps: ['Pair each allele of the first gene with each allele of the second, like FOIL.', 'Gametes: <b>' + gm.join(', ') + '</b>.'] };
    }
    var cr = R.pick(L === 2 ? DI : DI.slice(0, 5)), X = B().cross(cr[0], cr[1]);
    if (L === 2) {
      var right = diRatio(X), pool2 = ['9 : 3 : 3 : 1', '1 : 1 : 1 : 1', '3 : 3 : 1 : 1', '3 : 1', '1 : 2 : 1', '1 : 1', 'All one phenotype', '9 : 7'].filter(function (x) { return x !== right; });
      var ph = Object.keys(X.phenotypes).sort(function (a, b) { return X.phenotypes[b] - X.phenotypes[a]; });
      return { q: key + ' What is the phenotype ratio of ' + cr[0] + ' × ' + cr[1] + '? (Largest group first.)', a: mc(right, R.sample(pool2, 3)),
        hint: 'Find each gene\'s ratio on its own, then combine them with the product rule.', steps: ['Gametes: ' + uniq(X.side).join(', ') + ' × ' + uniq(X.top).join(', ') + '.', 'Phenotypes out of ' + X.total + ': ' + ph.map(function (k) { return X.phenotypes[k] + ' ' + DI_NAMES[k]; }).join(', ') + '.', 'Ratio: <b>' + right + '</b>.'] };
    }
    var phs = Object.keys(X.phenotypes), pk = R.pick(phs), N = X.total * R.int(5, 40), cnt = X.phenotypes[pk];
    return { q: key + ' A cross of ' + cr[0] + ' × ' + cr[1] + ' gives ' + N + ' seeds. About how many are expected to be ' + DI_NAMES[pk] + '?', a: num(N * cnt / X.total), unit: 'seeds',
      hint: 'Find the chance for each gene, multiply, then take that fraction of ' + N + '.', steps: ['Shape: ' + cr[0].slice(0, 2) + ' × ' + cr[1].slice(0, 2) + '; color: ' + cr[0].slice(2) + ' × ' + cr[1].slice(2) + '.',
        'Chance of ' + DI_NAMES[pk] + ' = ' + T.frac(cnt, X.total) + ' (' + cnt + ' of ' + X.total + ' boxes).', T.frac(cnt, X.total) + ' × ' + N + ' = <b>' + (N * cnt / X.total) + '</b>.'] };
  });

  /* ---------- Incomplete Dominance and Codominance ---------- */
  var PATTERN = [['Red snapdragons crossed with white snapdragons give pink offspring.', 'Incomplete dominance'], ['Red four o\'clock flowers crossed with white ones give pink flowers.', 'Incomplete dominance'],
    ['A red-coated bull and a white-coated cow have a calf whose coat has red hairs and white hairs mixed together (a roan coat).', 'Codominance'], ['A person with alleles I<sup>A</sup> and I<sup>B</sup> has both A and B markers on the red blood cells.', 'Codominance'],
    ['Black chickens crossed with white chickens give speckled chicks with some all-black and some all-white feathers.', 'Codominance'], ['True-breeding purple peas crossed with white peas give all purple offspring.', 'Complete dominance'],
    ['Black guinea pigs (BB) crossed with brown ones (bb) give all black pups.', 'Complete dominance'], ['Long radishes crossed with round radishes give oval radishes, in between the two.', 'Incomplete dominance']];
  var COLOR = { 2: 'red', 1: 'pink', 0: 'white' };
  G('hsbio.incomplete-codominance', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var p = R.pick(PATTERN); return { q: p[0] + ' Which pattern of inheritance is this?', a: mcKeep(['Complete dominance', 'Incomplete dominance', 'Codominance'], p[1]),
      hint: 'Does the heterozygote look like one parent, look in between, or show both traits at once?', steps: [{ 'Complete dominance': 'The heterozygote looks just like one parent.', 'Incomplete dominance': 'The heterozygote is in between the two parents.', 'Codominance': 'Both parents\' traits show fully at the same time.' }[p[1]], 'So it is <b>' + p[1].toLowerCase() + '</b>.'] }; }
    var crs = [[1, 1], [1, 0], [2, 1], [2, 0], [1, 1]], cr = R.pick(crs), g1 = pg('R', 'r', cr[0]), g2 = pg('R', 'r', cr[1]), X = B().cross(g1, g2, 'incomplete');
    var cnt = { 2: X.genotypes.RR || 0, 1: X.genotypes.Rr || 0, 0: X.genotypes.rr || 0 };
    if (L === 2) {
      var opts = [2, 1, 0].filter(function (k) { return cnt[k]; }), k = R.pick(opts.length > 1 && R.chance(0.8) ? opts : [2, 1, 0]);
      return { q: 'In snapdragons, RR is red, Rr is pink and rr is white. A ' + COLOR[cr[0]] + ' plant is crossed with a ' + COLOR[cr[1]] + ' plant. What fraction of the offspring are expected to be ' + COLOR[k] + '?',
        a: cnt[k] ? fracA(cnt[k], 4) : num(0), hint: 'Write each parent\'s genotype first. Each genotype has its own color.',
        steps: [cap(COLOR[cr[0]]) + ' is ' + g1 + ' and ' + COLOR[cr[1]] + ' is ' + g2 + '.', 'Boxes: ' + X.grid[0].concat(X.grid[1]).join(', ') + '.', cap(COLOR[k]) + ' (' + pg('R', 'r', k) + '): <b>' + (cnt[k] ? T.frac(cnt[k], 4) : '0') + '</b>.'] };
    }
    var n = 4 * R.int(20, 60), obs = [2, 1, 0].map(function (k) { return cnt[k] ? Math.round(n * cnt[k] / 4) + R.int(-4, 4) : 0; });
    var desc = [2, 1, 0].filter(function (k) { return obs[2 - k]; }).map(function (k) { return obs[2 - k] + ' ' + COLOR[k]; }).join(', ');
    var right = cap(COLOR[cr[0]]) + ' × ' + COLOR[cr[1]], cands = ['Pink × pink', 'Pink × white', 'Red × pink', 'Red × white', 'Red × red'].filter(function (x) { var a = x.toLowerCase().split(' × '); return !(a[0] === COLOR[cr[0]] && a[1] === COLOR[cr[1]]) && !(a[1] === COLOR[cr[0]] && a[0] === COLOR[cr[1]]); });
    return { q: 'In snapdragons, RR is red, Rr is pink and rr is white. A cross gives these offspring: ' + desc + '. Which parents were crossed?', a: mc(right, R.sample(cands, 3)),
      hint: 'Which ratio is it closest to: all one color, 1 : 1, or 1 : 2 : 1?', steps: ['The counts are close to ' + [2, 1, 0].filter(function (k) { return cnt[k]; }).map(function (k) { return cnt[k] + ' ' + COLOR[k]; }).join(' : ') + ' out of 4.', 'That is what ' + g1 + ' × ' + g2 + ' gives: <b>' + right.toLowerCase() + '</b>.'] };
  });

  /* ---------- Multiple Alleles: Blood Types ---------- */
  var ABO = ['IAIA', 'IAi', 'IBIB', 'IBi', 'IAIB', 'ii'];
  function abo(g) { return B().pheno(g); }
  function canHave(child, t1, t2) { return B().BLOOD[t1].some(function (g1) { return B().BLOOD[t2].some(function (g2) { return B().cross(g1, g2).phenotypes[child]; }); }); }
  G('hsbio.multiple-alleles', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      if (R.coin()) { var g = R.pick(ABO); return { q: 'What blood type does a person with genotype ' + fmtG(g) + ' have?', a: mcKeep(['A', 'B', 'AB', 'O'], abo(g)),
        hint: 'I<sup>A</sup> and I<sup>B</sup> are codominant, and both are dominant to i.', steps: [g === 'ii' ? 'Two i alleles: no A or B marker.' : g === 'IAIB' ? 'I<sup>A</sup> and I<sup>B</sup> both show (codominant).' : 'One or two ' + fmtG(g.slice(0, 2)) + ' alleles; i is recessive.', 'Blood type <b>' + abo(g) + '</b>.'] }; }
      var ty = R.pick(['A', 'B', 'AB', 'O']), right = B().BLOOD[ty].map(fmtG).join(' or ');
      var wr = ['A', 'B', 'AB', 'O'].filter(function (x) { return x !== ty; }).map(function (x) { return B().BLOOD[x].map(fmtG).join(' or '); });
      if (ty === 'A') wr.push(fmtG('IAIA') + ' only'); if (ty === 'B') wr.push(fmtG('IBi') + ' only');
      return { q: 'Which genotypes give blood type ' + ty + '?', a: mc(right, wr), hint: 'Remember that i is recessive to both I<sup>A</sup> and I<sup>B</sup>.', steps: ['Type ' + ty + ': <b>' + right + '</b>.'] };
    }
    if (L === 2) {
      var g1 = R.pick(ABO), g2 = R.pick(ABO), X = B().cross(g1, g2), types = Object.keys(X.phenotypes), ty2 = R.chance(0.85) ? R.pick(types) : R.pick(['A', 'B', 'AB', 'O']), c = X.phenotypes[ty2] || 0;
      return { q: 'Parents with genotypes ' + fmtG(g1) + ' and ' + fmtG(g2) + ' have a child. What is the probability that the child has blood type ' + ty2 + '?', a: c ? fracA(c, 4) : num(0),
        hint: 'Fill a 4-box square with each parent\'s two alleles.', steps: ['Gametes: ' + X.side.map(fmtG).join(' or ') + '; ' + X.top.map(fmtG).join(' or ') + '.', 'Boxes: ' + X.grid[0].concat(X.grid[1]).map(function (b) { return fmtG(b) + ' (' + abo(b) + ')'; }).join(', ') + '.', 'Type ' + ty2 + ': <b>' + (c ? T.frac(c, 4) : '0') + '</b>.'] };
    }
    var t1 = R.pick(['A', 'B', 'AB', 'O']), t2 = R.pick(['A', 'B', 'AB', 'O']), ch = R.pick(['A', 'B', 'AB', 'O']), yes = canHave(ch, t1, t2);
    var how = yes ? (function () { for (var i = 0; i < B().BLOOD[t1].length; i++) for (var j = 0; j < B().BLOOD[t2].length; j++) { var a1 = B().BLOOD[t1][i], a2 = B().BLOOD[t2][j]; if (B().cross(a1, a2).phenotypes[ch]) return 'Yes: for example, ' + fmtG(a1) + ' × ' + fmtG(a2) + ' can give a type ' + ch + ' child (' + B().BLOOD[ch].map(fmtG).join(' or ') + ').'; } })() :
      'Type ' + ch + ' needs ' + B().BLOOD[ch].map(fmtG).join(' or ') + '. No genotype of a type ' + t1 + ' parent and a type ' + t2 + ' parent can supply those alleles, so <b>no</b>.';
    return { q: 'Can parents with blood types ' + t1 + ' and ' + t2 + ' have a child with blood type ' + ch + '?', a: mcKeep(['Yes', 'No'], yes ? 'Yes' : 'No'),
      hint: 'List the genotypes each parent could have, and the alleles each could pass on.', steps: ['Type ' + t1 + ': ' + B().BLOOD[t1].map(fmtG).join(' or ') + '. Type ' + t2 + ': ' + B().BLOOD[t2].map(fmtG).join(' or ') + '.', how] };
  });

  /* ---------- Polygenic Traits and the Environment ---------- */
  var CONT = ['Height in people', 'The color of wheat kernels', 'The length of corn ears', 'The weight of pumpkins in a field', 'Milk yield of dairy cows'];
  var DISC = ['ABO blood type', 'Round or wrinkled pea seeds', 'Purple or white pea flowers', 'Red, pink or white snapdragon flowers', 'Normal or curly wings in fruit flies'];
  function nCr(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  G('hsbio.polygenic', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      if (R.coin()) { var c = R.pick(CONT), ds = R.sample(DISC, 3); return { q: 'Which trait is most likely polygenic, with a smooth range of values instead of a few clear types?', a: mc(c, ds),
        hint: 'Which one is measured on a scale rather than sorted into a few kinds?', steps: [c + ' varies over a continuous range, shaped by many genes and the environment.', 'The others fall into a few clear types set mostly by one gene.', 'Answer: <b>' + c.toLowerCase() + '</b>.'] }; }
      var sp = R.pick(['corn', 'tomato', 'wheat', 'sunflower']);
      return { q: 'Cuttings from one ' + sp + ' plant, so all with the same genes, are grown in rich soil and in poor soil. The plants in rich soil grow much taller. What explains the difference?', a: mc('The environment: the genes are the same', ['Different genes in the two groups', 'Mutations caused by the poor soil', 'The plants in rich soil inherited more height alleles']),
        hint: 'What differs between the two groups?', steps: ['Cuttings of one plant have identical genes.', 'Only the soil differs, so the difference comes from <b>the environment</b>.'] };
    }
    var ng = R.int(2, L === 2 ? 8 : 4);
    if (L === 2) return { q: 'A trait is set by ' + ng + ' genes, and each capital allele adds one dose of pigment. Two plants heterozygous for all ' + ng + ' genes are crossed. How many different shades can the offspring have?', a: num(2 * ng + 1),
      hint: 'How many alleles of these genes does each offspring have? Count from 0 capitals up to all capitals.', steps: ['Each offspring has ' + 2 * ng + ' alleles of these genes.', 'The number of capital alleles can be 0, 1, … ' + 2 * ng + '.', 'That is <b>' + (2 * ng + 1) + '</b> shades.'] };
    var k = R.int(0, 2 * ng), ways = nCr(2 * ng, k), tot = Math.pow(4, ng), genotype = GENE_L.slice(0, ng).map(function (x) { return x + x.toLowerCase(); }).join('');
    return { q: 'Kernel color is set by ' + ng + ' genes, and each capital allele adds one dose of red pigment. In ' + genotype + ' × ' + genotype + ', what fraction of the offspring have exactly ' + k + ' capital allele' + (k === 1 ? '' : 's') + '?',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: Array.from({ length: 2 * ng + 1 }, function (_, i) { return String(i); }), series: [{ name: 'Offspring', values: Array.from({ length: 2 * ng + 1 }, function (_, i) { return nCr(2 * ng, i); }) }], xlabel: 'Capital alleles', ylabel: 'Offspring out of ' + tot, quiet: true, interactive: false } },
      a: fracA(ways, tot), hint: 'Each of the ' + 2 * ng + ' allele slots is a capital with chance ½. Count the ways to get ' + k + ' capitals.',
      steps: ['There are ' + 2 * ng + ' allele slots, each a capital with chance ½, so ' + tot + ' equally likely outcomes.', 'Ways to choose ' + k + ' capitals: ' + ways + ' (the bar of the chart).', 'Fraction: ' + ways + '/' + tot + ' = <b>' + T.frac(ways, tot) + '</b>.'] };
  });

  /* ---------- X-Linked Traits ---------- */
  var MOMS = ['XAXA', 'XAXa', 'XaXa'], DADS = ['XAY', 'XaY'];
  function xl(g) { return /Y/.test(g) ? (g === 'XaY' ? 'color blind' : 'normal vision') : g === 'XaXa' ? 'color blind' : g === 'XAXa' ? 'normal vision (carrier)' : 'normal vision'; }
  G('hsbio.x-linked', function (R, ctx) {
    var L = lvl(ctx), intro = 'Red-green color blindness is X-linked recessive: X<sup>A</sup> is normal vision, X<sup>a</sup> color blindness. ';
    if (L === 1) {
      var s = R.pick([0, 0, 1, 2]);
      if (s === 0) { var g = R.pick(MOMS.concat(DADS)); return { q: intro + 'What vision does a person with genotype ' + fmtG(g) + ' have?', a: (function () { var r = g === 'XAXa' ? 'Normal vision, and a carrier' : cap(xl(g)); return mc(r, ['Normal vision', 'Normal vision, and a carrier', 'Color blind', 'Color blind, and a carrier'].filter(function (x) { return x !== r && !(/Y/.test(g) && /carrier/.test(x) && R.coin()); })); })(),
        hint: /Y/.test(g) ? 'An XY person has only one X, so its one allele shows.' : 'With two X chromosomes, one X<sup>A</sup> is enough for normal vision.', steps: [/Y/.test(g) ? 'The Y has no allele for this gene, so the single X decides.' : g === 'XAXa' ? 'X<sup>A</sup> hides X<sup>a</sup>, but X<sup>a</sup> can be passed on.' : 'Both X chromosomes carry the same allele.', 'So: <b>' + xl(g) + '</b>.'] }; }
      if (s === 1) return { q: R.pick(['From which parent does a son (XY) get his X chromosome?', 'A son (XY) is color blind: X<sup>a</sup>Y. From which parent did he get the X<sup>a</sup> allele?', 'A son (XY) has normal vision: X<sup>A</sup>Y. Which parent gave him his X<sup>A</sup>?']), a: mc('His mother', ['His father', 'Either parent, by chance', 'Both parents']),
        hint: 'What does the father give a son?', steps: ['A son gets a Y from his father; that is what makes him XY.', 'So his X comes from <b>his mother</b>.'] };
      return { q: intro + 'How many copies of this gene does an XY person have?', a: num(1), hint: 'Does the Y chromosome carry this gene?', steps: ['The gene is on the X; the Y has no copy.', 'An XY person has <b>1</b> copy.'] };
    }
    var m = R.pick(['XAXa', 'XAXa', 'XAXA', 'XaXa']), f = R.pick(DADS), X = B().cross(m, f), boxes = [].concat.apply([], X.grid);
    var sons = boxes.filter(function (b) { return /Y/.test(b); }), dtrs = boxes.filter(function (b) { return !/Y/.test(b); });
    var stepB = 'Mother ' + fmtG(m) + ' gives ' + uniq(X.side).map(fmtG).join(' or ') + '; father ' + fmtG(f) + ' gives ' + uniq(X.top).map(fmtG).join(' or ') + '. Boxes: ' + boxes.map(fmtG).join(', ') + '.';
    if (L === 2) {
      var ask = R.pick(['son', 'daughter', 'carrier']), pool = ask === 'carrier' ? dtrs : ask === 'son' ? sons : dtrs, hit = pool.filter(function (b) { return ask === 'carrier' ? b === 'XAXa' : xl(b) === 'color blind'; }).length;
      var qq = ask === 'son' ? 'what is the probability that a <b>son</b> of theirs is color blind?' : ask === 'daughter' ? 'what is the probability that a <b>daughter</b> of theirs is color blind?' : 'what is the probability that a <b>daughter</b> of theirs is a carrier?';
      return { q: intro + 'A mother ' + fmtG(m) + ' and a father ' + fmtG(f) + ' have children. Among their children, ' + qq, a: hit ? fracA(hit, pool.length) : num(0),
        hint: 'Look only at the ' + (ask === 'son' ? 'sons (boxes with Y)' : 'daughters (boxes with two X)') + '.', steps: [stepB, cap(ask === 'son' ? 'sons' : 'daughters') + ': ' + pool.map(fmtG).join(', ') + '.', hit + ' of ' + pool.length + ': <b>' + (hit ? T.frac(hit, pool.length) : '0') + '</b>.'] };
    }
    if (R.coin()) {
      var hit2 = sons.filter(function (b) { return b === 'XaY'; }).length;
      return { q: intro + 'A mother ' + fmtG(m) + ' and a father ' + fmtG(f) + ' have a child. What is the probability that the child is a color-blind son? (Count all four boxes.)', a: hit2 ? fracA(hit2, 4) : num(0),
        hint: 'Count the boxes that are X<sup>a</sup>Y out of all four.', steps: [stepB, 'Color-blind sons (X<sup>a</sup>Y): ' + hit2 + ' of 4 boxes, so <b>' + (hit2 ? T.frac(hit2, 4) : '0') + '</b>.'] };
    }
    var cases = [['A daughter is color blind (X<sup>a</sup>X<sup>a</sup>). What must be true of her father?', 'He is color blind', ['He has normal vision', 'He is a carrier', 'Nothing can be said about him'], 'She got one X from each parent, and both are X<sup>a</sup>.', 'Her father\'s only X is X<sup>a</sup>, so <b>he is color blind</b>.'],
      ['A color-blind father and a mother with two X<sup>A</sup> chromosomes have a son. Can the son be color blind?', 'No, never', ['Yes, with chance ½', 'Yes, with chance ¼', 'Yes, always'], 'The son gets his X from his mother, who has only X<sup>A</sup>.', 'So <b>no son of theirs is color blind</b> (every daughter is a carrier).'],
      ['A mother is color blind (X<sup>a</sup>X<sup>a</sup>). What fraction of her sons will be color blind?', 'All of them', ['Half of them', 'None of them', 'It depends on the father'], 'Every son gets one of her X chromosomes, and both are X<sup>a</sup>.', 'A son\'s Y carries no allele, so <b>all her sons</b> are color blind.']];
    var cs = R.pick(cases);
    return { q: intro + cs[0], a: mc(cs[1], cs[2]), hint: 'Which parent gives a son his X? A daughter gets one X from each parent.', steps: [cs[3], cs[4]] };
  });

  /* ---------- Reading Pedigrees ---------- */
  function makePed(R, mode, kids) { // mode 'rec': unaffected Aa x Aa parents with an affected child; 'dom': affected Aa x Aa with an unaffected child
    var dads = R.coin(), p = [{ id: 'a', sex: dads ? 'm' : 'f', gen: 1, aff: mode === 'dom' }, { id: 'b', sex: dads ? 'f' : 'm', gen: 1, aff: mode === 'dom' }];
    var special = R.int(0, kids - 1), list = [];
    for (var i = 0; i < kids; i++) { var odd = i === special || R.chance(0.2); list.push({ id: 'k' + i, sex: R.coin() ? 'm' : 'f', gen: 2, parents: ['a', 'b'], aff: mode === 'rec' ? odd : !odd }); }
    return p.concat(list);
  }
  G('hsbio.pedigrees', function (R, ctx) {
    var L = lvl(ctx), mode = L === 1 ? 'rec' : R.pick(['rec', 'dom']), kids = R.int(3, 5), ppl = makePed(R, mode, kids), kidsL = ppl.slice(2);
    var viz = { name: 'bi-pedigree', opts: { people: ppl, carriers: false, interactive: false } };
    var oddKid = kidsL.filter(function (k) { return mode === 'rec' ? k.aff : !k.aff; }), lab = function (k) { return 'II-' + (kidsL.indexOf(k) + 1); };
    if (L < 3) return { q: 'In this pedigree, shaded shapes have the trait. Is the trait dominant or recessive? (It is not X-linked.)', viz: viz, a: mcKeep(['Dominant', 'Recessive'], mode === 'rec' ? 'Recessive' : 'Dominant'),
      hint: 'Look at the parents in generation I and their children. Did a child show something neither parent showed?',
      steps: mode === 'rec' ? ['Neither parent in generation I has the trait, but ' + oddKid.map(lab).join(' and ') + ' ' + (oddKid.length > 1 ? 'do' : 'does') + '.', 'The allele was hidden in both parents, so the trait is <b>recessive</b> (both parents are Aa).'] :
        ['Both parents in generation I have the trait, but ' + oddKid.map(lab).join(' and ') + ' ' + (oddKid.length > 1 ? 'do' : 'does') + ' not.', 'Each parent hid a normal allele, so the trait\'s allele is <b>dominant</b> (both parents are Aa).'] };
    if (mode === 'rec' && R.coin()) {
      var un = kidsL.filter(function (k) { return !k.aff; });
      if (un.length) { var who = R.pick(un); return { q: 'This trait is recessive. In the pedigree, what is the probability that ' + lab(who) + ' (unshaded) is a carrier (Aa)?', viz: viz, a: fracA(2, 3),
        hint: 'The parents must both be Aa. Which of their children\'s genotypes are possible for an unshaded child?', steps: ['An affected child (aa) shows both parents are Aa.', 'Aa × Aa gives AA, Aa, Aa, aa. ' + lab(who) + ' is unshaded, so not aa.', 'Of AA, Aa, Aa, two are carriers: <b>2/3</b>.'] }; }
    }
    if (mode === 'rec') return { q: 'This trait is recessive. What are the genotypes of the two parents in generation I?', viz: viz, a: mc('Both Aa', ['Both AA', 'One AA and one aa', 'Both aa']),
      hint: 'An affected child is aa. Where did its two a alleles come from?', steps: [oddKid.map(lab).join(' and ') + (oddKid.length > 1 ? ' are' : ' is') + ' aa and got an a from each parent.', 'The parents do not show the trait, so each also has an A: <b>both are Aa</b>.'] };
    var nk = R.coin();
    if (nk) return { q: 'This trait is dominant. What is the probability that the next child of the parents in generation I does <b>not</b> have the trait?', viz: viz, a: fracA(1, 4),
      hint: 'An unaffected child is aa. What does that say about the parents?', steps: ['An unaffected child (aa) shows that both affected parents are Aa.', 'Aa × Aa gives aa with chance <b>¼</b>, for every child.'] };
    var w = R.pick(oddKid);
    return { q: 'This trait is dominant. What is the genotype of ' + lab(w) + ' (unshaded)?', viz: viz, a: mc('aa', ['AA', 'Aa', 'It cannot be known']),
      hint: 'With a dominant trait, anyone who does not show it has no dominant allele.', steps: ['The trait\'s allele A is dominant, so anyone with even one A shows it.', lab(w) + ' does not show it, so <b>aa</b>.'] };
  });
  /* ===================================== Unit 8: DNA and Gene Expression ===================================== */
  var STOPS = ['UAA', 'UAG', 'UGA'];
  function senseCodons() { return Object.keys(B().CODE).filter(function (c) { return B().CODE[c] !== '*' && c !== 'AUG'; }); }
  function aaName(c) { var a = B().CODE[c]; return a === '*' ? 'Stop' : B().three(a); }
  function aaFull(a1) { return B().AA[a1][1]; }
  function dna(s) { return s.replace(/U/g, 'T'); }
  function cnt1(s, ch) { return s.split('').filter(function (x) { return x === ch; }).length; }

  /* ---------- The Structure of DNA ---------- */
  G('hsbio.dna-structure', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var s = randSeq(R, R.int(6, 9)), c = B().complement(s);
      return { q: 'One strand of DNA reads 5′-' + s + '-3′. Write the partner strand, lined up base by base under it (it runs 3′ to 5′).', viz: { name: 'bi-dna', opts: { seq: s, quiet: true, interactive: false } },
        a: seqA(c), hint: 'A pairs with T, and G pairs with C.', steps: ['Pair each base: ' + s.split('').map(function (b, i) { return b + '→' + c[i]; }).join(', ') + '.', 'The partner strand is 3′-<b>' + c + '</b>-5′.'] };
    }
    if (L === 2) {
      if (R.chance(0.3)) {
        var a = R.int(1, 4) * 5 + 10, g = 50 - a, right = 'A ' + a + '%, T ' + a + '%, G ' + g + '%, C ' + g + '%';
        return { q: 'Which set of base percentages could come from a sample of double-stranded DNA?', a: mc(right, ['A ' + a + '%, T ' + g + '%, G ' + a + '%, C ' + g + '%', 'A 25%, T 25%, G 30%, C 20%', 'A ' + a + '%, T ' + a + '%, G ' + a + '%, C ' + a + '%']),
          hint: 'In double-stranded DNA, A pairs with T and G pairs with C. The four must add to 100%.', steps: ['A must equal T, and G must equal C.', 'All four must add to 100%.', 'Only <b>' + right + '</b> does both.'] };
      }
      var known = R.pick(['A', 'T', 'G', 'C']), p = R.int(8, 42), ask = R.pick(['A', 'T', 'G', 'C'].filter(function (x) { return x !== known; }));
      var ch = B().chargaff(known === 'A' || known === 'T' ? p : 50 - p), ans = ch[ask];
      return { q: 'In a sample of double-stranded DNA, ' + p + '% of the bases are ' + known + '. What percent are ' + ask + '?', a: num(ans, { pct: true }),
        hint: 'A = T and G = C, and all four add up to 100%.', steps: [known + ' pairs with ' + B().complement(known) + ', so ' + B().complement(known) + ' is also ' + p + '%.', 'Together they make ' + 2 * p + '%, leaving ' + (100 - 2 * p) + '% for the other pair, split equally: ' + (50 - p) + '% each.', ask + ' = <b>' + ans + '%</b>.'] };
    }
    if (R.coin()) {
      var s3 = randSeq(R, R.int(8, 12)), gc = cnt1(s3, 'G') + cnt1(s3, 'C'), at = s3.length - gc, hb = 2 * at + 3 * gc;
      return { q: 'A short double-stranded DNA has one strand 5′-' + s3 + '-3′. A–T pairs are held by 2 hydrogen bonds and G–C pairs by 3. How many hydrogen bonds hold the two strands together?', a: num(hb),
        hint: 'Count the A–T pairs and the G–C pairs on this strand; each base pairs with one on the other strand.', steps: ['A or T on this strand: ' + at + ' pairs, × 2 = ' + 2 * at + '.', 'G or C: ' + gc + ' pairs, × 3 = ' + 3 * gc + '.', 'Total: <b>' + hb + '</b> hydrogen bonds.'] };
    }
    var bp = R.pick([500, 800, 1000, 1200, 1500, 2000]), tot = 2 * bp, gN = 10 * R.int(tot / 100, tot / 25), aN = (tot - 2 * gN) / 2;
    return { q: 'A DNA molecule has ' + T.commas(bp) + ' base pairs, so ' + T.commas(tot) + ' bases in all. ' + T.commas(gN) + ' of the bases are G. How many are A?', a: num(aN),
      hint: 'G = C, A = T, and all bases add up to ' + T.commas(tot) + '.', steps: ['C = G = ' + T.commas(gN) + ', so G + C = ' + T.commas(2 * gN) + '.', 'A + T = ' + T.commas(tot) + ' − ' + T.commas(2 * gN) + ' = ' + T.commas(tot - 2 * gN) + '.', 'A = T, so A = <b>' + T.commas(aN) + '</b>.'] };
  });

  /* ---------- DNA Replication ---------- */
  var ENZ = [['Helicase', 'unwinds the double helix and separates the two strands'], ['DNA polymerase', 'adds matching nucleotides to build a new strand on each template'], ['DNA ligase', 'seals the gaps between pieces of new DNA'], ['Primase', 'lays down a short RNA primer where a new strand begins']];
  G('hsbio.dna-replication', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var e = R.pick(ENZ), others = ENZ.filter(function (x) { return x !== e; }).map(function (x) { return x[0]; });
      if (R.coin()) return { q: 'During DNA replication, which enzyme ' + e[1] + '?', a: mc(e[0], others.concat(['RNA polymerase'])), hint: 'Think of the steps in order: unzip, prime, build, seal.', steps: ['<b>' + e[0] + '</b> ' + e[1] + '.'] };
      return { q: 'What does ' + (e[0] === 'Helicase' ? 'helicase' : e[0] === 'Primase' ? 'primase' : e[0]) + ' do during DNA replication?', a: mc(cap(e[1]), ENZ.filter(function (x) { return x !== e; }).map(function (x) { return cap(x[1]); })), hint: 'Think of the steps in order: unzip, prime, build, seal.', steps: [e[0] + ' ' + e[1] + '.'] };
    }
    if (L === 2) {
      if (R.coin()) { var s = randSeq(R, R.int(6, 9)), c = B().complement(s);
        return { q: 'After the helix unzips, one old strand reads 3′-' + s + '-5′. What new strand does DNA polymerase build on it? (Write it 5′ to 3′, lined up under the old strand.)', a: seqA(c),
          hint: 'The new strand is complementary: A with T, G with C.', steps: ['Pair each base of the template: ' + s.split('').map(function (b, i) { return b + '→' + c[i]; }).join(', ') + '.', 'New strand: 5′-<b>' + c + '</b>-3′.'] }; }
      return { q: 'A DNA molecule is copied once. What is each of the two new DNA molecules made of?', a: mc('One old strand and one new strand', ['Two new strands (the old molecule stays whole)', 'Two old strands', 'Pieces of old and new DNA mixed along each strand']),
        hint: 'What does each old strand serve as?', steps: ['Each old strand is a template for one new strand.', 'So each copy has <b>one old strand and one new strand</b>: semiconservative replication.'] };
    }
    var n = R.int(1, 8), tot = Math.pow(2, n), what = R.pick(['total', 'heavy', 'light', 'frac']);
    var q = 'Bacteria with only heavy-nitrogen DNA are moved to light nitrogen. Follow one DNA molecule as it is copied ' + n + ' time' + (n > 1 ? 's' : '') + '. ';
    var steps = ['Each round doubles the molecules: 2<sup>' + n + '</sup> = ' + tot + '.', 'The 2 original heavy strands are never lost; each ends up in its own hybrid (heavy + light) molecule.'];
    if (what === 'total') return { q: q + 'How many DNA molecules are there now?', a: num(tot), hint: 'Each round of copying doubles the number of molecules.', steps: [steps[0], 'There are <b>' + tot + '</b> molecules.'] };
    if (what === 'heavy') return { q: q + 'How many of the DNA molecules contain a heavy strand?', a: num(2), hint: 'How many heavy strands were there to begin with? Can a heavy strand be split?', steps: steps.concat(['So <b>2</b> molecules contain a heavy strand.']) };
    if (what === 'light' && n >= 2) return { q: q + 'How many of the DNA molecules are made of two light strands?', a: num(tot - 2), hint: 'Find the total, then take away the molecules that still hold a heavy strand.', steps: steps.concat([tot + ' − 2 = <b>' + (tot - 2) + '</b> all-light molecules.']) };
    return { q: q + 'What fraction of the DNA molecules are hybrids (one heavy and one light strand)?', a: fracA(2, tot), hint: 'How many molecules hold one of the original heavy strands?', steps: steps.concat(['Hybrids: 2 of ' + tot + ' = <b>' + T.frac(2, tot) + '</b>.']) };
  });

  /* ---------- Transcription ---------- */
  G('hsbio.transcription', function (R, ctx) {
    var L = lvl(ctx), t = randSeq(R, 3 * R.int(2, 4)), m = B().transcribe(t);
    if (L === 1) return { q: 'A gene\'s template strand reads 3′-' + t + '-5′. What mRNA is transcribed from it (5′ to 3′)?', viz: { name: 'bi-central', opts: { mode: 'transcribe', template: t, quiet: true, interactive: false, ask: 'mrna' } },
      a: seqA(m), hint: 'Pair each base: DNA A → RNA U, T → A, G → C, C → G.', steps: ['Pair each template base: ' + t.split('').map(function (b, i) { return b + '→' + m[i]; }).join(', ') + '.', 'mRNA: 5′-<b>' + m + '</b>-3′.'] };
    if (L === 2) {
      if (R.coin()) { var cod = B().complement(t);
        return { q: 'A gene\'s coding strand reads 5′-' + cod + '-3′. What is the sequence of its mRNA (5′ to 3′)?', a: seqA(B().codingToMRNA(cod)), hint: 'The mRNA matches the coding strand, with one letter swapped.', steps: ['The mRNA has the same sequence as the coding strand, with U in place of T.', 'mRNA: 5′-<b>' + B().codingToMRNA(cod) + '</b>-3′.'] }; }
      var wrong = [B().complement(t), t.replace(/T/g, 'U'), m.split('').reverse().join('')].filter(function (x) { return x !== m; });
      return { q: 'A template strand reads 3′-' + t + '-5′. Which is the mRNA made from it, written 5′ to 3′?', a: mc(m, wrong), hint: 'The mRNA is complementary to the template, and RNA uses U instead of T.',
        steps: ['Pair each base: A → U, T → A, G → C, C → G.', 'mRNA: <b>' + m + '</b>. (' + B().complement(t) + ' has T, so it is DNA, not RNA; ' + t.replace(/T/g, 'U') + ' copies the template instead of pairing with it.)'] };
    }
    if (R.coin()) return { q: 'An mRNA reads 5′-' + m + '-3′. What was the DNA template strand (3′ to 5′)?', a: seqA(t), hint: 'Each mRNA base paired with one template base: A with T, U with A, G with C, C with G.', steps: ['Pair each mRNA base: ' + m.split('').map(function (b, i) { return b + '→' + t[i]; }).join(', ') + '.', 'Template: 3′-<b>' + t + '</b>-5′.'] };
    var nA = cnt1(t, 'A'); if (!nA) { t = 'A' + t.slice(1); m = B().transcribe(t); nA = cnt1(t, 'A'); }
    return { q: 'A template strand 3′-' + t + '-5′ is transcribed. How many U bases are in the mRNA?', a: num(nA), hint: 'Which template base pairs with U?', steps: ['U in RNA pairs with A in the template.', 'The template has ' + nA + ' A' + (nA > 1 ? 's' : '') + ', so the mRNA (' + m + ') has <b>' + nA + '</b> U' + (nA > 1 ? 's' : '') + '.'] };
  });

  /* ---------- Translation ---------- */
  function orf(R, k) { var cs = ['AUG']; for (var i = 0; i < k; i++) cs.push(R.pick(senseCodons())); cs.push(R.pick(STOPS)); return cs; }
  G('hsbio.translation', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      if (R.coin()) { var k = R.int(20, 150), extra = 3 * k;
        return { q: 'An mRNA has the start codon AUG, then ' + extra + ' more bases, then a stop codon. How many amino acids are in the protein it codes for?', a: num(k + 1),
          hint: 'Three bases make one codon. Does AUG code for an amino acid? Does the stop codon?', steps: ['AUG codes for methionine: 1 amino acid.', extra + ' ÷ 3 = ' + k + ' codons, one amino acid each.', 'The stop codon adds none: 1 + ' + k + ' = <b>' + (k + 1) + '</b>.'] }; }
      var cs = orf(R, R.int(3, 6)), m = cs.join('');
      return { q: 'How many codons are in the mRNA 5′-' + m + '-3′, counting the start and stop codons?', a: num(cs.length), hint: 'Divide the number of bases by 3.', steps: ['The mRNA has ' + m.length + ' bases.', m.length + ' ÷ 3 = <b>' + cs.length + '</b> codons: ' + cs.join(' ') + '.'] };
    }
    if (L === 2) {
      var c = R.pick(senseCodons().concat(['AUG'])), anti = B().complement(c).replace(/T/g, 'U');
      if (R.coin()) return { q: 'An mRNA codon reads 5′-' + c + '-3′. What is the anticodon of the tRNA that pairs with it, written 3′ to 5′?', a: seqA(anti), hint: 'The anticodon is RNA, so it uses U. Pair A with U and G with C.', steps: ['Pair each base: ' + c.split('').map(function (b, i) { return b + '→' + anti[i]; }).join(', ') + '.', 'Anticodon: 3′-<b>' + anti + '</b>-5′. This tRNA carries ' + aaFull(B().CODE[c]) + '.'] };
      return { q: 'During translation, what does a tRNA molecule bring to the ribosome?', a: mc('One amino acid, matched to a codon by its anticodon', ['A codon, copied from the DNA', 'A whole protein', 'Three amino acids, one for each base of the codon']),
        hint: 'One end pairs with the mRNA; the other end carries something.', steps: ['A tRNA has an anticodon at one end, which pairs with one codon of the mRNA.', 'Its other end carries <b>one amino acid</b>, the one that codon stands for.'] };
    }
    var cs3 = orf(R, R.int(2, 4)), lead = randSeq(R, R.int(0, 2), ['ATG']).replace(/T/g, 'U'), m3 = lead + cs3.join('');
    while (m3.indexOf('AUG') !== lead.length) { lead = lead.slice(1); m3 = lead + cs3.join(''); }
    var prot = B().translate(m3).split('').map(function (a) { return B().three(a); });
    return { q: 'Translate the mRNA 5′-' + m3 + '-3′. Write the amino acids with their three-letter names, joined by hyphens (like Met-Ala).', viz: { name: 'bi-central', opts: { mode: 'table' } },
      a: protA(prot), hint: 'Start at AUG, read three bases at a time, and stop at the stop codon.', steps: [(lead ? 'Skip ' + lead + '; ' : '') + 'start at AUG.', 'Codons: ' + cs3.join(' ') + '.', cs3.map(aaName).join(', ') + '.', 'Protein: <b>' + prot.join('-') + '</b>.'] };
  });

  /* ---------- Reading the Genetic Code ---------- */
  function aaAnswer(a1) { var t = B().three(a1), f = aaFull(a1), v = [t, f]; if (a1 === 'D') v.push('aspartate'); if (a1 === 'E') v.push('glutamate'); return { t: 'text', v: v }; }
  G('hsbio.genetic-code', function (R, ctx) {
    var L = lvl(ctx), tab = { name: 'bi-central', opts: { mode: 'table' } };
    if (L === 1) { var c = R.pick(senseCodons().concat(['AUG'])), a1 = B().CODE[c];
      return { q: 'Use the codon table. Which amino acid does the mRNA codon ' + c + ' code for? (A three-letter name like Ala is fine.)', viz: tab, a: aaAnswer(a1), hint: 'First base on the left, second across the top, third on the right.',
        steps: ['First base ' + c[0] + ', second base ' + c[1] + ', third base ' + c[2] + '.', c + ' = <b>' + aaFull(a1) + ' (' + B().three(a1) + ')</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var c2 = R.pick(senseCodons()), d = dna(c2), a2 = B().CODE[c2];
        return { q: 'A gene\'s coding strand (DNA) contains the codon ' + d + '. Which amino acid does it code for?', viz: tab, a: aaAnswer(a2), hint: 'The codon table uses mRNA letters.', steps: ['The table uses mRNA letters: change T to U. ' + d + ' becomes ' + c2 + '.', c2 + ' = <b>' + aaFull(a2) + ' (' + B().three(a2) + ')</b>.'] }; }
      var cs = orf(R, R.int(2, 3)), lead = randSeq(R, R.int(1, 4), ['ATG']).replace(/T/g, 'U'), m = lead + cs.join('');
      while (m.indexOf('AUG') !== lead.length) { lead = lead.slice(1); m = lead + cs.join(''); }
      var prot = B().translate(m).split('').map(function (x) { return B().three(x); });
      return { q: 'Translate 5′-' + m + '-3′, starting at the start codon. Write three-letter names joined by hyphens (like Met-Ala).', viz: tab, a: protA(prot), hint: 'Find AUG first. The bases before it are not read.',
        steps: [lead ? 'The first AUG comes after ' + lead + '; skip those bases.' : 'The message starts with AUG.', 'Read in threes: ' + cs.join(' ') + '.', 'Protein: <b>' + prot.join('-') + '</b> (the stop codon adds nothing).'] };
    }
    if (R.coin()) { var a3 = R.pick('ACDEFGHIKLMNPQRSTVWY'.split('')), n = B().codonsFor(a3).length;
      return { q: 'Use the codon table. How many different codons code for ' + aaFull(a3) + ' (' + B().three(a3) + ')?', viz: tab, a: num(n), hint: 'Look for every box entry with that amino acid.', steps: ['Codons for ' + B().three(a3) + ': ' + B().codonsFor(a3).join(', ') + '.', 'That is <b>' + n + '</b>.'] }; }
    var cs4 = orf(R, R.int(2, 3)), tail = [R.pick(senseCodons()), R.pick(senseCodons())], m4 = cs4.concat(tail).join(''), prot4 = B().translate(m4).split('').map(function (x) { return B().three(x); });
    return { q: 'Translate 5′-' + m4 + '-3′. Write three-letter names joined by hyphens.', viz: tab, a: protA(prot4), hint: 'Translation ends at the first stop codon, even if bases follow it.',
      steps: ['Codons: ' + cs4.concat(tail).join(' ') + '.', cs4[cs4.length - 1] + ' is a stop codon, so the ribosome stops there; ' + tail.join(' ') + ' is not translated.', 'Protein: <b>' + prot4.join('-') + '</b>.'] };
  });

  /* ---------- Mutations ---------- */
  var MUT_TYPES = ['Silent', 'Missense', 'Nonsense', 'Frameshift'];
  function mutate(R, want) { // returns { m0, m1, kind, pos } on an mRNA AUG + 4 codons + stop
    for (var tries = 0; tries < 400; tries++) {
      var cs = orf(R, 4), m0 = cs.join(''), ci = R.int(1, 4), pos = 3 * ci + R.int(0, 2), m1;
      if (want === 'Frameshift') { if (R.coin()) m1 = m0.slice(0, pos) + R.pick(['A', 'U', 'G', 'C']) + m0.slice(pos); else m1 = m0.slice(0, pos) + m0.slice(pos + 1); }
      else { var nb = R.pick(['A', 'U', 'G', 'C'].filter(function (b) { return b !== m0[pos]; })); m1 = m0.slice(0, pos) + nb + m0.slice(pos + 1); }
      var k = B().mutationType(m0, m1);
      if (cap(k) === want && (want !== 'Frameshift' || B().translate(m1, { keepStop: true }) !== B().translate(m0, { keepStop: true }))) return { m0: m0, m1: m1, kind: want, pos: pos, ci: ci };
    }
    return null;
  }
  function spaced(m) { return m.match(/.{1,3}/g).join(' '); }
  G('hsbio.mutations', function (R, ctx) {
    var L = lvl(ctx), want = L === 1 ? R.pick(['Missense', 'Nonsense', 'Frameshift', 'Silent']) : L === 2 ? R.pick(['Silent', 'Silent', 'Missense', 'Frameshift', 'Nonsense']) : R.pick(['Nonsense', 'Missense', 'Silent']);
    var M = mutate(R, want), p0 = B().translate(M.m0).split('').map(B().three), p1 = B().translate(M.m1).split('').map(B().three);
    var viz = { name: 'bi-central', opts: { mode: 'mutation', mrna: M.m0, mutant: M.m1, quiet: true, interactive: false, table: true } };
    var desc = { Silent: 'The codon changed, but it still codes for the same amino acid, so the protein is unchanged.', Missense: 'One codon now codes for a different amino acid.', Nonsense: 'A codon became a stop codon, so the protein is cut short.', Frameshift: 'A base was ' + (M.m1.length > M.m0.length ? 'added' : 'lost') + ', so every codon after it is read in a new frame.' }[want];
    var stepsT = ['Original: ' + spaced(M.m0) + ' → ' + p0.join('-') + '.', 'Mutated: ' + spaced(M.m1) + ' → ' + (p1.join('-') || '(nothing)') + (want === 'Nonsense' ? ', then stop' : '') + '.', desc];
    if (L < 3 || want === 'Silent') return { q: 'An mRNA 5′-' + M.m0 + '-3′ mutates to 5′-' + M.m1 + '-3′. What kind of mutation is this?', viz: viz, a: mcKeep(MUT_TYPES, want),
      hint: 'Compare the lengths first. If they match, translate the codon that changed.', steps: stepsT.concat(['So it is a <b>' + want.toLowerCase() + '</b> mutation.']) };
    if (want === 'Nonsense') return { q: 'An mRNA 5′-' + M.m0 + '-3′ codes for a protein of ' + p0.length + ' amino acids. A mutation changes it to 5′-' + M.m1 + '-3′. How many amino acids long is the new protein?', viz: viz, a: num(p1.length),
      hint: 'Translate the mutated mRNA from AUG and stop at the first stop codon.', steps: stepsT.concat(['The new protein has <b>' + p1.length + '</b> amino acids.']) };
    return { q: 'An mRNA 5′-' + M.m0 + '-3′ mutates to 5′-' + M.m1 + '-3′. Translate the mutated mRNA (three-letter names joined by hyphens).', viz: viz, a: protA(p1),
      hint: 'Only one codon changed. Look it up in the table.', steps: stepsT.concat(['New protein: <b>' + p1.join('-') + '</b>.']) };
  });

  /* ---------- Turning Genes On and Off ---------- */
  var LAC = [['normal', 'A normal <i>E. coli</i> cell', true, true, true, true], ['noDNA', 'A mutant whose repressor cannot bind the operator', false, true, true, true],
    ['noLac', 'A mutant whose repressor binds the operator but cannot bind lactose', true, false, true, true], ['op', 'A mutant whose operator DNA is changed so the repressor cannot attach to it', true, true, false, true],
    ['prom', 'A mutant whose promoter is damaged so RNA polymerase cannot attach', true, true, true, false]];
  function lacOn(c, lactose) { var repBinds = c[2] && c[4] && !(lactose && c[3]); return c[5] && !repBinds; }
  var CELLS = [['liver cells', 'albumin, a blood protein'], ['red blood cell precursors', 'hemoglobin'], ['cells in the pancreas', 'insulin'], ['muscle cells', 'myosin, a protein that contracts'], ['skin cells', 'keratin']];
  G('hsbio.gene-regulation', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var c = R.pick(CELLS), other = R.pick(['nerve cells', 'bone cells', 'skin cells', 'liver cells'].filter(function (x) { return x !== c[0]; }));
      return { q: cap(c[0]) + ' make ' + c[1] + ', but ' + other + ' in the same body do not. Why?', a: mc('Both have the gene, but only ' + c[0] + ' express it', ['Only ' + c[0] + ' have the gene', 'The gene mutated in ' + other, other.charAt(0).toUpperCase() + other.slice(1) + ' lost that part of their DNA']),
        hint: 'All the body\'s cells came from one cell by mitosis.', steps: ['Body cells come from one cell by mitosis, so they carry the same DNA.', 'They differ in <b>which genes are switched on</b>: ' + c[0] + ' express the gene; ' + other + ' keep it off.'] }; }
    var cs = L === 2 ? (R.chance(0.6) ? LAC[0] : R.pick(LAC.slice(1, 3))) : R.pick(LAC.slice(1)), lac = R.coin(), on = lacOn(cs, lac);
    var why = cs[0] === 'normal' ? (lac ? 'Lactose binds the repressor, which lets go of the operator, so RNA polymerase transcribes the genes.' : 'With no lactose, the repressor sits on the operator and blocks RNA polymerase.') :
      cs[0] === 'noDNA' ? 'The repressor can never sit on the operator, so nothing blocks RNA polymerase.' : cs[0] === 'noLac' ? (lac ? 'Lactose cannot pull this repressor off, so it keeps blocking transcription.' : 'With no lactose the repressor blocks transcription, as normal.') :
      cs[0] === 'op' ? 'The repressor has no place to attach, so nothing blocks RNA polymerase.' : 'Without a working promoter RNA polymerase cannot start, whatever the repressor does.';
    var pr = { q: 'The lac operon: ' + cs[1] + ' is grown ' + (lac ? 'with lactose' : 'with no lactose') + ' (and no glucose). Are the lactose-digesting genes transcribed?', a: mcKeep(['Yes, the genes are on', 'No, the genes are off'], on ? 'Yes, the genes are on' : 'No, the genes are off'),
      hint: 'Ask: is anything sitting on the operator? Can RNA polymerase attach?', steps: [why, 'So the genes are <b>' + (on ? 'on' : 'off') + '</b>.'] };
    if (L === 2) pr.viz = { name: 'bi-feedback', opts: { mode: 'chain', steps: ['No lactose: the repressor sits on the operator', 'Lactose binds the repressor', 'The repressor lets go of the DNA', 'RNA polymerase transcribes the genes'], title: 'The lac operon', interactive: false } };
    return pr;
  });
  /* ===================================== Unit 9: Biotechnology ===================================== */
  /* ---------- PCR ---------- */
  var PCR_STEPS = [['Denaturing', 'about 95 °C', 'the two DNA strands separate'], ['Annealing', 'about 50–65 °C', 'primers bind on each side of the target'], ['Extending', 'about 72 °C', 'DNA polymerase builds the new strands']];
  G('hsbio.pcr', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var n = R.int(3, 12), k = R.pick([1, 1, 2, 3, 5]), v = k * Math.pow(2, n);
      return { q: 'A PCR tube starts with ' + (k === 1 ? '1 copy' : k + ' copies') + ' of a target gene. In an ideal reaction, how many copies are there after ' + n + ' cycles?', a: num(v),
        hint: 'Each cycle doubles the number of copies.', steps: ['Each cycle doubles: ' + n + ' cycles multiply by $2^{' + n + '}$, which is ' + T.commas(Math.pow(2, n)) + '.', (k === 1 ? '' : k + ' × ' + T.commas(Math.pow(2, n)) + ' = ') + '<b>' + T.commas(v) + '</b> copies.'] };
    }
    if (L === 2) {
      if (R.coin()) { var X = R.pick([1, 2, 5]) * Math.pow(10, R.int(2, 7)), c = Math.ceil(Math.log(X) / Math.LN2 - 1e-12);
        return { q: 'Starting from a single copy, what is the fewest number of PCR cycles that makes at least ' + T.commas(X) + ' copies (in an ideal reaction)?', a: num(c),
          hint: 'Find the smallest power of 2 that reaches ' + T.commas(X) + '.', steps: ['$2^{' + (c - 1) + '}$ = ' + T.commas(Math.pow(2, c - 1)) + ', which is less than ' + T.commas(X) + '.', '$2^{' + c + '}$ = ' + T.commas(Math.pow(2, c)) + ', which is enough: <b>' + c + ' cycles</b>.'] }; }
      var n2 = R.int(3, 12);
      return { q: 'A student says that ' + n2 + ' cycles of PCR, starting from 1 copy, make ' + 2 * n2 + ' copies. How many copies are there really (ideal reaction)?', a: num(Math.pow(2, n2)),
        hint: 'Does each cycle add 2 copies, or double the number?', steps: ['Each cycle doubles every copy present; it does not just add two.', '1 → 2 → 4 → … after ' + n2 + ' cycles: $2^{' + n2 + '}$ = <b>' + Math.pow(2, n2) + '</b>.'] };
    }
    if (R.coin()) { var st = R.pick(PCR_STEPS), byTemp = R.coin();
      return { q: byTemp ? 'In each PCR cycle, what happens at ' + st[1] + '?' : 'In each PCR cycle, which step happens at ' + st[1] + '?', a: byTemp ? mc(cap(st[2]), PCR_STEPS.filter(function (x) { return x !== st; }).map(function (x) { return cap(x[2]); }).concat(['The DNA is cut into pieces'])) : mc(st[0], PCR_STEPS.filter(function (x) { return x !== st; }).map(function (x) { return x[0]; }).concat(['Ligating'])),
        hint: 'The hottest step separates strands; primers need it cooler; the polymerase works best in between.', steps: ['95 °C: denature, strands separate. 50–65 °C: anneal, primers bind. 72 °C: extend, the polymerase builds.', 'At ' + st[1] + ': <b>' + st[0].toLowerCase() + '</b>; ' + st[2] + '.'] }; }
    var k3 = R.int(2, 9) * 10, n3 = R.int(20, 32), v3 = k3 * Math.pow(2, n3);
    return { q: 'A sample has ' + k3 + ' copies of a target. About how many copies are there after ' + n3 + ' ideal PCR cycles? (Scientific notation is fine, like 3.2e9 or 3.2 × 10^9.)', a: num(v3, { rtol: 0.01 }),
      hint: 'Multiply by $2^{' + n3 + '}$.', steps: ['$2^{' + n3 + '}$ = ' + T.commas(Math.pow(2, n3)) + '.', k3 + ' × ' + T.commas(Math.pow(2, n3)) + ' ≈ <b>$' + T.sci(v3, 3) + '$</b> copies.'] };
  });

  /* ---------- Gel Electrophoresis ---------- */
  G('hsbio.gel-electrophoresis', function (R, ctx) {
    var L = lvl(ctx), LAD = B().LADDER;
    if (L === 1) {
      if (R.coin()) { var bands = R.sample([4000, 2500, 1800, 1200, 900, 600, 350, 250, 150], 3).sort(function (a, b) { return b - a; }), far = R.coin(), ans = far ? bands[2] : bands[0];
        return { q: 'A sample has DNA pieces of ' + bands.map(function (b) { return T.commas(b) + ' bp'; }).join(', ') + '. Which band ends up ' + (far ? 'farthest from' : 'closest to') + ' the wells?', viz: { name: 'bi-gel', opts: { lanes: [{ name: 'Sample', bands: bands }], quiet: true, interactive: false, hideNames: true } },
          a: mc(T.commas(ans) + ' bp', bands.filter(function (b) { return b !== ans; }).map(function (b) { return T.commas(b) + ' bp'; })), hint: 'Shorter pieces slip through the gel faster.', steps: ['Shorter pieces travel farther; longer pieces stay nearer the wells.', (far ? 'The shortest piece, <b>' : 'The longest piece, <b>') + T.commas(ans) + ' bp</b>, ends up ' + (far ? 'farthest' : 'closest') + '.'] }; }
      return { q: 'In gel electrophoresis, toward which electrode does DNA move, and why?', a: mc('Toward the positive electrode, because DNA is negatively charged', ['Toward the negative electrode, because DNA is negatively charged', 'Toward the positive electrode, because DNA is positively charged', 'Toward whichever end is closer, by gravity']),
        hint: 'Each nucleotide has a phosphate group. What is its charge?', steps: ['The phosphates in DNA\'s backbone are negatively charged.', 'Opposite charges attract, so DNA moves <b>toward the positive electrode</b>.'] };
    }
    if (L === 2) {
      var i = R.int(1, LAD.length - 2), size = LAD[i], other = R.pick(LAD.filter(function (x) { return x !== size; }));
      return { q: 'The unknown sample (lane B) has a band level with one ladder band. What size is that piece?', viz: { name: 'bi-gel', opts: { lanes: [{ name: 'A', bands: [other] }, { name: 'B', bands: [size] }], interactive: false, labelBands: false } },
        a: mc(T.commas(size) + ' bp', [LAD[i - 1], LAD[i + 1], other === LAD[i - 1] || other === LAD[i + 1] ? LAD[Math.max(0, i - 2)] : other].map(function (x) { return T.commas(x) + ' bp'; })),
        hint: 'Find the ladder band at the same distance from the wells.', steps: ['Pieces of the same size travel the same distance.', 'The band in lane B is level with the ladder\'s <b>' + T.commas(size) + ' bp</b> band.'] };
    }
    var Ln = R.pick([3000, 4000, 5000, 6000, 8000]), k = R.int(1, 3), cuts = [];
    while (cuts.length < k) { var c = 100 * R.int(3, Ln / 100 - 3); if (cuts.every(function (x) { return Math.abs(x - c) >= 300; })) cuts.push(c); }
    cuts.sort(function (a, b) { return a - b; });
    var fr = B().digest(Ln, cuts), ask = R.pick(['n', 'small', 'large']);
    var q = 'A straight (linear) DNA molecule of ' + T.commas(Ln) + ' bp is cut by an enzyme at ' + cuts.map(function (x) { return T.commas(x); }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' bp from one end. ';
    var stepsC = ['The pieces run between the cut points: ' + [0].concat(cuts).map(function (x, j) { var e = j < cuts.length ? cuts[j] : Ln; return T.commas(x) + '–' + T.commas(e); }).join(', ') + '.', 'Lengths: ' + fr.map(function (x) { return T.commas(x); }).join(', ') + ' bp.'];
    var nb = uniq(fr).length;
    if (ask === 'n') return { q: q + 'How many bands appear on the gel?', a: num(nb), hint: 'Each cut adds one piece. Pieces of the same size make one band.', steps: stepsC.concat(['<b>' + nb + '</b> band' + (nb > 1 ? 's' : '') + (nb < fr.length ? ' (two pieces have the same size and share a band)' : '') + '.']) };
    var v = ask === 'small' ? fr[fr.length - 1] : fr[0];
    return { q: q + 'What is the size of the piece that travels ' + (ask === 'small' ? 'farthest' : 'the shortest distance') + '?', a: num(v), unit: 'bp', hint: 'Find the lengths of the pieces first. Which travels ' + (ask === 'small' ? 'farthest' : 'least') + '?', steps: stepsC.concat([(ask === 'small' ? 'The shortest piece travels farthest: <b>' : 'The longest piece stays nearest the wells: <b>') + T.commas(v) + ' bp</b>.']) };
  });

  /* ---------- Recombinant DNA ---------- */
  var ENZ_SITES = [['EcoRI', 'GAATTC'], ['BamHI', 'GGATCC'], ['HindIII', 'AAGCTT']];
  var TOOLS = [['A restriction enzyme', 'cuts DNA at a specific short sequence'], ['DNA ligase', 'joins (seals) pieces of DNA together'], ['A plasmid', 'is a small ring of DNA that carries the gene into a bacterium'], ['A bacterium', 'copies the plasmid and expresses the gene, making the protein']];
  function countSite(s, site) { var n = 0; for (var i = 0; i + site.length <= s.length; i++) if (s.substr(i, site.length) === site) n++; return n; }
  G('hsbio.recombinant-dna', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var t = R.pick(TOOLS), others = TOOLS.filter(function (x) { return x !== t; });
      if (R.coin()) return { q: 'In making recombinant DNA, which one ' + t[1] + '?', a: mc(t[0], others.map(function (x) { return x[0]; }).concat(['RNA polymerase'])), hint: 'Cut, join, carry, express.', steps: ['<b>' + t[0] + '</b> ' + t[1] + '.'] };
      return { q: 'Why can a bacterium make a human protein from a human gene?', a: mc('The genetic code is nearly universal: the same codons mean the same amino acids', ['Bacteria have all the same genes as people', 'The plasmid turns the bacterium into a human cell', 'Ligase changes the gene into bacterial DNA']),
        hint: 'What does a bacterium use to read the gene?', steps: ['The bacterium reads the gene\'s codons with its own ribosomes and tRNAs.', 'Nearly all life uses the same genetic code, so it builds <b>the same protein</b>.'] }; }
    var e = R.pick(ENZ_SITES), site = e[1];
    if (L === 2) {
      var k = R.int(1, 3), parts = [], s;
      for (var tries = 0; tries < 50; tries++) { parts = []; for (var j = 0; j <= k; j++) parts.push(randSeq(R, R.int(2, 5), ENZ_SITES.map(function (x) { return x[1]; }))); s = parts.join(site); if (countSite(s, site) === k) break; }
      return { q: e[0] + ' cuts DNA at the sequence ' + site + '. How many times does it cut this strand? 5′-' + s + '-3′', a: num(countSite(s, site)), hint: 'Search for ' + site + ' from left to right.',
        steps: ['Look for ' + site + ': ' + s.replace(new RegExp(site, 'g'), '<b>' + site + '</b>') + '.', 'It appears <b>' + countSite(s, site) + '</b> time' + (countSite(s, site) > 1 ? 's' : '') + ', so the enzyme cuts there.'] };
    }
    if (R.coin()) { var cutsN = R.int(1, 5), ring = R.coin();
      return { q: 'A ' + (ring ? 'plasmid (a closed ring of DNA)' : 'straight (linear) piece of DNA') + ' is cut by a restriction enzyme at ' + cutsN + ' place' + (cutsN > 1 ? 's' : '') + '. How many pieces form?', a: num(ring ? cutsN : cutsN + 1),
        hint: 'Draw it: how many pieces does one cut make in a ring? In a line?', steps: [ring ? 'One cut opens a ring into one piece; each further cut adds one.' : 'One cut splits a line in two; each further cut adds one.', 'So ' + cutsN + ' cut' + (cutsN > 1 ? 's' : '') + ' give <b>' + (ring ? cutsN : cutsN + 1) + '</b> piece' + ((ring ? cutsN : cutsN + 1) > 1 ? 's' : '') + '.'] }; }
    var order = ['Cut the gene and the plasmid with the same restriction enzyme', 'Join the gene into the plasmid with DNA ligase', 'Put the plasmid into bacteria', 'Grow the bacteria, which make the protein'], sh = R.shuffle([0, 1, 2, 3]);
    var right = [0, 1, 2, 3].map(function (i) { return letterOf(sh.indexOf(i)); }).join(''), wr = [];
    while (wr.length < 3) { var w = R.shuffle(['A', 'B', 'C', 'D']).join(''); if (w !== right && wr.indexOf(w) < 0) wr.push(w); }
    return { q: 'Put the steps of making a human protein in bacteria in order. ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: ' + order[i].toLowerCase() + '.'; }).join(' '), a: mc(right, wr),
      hint: 'You need matching ends before you can join, and a finished plasmid before bacteria can take it up.', steps: order.map(function (x, i) { return (i + 1) + '. ' + x + ' (' + letterOf(sh.indexOf(i)) + ').'; }).concat(['Order: <b>' + right + '</b>.']) };
  });
  /* ===================================== Unit 10: Evolution ===================================== */
  /* ---------- Natural Selection ---------- */
  var NS_COND = ['Individuals in the population vary in the trait', 'The variation is heritable: passed from parents to offspring', 'More offspring are born than can survive', 'Some variants survive and reproduce more than others'];
  var NS_NOT = ['Individuals change their traits during life because they need to', 'The environment creates the exact mutation the population needs', 'The strongest individual always wins', 'All offspring survive'];
  G('hsbio.natural-selection', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      if (R.coin()) { var not = R.pick(NS_NOT); return { q: 'Which of these is <b>not</b> needed for evolution by natural selection?', a: mc(not, R.sample(NS_COND, 3)),
        hint: 'Natural selection needs variation, heritability, more offspring than can survive, and differences in survival and reproduction.', steps: ['The four conditions: variation, heritability, more offspring than can survive, and unequal survival and reproduction.', '"' + not + '" is not one of them.'] }; }
      return { q: 'In biology, what does "fitness" mean?', a: mc('How many surviving offspring an individual leaves in its environment', ['How strong or fast an individual is', 'How long an individual lives', 'How healthy an individual is']),
        hint: 'Natural selection counts what is passed on to the next generation.', steps: ['Natural selection works through which alleles reach the next generation.', 'So fitness is <b>reproductive success</b>: surviving offspring left in a particular environment.'] };
    }
    if (L === 2) {
      var sp = R.pick([['deer mice', 'large and strong', 'small and dark-furred', 'on dark forest soil'], ['beetles', 'large and fast', 'small and dull-colored', 'among dead leaves'], ['lizards', 'big and fierce', 'small and well hidden', 'on gray rocks'], ['moths', 'large and showy', 'small and plain', 'on dark tree bark']]);
      var a = R.int(1, 3), b = a + R.int(2, 4);
      return { q: 'Two kinds of ' + sp[0] + ' live ' + sp[3] + '. Type A is ' + sp[1] + '; on average each leaves ' + a + ' offspring that survive to have young. Type B is ' + sp[2] + '; each leaves ' + b + '. Which type has higher fitness there?', a: mc('Type B', ['Type A', 'They are equally fit', 'It depends only on which type is stronger']),
        hint: 'Fitness is measured in surviving offspring, not in strength.', steps: ['Fitness counts surviving offspring: A leaves ' + a + ', B leaves ' + b + '.', 'So <b>type B</b> is fitter in this environment, even though A is ' + sp[1] + '.'] };
    }
    var n = R.pick([100, 200, 400, 500]), dShare = R.pick([20, 25, 40, 50, 60]), dN = n * dShare / 100, lN = n - dN, eatL = R.pick([50, 60, 75, 80]), eatD = R.pick([10, 20, 25]);
    var dS = dN * (100 - eatD) / 100, lS = lN * (100 - eatL) / 100, share = 100 * dS / (dS + lS);
    return { q: 'A population of ' + n + ' beetles on dark soil is ' + dShare + '% dark and the rest light. Birds eat ' + eatL + '% of the light beetles and ' + eatD + '% of the dark ones. What percent of the survivors are dark? (Round to the nearest whole percent.)',
      viz: { name: 'bi-selection', opts: { background: 'dark', start: dShare / 100, quiet: true, interactive: false, seed: 'ns' + n + dShare } },
      a: { t: 'num', v: String(Math.round(share)), tol: 0.6, pct: true }, hint: 'Find the number of dark and light survivors first.',
      steps: ['Dark: ' + dN + ' beetles, ' + (100 - eatD) + '% survive = ' + T.num(fix(dS)) + '.', 'Light: ' + lN + ' beetles, ' + (100 - eatL) + '% survive = ' + T.num(fix(lS)) + '.', 'Dark share: ' + T.num(fix(dS)) + ' ÷ ' + T.num(fix(dS + lS)) + ' ≈ <b>' + Math.round(share) + '%</b>, up from ' + dShare + '%.'] };
  });

  /* ---------- Directional, Stabilizing and Disruptive Selection ---------- */
  var SEL = ['Directional', 'Stabilizing', 'Disruptive'];
  var SEL_DESC = [['the largest individuals survive best', 0], ['the smallest individuals survive best', 0], ['middle-sized individuals survive best, and both extremes do poorly', 1], ['both the smallest and the largest do well, but middle-sized ones do poorly', 2],
    ['birds with the deepest beaks crack the only seeds left after a drought', 0], ['goldenrod galls that are too small are attacked by wasps and those too large by birds', 1], ['seedcracker finches with small bills or large bills each feed well on one common kind of seed, but middle bills handle neither well', 2],
    ['dark moths survive best on soot-darkened trees', 0], ['clutches of a middle number of eggs produce the most surviving chicks', 1]];
  function bell(mu, sd, k) { var a = []; for (var x = 1; x <= 11; x++) a.push(Math.round(k * Math.exp(-Math.pow((x - mu) / sd, 2) / 2))); return a; }
  G('hsbio.selection-patterns', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var d = R.pick(SEL_DESC); return { q: 'In a population, ' + d[0] + '. Which kind of selection is this?', a: mcKeep(SEL, SEL[d[1]]),
      hint: 'Which part of the range does best: one end, the middle, or both ends?', steps: [['One extreme does best, so the average shifts.', 'The middle does best, so the curve narrows.', 'Both extremes do best, so the middle thins out.'][d[1]], 'This is <b>' + SEL[d[1]].toLowerCase() + ' selection</b>.'] }; }
    var k = R.int(0, 2), mu = R.int(5, 7), sd = R.pick([1.6, 1.8, 2]), before = bell(mu, sd, 30), after;
    if (k === 0) { var sh = R.pick([-2, 2]); after = bell(mu + sh, sd, 30); }
    else if (k === 1) after = bell(mu, sd * 0.55, 48);
    else after = bell(mu - 2.6, sd * 0.6, 22).map(function (v, i) { return v + bell(mu + 2.6, sd * 0.6, 22)[i]; });
    if (L === 2) return { q: 'The chart shows a trait in a population before and after many generations of selection. Which kind of selection happened?', viz: { name: 'bi-chart', opts: { kind: 'line', x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], series: [{ name: 'Before', values: before }, { name: 'After', values: after }], xlabel: 'Trait size', ylabel: 'Individuals', quiet: true, interactive: false } },
      a: mcKeep(SEL, SEL[k]), hint: 'Did the peak move? Did the curve get narrower? Did it split?', steps: [['The whole curve moved to ' + (after.indexOf(Math.max.apply(null, after)) > before.indexOf(Math.max.apply(null, before)) ? 'larger' : 'smaller') + ' sizes.', 'The peak stayed in place but the curve became narrower and taller.', 'The middle became rare and two peaks formed, one at each side.'][k], 'So it is <b>' + SEL[k].toLowerCase() + ' selection</b>.'] };
    var m0 = R.int(8, 20), s0 = R.int(2, 4), txt;
    if (k === 0) { var m1 = m0 + R.pick([-1, 1]) * R.int(2, 4); txt = 'the average moved from ' + m0 + ' mm to ' + m1 + ' mm, and the spread (standard deviation) stayed about ' + s0 + ' mm'; }
    else if (k === 1) txt = 'the average stayed about ' + m0 + ' mm, and the standard deviation fell from ' + s0 + ' mm to ' + (s0 / 2) + ' mm';
    else txt = 'the average stayed about ' + m0 + ' mm, but middle values became rare and the population now has two peaks, near ' + (m0 - 2 * s0) + ' mm and ' + (m0 + 2 * s0) + ' mm';
    return { q: 'Biologists measured a trait in a population for many generations. Over that time ' + txt + '. Which kind of selection fits?', a: mcKeep(SEL.concat(['No selection: only chance']), SEL[k]),
      hint: 'A moving average means one direction. A shrinking spread means the middle is favored. Two peaks mean both ends are favored.', steps: [['The average moved and the spread did not.', 'The average held but the spread shrank: extremes were selected against.', 'The average held but the middle thinned into two peaks.'][k], '<b>' + SEL[k] + ' selection</b>.'] };
  });

  /* ---------- Evolution in Action ---------- */
  G('hsbio.adaptation-in-action', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) {
      var c = R.pick([['A farm sprays the same pesticide for years, and the insects become harder to kill.', 'A few insects already had alleles that let them survive; they left most of the offspring', ['The pesticide caused each insect to make the mutation it needed', 'The insects learned to avoid the pesticide and taught their young', 'The pesticide made the insects stronger by exercise']],
        ['After an antibiotic is used, the bacteria that remain are resistant to it.', 'A few bacteria were already resistant; they survived and multiplied', ['The antibiotic caused the bacteria to mutate in the way they needed', 'The bacteria got used to the drug, the way people get used to cold', 'The drug turned into a weaker form inside the bacteria']],
        ['After a drought, the average beak depth of a finch population increased.', 'Birds with deeper beaks, which were already in the population, survived better and passed on their alleles', ['Each finch grew a deeper beak by cracking hard seeds, and passed it on', 'The drought caused mutations for deeper beaks', 'The finches chose to grow deeper beaks']]]);
      return { q: c[0] + ' What is the best explanation?', a: mc(cap(c[1]), c[2]), hint: 'Was the helpful variation there before the change, or caused by it?', steps: ['The variation existed before the change in the environment.', 'The environment selected among it: <b>' + c[1] + '</b>.'] };
    }
    if (L === 2) {
      var N = R.pick([100000, 500000, 1000000, 2000000]), r = R.int(2, 20), h = R.int(3, 8);
      return { q: 'A colony of ' + T.commas(N) + ' bacteria has ' + r + ' resistant cells. An antibiotic kills every cell that is not resistant. The survivors then double every hour. How many bacteria are there ' + h + ' hours later?', a: num(r * Math.pow(2, h)),
        hint: 'Only the resistant cells are left. How many doublings happen?', steps: ['Survivors: the ' + r + ' resistant cells.', h + ' doublings multiply by $2^{' + h + '}$, which is ' + Math.pow(2, h) + '.', r + ' × ' + Math.pow(2, h) + ' = <b>' + T.commas(r * Math.pow(2, h)) + '</b>, all resistant.'] };
    }
    var f = R.int(1, 12), s = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), res = 100 * f / (f + (100 - f) * s / 100);
    return { q: 'In a population of insects, ' + f + '% carry a resistance allele. One spraying kills every insect except the resistant ones and ' + s + '% of the others. What percent of the survivors are resistant? (Round to the nearest whole percent.)', a: { t: 'num', v: String(Math.round(res)), tol: 0.6, pct: true },
      hint: 'Imagine 100 insects. How many of each kind survive?', steps: ['Out of 100 insects: ' + f + ' resistant all survive; ' + (100 - f) + ' others, ' + s + '% survive = ' + T.num(fix((100 - f) * s / 100)) + '.', 'Resistant share: ' + f + ' ÷ ' + T.num(fix(f + (100 - f) * s / 100)) + ' ≈ <b>' + Math.round(res) + '%</b>, up from ' + f + '%.'] };
  });

  /* ---------- Evidence: Fossils and Anatomy ---------- */
  var PAIRS_H = [['A human arm and a whale flipper', 0], ['A bat wing and a cat\'s front leg', 0], ['A bird wing and a human arm', 0], ['A horse\'s front leg and a bat wing', 0], ['A bird wing and a butterfly wing', 1], ['A shark\'s fin and a dolphin\'s flipper', 1], ['The streamlined body of a penguin and of a fish', 1], ['The wings of a bat and of a bee', 1],
    ['The small hip bones inside a whale', 2], ['The tiny leg spurs of a python', 2], ['The eyes of blind cave fish, covered by skin', 2], ['The human tailbone (coccyx)', 2]];
  var EV = ['Homologous structures', 'Analogous structures', 'Vestigial structures'];
  var WHALE = ['four legs, lived on land, with an ear like a whale\'s', 'short legs and webbed feet, lived along shores and swam', 'tiny hind legs that could not support it, lived fully in the sea', 'no hind legs at all, only small hip bones inside the body'];
  G('hsbio.evidence-fossils-anatomy', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var p = R.pick(PAIRS_H); return { q: p[0] + ': which kind of evidence ' + (p[1] === 2 ? 'is this' : 'are these') + '?', a: mcKeep(EV, EV[p[1]]),
      hint: 'Same parts, different jobs? Same job, different parts? A reduced part with little use?', steps: [['The same bones in the same order, inherited from a common ancestor, now doing different jobs.', 'They do the same job but are built differently; they evolved separately.', 'A reduced part with little or no use left, inherited from ancestors that used it.'][p[1]], 'So: <b>' + EV[p[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var h = R.pick(PAIRS_H.filter(function (x) { return x[1] === 0; })), an = R.sample(PAIRS_H.filter(function (x) { return x[1] === 1; }), 3);
      return { q: 'Which pair is evidence that the two animals share a recent common ancestor (homologous structures)?', a: mc(h[0], an.map(function (x) { return x[0]; })),
        hint: 'Look past the job to the inner structure. Do the parts have the same bones?', steps: ['The other pairs look alike because they do the same job (analogous), not because of shared ancestry.', '<b>' + h[0] + '</b> share the same bones: homologous.'] }; }
    var sh = R.shuffle([0, 1, 2, 3]), right = [0, 1, 2, 3].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', '), wr = [];
    while (wr.length < 3) { var w = R.shuffle(['A', 'B', 'C', 'D']).join(', '); if (w !== right && wr.indexOf(w) < 0) wr.push(w); }
    if (wr.indexOf([3, 2, 1, 0].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', ')) < 0) wr[0] = [3, 2, 1, 0].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', ');
    return { q: 'Four fossil whale relatives are described below. In undisturbed rock, deeper layers are older. If whales evolved from land mammals, in what order (oldest first) would you expect to find them? ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: ' + WHALE[i] + '.'; }).join(' '),
      a: mc(right, wr), hint: 'Start with the one most like a land mammal.', steps: ['The expected trend: from a land animal to a shore swimmer to a sea animal whose hind legs shrink and then disappear.', 'Oldest first: <b>' + right + '</b>. Fossils found in this order are what the evidence shows.'] };
  });

  /* ---------- Evidence: DNA and Proteins ---------- */
  function mutateAt(R, s, k, alph) { var a = s.split(''), idx = R.sample(a.map(function (_, i) { return i; }), k); idx.forEach(function (i) { a[i] = R.pick(alph.filter(function (c) { return c !== a[i]; })); }); return a.join(''); }
  function diffs(a, b) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; }
  G('hsbio.molecular-evidence', function (R, ctx) {
    var L = lvl(ctx), ACGT = ['A', 'C', 'G', 'T'];
    if (L === 1) { var s = randSeq(R, R.int(12, 16)), k = R.int(1, 5), t = mutateAt(R, s, k, ACGT);
      return { q: 'The same stretch of a gene in two species:<br>Species 1: ' + s + '<br>Species 2: ' + t + '<br>At how many positions do they differ?', a: num(diffs(s, t)), hint: 'Compare the two sequences base by base.', steps: ['Compare position by position; the differences are at positions ' + s.split('').map(function (c, i) { return c !== t[i] ? i + 1 : 0; }).filter(function (x) { return x; }).join(', ') + '.', 'They differ at <b>' + diffs(s, t) + '</b> positions.'] }; }
    if (L === 2) {
      var ref = randSeq(R, 15), ks = R.sample([1, 2, 3, 4, 5, 6], 3), names = R.sample(['Species P', 'Species Q', 'Species R', 'Species S'], 3), seqs = ks.map(function (k) { return mutateAt(R, ref, k, ACGT); });
      var best = names[ks.indexOf(Math.min.apply(null, ks))];
      return { q: 'A gene from species X and three other species:<br>X: ' + ref + '<br>' + names.map(function (n, i) { return n + ': ' + seqs[i]; }).join('<br>') + '<br>Which species is most closely related to X?', a: mc(best, names.filter(function (n) { return n !== best; }).concat(['They are all equally related'])),
        hint: 'Count each species\' differences from X.', steps: [names.map(function (n, i) { return n + ': ' + diffs(ref, seqs[i]) + ' differences'; }).join('; ') + '.', 'Fewest differences means the most recent common ancestor: <b>' + best + '</b>.'] };
    }
    if (R.chance(0.3)) return { q: 'Human and chimpanzee DNA are very similar. What does that similarity show?', a: mc('Humans and chimpanzees share a recent common ancestor', ['Humans evolved from chimpanzees', 'Chimpanzees evolved from humans', 'The two species are the same species']),
      hint: 'Are living chimpanzees our ancestors, or our cousins?', steps: ['Both species have been evolving separately since they split from one ancestral population.', 'The similarity shows <b>a recent common ancestor</b>; neither species descends from the other.'] };
    var t3 = R.pick([['A', ['B', 'C']], ['B', ['A', 'C']], ['C', ['A', 'B']]]), close = t3[1], far = t3[0], dNear = R.int(1, 4), dFar = dNear + R.int(3, 6);
    var D = {}; D[close.join('')] = dNear; D[[far, close[0]].sort().join('')] = dFar; D[[far, close[1]].sort().join('')] = dFar + R.int(-1, 1);
    var get = function (a, b) { return D[[a, b].sort().join('')]; };
    return { q: 'Differences in one protein between three species: A and B differ at ' + get('A', 'B') + ' amino acids, A and C at ' + get('A', 'C') + ', and B and C at ' + get('B', 'C') + '. Which two species share the most recent common ancestor?', a: mc(close.join(' and '), [['A', 'B'], ['A', 'C'], ['B', 'C']].map(function (x) { return x.join(' and '); }).filter(function (x) { return x !== close.join(' and '); })),
      hint: 'The fewest differences means the least time apart.', steps: ['The smallest number of differences is between ' + close.join(' and ') + ' (' + dNear + ').', 'So <b>' + close.join(' and ') + '</b> share the most recent ancestor; ' + far + ' branched off earlier.'] };
  });

  /* ---------- Reading Phylogenetic Trees ---------- */
  var TIPNAMES = ['bear', 'wolf', 'seal', 'cat', 'horse', 'cow', 'whale', 'bat', 'rabbit', 'mouse', 'lemur', 'monkey'];
  function randTree(R, names) { var nodes = names.slice(); while (nodes.length > 1) { var i = R.int(0, nodes.length - 1), a = nodes.splice(i, 1)[0], j = R.int(0, nodes.length - 1), b = nodes.splice(j, 1)[0]; nodes.push(R.coin() ? [a, b] : [b, a]); } return nodes[0]; }
  function sisterTip(t, x) { // the sister of tip x, if it is a single tip
    if (!Array.isArray(t)) return null; if (t[0] === x && !Array.isArray(t[1])) return t[1]; if (t[1] === x && !Array.isArray(t[0])) return t[0];
    return sisterTip(t[0], x) || sisterTip(t[1], x);
  }
  G('hsbio.phylogenetic-trees', function (R, ctx) {
    var L = lvl(ctx), names = R.sample(TIPNAMES, L === 1 ? 4 : 5), tree = randTree(R, names), tips = B().tips(tree);
    var viz = { name: 'bi-tree', opts: { tree: tree, quiet: true, interactive: false } };
    if (L < 3) {
      for (var tries = 0; tries < 60; tries++) { var a = R.pick(tips), b = R.pick(tips), c = R.pick(tips); if (a !== b && a !== c && b !== c && B().closer(tree, a, b, c) !== 'tie') break; }
      var cl = B().closer(tree, a, b, c);
      return { q: 'On this tree, is the ' + a + ' more closely related to the ' + b + ' or to the ' + c + '?', viz: viz, a: mcKeep(['The ' + b, 'The ' + c], 'The ' + cl),
        hint: 'Trace back from the ' + a + ' to the first branch point it shares with each one.', steps: ['The ' + a + ' and the ' + cl + ' meet at a branch point that is more recent (closer to the tips) than the one the ' + a + ' shares with the ' + (cl === b ? c : b) + '.', 'So the ' + a + ' is more closely related to <b>the ' + cl + '</b>. Where the tips sit on the page does not matter.'] };
    }
    var x = tips.filter(function (t) { return sisterTip(tree, t); });
    if (x.length && R.coin()) { var xx = R.pick(x), s = sisterTip(tree, xx);
      return { q: 'On this tree, which organism is the closest relative of the ' + xx + '?', viz: viz, a: mc('The ' + s, tips.filter(function (t) { return t !== xx && t !== s; }).map(function (t) { return 'The ' + t; })),
        hint: 'Find the branch point nearest to the ' + xx + '\'s tip.', steps: ['The first branch point back from the ' + xx + ' joins it to the ' + s + ' alone.', 'Its closest relative is <b>the ' + s + '</b>.'] }; }
    var p2 = R.sample(tips, 2), m = B().mrca(tree, p2), n = B().tips(m).length;
    return { q: 'On this tree, find the most recent common ancestor of the ' + p2[0] + ' and the ' + p2[1] + '. How many of the organisms shown descend from that ancestor?', viz: viz, a: num(n),
      hint: 'Find where their two lines first meet, then count every tip on the branches to the right of that point.', steps: ['Their lines meet at one branch point.', 'Tips descending from it: ' + B().tips(m).join(', ') + '.', 'That is <b>' + n + '</b>.'] };
  });

  /* ---------- Building Cladograms ---------- */
  var CLADE_SETS = [{ orgs: ['lamprey', 'shark', 'perch', 'frog', 'mouse'], traits: ['jaws', 'bony skeleton', 'four limbs', 'hair'], shared: 'a backbone' },
    { orgs: ['green alga', 'moss', 'fern', 'pine', 'rose'], traits: ['growing on land', 'tubes (vascular tissue)', 'seeds', 'flowers'], shared: 'chlorophyll' },
    { orgs: ['sponge', 'jellyfish', 'flatworm', 'earthworm'], traits: ['true tissues', 'left and right sides (bilateral symmetry)', 'a body in segments'], shared: 'many cells' }];
  G('hsbio.cladograms', function (R, ctx) {
    var L = lvl(ctx), S = R.pick(CLADE_SETS), n = S.orgs.length, rows = R.shuffle(S.orgs.map(function (o, i) { return i; }));
    var table = '<div class="mlp-table-wrap"><table class="mlp-table"><tr><th>Organism</th><th>' + cap(S.shared) + '</th>' + S.traits.map(function (t) { return '<th>' + cap(t) + '</th>'; }).join('') + '</tr>' +
      rows.map(function (i) { return '<tr><td>' + cap(S.orgs[i]) + '</td><td>yes</td>' + S.traits.map(function (t, j) { return '<td>' + (i > j ? 'yes' : 'no') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
    var intro = '<p>Use the trait table to build a cladogram.</p>' + table + '<p>';
    if (L === 1) return { q: intro + 'Which organism is the outgroup, the one that branches off first?</p>', a: mc(cap(S.orgs[0]), S.orgs.slice(1).map(cap)),
      hint: 'Which organism has the fewest of the derived traits?', steps: [cap(S.orgs[0]) + ' has none of the derived traits; every other organism has at least ' + S.traits[0] + '.', 'So <b>' + S.orgs[0] + '</b> branches off first.'] };
    if (L === 2) {
      if (R.coin()) return { q: intro + 'Which trait in the table does <b>not</b> help you sort these organisms into branches?</p>', a: mc(cap(S.shared), S.traits.map(cap)),
        hint: 'A trait helps only if some organisms have it and others do not.', steps: ['Every organism has ' + S.shared + ', so it describes the whole group and splits nothing.', 'Answer: <b>' + S.shared + '</b>.'] };
      return { q: intro + 'Which two organisms are most closely related?</p>', a: mc(cap(S.orgs[n - 2]) + ' and ' + S.orgs[n - 1], [cap(S.orgs[0]) + ' and ' + S.orgs[1], cap(S.orgs[1]) + ' and ' + S.orgs[n - 1], cap(S.orgs[0]) + ' and ' + S.orgs[n - 1]]),
        hint: 'Which pair shares the most derived traits?', steps: [cap(S.orgs[n - 2]) + ' and ' + S.orgs[n - 1] + ' share every derived trait but the last one.', 'They are the most deeply nested pair: <b>' + S.orgs[n - 2] + ' and ' + S.orgs[n - 1] + '</b>.'] };
    }
    var k = R.int(1, n - 1), o = S.orgs[k];
    if (R.coin()) return { q: intro + 'How many of the derived traits (not counting ' + S.shared + ') does the ' + o + ' have?', a: num(k), hint: 'Count the "yes" entries in its row, leaving out the trait they all share.', steps: ['The ' + o + ' has: ' + S.traits.slice(0, k).join(', ') + '.', 'That is <b>' + k + '</b>.'] };
    var tj = R.int(0, S.traits.length - 1), grp = S.orgs.slice(tj + 1);
    return { q: intro + 'On the cladogram, the mark for "' + S.traits[tj] + '" sits on the branch leading to which group?</p>', a: mc(grp.map(cap).join(', '), [S.orgs.slice(tj).map(cap).join(', '), S.orgs.slice(tj + 2).length ? S.orgs.slice(tj + 2).map(cap).join(', ') : cap(S.orgs[0]), S.orgs.map(cap).join(', ')]),
      hint: 'A derived trait marks the branch to exactly the organisms that have it.', steps: ['Organisms with ' + S.traits[tj] + ': ' + grp.join(', ') + '.', 'The mark sits on the branch to <b>' + grp.join(', ') + '</b>.'] };
  });

  /* ---------- Hardy-Weinberg Equilibrium ---------- */
  G('hsbio.hardy-weinberg', function (R, ctx) {
    var L = lvl(ctx), q = R.int(1, 9) / 10, p = fix(1 - q);
    if (L === 1) { var giveP = R.coin(), x = giveP ? R.int(5, 95) / 100 : R.int(5, 95) / 100;
      return { q: 'In a population, the frequency of allele ' + (giveP ? 'A is p = ' : 'a is q = ') + T.num(x) + '. What is the frequency of allele ' + (giveP ? 'a (q)' : 'A (p)') + '?', a: num(fix(1 - x)),
        hint: 'The two allele frequencies add to 1.', steps: ['$p + q = 1$.', (giveP ? 'q' : 'p') + ' = 1 − ' + T.num(x) + ' = <b>' + T.num(fix(1 - x)) + '</b>.'] }; }
    var q2 = fix(q * q), pq2 = fix(2 * p * q), p2 = fix(p * p);
    if (L === 2) { var ask = R.pick(['q', 'p', '2pq', 'p2']), pc = T.num(fix(q2 * 100)), v = { q: q, p: p, '2pq': pq2, p2: p2 }[ask];
      return { q: 'A population is in Hardy-Weinberg equilibrium, and ' + pc + '% of its individuals show a recessive trait (aa). What is ' + { q: 'q, the frequency of allele a', p: 'p, the frequency of allele A', '2pq': 'the frequency of carriers (Aa), as a decimal', p2: 'the frequency of AA individuals, as a decimal' }[ask] + '?', a: num(v),
        hint: 'The recessive share is q², not q.', steps: ['aa individuals: $q^2 = ' + T.num(q2) + '$.', '$q = \\sqrt{' + T.num(q2) + '} = ' + T.num(q) + '$; $p = 1 - ' + T.num(q) + ' = ' + T.num(p) + '$.'].concat(ask === '2pq' ? ['$2pq = 2 \\times ' + T.num(p) + ' \\times ' + T.num(q) + ' = ' + T.num(pq2) + '$.'] : ask === 'p2' ? ['$p^2 = ' + T.num(p) + '^2 = ' + T.num(p2) + '$.'] : []).concat(['Answer: <b>' + T.num(v) + '</b>.']) }; }
    if (R.coin()) { var tot = R.pick([100, 200, 400, 500]), nAA = Math.round(tot * p2), nAa = Math.max(1, Math.min(tot - nAA - 1, Math.round(tot * pq2) + R.int(-3, 3))), naa = tot - nAA - nAa, f = B().alleleFreq(nAA, nAa, naa), askQ = R.coin();
      var vv = fix(askQ ? f.q : f.p);
      return { q: 'A sample of ' + tot + ' individuals has ' + nAA + ' AA, ' + nAa + ' Aa and ' + naa + ' aa. What is the frequency of allele ' + (askQ ? 'a (q)' : 'A (p)') + '? (Give a decimal; round to 3 places if needed.)', a: (function () { var nn = askQ ? 2 * naa + nAa : 2 * nAA + nAa, g = gcd(nn, 2 * tot); return { t: 'num', v: (nn / g) + '/' + (2 * tot / g), tol: 0.0006 }; })(),
        hint: 'Count alleles: each individual has two. AA has two A; Aa has one A and one a.', steps: ['There are ' + tot + ' × 2 = ' + 2 * tot + ' alleles.', askQ ? 'a alleles: 2 × ' + naa + ' + ' + nAa + ' = ' + (2 * naa + nAa) + '.' : 'A alleles: 2 × ' + nAA + ' + ' + nAa + ' = ' + (2 * nAA + nAa) + '.', (askQ ? 'q' : 'p') + ' = ' + (askQ ? 2 * naa + nAa : 2 * nAA + nAa) + ' ÷ ' + 2 * tot + ' = <b>' + T.num(+vv.toFixed(3)) + '</b>.'] }; }
    var N = R.pick([1000, 2000, 5000, 10000]), carriers = Math.round(pq2 * N);
    return { q: 'In a population of ' + T.commas(N) + ' in Hardy-Weinberg equilibrium, ' + T.num(fix(q2 * 100)) + '% show a recessive trait. About how many individuals are carriers (Aa)?', a: num(carriers),
      hint: 'Find q from q², then p, then 2pq.', steps: ['$q^2 = ' + T.num(q2) + '$, so $q = ' + T.num(q) + '$ and $p = ' + T.num(p) + '$.', '$2pq = ' + T.num(pq2) + '$.', T.num(pq2) + ' × ' + T.commas(N) + ' = <b>' + T.commas(carriers) + '</b> carriers.'] };
  });

  /* ---------- Mutation, Drift, Gene Flow and Selection ---------- */
  var MECH = ['Mutation', 'Genetic drift', 'Gene flow', 'Natural selection'];
  var MECH_SC = [['A copying error in DNA creates a new allele that no other member of the population has.', 0], ['A storm kills most of a small island\'s lizards at random, and the survivors happen to carry mostly one allele.', 1],
    ['Ten birds blown to a new island start a population, carrying only a few of the mainland alleles.', 1], ['In a population of 30 plants, a harmless allele disappears over a few generations purely by chance.', 1],
    ['Pollen blows from one field of plants into another, bringing alleles the second field lacked.', 2], ['Young wolves leave their pack and join a pack in another valley, bringing their alleles with them.', 2],
    ['Dark moths survive better on soot-darkened trees, so the allele for dark wings becomes more common.', 3], ['Bacteria with a resistance allele survive an antibiotic and multiply, so the allele becomes common.', 3]];
  G('hsbio.mechanisms-evolution', function (R, ctx) {
    var L = lvl(ctx);
    if (L < 3) { var pool = L === 1 ? MECH_SC.filter(function (x) { return x[1] !== 1; }).concat([MECH_SC[2]]) : MECH_SC, sc = R.pick(pool);
      return { q: sc[0] + ' Which mechanism of evolution is this?', a: mc(MECH[sc[1]], MECH.filter(function (x) { return x !== MECH[sc[1]]; })), hint: 'New allele? Chance? Movement between populations? Advantage?',
        steps: [['A new allele appears.', 'Allele frequencies changed by chance, which matters most in small populations.', 'Alleles moved between populations.', 'An allele that helps survival and reproduction became more common.'][sc[1]], 'So it is <b>' + MECH[sc[1]].toLowerCase() + '</b>.'] }; }
    var k = R.int(5, 20), na = R.int(1, 2 * k - 1), qm = R.pick([0.05, 0.1, 0.2, 0.5]);
    if (R.coin()) return { q: k + ' individuals found a new island population. Among their ' + 2 * k + ' alleles for one gene, ' + na + ' are allele a. On the mainland, q = ' + T.num(qm) + '. What is q in the new population? (Round to 3 decimal places if needed.)', a: { t: 'num', v: (na / gcd(na, 2 * k)) + '/' + (2 * k / gcd(na, 2 * k)), tol: 0.0006 },
      hint: 'Count alleles, not individuals.', steps: ['q = ' + na + ' ÷ ' + 2 * k + ' ≈ <b>' + T.num(+(na / (2 * k)).toFixed(3)) + '</b>.', 'It differs from the mainland\'s ' + T.num(qm) + ' by chance: the founder effect, a kind of genetic drift.'] };
    var big = R.pick([20000, 50000, 100000]), small = R.int(10, 30);
    return { q: 'Hunting cuts a seal population from ' + T.commas(big) + ' to ' + small + ' animals, who are spared by chance. Later the population grows back to ' + T.commas(big) + '. Which is most likely true of its genetic variation?', a: mc('It has much less variation than before, because only the survivors\' alleles were passed on', ['It has the same variation as before', 'It has more variation, because the population grew', 'The lost alleles came back as the population grew']),
      hint: 'Where did all the new seals\' alleles come from?', steps: ['Every later seal descends from the ' + small + ' survivors, a small chance sample of the old population.', 'Alleles the survivors lacked are gone: <b>much less variation</b>. This is a bottleneck, a kind of genetic drift.'] };
  });

  /* ---------- How New Species Form ---------- */
  var ISO = ['Geographic isolation', 'Habitat isolation', 'Timing isolation', 'Polyploidy'];
  var ISO_SC = [['A river changes course and splits a population of ground beetles in two.', 0], ['A rising strip of land separates a sea into two seas, splitting a population of shrimp.', 0], ['Squirrels on two rims of a deep canyon stop meeting.', 0],
    ['In the same forest, one group of an insect comes to live and feed only on oak trees, another only on maples.', 1], ['Two groups of a fish species in one lake live in different zones: one near the bottom, one in open water.', 1],
    ['Two populations of a wildflower grow in the same meadow, but one flowers in April and the other in June.', 2], ['Two populations of a tree release pollen at different times of year, so they rarely pollinate each other.', 2],
    ['A plant with 2n = 14 gives rise to plants with 28 chromosomes after a cell-division error doubles its chromosomes.', 3], ['A hybrid of two grass species doubles its chromosome number and can no longer have fertile offspring with either parent species.', 3],
    ['Lava flows split a forest into patches, cutting off populations of land snails from each other.', 0], ['Fish in two lakes that were once one lake stop meeting after the water level drops.', 0],
    ['Two groups of a fly species in the same area come to lay eggs on different kinds of fruit trees, one on apples and one on hawthorns.', 1], ['Two pine populations on the same coast release their pollen in different months.', 2],
    ['A tetraploid (4n) daisy arises in a diploid (2n) population and its offspring with the diploids cannot themselves have offspring.', 3]];
  G('hsbio.speciation', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var sc = R.pick(ISO_SC); return { q: sc[0] + ' What is most likely starting to separate these populations into new species?', a: mc(ISO[sc[1]], ISO.filter(function (x) { return x !== ISO[sc[1]]; })),
      hint: 'A barrier? Different places to live? Different times? A doubled chromosome set?', steps: [['A physical barrier stops gene flow.', 'They live in different habitats in the same area, so they rarely meet.', 'They are active or flower at different times, so genes stop flowing.', 'The doubled chromosome set keeps the new plants from having fertile offspring with the old ones.'][sc[1]], '<b>' + ISO[sc[1]] + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) return { q: 'What has to happen for one species to split into two?', a: mc('The populations must stop exchanging genes', ['A single large mutation must appear in one animal', 'The populations must be separated by a mountain or an ocean every time', 'One population must become stronger than the other']),
        hint: 'What keeps two groups of the same species alike?', steps: ['Gene flow keeps populations alike.', 'Once <b>gene flow stops</b>, each population changes on its own. A physical barrier is one way, but not the only one.'] };
      return { q: 'Which statement about speciation is correct?', a: mc('In plants, a doubled chromosome set can make a new species in one generation', ['A new species of animal usually appears suddenly from one big mutation', 'Speciation can only happen when a physical barrier divides a population', 'Two populations living side by side can never become separate species']),
        hint: 'Think about polyploidy in plants and about habitat and timing.', steps: ['Most speciation is gradual, and habitat or timing can split populations without a barrier.', 'Polyploidy is the exception that is fast: <b>a doubled chromosome set can isolate plants in one generation</b>.'] };
    }
    if (R.coin()) { var n = R.pick([7, 8, 9, 10, 12, 14]), two = 2 * n;
      return { q: 'A plant species has 2n = ' + two + '. A cell-division error doubles its chromosomes, making a new plant that is 4n. How many chromosomes are in each of the new plant\'s body cells?', a: num(2 * two),
        hint: 'Doubling the whole set.', steps: ['2n = ' + two + ', so n = ' + n + '.', '4n = <b>' + 2 * two + '</b> chromosomes.'] }; }
    var n1 = R.int(5, 12), n2 = R.int(5, 12);
    return { q: 'Two plant species have gametes with n = ' + n1 + ' and n = ' + n2 + ' chromosomes. A hybrid forms from one gamete of each, and then its chromosome number doubles, making a new species. How many chromosomes are in its body cells?', a: num(2 * (n1 + n2)),
      hint: 'First the hybrid, then the doubling.', steps: ['The hybrid has ' + n1 + ' + ' + n2 + ' = ' + (n1 + n2) + ' chromosomes.', 'Doubling: 2 × ' + (n1 + n2) + ' = <b>' + 2 * (n1 + n2) + '</b>. (Bread wheat formed by steps like these.)'] };
  });
  /* ===================================== Unit 11: Ecology ===================================== */
  var CRITTERS = ['rabbits', 'deer', 'mice', 'squirrels', 'beetles', 'frogs', 'trout', 'sparrows'];
  /* ---------- Exponential and Logistic Growth ---------- */
  G('hsbio.population-models', function (R, ctx) {
    var L = lvl(ctx), sp = R.pick(CRITTERS), r = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
    if (L === 1) { var N = 100 * R.int(2, 30), v = fix(r * N);
      return { q: 'A population of ' + T.commas(N) + ' ' + sp + ' has plenty of food and space and grows exponentially with r = ' + T.num(r) + ' per year. How fast is it growing right now (individuals per year)?', a: num(v), unit: 'per year',
        hint: 'Exponential growth: $\\frac{dN}{dt} = rN$.', steps: ['$\\frac{dN}{dt} = rN = ' + T.num(r) + ' \\times ' + N + '$.', '= <b>' + T.commas(v) + '</b> per year.'] }; }
    var K = 1000 * R.int(1, 5);
    if (L === 2) {
      if (R.chance(0.35)) return { q: 'A population of ' + sp + ' grows logistically toward a carrying capacity of K = ' + T.commas(K) + '. At what population size is it growing fastest?', a: num(K / 2),
        viz: { name: 'bi-population', opts: { model: 'logistic', K: K, r: 0.5, N0: K / 50, quiet: true, interactive: false } },
        hint: 'Look for the steepest point of the S-curve.', steps: ['$\\frac{dN}{dt} = rN\\frac{K - N}{K}$ is largest when N is half of K.', 'K/2 = <b>' + T.commas(K / 2) + '</b>.'] };
      var f = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9]), N2 = fix(f * K), v2 = fix(r * N2 * (K - N2) / K);
      return { q: 'A population of ' + sp + ' grows logistically with r = ' + T.num(r) + ' per year and K = ' + T.commas(K) + '. How fast is it growing when N = ' + T.commas(N2) + '?', a: num(v2), unit: 'per year',
        hint: 'Logistic growth: $\\frac{dN}{dt} = rN\\frac{K - N}{K}$.', steps: ['$\\frac{K - N}{K} = \\frac{' + (K - N2) + '}{' + K + '} = ' + T.num(fix((K - N2) / K)) + '$.', '$' + T.num(r) + ' \\times ' + N2 + ' \\times ' + T.num(fix((K - N2) / K)) + ' = ' + T.num(v2) + '$.', 'It grows by <b>' + T.commas(v2) + '</b> per year.'] };
    }
    if (R.coin()) { var opts = [0.1, 0.5, 0.9, 0.98].map(function (x) { return fix(x * K); });
      return { q: 'A population of ' + sp + ' grows logistically toward K = ' + T.commas(K) + '. At which of these sizes is it adding individuals fastest?', a: mc(T.commas(K / 2), opts.filter(function (x) { return x !== K / 2; }).map(function (x) { return T.commas(x); })),
        hint: 'Growth is r × N × (share of room left). Which size makes that product biggest?', steps: opts.map(function (x) { return 'N = ' + T.commas(x) + ': N(K − N)/K = ' + T.commas(fix(x * (K - x) / K)); }).concat(['The largest is at <b>N = ' + T.commas(K / 2) + '</b>, half of K.']) }; }
    var N0 = R.pick([50, 100, 200, 500]), d = R.pick([2, 3, 5]), t = d * R.int(2, 6), v3 = N0 * Math.pow(2, t / d);
    return { q: 'With unlimited resources, a population of ' + N0 + ' ' + sp + ' doubles every ' + d + ' years. How many will there be after ' + t + ' years?', a: num(v3),
      hint: 'Count how many doublings fit into ' + t + ' years.', steps: [t + ' ÷ ' + d + ' = ' + t / d + ' doublings.', N0 + ' × $2^{' + t / d + '}$ = <b>' + T.commas(v3) + '</b>.'] };
  });

  /* ---------- Density-Dependent and Independent Factors ---------- */
  var DEP = ['A disease that spreads from animal to animal', 'Competition for a limited food supply', 'Predators that hunt more where prey are crowded', 'Competition for nesting sites', 'A parasite that spreads in crowded burrows', 'Wastes that build up in a crowded pond'];
  var IND = ['A flood', 'An early hard frost', 'A hurricane', 'A wildfire started by lightning', 'A volcanic eruption', 'A severe drought'];
  var DD = ['Density-dependent', 'Density-independent'];
  G('hsbio.density-factors', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var dep = R.coin(), f = R.pick(dep ? DEP : IND);
      return { q: f + ' limits a population. Is it a density-dependent or a density-independent factor?', a: mcKeep(DD, DD[dep ? 0 : 1]),
        hint: 'Does it hit each individual harder when the population is crowded?', steps: [dep ? 'Its effect on each individual grows as the population gets more crowded.' : 'It strikes regardless of how crowded the population is.', 'So it is <b>' + DD[dep ? 0 : 1].toLowerCase() + '</b>.'] }; }
    var sp = R.pick(CRITTERS), lo = R.int(2, 6) * 50, hi = lo * R.int(2, 4), dep2 = R.coin(), r1 = R.pick([5, 10, 15, 20]), r2 = dep2 ? r1 + R.int(2, 5) * 5 : r1;
    var cause = dep2 ? R.pick(['food running short', 'a contact disease', 'predation']) : R.pick(['a hard frost', 'a flood', 'a storm']);
    if (L === 2) return { q: 'In a year with ' + lo + ' ' + sp + ', ' + r1 + '% died from ' + cause + '. In a year with ' + hi + ', ' + r2 + '% died from it. Does ' + cause + ' act as a density-dependent factor here?', a: mcKeep(['Yes, density-dependent', 'No, density-independent'], dep2 ? 'Yes, density-dependent' : 'No, density-independent'),
      hint: 'Compare the death rates (percents), not the numbers of deaths.', steps: ['The rate went from ' + r1 + '% to ' + r2 + '% as the population grew.', dep2 ? 'A rate that rises with crowding is the mark of a <b>density-dependent</b> factor.' : 'The rate stayed the same, so it is <b>density-independent</b> (more animals died only because there were more animals).'] };
    var d1 = lo * r1 / 100, d2 = hi * r2 / 100;
    return { q: 'Two years of data for ' + sp + ' and deaths from ' + cause + ': ' + lo + ' animals, ' + d1 + ' deaths; ' + hi + ' animals, ' + d2 + ' deaths. Which kind of factor is ' + cause + ' here?', a: mcKeep(DD, DD[dep2 ? 0 : 1]),
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: [lo + ' animals', hi + ' animals'], series: [{ name: 'Deaths', values: [d1, d2] }], ylabel: 'Deaths', values: true, quiet: true, interactive: false } },
      hint: 'More deaths in a bigger population is expected. Find the percent that died each year.', steps: ['Death rates: ' + d1 + ' ÷ ' + lo + ' = ' + r1 + '%, and ' + d2 + ' ÷ ' + hi + ' = ' + r2 + '%.', dep2 ? 'The rate rose with crowding: <b>density-dependent</b>.' : 'The rate stayed the same: <b>density-independent</b>.'] };
  });

  /* ---------- Niches and Community Interactions ---------- */
  var INTER = ['Mutualism', 'Commensalism', 'Parasitism', 'Predation', 'Competition'];
  var INTER_SC = [['Bees drink nectar from flowers and carry pollen between them.', 0], ['Nitrogen-fixing bacteria live in the roots of bean plants, which give them sugar.', 0], ['A fungus and an alga live together as a lichen: the alga makes food and the fungus holds water.', 0], ['Clownfish shelter in a sea anemone and chase off fish that eat the anemone.', 0],
    ['Barnacles ride on a whale, which is not helped or harmed.', 1], ['Cattle egrets follow cattle and eat the insects the cattle stir up.', 1], ['A bird builds its nest in a tree, which is not affected.', 1],
    ['A tick feeds on the blood of a deer.', 2], ['A tapeworm lives in the gut of a dog and absorbs its food.', 2], ['Mistletoe grows on a tree and takes water and nutrients from it.', 2],
    ['A lynx catches and eats a snowshoe hare.', 3], ['An owl swoops down and eats a mouse.', 3], ['Hawks and foxes both hunt the same mice in a meadow.', 4], ['Two kinds of weeds in a garden take water and light from the same patch of soil.', 4]];
  var SIGNS = { Mutualism: '+ / +', Commensalism: '+ / 0', Parasitism: '+ / − (the host is harmed, usually not killed quickly)', Predation: '+ / − (the prey is killed and eaten)', Competition: '− / −' };
  G('hsbio.community-interactions', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var sc = R.pick(INTER_SC); return { q: sc[0] + ' What kind of interaction is this?', a: mc(INTER[sc[1]], INTER.filter(function (x, i) { return i !== sc[1]; })),
      hint: 'Decide whether each species is helped (+), harmed (−) or unaffected (0).', steps: ['Effects: ' + SIGNS[INTER[sc[1]]] + '.', 'That is <b>' + INTER[sc[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) {
      if (R.coin()) { var sp = R.pick([['a gray squirrel', 'an oak forest', 'eats acorns and nuts, is active by day, and nests in tree holes'], ['a brown trout', 'a cold mountain stream', 'eats insects and small fish, feeds most at dusk, and needs cold water rich in oxygen'], ['a barn owl', 'farm fields and old barns', 'hunts mice at night and roosts in buildings']]), askNiche = R.coin();
        return { q: 'A ' + sp[0].replace(/^an? /, '') + ' lives in ' + sp[1] + '. It ' + sp[2] + '. Which describes its ' + (askNiche ? '<b>niche</b>' : '<b>habitat</b>') + '?', a: mc(askNiche ? 'It ' + sp[2] : cap(sp[1]), [askNiche ? cap(sp[1]) : 'It ' + sp[2], 'Its body size and color', 'The number of its kind in the area']),
          hint: 'Habitat: where it lives. Niche: how it lives there.', steps: ['The habitat is the address: ' + sp[1] + '.', 'The niche is the role: it ' + sp[2] + '.', 'Answer: <b>' + (askNiche ? 'what it eats, when it is active and what it needs' : sp[1]) + '</b>.'] }; }
      var it = R.int(0, 4), w = INTER[it];
      return { q: 'Which pair of effects describes ' + w.toLowerCase() + '? (+ helped, − harmed, 0 not affected)', a: mc(SIGNS[w].split(' (')[0], ['+ / +', '+ / 0', '+ / −', '− / −', '0 / 0'].filter(function (x) { return x !== SIGNS[w].split(' (')[0]; })),
        hint: 'Who gains, who loses?', steps: [cap(w) + ': ' + SIGNS[w] + '.'] };
    }
    var a = R.int(3, 8) * 100, b = R.int(3, 8) * 100, wins = R.coin(), part = R.chance(0.35);
    if (part) return { q: 'Two kinds of beetles eat the same seeds. Grown together, both kinds persist. A study shows one eats large seeds and the other small seeds. What explains how they coexist?', a: mc('Resource partitioning: they divide the food, so their niches differ', ['Competitive exclusion: one is driving the other out', 'Mutualism: they help each other', 'They do not need food']),
      hint: 'Do they compete for exactly the same thing?', steps: ['They share a habitat but use different sizes of seed.', 'Dividing a resource lets them coexist: <b>resource partitioning</b>.'] };
    return { q: 'Two kinds of protists that eat the same bacteria are grown in jars. Alone, species A levels off at ' + a + ' per mL and species B at ' + b + '. Grown together, species ' + (wins ? 'A' : 'B') + ' levels off near its usual number and species ' + (wins ? 'B' : 'A') + ' dies out. What principle does this show?', a: mc('Competitive exclusion: two species cannot share the exact same niche for long', ['Mutualism: the two species helped each other', 'Density-independent limits', 'Commensalism']),
      viz: { name: 'bi-chart', opts: { kind: 'line', x: [0, 2, 4, 6, 8, 10, 12, 14, 16], series: [{ name: 'Species ' + (wins ? 'A' : 'B') + ', grown together', values: [2, 8, 25, 55, 80, 92, 96, 98, 98].map(function (x) { return Math.round(x * (wins ? a : b) / 100); }) }, { name: 'Species ' + (wins ? 'B' : 'A') + ', grown together', values: [2, 7, 18, 26, 22, 14, 7, 3, 0].map(function (x) { return Math.round(x * (wins ? b : a) / 100); }) }], xlabel: 'Day', ylabel: 'Per mL', quiet: true, interactive: false } },
      hint: 'What happened to the loser when they shared the same food?', steps: ['Each species does well alone, but together one dies out.', 'This is <b>competitive exclusion</b>, as in Gause\'s <i>Paramecium</i> experiments.'] };
  });

  /* ---------- Energy Flow and Biomass ---------- */
  var CHAINS = [['grass', 'grasshopper', 'mouse', 'snake', 'hawk'], ['algae', 'krill', 'fish', 'seal', 'shark'], ['algae', 'snail', 'fish', 'heron'], ['tree', 'caterpillar', 'robin', 'owl'], ['grass', 'rabbit', 'fox']];
  function nm(k) { return B().THINGS[k].name; }
  G('hsbio.energy-flow', function (R, ctx) {
    var L = lvl(ctx), ch = R.pick(CHAINS), base = R.pick([10000, 20000, 50000, 100000, 80000]);
    if (L === 1) { var k = R.int(2, Math.min(4, ch.length)), v = fix(base * Math.pow(0.1, k - 1));
      return { q: 'In a food chain, ' + ch.slice(0, k).map(nm).join(' → ') + ', the producers capture ' + T.commas(base) + ' kcal. Using the 10% rule, about how much energy reaches the ' + nm(ch[k - 1]) + '?', a: num(v), unit: 'kcal',
        viz: { name: 'bi-pyramid', opts: { levels: ch.slice(0, k), base: base, quiet: true, interactive: false, ask: k - 1 } },
        hint: 'Each step up keeps about a tenth.', steps: ch.slice(1, k).map(function (x, i) { return nm(x) + ': 10% of ' + T.commas(fix(base * Math.pow(0.1, i))) + ' = ' + T.commas(fix(base * Math.pow(0.1, i + 1))) + ' kcal.'; }).concat(['About <b>' + T.commas(v) + ' kcal</b>.']) }; }
    if (L === 2) {
      if (R.chance(0.3)) return { q: 'Only about 10% of the energy in one trophic level ends up in the next. What happens to most of the rest?', a: mc('It is used in cellular respiration and given off as heat', ['It is destroyed', 'It is stored in the soil for later', 'It turns into matter']),
        hint: 'Energy is never created or destroyed.', steps: ['Most food energy powers the eater\'s own life through respiration, plus some is lost in waste.', 'That energy leaves as <b>heat</b>; it is not destroyed.'] };
      var top = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100]), lev = R.int(3, 4), need = top * Math.pow(10, lev - 1);
      return { q: 'A top predator at trophic level ' + lev + ' (producers are level 1) gets ' + top + ' kcal per square meter each year. About how much energy must the producers capture, by the 10% rule?', a: num(need), unit: 'kcal',
        hint: 'Going down a level, multiply by 10.', steps: ['Each level down holds about 10 times as much energy.', top + ' × 10' + (lev > 2 ? '<sup>' + (lev - 1) + '</sup>' : '') + ' = <b>' + T.commas(need) + ' kcal</b>.'] };
    }
    var lo = R.pick([800, 1000, 1200, 1500, 2000, 2500, 4000]), pc = R.pick([5, 6, 8, 10, 12, 15, 20]), hi = lo * pc / 100;
    return { q: 'Herbivores in a field store ' + T.commas(lo) + ' kcal per square meter in a year; the predators that eat them store ' + T.num(hi) + ' kcal. What is the energy transfer efficiency, in percent?', a: num(pc, { pct: true }),
      hint: 'Efficiency = (energy at the higher level ÷ energy at the lower level) × 100.', steps: [T.num(hi) + ' ÷ ' + T.commas(lo) + ' = ' + T.num(fix(pc / 100)) + '.', 'That is <b>' + pc + '%</b>' + (pc === 10 ? ', right at the rough rule.' : ', ' + (pc < 10 ? 'a bit below' : 'above') + ' the rough 10% rule, which is only an average.')] };
  });

  /* ---------- The Carbon, Nitrogen and Phosphorus Cycles ---------- */
  var PROC = [['nitrogen fixation', 'converts nitrogen gas (N₂) from the air into ammonia'], ['nitrification', 'converts ammonia into nitrate'], ['denitrification', 'converts nitrate back into nitrogen gas'], ['photosynthesis', 'moves carbon from carbon dioxide in the air into sugar'],
    ['cellular respiration', 'returns carbon to the air as carbon dioxide'], ['weathering', 'releases phosphate from rock into soil and water'], ['combustion (burning)', 'releases carbon stored in fuels and wood as carbon dioxide']];
  G('hsbio.matter-cycles', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var cyc = R.pick(['carbon', 'nitrogen', 'phosphorus']), M = B().MATTER[cyc], names = uniq(M.steps.map(function (s) { return s[0]; })), i = R.int(0, M.steps.length - 1), st = M.steps[i];
      return { q: 'In this ' + M.name + ', which process does the arrow marked "?" stand for? It carries ' + (cyc === 'carbon' ? 'carbon' : cyc) + ' from ' + M.stores[st[1]] + ' to ' + M.stores[st[2]] + '.', viz: { name: 'bi-cycle', opts: { cycle: cyc, quiet: true, interactive: false, ask: i } },
        a: mc(cap(st[0]), R.sample(names.filter(function (n) { return n !== st[0]; }), 3).map(cap)), hint: 'Which process moves matter from the first store to the second?', steps: ['From ' + M.stores[st[1]] + ' to ' + M.stores[st[2]] + ': <b>' + st[0] + '</b>.'] }; }
    if (L === 2) { var p = R.pick(PROC), byName = R.coin();
      return byName ? { q: 'Which process ' + p[1] + '?', a: mc(cap(p[0]), R.sample(PROC.filter(function (x) { return x !== p; }), 3).map(function (x) { return cap(x[0]); })), hint: 'Picture what goes in and what comes out.', steps: ['<b>' + cap(p[0]) + '</b> ' + p[1] + '.'] } :
        { q: 'What does ' + p[0] + ' do?', a: mc(cap(p[1]), R.sample(PROC.filter(function (x) { return x !== p; }), 3).map(function (x) { return cap(x[1]); })), hint: 'Picture what goes in and what comes out.', steps: [cap(p[0]) + ' ' + p[1] + '.'] }; }
    var s3 = R.int(0, 2);
    if (s3 === 0) return { q: 'Which of these cycles has no significant gas phase in the atmosphere?', a: mc('The phosphorus cycle', ['The carbon cycle', 'The nitrogen cycle', 'The water cycle']), hint: 'Which element moves mostly through rock, soil and water?', steps: ['Carbon (CO₂), nitrogen (N₂) and water (vapor) all have gas forms in the air.', '<b>Phosphorus</b> has no significant gas form; it cycles through rock, soil, water and living things.'] };
    if (s3 === 1) return { q: 'Air is about 78% nitrogen gas. Why can\'t most plants use it directly?', a: mc('N₂ must first be fixed, mostly by bacteria, into ammonia or nitrate that roots can absorb', ['Plants can only absorb nitrogen through their leaves', 'Nitrogen gas is poisonous to plants', 'Plants do not need nitrogen']),
      hint: 'Which organisms can break the strong bond in N₂?', steps: ['The two atoms in N₂ are held by a very strong triple bond.', 'Only some bacteria (and lightning) can fix it into <b>ammonia or nitrate</b>, the forms roots take up.'] };
    var steps = ['nitrogen fixation by bacteria', 'nitrification to nitrate', 'uptake by plant roots', 'eating by an animal'], sh = R.shuffle([0, 1, 2, 3]), right = [0, 1, 2, 3].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', '), wr = [];
    while (wr.length < 3) { var w = R.shuffle(['A', 'B', 'C', 'D']).join(', '); if (w !== right && wr.indexOf(w) < 0) wr.push(w); }
    return { q: 'Put these steps in order to follow a nitrogen atom from the air into an animal. ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: ' + steps[i] + '.'; }).join(' '), a: mc(right, wr),
      hint: 'Start with N₂ in the air.', steps: ['Air N₂ → fixed to ammonia → nitrified to nitrate → taken up by roots → eaten.', 'Order: <b>' + right + '</b>.'] };
  });

  /* ---------- Aerobic and Anaerobic Conditions ---------- */
  var ANA = [['A field floods for several weeks. What happens to the nitrate in its soil?', 'Denitrifying bacteria use it in place of oxygen and turn it into nitrogen gas, so it decreases', ['It increases, because water carries nitrate in', 'Nothing: microbes stop working without oxygen', 'Plants absorb all of it at once']],
    ['Rice paddies and wetlands release methane gas. Where does it come from?', 'Archaea that break down dead matter without oxygen make it', ['Plants make it by photosynthesis', 'It escapes from rocks under the water', 'Fish breathe it out']],
    ['Why does peat, made of partly decayed moss, build up in bogs?', 'The waterlogged bog has little oxygen, so decomposers break down dead plants very slowly', ['Moss cannot die', 'Bogs have no decomposers of any kind', 'Peat grows from seeds']],
    ['A sealed jar of grape juice with yeast bubbles and makes alcohol. What process are the yeast using?', 'Fermentation, because oxygen has run out', ['Photosynthesis', 'Aerobic respiration', 'Nitrogen fixation']]];
  G('hsbio.aerobic-anaerobic', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { if (R.coin()) return { q: 'What happens to living things in waterlogged soil, where oxygen runs out?', a: mc('Many microbes keep living, using fermentation or other pathways that do not need oxygen', ['All life there stops', 'Every organism there dies within minutes', 'The soil makes its own oxygen']),
      hint: 'Do all organisms need oxygen?', steps: ['Many microbes do not need oxygen, and some cannot survive it.', 'So <b>anaerobic life keeps going</b>, by fermentation or by using other substances in place of oxygen.'] };
      var w = R.pick([['aerobic', 'with oxygen'], ['anaerobic', 'without oxygen']]); return { q: 'What does "' + w[0] + '" mean?', a: mc(cap(w[1]), [w[0] === 'aerobic' ? 'Without oxygen' : 'With oxygen', 'With light', 'Without water']), hint: 'Aero- refers to air.', steps: ['"' + cap(w[0]) + '" means <b>' + w[1] + '</b>.'] }; }
    if (L === 2) { var c = R.pick(ANA); return { q: c[0], a: mc(c[1], c[2]), hint: 'What changes when oxygen is missing?', steps: ['Without oxygen, microbes switch to other pathways.', '<b>' + c[1] + '</b>.'] }; }
    var g = R.int(2, 30), aer = 30, ferm = 2;
    if (R.coin()) return { q: 'Take aerobic respiration to make about ' + aer + ' ATP per glucose, and fermentation 2. How many glucose molecules must a cell ferment to make as much ATP as it gets from ' + g + ' glucose by aerobic respiration?', a: num(g * aer / ferm),
      hint: 'Find the ATP from aerobic respiration, then divide by 2 per glucose.', steps: [g + ' × ' + aer + ' = ' + g * aer + ' ATP.', g * aer + ' ÷ 2 = <b>' + g * aer / ferm + '</b> glucose by fermentation.'] };
    return { q: 'A yeast culture in a sealed jar ferments ' + g * 10 + ' glucose molecules. Fermentation makes 2 ATP per glucose. How many ATP does it make?', a: num(g * 20),
      hint: 'Fermentation makes 2 ATP per glucose.', steps: [g * 10 + ' × 2 = <b>' + g * 20 + '</b> ATP (and ' + g * 20 + ' CO₂, which is why bread dough rises).'] };
  });

  /* ---------- Stability, Disturbance and Change ---------- */
  G('hsbio.stability-change', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) return { q: R.pick(['Which best describes a stable ecosystem?', 'An ecologist calls a meadow ecosystem stable. What does that mean?']), a: mc('Its populations go up and down but stay within a range, and recover after small disturbances', ['Its populations never change', 'It has only one kind of plant', 'It never has storms or fires']),
      hint: 'Do populations in a healthy ecosystem stay perfectly constant?', steps: ['Populations always fluctuate.', 'Stable means they stay <b>within a range</b> and come back after small upsets.'] };
    var base = R.int(30, 60) * 10, sp = R.pick(['fish in a pond', 'hares in a forest', 'beetles in a meadow', 'birds on an island']), yrs = [], shift = R.coin(), dy = R.int(3, 5);
    for (var y = 0; y < 9; y++) { var v = base + R.int(-6, 6) * 5; if (y === dy) v = Math.round(base * 0.35); if (y > dy) v = shift ? Math.round(base * 0.35) + R.int(-3, 3) * 5 : (y === dy + 1 ? Math.round(base * 0.7) : v); yrs.push(v); }
    var viz = { name: 'bi-chart', opts: { kind: 'line', x: yrs.map(function (_, i) { return i + 1; }), series: [{ name: sp, values: yrs }], xlabel: 'Year', ylabel: 'Count', quiet: true, interactive: false } };
    if (L === 2) return { q: 'Counts of ' + sp + ' each year: ' + yrs.join(', ') + '. A severe disturbance hit in year ' + (dy + 1) + '. Did the ecosystem recover or shift to a new state?', viz: viz, a: mcKeep(['It recovered to its old range', 'It shifted to a new state'], shift ? 'It shifted to a new state' : 'It recovered to its old range'),
      hint: 'Compare the years after the disturbance with the range before it.', steps: ['Before: between ' + Math.min.apply(null, yrs.slice(0, dy)) + ' and ' + Math.max.apply(null, yrs.slice(0, dy)) + '.', shift ? 'After: it stayed near ' + Math.round(base * 0.35) + ', far below the old range: <b>a shift</b>.' : 'After: it climbed back into the old range within two years: <b>it recovered</b>.'] };
    var before = yrs.slice(0, dy);
    return { q: 'Counts of ' + sp + ' each year: ' + yrs.join(', ') + '. A disturbance hit in year ' + (dy + 1) + '. Before it, what was the range of the counts (largest minus smallest)?', viz: viz, a: num(Math.max.apply(null, before) - Math.min.apply(null, before)),
      hint: 'Use only years 1 to ' + dy + '.', steps: ['Years 1 to ' + dy + ': ' + before.join(', ') + '.', Math.max.apply(null, before) + ' − ' + Math.min.apply(null, before) + ' = <b>' + (Math.max.apply(null, before) - Math.min.apply(null, before)) + '</b>.'] };
  });

  /* ---------- Keystone Species and Trophic Cascades ---------- */
  var CASC = [['grass', 'rabbit', 'fox'], ['tree', 'deer', 'wolf'], ['algae', 'snail', 'fish', 'heron'], ['algae', 'krill', 'fish', 'seal'], ['grass', 'grasshopper', 'mouse', 'snake'], ['tree', 'caterpillar', 'robin', 'owl']];
  var PLUR = { fox: 'foxes', mouse: 'mice', wolf: 'wolves', fish: 'fish', deer: 'deer', krill: 'krill', algae: 'algae', grass: 'grass', tree: 'oak trees' };
  function plural(k) { return PLUR[k] || nm(k) + 's'; }
  var TXT_CH = [['kelp', 'sea urchins', 'sea otters'], ['algae', 'water fleas', 'minnows', 'bass'], ['plants', 'insects', 'frogs', 'snakes'], ['seaweed', 'snails', 'crabs', 'octopuses'], ['young trees', 'elk', 'wolves'], ['mussels', 'sea stars']];
  var CAUSE = ['are removed', 'are wiped out by a disease', 'are hunted out', 'disappear from the area'];
  G('hsbio.keystone-species', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1 && R.chance(0.3)) return { q: 'What makes a species a keystone species?', a: mc('Its effect on the ecosystem is much larger than its numbers or mass would suggest', ['It is the most numerous species', 'It is the largest species', 'It is a producer at the base of the food chain']),
      hint: 'Think of the sea star on the rocky shore.', steps: ['Keystone species are often uncommon predators.', 'What sets them apart is a <b>large effect for their numbers</b>: removing them reshapes the community.'] };
    var useKit = R.coin(), ch, names;
    if (useKit) { ch = L === 1 ? R.pick(CASC.slice(0, 2)) : R.pick(CASC.filter(function (c) { return c.length === 4; })); names = ch.map(plural); }
    else { ch = L === 1 ? R.pick(TXT_CH.filter(function (c) { return c.length <= 3; })) : R.pick(TXT_CH.filter(function (c) { return c.length === 4; })); names = ch; }
    var n = ch.length, rem = L === 3 && R.coin() ? n - 2 : n - 1, ask = R.int(0, rem - 1), up = (rem - ask) % 2 === 1, word = up ? 'Increase' : 'Decrease', steps = [];
    for (var i = rem - 1; i >= ask; i--) steps.push((rem - i) % 2 === 1 ? 'Fewer eaters: ' + names[i] + ' increase.' : 'More ' + names[i + 1] + ' eating them: ' + names[i] + ' decrease.');
    var pr = { q: 'In this food chain, ' + names.join(' → ') + ' (each arrow points from food to eater), the ' + names[rem] + ' ' + R.pick(CAUSE) + '. What happens, in time, to the ' + names[ask] + '?',
      a: mc(word, [up ? 'Decrease' : 'Increase', 'Stay the same, since they are not eaten by the ' + names[rem]]), hint: 'Work down the chain one level at a time: each step flips the effect.', steps: steps.concat(['So the ' + names[ask] + ' <b>' + word.toLowerCase() + '</b>: a trophic cascade.']) };
    if (useKit) pr.viz = { name: 'bi-foodweb', opts: { chain: ch, interactive: false, highlight: [ch[rem]] } };
    return pr;
  });

  /* ---------- Group Behavior ---------- */
  var GB = [['Zebras in a herd notice an approaching lion sooner than a zebra alone does.', 'Many eyes: more individuals watching for predators'], ['A hawk that dives into a flock of 200 starlings catches one bird, so each bird\'s risk is small.', 'Dilution: each individual\'s risk is shared among many'],
    ['A barracuda has trouble picking out one sardine from a swirling school.', 'Confusion: predators cannot easily target one individual'], ['Wolves in a pack bring down an elk too large for one wolf to catch.', 'Cooperative hunting: together they catch larger prey']];
  G('hsbio.group-behavior', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var g = R.pick(GB); return { q: g[0] + ' Which benefit of group living does this show?', a: mc(g[1], GB.filter(function (x) { return x !== g; }).map(function (x) { return x[1]; })), hint: 'Is it about seeing, sharing risk, confusing, or hunting?', steps: ['<b>' + g[1] + '</b>.'] }; }
    var n = R.chance(0.3) ? R.pick([5, 8, 10, 20, 25, 40, 50, 100]) : R.int(4, 80);
    if (L === 2) { if (R.chance(0.3)) return { q: 'Why do animals that live in groups keep that behavior over many generations?', a: mc('It raises the survival and reproduction of the individuals who do it', ['They do it for the good of the species', 'They are taught it by the oldest animal', 'Groups never have any costs']),
      hint: 'Natural selection acts on what individuals pass on.', steps: ['Selection favors alleles that help the individuals carrying them.', 'Group behavior persists because it <b>helps the individuals</b> in the group, not because it helps the species.'] };
      return { q: 'A predator catches exactly one animal each time it attacks a group of ' + n + '. What is the chance that a particular animal in the group is the one caught in one attack?', a: fracA(1, n), hint: 'Each animal is equally likely to be the one.', steps: ['Each of the ' + n + ' is equally likely to be taken.', 'Chance: <b>' + T.frac(1, n) + '</b>' + (100 % n === 0 ? ' = ' + 100 / n + '%' : '') + '.'] }; }
    var k = R.int(2, Math.min(5, n - 1));
    return { q: 'A predator attacks a school of ' + n + ' fish ' + k + ' times, catching one fish each time, and no new fish join. What is the chance that a particular fish survives all ' + k + ' attacks?', a: fracA(n - k, n),
      hint: 'Multiply the chance of surviving each attack: ' + T.frac(n - 1, n) + ', then ' + T.frac(n - 2, n - 1) + ', …', steps: ['Survive attack 1: ' + T.frac(n - 1, n) + '. Then ' + T.frac(n - 2, n - 1) + (k > 2 ? ', and so on' : '') + '.', 'The product telescopes: ' + T.frac(n - k, n) + '. Answer: <b>' + T.frac(n - k, n) + '</b>.'] };
  });

  /* ---------- Biodiversity and Human Impact ---------- */
  var TREESP = ['oak', 'maple', 'birch', 'pine', 'hickory', 'beech'];
  function simpsonTex(c) { var N = c.reduce(function (s, x) { return s + x; }, 0); return c.map(function (x) { return '(' + T.num(fix(x / N)) + ')^2'; }).join(' + '); }
  G('hsbio.biodiversity-impact', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { if (R.coin()) { var k = R.int(3, 6), sp = R.sample(TREESP, k), c = sp.map(function () { return R.int(1, 30); });
      return { q: 'A survey counts these trees: ' + sp.map(function (s, i) { return c[i] + ' ' + s; }).join(', ') + '. What is the species richness?', a: num(k), hint: 'Richness counts kinds, not individuals.', steps: ['There are ' + k + ' different kinds of tree.', 'Richness = <b>' + k + '</b>.'] }; }
      var th = R.pick(['Habitat loss', 'Invasive species', 'Pollution', 'Overharvesting']); return { q: 'Which of these is one of the main threats to biodiversity, as ecologists widely agree?', a: mc(th, ['Too many kinds of species', 'Nature studies by students', 'Seasonal changes in weather']), hint: 'Think of changes people make to habitats and populations.', steps: ['The main threats: habitat loss, invasive species, pollution, overharvesting and climate change.', '<b>' + th + '</b> is one of them.'] }; }
    var pick = R.pick([[25, 25, 25, 25], [50, 30, 20], [40, 40, 20], [70, 10, 10, 10], [60, 20, 10, 10], [50, 50], [80, 20], [40, 30, 20, 10], [90, 5, 5], [30, 30, 20, 20]]), mult = R.pick([1, 2]), cs = pick.map(function (x) { return x * mult; });
    var D = fix(B().simpson(cs)), names = R.sample(TREESP, cs.length);
    if (L === 2) return { q: 'A forest plot has ' + cs.map(function (c, i) { return c + ' ' + names[i] + ' trees'; }).join(', ') + '. What is Simpson\'s diversity index, $D = 1 - \\sum p_i^2$? (Give it to 2 decimal places.)', a: { t: 'num', v: D.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''), tol: 0.006 },
      hint: 'Find each species\' share p of the ' + cs.reduce(function (s, x) { return s + x; }, 0) + ' trees, square it, add, and subtract from 1.', steps: ['Shares: ' + cs.map(function (c, i) { return names[i] + ' ' + T.num(fix(c / cs.reduce(function (s, x) { return s + x; }, 0))); }).join(', ') + '.', '$\\sum p^2 = ' + simpsonTex(cs) + ' = ' + T.num(fix(1 - D)) + '$.', 'D = 1 − ' + T.num(fix(1 - D)) + ' = <b>' + T.num(D) + '</b>.'] };
    var other = R.pick([[25, 25, 25, 25], [97, 1, 1, 1], [85, 5, 5, 5], [50, 50], [34, 33, 33], [60, 40], [70, 10, 10, 10]].filter(function (x) { return Math.abs(B().simpson(x) - B().simpson(pick)) > 0.05; }));
    var D2 = B().simpson(other), firstMore = D > D2;
    return { q: 'Community 1 has ' + cs.length + ' species with counts ' + cs.join(', ') + '. Community 2 has ' + other.length + ' species with counts ' + other.join(', ') + '. Which is more diverse by Simpson\'s index?', a: mcKeep(['Community 1', 'Community 2'], firstMore ? 'Community 1' : 'Community 2'),
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: ['1', '2', '3', '4'].slice(0, Math.max(cs.length, other.length)), series: [{ name: 'Community 1', values: cs.concat([null, null, null]).slice(0, Math.max(cs.length, other.length)) }, { name: 'Community 2', values: other.concat([null, null, null]).slice(0, Math.max(cs.length, other.length)) }], xlabel: 'Species', ylabel: 'Individuals', quiet: true, interactive: false } },
      hint: 'Compute D = 1 − Σp² for each; both richness and evenness count.', steps: ['Community 1: D ≈ ' + T.num(+D.toFixed(3)) + '.', 'Community 2: D ≈ ' + T.num(+D2.toFixed(3)) + '.', '<b>Community ' + (firstMore ? '1' : '2') + '</b> has the higher index.'] };
  });
  /* ===================================== Unit 12: Homeostasis and the Body ===================================== */
  /* ---------- Homeostasis and Feedback ---------- */
  var FB_EX = [['A room thermostat turns the furnace on when the room cools and off when it warms.', 0], ['When body temperature rises, sweating cools the body back down.', 0], ['When blood glucose rises after a meal, insulin brings it back down.', 0],
    ['When the blood has too little water, the kidneys keep more water.', 0], ['When carbon dioxide builds up in the blood, breathing speeds up and removes it.', 0], ['In bright light the pupils narrow, letting in less light.', 0],
    ['Platelets at a cut release chemicals that attract more platelets, until a clot forms.', 1], ['A ripening fruit releases ethylene, which makes nearby fruit ripen and release more ethylene.', 1], ['As a nerve cell\'s voltage rises, more sodium channels open, which raises the voltage further.', 1]];
  var PARTS = ['Stimulus (the change)', 'Sensor', 'Control center', 'Effector', 'Response'];
  G('hsbio.feedback-loops', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var e = R.pick(FB_EX); return { q: e[0] + ' Is this negative or positive feedback?', a: mcKeep(['Negative feedback', 'Positive feedback'], e[1] ? 'Positive feedback' : 'Negative feedback'),
      hint: 'Does the response undo the change, or make it bigger?', steps: [e[1] ? 'The response makes the change bigger, until an event ends it.' : 'The response reverses the change, back toward the set point.', 'So it is <b>' + (e[1] ? 'positive' : 'negative') + ' feedback</b>.'] }; }
    var loop = R.pick(['temperature', 'glucose', 'water']), side = R.pick(['high', 'low']), LP = B().LOOPS[loop];
    if (L === 2) { var k = R.int(1, 4), content = [null, LP.sensor, LP.control, LP[side].effector, LP[side].response], other = side === 'high' ? 'low' : 'high';
      var wr2 = uniq([LP.sensor, LP.control, LP[side].effector, LP[side].response, LP[other].effector, LP[other].response].filter(function (x) { return x !== content[k]; }));
      return { q: 'This diagram shows the feedback loop for ' + LP.name + ' when it is too ' + side + '. What belongs in the ' + PARTS[k].toLowerCase() + ' box, marked "?"', viz: { name: 'bi-feedback', opts: { loop: loop, side: side, quiet: true, interactive: false, ask: k } },
        a: mc(cap(content[k]), R.sample(wr2, 3).map(cap)), hint: 'The loop goes: change, sensor, control center, effector, response.', steps: ['The ' + PARTS[k].toLowerCase() + ' ' + ['', 'detects the change', 'compares it with the set point and sends signals', 'carries out the response', 'is what reverses the change'][k] + '.', 'Here it is <b>' + content[k] + '</b>.'] }; }
    var ask = R.pick(['sensor', 'control', 'effector']), right = ask === 'effector' ? LP[side].effector : LP[ask];
    var wr = [LP.sensor, LP.control, LP[side].effector, LP[side].response].filter(function (x) { return x !== right; });
    return { q: 'In the negative feedback loop for ' + LP.name + ', when it is too ' + side + ', what is the ' + { sensor: 'sensor', control: 'control center', effector: 'effector' }[ask] + '?', a: mc(cap(right), wr.map(cap)),
      hint: 'Sensor detects, control center decides, effector acts.', steps: ['Sensor: ' + LP.sensor + '. Control center: ' + LP.control + '. Effector: ' + LP[side].effector + '.', 'So the ' + { sensor: 'sensor', control: 'control center', effector: 'effector' }[ask] + ' is <b>' + right + '</b>.'] };
  });

  /* ---------- Controlling Body Temperature ---------- */
  G('hsbio.temperature-control', function (R, ctx) {
    var L = lvl(ctx), hot = R.coin(), LP = B().LOOPS.temperature;
    if (L === 1) { var sit = hot ? R.pick(['runs a race on a hot day', 'sits in a sauna', 'plays soccer in the summer sun']) : R.pick(['waits for a bus on a freezing morning', 'swims in a cold lake', 'walks in the snow without a coat']);
      return { q: 'A person ' + sit + '. Which responses does the body use to keep its temperature near 37 °C?', a: mc(cap(LP[hot ? 'high' : 'low'].response), [cap(LP[hot ? 'low' : 'high'].response), 'Sweating; blood vessels in the skin narrow', 'Shivering; blood vessels in the skin widen']),
        hint: 'Too hot: lose heat. Too cold: make heat and keep it in.', steps: [hot ? 'The body is too warm, so it needs to lose heat.' : 'The body is too cold, so it needs to make heat and keep it.', 'The hypothalamus triggers: <b>' + LP[hot ? 'high' : 'low'].response + '</b>.'] }; }
    if (L === 2) { if (R.coin()) return { q: 'How does sweating cool the body?', a: mc('Sweat takes heat from the skin as it evaporates', ['Sweat is colder than the body', 'Sweat blocks the sun\'s rays', 'Sweat carries cold blood to the skin']),
        hint: 'What does water need in order to turn into vapor?', steps: ['Sweat leaves the body at about body temperature.', 'Turning liquid into vapor takes heat, so <b>evaporation carries heat away</b> from the skin.'] };
      var v = hot ? 'widen' : 'narrow';
      return { q: 'When the body is too ' + (hot ? 'warm' : 'cold') + ', blood vessels in the skin ' + v + '. How does that help?', a: mc(hot ? 'More warm blood flows near the surface, where heat escapes to the air' : 'Less warm blood flows near the surface, so less heat escapes', [hot ? 'Less blood near the surface keeps the heat in' : 'More blood near the surface warms the skin from outside', 'It makes the heart beat slower', 'It makes more sweat']),
        hint: 'Blood carries heat. Where does heat escape from the body?', steps: ['Blood carries heat from the core.', hot ? 'Wider skin vessels bring more of it to the surface, where it is lost: the body cools.' : 'Narrower skin vessels keep warm blood deep in the body: heat is kept in.'] }; }
    var E = 120 * R.int(1, 15);
    return { q: 'Evaporating sweat carries away about 2.4 kJ of heat per gram. During a workout, a person\'s body must get rid of ' + E + ' kJ of extra heat by sweating. About how many grams of sweat must evaporate?', a: num(E / 2.4, { rtol: 0.01 }), unit: 'g',
      hint: 'Divide the heat by the heat per gram.', steps: [E + ' kJ ÷ 2.4 kJ per gram = <b>' + T.num(fix(E / 2.4)) + ' g</b> of sweat, if all of it evaporates.'] };
  });

  /* ---------- Blood Sugar: Insulin and Glucagon ---------- */
  G('hsbio.blood-sugar', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var after = R.coin(), sit = after ? R.pick(['an hour after a big lunch', 'right after eating a bowl of pasta', 'after a breakfast of toast and juice']) : R.pick(['many hours after the last meal', 'during a long hike without snacks', 'in the morning before breakfast']);
      return { q: 'Which hormone does the pancreas release ' + sit + ', to keep blood glucose steady?', a: mc(after ? 'Insulin' : 'Glucagon', [after ? 'Glucagon' : 'Insulin'].concat(R.sample(['Adrenaline', 'ADH', 'Thyroid hormone'], 1))),
        hint: after ? 'Blood glucose is rising.' : 'Blood glucose is falling.', steps: [after ? 'After eating, blood glucose rises.' : 'Long after eating, blood glucose falls.', 'The pancreas releases <b>' + (after ? 'insulin, which lowers it' : 'glucagon, which raises it') + '</b>.'] }; }
    if (L === 2) { var h = R.pick(['insulin', 'glucagon']), q = R.coin();
      if (q) return { q: 'What does ' + h + ' do to the level of glucose in the blood?', a: mc(h === 'insulin' ? 'Lowers it' : 'Raises it', [h === 'insulin' ? 'Raises it' : 'Lowers it', 'Has no effect', 'Raises it at first, then lowers it']), hint: 'One of the pair lowers it after meals; the other raises it between meals.', steps: [h === 'insulin' ? 'Insulin helps cells take up glucose and the liver store it.' : 'Glucagon makes the liver release glucose.', 'So ' + h + ' <b>' + (h === 'insulin' ? 'lowers' : 'raises') + '</b> blood glucose.'] };
      return { q: 'What does ' + h + ' tell the liver to do?', a: mc(h === 'insulin' ? 'Take up glucose and store it as glycogen' : 'Break down glycogen and release glucose into the blood', [h === 'insulin' ? 'Break down glycogen and release glucose into the blood' : 'Take up glucose and store it as glycogen', 'Turn glucose into insulin', 'Make digestive enzymes']),
        hint: 'The liver is the glucose bank: it can make deposits or withdrawals.', steps: [h === 'insulin' ? 'Insulin means glucose is high: the liver makes a deposit, storing it as glycogen.' : 'Glucagon means glucose is low: the liver makes a withdrawal, breaking glycogen down.'] }; }
    var meal = R.pick([30, 60, 90]), xs = [0, 30, 60, 90, 120, 150, 180, 210, 240], gpk = xs.indexOf(meal) + 1, ipk = Math.min(xs.length - 1, gpk + 1);
    var top = R.int(130, 170), glu = xs.map(function (x, i) { return (i < xs.indexOf(meal) ? 90 : i === gpk ? top : i === gpk - 1 ? 95 : Math.max(88, top - (i - gpk) * 18)) + (i === gpk ? 0 : R.int(-2, 2)); });
    var itop = R.int(40, 60), ins = xs.map(function (x, i) { return (i === ipk ? itop : i === ipk - 1 ? 30 : i < ipk - 1 ? 8 : Math.max(8, itop - (i - ipk) * 14)) + (i === ipk ? 0 : R.int(-1, 1)); });
    var askIns = R.coin();
    return { q: 'The chart shows blood glucose and insulin in one person; a meal was eaten at minute ' + meal + '. At what minute did ' + (askIns ? 'insulin' : 'blood glucose') + ' peak?', viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Glucose', values: glu }, { name: 'Insulin', values: ins }], xlabel: 'Minutes', ylabel: 'Level (relative)', quiet: true, interactive: false } },
      a: num(xs[askIns ? ipk : gpk]), hint: 'Find the highest point of that line, then read the time below it.', steps: ['Glucose peaks at minute ' + xs[gpk] + ', soon after the meal.', 'Insulin peaks a little later, at minute ' + xs[ipk] + ', and then glucose falls back.', 'Answer: <b>' + xs[askIns ? ipk : gpk] + '</b>.'] };
  });

  /* ---------- Interacting Body Systems ---------- */
  var LEVEL_EX = [['a single neuron', 'cell'], ['a red blood cell', 'cell'], ['the lining of the stomach', 'tissue'], ['cardiac muscle', 'tissue'], ['the heart', 'organ'], ['a kidney', 'organ'], ['the stomach', 'organ'], ['the digestive system', 'organ system'], ['the nervous system', 'organ system'], ['a person', 'organism']];
  var TASKS = [['carry oxygen from the air to a muscle cell', ['respiratory', 'circulatory']], ['carry glucose from a meal to a muscle cell', ['digestive', 'circulatory']], ['move a finger when you decide to', ['nervous', 'muscular', 'skeletal']], ['remove urea, a waste, from the blood and out of the body', ['circulatory', 'excretory']], ['get rid of carbon dioxide made in a muscle', ['circulatory', 'respiratory']]];
  G('hsbio.body-systems-hierarchy', function (R, ctx) {
    var L = lvl(ctx), SY = B().SYSTEMS;
    if (L === 1) { if (R.coin()) { var e = R.pick(LEVEL_EX); return { q: 'At which level of organization is ' + e[0] + '?', a: mc(cap(e[1]), B().LEVELS_ORG.filter(function (x) { return x !== e[1]; }).map(cap)), hint: 'Cell → tissue → organ → organ system → organism.', steps: ['The levels: cell, tissue, organ, organ system, organism.', cap(e[0]) + ' is <b>' + (e[1] === 'organ' || e[1] === 'organism' ? 'an ' : 'a ') + e[1] + '</b>.'] }; }
      var lv = B().LEVELS_ORG, sh = R.shuffle([0, 1, 2, 3, 4]), right = [0, 1, 2, 3, 4].map(function (i) { return lv[i]; }).join(' → ');
      return { q: 'Which list puts the levels of organization in order, from smallest to largest?', a: mc(right, [['tissue', 'cell', 'organ', 'organ system', 'organism'], ['cell', 'organ', 'tissue', 'organ system', 'organism'], ['cell', 'tissue', 'organ system', 'organ', 'organism'], sh.map(function (i) { return lv[i]; })].map(function (x) { return x.join(' → '); }).filter(function (x) { return x !== right; }).slice(0, 3)),
        hint: 'Cells make tissues; tissues make organs.', steps: ['Cells form tissues, tissues form organs, organs form organ systems, and systems make the organism.', '<b>' + right + '</b>.'] }; }
    if (L === 2) { var k = R.pick(Object.keys(SY)), others = R.sample(Object.keys(SY).filter(function (x) { return x !== k; }), 3);
      return { q: 'Which organ system ' + SY[k].job + '?', viz: { name: 'bi-body', opts: { system: k, quiet: true, interactive: false } }, a: mc(cap(SY[k].name), others.map(function (x) { return cap(SY[x].name); })),
        hint: 'The organs in the picture are a clue.', steps: ['The <b>' + SY[k].name + '</b> (' + SY[k].organs.join(', ') + ') ' + SY[k].job + '.'] }; }
    var t = R.pick(TASKS), pool = R.shuffle(t[1].concat(R.sample(['digestive', 'excretory', 'immune', 'skeletal', 'respiratory', 'nervous', 'muscular'].filter(function (x) { return t[1].indexOf(x) < 0; }), 5 - t[1].length)));
    return { q: 'Which organ systems work together to ' + t[0] + '? Choose all that apply.', a: mcAll(pool.map(function (s) { return [cap(s), t[1].indexOf(s) >= 0]; })),
      hint: 'What brings the material in, what carries it, and what uses or removes it?', steps: ['To ' + t[0] + ': ' + t[1].map(function (s) { return 'the ' + s + ' system'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.', 'Answer: <b>' + t[1].map(cap).join(', ') + '</b>.'] };
  });

  /* ---------- The Path of Blood ---------- */
  var VESSELS = [['the aorta', 'oxygen-rich', 'from the left ventricle to the body'], ['the pulmonary arteries', 'oxygen-poor', 'from the right ventricle to the lungs'], ['the pulmonary veins', 'oxygen-rich', 'from the lungs to the left atrium'], ['the venae cavae', 'oxygen-poor', 'from the body to the right atrium']];
  G('hsbio.circulation', function (R, ctx) {
    var L = lvl(ctx), P = B().BLOOD_PATH.slice(0, 6);
    if (L === 1) { var i = R.int(0, 5), nx = B().BLOOD_PATH[i + 1];
      return { q: 'Blood is in the ' + P[i] + (P[i] === 'body' ? ' (returning to the heart)' : '') + '. Where does it go next?', a: mc(cap(nx === 'body' ? 'the body' : nx), ['right atrium', 'right ventricle', 'lungs', 'left atrium', 'left ventricle', 'the body'].filter(function (x) { return x !== nx && !(nx === 'body' && x === 'the body') && x !== P[i]; }).slice(0, 3).map(cap)),
        viz: { name: 'bi-body', opts: { mode: 'heart', quiet: true, interactive: false } }, hint: 'Right side to the lungs, left side to the body.', steps: ['The path: body → right atrium → right ventricle → lungs → left atrium → left ventricle → body.', 'After the ' + P[i] + ': <b>' + (nx === 'body' ? 'the body' : 'the ' + nx) + '</b>.'] }; }
    if (L === 2) { var v = R.pick(VESSELS);
      return { q: 'Does ' + v[0] + ' carry oxygen-rich or oxygen-poor blood?', a: mcKeep(['Oxygen-rich', 'Oxygen-poor'], cap(v[1])), hint: 'Arteries carry blood away from the heart, but that does not tell you the oxygen.', steps: [cap(v[0]) + ' carr' + (/s$/.test(v[0].split(' ').pop()) || /cavae/.test(v[0]) ? 'y' : 'ies') + ' blood ' + v[2] + '.', 'So it is <b>' + v[1] + '</b>.'] }; }
    if (R.coin()) { var ch = R.pick(['right atrium', 'right ventricle', 'left atrium', 'left ventricle']);
      return { q: 'The heart is drawn as seen from the front, so its right side is on your left. Which chamber is marked "?"', viz: { name: 'bi-body', opts: { mode: 'heart', quiet: true, interactive: false, ask: ch } }, a: mc(cap(ch), ['right atrium', 'right ventricle', 'left atrium', 'left ventricle'].filter(function (x) { return x !== ch; }).map(cap)),
        hint: 'Atria are on top, ventricles below. The heart\'s right side is on the viewer\'s left.', steps: ['Top chambers are atria; bottom chambers are ventricles.', 'Seen from the front, the heart\'s right side is on your left. The "?" is in the <b>' + ch + '</b>.'] }; }
    var st = ['right ventricle', 'lungs', 'left atrium', 'left ventricle'], sh = R.shuffle([0, 1, 2, 3]), right = [0, 1, 2, 3].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', '), wr = [];
    while (wr.length < 3) { var w = R.shuffle(['A', 'B', 'C', 'D']).join(', '); if (w !== right && wr.indexOf(w) < 0) wr.push(w); }
    return { q: 'Blood leaves the right atrium. Put the next four places it passes in order. ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: the ' + st[i] + '.'; }).join(' '), a: mc(right, wr),
      hint: 'Right side → lungs → left side.', steps: ['Right atrium → right ventricle → lungs → left atrium → left ventricle → aorta.', 'Order: <b>' + right + '</b>.'] };
  });

  /* ---------- Gas Exchange in the Lungs ---------- */
  G('hsbio.gas-exchange', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var gas = R.pick(['oxygen', 'carbon dioxide']), place = R.pick(['lungs', 'tissues']);
      var into = place === 'lungs' ? (gas === 'oxygen' ? 'From the air in the alveoli into the blood' : 'From the blood into the air in the alveoli') : (gas === 'oxygen' ? 'From the blood into the body\'s cells' : 'From the body\'s cells into the blood');
      var opts = place === 'lungs' ? ['From the air in the alveoli into the blood', 'From the blood into the air in the alveoli'] : ['From the blood into the body\'s cells', 'From the body\'s cells into the blood'];
      return { q: 'In the ' + (place === 'lungs' ? R.pick(['lungs', 'alveoli of the lungs']) : R.pick(['body\'s tissues, such as a working muscle', 'capillaries of a working leg muscle', 'capillaries of the brain'])) + ', which way does ' + gas + ' diffuse?', a: mc(into, opts.filter(function (x) { return x !== into; }).concat(['It does not move', 'It is pumped both ways by the lungs'])),
        hint: 'Each gas diffuses from where it is more concentrated to where it is less.', steps: [place === 'lungs' ? 'Fresh air is rich in oxygen; blood arriving from the body is rich in carbon dioxide.' : 'Cells use oxygen and make carbon dioxide in respiration.', cap(gas) + ' moves <b>' + into.toLowerCase() + '</b>.'] }; }
    if (L === 2) { if (R.coin()) return { q: 'What moves oxygen from the alveoli into the blood?', a: mc('Diffusion down its concentration gradient', ['A pump in the lung wall', 'Active transport using ATP', 'The heart pushing it in']),
        hint: 'Is energy needed to move oxygen across?', steps: ['Oxygen is more concentrated in the alveolus than in the blood arriving there.', 'It crosses by <b>passive diffusion</b>; breathing and blood flow only keep the gradient steep.'] };
      var f = R.pick([['a larger total surface area', true], ['thinner walls between air and blood', true], ['a steeper difference in oxygen between air and blood', true], ['faster blood flow past the alveoli', true], ['deeper, faster breathing that brings in more fresh air', true], ['thicker walls between air and blood', false], ['blood that stops flowing past the alveoli', false], ['fewer alveoli', false], ['fluid filling some of the alveoli', false], ['air in the lungs that is not refreshed', false]]);
      return { q: 'Would ' + f[0] + ' speed up or slow down ' + R.pick(['gas exchange in the lungs', 'the diffusion of oxygen into the blood']) + '?', a: mc(f[1] ? 'Speed it up' : 'Slow it down', [f[1] ? 'Slow it down' : 'Speed it up', 'Make no difference']), hint: 'Diffusion is faster over a bigger area, a shorter distance and a steeper gradient.', steps: ['Diffusion speeds up with more area, a shorter distance and a bigger concentration difference.', 'So ' + f[0] + ' would <b>' + (f[1] ? 'speed it up' : 'slow it down') + '</b>.'] }; }
    var a, d, t, rate;
    do { a = R.pick([0.5, 1, 2, 4]); d = R.pick([0.5, 1, 2]); t = R.pick([0.5, 1, 2]); rate = a * d / t; } while (rate === 1);
    var desc = function (x, w) { return x === 1 ? w + ' stays the same' : x < 1 ? w + ' is cut to ' + (x === 0.5 ? 'half' : x) : w + ' becomes ' + x + ' times as large'; };
    return { q: 'The rate of diffusion across the alveolar wall is proportional to (surface area × concentration difference) ÷ wall thickness. Suppose ' + desc(a, 'the surface area') + ', ' + desc(d, 'the concentration difference') + ', and ' + desc(t, 'the wall thickness') + '. The new rate is how many times the old rate?', a: num(rate),
      hint: 'Multiply the area and difference factors, then divide by the thickness factor.', steps: ['New rate ÷ old rate = (' + T.num(a) + ' × ' + T.num(d) + ') ÷ ' + T.num(t) + '.', '= <b>' + T.num(rate) + '</b>.'] };
  });

  /* ---------- Digestive Enzymes and Absorption ---------- */
  var DIG = [['amylase', 'starch', 'sugars'], ['pepsin', 'proteins', 'shorter protein chains'], ['trypsin', 'proteins', 'shorter chains and amino acids'], ['lipase', 'fats', 'fatty acids and glycerol']];
  G('hsbio.digestion-absorption', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var e = R.pick(DIG), byE = R.coin();
      return byE ? { q: 'Which kind of food molecule does ' + e[0] + ' break down?', a: mc(cap(e[1]), ['starch', 'proteins', 'fats', 'DNA'].filter(function (x) { return x !== e[1]; }).map(cap)), hint: 'Each enzyme fits its own substrate.', steps: [cap(e[0]) + ' breaks down <b>' + e[1] + '</b> into ' + e[2] + '.'] } :
        { q: 'Which enzyme breaks down ' + e[1] + ' into ' + e[2] + '?', a: mc(cap(e[0]), DIG.filter(function (x) { return x[1] !== e[1]; }).map(function (x) { return cap(x[0]); }).concat(['Bile'])), hint: 'Amylase, proteases (pepsin, trypsin) and lipase each have their own substrate.', steps: ['<b>' + cap(e[0]) + '</b> breaks down ' + e[1] + '.'] }; }
    if (L === 2) { var s = R.int(0, 2);
      if (s === 0) { var en = R.pick(Object.keys(B().ENZYMES)), E = B().ENZYMES[en];
        return { q: 'Which enzyme works best at about pH ' + E.pH + '?', viz: { name: 'bi-enzyme', opts: { mode: 'ph', enzymes: ['pepsin', 'amylase', 'trypsin'], quiet: true, interactive: false } }, a: mc(cap(E.name), Object.keys(B().ENZYMES).filter(function (k) { return B().ENZYMES[k].pH !== E.pH; }).map(function (k) { return cap(B().ENZYMES[k].name); })),
          hint: 'The stomach is strongly acidic; the mouth is near neutral; the small intestine is mildly basic.', steps: ['pH ' + E.pH + ' is the pH of the ' + E.where + '.', '<b>' + cap(E.name) + '</b> works there.'] }; }
      if (s === 1) return { q: 'What does bile do in digestion?', a: mc('It breaks fat into tiny droplets so lipase can work faster; it is not an enzyme', ['It is an enzyme that splits fats into fatty acids', 'It digests proteins in the stomach', 'It absorbs sugars into the blood']), hint: 'Bile is made by the liver. Is it an enzyme?', steps: ['Bile emulsifies fat: it breaks big fat drops into tiny droplets.', 'That gives lipase more surface. Bile itself is <b>not an enzyme</b>.'] };
      return { q: 'Where are most digested nutrients absorbed into the blood?', a: mc('Through the villi of the small intestine', ['Through the stomach wall', 'In the mouth', 'In the large intestine']), hint: 'Which part of the gut has a huge, folded surface?', steps: ['The small intestine is lined with villi, finger-like folds with a huge surface area.', 'Most nutrients are absorbed <b>through the villi of the small intestine</b>.'] }; }
    var food = R.pick([['a piece of bread (mostly starch)', 'starch', ['mouth', 'small intestine'], 'Salivary amylase starts in the mouth; pancreatic amylase finishes in the small intestine'], ['a piece of chicken (mostly protein)', 'protein', ['stomach', 'small intestine'], 'Pepsin starts in the stomach; trypsin and other proteases finish in the small intestine'], ['a spoonful of butter (mostly fat)', 'fat', ['small intestine'], 'Bile emulsifies the fat and pancreatic lipase digests it, both in the small intestine']]);
    var places = ['mouth', 'stomach', 'small intestine', 'large intestine'], items = places.map(function (p) { return [cap(p), food[2].indexOf(p) >= 0]; });
    return { q: 'You eat ' + food[0] + '. In which parts of the gut are enzymes digesting it? Choose all that apply.', a: mcAll(items), hint: 'Which enzymes act on ' + food[1] + ', and where do they work?', steps: [food[3] + '.', 'Answer: <b>' + food[2].map(cap).join(', ') + '</b>.'] };
  });

  /* ---------- Neurons and Signals ---------- */
  G('hsbio.neurons', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var parts = ['dendrites', 'cell body', 'axon', 'axon ending (synapse)'], sh = R.shuffle([0, 1, 2, 3]), right = [0, 1, 2, 3].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', '), wr = [];
      while (wr.length < 3) { var w = R.shuffle(['A', 'B', 'C', 'D']).join(', '); if (w !== right && wr.indexOf(w) < 0) wr.push(w); }
      return { q: 'Put the parts of a neuron in the order a signal travels through them. ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: ' + parts[i] + '.'; }).join(' '), a: mc(right, wr),
        hint: 'Signals come in at the branches and leave down the long fiber.', steps: ['In at the dendrites, through the cell body, along the axon, out at the synapse.', 'Order: <b>' + right + '</b>.'] }; }
    if (L === 2) { if (R.coin()) return { q: 'How does a signal cross the synapse from one neuron to the next, at most synapses?', a: mc('Neurotransmitter chemicals cross the gap and bind the next cell', ['The electrical impulse jumps straight across', 'The two neurons are joined into one cell', 'Blood carries the signal across']),
        hint: 'Is the gap crossed by electricity or by chemicals?', steps: ['The axon ending releases neurotransmitters into the gap.', 'They <b>bind receptors on the next cell</b>, which starts its own signal.'] };
      return { q: 'During an action potential, what happens first when the neuron fires?', a: mc('Sodium channels open and sodium ions rush into the cell', ['Potassium ions rush into the cell', 'The cell membrane breaks open', 'Neurotransmitters enter the axon']),
        hint: 'The resting neuron keeps one kind of ion mostly outside.', steps: ['At rest, sodium is kept mostly outside by the sodium-potassium pump.', 'When the neuron fires, <b>sodium channels open and sodium rushes in</b>; then potassium flows out to reset it.'] }; }
    var dist = R.pick([0.6, 0.8, 1, 1.2, 1.5, 2]), sp = R.pick([10, 20, 25, 40, 50, 80, 100]), tm = fix(dist / sp);
    if (R.coin()) return { q: 'A nerve impulse travels ' + T.num(dist) + ' m in ' + T.num(tm) + ' s. What is its speed in meters per second?', a: num(sp, { rtol: 0.01 }), unit: 'm/s', hint: 'Speed = distance ÷ time.', steps: [T.num(dist) + ' m ÷ ' + T.num(tm) + ' s = <b>' + sp + ' m/s</b>.'] };
    return { q: 'A nerve impulse travels at ' + sp + ' m/s along a nerve ' + T.num(dist) + ' m long. How many milliseconds does the trip take? (1 s = 1,000 ms)', a: num(fix(tm * 1000), { rtol: 0.01 }), unit: 'ms', hint: 'Time = distance ÷ speed; then convert seconds to milliseconds.', steps: [T.num(dist) + ' ÷ ' + sp + ' = ' + T.num(tm) + ' s.', T.num(tm) + ' s × 1,000 = <b>' + T.num(fix(tm * 1000)) + ' ms</b>.'] };
  });

  /* ---------- The Immune System ---------- */
  var IMM = [['Skin blocks most germs from entering the body.', 0], ['A macrophage engulfs bacteria in a cut within hours.', 0], ['A scraped knee turns red, warm and swollen as blood flow to it increases.', 0], ['Mucus in the nose traps dust and germs.', 0],
    ['B cells make antibodies that bind to one particular virus.', 1], ['T cells destroy body cells infected by one particular virus.', 1], ['Memory cells respond quickly when the same germ returns years later.', 1], ['After a vaccine, the body makes antibodies against one particular germ.', 1]];
  G('hsbio.immune-system', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var e = R.pick(IMM); return { q: e[0] + ' Is this an innate or an adaptive defense?', a: mcKeep(['Innate', 'Adaptive'], e[1] ? 'Adaptive' : 'Innate'),
      hint: 'Innate: fast and general. Adaptive: aimed at one invader, with memory.', steps: [e[1] ? 'It targets one particular invader.' : 'It acts against anything foreign, without targeting one kind.', 'So it is <b>' + (e[1] ? 'adaptive' : 'innate') + '</b>.'] }; }
    if (L === 2) { var s = R.int(0, 2);
      if (s === 0) return { q: 'What are antibodies?', a: mc('Proteins made by B cells that bind to a particular invader', ['White blood cells that eat germs', 'Medicines that kill bacteria', 'Weakened viruses']), hint: 'Are antibodies cells?', steps: ['Antibodies are Y-shaped <b>proteins</b>, made by B cells; each binds one particular target.'] };
      if (s === 1) return { q: 'How do vaccines protect against a disease?', a: mc('They let the immune system form memory cells against a germ without the illness', ['They kill every germ already in the body', 'They are antibiotics that work on viruses', 'They make the skin thicker']), hint: 'What makes the second response faster?', steps: ['A vaccine shows the immune system a harmless form or part of a germ.', 'B and T cells respond and leave <b>memory cells</b>, so a real infection later meets a fast, strong response.'] };
      return { q: 'Why is the second response to the same germ faster and stronger than the first?', a: mc('Memory cells from the first response are ready and multiply quickly', ['The germ is weaker the second time', 'Antibodies from the first time last forever at full strength', 'The innate defenses learn the germ']), hint: 'What did the first response leave behind?', steps: ['The first response leaves memory B and T cells.', 'They <b>recognize the germ at once and multiply quickly</b>, so the second response is faster and larger.'] }; }
    var d2 = R.pick([28, 35, 42]), p1 = R.pick([10, 12, 14]), p2 = R.pick([5, 7]), h1 = R.int(8, 15), mult = R.int(4, 10), xs = [], v = [];
    for (var x = 0; x <= d2 + 21; x += 7) xs.push(x);
    xs.forEach(function (x) { var y = x < d2 ? h1 * Math.exp(-Math.pow((x - p1) / 6, 2)) : h1 * mult * Math.exp(-Math.pow((x - d2 - p2) / 8, 2)); v.push(Math.round(y)); });
    var i1 = 0, i2 = 0; v.forEach(function (y, i) { if (xs[i] < d2 && y > v[i1]) i1 = i; if (xs[i] >= d2 && (i2 === 0 || y > v[i2])) i2 = i; });
    var askR = R.coin(), ratio = Math.round(v[i2] / v[i1] * 100) / 100;
    return { q: 'The chart shows antibody levels after a first exposure to a germ on day 0 and a second exposure on day ' + d2 + '. ' + (askR ? 'How many times higher is the second peak than the first?' : 'On what day does the second response peak?'), viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Antibody level', values: v }], xlabel: 'Day', ylabel: 'Antibodies (relative)', values: true, quiet: true, interactive: false } },
      a: askR ? num(ratio, { rtol: 0.02 }) : num(xs[i2]), hint: 'Read the highest point before day ' + d2 + ' and the highest point after it.', steps: ['First peak: ' + v[i1] + ' on day ' + xs[i1] + '. Second peak: ' + v[i2] + ' on day ' + xs[i2] + '.', askR ? v[i2] + ' ÷ ' + v[i1] + ' ≈ <b>' + T.num(+ratio.toFixed(2)) + '</b>: memory cells make the second response much stronger.' : 'The second peak is on <b>day ' + xs[i2] + '</b>.'] };
  });

  /* ---------- The Kidneys and Water Balance ---------- */
  G('hsbio.kidneys', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { if (R.coin()) return { q: 'In a healthy person, which of these is filtered out of the blood by the kidneys but then fully reabsorbed, so none is normally in the urine?', a: mc('Glucose', ['Urea', 'Extra water', 'Extra salt']), hint: 'Which one does the body need to keep?', steps: ['The filter lets glucose out of the blood with everything small.', 'The tubule takes all of it back, so normally <b>glucose</b> is not in urine.'] };
      var st = ['Filtration: water and small molecules leave the blood', 'Reabsorption: needed water, glucose and salts return to the blood', 'The remaining fluid, with wastes, leaves as urine'], sh = R.shuffle([0, 1, 2]), right = [0, 1, 2].map(function (i) { return letterOf(sh.indexOf(i)); }).join(', ');
      return { q: 'Put the steps of making urine in a nephron in order. ' + sh.map(function (i, j) { return '<b>' + letterOf(j) + '</b>: ' + st[i] + '.'; }).join(' '), a: mc(right, ['A, B, C', 'A, C, B', 'B, A, C', 'B, C, A', 'C, A, B', 'C, B, A'].filter(function (x) { return x !== right; }).slice(0, 3)), hint: 'Filter first, then take back.', steps: ['Filter almost everything small, take back what is needed, and let the rest go.', 'Order: <b>' + right + '</b>.'] }; }
    if (L === 2) { var dry = R.coin();
      return { q: dry ? 'After hours of hiking in the heat with nothing to drink, what happens to ADH and to the urine?' : 'After drinking several large glasses of water, what happens to ADH and to the urine?', a: mc(dry ? 'More ADH; less urine, and more concentrated' : 'Less ADH; more urine, and more dilute', [dry ? 'Less ADH; more urine, and more dilute' : 'More ADH; less urine, and more concentrated', 'No change in ADH; the kidneys stop working', 'More ADH; more urine']),
        viz: { name: 'bi-feedback', opts: { loop: 'water', side: dry ? 'low' : 'high', quiet: true, interactive: false } }, hint: 'ADH tells the kidneys to keep water.', steps: [dry ? 'The blood is short of water, so the brain releases more ADH.' : 'The blood has extra water, so the brain releases less ADH.', dry ? 'The kidneys keep more water: <b>less urine, more concentrated</b>.' : 'The kidneys let more water go: <b>more urine, more dilute</b>.'] }; }
    var F = R.int(14, 20) * 10, U = R.int(8, 25) / 10, pc = fix(100 * (F - U) / F);
    return { q: 'Suppose a person\'s kidneys filter ' + F + ' liters of fluid out of the blood in a day, and ' + T.num(U) + ' liters leave the body as urine. What percent of the filtered fluid is reabsorbed? (Round to one decimal place.)', a: { t: 'num', v: String(+pc.toFixed(1)), tol: 0.051, pct: true },
      hint: 'Reabsorbed = filtered − urine. Then divide by the amount filtered.', steps: ['Reabsorbed: ' + F + ' − ' + T.num(U) + ' = ' + T.num(fix(F - U)) + ' L.', T.num(fix(F - U)) + ' ÷ ' + F + ' × 100 ≈ <b>' + T.num(+pc.toFixed(1)) + '%</b>.'] };
  });

  /* ---------- Water Balance in Plants ---------- */
  G('hsbio.plant-homeostasis', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 1) { var wet = R.coin();
      return { q: wet ? 'A plant has plenty of water in sunny weather. Are its stomata most likely open or closed?' : 'A plant\'s soil has dried out on a hot afternoon. Are its stomata most likely open or closed?', a: mcKeep(['Open', 'Closed'], wet ? 'Open' : 'Closed'),
        hint: 'Guard cells swell when they have water and go limp without it.', steps: [wet ? 'With water, guard cells swell and bow apart.' : 'Short of water, guard cells go limp.', 'The stomata are <b>' + (wet ? 'open' : 'closed') + '</b>.'] }; }
    if (L === 2) { if (R.coin()) return { q: 'What is the trade-off when a plant opens its stomata?', a: mc('Carbon dioxide gets in for photosynthesis, but water vapor escapes', ['Oxygen gets in, but sugar escapes', 'Water gets in, but carbon dioxide escapes', 'There is no trade-off']), hint: 'What does a leaf need from the air, and what does it lose?', steps: ['Open stomata let carbon dioxide in for photosynthesis.', 'The same pores let <b>water vapor out</b>, so the plant balances the two.'] };
      return { q: 'How do guard cells open a stoma?', a: mc('They take in potassium ions; water follows by osmosis, and the swollen cells bow apart', ['They use muscles to pull apart', 'They lose water and shrink apart', 'They dissolve the cell wall between them']), hint: 'Think of osmosis: water follows solutes.', steps: ['Guard cells pump in potassium ions.', 'Water follows by osmosis; the cells swell and, because of their thick inner walls, <b>bow apart</b>, opening the pore.'] }; }
    var hrs = [6, 8, 10, 12, 14, 16, 18], drought = R.coin(), v = drought ? [10, 45, 60, 25, 15, 30, 10] : [10, 40, 70, 85, 75, 45, 10];
    v = v.map(function (x) { return x + R.int(-3, 3); });
    var mx = v.indexOf(Math.max.apply(null, v));
    return { q: 'The chart shows how open a plant\'s stomata were over one day' + (drought ? ', in dry soil' : ', with well-watered soil') + '. At what hour were they most open?', viz: { name: 'bi-chart', opts: { kind: 'line', x: hrs, series: [{ name: 'Stomatal opening (%)', values: v }], xlabel: 'Hour of the day', ylabel: 'Opening (%)', quiet: true, interactive: false } },
      a: num(hrs[mx]), hint: 'Find the highest point.', steps: ['The highest point is at hour ' + hrs[mx] + '.', drought ? 'In dry soil, the stomata partly close around midday, when water loss would be greatest; that is ABA at work.' : 'With plenty of water, they open widest around midday, when light for photosynthesis is strongest.', 'Answer: <b>' + hrs[mx] + '</b>.'] };
  });
})(window.MathLadder);

/* ---- More of the same skills (round 7, "widen"): larger fact banks ----
   Topics whose levels had few different problems also draw from the banks below, built from the topic's own facts:
   true or false; which statement is true (or false); sorting (which one is …, which is not, choose all, which group);
   a term and its meaning, both ways; and the order of steps (what comes next, what comes first, put in order).
   Every answer comes from the bank itself, so the right choice and the others can never disagree. Shares are per level:
   the topic's own generator still makes the rest. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen) return;
  var BK = {};
  function T(id, o) { var b = BK[id] || (BK[id] = {}); Object.keys(o).forEach(function (k) { b[k] = k === 'share' || k === 'forms' ? Object.assign(b[k] || {}, o[k]) : o[k]; }); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function capI(s) { s = String(s); return /\s/.test(s) || s.length > 3 ? cap(s) : s; } // genotypes like tt stay as written
  function low(s) { s = String(s); return /^[A-Z][a-z]/.test(s) && !/^(DNA|RNA|ATP|I )/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function dot(s) { s = String(s).replace(/\s+$/, ''); return /[.!?)]$/.test(s) ? s : s + '.'; }
  function nodot(s) { return String(s).replace(/\.$/, ''); }
  function fill(t, o) { return t.replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }
  function MC(right, wrong) { return { t: 'mc', choices: [right].concat(wrong), v: 0 }; }
  function TF(v) { return { t: 'mc', choices: ['True', 'False'], v: v ? 0 : 1, keep: true }; }
  function LT(i) { return String.fromCharCode(65 + i); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  var FORMS = { 1: ['tf', 'tf1', 'one', 'cat', 'fwd', 'back', 'next'], 2: ['tf', 'tf1', 'one', 'not', 'cat', 'fwd', 'back', 'next', 'first'], 3: ['tf1', 'not', 'all', 'back', 'fwd', 'order', 'first', 'cat'] };
  function can(o, f) {
    var tf = o.tf || [], s = o.sort, pr = o.pair, sq = o.seq;
    if (f === 'custom') return !!o.make;
    if (f === 'tf') return tf.length > 0;
    if (f === 'tf1') return tf.filter(function (x) { return x[1]; }).length >= 3 && tf.filter(function (x) { return !x[1]; }).length >= 3;
    if (f === 'one' || f === 'not' || f === 'all' || f === 'cat') return !!s;
    if (f === 'fwd' || f === 'back') return !!pr;
    return !!sq;
  }
  function make(R, o, L) {
    var forms = (o.forms && o.forms[L]) || FORMS[L];
    forms = forms.filter(function (f) { return can(o, f); });
    if (!forms.length) return null;
    var f = R.pick(forms), p = null;
    if (f === 'custom') p = o.make(R, L);
    else if (f === 'tf' || f === 'tf1') p = mkTf(R, o, f);
    else if (o.sort && (f === 'one' || f === 'not' || f === 'all' || f === 'cat')) p = mkSort(R, o.sort, f, L);
    else if (f === 'fwd' || f === 'back') p = mkPair(R, o.pair, f);
    else p = mkSeq(R, o.seq, f, L);
    if (p && !p.hint) p.hint = o.hint || 'Think back to the lesson, then check each choice.';
    return p;
  }
  function mkTf(R, o, f) {
    var tf = o.tf;
    if (f === 'tf') {
      var t = R.pick(tf);
      return { q: 'True or false: ' + dot(t[0]), a: TF(t[1]), steps: [t[2] ? dot(t[2]) : 'The statement is ' + (t[1] ? 'true.' : 'false.'), 'So the answer is <b>' + (t[1] ? 'true' : 'false') + '</b>.'] };
    }
    var wantTrue = R.coin(), good = tf.filter(function (x) { return x[1] === wantTrue; }), bad = tf.filter(function (x) { return x[1] !== wantTrue; });
    var r = R.pick(good), ws = R.sample(bad, 3);
    return { q: 'Which statement is <b>' + (wantTrue ? 'true' : 'false') + '</b>?', a: MC(dot(r[0]), ws.map(function (x) { return dot(x[0]); })),
      steps: [(wantTrue ? 'True: ' : 'False: ') + dot(r[0]) + (r[2] ? ' ' + dot(r[2]) : '')].concat(ws.map(function (x) { return (wantTrue ? 'False: ' : 'True: ') + dot(x[0]) + (x[2] ? ' ' + dot(x[2]) : ''); })) };
  }
  function why(s, it) {
    if (it[2]) return dot(cap(it[2]));
    if (it[0].length <= 3) return it[0] + ': ' + low(s.cats[it[1]][2]) + '.';
    if (/[.?!]$/.test(it[0])) return '“' + cap(it[0]) + '” ' + cap(s.cats[it[1]][2]) + '.';
    return cap(dot(it[0] + ' ' + (s.be || 'is') + ' ' + s.cats[it[1]][0]));
  }
  function mkSort(R, s, f, L) {
    var keys = Object.keys(s.cats), k = R.pick(keys.filter(function (c) { return s.items.some(function (x) { return x[1] === c; }); })), C = s.cats[k];
    // names ("a frog") and descriptions ("It has no tubes for water.") are not mixed in one list of choices
    var isD = function (x) { return /[.?!]$/.test(x[0]); }, names = s.items.filter(function (x) { return !isD(x); }), descs = s.items.filter(isD);
    var useD = f !== 'cat' && (names.length < 6 || (descs.length >= 6 && R.coin())), pool = useD ? descs : names;
    var inC = pool.filter(function (x) { return x[1] === k; }), outC = pool.filter(function (x) { return x[1] !== k; });
    var verb1 = useD ? 'describes ' : (s.be === 'are' ? 'are ' : 'is '), verbN = useD ? 'describe ' : 'are ';
    var lead = s.lead ? s.lead + ' ' : '';
    if (f === 'cat') {
      var it = R.pick(s.items), opts = keys.length > 4 ? [it[1]].concat(R.sample(keys.filter(function (c) { return c !== it[1]; }), 3)) : [it[1]].concat(keys.filter(function (c) { return c !== it[1]; }));
      var a = { t: 'mc', choices: opts.map(function (c) { return cap(s.cats[c][2]); }), v: 0 };
      if (keys.length <= 3) { a.choices = keys.map(function (c) { return cap(s.cats[c][2]); }); a.v = keys.indexOf(it[1]); a.keep = true; }
      return { q: lead + fill(s.catq || 'Which group does this belong to? {x}', { x: dot(capI(it[0])) }), a: a, steps: [why(s, it), 'So the answer is <b>' + low(s.cats[it[1]][2]) + '</b>.'] };
    }
    if (f === 'one' && inC.length && outC.length >= 3) {
      var r = R.pick(inC), w = R.sample(outC, 3);
      return { q: lead + 'Which of these ' + verb1 + C[0] + '?', a: MC(capI(r[0]), w.map(function (x) { return capI(x[0]); })),
        steps: [why(s, r)].concat(w.map(function (x) { return why(s, x); })) };
    }
    if (f === 'not' && inC.length >= 3 && outC.length) {
      var r2 = R.pick(outC), w2 = R.sample(inC, 3);
      return { q: lead + 'Three of these ' + verbN + C[1] + '. Which one ' + (useD ? 'does' : 'is') + ' <b>not</b>?', a: MC(capI(r2[0]), w2.map(function (x) { return capI(x[0]); })),
        steps: [why(s, r2)].concat(w2.map(function (x) { return why(s, x); })) };
    }
    if (f === 'all' && inC.length >= 1 && outC.length >= 1) {
      var n = M5(R, inC.length + outC.length), kk = R.int(Math.max(1, n - outC.length), Math.min(inC.length, n - 1)), items = R.shuffle(R.sample(inC, kk).concat(R.sample(outC, n - kk)));
      return { q: lead + 'Choose <b>all</b> of these that ' + verbN + C[1] + '.', a: { t: 'mc', choices: items.map(function (x) { return capI(x[0]); }), v: items.map(function (x, i) { return x[1] === k ? i : -1; }).filter(function (i) { return i >= 0; }) },
        steps: items.map(function (x) { return why(s, x); }) };
    }
    return mkSort(R, s, 'cat', L);
  }
  function M5(R, total) { return Math.min(total, R.pick([4, 5])); }
  function mkPair(R, pr, f) {
    var it = R.pick(pr.items), kx = f === 'fwd' ? 1 : 0, seen = {}, pool = pr.items.filter(function (x) { if (x === it || x[0] === it[0] || x[1] === it[1] || seen[x[kx]]) return false; seen[x[kx]] = 1; return true; }), others = R.sample(pool, Math.min(3, pool.length));
    if (f === 'fwd') return { q: fill(pr.fwd, { t: it[0] }), a: MC(cap(it[1]), others.map(function (x) { return cap(x[1]); })), steps: [cap(it[0]) + ': ' + low(dot(it[1]))].concat(others.length ? ['The others: ' + others.map(function (x) { return low(nodot(x[1])) + ' (' + x[0] + ')'; }).join('; ') + '.'] : []) };
    return { q: fill(pr.back, { d: low(nodot(it[1])) }), a: MC(cap(it[0]), others.map(function (x) { return cap(x[0]); })), steps: [cap(it[0]) + ': ' + low(dot(it[1]))].concat(others.length ? ['The others: ' + others.map(function (x) { return x[0] + ', ' + low(nodot(x[1])); }).join('; ') + '.'] : []) };
  }
  function mkSeq(R, sq, f, L) {
    var lists = sq.lists || [sq], s = R.pick(lists), it = s.items, name = s.name;
    if (f === 'next') {
      var i = R.int(0, it.length - 2), w = R.sample(it.filter(function (x, j) { return j !== i + 1 && j !== i; }), Math.min(3, it.length - 2));
      return { q: 'In ' + name + ', what comes right after this: ' + low(nodot(it[i])) + '?', a: MC(cap(it[i + 1]), w.map(cap)), steps: ['The order: ' + it.map(nodot).join(' → ') + '.', 'Right after ' + low(nodot(it[i])) + ' comes <b>' + low(nodot(it[i + 1])) + '</b>.'] };
    }
    var n = Math.min(it.length, L === 3 ? 4 : 3), idx = R.sample(it.map(function (_, j) { return j; }), n).sort(function (a, b) { return a - b; });
    if (f === 'first') {
      var last = R.coin() && L > 1, pickI = last ? idx[idx.length - 1] : idx[0];
      return { q: 'In ' + name + ', which of these comes <b>' + (last ? 'last' : 'first') + '</b>?', a: MC(cap(it[pickI]), idx.filter(function (j) { return j !== pickI; }).map(function (j) { return cap(it[j]); })),
        steps: ['The order: ' + idx.map(function (j) { return nodot(it[j]); }).join(' → ') + '.', 'So <b>' + low(nodot(it[pickI])) + '</b> comes ' + (last ? 'last' : 'first') + '.'] };
    }
    var shown = R.shuffle(idx.slice()), right = idx.map(function (j) { return LT(shown.indexOf(j)); }).join(''), wr = [], g = 0;
    while (wr.length < 3 && g++ < 100) { var c = R.shuffle(right.split('')).join(''); if (c !== right && wr.indexOf(c) < 0) wr.push(c); }
    return { q: 'Put these in order for ' + name + ':<br>' + shown.map(function (j, i) { return '<b>' + LT(i) + '</b>: ' + low(nodot(it[j])); }).join('<br>'), a: MC(right.split('').join(', '), wr.map(function (x) { return x.split('').join(', '); })),
      steps: ['The order: ' + idx.map(function (j) { return LT(shown.indexOf(j)) + ' (' + low(nodot(it[j])) + ')'; }).join(' → ') + '.', 'So the answer is <b>' + right.split('').join(', ') + '</b>.'] };
  }

  /* ===== hsbio ===== */
  T('hsbio.elements-bonds', { share: { 1: 0.45 },
    pair: { fwd: 'How many covalent bonds does {t} usually form?', back: 'Which atom usually forms {d}?', items: [['hydrogen (H)', 'one covalent bond'], ['oxygen (O)', 'two covalent bonds'], ['nitrogen (N)', 'three covalent bonds'], ['carbon (C)', 'four covalent bonds']] },
    sort: { cats: { c: ['a covalent bond', 'covalent bonds', 'Covalent bond'], h: ['a hydrogen bond', 'hydrogen bonds', 'Hydrogen bond'], i: ['an ionic bond', 'ionic bonds', 'Ionic bond'] }, catq: 'What kind of bond is this? {x}', items: [
      ['the bond between carbon and hydrogen in methane', 'c'], ['the bond that joins two glucose units in starch', 'c'], ['the bond between the two oxygen atoms in O₂', 'c'], ['the bonds along the sugar-phosphate backbone of DNA', 'c'], ['the bond between an oxygen and a hydrogen inside one water molecule', 'c'],
      ['the attraction between one water molecule and the next', 'h'], ['the attraction that holds the two strands of DNA together', 'h'], ['the attraction that holds a protein\'s helix in shape', 'h'], ['the attraction that makes water molecules stick together (cohesion)', 'h'],
      ['the attraction between Na⁺ and Cl⁻ in table salt', 'i'], ['the attraction between Ca²⁺ and Cl⁻ in calcium chloride', 'i'], ['the attraction between K⁺ and Cl⁻ in potassium chloride', 'i']] },
    tf: [['About 96% of the mass of living things is carbon, hydrogen, oxygen and nitrogen', true], ['Carbon can form four covalent bonds', true], ['Hydrogen bonds are stronger than covalent bonds', false, 'Hydrogen bonds are much weaker'],
      ['An ionic bond forms when one atom gives electrons to another', true], ['In a covalent bond, atoms share electrons', true], ['Water molecules are held to each other by covalent bonds', false, 'They are attracted by hydrogen bonds']] });

  T('hsbio.carbohydrates', { share: { 1: 0.5 },
    sort: { cats: { m: ['a monosaccharide', 'monosaccharides', 'Monosaccharide'], d: ['a disaccharide', 'disaccharides', 'Disaccharide'], p: ['a polysaccharide', 'polysaccharides', 'Polysaccharide'] }, catq: 'Is this a monosaccharide, a disaccharide or a polysaccharide? {x}', items: [
      ['glucose', 'm'], ['fructose', 'm'], ['galactose', 'm'], ['ribose', 'm'], ['deoxyribose', 'm'], ['sucrose (table sugar)', 'd'], ['lactose (milk sugar)', 'd'], ['maltose', 'd'],
      ['starch', 'p'], ['glycogen', 'p'], ['cellulose', 'p'], ['chitin', 'p']] },
    pair: { fwd: 'What is the main job of {t}?', back: 'Which carbohydrate has this job: {d}?', items: [['starch', 'stores energy in plants'], ['glycogen', 'stores energy in animals, in the liver and muscles'], ['cellulose', 'builds plant cell walls'],
      ['chitin', 'builds insect exoskeletons and fungal cell walls'], ['glucose', 'is the sugar cells break down first for energy'], ['ribose', 'is the sugar in RNA']] } });

  T('hsbio.lipids', { share: { 2: 0.75 },
    tf: [['Fats are polymers made of many identical repeating monomers', false, 'A fat is glycerol plus three fatty acids'], ['Fats are built by dehydration synthesis, releasing three water molecules', true],
      ['A gram of fat stores about twice as much energy as a gram of carbohydrate', true], ['Steroids are built from glycerol and fatty acids', false, 'Steroids are built of four fused carbon rings'], ['What all lipids have in common is that they do not mix well with water', true],
      ['Phospholipids form the double layer of cell membranes', true], ['Saturated fats have only single bonds between the carbons of their fatty acids', true], ['Unsaturated fats have one or more double bonds in their fatty acids', true],
      ['Butter is mostly saturated fat and is solid at room temperature', true], ['Olive oil is mostly unsaturated fat and is liquid at room temperature', true], ['Cholesterol is a steroid', true],
      ['The body uses cholesterol to build some hormones', true], ['Waxes help keep leaves and feathers waterproof', true], ['Lipids dissolve easily in water', false],
      ['A phospholipid has a head that is attracted to water and tails that avoid it', true], ['Fat under the skin helps insulate the body', true]],
    sort: { cats: { s: ['a saturated fat', 'saturated fats', 'Saturated'], u: ['an unsaturated fat', 'unsaturated fats', 'Unsaturated'] }, catq: 'Is this mostly saturated or unsaturated fat? {x}', items: [
      ['butter', 's'], ['lard', 's'], ['coconut oil', 's'], ['the fat in cheese', 's'], ['olive oil', 'u'], ['canola oil', 'u'], ['the oil in fish', 'u'], ['corn oil', 'u'], ['the oil in nuts', 'u']] } });

  T('hsbio.nucleic-acids', { share: { 1: 0.5 },
    sort: { cats: { d: ['true of DNA only', 'true of DNA only', 'DNA'], r: ['true of RNA only', 'true of RNA only', 'RNA'], b: ['true of both DNA and RNA', 'true of both', 'Both'] }, catq: 'Is this true of DNA, RNA or both? {x}', items: [
      ['It has the sugar deoxyribose.', 'd'], ['It contains the base thymine (T).', 'd'], ['It is usually two strands in a double helix.', 'd'], ['It stores genes long term in the nucleus.', 'd'],
      ['It has the sugar ribose.', 'r'], ['It contains the base uracil (U).', 'r'], ['It is usually a single strand.', 'r'], ['It carries a gene\'s message from the nucleus to a ribosome.', 'r'], ['It brings amino acids to the ribosome.', 'r'],
      ['It is a polymer of nucleotides.', 'b'], ['It contains the bases adenine, guanine and cytosine.', 'b'], ['It has a backbone of sugars and phosphates.', 'b'], ['Its nucleotides each have a sugar, a phosphate and a base.', 'b']] },
    tf: [['A nucleotide is made of a sugar, a phosphate group and a nitrogen base', true], ['In DNA, A pairs with T and C pairs with G', true], ['RNA contains thymine', false, 'RNA has uracil in place of thymine'], ['ATP is a nucleotide', true]] });

  T('hsbio.enzymes', { share: { 2: 0.75 },
    tf: [['An enzyme does not change the overall energy released by a reaction', true], ['A competitive inhibitor blocks an enzyme by sitting in its active site', true], ['Enzymes supply the energy that makes a reaction happen', false, 'They lower the activation energy'],
      ['One enzyme molecule can catalyze the same reaction many times', true], ['An enzyme makes a reaction release more energy', false], ['Most enzymes are proteins', true], ['Enzymes lower the activation energy of a reaction', true],
      ['An enzyme is used up in the reaction it speeds up', false, 'It comes out unchanged'], ['Each enzyme has an active site that fits its substrate', true], ['High temperatures can denature an enzyme and change its shape', true],
      ['Each enzyme works best at a certain pH and temperature', true], ['Pepsin works best in the acid of the stomach', true], ['Enzymes speed up reactions that would happen anyway, only much more slowly', true],
      ['An enzyme can speed up any reaction in the cell', false, 'Each enzyme is specific to its substrates'], ['Raising the substrate amount speeds up a reaction until the enzymes are all busy', true],
      ['Names of many enzymes end in -ase, like lactase and amylase', true], ['A denatured enzyme works faster', false, 'It loses its shape and stops working']],
    pair: { fwd: 'What does the enzyme {t} break down?', back: 'Which enzyme breaks down {d}?', items: [['amylase', 'starch into sugars'], ['lactase', 'lactose (milk sugar)'], ['protease', 'proteins into amino acids'], ['lipase', 'fats into glycerol and fatty acids'], ['catalase', 'hydrogen peroxide into water and oxygen']] } });

  T('hsbio.prokaryotes-eukaryotes', { share: { 2: 0.7 },
    sort: { cats: { p: ['true of prokaryotic cells only', 'true of prokaryotic cells only', 'Prokaryotic cells only'], e: ['true of eukaryotic cells only', 'true of eukaryotic cells only', 'Eukaryotic cells only'], b: ['true of both', 'true of both', 'Both'] }, catq: 'Which cells does this fit? {x}', items: [
      ['They have a nucleus.', 'e'], ['They have mitochondria.', 'e'], ['They have an endoplasmic reticulum.', 'e'], ['Their DNA is in several linear chromosomes inside a nucleus.', 'e'], ['They are usually 10 to 100 µm across.', 'e'],
      ['They have no nucleus.', 'p'], ['Their DNA is one circular chromosome in the cytoplasm.', 'p'], ['They are usually 1 to 10 µm across.', 'p'], ['They include bacteria and archaea.', 'p'],
      ['They have a cell membrane.', 'b'], ['They have ribosomes.', 'b'], ['They have DNA.', 'b'], ['They have cytoplasm.', 'b']] },
    tf: [['Bacteria and archaea are both prokaryotes', true], ['A cell wall shows that a cell is a plant cell', false, 'Bacteria, fungi and plants all have cell walls'], ['Prokaryotic cells have ribosomes', true], ['Prokaryotes have no DNA', false],
      ['Fungi and protists are eukaryotes', true], ['Mitochondria are found only in animal cells', false, 'Plants, fungi and protists have them too']] });

  T('hsbio.channels-pumps', { share: { 1: 0.5 },
    sort: { cats: { s: ['simple diffusion', 'simple diffusion', 'Simple diffusion'], f: ['facilitated diffusion', 'facilitated diffusion', 'Facilitated diffusion'], a: ['active transport', 'active transport', 'Active transport'] }, be: 'shows', catq: 'Which kind of transport is this? {x}', items: [
      ['Carbon dioxide leaves a cell straight through the lipid bilayer.', 's'], ['Oxygen moves from an air sac in the lungs into a blood cell through the membrane.', 's'], ['A small, nonpolar molecule slips through the bilayer down its gradient.', 's'],
      ['Glucose enters a red blood cell through a carrier protein, from more to less concentrated.', 'f'], ['Sodium ions rush into a nerve cell through open channels.', 'f'], ['Water moves into a root cell through aquaporins.', 'f'], ['Chloride ions pass through a channel protein down their gradient.', 'f'],
      ['The sodium-potassium pump moves Na⁺ out and K⁺ in, using ATP.', 'a'], ['A root cell takes in minerals that are already more concentrated inside it.', 'a'], ['Cells in the small intestine pull in glucose against its gradient using energy.', 'a'], ['A pump uses ATP to move H⁺ against its gradient.', 'a']] },
    tf: [['Active transport needs energy, usually from ATP', true], ['Facilitated diffusion moves substances from low to high concentration', false, 'It moves them down their gradient, from high to low'], ['Channel proteins let specific ions pass through the membrane', true],
      ['Simple diffusion needs no protein and no energy', true], ['Facilitated diffusion uses ATP', false, 'It needs a protein but no energy']] });

  T('hsbio.bulk-transport', { share: { 1: 0.6 },
    sort: { cats: { n: ['endocytosis', 'endocytosis', 'Endocytosis'], x: ['exocytosis', 'exocytosis', 'Exocytosis'] }, be: 'shows', catq: 'Is this endocytosis or exocytosis? {x}', items: [
      ['An amoeba surrounds a bit of food and pulls it inside.', 'n'], ['A white blood cell engulfs a dead cell.', 'n'], ['A cell takes in iron-carrying proteins caught by receptors.', 'n'], ['A cell sips in a little of the fluid around it.', 'n'], ['A macrophage swallows a bacterium.', 'n'],
      ['A nerve cell releases chemical messengers at its tip.', 'x'], ['A gland cell in the stomach releases digestive enzymes.', 'x'], ['A plant cell sends materials for its cell wall out of the cell.', 'x'], ['A salivary gland cell releases amylase into the saliva.', 'x'], ['A cell releases antibodies into the blood.', 'x']] },
    tf: [['Endocytosis brings large particles into a cell in vesicles', true], ['Exocytosis releases materials when a vesicle fuses with the membrane', true], ['Phagocytosis is "cell eating," a kind of endocytosis', true],
      ['Bulk transport needs no energy', false, 'It uses energy'], ['Exocytosis takes materials into the cell', false, 'Exocytosis sends them out']] });

  T('hsbio.atp', { share: { 2: 0.75 },
    tf: [['ATP hydrolysis releases energy overall because the products are more stable than ATP', true], ['Breaking a chemical bond always takes energy', true], ['Cells couple ATP hydrolysis to reactions that need energy, often by moving a phosphate onto another molecule', true],
      ['A cell keeps a large stockpile of ATP that lasts for days', false, 'ATP is used and remade constantly'], ['ATP stores energy in one high-energy bond that releases energy when it breaks', false, 'Energy is released overall because the products are more stable'],
      ['ATP stands for adenosine triphosphate', true], ['ATP has three phosphate groups', true], ['When ATP loses a phosphate it becomes ADP', true], ['Cellular respiration makes ATP from ADP and phosphate', true],
      ['Muscle contraction, active transport and building molecules all use ATP', true], ['ATP is made only in plant cells', false, 'All cells make ATP'], ['ADP has two phosphate groups', true], ['The body recycles ATP very quickly', true]] });

  T('hsbio.cellular-respiration', { share: { 2: 0.45 },
    seq: { name: 'cellular respiration', items: ['glycolysis in the cytoplasm', 'pyruvate oxidation', 'the Krebs (citric acid) cycle', 'the electron transport chain'] },
    tf: [['Glycolysis happens in the cytoplasm', true], ['The Krebs cycle happens in the mitochondria', true], ['Most ATP is made by the electron transport chain', true], ['Oxygen accepts electrons at the end of the electron transport chain', true],
      ['The carbon dioxide you breathe out comes from food molecules', true], ['Glycolysis needs oxygen', false, 'Glycolysis works without oxygen'], ['The oxygen you breathe in becomes the carbon dioxide you breathe out', false, 'It becomes water'], ['Glycolysis splits glucose into two pyruvate', true]] });

  T('hsbio.fermentation', { share: { 3: 0.35 }, forms: { 3: ['tf1', 'all', 'not'] },
    sort: { cats: { l: ['lactic acid fermentation', 'lactic acid fermentation', 'Lactic acid fermentation'], a: ['alcoholic fermentation', 'alcoholic fermentation', 'Alcoholic fermentation'] }, be: 'uses', items: [
      ['bacteria making yogurt', 'l'], ['your muscles during a hard sprint', 'l'], ['bacteria making sauerkraut', 'l'], ['bacteria making pickles', 'l'], ['yeast making bread rise', 'a'], ['yeast in a sugar solution giving off gas', 'a']] },
    tf: [['Fermentation makes 2 ATP per glucose, from glycolysis', true], ['Fermentation needs oxygen', false], ['Fermentation lets glycolysis keep going by recycling NAD⁺', true], ['Aerobic respiration makes far more ATP per glucose than fermentation', true],
      ['Alcoholic fermentation gives off carbon dioxide', true], ['Lactic acid fermentation gives off carbon dioxide', false]] });

  T('hsbio.photo-resp-carbon', { share: { 1: 0.8, 2: 0.75 }, forms: { 1: ['cat', 'tf'], 2: ['tf', 'tf1', 'cat', 'not'] },
    sort: { cats: { a: ['a process that adds CO₂ to the air', 'processes that add CO₂ to the air', 'Adds CO₂ to the air'], r: ['a process that removes CO₂ from the air', 'processes that remove CO₂ from the air', 'Removes CO₂ from the air'] }, catq: 'Does this add CO₂ to the air or remove it? {x}', items: [
      ['a cow breathing', 'a'], ['a car burning gasoline', 'a'], ['a forest fire', 'a'], ['mushrooms decaying a log', 'a'], ['a person running', 'a'], ['a volcano erupting', 'a'], ['yeast making bread rise', 'a'], ['a power plant burning coal', 'a'], ['a sleeping cat', 'a'],
      ['a cornfield on a sunny afternoon', 'r'], ['kelp growing in sunlit ocean water', 'r'], ['a young tree growing in summer', 'r'], ['grass growing in spring sunshine', 'r'], ['phytoplankton at the ocean surface in daylight', 'r'], ['a houseplant in a bright window', 'r']] },
    tf: [['Over a whole day, a growing plant takes in more CO₂ than it gives off', true], ['The oxygen made by photosynthesis is used by respiration, and the CO₂ made by respiration is used by photosynthesis', true],
      ['Plants only photosynthesize, and animals only respire', false, 'Plants do both'], ['Plants respire both day and night', true], ['A plant in bright light gives off more CO₂ than it takes in', false],
      ['Decomposers return carbon to the air by respiration', true], ['Burning fossil fuels releases carbon that was stored underground for millions of years', true], ['The ocean takes in carbon dioxide from the air', true],
      ['Photosynthesis moves carbon from the air into living things', true], ['A plant in the dark takes in CO₂', false, 'With no light it only respires and gives CO₂ off'], ['Carbon atoms in your body were once in carbon dioxide in the air', true]] });

  T('hsbio.chromosomes', { share: { 2: 0.6 },
    tf: [['Homologous chromosomes are identical copies of each other', false, 'They carry the same genes but may have different alleles'], ['Sister chromatids are identical copies made when DNA is copied', true], ['An X-shaped copied chromosome counts as two chromosomes', false, 'It counts as one chromosome made of two chromatids'],
      ['Human body cells have 23 pairs of chromosomes', true], ['One chromosome of each homologous pair comes from each parent', true], ['A centromere holds sister chromatids together', true], ['Human gametes have 23 chromosomes', true],
      ['A karyotype is a picture of a cell\'s chromosomes arranged in pairs', true], ['Bigger organisms always have more chromosomes', false, 'A dog has 78; a human has 46'], ['Homologous chromosomes carry the same genes in the same order', true],
      ['Autosomes are all the chromosomes other than the sex chromosomes', true]] });

  T('hsbio.cell-cycle', { share: { 1: 0.7 },
    seq: { name: 'the cell cycle', items: ['G1: the cell grows and works', 'S: the DNA is copied', 'G2: the cell gets ready to divide', 'M: mitosis and cytokinesis'] },
    tf: [['Most of a cell\'s life is spent in interphase', true], ['DNA is copied during the S phase', true], ['Mitosis divides the nucleus; cytokinesis divides the cytoplasm', true], ['G0 is a resting state where a cell stops dividing', true],
      ['Interphase is a time when the cell does nothing', false, 'The cell grows, works and copies its DNA'], ['Mature nerve cells usually stay in G0', true], ['A cell copies its DNA during mitosis', false, 'DNA is copied in S phase, before mitosis'],
      ['Skin cells divide often to replace worn-out cells', true], ['Interphase includes G1, S and G2', true], ['After cytokinesis there are two daughter cells', true]],
    sort: { cats: { g1: ['G1', 'G1', 'G1'], s: ['S', 'S', 'S'], g2: ['G2', 'G2', 'G2'], m: ['M', 'M', 'M'], g0: ['G0', 'G0', 'G0'] }, catq: 'In which phase does this happen? {x}', items: [
      ['A new daughter cell grows and makes more organelles.', 'g1'], ['The cell does its normal job, such as making proteins, before copying its DNA.', 'g1'], ['Each chromosome is copied to make two sister chromatids.', 's'], ['The DNA content of the cell doubles.', 's'],
      ['The cell makes the proteins for the spindle and checks its copied DNA.', 'g2'], ['The copied chromosomes condense and the spindle pulls them apart.', 'm'], ['The cytoplasm pinches into two cells.', 'm'], ['A mature muscle cell works but no longer divides.', 'g0']] } });

  T('hsbio.mitosis', { share: { 1: 0.5 },
    seq: { name: 'mitosis', items: ['prophase', 'metaphase', 'anaphase', 'telophase'] },
    sort: { cats: { p: ['prophase', 'prophase', 'Prophase'], m: ['metaphase', 'metaphase', 'Metaphase'], a: ['anaphase', 'anaphase', 'Anaphase'], t: ['telophase', 'telophase', 'Telophase'] }, catq: 'Which stage of mitosis is this? {x}', items: [
      ['The chromosomes condense and become visible.', 'p'], ['The nuclear envelope breaks down.', 'p'], ['The spindle begins to form.', 'p'],
      ['The chromosomes line up in a single row across the middle.', 'm'], ['Spindle fibers from both poles attach to every chromosome at the equator.', 'm'],
      ['Sister chromatids separate and move to opposite poles.', 'a'], ['The cell stretches longer as the chromatids are pulled apart.', 'a'],
      ['Two new nuclear envelopes form.', 't'], ['The chromosomes uncoil at the two poles.', 't'], ['The spindle breaks down, and cytokinesis often begins.', 't']] } });

  T('hsbio.cell-cycle-control', { share: { 1: 0.65 },
    tf: [['Cancer is cell division that has escaped normal controls', true], ['Checkpoints stop the cycle if something is wrong', true], ['Cyclins and kinases help push the cell through the cycle', true], ['A cell with badly damaged DNA may destroy itself', true],
      ['Normal cells usually stop dividing when they touch their neighbors on all sides', true], ['Cancer cells obey the signals that tell them to stop dividing', false, 'They ignore them'], ['Growth factors are signals that tell cells to divide', true],
      ['Mutations in genes that control the cell cycle can lead to cancer', true], ['A tumor is a mass of cells dividing out of control', true], ['Sunlight and tobacco smoke can damage DNA and raise the risk of cancer', true],
      ['The G1 checkpoint checks whether the cell is ready to copy its DNA', true], ['The spindle checkpoint checks that every chromosome is attached to the spindle', true]],
    sort: { cats: { g1: ['the G1 checkpoint', 'the G1 checkpoint', 'G1 checkpoint'], g2: ['the G2 checkpoint', 'the G2 checkpoint', 'G2 checkpoint'], m: ['the M (spindle) checkpoint', 'the M checkpoint', 'M (spindle) checkpoint'] }, catq: 'Which checkpoint asks this question? {x}', items: [
      ['Does the cell have enough nutrients to copy its DNA?', 'g1'], ['Has a growth signal told the cell to divide?', 'g1'], ['Is the DNA undamaged before it is copied?', 'g1'], ['Is the cell large enough to start the cycle?', 'g1'],
      ['Was all the DNA copied correctly?', 'g2'], ['Is the copied DNA free of damage before mitosis begins?', 'g2'], ['Is the cell ready to enter mitosis?', 'g2'],
      ['Is every chromosome attached to spindle fibers from both poles?', 'm'], ['Are all the chromosomes lined up before the chromatids separate?', 'm']] } });

  T('hsbio.meiosis-variation', { share: { 1: 0.4, 3: 0.4 },
    tf: [['Crossing over swaps pieces between homologous chromosomes', true], ['Independent assortment means each homologous pair lines up on its own, separately from the others', true], ['Meiosis makes cells that are genetically identical to the parent cell', false],
      ['Random fertilization adds even more variation', true], ['Crossing over happens in prophase I', true], ['Brothers and sisters get different mixes of their parents\' chromosomes', true], ['A species with n pairs of chromosomes can make 2ⁿ combinations by independent assortment', true],
      ['Crossing over happens between sister chromatids of the same chromosome only', false, 'It happens between homologous chromosomes'], ['Meiosis makes four cells that each have half the chromosomes', true], ['Variation from meiosis helps a population survive changes', true]],
    forms: { 1: ['tf', 'tf1'], 3: ['tf1', 'tf1', 'tf'] } });

  T('hsbio.mitosis-vs-meiosis', { share: { 1: 0.4, 3: 0.65 },
    sort: { cats: { mi: ['true of mitosis only', 'true of mitosis only', 'Mitosis'], me: ['true of meiosis only', 'true of meiosis only', 'Meiosis'], b: ['true of both', 'true of both', 'Both'] }, catq: 'Mitosis, meiosis or both? {x}', items: [
      ['It makes two daughter cells.', 'mi'], ['Its daughter cells are identical to the parent cell.', 'mi'], ['It is used for growth and repair.', 'mi'], ['Its daughter cells have the full set of chromosomes (2n).', 'mi'], ['It has one division.', 'mi'],
      ['It makes four daughter cells.', 'me'], ['Its daughter cells are haploid (n).', 'me'], ['Crossing over happens.', 'me'], ['Homologous chromosomes pair up and then separate.', 'me'], ['It makes gametes.', 'me'], ['It has two divisions.', 'me'],
      ['The DNA is copied before it begins.', 'b'], ['A spindle moves the chromosomes.', 'b'], ['Sister chromatids separate at some point.', 'b'], ['It happens in eukaryotic cells.', 'b']] } });

  T('hsbio.dihybrid', { share: { 1: 0.5 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['AaBb can make four kinds of gametes: AB, Ab, aB and ab', true], ['Each gamete gets one allele of each gene', true], ['AABB can make only one kind of gamete', true], ['A dihybrid cross of AaBb × AaBb gives a 9 : 3 : 3 : 1 ratio of phenotypes', true],
      ['Genes on different chromosomes assort independently', true], ['A gamete from AaBb can carry both A and a', false, 'A gamete gets only one allele of each gene'], ['AaBB makes the gametes AB and aB', true], ['Aabb makes the gametes Ab and ab', true],
      ['AaBbCc can make eight kinds of gametes', true], ['A Punnett square for AaBb × AaBb has 16 boxes', true]] });

  T('hsbio.incomplete-codominance', { share: { 1: 0.55, 2: 0.6 },
    sort: { cats: { c: ['complete dominance', 'complete dominance', 'Complete dominance'], i: ['incomplete dominance', 'incomplete dominance', 'Incomplete dominance'], o: ['codominance', 'codominance', 'Codominance'] }, be: 'shows', catq: 'Which pattern of inheritance is this? {x}', items: [
      ['A tall pea plant crossed with a short one gives all tall offspring.', 'c'], ['Black guinea pigs crossed with white ones give all black pups.', 'c'], ['Round pea seeds crossed with wrinkled ones give all round seeds.', 'c'],
      ['Red snapdragons crossed with white ones give pink offspring.', 'i'], ['Red four o\'clock flowers crossed with white ones give pink flowers.', 'i'], ['Two pink snapdragons crossed together give red, pink and white offspring.', 'i'],
      ['Red cattle crossed with white cattle give roan calves with both red and white hairs.', 'o'], ['A person with type AB blood has both A and B markers on red blood cells.', 'o'], ['Black chickens crossed with white chickens give chicks with some all-black and some all-white feathers.', 'o']] },
    tf: [['In incomplete dominance the heterozygote looks like a blend of the two parents', true], ['In codominance both alleles show fully in the heterozygote', true], ['In incomplete dominance the alleles blend and are lost forever', false, 'Crossing two pink plants gives red, pink and white again'],
      ['Crossing two pink snapdragons gives about 1 red : 2 pink : 1 white', true], ['Type AB blood is an example of codominance', true], ['A red × white snapdragon cross gives all red offspring', false, 'It gives all pink']] });

  T('hsbio.ph', { share: { 3: 0.3 }, forms: { 3: ['tf1', 'all', 'not'] },
    sort: { cats: { a: ['acidic (pH below 7)', 'acidic', 'Acidic'], n: ['about neutral (pH near 7)', 'about neutral', 'Neutral'], b: ['basic (pH above 7)', 'basic', 'Basic'] }, items: [
      ['lemon juice', 'a'], ['stomach acid', 'a'], ['vinegar', 'a'], ['black coffee', 'a'], ['tomato juice', 'a'], ['pure water', 'n'], ['human blood (pH about 7.4)', 'b'], ['baking soda in water', 'b'], ['household ammonia', 'b'], ['soapy water', 'b'], ['bleach', 'b'], ['seawater (pH about 8)', 'b']] },
    tf: [['Each step of one on the pH scale is a tenfold change in H⁺ concentration', true], ['A solution at pH 3 has ten times more H⁺ than one at pH 4', true], ['A buffer resists changes in pH', true], ['Blood is kept near pH 7.4 by buffers', true],
      ['A lower pH means fewer hydrogen ions', false, 'A lower pH means more hydrogen ions'], ['Pure water has a pH of 7', true], ['Enzymes work at every pH equally well', false]] });

  T('hsbio.meiosis-variation', { share: { 1: 0.6 } });

  T('hsbio.multiple-alleles', { share: { 1: 0.5, 2: 0.3 },
    sort: { cats: { A: ['type A', 'type A', 'A'], B: ['type B', 'type B', 'B'], AB: ['type AB', 'type AB', 'AB'], O: ['type O', 'type O', 'O'] }, catq: 'What blood type does a person with this genotype have? {x}', items: [
      ['I<sup>A</sup>I<sup>A</sup>', 'A'], ['I<sup>A</sup>i', 'A'], ['I<sup>B</sup>I<sup>B</sup>', 'B'], ['I<sup>B</sup>i', 'B'], ['I<sup>A</sup>I<sup>B</sup>', 'AB'], ['ii', 'O']] },
    tf: [['The ABO blood group gene has three alleles: I<sup>A</sup>, I<sup>B</sup> and i', true], ['Each person carries only two of the three ABO alleles', true], ['I<sup>A</sup> and I<sup>B</sup> are codominant', true],
      ['The i allele is recessive to both I<sup>A</sup> and I<sup>B</sup>', true], ['A person with type O blood has the genotype ii', true], ['A person can carry three ABO alleles at once', false, 'Each person has two copies of the gene'],
      ['Two type O parents can have a type A child', false, 'Both can pass on only i'], ['Two type A parents can have a type O child', true, 'If both are I<sup>A</sup>i'], ['A type AB parent cannot have a type O child', true, 'The parent always passes on I<sup>A</sup> or I<sup>B</sup>']] });

  T('hsbio.polygenic', { share: { 2: 0.75, 3: 0.6 },
    tf: [['Polygenic traits are controlled by many genes', true], ['Polygenic traits show a continuous range of values', true], ['Height in people is shaped by many genes and by the environment', true], ['A polygenic trait usually falls into just two clear types', false, 'It forms a smooth range'],
      ['When many genes add up, the middle values are the most common', true], ['The extremes of a polygenic trait are rarer than the middle values', true], ['Skin color, height and eye color are each shaped by more than one gene', true],
      ['Blood type in the ABO system is a polygenic trait', false, 'ABO blood type is set by one gene with three alleles'], ['A graph of a polygenic trait in a large population often looks like a bell-shaped curve', true],
      ['Nutrition can affect how tall a plant or person grows', true], ['With n genes adding doses, there are 2n + 1 possible dose counts', true], ['Every offspring of AaBb × AaBb has exactly two capital alleles', false, 'Offspring can have from 0 to 4']],
    forms: { 2: ['tf', 'tf1'], 3: ['tf1', 'tf'] } });

  T('hsbio.x-linked', { share: { 2: 0.7, 3: 0.5 }, forms: { 2: ['tf', 'tf1'], 3: ['tf1', 'tf'] },
    tf: [['A son gets his X chromosome from his mother', true], ['A son gets his X chromosome from his father', false, 'His father gives him a Y'], ['X-linked recessive traits show up more often in XY people than in XX people', true],
      ['A carrier XX person has one normal allele and one recessive allele, and usually shows the normal trait', true], ['An XY person with one recessive X-linked allele shows the trait', true, 'The Y has no matching allele'],
      ['Red-green color blindness is an X-linked recessive trait', true], ['Hemophilia, a disorder in which blood clots poorly, is an X-linked recessive trait', true], ['A father passes his X chromosome to all of his daughters', true],
      ['An X-linked trait can never appear in an XX person', false, 'It appears when both X chromosomes carry the recessive allele'], ['The Y chromosome carries the same genes as the X chromosome', false, 'The Y is small and carries few genes'],
      ['A daughter of a color-blind father and a mother with two normal alleles is a carrier', true], ['A son of a carrier mother has a 1 in 2 chance of getting her recessive allele', true]] });

  T('hsbio.dna-replication', { share: { 3: 0.5 }, forms: { 3: ['order', 'next', 'tf1', 'fwd', 'back'] },
    seq: { name: 'DNA replication', items: ['helicase unwinds and unzips the double helix', 'primase lays down a short RNA primer', 'DNA polymerase adds matching nucleotides to each strand', 'the primers are replaced with DNA', 'ligase seals the gaps between fragments'] },
    pair: { fwd: 'What does {t} do in DNA replication?', back: 'Which enzyme does this in DNA replication: {d}?', items: [['helicase', 'unwinds the double helix and separates the strands'], ['DNA polymerase', 'adds nucleotides that match the template strand'], ['primase', 'makes a short RNA primer to start a new strand'], ['ligase', 'joins the Okazaki fragments into one strand']] },
    tf: [['DNA replication is semiconservative: each new molecule keeps one old strand', true], ['Each new DNA molecule is made of two brand-new strands', false, 'Each keeps one old strand'], ['A pairs with T, and C pairs with G', true],
      ['The lagging strand is made in short pieces called Okazaki fragments', true], ['DNA polymerase adds nucleotides only to the 3′ end of a growing strand', true], ['Meselson and Stahl used heavy nitrogen to show that replication is semiconservative', true]] });

  T('hsbio.translation', { share: { 2: 0.35 }, forms: { 2: ['tf', 'tf1', 'fwd', 'back'] },
    pair: { fwd: 'What is the job of {t} in making a protein?', back: 'Which molecule has this job in making a protein: {d}?', items: [['mRNA', 'carries the code for the protein from the DNA to the ribosome'], ['tRNA', 'brings one amino acid and matches its anticodon to a codon'],
      ['the ribosome', 'reads the mRNA and links amino acids together'], ['rRNA', 'makes up much of the ribosome and helps join amino acids'], ['the start codon AUG', 'marks where translation begins'], ['a stop codon', 'marks where translation ends']] },
    tf: [['Translation happens at the ribosomes', true], ['Each codon is three bases long', true], ['A tRNA anticodon pairs with an mRNA codon', true], ['Translation turns DNA into RNA', false, 'That is transcription; translation builds a protein from mRNA'],
      ['Each tRNA brings one amino acid', true], ['A stop codon codes for an amino acid', false, 'A stop codon ends translation']] });

  T('hsbio.genetic-code', { share: { 1: 0.45 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['The genetic code is read three bases at a time', true], ['AUG is the start codon and codes for methionine', true], ['There are 64 codons', true], ['Some amino acids have more than one codon', true],
      ['UAA, UAG and UGA are stop codons', true], ['Each codon codes for several different amino acids', false, 'Each codon has one meaning'], ['Nearly all living things use the same genetic code', true], ['There are 20 common amino acids in proteins', true]] });

  T('hsbio.gene-regulation', { share: { 2: 0.85, 3: 0.55 },
    pair: { fwd: 'In the lac operon, what does {t} do?', back: 'Which part of the lac operon does this: {d}?', items: [['the repressor', 'binds the operator and blocks RNA polymerase'], ['the operator', 'is the stretch of DNA where the repressor binds'],
      ['the promoter', 'is where RNA polymerase attaches to start transcription'], ['lactose', 'binds the repressor and pulls it off the operator'], ['the structural genes', 'code for the enzymes that break down lactose']] },
    tf: [['Every cell in your body has the same genes, but different cells turn on different genes', true], ['The lac operon is turned on when lactose is present', true], ['When lactose is absent, the lac repressor sits on the operator', true],
      ['Gene regulation lets a cell make only the proteins it needs', true], ['Bacteria make lactose-digesting enzymes all the time, whether or not lactose is present', false], ['A muscle cell and a nerve cell differ because they use different genes', true],
      ['Transcription factors can turn genes on or off', true], ['Cells save energy by not making proteins they do not need', true], ['A mutation in the operator can keep the repressor from binding', true],
      ['Liver cells have different DNA from skin cells', false, 'They have the same DNA; they express different genes']] });

  T('hsbio.pcr', { share: { 2: 0.6 },
    seq: { name: 'one cycle of PCR', items: ['heat to about 95 °C to separate the DNA strands', 'cool to about 55 °C so primers bind', 'warm to about 72 °C so the polymerase builds new strands'] },
    tf: [['PCR doubles the target DNA each cycle, in an ideal reaction', true], ['PCR uses a heat-stable DNA polymerase', true], ['Primers mark the start of the stretch of DNA to be copied', true], ['PCR copies a whole genome in each cycle', false, 'It copies the stretch between the primers'],
      ['After n cycles, one copy becomes 2ⁿ copies in an ideal reaction', true], ['PCR is used to copy tiny samples of DNA so they can be studied', true], ['The DNA strands are separated by heat in PCR', true], ['After 3 cycles, one copy becomes 6 copies', false, 'It becomes 2³ = 8 copies']] });

  T('hsbio.selection-patterns', { share: { 1: 0.5, 2: 0.7 },
    sort: { cats: { d: ['directional selection', 'directional selection', 'Directional'], s: ['stabilizing selection', 'stabilizing selection', 'Stabilizing'], x: ['disruptive selection', 'disruptive selection', 'Disruptive'] }, be: 'shows', catq: 'Which kind of selection is this? {x}', items: [
      ['Over many years, giraffes with longer necks reach more leaves and leave more young.', 'd'], ['Insects that resist a pesticide survive, and resistance spreads.', 'd'], ['During a drought, finches with deeper beaks crack hard seeds and survive.', 'd'], ['Darker moths survive better on soot-covered trees.', 'd'],
      ['Human babies of middle birth weight survive best.', 's'], ['Lizards of middle size escape predators best; tiny ones and huge ones do worse.', 's'], ['Plants of middle height survive both wind and shade best.', 's'], ['Birds that lay a middle number of eggs raise the most chicks.', 's'],
      ['Seedcrackers with small beaks or large beaks do well, but medium beaks do poorly, because only small and large seeds are common.', 'x'], ['Light and dark snails survive on a beach of light sand and dark rocks, but medium-colored snails are spotted.', 'x'], ['Small males sneak, large males fight, and medium males lose out.', 'x']] },
    tf: [['Directional selection shifts the average of a trait one way', true], ['Stabilizing selection favors the middle of the range', true], ['Disruptive selection favors both extremes', true], ['Stabilizing selection widens the range of a trait', false, 'It narrows it'],
      ['Disruptive selection can split a population into two groups', true], ['Natural selection acts on the traits of individuals, and populations change over generations', true]] });

  T('hsbio.adaptation-in-action', { share: { 3: 0.3 }, forms: { 3: ['tf1', 'tf'] },
    tf: [['Antibiotic resistance spreads because resistant bacteria survive and multiply', true], ['Bacteria become resistant because they try to survive the antibiotic', false, 'Resistance comes from mutations that were already there'],
      ['Pesticide resistance can spread through an insect population in a few years', true], ['Each round of spraying raises the share of resistant insects', true], ['Using the same pesticide again and again speeds up resistance', true],
      ['An individual insect becomes resistant during its life because it was sprayed', false], ['Finch beak sizes in the Galápagos changed after droughts', true], ['Selection can change a population quickly when generations are short', true]] });

  T('hsbio.evidence-fossils-anatomy', { share: { 1: 0.5 },
    sort: { cats: { h: ['homologous structures', 'homologous structures', 'Homologous structures'], a: ['analogous structures', 'analogous structures', 'Analogous structures'], v: ['a vestigial structure', 'vestigial structures', 'Vestigial structures'] }, catq: 'Which kind of evidence is this? {x}', items: [
      ['a dolphin flipper and a human arm', 'h'], ['a bird wing and a lizard front leg', 'h'], ['a cat leg and a whale flipper', 'h'], ['a frog front leg and a bat wing', 'h'], ['a mole\'s digging paw and a human hand', 'h'],
      ['an insect wing and a bird wing', 'a'], ['a shark fin and a dolphin fin (outer shape)', 'a'], ['an octopus eye and a human eye', 'a'], ['a hummingbird wing and a moth wing', 'a'],
      ['the tiny hip bones inside a whale', 'v'], ['the wings of an ostrich, which cannot fly', 'v'], ['the small leg bones inside some snakes', 'v'], ['the eyes of blind cave fish, which do not see', 'v'], ['the human appendix', 'v']] } });

  T('hsbio.density-factors', { share: { 1: 0.5 },
    sort: { cats: { d: ['density-dependent', 'density-dependent factors', 'Density-dependent'], i: ['density-independent', 'density-independent factors', 'Density-independent'] }, catq: 'Is this a density-dependent or a density-independent factor? {x}', items: [
      ['disease spreading through a crowded herd', 'd'], ['parasites passing easily between nearby hosts', 'd'], ['competition for nesting sites', 'd'], ['a shortage of food in a crowded habitat', 'd'], ['more predators drawn to where prey are crowded', 'd'], ['stress from crowding that lowers births', 'd'],
      ['a hurricane', 'i'], ['an early frost', 'i'], ['a flood', 'i'], ['a volcanic eruption', 'i'], ['a very hot summer', 'i'], ['a hard freeze that kills insects', 'i'], ['a long drought', 'i']] },
    tf: [['Density-dependent factors have a bigger effect when a population is crowded', true], ['A flood affects a population the same way no matter how crowded it is', true], ['Disease is a density-independent factor', false, 'It spreads more easily in crowds']] });

  T('hsbio.energy-flow', { share: { 2: 0.45 },
    tf: [['Only about 10% of the energy in one trophic level is passed to the next', true], ['Most of the energy at each level is used for life processes and given off as heat', true], ['Energy is recycled in an ecosystem the way matter is', false, 'Energy flows through and leaves as heat; matter cycles'],
      ['Food chains rarely have more than four or five levels', true], ['Producers capture the energy that enters most ecosystems', true], ['Top predators have the most energy available in an ecosystem', false, 'They have the least'],
      ['An energy pyramid is widest at the producers', true], ['Eating lower on the food chain uses less of the energy producers captured', true]] });

  T('hsbio.aerobic-anaerobic', { share: { 3: 0.3 }, forms: { 3: ['tf1', 'all', 'not'] },
    sort: { cats: { a: ['aerobic (uses oxygen)', 'aerobic', 'Aerobic'], n: ['anaerobic (no oxygen)', 'anaerobic', 'Anaerobic'] }, items: [
      ['a marathon runner\'s leg muscles at a steady pace', 'a'], ['a plant leaf at night', 'a'], ['a mouse breathing at rest', 'a'], ['a fish in well-oxygenated water', 'a'],
      ['yeast in a sealed jar of sugar water', 'n'], ['a sprinter\'s muscles in a 10-second dash', 'n'], ['bacteria deep in a swamp\'s mud', 'n'], ['bacteria making yogurt', 'n']] },
    tf: [['Aerobic respiration makes about 30 ATP per glucose', true], ['Fermentation makes 2 ATP per glucose', true], ['Anaerobic means without oxygen', true], ['Fermentation makes more ATP than aerobic respiration', false]] });

  T('hsbio.group-behavior', { share: { 2: 0.6, 3: 0.5 },
    sort: { cats: { s: ['safety from predators', 'safety from predators', 'Safety from predators'], f: ['finding or catching food', 'finding food', 'Finding food'], c: ['saving energy or staying warm', 'saving energy or warmth', 'Saving energy or warmth'] }, be: 'shows', catq: 'Which benefit of living in a group does this show? {x}', items: [
      ['Musk oxen form a circle with their horns facing out when wolves come.', 's'], ['A school of fish swirls so a predator cannot pick out one fish.', 's'], ['Meerkats take turns standing guard and call out when a hawk flies over.', 's'], ['Zebras in a herd are harder for a lion to single out.', 's'],
      ['Wolves hunt together and can bring down a moose.', 'f'], ['Honeybees dance to tell hive mates where flowers are.', 'f'], ['Pelicans swim in a line to herd fish into shallow water.', 'f'], ['Orcas work together to wash a seal off an ice floe.', 'f'],
      ['Emperor penguins huddle together through the winter storms.', 'c'], ['Geese fly in a V, so each bird behind saves effort.', 'c'], ['Bats cluster together in a cave to stay warm.', 'c']] },
    tf: [['Living in a group can lower each animal\'s chance of being caught', true], ['Group living has costs too, such as competing for food and spreading disease', true], ['Group behavior can be passed on because it helps individuals survive and reproduce', true],
      ['Animals in groups never compete with each other', false], ['Some animals warn others in the group with alarm calls', true]] });

  T('hsbio.feedback-loops', { share: { 1: 0.5 },
    sort: { cats: { n: ['negative feedback', 'negative feedback', 'Negative feedback'], p: ['positive feedback', 'positive feedback', 'Positive feedback'] }, be: 'shows', catq: 'Is this negative or positive feedback? {x}', items: [
      ['When blood sugar rises after a meal, the pancreas releases insulin and blood sugar falls.', 'n'], ['When blood sugar falls, the pancreas releases glucagon and blood sugar rises.', 'n'], ['When you are cold, you shiver and warm back up.', 'n'],
      ['When carbon dioxide in the blood rises, you breathe faster and blow it off.', 'n'], ['When blood pressure rises, the heart slows and blood pressure falls.', 'n'], ['When a plant loses too much water, its stomata close.', 'n'],
      ['A cut releases signals that draw more and more platelets until a clot forms.', 'p'], ['One ripe apple releases ethylene that ripens the apples around it, which release more ethylene.', 'p'], ['A nerve signal opens some sodium channels, and the inflow opens more of them.', 'p']] },
    tf: [['Negative feedback brings a condition back toward its set point', true], ['Positive feedback pushes a change further in the same direction', true], ['Most homeostasis in the body uses negative feedback', true], ['Positive feedback keeps body temperature steady', false, 'Negative feedback does']] });

  T('hsbio.temperature-control', { share: { 3: 0.5 }, forms: { 3: ['tf1', 'all', 'not', 'cat'] },
    sort: { cats: { w: ['a way the body warms itself or keeps heat', 'ways the body keeps warm', 'Keeps heat in'], c: ['a way the body cools itself', 'ways the body cools down', 'Cools the body'] }, catq: 'Does this help the body keep heat in or cool down? {x}', items: [
      ['shivering', 'w'], ['narrowing the blood vessels near the skin', 'w'], ['goose bumps raising body hair', 'w'], ['curling up into a ball', 'w'], ['huddling together, as penguins do', 'w'],
      ['sweating', 'c'], ['widening the blood vessels near the skin', 'c'], ['panting, as dogs do', 'c'], ['resting in the shade', 'c'], ['an elephant flapping its large ears', 'c']] },
    tf: [['Evaporating sweat carries heat away from the skin', true], ['Shivering makes heat by muscle activity', true], ['The hypothalamus in the brain acts as the body\'s thermostat', true], ['Widening skin blood vessels helps keep heat in', false, 'It brings warm blood to the skin to lose heat'],
      ['Sweat cools you less well in very humid air', true, 'Sweat evaporates more slowly'], ['Body temperature control is an example of negative feedback', true]] });

  T('hsbio.circulation', { share: { 2: 0.8 },
    sort: { cats: { r: ['carrying oxygen-rich blood', 'carrying oxygen-rich blood', 'Oxygen-rich'], p: ['carrying oxygen-poor blood', 'carrying oxygen-poor blood', 'Oxygen-poor'] }, be: 'is', catq: 'Does this carry oxygen-rich or oxygen-poor blood? {x}', items: [
      ['the aorta', 'r'], ['the pulmonary veins', 'r'], ['the left atrium', 'r'], ['the left ventricle', 'r'], ['the arteries to the arms and legs', 'r'], ['the coronary arteries that feed the heart muscle', 'r'],
      ['the pulmonary arteries', 'p'], ['the venae cavae', 'p'], ['the right atrium', 'p'], ['the right ventricle', 'p'], ['the veins coming back from the legs', 'p']] },
    seq: { name: 'the path of blood from the body to the body again', items: ['the venae cavae', 'the right atrium', 'the right ventricle', 'the pulmonary arteries', 'the lungs', 'the pulmonary veins', 'the left atrium', 'the left ventricle', 'the aorta'] },
    tf: [['The pulmonary arteries are the only arteries that carry oxygen-poor blood', true], ['Arteries always carry oxygen-rich blood', false, 'The pulmonary arteries carry oxygen-poor blood'], ['The left ventricle has the thickest wall of the four chambers', true],
      ['Blood passes through the heart twice on each full trip around the body', true], ['Gas exchange with the tissues happens in the capillaries', true]] });

  T('hsbio.immune-system', { share: { 1: 0.5 },
    sort: { cats: { i: ['an innate defense', 'innate defenses', 'Innate'], a: ['an adaptive defense', 'adaptive defenses', 'Adaptive'] }, catq: 'Is this an innate or an adaptive defense? {x}', items: [
      ['Stomach acid kills germs in food.', 'i'], ['Tears wash germs from the eyes.', 'i'], ['A fever slows the growth of some germs.', 'i'], ['Inflammation brings more blood and white blood cells to an infected cut.', 'i'], ['Neutrophils engulf any bacteria they meet.', 'i'], ['Coughing clears germs from the airways.', 'i'],
      ['Antibodies attach to one particular kind of germ.', 'a'], ['Killer T cells destroy body cells infected by a certain virus.', 'a'], ['A vaccine leaves memory cells ready for one disease.', 'a'], ['Helper T cells activate B cells that match an invader.', 'a'], ['The second infection by the same germ is fought off faster.', 'a']] },
    tf: [['Innate defenses act the same way against any germ', true], ['Adaptive defenses target one particular germ', true], ['The adaptive response is faster the first time than the second time', false, 'It is faster the second time, thanks to memory cells'],
      ['Vaccines work by training the adaptive immune system', true], ['Antibodies are made by B cells', true]] });

  T('hsbio.kidneys', { share: { 2: 0.75, 3: 0.2 },
    seq: { name: 'the path of fluid through the urinary system', items: ['blood is filtered in the kidney\'s nephrons', 'the filtrate flows through the nephron tubules, where most water returns to the blood', 'urine collects and flows down the ureter', 'urine is stored in the bladder', 'urine leaves through the urethra'] },
    tf: [['More ADH makes the kidneys return more water to the blood', true], ['When you are dehydrated, your urine becomes more concentrated', true], ['After drinking a lot of water, the body releases less ADH and makes more urine', true],
      ['The kidneys filter about 180 liters of fluid a day but make only about 1.5 liters of urine', true], ['The kidneys help keep the right amounts of water and salt in the blood', true], ['Nephrons are the filtering units of the kidney', true],
      ['ADH makes the kidneys release more water as urine', false, 'ADH makes them hold on to water'], ['Most of the fluid filtered by the kidneys leaves the body as urine', false, 'About 99% is reabsorbed']] });

  T('hsbio.plant-homeostasis', { share: { 1: 0.85 }, forms: { 1: ['cat', 'tf', 'cat'] },
    sort: { cats: { o: ['open stomata', 'open stomata', 'Open'], c: ['closed stomata', 'closed stomata', 'Closed'] }, catq: 'Are this plant\'s stomata most likely open or closed? {x}', items: [
      ['A well-watered bean plant in morning sunlight.', 'o'], ['A tomato plant with moist soil at midday in spring.', 'o'], ['A leaf in bright light that needs carbon dioxide for photosynthesis.', 'o'], ['A pond lily leaf floating in sunshine.', 'o'], ['A wheat plant in a watered field on a mild, sunny day.', 'o'],
      ['A wilting plant in dry soil on a hot afternoon.', 'c'], ['A plant whose roots cannot find water during a drought.', 'c'], ['A corn plant in a field that has not had rain for weeks, in hot wind.', 'c'], ['A plant whose guard cells have lost water and gone limp.', 'c'], ['A thirsty houseplant with drooping leaves.', 'c']] },
    tf: [['Guard cells open and close the stomata', true], ['Closing the stomata saves water but also stops carbon dioxide from getting in', true], ['Stomata let carbon dioxide in and water vapor out', true], ['Guard cells swell with water and open the stoma', true],
      ['A plant keeps its stomata wide open in a drought', false, 'Closing them saves water'], ['Many desert plants open their stomata at night, when it is cooler', true]] });
  T('hsbio.genetic-code', { tf: [['The genetic code is read three bases at a time', true], ['AUG is the start codon and codes for methionine', true], ['There are 64 codons', true], ['Some amino acids have more than one codon', true],
      ['UAA, UAG and UGA are stop codons', true], ['Each codon codes for several different amino acids', false, 'Each codon has one meaning'], ['Nearly all living things use the same genetic code', true], ['There are 20 common amino acids in proteins', true],
      ['The genetic code is read two bases at a time', false, 'It is read in triplets'], ['Every amino acid has exactly one codon', false, 'Most have two or more'], ['Codons are found on tRNA', false, 'Codons are on mRNA; anticodons are on tRNA'],
      ['There are 20 codons, one for each amino acid', false, 'There are 64 codons'], ['A change in one base can change the amino acid a codon codes for', true]] });
  T('hsbio.meiosis-variation', { tf: [['Crossing over swaps pieces between homologous chromosomes', true], ['Independent assortment means each homologous pair lines up on its own, separately from the others', true], ['Meiosis makes cells that are genetically identical to the parent cell', false],
      ['Random fertilization adds even more variation', true], ['Crossing over happens in prophase I', true], ['Brothers and sisters get different mixes of their parents\' chromosomes', true], ['A species with n pairs of chromosomes can make 2ⁿ combinations by independent assortment', true],
      ['Crossing over happens between sister chromatids of the same chromosome only', false, 'It happens between homologous chromosomes'], ['Meiosis makes four cells that each have half the chromosomes', true], ['Variation from meiosis helps a population survive changes', true],
      ['Independent assortment gives every gamete the same set of chromosomes', false, 'It gives different combinations'], ['A species with 3 pairs of chromosomes can make 6 combinations by independent assortment', false, 'It can make 2³ = 8'],
      ['Crossing over can put new combinations of alleles on one chromosome', true], ['Meiosis has only one division', false, 'It has two']] });

  /* ---- more levels and topics, so variety does not lean on the extra forms ---- */
  T('hsbio.elements-bonds', { share: { 2: 0.55 }, forms: { 2: ['cat', 'one', 'not', 'tf', 'back'] } });
  T('hsbio.ph', { share: { 2: 0.5 }, forms: { 2: ['cat', 'one', 'not', 'tf'] } });
  T('hsbio.nucleic-acids', { share: { 1: 0.6 } });
  T('hsbio.prokaryotes-eukaryotes', { share: { 1: 0.7 } });
  T('hsbio.bulk-transport', { share: { 1: 0.7 } });
  T('hsbio.photo-resp-carbon', { share: { 1: 0.85 } });
  T('hsbio.dihybrid', { share: { 1: 0.65 } });
  T('hsbio.pcr', { share: { 1: 0.6, 2: 0.65 }, forms: { 1: ['tf', 'tf1', 'next', 'order'] } });
  T('hsbio.plant-homeostasis', { share: { 2: 0.6 } });
  T('hsbio.scientific-theories', { share: { 1: 0.7, 2: 0.6 },
    sort: { cats: { o: ['an observation', 'observations', 'Observation'], h: ['a hypothesis', 'hypotheses', 'Hypothesis'], l: ['a law', 'laws', 'Law'], t: ['a theory', 'theories', 'Theory'] }, catq: 'What kind of scientific idea is this statement? {x}', items: [
      ['"The leaves on this plant turned yellow after two weeks in the dark."', 'o'], ['"The thermometer read 37 °C."', 'o'], ['"Ten of the twelve seeds sprouted."', 'o'], ['"The yeast mixture gave off bubbles."', 'o'],
      ['"If plants need light to make chlorophyll, then seedlings grown in the dark will be pale."', 'h'], ['"If the enzyme is a protein, then boiling it will stop it from working."', 'h'], ['"If fertilizer causes algal blooms, then ponds near farms will have more algae."', 'h'],
      ['"Energy is neither created nor destroyed in ordinary chemical changes."', 'l'], ['"Mass is conserved in a chemical reaction."', 'l'], ['"For a gas at constant temperature, pressure times volume stays the same."', 'l'],
      ['"All living things are made of cells, and cells come from other cells."', 't'], ['"Species change over many generations by natural selection."', 't'], ['"Many diseases are caused by microorganisms."', 't']] },
    tf: [['A scientific theory is a well-tested explanation supported by many lines of evidence', true], ['A theory is just a guess', false, 'In science a theory is a broad, well-tested explanation'], ['A law describes what happens; a theory explains why', true],
      ['A theory becomes a law when it is proved', false, 'Theories and laws are different kinds of ideas'], ['A hypothesis must be testable', true], ['Scientific ideas can change when new evidence appears', true], ['One experiment can prove a theory forever', false]] });
  T('hsbio.membrane-structure', { share: { 2: 0.75 },
    tf: [['Phospholipid heads face the water on both sides of the membrane', true], ['Phospholipid tails are hydrophobic and point toward the middle of the bilayer', true], ['The membrane is a rigid, solid wall', false, 'It is fluid: its parts drift sideways'],
      ['The fluid mosaic model describes a membrane with proteins floating in a lipid bilayer', true], ['Cholesterol helps keep animal cell membranes from getting too fluid or too stiff', true], ['Small nonpolar molecules like O₂ cross the bilayer easily', true],
      ['Ions cross the lipid bilayer easily without help', false, 'Charged particles need channels or pumps'], ['Glycoproteins on the surface help cells recognize each other', true], ['Large polar molecules like glucose need a protein to cross', true],
      ['The membrane is selectively permeable', true], ['Membrane proteins never move', false, 'Many drift within the bilayer'], ['Water can cross the membrane, and aquaporins speed it up', true]],
    sort: { cats: { e: ['able to cross the bilayer on its own', 'molecules that cross the bilayer on their own', 'Crosses on its own'], n: ['needing a protein to cross', 'molecules that need a protein', 'Needs a protein'] }, catq: 'Can this cross the lipid bilayer on its own, or does it need a protein? {x}', items: [
      ['oxygen', 'e'], ['carbon dioxide', 'e'], ['nitrogen gas', 'e'], ['a small steroid hormone', 'e'], ['sodium ions', 'n'], ['potassium ions', 'n'], ['glucose', 'n'], ['chloride ions', 'n'], ['amino acids', 'n'], ['calcium ions', 'n']] } });
  T('hsbio.hardy-weinberg', { share: { 2: 0.45 }, forms: { 2: ['tf', 'tf1'] },
    tf: [['In Hardy-Weinberg equilibrium, p + q = 1', true], ['In Hardy-Weinberg equilibrium, p² + 2pq + q² = 1', true], ['q² is the frequency of homozygous recessive individuals', true], ['2pq is the frequency of heterozygous individuals', true],
      ['A recessive allele always becomes rarer over time', false, 'Without selection or other forces, allele frequencies stay the same'], ['Hardy-Weinberg equilibrium needs a large population with random mating', true], ['Natural selection keeps a population in Hardy-Weinberg equilibrium', false, 'Selection changes allele frequencies'],
      ['Migration can change allele frequencies', true], ['If q = 0.3, then p = 0.7', true], ['If q² = 0.04, then q = 0.2', true], ['p is the frequency of the dominant phenotype', false, 'p is the frequency of the dominant allele']] });
  T('hsbio.gas-exchange', { share: { 3: 0.6 }, forms: { 3: ['tf1', 'order', 'next', 'all'] },
    seq: { name: 'the path of oxygen from the air to a muscle cell', items: ['the nose and trachea', 'the bronchi and bronchioles', 'the alveoli', 'the capillaries around the alveoli', 'red blood cells in the blood', 'capillaries in the muscle', 'the muscle cell'] },
    tf: [['Gas exchange in the lungs happens by diffusion across the alveolar walls', true], ['Alveoli give the lungs a very large surface area', true], ['Thin walls speed up diffusion', true], ['Oxygen moves from the blood into the alveoli', false, 'Oxygen moves from the alveoli into the blood'],
      ['Carbon dioxide moves from the blood into the alveoli', true], ['Fish gills use countercurrent flow to take in more oxygen', true], ['Diffusion rate goes up when the concentration difference goes up', true], ['Thicker walls speed up gas exchange', false, 'They slow it'],
      ['Leaves exchange gases through their stomata', true], ['Insects carry air to their cells through tubes called tracheae', true]],
    sort: { cats: { u: ['a change that speeds up gas exchange', 'changes that speed up gas exchange', 'Speeds it up'], d: ['a change that slows gas exchange', 'changes that slow gas exchange', 'Slows it'] }, items: [['more surface area', 'u'], ['a bigger concentration difference', 'u'], ['thinner walls', 'u'], ['faster blood flow past the alveoli', 'u'], ['less surface area', 'd'], ['thicker walls', 'd'], ['a smaller concentration difference', 'd'], ['fluid filling some alveoli', 'd']] } });

  /* ---- auto shares: every level still under 60% on its own also draws from the bank (never lowers a share set above) ---- */
  (function () { var up = function (id, s) { var b = BK[id], tf = (b && b.tf) || []; if (!b) return; if (!(b.sort || b.pair || b.yn || (tf.filter(function (x) { return x[1]; }).length >= 3 && tf.filter(function (x) { return !x[1]; }).length >= 3))) return; b.share = b.share || {}; Object.keys(s).forEach(function (L) { b.share[L] = Math.max(b.share[L] || 0, s[L]); }); };
    up('hsbio.ph', { 1: 0.35 });
    up('hsbio.nucleic-acids', { 1: 0.5 });
    up('hsbio.prokaryotes-eukaryotes', { 1: 0.35 });
    up('hsbio.channels-pumps', { 1: 0.5 });
    up('hsbio.bulk-transport', { 1: 0.5, 2: 0.35 });
    up('hsbio.atp', { 2: 0.35, 3: 0.35 });
    up('hsbio.cellular-respiration', { 1: 0.35 });
    up('hsbio.fermentation', { 1: 0.5 });
    up('hsbio.photo-resp-carbon', { 1: 0.5 });
    up('hsbio.chromosomes', { 1: 0.35, 2: 0.35 });
    up('hsbio.cell-cycle', { 1: 0.35 });
    up('hsbio.mitosis', { 1: 0.35 });
    up('hsbio.cell-cycle-control', { 1: 0.35, 3: 0.35 });
    up('hsbio.meiosis-variation', { 1: 0.35, 3: 0.35 });
    up('hsbio.mitosis-vs-meiosis', { 1: 0.35 });
    up('hsbio.dihybrid', { 1: 0.5 });
    up('hsbio.incomplete-codominance', { 1: 0.35, 2: 0.35 });
    up('hsbio.multiple-alleles', { 3: 0.35 });
    up('hsbio.polygenic', { 2: 0.35 });
    up('hsbio.x-linked', { 2: 0.35 });
    up('hsbio.gene-regulation', { 3: 0.35 });
    up('hsbio.pcr', { 1: 0.35, 2: 0.5 });
    up('hsbio.selection-patterns', { 1: 0.5 });
    up('hsbio.adaptation-in-action', { 1: 0.35 });
    up('hsbio.evidence-fossils-anatomy', { 1: 0.35 });
    up('hsbio.density-factors', { 1: 0.5 });
    up('hsbio.energy-flow', { 1: 0.35, 2: 0.5, 3: 0.5 });
    up('hsbio.aerobic-anaerobic', { 1: 0.35 });
    up('hsbio.feedback-loops', { 1: 0.5 });
    up('hsbio.temperature-control', { 2: 0.35, 3: 0.35 });
    up('hsbio.immune-system', { 1: 0.5 });
    up('hsbio.plant-homeostasis', { 1: 0.5 });
  })();

  Object.keys(BK).forEach(function (id) {
    var base = ML.getGen(id); if (!base) return;
    ML.gen(id, function (R, ctx) {
      var o = BK[id], L = (ctx && ctx.level) || 1, sh = o.share && o.share[L];
      if (sh && R.chance(sh)) { var p = make(R, o, L); if (p) return p; }
      return base(R, ctx);
    });
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);


/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   - check a number: a numeric question with a classmate's number, either the right one or a slip learners often make
     (a power of ten, a factor of two, a lost minus sign, off by one), and "Is that right?" (Yes / No; not in placement).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'hsbio', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function numVal(a) { var s = String(a.v).replace(/\s/g, ''), m = /^(-?[\d.]+)\*10\^(-?\d+)$/.exec(s); return m ? +m[1] * Math.pow(10, +m[2]) : (/^-?\d*\.?\d+$/.test(s) ? +s : NaN); }
  function sigOf(a) { var s = String(a.v).split('*')[0].replace(/^-/, '').replace('.', '').replace(/^0+/, ''); return Math.max(2, Math.min(4, s.length || 1)); }
  function numTex(x, n) {
    var y = Number(x.toPrecision(n)), e = y === 0 ? 0 : Math.floor(Math.log10(Math.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = Number((y / Math.pow(10, e)).toPrecision(n)); return m.toFixed(Math.max(0, n - 1)) + ' \\times 10^{' + e + '}'; }
    return y.toFixed(Math.max(0, n - 1 - e));
  }
  function numCheckable(p) {
    var a = p.a; if (YOUNG || !a || a.t !== 'num' || a.form || a.frac) return false;
    var v = numVal(a); return isFinite(v) && v !== 0 && txt(p.q).length <= 700;
  }
  function numCheckForm(R, p) {
    var a = p.a, v = numVal(a), exact = !a.rtol && Math.round(v) === v, n = sigOf(a), right = R.coin(), w;
    var cands = exact ? [v + 1, v - 1, 2 * v, v + 2].filter(function (x) { return x !== v && (v < 0 || x >= 0); })
      : [10, 0.1, 2, 0.5, 1000, 0.001].concat(v < 0 || /\bsign\b/i.test(txt(p.q)) ? [-1, -1, -1] : []).map(function (k) { return v * k; });
    // a wrong value must really be wrong: it has to fail the problem's own answer check
    cands = cands.filter(function (x) { try { return !ML.check(a, exact ? String(x) : numTex(x, n).replace(' \\times 10^{', 'e').replace('}', ''), { q: p.q, unit: p.unit }).ok; } catch (e) { return false; } });
    if (!cands.length) return null;
    w = R.pick(cands);
    var unit = p.unit ? '&nbsp;' + p.unit : '', pc = a.pct && !p.unit ? '\\%' : '';
    function vTex() { var s = String(a.v).replace(/\s/g, ''), m = /^(-?[\d.]+)\*10\^(-?\d+)$/.exec(s); return m ? m[1] + ' \\times 10^{' + m[2] + '}' : s; } // the answer exactly as the problem gives it
    function tex(x) { return '$' + (x === v ? vTex() : exact ? String(x) : numTex(x, n)) + pc + '$' + unit; }
    var shown = right ? v : w;
    var out = { q: p.q + '<p>A classmate answered: <b>' + tex(shown) + '</b></p><p>Is that right?</p>', a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: (p.steps || []).concat([right ? 'So <b>yes</b>, the classmate is right.' : 'So <b>no</b>: the answer is ' + tex(v) + ', not ' + tex(shown) + '.']) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (mode !== 'place' && numCheckable(p)) forms.push('num');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : f === 'num' ? numCheckForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
