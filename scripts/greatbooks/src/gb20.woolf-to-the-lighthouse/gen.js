/* Woolf, To the Lighthouse (gbx3). Families: the three parts, events in order, who's who, a pages-and-time calculation, who said what, dates. Uses H.k20. */
var ID = 'gb20.woolf-to-the-lighthouse';
var PARTS = ['The Window', 'Time Passes', 'The Lighthouse'];
var STORY = ['James hopes to sail to the lighthouse', 'his father says the weather won\'t be fine', 'Mrs. Ramsay\'s dinner party', 'the house stands empty for ten years', 'Mr. Ramsay, James and Cam sail to the lighthouse', 'Lily Briscoe finishes her painting'];
var WHO = [['Mrs. Ramsay', 'the mother who holds everyone together'], ['Mr. Ramsay', 'the philosopher father who needs praise'], ['James', 'the youngest son, who longs to go to the lighthouse'], ['Lily Briscoe', 'the painter who finishes her picture ten years later'], ['Mrs. McNab', 'the old cleaner who saves the empty house'], ['Cam', 'James\'s sister, who sails with him at the end']];
var SAID = [
  ['Yes, of course, if it\'s fine tomorrow.', 'Mrs. Ramsay', 'The first line.'],
  ['But it won\'t be fine.', 'Mr. Ramsay', 'Part I.'],
  ['Women can\'t paint, women can\'t write.', 'Charles Tansley', 'Our summary of the remark that haunts Lily.'],
  ['Consciousness flows like a stream.', 'William James', 'Our summary; Woolf\'s method is often called stream of consciousness.']
];
var B = {
  facts: [
    ['To the Lighthouse was published in 1927.', true, 'By Woolf\'s own Hogarth Press in London.'],
    ['The novel has three parts.', true, 'The Window, Time Passes, The Lighthouse.'],
    ['The middle part, Time Passes, covers about ten years.', true, 'In only a few pages.'],
    ['James sails to the lighthouse the day after the dinner party.', false, 'Ten years later.'],
    ['The novel is told by a single first-person narrator.', false, 'It moves among many minds.'],
    ['The Ramsays are partly based on Woolf\'s own parents.', true, 'Leslie and Julia Stephen.'],
    ['The novel is set on the Isle of Skye in Scotland.', true, 'Though Woolf\'s own summers were in Cornwall.'],
    ['Lily Briscoe gives up painting forever.', false, 'She finishes her picture at the end.']
  ],
  items: [
    { q: 'Why can\'t James go to the lighthouse in Part I?', r: 'The weather is bad, as his father predicted', w: ['He is sick', 'The boat is broken', 'His mother forbids it'], why: 'The trip waits ten years.' },
    { q: 'What happens in Time Passes?', r: 'The house stands empty for ten years, and three of the family die', w: ['A long dinner party', 'A sea battle', 'A wedding'], why: 'Told in brief bracketed sentences.' },
    { q: 'What is Woolf\'s method often called?', r: 'Stream of consciousness', w: ['The iceberg', 'Epic simile', 'Socratic dialogue'], why: 'Following minds from within.' },
    { q: 'What does Lily Briscoe do at the very end?', r: 'She finishes her painting', w: ['She leaves for London', 'She marries', 'She sails to the lighthouse'], why: 'With one final line at its center.' },
    { q: 'What does James finally receive from his father on the boat?', r: 'Praise', w: ['A gift', 'A punishment', 'A map'], why: 'Mr. Ramsay praises his steering.' },
    { q: 'Which philosopher, in this era, contrasted clock time and lived time?', r: 'Henri Bergson', w: ['Adam Smith', 'Thomas Aquinas', 'John Locke'], why: 'Woolf\'s three parts show the same contrast.' }
  ]
};
function famPages(R, lv) {
  var total = R.pick([200, 240, 250, 300]), share = R.pick([[60, 'The Window'], [10, 'Time Passes'], [30, 'The Lighthouse']]);
  var pages = total * share[0] / 100;
  return H.num('In an edition of ' + total + ' pages, suppose <i>' + share[1] + '</i> takes about ' + share[0] + '% of the book. About how many pages is that?', pages,
    [share[0] + '% of ' + total + ' = ' + (share[0] / 100) + ' × ' + total + ' = ' + pages + ' pages.'], { hint: 'Multiply the total by the percent, written as a decimal.' });
}
function famRate(R, lv) {
  var pg = R.pick([20, 24, 25, 30]), years = 10, per = pg / years;
  return H.num('If <i>Time Passes</i> covers ' + years + ' years in ' + pg + ' pages, how many pages does each year get, on average?', per,
    [pg + ' ÷ ' + years + ' = ' + per + ' pages per year. Part I gives one evening far more pages than that.'], { form: 'dec', hint: 'Divide pages by years.' });
}
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(PARTS, 'the three parts of the novel', 'part', R, lv); },
  function (R, lv) { return H.k20.seq(STORY, 'To the Lighthouse', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In To the Lighthouse, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); },
  famPages, famRate
].concat(H.k20.dates(ID)), 0.6);
