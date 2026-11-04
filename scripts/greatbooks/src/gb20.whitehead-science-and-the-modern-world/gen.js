/* Whitehead, Science and the Modern World (gbx1). Families: chapters (centuries) in order, his claims, terms,
   concrete or abstract, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.whitehead-science-and-the-modern-world';
var CH = ['The Origins of Modern Science', 'Mathematics as an Element in the History of Thought', 'The Century of Genius', 'The Eighteenth Century', 'The Romantic Reaction', 'The Nineteenth Century', 'Relativity', 'The Quantum Theory'];
var CLAIMS = [['the source of the faith that nature is orderly', 'an unconscious inheritance from medieval theology'], ['the greatest invention of the nineteenth century', 'the invention of the method of invention'], ['the fallacy of misplaced concreteness', 'mistaking an abstraction for the concrete fact'], ['the Romantic poets such as Wordsworth', 'witnesses that nature as we meet it is full of value'], ['the 17th-century picture of nature', 'bits of matter moving in space, with colour and sound put in the mind'], ['the philosophy of organism', 'the world as interconnected events and processes']];
var CA = [['the warmth you feel on a summer evening', 'concrete experience'], ['a list of air temperatures in a table', 'abstraction'], ['the sound of the sea as you hear it', 'concrete experience'], ['the wavelength of red light, in nanometers', 'abstraction'], ['a point-mass in a physics problem', 'abstraction'], ['the taste of an apple as you bite it', 'concrete experience'], ['the formula for a falling body', 'abstraction']];
var WHO = [
  ['The faith that nature is orderly came, without our noticing, from medieval theology.', 'Alfred North Whitehead', 'Science and the Modern World, Chapter I (our summary).'],
  ['Shapes and motions are in things; colours and tastes are only in us.', 'Galileo Galilei', 'The kind of division Whitehead criticized.'],
  ['Mathematics can be built up from logic alone.', 'Russell and Whitehead', 'The aim of Principia Mathematica.'],
  ['Lived time is a flowing duration, not a row of instants.', 'Henri Bergson', 'Whitehead acknowledged a debt to him.'],
  ['Nature as we see and feel it is alive with presence and meaning.', 'William Wordsworth', 'Our summary of the poet Whitehead discusses in The Romantic Reaction.']
];
var B = {
  facts: [
    ['Science and the Modern World grew from Lowell Lectures given in 1925.', true, 'In Boston, soon after Whitehead moved to Harvard.'],
    ['Whitehead was trained as a mathematician.', true, 'He taught mathematics at Cambridge and London for decades.'],
    ['Whitehead said nature really is a dull affair, without colour or sound.', false, 'He described that as the result of a mistaken philosophy, ironically.'],
    ['Whitehead thought scientific abstractions are useless.', false, 'He thought they are powerful but not the whole of reality.'],
    ['Whitehead admired the Romantic poets\' sense of nature.', true, 'Chapter V, The Romantic Reaction.'],
    ['Historians all agree with Whitehead about medieval theology and science.', false, 'It is still debated.']
  ],
  items: [
    { q: 'What is the "fallacy of misplaced concreteness"?', r: 'Mistaking an abstraction for the concrete reality', w: ['Building with too little concrete', 'Putting facts in the wrong order', 'Forgetting a date'], why: 'Chapter III.' },
    { q: 'What belief did Whitehead think science needed before it could begin?', r: 'That every event follows from earlier ones in a definite, orderly way', w: ['That the earth is flat', 'That magic works', 'That nothing can be known'], why: 'Chapter I.' },
    { q: 'What did Whitehead call the greatest invention of the 19th century?', r: 'The method of invention', w: ['The steam engine', 'The telephone', 'The printing press'], why: 'Chapter VI.' },
    { q: 'Which famous earlier book did Whitehead write with Russell?', r: 'Principia Mathematica', w: ['The Problems of Philosophy', 'The Origin of Species', 'The Wealth of Nations'], why: '1910–13.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CH, 'the chapters of Science and the Modern World', 'chapter', R, lv); },
  function (R, lv) { return H.k20.pairs(CLAIMS, function (a) { return 'In Science and the Modern World, what does Whitehead say about <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(CA, function (a) { return 'Whitehead\'s distinction: is <b>' + a + '</b> concrete experience or an abstraction?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
