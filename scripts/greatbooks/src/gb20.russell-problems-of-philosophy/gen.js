/* Russell, The Problems of Philosophy (gbx1). Families: deductive or inductive (with the logic), acquaintance or
   description, appearance and reality, chapters in order, terms, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.russell-problems-of-philosophy';
var ARG = [
  ['The sun has risen every day in recorded history, so it will rise tomorrow.', 'inductive: probable, not certain'],
  ['All squares have four sides. This shape is a square. So it has four sides.', 'deductive: if the premises are true, the conclusion must be'],
  ['Every swan I have seen is white, so all swans are white.', 'inductive: probable, not certain'],
  ['If it is raining, the street is wet. It is raining. So the street is wet.', 'deductive: if the premises are true, the conclusion must be'],
  ['The chicken has been fed every morning, so it will be fed tomorrow.', 'inductive: probable, not certain'],
  ['All men are mortal. Socrates is a man. So Socrates is mortal.', 'deductive: if the premises are true, the conclusion must be'],
  ['Every copper wire tested so far conducts electricity, so the next one will.', 'inductive: probable, not certain']
];
var KNOW = [['the patch of brown you see right now', 'acquaintance'], ['the first emperor of Rome', 'description'], ['a pain you are feeling', 'acquaintance'], ['the tallest mountain on the moon', 'description'], ['the sound you hear this moment', 'acquaintance'], ['the author of the Iliad', 'description'], ['your own present thought', 'acquaintance'], ['the center of the earth', 'description']];
var CH = ['Appearance and Reality', 'The Existence of Matter', 'The Nature of Matter', 'Idealism', 'Knowledge by Acquaintance and Knowledge by Description', 'On Induction'];
var TERMS = [['sense-data', 'the things immediately known in sensation: colours, sounds, smells, hardnesses'], ['induction', 'reasoning from past cases to new or future ones'], ['knowledge by acquaintance', 'direct awareness of a thing, without any inference'], ['knowledge by description', 'knowing a thing only as "the so-and-so"'], ['correspondence', 'Russell\'s account of truth: a belief is true when it fits a fact'], ['instinctive belief', 'our natural belief in a world beyond our sense-data, which Russell thought reasonable to keep']];
var WHO = [
  ['There is nothing behind our perceptions: to be is to be perceived.', 'George Berkeley', 'Russell answers him in Chapter IV.'],
  ['A belief is true when it corresponds to a fact.', 'Bertrand Russell', 'Chapter XII (our summary).'],
  ['A true idea is one that works out in experience.', 'William James', 'Pragmatism, 1907; Russell disagreed.'],
  ['Past regularity gives no reason, by itself, to expect the future to be like the past.', 'David Hume', 'The original problem of induction.'],
  ['I think, therefore I am.', 'René Descartes', 'Russell discusses his method of doubt in Chapter II.']
];
var B = {
  facts: [
    ['The Problems of Philosophy was published in 1912.', true, 'In the Home University Library.'],
    ['Russell said the table looks the same colour from every point of view.', false, 'It looks different colours from different points of view.'],
    ['Russell thought we can prove beyond doubt that the table exists.', false, 'He thought belief in it is reasonable, not provable.'],
    ['Russell wrote Principia Mathematica with Alfred North Whitehead.', true, '1910–13.'],
    ['Russell thought inductive arguments make their conclusions certain.', false, 'Probable, never certain.'],
    ['Russell ends the book by saying philosophy is valuable for its questions.', true, 'Chapter XV, The Value of Philosophy.'],
    ['Russell won the Nobel Prize in Literature.', true, 'In 1950.']
  ],
  items: [
    { q: 'What are sense-data, for Russell?', r: 'The colours, shapes and sounds we are directly aware of', w: ['Numbers in a computer', 'Facts in an encyclopedia', 'The table itself'], why: 'Chapter I.' },
    { q: 'What does the chicken example show?', r: 'A pattern in the past does not guarantee the future', w: ['Chickens are clever', 'Farmers are kind', 'Animals cannot learn'], why: 'Chapter VI, On Induction.' },
    { q: 'How did Russell\'s account of truth differ from James\'s?', r: 'Truth is fitting the facts, not working out in practice', w: ['They agreed completely', 'Russell said nothing is true', 'Russell said truth is what most people believe'], why: 'Chapter XII.' },
    { q: 'Why, for Russell, is philosophy worth studying?', r: 'Its questions enlarge our sense of what is possible and loosen dogmatic certainty', w: ['It gives final answers', 'It is easy', 'It makes people rich'], why: 'Chapter XV.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(ARG, function (a) { return 'Is this argument deductive or inductive? <i>' + a + '</i>'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(KNOW, function (a) { return 'In Russell\'s terms, do you know <b>' + a + '</b> by acquaintance or by description?'; }, null, R, lv); },
  function (R, lv) { return H.k20.seq(CH, 'the first chapters of The Problems of Philosophy', 'chapter', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In Russell\'s book, what is meant by <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
