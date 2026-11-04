/* Hegel, The Philosophy of History (gbw4). Families: the four worlds in order, one / some / all free, who said what (our summaries),
   key terms, dates. Uses H.k19 (defined in gb19.hegel-philosophy-of-right/gen.js). */
var ID = 'gb19.hegel-philosophy-of-history';
var WORLDS = ['the Oriental world', 'the Greek world', 'the Roman world', 'the Germanic world'];
var FREE = [['the Oriental world', 'only one (the ruler) is free'], ['the Greek and Roman world', 'some are free'], ['the Germanic, Christian world', 'all are free, as human beings']];
var TERMS = [['Spirit (Geist)', 'mind or reason at work in human history and culture'], ['world-historical individual', 'a great figure, like Caesar or Napoleon, whose passions carry history forward'], ['cunning of reason', 'reason using people\'s selfish passions to reach ends they never intended'], ['philosophical history', 'history read for the reason running through it'], ['original history', 'history written by those who lived through it, like Herodotus and Thucydides']];
var WHO = [
  ['Nothing great in the world has been done without passion.', 'Hegel', 'Introduction to the lectures.'],
  ['The history of the world is the progress of the consciousness of freedom.', 'Hegel', 'Introduction.'],
  ['History is the story of class struggles, not of Spirit.', 'Marx', 'Marx kept Hegel\'s pattern of stages but put economics in place of Spirit.'],
  ['Kings are history\'s slaves; the great man only seems to lead.', 'Tolstoy', 'War and Peace, later on this ladder, answers Hegel\'s great men.'],
  ['Peoples and governments have never learned anything from history.', 'Hegel', 'Introduction, on "pragmatic" history.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['The Philosophy of History began as lectures Hegel gave in Berlin.', true, 'Five times between 1822 and 1831; students\' notes were published in 1837.'],
    ['Hegel wrote the whole book himself and published it in his lifetime.', false, 'It was put together after his death from his notes and his students\'.'],
    ['Hegel thought world history is the progress of the consciousness of freedom.', true, 'Introduction.'],
    ['For Hegel, Napoleon was a "world-historical individual."', true, 'He once saw Napoleon ride through Jena, in 1806, and called him "the world-soul on horseback" in a letter.'],
    ['Modern historians accept Hegel\'s picture of Asia as unchanging.', false, 'It is widely rejected as uninformed.'],
    ['J. Sibree\'s English translation was published in 1857.', true, 'In Bohn\'s Philosophical Library.'],
    ['Hegel said that history teaches us exactly how to act today.', false, 'He said peoples and governments have never learned from history.'],
    ['The "cunning of reason" means reason works through people\'s passions toward ends they did not intend.', true, 'Caesar sought power for himself; Hegel thinks he served history\'s larger purpose.']
  ],
  items: [
    { q: 'How many are free in Hegel\'s "Oriental world"?', r: 'One, the ruler', w: ['All', 'Some', 'None, not even the ruler'], why: 'One, some, all: Hegel\'s three steps.' },
    { q: 'Which three kinds of history-writing does Hegel describe?', r: 'Original, reflective and philosophical', w: ['Ancient, medieval and modern', 'Comic, tragic and epic', 'Local, national and world'], why: 'Introduction to the lectures.' },
    { q: 'Where did Hegel think history was heading?', r: 'Toward freedom for all, understood and built into institutions', w: ['Back to a golden age', 'Toward the end of the world', 'Nowhere: it goes in circles'], why: 'A story with a direction: progress in freedom.' },
    { q: 'What is the main criticism of Hegel\'s world history today?', r: 'That it is Europe-centered and reads the past to fit a pattern', w: ['That it has too many dates', 'That it is too short', 'That it ignores Napoleon'], why: 'Critics, and later historians, reject much of his picture of non-European peoples.' },
    { q: 'Who turned Hegel\'s pattern of historical stages toward economics?', r: 'Karl Marx', w: ['Adam Smith', 'Plato', 'Jane Austen'], why: 'Marx said he turned Hegel "right side up."' },
    { q: 'What does Hegel mean by Spirit (Geist)?', r: 'Mind or reason at work in human history and culture', w: ['A ghost', 'A kind of drink', 'The weather'], why: 'The German word means both "mind" and "spirit."' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(WORLDS, 'Hegel\'s stages of world history', 'stage', R, lv); },
  function (R, lv) { return H.k19.pairs(FREE, function (a) { return 'In Hegel\'s scheme, who is free in <b>' + a + '</b>?'; }, function (b) { return 'In Hegel\'s scheme, where is it known that <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'What does Hegel mean by <b>' + a + '</b>?'; }, function (b) { return 'Which of Hegel\'s terms means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
