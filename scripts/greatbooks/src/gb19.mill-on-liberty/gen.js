/* Mill, On Liberty (gbw4). Families: the harm principle applied to Mill's own cases, the three reasons for free speech,
   who said what (our summaries), chapters in order, terms, dates. Uses H.k19. */
var ID = 'gb19.mill-on-liberty';
var CASES = [['a man who drinks too much at home, alone', 'leave it to him (only he is harmed)'], ['a police officer drunk on duty', 'society may step in (others are put at risk)'], ['printing an unpopular opinion in a newspaper', 'leave it free (it is an opinion)'], ['shouting that opinion to an angry mob outside a man\'s house', 'society may step in (it sparks violence against a person)'], ['someone about to step onto a broken bridge, with no time to warn him', 'society may step in (he does not want to fall)'], ['an adult who knowingly takes a risk that falls only on himself', 'warn him, but do not force him'], ['selling a poison that also has good uses', 'label it and record sales, but do not ban it'], ['living in an unusual way the neighbors dislike', 'leave it free (dislike is not harm)']];
var CH = ['Introductory', 'Of the Liberty of Thought and Discussion', 'Of Individuality', 'Of the Limits to the Authority of Society over the Individual', 'Applications'];
var WHY = [['The silenced opinion may be true.', 'We are not infallible; to silence it assumes we cannot be wrong.'], ['The silenced opinion may hold part of the truth.', 'The common view is rarely the whole truth; the rest comes out only in argument.'], ['Even a true belief, never challenged, becomes a dead dogma.', 'People who never hear the other side do not really know why they believe.']];
var WHO = [
  ['If all mankind but one held one opinion, mankind would have no more right to silence that one than he would to silence mankind.', 'Mill', 'Chapter II.'],
  ['The only purpose for which power may rightly be used over anyone, against his will, is to prevent harm to others.', 'Mill', 'Chapter I: the harm principle.'],
  ['Society can be a tyrant too, through opinion and custom, not only through laws.', 'Mill', 'Chapter I; the phrase "tyranny of the majority" had been made famous by Tocqueville.'],
  ['Equality of conditions shapes everything in America, even the way people think.', 'Tocqueville', 'Democracy in America; Mill reviewed it warmly.'],
  ['On Liberty was more truly a joint work with my wife than anything else I wrote.', 'Mill', 'So he says in his Autobiography; he dedicated the book to Harriet Taylor Mill.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['On Liberty was published in 1859.', true, 'The same year as Darwin\'s Origin of Species.'],
    ['Mill\'s harm principle says society may stop you only to prevent harm to others.', true, 'Chapter I.'],
    ['Mill thought a person\'s own good is enough reason to force him.', false, '"His own good ... is not a sufficient warrant."'],
    ['Mill said the principle applies to children too.', false, 'He meant adults "in the maturity of their faculties."'],
    ['Mill worried about the "tyranny of the majority," including the pressure of public opinion.', true, 'Not only laws, but social pressure.'],
    ['Mill thought we should hear the other side even of opinions we are sure are true.', true, 'Otherwise a truth becomes "dead dogma."'],
    ['Mill wanted everyone to live the same way, by the best customs.', false, 'He praised individuality and "experiments of living."'],
    ['Mill dedicated On Liberty to the memory of his wife, Harriet Taylor Mill.', true, 'She died in 1858.']
  ],
  items: [
    { q: 'What is the "harm principle"?', r: 'Power over a person, against his will, is justified only to prevent harm to others', w: ['Everything harmful must be banned', 'The government should make people happy', 'Harm to oneself must always be punished'], why: 'Chapter I.' },
    { q: 'Why, for Mill, should even false opinions be allowed?', r: 'Arguing against them keeps the truth alive and understood', w: ['Because false opinions are usually right', 'Because no one reads them', 'Because the law cannot find them'], why: 'Chapter II.' },
    { q: 'Mill\'s example: a soldier or police officer is drunk on duty. What does he say?', r: 'He may be punished, because others are put at risk', w: ['It is his own business', 'He should be praised', 'Only his family may complain'], why: 'Chapter IV.' },
    { q: 'What does Mill mean by "experiments of living"?', r: 'People trying different ways of life, so all can learn what is good', w: ['Science experiments at home', 'Laws that change every year', 'Living in a laboratory'], why: 'Chapter III, Of Individuality.' },
    { q: 'Which earlier book on this ladder makes a similar case for a free press?', r: 'Milton\'s Areopagitica', w: ['Machiavelli\'s The Prince', 'Hobbes\'s Leviathan', 'Dante\'s Inferno'], why: 'Milton, 1644: let truth and falsehood grapple.' },
    { q: 'What do critics most often ask about the harm principle?', r: 'What counts as harm, and how far an act\'s effects on others reach', w: ['Whether Mill wrote it', 'Whether it is too short', 'Whether it is about science'], why: 'Almost every act affects someone; drawing the line is the hard part.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(CASES, function (a) { return 'Mill\'s harm principle: what does he say about <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(CASES, function (a) { return 'Using Mill\'s own examples: <b>' + a + '</b>. What follows?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(WHY, function (a) { return 'Mill gives three reasons not to silence an opinion. Which explanation goes with: <b>' + a + '</b>'; }, null, R, lv); },
  function (R, lv) { return H.k19.seq(CH, 'the chapters of On Liberty', 'chapter', R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
