/* Austen, Emma (gbw4). Families: who is who, Emma's guesses versus what happens, events in order, who said what, dates. Uses H.k19. */
var ID = 'gb19.austen-emma';
var WHOIS = [['Emma Woodhouse', 'the clever, rich young matchmaker of Highbury'], ['Mr. Knightley', 'Emma\'s neighbor and old friend, who tells her her faults'], ['Harriet Smith', 'the sweet, simple friend Emma tries to marry off'], ['Mr. Elton', 'the vicar, who courts Emma rather than Harriet'], ['Frank Churchill', 'the charming son of Mr. Weston, secretly engaged'], ['Jane Fairfax', 'the reserved, gifted niece of Miss Bates'], ['Miss Bates', 'a kind, poor, very talkative older woman'], ['Mr. Woodhouse', 'Emma\'s anxious father, who worries about everyone\'s health'], ['Mrs. Weston', 'Emma\'s former governess, Miss Taylor']];
var GUESS = [['Mr. Elton loves Harriet.', 'He was courting Emma all along.'], ['Harriet should refuse Robert Martin.', 'Harriet marries him in the end, happily.'], ['Frank Churchill is in love with Emma.', 'He is secretly engaged to Jane Fairfax.'], ['Emma will never marry.', 'She marries Mr. Knightley.'], ['Harriet loves Frank Churchill.', 'Harriet meant Mr. Knightley, which shocks Emma into knowing her own heart.']];
var ORDER = ['Miss Taylor marries Mr. Weston', 'Emma befriends Harriet Smith', 'Mr. Elton proposes to Emma', 'Frank Churchill arrives in Highbury', 'Emma is rude to Miss Bates at Box Hill', 'Frank\'s secret engagement is revealed', 'Emma and Mr. Knightley are engaged'];
var WHO = [
  ['It was badly done, indeed!', 'Mr. Knightley', 'Rebuking Emma after Box Hill.'],
  ['I have none of the usual inducements of women to marry.', 'Emma', 'Volume I, to Harriet.'],
  ['A basin of thin gruel is the healthiest supper for everyone.', 'Mr. Woodhouse', 'Our summary of his worries.'],
  ['Talking on and on, about everything and everyone, kindly.', 'Miss Bates', 'Our summary.'],
  ['I am going to take a heroine whom no one but myself will much like.', 'Jane Austen', 'As a family member remembered her saying.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Emma was published in December 1815 (dated 1816).', true, 'In three volumes.'],
    ['Emma is set in a village called Highbury.', true, 'A fictional village in Surrey.'],
    ['Austen dedicated Emma to the Prince Regent, at his request.', true, 'He admired her novels.'],
    ['Emma plans from the start to marry Mr. Knightley.', false, 'She realizes she loves him only near the end.'],
    ['Austen published her novels under her own name.', false, 'Anonymously, "By the Author of Pride and Prejudice."'],
    ['The novel is told almost entirely from Emma\'s point of view.', true, 'So readers share many of her mistakes.'],
    ['Miss Bates is rich and proud.', false, 'She is poor, kind and talkative; Emma\'s joke about her is cruel.'],
    ['Emma is about twenty years old when the novel begins.', true, '"Nearly twenty-one."']
  ],
  items: [
    { q: 'Why does Mr. Knightley scold Emma after the picnic at Box Hill?', r: 'She mocked poor, kind Miss Bates in front of others', w: ['She was late', 'She refused to dance', 'She broke a promise to Harriet'], why: '"It was badly done, indeed!"' },
    { q: 'What is Emma\'s great fault, as the novel shows it?', r: 'Thinking she understands other people\'s hearts when she does not', w: ['Laziness', 'Greed for money', 'Cowardice'], why: 'Her matchmaking keeps going wrong.' },
    { q: 'What secret explains Frank Churchill\'s behavior?', r: 'He is secretly engaged to Jane Fairfax', w: ['He is in debt', 'He is a spy', 'He is already married to Harriet'], why: 'Revealed in Volume III.' },
    { q: 'What does Emma learn by the end?', r: 'To see others, and herself, more truly, and to be kinder', w: ['That she should never speak again', 'That money is everything', 'Nothing at all'], why: 'A novel about growing in self-knowledge.' },
    { q: 'How does Austen let readers share Emma\'s mistakes?', r: 'By telling the story mostly through Emma\'s point of view', w: ['By writing in letters only', 'By using a narrator who is a dog', 'By giving away every secret in chapter 1'], why: 'Free indirect style.' },
    { q: 'Whom does Harriet finally marry?', r: 'Robert Martin, the farmer', w: ['Mr. Elton', 'Frank Churchill', 'Mr. Knightley'], why: 'The man Emma once told her to refuse.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Emma?'; }, function (b) { return 'Which character in Emma is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(GUESS, function (a) { return 'Emma believes: <b>' + a + '</b> What is the truth?'; }, null, R, lv); },
  function (R, lv) { return H.k19.seq(ORDER, 'the events of Emma', 'event', R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
