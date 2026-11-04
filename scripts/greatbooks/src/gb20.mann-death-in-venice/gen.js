/* Mann, Death in Venice (gbx3). Families: chapters in order, key terms, Mann's works by date, who said what, dates. Uses H.k20. */
var ID = 'gb20.mann-death-in-venice';
var CH = ['a stranger at the cemetery in Munich', 'the history of a disciplined writer', 'arrival in Venice by sea', 'idle days at the beach hotel', 'the hidden plague and Aschenbach\'s death'];
var WORKS = ['Buddenbrooks (1901)', 'Death in Venice (1912)', 'The Magic Mountain (1924)', 'Doctor Faustus (1947)'];
var TERMS = [['Apollonian', 'order, form and self-command, in Nietzsche\'s terms'], ['Dionysian', 'frenzy, release and intoxication, in Nietzsche\'s terms'], ['the Lido', 'the beach island where Aschenbach\'s hotel stands'], ['cholera', 'the epidemic the city tries to hide'], ['irony', 'a narrator who sees more than the hero does']];
var SAID = [
  ['Discipline is everything; a great work is made by endurance.', 'Aschenbach', 'Our summary of his creed.'],
  ['Art is born from a struggle between order and frenzy.', 'Nietzsche', 'Our summary of The Birth of Tragedy.'],
  ['There is no sickness in the city; all is well.', 'the Venetian officials', 'Our summary of their cover-up.'],
  ['Beauty can lift the soul, or lead it astray.', 'Plato\'s Socrates', 'Our summary of the Phaedrus, which Aschenbach recalls.']
];
var B = {
  facts: [
    ['Thomas Mann won the Nobel Prize in Literature in 1929.', true, 'Mostly for Buddenbrooks.'],
    ['Death in Venice was first published in 1912.', true, 'In German, as Der Tod in Venedig.'],
    ['Aschenbach is a famous composer from Paris.', false, 'He is a famous writer from Munich.'],
    ['The Venetian authorities hide the epidemic.', true, 'To protect the tourist trade.'],
    ['Aschenbach warns the other guests and leaves Venice.', false, 'He warns no one and stays.'],
    ['Mann left Germany after the Nazis came to power.', true, 'He settled in the United States.'],
    ['Kenneth Burke\'s English translation appeared in 1924.', true, 'In The Dial, a New York magazine.'],
    ['The story is told with irony.', true, 'The narrator sees more than Aschenbach.']
  ],
  items: [
    { q: 'What has Aschenbach built his life on?', r: 'Discipline and hard work', w: ['Travel and adventure', 'Wealth and parties', 'Family farming'], why: 'His books praise heroes of endurance.' },
    { q: 'What sets off his journey?', r: 'A sudden restlessness after seeing a stranger', w: ['A letter from a friend', 'A doctor\'s order', 'A lost bet'], why: 'At a cemetery in Munich.' },
    { q: 'How does Aschenbach think Venice should be approached?', r: 'By ship, over the sea', w: ['By railroad', 'By balloon', 'On foot'], why: 'By land is like entering a palace from the rear.' },
    { q: 'Why does the plague matter in the story?', r: 'The city hiding its sickness mirrors a man hiding the truth from himself', w: ['It is a cheerful subplot', 'It explains the weather', 'It is only history'], why: 'Inner and outer collapse go together.' },
    { q: 'Which thinker\'s ideas about order and frenzy shaped the story?', r: 'Nietzsche', w: ['Adam Smith', 'Locke', 'Darwin'], why: 'The Apollonian and the Dionysian.' },
    { q: 'Which composer made Death in Venice into an opera?', r: 'Benjamin Britten', w: ['Mozart', 'Verdi', 'Bach'], why: 'In 1973.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CH, 'the five chapters of Death in Venice', 'chapter', R, lv); },
  function (R, lv) { return H.k20.seq(WORKS, 'Thomas Mann\'s books by date', 'book', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean here?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
