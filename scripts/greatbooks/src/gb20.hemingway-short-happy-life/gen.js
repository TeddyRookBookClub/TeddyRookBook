/* Hemingway, The Short Happy Life of Francis Macomber (gbx3). No quotations (first published 1936). Families: events in time order,
   telling order, who's who, the iceberg idea, Hemingway's books by date, dates. Uses H.k20. */
var ID = 'gb20.hemingway-short-happy-life';
var CLOCK = ['the lion hunt in the morning', 'Macomber runs from the charging lion', 'the tense lunch in camp', 'a night of shame', 'the buffalo hunt the next day', 'Macomber loses his fear', 'the fatal shot'];
var TOLD = ['the tense lunch in camp', 'the lion hunt, told in flashback', 'a night of shame', 'the buffalo hunt', 'the fatal shot and Wilson\'s judgment'];
var BOOKS = ['The Sun Also Rises (1926)', 'A Farewell to Arms (1929)', 'The Short Happy Life of Francis Macomber (1936)', 'The Old Man and the Sea (1952)'];
var WHO = [['Francis Macomber', 'the wealthy American who runs from a lion and later finds courage'], ['Margot Macomber', 'his wife, who scorns him and fires the final shot'], ['Robert Wilson', 'the professional hunter who lives by a strict code'], ['the lion', 'whose point of view the story briefly enters']];
var SAID = [
  ['A story is like an iceberg: most of it lies under the water.', 'Hemingway', 'Our summary of his "iceberg" idea.'],
  ['Courage is the mean between cowardice and rashness.', 'Aristotle', 'Our summary of the Ethics.'],
  ['She did it on purpose, I suppose.', 'Robert Wilson', 'Our summary of his judgment at the end.'],
  ['I\'m not afraid any more.', 'Francis Macomber', 'Our summary of his feeling on the buffalo hunt.']
];
var B = {
  facts: [
    ['The story was first published in 1936.', true, 'In Cosmopolitan magazine.'],
    ['It is set on a safari in East Africa.', true, 'Hemingway went on safari in 1933 and 1934.'],
    ['The story is told strictly in time order.', false, 'It opens at lunch, then flashes back to the lion hunt.'],
    ['Macomber runs from a charging lion.', true, 'The shame drives the story.'],
    ['Hemingway says clearly that Margot meant to shoot her husband.', false, 'He leaves it open.'],
    ['Hemingway won the Nobel Prize in Literature in 1954.', true, 'Two years after The Old Man and the Sea.'],
    ['Hemingway was wounded in Italy in the First World War.', true, 'As a Red Cross ambulance driver, in 1918.'],
    ['Robert Wilson is a coward.', false, 'He lives by a strict code of courage, though he is cold.']
  ],
  items: [
    { q: 'What is Hemingway\'s "iceberg" idea?', r: 'Show a little on the surface and leave most of the meaning underneath', w: ['Write about cold places', 'Write very long sentences', 'Tell everything the characters feel'], why: 'Readers feel what is left out.' },
    { q: 'What happens to Macomber on the buffalo hunt?', r: 'He suddenly loses his fear', w: ['He runs away again', 'He gets lost', 'He refuses to hunt'], why: 'His "short happy life" begins.' },
    { q: 'Why is Margot uneasy when her husband becomes brave?', r: 'A brave husband will be harder for her to rule', w: ['She is afraid of buffalo', 'She wants to go home', 'She is ill'], why: 'The marriage is a struggle for power.' },
    { q: 'Why is the title both ironic and sincere?', r: 'His fearless "happy life" lasts only minutes', w: ['He lives to be a hundred', 'He was never happy', 'The story is a comedy'], why: 'Short and happy.' },
    { q: 'Why does this lesson have no quotations?', r: 'The story was first published in 1936 and is under copyright', w: ['It has no dialogue', 'It was never published', 'It is in French'], why: 'We describe it in our own words.' },
    { q: 'Which earlier book on this ladder defines courage as a mean between two extremes?', r: 'Aristotle\'s Ethics', w: ['Euclid\'s Elements', 'Newton\'s Principia', 'Darwin\'s Origin'], why: 'Between cowardice and rashness.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CLOCK, 'the events in time order', 'event', R, lv); },
  function (R, lv) { return H.k20.seq(TOLD, 'the order in which the story tells them', 'part', R, lv); },
  function (R, lv) { return H.k20.seq(BOOKS, 'Hemingway\'s works by date', 'work', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In the story, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
