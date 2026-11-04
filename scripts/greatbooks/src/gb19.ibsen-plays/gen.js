/* Ibsen, the four plays in the set (gbw4). Families: the plays by date, which play has which character, how each hidden past
   comes out, who said what, dates. Uses H.k19. */
var ID = 'gb19.ibsen-plays';
var PLAYS = ['A Doll\'s House (1879)', 'The Wild Duck (1884)', 'Hedda Gabler (1890)', 'The Master Builder (1892)'];
var CHAR = [['Nora Helmer', 'A Doll\'s House'], ['Torvald Helmer', 'A Doll\'s House'], ['Krogstad', 'A Doll\'s House'], ['Hjalmar Ekdal', 'The Wild Duck'], ['Gregers Werle', 'The Wild Duck'], ['Dr. Relling', 'The Wild Duck'], ['Eilert Lövborg', 'Hedda Gabler'], ['Thea Elvsted', 'Hedda Gabler'], ['Halvard Solness', 'The Master Builder'], ['Hilde Wangel', 'The Master Builder']];
var SECRET = [['A Doll\'s House', 'a secret loan and a forged signature'], ['The Wild Duck', 'a rich man\'s hidden part in a family\'s happiness'], ['Hedda Gabler', 'an old bond with a brilliant, troubled writer'], ['The Master Builder', 'a fire that made a builder\'s fortune']];
var WHO = [
  ['Before all else I am a human being, just as much as you are, or at least I will try to become one.', 'Nora', 'A Doll\'s House, Act III, in Archer\'s translation.'],
  ['Rob the average man of his life-illusion, and you rob him of his happiness at the same time.', 'Dr. Relling', 'The Wild Duck, Act V.'],
  ['Everyone must live in the truth, whatever it costs.', 'Gregers Werle', 'Our summary of his ideal.'],
  ['You promised me a kingdom, ten years ago.', 'Hilde Wangel', 'Our summary, The Master Builder.'],
  ['Before all else you are a wife and a mother.', 'Torvald Helmer', 'A Doll\'s House, Act III.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Henrik Ibsen was Norwegian.', true, 'Born in Skien in 1828; he wrote in Dano-Norwegian.'],
    ['A Doll\'s House was first staged in Copenhagen in 1879.', true, 'It caused a sensation across Europe.'],
    ['Ibsen wrote his famous later plays in verse.', false, 'In everyday prose; his earlier Peer Gynt and Brand are in verse.'],
    ['In A Doll\'s House, Nora leaves her husband at the end.', true, 'The door slams.'],
    ['William Archer translated Ibsen into English from 1880 on.', true, 'His editions brought Ibsen to the English stage.'],
    ['Ibsen lived abroad, in Italy and Germany, for 27 years.', true, '1864 to 1891.'],
    ['In The Wild Duck, telling the truth makes everyone happy at once.', false, 'It breaks the family apart.'],
    ['Ibsen is often called the father of modern drama.', true, 'For his realistic prose plays about ordinary homes.']
  ],
  items: [
    { q: 'Why did Nora forge a signature?', r: 'To borrow money secretly to save her sick husband\'s life', w: ['To steal from a bank', 'To buy a new house', 'To pay for a party'], why: 'A wife then could not borrow without a man\'s consent.' },
    { q: 'What does Torvald care about most when he learns the secret?', r: 'His reputation', w: ['Nora\'s safety', 'The children\'s toys', 'His health'], why: 'Nora\'s hoped-for "miracle," that he would take the blame, does not happen.' },
    { q: 'What is the "life-illusion" in The Wild Duck?', r: 'A comforting belief that helps a person go on living', w: ['A magic trick', 'A wild duck\'s name', 'A kind of photograph'], why: 'Dr. Relling\'s phrase.' },
    { q: 'What does the wild duck in the attic stand for, many readers think?', r: 'A wounded creature living a make-believe life, like the family', w: ['A hunting trophy only', 'Good luck', 'A recipe'], why: 'Ibsen leaves the symbol open.' },
    { q: 'What makes Ibsen\'s plays "modern"?', r: 'Ordinary homes, everyday speech and hidden problems brought into the open', w: ['Kings and battles', 'Gods on stage', 'Songs and dances'], why: 'Earlier tragedy was about kings and heroes.' },
    { q: 'Which play ends with a builder climbing a tower?', r: 'The Master Builder', w: ['A Doll\'s House', 'Hedda Gabler', 'The Wild Duck'], why: '1892.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(PLAYS, 'Ibsen\'s four plays in the set, by date', 'play', R, lv); },
  function (R, lv) { return H.k19.pairs(CHAR, function (a) { return 'In which play is <b>' + a + '</b> a character?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(SECRET, function (a) { return 'What hidden past comes to light in <b>' + a + '</b>?'; }, function (b) { return 'In which play does <b>' + b + '</b> come to light?'; }, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
