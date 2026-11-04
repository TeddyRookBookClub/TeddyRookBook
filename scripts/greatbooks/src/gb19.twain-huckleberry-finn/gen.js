/* Twain, Adventures of Huckleberry Finn (gbw4). Families: the journey in order, who is who, Huck's choices, dialect and narration,
   who said what (quotations chosen to contain no slurs), dates. Uses H.k19. */
var ID = 'gb19.twain-huckleberry-finn';
var TRIP = ['St. Petersburg', 'Jackson\'s Island', 'Cairo, lost in the fog', 'the Grangerford feud', 'the king and the duke come aboard', 'the Wilks family', 'the Phelps farm'];
var WHOIS = [['Huck Finn', 'the narrator, a boy who runs away from his cruel father'], ['Jim', 'a man escaping slavery, who becomes Huck\'s true friend'], ['Tom Sawyer', 'Huck\'s friend, who loves adventure books and makes everything a game'], ['Pap', 'Huck\'s cruel, drunken father'], ['the Widow Douglas', 'the kind woman trying to "sivilize" Huck'], ['Miss Watson', 'the widow\'s sister, who planned to sell Jim'], ['the king and the duke', 'two swindlers who take over the raft'], ['Mary Jane Wilks', 'an orphan girl whose kindness moves Huck']];
var CHOICE = [['Huck meets Jim on Jackson\'s Island', 'he promises not to turn Jim in'], ['slave-hunters ask about the raft', 'he invents a story of smallpox to protect Jim'], ['the con men try to rob the Wilks sisters', 'he secretly works to save their money'], ['he writes a letter to give Jim away', 'he tears it up and decides to help Jim go free']];
var WHO = [
  ['All right, then, I\'ll go to hell.', 'Huck', 'Chapter XXXI, as he tears up the letter.'],
  ['There warn\'t no home like a raft, after all.', 'Huck', 'Chapter XVIII.'],
  ['You don\'t know about me without you have read a book by the name of The Adventures of Tom Sawyer.', 'Huck', 'The opening line.'],
  ['Modern American writing begins with Huckleberry Finn.', 'Ernest Hemingway', 'Our summary of a famous remark in Green Hills of Africa (1935).'],
  ['Let\'s do the rescue the way they do it in the books, with a rope ladder and a secret tunnel.', 'Tom Sawyer', 'Our summary of his plans.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Huckleberry Finn was published in Britain in December 1884 and in the United States in February 1885.', true, 'Twain had worked on it for about eight years.'],
    ['The story is set in the 1830s or 1840s, before the Civil War, when slavery was legal in Missouri.', true, '"Forty to fifty years ago," Twain wrote.'],
    ['The novel is told by Huck himself, in his own way of speaking.', true, 'Twain used several regional dialects on purpose.'],
    ['Jim is running away because Miss Watson planned to sell him down the river.', true, 'Away from his wife and children.'],
    ['Huck and Jim reach Cairo and travel up the Ohio to freedom.', false, 'They miss Cairo in the fog.'],
    ['Mark Twain was the pen name of Samuel Clemens.', true, 'From a riverboat call meaning two fathoms deep.'],
    ['Twain grew up in Hannibal, Missouri, on the Mississippi.', true, 'The model for St. Petersburg.'],
    ['Twain worked as a riverboat pilot before the Civil War.', true, 'He wrote about it in Life on the Mississippi.']
  ],
  items: [
    { q: 'Why does Huck decide to help Jim, even though he has been taught it is wrong?', r: 'He remembers Jim\'s kindness and friendship, and chooses his heart over what society taught him', w: ['He wants a reward', 'Tom Sawyer tells him to', 'He is afraid of Jim'], why: 'Chapter XXXI.' },
    { q: 'What does the raft stand for in the novel?', r: 'Freedom and friendship, away from the cruelty on shore', w: ['Wealth', 'School', 'The government'], why: '"You feel mighty free and easy and comfortable on a raft."' },
    { q: 'Why does the novel use words that hurt?', r: 'Twain wrote the speech of a slave-holding society realistically, and many readers see the book as exposing its racism', w: ['There is no reason', 'The words were polite then and now', 'Twain did not write them'], why: 'Schools and families have long discussed how to read and teach it.' },
    { q: 'What do many readers criticize about the last chapters?', r: 'Tom Sawyer turns Jim\'s rescue into a long game while Jim suffers', w: ['They are too short', 'They have no humor', 'They are set in Europe'], why: 'Critics have debated the ending since the book appeared.' },
    { q: 'How does Jim become free in the end?', r: 'Miss Watson had freed him in her will', w: ['He buys his freedom', 'He escapes to Canada', 'Tom buys him'], why: 'Tom knew this and kept it secret to have his "adventure."' },
    { q: 'What do the king and the duke do?', r: 'They swindle river towns with fake shows and lies', w: ['They help Jim escape', 'They pilot steamboats', 'They run a school'], why: 'They finally sell Jim for a reward.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(TRIP, 'Huck and Jim\'s journey down the river', 'stop', R, lv); },
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Huckleberry Finn?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(CHOICE, function (a) { return 'When <b>' + a + '</b>, what does Huck do?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
