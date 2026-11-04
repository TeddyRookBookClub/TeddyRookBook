/* Pirandello, Six Characters in Search of an Author (gbx3). Families: the play in order, who's who, who said what, terms, dates. Uses H.k20. */
var ID = 'gb20.pirandello-six-characters';
var PLOT = ['the actors rehearse on a bare stage', 'six characters arrive in search of an author', 'the Father and the Stepdaughter tell their story', 'the actors try to play the scenes', 'the characters protest that it is all wrong', 'a sudden tragedy leaves everyone unsure what was real'];
var WHO = [['the Father', 'argues that a character is more real than an actor'], ['the Stepdaughter', 'wants the whole painful story shown'], ['the Son', 'refuses to take part in the drama'], ['the Mother', 'dressed in mourning, she barely speaks'], ['the Manager', 'the director, who tries to stage the characters\' story'], ['the Leading Lady', 'the actress asked to play the Stepdaughter']];
var TERMS = [['metatheater', 'a play about the making of plays'], ['character', 'a person who lives in an author\'s imagination'], ['the rehearsal', 'the actors\' practice that the characters interrupt'], ['the author', 'the one who left the characters unfinished']];
var SAID = [
  ['We have come here in search of an author.', 'the Father', 'Act I.'],
  ['We haven\'t time to waste with mad people.', 'the Manager', 'Act I.'],
  ['A character has a life of his own and is always somebody.', 'the Father', 'Act III.'],
  ['That is not how it was! Play it the way it happened!', 'the Stepdaughter', 'Our summary of her protests.'],
  ['I want nothing to do with this drama.', 'the Son', 'Our summary.']
];
var B = {
  facts: [
    ['Pirandello was born in Sicily.', true, 'In 1867.'],
    ['Six Characters was first staged in Rome in 1921.', true, 'The audience was in an uproar.'],
    ['Pirandello won the Nobel Prize in Literature in 1934.', true, 'Two years before his death.'],
    ['The six characters are ghosts of dead actors.', false, 'They are characters an author left unfinished.'],
    ['The actors are rehearsing a play by Pirandello himself when the characters arrive.', true, 'A joke inside the play.'],
    ['The characters are pleased with how the actors play them.', false, 'They protest that it is false.'],
    ['Edward Storer\'s English translation appeared in 1922.', true, 'In Three Plays, published by Dutton.'],
    ['By the end, everyone agrees about what was real.', false, 'No one is sure.']
  ],
  items: [
    { q: 'What do the six characters want?', r: 'To have their unfinished story played out', w: ['To buy the theater', 'To join the company as actors', 'To find a lost child'], why: 'Their author left them without a play.' },
    { q: 'Why does the Father say a character is more real than a person?', r: 'A character\'s nature is fixed, while a person changes', w: ['Characters never get sick', 'Characters are famous', 'Characters can fly'], why: 'He is always "somebody."' },
    { q: 'What is metatheater?', r: 'A play about the making of plays', w: ['A very long play', 'A play with music', 'A play outdoors'], why: 'Pirandello made the frame itself the drama.' },
    { q: 'How does the Manager first react to the characters?', r: 'He thinks they are mad and tells them to leave', w: ['He welcomes them warmly', 'He calls the police', 'He faints'], why: 'Then curiosity wins.' },
    { q: 'Which earlier work also lets characters argue about their own book?', r: 'Don Quixote, Part II', w: ['The Iliad', 'The Prince', 'The Origin of Species'], why: 'Cervantes plays a similar game.' },
    { q: 'What big question does the play ask?', r: 'Can anyone show the truth of another person\'s life?', w: ['Who will win the war?', 'How do plants grow?', 'Which actor is the richest?'], why: 'Reality and illusion.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(PLOT, 'Six Characters in Search of an Author', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Six Characters, who is <b>' + a + '</b>?'; }, function (b) { return 'Who <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean here?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
