/* Beckett, Waiting for Godot (gbx3). No quotations (under copyright). Families: events of each act in order, what changes between
   the acts, who's who, Beckett's life in order, who said what (our summaries), dates. Uses H.k20. */
var ID = 'gb20.beckett-waiting-for-godot';
var ACT1 = ['Estragon struggles with his boot', 'Vladimir wonders about the two thieves', 'Pozzo arrives driving Lucky', 'Lucky is made to "think" aloud', 'a boy says Godot will come tomorrow', 'the moon rises; they agree to go but stay'];
var CHANGE = [['the tree', 'bare in Act I, with a few leaves in Act II'], ['Pozzo', 'grand in Act I, blind in Act II'], ['Lucky', 'speaks a torrent in Act I, mute in Act II'], ['the boy', 'brings the same message, and does not recognize them'], ['Estragon', 'remembers little of the day before']];
var LIFE = ['born near Dublin (1906)', 'assists James Joyce in Paris (late 1920s)', 'works for the French Resistance (World War II)', 'En attendant Godot published (1952)', 'his English version (1954)', 'Nobel Prize in Literature (1969)'];
var WHO = [['Vladimir', 'the friend who remembers and worries'], ['Estragon', 'the friend who forgets and wants to leave'], ['Pozzo', 'the pompous traveler with a servant on a rope'], ['Lucky', 'the servant made to "think" aloud'], ['Godot', 'the one they wait for, who never comes']];
var SAID = [
  ['Mr. Godot won\'t come this evening, but surely tomorrow.', 'the boy', 'Our summary of his message.'],
  ['Let\'s go. (They do not move.)', 'Vladimir and Estragon', 'Our summary of the end of each act.'],
  ['People fill their time with diversions so as not to think about their condition.', 'Pascal', 'Our summary of the Pensées.'],
  ['If I knew who Godot was, I would have put it in the play.', 'Samuel Beckett', 'Our summary of what he told those who asked.']
];
var B = {
  facts: [
    ['Beckett wrote Waiting for Godot first in French.', true, 'En attendant Godot, 1952.'],
    ['The play was first staged in Paris in 1953.', true, 'In January 1953.'],
    ['Godot arrives at the end of Act II.', false, 'He never comes.'],
    ['The play has two acts.', true, 'Two evenings that nearly repeat.'],
    ['In Act II the tree has a few leaves.', true, 'The only sign of passing time.'],
    ['Beckett won the Nobel Prize in Literature in 1969.', true, 'He was Irish and lived in France.'],
    ['Beckett explained exactly who Godot is.', false, 'He refused to.'],
    ['Pozzo is blind when he returns in Act II.', true, 'And Lucky can no longer speak.']
  ],
  items: [
    { q: 'What are Vladimir and Estragon doing for the whole play?', r: 'Waiting for Godot', w: ['Looking for a lost dog', 'Building a house', 'Traveling to Paris'], why: 'By a tree on a country road.' },
    { q: 'What message does the boy bring?', r: 'Godot will not come today, but surely tomorrow', w: ['Godot is here', 'Godot has died', 'Godot is angry'], why: 'The same in both acts.' },
    { q: 'How does each act end?', r: 'They agree to leave and do not move', w: ['They leave together', 'Godot arrives', 'They quarrel and part forever'], why: 'Words and actions don\'t match.' },
    { q: 'What group of plays was Waiting for Godot later grouped with?', r: 'The Theatre of the Absurd', w: ['Greek tragedy', 'Musical comedy', 'Medieval mystery plays'], why: 'A critic\'s name for such plays.' },
    { q: 'Which earlier writer on this ladder described people filling time with diversions?', r: 'Pascal', w: ['Euclid', 'Lavoisier', 'Adam Smith'], why: 'In the Pensées.' },
    { q: 'Whom did Beckett assist as a young man in Paris?', r: 'James Joyce', w: ['T. S. Eliot', 'Marcel Proust', 'Bertolt Brecht'], why: 'Joyce is also on this ladder.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(ACT1, 'Act I', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(CHANGE, function (a) { return 'Between the two acts, what changes about <b>' + a + '</b>?'; }, function (b) { return 'Who or what is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.seq(LIFE, 'Beckett\'s life', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Waiting for Godot, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
