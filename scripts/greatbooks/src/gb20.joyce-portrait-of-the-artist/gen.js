/* Joyce, A Portrait of the Artist as a Young Man (gbx3). Families: chapters in order, the address list, key terms, Joyce's books by date, who said what, dates. Uses H.k20. */
var ID = 'gb20.joyce-portrait-of-the-artist';
var CH = ['childhood and Clongowes', 'money troubles and Belvedere', 'the retreat and the sermon on hell', 'the call: priest or artist?', 'university and the decision to leave'];
var ADDR = ['Clongowes Wood College', 'Sallins', 'County Kildare', 'Ireland', 'Europe', 'The World', 'The Universe'];
var BOOKS = ['Dubliners (1914)', 'A Portrait of the Artist as a Young Man (1916)', 'Ulysses (1922)', 'Finnegans Wake (1939)'];
var TERMS = [['epiphany', 'a sudden moment when an ordinary thing shows its meaning'], ['Dedalus', 'a name recalling the Greek craftsman who made wings to escape'], ['Clongowes', 'Stephen\'s first boarding school, run by Jesuits'], ['the three nets', 'family, faith and nation, which Stephen wants to fly past'], ['the retreat', 'days of sermons and prayer at Stephen\'s school']];
var SAID = [
  ['There was a moocow coming down along the road.', 'Stephen\'s father', 'The bedtime story that opens the book.'],
  ['I will use silence, exile and cunning.', 'Stephen', 'His plan for life as an artist, in chapter 5.'],
  ['Beauty needs wholeness, harmony and radiance.', 'Stephen, after Aquinas', 'Our summary of his theory of beauty.'],
  ['Think of the pains of hell, and repent while there is time.', 'the preacher at the retreat', 'Our summary of the sermon.']
];
var B = {
  facts: [
    ['James Joyce was born in Dublin.', true, 'In 1882.'],
    ['A Portrait first came out as a book in New York in 1916.', true, 'Published by B. W. Huebsch.'],
    ['The novel is told in the same grown-up style from start to finish.', false, 'The style grows up with Stephen.'],
    ['Stephen decides to become a priest at the end.', false, 'He chooses art.'],
    ['The book ends with pages from Stephen\'s diary.', true, 'As he prepares to leave Ireland.'],
    ['Joyce called moments of sudden insight "epiphanies."', true, 'Many scenes end in one.'],
    ['Joyce lived most of his adult life in Dublin.', false, 'He left in 1904 for Trieste, Zurich and Paris.'],
    ['The name Dedalus recalls a craftsman of Greek myth.', true, 'Daedalus, who made wings.']
  ],
  items: [
    { q: 'How does the novel begin?', r: 'With a bedtime story told in baby talk', w: ['With a storm at sea', 'With a funeral', 'With a letter'], why: 'The moocow and baby tuckoo.' },
    { q: 'What does Stephen do after he is punished unfairly at Clongowes?', r: 'He complains to the rector', w: ['He runs away', 'He tells his father', 'He hides in the chapel'], why: 'The other boys cheer him.' },
    { q: 'What does Stephen feel called to be after the scene on the beach?', r: 'An artist', w: ['A priest', 'A soldier', 'A doctor'], why: 'His joy at the sight of the sea and a girl wading.' },
    { q: 'What are the three "nets" Stephen wants to fly past?', r: 'Family, faith and nation', w: ['School, work and sport', 'Money, fame and power', 'Land, sea and sky'], why: 'Our summary of chapter 5.' },
    { q: 'Whose ideas does Stephen use for his theory of beauty?', r: 'Thomas Aquinas', w: ['Karl Marx', 'Charles Darwin', 'Adam Smith'], why: 'Wholeness, harmony and radiance.' },
    { q: 'Where does Stephen plan to go at the end?', r: 'Away from Ireland, to the continent', w: ['To America to farm', 'Back to Clongowes', 'To a monastery'], why: 'Joyce himself left in 1904.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CH, 'the five chapters', 'chapter', R, lv); },
  function (R, lv) { return H.k20.seq(ADDR, 'Stephen\'s address in his geography book', 'line', R, lv); },
  function (R, lv) { return H.k20.seq(BOOKS, 'Joyce\'s books by date', 'book', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In the Portrait, what is <b>' + a + '</b>?'; }, function (b) { return 'What is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
