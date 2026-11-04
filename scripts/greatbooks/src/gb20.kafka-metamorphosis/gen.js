/* Kafka, The Metamorphosis (gbx3). No quotations (no public-domain English). Families: the story in order, who's who,
   Kafka's works and life, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.kafka-metamorphosis';
var STORY = ['Gregor wakes up transformed', 'the chief clerk comes to the door', 'Grete begins to feed him', 'the furniture is cleared out', 'his father throws apples', 'the lodgers move in', 'Grete plays the violin', 'Gregor dies', 'the family\'s tram ride into the country'];
var LIFE = ['born in Prague (1883)', 'law degree (1906)', 'writes The Metamorphosis (1912)', 'The Metamorphosis published (1915)', 'dies of tuberculosis (1924)', 'Max Brod publishes The Trial (1925)'];
var WHO = [['Gregor Samsa', 'the traveling salesman who wakes up as an insect'], ['Grete', 'Gregor\'s sister, who feeds him and later turns against him'], ['the father', 'who drives Gregor back with a stick and throws apples'], ['the mother', 'who faints at the sight of her son'], ['the chief clerk', 'who comes from Gregor\'s firm to check on him'], ['the three lodgers', 'whose notice to leave seals Gregor\'s fate']];
var SAID = [
  ['I\'ve missed my train, and the firm will be angry.', 'Gregor', 'Our summary of his first worry.'],
  ['We must try to get rid of it.', 'Grete', 'Our summary of her words in Part III.'],
  ['The insect itself must not be drawn.', 'Kafka', 'Our summary of his request to his publisher about the cover.'],
  ['Burn my unpublished manuscripts.', 'Kafka', 'His request to Max Brod, who refused.']
];
var B = {
  facts: [
    ['Kafka wrote in German.', true, 'He was a German-speaking writer in Prague.'],
    ['The Metamorphosis was published in 1915.', true, 'Written in 1912.'],
    ['Kafka explains in detail why Gregor was transformed.', false, 'He never explains it.'],
    ['Gregor works as a traveling salesman.', true, 'His pay supports the family.'],
    ['Grete stays kind to Gregor until the end.', false, 'In Part III she says they must get rid of him.'],
    ['Max Brod refused to burn Kafka\'s manuscripts.', true, 'He published The Trial and The Castle.'],
    ['The word "Kafkaesque" means absurd and nightmarish, like a trap one cannot understand.', true, 'It comes from Kafka\'s stories.'],
    ['The family is grief-stricken and stays indoors at the end.', false, 'They feel relief and take a tram ride into the country.']
  ],
  items: [
    { q: 'What is Gregor\'s first worry after his transformation?', r: 'Missing his train and losing his job', w: ['Finding a doctor', 'Hiding from his sister', 'Finding food'], why: 'His family depends on his pay.' },
    { q: 'What draws Gregor out of his room in Part III?', r: 'His sister\'s violin playing', w: ['The smell of dinner', 'A fire', 'A visitor calling his name'], why: 'He still loves music.' },
    { q: 'What is unusual about how Kafka tells an impossible event?', r: 'He uses calm, exact, everyday prose', w: ['He writes it as a poem', 'He makes it a joke', 'He tells it backward'], why: 'That calm makes it more unsettling.' },
    { q: 'What does the family discover in Part II?', r: 'They have more savings than Gregor knew, and they can work', w: ['A cure for Gregor', 'A letter from his boss', 'A hidden room'], why: 'Their dependence on him was less than he thought.' },
    { q: 'Which ancient book of transformations does the title recall?', r: 'Ovid\'s Metamorphoses', w: ['Homer\'s Iliad', 'Plato\'s Republic', 'Virgil\'s Aeneid'], why: 'In Ovid the gods cause the changes; in Kafka, nothing does.' },
    { q: 'What job did Kafka do by day?', r: 'He worked for a workers\' accident insurance institute', w: ['He was a sailor', 'He was a doctor', 'He ran a theater'], why: 'He wrote in his free hours.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'The Metamorphosis', 'event', R, lv); },
  function (R, lv) { return H.k20.seq(LIFE, 'Kafka\'s life and works', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In The Metamorphosis, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
