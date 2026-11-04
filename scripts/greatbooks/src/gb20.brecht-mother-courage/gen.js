/* Brecht, Mother Courage and Her Children (gbx3). No quotations (published after 1930). Families: the wagon's road in order,
   each child and the virtue that endangers them, epic theater terms, who argued what, the war's years, dates. Uses H.k20. */
var ID = 'gb20.brecht-mother-courage';
var ROAD = ['Dalarna, Sweden (1624)', 'Poland (1625–26)', 'Magdeburg (1631)', 'Ingolstadt, Bavaria (1632)', 'the Fichtelgebirge (1634)', 'near Halle (1636)'];
var KIDS = [['Eilif', 'bravery'], ['Swiss Cheese', 'honesty'], ['Kattrin', 'kindness']];
var TERMS = [['epic theater', 'Brecht\'s name for plays that make the audience think and judge'], ['the estrangement effect', 'devices that keep the audience from simply losing itself in the story'], ['the canteen wagon', 'Courage\'s traveling shop that follows the armies'], ['the Thirty Years\' War', 'the European war of 1618 to 1648 in which the play is set'], ['the Berliner Ensemble', 'the theater company Brecht founded in East Berlin']];
var SAID = [
  ['The war is good for business; peace would ruin me.', 'Mother Courage', 'Our summary of her outlook.'],
  ['The audience should think and judge, not just weep.', 'Bertolt Brecht', 'Our summary of epic theater.'],
  ['Tragedy works by arousing pity and fear.', 'Aristotle', 'Our summary of the Poetics, which Brecht set himself against.'],
  ['Come and join the army; a fine life of glory awaits!', 'the recruiting officer', 'Our summary of Scene 1.']
];
var B = {
  facts: [
    ['Brecht wrote Mother Courage in exile in Sweden in 1939.', true, 'As the Second World War began.'],
    ['The play was first staged in Zurich in 1941.', true, 'In neutral Switzerland.'],
    ['The play is set during the Thirty Years\' War.', true, 'From 1624 to 1636.'],
    ['Mother Courage\'s children all survive the war.', false, 'All three die.'],
    ['Kattrin warns the town of Halle by beating a drum.', true, 'She cannot speak.'],
    ['Brecht wanted audiences to lose themselves completely in the story.', false, 'He wanted them to think and judge.'],
    ['Helene Weigel played Mother Courage at the Berliner Ensemble.', true, 'She was Brecht\'s wife.'],
    ['At the end, Courage gives up her wagon and goes home.', false, 'She pulls it alone after the army.']
  ],
  items: [
    { q: 'How does Mother Courage earn her living?', r: 'Selling goods to soldiers from a wagon', w: ['As a general', 'As a farmer', 'As a teacher'], why: 'She follows the armies.' },
    { q: 'What virtue leads Swiss Cheese to his death?', r: 'Honesty', w: ['Bravery', 'Cleverness', 'Greed'], why: 'He hides the regiment\'s cash box.' },
    { q: 'Why does Brecht put up signs before the scenes?', r: 'So the audience watches how and why things happen, not just what', w: ['Because the actors forgot lines', 'To sell tickets', 'To translate the play'], why: 'Part of epic theater.' },
    { q: 'How did Courage get her nickname, the play says?', r: 'By driving through a bombardment to sell her bread before it spoiled', w: ['By rescuing a king', 'By fighting in a battle', 'By crossing a frozen sea'], why: 'Courage for business\' sake.' },
    { q: 'What happens to Eilif?', r: 'He is executed in peacetime for a deed he was praised for in war', w: ['He becomes a general', 'He marries Kattrin', 'He runs the wagon'], why: 'War\'s virtues become crimes in peace.' },
    { q: 'Which ancient Greek play also shows war through the women it leaves behind?', r: 'Euripides\' Trojan Women', w: ['Aristophanes\' Clouds', 'Plato\'s Meno', 'Homer\'s Odyssey'], why: 'On this ladder\'s Greek rungs.' }
  ]
};
function famWar(R, lv) {
  var a = R.pick([[1624, 'the play begins'], [1631, 'the scene at Magdeburg'], [1632, 'the scene at Ingolstadt'], [1636, 'the play ends']]);
  if (R.coin()) return H.num('The Thirty Years\' War began in 1618. How many years had it been going on when ' + a[1] + ' (' + a[0] + ')?', a[0] - 1618, [a[0] + ' − 1618 = ' + (a[0] - 1618) + ' years.'], { hint: 'Subtract the start year.' });
  return H.num('The war ended in 1648. How many years were left to go when ' + a[1] + ' (' + a[0] + ')?', 1648 - a[0], ['1648 − ' + a[0] + ' = ' + (1648 - a[0]) + ' years.'], { hint: 'Subtract from the end year.' });
}
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(ROAD, 'the wagon\'s road', 'place', R, lv); },
  function (R, lv) { return H.k20.pairs(KIDS, function (a) { return 'Which virtue puts <b>' + a + '</b> in danger?'; }, function (b) { return 'Which of Courage\'s children is undone by <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); },
  famWar
].concat(H.k20.dates(ID)), 0.6);
