/* Marx, Capital, Volume 1 (gbw4). Families: the rate of surplus value (computed, in Marx's terms), the circuits C-M-C and M-C-M',
   key terms, the critiques, who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.marx-capital';
function famRate(R, lv) {
  var nec = R.int(3, 8), sur = R.pick([nec, nec / 2, nec * 2, nec + 2, nec - 1].filter(function (x) { return x > 0 && x === Math.floor(x) && x + nec <= 16; })), day = nec + sur, rate = Math.round(sur / nec * 100);
  var r = R.next();
  if (r < 0.4) return H.num('In Marx\'s terms: a ' + day + '-hour working day, of which ' + nec + ' hours are "necessary labor" (covering the wage). What is the rate of surplus value, in percent? (Round to the nearest whole percent.)', rate, ['Surplus labor: $' + day + ' - ' + nec + ' = ' + sur + '$ hours.', 'Rate: $' + sur + ' \\div ' + nec + ' \\approx ' + (sur / nec).toFixed(2) + '$, or ' + rate + '%.'], { hint: 'Surplus hours divided by necessary hours.', unit: '%' });
  if (r < 0.7) return H.num('In Marx\'s terms: a ' + day + '-hour working day with ' + nec + ' hours of necessary labor. How many hours of <b>surplus</b> labor is that?', sur, ['$' + day + ' - ' + nec + ' = ' + sur + '$.']);
  var nd = day - 2;
  return H.num('Marx\'s example: a law cuts the working day from ' + day + ' to ' + nd + ' hours, and necessary labor stays ' + nec + ' hours. How many hours of surplus labor remain?', nd - nec, ['$' + nd + ' - ' + nec + ' = ' + (nd - nec) + '$. This is why, he argued, owners fought the Factory Acts.']);
}
function famCircuit(R, lv) {
  var buy = R.int(10, 50) * 10, gain = R.int(1, 9) * 10;
  if (R.coin()) return H.num('In Marx\'s circuit M–C–M′, a merchant pays \\$' + buy + ' for goods and sells them for \\$' + (buy + gain) + '. What is the increase, which Marx calls surplus value, in dollars?', gain, ['$' + (buy + gain) + ' - ' + buy + ' = ' + gain + '$.']);
  return H.mc('Which circuit does Marx call "buying in order to sell," the circuit of capital?', 'M–C–M′ (money, commodity, more money)', ['C–M–C (commodity, money, commodity)', 'M–M (money for nothing)', 'C–C (barter only)'], ['C–M–C is selling in order to buy; M–C–M′ is buying in order to sell dearer.']);
}
var TERMS = [['commodity', 'a thing made to be sold, with a use value and an exchange value'], ['use value', 'what a thing is good for'], ['exchange value', 'what a thing trades for'], ['labor power', 'the worker\'s capacity to work, which the worker sells for a wage'], ['surplus value', 'in Marx\'s theory, the value workers create beyond what their wages pay for'], ['fetishism of commodities', 'Marx\'s name for treating relations between people as if they were relations between things']];
var CRIT = [['the labor theory of value', 'most economists since the 1870s explain prices by supply, demand and marginal utility'], ['the prediction that profits must fall', 'profits did not fall as Marx expected'], ['the prediction of ever-worse poverty', 'real wages in industrial countries rose greatly'], ['the description of 1860s factory conditions', 'drawn largely from official reports, and widely accepted by historians']];
var WHO = [
  ['The wealth of capitalist societies presents itself as an immense accumulation of commodities.', 'Marx', 'The opening of Capital.'],
  ['The value of a thing depends on its usefulness to the last unit wanted, not on the labor in it.', 'the marginal economists (Jevons, Menger, Walras)', 'The 1870s answer to the labor theory of value.'],
  ['The division of labor is the greatest cause of the growth of wealth.', 'Adam Smith', 'The Wealth of Nations, Book I.'],
  ['Hegel\'s method must be turned right side up.', 'Marx', 'Afterword to the second German edition.'],
  ['The prices of goods carry knowledge no central planner could gather.', 'Friedrich Hayek', '"The Use of Knowledge in Society" (1945).']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Volume 1 of Capital was published in Hamburg in 1867.', true, 'Engels edited Volumes 2 and 3 after Marx\'s death (1885, 1894).'],
    ['The English translation by Samuel Moore and Edward Aveling appeared in 1887.', true, 'Edited by Engels.'],
    ['Marx wrote much of Capital in the reading room of the British Museum.', true, 'He lived in London from 1849.'],
    ['Capital begins with a chapter on factory machines.', false, 'It begins with the commodity.'],
    ['Marx drew on British factory inspectors\' reports for his chapter on the working day.', true, 'The Factory Acts and the fight over working hours.'],
    ['Most economists today accept Marx\'s labor theory of value.', false, 'Most explain value by marginal utility, supply and demand.'],
    ['In Marx\'s terms, "labor power" is the worker\'s capacity to work, which he sells for a wage.', true, 'Part II.'],
    ['Marx predicted that capitalism would end through its own crises and a workers\' revolution.', true, 'Chapter XXXII, on historical tendency.']
  ],
  items: [
    { q: 'Where does Capital begin?', r: 'With the commodity, a thing made for sale', w: ['With the French Revolution', 'With a story of a factory owner', 'With a theory of the stars'], why: 'Chapter I.' },
    { q: 'What is the difference between C–M–C and M–C–M′?', r: 'Selling in order to buy, versus buying in order to sell for more', w: ['Two kinds of coins', 'Two kinds of factories', 'There is no difference'], why: 'Part II, the general formula for capital.' },
    { q: 'What did Marx mean by "surplus value"?', r: 'Value workers create beyond what their wages pay for, kept by the owner', w: ['Leftover goods', 'A tax refund', 'Savings in a bank'], why: 'The core of his theory of profit.' },
    { q: 'What theory of value replaced the labor theory for most economists after the 1870s?', r: 'Marginal utility', w: ['The gold standard', 'Mercantilism', 'Astrology'], why: 'Jevons, Menger and Walras.' },
    { q: 'Which part of Capital do historians still value most?', r: 'Its detailed account of factory conditions in the 1860s', w: ['Its maps', 'Its poems', 'Its recipes'], why: 'Drawn from official reports.' },
    { q: 'What laws limiting working hours does Marx discuss?', r: 'The British Factory Acts', w: ['The Magna Carta', 'The Bill of Rights', 'The Code of Hammurabi'], why: 'Chapter X, "The Working-Day."' }
  ]
};
H.T(ID, B, [famRate, famRate, famCircuit,
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'In Capital, what does <b>' + a + '</b> mean?'; }, function (b) { return 'Which of Marx\'s terms means: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(CRIT, function (a) { return 'How have later economists and historians judged <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
