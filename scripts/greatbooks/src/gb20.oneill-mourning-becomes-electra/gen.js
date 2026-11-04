/* O'Neill, Mourning Becomes Electra (gbx3). No quotations (first published 1931). Families: the three plays in order, Greek-to-American
   matching both ways, the Oresteia's plays, who argued what, dates. Uses H.k20. */
var ID = 'gb20.oneill-mourning-becomes-electra';
var PLAYS = ['Homecoming', 'The Hunted', 'The Haunted'];
var GREEK = ['Agamemnon', 'The Libation Bearers', 'The Eumenides'];
var MAP = [['Agamemnon', 'Ezra Mannon'], ['Clytemnestra', 'Christine Mannon'], ['Electra', 'Lavinia Mannon'], ['Orestes', 'Orin Mannon'], ['Aegisthus', 'Adam Brant'], ['the Trojan War', 'the American Civil War'], ['the palace at Argos', 'the Mannon house in New England']];
var PAIR = [['Homecoming', 'Agamemnon'], ['The Hunted', 'The Libation Bearers'], ['The Haunted', 'The Eumenides']];
var SAID = [
  ['A court and the gods\' mercy end the chain of revenge.', 'Aeschylus', 'The Eumenides (our summary).'],
  ['Hidden feelings in families shape our lives more than we know.', 'Freud', 'Our summary of ideas O\'Neill drew on.'],
  ['I will shut myself in with the dead and punish myself.', 'Lavinia', 'Our summary of the trilogy\'s end.'],
  ['Put a Greek tragedy in an American house, with psychology for the gods.', 'Eugene O\'Neill', 'Our summary of his plan.']
];
var B = {
  facts: [
    ['Mourning Becomes Electra opened in New York in 1931.', true, 'A trilogy running about six hours.'],
    ['It is modeled on Aeschylus\' Oresteia.', true, 'Play by play.'],
    ['The trilogy is set in ancient Greece.', false, 'In New England in 1865.'],
    ['O\'Neill won the Nobel Prize in Literature in 1936.', true, 'The only American playwright to win it.'],
    ['In O\'Neill\'s version, a court in Athens frees the hero.', false, 'There are no gods and no court.'],
    ['Lavinia is O\'Neill\'s Electra.', true, 'Ezra Mannon\'s daughter.'],
    ['O\'Neill won the Pulitzer Prize four times.', true, 'More than any other playwright.'],
    ['The trilogy ends with a wedding.', false, 'It ends with Lavinia shutting herself in the house.']
  ],
  items: [
    { q: 'What did O\'Neill put in place of the Greek gods and fate?', r: 'The inner forces of family psychology', w: ['Science fiction machines', 'Fairy godmothers', 'A Greek chorus of gods'], why: 'Jealousy, guilt and hidden longings.' },
    { q: 'Which war takes the place of the Trojan War?', r: 'The American Civil War', w: ['The War of 1812', 'The First World War', 'The Revolutionary War'], why: 'Ezra Mannon returns in 1865.' },
    { q: 'How does the trilogy end?', r: 'Lavinia shuts herself inside the house for life', w: ['Orin becomes a judge', 'The family moves to Greece', 'Everyone is forgiven'], why: 'The chain of revenge ends only in self-punishment.' },
    { q: 'What are the two meanings of "becomes" in the title?', r: '"Suits" and "turns into"', w: ['"Begins" and "ends"', '"Sells" and "buys"', '"Sleeps" and "wakes"'], why: 'Mourning suits Electra; Electra turns into mourning.' },
    { q: 'Why is there no quotation from the play in this lesson?', r: 'It was first published in 1931 and is still under copyright', w: ['It has no words', 'It was never published', 'It is in Greek'], why: 'We describe it in our own words.' },
    { q: 'What does the Mannon house look like?', r: 'A white-columned front like a Greek temple', w: ['A log cabin', 'A castle with towers', 'A city apartment'], why: 'A Greek tragedy in an American setting.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(PLAYS, 'the three plays of the trilogy', 'play', R, lv); },
  function (R, lv) { return H.k20.seq(GREEK, 'the three plays of the Oresteia', 'play', R, lv); },
  function (R, lv) { return H.k20.pairs(MAP, function (a) { return 'In Mourning Becomes Electra, what takes the place of <b>' + a + '</b>?'; }, function (b) { return 'Which part of the Oresteia does <b>' + b + '</b> stand for?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(PAIR, function (a) { return 'Which play of the Oresteia does O\'Neill\'s <b>' + a + '</b> follow?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
