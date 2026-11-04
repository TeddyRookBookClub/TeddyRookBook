/* Conrad, Heart of Darkness (gbx3). Families: the journey in order, who's who, who said what, key terms, dates. Uses H.k20 (defined in the Freud rung). */
var ID = 'gb20.conrad-heart-of-darkness';
var TRIP = ['the yacht Nellie on the Thames', 'the Company\'s office in a European city', 'the voyage down the coast', 'the Company\'s (Outer) Station', 'the Central Station', 'the trip up the river', 'the Inner Station', 'the visit to Kurtz\'s fiancée'];
var WHO = [['Marlow', 'the sailor who tells the story'], ['Kurtz', 'the famous ivory agent Marlow goes to find'], ['the manager', 'the jealous head of the Central Station'], ['the Intended', 'the woman Kurtz was engaged to'], ['the frame narrator', 'the unnamed listener on the Nellie who passes the story on'], ['the accountant', 'the neatly dressed clerk who first tells Marlow about Kurtz']];
var SAID = [
  ['This also has been one of the dark places of the earth.', 'Marlow', 'His first words, about the Thames in Roman times.'],
  ['The horror! The horror!', 'Kurtz', 'His last words.'],
  ['We live, as we dream, alone.', 'Marlow', 'He thinks no one can fully share what he lived through.'],
  ['The book shows Africa only as a backdrop and gives its people no voice.', 'Chinua Achebe', 'His 1975 lecture "An Image of Africa" (our summary).'],
  ['I want to see the man who sends back more ivory than anyone.', 'Marlow', 'Our summary of his growing curiosity about Kurtz.']
];
var B = {
  facts: [
    ['Joseph Conrad learned English as an adult.', true, 'It was his third language, after Polish and French.'],
    ['Conrad himself worked on a Congo River steamer in 1890.', true, 'The trip gave him the material for the book.'],
    ['Heart of Darkness first appeared as a magazine serial in 1899.', true, 'In Blackwood\'s Magazine; as a book in 1902.'],
    ['The story is told by Kurtz.', false, 'It is told by Marlow, passed on by a listener on the Nellie.'],
    ['The Company is after ivory.', true, 'Ivory is what everyone in the story wants.'],
    ['Marlow tells Kurtz\'s fiancée the exact truth about his last words.', false, 'He tells her a kind lie: that Kurtz spoke her name.'],
    ['The Congo was then a colony ruled personally by King Leopold II of Belgium.', true, 'Reformers exposed its abuses in the early 1900s.'],
    ['Chinua Achebe praised the book without reservation.', false, 'He criticized it for denying its African people a voice.']
  ],
  items: [
    { q: 'Where is Marlow when he tells his story?', r: 'On a yacht on the River Thames', w: ['In a London club', 'In the Congo', 'In a lighthouse'], why: 'The yacht Nellie, waiting for the tide.' },
    { q: 'Why does Marlow have to wait months at the Central Station?', r: 'His steamer has sunk and he needs rivets to repair it', w: ['He is sick in the hospital', 'He is waiting for winter', 'He has lost his map'], why: 'The waiting shows the Company\'s waste.' },
    { q: 'What does the title "darkness" mean, many readers think?', r: 'The evil that can grow in anyone, not just a dark place', w: ['Only the night', 'A storm at sea', 'A real cave'], why: 'Marlow even says London was once a dark place.' },
    { q: 'What is a frame story?', r: 'A story told inside another story', w: ['A story about pictures', 'A story with no ending', 'A poem in a frame'], why: 'Marlow\'s tale is inside the scene on the Nellie.' },
    { q: 'What has happened to Kurtz when Marlow finds him?', r: 'He has made himself a feared ruler, and he is dying', w: ['He has gone home rich', 'He has become a missionary', 'He has married'], why: 'His fine ideals have collapsed.' },
    { q: 'Which later novel answered Conrad from inside an African village?', r: 'Things Fall Apart, by Chinua Achebe', w: ['The Great Gatsby', 'Animal Farm', 'Moby-Dick'], why: 'Published in 1958.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(TRIP, 'Marlow\'s journey', 'stop', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Heart of Darkness, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
