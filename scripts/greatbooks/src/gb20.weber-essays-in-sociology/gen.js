/* Weber, Essays in Sociology (gbx1). No excerpts (1946 translation). Families: type of authority (our examples),
   ethic of conviction or responsibility, features of bureaucracy, class/status/party, terms, who said what, dates. Uses H.k20. */
var ID = 'gb20.weber-essays-in-sociology';
var AUTH = [['a king who rules because his father did', 'traditional authority'], ['a prophet whose followers believe in his special calling', 'charismatic authority'], ['a judge applying the written law', 'legal-rational authority'], ['a village elder respected by long custom', 'traditional authority'], ['a general followed for his legendary courage', 'charismatic authority'], ['a tax official following set procedures', 'legal-rational authority'], ['a referee enforcing the rules of a game', 'legal-rational authority']];
var ETH = [['do what is right and leave the results to fate', 'the ethic of conviction'], ['answer for the foreseeable results of what you do', 'the ethic of responsibility'], ['never compromise a principle, whatever happens', 'the ethic of conviction'], ['weigh the likely effects of each choice', 'the ethic of responsibility']];
var DIM = [['how much property and income a person has', 'class'], ['how much honor and prestige a group gives a person', 'status'], ['organized power to influence decisions', 'party'], ['being from an old, respected family with little money', 'status'], ['owning a large factory', 'class']];
var BUREAU = ['fixed areas of duty', 'a chain of command', 'written files', 'trained officials', 'impersonal rules'];
var TERMS = [['legitimacy', 'what makes people accept power as rightful'], ['the routinization of charisma', 'turning a leader\'s personal authority into traditions or rules'], ['the disenchantment of the world', 'the belief that everything can in principle be explained by calculation'], ['an ideal type', 'a pure model that real cases only approximate'], ['a vocation', 'a calling: work one is called to and devoted to']];
var WHO = [
  ['People obey for three reasons: tradition, a leader\'s gifts, or legal rules.', 'Max Weber', 'Essays in Sociology (our summary).'],
  ['History is the history of class struggles.', 'Karl Marx', 'Weber added status and party to class.'],
  ['Kinds of rule are sorted by who rules and for whose good.', 'Aristotle', 'Politics (our summary).'],
  ['A prince must learn how not to be good, when necessity requires.', 'Niccolò Machiavelli', 'The Prince (our summary).'],
  ['Democracies risk a soft, all-managing administrative power.', 'Alexis de Tocqueville', 'Democracy in America (our summary).']
];
var B = {
  facts: [
    ['Weber gave "Science as a Vocation" and "Politics as a Vocation" as lectures in Munich.', true, 'In 1917 and 1919.'],
    ['Weber is a founder of sociology.', true, 'With Durkheim and others.'],
    ['Weber thought science can tell us which values to live by.', false, 'He said it cannot; it can clarify facts and consequences.'],
    ['Weber said real cases always fit one pure type of authority exactly.', false, 'Ideal types are simplifications; real cases mix.'],
    ['Gerth and Mills\'s English selection appeared in 1946.', true, 'From Max Weber: Essays in Sociology.'],
    ['Weber wrote The Protestant Ethic and the Spirit of Capitalism.', true, '1905.']
  ],
  items: [
    { q: 'What are Weber\'s three types of legitimate authority?', r: 'Traditional, charismatic and legal-rational', w: ['Kings, nobles and peasants', 'Past, present and future', 'Local, national and global'], why: 'His pure types.' },
    { q: 'Which is a feature of bureaucracy in Weber\'s account?', r: '__B__', w: ['Rule by personal whim', 'No written records', 'Offices handed down in families'], why: 'Weber\'s list (our wording): ' + BUREAU.join(', ') + '.' },
    { q: 'What did Weber mean by "the disenchantment of the world"?', r: 'The belief that everything can in principle be explained by calculation', w: ['People stopped enjoying stories', 'Magic was proven real', 'Cities grew larger'], why: 'Science as a Vocation.' },
    { q: 'What qualities did Weber think a political leader needs?', r: 'Passion, a sense of responsibility and a sense of proportion', w: ['Wealth, fame and luck', 'Silence, speed and strength', 'Charm alone'], why: 'Politics as a Vocation.' }
  ]
};
B.items[1].r = BUREAU[0];
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(AUTH, function (a) { return 'Which of Weber\'s types of authority is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(ETH, function (a) { return 'Which ethic says: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(DIM, function (a) { return 'Weber\'s three dimensions: which is <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.mc('Which of these is one of the features of bureaucracy Weber described?', R.pick(BUREAU), ['rule by personal whim', 'offices handed down in families', 'no written records'].slice(0, lv === 1 ? 2 : 3), ['Weber\'s list (our wording): ' + BUREAU.join(', ') + '.']); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
