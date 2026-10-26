/* Advanced Biology (AP and College), course key apbio (Biology Ladder): problem generators for all 50 topics.
   Source parts: /tmp/work_apbio/gen/*.js (build: /tmp/work_apbio/build_gen.sh). Conventions: /tmp/work_bio/overview.md.
   Facts come from MathLadder.bio (the kit's model: codon table, chi-square critical values, water potential, gel sizes,
   Hardy-Weinberg …) so pictures and answers agree. Answers computed from the generated numbers; numbers use rtol.
   Levels: 1 one clear case; 2 the topic's trouble spot; 3 a two-step calculation, several items, or a data reading.
   Independent checks: /tmp/work_apbio/verify.js. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  function B() { return ML.bio; }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  // a number as text: d decimals at most, trailing zeros dropped, no float noise, thousands commas
  function f(x, d) { d = d === undefined ? 2 : d; var s = (+x).toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); if (s === '-0') s = '0'; var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function fm(x, d) { return f(x, d).replace(/^-/, '−'); } // for prose (TeX prints its own minus)
  function aN(w) { return (/^[aeiou]/i.test(w) ? 'An ' : 'A ') + w; } // "An onion", "A mouse"
  function fx(x, d) { return (+x).toFixed(d); } // fixed decimals
  function sv(x, d) { return String(+(+x).toFixed(d === undefined ? 6 : d)); } // answer value string
  function num(x, rtol, d) { return { t: 'num', v: sv(x, d), rtol: rtol === undefined ? 0.01 : rtol }; }
  function int(x) { return { t: 'num', v: String(M.round(x)), form: 'int' }; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  // multiple choice: right answer and wrong ones, shuffled by the engine unless keep
  function mc(R, right, wrong, keep) { var ch = keep ? [right].concat(wrong) : R.shuffle([right].concat(wrong)); return { t: 'mc', choices: ch, v: ch.indexOf(right), keep: !!keep }; }
  // choose all that apply: items [[text, true|false], …] (at least one true)
  function mcAll(R, items) { var it = R.shuffle(items); return { t: 'mc', choices: it.map(function (x) { return x[0]; }), v: it.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function pickN(R, arr, n) { return R.sample(arr, M.min(n, arr.length)); }

  /* =================== Unit 1: Data and Experiments =================== */
  var MEAS = [
    { what: 'bean plants', q: 'height', unit: 'cm', m: [18, 40] }, { what: 'finches', q: 'beak depth', unit: 'mm', m: [8, 12] },
    { what: 'water fleas (Daphnia)', q: 'heart rate', unit: 'beats per minute', m: [180, 260] }, { what: 'oak leaves', q: 'length', unit: 'mm', m: [70, 120] },
    { what: 'enzyme trials', q: 'reaction rate', unit: 'µmol/min', m: [20, 60] }, { what: 'pill bugs', q: 'body length', unit: 'mm', m: [9, 15] },
    { what: 'tomato plants', q: 'mass of fruit', unit: 'g', m: [90, 160] }, { what: 'yeast cultures', q: 'CO₂ produced', unit: 'mL', m: [12, 30] }];
  var ROOTS = [[4, 2], [9, 3], [16, 4], [25, 5], [36, 6], [49, 7], [64, 8], [100, 10]];

  G('apbio.error-bars', function (R, ctx) {
    var L = lv(ctx), c = R.pick(MEAS);
    if (L === 1) {
      var rt = R.pick(ROOTS), mean = R.int(c.m[0], c.m[1]), ses = [0.2, 0.3, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5].filter(function (x) { return x * rt[1] <= 0.25 * mean && x * rt[1] >= 0.04 * mean; }), se = ses.length ? R.pick(ses) : 0.1, s = se * rt[1];
      if (R.coin()) return { q: 'A sample of ' + rt[0] + ' ' + c.what + ' has a mean ' + c.q + ' of ' + mean + ' ' + c.unit + ' and a standard deviation of ' + f(s, 2) + ' ' + c.unit + '. What is the standard error of the mean?',
        a: num(se), unit: c.unit, hint: 'SE = s / √n.', steps: ['$SE = s/\\sqrt{n} = ' + f(s, 2) + '/\\sqrt{' + rt[0] + '}$', '$= ' + f(s, 2) + '/' + rt[1] + ' = ' + f(se, 2) + '$ ' + c.unit + '.'] };
      var up = R.coin(), end = up ? mean + 2 * se : mean - 2 * se;
      return { q: 'For ' + rt[0] + ' ' + c.what + ', the mean ' + c.q + ' is ' + mean + ' ' + c.unit + ' and the standard deviation is ' + f(s, 2) + ' ' + c.unit + '. What is the ' + (up ? 'upper' : 'lower') + ' end of the ±2 SE error bar?',
        a: num(end, 0.005), unit: c.unit, hint: 'Find SE = s/√n first, then go 2 SE ' + (up ? 'above' : 'below') + ' the mean.',
        steps: ['$SE = ' + f(s, 2) + '/\\sqrt{' + rt[0] + '} = ' + f(se, 2) + '$', '$2\\,SE = ' + f(2 * se, 2) + '$', 'The ' + (up ? 'upper' : 'lower') + ' end is ' + mean + (up ? ' + ' : ' − ') + f(2 * se, 2) + ' = ' + f(end, 2) + ' ' + c.unit + '.'] };
    }
    if (L === 2) {
      if (R.chance(0.35)) { // SE and SD as n grows
        var k = R.pick([[4, 'halves', 'doubles'], [9, 'falls to one third', 'triples'], [16, 'falls to one quarter', 'quadruples']]), askSE = R.coin(), n0 = R.pick([10, 20, 25]);
        return { q: 'A biologist measures ' + c.q + ' in ' + n0 + ' ' + c.what + ', then repeats the study with ' + n0 * k[0] + '. About what happens to the ' + (askSE ? 'standard error of the mean' : 'standard deviation of the data') + '?',
          a: mc(R, askSE ? 'It ' + k[1] + '.' : 'It stays about the same.', askSE ? ['It stays about the same.', 'It ' + k[2] + '.', 'It falls to zero.'] : ['It ' + k[1] + '.', 'It ' + k[2] + '.', 'It falls to zero.']),
          hint: 'SE = SD/√n. Does measuring more individuals make them less varied?',
          steps: ['The sample is ' + k[0] + ' times as large, so √n is ' + M.sqrt(k[0]) + ' times as large.', askSE ? 'SE = SD/√n, and the SD stays about the same, so the SE ' + k[1] + '.' : 'The SD describes how varied the individuals are. More measurements estimate it better but do not shrink it, so it <b>stays about the same</b>.'] };
      }
      var mA = R.int(c.m[0], c.m[1]), seA = R.pick([0.5, 1, 1.5, 2]), seB = R.pick([0.5, 1, 1.5, 2]), gap = R.coin() ? 2 * (seA + seB) + R.pick([1, 2, 3]) * M.max(seA, seB) : R.pick([0.5, 1]) * (seA + seB);
      var mB = +(mA + (R.coin() || mA - gap - 2 * seB <= 0 ? gap : -gap)).toFixed(1);
      var loA = mA - 2 * seA, hiA = mA + 2 * seA, loB = mB - 2 * seB, hiB = mB + 2 * seB, over = loA <= hiB && loB <= hiA;
      var tA = R.pick(['treated', 'warm', 'sunny', 'fertilized']), tB = { treated: 'control', warm: 'cool', sunny: 'shaded', fertilized: 'unfertilized' }[tA];
      var right = over ? 'The ±2 SE bars overlap, so these data do not show a clear difference.' : 'The ±2 SE bars do not overlap, so the difference is likely real.';
      var wrong = over ? ['The ±2 SE bars overlap, which proves the two groups are the same.', 'The ±2 SE bars do not overlap, so the difference is likely real.', 'The means differ, so the difference is proven.'] :
        ['The ±2 SE bars overlap, so these data do not show a clear difference.', 'The difference is proven beyond any doubt.', 'Nothing can be said without the standard deviations.'];
      return { q: 'In ' + tA + ' ' + c.what + ', mean ' + c.q + ' = ' + f(mA, 1) + ' ' + c.unit + ' (SE ' + f(seA, 1) + '). In ' + tB + ' ' + c.what + ', mean = ' + f(mB, 1) + ' ' + c.unit + ' (SE ' + f(seB, 1) + '). Which statement is best?',
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: [cap(tA), cap(tB)], series: [{ name: 'Mean ' + c.q + ' (±2 SE)', values: [mA, mB], err: [2 * seA, 2 * seB] }], ylabel: c.unit, ymin: 0, quiet: true, interactive: false } },
        a: mc(R, right, wrong), hint: 'Build each interval: mean ± 2 SE. Do they share any values?',
        steps: [cap(tA) + ': ' + f(mA, 1) + ' ± ' + f(2 * seA, 1) + ' gives ' + f(loA, 1) + ' to ' + f(hiA, 1) + '.', cap(tB) + ': ' + f(mB, 1) + ' ± ' + f(2 * seB, 1) + ' gives ' + f(loB, 1) + ' to ' + f(hiB, 1) + '.', over ? 'The intervals overlap. That means the data do not show a clear difference. It does not prove the groups are the same.' : 'The intervals do not overlap, so the difference is likely real.'] };
    }
    // level 3: from raw data (n = 4)
    var base = R.int(c.m[0], c.m[1]), devs = R.pick([[-3, -1, 1, 3], [-4, -2, 2, 4], [-5, -1, 1, 5], [-6, -2, 0, 8], [-3, -3, 1, 5], [-4, 0, 1, 3]]), vals = R.shuffle(devs.map(function (d) { return base + d; }));
    var mean = vals.reduce(function (s, x) { return s + x; }, 0) / 4, ss = vals.reduce(function (s, x) { return s + (x - mean) * (x - mean); }, 0), sd = M.sqrt(ss / 3), se = sd / 2;
    return { q: 'Four ' + c.what + ' were measured (' + c.q + ', in ' + c.unit + '): ' + vals.join(', ') + '. Find the mean and the standard error of the mean.',
      a: { t: 'multi', parts: [{ label: 'mean', a: num(mean, 0.002), unit: c.unit }, { label: 'SE', a: num(se, 0.02), unit: c.unit }] },
      hint: 'Mean, then the sample SD (divide the sum of squared deviations by n − 1), then SE = SD/√n.',
      steps: ['Mean = (' + vals.join(' + ') + ')/4 = ' + f(mean, 2) + '.', 'Squared deviations: ' + vals.map(function (x) { return '(' + fm(x - mean, 2) + ')²'; }).join(' + ') + ' = ' + f(ss, 2) + '.', '$s = \\sqrt{' + f(ss, 2) + '/3} = ' + f(sd, 3) + '$', '$SE = s/\\sqrt{4} = ' + f(sd, 3) + '/2 = ' + f(se, 3) + '$ ' + c.unit + '.'] };
  });

  var NULLS = [
    { s: 'A student tests whether caffeine changes the heart rate of water fleas.', h0: 'Caffeine does not change the heart rate of water fleas.', ha: 'Caffeine changes the heart rate of water fleas.', guess: 'Caffeine raises the heart rate of water fleas.' },
    { s: 'A class counts oxygen bubbles from pondweed under red light and under green light.', h0: 'The rate of bubbling is the same under red and green light.', ha: 'The rate of bubbling differs between red and green light.', guess: 'Pondweed bubbles faster under red light.' },
    { s: 'A cross of two heterozygous plants gives purple and white flowers. A student tests the expected 3 : 1 ratio.', h0: 'The offspring fit a 3 : 1 ratio of purple to white.', ha: 'The offspring do not fit a 3 : 1 ratio.', guess: 'The offspring have more white flowers than expected.' },
    { s: 'Pill bugs are placed in a chamber with a damp side and a dry side.', h0: 'Pill bugs show no preference: equal numbers go to each side.', ha: 'Pill bugs are not spread equally between the two sides.', guess: 'Pill bugs prefer the damp side.' },
    { s: 'A researcher compares the mean beak depth of finches before and after a drought.', h0: 'Mean beak depth is the same before and after the drought.', ha: 'Mean beak depth differs before and after the drought.', guess: 'The drought made beaks deeper.' },
    { s: 'A student measures how fast an enzyme works at pH 5 and at pH 7.', h0: 'The enzyme works at the same rate at pH 5 and pH 7.', ha: 'The enzyme\'s rate differs between pH 5 and pH 7.', guess: 'The enzyme works faster at pH 7.' },
    { s: 'Seeds soaked in a plant hormone and untreated seeds are left to sprout.', h0: 'The hormone does not change the share of seeds that sprout.', ha: 'The hormone changes the share of seeds that sprout.', guess: 'The hormone makes more seeds sprout.' },
    { s: 'A biologist counts genotypes in a population of mice and compares them with p², 2pq and q².', h0: 'The genotype frequencies match Hardy-Weinberg expectations.', ha: 'The genotype frequencies do not match Hardy-Weinberg expectations.', guess: 'The population is evolving because of natural selection.' },
    { s: 'Two strains of bacteria are grown on plates, and the sizes of their colonies are compared.', h0: 'The mean colony size is the same for both strains.', ha: 'The mean colony size differs between the strains.', guess: 'The first strain grows bigger colonies.' },
    { s: 'A gardener tests whether bean plants grown with music grow taller than plants grown in silence.', h0: 'Music does not change the height of bean plants.', ha: 'Music changes the height of bean plants.', guess: 'Music makes bean plants grow taller.' }];
  G('apbio.null-hypothesis', function (R, ctx) {
    var L = lv(ctx), N = R.pick(NULLS);
    if (L === 1) {
      var askNull = R.chance(0.7);
      return { q: N.s + ' Which is the ' + (askNull ? 'null' : 'alternative') + ' hypothesis?', a: mc(R, askNull ? N.h0 : N.ha, askNull ? [N.ha, N.guess] : [N.h0, 'The result will be proven by the experiment.']),
        hint: 'The null hypothesis says there is no effect or no difference.', steps: ['The null hypothesis states no effect or no difference: "' + N.h0 + '"', 'The alternative states that there is one: "' + N.ha + '"', 'So the answer is: <b>' + (askNull ? N.h0 : N.ha) + '</b>'] };
    }
    var p = R.pick([0.001, 0.008, 0.01, 0.02, 0.03, 0.04, 0.07, 0.09, 0.12, 0.18, 0.25, 0.4, 0.6]), sig = p < 0.05;
    if (L === 2) {
      var right = sig ? 'Reject H₀: the data are evidence of an effect.' : 'Fail to reject H₀: the data do not show a clear effect.';
      var wrong = sig ? ['Fail to reject H₀: the data do not show a clear effect.', 'Hₐ is proven true.', 'H₀ is proven true.'] : ['Reject H₀: the data are evidence of an effect.', 'H₀ is proven true.', 'Hₐ is proven true.'];
      return { q: N.s + ' H₀: "' + N.h0 + '" The statistical test gives p = ' + p + '. Using the usual cutoff of 0.05, what should be concluded?', a: mc(R, right, wrong),
        hint: 'Compare p with 0.05. And remember: a test never proves a hypothesis.',
        steps: ['p = ' + p + (sig ? ' is less than 0.05.' : ' is not less than 0.05.'), sig ? 'Data this extreme would be rare if the null were true, so we reject it.' : 'Data like these are common enough by chance, so we fail to reject the null.', 'Neither outcome proves a hypothesis; a test weighs evidence.'] };
    }
    var items = [
      [sig ? 'H₀ should be rejected.' : 'H₀ should not be rejected.', true],
      [sig ? 'H₀ should not be rejected.' : 'H₀ should be rejected.', false],
      ['The experiment proves Hₐ.', false],
      ['If H₀ were true, a result at least this extreme would happen with a probability of about ' + p + '.', true],
      [sig ? 'The result could still be a fluke; repeating the experiment would strengthen the conclusion.' : 'A larger experiment might still find an effect.', true],
      ['The experiment proves H₀.', false]];
    return { q: N.s + ' The test gives p = ' + p + '. Choose all the statements that are correct (cutoff 0.05).', a: mcAll(R, R.sample(items, 5)),
      hint: 'The p-value is a probability calculated assuming the null is true. Tests never prove.',
      steps: ['p = ' + p + (sig ? ' < 0.05, so we reject the null.' : ' ≥ 0.05, so we fail to reject the null.'), 'The p-value is the chance of data at least this extreme if the null were true.', 'No test proves either hypothesis; results are evidence, and repeats make them stronger.'] };
  });

  G('apbio.chi-square', function (R, ctx) {
    var L = lv(ctx), C = B().CHI_CRIT, chi2 = B().chi2;
    if (L === 1 || L === 2 && R.chance(0.4)) {
      var cr = R.pick([{ r: [3, 1], n: ['purple', 'white'], s: 'a cross of two heterozygous pea plants (expected 3 : 1)' }, { r: [1, 1], n: ['tall', 'short'], s: 'a test cross of a heterozygous plant (expected 1 : 1)' }, { r: [3, 1], n: ['gray body', 'black body'], s: 'a cross of two heterozygous fruit flies (expected 3 : 1)' }, { r: [1, 1], n: ['red eyes', 'white eyes'], s: 'a test cross of heterozygous fruit flies (expected 1 : 1)' }]);
      var tot = R.pick([80, 100, 120, 160, 200, 240, 300, 400]), e = cr.r.map(function (x) { return tot * x / 4 * (cr.r[0] === 1 ? 2 : 1); });
      var d = R.int(2, M.round(tot / 10)) * (R.coin() ? 1 : -1), o = [e[0] + d, e[1] - d], x2 = chi2(o, e);
      if (L === 1) return { q: 'In ' + cr.s + ', ' + tot + ' offspring are counted: ' + o[0] + ' ' + cr.n[0] + ' and ' + o[1] + ' ' + cr.n[1] + '. Calculate χ².', a: num(x2, 0.01, 4),
        hint: 'Find the expected counts from the ratio, then add (o − e)²/e for both classes.',
        steps: ['Expected: ' + e[0] + ' ' + cr.n[0] + ' and ' + e[1] + ' ' + cr.n[1] + '.', '$\\frac{(' + o[0] + ' - ' + e[0] + ')^2}{' + e[0] + '} = \\frac{' + d * d + '}{' + e[0] + '} = ' + f(d * d / e[0], 3) + '$', '$\\frac{(' + o[1] + ' - ' + e[1] + ')^2}{' + e[1] + '} = \\frac{' + d * d + '}{' + e[1] + '} = ' + f(d * d / e[1], 3) + '$', '$\\chi^2 = ' + f(x2, 3) + '$'] };
      var rej = x2 > C[1];
      return { q: 'In ' + cr.s + ', ' + tot + ' offspring are counted: ' + o[0] + ' ' + cr.n[0] + ' and ' + o[1] + ' ' + cr.n[1] + '. At p = 0.05, do the data fit the expected ratio?',
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: cr.n, series: [{ name: 'Observed', values: o }, { name: 'Expected', values: e }], ylabel: 'Offspring', ymin: 0, quiet: true, interactive: false } },
        a: mc(R, rej ? 'No: χ² is larger than 3.84, so reject the expected ratio.' : 'Yes: χ² is less than 3.84, so the difference could be chance.', rej ? ['Yes: χ² is less than 3.84, so the difference could be chance.', 'Yes: χ² is less than 5.99 (2 categories, 2 degrees of freedom).'] : ['No: χ² is larger than 3.84, so reject the expected ratio.', 'No: the counts are not exactly ' + e.join(' and ') + '.']),
        hint: 'Compute χ², then compare it with the critical value for 2 − 1 = 1 degree of freedom.',
        steps: ['Expected: ' + e.join(' and ') + '.', '$\\chi^2 = \\frac{' + d * d + '}{' + e[0] + '} + \\frac{' + d * d + '}{' + e[1] + '} = ' + f(x2, 2) + '$', 'Degrees of freedom = 2 − 1 = 1; critical value 3.84.', f(x2, 2) + (rej ? ' > 3.84: reject the expected ratio.' : ' < 3.84: fail to reject; the data fit.')] };
    }
    if (L === 2) {
      var k = R.int(2, 6), x = R.pick([0.8, 1.6, 2.9, 3.5, 4.2, 5.1, 6.3, 7.2, 8.4, 9.9, 10.6, 12.1]), rj = x > C[k - 1], askDf = R.coin();
      var what = { 2: 'two phenotype classes', 3: 'three phenotype classes (a 1 : 2 : 1 ratio)', 4: 'four phenotype classes (a 9 : 3 : 3 : 1 ratio)', 5: 'five groups of seeds', 6: 'six habitat zones' }[k];
      if (askDf) return { q: 'A chi-square test compares observed and expected counts in ' + what + '. How many degrees of freedom does it have?', a: int(k - 1), hint: 'Degrees of freedom = number of categories − 1.', steps: ['There are ' + k + ' categories.', 'Degrees of freedom = ' + k + ' − 1 = <b>' + (k - 1) + '</b>.'] };
      return { q: 'A chi-square test on ' + what + ' gives χ² = ' + x + '. At p = 0.05, what is the conclusion?', a: mc(R, rj ? 'Reject the expected ratio.' : 'Fail to reject the expected ratio: the data fit.', [rj ? 'Fail to reject the expected ratio: the data fit.' : 'Reject the expected ratio.']),
        hint: 'Degrees of freedom = categories − 1. Then look up the critical value: 3.84, 5.99, 7.81, 9.49, 11.07 for 1 to 5.',
        steps: ['Degrees of freedom = ' + k + ' − 1 = ' + (k - 1) + '.', 'Critical value at p = 0.05: ' + C[k - 1] + '.', x + (rj ? ' > ' : ' < ') + C[k - 1] + ': ' + (rj ? 'reject the expected ratio.' : 'fail to reject; the data fit.')] };
    }
    // level 3: a dihybrid cross, four classes
    var tot3 = 16 * R.int(8, 20), e3 = [9, 3, 3, 1].map(function (r) { return tot3 * r / 16; }), lab = R.pick([['round yellow', 'round green', 'wrinkled yellow', 'wrinkled green'], ['tall purple', 'tall white', 'short purple', 'short white'], ['gray long-winged', 'gray short-winged', 'black long-winged', 'black short-winged']]);
    var big = R.coin(), o3;
    do { var sh = [R.pick([-1, 1]), R.pick([-1, 1]), R.int(-1, 1)].map(function (z) { return z * R.int(1, M.max(2, M.round(tot3 / (big ? 14 : 40)))); }); o3 = [e3[0] + sh[0], e3[1] + sh[1], e3[2] + sh[2]]; o3.push(tot3 - o3[0] - o3[1] - o3[2]); } while (o3.some(function (v) { return v < 1; }) || o3.join() === e3.join());
    var X3 = chi2(o3, e3), rj3 = X3 > C[3];
    return { q: 'A dihybrid cross gives ' + tot3 + ' offspring: ' + o3.map(function (v, i) { return v + ' ' + lab[i]; }).join(', ') + '. Test the 9 : 3 : 3 : 1 ratio: find χ² and decide at p = 0.05.',
      a: { t: 'multi', parts: [{ label: 'χ² =', a: num(X3, 0.01, 4) }, { label: 'Conclusion', a: mc(R, rj3 ? 'Reject 9 : 3 : 3 : 1' : 'Fail to reject 9 : 3 : 3 : 1', [rj3 ? 'Fail to reject 9 : 3 : 3 : 1' : 'Reject 9 : 3 : 3 : 1']) }] },
      hint: 'Expected counts: total × 9/16, 3/16, 3/16, 1/16. Four classes give 3 degrees of freedom.',
      steps: ['Expected: ' + e3.join(', ') + '.'].concat(o3.map(function (v, i) { return '$\\frac{(' + v + ' - ' + e3[i] + ')^2}{' + e3[i] + '} = ' + f((v - e3[i]) * (v - e3[i]) / e3[i], 3) + '$'; })).concat(['$\\chi^2 = ' + f(X3, 3) + '$ with 3 degrees of freedom; critical value 7.81.', f(X3, 2) + (rj3 ? ' > 7.81: reject the 9 : 3 : 3 : 1 ratio.' : ' < 7.81: fail to reject; the data fit.')]) };
  });

  /* =================== Unit 2: Molecules of Life =================== */
  var LEVELS = ['primary', 'secondary', 'tertiary', 'quaternary'];
  var LEVEL_DESC = [
    [0, 'the order of amino acids in the chain: Met-Ala-Lys-Gly …'], [0, 'the peptide bonds that join each amino acid to the next'],
    [1, 'an α-helix held by hydrogen bonds between backbone C=O and N–H groups'], [1, 'a β-pleated sheet in which two stretches of backbone lie side by side'],
    [2, 'the overall 3-D fold of a single chain, with its nonpolar R groups buried in the middle'], [2, 'a disulfide bridge between two cysteines far apart in one chain'],
    [2, 'an ionic bond between a lysine and a glutamic acid side chain in the same chain'], [3, 'hemoglobin\'s four chains (two α and two β) fitted together'],
    [3, 'two identical chains binding each other to make one working enzyme'], [3, 'the way the separate chains of collagen wind around one another']];
  G('apbio.protein-structure', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var d = R.pick(LEVEL_DESC); return { q: 'Which level of protein structure is this: ' + d[1] + '?', a: { t: 'mc', choices: LEVELS.map(cap), v: d[0], keep: true }, hint: 'Sequence, local backbone folds, the whole fold of one chain, or several chains?',
      viz: R.chance(0.4) ? { name: 'bi-molecule', opts: { mode: 'protein', level: d[0] + 1, quiet: true, interactive: false } } : undefined,
      steps: ['Primary: the sequence. Secondary: helices and sheets from backbone hydrogen bonds. Tertiary: the overall fold of one chain, from R groups. Quaternary: several chains together.', 'So this is <b>' + LEVELS[d[0]] + '</b> structure.'] }; }
    if (L === 2) {
      var sh = R.int(0, 2);
      if (sh === 0) return { q: 'What holds an α-helix in its shape?', a: mc(R, 'Hydrogen bonds between C=O and N–H groups of the backbone', ['Interactions between the R groups', 'Peptide bonds between R groups', 'Disulfide bridges between cysteines']), hint: 'Helices form in proteins with very different R groups. What do all amino acids share?',
        steps: ['Every amino acid has the same backbone atoms, including a C=O and an N–H.', 'In a helix, the C=O of one amino acid hydrogen-bonds to the N–H of another a few positions along.', 'R-group interactions build the tertiary fold, not the helix.'] };
      if (sh === 1) { var it = R.pick([['a hydrophobic cluster of leucine and valine side chains', 2], ['hydrogen bonds between backbone atoms in a β-sheet', 1], ['a disulfide bridge between two cysteines', 2], ['an ionic bond between an aspartic acid and a lysine side chain in one chain', 2], ['hydrogen bonds between backbone atoms in an α-helix', 1], ['the peptide bond between alanine and glycine', 0]]);
        return { q: 'Which level of structure does ' + it[0] + ' help make?', a: { t: 'mc', choices: LEVELS.map(cap), v: it[1], keep: true }, hint: 'Backbone hydrogen bonds: secondary. R-group (side chain) interactions in one chain: tertiary.',
          steps: [it[1] === 1 ? 'These bonds are between backbone atoms, which build helices and sheets.' : it[1] === 0 ? 'Peptide bonds link the amino acids in order: the sequence.' : 'This interaction involves R groups (side chains), which build the overall fold.', 'So it is <b>' + LEVELS[it[1]] + '</b> structure.'] }; }
      return { q: 'Which statement about secondary structure is correct?', a: mc(R, 'It comes from hydrogen bonds along the backbone, so it forms in proteins with very different sequences.', ['It comes from attractions between R groups.', 'It is the order of amino acids.', 'It exists only in proteins with more than one chain.']), hint: 'What part of an amino acid is the same in all of them?',
        steps: ['Secondary structure (helices and sheets) is held by backbone hydrogen bonds between C=O and N–H.', 'The order of amino acids is primary; R groups build tertiary; several chains make quaternary.'] };
    }
    var cause = R.pick(['heating to 90 °C', 'a strong acid that changes the pH', 'a chemical that breaks hydrogen bonds', 'a high concentration of salt']);
    var items = [['The primary structure (amino acid sequence) is unchanged.', true], ['The secondary structure (helices and sheets) may unfold.', true], ['The tertiary fold is disrupted.', true], ['The peptide bonds are broken, so the chain falls into single amino acids.', false], ['The protein may stop working.', true], ['The genes for the protein are changed.', false]];
    return { q: 'An enzyme is denatured by ' + cause + '. Choose all the statements that are correct.', a: mcAll(R, R.sample(items, 5)), hint: 'Which bonds are weak (hydrogen, ionic, hydrophobic) and which are strong (covalent peptide bonds)?',
      steps: ['Denaturing breaks the weak interactions that hold secondary, tertiary and quaternary structure, so the shape and usually the function are lost.', 'Peptide bonds are covalent and survive, so the sequence (primary structure) stays.', 'Denaturing a protein does nothing to the DNA.'] };
  });

  var AAS = [['alanine', '–CH₃', 0], ['valine', '–CH(CH₃)₂', 0], ['leucine', '–CH₂CH(CH₃)₂', 0], ['isoleucine', '–CH(CH₃)CH₂CH₃', 0], ['phenylalanine', '–CH₂–(benzene ring)', 0],
    ['serine', '–CH₂OH', 1], ['threonine', '–CH(OH)CH₃', 1], ['asparagine', '–CH₂CONH₂', 1], ['glutamine', '–CH₂CH₂CONH₂', 1],
    ['aspartic acid', '–CH₂COO⁻', 2], ['glutamic acid', '–CH₂CH₂COO⁻', 2], ['lysine', '–(CH₂)₄NH₃⁺', 3], ['arginine', '–(CH₂)₃NHC(NH₂)₂⁺', 3]];
  var FAM = ['Nonpolar (hydrophobic)', 'Polar, uncharged', 'Acidic (negative charge)', 'Basic (positive charge)'];
  function aaFam(i) { return ['nonpolar', 'polar', 'acidic', 'basic'][i]; }
  G('apbio.amino-acid-properties', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var a = R.pick(AAS); return { q: 'The R group of ' + a[0] + ' is ' + a[1] + ' (at the pH of a cell). Which family is it in?', a: { t: 'mc', choices: FAM, v: a[2], keep: true }, hint: 'Only C and H: nonpolar. –OH or –CONH₂: polar. –COO⁻: acidic. –NH₃⁺: basic.',
      steps: [a[2] === 0 ? 'The R group has only carbon and hydrogen, so it is nonpolar.' : a[2] === 1 ? 'The R group has a polar group (–OH or an amide) but no charge.' : a[2] === 2 ? 'The R group ends in a carboxyl group, negative at cell pH.' : 'The R group has an amino group, positive at cell pH.', 'So ' + a[0] + ' is <b>' + FAM[a[2]].toLowerCase() + '</b>.'] }; }
    var non = AAS.filter(function (x) { return x[2] === 0; }), chg = AAS.filter(function (x) { return x[2] >= 2; }), pol = AAS.filter(function (x) { return x[2] === 1; });
    if (L === 2) { // which swap is most disruptive inside the fold (or least)
      var old = R.pick(non), same = R.pick(non.filter(function (x) { return x !== old; })), bad = R.pick(chg), pp = R.pick(pol), worst = R.coin();
      var opts = [old[0] + ' → ' + same[0], old[0] + ' → ' + bad[0], old[0] + ' → ' + pp[0]];
      return { q: aN(old[0]) + ' (' + old[1] + ') is buried in the nonpolar core of a protein. Which substitution is ' + (worst ? 'most' : 'least') + ' likely to disrupt the fold?', a: mc(R, worst ? opts[1] : opts[0], worst ? [opts[0], opts[2]] : [opts[1], opts[2]]),
        hint: 'Compare the families. Which new R group fits best, or worst, among oily neighbors?',
        steps: [cap(same[0]) + ' (' + same[1] + ') is nonpolar like ' + old[0] + ': it fits in the core.', cap(pp[0]) + ' is polar, a poorer fit.', cap(bad[0]) + ' (' + bad[1] + ') carries a charge, which is worst of all in an oily core with no water around it.', 'So the ' + (worst ? 'most' : 'least') + ' disruptive is <b>' + (worst ? opts[1] : opts[0]) + '</b>.'] };
    }
    var sh = R.int(0, 2);
    if (sh === 0) { var x = R.pick(AAS), place = x[2] === 0 ? 'Buried inside the fold, away from water' : 'On the surface, in contact with water';
      return { q: 'In a protein dissolved in the cytoplasm, where is ' + x[0] + ' (R group ' + x[1] + ') most likely to be found?', a: mc(R, place, [x[2] === 0 ? 'On the surface, in contact with water' : 'Buried inside the fold, away from water', 'Equally likely anywhere']),
        hint: 'Nonpolar side chains hide from water; polar and charged ones face it.', steps: [cap(x[0]) + ' is ' + aaFam(x[2]) + '.', x[2] === 0 ? 'Nonpolar R groups cluster in the middle of the fold (the hydrophobic effect).' : 'Polar and charged R groups interact well with water, so they sit on the surface.', 'Answer: <b>' + place.toLowerCase() + '</b>.'] }; }
    if (sh === 1) { var ac = R.pick(chg.filter(function (y) { return y[2] === 2; })), bs = R.pick(chg.filter(function (y) { return y[2] === 3; })), n1 = R.pick(non), p1 = R.pick(pol);
      var right = ac[0] + ' and ' + bs[0];
      return { q: 'Which pair of amino acids can form an ionic bond between their R groups?', a: mc(R, right, [n1[0] + ' and ' + bs[0], p1[0] + ' and ' + n1[0], 'aspartic acid and glutamic acid']),
        hint: 'An ionic bond needs a negative charge and a positive charge.', steps: [cap(ac[0]) + ' has a –COO⁻ (negative) and ' + bs[0] + ' has a positively charged amino group.', 'Opposite charges attract: <b>' + right + '</b>. Two acidic R groups repel each other, and nonpolar or uncharged R groups have no charge to pair.'] }; }
    // a membrane-spanning helix
    return { q: 'A stretch of 20 amino acids crosses the middle of a cell membrane as an α-helix. Which R groups should face outward from that helix, toward the lipid tails?', a: mc(R, 'Nonpolar ones, such as leucine and valine', ['Charged ones, such as lysine and aspartic acid', 'Polar ones, such as serine and glutamine', 'It makes no difference']),
      hint: 'The middle of the bilayer is made of fatty acid tails.', steps: ['The interior of a membrane is the oily region of the phospholipid tails.', 'R groups touching it must be nonpolar, just like the core of a water-soluble protein.', 'Answer: <b>nonpolar R groups</b>.'] };
  });

  function rc(s) { return B().revcomp(s); }
  function cp(s) { return B().complement(s); }
  function seqR(R, n) { var s = ''; for (var i = 0; i < n; i++) s += R.pick('ACGT'.split('')); return s; }
  G('apbio.nucleic-acid-direction', function (R, ctx) {
    var L = lv(ctx), s = seqR(R, L === 1 ? 6 : 8);
    while (s === rc(s) || s === cp(s).split('').reverse().join('')) s = seqR(R, s.length);
    if (L === 1) return { q: 'A DNA strand reads 5′-' + s + '-3′. Write its partner strand directly underneath it, letter for letter (so it reads 3′ → 5′ from left to right). Type the bases only.', a: { t: 'text', v: [cp(s)] },
      viz: { name: 'bi-dna', opts: { seq: s, quiet: true, interactive: false } }, hint: 'A pairs with T and G pairs with C. Write each partner under its base.',
      steps: ['Pair each base: ' + s.split('').map(function (b) { return b + '→' + cp(b); }).join(', ') + '.', 'Partner, under the strand: 3′-' + cp(s) + '-5′.'] };
    if (L === 2) {
      var askText = R.coin();
      if (askText) return { q: 'Write the strand that pairs with 5′-' + s + '-3′, in the standard 5′ → 3′ order. Type the bases only.', a: { t: 'text', v: [rc(s)] }, hint: 'First write the partner underneath (3′ → 5′), then read it backward from its 5′ end.',
        steps: ['Underneath: 3′-' + cp(s) + '-5′.', 'Read from the 5′ end (the right): 5′-' + rc(s) + '-3′.', 'This is the reverse complement. Writing 5′-' + cp(s) + '-3′ would run the wrong way.'] };
      return { q: 'Which strand can pair with 5′-' + s + '-3′?', a: mc(R, '5′-' + rc(s) + '-3′', ['5′-' + cp(s) + '-3′', '5′-' + s.split('').reverse().join('') + '-3′', '5′-' + s + '-3′'].filter(function (v, i, a) { return a.indexOf(v) === i && v !== '5′-' + rc(s) + '-3′'; })),
        hint: 'The partner is complementary and antiparallel.', steps: ['Complement under the strand: 3′-' + cp(s) + '-5′.', 'Written 5′ → 3′: <b>5′-' + rc(s) + '-3′</b>.', '5′-' + cp(s) + '-3′ has the right letters in the wrong direction.'] };
    }
    var q = R.pick([
      ['Which end of a DNA strand has a free –OH group on the sugar?', 'The 3′ end', ['The 5′ end', 'Both ends', 'Neither end']],
      ['Which end of a DNA strand has a free phosphate group?', 'The 5′ end', ['The 3′ end', 'Both ends', 'Neither end']],
      ['To which end of a growing strand does DNA polymerase add new nucleotides?', 'The 3′ end', ['The 5′ end', 'Either end', 'The middle']],
      ['RNA polymerase reads a template strand. In which direction does the new RNA grow?', '5′ → 3′', ['3′ → 5′', 'In both directions at once', 'It depends on the gene']],
      ['A template strand runs 3′ → 5′ from left to right. In which direction is its new partner strand built?', 'Left to right, 5′ → 3′', ['Right to left, 5′ → 3′', 'Left to right, 3′ → 5′', 'Right to left, 3′ → 5′']]]);
    return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Polymerases bond the 3′ –OH of the strand to an incoming nucleotide.', steps: ['The phosphate sits on the 5′ carbon; the free –OH is on the 3′ carbon.', 'Polymerases add nucleotides only to a 3′ –OH, so strands grow 5′ → 3′, antiparallel to their template.', 'Answer: <b>' + q[1] + '</b>.'] };
  });

  /* =================== Unit 3: Cells and Membranes =================== */
  G('apbio.surface-volume', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) {
      var s = R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20, 25, 30]), c = B().cube(s), ask = R.int(0, 2);
      if (ask === 2 || s > 10) return { q: 'A cube-shaped cell is ' + s + ' µm on each side. What is its surface area to volume ratio?', a: num(c.ratio, 0.01), unit: 'per µm',
        hint: 'SA = 6s², V = s³, then divide.', steps: ['$SA = 6(' + s + ')^2 = ' + f(c.sa, 0) + '$ µm²', '$V = ' + s + '^3 = ' + f(c.v, 0) + '$ µm³', '$SA/V = ' + f(c.sa, 0) + '/' + f(c.v, 0) + ' = ' + f(c.ratio, 3) + '$ per µm (the same as $6/s$).'] };
      return { q: 'A cube-shaped cell is ' + s + ' µm on each side. Find its surface area and its volume.', a: { t: 'multi', parts: [{ label: 'surface area', a: num(c.sa, 0.001), unit: 'µm²' }, { label: 'volume', a: num(c.v, 0.001), unit: 'µm³' }] },
        hint: 'A cube has 6 square faces.', steps: ['Each face: $' + s + '^2 = ' + s * s + '$ µm²; six faces: $SA = ' + f(c.sa, 0) + '$ µm².', '$V = s^3 = ' + f(c.v, 0) + '$ µm³.'] };
    }
    if (L === 2) {
      var a = R.pick([1, 2, 3, 4, 5, 6]), k = R.pick([2, 3, 4, 5]), b = a * k, ca = B().cube(a), cb = B().cube(b), sh = R.int(0, 1);
      if (sh === 0) return { q: 'Cell A is a cube ' + a + ' µm on a side; cell B is a cube ' + b + ' µm on a side. Which statement is correct?',
        a: mc(R, 'Cell A has the larger SA : V, so it exchanges materials more efficiently for its size.', ['Cell B has the larger SA : V, because it has more surface.', 'They have the same SA : V, because both are cubes.', 'Cell B exchanges materials more efficiently because it is bigger.']),
        hint: 'Compute 6/s for each.', steps: ['A: $6/' + a + ' = ' + f(ca.ratio, 3) + '$ per µm. B: $6/' + b + ' = ' + f(cb.ratio, 3) + '$ per µm.', 'B has ' + k * k + ' times the surface but ' + k * k * k + ' times the volume, so its ratio is ' + k + ' times smaller.', 'Cell A has the larger SA : V.'] };
      return { q: 'A cube-shaped cell grows from ' + a + ' µm to ' + b + ' µm on a side. By what factor does its SA : V ratio change? (Give the new ratio divided by the old one.)', a: num(1 / k, 0.01), hint: 'SA : V = 6/s. What happens to 6/s when s is multiplied by ' + k + '?',
        steps: ['Old ratio: $6/' + a + '$. New ratio: $6/' + b + '$.', 'New ÷ old $= ' + a + '/' + b + ' = ' + f(1 / k, 3) + '$.', 'Surface grows ' + k * k + '×, volume ' + k * k * k + '×, so the ratio falls to 1/' + k + '.'] };
    }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) { var r = R.pick([1, 2, 3, 4, 5, 6, 8, 10]), sa = 4 * M.PI * r * r, v = 4 / 3 * M.PI * r * r * r;
      return { q: 'A spherical bacterium has a radius of ' + r + ' µm. Find its SA : V ratio. (Sphere: SA = 4πr², V = (4/3)πr³.)', a: num(sa / v, 0.01), unit: 'per µm', hint: 'Divide the two formulas: π and r² cancel.',
        steps: ['$SA = 4\\pi(' + r + ')^2 \\approx ' + f(sa, 1) + '$ µm²', '$V = \\tfrac{4}{3}\\pi(' + r + ')^3 \\approx ' + f(v, 1) + '$ µm³', '$SA/V = 3/r = ' + f(3 / r, 3) + '$ per µm.'] }; }
    var dims = R.pick([[1, 1, 8], [1, 2, 4], [1, 1, 27], [1, 3, 9], [2, 2, 16], [1, 4, 16], [2, 4, 8], [1, 1, 64], [1, 8, 8], [2, 2, 54], [3, 3, 24]]), V0 = dims[0] * dims[1] * dims[2], side = M.round(M.pow(V0, 1 / 3)), cube = B().cube(side), box = 2 * (dims[0] * dims[1] + dims[0] * dims[2] + dims[1] * dims[2]);
    return { q: 'A flat cell measures ' + dims.join(' µm × ') + ' µm. A cube-shaped cell has the same volume, ' + V0 + ' µm³ (' + side + ' µm on a side). Find the SA : V of each.',
      a: { t: 'multi', parts: [{ label: 'flat cell', a: num(box / V0, 0.01), unit: 'per µm' }, { label: 'cube', a: num(cube.ratio, 0.01), unit: 'per µm' }] },
      hint: 'A box has three pairs of faces: 2(lw + lh + wh).', steps: ['Box: $SA = 2(' + dims[0] * dims[1] + ' + ' + dims[0] * dims[2] + ' + ' + dims[1] * dims[2] + ') = ' + box + '$ µm²; ratio $' + box + '/' + V0 + ' = ' + f(box / V0, 3) + '$.', 'Cube: $SA = 6(' + side + ')^2 = ' + cube.sa + '$ µm²; ratio $' + cube.sa + '/' + V0 + ' = ' + f(cube.ratio, 3) + '$.', 'Same volume, but the flat shape has more surface per volume.'] };
  });

  var SOL = [['sucrose', 1], ['glucose', 1], ['NaCl', 2], ['CaCl₂', 3], ['KCl', 2]];
  G('apbio.water-potential', function (R, ctx) {
    var L = lv(ctx), psiS = B().psiS;
    if (L === 1) { var s = R.pick(SOL), C = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), tc = R.pick([20, 22, 25, 27]), T = tc + 273, ps = psiS(s[1], C, T);
      return { q: 'Find the solute potential (Ψs) of a ' + C + ' M ' + s[0] + ' solution at ' + tc + ' °C. Use R = 0.0831 L·bar/(mol·K).', a: num(ps, 0.01), unit: 'bar',
        hint: 'Ψs = −iCRT, with T in kelvin. ' + s[0] + ' makes ' + s[1] + ' particle' + (s[1] > 1 ? 's' : '') + ' per formula unit.',
        steps: ['$i = ' + s[1] + '$ (' + s[0] + (s[1] === 1 ? ' does not ionize' : ' splits into ' + s[1] + ' ions') + '); $T = ' + tc + ' + 273 = ' + T + '$ K.', '$\\Psi_s = -iCRT = -(' + s[1] + ')(' + C + ')(0.0831)(' + T + ')$', '$= ' + f(ps, 3) + '$ bar.'] }; }
    if (L === 2) {
      var a = { P: R.pick([0, 1, 2, 3, 4]), s: -R.pick([4, 5, 6, 7, 8, 9, 10]) }, b = { P: 0, s: -R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) }, pa = a.s + a.P, pb = b.s;
      while (pa === pb) { b.s = -R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); pb = b.s; }
      var into = pb > pa, right = into ? 'Water moves into the cell.' : 'Water moves out of the cell.';
      return { q: 'A plant cell has Ψs = ' + fm(a.s) + ' bar and Ψp = +' + a.P + ' bar. It is placed in a beaker of solution with Ψs = ' + fm(b.s) + ' bar (open to the air). Which way does water move?',
        a: mc(R, right, [into ? 'Water moves out of the cell.' : 'Water moves into the cell.', 'There is no net movement of water.']), hint: 'Find Ψ = Ψs + Ψp on each side. Water moves from higher Ψ to lower Ψ.',
        viz: { name: 'apbio-psi', opts: { quiet: true, interactive: false, left: { name: 'cell', C: +(-a.s / 0.0831 / 295).toFixed(3), i: 1, P: a.P }, right: { name: 'beaker', C: +(-b.s / 0.0831 / 295).toFixed(3), i: 1, P: 0 } } },
        steps: ['Cell: $\\Psi = ' + a.s + ' + ' + a.P + ' = ' + pa + '$ bar.', 'Beaker: $\\Psi_p = 0$, so $\\Psi = ' + pb + '$ bar.', 'Water moves from higher to lower: from the ' + (into ? 'beaker (' + fm(pb) + ' bar) into the cell (' + fm(pa) + ' bar)' : 'cell (' + fm(pa) + ' bar) to the beaker (' + fm(pb) + ' bar)') + '.'] };
    }
    if (R.coin()) { // potato cores: isotonic point
      var Ciso = R.pick([0.2, 0.3, 0.4]), tc3 = R.pick([20, 22, 25]), T3 = tc3 + 273, ps3 = psiS(1, Ciso, T3), xs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], slope = -R.pick([30, 35, 40]), ys = xs.map(function (x) { return +(slope * (x - Ciso)).toFixed(1) || 0; });
      return { q: 'Potato cores were soaked in sucrose solutions. Percent change in mass: ' + xs.map(function (x, i) { return x + ' M: ' + (ys[i] > 0 ? '+' : '') + fm(ys[i], 1) + '%'; }).join('; ') + '. Find the water potential of the potato cells at ' + tc3 + ' °C.',
        viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Change in mass (%)', values: ys }], xlabel: 'Sucrose (M)', ylabel: 'Change in mass (%)', quiet: true, interactive: false } },
        a: num(ps3, 0.02), unit: 'bar', hint: 'At the zero crossing, the potato and the solution have equal Ψ. The solution is in an open beaker (Ψp = 0).',
        steps: ['The mass does not change at ' + Ciso + ' M: no net water movement, so the potato\'s Ψ equals that solution\'s Ψ.', 'Solution: $\\Psi = \\Psi_s = -(1)(' + Ciso + ')(0.0831)(' + T3 + ') = ' + f(ps3, 2) + '$ bar.', 'So the potato cells have $\\Psi \\approx ' + f(ps3, 2) + '$ bar.'] };
    }
    var C1 = R.pick([0.2, 0.3, 0.4]), P1 = R.pick([2, 3, 4, 5]), sol = R.pick(SOL), C2 = R.pick([0.1, 0.15, 0.2, 0.3]), T4 = 295, p1 = psiS(1, C1, T4) + P1, p2 = psiS(sol[1], C2, T4);
    while (M.abs(p1 - p2) < 0.3) { C2 = R.pick([0.05, 0.1, 0.4, 0.5]); p2 = psiS(sol[1], C2, T4); }
    return { q: 'A plant cell contains the equivalent of ' + C1 + ' M sucrose and has a turgor pressure of +' + P1 + ' bar. It is placed in ' + C2 + ' M ' + sol[0] + ' at 22 °C. Find the water potential of the cell and of the solution, and say which way water moves.',
      a: { t: 'multi', parts: [{ label: 'Ψ of the cell', a: num(p1, 0.02), unit: 'bar' }, { label: 'Ψ of the solution', a: num(p2, 0.02), unit: 'bar' }, { label: 'Water moves', a: mc(R, p1 > p2 ? 'out of the cell' : 'into the cell', [p1 > p2 ? 'into the cell' : 'out of the cell']) }] },
      hint: 'Ψ = Ψs + Ψp for each side; T = 295 K; i = ' + sol[1] + ' for ' + sol[0] + '.',
      steps: ['Cell: $\\Psi_s = -(1)(' + C1 + ')(0.0831)(295) = ' + f(psiS(1, C1, T4), 2) + '$; $\\Psi = ' + f(psiS(1, C1, T4), 2) + ' + ' + P1 + ' = ' + f(p1, 2) + '$ bar.', 'Solution: $\\Psi = -(' + sol[1] + ')(' + C2 + ')(0.0831)(295) = ' + f(p2, 2) + '$ bar.', 'Water moves from higher Ψ to lower Ψ: ' + (p1 > p2 ? 'out of the cell.' : 'into the cell.')] };
  });

  G('apbio.membrane-potential', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var n = R.pick([10, 25, 50, 100, 150, 200, 300, 500]), ask = R.pick(['na', 'k', 'atp', 'net']);
      var v = { na: 3 * n, k: 2 * n, atp: n, net: n }[ask];
      var qtxt = { na: 'How many Na⁺ ions are pumped out of the cell', k: 'How many K⁺ ions are pumped into the cell', atp: 'How many ATP molecules are used', net: 'What net number of positive charges leaves the cell' }[ask];
      if (ask === 'atp') { var na = 3 * n; return { q: 'A cell\'s sodium-potassium pumps move ' + na + ' Na⁺ ions out. How many ATP molecules did that use?', a: int(n), hint: 'Each cycle moves 3 Na⁺ out and 2 K⁺ in for one ATP.', steps: ['One ATP per 3 Na⁺.', '$' + na + ' \\div 3 = ' + n + '$ ATP.'] }; }
      return { q: 'Sodium-potassium pumps in a patch of membrane complete ' + n + ' cycles. ' + qtxt + '?', a: int(v), hint: 'Each cycle: 3 Na⁺ out, 2 K⁺ in, 1 ATP.',
        steps: ['Each cycle moves 3 Na⁺ out and 2 K⁺ in, using one ATP.', ask === 'net' ? 'Per cycle: 3 positive charges out, 2 in, so 1 net positive charge out. For ' + n + ' cycles: <b>' + n + '</b>.' : (ask === 'na' ? '$3 \\times ' + n + ' = ' + v + '$ Na⁺ out.' : '$2 \\times ' + n + ' = ' + v + '$ K⁺ in.')] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'What makes most of the negative resting potential of a neuron?', a: mc(R, 'K⁺ leaking out through potassium channels, down the gradient the pump keeps up', ['The pump moving 3 Na⁺ out for every 2 K⁺ in, by itself', 'Na⁺ rushing into the cell through open channels', 'Negative ions being pumped into the cell']),
        hint: 'The pump builds gradients. Which ion can cross the resting membrane most easily?', steps: ['At rest the membrane is most permeable to K⁺, through leak channels.', 'K⁺ flows out down its concentration gradient, carrying positive charge and leaving the inside negative.', 'The pump\'s 3-for-2 exchange adds only a small part; its main job is to maintain the gradients.'] };
      if (sh === 1) return { q: 'In a resting neuron, where are Na⁺ and K⁺ more concentrated?', a: mc(R, 'Na⁺ outside the cell; K⁺ inside the cell', ['Na⁺ inside the cell; K⁺ outside the cell', 'Both are more concentrated inside', 'Both are spread evenly on both sides']), hint: 'Which way does the pump move each ion?',
        steps: ['The pump moves Na⁺ out and K⁺ in.', 'So Na⁺ is concentrated outside and K⁺ inside.'] };
      return { q: 'At rest, the inside of a neuron is about −70 mV compared with the outside. Why does K⁺ not keep leaking out until the gradient is gone?', a: mc(R, 'The negative inside pulls K⁺ back, balancing the push of the concentration gradient.', ['The pump stops all K⁺ channels.', 'K⁺ ions are too large to fit through channels.', 'The membrane is not permeable to K⁺ at all.']),
        hint: 'K⁺ is positive. What does a negative inside do to positive ions?', steps: ['K⁺ leaving makes the inside more negative.', 'That negative charge attracts K⁺ back in.', 'At about −70 mV the electrical pull in balances the concentration push out.'] }; }
    var sc = R.pick([
      { s: 'A drug stops the sodium-potassium pump, and the cell is watched for an hour.', t: ['The Na⁺ and K⁺ gradients slowly run down.', 'The membrane potential becomes less negative over time.'], f: ['The inside becomes more negative.', 'Nothing changes, because the pump makes no voltage.'] },
      { s: 'The fluid outside a neuron is given much more K⁺ than normal.', t: ['The K⁺ gradient across the membrane is smaller.', 'The resting potential becomes less negative (closer to 0 mV).'], f: ['The resting potential becomes more negative.', 'The pump stops working.'] },
      { s: 'A toxin blocks the potassium leak channels of a neuron.', t: ['Less K⁺ leaves the cell at rest.', 'The resting potential becomes less negative.'], f: ['The cell makes more ATP.', 'K⁺ concentrations become equal on both sides at once.'] },
      { s: 'A cell runs low on ATP.', t: ['The sodium-potassium pump slows down.', 'Over time the ion gradients weaken.'], f: ['K⁺ leak channels close permanently.', 'The pump keeps moving ions at the same rate.'] }]);
    return { q: sc.s + ' Choose all the predictions that are correct.', a: mcAll(R, sc.t.map(function (x) { return [x, true]; }).concat(sc.f.map(function (x) { return [x, false]; }))),
      hint: 'The pump keeps the gradients up; K⁺ leaking down its gradient makes most of the voltage.', steps: ['The pump (using ATP) maintains high K⁺ inside and high Na⁺ outside.', 'K⁺ leaking out through channels, down its gradient, makes the inside negative.', 'Correct: ' + sc.t.join(' ') ] };
  });

  var COMP = [['lysosome', 'Breaking down a worn-out organelle with acid-loving enzymes'], ['nucleus', 'Splicing introns out of pre-mRNA'], ['mitochondrion', 'Making ATP by chemiosmosis in a eukaryotic cell'], ['chloroplast', 'Capturing light energy in thylakoid membranes'],
    ['rough ER', 'Folding a protein that will be secreted from the cell'], ['Golgi apparatus', 'Adding sugar tags to proteins and sorting them for shipping'], ['smooth ER', 'Making phospholipids for new membranes']];
  G('apbio.compartmentalization', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var c = R.pick(COMP), wr = R.sample(COMP.filter(function (x) { return x !== c; }), 3).map(function (x) { return x[0]; });
      return { q: 'In a eukaryotic cell, which compartment does this job? ' + c[1] + '.', a: mc(R, cap(c[0]), wr.map(cap)), hint: 'Think of where each organelle\'s special conditions or enzymes are.',
        steps: ['This job happens in the <b>' + c[0] + '</b>, whose membrane keeps the right enzymes and conditions together.'] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'A bacterium has no mitochondria. Where is its electron transport chain?', a: mc(R, 'In its plasma membrane', ['In its cytoplasm, with no membrane', 'In its nucleus', 'It cannot make ATP by respiration']), hint: 'A chain needs a membrane to build an H⁺ gradient across.',
        steps: ['Electron transport and ATP synthase work only across a membrane.', 'A bacterium\'s plasma membrane serves that role.'] };
      if (sh === 1) return { q: 'True or false: prokaryotic cells have no membranes inside them, so they cannot separate any processes.', a: tf(false), hint: 'Think of cyanobacteria and their thylakoids, and the jobs of the plasma membrane.',
        steps: ['Prokaryotes lack membrane-bound organelles, but they use their plasma membrane for respiration and transport.', 'Some, like cyanobacteria, have folded internal membranes (thylakoids) for photosynthesis.', 'So the statement is <b>false</b>.'] };
      return { q: 'Which statement best explains why prokaryotes can carry out respiration without mitochondria?', a: mc(R, 'Their plasma membrane holds the electron transport chain and ATP synthase.', ['They make all their ATP by glycolysis only.', 'Their ribosomes make ATP.', 'Their cell wall stores an H⁺ gradient.']), hint: 'Where can an H⁺ gradient form in a cell with one membrane?',
        steps: ['Respiration\'s last stage needs a membrane.', 'In prokaryotes, that is the plasma membrane.'] }; }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) { var ph = R.pick([4.5, 5]);
      return { q: 'Lysosome enzymes work best near pH ' + ph + ' and barely work at pH 7. Choose all the statements that are correct.', a: mcAll(R, [['The inside of a lysosome is more acidic than the cytoplasm.', true], ['If a lysosome leaks, its enzymes do little damage in the cytoplasm.', true], ['The lysosome membrane must pump H⁺ in to keep its pH low.', true], ['The cytoplasm has the same pH as the lysosome.', false], ['Lysosome enzymes work best in the cytoplasm.', false]]),
        hint: 'Compare the two pH values and what the membrane does.', steps: ['A lysosome is kept acidic (near pH ' + ph + ') by proton pumps in its membrane.', 'The cytoplasm is near pH 7, where these enzymes are nearly inactive.', 'So a leak does little harm: the compartment protects the cell twice.'] }; }
    return { q: 'The inner membrane of a mitochondrion is folded into cristae. What is the main advantage?', a: mc(R, 'More membrane surface for electron transport chains and ATP synthase', ['More room for DNA', 'A place to store glucose', 'It lets the mitochondrion divide faster']), hint: 'Which stage of respiration sits in that membrane?',
      steps: ['The electron transport chain and ATP synthase are built into the inner membrane.', 'Folding it packs more of them into the same space, so the mitochondrion can make more ATP.'] };
  });

  /* =================== Unit 4: Cellular Energetics =================== */
  var RXNS = [['joining two amino acids by a peptide bond', 1], ['building glycogen from glucose', 1], ['the hydrolysis of ATP to ADP and phosphate', -1], ['breaking sucrose into glucose and fructose', -1],
    ['making glucose from CO₂ and water', 1], ['the breakdown of glucose in cellular respiration', -1], ['joining nucleotides into a strand of DNA (without any energy input)', 1], ['digesting a protein into amino acids', -1]];
  G('apbio.free-energy', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var sh = R.int(0, 1);
      if (sh === 0) { var g = R.pick([-12.5, -7.3, -5.5, -3.9, -1.2, 1.4, 3.4, 5.5, 8.2, 16]), ex = g < 0;
        return { q: 'A reaction in a cell has ΔG = ' + (g > 0 ? '+' : '') + fm(g) + ' kcal/mol. How is it described?', a: mc(R, ex ? 'Exergonic: it releases free energy and can proceed on its own.' : 'Endergonic: it needs an input of free energy to proceed.', [ex ? 'Endergonic: it needs an input of free energy to proceed.' : 'Exergonic: it releases free energy and can proceed on its own.', 'It is at equilibrium.']),
          hint: 'Negative ΔG: free energy released.', steps: ['ΔG = ' + (g > 0 ? '+' : '') + fm(g) + (ex ? ' is negative, so free energy is released.' : ' is positive, so free energy must be put in.'), 'So the reaction is <b>' + (ex ? 'exergonic' : 'endergonic') + '</b>.'] }; }
      var r = R.pick(RXNS);
      return { q: 'Is ' + r[0] + ' exergonic or endergonic?', a: { t: 'mc', choices: ['Exergonic (ΔG < 0)', 'Endergonic (ΔG > 0)'], v: r[1] < 0 ? 0 : 1, keep: true }, hint: 'Building big molecules from small ones usually costs free energy; breaking them down releases it.',
        steps: [r[1] < 0 ? 'This breaks larger, energy-rich molecules into smaller, more stable ones: free energy is released.' : 'This builds a larger, more ordered molecule: it needs free energy.', 'So it is <b>' + (r[1] < 0 ? 'exergonic' : 'endergonic') + '</b>.'] };
    }
    if (L === 2) { var q = R.pick([
      ['What does an enzyme change about a reaction?', 'It lowers the activation energy, so the reaction goes faster; ΔG stays the same.', ['It makes ΔG more negative, so the reaction goes faster.', 'It changes an endergonic reaction into an exergonic one.', 'It supplies the free energy the reaction needs.']],
      ['Glucose and oxygen react with a large negative ΔG, yet a sugar cube can sit in the air for years. Why?', 'The activation energy is high, so the reaction is extremely slow without an enzyme or a flame.', ['ΔG is positive in the air.', 'The reaction is endergonic.', 'Sugar has no free energy.']],
      ['A reaction is spontaneous (ΔG < 0). What can you conclude about its speed?', 'Nothing: ΔG tells whether a reaction can go, not how fast.', ['It must be fast.', 'It must be slow.', 'It happens instantly.']],
      ['Which change would alter the ΔG of a reaction?', 'Changing the reactants or products (or their concentrations)', ['Adding an enzyme', 'Doubling the amount of enzyme', 'Adding a competitive inhibitor']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Separate "can it go?" (ΔG) from "how fast?" (activation energy).', steps: ['ΔG depends only on the starting and ending states.', 'Enzymes and activation energy affect the rate, not ΔG.', 'Answer: ' + q[1]] };
    }
    var dg = R.pick([1.8, 3.4, 4.2, 5.5, 8.9, 10.2, 12.6, 15.8]), sh3 = R.int(0, 1), atp = -7.3;
    if (sh3 === 0) { var n = R.int(1, 3), tot = dg + n * atp;
      return { q: 'An endergonic step has ΔG = +' + dg + ' kcal/mol. A cell couples it to the hydrolysis of ' + n + ' ATP (ΔG = −7.3 kcal/mol each). What is ΔG for the coupled process, and can it proceed?',
        a: { t: 'multi', parts: [{ label: 'ΔG =', a: num(tot, 0.01), unit: 'kcal/mol' }, { label: 'Can it proceed?', a: mc(R, tot < 0 ? 'Yes, ΔG is negative' : 'No, ΔG is still positive', [tot < 0 ? 'No, ΔG is still positive' : 'Yes, ΔG is negative']) }] },
        hint: 'Free energy changes add.', steps: ['$\\Delta G = +' + dg + ' + ' + n + '(-7.3) = ' + f(tot, 1) + '$ kcal/mol.', tot < 0 ? 'Negative: the coupled process can go.' : 'Still positive: it needs more energy.'] }; }
    var need = M.ceil(dg / 7.3 - 1e-9);
    return { q: 'A step in a pathway has ΔG = +' + dg + ' kcal/mol. What is the smallest number of ATP hydrolyses (ΔG = −7.3 kcal/mol each) that must be coupled to it to make the total ΔG negative?', a: int(need),
      hint: 'Divide and round up.', steps: ['We need $n \\times 7.3 > ' + dg + '$.', '$' + dg + ' / 7.3 = ' + f(dg / 7.3, 2) + '$, so $n = ' + need + '$.', 'Check: $' + dg + ' - ' + need + '(7.3) = ' + f(dg - need * 7.3, 1) + '$ kcal/mol, which is negative.'] };
  });

  G('apbio.enzyme-kinetics', function (R, ctx) {
    var L = lv(ctx), mich = B().michaelis;
    if (L === 1) { var Vm = R.pick([20, 30, 40, 50, 60, 80, 100]), Km = R.pick([1, 2, 4, 5]), Ss = [0.5, 1, 2, 5, 10, 20, 50, 100].map(function (x) { return x * Km / 2; }), rs = Ss.map(function (s) { return +mich(s, Vm, Km).toFixed(1); });
      var top = rs[rs.length - 1], ask = R.coin();
      if (ask) return { q: 'An enzyme\'s rate (µmol/min) at increasing substrate concentrations: ' + Ss.map(function (s, i) { return f(s, 2) + ' mM → ' + rs[i]; }).join('; ') + '. What is the best estimate of V<sub>max</sub>?',
        viz: { name: 'bi-chart', opts: { kind: 'scatter', x: Ss, series: [{ name: 'Rate', values: rs }], xlabel: 'Substrate (mM)', ylabel: 'Rate (µmol/min)', ymin: 0, quiet: true, interactive: false } },
        a: mc(R, 'About ' + Vm + ' µmol/min', ['About ' + M.round(Vm / 2) + ' µmol/min', 'About ' + M.round(Vm * 2) + ' µmol/min', 'It keeps rising without limit']), hint: 'Where does the curve level off?',
        steps: ['The rate climbs quickly, then levels off near ' + top + '.', 'It is approaching a ceiling of about <b>' + Vm + ' µmol/min</b>: V<sub>max</sub>, when every active site is busy.'] };
      var S = R.pick([1, 2, 3, 4, 6, 8, 12, 16, 20]), v = mich(S, Vm, Km);
      return { q: 'An enzyme has V<sub>max</sub> = ' + Vm + ' µmol/min and K<sub>m</sub> = ' + Km + ' mM. Use $v = \\frac{V_{max}[S]}{K_m + [S]}$ to find the rate when [S] = ' + S + ' mM.', a: num(v, 0.01), unit: 'µmol/min',
        hint: 'Put the numbers into the formula.', steps: ['$v = \\frac{' + Vm + ' \\times ' + S + '}{' + Km + ' + ' + S + '} = \\frac{' + Vm * S + '}{' + (Km + S) + '}$', '$= ' + f(v, 2) + '$ µmol/min.'] }; }
    if (L === 2) { var q = R.pick([
      ['An enzyme reaction is running at V<sub>max</sub>. What would speed it up?', 'Adding more enzyme', ['Adding more substrate', 'Removing some product', 'Nothing can change the rate']],
      ['At very high substrate concentration, doubling the substrate barely changes the rate. Why?', 'Every active site is already busy: the enzyme is saturated.', ['The substrate has run out.', 'The enzyme has been denatured.', 'The product is blocking the substrate.']],
      ['The enzyme concentration in a test tube is doubled, with plenty of substrate. What happens to V<sub>max</sub>?', 'It doubles.', ['It stays the same.', 'It halves.', 'It becomes zero.']],
      ['At very low substrate concentration, what limits the rate of an enzyme reaction?', 'How often substrate molecules meet empty active sites', ['The number of enzyme molecules only', 'The temperature only', 'The amount of product']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Picture the active sites: mostly empty, or all full?', steps: ['At low [S], most active sites are empty, so more substrate helps.', 'At high [S], every active site is full (saturation); only more enzyme raises the rate.', 'Answer: ' + q[1]] }; }
    var Vm3 = R.pick([40, 50, 60, 80, 100, 120]), Km3 = R.pick([2, 3, 4, 5, 8, 10]), sh = R.int(0, 1);
    if (sh === 0) { var S3 = R.pick([1, 2, 3, 4, 6, 10, 15, 20]), k = R.pick([2, 3]), v1 = mich(S3, Vm3, Km3), v2 = mich(S3, Vm3 * k, Km3);
      return { q: 'An enzyme (V<sub>max</sub> = ' + Vm3 + ' µmol/min, K<sub>m</sub> = ' + Km3 + ' mM) works at [S] = ' + S3 + ' mM. Find the rate, then the rate with ' + (k === 2 ? 'twice' : 'three times') + ' as much enzyme.',
        a: { t: 'multi', parts: [{ label: 'rate', a: num(v1, 0.01), unit: 'µmol/min' }, { label: 'with more enzyme', a: num(v2, 0.01), unit: 'µmol/min' }] }, hint: 'More enzyme multiplies V<sub>max</sub>; K<sub>m</sub> does not change.',
        steps: ['$v = \\frac{' + Vm3 + ' \\times ' + S3 + '}{' + Km3 + ' + ' + S3 + '} = ' + f(v1, 2) + '$ µmol/min.', 'With ' + k + ' times the enzyme, $V_{max} = ' + Vm3 * k + '$ and K<sub>m</sub> stays ' + Km3 + ' mM.', '$v = \\frac{' + Vm3 * k + ' \\times ' + S3 + '}{' + (Km3 + S3) + '} = ' + f(v2, 2) + '$ µmol/min: ' + k + ' times as fast.'] }; }
    var frac = R.pick([0.5, 0.75, 0.8, 0.9]), Sx = frac * Km3 / (1 - frac);
    return { q: 'An enzyme has V<sub>max</sub> = ' + Vm3 + ' µmol/min and K<sub>m</sub> = ' + Km3 + ' mM. At what substrate concentration does it reach ' + f(frac * 100, 0) + '% of V<sub>max</sub>?', a: num(Sx, 0.01), unit: 'mM',
      hint: 'Set v/Vmax = [S]/(Km + [S]) equal to ' + frac + ' and solve for [S].', steps: ['$\\frac{[S]}{K_m + [S]} = ' + frac + '$', '$[S] = ' + frac + 'K_m + ' + frac + '[S]$, so $[S](1 - ' + frac + ') = ' + frac + ' \\times ' + Km3 + '$', '$[S] = ' + f(frac * Km3, 3) + '/' + f(1 - frac, 2) + ' = ' + f(Sx, 2) + '$ mM.' + (frac === 0.5 ? ' At half of V<sub>max</sub>, [S] = K<sub>m</sub>, as the definition says.' : '')] };
  });

  G('apbio.enzyme-inhibition', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var d = R.pick([['It has a shape like the substrate and binds the active site.', 0], ['It binds a site away from the active site and changes the enzyme\'s shape.', 1], ['It competes with the substrate for the same spot.', 0], ['It binds an allosteric site, so the active site no longer fits the substrate well.', 1],
        ['Malonate, which looks like succinate, blocks the active site of the enzyme that acts on succinate.', 0], ['A pathway\'s end product binds the first enzyme at a regulatory site and slows it.', 1], ['Adding plenty of substrate restores the enzyme to its full V<sub>max</sub>.', 0], ['With it present, the enzyme\'s V<sub>max</sub> is lower however much substrate is added.', 1],
        ['On a rate curve, it raises the substrate concentration needed for half speed but not the top speed.', 0], ['On a rate curve, it lowers the top speed but leaves the curve\'s shape the same.', 1], ['A drug shaped like the enzyme\'s natural substrate fits into its active site.', 0], ['A heavy metal ion binds the enzyme away from the active site and distorts it.', 1]]);
      return { q: 'What kind of inhibitor is this? ' + d[0], a: { t: 'mc', choices: ['Competitive', 'Noncompetitive (allosteric)'], v: d[1], keep: true }, hint: 'Does it bind the active site, or somewhere else?',
        steps: [d[1] === 0 ? 'It binds the active site, competing with the substrate.' : 'It binds somewhere other than the active site and changes the enzyme\'s shape.', 'So it is <b>' + (d[1] === 0 ? 'competitive' : 'noncompetitive (allosteric)') + '</b>.'] }; }
    if (L === 2) { var comp = R.coin();
      if (R.chance(0.4)) { var ok = R.coin(); return { q: 'A researcher finds that adding a large excess of substrate ' + (ok ? 'completely overcomes' : 'does not overcome') + ' the effect of an inhibitor. What kind of inhibitor is it most likely to be, and where does it bind?',
        a: mc(R, ok ? 'Competitive: it binds the active site.' : 'Noncompetitive: it binds an allosteric site away from the active site.', [ok ? 'Noncompetitive: it binds an allosteric site away from the active site.' : 'Competitive: it binds the active site.', 'Competitive: it binds an allosteric site.', 'Noncompetitive: it binds the active site.']),
        hint: 'Only an inhibitor that competes for the active site can be crowded out by substrate.', steps: ['Substrate can only outcompete an inhibitor for the same spot: the active site.', ok ? 'So it is <b>competitive</b>.' : 'An inhibitor that substrate cannot overcome binds elsewhere: <b>noncompetitive (allosteric)</b>.'] }; }
      return { q: 'An enzyme is slowed by a ' + (comp ? 'competitive' : 'noncompetitive') + ' inhibitor. A large excess of substrate is added. What happens?', a: mc(R, comp ? 'The rate rises back to nearly the uninhibited V<sub>max</sub>.' : 'The rate rises only to a lower V<sub>max</sub>; the inhibition is not overcome.', [comp ? 'The rate rises only to a lower V<sub>max</sub>; the inhibition is not overcome.' : 'The rate rises back to nearly the uninhibited V<sub>max</sub>.', 'The rate falls to zero.', 'The inhibitor becomes a substrate.']),
        hint: 'Can substrate push the inhibitor off its binding site?', steps: [comp ? 'A competitive inhibitor and the substrate compete for the active site; flooded with substrate, the enzyme almost always binds substrate.' : 'A noncompetitive inhibitor binds elsewhere, so substrate cannot push it off; inhibited enzymes stay out of action.', comp ? 'V<sub>max</sub> is restored (only the apparent K<sub>m</sub> is raised).' : 'V<sub>max</sub> stays lower however much substrate is added.'] }; }
    var Vm = R.pick([30, 40, 50, 60, 70, 80, 90, 100]), Km = R.pick([1, 2, 3, 4, 5]), kind = R.coin() ? 'comp' : 'non', mich = B().michaelis, xs = [0, 2, 5, 10, 20, 50, 100, 200];
    var a = xs.map(function (s) { return +mich(s, Vm, Km).toFixed(1); }), b = xs.map(function (s) { return +mich(s, Vm, Km, kind === 'comp' ? { competitive: 3 } : { noncompetitive: 1 }).toFixed(1); });
    return { q: 'Rates (µmol/min) of an enzyme without and with an inhibitor, at substrate concentrations ' + xs.join(', ') + ' mM. Without: ' + a.join(', ') + '. With: ' + b.join(', ') + '. Which kind of inhibitor is it, and what is V<sub>max</sub> with it?',
      viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'No inhibitor', values: a }, { name: 'With inhibitor', values: b }], xlabel: 'Substrate (mM)', ylabel: 'Rate (µmol/min)', ymin: 0, quiet: true, interactive: false } },
      a: { t: 'multi', parts: [{ label: 'Kind', a: { t: 'mc', choices: ['Competitive', 'Noncompetitive'], v: kind === 'comp' ? 0 : 1, keep: true } }, { label: 'V<sub>max</sub> with the inhibitor ≈', a: num(kind === 'comp' ? Vm : Vm / 2, 0.1), unit: 'µmol/min' }] },
      hint: 'Do both curves approach the same top at high substrate?', steps: ['Without inhibitor the rate levels off near ' + Vm + '.', kind === 'comp' ? 'With inhibitor, the rate is lower at small [S] but climbs toward the same top (' + b[b.length - 1] + ' at 200 mM): substrate overcomes it, so it is competitive, and V<sub>max</sub> is still about ' + Vm + '.' : 'With inhibitor, the curve levels off at about half (' + b[b.length - 1] + ' at 200 mM) and stays there: noncompetitive, with V<sub>max</sub> about ' + Vm / 2 + '.'] };
  });

  function the(x) { return x === 'cytochrome complex' ? 'the ' + x : x; }
  var PHOTO_PATH = ['water', 'photosystem II', 'plastoquinone', 'cytochrome complex', 'plastocyanin', 'photosystem I', 'ferredoxin', 'NADP⁺'];
  G('apbio.light-reactions', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick([
      ['Where does the O₂ released by photosynthesis come from?', 'Water, split at photosystem II', ['Carbon dioxide, split in the Calvin cycle', 'Glucose', 'Water, split at photosystem I']],
      ['Which molecule finally receives the electrons of the light reactions?', 'NADP⁺, which becomes NADPH', ['O₂, which becomes water', 'CO₂', 'ATP']],
      ['Which enzyme makes ATP in the light reactions?', 'ATP synthase, as H⁺ flows from the thylakoid space to the stroma', ['Rubisco', 'Photosystem I, directly from light', 'NADP⁺ reductase']],
      ['Where is H⁺ concentrated during the light reactions?', 'In the thylakoid space (lumen)', ['In the stroma', 'In the cytoplasm', 'Outside the chloroplast']]]);
      return { q: q[0], viz: { name: 'apbio-chain', opts: { mode: 'thylakoid', quiet: true, interactive: false } }, a: mc(R, q[1], q[2]), hint: 'Follow electrons from water to NADP⁺, and H⁺ into the thylakoid space and out through ATP synthase.',
        steps: ['Photosystem II splits water: O₂ is released and electrons enter the chain.', 'Electrons pass to photosystem I, then to NADP⁺, making NADPH.', 'H⁺ builds up in the thylakoid space and flows out through ATP synthase, making ATP.', 'Answer: ' + q[1]] }; }
    if (L === 2) { var i = R.int(1, 6), a = PHOTO_PATH[i], b = PHOTO_PATH[i + 1], sh = R.int(0, 1);
      if (sh === 0) return { q: 'In the light reactions, which photosystem receives electrons from water, and where does it pass them?', a: mc(R, 'Photosystem II, which passes them along the chain to photosystem I', ['Photosystem I, which passes them along the chain to photosystem II', 'Photosystem I, which passes them straight to NADP⁺', 'Both photosystems split water equally']),
        hint: 'The numbers come from the order of discovery, not the order of use.', steps: ['Water is split at photosystem II.', 'The electrons go down the chain to photosystem I, then to NADP⁺.', 'So the order is II, then I.'] };
      var others = R.sample(PHOTO_PATH.filter(function (x, j) { return j !== i + 1 && j !== i; }), 3);
      return { q: 'In linear electron flow, an electron leaves ' + the(a) + '. Where does it go next?', a: mc(R, cap(b), others.map(cap)), hint: 'Water → PS II → plastoquinone → cytochrome complex → plastocyanin → PS I → ferredoxin → NADP⁺.',
        steps: ['The order: ' + PHOTO_PATH.join(' → ') + '.', 'After ' + the(a) + ' comes <b>' + the(b) + '</b>.'] }; }
    var sh3 = R.int(0, 1);
    if (sh3 === 0) { var o2 = R.int(2, 12), ask = R.pick(['e', 'nadph', 'h2o']), v = { e: 4 * o2, nadph: 2 * o2, h2o: 2 * o2 }[ask];
      return { q: 'A chloroplast releases ' + o2 + ' molecules of O₂ by linear electron flow. How many ' + { e: 'electrons were taken from water', nadph: 'NADPH can be made from those electrons', h2o: 'water molecules were split' }[ask] + '?', a: int(v),
        hint: '2 H₂O → 4 H⁺ + 4 e⁻ + O₂, and each NADPH takes 2 electrons.', steps: ['Each O₂ comes from 2 H₂O, which release 4 electrons.', ask === 'e' ? '$' + o2 + ' \\times 4 = ' + v + '$ electrons.' : ask === 'h2o' ? '$' + o2 + ' \\times 2 = ' + v + '$ water molecules.' : '$' + o2 + ' \\times 4 = ' + 4 * o2 + '$ electrons, and $' + 4 * o2 + ' / 2 = ' + v + '$ NADPH.'] }; }
    var blk = R.pick([{ w: 'the cytochrome complex', t: ['NADPH production stops.', 'The H⁺ gradient across the thylakoid weakens, so ATP production falls.'], f: ['O₂ release speeds up.', 'The Calvin cycle runs faster.'] },
      { w: 'ATP synthase', t: ['ATP production stops.', 'H⁺ stays concentrated in the thylakoid space.'], f: ['Water can no longer be split at all, from the very start.', 'NADPH production speeds up.'] },
      { w: 'photosystem I (by keeping it in the dark while photosystem II gets light)', t: ['NADPH production stops.', 'Electrons back up in the chain.'], f: ['NADPH is still made from photosystem II alone.', 'More O₂ is released.'] }]);
    return { q: 'A chemical (or a condition) blocks ' + blk.w + ' in a chloroplast in the light. Choose all the predictions that are correct.', a: mcAll(R, blk.t.map(function (x) { return [x, true]; }).concat(blk.f.map(function (x) { return [x, false]; }))),
      hint: 'Trace the electron path and the H⁺ path from that point on.', steps: ['Electrons flow water → PS II → chain (cytochrome complex pumps H⁺) → PS I → NADP⁺; H⁺ returns through ATP synthase.', 'Blocking ' + blk.w + ': ' + blk.t.join(' ')] };
  });

  G('apbio.calvin-cycle', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var n = R.int(1, 8), ask = R.pick(['co2', 'atp', 'nadph']), per = { co2: 3, atp: 9, nadph: 6 }[ask], glu = R.chance(0.3);
      var what = { co2: 'CO₂ molecules must be fixed', atp: 'ATP are used', nadph: 'NADPH are used' }[ask], g3p = glu ? 2 * n : n;
      return { q: 'How many ' + what + ' to make ' + (glu ? n + ' glucose molecule' + (n > 1 ? 's' : '') + ' (each from 2 G3P)' : n + ' G3P for the cell') + ' in the Calvin cycle?', a: int(per * g3p),
        hint: 'Per G3P that leaves the cycle: 3 CO₂, 9 ATP, 6 NADPH.', steps: [glu ? n + ' glucose = ' + g3p + ' G3P.' : 'We need ' + g3p + ' G3P.', 'Each G3P needs ' + per + ' ' + { co2: 'CO₂', atp: 'ATP', nadph: 'NADPH' }[ask] + '.', '$' + g3p + ' \\times ' + per + ' = ' + per * g3p + '$.'] }; }
    if (L === 2) { var q = R.pick([
      ['When does the Calvin cycle run in a typical (C3) plant?', 'In the light, because it needs the ATP and NADPH from the light reactions', ['Only at night, because it is called the dark reactions', 'Only in the dark, when the light reactions stop', 'All night, using stored light energy']],
      ['Which molecules from the light reactions does the Calvin cycle use?', 'ATP and NADPH', ['O₂ and glucose', 'CO₂ and water', 'ADP and NADP⁺']],
      ['What does rubisco do?', 'It attaches CO₂ to RuBP (carbon fixation).', ['It splits water.', 'It makes ATP from ADP.', 'It turns G3P into glucose.']],
      ['Why is it called a cycle?', 'The CO₂ acceptor, RuBP, is rebuilt from G3P at the end of each turn.', ['Carbon atoms go around forever without leaving.', 'It alternates between day and night.', 'Glucose is turned back into CO₂.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'The cycle is "light-independent" only in the sense that light does not drive it directly.', steps: ['The Calvin cycle runs in the stroma, using ATP and NADPH from the light reactions to reduce CO₂ to G3P.', 'Rubisco fixes CO₂ onto RuBP; regeneration rebuilds RuBP.', 'Answer: ' + q[1]] }; }
    if (R.coin()) { var turns = R.pick([3, 6, 9, 12]), g = turns / 3;
      return { q: 'Bookkeeping for ' + turns + ' turns of the Calvin cycle (one CO₂ fixed per turn). How many 3-PGA are formed, and how many G3P leave the cycle for the cell?',
        a: { t: 'multi', parts: [{ label: '3-PGA formed', a: int(2 * turns) }, { label: 'G3P that leave', a: int(g) }] }, hint: 'Each CO₂ + RuBP gives two 3-PGA. Every 3 CO₂ give one G3P to the cell.',
        steps: [turns + ' CO₂ + ' + turns + ' RuBP → ' + 2 * turns + ' 3-PGA (each 6-carbon product splits in two).', 'They become ' + 2 * turns + ' G3P; ' + (2 * turns - g) + ' of them rebuild ' + turns + ' RuBP.', 'G3P that leave: ' + turns + ' / 3 = <b>' + g + '</b>. Carbon check: ' + turns + ' + ' + 5 * turns + ' = ' + 6 * turns + ' = ' + 2 * turns + ' × 3.'] }; }
    var dark = R.coin();
    return { q: dark ? 'Algae in bright light are suddenly darkened, while CO₂ stays the same. In the next few seconds, what happens to 3-PGA and RuBP?' : 'Algae in light are suddenly given much less CO₂, while the light stays the same. In the next few seconds, what happens to 3-PGA and RuBP?',
      a: mc(R, dark ? '3-PGA rises and RuBP falls.' : '3-PGA falls and RuBP rises.', [dark ? '3-PGA falls and RuBP rises.' : '3-PGA rises and RuBP falls.', 'Both stay the same.', 'Both fall to zero at once.']),
      hint: dark ? 'Which step needs ATP and NADPH, and which does not?' : 'Which step needs CO₂?', steps: dark ? ['Rubisco keeps fixing CO₂ onto RuBP, making 3-PGA (no light needed).', 'Without ATP and NADPH, 3-PGA cannot be reduced, and RuBP cannot be rebuilt.', 'So 3-PGA piles up and RuBP is used up.'] : ['With little CO₂, rubisco makes less 3-PGA.', 'ATP and NADPH still reduce the 3-PGA already there and rebuild RuBP.', 'So RuBP piles up and 3-PGA falls.'] };
  });

  var PLANTS = [['corn', 'C4'], ['sugarcane', 'C4'], ['wheat', 'C3'], ['rice', 'C3'], ['soybean', 'C3'], ['pineapple', 'CAM'], ['a cactus', 'CAM'], ['oak', 'C3'], ['an agave', 'CAM'], ['a jade plant', 'CAM']];
  G('apbio.c4-cam', function (R, ctx) {
    var L = lv(ctx), KIND = ['C3', 'C4', 'CAM'];
    if (L === 1) { var sh = R.int(0, 1);
      if (sh === 0) { var d = R.pick([['Mesophyll cells fix CO₂ into a 4-carbon acid, which carries it to bundle-sheath cells for the Calvin cycle.', 1], ['Stomata open at night; CO₂ is stored as an acid and used by day.', 2], ['Rubisco fixes CO₂ straight from the air spaces in the leaf, and stomata open by day.', 0], ['Fixation and the Calvin cycle are separated in space, in two kinds of cells.', 1], ['Fixation and the Calvin cycle are separated in time: night and day.', 2]]);
        return { q: 'Which kind of plant is described? ' + d[0], a: { t: 'mc', choices: KIND, v: d[1], keep: true }, hint: 'C4 separates the steps in space; CAM separates them in time.',
          steps: ['C3: rubisco fixes CO₂ directly. C4: two cell types (space). CAM: night and day (time).', 'So this is a <b>' + KIND[d[1]] + '</b> plant.'] }; }
      var p = R.pick(PLANTS); return { q: 'Most textbooks classify ' + p[0] + ' as which kind of plant?', a: { t: 'mc', choices: KIND, v: KIND.indexOf(p[1]), keep: true }, hint: 'C4: corn and sugarcane. CAM: cactuses, pineapple, agave, jade. Most others: C3.',
        steps: [cap(p[0]) + ' is a standard example of a <b>' + p[1] + '</b> plant.'] }; }
    if (L === 2) { var q = R.pick([
      ['When does a CAM plant run the Calvin cycle?', 'By day, using CO₂ it stored as acid at night', ['At night, when its stomata are open', 'Only in winter', 'Never: it makes sugar without the Calvin cycle']],
      ['What causes photorespiration?', 'Rubisco binding O₂ instead of CO₂, which happens more when stomata close in heat', ['Too much CO₂ in the leaf', 'Plants breathing at night', 'Light damaging the chloroplast']],
      ['Why do CAM plants open their stomata at night?', 'Night air is cooler and moister, so they lose less water taking in CO₂.', ['They make O₂ only at night.', 'Light would damage their stomata.', 'Rubisco works only in the dark.']],
      ['Why are C4 plants common in hot, sunny grasslands?', 'They keep CO₂ concentrated around rubisco, so photorespiration stays low even with stomata partly closed.', ['They do not need light.', 'They have no rubisco.', 'They take in CO₂ only at night.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'The Calvin cycle needs ATP and NADPH from light; rubisco can grab O₂ when CO₂ is low.', steps: ['Closing stomata saves water but lets CO₂ fall and O₂ rise, so rubisco makes the O₂ mistake (photorespiration).', 'C4 plants concentrate CO₂ in bundle-sheath cells; CAM plants take it in at night and run the Calvin cycle by day.', 'Answer: ' + q[1]] }; }
    var cam = R.coin(), hrs = ['6 a.m.', '12 p.m.', '6 p.m.', '12 a.m.'], acid = cam ? [R.int(70, 90), R.int(40, 55), R.int(10, 20), R.int(45, 60)] : [R.int(10, 14), R.int(10, 14), R.int(10, 14), R.int(10, 14)];
    return { q: 'The acid content of leaf sap of a desert plant is measured (arbitrary units): ' + hrs.map(function (h, i) { return h + ' ' + acid[i]; }).join(', ') + '. Its stomata are ' + (cam ? 'open at night and closed by day.' : 'open by day and closed at night.') + ' Choose all the conclusions that fit.',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: hrs, series: [{ name: 'Leaf acid', values: acid }], ylabel: 'Acid (units)', ymin: 0, quiet: true, interactive: false } },
      a: mcAll(R, cam ? [['It is a CAM plant.', true], ['CO₂ taken in at night is stored as acid.', true], ['The Calvin cycle runs by day, using the stored CO₂.', true], ['The Calvin cycle runs at night.', false], ['It is a C3 plant.', false]] :
        [['It is not acting as a CAM plant.', true], ['It takes in CO₂ by day.', true], ['It stores large amounts of acid overnight.', false], ['Its Calvin cycle runs at night.', false]]),
      hint: 'A CAM plant\'s acid rises overnight and falls during the day.', steps: cam ? ['Acid is highest at dawn and lowest at dusk: it built up overnight and was used by day.', 'With stomata open at night, this is the CAM pattern: CO₂ stored as acid at night, released to the Calvin cycle by day.'] : ['Acid stays low and steady; stomata open by day.', 'No overnight store of acid: this plant fixes CO₂ by day, not as a CAM plant.'] };
  });

  G('apbio.glycolysis-krebs', function (R, ctx) {
    var L = lv(ctx), ST = { gly: { name: 'glycolysis', co2: 0, atp: 2, nadh: 2, fadh2: 0, where: 'cytoplasm' }, ox: { name: 'pyruvate oxidation', co2: 2, atp: 0, nadh: 2, fadh2: 0, where: 'mitochondrial matrix' }, kr: { name: 'the Krebs cycle', co2: 4, atp: 2, nadh: 6, fadh2: 2, where: 'mitochondrial matrix' } };
    var MOL = { co2: 'CO₂', atp: 'ATP (net)', nadh: 'NADH', fadh2: 'FADH₂' };
    if (L === 1) { var sk = R.pick(['gly', 'ox', 'kr']), s = ST[sk], m = R.pick(['co2', 'atp', 'nadh', 'fadh2']), n = R.int(1, 6);
      if (s[m] === 0 && R.coin()) m = 'nadh';
      return { q: 'A cell breaks down ' + n + ' glucose molecule' + (n > 1 ? 's' : '') + '. How many ' + MOL[m] + ' are made by ' + s.name + ' alone?', a: int(n * s[m]),
        hint: 'Per glucose: glycolysis 2 ATP, 2 NADH; pyruvate oxidation 2 CO₂, 2 NADH; Krebs (2 turns) 4 CO₂, 2 ATP, 6 NADH, 2 FADH₂.',
        steps: ['Per glucose, ' + s.name + ' makes ' + s[m] + ' ' + MOL[m] + '.', '$' + n + ' \\times ' + s[m] + ' = ' + n * s[m] + '$.'] }; }
    if (L === 2) { var q = R.pick([
      ['What is the main product of the Krebs cycle, in terms of stored energy?', 'NADH and FADH₂, which carry electrons to the electron transport chain', ['Most of the cell\'s ATP', 'Glucose', 'Oxygen']],
      ['Which stage of cellular respiration makes the most ATP?', 'Oxidative phosphorylation (the electron transport chain and ATP synthase)', ['The Krebs cycle', 'Glycolysis', 'Pyruvate oxidation']],
      ['Which stage needs no oxygen and happens in the cytoplasm?', 'Glycolysis', ['The Krebs cycle', 'Pyruvate oxidation', 'Oxidative phosphorylation']],
      ['How many ATP does the Krebs cycle make per glucose?', '2', ['About 32', '36', '0']],
      ['Where are the carbon atoms of glucose released as CO₂?', 'In pyruvate oxidation and the Krebs cycle', ['In glycolysis', 'In the electron transport chain', 'In ATP synthase']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Most ATP comes after the Krebs cycle, from the electrons it loads onto carriers.', steps: ['Glycolysis (cytoplasm): net 2 ATP, 2 NADH. Pyruvate oxidation: 2 CO₂, 2 NADH. Krebs: 4 CO₂, 2 ATP, 6 NADH, 2 FADH₂ per glucose.', 'Most ATP (about 26–28) is made by oxidative phosphorylation, powered by NADH and FADH₂.', 'Answer: ' + q[1]] }; }
    var sh = R.int(0, 1);
    if (sh === 0) { var n3 = R.int(2, 8);
      return { q: 'A cell breaks down ' + n3 + ' glucose completely. How many NADH and how many CO₂ are made in glycolysis, pyruvate oxidation and the Krebs cycle together?', a: { t: 'multi', parts: [{ label: 'NADH', a: int(10 * n3) }, { label: 'CO₂', a: int(6 * n3) }] },
        hint: 'Per glucose: NADH 2 + 2 + 6; CO₂ 0 + 2 + 4.', steps: ['NADH per glucose: 2 + 2 + 6 = 10, so ' + 10 * n3 + '.', 'CO₂ per glucose: 0 + 2 + 4 = 6 (all six carbons), so ' + 6 * n3 + '.'] }; }
    var pyr = R.int(2, 10);
    return { q: 'Isolated mitochondria are given ' + pyr + ' pyruvate molecules (and plenty of oxygen). How many CO₂, NADH and FADH₂ do pyruvate oxidation and the Krebs cycle make from them?',
      a: { t: 'multi', parts: [{ label: 'CO₂', a: int(3 * pyr) }, { label: 'NADH', a: int(4 * pyr) }, { label: 'FADH₂', a: int(pyr) }] }, hint: 'Per pyruvate: oxidation gives 1 CO₂ and 1 NADH; one Krebs turn gives 2 CO₂, 3 NADH, 1 FADH₂, 1 ATP.',
      steps: ['Per pyruvate: 1 + 2 = 3 CO₂, 1 + 3 = 4 NADH, 1 FADH₂.', 'For ' + pyr + ': ' + 3 * pyr + ' CO₂, ' + 4 * pyr + ' NADH, ' + pyr + ' FADH₂.', 'Carbon check: ' + pyr + ' pyruvate × 3 carbons = ' + 3 * pyr + ' CO₂.'] };
  });

  G('apbio.oxidative-phosphorylation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick([
      ['What is the final electron acceptor of the mitochondrial electron transport chain?', 'Oxygen, which forms water', ['NAD⁺', 'Carbon dioxide', 'ATP']],
      ['Into which space do complexes I, III and IV pump H⁺?', 'The intermembrane space', ['The matrix', 'The cytoplasm', 'The thylakoid space']],
      ['What makes ATP synthase turn?', 'H⁺ flowing down its gradient, from the intermembrane space into the matrix', ['Electrons flowing through it', 'Oxygen binding to it', 'Glucose entering the mitochondrion']],
      ['Which complex receives electrons from FADH₂?', 'Complex II', ['Complex I', 'Complex IV', 'ATP synthase']]]);
      return { q: q[0], viz: { name: 'apbio-chain', opts: { mode: 'mito', quiet: true, interactive: false } }, a: mc(R, q[1], q[2]), hint: 'Electrons ride the chain to O₂; protons are pumped out and flow back through ATP synthase.',
        steps: ['NADH → complex I; FADH₂ → complex II; electrons → Q → III → cytochrome c → IV → O₂ (water).', 'Complexes I, III and IV pump H⁺ into the intermembrane space; H⁺ returns through ATP synthase, making ATP.', 'Answer: ' + q[1]] }; }
    if (L === 2) { var q2 = R.pick([
      ['What passes through ATP synthase as it makes ATP?', 'Protons (H⁺)', ['Electrons', 'Oxygen', 'NADH']],
      ['Which statement is correct?', 'Electrons move along the chain to oxygen; protons flow through ATP synthase.', ['Electrons flow through ATP synthase to make ATP.', 'Protons are the final electron acceptor.', 'ATP synthase pumps electrons into the matrix.']],
      ['A chemical lets H⁺ leak across the inner membrane while electrons keep flowing to O₂. What happens?', 'Little ATP is made, and the energy is released as heat.', ['ATP production doubles.', 'Electron flow stops at once.', 'More NADH is made.']]]);
      return { q: q2[0], a: mc(R, q2[1], q2[2]), hint: 'Keep two paths apart: electrons down the chain, protons back through ATP synthase.', steps: ['Electrons from NADH and FADH₂ travel along the chain and end on oxygen.', 'The energy pumps H⁺ out; ATP synthase is driven only by H⁺ flowing back in.', 'Answer: ' + q2[1]] }; }
    if (R.coin()) { var nN = R.int(4, 30), nF = R.int(1, 8), atp = 2.5 * nN + 1.5 * nF;
      return { q: 'Using about 2.5 ATP per NADH and 1.5 ATP per FADH₂, estimate the ATP made by oxidative phosphorylation from ' + nN + ' NADH and ' + nF + ' FADH₂.', a: num(atp, 0.02), unit: 'ATP',
        hint: 'Multiply each by its yield, then add.', steps: ['$' + nN + ' \\times 2.5 = ' + f(2.5 * nN, 1) + '$', '$' + nF + ' \\times 1.5 = ' + f(1.5 * nF, 1) + '$', 'Total ≈ ' + f(atp, 1) + ' ATP. FADH₂ yields less because complex II does not pump H⁺.'] }; }
    var sc = R.pick([{ s: 'Cyanide blocks complex IV.', t: ['Electron flow along the chain stops.', 'O₂ is no longer used.', 'ATP made by the chain stops.'], f: ['More H⁺ is pumped.', 'ATP synthase runs faster.'] },
      { s: 'A drug blocks ATP synthase, but the membrane stays sealed.', t: ['ATP synthesis by chemiosmosis stops.', 'The H⁺ gradient builds up until pumping slows.'], f: ['Electrons now pass through ATP synthase.', 'The cell makes more ATP by oxidative phosphorylation.'] },
      { s: 'A cell runs out of oxygen.', t: ['The electron transport chain stops.', 'NADH builds up, so the Krebs cycle slows.', 'Glycolysis can continue if fermentation recycles NAD⁺.'], f: ['The Krebs cycle speeds up.', 'ATP synthase keeps making ATP at the normal rate.'] }]);
    return { q: sc.s + ' Choose all the predictions that are correct.', a: mcAll(R, sc.t.map(function (x) { return [x, true]; }).concat(sc.f.map(function (x) { return [x, false]; }))),
      hint: 'Electron flow, H⁺ pumping and ATP synthesis are linked: stop one link and follow the effects.', steps: ['Electrons flow to O₂ and drive H⁺ pumping; the H⁺ gradient drives ATP synthase.', sc.s + ' So: ' + sc.t.join(' ')] };
  });

  /* =================== Unit 5: Cell Communication and Cell Cycle =================== */
  var SIG = [['Heart muscle cells pass ions to their neighbors through tiny channels that join them, so they contract together.', 0], ['Plant cells pass small molecules to neighbors through plasmodesmata.', 0], ['An immune cell checks the surface proteins of another cell by touching it.', 0],
    ['Cells in a wound release a growth factor that makes nearby cells divide.', 1], ['A motor neuron releases acetylcholine onto a muscle cell across a synapse.', 1], ['A neuron in the brain releases a neurotransmitter onto the next neuron.', 1],
    ['The pancreas releases insulin, which travels in the blood to muscle and liver cells.', 2], ['The adrenal glands release epinephrine into the blood, and the heart beats faster.', 2], ['A ripening apple gives off ethylene gas that ripens fruit in the same bag.', 2], ['The kidneys respond to ADH released from the brain into the blood.', 2]];
  var SIGK = ['Direct contact', 'Local signaling (paracrine or synaptic)', 'Long-distance signaling (hormones)'];
  G('apbio.signaling-types', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var s = R.pick(SIG); return { q: 'Which kind of cell signaling is this? ' + s[0], a: { t: 'mc', choices: SIGK, v: s[1], keep: true }, hint: 'How does the signal travel: through a junction or by touch, across a short gap, or in the blood?',
      steps: [s[1] === 0 ? 'The cells touch or are joined, so the signal passes directly.' : s[1] === 1 ? 'The signal crosses a short distance to nearby cells or across a synapse.' : 'The signal travels far, carried by the blood (or the air, for a plant hormone).', 'So it is <b>' + SIGK[s[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var q = R.pick([
      ['A motor neuron signals a muscle cell. Which description is best?', 'A local chemical signal across a synapse', ['A hormone carried in the blood', 'Electricity flowing directly into the muscle through the blood', 'Direct contact through a gap junction only']],
      ['Which statement about cell signaling is correct?', 'Most cells receive many local signals from neighbors, not only hormones.', ['Only hormones count as cell signals.', 'Cells signal only when they touch.', 'Signals reach every cell, so every cell responds.']],
      ['A hormone reaches every tissue through the blood, but only some cells respond. Why?', 'Only cells with a receptor for that hormone respond.', ['The hormone is used up before it reaches most cells.', 'The other cells are not alive.', 'Hormones work only near the gland that makes them.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Signals can be local or distant, and a cell needs the right receptor.', steps: ['Cells signal by direct contact, locally (paracrine, synaptic) and over long distances (hormones).', 'A cell responds only if it has a matching receptor.', 'Answer: ' + q[1]] }; }
    var pick = R.sample(SIG, 4);
    return { q: 'Which of these are local or direct signals rather than long-distance (hormone) signals? Choose all that apply.', a: mcAll(R, pick.map(function (s) { return [s[0], s[1] < 2]; }).concat(pick.every(function (s) { return s[1] < 2; }) ? [[SIG[6][0], false]] : pick.every(function (s) { return s[1] === 2; }) ? [[SIG[3][0], true]] : [])),
      hint: 'Long-distance signals travel in the blood (or the air, in plants).', steps: pick.map(function (s) { return s[0] + ' → ' + SIGK[s[1]].toLowerCase() + '.'; }) };
  });

  var LIGANDS = [['cortisol (a steroid hormone)', 0], ['thyroid hormone (small and nonpolar)', 0], ['insulin (a protein)', 1], ['epinephrine (a small, polar molecule)', 1], ['a growth factor (a protein)', 1], ['acetylcholine (a polar neurotransmitter)', 1], ['vitamin D hormone (a steroid-like lipid)', 0]];
  G('apbio.signal-transduction', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var sh = R.int(0, 1);
      if (sh === 0) { var lg = R.pick(LIGANDS); return { q: 'Where is the receptor for ' + lg[0] + '?', a: { t: 'mc', choices: ['Inside the cell (in the cytoplasm or nucleus)', 'In the plasma membrane'], v: lg[1], keep: true }, hint: 'Can the molecule cross the lipid bilayer?',
        steps: [lg[1] === 0 ? 'It is small and nonpolar, so it diffuses through the bilayer and binds a receptor inside.' : 'It is large or polar, so it cannot cross the bilayer; its receptor is on the surface.', 'Answer: <b>' + (lg[1] === 0 ? 'inside the cell' : 'in the plasma membrane') + '</b>.'] }; }
      var st = R.pick([['The ligand binds the receptor.', 0], ['A protein kinase adds a phosphate to the next kinase in a chain.', 1], ['cAMP spreads through the cytoplasm and activates protein kinase A.', 1], ['Glycogen is broken down and glucose leaves the cell.', 2], ['A transcription factor switches on a set of genes.', 2], ['A G protein swaps GDP for GTP and becomes active.', 1], ['A receptor changes shape when its hormone attaches.', 0]]);
      return { q: 'Which stage of cell signaling is this? ' + st[0], a: { t: 'mc', choices: ['Reception', 'Transduction', 'Response'], v: st[1], keep: true }, hint: 'Reception: binding. Transduction: relaying the message. Response: what the cell does.',
        steps: ['Reception is the ligand binding its receptor; transduction is the relay (kinases, G proteins, second messengers); the response is the change in the cell.', 'So this is <b>' + ['reception', 'transduction', 'response'][st[1]] + '</b>.'] }; }
    if (L === 2) { var q = R.pick([
      ['Epinephrine binds a receptor on a liver cell, and the liver cell releases glucose. Where is the epinephrine during transduction?', 'Still outside the cell, bound to the receptor; the message travels inside as shape changes and second messengers', ['Inside the nucleus, switching on genes', 'In the cytoplasm, breaking down glycogen itself', 'Moving from kinase to kinase inside the cell']],
      ['What is a second messenger?', 'A small molecule, such as cAMP or Ca²⁺, that spreads the signal inside the cell', ['The second hormone to reach a cell', 'The receptor protein', 'The gene that is turned on']],
      ['What does a protein kinase do in a signaling cascade?', 'It adds a phosphate group to another protein, often switching it on', ['It removes phosphate groups to switch proteins off', 'It carries the ligand into the nucleus', 'It makes ATP for the cell']],
      ['How is a signaling cascade switched off after the signal leaves?', 'Phosphatases remove phosphates and enzymes break down second messengers such as cAMP', ['The ligand is digested inside the nucleus', 'The cell dies', 'It cannot be switched off']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'For a surface receptor, the ligand never enters the cell.', steps: ['A ligand that binds a surface receptor stays outside.', 'Inside, the message is passed by shape changes: G proteins, kinases (which add phosphates) and second messengers like cAMP; phosphatases and other enzymes switch it off.', 'Answer: ' + q[1]] }; }
    var sc = R.pick([{ s: 'A drug blocks the enzyme that breaks down cAMP in liver cells. Then epinephrine arrives.', t: ['cAMP stays high longer.', 'Protein kinase A stays active longer.', 'More glucose is released than usual.'], f: ['The cell cannot respond at all.', 'Epinephrine enters the cell.'] },
      { s: 'A mutation removes the epinephrine receptor from liver cells.', t: ['Epinephrine in the blood no longer makes these cells release glucose.', 'Signals that use other receptors can still work.'], f: ['cAMP rises when epinephrine is present.', 'Epinephrine works by entering the cell instead.'] },
      { s: 'A drug blocks adenylyl cyclase in liver cells.', t: ['Epinephrine still binds its receptor.', 'cAMP is not made, so the cascade stops there.', 'Glycogen is not broken down in response.'], f: ['The receptor cannot bind epinephrine.', 'More glucose is released.'] }]);
    return { q: sc.s + ' Choose all the predictions that are correct.', viz: { name: 'bi-feedback', opts: { steps: ['Epinephrine binds its receptor', 'G protein activated', 'Adenylyl cyclase makes cAMP', 'cAMP activates protein kinase A', 'Kinase cascade', 'Glycogen → glucose released'], title: 'The pathway', interactive: false } },
      a: mcAll(R, sc.t.map(function (x) { return [x, true]; }).concat(sc.f.map(function (x) { return [x, false]; }))), hint: 'Find the blocked step in the chain; everything before it still happens, everything after it does not (or lasts longer, if an off switch is blocked).',
      steps: ['The chain: receptor → G protein → adenylyl cyclase → cAMP → kinase A → cascade → glycogen breakdown.', sc.s + ' So: ' + sc.t.join(' ')] };
  });

  G('apbio.signal-amplification', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var g = R.int(2, 10), n = R.int(2, 4), tot = M.pow(g, n);
      return { q: 'In a cascade, each active molecule activates ' + g + ' molecules of the next kind. How many molecules are active at the end of ' + n + ' steps, starting from one signal molecule?', a: int(tot),
        viz: { name: 'apbio-cascade', opts: { gain: g, steps: n, quiet: true, interactive: false } }, hint: 'Multiply the gain once for each step.', steps: ['Each step multiplies by ' + g + '.', '$' + g + '^{' + n + '} = ' + f(tot, 0) + '$.'] }; }
    if (L === 2) { var gs = [R.pick([5, 10, 20]), R.pick([10, 20, 50, 100]), R.pick([2, 5, 10, 50])], p = gs[0] * gs[1] * gs[2], s = gs[0] + gs[1] + gs[2];
      return { q: 'One signal molecule activates ' + gs[0] + ' G proteins. Each G protein leads to ' + gs[1] + ' cAMP molecules, and each cAMP (through kinase A) leads to ' + gs[2] + ' active enzymes. How many active enzymes per signal molecule?', a: int(p),
        hint: 'Each molecule in a row acts on its own share of the next row.', steps: ['Multiply the gains: $' + gs.join(' \\times ') + ' = ' + f(p, 0) + '$.', 'Adding them (' + gs.join(' + ') + ' = ' + s + ') would count only one branch at each step.'] }; }
    var sc = R.pick([{ s: 'A mutation keeps a relay protein (Ras) always in its active form.', a: 'The response is on even with no signal: the cell keeps receiving a "divide" message.', w: ['The response is blocked completely.', 'The cell responds only when the signal is twice as strong.', 'Nothing changes, because the receptor is normal.'] },
      { s: 'A mutation makes a receptor unable to change shape when its ligand binds.', a: 'No response, however much signal is present.', w: ['The response is on all the time.', 'The response is stronger than normal.', 'The signal enters the cell instead.'] },
      { s: 'A mutation disables the phosphatase that normally switches off one kinase in the cascade.', a: 'Once started, the response lasts much longer than normal.', w: ['No response at all.', 'The receptor stops binding its ligand.', 'The response becomes smaller.'] },
      { s: 'A cell makes half as much of one relay enzyme, but each still activates 10 of the next kind.', a: 'The final response is about half as strong for the same signal.', w: ['The response stays exactly the same.', 'No response at all.', 'The response doubles.'] }]);
    return { q: sc.s + ' What is the most likely effect on the pathway\'s response?', a: mc(R, sc.a, sc.w), hint: 'Is the change an "always on", a "never on", or a weaker or longer relay?',
      steps: ['Signals pass through receptor → relays → response, and off switches end them.', sc.s, 'So: ' + sc.a] };
  });

  var LOOPS = [['Blood glucose rises after a meal; insulin is released and glucose falls back.', 0], ['Body temperature falls on a cold day; shivering warms the body.', 0], ['A damaged vessel attracts platelets, which release chemicals that attract more platelets until a clot forms.', 1],
    ['One ripening banana releases ethylene, which ripens nearby bananas, which release more ethylene.', 1], ['Blood becomes too concentrated; ADH makes the kidneys keep water, diluting it again.', 0], ['Tryptophan builds up in a bacterium and shuts off the genes that make tryptophan.', 0], ['The end product of a pathway inhibits the first enzyme of that pathway.', 0]];
  G('apbio.feedback-ap', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var l = R.pick(LOOPS); return { q: 'Is this negative or positive feedback? ' + l[0], a: { t: 'mc', choices: ['Negative feedback', 'Positive feedback'], v: l[1], keep: true }, hint: 'Does the response oppose the change or add to it?',
      steps: [l[1] === 0 ? 'The response reverses the change, bringing the variable back.' : 'The response pushes the change further in the same direction.', 'So it is <b>' + (l[1] === 0 ? 'negative' : 'positive') + ' feedback</b>.'] }; }
    if (L === 2) { var meal = R.coin(), t = [0, 30, 60, 90, 120], g = meal ? [90, 140, 120, 100, 90] : [90, 95, 110, 140, 200], ins = meal ? [20, 70, 85, 50, 25] : [20, 40, 70, 110, 170];
      var label = meal ? 'Blood glucose after a meal' : 'Ethylene released by a box of ripening fruit';
      if (!meal) return { q: 'Ethylene released by a box of fruit (relative units) at 0, 1, 2, 3 and 4 days: ' + g.map(function (x) { return x - 85; }).join(', ') + '. The fruit ripen faster and faster. What kind of feedback does this show?',
        viz: { name: 'bi-chart', opts: { kind: 'line', x: [0, 1, 2, 3, 4], series: [{ name: 'Ethylene', values: g.map(function (x) { return x - 85; }) }], xlabel: 'Day', ylabel: 'Ethylene', quiet: true, interactive: false } },
        a: mc(R, 'Positive feedback: ripening fruit release ethylene, which speeds more ripening.', ['Negative feedback: ethylene keeps ripening at a set point.', 'No feedback: the rise is random.']), hint: 'Does the response feed the change?', steps: ['Ethylene makes fruit ripen; ripening fruit release more ethylene.', 'The response adds to the change, so it speeds up until the fruit are ripe: <b>positive feedback</b>.'] };
      return { q: 'Blood glucose (mg/dL) at 0, 30, 60, 90 and 120 minutes after a meal: ' + g.join(', ') + '. Insulin (relative) at the same times: ' + ins.join(', ') + '. A student says the steep rise in insulin shows positive feedback. Which is the best reply?',
        viz: { name: 'bi-chart', opts: { kind: 'line', x: t, series: [{ name: 'Glucose', values: g }, { name: 'Insulin', values: ins }], xlabel: 'Minutes', ylabel: 'Level', quiet: true, interactive: false } },
        a: mc(R, 'It is negative feedback: insulin rose in response to high glucose and brought glucose back down.', ['It is positive feedback, because insulin rose quickly.', 'It is positive feedback, because glucose rose after the meal.', 'It is not feedback at all.']), hint: 'Look at the controlled variable, glucose: was its change reversed?',
        steps: ['Glucose rose to ' + M.max.apply(null, g) + ', then returned to ' + g[4] + '.', 'Insulin rose because glucose was high, and its effect lowered glucose.', 'The response opposed the change: <b>negative feedback</b>. A rising curve alone does not mean positive feedback.'] }; }
    var sc = R.pick([{ s: 'A person\'s pancreas cannot make insulin.', a: 'Blood glucose rises after meals and stays high.', w: ['Blood glucose falls after meals.', 'Blood glucose stays exactly steady.', 'Glucagon lowers the glucose instead.'] },
      { s: 'A tomato plant has a mutation that stops its fruit from responding to ethylene.', a: 'Its fruit ripen slowly or not fully, and ripening does not spread to nearby fruit.', w: ['Its fruit ripen faster than normal.', 'It makes no fruit at all.', 'Nearby fruit ripen faster.'] },
      { s: 'A bacterium has a mutant repressor that cannot bind tryptophan.', a: 'It keeps making tryptophan even when tryptophan is plentiful.', w: ['It can never make tryptophan.', 'It makes tryptophan only when lactose is present.', 'It stops growing at once.'] },
      { s: 'The sweat glands of a person stop working on a hot day.', a: 'Body temperature rises, because one effector of the cooling response is missing.', w: ['Body temperature falls.', 'Body temperature stays the same, because shivering stops.', 'The person stops feeling hot.'] }]);
    return { q: sc.s + ' What is the most likely result?', a: mc(R, sc.a, sc.w), hint: 'Find the broken part of the loop: sensor, signal, or effector.', steps: ['A feedback loop needs a sensor, a signal and an effector.', sc.s + ' That breaks the loop.', 'So: ' + sc.a] };
  });

  G('apbio.cell-cycle-regulation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick([
      ['Which statement about cyclins and CDKs is correct?', 'Cyclin levels rise and fall; CDK levels stay fairly steady.', ['CDK levels rise and fall; cyclin levels stay steady.', 'Both stay steady all through the cycle.', 'Both are destroyed at the end of every phase.']],
      ['When is a CDK active?', 'When it is bound to its cyclin', ['Whenever it is present', 'Only when the cell is dead', 'When the cyclin has been destroyed']],
      ['What does p53 do when a cell\'s DNA is damaged?', 'It halts the cycle (at G₁) so the DNA can be repaired, or triggers apoptosis', ['It speeds up DNA replication', 'It copies the damaged DNA', 'It destroys all cyclins permanently']],
      ['At which checkpoint does a cell check that every chromosome is attached to the spindle?', 'The M checkpoint (during mitosis)', ['The G₁ checkpoint', 'The G₂ checkpoint', 'The S checkpoint']],
      ['What is apoptosis?', 'Programmed cell death', ['A kind of mitosis', 'A cyclin', 'A checkpoint protein that copies DNA']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Cyclin-dependent kinases depend on cyclins, whose levels change.', steps: ['CDKs are always present; they work only with their cyclin, whose level rises and falls.', 'Checkpoints: G₁ (conditions, DNA damage, p53), G₂ (DNA copied correctly), M (spindle attachment).', 'Answer: ' + q[1]] }; }
    if (L === 2) { var xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], per = R.pick([5, 6]), cyc = xs.map(function (x) { var ph = x % per; return ph === per - 1 ? 100 : M.round(10 + 80 * ph / (per - 1)); }), cdk = xs.map(function () { return 60; }), askCyc = R.coin();
      return { q: 'The graph shows the levels of two proteins through several cell cycles. Which line is most likely the ' + (askCyc ? 'mitotic cyclin' : 'CDK') + '?',
        viz: { name: 'bi-chart', opts: { kind: 'line', x: xs, series: [{ name: 'Protein A', values: cyc }, { name: 'Protein B', values: cdk }], xlabel: 'Time', ylabel: 'Level', quiet: true, interactive: false } },
        a: { t: 'mc', choices: ['Protein A (rises and drops each cycle)', 'Protein B (stays level)'], v: askCyc ? 0 : 1, keep: true }, hint: 'Which protein\'s amount changes through the cycle?',
        steps: ['Cyclins build up through interphase and are destroyed in mitosis: a sawtooth.', 'CDKs stay at a steady level; their activity, not their amount, changes.', 'So the ' + (askCyc ? 'cyclin is <b>protein A</b>' : 'CDK is <b>protein B</b>') + '.'] }; }
    var sc = R.pick([{ s: 'A cell has a mutation that destroys p53, and its DNA is damaged.', t: ['The cell may keep dividing with damaged DNA.', 'Mutations are likely to build up in its descendants.', 'The G₁ stop for repair does not happen.'], f: ['The cell repairs its DNA faster.', 'The cell stops dividing permanently.'] },
      { s: 'A drug prevents the destruction of mitotic cyclin.', t: ['MPF stays active.', 'The cell cannot finish mitosis normally.'], f: ['The cell skips mitosis.', 'CDK levels fall.'] },
      { s: 'A mutation makes a cell\'s cyclin-CDK complex for G₁ always active.', t: ['The cell passes the G₁ checkpoint even without the right signals.', 'The cell divides more often than it should.'], f: ['The cell stops in G₁ forever.', 'The cell stops making DNA.'] }]);
    return { q: sc.s + ' Choose all the predictions that are correct.', a: mcAll(R, sc.t.map(function (x) { return [x, true]; }).concat(sc.f.map(function (x) { return [x, false]; }))),
      hint: 'Cyclin-CDK complexes are accelerators; p53 is a brake.', steps: ['Cyclin-CDKs push the cell past checkpoints; destroying the cyclin ends each push.', 'p53 halts the cycle when DNA is damaged and can trigger apoptosis.', sc.s + ' So: ' + sc.t.join(' ')] };
  });

  /* =================== Unit 6: Heredity =================== */
  var TRAITS2 = [{ org: 'fruit fly', g: [['gray body', 'black body'], ['long wings', 'short wings']] }, { org: 'corn plant', g: [['purple kernels', 'yellow kernels'], ['smooth kernels', 'wrinkled kernels']] },
    { org: 'tomato plant', g: [['tall stem', 'dwarf stem'], ['round fruit', 'pear-shaped fruit']] }, { org: 'pea plant', g: [['purple flowers', 'white flowers'], ['long pollen grains', 'round pollen grains']] }];
  // a dihybrid test cross: cis (AB/ab) or trans (Ab/aB) parent; returns classes with counts
  function testCross(R, rf, total, cis) {
    var rec = M.round(total * rf), par = total - rec, r1 = M.round(rec / 2 + R.int(-2, 2)), p1 = M.round(par / 2 + R.int(-6, 6));
    var P = cis ? [[0, 0], [1, 1]] : [[0, 1], [1, 0]], Q = cis ? [[0, 1], [1, 0]] : [[0, 0], [1, 1]];
    return [{ c: P[0], n: p1, rec: false }, { c: P[1], n: par - p1, rec: false }, { c: Q[0], n: r1, rec: true }, { c: Q[1], n: rec - r1, rec: true }];
  }
  function cname(t, c) { return t.g[0][c[0]] + ', ' + t.g[1][c[1]]; }
  G('apbio.linked-genes', function (R, ctx) {
    var L = lv(ctx), t = R.pick(TRAITS2), cis = R.coin(), tot = R.pick([400, 500, 800, 1000]), rf = R.pick([0.06, 0.1, 0.14, 0.18, 0.22, 0.3]), cl = R.shuffle(testCross(R, rf, tot, cis));
    var parentTxt = 'A ' + t.org + ' that received the alleles for ' + (cis ? t.g[0][0] + ' and ' + t.g[1][0] + ' on one chromosome and the alleles for ' + t.g[0][1] + ' and ' + t.g[1][1] + ' on the other' : t.g[0][0] + ' and ' + t.g[1][1] + ' on one chromosome and the alleles for ' + t.g[0][1] + ' and ' + t.g[1][0] + ' on the other') + ' (dominant traits listed first in each pair: ' + t.g[0][0] + ', ' + t.g[1][0] + ')';
    var data = cl.map(function (k) { return cname(t, k.c) + ': ' + k.n; }).join('; ');
    if (L === 1) { function pc(c) { return '(' + cname(t, c) + ')'; } var parentals = cl.filter(function (k) { return !k.rec; }).map(function (k) { return pc(k.c); });
      return { q: parentTxt + ' is test-crossed to a fully recessive ' + t.org + '. If the genes are linked, which two offspring classes should be the most common?', a: mc(R, parentals.join(' and '), [cl.filter(function (k) { return k.rec; }).map(function (k) { return pc(k.c); }).join(' and '), pc([0, 0]) + ' and ' + pc([0, 1]), 'All four classes equally']),
        hint: 'Parental types keep the combinations that sat together on the parent\'s chromosomes.', steps: ['The parent\'s two chromosomes carry: ' + (cis ? cname(t, [0, 0]) + ' | ' + cname(t, [1, 1]) : cname(t, [0, 1]) + ' | ' + cname(t, [1, 0])) + '.', 'Without a crossover between the genes, gametes carry those same combinations.', 'So the most common classes are <b>' + parentals.join(' and ') + '</b>.'] }; }
    if (L === 2) { var link = R.chance(0.7), cl2 = link ? cl : [0, 1, 2, 3].map(function (i) { return { c: [[0, 0], [1, 1], [0, 1], [1, 0]][i], n: M.round(tot / 4) + R.int(-12, 12) }; });
      return { q: 'A dihybrid ' + t.org + ' is test-crossed. Offspring: ' + cl2.map(function (k) { return cname(t, k.c) + ': ' + k.n; }).join('; ') + '. What do the data suggest?',
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: cl2.map(function (k, i) { return 'Class ' + (i + 1); }), series: [{ name: 'Offspring', values: cl2.map(function (k) { return k.n; }) }], ylabel: 'Offspring', ymin: 0, quiet: true, interactive: false } },
        a: mc(R, link ? 'The genes are linked: two classes are far more common than 1 : 1 : 1 : 1 predicts.' : 'The genes assort independently: the four classes are close to 1 : 1 : 1 : 1.', [link ? 'The genes assort independently: the four classes are close to 1 : 1 : 1 : 1.' : 'The genes are linked: two classes are far more common than 1 : 1 : 1 : 1 predicts.', 'The genes are on the X chromosome.', 'Crossing over did not happen at all.']),
        hint: 'Unlinked genes give about ' + tot / 4 + ' in each class here.', steps: ['If unlinked, expect about ' + tot / 4 + ' per class (1 : 1 : 1 : 1).', link ? 'Two classes are much larger: the parental types. The genes are <b>linked</b>, and the small classes are recombinants.' : 'The classes are all close to ' + tot / 4 + ': the genes <b>assort independently</b>.'] }; }
    var recN = cl.filter(function (k) { return k.rec; }).reduce(function (s, k) { return s + k.n; }, 0), totN = cl.reduce(function (s, k) { return s + k.n; }, 0);
    return { q: parentTxt + ' is test-crossed to a fully recessive ' + t.org + '. Offspring: ' + data + '. What percent of the offspring are recombinant?', a: Object.assign(num(100 * recN / totN, 0.01), { pct: true }),
      hint: 'Recombinants are the two new combinations, not the two on the parent\'s chromosomes.', steps: ['Parental combinations: ' + (cis ? cname(t, [0, 0]) + ' and ' + cname(t, [1, 1]) : cname(t, [0, 1]) + ' and ' + cname(t, [1, 0])) + '.', 'Recombinants: ' + cl.filter(function (k) { return k.rec; }).map(function (k) { return k.n; }).join(' + ') + ' = ' + recN + ' of ' + totN + '.', '$' + recN + '/' + totN + ' = ' + f(100 * recN / totN, 1) + '\\%$; far below 50%, so the genes are linked.'] };
  });

  G('apbio.gene-maps', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var tot = R.pick([200, 400, 500, 800, 1000, 1200]), rf = R.pick([0.04, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.35]), rec = M.round(tot * rf);
      return { q: 'In a test cross, ' + rec + ' of ' + f(tot, 0) + ' offspring are recombinant for genes A and B. How many map units apart are the genes?', a: num(100 * rec / tot, 0.01), unit: 'map units',
        hint: 'Recombination frequency as a percent = map units.', steps: ['$' + rec + '/' + f(tot, 0) + ' = ' + f(rec / tot, 4) + '$', 'As a percent: ' + f(100 * rec / tot, 2) + '%, so <b>' + f(100 * rec / tot, 2) + ' map units</b>.'] }; }
    if (L === 2) { var tot2 = R.pick([400, 500, 1000]), pr = R.int(M.round(tot2 * 0.35), M.round(tot2 * 0.45)), pr2 = R.int(M.round(tot2 * 0.33), M.round(tot2 * 0.45)), rc = R.int(M.round(tot2 * 0.03), M.round(tot2 * 0.08)), rc2 = tot2 - pr - pr2 - rc;
      if (rc2 < 1) { rc2 = rc; pr2 = tot2 - pr - 2 * rc; }
      var right = 100 * (rc + rc2) / tot2, wrong = 100 * (pr + pr2) / tot2;
      return { q: 'A test cross gives four classes: ' + pr + ', ' + pr2 + ', ' + rc + ' and ' + rc2 + ' (' + tot2 + ' total). A student reports a recombination frequency of ' + f(wrong, 1) + '%. What is the correct frequency?', a: Object.assign(num(right, 0.01), { pct: true }),
        hint: 'No test cross can show more than 50% recombinants. Which classes are the recombinants?', steps: ['A frequency of ' + f(wrong, 1) + '% is above 50%, which is impossible: the student used the two large (parental) classes.', 'Recombinants are the two small classes: ' + rc + ' + ' + rc2 + ' = ' + (rc + rc2) + '.', '$' + (rc + rc2) + '/' + tot2 + ' = ' + f(right, 1) + '\\%$.'] }; }
    var names = R.pick([['A', 'B', 'C'], ['D', 'E', 'F'], ['P', 'Q', 'R'], ['b', 'vg', 'cn']]), d1 = R.int(3, 18), d2 = R.int(3, 18), ord = R.shuffle([0, 1, 2]), g = ord.map(function (i) { return names[i]; });
    // g[0] — d1 — g[1] — d2 — g[2]
    var pairs = [[g[0], g[1], d1], [g[1], g[2], d2], [g[0], g[2], d1 + d2]], sh = R.coin();
    var txt = R.shuffle(pairs).map(function (p) { return p[0] + '–' + p[1] + ': ' + p[2] + '%'; }).join(', ');
    if (sh) { var right2 = g.join(' – '), all = [[g[1], g[0], g[2]], [g[0], g[2], g[1]]].map(function (x) { return x.join(' – '); });
      return { q: 'Recombination frequencies between three linked genes: ' + txt + '. Which gene order is correct?', a: mc(R, right2, all), hint: 'The largest distance spans the other two.',
        viz: { name: 'apbio-genemap', opts: { genes: [{ name: '?', pos: 0 }, { name: '? ', pos: d1 }, { name: '?  ', pos: d1 + d2 }], quiet: true, interactive: false } },
        steps: ['The largest frequency is ' + g[0] + '–' + g[2] + ' (' + (d1 + d2) + '%).', 'And ' + d1 + ' + ' + d2 + ' = ' + (d1 + d2) + ', so ' + g[1] + ' lies between them.', 'Order: <b>' + right2 + '</b> (or the same read backward).'] }; }
    return { q: 'Genes ' + g[0] + ', ' + g[1] + ' and ' + g[2] + ' lie in that order on a chromosome. ' + g[0] + '–' + g[1] + ' recombination is ' + d1 + '% and ' + g[1] + '–' + g[2] + ' is ' + d2 + '%. Estimate the map distance from ' + g[0] + ' to ' + g[2] + '.', a: num(d1 + d2, 0.001), unit: 'map units',
      viz: { name: 'apbio-genemap', opts: { genes: [{ name: g[0], pos: 0 }, { name: g[1], pos: d1 }, { name: g[2], pos: d1 + d2 }], known: [[g[0], g[1]], [g[1], g[2]]], ask: [g[0], g[2]], interactive: false } },
      hint: 'Map distances along a line add.', steps: ['On the map: ' + g[0] + ' —' + d1 + '— ' + g[1] + ' —' + d2 + '— ' + g[2] + '.', 'Distance ' + g[0] + ' to ' + g[2] + ' = ' + d1 + ' + ' + d2 + ' = <b>' + (d1 + d2) + ' map units</b>. (A direct cross may show a little less, because double crossovers hide some recombinants.)'] };
  });

  var ORGS = [['fruit fly', 8], ['pea plant', 14], ['corn plant', 20], ['tomato plant', 24], ['house mouse', 40], ['dog', 78], ['onion', 16], ['rice plant', 24], ['cat', 38]];
  G('apbio.nondisjunction', function (R, ctx) {
    var L = lv(ctx), o = R.pick(ORGS), n = o[1] / 2;
    if (L === 1) { var when = R.pick(['I', 'II']), extra = R.coin();
      return { q: aN(o[0]) + ' has 2n = ' + o[1] + '. One chromosome pair undergoes nondisjunction in meiosis ' + when + '. How many chromosomes are in a gamete that ' + (extra ? 'received the extra chromosome' : 'is missing that chromosome') + '?', a: int(extra ? n + 1 : n - 1),
        hint: 'A normal gamete has n chromosomes.', steps: ['n = ' + o[1] + '/2 = ' + n + '.', extra ? 'With an extra chromosome: n + 1 = ' + (n + 1) + '.' : 'Missing one: n − 1 = ' + (n - 1) + '.'] }; }
    if (L === 2) { var w = R.pick(['I', 'II']), ask = R.pick(['abnormal', 'normal']);
      if (R.chance(0.6)) { var v = w === 'I' ? (ask === 'abnormal' ? 4 : 0) : 2;
        return { q: 'Nondisjunction of one chromosome pair happens in meiosis ' + w + ' (the other division is normal). Of the four cells produced, how many are ' + ask + '?', a: int(v),
          viz: { name: 'apbio-nondisjunction', opts: { when: w, quiet: true, interactive: false } }, hint: 'Draw the tree 1 → 2 → 4 and mark where the error happens.',
          steps: [w === 'I' ? 'In meiosis I both homologs go to one cell, so both cells of meiosis I are wrong, and so are all four products.' : 'Meiosis I is normal. In one of the two cells, the sister chromatids stay together: that cell gives one n + 1 and one n − 1 cell; the other cell gives two normal cells.', 'Answer: <b>' + v + '</b>.'] }; }
      var counts = R.coin() ? [n + 1, n + 1, n - 1, n - 1] : [n, n, n + 1, n - 1], isI = counts[0] === n + 1;
      return { q: aN(o[0]) + ' (2n = ' + o[1] + ') makes four cells in one meiosis with ' + R.shuffle(counts).join(', ') + ' chromosomes. In which division did nondisjunction happen?', a: { t: 'mc', choices: ['Meiosis I', 'Meiosis II'], v: isI ? 0 : 1, keep: true },
        hint: 'n = ' + n + '. How many of the cells are normal?', steps: ['n = ' + n + '.', isI ? 'None of the four cells has ' + n + ': all are abnormal, the sign of a meiosis I error.' : 'Two cells have ' + n + ' (normal): only a meiosis II error leaves two normal cells.', 'So: <b>meiosis ' + (isI ? 'I' : 'II') + '</b>.'] }; }
    var plus = R.coin();
    return { q: aN(o[0]) + ' (2n = ' + o[1] + ') makes a gamete with ' + (plus ? n + 1 : n - 1) + ' chromosomes because of nondisjunction. It combines with a normal gamete. How many chromosomes does the new cell have, and what is this condition called?',
      a: { t: 'multi', parts: [{ label: 'chromosomes', a: int(plus ? 2 * n + 1 : 2 * n - 1) }, { label: 'condition', a: mc(R, plus ? 'trisomy (2n + 1)' : 'monosomy (2n − 1)', [plus ? 'monosomy (2n − 1)' : 'trisomy (2n + 1)', 'polyploidy (3n)']) }] },
      hint: 'Add the two gametes\' chromosome numbers.', steps: ['A normal gamete has n = ' + n + '.', (plus ? n + 1 : n - 1) + ' + ' + n + ' = ' + (plus ? 2 * n + 1 : 2 * n - 1) + '.', plus ? 'One chromosome is present three times: a <b>trisomy</b>.' : 'One chromosome is present only once: a <b>monosomy</b>.'] };
  });

  function pedMito(R, maternal) {
    // gen1 couple: affected one parent; gen2 children; for maternal: all children of affected mother affected
    var momAff = maternal, ppl = [{ id: 'a', sex: 'f', gen: 1, aff: momAff }, { id: 'b', sex: 'm', gen: 1, aff: !momAff }], kids = R.int(3, 4);
    var s0 = R.coin(); for (var i = 0; i < kids; i++) ppl.push({ id: 'k' + i, sex: (i % 2 === 0) === s0 ? 'f' : 'm', gen: 2, parents: ['a', 'b'], aff: momAff });
    return ppl;
  }
  G('apbio.non-nuclear-inheritance', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var mom = R.coin(), org = R.pick(['a family', 'a mouse colony', 'a line of fruit flies']);
      return { q: 'In ' + org + ', a trait is caused by a mutation in mitochondrial DNA. ' + (mom ? 'An affected mother and an unaffected father' : 'An affected father and an unaffected mother') + ' have several offspring. What is expected?', a: mc(R, mom ? 'All (or nearly all) of the offspring are affected.' : 'None of the offspring are affected.', [mom ? 'None of the offspring are affected.' : 'All of the offspring are affected.', 'About 3 in 4 are affected.', 'About half are affected, only the males.']),
        hint: 'From which parent do offspring get their mitochondria?', steps: ['Mitochondria (and their DNA) come from the mother\'s gamete.', mom ? 'An affected mother passes her mitochondria to all her offspring.' : 'An affected father does not pass on his mitochondria.', 'So: ' + (mom ? 'all affected.' : 'none affected.')] }; }
    if (L === 2) { var q = R.pick([
      ['Why do mitochondrial traits not show a 3 : 1 ratio?', 'Mitochondrial genes are not paired and sorted by meiosis; offspring get mitochondria from one parent, usually the mother.', ['Mitochondrial genes are always recessive.', 'Mitochondrial genes are on the X chromosome.', 'Mitochondria have no DNA.']],
      ['In many plants, how are chloroplast genes inherited?', 'Through the seed parent: the pollen gives few or no chloroplasts', ['Equally from both parents, like nuclear genes', 'Only through the pollen', 'They are not inherited; each plant makes new chloroplasts from nothing']],
      ['A plant with white-streaked leaves (faulty chloroplasts) provides the pollen for flowers on a green plant. What do the seedlings look like?', 'Green, like the seed parent', ['Streaked, like the pollen parent', 'Half green and half streaked, a 1 : 1 ratio', 'Three green to one streaked']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Organelles are in the cytoplasm, which comes from the mother\'s gamete or the seed parent.', steps: ['Organelle genes are inherited with the cytoplasm, from one parent.', 'They are not paired, so there is no dominance and no Mendelian ratio.', 'Answer: ' + q[1]] }; }
    var kind = R.pick(['mito', 'mito', 'paternal']), ppl = pedMito(R, kind === 'mito');
    if (kind === 'paternal') return { q: 'In this pedigree, an affected father and an unaffected mother have only unaffected children. Which statement is best?', viz: { name: 'bi-pedigree', opts: { people: ppl, carriers: false, interactive: false } },
      a: mc(R, 'Several patterns fit, including mitochondrial inheritance and a recessive nuclear allele; more generations are needed.', ['It must be a mitochondrial trait.', 'It must be a dominant nuclear allele.', 'It cannot be a mitochondrial trait.']), hint: 'Which patterns predict unaffected children of an affected father?',
      steps: ['Mitochondrial: an affected father passes it to none of his children, which fits.', 'A recessive nuclear allele, with a mother who carries none, also gives unaffected children.', 'A dominant nuclear allele would usually affect about half of them, so it is unlikely. More generations are needed to decide.'] };
    return { q: 'Which inheritance pattern fits this pedigree best?', viz: { name: 'bi-pedigree', opts: { people: ppl, carriers: false, interactive: false } },
      a: mc(R, 'Mitochondrial (maternal) inheritance', ['Autosomal recessive', 'X-linked recessive', 'Autosomal dominant with a 3 : 1 ratio']), hint: 'An affected mother: what happens to all her children?',
      steps: ['The affected mother has only affected children, sons and daughters alike.', 'An X-linked recessive trait would not affect the daughters of an unaffected father; autosomal patterns would usually leave some children unaffected.', 'Mitochondrial (maternal) inheritance fits best: the mitochondria pass from the mother to every child.'] };
  });

  var ENV = [
    { s: 'Cuttings of one bigleaf hydrangea are planted in two gardens. In one garden the flowers are blue; in the other, pink.', a: 'The soil pH differs: in acidic soil the plant takes up aluminum, which turns the flowers blue.', w: ['The two cuttings have different alleles for flower color.', 'Pink is dominant over blue.', 'The pink cutting has a mutation.'] },
    { s: 'A Himalayan rabbit has dark fur on its ears, nose, feet and tail, and white fur elsewhere.', a: 'Its pigment enzyme works only at cooler temperatures, and those parts of the body are cooler.', w: ['It has different genes in its ears than in its back.', 'Dark fur is dominant only on the ears.', 'The dark fur is a sign of disease.'] },
    { s: 'A water buttercup growing half under water has finely divided leaves below the surface and broad leaves above it.', a: 'Leaves with the same genes develop differently in water and in air.', w: ['Its underwater leaves have mutated.', 'It is two different species grown together.', 'Water changes the DNA of the leaves.'] },
    { s: 'Clones of one yarrow plant are grown at sea level and high in the mountains. The mountain clones are much shorter.', a: 'Growing conditions (temperature, season length) change height in plants with the same genotype.', w: ['The mountain clones lost genes for height.', 'Height is not inherited at all.', 'Shortness is dominant in the mountains.'] }];
  G('apbio.environment-phenotype', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var e = R.pick(ENV); return { q: e.s + ' What is the best explanation?', a: mc(R, e.a, e.w), hint: 'Same genotype, different conditions.', steps: ['The organisms (or body parts) share the same genotype.', 'Differences in conditions change how the genes are expressed.', 'So: ' + e.a] }; }
    if (L === 2) { var e2 = R.pick(ENV);
      return { q: e2.s + ' True or false: this difference shows that the genes for the trait have changed.', a: tf(false), hint: 'Could you reverse the difference by changing the conditions back?',
        steps: ['The genotype is the same; only the environment differs.', 'Change the conditions back and the phenotype follows: the change is in expression, not in the DNA.', 'So the statement is <b>false</b>.'] }; }
    var temps = [15, 20, 25, 30, 35], dark = temps.map(function (x) { return M.max(0, M.round(100 - (x - 12) * 4.3 + R.int(-3, 3))); }), askHi = R.coin();
    return { q: 'Himalayan rabbits of the same genotype were raised at different air temperatures. The share of the body with dark fur was: ' + temps.map(function (x, i) { return x + ' °C: ' + dark[i] + '%'; }).join(', ') + '. Choose all the conclusions that fit.',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: temps.map(function (x) { return x + ' °C'; }), series: [{ name: 'Dark fur (% of body)', values: dark }], ylabel: 'Dark fur (%)', ymin: 0, quiet: true, interactive: false } },
      a: mcAll(R, [['Colder conditions give more dark fur.', true], ['The same genotype gives different phenotypes at different temperatures.', true], ['The rabbits raised in the cold have different alleles.', false], ['Temperature changes the DNA sequence of the fur gene.', false], ['The pigment enzyme is more active in cooler skin.', true]]),
      hint: 'All the rabbits have the same genotype.', steps: ['Dark fur falls from ' + dark[0] + '% at 15 °C to ' + dark[4] + '% at 35 °C.', 'The genotype is the same in every group, so the environment (temperature) changes the phenotype.', 'The enzyme that makes pigment works only where the skin is cool.'] };
  });

  /* =================== Unit 7: Gene Expression and Regulation =================== */
  var REPL = [['helicase', 'Unwinds the double helix at the fork by breaking hydrogen bonds between bases'], ['primase', 'Makes a short RNA primer with a free 3′ end'], ['DNA polymerase III', 'Adds DNA nucleotides to the 3′ end of a primer, building 5′ → 3′'],
    ['DNA polymerase I', 'Removes RNA primers and replaces them with DNA'], ['DNA ligase', 'Seals the nicks between Okazaki fragments'], ['topoisomerase', 'Relieves the twisting strain ahead of the fork'], ['single-strand binding proteins', 'Hold the separated template strands apart']];
  G('apbio.replication-details', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var e = R.pick(REPL), wr = R.sample(REPL.filter(function (x) { return x !== e; }), 3).map(function (x) { return cap(x[0]); });
      if (R.coin()) return { q: 'Which enzyme or protein does this job at a replication fork? ' + e[1] + '.', a: mc(R, cap(e[0]), wr), hint: 'Think of the order: unwind, prime, build, replace primers, seal.',
        viz: { name: 'apbio-fork', opts: { quiet: true, interactive: false } }, steps: ['That is the job of <b>' + e[0] + '</b>.'] };
      return { q: 'What does ' + e[0] + ' do in DNA replication?', a: mc(R, e[1] + '.', R.sample(REPL.filter(function (x) { return x !== e; }), 3).map(function (x) { return x[1] + '.'; })), hint: 'Picture the fork from front to back.', steps: [cap(e[0]) + ': ' + e[1].charAt(0).toLowerCase() + e[1].slice(1) + '.'] }; }
    if (L === 2) { var q = R.pick([
      ['In which direction is the lagging strand built?', '5′ → 3′, in short pieces that point away from the fork', ['3′ → 5′, toward the fork', '3′ → 5′, away from the fork', 'In both directions at once']],
      ['Why does the lagging strand need many primers?', 'Polymerase can only extend a 3′ end, so each new fragment, made away from the fork, must start on a fresh primer.', ['Primers hold the two strands apart.', 'The lagging strand is made of RNA.', 'Ligase can only work on primers.']],
      ['Which statement about the leading and lagging strands is correct?', 'Both are built 5′ → 3′; the leading strand continuously toward the fork, the lagging strand in pieces away from it.', ['The leading strand is built 5′ → 3′ and the lagging strand 3′ → 5′.', 'Only the leading strand needs a primer; the lagging strand needs none.', 'The lagging strand is copied after the whole leading strand is done.']]]);
      if (R.chance(0.4)) { var topDir = R.coin(), fork = R.pick(['right', 'left']);
        // top template 3'->5' left to right: new top strand 5'->3' left to right, so it goes toward a fork on the right
        var topLeading = topDir === (fork === 'right');
        return { q: 'A replication fork is moving to the ' + fork + '. The top template strand runs ' + (topDir ? '3′ → 5′' : '5′ → 3′') + ' from left to right. Is the new strand built on the top template the leading or the lagging strand?', a: { t: 'mc', choices: ['Leading strand', 'Lagging strand'], v: topLeading ? 0 : 1, keep: true },
          hint: 'The new strand is antiparallel to its template and grows 5′ → 3′. Does that point toward the fork?', steps: ['The new top strand runs antiparallel: ' + (topDir ? '5′ → 3′' : '3′ → 5′') + ' from left to right, so it grows toward the ' + (topDir ? 'right' : 'left') + '.', 'The fork moves to the ' + fork + '.', topLeading ? 'It grows toward the fork: the <b>leading strand</b>.' : 'It grows away from the fork: the <b>lagging strand</b>.'] }; }
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Every new strand grows 5′ → 3′.', steps: ['DNA polymerase adds nucleotides only to a 3′ end, so every new strand grows 5′ → 3′.', 'On one template that is toward the fork (leading); on the other it is away from the fork, in Okazaki fragments, each with a primer (lagging).', 'Answer: ' + q[1]] }; }
    if (R.coin()) { var frag = R.pick([1000, 1500, 2000]), k = R.int(4, 12), len = frag * k;
      return { q: 'At one replication fork, the lagging strand is ' + f(len, 0) + ' nucleotides long, made in Okazaki fragments of about ' + f(frag, 0) + ' nucleotides. About how many RNA primers does the lagging strand need?', a: int(k), hint: 'One primer per fragment.',
        steps: ['Each Okazaki fragment begins on its own primer.', '$' + f(len, 0) + ' / ' + f(frag, 0) + ' = ' + k + '$ fragments, so about ' + k + ' primers (the leading strand needs just one).'] }; }
    var steps = ['Helicase unwinds the DNA', 'Primase lays an RNA primer', 'DNA polymerase III extends the primer', 'DNA polymerase I replaces the primer with DNA', 'Ligase seals the nick'], ord = R.shuffle([0, 1, 2, 3, 4]), LET = 'ABCDE';
    var right = [0, 1, 2, 3, 4].map(function (i) { return LET[ord.indexOf(i)]; }).join('');
    var wr2 = []; while (wr2.length < 3) { var w = R.shuffle(LET.split('')).join(''); if (w !== right && wr2.indexOf(w) < 0) wr2.push(w); }
    return { q: 'Put these events at one Okazaki fragment in order: ' + ord.map(function (i, j) { return LET[j] + '. ' + steps[i]; }).join('; ') + '.', a: mc(R, right, wr2), hint: 'Unwind, prime, build, replace the primer, seal.',
      steps: ['The order is: ' + steps.join(' → ') + '.', 'In letters: <b>' + right + '</b>.'] };
  });

  function seqN(R, n, alpha) { var s = ''; for (var i = 0; i < n; i++) s += R.pick(alpha.split('')); return s; }
  G('apbio.rna-processing', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var tpl = seqN(R, R.pick([9, 12]), 'ACGT'), m = B().transcribe(tpl);
      return { q: 'A DNA template strand reads 3′-' + tpl + '-5′. What mRNA is transcribed? Write it 5′ → 3′ (bases only).', a: { t: 'text', v: [m] }, hint: 'Pair each base: A→U, T→A, G→C, C→G.',
        viz: { name: 'bi-central', opts: { mode: 'transcribe', template: tpl, quiet: true, interactive: false, ask: 'mrna' } }, steps: ['Pair each base of the template: ' + tpl.split('').map(function (b) { return b + '→' + B().transcribe(b); }).join(', ') + '.', 'mRNA: 5′-' + m + '-3′ (the template runs 3′ → 5′, so the RNA runs 5′ → 3′).'] }; }
    if (L === 2) { var q = R.pick([
      ['During RNA splicing, which parts of the pre-mRNA are kept?', 'The exons', ['The introns', 'Both, joined in a new order', 'Neither: a new RNA is made']],
      ['Which statement about prokaryotic mRNA is correct?', 'Prokaryotic genes generally have no introns, and ribosomes can translate the mRNA while it is still being made.', ['Prokaryotic mRNA is spliced in the nucleus.', 'Prokaryotic mRNA gets a 5′ cap and poly-A tail in the nucleus.', 'Prokaryotes keep the introns and remove the exons.']],
      ['What do the 5′ cap and poly-A tail do?', 'Protect the mRNA from breakdown and help it leave the nucleus and bind a ribosome', ['Code for the first and last amino acids', 'Mark the introns for removal', 'Bind the promoter']],
      ['How can one gene give two different proteins?', 'Alternative splicing: different sets of exons are kept in different mRNAs', ['Each gene is read in both directions', 'The introns are translated in some cells', 'The cap is added at different ends']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Exons are expressed; introns are removed.', steps: ['Eukaryotic pre-mRNA gets a 5′ cap and a poly-A tail; introns are spliced out and exons joined, sometimes in alternative combinations.', 'Prokaryotic genes generally lack introns and are translated at once.', 'Answer: ' + q[1]] }; }
    if (R.coin()) { var e = [R.int(3, 9) * 3, R.int(3, 9) * 3, R.int(3, 9) * 3].map(function (x) { return x * 10; }), introns = [R.int(2, 12) * 50, R.int(2, 12) * 50], skip = R.coin();
      var tot = skip ? e[0] + e[2] : e[0] + e[1] + e[2];
      return { q: 'A pre-mRNA has exon 1 (' + e[0] + ' nucleotides), intron 1 (' + introns[0] + '), exon 2 (' + e[1] + '), intron 2 (' + introns[1] + ') and exon 3 (' + e[2] + '). How many nucleotides of the mature mRNA come from the gene (not counting the cap and tail)' + (skip ? ', if exon 2 is skipped by alternative splicing' : '') + '?', a: int(tot),
        hint: 'Add the exons that are kept.', steps: ['Introns are removed.', 'Exons kept: ' + (skip ? e[0] + ' + ' + e[2] : e.join(' + ')) + ' = <b>' + tot + '</b>.'] }; }
    var ex = [seqN(R, 6, 'ACGU'), seqN(R, 6, 'ACGU'), seqN(R, 3, 'ACGU')], intr = ['gu' + seqN(R, 3, 'acgu') + 'ag', 'gu' + seqN(R, 4, 'acgu') + 'ag'], pre = ex[0] + intr[0] + ex[1] + intr[1] + ex[2], mature = ex.join('');
    return { q: 'A pre-mRNA is written with exons in capitals and introns in small letters: 5′-' + pre + '-3′. Write the mature sequence after splicing (capital letters only, 5′ → 3′).', a: { t: 'text', v: [mature] }, hint: 'Remove the small-letter stretches and join the rest in order.',
      steps: ['Exons: ' + ex.join(', ') + '. Introns (removed): ' + intr.join(', ') + '.', 'Join the exons in order: 5′-' + mature + '-3′.'] };
  });

  function rndCodon(R) { var c; do { c = seqN(R, 3, 'ACGU'); } while (B().CODE[c] === '*' || c === 'AUG'); return c; }
  function anticodon(c) { return c.split('').map(function (x) { return { A: 'U', U: 'A', G: 'C', C: 'G' }[x]; }).join(''); }
  function pep(s) { return s.split('').map(function (a) { return B().three(a); }); }
  G('apbio.translation-details', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var c = rndCodon(R), aa = B().three(B().CODE[c]), ac = anticodon(c);
      if (R.coin()) return { q: 'A tRNA pairs with the mRNA codon 5′-' + c + '-3′. Write its anticodon directly under the codon (so it reads 3′ → 5′ from left to right). Bases only.', a: { t: 'text', v: [ac] }, hint: 'Pair A with U and G with C.',
        steps: ['Pair each base: ' + c.split('').map(function (b) { return b + '→' + anticodon(b); }).join(', ') + '.', 'Anticodon: 3′-' + ac + '-5′.'] };
      return { q: 'Which amino acid does the tRNA for the codon 5′-' + c + '-3′ carry? Use the codon table; give the three-letter name.', a: { t: 'text', v: [aa, B().AA[B().CODE[c]][1]] }, viz: { name: 'bi-central', opts: { mode: 'table', highlight: [c], interactive: false } },
        hint: 'Find the first base on the left, the second across the top, the third on the right.', steps: ['In the codon table, ' + c + ' codes for <b>' + aa + '</b> (' + B().AA[B().CODE[c]][1] + ').'] }; }
    if (L === 2) { var q = R.pick([
      ['Where does a new aminoacyl-tRNA enter the ribosome?', 'The A site', ['The P site', 'The E site', 'The small subunit only, outside any site']],
      ['What recognizes a stop codon?', 'A release factor', ['A tRNA with a stop anticodon', 'The initiator tRNA', 'Ligase']],
      ['Where is the initiator tRNA (carrying Met) when translation begins?', 'The P site', ['The A site', 'The E site', 'Outside the ribosome']],
      ['Where is the growing polypeptide just after a new peptide bond forms (before translocation)?', 'On the tRNA in the A site', ['On the tRNA in the E site', 'On the tRNA in the P site', 'Free in the cytoplasm']],
      ['Which site does an empty tRNA leave from?', 'The E site', ['The A site', 'The P site', 'Any site']]]);
      return { q: q[0], viz: { name: 'apbio-ribosome', opts: { quiet: true, interactive: false, step: 1 } }, a: mc(R, q[1], q[2]), hint: 'A: arriving; P: holding the chain; E: exit.',
        steps: ['New tRNAs enter the A site; the chain-holding tRNA sits in the P site; empty tRNAs leave from the E site.', 'After a bond forms, the chain is on the A-site tRNA until translocation moves it to the P site.', 'Stop codons are read by release factors.', 'Answer: ' + q[1]] }; }
    var n = R.int(3, 5), cods = ['AUG']; for (var i = 1; i < n; i++) cods.push(rndCodon(R)); cods.push(R.pick(['UAA', 'UAG', 'UGA']));
    var lead = seqN(R, R.int(1, 3), 'CGU').replace(/AUG/g, 'ACG'), mrna = lead + cods.join('') + seqN(R, 2, 'ACG'), p3 = pep(B().translate(mrna)), ans = p3.join('-');
    if (R.coin()) return { q: 'Translate the mRNA 5′-' + mrna + '-3′, starting at the first AUG. Give the peptide as three-letter names joined by hyphens (for example Met-Gly).', a: { t: 'text', v: [ans, p3.join(''), B().translate(mrna)] },
      viz: { name: 'bi-central', opts: { mode: 'table', interactive: false } }, hint: 'Find AUG, then read three bases at a time until a stop codon.',
      steps: ['First AUG: ' + cods.join(' ') + '.', cods.map(function (c) { return c + ' = ' + (B().CODE[c] === '*' ? 'stop' : B().three(B().CODE[c])); }).join(', ') + '.', 'Peptide: <b>' + ans + '</b>.'] };
    return { q: 'A ribosome translates 5′-' + mrna + '-3′ from its first AUG to the stop codon. How many tRNAs enter the A site?', a: int(n - 1), hint: 'The initiator tRNA starts in the P site, and no tRNA reads the stop codon.',
      steps: ['Codons from AUG: ' + cods.join(' ') + ' (' + n + ' amino acids, then stop).', 'The initiator Met-tRNA starts in the P site; each later amino acid arrives in the A site: ' + (n - 1) + ' tRNAs.', 'At the stop codon a release factor, not a tRNA, takes the A site.'] };
  });

  G('apbio.operons', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var lac = R.coin();
      if (lac) { var lacP = R.coin(), glu = R.coin(), lvl = !lacP ? 'Off' : glu ? 'Low' : 'High';
        return { q: 'E. coli is grown with ' + (lacP ? 'lactose' : 'no lactose') + ' and ' + (glu ? 'glucose' : 'no glucose') + '. What is the level of transcription of the lac operon?', a: { t: 'mc', choices: ['Off', 'Low', 'High'], v: ['Off', 'Low', 'High'].indexOf(lvl), keep: true },
          viz: { name: 'apbio-operon', opts: { operon: 'lac', lactose: false, glucose: true, quiet: true, interactive: false } },
          hint: 'Lactose removes the repressor; low glucose brings in cAMP-CAP.', steps: [lacP ? 'Lactose present: allolactose binds the repressor, which leaves the operator.' : 'No lactose: the repressor blocks the operator.', lacP ? (glu ? 'Glucose present: cAMP is low and CAP does not help, so transcription is low.' : 'No glucose: cAMP-CAP helps RNA polymerase bind, so transcription is high.') : 'So the operon is off whatever the glucose level.', 'Answer: <b>' + lvl.toLowerCase() + '</b>.'] }; }
      var trp = R.coin(); return { q: 'An E. coli cell has ' + (trp ? 'plenty of' : 'very little') + ' tryptophan. Is the trp operon transcribed?', a: { t: 'mc', choices: ['Yes, the genes are on', 'No, the genes are off'], v: trp ? 1 : 0, keep: true },
        hint: 'Tryptophan is the corepressor.', steps: [trp ? 'Tryptophan binds the trp repressor and activates it; the repressor binds the operator.' : 'Without tryptophan the repressor is inactive and cannot bind the operator.', trp ? 'The genes are <b>off</b>.' : 'The genes are <b>on</b>: the cell makes tryptophan.'] }; }
    if (L === 2) { var q = R.pick([
      ['Where does allolactose bind in the lac operon system?', 'To the lac repressor protein, changing its shape so it leaves the operator', ['To the operator, blocking RNA polymerase', 'To the promoter, attracting RNA polymerase', 'To the lacZ gene']],
      ['Which operon is normally on, and switched off by its small molecule?', 'The trp operon (repressible)', ['The lac operon (inducible)', 'Both', 'Neither']],
      ['With no lactose present, what is the state of the lac operon?', 'Off: the repressor is bound to the operator', ['On: the repressor is inactive', 'On: CAP blocks the repressor', 'Off: tryptophan binds the operator']],
      ['What does tryptophan do in the trp operon?', 'It binds the repressor as a corepressor, letting the repressor bind the operator', ['It binds the operator directly', 'It removes the repressor from the operator', 'It is made only when the operator is blocked']],
      ['Why does E. coli keep the lac operon off when lactose is absent?', 'Making enzymes for a sugar that is not there would waste energy and materials.', ['Lactose is toxic to E. coli.', 'The lac genes are missing when lactose is absent.', 'Glucose destroys the lac genes.']],
      ['What does the lac repressor bind when lactose is absent?', 'The operator', ['The promoter', 'Lactose', 'The lacZ gene']],
      ['Which operon is inducible?', 'The lac operon: it is switched on by its small molecule', ['The trp operon', 'Both', 'Neither']],
      ['When glucose is scarce, what helps RNA polymerase bind the lac promoter?', 'CAP with cAMP bound', ['The repressor', 'Tryptophan', 'Allolactose bound to the operator']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'The small molecule always binds the repressor. Lac: off by default. Trp: on by default.', steps: ['Lac (inducible): the repressor is active alone; allolactose inactivates it, turning the genes on.', 'Trp (repressible): the repressor is inactive alone; tryptophan activates it, turning the genes off.', 'Answer: ' + q[1]] }; }
    var mut = R.pick([{ s: 'a lac mutant whose repressor gene (lacI) makes no working repressor', c: 'no lactose and no glucose', a: 'High: with no repressor, the operator is never blocked.', lvl: 'High' },
      { s: 'a lac mutant whose operator cannot bind the repressor', c: 'no lactose and no glucose', a: 'High: the repressor cannot reach the genes.', lvl: 'High' },
      { s: 'a lac mutant whose repressor cannot bind allolactose', c: 'lactose and no glucose', a: 'Off: the repressor stays on the operator even with lactose.', lvl: 'Off' },
      { s: 'a lac mutant that cannot make cAMP', c: 'lactose and no glucose', a: 'Low: the repressor leaves, but CAP cannot help RNA polymerase.', lvl: 'Low' },
      { s: 'a normal cell', c: 'lactose and glucose', a: 'Low: lactose removes the repressor, but glucose keeps cAMP low.', lvl: 'Low' },
      { s: 'a lac mutant with no working repressor', c: 'lactose and glucose', a: 'Low: there is no repressor, but glucose keeps cAMP low.', lvl: 'Low' },
      { s: 'a lac mutant whose operator cannot bind the repressor', c: 'no lactose but plenty of glucose', a: 'Low: nothing blocks the operator, but glucose keeps cAMP low.', lvl: 'Low' },
      { s: 'a normal cell', c: 'no lactose and no glucose', a: 'Off: with no lactose the repressor sits on the operator, so CAP cannot turn the genes on.', lvl: 'Off' },
      { s: 'a lac mutant whose CAP protein cannot bind cAMP', c: 'lactose and no glucose', a: 'Low: the repressor leaves, but CAP cannot help RNA polymerase.', lvl: 'Low' }]);
    if (R.chance(0.3)) { var tm = R.pick([{ s: 'a trp mutant whose repressor gene makes no working repressor', c: 'plenty of tryptophan', on: true, why: 'With no repressor, nothing shuts the genes off.' }, { s: 'a trp mutant whose operator cannot bind the repressor', c: 'plenty of tryptophan', on: true, why: 'The active repressor cannot reach the operator.' },
        { s: 'a trp mutant whose repressor binds the operator even without tryptophan', c: 'no tryptophan', on: false, why: 'The repressor blocks the operator all the time, so the cell cannot make tryptophan.' }, { s: 'a normal cell', c: 'plenty of tryptophan', on: false, why: 'Tryptophan activates the repressor, which binds the operator.' }]);
      return { q: 'Is the trp operon transcribed in ' + tm.s + ', grown with ' + tm.c + '?', a: { t: 'mc', choices: ['Yes, the genes are on', 'No, the genes are off'], v: tm.on ? 0 : 1, keep: true }, hint: 'The trp repressor works only with tryptophan bound, and only if it can reach the operator.',
        steps: ['Normally, tryptophan binds the repressor, which then binds the operator and shuts the genes off.', tm.why, 'So the genes are <b>' + (tm.on ? 'on' : 'off') + '</b>.'] }; }
    return { q: 'Predict the level of lac operon transcription in ' + mut.s + ', grown with ' + mut.c + '.', a: { t: 'mc', choices: ['Off', 'Low', 'High'], v: ['Off', 'Low', 'High'].indexOf(mut.lvl), keep: true },
      hint: 'Two controls: is the operator free of repressor? Is cAMP-CAP helping?', steps: ['Check the repressor and operator, then cAMP-CAP (high only when glucose is scarce and cAMP can be made).', mut.a] };
  });

  var EPI = [['Acetyl groups are added to the histones around a gene.', 1], ['Acetyl groups are removed from the histones around a gene.', -1], ['The cytosines in a gene\'s promoter become heavily methylated.', -1], ['An activator protein binds an enhancer of the gene.', 1], ['A repressor protein binds a control region of the gene.', -1], ['The chromatin around a gene becomes more tightly packed.', -1], ['A microRNA that pairs with the gene\'s mRNA is made.', -1], ['Methyl groups are removed from the gene\'s promoter.', 1], ['The gene\'s DNA is wound more loosely around its histones.', 1], ['A transcription factor that helps RNA polymerase bind the promoter is destroyed.', -1], ['Proteins that pack methylated DNA tightly bind near the gene.', -1], ['Two activators needed at the gene\'s enhancer are both present.', 1]];
  G('apbio.eukaryotic-regulation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var e = R.pick(EPI), cellw = R.pick(['In a liver cell', 'In a skin cell', 'In a plant leaf cell', 'In a yeast cell', 'In a muscle cell']); return { q: cellw + ': ' + e[0].charAt(0).toLowerCase() + e[0].slice(1) + ' What is the most likely effect on how much protein the gene makes?', a: { t: 'mc', choices: ['More', 'Less'], v: e[1] > 0 ? 0 : 1, keep: true }, hint: 'Open chromatin and activators raise expression; methylation, tight packing and repressors lower it.',
      steps: [e[1] > 0 ? 'This opens the gene to RNA polymerase or helps it bind.' : 'This closes the gene off, blocks transcription, or blocks the mRNA.', 'So expression goes <b>' + (e[1] > 0 ? 'up' : 'down') + '</b>.'] }; }
    if (L === 2) { var q = R.pick([
      ['True or false: DNA methylation changes the sequence of bases in a gene.', false, 'Methylation adds methyl groups to cytosines; the base sequence stays the same.'],
      ['True or false: epigenetic marks such as DNA methylation can be copied to daughter cells when a cell divides.', true, 'Enzymes copy the methylation pattern onto new DNA strands, so daughter cells keep it.'],
      ['True or false: histone acetylation adds new bases to DNA.', false, 'Acetylation changes histone proteins, loosening the packing; no bases are added.'],
      ['True or false: two cells with identical DNA sequences can express different genes because of different epigenetic marks.', true, 'Marks and transcription factors decide which genes are read; the sequence alone does not.'],
      ['True or false: an enhancer must sit right next to the promoter to work.', false, 'Enhancers can be thousands of bases away; the DNA loops to bring them close.'],
      ['True or false: eukaryotic genes are usually controlled in operons, like bacterial genes.', false, 'Each eukaryotic gene usually has its own promoter and control elements.'],
      ['True or false: tightly packed chromatin is usually transcribed less than loosely packed chromatin.', true, 'Tight packing keeps RNA polymerase and transcription factors away.']]);
      return { q: q[0], a: tf(q[1]), hint: 'Epigenetic changes alter packing and reading, not bases.', steps: [q[2], 'So the answer is <b>' + (q[1] ? 'true' : 'false') + '</b>.'] }; }
    var sc = R.pick([{ s: 'A drug blocks the enzymes that remove acetyl groups from histones.', t: ['Histones stay more acetylated.', 'Chromatin around many genes loosens.', 'Many genes are expressed more.'], f: ['The DNA sequence of those genes changes.', 'All genes are switched off.'] },
      { s: 'A drug blocks the enzymes that methylate DNA, in cells that then divide several times.', t: ['Newly made DNA strands carry fewer methyl groups.', 'Some silenced genes may switch on.'], f: ['The base sequence of the DNA changes.', 'Histones are removed from all DNA.'] },
      { s: 'An enhancer far upstream of a gene is deleted, but the promoter is intact.', t: ['Activators can no longer bind that enhancer.', 'Transcription of the gene drops to a low level.'], f: ['The gene can no longer be transcribed at all, by any cell.', 'The gene is now always on.'] }]);
    return { q: sc.s + ' Choose all the predictions that are correct.', a: mcAll(R, sc.t.map(function (x) { return [x, true]; }).concat(sc.f.map(function (x) { return [x, false]; }))),
      hint: 'Acetylation opens chromatin; methylation usually silences; enhancers bind activators.', steps: ['Gene expression in eukaryotes depends on transcription factors at promoters and enhancers and on chromatin packing.', sc.s + ' So: ' + sc.t.join(' ')] };
  });

  G('apbio.differentiation', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var q = R.pick([
      ['A muscle cell and a nerve cell from the same person make different proteins. Why?', 'They express different sets of genes, controlled by different transcription factors.', ['They have different genes.', 'One of them has lost most of its DNA.', 'They read their genes in opposite directions.']],
      ['What makes a liver cell a liver cell?', 'The particular set of genes it keeps switched on', ['Genes that only liver cells have', 'A different genetic code', 'Its mitochondria']],
      ['What is a master regulator such as MyoD?', 'A transcription factor that switches on a whole program of genes for one cell type', ['An enzyme that copies DNA', 'A gene found only in muscle cells', 'A protein that cuts out introns']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Same genome, different expression.', steps: ['Nearly all cells in a body share the same genome.', 'They differ in which genes they express, set by combinations of transcription factors and kept by epigenetic marks.', 'Answer: ' + q[1]] }; }
    if (L === 2) { var q2 = R.pick([['True or false: a skin cell no longer has the gene for the liver protein albumin.', false, 'It keeps the gene but does not express it.'], ['True or false: a single cell from a carrot root can grow into a whole carrot plant.', true, 'It still holds every gene the plant needs.'], ['True or false: specialized cells throw away the genes they do not use.', false, 'Nearly all body cells keep the whole genome.'], ['True or false: mature mammalian red blood cells are an exception: they lose their nucleus.', true, 'Mature mammalian red blood cells have no nucleus.']]);
      return { q: q2[0], a: tf(q2[1]), hint: 'Do specialized cells keep their genes?', steps: [q2[2], 'So the answer is <b>' + (q2[1] ? 'true' : 'false') + '</b>.'] }; }
    var TF = ['A', 'B', 'C', 'D'], genes, has, on;
    do { genes = ['X', 'Y', 'Z', 'W'].map(function (g) { return { g: g, need: R.sample(TF, R.int(1, 2)).sort() }; }); has = R.sample(TF, 2).sort(); on = genes.filter(function (x) { return x.need.every(function (t) { return has.indexOf(t) >= 0; }); }); } while (on.length === genes.length || on.length === 0 && R.chance(0.7));
    return { q: 'Each gene is expressed only when all of its activators are present. ' + genes.map(function (x) { return 'Gene ' + x.g + ' needs ' + x.need.join(' and '); }).join('. ') + '. A cell makes activators ' + has.join(' and ') + ' only. Which genes are expressed? Choose all that apply' + (on.length ? '.' : ' (choose "None of these" if no gene qualifies).'),
      a: mcAll(R, genes.map(function (x) { return ['Gene ' + x.g, on.indexOf(x) >= 0]; }).concat(on.length ? [] : [['None of these', true]])), hint: 'Check each gene\'s list against the cell\'s activators.',
      steps: genes.map(function (x) { var ok = on.indexOf(x) >= 0; return 'Gene ' + x.g + ': needs ' + x.need.join(' and ') + (ok ? ', all present: on.' : ', not all present: off.'); }) };
  });

  function point(R, mrna, pos) { var b = mrna[pos], nb; do { nb = R.pick('ACGU'.split('')); } while (nb === b); return mrna.slice(0, pos) + nb + mrna.slice(pos + 1); }
  var KINDS = ['silent', 'missense', 'nonsense', 'frameshift'];
  G('apbio.mutation-effects', function (R, ctx) {
    var L = lv(ctx), mt = B().mutationType;
    var n = 4, cods = ['AUG']; for (var i = 1; i < n; i++) cods.push(rndCodon(R)); cods.push('UAA'); var m0 = cods.join('');
    if (L === 1) { var want = R.pick(['silent', 'missense', 'nonsense']), m1, tries = 0;
      do { m1 = point(R, m0, R.int(3, 3 * n - 1)); tries++; } while (mt(m0, m1) !== want && tries < 60);
      var kind = mt(m0, m1), pos = 0; while (m0[pos] === m1[pos]) pos++; var ci = M.floor(pos / 3), c0 = m0.substr(ci * 3, 3), c1 = m1.substr(ci * 3, 3);
      return { q: 'A point mutation changes codon ' + (ci + 1) + ' of an mRNA from ' + c0 + ' to ' + c1 + '. What kind of mutation is it?', a: { t: 'mc', choices: ['Silent', 'Missense', 'Nonsense'], v: ['silent', 'missense', 'nonsense'].indexOf(kind), keep: true },
        viz: { name: 'bi-central', opts: { mode: 'table', highlight: [c0, c1], interactive: false } }, hint: 'Look up both codons in the table.',
        steps: [c0 + ' = ' + (B().CODE[c0] === '*' ? 'stop' : B().three(B().CODE[c0])) + '; ' + c1 + ' = ' + (B().CODE[c1] === '*' ? 'stop' : B().three(B().CODE[c1])) + '.', kind === 'silent' ? 'Same amino acid: <b>silent</b>.' : kind === 'nonsense' ? 'The codon became a stop: <b>nonsense</b>.' : 'A different amino acid: <b>missense</b>.'] }; }
    if (L === 2) { var del = R.pick([1, 2, 3]), at = R.int(4, 3 * n - 4), m2 = m0.slice(0, at) + m0.slice(at + del);
      return { q: 'In the mRNA 5′-' + m0 + '-3′, ' + del + ' base' + (del > 1 ? 's are' : ' is') + ' deleted starting at position ' + (at + 1) + '. Does the reading frame after the deletion stay the same?', a: { t: 'mc', choices: ['Yes: the frame is kept (a whole codon is removed or the frame realigns)', 'No: it is a frameshift; every codon after the deletion is read differently'], v: del === 3 ? 0 : 1, keep: true },
        hint: 'Is the number of deleted bases a multiple of 3?', steps: [del === 3 ? 'Three bases make one codon. Deleting 3 removes one codon\'s worth of bases, and the codons after the deletion are read in the original frame (one amino acid may change where the deletion straddles two codons).' : 'Deleting ' + del + ' base' + (del > 1 ? 's' : '') + ' (not a multiple of 3) shifts the reading frame.', del === 3 ? 'Frame kept.' : 'A <b>frameshift</b>: the codons after it change, often reaching a stop codon early.'] }; }
    var sh = R.coin(), m3;
    if (sh) { m3 = point(R, m0, R.int(3, 3 * n - 1)); } else { var at3 = R.int(4, 3 * n - 3); m3 = m0.slice(0, at3) + R.pick('ACGU'.split('')) + m0.slice(at3); }
    var k3 = mt(m0, m3), p0 = pep(B().translate(m0)).join('-'), p1 = pep(B().translate(m3)).join('-');
    return { q: 'Normal mRNA: 5′-' + m0 + '-3′. Mutant mRNA: 5′-' + m3 + '-3′. Translate both from the start codon and classify the mutation.', viz: { name: 'bi-central', opts: { mode: 'table', interactive: false } },
      a: { t: 'mc', choices: ['Silent', 'Missense', 'Nonsense', 'Frameshift'], v: KINDS.indexOf(k3), keep: true }, hint: 'Compare lengths first (an insertion shifts the frame), then compare codon by codon.',
      steps: ['Normal: ' + p0 + '.', 'Mutant: ' + (p1 || '(nothing after Met)') + '.', m3.length !== m0.length ? 'One base was inserted, so every codon after it is read in a new frame: <b>frameshift</b>.' : k3 === 'silent' ? 'Same protein: <b>silent</b>.' : k3 === 'nonsense' ? 'The protein ends early at a new stop codon: <b>nonsense</b>.' : 'One amino acid differs: <b>missense</b>.'] };
  });

  G('apbio.gel-sizing', function (R, ctx) {
    var L = lv(ctx), LAD = [5000, 3000, 2000, 1000, 500, 250], len = 60, pos = function (bp) { return B().gelPos(bp) * len; };
    if (L === 1) { var a = R.int(1, 4), lo = LAD[a + 1], hi = LAD[a], unk = M.round(M.exp((M.log(lo) + M.log(hi)) / 2 + R.real(-0.25, 0.25, 2) * (M.log(hi) - M.log(lo)))), d = pos(unk);
      return { q: 'An unknown band moved ' + f(d, 1) + ' mm. Ladder bands: ' + LAD.map(function (b) { return f(b, 0) + ' bp at ' + f(pos(b), 1) + ' mm'; }).join(', ') + '. Between which two ladder sizes is the unknown?',
        viz: { name: 'bi-gel', opts: { lanes: [{ name: 'Unknown', bands: [unk] }], quiet: true, interactive: false } },
        a: mc(R, 'Between ' + f(lo, 0) + ' and ' + f(hi, 0) + ' bp', [a > 0 ? 'Between ' + f(hi, 0) + ' and ' + f(LAD[a - 1], 0) + ' bp' : 'Larger than 5,000 bp', a + 2 < LAD.length ? 'Between ' + f(LAD[a + 2], 0) + ' and ' + f(lo, 0) + ' bp' : 'Smaller than 250 bp', 'Smaller than 250 bp'].filter(function (v, i, s) { return s.indexOf(v) === i; })),
        hint: 'Smaller fragments move farther. Find the two ladder distances on either side.', steps: ['The ' + f(hi, 0) + ' bp band moved ' + f(pos(hi), 1) + ' mm and the ' + f(lo, 0) + ' bp band ' + f(pos(lo), 1) + ' mm.', f(d, 1) + ' mm lies between them, so the unknown is <b>between ' + f(lo, 0) + ' and ' + f(hi, 0) + ' bp</b>.'] }; }
    if (L === 2) { var pr = R.pick([[1000, 500], [2000, 1000], [4000, 2000], [3000, 1000], [800, 200], [1000, 250]]), g = M.sqrt(pr[0] * pr[1]), lin = (pr[0] + pr[1]) / 2;
      if (R.coin()) return { q: 'On a gel, an unknown band lies exactly halfway (in distance) between ladder bands of ' + f(pr[0], 0) + ' and ' + f(pr[1], 0) + ' base pairs. Which is the better estimate of its size?', a: mc(R, 'About ' + f(M.round(g), 0) + ' bp', ['About ' + f(lin, 0) + ' bp', 'About ' + f(pr[1], 0) + ' bp', 'About ' + f(pr[0] + pr[1], 0) + ' bp']),
        hint: 'Distance is linear in log(size). Halfway in log is the geometric mean.', steps: ['Halfway in distance means halfway in log(size).', 'That is $\\sqrt{' + pr[0] + ' \\times ' + pr[1] + '} \\approx ' + f(M.round(g), 0) + '$ bp.', 'The straight average, ' + f(lin, 0) + ', is too large.'] };
      return { q: 'An unknown band lies exactly halfway (in distance) between ladder bands of ' + f(pr[0], 0) + ' and ' + f(pr[1], 0) + ' base pairs. Estimate its size in base pairs.', a: num(g, 0.03), unit: 'bp',
        hint: 'Take the geometric mean, √(a × b).', steps: ['Distance is linear in log(size), so halfway in distance is halfway in log.', '$\\sqrt{' + pr[0] + ' \\times ' + pr[1] + '} = ' + f(g, 0) + '$ bp.'] }; }
    var i3 = R.int(0, 4), hi3 = LAD[i3], lo3 = LAD[i3 + 1], dh = M.round(pos(hi3)), dl = M.round(pos(lo3)); if (dl - dh < 4) dl = dh + 4;
    var du = R.int(dh + 1, dl - 1), frac = (du - dh) / (dl - dh), sz = M.pow(10, M.log10(hi3) - frac * (M.log10(hi3) - M.log10(lo3)));
    return { q: 'On a gel, the ' + f(hi3, 0) + ' bp ladder band moved ' + dh + ' mm and the ' + f(lo3, 0) + ' bp band moved ' + dl + ' mm. An unknown band moved ' + du + ' mm. Using a straight line between the two bands on a log scale, estimate its size.', a: num(sz, 0.03), unit: 'bp',
      viz: { name: 'apbio-semilog', opts: { ladder: LAD, unknown: du, quiet: true, interactive: false } },
      hint: 'Find the fraction of the way from one band to the other, then move that fraction in log(size).',
      steps: ['Fraction of the way: $(' + du + ' - ' + dh + ')/(' + dl + ' - ' + dh + ') = ' + f(frac, 3) + '$.', '$\\log s = \\log ' + hi3 + ' - ' + f(frac, 3) + '(\\log ' + hi3 + ' - \\log ' + lo3 + ') = ' + f(M.log10(sz), 3) + '$', '$s = 10^{' + f(M.log10(sz), 3) + '} \\approx ' + f(sz, 0) + '$ bp.'] };
  });

  G('apbio.transformation-sequencing', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var amp = R.coin(), plas = R.coin(), out = !amp ? 'A lawn of bacteria all over the plate' : plas ? 'Separate colonies of transformed bacteria' : 'No growth';
      return { q: 'E. coli ' + (plas ? 'given a plasmid with an ampicillin-resistance gene' : 'not given any plasmid') + ' is spread on a plate ' + (amp ? 'containing ampicillin' : 'without ampicillin') + '. What grows?', a: mc(R, out, ['A lawn of bacteria all over the plate', 'Separate colonies of transformed bacteria', 'No growth'].filter(function (x) { return x !== out; })),
        hint: 'Ampicillin kills cells without the resistance gene; only a few cells take up the plasmid.', steps: [!amp ? 'Without ampicillin, every cell can grow, plasmid or not: a lawn.' : plas ? 'With ampicillin, only the few cells that took up the plasmid survive, each making a colony.' : 'With ampicillin and no plasmid, no cell is resistant: no growth.', 'Answer: ' + out + '.'] }; }
    if (L === 2) { var q = R.pick([
      ['Bacteria given a plasmid are spread on an ampicillin plate, and 80 colonies grow. Which statement is correct?', 'Only the cells that took up the plasmid survived; each colony grew from one transformed cell.', ['Every cell given the plasmid took it up.', 'The ampicillin made the bacteria resistant.', 'Each colony grew from many cells that each took up part of the plasmid.']],
      ['Why is a plate without antibiotic used as a control?', 'To show that the cells were alive and able to grow at all', ['To select only transformed cells', 'To make the cells take up the plasmid', 'To count the transformed cells']],
      ['On a plate without ampicillin, cells given the plasmid form a lawn. Did every cell take up the plasmid?', 'No: without the antibiotic, untransformed cells grow too.', ['Yes: a lawn means every cell was transformed.', 'Yes: the plasmid makes cells grow faster.', 'No: no cells took it up.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'The antibiotic selects; only resistant (transformed) cells survive it.', steps: ['Only a small fraction of cells take up a plasmid.', 'On an antibiotic plate, only those survive; without antibiotic, all cells grow.', 'Answer: ' + q[1]] }; }
    if (R.coin()) { var ug = R.pick([0.05, 0.1, 0.2, 0.5]), vol = R.pick([0.5, 1, 1.5]), spread = R.pick([0.1, 0.2, 0.25]), col = R.int(30, 300), dna = ug * spread / vol, eff = col / dna;
      return { q: 'Cells were given ' + ug + ' µg of plasmid in ' + vol + ' mL. Then ' + spread + ' mL of the mixture was spread on an ampicillin plate, and ' + col + ' colonies grew. Find the transformation efficiency (transformants per µg of DNA).', a: num(eff, 0.02), unit: 'transformants/µg',
        hint: 'First find the µg of DNA that was actually spread.', steps: ['Fraction spread: $' + spread + '/' + vol + ' = ' + f(spread / vol, 4) + '$; DNA spread: $' + ug + ' \\times ' + f(spread / vol, 4) + ' = ' + f(dna, 5) + '$ µg.', 'Efficiency: $' + col + ' / ' + f(dna, 5) + ' \\approx ' + f(eff, 0) + '$ transformants per µg.'] }; }
    var nw = seqN(R, R.int(6, 8), 'ACGT'), order = R.shuffle(nw.split('').map(function (b, i) { return [i + 1, b]; })), tmpl = B().complement(nw);
    return { q: 'In chain-termination sequencing, new fragments were sorted by length: ' + order.map(function (x) { return x[0] + ' nucleotide' + (x[0] > 1 ? 's' : '') + ' ending in ' + x[1]; }).join('; ') + '. Write the new strand 5′ → 3′ (bases only).', a: { t: 'text', v: [nw] },
      hint: 'Sort from shortest to longest; that reads the new strand from its 5′ end.', steps: ['Shortest to longest: ' + nw.split('').join(', ') + '.', 'New strand: 5′-' + nw + '-3′. (Its template is 3′-' + tmpl + '-5′.)'] };
  });

  /* =================== Unit 8: Natural Selection =================== */
  var HWORG = [['moths', 'white wings', 'dark wings'], ['flowers', 'white petals', 'purple petals'], ['mice', 'brown fur', 'black fur'], ['beetles', 'green shells', 'red shells'], ['pea plants', 'wrinkled seeds', 'round seeds'], ['fish', 'pale scales', 'striped scales']];
  G('apbio.hardy-weinberg-problems', function (R, ctx) {
    var L = lv(ctx), o = R.pick(HWORG), q = R.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), h = B().hw({ q: q }), q2 = +(q * q).toFixed(4);
    if (L === 1) { var ask = R.pick(['q', 'p', 'pq2', 'p2']), v = { q: h.q, p: h.p, pq2: h.pq2, p2: h.p2 }[ask];
      var what = { q: 'the frequency of the recessive allele (q)', p: 'the frequency of the dominant allele (p)', pq2: 'the frequency of heterozygotes (2pq)', p2: 'the frequency of homozygous dominant individuals (p²)' }[ask];
      return { q: 'In a population of ' + o[0] + ' in Hardy-Weinberg equilibrium, ' + f(100 * q2, 2) + '% have ' + o[1] + ', the recessive phenotype. What is ' + what + '?', a: num(v, 0.01),
        viz: { name: 'apbio-hw', opts: { q: q, quiet: true, interactive: false, ask: ask === 'pq2' ? 'pq' : ask === 'p2' ? 'p2' : null } }, hint: 'Start with q² = ' + q2 + '.',
        steps: ['$q^2 = ' + q2 + '$, so $q = \\sqrt{' + q2 + '} = ' + f(h.q, 2) + '$.', '$p = 1 - q = ' + f(h.p, 2) + '$.', ask === 'pq2' ? '$2pq = 2(' + f(h.p, 2) + ')(' + f(h.q, 2) + ') = ' + f(h.pq2, 4) + '$.' : ask === 'p2' ? '$p^2 = ' + f(h.p, 2) + '^2 = ' + f(h.p2, 4) + '$.' : 'So ' + (ask === 'q' ? 'q' : 'p') + ' = <b>' + f(v, 2) + '</b>.'] }; }
    if (L === 2) { var sh = R.int(0, 2);
      if (sh === 0) return { q: 'In a population in Hardy-Weinberg equilibrium, ' + f(100 * (1 - q2), 2) + '% of ' + o[0] + ' show the dominant phenotype (' + o[2] + '). What fraction of the population is heterozygous?', a: num(h.pq2, 0.01),
        hint: 'The dominant phenotype is p² + 2pq, not p². Use the recessive share: q² = 1 − ' + f(1 - q2, 4) + '.', steps: ['The dominant phenotype includes AA and Aa, so it is $p^2 + 2pq$.', 'Recessive share: $q^2 = 1 - ' + f(1 - q2, 4) + ' = ' + q2 + '$, so $q = ' + f(h.q, 2) + '$ and $p = ' + f(h.p, 2) + '$.', '$2pq = 2(' + f(h.p, 2) + ')(' + f(h.q, 2) + ') = ' + f(h.pq2, 4) + '$.'] };
      if (sh === 1) { var p0 = 1 - q; return { q: 'In a population, p = ' + f(p0, 2) + ' and q = ' + f(q, 2) + '. A student writes 2pq = 2(p + q) = 2. What is the correct frequency of heterozygotes?', a: num(2 * p0 * q, 0.01), hint: '2pq means 2 × p × q.',
        steps: ['2(p + q) is always 2, which cannot be a frequency.', '$2pq = 2 \\times ' + f(p0, 2) + ' \\times ' + f(q, 2) + ' = ' + f(2 * p0 * q, 4) + '$.'] }; }
      return { q: 'Which of these is NOT one of the conditions for Hardy-Weinberg equilibrium?', a: mc(R, 'Natural selection favors the dominant allele', ['A very large population', 'No migration into or out of the population', 'No new mutations', 'Parents pair up at random'].slice(0, 3)), hint: 'Equilibrium means no evolution. Which item would cause evolution?',
        steps: ['The conditions: large population, parents pairing at random, no mutation, no migration, no selection.', 'Selection changes allele frequencies, so it breaks equilibrium.'] }; }
    var N = R.pick([100, 200, 400, 500]), nAA = R.int(M.round(N * 0.2), M.round(N * 0.5)), naa = R.int(M.round(N * 0.05), M.round(N * 0.25)), nAa = N - nAA - naa, af = B().alleleFreq(nAA, nAa, naa);
    var eAa = 2 * af.p * af.q * N, sh3 = R.coin();
    if (sh3) return { q: 'A sample of ' + N + ' ' + o[0] + ' has ' + nAA + ' AA, ' + nAa + ' Aa and ' + naa + ' aa. Find p and the number of heterozygotes expected if the population were in Hardy-Weinberg equilibrium.',
      a: { t: 'multi', parts: [{ label: 'p =', a: num(af.p, 0.005) }, { label: 'expected Aa', a: num(eAa, 0.01) }] }, hint: 'Count alleles: each AA has 2 A, each Aa has 1.',
      steps: ['A alleles: $2(' + nAA + ') + ' + nAa + ' = ' + (2 * nAA + nAa) + '$ of $' + 2 * N + '$, so $p = ' + f(af.p, 4) + '$ and $q = ' + f(af.q, 4) + '$.', 'Expected Aa: $2pq \\times ' + N + ' = 2(' + f(af.p, 4) + ')(' + f(af.q, 4) + ')(' + N + ') = ' + f(eAa, 1) + '$.', 'Observed ' + nAa + (nAa < eAa ? ': fewer heterozygotes than expected.' : nAa > eAa ? ': more heterozygotes than expected.' : ': as expected.')] };
    var carriers = h.pq2, pop = R.pick([1000, 2000, 5000, 10000]);
    return { q: 'In a population of ' + f(pop, 0) + ' ' + o[0] + ' in Hardy-Weinberg equilibrium, ' + f(pop * q2, 0) + ' have ' + o[1] + ' (recessive). How many are expected to be heterozygous carriers, and how many homozygous dominant?',
      a: { t: 'multi', parts: [{ label: 'carriers (Aa)', a: num(pop * h.pq2, 0.01) }, { label: 'AA', a: num(pop * h.p2, 0.01) }] }, hint: 'Find q² as a fraction first.',
      steps: ['$q^2 = ' + f(pop * q2, 0) + '/' + f(pop, 0) + ' = ' + q2 + '$, so $q = ' + f(h.q, 2) + '$, $p = ' + f(h.p, 2) + '$.', 'Aa: $2pq \\times ' + f(pop, 0) + ' = ' + f(h.pq2, 4) + ' \\times ' + f(pop, 0) + ' = ' + f(pop * h.pq2, 0) + '$.', 'AA: $p^2 \\times ' + f(pop, 0) + ' = ' + f(h.p2, 4) + ' \\times ' + f(pop, 0) + ' = ' + f(pop * h.p2, 0) + '$.'] };
  });

  var DRIFT = [['A storm kills 90% of a beetle population at random. The survivors carry different allele frequencies than before.', 0], ['Hunting reduced a seal species to a very small number; the large population today has very little genetic variation.', 0], ['A wildfire wipes out most of a plant population, regardless of which alleles the plants carried.', 0],
    ['Twelve birds blown to a new island start a population that has only some of the mainland\'s alleles.', 1], ['A few seeds carried on a log to an empty island grow into a population whose allele frequencies differ from the mainland\'s.', 1], ['Five lizards rafting to an island happen to carry a rare stripe allele, which becomes common there.', 1],
    ['Moths that match the tree bark are eaten less, and their allele for bark color becomes more common.', 2], ['Bacteria with a resistance allele survive an antibiotic and leave more descendants.', 2],
    ['Pollen blown in from a neighboring field brings new alleles into a population of wild plants.', 3], ['Wolves moving between two packs carry alleles from one to the other.', 3]];
  var DK = ['Bottleneck (genetic drift)', 'Founder effect (genetic drift)', 'Natural selection', 'Gene flow'];
  G('apbio.genetic-drift', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var d = R.pick(DRIFT); return { q: 'Which process is described? ' + d[0], a: { t: 'mc', choices: DK, v: d[1], keep: true }, hint: 'Random loss of most of a population, a few founders, survival tied to a trait, or genes moving between populations?',
      steps: [['Most of the population died for reasons unrelated to their alleles: a bottleneck, which is drift.', 'A few individuals started a new population: a founder effect, which is drift.', 'Survival and reproduction depend on the allele: natural selection.', 'Alleles move between populations: gene flow.'][d[1]], 'Answer: <b>' + DK[d[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var q = R.pick([
      ['Which statement about genetic drift is correct?', 'It changes allele frequencies at random and can fix a harmful allele, especially in small populations.', ['It always increases the frequency of helpful alleles.', 'It only happens in very large populations.', 'It adds new alleles to a population.']],
      ['Two populations of the same species, one of 25 and one of 25,000, face no selection. Which is more affected by drift?', 'The population of 25', ['The population of 25,000', 'Both equally', 'Neither: drift needs selection']],
      ['After a bottleneck, what usually happens to genetic variation?', 'It decreases: some alleles are lost by chance.', ['It increases, because survivors are the fittest.', 'It stays the same.', 'It doubles, because the population recovers.']],
      ['An allele that slightly helps survival is lost from a small island population. What is the most likely cause?', 'Genetic drift: in a small population, chance can remove even helpful alleles', ['Natural selection against the allele', 'Gene flow bringing the allele in', 'Mutation creating the allele']]]);
      return { q: q[0], viz: { name: 'apbio-drift', opts: { N: 10, pops: 6, gens: 40, quiet: true, interactive: false, seed: R.int(1, 50) } }, a: mc(R, q[1], q[2]), hint: 'Drift is chance, and chance matters most when numbers are small.',
        steps: ['Drift is random sampling of alleles from one generation to the next; it ignores fitness.', 'Its effects are strongest in small populations, where alleles are easily lost or fixed.', 'Answer: ' + q[1]] }; }
    var n = R.int(8, 15), BB = R.int(0, n - 2), Bb = R.int(1, n - BB), bb = n - BB - Bb, pf = (2 * BB + Bb) / (2 * n), src = R.pick([0.3, 0.4, 0.5, 0.6]);
    return { q: 'On the mainland, allele B has frequency ' + src + '. ' + n + ' individuals found a new island population: ' + BB + ' BB, ' + Bb + ' Bb and ' + bb + ' bb. What is the frequency of B on the island?', a: num(pf, 0.005),
      hint: 'Count B alleles out of 2 × ' + n + '.', steps: ['B alleles: $2(' + BB + ') + ' + Bb + ' = ' + (2 * BB + Bb) + '$ of $' + 2 * n + '$.', '$p = ' + (2 * BB + Bb) + '/' + 2 * n + ' = ' + f(pf, 3) + '$, compared with ' + src + ' on the mainland: ' + (M.abs(pf - src) < 0.005 ? 'by luck, the same.' : 'a change by chance alone (founder effect).')] };
  });

  G('apbio.molecular-clock', function (R, ctx) {
    var L = lv(ctx), gene = R.pick(['a gene for a respiratory enzyme', 'a stretch of mitochondrial DNA', 'a gene for a ribosomal RNA', 'the gene for hemoglobin\'s β chain', 'a non-coding stretch of DNA']);
    var t0 = R.pick([10, 20, 30, 40, 50, 60]), rate = R.pick([0.5, 1, 1.5, 2, 3, 4]), d0 = t0 * rate;
    if (L === 1) { var sh = R.coin();
      if (sh) return { q: 'Fossils show that two species split ' + t0 + ' million years ago. In ' + gene + ', they differ at ' + f(d0, 0) + ' sites. What is the rate, in differences per million years?', a: num(rate, 0.01), unit: 'per million years', hint: 'Rate = differences ÷ time.',
        steps: ['$' + f(d0, 0) + ' / ' + t0 + ' = ' + f(rate, 2) + '$ differences per million years.'] };
      var dx = R.int(3, 80); return { q: 'In ' + gene + ', differences between species build up at about ' + rate + ' per million years. Two species differ at ' + f(dx, 0) + ' sites. About how long ago did their lineages split?', a: num(dx / rate, 0.01), unit: 'million years',
        hint: 'Time = differences ÷ rate.', steps: ['$' + f(dx, 0) + ' / ' + rate + ' = ' + f(dx / rate, 1) + '$ million years ago (an estimate with a range).'] }; }
    if (L === 2) { var q = R.pick([
      ['Two genes give different split dates for the same two lineages: 12 and 18 million years. What is the best interpretation?', 'Both are estimates; genes change at different rates, so dates have ranges and need several genes and calibrations.', ['One gene must contain an error in the DNA.', 'The species split twice.', 'Molecular clocks do not work at all.']],
      ['Why must a molecular clock be calibrated with fossils?', 'Each gene changes at its own rate, which must be measured against a split of known age.', ['DNA cannot be compared without fossils.', 'Fossils contain the DNA used in the clock.', 'Calibration makes the clock exact.']],
      ['Which gene would be best for dating a split that happened about 2 million years ago?', 'A fast-changing stretch of DNA', ['A very slowly changing gene', 'Any gene: all change at the same rate', 'No gene can date recent splits']],
      ['Why do many differences between species build up at a roughly steady rate?', 'Many mutations are neutral, and neutral changes become fixed at a rate set by the mutation rate.', ['Natural selection adds one change per year.', 'Every mutation is harmful.', 'DNA changes only when a species splits.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'A clock is an estimate whose rate differs between genes.', steps: ['Molecular clocks rely on roughly steady accumulation of mostly neutral changes.', 'Rates differ between genes and lineages, so clocks are calibrated with fossils and give ranges.', 'Answer: ' + q[1]] }; }
    var dC = R.int(3, M.max(6, M.round(d0 * 1.5)));
    return { q: 'Fossils date the split of species A and B to ' + t0 + ' million years ago; they differ at ' + f(d0, 0) + ' sites in ' + gene + '. Species A and C differ at ' + dC + ' sites in the same gene. Estimate when A and C split.', a: num(dC / rate, 0.01), unit: 'million years',
      viz: { name: 'bi-chart', opts: { kind: 'scatter', x: [0, t0], series: [{ name: 'Calibration', values: [0, d0] }], xlabel: 'Millions of years since split', ylabel: 'Differences', ymin: 0, quiet: true, interactive: false } },
      hint: 'First find the rate from A and B; then divide.', steps: ['Rate: $' + f(d0, 0) + ' / ' + t0 + ' = ' + f(rate, 2) + '$ per million years.', 'A and C: $' + dC + ' / ' + f(rate, 2) + ' = ' + f(dC / rate, 1) + '$ million years ago (roughly).'] };
  });

  function treeText(o) { return o[0] + ' and ' + o[1] + ' are closest relatives; ' + o[2] + ' is next; ' + o[3] + ' branched off first'; }
  G('apbio.trees-from-data', function (R, ctx) {
    var L = lv(ctx), sets = [['species A', 'species B', 'species C', 'species D'], ['beetle W', 'beetle X', 'beetle Y', 'beetle Z'], ['lizard P', 'lizard Q', 'lizard R', 'lizard S'], ['fern 1', 'fern 2', 'fern 3', 'fern 4'], ['snail K', 'snail L', 'snail M', 'snail N']];
    var names = R.shuffle(R.pick(sets)), ord = names.slice(); // ord[0], ord[1] closest; ord[2] next; ord[3] outgroup
    var d01 = R.int(1, 4), d2 = d01 + R.int(2, 5), d3 = d2 + R.int(2, 6);
    function dist(a, b) { var i = ord.indexOf(a), j = ord.indexOf(b), lo = M.min(i, j), hi = M.max(i, j); return hi === 1 ? d01 : hi === 2 ? d2 : d3; }
    var shown = R.shuffle(ord.slice()), rows = shown.map(function (a) { return shown.map(function (b) { return a === b ? '—' : dist(a, b); }); });
    var table = shown.map(function (a, i) { return a + ': ' + shown.map(function (b, j) { return i === j ? null : b + ' ' + rows[i][j]; }).filter(Boolean).join(', '); }).join('; ');
    if (L === 1) { var pairs = []; for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) pairs.push([ord[i], ord[j]]);
      var right = ord[0] + ' and ' + ord[1], wr = R.sample(pairs.filter(function (p) { return !(p[0] === ord[0] && p[1] === ord[1]); }), 3).map(function (p) { return p[0] + ' and ' + p[1]; });
      return { q: 'Differences in a stretch of DNA between four related species — ' + table + '. Which two share the most recent common ancestor?', a: mc(R, right, wr), hint: 'Look for the smallest number.',
        steps: ['The fewest differences (' + d01 + ') are between ' + right + '.', 'So <b>' + right + '</b> share the most recent common ancestor.'] }; }
    if (L === 2) { var q = R.pick([
      ['A new study adds 50 genes and moves one branch of a well-known tree. What does that show?', 'Trees are hypotheses that new data can revise.', ['The old tree was a fraud.', 'Evolution did not happen.', 'Trees can never be tested.']],
      ['Parsimony chooses between possible trees by preferring the one that…', 'needs the fewest evolutionary changes', ['has the most branches', 'puts the most familiar species together', 'needs the most changes']],
      ['On a tree, which pair is most closely related?', 'The pair with the most recent common ancestor', ['The pair drawn next to each other', 'The pair with the most similar names', 'The pair at the top of the page']],
      ['What is an outgroup used for when building a tree?', 'To show which traits are ancestral, so derived traits can be identified', ['To add more species to the group', 'To make the tree longer', 'To measure the molecular clock']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'A tree is the best current hypothesis about relationships.', steps: ['Trees are built from data, choosing the simplest explanation (parsimony) and using an outgroup to tell ancestral from derived traits.', 'They are hypotheses: new data can move a branch.', 'Answer: ' + q[1]] }; }
    var right3 = treeText(ord), wrongs = [[ord[0], ord[2], ord[1], ord[3]], [ord[2], ord[3], ord[1], ord[0]], [ord[1], ord[2], ord[0], ord[3]]].map(treeText);
    return { q: 'Differences in a stretch of DNA between four species — ' + table + '. Which tree do the data support?', a: mc(R, right3, wrongs),
      hint: 'Join the closest pair, then add the next closest, then the most different.',
      steps: ['Closest: ' + ord[0] + ' and ' + ord[1] + ' (' + d01 + ').', 'Next: ' + ord[2] + ' (' + d2 + ' from both).', 'Most different: ' + ord[3] + ' (' + d3 + '), so it branched off first.', 'Tree: <b>' + right3 + '</b>.'] };
  });

  var SPEC = [['A clam species shows almost no change for 5 million years, then a new form appears within about 50,000 years and stays stable.', 1], ['A line of plankton fossils shows shell size increasing slowly and steadily over 10 million years.', 0], ['Soon after reaching a remote island group, one finch species gives rise to many species with different beaks.', 2],
    ['After the end-Cretaceous extinction, mammals diversify into many new forms filling empty niches.', 2], ['Over a short interval, about half of all marine animal families disappear from the fossil record.', 3], ['A trilobite lineage stays the same for millions of years, then a new species appears relatively quickly.', 1], ['Horse teeth change gradually over millions of years as grasslands spread.', 0]];
  var SK = ['Gradualism', 'Punctuated equilibrium', 'Adaptive radiation', 'Mass extinction'];
  G('apbio.speciation-patterns', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var s = R.pick(SPEC); return { q: 'Which pattern does this describe? ' + s[0], a: { t: 'mc', choices: SK, v: s[1], keep: true }, hint: 'Slow and steady, stasis then bursts, one ancestor into many niches, or a big loss?',
      steps: [['Slow, steady change: gradualism.', 'Long stability broken by relatively quick change: punctuated equilibrium.', 'One ancestor quickly gives rise to many species in open niches: adaptive radiation.', 'A large share of life lost in a short interval: a mass extinction.'][s[1]], 'Answer: <b>' + SK[s[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var stasis = R.pick([2, 3, 4, 5, 6]), burst = R.pick([20, 40, 50, 80, 100]);
      return { q: 'In a fossil lineage, a species is unchanged for ' + stasis + ' million years, then a new form appears over about ' + burst + ',000 years. As a percent of the stable period, how long did the change take?', a: Object.assign(num(100 * burst / (stasis * 1000), 0.01), { pct: true }),
        hint: 'Put both in the same units: ' + stasis + ' million = ' + f(stasis * 1000, 0) + ' thousand years.', steps: ['$' + burst + ',000 / ' + f(stasis * 1000000, 0) + ' = ' + f(burst / (stasis * 1000), 4) + '$.', 'That is ' + f(100 * burst / (stasis * 1000), 2) + '% of the stable period: "rapid" on a geological scale, though still tens of thousands of years.'] }; }
    var fam0 = R.int(30, 50) * 10, lost = R.pick([0.4, 0.5, 0.6, 0.7]), fam1 = M.round(fam0 * (1 - lost)), fam2 = M.round(fam0 * R.pick([0.8, 0.9, 1.0, 1.1]));
    var ts = ['260', '252', '245', '230'], vals = [fam0, fam1, M.round((fam1 + fam2) / 2), fam2];
    return { q: 'Marine animal families in the fossil record: ' + ts.map(function (t, i) { return t + ' million years ago: ' + vals[i]; }).join('; ') + '. What percent of families were lost in the drop, and what happened afterward?',
      viz: { name: 'bi-chart', opts: { kind: 'line', x: [-260, -252, -245, -230], series: [{ name: 'Families', values: vals }], xlabel: 'Millions of years (negative = ago)', ylabel: 'Families', ymin: 0, quiet: true, interactive: false } },
      a: { t: 'multi', parts: [{ label: 'percent lost', a: Object.assign(num(100 * (fam0 - fam1) / fam0, 0.01), { pct: true }) }, { label: 'afterward', a: mc(R, 'Diversity recovered as surviving groups radiated into empty niches.', ['Diversity stayed low forever.', 'The lost families came back unchanged.']) }] },
      hint: 'Percent lost = (before − after) ÷ before × 100.', steps: ['$(' + fam0 + ' - ' + fam1 + ')/' + fam0 + ' = ' + f((fam0 - fam1) / fam0, 3) + '$, so about ' + f(100 * (fam0 - fam1) / fam0, 1) + '% were lost: a mass extinction (this timing matches the end-Permian, about 252 million years ago).', 'The count then rose to ' + fam2 + ': survivors radiated into the empty niches. Extinct families do not return.'] };
  });

  var EVENTS = [['Earth forms', 4540], ['the oldest widely accepted fossils of microbes (stromatolites)', 3500], ['oxygen begins to build up in the air', 2400], ['the Cambrian Period begins', 540], ['the end-Cretaceous mass extinction', 66]];
  G('apbio.origin-of-life', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var sh = R.coin();
      if (sh) { var ev = R.sample(EVENTS, 3), ord = ev.slice().sort(function (a, b) { return b[1] - a[1]; }), LT = 'ABC', right = ord.map(function (e) { return LT[ev.indexOf(e)]; }).join('');
        var wr = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'].filter(function (x) { return x !== right; });
        return { q: 'Put these in order, earliest first: ' + ev.map(function (e, i) { return LT[i] + '. ' + cap(e[0]); }).join('; ') + '.', a: mc(R, right, R.sample(wr, 3)), hint: 'Earth formed about 4.5 billion years ago; microbial fossils go back about 3.5 billion.',
          viz: { name: 'apbio-timeline', opts: { events: EVENTS.map(function (e, i) { return { t: e[1], text: '?', key: i }; }), quiet: true, interactive: false, px: 0.05 } },
          steps: ord.map(function (e) { return cap(e[0]) + ': about ' + (e[1] >= 1000 ? f(e[1] / 1000, 2) + ' billion' : e[1] + ' million') + ' years ago.'; }).concat(['Order: <b>' + right + '</b>.']) }; }
      var q = R.pick([['About how old is Earth?', 'About 4.5 billion years', ['About 6,000 years', 'About 450 million years', 'About 45 billion years']], ['About how old are the oldest widely accepted fossils of life?', 'About 3.5 billion years', ['About 540 million years', 'About 66 million years', 'About 4.6 billion years']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Earth: about 4.5 billion years; microbial fossils: about 3.5 billion.', steps: ['Earth is about 4.54 billion years old (USGS); stromatolites, fossils of microbial mats, date to about 3.5 billion years ago.', 'Answer: ' + q[1] + '.'] }; }
    if (L === 2) { var q2 = R.pick([
      ['What did the Miller-Urey experiment produce?', 'Amino acids and other simple organic molecules', ['Living bacteria', 'DNA that could copy itself', 'Complete cells with membranes']],
      ['Which statement about the origin of life is most accurate?', 'How the first cells arose is still an open question, studied with hypotheses such as an RNA world.', ['It was settled by the Miller-Urey experiment.', 'Scientists have made living cells from simple gases.', 'Life is known to have begun 6 billion years ago.']],
      ['Why is RNA a good candidate for early life\'s first genetic molecule?', 'RNA can both store information and act as an enzyme (a ribozyme).', ['RNA is more stable than DNA.', 'RNA is made of amino acids.', 'RNA needs no building blocks.']]]);
      return { q: q2[0], a: mc(R, q2[1], q2[2]), hint: 'Building blocks form readily; the steps to self-copying cells are still being researched.', steps: ['Miller and Urey (1952) made amino acids from gases and sparks, not cells.', 'The RNA world hypothesis rests on RNA\'s ability to store information and catalyze reactions.', 'The origin of the first cells is an active research question.', 'Answer: ' + q2[1]] }; }
    var a = R.sample(EVENTS.slice(0, 4), 2).sort(function (x, y) { return y[1] - x[1]; });
    if (R.coin()) return { q: 'About how many million years passed between these two events: ' + a[0][0] + ' (about ' + f(a[0][1], 0) + ' million years ago) and ' + a[1][0] + ' (about ' + f(a[1][1], 0) + ' million years ago)?', a: num(a[0][1] - a[1][1], 0.01), unit: 'million years',
      hint: 'Subtract the two ages.', steps: ['$' + f(a[0][1], 0) + ' - ' + f(a[1][1], 0) + ' = ' + f(a[0][1] - a[1][1], 0) + '$ million years.'] };
    return { q: 'Which observations support the hypothesis that RNA came before DNA and proteins? Choose all that apply.', a: mcAll(R, [['Some RNAs (ribozymes) can catalyze chemical reactions.', true], ['The catalytic core of the ribosome, which makes proteins, is RNA.', true], ['RNA can store genetic information, as it does in some viruses.', true], ['The Miller-Urey experiment produced living cells.', false], ['Proteins can copy themselves without any nucleic acid.', false]]),
      hint: 'Which facts show RNA doing both jobs: information and chemistry?', steps: ['RNA stores information (it is the genome of some viruses) and catalyzes reactions (ribozymes, the ribosome).', 'Miller-Urey made amino acids, not cells; proteins do not copy themselves.'] };
  });

  /* =================== Unit 9: Ecology =================== */
  var BEH = [['Moths fly straight toward a porch light.', 0], ['Trout turn to face upstream and swim against the current.', 0], ['Euglena (a single-celled protist) swims toward a bright spot in its dish.', 0], ['Cockroaches run away from light into dark corners.', 0],
    ['Pill bugs move faster and turn more in dry soil, and slow down in damp soil.', 1], ['Flatworms turn more often in bright light, so they end up gathering in shade.', 1], ['Woodlice wander quickly in low humidity and stay put in high humidity.', 1],
    ['A seedling on a windowsill bends toward the window.', 2], ['A root grows downward even when the pot is turned on its side.', 2], ['A tendril coils around a fence wire it touches.', 2],
    ['A plant flowers only once nights grow longer than a certain length.', 3], ['A plant flowers in midsummer, when nights are shortest.', 3],
    ['A honeybee forager dances a figure eight on the comb, showing other bees where food is.', 4], ['A ground squirrel gives an alarm call when a hawk flies over.', 4], ['Ants follow a scent trail laid by a nestmate to a food source.', 4]];
  var BK = ['Taxis', 'Kinesis', 'Tropism', 'Photoperiodism', 'Communication'];
  G('apbio.behavior-responses', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var b = R.pick(BEH); return { q: 'Which kind of response is this? ' + b[0], a: { t: 'mc', choices: BK, v: b[1], keep: true }, hint: 'Directed movement, a change in speed or turning, plant growth, night length, or a signal to others?',
      steps: [['Movement directly toward or away from a stimulus: a taxis.', 'A change in how much the animal moves or turns, with no set direction: a kinesis.', 'A plant growing toward or away from a stimulus: a tropism.', 'A response to the length of night: photoperiodism.', 'A signal that passes information to others: communication.'][b[1]], 'Answer: <b>' + BK[b[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var b2 = R.pick(BEH.filter(function (x) { return x[1] < 2; }));
      return { q: 'Taxis or kinesis? ' + b2[0], a: { t: 'mc', choices: ['Taxis: movement with a direction, toward or away from the stimulus', 'Kinesis: a change in the rate of movement or turning, with no set direction'], v: b2[1], keep: true },
        hint: 'Did the animal aim at the stimulus, or only change how much it moved?', steps: [b2[1] === 0 ? 'The animal moves directly toward or away from the stimulus: it has a direction.' : 'The animal only changes its speed or turning; it ends up where it moves least.', 'So it is <b>' + (b2[1] === 0 ? 'taxis' : 'kinesis') + '</b>.'] }; }
    var n = R.pick([20, 30, 40, 50, 60]), w = R.int(M.round(n * 0.5), M.round(n * 0.85)), d = n - w, e = n / 2, x2 = B().chi2([w, d], [e, e]), rej = x2 > 3.84;
    var side = R.pick([['damp', 'dry'], ['dark', 'bright'], ['leaf litter', 'bare sand']]);
    return { q: n + ' pill bugs are placed in a choice chamber with a ' + side[0] + ' side and a ' + side[1] + ' side. After 10 minutes, ' + w + ' are on the ' + side[0] + ' side and ' + d + ' on the ' + side[1] + ' side. Test the null hypothesis of no preference: find χ² and decide at p = 0.05.',
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: [cap(side[0]), cap(side[1])], series: [{ name: 'Observed', values: [w, d] }, { name: 'Expected (no preference)', values: [e, e] }], ylabel: 'Pill bugs', ymin: 0, quiet: true, interactive: false } },
      a: { t: 'multi', parts: [{ label: 'χ² =', a: num(x2, 0.01) }, { label: 'Conclusion', a: mc(R, rej ? 'Reject H₀: they prefer the ' + side[0] + ' side' : 'Fail to reject H₀: no clear preference', [rej ? 'Fail to reject H₀: no clear preference' : 'Reject H₀: they prefer the ' + side[0] + ' side']) }] },
      hint: 'Expected with no preference: half on each side. One degree of freedom: critical value 3.84.',
      steps: ['Expected: ' + e + ' and ' + e + '.', '$\\chi^2 = \\frac{(' + w + ' - ' + e + ')^2}{' + e + '} + \\frac{(' + d + ' - ' + e + ')^2}{' + e + '} = ' + f(x2, 3) + '$', f(x2, 2) + (rej ? ' > 3.84: reject the null; the pill bugs prefer the ' + side[0] + ' side.' : ' < 3.84: fail to reject; the data do not show a clear preference.')] };
  });

  var ANIM = [['shrew', 'endotherm', 0.005], ['mouse', 'endotherm', 0.03], ['rabbit', 'endotherm', 2], ['dog', 'endotherm', 20], ['horse', 'endotherm', 500], ['elephant', 'endotherm', 4000], ['lizard', 'ectotherm', 0.03], ['python', 'ectotherm', 20], ['frog', 'ectotherm', 0.03], ['goldfish', 'ectotherm', 0.03]];
  G('apbio.energy-budgets', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var sh = R.coin();
      if (sh) { var en = R.pick(ANIM.filter(function (a) { return a[1] === 'endotherm' && a[2] === 0.03; }).concat([['mouse', 'endotherm', 0.03]])), ec = R.pick(ANIM.filter(function (a) { return a[1] === 'ectotherm' && a[2] === 0.03; }));
        return { q: 'A 30-gram ' + en[0] + ' and a 30-gram ' + ec[0] + ' live side by side. Which needs more food energy per day, and why?', a: mc(R, 'The ' + en[0] + ': as an endotherm it spends much of its energy keeping its body warm.', ['The ' + ec[0] + ': ectotherms need more energy because they are cold.', 'Both need the same, because they have the same mass.', 'The ' + ec[0] + ', because it must warm itself in the sun.']),
          hint: 'Which one makes its own body heat?', steps: ['The ' + en[0] + ' is an endotherm and makes its own heat; the ' + ec[0] + ' is an ectotherm and gets heat from its surroundings.', 'Making heat costs a lot of energy, so the endotherm needs far more food.'] }; }
      var a = R.pick(ANIM); return { q: 'Is ' + aN(a[0]).toLowerCase() + ' an endotherm or an ectotherm?', a: { t: 'mc', choices: ['Endotherm', 'Ectotherm'], v: a[1] === 'endotherm' ? 0 : 1, keep: true }, hint: 'Birds and mammals are endotherms.',
        steps: ['Birds and mammals make their own body heat (endotherms); most fish, amphibians, reptiles and invertebrates take heat from the environment (ectotherms).', aN(a[0]) + ' is an <b>' + a[1] + '</b>.'] }; }
    if (L === 2) { var two = R.sample(ANIM.filter(function (a) { return a[1] === 'endotherm'; }), 2).sort(function (x, y) { return x[2] - y[2]; }), perg = R.coin();
      return { q: 'Compare ' + aN(two[0][0]).toLowerCase() + ' and ' + aN(two[1][0]).toLowerCase() + '. Which has the higher metabolic rate ' + (perg ? 'per gram of body mass' : 'for the whole animal') + '?', a: { t: 'mc', choices: [cap(two[0][0]), cap(two[1][0])], v: perg ? 0 : 1, keep: true },
        hint: perg ? 'Small endotherms have a high SA : V ratio and lose heat fast.' : 'A much bigger body uses more energy in total.',
        steps: [perg ? 'Per gram, the smaller animal (' + two[0][0] + ') burns energy faster: its high SA : V ratio loses heat quickly, so it must make heat quickly.' : 'In total, the larger animal (' + two[1][0] + ') uses more energy, even though its rate per gram is lower.', 'Answer: the <b>' + (perg ? two[0][0] : two[1][0]) + '</b>.'] }; }
    var eat = R.pick([200, 300, 400, 500, 600]), fec = M.round(eat * R.pick([0.3, 0.4, 0.5, 0.6])), resp = M.round((eat - fec) * R.pick([0.5, 0.6, 0.65, 0.7])), grow = eat - fec - resp, org = R.pick(['caterpillar', 'grasshopper', 'snail', 'deer mouse']);
    return { q: 'A ' + org + ' eats food containing ' + eat + ' J. It loses ' + fec + ' J in feces and uses ' + resp + ' J in cellular respiration. How much energy goes to growth, and what percent of the food energy is that?',
      a: { t: 'multi', parts: [{ label: 'growth', a: num(grow, 0.005), unit: 'J' }, { label: 'percent of food energy', a: Object.assign(num(100 * grow / eat, 0.01), { pct: true }) }] }, hint: 'Food − feces = absorbed; absorbed − respiration = growth.',
      steps: ['Absorbed: ' + eat + ' − ' + fec + ' = ' + (eat - fec) + ' J.', 'Growth: ' + (eat - fec) + ' − ' + resp + ' = ' + grow + ' J.', 'Percent: ' + grow + ' / ' + eat + ' = ' + f(100 * grow / eat, 1) + '%: only this part is food for the next trophic level.'] };
  });

  G('apbio.productivity', function (R, ctx) {
    var L = lv(ctx), I = R.pick([7, 7.5, 8, 8.5, 9]), npp = R.pick([0.8, 1, 1.2, 1.5, 2, 2.5]), r = R.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2]), Lt = +(I + npp).toFixed(2), Dk = +(I - r).toFixed(2);
    if (L === 1) { var g = +(npp + r).toFixed(2), sh = R.coin();
      if (sh) return { q: 'A grassland\'s producers capture ' + f(g * 1000, 0) + ' kcal/m² per year (GPP) and use ' + f(r * 1000, 0) + ' kcal/m² per year in respiration. What is the net primary productivity?', a: num(npp * 1000, 0.005), unit: 'kcal/m² per year',
        hint: 'NPP = GPP − R.', steps: ['NPP = ' + f(g * 1000, 0) + ' − ' + f(r * 1000, 0) + ' = ' + f(npp * 1000, 0) + ' kcal/m² per year.'] };
      return { q: 'In a pond, GPP is ' + g + ' mg O₂/L per day and NPP is ' + npp + ' mg O₂/L per day. What is the respiration of the producers?', a: num(r, 0.01), unit: 'mg O₂/L per day', hint: 'NPP = GPP − R, so R = GPP − NPP.',
        steps: ['R = GPP − NPP = ' + g + ' − ' + npp + ' = ' + f(r, 2) + ' mg O₂/L per day.'] }; }
    if (L === 2) { var ask = R.pick(['npp', 'r', 'gpp']), v = { npp: npp, r: r, gpp: npp + r }[ask];
      return { q: 'Pond water starts at ' + I + ' mg O₂/L. After 24 hours, a light bottle reads ' + Lt + ' and a dark bottle ' + Dk + '. What is the ' + { npp: 'net primary productivity', r: 'respiration', gpp: 'gross primary productivity' }[ask] + '?', a: num(v, 0.01), unit: 'mg O₂/L per day',
        viz: { name: 'apbio-bottles', opts: { initial: I, light: Lt, dark: Dk, quiet: true, ask: ask } }, hint: 'Light bottle = net; dark bottle = respiration; gross = net + respiration.',
        steps: ['NPP = light − start = ' + Lt + ' − ' + I + ' = ' + f(npp, 2) + '.', 'R = start − dark = ' + I + ' − ' + Dk + ' = ' + f(r, 2) + '.', 'GPP = NPP + R = ' + f(npp + r, 2) + ' (= light − dark).', 'Answer: <b>' + f(v, 2) + ' mg O₂/L per day</b>.'] }; }
    var hrs = R.pick([4, 5, 6, 8, 10, 12]), gain = R.int(4, 24) / 10, loss = R.int(2, 12) / 10, gph = (gain + loss) / hrs;
    return { q: 'In a ' + hrs + '-hour experiment, a light bottle of lake water gains ' + gain + ' mg O₂/L and a dark bottle loses ' + loss + ' mg O₂/L. Find the gross primary productivity per hour and the net primary productivity per hour.',
      a: { t: 'multi', parts: [{ label: 'GPP per hour', a: num(gph, 0.01), unit: 'mg O₂/L per hour' }, { label: 'NPP per hour', a: num(gain / hrs, 0.01), unit: 'mg O₂/L per hour' }] }, hint: 'Gross over the whole time = gain + loss; then divide by the hours.',
      steps: ['GPP over ' + hrs + ' h = ' + gain + ' + ' + loss + ' = ' + f(gain + loss, 2) + ' mg O₂/L; per hour: ' + f(gph, 3) + '.', 'NPP per hour: ' + gain + ' / ' + hrs + ' = ' + f(gain / hrs, 3) + '.'] };
  });

  var POPS = ['rabbits', 'deer', 'water fleas', 'yeast cells (in thousands)', 'beetles', 'sparrows', 'duckweed plants'];
  G('apbio.population-equations', function (R, ctx) {
    var L = lv(ctx), org = R.pick(POPS);
    if (L === 1) { var N = R.pick([50, 80, 100, 200, 250, 400, 500, 1000]), r = R.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.8]), sh = R.coin();
      if (sh) return { q: 'A population of ' + N + ' ' + org + ' grows exponentially with r = ' + r + ' per year. What is dN/dt?', a: num(r * N, 0.005), unit: 'per year', hint: 'dN/dt = rN.', steps: ['$\\frac{dN}{dt} = rN = ' + r + ' \\times ' + N + ' = ' + f(r * N, 2) + '$ per year.'] };
      var Bn = R.int(3, 6) * N / 10, Dn = R.int(1, 2) * N / 10, rr = (Bn - Dn) / N;
      return { q: 'In a year, a population of ' + N + ' ' + org + ' has ' + Bn + ' births and ' + Dn + ' deaths. What is its per-capita growth rate r?', a: num(rr, 0.005), unit: 'per year', hint: 'r = (births − deaths) / N.',
        steps: ['$r = \\frac{B - D}{N} = \\frac{' + Bn + ' - ' + Dn + '}{' + N + '} = ' + f(rr, 3) + '$ per year.'] }; }
    var K = R.pick([200, 500, 800, 1000, 2000, 5000]), r2 = R.pick([0.1, 0.2, 0.3, 0.4, 0.5]);
    if (L === 2) { if (R.coin()) { var opts = [K / 4, K / 2, 3 * K / 4, K], right = K / 2;
        return { q: 'A population of ' + org + ' grows logistically with K = ' + f(K, 0) + '. At which population size is it growing fastest?', a: mc(R, 'N = ' + f(right, 0), opts.filter(function (x) { return x !== right; }).map(function (x) { return 'N = ' + f(x, 0); })),
          viz: { name: 'bi-population', opts: { model: 'logistic', K: K, r: 0.5, N0: K / 50, T: 24, quiet: true, interactive: false } }, hint: 'dN/dt = rN(K − N)/K is largest halfway.',
          steps: ['At N = K, (K − N)/K = 0, so growth stops.', 'rN(K − N)/K is largest at N = K/2 = ' + f(right, 0) + '.'] }; }
      var Nk = R.pick([K, K]), rr2 = r2 * Nk * (K - Nk) / K;
      return { q: 'A population of ' + org + ' has reached its carrying capacity, N = K = ' + f(K, 0) + ', with r = ' + r2 + '. Using the logistic equation, what is dN/dt?', a: { t: 'num', v: '0' }, unit: 'per year', hint: 'What is (K − N)/K when N = K?',
        steps: ['$\\frac{dN}{dt} = rN\\frac{K - N}{K} = ' + r2 + ' \\times ' + f(K, 0) + ' \\times \\frac{0}{' + f(K, 0) + '} = 0$', 'At carrying capacity, births balance deaths: no growth.'] }; }
    var Nx = R.pick([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]) * K, dn = r2 * Nx * (K - Nx) / K, ex = r2 * Nx;
    return { q: 'A population of ' + f(Nx, 0) + ' ' + org + ' has r = ' + r2 + ' per year and K = ' + f(K, 0) + '. Find dN/dt for exponential growth and for logistic growth.',
      a: { t: 'multi', parts: [{ label: 'exponential', a: num(ex, 0.005), unit: 'per year' }, { label: 'logistic', a: num(dn, 0.005), unit: 'per year' }] }, hint: 'Exponential: rN. Logistic: rN(K − N)/K.',
      steps: ['Exponential: $' + r2 + ' \\times ' + f(Nx, 0) + ' = ' + f(ex, 2) + '$ per year.', 'Logistic: $' + f(ex, 2) + ' \\times \\frac{' + f(K, 0) + ' - ' + f(Nx, 0) + '}{' + f(K, 0) + '} = ' + f(ex, 2) + ' \\times ' + f((K - Nx) / K, 2) + ' = ' + f(dn, 2) + '$ per year.'] };
  });

  function andJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (a.length > 2 ? ',' : '') + ' and ' + a[a.length - 1]; }
  G('apbio.diversity-index', function (R, ctx) {
    var L = lv(ctx), sp = R.pick([['oaks', 'maples', 'pines', 'birches', 'hickories'], ['snails', 'water beetles', 'water striders', 'mayfly larvae', 'leeches'], ['clover', 'dandelions', 'grass', 'yarrow', 'plantain'], ['crabs', 'sea stars', 'mussels', 'barnacles', 'snails']]);
    if (L === 1) { var k = R.int(2, 3), cnt = []; for (var i = 0; i < k; i++) cnt.push(R.int(1, 10) * 5); var D = B().simpson(cnt), N = cnt.reduce(function (s, x) { return s + x; }, 0);
      return { q: 'A sample contains ' + andJoin(cnt.map(function (c, i) { return c + ' ' + sp[i]; })) + '. Calculate Simpson\'s diversity index, D = 1 − Σ(n/N)².', a: num(D, 0.01),
        hint: 'Find each fraction n/N, square it, add, and subtract from 1.', steps: ['N = ' + N + '.'].concat(cnt.map(function (c) { return '$(' + c + '/' + N + ')^2 = ' + f((c / N) * (c / N), 4) + '$'; })).concat(['$D = 1 - ' + f(1 - D, 4) + ' = ' + f(D, 3) + '$']) }; }
    if (L === 2) { var even = [25, 25, 25, 25], dom = R.pick([[85, 5, 5, 5], [70, 10, 10, 10], [55, 15, 15, 15], [91, 3, 3, 3]]), de = B().simpson(even), dd = B().simpson(dom);
      if (R.coin()) return { q: 'Site A has 25 each of four species. Site B has ' + dom.join(', ') + ' of the same four species. Which site is more diverse by Simpson\'s index?', a: mc(R, 'Site A (D = ' + f(de, 2) + ' versus ' + f(dd, 2) + '): same richness, but more even', ['Site B, because it has more of one species', 'They are equal, because both have four species', 'Site B, because ' + dom[0] + ' is larger than 25']),
        viz: { name: 'bi-chart', opts: { kind: 'bar', x: sp.slice(0, 4), series: [{ name: 'Site A', values: even }, { name: 'Site B', values: dom }], ylabel: 'Count', ymin: 0, quiet: true, interactive: false } },
        hint: 'Simpson\'s index rewards evenness as well as richness.', steps: ['A: $1 - 4(0.25)^2 = ' + f(de, 3) + '$.', 'B: $1 - (' + dom.map(function (x) { return '0.' + ('0' + x).slice(-2) + '^2'; }).join(' + ') + ') = ' + f(dd, 3) + '$.', 'Same number of species, but A is more even, so <b>site A</b> is more diverse.'] };
      var cnt2 = [R.int(2, 8) * 10, R.int(1, 6) * 10, R.int(1, 4) * 10], N2 = cnt2.reduce(function (s, x) { return s + x; }, 0), sumsq = cnt2.reduce(function (s, x) { return s + (x / N2) * (x / N2); }, 0);
      return { q: 'A student computes Σ(n/N)² = ' + f(sumsq, 3) + ' for a site with ' + andJoin(cnt2.map(function (c, i) { return c + ' ' + sp[i]; })) + ', and reports D = ' + f(sumsq, 3) + '. What is the correct value of D?', a: num(1 - sumsq, 0.01),
        hint: 'D = 1 − Σ(n/N)².', steps: ['The student forgot to subtract from 1.', '$D = 1 - ' + f(sumsq, 3) + ' = ' + f(1 - sumsq, 3) + '$.', 'Check: with only one species, D must be 0; higher D means more diverse.'] }; }
    var k3 = R.int(4, 5), c3 = []; for (var j = 0; j < k3; j++) c3.push(R.int(1, 12) * 2); var D3 = B().simpson(c3), N3 = c3.reduce(function (s, x) { return s + x; }, 0);
    return { q: 'A quadrat survey finds ' + andJoin(c3.map(function (c, i) { return c + ' ' + sp[i]; })) + '. Calculate Simpson\'s diversity index.', a: num(D3, 0.01),
      viz: { name: 'bi-chart', opts: { kind: 'bar', x: sp.slice(0, k3), series: [{ name: 'Count', values: c3 }], ylabel: 'Count', ymin: 0, quiet: true, interactive: false } }, hint: 'N is the total of all counts.',
      steps: ['N = ' + N3 + '.', 'Σ(n/N)² = ' + c3.map(function (c) { return f((c / N3) * (c / N3), 4); }).join(' + ') + ' = ' + f(1 - D3, 4) + '.', '$D = 1 - ' + f(1 - D3, 4) + ' = ' + f(D3, 3) + '$'] };
  });

  G('apbio.community-structure', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var s = R.pick([
      ['Sea otters eat sea urchins, which graze kelp. Otters are removed from an area. What happens to the kelp?', 'It decreases, because urchins increase and graze more.', ['It increases, because otters ate kelp.', 'Nothing changes, because otters do not eat kelp.', 'It increases, because urchins disappear.']],
      ['A sea star that eats mussels is removed from tide pools. What happens to the number of other species there?', 'It falls, as mussels crowd out other species.', ['It rises, because the predator is gone.', 'It stays the same.', 'It doubles, because mussels feed them.']],
      ['Beavers build a dam across a stream. What is the best description of their role?', 'Ecosystem engineers: they create new pond and wetland habitat.', ['Producers', 'Decomposers', 'Invasive species']],
      ['A plant brought to a new continent spreads quickly and crowds out native plants. What is it called?', 'An invasive species', ['A keystone species', 'A producer that is native', 'An ecosystem engineer that restores habitat']]]);
      return { q: s[0], a: mc(R, s[1], s[2]), hint: 'Follow the effects down (or across) the food web.', steps: ['Predators can control herbivores (top-down), keystone species have outsized effects, and engineers build habitat.', 'Answer: ' + s[1]] }; }
    if (L === 2) { var q = R.pick([
      ['Fertilizer runoff adds nitrogen and phosphorus to a lake. What usually happens over the next weeks?', 'Algae bloom, then die; decomposers use up the oxygen, and fish may die.', ['The lake becomes healthier, with more fish.', 'Nothing changes, because nutrients do not affect lakes.', 'Oxygen rises steadily and stays high.']],
      ['Which statement about nutrients in an ecosystem is correct?', 'Adding nutrients can harm a community, as when extra phosphorus causes an algal bloom.', ['Adding nutrients always makes a community healthier.', 'Nutrients matter only on land.', 'Only predators control communities.']],
      ['What is bottom-up control of a community?', 'Producers, limited by nutrients, limit the levels that eat them.', ['Predators limit their prey.', 'Decomposers eat the top predators.', 'Invasive species replace natives.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'More algae is not the same as a healthier lake.', steps: ['Extra nutrients feed a bloom of algae; when they die, decomposers respire and use up dissolved oxygen (eutrophication).', 'Answer: ' + q[1]] }; }
    var web = R.pick(['meadow', 'pond', 'forest', 'desert']), W = B().WEBS[web], cons = W.nodes.filter(function (n) { return B().eats(web, n).length && B().eatenBy(web, n).length; }), k = R.pick(cons), eff = B().removeEffect(web, k);
    var ups = Object.keys(eff).filter(function (x) { return eff[x] === 'up'; }), downs = Object.keys(eff).filter(function (x) { return eff[x] === 'down'; });
    var nm = function (x) { return B().THINGS[x].name; }, tr = [], fa = [];
    ups.forEach(function (x) { tr.push(['The ' + nm(x) + ' population rises at first.', true]); });
    downs.forEach(function (x) { tr.push(['The ' + nm(x) + ' population falls at first.', true]); });
    ups.slice(0, 1).forEach(function (x) { fa.push(['The ' + nm(x) + ' population falls at first.', false]); });
    fa.push(['Every other species in the web is unaffected.', false]);
    var items = R.sample(tr, M.min(3, tr.length)).concat(fa);
    return { q: 'In this ' + web + ' food web, the ' + nm(k) + ' population is removed. Choose all the first effects that are correct.', viz: { name: 'bi-foodweb', opts: { web: web, interactive: false, highlight: [k] } },
      a: mcAll(R, items), hint: 'Its food is released from being eaten; animals that depend on it alone lose food.',
      steps: ['The ' + nm(k) + ' eats ' + B().eats(web, k).map(nm).join(' and ') + ', and is eaten by ' + B().eatenBy(web, k).map(nm).join(' and ') + '.', 'Its prey increase at first' + (ups.length ? ' (' + ups.map(nm).join(', ') + ')' : '') + '. Predators that rely on it alone decrease' + (downs.length ? ' (' + downs.map(nm).join(', ') + ')' : '') + '; those with other food may switch.', 'Effects then spread through the rest of the web.'] };
  });

  G('apbio.ecosystem-disruptions', function (R, ctx) {
    var L = lv(ctx);
    if (L === 1) { var d = R.pick([['Zebra mussels from Eurasia spread through North American lakes, crowding out native mussels.', 0], ['A forest is cut into small patches separated by farms and roads.', 1], ['Runoff of fertilizer causes algal blooms and low oxygen in a bay.', 2], ['A fungal blight kills most of the chestnut trees in a forest.', 3], ['Warmer seawater makes corals expel the algae that live in them.', 4], ['Cane toads, brought to a new continent, poison the predators that eat them.', 0], ['A wetland is drained and paved for a parking lot.', 1]]);
      var DK2 = ['Invasive species', 'Habitat loss or fragmentation', 'Pollution', 'Disease', 'A change in climate'];
      return { q: 'Which kind of disruption is this? ' + d[0], a: { t: 'mc', choices: DK2, v: d[1], keep: true }, hint: 'A newcomer, lost habitat, a pollutant, a pathogen, or temperature?', steps: ['This is an example of <b>' + DK2[d[1]].toLowerCase() + '</b>.'] }; }
    if (L === 2) { var q = R.pick([
      ['A new disease arrives. Which population is most likely to survive it?', 'A large population with much genetic variation', ['A population of genetically identical clones', 'A small population that passed through a bottleneck', 'A population with no variation in disease-related genes']],
      ['Temperatures rise on a mountain. Which species is most at risk?', 'A plant that lives only in the cool zone at the summit', ['A weed that grows in many habitats', 'A widespread grass', 'A bird that lives on several continents']],
      ['Which statement about ecosystem disruptions is correct?', 'They affect species unequally; specialists and species with little genetic variation are hit hardest.', ['Every species is affected equally.', 'Only predators are affected.', 'Generalists always go extinct first.']]]);
      return { q: q[0], a: mc(R, q[1], q[2]), hint: 'Selection needs variation; specialists have nowhere else to go.', steps: ['Disruptions hit species with narrow niches, small ranges or little genetic variation hardest.', 'A varied population is more likely to contain individuals that survive the change.', 'Answer: ' + q[1]] }; }
    var N = R.pick([1000, 2000, 5000]), pr = R.pick([0.02, 0.03, 0.05, 0.1]), kill = R.pick([0.8, 0.9, 0.95]), prot = N * pr, unp = N - prot, surv = unp * (1 - kill), tot = prot + surv;
    var host = R.pick(['snails', 'frogs', 'elm trees', 'rabbits', 'bats']);
    return { q: 'In a population of ' + f(N, 0) + ' ' + host + ', ' + f(100 * pr, 0) + '% carry an allele that protects them from a new disease. The disease kills ' + f(100 * kill, 0) + '% of unprotected individuals and none of the protected ones. How many survive, and what percent of the survivors carry the allele?',
      a: { t: 'multi', parts: [{ label: 'survivors', a: num(tot, 0.005) }, { label: 'percent protected', a: Object.assign(num(100 * prot / tot, 0.01), { pct: true }) }] }, hint: 'Protected ones all survive; work out the survivors among the unprotected.',
      steps: ['Protected: ' + f(100 * pr, 0) + '% of ' + f(N, 0) + ' = ' + f(prot, 0) + '; all survive.', 'Unprotected: ' + f(unp, 0) + '; ' + f(100 * (1 - kill), 0) + '% survive = ' + f(surv, 0) + '.', 'Survivors: ' + f(tot, 0) + '; protected share: ' + f(prot, 0) + ' / ' + f(tot, 0) + ' = ' + f(100 * prot / tot, 1) + '%. Variation let the population survive, and selection raised the allele\'s frequency.'] };
  });
})(window.MathLadder);
