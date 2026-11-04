/* Tolstoy, War and Peace (gbw4). Families: the 1812 campaign in order, the families and characters, Tolstoy's theory of history,
   who said what, dates. Uses H.k19. */
var ID = 'gb19.tolstoy-war-and-peace';
var CAMP = ['crossing the Neman', 'Smolensk', 'Borodino', 'the French enter Moscow', 'Maloyaroslavets', 'the crossing of the Berezina'];
var EVENTS = ['Anna Pavlovna\'s party in St. Petersburg (1805)', 'the Battle of Austerlitz (1805)', 'Pierre\'s duel with Dolokhov', 'Natasha\'s first ball', 'Napoleon invades Russia (1812)', 'the Battle of Borodino', 'Moscow burns', 'Pierre and Natasha marry'];
var FAM = [['Pierre Bezukhov', 'the Bezukhovs: awkward heir to a vast fortune, searching for the meaning of life'], ['Prince Andrew', 'the Bolkonskys: proud, brave officer wounded at Austerlitz and Borodino'], ['Princess Mary', 'the Bolkonskys: Andrew\'s devout, gentle sister'], ['Natasha', 'the Rostovs: lively, warm-hearted daughter'], ['Nicholas', 'the Rostovs: Natasha\'s brother, a cavalry officer'], ['Platon Karataev', 'a peasant soldier whom Pierre meets as a prisoner'], ['Kutuzov', 'the old Russian commander who waits and lets events unfold']];
var WHO = [
  ['A king is history\'s slave.', 'Tolstoy, as narrator', 'Book IX, Chapter 1, in the Maudes\' translation.'],
  ['How was it I did not see that lofty sky before?', 'Prince Andrew', 'Lying wounded at Austerlitz.'],
  ['Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes.', 'Anna Pavlovna Scherer', 'The opening line.'],
  ['History is made by great men, whose passions carry the world forward.', 'Hegel', 'The kind of view Tolstoy argues against.'],
  ['Patience and time: those are my warriors.', 'Kutuzov', 'Our summary of his way of fighting.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['War and Peace was published from 1865 to 1869.', true, 'First in parts in a magazine, then in book form.'],
    ['The novel covers the years 1805 to 1820.', true, 'From Napoleon\'s early wars to an epilogue after them.'],
    ['Tolstoy fought in the 1812 war.', false, 'He was born in 1828; he served later, in the Crimean War.'],
    ['Many characters speak French in high society.', true, 'Russian nobles of the time often did; Tolstoy kept the French.'],
    ['Tolstoy believed Napoleon single-handedly decided the outcome of battles.', false, 'He argued that great men are carried along by history.'],
    ['The book ends with essays on history and free will.', true, 'The second part of the Epilogue.'],
    ['Louise and Aylmer Maude translated it into English in 1922 and 1923.', true, 'Friends of Tolstoy who knew him well.'],
    ['Pierre and Natasha marry in the end.', true, 'In the first Epilogue, 1820.']
  ],
  items: [
    { q: 'What does Prince Andrew notice as he lies wounded at Austerlitz?', r: 'The lofty, peaceful sky above him', w: ['Napoleon\'s horse', 'A letter from home', 'His lost sword'], why: 'It shows him how small his dreams of glory were.' },
    { q: 'What is Tolstoy\'s main claim about history?', r: 'Great events come from the choices of millions, not from the orders of a few great men', w: ['Only kings make history', 'History repeats every 100 years', 'Nothing in history has causes'], why: 'He argues it in the narration and the Epilogue.' },
    { q: 'What does Pierre learn from Platon Karataev?', r: 'Simple, patient acceptance of life and love of others', w: ['How to fight a duel', 'How to win at cards', 'How to speak French'], why: 'In captivity, Book XII onward.' },
    { q: 'Why did the French army retreat from Moscow?', r: 'The city burned and emptied; with winter coming and supplies short, the army could not stay', w: ['Napoleon was captured', 'The French won and went home', 'A peace treaty was signed in Moscow'], why: 'A long, deadly retreat followed.' },
    { q: 'What do the Rostovs do with their carts when they leave Moscow?', r: 'They give them to wounded soldiers, at Natasha\'s urging', w: ['They sell them', 'They burn them', 'They hide them'], why: 'Book XI.' },
    { q: 'What kind of general is Kutuzov in the novel?', r: 'Patient and wise, letting events unfold rather than forcing them', w: ['Rash and showy', 'Cruel and vain', 'Absent from the war'], why: 'Tolstoy contrasts him with Napoleon.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(CAMP, 'the 1812 campaign', 'event', R, lv); },
  function (R, lv) { return H.k19.seq(EVENTS, 'the events of War and Peace', 'event', R, lv); },
  function (R, lv) { return H.k19.pairs(FAM, function (a) { return 'Who is <b>' + a + '</b> in War and Peace?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
