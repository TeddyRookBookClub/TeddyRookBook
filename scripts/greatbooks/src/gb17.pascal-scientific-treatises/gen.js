/* Pascal: The Scientific Treatises. Bank (history and ideas) plus computed families: the arithmetical triangle,
   row sums, diagonal sums, the problem of points, barometer columns, pressure at depth and the hydraulic press.
   Every computed problem carries chk (its inputs) so scripts can recompute the answer independently. */
var ID = 'gb17.pascal-scientific-treatises';
function grp(n) { var s = String(n), neg = s[0] === '-'; if (neg) s = s.slice(1); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '−' : '') + p.join('.'); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function C(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
function order(R, q, items, why) {
  var L = 'ABCDEF', idx = R.shuffle(items.map(function (_, i) { return i; }));
  if (idx.every(function (v, i) { return v === i; })) idx.reverse();
  var lines = idx.map(function (i, j) { return '<b>' + L[j] + '.</b> ' + items[i][1]; });
  var ans = items.map(function (_, k) { return L[idx.indexOf(k)]; }).join('');
  return { q: q + '<br>' + lines.join('<br>') + '<br>Type the letters in order, earliest first (for example ' + L.slice(0, items.length).split('').reverse().join('') + ').',
    a: { t: 'text', v: [ans, ans.split('').join(' '), ans.split('').join(', '), ans.split('').join(','), ans.split('').join('-')] },
    steps: [why || 'In order:'].concat(items.map(function (it, k) { return L[idx.indexOf(k)] + ': ' + it[1] + ' (' + it[0] + ')'; })).concat(['So the answer is ' + ans + '.']) };
}
var EVENTS = [
  ['1586', 'Simon Stevin shows that a liquid presses on its base according to its depth'],
  ['1643–1644', 'Torricelli and Viviani balance a column of mercury in a glass tube'],
  ['1647', 'Pascal publishes New Experiments Concerning the Vacuum'],
  ['1648', 'Florin Périer carries the mercury tube up the Puy de Dôme'],
  ['1654', 'Pascal and Fermat write letters about the problem of points'],
  ['1662', 'Pascal dies in Paris, aged 39'],
  ['1663', 'the treatises on liquids and on the weight of the air are printed'],
  ['1665', 'the Treatise on the Arithmetical Triangle is published']
];
function famOrder(R) { var k = R.int(3, 4), pick = R.sample(EVENTS.map(function (e, i) { return i; }), k).sort(function (a, b) { return a - b; }); return order(R, 'Put these events in order.', pick.map(function (i) { return EVENTS[i]; }), 'Dates help:'); }
function famFirst(R) {
  var ij = R.sample([0, 1, 2, 3, 4, 5, 6, 7], 2).sort(function (a, b) { return a - b; }), early = R.coin();
  var a = EVENTS[ij[early ? 0 : 1]], b = EVENTS[ij[early ? 1 : 0]];
  if (a[0] === b[0]) return null;
  return H.mc('Which happened ' + (early ? 'first' : 'later') + '?', a[1], [b[1]], [a[1] + ': ' + a[0] + '. ' + b[1] + ': ' + b[0] + '.']);
}
function famCell(R, lv) {
  var n = lv === 1 ? R.int(3, 6) : lv === 2 ? R.int(5, 9) : R.int(8, 13), k = R.int(1, n - 1), v = C(n, k);
  if (R.coin()) {
    return num('In Pascal’s triangle, counting the top row as row 0 and the first place in each row as place 0, what number is in row ' + n + ', place ' + k + '?', v, '',
      ['Each number is the sum of the two above it: $' + C(n - 1, k - 1) + ' + ' + C(n - 1, k) + ' = ' + v + '$.', 'Or use the formula: $\\binom{' + n + '}{' + k + '} = \\dfrac{' + n + '!}{' + k + '!\\,' + (n - k) + '!} = ' + texn(v) + '$.'],
      { hint: 'Build the triangle row by row, or use n! / (k!(n−k)!).', chk: { f: 'C', n: n, k: k } });
  }
  var things = R.pick([['flavors of ice cream', 'for a sundae'], ['books', 'to take on a trip'], ['friends', 'to invite to a picnic'], ['colors', 'for a flag'], ['games', 'to play on a rainy day']]);
  return num('You have ' + n + ' ' + things[0] + ' and want to choose ' + k + ' of them ' + things[1] + '. The order does not matter. How many different choices are there? (This is a number in Pascal’s triangle.)', v, '',
    ['The count is $\\binom{' + n + '}{' + k + '}$, row ' + n + ', place ' + k + ' of the triangle.', '$\\binom{' + n + '}{' + k + '} = ' + texn(v) + '$.'],
    { hint: 'Choosing k from n is the number in row n, place k.', chk: { f: 'C', n: n, k: k } });
}
function famRow(R, lv) {
  var n = lv === 1 ? R.int(3, 6) : R.int(6, 14), s = Math.pow(2, n);
  return num('What do all the numbers in row ' + n + ' of Pascal’s triangle add up to? (The top row, a single 1, is row 0.)', s, '',
    ['Each row adds up to twice the row before, because every number is passed down to two numbers below it.', 'So row ' + n + ' adds up to $2^{' + n + '} = ' + texn(s) + '$.'], { chk: { f: 'pow2', n: n } });
}
function famDiag(R, lv) {
  var k = R.int(1, lv === 3 ? 4 : 2), n = R.int(k + 3, k + (lv === 1 ? 4 : 7)), parts = [], t = 0;
  for (var i = k; i <= n; i++) { parts.push(C(i, k)); t += C(i, k); }
  return num('Add the numbers down a diagonal of Pascal’s triangle: ' + parts.join(' + ') + '. What is the total? (Pascal’s second consequence tells you without adding.)', t, '',
    ['These are $\\binom{' + k + '}{' + k + '}$ through $\\binom{' + n + '}{' + k + '}$.', 'A diagonal adds up to the number just below and to the right of its last cell: $\\binom{' + (n + 1) + '}{' + (k + 1) + '} = ' + texn(C(n + 1, k + 1)) + '$.'],
    { chk: { f: 'diag', n: n, k: k } });
}
function famPoints(R, lv) {
  var a = R.int(1, lv === 1 ? 1 : 2), b = R.int(a + 1, lv === 3 ? 4 : 3), n = a + b - 1, tot = Math.pow(2, n), win = 0;
  for (var j = a; j <= n; j++) win += C(n, j);
  var stake = tot * R.pick([1, 2, 3, 4]), share = stake * win / tot;
  var rows = []; for (j = a; j <= n; j++) rows.push('\\binom{' + n + '}{' + j + '}');
  return num('Two players each put in ' + (stake / 2) + ' coins, so the pot is ' + stake + '. Each round is a fair toss. They must stop when player A needs ' + a + ' more win' + (a > 1 ? 's' : '') + ' and player B needs ' + b + '. Using Pascal’s method, how many coins should A get?', share, 'coins',
    ['At most $' + a + ' + ' + b + ' - 1 = ' + n + '$ more rounds would settle the game. Imagine playing all ' + n + ': there are $2^{' + n + '} = ' + tot + '$ equally likely ways they could go.',
      'A wins the pot if A wins at least ' + a + ' of the ' + n + ' rounds: $' + rows.join(' + ') + ' = ' + win + '$ ways.',
      'A’s fair share is $\\tfrac{' + win + '}{' + tot + '} \\times ' + stake + ' = ' + share + '$ coins.'],
    { hint: 'Count the ways the remaining rounds could go, using one row of the triangle.', chk: { f: 'points', a: a, b: b, stake: stake } });
}
var RHO = [['mercury', 13600], ['water', 1000], ['seawater', 1030], ['olive oil', 920], ['red wine', 990]];
function famColumn(R, lv) {
  if (lv === 1 || R.coin()) {
    var cm = R.pick([76, 75, 74, 72, 70, 68, 64]), P = 13600 * 9.8 * cm / 100 / 1000;
    return num('A mercury barometer reads ' + cm + ' cm. Mercury has a density of 13,600 kg/m³; use $g = 9.8$ m/s². What is the air pressure, in kilopascals?', +P.toFixed(1), 'kPa',
      ['$P = \\rho g h = 13{,}600 \\times 9.8 \\times ' + (cm / 100) + '$.', '$P \\approx ' + texn(Math.round(P * 1000)) + '$ Pa, which is about ' + P.toFixed(1) + ' kPa.'], { rtol: 0.02, chk: { f: 'P', rho: 13600, h: cm / 100 } });
  }
  var L = R.pick(RHO.slice(1)), cm2 = R.pick([76, 74, 72]), h = 13.6 * cm2 / 100 * 1000 / L[1];
  return num('The air holds up ' + cm2 + ' cm of mercury (density 13,600 kg/m³). How tall a column of ' + L[0] + ' (density ' + grp(L[1]) + ' kg/m³) would it hold up? Give meters.', +h.toFixed(2), 'm',
    ['The same pressure balances both: $\\rho_1 h_1 = \\rho_2 h_2$, and $g$ cancels.', '$h = \\dfrac{13{,}600}{' + texn(L[1]) + '} \\times ' + (cm2 / 100) + ' \\approx ' + h.toFixed(2) + '$ m.',
      L[0] === 'red wine' ? 'Pascal really did this with wine in tubes taller than a house.' : 'Lighter liquids need much taller tubes, which is why Pascal’s water and wine tubes were so long.'],
    { rtol: 0.02, chk: { f: 'ratio', r1: 13600, h1: cm2 / 100, r2: L[1] } });
}
function famDepth(R, lv) {
  var L = R.pick([['fresh water', 1000], ['seawater', 1030]]), d = R.pick([2, 3, 5, 8, 10, 12, 20, 25, 40]), P = L[1] * 9.8 * d / 1000;
  return num('How much does the pressure rise ' + d + ' m down in ' + L[0] + ' (density ' + grp(L[1]) + ' kg/m³)? Use $g = 9.8$ m/s² and give kilopascals.', +P.toFixed(1), 'kPa',
    ['Pressure grows with depth only: $\\Delta P = \\rho g h = ' + texn(L[1]) + ' \\times 9.8 \\times ' + d + '$.', '$\\Delta P \\approx ' + texn(Math.round(P * 1000)) + '$ Pa $\\approx ' + P.toFixed(1) + '$ kPa. The width of the lake or tank makes no difference.'],
    { rtol: 0.02, chk: { f: 'P', rho: L[1], h: d } });
}
function famPress(R, lv) {
  var a1 = R.pick([1, 2, 4, 5]), k = R.pick([10, 20, 25, 40, 50, 100]), a2 = a1 * k, f1 = R.pick([20, 30, 40, 50, 60, 80]);
  if (lv === 3 && R.coin()) {
    var load = f1 * k;
    return num('In Pascal’s “machine for multiplying forces,” the large piston has an area of ' + a2 + ' cm² and the small one ' + a1 + ' cm². What force on the small piston holds up a load of ' + grp(load) + ' N on the large one?', f1, 'N',
      ['The pressure is the same everywhere: $F_1/A_1 = F_2/A_2$.', '$F_1 = ' + texn(load) + ' \\times \\dfrac{' + a1 + '}{' + a2 + '} = ' + f1 + '$ N.'], { chk: { f: 'press', F: load, A1: a2, A2: a1 } });
  }
  return num('A hydraulic press has a small piston of ' + a1 + ' cm² and a large piston of ' + a2 + ' cm². You push the small piston with ' + f1 + ' N. What force does the large piston give?', f1 * k, 'N',
    ['The pressure is the same everywhere in the liquid (Pascal’s principle): $F_1/A_1 = F_2/A_2$.', '$F_2 = ' + f1 + ' \\times \\dfrac{' + a2 + '}{' + a1 + '} = ' + texn(f1 * k) + '$ N.', 'The large piston moves only $\\tfrac{1}{' + k + '}$ as far, so no work is gained.'],
    { chk: { f: 'press', F: f1, A1: a1, A2: a2 } });
}
var B = {
  facts: [
    ['Florin Périer, Pascal’s brother-in-law, carried the mercury tube up the Puy de Dôme in 1648.', true, 'Pascal planned the test but could not travel; Périer did it with witnesses.'],
    ['Pascal climbed the Puy de Dôme himself with the barometer.', false, 'Périer carried out the climb at Pascal’s request.'],
    ['At the top of the mountain the mercury stood lower than in the town.', true, 'Less air above presses less, so it holds up a shorter column.'],
    ['Pascal invented the arithmetical triangle.', false, 'It was known centuries earlier in India, Persia and China, and in Europe from 1527. Pascal gave it a full theory.'],
    ['In China the triangle is called Yang Hui’s triangle.', true, 'After Yang Hui’s book of 1261, which credits Jia Xian.'],
    ['Torricelli made the first mercury tube with an empty space at the top, in 1643–1644.', true, 'Pascal heard of it in 1646 and extended it.'],
    ['Pascal argued that the effects blamed on nature’s horror of a vacuum are really caused by the weight of the air.', true, 'That is the main claim of his treatise on the weight of the air.'],
    ['In a closed vessel of water, a push on a small piston is felt only near that piston.', false, 'Pascal’s principle: the pressure is passed equally through the whole liquid.'],
    ['A tall thin tube of water presses on its base as hard as a wide tube of the same height.', true, 'Pressure depends on depth, not on the amount of liquid (Stevin, then Pascal).'],
    ['The treatises on the equilibrium of liquids and the weight of the air were printed in 1663, after Pascal’s death.', true, 'Pascal died in 1662.'],
    ['Pascal and Fermat’s letters of 1654 are often counted as the start of probability theory.', true, 'They solved the problem of points.'],
    ['Every row of Pascal’s triangle adds up to a power of 3.', false, 'A power of 2.'],
    ['Pascal wrote that the ancient thinkers should be respected, but that new experiments can show where they were wrong.', true, 'In the Preface to the Treatise on Vacuum.'],
    ['The SI unit of pressure is named after Pascal.', true, 'The pascal (Pa) is one newton per square meter.'],
    ['Descartes later claimed in letters that he had suggested the mountain test to Pascal.', true, 'Pascal never credited him; the question cannot be settled from the surviving evidence.'],
    ['A suction pump can lift water any height if it is strong enough.', false, 'The air can only hold up about 10 meters of water.']
  ],
  items: [
    { q: 'What did the Puy de Dôme experiment show?', r: ['The air has weight, and less of it presses down at a height'], w: ['Mercury evaporates on mountains', 'Nature abhors a vacuum', 'Cold air makes mercury shrink'], why: 'The mercury fell as the tube went up and rose again on the way down, while a tube left in town stayed the same.' },
    { q: 'Why did Périer leave a second tube in the town garden?', r: ['To check that the reading did not change during the day for some other reason'], w: ['Because the first tube might break', 'To measure the temperature', 'So the friars could have one'], why: 'It was a control: it stayed the same all day, so the change on the mountain came from the height.' },
    { q: 'What old teaching did Pascal’s vacuum experiments challenge?', r: ['Nature abhors a vacuum'], w: ['The Earth is round', 'Heavy things fall faster', 'The sun goes around the Earth'], why: 'Schools taught that nature will not allow an empty space; Pascal showed the effects come from the air’s weight.' },
    { q: 'Who first made the mercury tube that Pascal built on?', r: ['Evangelista Torricelli'], w: ['Galileo Galilei', 'René Descartes', 'Robert Boyle'], why: 'Torricelli, with Vincenzo Viviani, in Florence in 1643–1644.' },
    { q: 'What is the “problem of points”?', r: ['How to divide the stakes fairly when a game is stopped early'], w: ['How to score a game of tennis', 'How many points a triangle has', 'How to measure the height of a mountain'], why: 'Pascal and Fermat solved it in 1654 by counting the ways the game could have ended.' },
    { q: 'In Pascal’s triangle, how is each number made?', r: ['By adding the two numbers above it'], w: ['By doubling the number above it', 'By multiplying the two numbers above it', 'By counting the row number'], why: 'In Pascal’s words, each cell is the cell before it in its column plus the cell before it in its row.' },
    { q: 'What did Pascal call the hydraulic idea of a small piston balancing a large one?', r: ['A new machine for multiplying forces'], w: ['A perpetual motion machine', 'An arithmetic machine', 'A vacuum pump'], why: 'In the Treatise on the Equilibrium of Liquids.' },
    { q: 'Which method of proof does Pascal use clearly in his triangle treatise?', r: ['Mathematical induction'], w: ['Proof by picture', 'Proof by experiment', 'Proof by authority'], why: 'He proves a statement for the first case and then shows it passes from each case to the next.' },
    { q: 'What did the Jesuit Étienne Noël argue fills the space at the top of the tube?', r: ['A fine, invisible matter'], w: ['Mercury vapor only', 'Light from the sun', 'Nothing at all'], why: 'Pascal replied that an explanation no experiment can ever test is not an explanation.' },
    { q: 'Where is Pascal’s triangle found long before Pascal?', r: ['In India, Persia and China', 'In China, in Yang Hui’s book of 1261'], w: ['Only in ancient Egypt', 'Nowhere: Pascal invented it', 'In the Roman Empire only'], why: 'Halayudha (10th century), al-Karaji (around 1000), Jia Xian and Yang Hui (11th–13th centuries), and in Europe from 1527.' },
    { q: 'About how tall a column of water can the air hold up?', r: ['About 10 meters'], w: ['About 76 centimeters', 'About 1 meter', 'About 100 meters'], why: '13.6 times the 76 cm of mercury, because water is 13.6 times lighter.' },
    { q: 'What did Pascal mostly write about after 1654?', r: ['Religion and the life of faith'], w: ['Only physics', 'The history of France', 'Poetry about mountains'], why: 'The Provincial Letters and the Pensées, which have their own rungs.' }
  ]
};
H.T(ID, B, [famCell, famRow, famDiag, famPoints, famColumn, famDepth, famPress, famOrder, famFirst,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.6);
