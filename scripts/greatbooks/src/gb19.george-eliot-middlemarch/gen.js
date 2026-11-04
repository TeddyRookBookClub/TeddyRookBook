/* George Eliot, Middlemarch (gbw4). Families: who is who, the four stories, the eight books in order, who said what, dates. Uses H.k19. */
var ID = 'gb19.george-eliot-middlemarch';
var BOOKS = ['Miss Brooke', 'Old and Young', 'Waiting for Death', 'Three Love Problems', 'The Dead Hand', 'The Widow and the Wife', 'Two Temptations', 'Sunset and Sunrise'];
var WHOIS = [['Dorothea Brooke', 'an earnest young woman who longs to do great good'], ['Mr. Casaubon', 'an elderly scholar writing a "Key to all Mythologies"'], ['Will Ladislaw', 'Casaubon\'s lively young cousin, whom Dorothea later marries'], ['Tertius Lydgate', 'an ambitious young doctor who wants to reform medicine'], ['Rosamond Vincy', 'the mayor\'s beautiful, self-centered daughter'], ['Fred Vincy', 'an idle young man who learns honest work'], ['Mary Garth', 'a plain-spoken, sensible young woman'], ['Mr. Bulstrode', 'a pious banker with a hidden past'], ['Caleb Garth', 'Mary\'s father, an honest land agent who loves good work']];
var LINES = [['Dorothea and Casaubon', 'a marriage of high hopes that turns cold'], ['Lydgate and Rosamond', 'a marriage dragged down by debt and selfishness'], ['Fred and Mary', 'a love that waits until Fred earns it by work'], ['Bulstrode', 'a respectable life undone by a hidden past']];
var WHO = [
  ['The growing good of the world is partly dependent on unhistoric acts.', 'the narrator', 'The Finale.'],
  ['I will not marry a man who has no useful calling.', 'Mary Garth', 'Our summary of her stand with Fred.'],
  ['My Key to all Mythologies is nearly ready, after so many years.', 'Mr. Casaubon', 'Our summary; it is never finished.'],
  ['I mean to do good work in medicine, and reform this town\'s practice.', 'Lydgate', 'Our summary of his early hopes.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['George Eliot was the pen name of Mary Ann Evans.', true, 'She used a man\'s name so her work would be taken seriously.'],
    ['Middlemarch came out in eight parts in 1871 and 1872.', true, 'Each part a "book."'],
    ['The novel is set around 1829 to 1832, in an English Midlands town.', true, 'The years before the Reform Act of 1832.'],
    ['Middlemarch is about one family only.', false, 'Its subtitle is "A Study of Provincial Life": a whole town.'],
    ['Casaubon finishes his Key to all Mythologies.', false, 'He dies with it unfinished.'],
    ['Dorothea gives up Casaubon\'s fortune to marry Will Ladislaw.', true, 'His will forbade the match.'],
    ['George Eliot translated German works of theology and philosophy before writing novels.', true, 'Including Feuerbach and Strauss.'],
    ['The narrator often pauses to reflect on the characters with sympathy.', true, 'One of the book\'s great features.']
  ],
  items: [
    { q: 'What does Dorothea hope for when she marries Casaubon?', r: 'To help a great scholar with important work', w: ['To become rich', 'To travel to America', 'To become famous'], why: 'She soon finds the work hollow and the man cold.' },
    { q: 'Why does Lydgate\'s career fail?', r: 'Debt, an unhappy marriage, and the scandal of Bulstrode', w: ['He was a bad doctor', 'He never tried', 'He moved away at once'], why: 'Small pressures add up.' },
    { q: 'What does the Finale say about people who live "a hidden life"?', r: 'Much of the world\'s good depends on them', w: ['They do not matter', 'They should become famous', 'They are unhappy'], why: '"... unhistoric acts."' },
    { q: 'What is the subtitle of Middlemarch?', r: 'A Study of Provincial Life', w: ['A Tale of Two Cities', 'A Novel Without a Hero', 'The Story of a Soul'], why: 'Provincial: outside London.' },
    { q: 'What makes George Eliot\'s narrator unusual?', r: 'She pauses to help readers understand even unlikable characters', w: ['She never appears', 'She is a dog', 'She speaks only in verse'], why: 'Eliot believed fiction should widen our sympathy.' },
    { q: 'How does Fred Vincy win Mary Garth?', r: 'By giving up idleness and learning honest work with her father', w: ['By winning a horse race', 'By becoming a clergyman against his wishes', 'By inheriting money'], why: 'Mary refuses him until he changes.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(BOOKS, 'the eight books of Middlemarch', 'book', R, lv); },
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Middlemarch?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(LINES, function (a) { return 'Which story in Middlemarch belongs to <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
