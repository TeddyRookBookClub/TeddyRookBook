/* Mill, Utilitarianism and Considerations on Representative Government (gbw4). Families: the greatest-happiness sum (computed),
   higher and lower pleasures, who said what (our summaries), terms, dates. Uses H.k19. */
var ID = 'gb19.mill-utilitarianism';
function famSum(R, lv) {
  var na = R.int(2, lv === 1 ? 10 : 30), da = R.int(1, 9), nb = R.int(2, lv === 1 ? 10 : 30), db = R.int(1, 9);
  if (na * da === nb * db) db = db === 9 ? 8 : db + 1;
  var ta = na * da, tb = nb * db, win = ta > tb ? 'Choice A' : 'Choice B';
  if (R.coin()) return H.num('Choice A makes ' + na + ' people each ' + da + ' units happier. Choice B makes ' + nb + ' people each ' + db + ' units happier. A simple "greatest total happiness" sum: what is the total for the <b>better</b> choice?', Math.max(ta, tb), ['A: $' + na + ' \\times ' + da + ' = ' + ta + '$.', 'B: $' + nb + ' \\times ' + db + ' = ' + tb + '$.', win + ' is larger: ' + Math.max(ta, tb) + '.'], { hint: 'Multiply people by happiness each, for both.' });
  return H.mc('Choice A: ' + na + ' people, ' + da + ' units happier each. Choice B: ' + nb + ' people, ' + db + ' units each. Which does a simple greatest-happiness sum prefer?', win, [win === 'Choice A' ? 'Choice B' : 'Choice A', 'Neither: they are equal'], ['A: ' + ta + '; B: ' + tb + '.']);
}
function famNet(R, lv) {
  var g = R.int(5, 20), gd = R.int(1, 3), l = R.int(1, 3), ld = R.int(5, 15), net = g * gd - l * ld;
  return H.num('A plan makes ' + g + ' people ' + gd + ' unit' + (gd > 1 ? 's' : '') + ' happier each, and makes ' + l + ' ' + (l > 1 ? 'people' : 'person') + ' ' + ld + ' units less happy each. What is the net change in total happiness? (It may be negative.)', net, ['Gains: $' + g + ' \\times ' + gd + ' = ' + (g * gd) + '$.', 'Losses: $' + l + ' \\times ' + ld + ' = ' + (l * ld) + '$.', 'Net: ' + net + '. Critics ask whether a sum like this is fair to the few; Mill answered with justice and rights, which protect everyone\'s security.'], { hint: 'Total gains minus total losses.' });
}
var PL = [['the pleasure of reading a great poem', 'higher'], ['the pleasure of solving a hard problem', 'higher'], ['the pleasure of a helpful act of kindness', 'higher'], ['the pleasure of eating a sweet', 'lower'], ['the pleasure of a warm nap', 'lower']];
var WHO = [
  ['It is better to be Socrates dissatisfied than a fool satisfied.', 'Mill', 'Utilitarianism, Chapter II.'],
  ['Each to count for one, and nobody for more than one.', 'Bentham', 'Mill quotes this saying of Jeremy Bentham\'s in Chapter V.'],
  ['Pushpin is as good as poetry, if it gives as much pleasure.', 'Bentham', 'A saying long attributed to Bentham; Mill disagreed: pleasures differ in quality.'],
  ['Act only on a rule you could will to be a law for everyone.', 'Kant', 'Mill criticizes Kant\'s test in Chapter I.'],
  ['The best government is one in which the people share in ruling, through representatives they choose.', 'Mill', 'Considerations on Representative Government (1861).']
];
var TERMS = [['utility', 'happiness, or the tendency of an act to produce it'], ['the greatest happiness principle', 'actions are right as they tend to promote happiness, wrong as they produce the reverse'], ['higher pleasures', 'pleasures of the mind, feelings and imagination, which Mill ranks above bodily ones'], ['the competent judge', 'someone who has known both kinds of pleasure and can compare them'], ['proportional representation', 'seats shared out so that minorities are represented in proportion to their votes']];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Utilitarianism first appeared as articles in Fraser\'s Magazine in 1861, then as a book in 1863.', true, 'London, Parker, Son and Bourn.'],
    ['Mill was raised on the ideas of Jeremy Bentham, a friend of his father.', true, 'Bentham founded modern utilitarianism.'],
    ['Mill thought all pleasures are equal if they are equally intense.', false, 'He said pleasures differ in quality as well as quantity.'],
    ['For utilitarians, the happiness that counts is everyone\'s affected, not just the person acting.', true, 'Each counts for one.'],
    ['Mill argued in Parliament for votes for women.', true, 'In 1867 he proposed replacing "man" with "person" in the Reform Bill; it failed.'],
    ['In Representative Government, Mill favored proportional representation.', true, 'Following Thomas Hare\'s scheme.'],
    ['Mill thought justice has nothing to do with happiness.', false, 'He argued that justice protects the most vital parts of everyone\'s well-being.'],
    ['Mill proposed giving some educated voters extra votes.', true, 'A "plural voting" idea that most readers, then and now, have rejected.']
  ],
  items: [
    { q: 'What does the greatest happiness principle say?', r: 'Actions are right as they tend to promote happiness, wrong as they tend to produce the reverse', w: ['Do whatever makes you happiest', 'Obey the law in every case', 'Happiness does not matter in ethics'], why: 'Utilitarianism, Chapter II.' },
    { q: 'How can we tell which of two pleasures is higher, according to Mill?', r: 'Ask people who have known both', w: ['Measure which lasts longer', 'Ask a judge', 'Choose the cheaper one'], why: 'The "competent judges."' },
    { q: 'What is the most common objection to utilitarianism?', r: 'A large total can seem to justify a serious wrong to a few', w: ['It is too hard to spell', 'It ignores happiness', 'It was written in Latin'], why: 'Mill\'s Chapter V on justice is his answer.' },
    { q: 'Why did Mill favor representative government?', r: 'It protects people\'s interests and improves citizens by giving them a share in public life', w: ['It is the fastest way to decide', 'It lets one wise man rule', 'It needs no laws'], why: 'Considerations on Representative Government, Chapter III.' },
    { q: 'What danger in democracy did Mill try to guard against?', r: 'A majority ignoring minorities', w: ['Too many parties', 'Kings returning', 'Elections being too rare'], why: 'Hence proportional representation.' },
    { q: 'Whom did Mill answer in Utilitarianism when he wrote that the theory is not "a doctrine worthy only of swine"?', r: 'Critics who said a life of pleasure is beneath human dignity', w: ['Socrates', 'Bentham', 'Darwin'], why: 'Chapter II.' }
  ]
};
H.T(ID, B, [famSum, famSum, famNet,
  function (R, lv) { return H.k19.pairs(PL, function (a) { return 'In Mill\'s terms, is <b>' + a + '</b> a higher or a lower pleasure?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean, in Mill?'; }, function (b) { return 'Which term means: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
