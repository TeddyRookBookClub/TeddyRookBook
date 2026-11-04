/* Chekhov, Uncle Vanya (gbx3). Families: the four acts in order, who's who, who said what, Chekhov's plays by date, dates. Uses H.k20. */
var ID = 'gb20.chekhov-uncle-vanya';
var ACTS = ['the professor and Yelena have come to stay (Act I)', 'a sleepless night of quarrels and confessions (Act II)', 'the professor proposes to sell the estate (Act III)', 'the guests leave and the work goes on (Act IV)'];
var PLAYS = ['The Seagull (1896)', 'Uncle Vanya (1897)', 'Three Sisters (1901)', 'The Cherry Orchard (1904)'];
var WHO = [['Vanya', 'manages the estate and sends its money to the professor'], ['Sonya', 'the professor\'s daughter, who loves the doctor in secret'], ['Serebryakov', 'the retired professor Vanya once admired'], ['Yelena', 'the professor\'s young, bored second wife'], ['Astrov', 'the country doctor who plants forests'], ['Marina', 'the old nurse who keeps the samovar going']];
var SAID = [
  ['We must live our lives. Yes, we shall live.', 'Sonya', 'The play\'s last speech.'],
  ['Forests teach mankind to understand beauty.', 'Astrov', 'Sonya repeats his idea in Act I.'],
  ['I have wasted my life working for a man who is a fraud.', 'Vanya', 'Our summary of his discovery.'],
  ['Let us sell the estate and invest the money.', 'Serebryakov', 'Our summary of his plan in Act III.'],
  ['I am bored, and I don\'t know what to do with myself.', 'Yelena', 'Our summary.']
];
var B = {
  facts: [
    ['Chekhov was a doctor as well as a writer.', true, 'He trained in Moscow and practiced medicine.'],
    ['Uncle Vanya is subtitled "Scenes from Country Life."', true, 'It is set on a Russian country estate.'],
    ['The Moscow Art Theatre staged Uncle Vanya in 1899.', true, 'The same company staged The Seagull and Three Sisters.'],
    ['In Act III, Vanya\'s pistol shots wound the professor.', false, 'He misses both times.'],
    ['At the end, Vanya and Sonya go back to their account books.', true, 'Their work goes on.'],
    ['Astrov returns Sonya\'s love.', false, 'He barely notices her.'],
    ['Chekhov thought of his plays as partly comic.', true, 'Their self-pitying characters are often funny.'],
    ['The professor plans to give the estate to Vanya.', false, 'He plans to sell it.']
  ],
  items: [
    { q: 'Why does Vanya feel his life has been wasted?', r: 'He worked for years for the professor, who turns out to be ordinary', w: ['He lost his money gambling', 'He never left Moscow', 'He failed as a doctor'], why: 'His hero turns out to be a fraud, he thinks.' },
    { q: 'What does Astrov make maps of?', r: 'The district\'s disappearing forests', w: ['Railroad lines', 'The stars', 'Battlefields'], why: 'He plants trees for the future.' },
    { q: 'Where does most of the play\'s drama happen?', r: 'Under the surface of everyday talk', w: ['On a battlefield', 'In a courtroom', 'On a ship at sea'], why: 'Characters chat about tea and weather while their lives break.' },
    { q: 'How does the play end?', r: 'Sonya comforts Vanya and they go back to work', w: ['With a wedding', 'With the estate sold', 'With Vanya leaving for Moscow'], why: 'Sonya\'s last speech.' },
    { q: 'Who owns the estate, by inheritance?', r: 'Sonya, from her late mother', w: ['Astrov', 'Yelena', 'Marina'], why: 'That is why the sale would wrong her.' },
    { q: 'Which of these is another of Chekhov\'s four great plays?', r: 'The Cherry Orchard', w: ['A Doll\'s House', 'Saint Joan', 'Mother Courage'], why: 'His last play, 1904.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(ACTS, 'the four acts of Uncle Vanya', 'act', R, lv); },
  function (R, lv) { return H.k20.seq(PLAYS, 'Chekhov\'s four great plays, by date', 'play', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Uncle Vanya, who is <b>' + a + '</b>?'; }, function (b) { return 'Which character <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
