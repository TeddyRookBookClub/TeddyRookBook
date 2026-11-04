/* Nietzsche, Beyond Good and Evil (gbw4). Families: the nine chapters in order, key terms, who said what (our summaries),
   which chapter, dates. Uses H.k19. */
var ID = 'gb19.nietzsche-beyond-good-and-evil';
var CH = ['Prejudices of Philosophers', 'The Free Spirit', 'The Religious Mood', 'Apophthegms and Interludes', 'The Natural History of Morals', 'We Scholars', 'Our Virtues', 'Peoples and Countries', 'What is Noble?'];
var TERMS = [['perspectivism', 'the view that all knowing is from some point of view'], ['will to power', 'Nietzsche\'s name for the basic drive in living things to grow, master and express their strength'], ['free spirit', 'a thinker who has escaped the habits and faiths of his time'], ['master morality', 'values that begin in the self-respect of the strong, who call themselves "good"'], ['slave morality', 'values that begin in resentment of the strong, who are called "evil"'], ['revaluation of values', 'questioning and re-ranking the values a culture takes for granted']];
var WHO = [
  ['He who fights with monsters should be careful lest he thereby become a monster.', 'Nietzsche', 'Aphorism 146.'],
  ['Every great philosophy so far has been the confession of its author, a kind of unconscious autobiography.', 'Nietzsche', 'Aphorism 6.'],
  ['The falseness of an opinion is not, for us, an objection to it.', 'Nietzsche', 'Aphorism 4: the question is whether it furthers life.'],
  ['Actions are right as they tend to promote happiness.', 'Mill', 'Nietzsche mocked the English utilitarians.'],
  ['I think, therefore I am.', 'Descartes', 'Nietzsche questioned whether "I" and "think" are as certain as Descartes believed (aphorism 16).'],
  ['There is a "true world" of Forms behind appearances.', 'Plato', 'In the Preface Nietzsche calls Plato\'s "pure spirit" the worst of errors.']
];
var WHERE = [['the aphorism about fighting monsters', 'Apophthegms and Interludes'], ['the attack on Descartes\'s "I think"', 'Prejudices of Philosophers'], ['master morality and slave morality', 'What is Noble?'], ['a "natural history" of how moral codes arose', 'The Natural History of Morals'], ['the hope for "free spirits," philosophers of the future', 'The Free Spirit']];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Beyond Good and Evil was published in 1886, at Nietzsche\'s own expense.', true, 'It sold few copies at first.'],
    ['Its subtitle is "Prelude to a Philosophy of the Future."', true, 'He saw it as clearing the way.'],
    ['Nietzsche wrote the book as one long continuous argument with no breaks.', false, 'It is made of 296 numbered sections, many of them short aphorisms.'],
    ['Nietzsche thought philosophers are often moved by hidden drives and prejudices.', true, 'Chapter I.'],
    ['Nietzsche supported the anti-Semitic movement of his day.', false, 'He despised it and broke with friends and his publisher over it; his sister later bent his work toward it.'],
    ['Helen Zimmern\'s English translation appeared in 1907.', true, 'Zimmern knew Nietzsche personally.'],
    ['Nietzsche taught classical philology at the University of Basel.', true, 'He became a professor at 24.'],
    ['Nietzsche thought the morality of his time was beyond question.', false, 'He called for a "revaluation" of values.']
  ],
  items: [
    { q: 'What does the title "Beyond Good and Evil" suggest?', r: 'Looking past the usual moral labels to ask where they came from', w: ['That nothing ever matters', 'A fantasy story about heroes', 'A guide to good manners'], why: 'Nietzsche asks for a "natural history" of morals.' },
    { q: 'In Nietzsche\'s account, how does "slave morality" begin?', r: 'In the resentment of the weak toward the strong', w: ['In a law passed by kings', 'In Greek mathematics', 'In the love of nature'], why: 'Aphorism 260; he develops it in On the Genealogy of Morals (1887).' },
    { q: 'What is the most common objection to Nietzsche\'s perspectivism?', r: 'If every view is only a perspective, so is that claim', w: ['It is too mathematical', 'It is about painting only', 'It agrees with Plato'], why: 'The "self-reference" problem.' },
    { q: 'How was Nietzsche\'s work misused after his death?', r: 'His sister edited it toward nationalist and anti-Semitic causes, and the Nazis claimed him', w: ['It was banned in every country', 'It was rewritten as a children\'s book', 'It was never read'], why: 'Scholars since have shown how much this distorted his views.' },
    { q: 'Which earlier philosopher does Nietzsche criticize most in the Preface?', r: 'Plato', w: ['Darwin', 'Mill', 'Tolstoy'], why: 'For inventing "pure spirit and the good in itself."' },
    { q: 'What form does most of the book take?', r: 'Short numbered sections, many of them aphorisms', w: ['A play in five acts', 'A long poem', 'Letters to a friend'], why: '296 sections and a closing poem.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(CH, 'the chapters of Beyond Good and Evil', 'chapter', R, lv); },
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean, in Nietzsche?'; }, function (b) { return 'Which term means: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(WHERE, function (a) { return 'Which chapter holds <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
