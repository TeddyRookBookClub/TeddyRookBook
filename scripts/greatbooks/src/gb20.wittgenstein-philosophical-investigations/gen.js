/* Wittgenstein, Philosophical Investigations (gbx1). No excerpts (1953). Families: family resemblance (shared features,
   computed from a small table), early or late Wittgenstein, terms, language games, who said what, dates. Uses H.k20. */
var ID = 'gb20.wittgenstein-philosophical-investigations';
var FE = ['winning and losing', 'skill', 'luck', 'more than one player', 'a board', 'a ball'];
var GM = [['chess', [0, 1, 3, 4]], ['solitaire', [0, 1, 2]], ['tennis', [0, 1, 3, 5]], ['ring-around-the-rosy', [3]], ['snakes and ladders', [0, 2, 3, 4]], ['catch', [1, 3, 5]]];
function famShared(R, lv) {
  var p = R.sample(GM, 2), a = p[0], b = p[1], sh = a[1].filter(function (j) { return b[1].indexOf(j) >= 0; });
  var tbl = GM.map(function (g) { return g[0] + ': ' + g[1].map(function (j) { return FE[j]; }).join(', '); }).join('; ');
  return H.num('Using this (our own) table of games and features: <i>' + tbl + '</i>. How many features do <b>' + a[0] + '</b> and <b>' + b[0] + '</b> share?', sh.length,
    [a[0] + ': ' + a[1].map(function (j) { return FE[j]; }).join(', ') + '.', b[0] + ': ' + b[1].map(function (j) { return FE[j]; }).join(', ') + '.', 'Shared: ' + (sh.length ? sh.map(function (j) { return FE[j]; }).join(', ') : 'none') + '. Overlapping likenesses, but no single feature shared by every game: family resemblance.'], { hint: 'List each game\'s features and count the ones on both lists.' });
}
var PERIOD = [['language pictures facts, the way a map pictures a land', 'the early Wittgenstein (Tractatus, 1921)'], ['the meaning of a word is, in many cases, its use', 'the later Wittgenstein (Investigations, 1953)'], ['many words have family resemblances, not one definition', 'the later Wittgenstein (Investigations, 1953)'], ['what cannot be said clearly must be passed over in silence', 'the early Wittgenstein (Tractatus, 1921)'], ['language is a crowd of different games', 'the later Wittgenstein (Investigations, 1953)']];
var TERMS = [['a language game', 'a whole practice of using words, like the builders\' four-word language'], ['family resemblance', 'overlapping likenesses with no single shared feature'], ['meaning as use', 'the meaning of a word is found in how it is used'], ['the private language argument', 'a language only one person could understand could not work'], ['rule-following', 'a shared practice we are trained into, not a rule that explains itself'], ['the Augustinian picture', 'the idea that every word names an object']];
var GAMES = ['giving orders and obeying them', 'describing an object', 'telling a story', 'guessing a riddle', 'making a joke', 'thanking', 'greeting', 'praying'];
var WHO = [
  ['I learned words by seeing what my elders pointed to as they named things.', 'Augustine', 'Confessions, Book I; the passage that opens the Investigations.'],
  ['The meaning of a word is, in many cases, its use in the language.', 'Ludwig Wittgenstein', 'Philosophical Investigations (our summary).'],
  ['Language can be analysed with the tools of logic.', 'Bertrand Russell', 'Wittgenstein\'s teacher.'],
  ['The rule-following argument leads to a new kind of skepticism about meaning.', 'Saul Kripke', 'His 1982 reading of the Investigations.'],
  ['What is courage? Let us find the one thing all brave acts share.', 'Socrates', 'In Plato\'s dialogues; family resemblance questions whether there always is one.']
];
var B = {
  facts: [
    ['Philosophical Investigations was published in 1953, after Wittgenstein\'s death.', true, 'He died in 1951.'],
    ['The Investigations opens with a passage from Augustine\'s Confessions.', true, 'Augustine on learning to speak.'],
    ['Wittgenstein agreed with his Tractatus all his life.', false, 'The Investigations criticizes it.'],
    ['Wittgenstein thought every word is the name of an object.', false, 'He called that only one picture of language.'],
    ['Wittgenstein worked for a time as a village schoolteacher.', true, 'In Austria, in the 1920s.'],
    ['Wittgenstein studied with Bertrand Russell at Cambridge.', true, 'From 1911.'],
    ['In the builders\' game there are four words.', true, 'Block, pillar, slab, beam.']
  ],
  items: [
    { q: 'What is a "language game"?', r: 'A practice of using words together, like giving orders or telling a story', w: ['A crossword puzzle', 'A spelling contest', 'A secret code'], why: 'Section 23 lists many.' },
    { q: 'What do all games have in common, for Wittgenstein?', r: 'No single feature, but a network of overlapping likenesses', w: ['Winning and losing', 'A ball', 'A board'], why: 'Family resemblance.' },
    { q: 'What is the private language argument against?', r: 'The idea of a language that only one person could ever understand', w: ['Speaking quietly', 'Learning foreign languages', 'Writing diaries'], why: 'Use needs shared practice.' },
    { q: 'What did Wittgenstein think philosophy should do with many puzzles?', r: 'Show how they come from misusing words, so they dissolve', w: ['Solve them by experiment', 'Vote on them', 'Ignore language'], why: 'His image of the fly in the bottle.' }
  ]
};
H.T(ID, B, [
  famShared,
  function (R, lv) { return H.k20.pairs(PERIOD, function (a) { return 'Early or late Wittgenstein? <b>' + a + '</b>'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In the Investigations, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { var g = R.pick(GAMES); return H.mc('Which of these is one of the many language games Wittgenstein lists?', g, ['naming the atoms of a fact', 'defining a word once for all', 'a language only one person understands'].slice(0, lv === 1 ? 2 : 3), ['His list (our wording) includes: ' + GAMES.join(', ') + '.']); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
