/* T. S. Eliot, The Waste Land (gbx3). Families: the five sections in order, sources, the thunder's words, who said what, dates. Uses H.k20. */
var ID = 'gb20.eliot-waste-land';
var SEC = ['The Burial of the Dead', 'A Game of Chess', 'The Fire Sermon', 'Death by Water', 'What the Thunder Said'];
var SRC = [['the Fisher King and his barren land', 'the Grail legend'], ['crowds of the dead on London Bridge', 'Dante\'s Inferno'], ['a drowned father with pearls for eyes', 'Shakespeare\'s Tempest'], ['the senses burning with desire', 'the Buddha\'s Fire Sermon'], ['"To Carthage then I came"', 'Augustine\'s Confessions'], ['the thunder\'s three words', 'the Upanishads'], ['gods who die and rise with the seasons', 'Frazer\'s Golden Bough']];
var DA = [['Datta', 'give'], ['Dayadhvam', 'sympathize'], ['Damyata', 'control']];
var SAID = [
  ['April is the cruellest month.', 'the poem\'s opening voice', 'Line 1.'],
  ['These fragments I have shored against my ruins.', 'the poem\'s speaker, near the end', 'Line 430.'],
  ['Cut it, cut it: the poem is stronger shorter.', 'Ezra Pound', 'Our summary of his editing of the draft.'],
  ['Give, sympathize, control.', 'the thunder', 'Eliot\'s note translating the Sanskrit.']
];
var B = {
  facts: [
    ['T. S. Eliot was born in St. Louis, Missouri.', true, 'In 1888.'],
    ['The Waste Land was published in 1922.', true, 'In magazines and then as a book with notes.'],
    ['The poem has five sections.', true, 'From The Burial of the Dead to What the Thunder Said.'],
    ['The poem is told by one speaker in a single, clear story.', false, 'It shifts among many voices and fragments.'],
    ['Ezra Pound cut the draft nearly in half.', true, 'Eliot dedicated the poem to him.'],
    ['Eliot won the Nobel Prize in Literature in 1948.', true, 'Twenty-six years after The Waste Land.'],
    ['The poem ends with a long happy wedding scene.', false, 'It ends with thunder over a dry land, and a blessing.'],
    ['Eliot wrote notes to the poem naming some of his sources.', true, 'Including Weston and Frazer.']
  ],
  items: [
    { q: 'Why is April "cruel" in the poem\'s opening?', r: 'New life stirs up painful memories and longings', w: ['It is very cold', 'It is tax month', 'Flowers are poisonous'], why: 'Memory and desire.' },
    { q: 'How is the poem built?', r: 'From fragments, voices and quotations, like a collage', w: ['As a single long story', 'As a list of rules', 'As letters between friends'], why: 'A broken world in broken pieces.' },
    { q: 'What legend gives the poem its idea of a barren land waiting to be healed?', r: 'The Fisher King of the Grail stories', w: ['Robin Hood', 'Romulus and Remus', 'King Midas'], why: 'From Jessie Weston\'s book.' },
    { q: 'What event lies behind the poem\'s sense of a broken world?', r: 'The First World War', w: ['The French Revolution', 'The discovery of America', 'The fall of Troy'], why: 'It ended in 1918.' },
    { q: 'Where do the thunder\'s three words come from?', r: 'An ancient Hindu text, the Upanishads', w: ['The Iliad', 'A London newspaper', 'A Shakespeare sonnet'], why: 'The Brihadaranyaka Upanishad.' },
    { q: 'Which city\'s streets and river appear most in the poem?', r: 'London', w: ['Paris', 'New York', 'Rome'], why: 'London Bridge and the Thames.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(SEC, 'the five sections of The Waste Land', 'section', R, lv); },
  function (R, lv) { return H.k20.pairs(SRC, function (a) { return 'Where does Eliot get <b>' + a + '</b>?'; }, function (b) { return 'What does the poem borrow from <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(DA, function (a) { return 'In Eliot\'s note, what does the thunder\'s word <b>' + a + '</b> mean?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
