/* Keynes, The General Theory (gbx1). No excerpts (1936). Families: the multiplier (computed), a given round of spending
   (computed), Keynes or his critics, terms, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.keynes-general-theory';
var MPCS = [[0.5, 2], [0.75, 4], [0.8, 5], [0.9, 10], [0.6, 2.5]];
function famMult(R, lv) {
  var p = R.pick(MPCS), c = p[0], m = p[1], g = R.pick([100, 200, 400, 1000]);
  if (lv === 1) return H.num('In Keynes\'s simple model, the marginal propensity to consume is ' + c + '. What is the multiplier, $\\frac{1}{1 - \\text{MPC}}$?', m, ['$1 - ' + c + ' = ' + (Math.round((1 - c) * 100) / 100) + '$.', '$1 \\div ' + (Math.round((1 - c) * 100) / 100) + ' = ' + m + '$.'], { hint: 'Subtract the MPC from 1, then divide 1 by that.' });
  return H.num('The MPC is ' + c + ' and the government adds \\$' + g + ' of new spending. In the simple model, by how many dollars can total income rise?', g * m, ['Multiplier: $\\frac{1}{1 - ' + c + '} = ' + m + '$.', '$' + m + ' \\times ' + g + ' = ' + (g * m) + '$.'], { hint: 'Find the multiplier first.' });
}
function famRound(R, lv) {
  var c = R.pick([0.5, 0.8, 0.9]), k = R.pick([2, 3]), g = R.pick([100, 1000]), v = Math.round(g * Math.pow(c, k - 1) * 100) / 100;
  return H.num('\\$' + g + ' of new spending starts a chain. Each person spends ' + c + ' of what they receive. How many dollars are spent in round ' + k + '? (Round 1 is the first \\$' + g + '.)', v,
    ['Round 1: \\$' + g + '.', 'Each round multiplies by ' + c + '.', 'Round ' + k + ': $' + g + ' \\times ' + c + '^{' + (k - 1) + '} = ' + v + '$.'], { hint: 'Multiply by the MPC once for each round after the first.' });
}
var VIEW = [['total spending (aggregate demand) can fall short and leave many unemployed for years', 'Keynes'], ['slumps come from earlier misdirected investment that must be worked out', 'Friedrich Hayek and the Austrian school'], ['the Depression was made far worse by a collapse in the money supply', 'Milton Friedman and the monetarists'], ['in a slump, governments should support demand, even by borrowing', 'Keynes'], ['people\'s expectations adjust to policy and weaken its effects', 'Robert Lucas and the new classical economists'], ['governments find it easier to borrow than to repay', 'James Buchanan and public-choice economists'], ['supply creates its own demand', 'Say\'s law, which Keynes rejected']];
var TERMS = [['aggregate demand', 'the total spending in an economy by households, businesses and government'], ['the marginal propensity to consume', 'the share of an extra dollar of income that people spend'], ['the multiplier', 'how many times new spending raises total income'], ['liquidity preference', 'the wish to hold ready money rather than lend or invest it'], ['animal spirits', 'Keynes\'s name for the confidence that drives investment'], ['the paradox of thrift', 'if everyone saves more at once, total income may fall'], ['stagflation', 'high inflation and high unemployment at the same time, as in the 1970s']];
var WHO = [
  ['A whole economy can get stuck with high unemployment because total spending is too low.', 'John Maynard Keynes', 'The General Theory (our summary).'],
  ['The harsh peace treaty after the First World War will damage Europe.', 'John Maynard Keynes', 'The Economic Consequences of the Peace, 1919.'],
  ['Steady growth in the money supply matters more than government spending.', 'Milton Friedman', 'The monetarist view.'],
  ['Prices carry knowledge no planner could gather.', 'Friedrich Hayek', 'His argument against central direction.'],
  ['Slumps are built into capitalism, which must give way to a new system.', 'Karl Marx', 'Capital (our summary); Keynes wanted to save the market system.']
];
var B = {
  facts: [
    ['The General Theory was published in 1936.', true, 'During the Great Depression.'],
    ['Keynes accepted Say\'s law that supply creates its own demand.', false, 'He rejected it.'],
    ['Keynes led the British delegation at Bretton Woods in 1944.', true, 'Which designed the postwar money system.'],
    ['Keynes wanted to abolish markets.', false, 'He wanted to make a market economy work better.'],
    ['In the 1970s, stagflation challenged simple Keynesian models.', true, 'High inflation and high unemployment together.'],
    ['Milton Friedman blamed the Depression partly on a collapse in the money supply.', true, 'With Anna Schwartz, 1963.']
  ],
  items: [
    { q: 'What did Keynes think mainly decides total output and employment?', r: 'Aggregate demand: total spending', w: ['The weather', 'The number of factories alone', 'The price of gold'], why: 'The heart of the General Theory.' },
    { q: 'What is the "paradox of thrift"?', r: 'If everyone tries to save more at once, total income may fall', w: ['Saving always makes everyone richer', 'Spending is always wasteful', 'Prices never change'], why: 'An older idea Keynes stressed.' },
    { q: 'What did Keynes mean by "animal spirits"?', r: 'The confidence and mood that drive investment', w: ['Pets in the economy', 'Farm animals', 'Courage in battle'], why: 'Expectations can swing widely.' }
  ]
};
H.T(ID, B, [
  famMult, famRound,
  function (R, lv) { return H.k20.pairs(VIEW, function (a) { return 'Who argues this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
