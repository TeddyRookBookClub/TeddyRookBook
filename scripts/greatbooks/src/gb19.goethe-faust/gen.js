/* Goethe, Faust (gbw4). Families: the scenes in order (Parts One and Two), who is who, who says what (lines and our summaries),
   the wager, dates. Uses H.k19. */
var ID = 'gb19.goethe-faust';
var P1 = ['Prologue in Heaven', 'Night (Faust\'s despair)', 'The pact with Mephistopheles', 'Auerbach\'s Cellar', 'The Witch\'s Kitchen', 'Gretchen\'s story', 'The prison'];
var P2 = ['Faust\'s healing sleep', 'The emperor\'s court', 'The quest for Helen', 'Land won from the sea', 'Faust\'s rescue by the angels'];
var WHOIS = [['Faust', 'a scholar who has studied everything and is still unsatisfied'], ['Mephistopheles', 'the devil, "the Spirit that Denies"'], ['Gretchen (Margaret)', 'a young townswoman whose love for Faust ends in tragedy'], ['Wagner', 'Faust\'s dry, bookish assistant'], ['Helen', 'the ideal of Greek beauty, whom Faust seeks in Part Two'], ['the Lord', 'who allows the wager in the Prologue in Heaven']];
var WHO = [
  ['I\'ve studied now Philosophy and Jurisprudence, Medicine, and even, alas! Theology.', 'Faust', 'The opening of the first scene, in Bayard Taylor\'s words.'],
  ['I am the Spirit that Denies!', 'Mephistopheles', 'Part One, the Study.'],
  ['A good man, through obscurest aspiration, has still an instinct of the one true way.', 'the Lord', 'The Prologue in Heaven.'],
  ['Whoe\'er aspires unweariedly is not beyond redeeming.', 'the angels', 'Near the end of Part Two.'],
  ['Ah, still delay, thou art so fair!', 'Faust', 'The words of the wager.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Goethe worked on Faust for about sixty years.', true, 'From the 1770s until just before his death in 1832.'],
    ['Part One was published in 1808 and Part Two in 1832, after Goethe\'s death.', true, 'Part Two appeared a few months after he died.'],
    ['Faust\'s story began as an old German legend and puppet play.', true, 'Christopher Marlowe had written a Doctor Faustus in the 1590s.'],
    ['In Goethe\'s play, Faust is dragged off to Hell at the end.', false, 'Angels carry his immortal part to Heaven; Goethe changed the old ending.'],
    ['Faust\'s wager is that he will never find a moment he wishes to last.', true, '"Ah, still delay, thou art so fair!"'],
    ['Bayard Taylor\'s English translation keeps Goethe\'s rhymes and meters.', true, 'Published 1870 and 1871.'],
    ['Faust is a novel.', false, 'It is a play in verse, in two parts, though Part Two is rarely staged complete.'],
    ['The Prologue in Heaven is modeled on the opening of the Book of Job.', true, 'The Lord allows a test of a good man.']
  ],
  items: [
    { q: 'Why does Faust despair at the start of the play?', r: 'He has studied everything and feels he knows nothing that matters', w: ['He has lost his money', 'He is in prison', 'He has never been to school'], why: 'The opening monologue.' },
    { q: 'What are the terms of Faust\'s wager with Mephistopheles?', r: 'If Faust ever asks a moment to stay, he will be lost', w: ['Faust must find a hidden treasure', 'Faust must defeat an army', 'Faust must write a book in a week'], why: 'Scene IV in Taylor\'s numbering.' },
    { q: 'How does Mephistopheles describe himself?', r: 'Part of that Power which always wills the Bad and always works the Good', w: ['A friend of all humanity', 'A simple traveler', 'A king of Greece'], why: 'In Taylor\'s translation.' },
    { q: 'What finally satisfies Faust, near the end of Part Two?', r: 'The vision of free people living and working on land he has won from the sea', w: ['A great feast', 'Being crowned emperor', 'Winning a duel'], why: 'Useful work for others, not pleasure.' },
    { q: 'Why is Faust saved at the end?', r: 'Because he never stopped striving, and by grace and love from above', w: ['Because he tricks the devil with a riddle', 'Because he was never really tempted', 'Because Mephistopheles forgets'], why: '"Whoe\'er aspires unweariedly is not beyond redeeming."' },
    { q: 'Who translated Faust into English in 1870 to 1871, keeping its meters?', r: 'Bayard Taylor', w: ['Henry Wadsworth Longfellow', 'Samuel Moore', 'Constance Garnett'], why: 'An American poet and travel writer.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(P1, 'Part One of Faust', 'scene', R, lv); },
  function (R, lv) { return H.k19.seq(P2, 'Part Two of Faust', 'episode', R, lv); },
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Faust?'; }, function (b) { return 'Which character in Faust is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
