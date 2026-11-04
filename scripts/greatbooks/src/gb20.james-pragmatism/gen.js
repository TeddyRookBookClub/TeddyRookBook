/* William James, Pragmatism (gbx1). Families: the squirrel under each meaning, tough- or tender-minded traits,
   the pragmatic test applied to disputes, terms, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.james-pragmatism';
var MIND = [['rationalistic (going by principles)', 'tender-minded'], ['empiricist (going by facts)', 'tough-minded'], ['idealistic', 'tender-minded'], ['materialistic', 'tough-minded'], ['optimistic', 'tender-minded'], ['pessimistic', 'tough-minded'], ['religious', 'tender-minded'], ['irreligious', 'tough-minded'], ['free-willist', 'tender-minded'], ['fatalistic', 'tough-minded'], ['monistic (the world is one)', 'tender-minded'], ['pluralistic (the world is many)', 'tough-minded'], ['dogmatical', 'tender-minded'], ['sceptical', 'tough-minded']];
var DISP = [
  ['Two friends argue whether a tomato is "really" a fruit or a vegetable, though they agree on every fact about tomatoes.', 'a dispute about words: it makes no practical difference once the meanings are fixed'],
  ['Two cooks argue whether the oven is hot enough to bake the bread.', 'a real dispute: one test (bake a loaf, or check a thermometer) will settle it'],
  ['Two campers argue whether the man went round the squirrel.', 'a dispute about words: settled by saying which meaning of "round" you mean'],
  ['Two doctors argue whether a medicine will lower a fever.', 'a real dispute: the results will differ, so experience can decide'],
  ['Two neighbors argue whether a fence is "tall" or "short," having measured it together.', 'a dispute about words: they agree on the height']
];
var TERMS = [['the pragmatic method', 'settling a dispute by asking what practical difference each side would make'], ['cash-value', 'James\'s image for what an idea means in actual experience'], ['tender-minded', 'trusting principles; hopeful, religious, free-willist'], ['tough-minded', 'trusting facts; materialist, sceptical, pluralistic'], ['verification', 'an idea proving true as it is checked against experience']];
var WHO = [
  ['To make our ideas clear, consider what practical effects the object of our idea could have.', 'Charles Sanders Peirce', 'His 1878 essay; he coined "pragmatism," then renamed his view "pragmaticism."'],
  ['An idea is true so long as it works out in experience and can be verified.', 'William James', 'Pragmatism, Lecture VI (our summary).'],
  ['If "true" means "useful to believe," then comforting falsehoods would be true.', 'Bertrand Russell', 'His criticism of James\'s account of truth.'],
  ['Education should grow out of experience that leads to further growth.', 'John Dewey', 'The pragmatist who carried these ideas into schools.'],
  ['Actions are right as they tend to promote happiness.', 'John Stuart Mill', 'Utilitarianism; James dedicated Pragmatism to Mill\'s memory.']
];
var B = {
  facts: [
    ['Pragmatism was published in 1907.', true, 'From lectures in Boston (1906) and New York (1907).'],
    ['James invented the word "pragmatism."', false, 'His friend C. S. Peirce did; James made it famous.'],
    ['James dedicated Pragmatism to the memory of John Stuart Mill.', true, '"From whom I first learned the pragmatic openness of mind."'],
    ['In the squirrel story, James decided only one side was right.', false, 'He said both were right, in different senses of "round."'],
    ['James said true ideas are ones we can assimilate, validate, corroborate and verify.', true, 'Lecture VI.'],
    ['For James, pragmatism meant believing whatever is convenient.', false, 'A true idea must fit the facts and later experience.'],
    ['James was also the author of The Principles of Psychology.', true, '1890, on the 19th-century part of this ladder.']
  ],
  items: [
    { q: 'What question is at the heart of the pragmatic method?', r: 'What practical difference would it make if this were true?', w: ['Who said it first?', 'Is it in an old book?', 'Does it sound beautiful?'], why: 'Lecture II.' },
    { q: 'What did James mean by an idea\'s "cash-value"?', r: 'What the idea means in actual experience', w: ['Its price in a shop', 'How much money it makes', 'Its age'], why: 'A figure of speech, Lecture VI.' },
    { q: 'Which philosopher objected that James\'s view would make comforting falsehoods true?', r: 'Bertrand Russell', w: ['John Stuart Mill', 'Plato', 'Charles Darwin'], why: 'James replied that he meant what works in the long run, against all the evidence.' },
    { q: 'Why did Peirce rename his own view "pragmaticism"?', r: 'To keep it apart from other people\'s versions, such as James\'s', w: ['Because he disliked philosophy', 'Because the word was too short', 'Because of a printing error'], why: 'He said the new word was ugly enough to be safe from kidnappers.' },
    { q: 'James placed pragmatism between which two temperaments?', r: 'The tender-minded and the tough-minded', w: ['The young and the old', 'The rich and the poor', 'The ancients and the moderns'], why: 'Lecture I.' }
  ]
};
function famSquirrel(R, lv) {
  var compass = R.coin(), deg = R.pick([90, 180, 270, 360]);
  var q = 'In James\'s squirrel story, the man has walked ' + deg + '° around the tree; the squirrel keeps facing him from the other side. Using the meaning "<b>' + (compass ? 'north, east, south and west of the squirrel' : 'in front of, beside, then behind the squirrel') + '</b>," has he gone all the way round the squirrel?';
  var right = compass ? (deg === 360 ? 'Yes' : 'Not yet') : 'No, never: he is always in front of it';
  var w = ['Yes', 'Not yet', 'No, never: he is always in front of it'].filter(function (x) { return x !== right; });
  return H.mc(q, right, w, [compass ? (deg === 360 ? 'A full circle takes him to all four compass sides of the squirrel.' : 'He has passed only ' + deg / 90 + ' of the four compass points.') : 'The squirrel turns with him, so he never gets behind it.']);
}
H.T(ID, B, [
  famSquirrel,
  function (R, lv) { return H.k20.pairs(MIND, function (a) { return 'In James\'s Lecture I, the trait <b>' + a + '</b> goes with which temperament?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(DISP, function (a) { return 'Apply the pragmatic method: <i>' + a + '</i> What kind of dispute is it?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In Pragmatism, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
