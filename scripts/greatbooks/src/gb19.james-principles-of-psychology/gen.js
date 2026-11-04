/* William James, The Principles of Psychology (gbw4). Families: the James-Lange order of an emotion, his main ideas,
   the stream of consciousness, habit maxims, how later research judged them, who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.james-principles-of-psychology';
var JL = ['you see the bear', 'your body reacts (heart pounds, you run)', 'you feel afraid'];
var IDEAS = [['the stream of consciousness', 'thought flows continuously, like a river, rather than in separate links'], ['habit', 'repeated actions wear paths in the nervous system and become automatic'], ['attention', 'the mind taking possession of one of several possible objects of thought'], ['the James-Lange theory of emotion', 'an emotion is our feeling of the body\'s changes'], ['the empirical self', 'everything a person can call "mine": body, family, possessions, reputation, inner life']];
var JUDGE = [['habit becoming automatic with practice', 'well supported by later research on skills and the brain'], ['attention being limited and selective', 'well supported; a central topic of psychology since'], ['emotion following the body\'s changes', 'partly supported: the body shapes emotion, but how we interpret a situation matters too'], ['psychology as a natural science of the mind', 'the founding idea of the modern field']];
var WHO = [
  ['Habit is the enormous fly-wheel of society.', 'William James', 'Chapter IV.'],
  ['Every one knows what attention is.', 'William James', 'Chapter XI.'],
  ['Consciousness is nothing jointed; it flows.', 'William James', 'Chapter IX.'],
  ['The emotions follow from bodily changes, not the other way around.', 'Carl Lange', 'The Danish physician who reached the idea at about the same time; hence the James-Lange theory.'],
  ['Bodily changes are too slow and too alike to explain different emotions.', 'Walter Cannon', 'His 1927 critique of the James-Lange theory.'],
  ['Psychology can be a laboratory science.', 'Wilhelm Wundt', 'He founded the first formal psychology laboratory, in Leipzig, in 1879.']
];
var MAX = ['Launch a new habit with as strong a start as you can', 'Never suffer an exception until the new habit is rooted', 'Act on every resolution at the first chance you get', 'Keep the faculty of effort alive by a little daily exercise'];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['The Principles of Psychology was published in 1890, in two volumes.', true, 'Henry Holt, New York; it took James twelve years.'],
    ['William James was the brother of the novelist Henry James.', true, 'Their father was a religious writer, Henry James Sr.'],
    ['James coined the phrase "stream of consciousness."', true, 'Chapter IX; novelists later borrowed it.'],
    ['James thought habits can never be changed.', false, 'He thought they are easiest to form when young, and gave rules for forming new ones.'],
    ['James taught at Harvard, first anatomy and physiology, then psychology and philosophy.', true, 'He set up a teaching laboratory there in the 1870s.'],
    ['James believed emotions come first and the body follows.', false, 'He argued the reverse: the body reacts, and we feel that reaction.'],
    ['James also became a founder of the philosophy called pragmatism.', true, 'With C. S. Peirce and later John Dewey.'],
    ['Later research has rejected every idea in the Principles.', false, 'Many of his ideas on habit, attention and the self remain influential.']
  ],
  items: [
    { q: 'Why did James call habit "the enormous fly-wheel of society"?', r: 'It keeps people steady in their ways and work, for good or ill', w: ['It makes machines run', 'It speeds up time', 'It is a kind of bicycle'], why: 'Chapter IV.' },
    { q: 'What metaphor did James choose for consciousness?', r: 'A river or stream', w: ['A chain', 'A train', 'A brick wall'], why: '"Such words as chain or train do not describe it fitly."' },
    { q: 'What did James say is the great thing in all education?', r: 'To make our nervous system our ally instead of our enemy', w: ['To memorize every date', 'To avoid all habits', 'To study only science'], why: 'Chapter IV, on habit.' },
    { q: 'What is the most famous challenge to the James-Lange theory?', r: 'Walter Cannon\'s argument that bodily changes are too slow and too alike', w: ['That emotions do not exist', 'That James never wrote it', 'That animals have no bodies'], why: 'Later "two-factor" theories combined body and interpretation.' },
    { q: 'Which kind of writing borrowed James\'s "stream of consciousness"?', r: 'Novels that follow a character\'s flowing thoughts', w: ['Cookbooks', 'Road maps', 'Tax forms'], why: 'Writers such as Virginia Woolf and James Joyce.' },
    { q: 'What did James mean by attention?', r: 'The mind taking hold of one of several possible things to think about', w: ['Standing up straight', 'Remembering everything', 'Sleeping well'], why: 'Chapter XI.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(JL, 'an emotion, in James\'s order', 'step', R, lv); },
  function (R, lv) { return H.k19.pairs(IDEAS, function (a) { return 'In James\'s Principles, what is <b>' + a + '</b>?'; }, function (b) { return 'Which of James\'s ideas is this: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(JUDGE, function (a) { return 'James\'s idea of <b>' + a + '</b>: how has later research judged it?'; }, null, R, lv); },
  function (R, lv) { return H.mc('Which of these is one of James\'s own rules for forming a new habit (our wording)?', R.pick(MAX), ['Allow yourself exceptions whenever you feel tired', 'Wait until you feel like it before you start', 'Make the resolution, but act on it later'].slice(0, lv === 1 ? 2 : 3), ['James\'s maxims, Chapter IV (our wording): ' + MAX.join('; ') + '.']); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
