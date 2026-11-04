/* Freud, the later works (gbx1). Families: id, ego and superego; terms; the three blows; works in order; how critics
   and research judged the ideas; who said what (our summaries); dates. Uses H.k20 (from gb20.freud-interpretation-of-dreams). */
var ID = 'gb20.freud-later-works';
var PARTS = [['the id', 'inborn drives that want satisfaction now'], ['the ego', 'the organizing self that deals with reality and finds a way between demands'], ['the superego', 'the inner judge formed from the rules and ideals of parents and society']];
var VOICE = [['"I want it, and I want it now!"', 'the id'], ['"You should be ashamed of yourself."', 'the superego'], ['"Let\'s wait until after dinner, then ask."', 'the ego'], ['"Never break a rule, ever."', 'the superego'], ['"Grab the biggest piece!"', 'the id'], ['"Do the hard part first, then rest."', 'the ego']];
var TERMS = [['repression', 'pushing a painful thought out of awareness'], ['the unconscious', 'mental processes active in a person without their awareness'], ['a slip of the tongue', 'a mistake in speech that Freud thought could reveal a second intention'], ['free association', 'saying whatever comes to mind, holding nothing back'], ['psychoanalysis', 'Freud\'s name for his theory and his talking cure'], ['guilt', 'in Civilization and Its Discontents, aggression turned inward by the superego']];
var WORKS = ['Lectures at Clark University (1909)', 'A General Introduction to Psychoanalysis (1915–17)', 'Beyond the Pleasure Principle (1920)', 'The Ego and the Id (1923)', 'Civilization and Its Discontents (1930)', 'New Introductory Lectures (1933)'];
var BLOWS = ['Copernicus: the earth is not the center of the universe', 'Darwin: human beings descend from other animals', 'psychology: the "I" is not master in its own home'];
var JUDGE = [['much mental work happens outside awareness', 'broadly supported by experimental psychology, in its own terms'], ['the id, ego and superego', 'seen today as a historical model rather than a scientific finding'], ['the theory can explain any outcome', 'Karl Popper\'s criticism: that makes it hard to test'], ['talk therapy can help', 'trials of modern psychodynamic therapy have found benefits for some problems']];
var WHO = [
  ['Slips of the tongue are not accidents but meaningful acts.', 'Sigmund Freud', 'A General Introduction to Psychoanalysis, Lecture III.'],
  ['A theory that no possible observation could refute is not a scientific theory.', 'Karl Popper', 'He used psychoanalysis as an example.'],
  ['The ego protects itself with many defenses besides repression.', 'Anna Freud', 'The Ego and the Mechanisms of Defence, 1936.'],
  ['The soul has three parts, and reason should rule spirit and appetite.', 'Plato', 'The Republic, much earlier on this ladder.'],
  ['The case evidence of psychoanalysis does not show what Freud claimed.', 'Adolf Grünbaum', 'The Foundations of Psychoanalysis, 1984.'],
  ['Civilization demands that we hold back our drives, and we pay for it in guilt.', 'Sigmund Freud', 'Civilization and Its Discontents, 1930.']
];
var B = {
  facts: [
    ['Freud\'s German words for the three parts were "the It," "the I" and "the Over-I."', true, 'Das Es, das Ich, das Über-Ich; the translators used Latin: id, ego, superego.'],
    ['The Ego and the Id was published in 1923.', true, 'It set out the three-part model.'],
    ['Freud thought every slip of the tongue is pure chance.', false, 'He argued many slips have a meaning.'],
    ['Freud fled Vienna for London in 1938 and died there in 1939.', true, 'After Nazi Germany annexed Austria.'],
    ['Freud tested his theories mainly with large controlled experiments.', false, 'He worked mostly from his patients and his own self-analysis.'],
    ['Freud\'s daughter Anna Freud became a psychoanalyst who worked with children.', true, 'She wrote on the defenses in 1936.'],
    ['In Civilization and Its Discontents Freud argued that civilization costs people nothing.', false, 'He thought it requires holding back drives, at a real price.'],
    ['Freud gave lectures at Clark University in Massachusetts in 1909.', true, 'His only visit to America.']
  ],
  items: [
    { q: 'Which part of the mind, for Freud, is the inner judge?', r: 'The superego', w: ['The id', 'The ego', 'The preconscious'], why: 'Formed from the rules and ideals of parents and society.' },
    { q: 'What does the ego do in Freud\'s model?', r: 'It deals with reality and finds a way between the id and the superego', w: ['It only wants pleasure', 'It only punishes', 'It is asleep'], why: 'The Ego and the Id, 1923.' },
    { q: 'What did Freud mean by repression?', r: 'Pushing a painful thought out of awareness', w: ['Forgetting a phone number', 'Speaking very quietly', 'Studying too hard'], why: 'One of the ego\'s defenses.' },
    { q: 'What were Freud\'s "three blows" to human pride?', r: 'Copernicus, Darwin, and psychology', w: ['Newton, Galileo and Kepler', 'Plato, Aristotle and Euclid', 'Three wars'], why: 'Lecture XVIII.' },
    { q: 'What is the main criticism Karl Popper made of psychoanalysis?', r: 'It could explain any outcome, so it could not be tested', w: ['It was too mathematical', 'It was only about plants', 'It was written in Latin'], why: 'Popper\'s test for science is whether a theory could be shown false.' },
    { q: 'Which earlier great book also divides the soul into three parts?', r: 'Plato\'s Republic', w: ['Euclid\'s Elements', 'Caesar\'s Gallic War', 'Newton\'s Principia'], why: 'Reason, spirit and appetite.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(PARTS, function (a) { return 'In Freud\'s later model, what is <b>' + a + '</b>?'; }, function (b) { return 'Which part of Freud\'s model is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(VOICE, function (a) { return 'In Freud\'s picture, which part of the mind would say <b>' + a + '</b>'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean in Freud\'s work?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.seq(WORKS, 'Freud\'s later works', 'work', R, lv); },
  function (R, lv) { return H.k20.seq(BLOWS, 'Freud\'s three blows to human pride', 'blow', R, lv); },
  function (R, lv) { return H.k20.pairs(JUDGE, function (a) { return 'Freud\'s idea or its critics: <b>' + a + '</b>. How is it judged today?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
