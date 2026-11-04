/* Cather, A Lost Lady (gbx3). Families: the story in order, who's who, Cather's novels by date, who said what, dates. Uses H.k20. */
var ID = 'gb20.cather-a-lost-lady';
var STORY = ['the boys\' picnic in the Captain\'s meadow', 'the Denver bank fails', 'the Captain\'s strokes', 'Niel\'s disillusion', 'the Captain\'s death', 'Ivy Peters drains the marsh', 'news of Mrs. Forrester in South America'];
var BOOKS = ['O Pioneers! (1913)', 'My Ántonia (1918)', 'A Lost Lady (1923)', 'Death Comes for the Archbishop (1927)'];
var WHO = [['Captain Forrester', 'the old railroad builder who keeps his word'], ['Marian Forrester', 'the Captain\'s charming, lively wife'], ['Niel Herbert', 'the boy, later a young man, through whose eyes we see her'], ['Ivy Peters', 'the hard young man who drains the marsh for profit'], ['Sweet Water', 'the little railroad town in Nebraska'], ['Judge Pommeroy', 'Niel\'s uncle, the Captain\'s lawyer']];
var SAID = [
  ['I will pay the depositors back, every dollar.', 'Captain Forrester', 'Our summary of his choice when the bank fails.'],
  ['The pioneers were dreamers and builders; their heirs only want to make money.', 'Cather\'s narrator', 'Our summary of the book\'s view of two generations.'],
  ['She was not the lady I thought she was.', 'Niel Herbert', 'Our summary of his disillusion.'],
  ['Why keep a marsh when you could grow wheat?', 'Ivy Peters', 'Our summary of his outlook.']
];
var B = {
  facts: [
    ['Willa Cather grew up in Red Cloud, Nebraska.', true, 'After moving there from Virginia as a child.'],
    ['A Lost Lady was published in 1923.', true, 'By Alfred A. Knopf.'],
    ['Captain Forrester made his fortune building railroads.', true, 'Across the West.'],
    ['The Captain keeps his fortune when the bank fails.', false, 'He gives it up to repay the depositors.'],
    ['Niel tells the story in the first person.', false, 'It is told in the third person, mostly from his view.'],
    ['Ivy Peters drains the Captain\'s marsh.', true, 'To plant wheat for profit.'],
    ['Cather won the Pulitzer Prize for One of Ours.', true, 'In 1923.'],
    ['The book ends with Mrs. Forrester running the Captain\'s railroad.', false, 'Niel hears she remarried in South America.']
  ],
  items: [
    { q: 'What does the "lost lady" stand for, besides Mrs. Forrester?', r: 'The passing pioneer age', w: ['A lost dog', 'A ghost in the house', 'A sunken ship'], why: 'An era as well as a person.' },
    { q: 'Why does the Captain give up his fortune?', r: 'To repay the bank\'s small depositors', w: ['To buy a new railroad', 'To pay a gambling debt', 'To build a church'], why: 'He keeps his word.' },
    { q: 'What does Ivy Peters do as a boy that shows his character?', r: 'He hurts a woodpecker for fun', w: ['He saves a drowning friend', 'He wins a spelling bee', 'He builds a raft'], why: 'Cruelty that grows into greed.' },
    { q: 'What did Cather call her bare, uncluttered way of writing?', r: 'The "unfurnished" novel', w: ['The stream of consciousness', 'The iceberg', 'The epic'], why: 'The novel démeublé.' },
    { q: 'Which later novel on this ladder has a young narrator watching a glamorous figure?', r: 'The Great Gatsby', w: ['Heart of Darkness', 'Animal Farm', 'Saint Joan'], why: 'Fitzgerald admired A Lost Lady.' },
    { q: 'Which railroad ran through towns like Sweet Water?', r: 'The Burlington', w: ['The Orient Express', 'The Trans-Siberian', 'The London Underground'], why: 'From Omaha to Denver.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'A Lost Lady', 'event', R, lv); },
  function (R, lv) { return H.k20.seq(BOOKS, 'Cather\'s novels by date', 'novel', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In A Lost Lady, who or what is <b>' + a + '</b>?'; }, function (b) { return 'Who or what is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
