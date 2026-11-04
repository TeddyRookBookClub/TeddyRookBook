/* Frazer, The Golden Bough (gbx1). Families: which law of magic (similarity or contact), Frazer's three stages in
   order, terms, Frazer or his critics, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.frazer-golden-bough';
var LAW = [['sprinkling water to bring rain', 'the Law of Similarity'], ['keeping a child\'s tooth safe to protect the child', 'the Law of Contact'], ['leaping high so crops grow tall', 'the Law of Similarity'], ['treating the weapon that made a wound', 'the Law of Contact'], ['making a model of an animal before a hunt', 'the Law of Similarity'], ['hiding hair clippings from enemies', 'the Law of Contact']];
var STAGES = ['magic', 'religion', 'science'];
var TERMS = [['sympathetic magic', 'Frazer\'s name for magic based on the laws of similarity and contact'], ['homoeopathic (imitative) magic', 'magic that works by copying: like produces like'], ['contagious magic', 'magic that works through things once in contact'], ['the King of the Wood', 'the priest of Diana\'s grove at Nemi'], ['the golden bough', 'in Frazer\'s conclusion, the mistletoe'], ['fieldwork', 'living among a people to study them, which Frazer never did']];
var VIEW = [['thought moves from magic through religion to science', 'Frazer'], ['magic, religion and science exist side by side', 'later anthropologists'], ['customs can be compared from reports gathered worldwide', 'Frazer'], ['customs must be studied in their setting, by living among the people', 'Bronisław Malinowski'], ['rituals are not simply mistaken science; they express something', 'Ludwig Wittgenstein']];
var WHO = [
  ['Like produces like, and things once in contact keep acting on each other.', 'James George Frazer', 'The two laws of magic, Chapter III (our summary).'],
  ['Live for years among the people you study, and learn their language.', 'Bronisław Malinowski', 'Frazer\'s admirer who founded modern fieldwork.'],
  ['Aeneas must pluck the golden bough to enter the underworld.', 'Virgil', 'The Aeneid, Book VI, which gave Frazer his title.'],
  ['Myths are built from pairs of opposites with a logic of their own.', 'Claude Lévi-Strauss', 'Structural Anthropology (our summary).'],
  ['Each people thinks its own customs the best.', 'Herodotus', 'The Histories (our summary).']
];
var B = {
  facts: [
    ['The abridged one-volume Golden Bough was published in 1922.', true, 'Frazer cut it down himself from twelve volumes.'],
    ['Frazer did years of fieldwork among the peoples he wrote about.', false, 'He worked from books and reports in Cambridge.'],
    ['The book opens at the lake of Nemi, near Rome.', true, 'The sacred grove of Diana.'],
    ['Frazer concluded that the golden bough was the mistletoe.', true, 'Near the end of the book.'],
    ['Later anthropologists fully accepted Frazer\'s three stages.', false, 'Fieldwork found magic, religion and science side by side.'],
    ['T. S. Eliot named The Golden Bough in his notes to The Waste Land.', true, '1922.']
  ],
  items: [
    { q: 'What are Frazer\'s two laws of magic?', r: 'Similarity (like produces like) and contact (once touched, still linked)', w: ['Gravity and motion', 'Supply and demand', 'Cause and chance'], why: 'Chapter III.' },
    { q: 'Why did later anthropologists distrust Frazer\'s method?', r: 'He compared customs out of context, from reports, without fieldwork', w: ['He used too much mathematics', 'He wrote only about Scotland', 'He never read books'], why: 'Malinowski and others insisted on fieldwork.' },
    { q: 'Which ancient poem gave Frazer his title?', r: 'Virgil\'s Aeneid', w: ['Homer\'s Iliad', 'Dante\'s Inferno', 'Beowulf'], why: 'Aeneas and the golden bough, Book VI.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(LAW, function (a) { return 'Which of Frazer\'s laws of magic is behind <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.seq(STAGES, 'Frazer\'s three stages of thought', 'stage', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In The Golden Bough, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(VIEW, function (a) { return 'Whose view is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
