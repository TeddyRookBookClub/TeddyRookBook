/* Faulkner, A Rose for Emily (gbx3). Families: events in time order, events in telling order, terms, who said what, dates. Uses H.k20. */
var ID = 'gb20.faulkner-rose-for-emily';
var CLOCK = ['her father dies', 'Homer Barron comes to town', 'she buys poison at the druggist\'s', 'Homer is never seen again', 'neighbors complain of a smell', 'she lives on alone for decades', 'the town sends her a tax notice', 'her funeral', 'the locked room is opened'];
var TOLD = ['her funeral', 'the tax visit', 'the smell', 'her father\'s death', 'Homer Barron', 'the druggist', 'the long years alone', 'the locked room'];
var TERMS = [['"we"', 'the narrator: the whole town speaking together'], ['Jefferson', 'the town in Faulkner\'s imaginary county'], ['Yoknapatawpha County', 'Faulkner\'s invented Mississippi county'], ['the rose', 'a salute of sympathy, Faulkner said, to a suffering woman'], ['Homer Barron', 'the Northern foreman seen driving with Miss Emily']];
var SAID = [
  ['I have no taxes in Jefferson.', 'Miss Emily', 'Our summary of her answer to the town\'s committee.'],
  ['Our whole town went to her funeral.', 'the town, as "we"', 'The opening.'],
  ['The rose was a salute to a woman who had suffered.', 'Faulkner', 'Our summary of his later explanation of the title.'],
  ['Will you accuse a lady to her face of smelling bad?', 'Judge Stevens, the old mayor', 'Our summary of why the town sprinkled lime instead.']
];
var B = {
  facts: [
    ['"A Rose for Emily" was published in The Forum in 1930.', true, 'In April 1930.'],
    ['The story is told by Miss Emily herself.', false, 'By the town, speaking as "we."'],
    ['The story tells events out of time order.', true, 'It begins with her funeral.'],
    ['Faulkner invented Yoknapatawpha County.', true, 'Its town is Jefferson.'],
    ['The town\'s leaders confront Miss Emily about the smell.', false, 'They sprinkle lime at night instead.'],
    ['Faulkner won the Nobel Prize in Literature for 1949.', true, 'He accepted it in 1950.'],
    ['Miss Emily gladly pays the town\'s new taxes.', false, 'She says she has no taxes in Jefferson.'],
    ['Miss Emily is often read as a symbol of the Old South.', true, 'Proud, decaying and holding on to the past.']
  ],
  items: [
    { q: 'Who is the narrator of the story?', r: 'The townspeople, speaking as "we"', w: ['Miss Emily', 'Homer Barron', 'Faulkner himself'], why: 'A kind of chorus.' },
    { q: 'Why does the story start with Miss Emily\'s funeral?', r: 'So the reader gathers clues without knowing it, until the end', w: ['To show a happy ending first', 'Because it was the shortest part', 'To introduce Homer'], why: 'The scrambled order builds the surprise.' },
    { q: 'What does Miss Emily do when her father dies?', r: 'She refuses for three days to admit he is dead', w: ['She leaves town', 'She sells the house', 'She marries at once'], why: 'She cannot let the past go.' },
    { q: 'Who is Homer Barron?', r: 'A Northern foreman who comes to pave the streets', w: ['Her cousin', 'The mayor', 'The druggist'], why: 'The town gossips about him and Miss Emily.' },
    { q: 'What do the townspeople find after the funeral?', r: 'A dark secret in a room locked for forty years', w: ['A treasure', 'A new will', 'A hidden garden'], why: 'The ending, which the lesson leaves undescribed.' },
    { q: 'What does Miss Emily stand for, many readers think?', r: 'The Old South, unable to let go of the past', w: ['The modern city', 'The railroad age', 'The future'], why: 'Proud and decaying.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CLOCK, 'the events in the order they happened', 'event', R, lv); },
  function (R, lv) { return H.k20.seq(TOLD, 'the order in which the town tells them', 'part', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In "A Rose for Emily," what is <b>' + a + '</b>?'; }, function (b) { return 'What is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
