/* Balzac, Cousin Bette (gbw4). Families: who is who, how they are related, the Human Comedy, who said what (our summaries), dates.
   Uses H.k19. Adult themes are summarized, never detailed. */
var ID = 'gb19.balzac-cousin-bette';
var WHOIS = [['Lisbeth Fischer (Cousin Bette)', 'the poor, envious cousin who plots the family\'s ruin'], ['Adeline Hulot', 'the patient, forgiving baroness, Bette\'s cousin'], ['Baron Hulot', 'Adeline\'s husband, whose weaknesses ruin the family'], ['Hortense', 'the Hulots\' daughter, who marries the sculptor'], ['Wenceslas Steinbock', 'the gifted, weak Polish sculptor whom Bette protected'], ['Valérie Marneffe', 'the schemer who, with Bette, takes the men\'s money'], ['Célestin Crevel', 'the vain, rich former perfumer']];
var REL = [['Bette and Adeline', 'cousins'], ['Adeline and Baron Hulot', 'husband and wife'], ['Hortense and Wenceslas', 'husband and wife'], ['Bette and Valérie', 'allies in scheming'], ['Victorin and Crevel', 'son-in-law and father-in-law']];
var WHO = [
  ['What can a poor relation do against a rich family? It is the earthen pot against the iron pot.', 'Bette', 'To Valérie, in Wormeley\'s translation.'],
  ['I will forgive, and keep the family together, whatever it costs me.', 'Adeline', 'Our summary of her part.'],
  ['The novelist is the secretary of society, recording its manners.', 'Balzac', 'Our summary of his foreword to the Human Comedy (1842).'],
  ['Money and envy, not grand passions, move most people in Paris.', 'Balzac', 'Our summary of the novel\'s view.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Cousin Bette first appeared as a newspaper serial in 1846.', true, 'Then as a book in 1847.'],
    ['It is part of Balzac\'s huge series of novels, the Human Comedy.', true, 'About ninety novels and stories.'],
    ['Cousin Bette is a fairy tale for children.', false, 'It is a novel about adult wrongdoing and ruin.'],
    ['Bette shows her envy openly from the first chapter.', false, 'She hides it behind devotion, which makes her dangerous.'],
    ['The novel is set in Paris in the 1830s and 1840s.', true, 'Under King Louis-Philippe.'],
    ['Balzac paired it with Cousin Pons as "Poor Relations."', true, 'Two novels about poor relatives.'],
    ['Katharine Prescott Wormeley translated it into English in 1888.', true, 'Roberts Brothers, Boston.'],
    ['Adeline answers every wrong with revenge.', false, 'She answers with patience and forgiveness.']
  ],
  items: [
    { q: 'Why does Bette envy her cousin Adeline?', r: 'As children Adeline was the pretty, petted one, and she married into wealth and rank', w: ['Adeline stole her money', 'Adeline was cruel to her', 'They never met'], why: 'Balzac traces the envy back to childhood.' },
    { q: 'What turns Bette\'s envy into open revenge?', r: 'Hortense marries Wenceslas, the young man Bette protected', w: ['She loses a card game', 'She is fired from a job', 'A letter is lost'], why: 'The family takes, she feels, the one thing she had.' },
    { q: 'What image does Balzac use for Bette\'s hidden envy?', r: 'A germ of the plague in a bale of wool, waiting to burst out', w: ['A rose in winter', 'A clock ticking', 'A bird in a cage'], why: 'In Wormeley\'s translation.' },
    { q: 'What is the "Human Comedy"?', r: 'Balzac\'s series of linked novels picturing French society', w: ['A play by Dante', 'A comic opera', 'A newspaper'], why: 'Characters reappear across books.' },
    { q: 'What does the novel show about money in Paris?', r: 'How debt, greed and appearances can ruin a family', w: ['That money never matters', 'That everyone is rich', 'That banks are always fair'], why: 'Balzac is famous for his detailed picture of money.' },
    { q: 'Who is the moral center of the novel?', r: 'Adeline, who keeps forgiving', w: ['Valérie', 'Crevel', 'Bette'], why: 'Balzac contrasts her goodness with the others\' vices.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in Cousin Bette?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(REL, function (a) { return 'In Cousin Bette, how are <b>' + a + '</b> related?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
