/* Lévi-Strauss, Structural Anthropology (gbx1). No excerpts (English 1963). Families: the mediation scheme in order,
   which mediator joins which pair, terms, structuralism or its critics, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.levi-strauss-structural-anthropology';
var MED = [['agriculture and war', 'hunting'], ['plant-eaters and beasts of prey', 'carrion-eaters such as the raven and the coyote'], ['life and death', 'agriculture and war, and then hunting'], ['raw and cooked', 'fire']];
var CHAIN = ['life and death', 'agriculture and war', 'hunting', 'plant-eaters and beasts of prey', 'carrion-eaters (raven, coyote)'];
var TERMS = [['structure', 'a hidden system of relations and contrasts beneath customs or myths'], ['a mytheme', 'the smallest unit of meaning in a myth'], ['mediation', 'softening an opposition by finding something in between'], ['the atom of kinship', 'the small system of relations among husband, wife, brother-in-law and son'], ['binary opposition', 'a pair of contrasting terms, such as raw and cooked'], ['structural linguistics', 'the study of language as a system of contrasts, which Lévi-Strauss borrowed']];
var VIEW = [['customs and myths are systems of contrasts working below awareness', 'Lévi-Strauss'], ['a clever analyst can find opposites anywhere, so structures are hard to test', 'his critics'], ['cultures are best understood through the meanings people themselves give them', 'Clifford Geertz'], ['customs are best explained by ecology and economy', 'Marvin Harris'], ['all human minds work with the same kind of logic', 'Lévi-Strauss']];
var WHO = [
  ['Myths work on contradictions by finding mediators between opposites.', 'Claude Lévi-Strauss', '"The Structural Study of Myth" (our summary).'],
  ['The sounds of a language mean something only through their contrasts.', 'Roman Jakobson', 'The linguist Lévi-Strauss met in New York.'],
  ['Magic, religion and science form stages of thought.', 'James George Frazer', 'The Golden Bough (our summary).'],
  ['Culture is a web of meanings that people themselves spin.', 'Clifford Geertz', 'An interpretive critic of structuralism (our summary).'],
  ['The meaning of a word is its use.', 'Ludwig Wittgenstein', 'Philosophical Investigations (our summary).']
];
var B = {
  facts: [
    ['Lévi-Strauss did early fieldwork in Brazil.', true, 'In the 1930s.'],
    ['He borrowed his method from structural linguistics.', true, 'Through Roman Jakobson.'],
    ['Structural Anthropology was first published in French in 1958.', true, 'English, 1963.'],
    ['Lévi-Strauss said all cultures have identical customs.', false, 'Same kind of logic, endlessly different systems.'],
    ['In his example, carrion-eaters mediate between plant-eaters and beasts of prey.', true, 'They eat meat but do not kill.'],
    ['Lévi-Strauss lived to be a hundred.', true, '1908–2009.']
  ],
  items: [
    { q: 'What did Lévi-Strauss borrow from linguistics?', r: 'The idea that meaning comes from a system of contrasts', w: ['A dictionary of myths', 'The alphabet', 'The rules of spelling'], why: 'As "pat" and "bat" differ only by p and b.' },
    { q: 'Why might the raven or coyote be a trickster in myths, on his reading?', r: 'They eat meat but do not kill, so they stand between plant-eaters and hunters', w: ['They are the largest animals', 'They live only in cities', 'They never appear in stories'], why: '"The Structural Study of Myth."' },
    { q: 'What is a common criticism of structuralism?', r: 'Its structures are hard to test and it sets aside history and individual choice', w: ['It used too few stories', 'It ignored language', 'It was only about Europe'], why: 'Raised by many anthropologists.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(CHAIN, 'the steps of mediation in Lévi-Strauss\'s example', 'step', R, lv); },
  function (R, lv) { return H.k20.pairs(MED, function (a) { return 'In this scheme, what mediates between <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(VIEW, function (a) { return 'Whose view is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
