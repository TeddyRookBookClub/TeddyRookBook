/* Dickens, Little Dorrit (gbw4). Families: who is who, the two books (Poverty, Riches), events in order, Dickens's satire,
   who said what, dates. Uses H.k19. */
var ID = 'gb19.dickens-little-dorrit';
var WHOIS = [['Amy Dorrit ("Little Dorrit")', 'born in the debtors\' prison, she quietly cares for her family'], ['William Dorrit', 'her proud father, "the Father of the Marshalsea"'], ['Arthur Clennam', 'a kind man home from twenty years in China, who wants to set wrongs right'], ['Mrs. Clennam', 'his stern mother, who keeps a secret in her gloomy house'], ['Mr. Merdle', 'a famous financier whose fortune turns out to be a fraud'], ['Tite Barnacle', 'a head of the Circumlocution Office'], ['Daniel Doyce', 'an inventor who cannot get the government to look at his invention'], ['Rigaud', 'the villain met in a Marseilles prison in the first chapter']];
var ORDER = ['Two prisoners in a Marseilles jail', 'Arthur Clennam returns to London', 'Arthur meets Little Dorrit and the Marshalsea', 'Arthur visits the Circumlocution Office', 'The Dorrits inherit a fortune', 'The Dorrits travel in Italy', 'Mr. Merdle\'s empire collapses', 'Arthur is imprisoned for debt', 'Little Dorrit and Arthur marry'];
var BOOK = [['the Dorrits living in the Marshalsea', 'Book the First: Poverty'], ['the Circumlocution Office first appears', 'Book the First: Poverty'], ['the Dorrits touring Italy in grand style', 'Book the Second: Riches'], ['Mr. Merdle\'s collapse', 'Book the Second: Riches'], ['Arthur in the Marshalsea, cared for by Amy', 'Book the Second: Riches']];
var WHO = [
  ['Upon my soul you mustn\'t come into the place saying you want to know, you know!', 'Barnacle Junior', 'Book I, Chapter 10, at the Circumlocution Office.'],
  ['Whatever was required to be done, the Circumlocution Office was beforehand in the art of perceiving how not to do it.', 'the narrator', 'Book I, Chapter 10.'],
  ['I was born here; I have nowhere else to go, and I will look after my father.', 'Little Dorrit', 'Our summary.'],
  ['Thirty years ago, Marseilles lay burning in the sun, one day.', 'the narrator', 'The opening sentence.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Little Dorrit came out in monthly parts from 1855 to 1857.', true, 'Twenty numbers, as nineteen parts.'],
    ['Dickens\'s own father was imprisoned for debt in the Marshalsea.', true, 'In 1824, when Charles was twelve and working in a factory.'],
    ['The Marshalsea was a prison for people who owed money.', true, 'A debtors\' prison in Southwark, London.'],
    ['The Circumlocution Office was a real government department.', false, 'Dickens invented it to mock slow, self-serving officials.'],
    ['The novel is in two books, "Poverty" and "Riches."', true, 'The Dorrits\' fortunes rise and fall.'],
    ['Mr. Merdle\'s fortune is honest and lasting.', false, 'It is a fraud, and its collapse ruins many.'],
    ['Little Dorrit was born in the Marshalsea.', true, 'Hence "the Child of the Marshalsea."'],
    ['Dickens ends the novel with Amy and Arthur rich and famous.', false, 'They go down into "a modest life of usefulness and happiness."']
  ],
  items: [
    { q: 'What is the Circumlocution Office\'s great art?', r: 'How not to do it', w: ['How to do things quickly', 'How to save money', 'How to build ships'], why: 'Book I, Chapter 10.' },
    { q: 'Why was William Dorrit in prison?', r: 'He could not pay his debts', w: ['He was a thief', 'He was a spy', 'He started a fire'], why: 'Debtors could be held until they paid.' },
    { q: 'Why can\'t debtors in the Marshalsea pay what they owe?', r: 'In prison they cannot work to earn the money', w: ['They are too rich', 'Banks are closed', 'They forget'], why: 'One of the absurdities Dickens attacks.' },
    { q: 'What happens when Mr. Merdle\'s schemes collapse?', r: 'Many people who trusted him, Arthur among them, are ruined', w: ['Everyone gets richer', 'Nothing changes', 'He becomes prime minister'], why: 'A satire of financial bubbles.' },
    { q: 'What kind of person is Little Dorrit?', r: 'Quiet, hardworking and selfless', w: ['Proud and cruel', 'Lazy and spoiled', 'Loud and boastful'], why: 'She cares for her father and family.' },
    { q: 'How does the novel end?', r: 'Amy and Arthur marry and go down into a modest, useful life', w: ['They move into a palace', 'Arthur becomes a Barnacle', 'They sail to China forever'], why: 'The last paragraph.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Little Dorrit?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.seq(ORDER, 'the story of Little Dorrit', 'event', R, lv); },
  function (R, lv) { return H.k19.pairs(BOOK, function (a) { return 'In which book of Little Dorrit do we find <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
