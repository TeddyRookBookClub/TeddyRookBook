/* Lavoisier: Elements of Chemistry. Bank (history, the new names, the axiom) plus computed families: mass balance,
   Lavoisier's own combining ratios (charcoal 28 : 72, water 85 : 15), mercury calx, the mass a metal gains,
   percent composition, and old names to new. Computed problems carry chk (their inputs). */
var ID = 'gb18.lavoisier-elements-of-chemistry';
function sf(v, n) { return +(+v).toPrecision(n || 3); }
function r1(v) { return Math.round(v * 10) / 10; }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else if (o.tol) p.a.tol = o.tol; else p.a.form = 'int'; if (o.pct) p.a.pct = true; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
var RX = [
  ['iron', 'oxygen', 'iron oxide (rust)'], ['tin', 'oxygen', 'tin oxide (Lavoisier’s “calx of tin”)'], ['charcoal', 'oxygen', 'carbon dioxide'],
  ['hydrogen', 'oxygen', 'water'], ['sulfur', 'oxygen', 'sulfur dioxide'], ['phosphorus', 'oxygen', 'phosphorus oxide'], ['mercury', 'oxygen', 'red calx of mercury']
];
function famBalance(R, lv) {
  var rx = R.pick(RX), a = r1(R.int(20, 200) / 10), b = r1(R.int(10, 150) / 10), tot = r1(a + b), mode = lv === 1 ? 0 : R.int(0, 2);
  if (mode === 0) return num('In a sealed vessel, ' + a + ' g of ' + rx[0] + ' combines completely with ' + b + ' g of ' + rx[1] + ' to make ' + rx[2] + '. What mass of ' + rx[2].replace(/ \(.*\)$/, '') + ' is made?', tot, 'g',
    ['Lavoisier’s axiom: an equal quantity of matter exists before and after.', '$' + a + ' + ' + b + ' = ' + tot + '$ g.'], { tol: 0.05, chk: { f: 'sum', a: a, b: b } });
  if (mode === 1) return num('In a sealed vessel, ' + a + ' g of ' + rx[0] + ' combines with some ' + rx[1] + ' to make ' + tot + ' g of ' + rx[2].replace(/ \(.*\)$/, '') + ', with nothing left over. How much ' + rx[1] + ' was used?', b, 'g',
    ['Mass before = mass after, so the ' + rx[1] + ' is $' + tot + ' - ' + a + ' = ' + b + '$ g.'], { tol: 0.05, chk: { f: 'diff', a: tot, b: a } });
  var sealed = r1(R.int(1500, 4000) / 10);
  return num('A sealed glass flask with tin and air weighs ' + sealed + ' g. It is heated until the tin turns partly to calx, and then weighed again before it is opened. What does it weigh now?', sealed, 'g',
    ['Nothing has entered or left the sealed flask, so its mass is unchanged: ' + sealed + ' g.', 'Only when it is opened does air rush in and the weight go up. Lavoisier did exactly this in 1774.'], { tol: 0.05, chk: { f: 'same', a: sealed } });
}
function famCharcoal(R, lv) {
  var c = R.pick([7, 14, 21, 28, 35, 42, 56, 3.5, 10.5]), ox = c * 72 / 28, gas = c + ox;
  if (R.coin()) return num('Lavoisier found that 28 parts by weight of charcoal combine with 72 parts of oxygen. How many grams of oxygen are needed to burn ' + c + ' g of charcoal completely?', r1(ox), 'g',
    ['$' + c + ' \\times \\dfrac{72}{28} = ' + r1(ox) + '$ g.'], { tol: 0.05, chk: { f: 'ratio', x: c, a: 28, b: 72 } });
  return num('By Lavoisier’s figures (28 parts charcoal to 72 of oxygen), what mass of “carbonic acid” gas (carbon dioxide) comes from burning ' + c + ' g of charcoal?', r1(gas), 'g',
    ['Oxygen used: $' + c + ' \\times 72/28 = ' + r1(ox) + '$ g.', 'The gas weighs as much as both together: $' + c + ' + ' + r1(ox) + ' = ' + r1(gas) + '$ g.'], { tol: 0.05, chk: { f: 'ratioSum', x: c, a: 28, b: 72 } });
}
function famWater(R, lv) {
  var wt = R.pick([20, 40, 50, 60, 80, 100, 120, 200]), modern = lv > 1 && R.coin();
  var p = modern ? 0.1119 : 0.15, hy = wt * p;
  return num((modern ? 'Water is 11.19% hydrogen by mass (the modern value).' : 'Lavoisier reported water as 85 parts oxygen to 15 parts hydrogen by weight.') + ' How many grams of hydrogen are in ' + wt + ' g of water?' + (modern ? ' Give one decimal place.' : ''), r1(hy), 'g',
    [modern ? '$' + wt + ' \\times 0.1119 \\approx ' + r1(hy) + '$ g.' : '$' + wt + ' \\times \\dfrac{15}{100} = ' + r1(hy) + '$ g.', modern ? 'Lavoisier’s figure, 15%, was too high: weighing gases accurately was very hard in 1783.' : 'The modern value is 11.2%, so his figure was a little high.'],
    { tol: 0.06, chk: { f: 'pct', x: wt, p: p } });
}
var MM = { Hg: 200.59, O: 16.00, Sn: 118.71, Fe: 55.85, C: 12.01, H: 1.008, Cu: 63.55, Mg: 24.31 };
function famCalx(R, lv) {
  var m = R.pick([2.17, 4.33, 10.0, 21.7, 43.3, 5.0, 8.66]), mO = m * MM.O / (MM.Hg + MM.O), mHg = m - mO;
  if (R.coin()) return num('Heating red calx of mercury (mercury oxide, HgO) gives back mercury and oxygen. How many grams of oxygen come from ' + m + ' g of HgO? Use Hg = 200.59 and O = 16.00, and give two decimal places.', +mO.toFixed(2), 'g',
    ['Oxygen’s share of HgO by mass: $\\dfrac{16.00}{216.59} = ' + (MM.O / (MM.Hg + MM.O)).toFixed(4) + '$.', '$' + m + ' \\times ' + (MM.O / (MM.Hg + MM.O)).toFixed(4) + ' \\approx ' + mO.toFixed(2) + '$ g.'], { rtol: 0.01, chk: { f: 'hgo', m: m, part: 'O' } });
  return num('Heating ' + m + ' g of mercury oxide (HgO) drives off its oxygen. How many grams of mercury are left? Use Hg = 200.59 and O = 16.00, and give two decimal places.', +mHg.toFixed(2), 'g',
    ['Mercury’s share: $\\dfrac{200.59}{216.59} = ' + (MM.Hg / (MM.Hg + MM.O)).toFixed(4) + '$.', '$' + m + ' \\times ' + (MM.Hg / (MM.Hg + MM.O)).toFixed(4) + ' \\approx ' + mHg.toFixed(2) + '$ g. The oxygen and mercury together weigh exactly the calx.'], { rtol: 0.01, chk: { f: 'hgo', m: m, part: 'Hg' } });
}
var METALS = [['tin', 'Sn', 'SnO₂', 1, 2], ['magnesium', 'Mg', 'MgO', 1, 1], ['copper', 'Cu', 'CuO', 1, 1], ['iron', 'Fe', 'Fe₂O₃', 2, 3]];
function famGain(R, lv) {
  var mt = R.pick(METALS), m = R.pick([5, 10, 12, 20, 24, 50]), M = MM[mt[1]], gain = m / M / mt[3] * mt[4] * MM.O, prod = m + gain;
  var askProd = lv === 3 && R.coin();
  return num(m + ' g of ' + mt[0] + ' is heated in air until it all turns to ' + mt[2] + '. ' + (askProd ? 'What does the product weigh?' : 'How many grams heavier is the product than the metal?') + ' Use ' + mt[1] + ' = ' + M + ' and O = 16.00; give one decimal place.', r1(askProd ? prod : gain), 'g',
    ['Moles of ' + mt[0] + ': $' + m + ' / ' + M + ' = ' + (m / M).toFixed(4) + '$.', 'In ' + mt[2] + ' each ' + (mt[3] > 1 ? mt[3] + ' atoms' : 'atom') + ' of ' + mt[0] + ' takes ' + mt[4] + ' of oxygen: $' + (m / M).toFixed(4) + ' \\times \\tfrac{' + mt[4] + '}{' + mt[3] + '} \\times 16.00 = ' + gain.toFixed(2) + '$ g of oxygen.',
      askProd ? 'Product: $' + m + ' + ' + gain.toFixed(2) + ' \\approx ' + r1(prod) + '$ g.' : 'The calx is heavier by the oxygen it took from the air, about ' + r1(gain) + ' g. Phlogiston theory could not explain this gain.'],
    { tol: 0.06, chk: { f: 'gain', m: m, M: M, a: mt[3], b: mt[4], prod: askProd } });
}
function famPct(R, lv) {
  var cs = [['carbon dioxide, CO₂', 'carbon', MM.C, MM.C + 2 * MM.O], ['carbon dioxide, CO₂', 'oxygen', 2 * MM.O, MM.C + 2 * MM.O], ['water, H₂O', 'oxygen', MM.O, 2 * MM.H + MM.O], ['mercury oxide, HgO', 'oxygen', MM.O, MM.Hg + MM.O], ['magnesium oxide, MgO', 'magnesium', MM.Mg, MM.Mg + MM.O]];
  var c = R.pick(cs), p = c[2] / c[3] * 100;
  return num('What percent by mass of ' + c[0] + ' is ' + c[1] + '? Use C = 12.01, H = 1.008, O = 16.00, Hg = 200.59, Mg = 24.31; give one decimal place.', r1(p), '',
    ['$\\dfrac{' + c[2].toFixed(2) + '}{' + c[3].toFixed(2) + '} \\times 100 \\approx ' + r1(p) + '\\%$.' + (c[0].indexOf('CO') === 0 ? ' Lavoisier’s 28 : 72 for charcoal and oxygen is very close to 27.3 : 72.7.' : '')],
    { tol: 0.15, pct: true, chk: { f: 'pc', a: c[2], b: c[3] } });
}
var NAMES = [['dephlogisticated air', 'oxygen'], ['inflammable air', 'hydrogen'], ['phlogisticated air', 'nitrogen (Lavoisier’s “azote”)'], ['fixed air', 'carbon dioxide'], ['oil of vitriol', 'sulfuric acid'], ['calx of mercury', 'mercury oxide'], ['calx of tin', 'tin oxide']];
function famNames(R, lv) {
  var i = R.int(0, NAMES.length - 1), n = NAMES[i], others = NAMES.filter(function (_, j) { return j !== i; });
  if (R.coin()) return H.mc('In the old chemistry, “' + n[0] + '.” What do we call it now?', n[1], H.samp(R, others.map(function (x) { return x[1]; }), lv === 1 ? 2 : 3), ['“' + n[0] + '” is ' + n[1] + '. Lavoisier’s new names tell what a substance is made of.']);
  return H.mc('Which old name meant <b>' + n[1] + '</b>?', n[0], H.samp(R, others.map(function (x) { return x[0]; }), lv === 1 ? 2 : 3), ['“' + n[0] + '” was the old name for ' + n[1] + '.']);
}
var B = {
  facts: [
    ['Lavoisier discovered oxygen.', false, 'Scheele and Priestley made it first; Lavoisier explained its role and named it.'],
    ['Lavoisier showed that burning is combining with part of the air, which he named oxygen.', true, 'This replaced the phlogiston theory.'],
    ['When tin is heated in a sealed flask, the flask gets heavier before it is opened.', false, 'Sealed, the weight does not change; it rises only when air rushes in.'],
    ['Lavoisier showed that water is made of hydrogen and oxygen.', true, 'In 1783, after Cavendish’s experiments.'],
    ['Lavoisier’s list of simple substances included light and caloric.', true, 'Caloric was his name for a fluid of heat.'],
    ['Every acid contains oxygen.', false, 'Lavoisier thought so (oxygen means “acid-maker”), but Davy showed in 1810 that hydrochloric acid has none.'],
    ['The Elements of Chemistry first appeared in French in 1789.', true, 'Robert Kerr’s English translation followed in 1790.'],
    ['Marie-Anne Paulze Lavoisier drew the plates of the Elements of Chemistry.', true, 'She drew the thirteen plates of equipment and kept laboratory records.'],
    ['Lavoisier was the first person ever to suggest that matter is conserved.', false, 'The idea is ancient, and Lomonosov stated it for chemistry in the 1750s; Lavoisier made it the rule of every experiment.'],
    ['Lavoisier and Laplace showed that breathing gives off heat like slow burning.', true, 'With an ice calorimeter and a guinea pig, 1782–1783.'],
    ['In the new names, a “sulfate” is a compound made with sulfuric acid.', true, 'Names tell what a compound is made of.'],
    ['Lavoisier was executed in 1794 during the French Revolution.', true, 'As a member of the tax-collecting company, the Ferme générale.'],
    ['Joseph Priestley quickly accepted Lavoisier’s new chemistry.', false, 'Priestley defended phlogiston to the end of his life.'],
    ['Lavoisier’s balance was his main instrument.', true, 'He weighed every substance, gases included.']
  ],
  items: [
    { q: 'What did the phlogiston theory say happens when something burns?', r: ['A substance called phlogiston leaves it'], w: ['It combines with oxygen', 'It turns into water', 'It gains heat from the air'], why: 'Lavoisier replaced this with combining with oxygen.' },
    { q: 'What puzzle did calxes pose for the phlogiston theory?', r: ['A calx weighs more than the metal it came from'], w: ['A calx is always red', 'A calx dissolves in water', 'A calx is lighter than the metal'], why: 'If something left the metal, why did it get heavier?' },
    { q: 'What does Lavoisier say every branch of science consists of?', r: ['Facts, the ideas that represent them, and the words that express the ideas'], w: ['Experiments, instruments and money', 'Books, teachers and students', 'Air, water and fire'], why: '“Like three impressions of the same seal.”' },
    { q: 'What does the word “oxygen” mean, from the Greek?', r: ['Acid-maker'], w: ['Fire-maker', 'Water-maker', 'Life-giver'], why: 'Lavoisier thought all acids contain it.' },
    { q: 'Who visited Paris in October 1774 and told Lavoisier about the gas from heated calx of mercury?', r: ['Joseph Priestley'], w: ['Henry Cavendish', 'Joseph Black', 'Humphry Davy'], why: 'Priestley called it dephlogisticated air.' },
    { q: 'What is Lavoisier’s working definition of an element?', r: ['A substance we have not yet been able to break down'], w: ['One of earth, air, fire and water', 'Anything that burns', 'A substance that is a gas'], why: 'That is why his list included lime and silica, later broken down.' },
    { q: 'Who translated the Elements of Chemistry into English in 1790?', r: ['Robert Kerr'], w: ['Joseph Priestley', 'Benjamin Franklin', 'Humphry Davy'], why: 'Published in Edinburgh by William Creech.' },
    { q: 'Robert Boyle also heated tin in sealed vessels. What did he do differently from Lavoisier?', r: ['He opened the vessels before weighing them'], w: ['He used no heat', 'He weighed only the air', 'He used mercury instead of tin'], why: 'So air rushed in before he weighed, and he thought fire particles had been added.' },
    { q: 'Which later chemist explained Lavoisier’s fixed combining weights with atoms?', r: ['John Dalton'], w: ['Dmitri Mendeleev', 'Marie Curie', 'Robert Boyle'], why: 'Dalton, 1803–1808.' }
  ]
};
H.T(ID, B, [famBalance, famCharcoal, famWater, famCalx, famGain, famPct, famNames,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.55);
