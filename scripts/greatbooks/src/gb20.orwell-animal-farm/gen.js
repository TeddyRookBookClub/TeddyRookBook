/* Orwell, Animal Farm (gbx3). No quotations (first published 1945). Families: the story in order, who's who, the allegory both ways,
   who argued what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.orwell-animal-farm';
var STORY = ['Old Major tells of his dream', 'the animals drive out Mr. Jones', 'the rules are painted on the barn', 'Snowball plans a windmill', 'Napoleon\'s dogs chase Snowball away', 'the rules are quietly changed', 'Boxer collapses and is sold', 'the pigs can\'t be told from the men'];
var WHO = [['Napoleon', 'the scheming pig who takes control'], ['Snowball', 'the inventive pig who plans the windmill and is driven out'], ['Squealer', 'the pig who explains away every new privilege'], ['Boxer', 'the loyal cart-horse who works himself to exhaustion'], ['Old Major', 'the old boar whose dream starts the Rebellion'], ['Benjamin', 'the old donkey who sees much and says little'], ['Mr. Jones', 'the drunken farmer the animals drive out']];
var ALLEG = [['Napoleon', 'Joseph Stalin'], ['Snowball', 'Leon Trotsky'], ['Old Major', 'Karl Marx and Lenin'], ['Mr. Jones', 'the Tsar'], ['the dogs', 'the secret police'], ['Squealer', 'state propaganda'], ['the windmill', 'the five-year plans']];
var SAID = [
  ['Someday animals will be free of human masters.', 'Old Major', 'Our summary of his dream.'],
  ['Trust the leader and keep working, however tired I am.', 'Boxer', 'Our summary of his loyal mottoes.'],
  ['The pigs need these comforts to do their brain-work for you.', 'Squealer', 'Our summary of his excuses.'],
  ['This fable is about the Russian Revolution and what became of it.', 'George Orwell', 'Our summary of what he wrote about the book.'],
  ['Nothing really changes for the likes of us.', 'Benjamin', 'Our summary of the old donkey\'s outlook.']
];
var B = {
  facts: [
    ['George Orwell was the pen name of Eric Arthur Blair.', true, 'He was born in India in 1903.'],
    ['Animal Farm was published in August 1945.', true, 'Several publishers had turned it down.'],
    ['Orwell said the book is an allegory of the Russian Revolution.', true, 'And of what followed under Stalin.'],
    ['Snowball drives Napoleon off the farm.', false, 'Napoleon\'s dogs drive Snowball away.'],
    ['The rules on the barn are changed quietly over time.', true, 'Squealer explains away each change.'],
    ['Boxer is retired to a peaceful meadow.', false, 'He is sold to a slaughterer.'],
    ['Orwell fought in the Spanish Civil War.', true, 'On the Republican side.'],
    ['At the end, the animals happily invite Mr. Jones back.', false, 'At the end they cannot tell the pigs from the men.']
  ],
  items: [
    { q: 'Why do the animals rebel?', r: 'They work hard but the farmer keeps everything and neglects them', w: ['They want to move to the city', 'They are bored', 'A storm destroys the barn'], why: 'Old Major\'s dream inspires them.' },
    { q: 'How does Napoleon take power?', r: 'He uses dogs he secretly raised to chase Snowball away', w: ['He wins a fair vote', 'He builds the windmill himself', 'Mr. Jones appoints him'], why: 'Force, then propaganda.' },
    { q: 'What is Squealer\'s job?', r: 'Explaining away the pigs\' actions with clever talk', w: ['Guarding the gate', 'Plowing the fields', 'Teaching reading'], why: 'He stands for propaganda.' },
    { q: 'Why does Orwell care so much about the written rules?', r: 'Whoever controls words and records can rewrite the rules', w: ['He liked painting barns', 'The rules were in Latin', 'The animals could not read at all'], why: 'Plain words and memory protect freedom.' },
    { q: 'Why was the book hard to publish in 1944?', r: 'Britain and the Soviet Union were wartime allies', w: ['Paper was banned', 'Orwell was unknown', 'It was too long'], why: 'It appeared in August 1945.' },
    { q: 'Which earlier satire on this ladder also uses imaginary creatures and lands?', r: 'Swift\'s Gulliver\'s Travels', w: ['Euclid\'s Elements', 'Kant\'s Critique', 'Newton\'s Optics'], why: 'Satire by fable.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'Animal Farm', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Animal Farm, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(ALLEG, function (a) { return 'In the usual reading of the allegory, whom or what does <b>' + a + '</b> stand for?'; }, function (b) { return 'Which part of the fable stands for <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
