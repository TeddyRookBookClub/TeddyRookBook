/* Shaw, Saint Joan (gbx3). Families: the scenes in order, places, who's who, who said what, Joan's real dates, dates. Uses H.k20. */
var ID = 'gb20.shaw-saint-joan';
var SC = ['Vaucouleurs: Joan wins over Robert de Baudricourt', 'Chinon: she finds the Dauphin', 'Orléans: the wind changes', 'a tent: her enemies plot', 'Reims: the coronation', 'Rouen: the trial', 'the Epilogue: a dream in 1456'];
var JOAN = ['born in Domrémy (about 1412)', 'raises the siege of Orléans (1429)', 'Charles crowned at Reims (1429)', 'captured at Compiègne (1430)', 'tried and executed at Rouen (1431)', 'cleared by a second trial (1456)', 'declared a saint (1920)'];
var WHO = [['Robert de Baudricourt', 'the squire at Vaucouleurs whose hens start laying again'], ['the Dauphin Charles', 'the timid prince Joan helps to the throne'], ['Dunois', 'the commander waiting for the wind at Orléans'], ['Bishop Cauchon', 'the judge who sincerely fears Joan\'s defiance of the Church'], ['the Earl of Warwick', 'the English lord who sees Joan as a political danger'], ['the Inquisitor', 'who argues at the trial that heresy begins with sincere people']];
var SAID = [
  ['She is the queerest fish among the eccentric worthies of the Middle Ages.', 'Shaw', 'The Preface.'],
  ['My voices come from God.', 'Joan', 'Our summary of her steady claim.'],
  ['If she trusts her own judgment above the Church, there will be chaos.', 'Bishop Cauchon', 'Our summary of his fear at the trial.'],
  ['Her idea of France as a nation will undermine the power of the lords.', 'the Earl of Warwick', 'Our summary.'],
  ['There are no villains in this play.', 'Shaw', 'Our summary of his own view of the play.']
];
var B = {
  facts: [
    ['Shaw was born in Dublin.', true, 'In 1856; he moved to London at twenty.'],
    ['Saint Joan was first staged in New York in 1923.', true, 'By the Theatre Guild.'],
    ['Joan of Arc was declared a saint in 1920.', true, 'Three years before Shaw wrote the play.'],
    ['Shaw shows the judges at the trial as cartoon villains.', false, 'He gives them serious arguments.'],
    ['In the Epilogue, everyone begs Joan to come back to life.', false, 'They all make excuses when she offers.'],
    ['Shaw won the Nobel Prize in Literature for 1925.', true, 'Saint Joan helped make his name.'],
    ['Joan raised the siege of Orléans in 1429.', true, 'When she was about seventeen.'],
    ['Joan was a noblewoman who had studied warfare.', false, 'She was a farmer\'s daughter who could not read.']
  ],
  items: [
    { q: 'What sign convinces Robert de Baudricourt in Scene I?', r: 'His hens start laying again', w: ['A comet', 'A letter from the king', 'A dream'], why: 'A comic touch to open the play.' },
    { q: 'What happens to the wind at Orléans?', r: 'It changes, so the boats can cross', w: ['It blows down the walls', 'It stops completely', 'It brings snow'], why: 'Dunois takes it as a sign.' },
    { q: 'What did Shaw think Joan stood for in history?', r: 'Individual conscience and the idea of the nation', w: ['Kings and empires', 'Science and machines', 'Trade and money'], why: 'He loosely calls them Protestantism and nationalism.' },
    { q: 'Why is the trial scene unusual?', r: 'Shaw makes the judges sincere and reasonable', w: ['It is sung as an opera', 'It has no words', 'Joan is found innocent'], why: 'The tragedy is that everyone acts in good faith.' },
    { q: 'What is the Epilogue about?', r: 'Joan returns in a dream; all praise her but no one wants her back', w: ['Joan\'s childhood', 'The war\'s last battle', 'Shaw\'s own life'], why: 'Set in 1456, with a visitor from 1920.' },
    { q: 'Which earlier play showed Joan from the English side, as a witch?', r: 'Shakespeare\'s Henry VI, Part 1', w: ['Hamlet', 'Macbeth', 'The Tempest'], why: 'Shaw answers it.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(SC, 'the scenes of Saint Joan', 'scene', R, lv); },
  function (R, lv) { return H.k20.seq(JOAN, 'the real Joan\'s life and afterlife', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Saint Joan, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
