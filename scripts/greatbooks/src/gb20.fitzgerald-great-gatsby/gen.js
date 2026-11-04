/* Fitzgerald, The Great Gatsby (gbx3). Families: the story in order, places, who's who, who said what, dates. Uses H.k20. */
var ID = 'gb20.fitzgerald-great-gatsby';
var STORY = ['Nick moves to West Egg', 'dinner with Daisy and Tom in East Egg', 'a trip through the valley of ashes', 'Nick goes to one of Gatsby\'s parties', 'Gatsby and Daisy meet again at Nick\'s', 'the quarrel at the Plaza Hotel', 'the accident on the drive home', 'Gatsby\'s death and lonely funeral', 'Nick goes home to the Midwest'];
var PLACE = [['West Egg', 'where Nick and Gatsby live, the side of "new money"'], ['East Egg', 'where Daisy and Tom live, the fashionable side'], ['the valley of ashes', 'a gray dumping ground between the Eggs and New York'], ['the Plaza Hotel', 'where the hot afternoon\'s quarrel takes place'], ['the green light', 'the light at the end of Daisy\'s dock']];
var WHO = [['Nick Carraway', 'the narrator, Gatsby\'s neighbor and Daisy\'s cousin'], ['Jay Gatsby', 'the mysterious host, born James Gatz'], ['Daisy Buchanan', 'the woman Gatsby loved in 1917'], ['Tom Buchanan', 'Daisy\'s rich, arrogant husband'], ['Jordan Baker', 'a golf champion and Daisy\'s friend'], ['George Wilson', 'the garage owner in the valley of ashes']];
var SAID = [
  ['Whenever you feel like criticizing anyone, remember that not everyone has had your advantages.', 'Nick\'s father', 'Chapter I.'],
  ['Can\'t repeat the past? Why of course you can!', 'Gatsby', 'Chapter VI.'],
  ['They were careless people; they smashed up things and let others clean up the mess.', 'Nick', 'Our summary of his judgment of Tom and Daisy.'],
  ['The rich spend to be seen spending.', 'Thorstein Veblen', 'Our summary of "conspicuous consumption."']
];
var B = {
  facts: [
    ['The Great Gatsby was published in 1925.', true, 'By Scribner\'s.'],
    ['The novel is narrated by Gatsby.', false, 'By his neighbor, Nick Carraway.'],
    ['Gatsby was born James Gatz to a poor farm family.', true, 'In North Dakota.'],
    ['The green light is at the end of Daisy\'s dock.', true, 'Across the bay from Gatsby\'s mansion.'],
    ['The novel is set in the summer of 1922.', true, 'On Long Island and in New York.'],
    ['Hundreds of mourners come to Gatsby\'s funeral.', false, 'Almost no one comes.'],
    ['The book was a huge best seller in Fitzgerald\'s lifetime.', false, 'It sold modestly; its fame came after his death.'],
    ['Gatsby met Daisy when he was a young army officer.', true, 'In 1917.']
  ],
  items: [
    { q: 'Why does Gatsby throw his huge parties?', r: 'Hoping Daisy might come', w: ['To sell cars', 'To raise money for charity', 'Because Nick asks him to'], why: 'He bought his house across the bay from hers.' },
    { q: 'What does Gatsby believe about the past?', r: 'That he can repeat it and win Daisy back', w: ['That it doesn\'t matter', 'That it should be forgotten', 'That it was all bad'], why: 'His great illusion.' },
    { q: 'What happens on the drive back from New York?', r: 'Gatsby\'s car, with Daisy driving, kills Myrtle Wilson', w: ['Tom crashes into a tree', 'They get lost and stay in a hotel', 'Gatsby proposes to Daisy'], why: 'Gatsby takes the blame.' },
    { q: 'Why does Nick go home to the Midwest?', r: 'He is sickened by the careless rich of the East', w: ['He inherits a farm', 'He is fired', 'He marries Jordan'], why: 'The novel\'s final judgment.' },
    { q: 'What does West Egg stand for, compared with East Egg?', r: 'New money compared with old money', w: ['Farming compared with fishing', 'North compared with South', 'Summer compared with winter'], why: 'Gatsby is newly rich.' },
    { q: 'Whose writer-narrator did Fitzgerald learn from?', r: 'Joseph Conrad\'s Marlow', w: ['Homer\'s Muse', 'Dante\'s Virgil', 'Ovid\'s gods'], why: 'A witness telling of a mysterious man.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'The Great Gatsby', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(PLACE, function (a) { return 'In The Great Gatsby, what is <b>' + a + '</b>?'; }, function (b) { return 'Which place is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'Who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
