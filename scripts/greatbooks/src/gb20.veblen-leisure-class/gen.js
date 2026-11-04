/* Veblen, The Theory of the Leisure Class (gbx1). Families: percent change in a demand table and which pattern it shows
   (computed), terms, examples sorted by Veblen's categories, chapters in order, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.veblen-leisure-class';
function famDemand(R, lv) {
  var veb = R.coin(), p1 = R.pick([20, 30, 40, 50]), p2 = p1 + R.pick([10, 20, 30]), q1 = R.pick([20, 40, 60, 80, 100]);
  var pct = R.pick([10, 20, 25, 40]), q2 = Math.round(veb ? q1 * (100 + pct) / 100 : q1 * (100 - pct) / 100);
  var item = R.pick(['handbags', 'watches', 'concert tickets', 'pens', 'cars']);
  var q = 'At \\$' + p1 + ' a shop sells ' + q1 + ' ' + item + ' a week; after the price rises to \\$' + p2 + ', it sells ' + q2 + '. ';
  if (lv === 1 || R.coin()) {
    return H.mc(q + 'Which pattern does this show?', veb ? 'The "Veblen effect": price up, sales up' : 'The ordinary law of demand: price up, sales down', [veb ? 'The ordinary law of demand: price up, sales down' : 'The "Veblen effect": price up, sales up', 'No change at all'], ['Sales went ' + (veb ? 'up' : 'down') + ' from ' + q1 + ' to ' + q2 + ' as the price rose.']);
  }
  return H.num(q + 'By what percent did the quantity sold change? (Use a minus sign for a fall.)', veb ? pct : -pct, ['Change: ' + q2 + ' − ' + q1 + ' = ' + (q2 - q1) + '.', 'Divide by the starting amount: ' + (q2 - q1) + ' ÷ ' + q1 + ' = ' + (veb ? '' : '−') + (pct / 100) + ', so ' + (veb ? pct : -pct) + '%.', veb ? 'Price up and sales up: the Veblen effect (if nothing else changed).' : 'Price up and sales down: the ordinary law of demand.'], { hint: 'Percent change = (new − old) ÷ old × 100.' });
}
var TERMS = [['conspicuous consumption', 'spending on costly goods so that others can see one\'s wealth'], ['conspicuous leisure', 'showing status by visibly not needing to do useful work'], ['pecuniary emulation', 'trying to match or outdo others in visible wealth'], ['conspicuous waste', 'spending whose main point is that it is wasteful'], ['the instinct of workmanship', 'the urge to do useful, efficient work'], ['a Veblen good', 'a later economists\' term: a good more wanted as its price rises']];
var EXS = [['a large house with many rooms no one uses', 'conspicuous consumption'], ['keeping long fingernails that show one never does manual work', 'conspicuous leisure'], ['buying a bigger car because a neighbor bought one', 'pecuniary emulation'], ['a tool that is plain, sturdy and does its job well', 'the instinct of workmanship'], ['a banquet with far more food than the guests can eat', 'conspicuous waste'], ['a gentleman\'s learning of dead languages he will never use', 'conspicuous leisure']];
var CH = ['Introductory', 'Pecuniary Emulation', 'Conspicuous Leisure', 'Conspicuous Consumption', 'The Pecuniary Standard of Living', 'Pecuniary Canons of Taste', 'Dress as an Expression of the Pecuniary Culture'];
var WHO = [
  ['Esteem is awarded only on evidence, so wealth must be shown.', 'Thorstein Veblen', 'Chapter III (our close paraphrase).'],
  ['People seek riches partly to be noticed and admired.', 'Adam Smith', 'The Theory of Moral Sentiments, 1759 (our summary).'],
  ['An economy should serve social purposes, not mere getting.', 'R. H. Tawney', 'The Acquisitive Society, 1920 (our summary).'],
  ['As the price of a good rises, people buy less of it.', 'the ordinary law of demand', 'The pattern Veblen goods seem to break.'],
  ['Comparing ourselves with others is the root of many social ills.', 'Jean-Jacques Rousseau', 'His Discourses (our summary).']
];
var B = {
  facts: [
    ['The Theory of the Leisure Class was published in 1899.', true, 'Veblen\'s first book.'],
    ['Veblen coined the phrase "conspicuous consumption."', true, 'Chapter IV is named for it.'],
    ['Veblen said the handmade silver spoon is far more useful than a machine-made one.', false, 'He said it is not ordinarily more serviceable.'],
    ['Veblen was the son of Norwegian immigrants.', true, 'He grew up on farms in Wisconsin and Minnesota.'],
    ['Veblen goods are very common in everyday shopping data.', false, 'They are rare and hard to prove.'],
    ['Veblen thought our sense of beauty can get mixed up with price.', true, 'Chapter VI, Pecuniary Canons of Taste.']
  ],
  items: [
    { q: 'Why, for Veblen, must wealth be displayed?', r: 'Because esteem is given only on visible evidence', w: ['Because the law requires it', 'Because it keeps money safe', 'Because it is useful'], why: 'Chapter III.' },
    { q: 'What is a main criticism of Veblen\'s book?', r: 'It relied on examples and irony more than systematic evidence', w: ['It used too many equations', 'It was about ancient Rome only', 'It praised the rich'], why: 'And people buy costly goods for quality and beauty too.' },
    { q: 'Which site ladder topic explains the pattern Veblen goods seem to break?', r: 'The law of demand', w: ['The Pythagorean theorem', 'Photosynthesis', 'The water cycle'], why: 'Economics Ladder.' }
  ]
};
H.T(ID, B, [
  famDemand, famDemand,
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(EXS, function (a) { return 'In Veblen\'s terms, which is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.seq(CH, 'the opening chapters of The Theory of the Leisure Class', 'chapter', R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
