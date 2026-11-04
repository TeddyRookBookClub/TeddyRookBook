/* Barth, The Word of God and the Word of Man (gbx1). Families: events in order, the addresses, terms, his view against
   liberal theology, who said what (our summaries), dates. Uses H.k20. Presents Barth's views as his own. */
var ID = 'gb20.barth-word-of-god';
var LIFE = ['Barth becomes pastor at Safenwil (1911)', 'German professors sign a manifesto backing the war (1914)', 'The address "The Strange New World within the Bible" (1916)', 'The commentary on Romans (1919)', 'The German edition of the addresses (1924)', 'Horton\'s English translation (1928)', 'The Barmen Declaration (1934)'];
var VIEW = [['the Bible is mainly a record of human religious experience', 'the liberal theology Barth was taught'], ['the Bible is about God seeking people', 'Barth'], ['theology should start from culture and history', 'the liberal theology Barth was taught'], ['God is "wholly other," not a higher human ideal', 'Barth'], ['the preacher must and yet cannot speak of God', 'Barth'], ['religion grows out of human feeling', 'the liberal theology Barth was taught']];
var TERMS = [['dialectical theology', 'thinking that holds a "yes" and a "no" together, as Barth did'], ['the Word of God', 'for Barth, God\'s own speaking, which the Bible witnesses to'], ['liberal theology', 'the 19th-century school that grounded faith in history, experience and culture'], ['the Barmen Declaration', 'the 1934 statement rejecting the Nazi state\'s control of the church'], ['Church Dogmatics', 'Barth\'s huge, unfinished life\'s work']];
var WHO = [
  ['Within the Bible we find not right human thoughts about God, but right divine thoughts about people.', 'Karl Barth', 'The Strange New World within the Bible (our close paraphrase).'],
  ['Faith must not be cut off from reason, history and culture.', 'Adolf von Harnack', 'Barth\'s former teacher, who debated him in 1923.'],
  ['People can know something of God through nature and conscience.', 'Emil Brunner', 'His 1934 debate with Barth on "natural theology."'],
  ['Religion is at root a feeling of absolute dependence.', 'Friedrich Schleiermacher', 'The founder of the liberal tradition Barth answered.'],
  ['Faith is a leap that reason cannot make for us.', 'Søren Kierkegaard', 'An influence on Barth\'s early work.']
];
var B = {
  facts: [
    ['Karl Barth was Swiss.', true, 'Born in Basel in 1886.'],
    ['Barth was a village pastor when he gave the earliest of these addresses.', true, 'At Safenwil, 1911–21.'],
    ['Barth agreed with his teachers who backed the war in 1914.', false, 'Their stand shook his trust in their theology.'],
    ['The English translation by Douglas Horton appeared in 1928.', true, 'The German collection came out in 1924.'],
    ['Barth was the main author of the Barmen Declaration of 1934.', true, 'It rejected the Nazi state\'s claim to control the church.'],
    ['Barth finished his Church Dogmatics long before he died.', false, 'He was still writing it at his death; it is unfinished.'],
    ['Barth said that ministers can speak of God easily.', false, 'He said they ought to and yet, being human, cannot.']
  ],
  items: [
    { q: 'What did Barth say the Bible is mainly about?', r: 'God\'s thoughts about people and his way to them', w: ['Human ideas about God', 'Ancient science', 'The history of Switzerland'], why: 'The Strange New World within the Bible.' },
    { q: 'Which book of the Bible did Barth\'s famous commentary of 1919 discuss?', r: 'Paul\'s Letter to the Romans', w: ['Genesis', 'The Psalms', 'Revelation'], why: 'Rewritten in 1922.' },
    { q: 'What were Barth\'s three sentences about the preacher\'s task?', r: 'We ought to speak of God; we cannot; we should recognize both and give God the glory', w: ['Preach often, preach long, preach loud', 'Read, write, rest', 'Speak only of history'], why: 'The Word of God and the Task of the Ministry, 1922.' },
    { q: 'Who argued against Barth that people can know something of God through nature?', r: 'Emil Brunner', w: ['Karl Marx', 'Isaac Newton', 'Dante'], why: 'Their famous 1934 exchange.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(LIFE, 'Barth\'s life and work', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(VIEW, function (a) { return 'Whose view is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
