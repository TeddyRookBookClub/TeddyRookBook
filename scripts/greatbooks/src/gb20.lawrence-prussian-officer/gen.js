/* D. H. Lawrence, The Prussian Officer (gbx3). Families: the story in order, images and what they carry, Lawrence's life, who argued what, dates. Uses H.k20. */
var ID = 'gb20.lawrence-prussian-officer';
var STORY = ['the march along the hot road', 'the captain\'s resentment of his orderly', 'the captain\'s cruelty', 'the breaking point in the forest', 'the orderly wanders toward the mountains', 'both men are found dead'];
var LIFE = ['born in Eastwood, a mining town (1885)', 'Sons and Lovers (1913)', 'The Prussian Officer and Other Stories (1914)', 'Women in Love (1920)', 'dies in France (1930)'];
var IMG = [['the white, hot road', 'the pressure building on the men'], ['the distant snowy mountains', 'longing for coolness and freedom'], ['the captain\'s rank', 'power that lets him bully without check'], ['the forest clearing', 'where the tension finally breaks']];
var SAID = [
  ['Buried feelings can break out in harmful ways.', 'Freud', 'Our summary of an idea from this era.'],
  ['The master depends on the servant more than he knows.', 'Hegel', 'Our summary of the master and servant.'],
  ['Call it "The Prussian Officer."', 'Edward Garnett', 'The editor who retitled Lawrence\'s "Honour and Arms."'],
  ['A writer should paint the inner life through the body and the land.', 'D. H. Lawrence', 'Our summary of his method.']
];
var B = {
  facts: [
    ['D. H. Lawrence was the son of a coal miner.', true, 'In Eastwood, Nottinghamshire.'],
    ['The Prussian Officer and Other Stories was published in 1914.', true, 'By Duckworth, in London.'],
    ['Lawrence first called the story "Honour and Arms."', true, 'His editor changed the title.'],
    ['The story is set at sea.', false, 'On army maneuvers in hot, mountainous country.'],
    ['The captain is kind and fatherly to his orderly.', false, 'He torments him.'],
    ['Landscape and weather carry much of the story\'s feeling.', true, 'Heat, glare and distant snow.'],
    ['Lawrence wrote Sons and Lovers.', true, '1913.'],
    ['The orderly reaches the mountains and is rescued.', false, 'He never reaches them.']
  ],
  items: [
    { q: 'What does the heat of the march suggest?', r: 'Pressure building toward a breaking point', w: ['A happy holiday', 'The coming of winter', 'A safe homecoming'], why: 'The glare grows with the tension.' },
    { q: 'What do the distant mountains seem to stand for?', r: 'Coolness, peace and freedom out of reach', w: ['The enemy army', 'Wealth', 'The captain\'s home'], why: 'The orderly longs for them.' },
    { q: 'Why does the orderly suffer in silence?', r: 'The captain\'s rank gives him power, and the young man has no one to tell', w: ['He has no voice', 'He is a spy', 'He is asleep'], why: 'Power without check.' },
    { q: 'Where did Lawrence see German soldiers on maneuvers?', r: 'In Bavaria, in 1912', w: ['In Paris', 'In London', 'In Russia'], why: 'He traveled with Frieda, his future wife.' },
    { q: 'What is the story\'s main subject?', r: 'What happens when one person tries to master another', w: ['How to win a war', 'How armies are supplied', 'A love affair at a ball'], why: 'Pride, cruelty and revolt.' },
    { q: 'Which later rung on this ladder also shows soldiers and courage from the inside?', r: 'Hemingway\'s The Short Happy Life of Francis Macomber', w: ['Proust\'s Swann in Love', 'Cather\'s A Lost Lady', 'Pirandello\'s Six Characters'], why: 'Hemingway wrote often about war and courage.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'The Prussian Officer', 'part of the story', R, lv); },
  function (R, lv) { return H.k20.seq(LIFE, 'Lawrence\'s life and books', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(IMG, function (a) { return 'In the story, what does <b>' + a + '</b> carry?'; }, function (b) { return 'Which image carries <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
