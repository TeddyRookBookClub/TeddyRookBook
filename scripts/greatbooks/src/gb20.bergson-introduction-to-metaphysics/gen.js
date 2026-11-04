/* Bergson, An Introduction to Metaphysics (gbx1). Families: analysis or intuition, his examples, terms, who said what
   (our summaries), how it was received, dates. Uses H.k20. */
var ID = 'gb20.bergson-introduction-to-metaphysics';
var WAYS = [['moving round the object', 'analysis'], ['entering into the object', 'intuition'], ['uses symbols: words, numbers, diagrams', 'analysis'], ['depends on a point of view', 'analysis'], ['coincides with what is unique in the thing', 'intuition'], ['stops at the relative', 'analysis'], ['reaches the absolute, where it is possible', 'intuition'], ['the usual method of science', 'analysis'], ['following our own life as it flows', 'intuition']];
var EXS = [['all the photographs of a town', 'never equal walking in the town itself'], ['all the translations of a poem', 'never give the poem\'s own meaning in full'], ['a novelist\'s description of a character', 'is not the same as being that person'], ['the notes of a melody listed one by one', 'are not the melody as heard']];
var TERMS = [['duration (durée)', 'lived time, flowing, each moment colored by the ones before'], ['intuition', 'intellectual sympathy that places us within an object'], ['analysis', 'reducing an object to elements already known and common to other things'], ['metaphysics', 'for Bergson, the science that claims to do without symbols']];
var WHO = [
  ['There are two ways of knowing: moving round a thing, and entering into it.', 'Henri Bergson', 'An Introduction to Metaphysics (our summary).'],
  ['Trusting intuition over intellect is a step away from careful reasoning.', 'Bertrand Russell', 'His 1912 critique of Bergson.'],
  ['Time in physics is what clocks measure, and relativity tells us how.', 'Albert Einstein', 'He and Bergson debated time in Paris in 1922.'],
  ['Thought flows like a stream, not in separate links.', 'William James', 'An admirer of Bergson.'],
  ['Nature is made of processes, not of bits of stuff.', 'Alfred North Whitehead', 'Process philosophy, influenced by Bergson.']
];
var B = {
  facts: [
    ['An Introduction to Metaphysics first appeared in French in 1903.', true, 'Hulme\'s English translation came in 1912.'],
    ['Bergson won the Nobel Prize in Literature.', true, 'In 1927.'],
    ['Bergson thought science is useless.', false, 'He valued analysis; he thought it was not the only way to know.'],
    ['For Bergson, lived time is like beads on a string.', false, 'Clock time is like that; lived time (duration) flows like a melody.'],
    ['T. E. Hulme, who translated the essay, was an English poet and critic.', true, 'Bergson revised the proofs himself.'],
    ['Bergson taught at the Collège de France in Paris.', true, 'His lectures drew large crowds.']
  ],
  items: [
    { q: 'What are Bergson\'s two ways of knowing a thing?', r: 'Moving round it (analysis) and entering into it (intuition)', w: ['Reading and writing', 'Seeing and hearing', 'Counting and measuring'], why: 'The essay\'s opening.' },
    { q: 'Why can\'t photographs of a town replace walking in it, for Bergson?', r: 'Each is a view from outside, and views never add up to the thing itself', w: ['Photographs are too expensive', 'Towns change too fast', 'Cameras are not allowed'], why: 'His example of the relative and the absolute.' },
    { q: 'What does Bergson call lived, flowing time?', r: 'Duration', w: ['The instant', 'The calendar', 'Eternity'], why: 'In French, durée.' },
    { q: 'Who famously debated time with Bergson in 1922?', r: 'Albert Einstein', w: ['Sigmund Freud', 'Charles Darwin', 'Isaac Newton'], why: 'In Paris; most physicists sided with Einstein.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(WAYS, function (a) { return 'Bergson: which way of knowing is described here: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(EXS, function (a) { return 'Finish Bergson\'s point (our wording): <b>' + a + '</b> ...'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In Bergson\'s essay, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
