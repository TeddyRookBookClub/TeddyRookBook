/* Proust, Swann in Love (gbx3). Families: the parts of Swann's Way in order, who's who, who said what, the volumes, dates. Uses H.k20. */
var ID = 'gb20.proust-swann-in-love';
var PARTS = ['Overture (waking in the night)', 'Combray (childhood and the madeleine)', 'Swann in Love', 'Place-Names: The Name'];
var STORY = ['Swann meets Odette', 'he hears the little phrase at the Verdurins\'', 'he sees a Botticelli in her face', 'jealousy takes hold', 'the Verdurins shut him out', 'his love wears out'];
var WHO = [['Charles Swann', 'a cultivated man who falls in love against his taste'], ['Odette de Crécy', 'the woman Swann imagines into a work of art'], ['the Verdurins', 'hosts of the salon called the little clan'], ['Vinteuil', 'the composer of the sonata with the little phrase'], ['Forcheville', 'the count whom Swann sees as a rival'], ['Marcel', 'the narrator, who was not yet born when Swann was in love']];
var SAID = [
  ['For a long time I used to go to bed early.', 'the narrator', 'The first line of Swann\'s Way.'],
  ['I wasted years on a woman who was not even my type.', 'Swann', 'Our summary of the last thought of Swann in Love.'],
  ['Lived time is not the same as clock time.', 'Bergson', 'Our summary of the philosopher Proust knew.'],
  ['Our salon is a little clan, and those who are not with us are against us.', 'the Verdurins', 'Our summary.']
];
var B = {
  facts: [
    ['In Search of Lost Time has seven volumes.', true, 'Published 1913 to 1927.'],
    ['Swann\'s Way was first published in 1913.', true, 'The first volume.'],
    ['C. K. Scott Moncrieff\'s English translation of Swann\'s Way appeared in 1922.', true, 'He called the whole work Remembrance of Things Past.'],
    ['Swann in Love is told as events that happened before the narrator was born.', true, 'It is a flashback inside the novel.'],
    ['Swann falls in love with Odette at first sight because she is just his type.', false, 'At first she isn\'t his type at all.'],
    ['A tune from a violin sonata becomes the theme of Swann\'s love.', true, 'Vinteuil\'s "little phrase."'],
    ['In the madeleine scene, a taste brings back a whole childhood.', true, 'Memory comes back by surprise.'],
    ['Proust finished every volume before he died.', false, 'The last volumes were published after his death in 1922.']
  ],
  items: [
    { q: 'What brings back the narrator\'s childhood in the famous scene?', r: 'The taste of a madeleine dipped in tea', w: ['A photograph', 'An old letter', 'A visit to Combray'], why: 'Involuntary memory: it comes by surprise.' },
    { q: 'How does Swann turn Odette into someone he can love?', r: 'He links her with music and a painting he loves', w: ['He reads her diary', 'He buys her a house', 'He paints her portrait'], why: 'Vinteuil\'s phrase and Botticelli.' },
    { q: 'What keeps Swann\'s love alive the longest?', r: 'Jealousy', w: ['Shared work', 'Letters', 'Travel'], why: 'He suffers over every rumor.' },
    { q: 'Who are the Verdurins?', r: 'Hosts of a salon who first welcome Swann, then shut him out', w: ['Odette\'s parents', 'Swann\'s servants', 'The narrator\'s grandparents'], why: 'Their "little clan."' },
    { q: 'What is Proust\'s great subject?', r: 'Time and memory', w: ['War and peace', 'Sea voyages', 'Courtroom trials'], why: 'In Search of Lost Time.' },
    { q: 'Which philosopher, a relative by marriage, wrote about lived time?', r: 'Henri Bergson', w: ['Immanuel Kant', 'John Locke', 'Thomas Hobbes'], why: 'Bergson married a cousin of Proust.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(PARTS, 'the parts of Swann\'s Way', 'part', R, lv); },
  function (R, lv) { return H.k20.seq(STORY, 'Swann in Love', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(WHO, function (a) { return 'In Swann\'s Way, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
