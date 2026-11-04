/* Huizinga, The Waning of the Middle Ages (gbx1). Families: the canonical hours in order, the three paths to a better
   life, terms, Huizinga's claims, his critics, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.huizinga-waning-of-the-middle-ages';
var HOURS = ['Matins', 'Lauds', 'Prime', 'Terce', 'Sext', 'None', 'Vespers', 'Compline'];
var PATHS = [['turning away from the world toward God', 'the path of renouncing the world'], ['working to improve the world as it is', 'the path of reform'], ['living as if life were an ideal story, as in chivalry', 'the path of the dream']];
var CLAIMS = [['the outlines of life in that age', 'more sharply marked than today, with strong contrasts'], ['the sound that rose above daily life', 'the bells'], ['the art of Jan van Eyck', 'the ripe end of the Middle Ages, not the start of the Renaissance'], ['chivalry', 'a beautiful ideal that nobles acted out in tournaments and vows'], ['religious thought of the time', 'crowded with images and symbols'], ['the main region he studied', 'France and the Low Countries, around the court of Burgundy']];
var CRIT = [['draws mostly on court chronicles, poems and paintings for the elite', 'a criticism: it says little about peasants and townspeople'], ['brings a whole age to life through feelings and ceremonies', 'a strength: a model of cultural history'], ['calls the age a decline', 'disputed: the same centuries saw growth in trade, cities and learning'], ['pictures people as swinging between extreme emotions', 'now seen as overdrawn']];
var WHO = [
  ['The late Middle Ages in the North was an autumn, not the spring of a new age.', 'Johan Huizinga', 'The Waning of the Middle Ages (our summary).'],
  ['The Italian Renaissance gave birth to the modern individual.', 'Jacob Burckhardt', 'The Civilization of the Renaissance in Italy, 1860.'],
  ['Rome fell through a long decline over centuries.', 'Edward Gibbon', 'The Decline and Fall of the Roman Empire (our summary).'],
  ['Play is older than culture and runs all through it.', 'Johan Huizinga', 'Homo Ludens, 1938 (our summary).'],
  ['A company of pilgrims tells tales on the road to Canterbury.', 'Geoffrey Chaucer', 'The Canterbury Tales.']
];
var B = {
  facts: [
    ['Huizinga was a Dutch historian.', true, 'He taught at Groningen and Leiden.'],
    ['The book first appeared in Dutch in 1919.', true, 'Hopman\'s English version came in 1924.'],
    ['Huizinga saw Jan van Eyck as the first painter of the Italian Renaissance.', false, 'He saw him as the ripe end of the northern Middle Ages.'],
    ['Huizinga drew mainly on records of peasants\' daily work.', false, 'Mostly on court chronicles, poems and art.'],
    ['Huizinga also wrote Homo Ludens, about play.', true, '1938.'],
    ['Huizinga was held hostage during the German occupation.', true, 'He died in February 1945.']
  ],
  items: [
    { q: 'Why did Huizinga call the period an "autumn"?', r: 'He saw it as a ripe, overflowing ending, not a new beginning', w: ['It was always cold', 'Harvests failed', 'It was written in the fall'], why: 'Waning or autumn, not spring.' },
    { q: 'Which ideal did nobles act out in tournaments and vows?', r: 'Chivalry', w: ['Democracy', 'Thrift', 'Science'], why: 'The "dream of a better life."' },
    { q: 'What sound did Huizinga say rose above daily life?', r: 'The sound of bells', w: ['Trumpets', 'Thunder', 'Factory whistles'], why: 'Chapter I.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(HOURS, 'the canonical hours rung by church bells', 'hour', R, lv); },
  function (R, lv) { return H.k20.pairs(PATHS, function (a) { return 'Huizinga\'s three paths to a better life: which is <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(CLAIMS, function (a) { return 'What does Huizinga say about <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(CRIT, function (a) { return 'How have historians judged this feature of the book: it <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
