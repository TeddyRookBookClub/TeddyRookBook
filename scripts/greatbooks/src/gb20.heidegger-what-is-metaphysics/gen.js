/* Heidegger, What Is Metaphysics? (gbx1). No excerpts: the lecture has no public-domain English. Families: the steps
   of the lecture, terms, moods, who said what (our summaries), reception, dates. Uses H.k20. */
var ID = 'gb20.heidegger-what-is-metaphysics';
var STEPS = ['the sciences study beings, and nothing else', 'what about the nothing?', 'logic cannot grasp the nothing', 'moods such as boredom and anxiety reveal beings as a whole', 'in anxiety we face the nothing', 'so: why are there beings at all, rather than nothing?'];
var TERMS = [['beings', 'things that are: anything that exists'], ['metaphysics', 'asking about beings as a whole, beyond any one science'], ['anxiety (Angst)', 'for Heidegger, a mood with no particular object, in which beings as a whole slip away'], ['phenomenology', 'Husserl\'s method of describing experience as it shows itself'], ['Dasein', 'Heidegger\'s word for human existence: "being there"'], ['logical positivism', 'the view that only statements testable by experience or logic have meaning']];
var WHO = [
  ['Science studies beings, and nothing else; but what about the nothing?', 'Martin Heidegger', 'What Is Metaphysics?, 1929 (our summary).'],
  ['"Nothing" is not the name of anything, so sentences about "the nothing" say nothing.', 'Rudolf Carnap', 'His 1932 attack on metaphysics.'],
  ['Why is there something rather than nothing?', 'Gottfried Wilhelm Leibniz', 'The question Heidegger called fundamental.'],
  ['Describe experience exactly as it shows itself.', 'Edmund Husserl', 'The founder of phenomenology; Heidegger\'s teacher.'],
  ['Anxiety is the mood in which a person feels the open possibilities of freedom.', 'Søren Kierkegaard', 'Our summary of the 19th-century writer on anxiety whom Heidegger read.'],
  ['What can be said at all can be said clearly.', 'Ludwig Wittgenstein', 'Tractatus Logico-Philosophicus, preface (C. K. Ogden\'s translation, 1922).']
];
var B = {
  facts: [
    ['Heidegger gave What Is Metaphysics? as his inaugural lecture at Freiburg in 1929.', true, 'On taking over Husserl\'s chair.'],
    ['Heidegger\'s teacher was Edmund Husserl.', true, 'The founder of phenomenology.'],
    ['Heidegger thought logic is the best way to grasp the nothing.', false, 'He argued logic cannot grasp it; moods reveal it.'],
    ['Rudolf Carnap praised the lecture as a model of clear reasoning.', false, 'He used it as his main example of meaningless metaphysics.'],
    ['Heidegger\'s best-known book is Being and Time (1927).', true, 'Two years before this lecture.'],
    ['Heidegger joined the Nazi Party in 1933.', true, 'He served as rector of Freiburg in 1933–34.'],
    ['The lecture has a public-domain English translation from the 1920s.', false, 'The first English translation came in 1949.']
  ],
  items: [
    { q: 'What question ends the lecture?', r: 'Why are there beings at all, rather than nothing?', w: ['What is the speed of light?', 'Who wrote the Iliad?', 'How many stars are there?'], why: 'Leibniz\'s question.' },
    { q: 'For Heidegger, how do we first meet the nothing?', r: 'In moods such as anxiety, not by logic', w: ['In a laboratory', 'By counting to zero', 'In a dictionary'], why: 'The middle of the lecture.' },
    { q: 'What did Carnap say about sentences like Heidegger\'s on "the nothing"?', r: 'They look meaningful but cannot be true or false', w: ['They are the deepest truths', 'They are about physics', 'They are poems in disguise'], why: 'The 1932 essay on overcoming metaphysics.' },
    { q: 'Why is there no excerpt from the lecture on this page?', r: 'Its English translations are from 1949 and later, so none is public domain in the U.S.', w: ['It was never translated', 'It is too short', 'It was lost'], why: 'Libraries carry several translations.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STEPS, 'the argument of What Is Metaphysics?', 'step', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean here?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
