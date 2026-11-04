/* Dostoevsky, The Brothers Karamazov (gbw4). Families: the brothers and others, the parts in order, the great chapters, who said what,
   dates. Uses H.k19. Religious ideas are given as the characters' and the author's own. */
var ID = 'gb19.dostoevsky-brothers-karamazov';
var WHOIS = [['Fyodor Karamazov', 'the greedy, mocking father, whose murder is the novel\'s mystery'], ['Dmitri', 'the passionate eldest son, accused of the murder'], ['Ivan', 'the brilliant, doubting intellectual'], ['Alyosha', 'the gentle youngest brother, a novice at the monastery'], ['Smerdyakov', 'the servant, rumored to be Fyodor\'s son'], ['Father Zosima', 'the wise elder who teaches responsibility for all'], ['Grushenka', 'the proud young woman Dmitri loves'], ['Ilyusha', 'a sick schoolboy whom Alyosha befriends']];
var CH = [['"Rebellion"', 'Ivan explains why he cannot accept a world with so much suffering'], ['"The Grand Inquisitor"', 'Ivan\'s story of Christ returning to Spain and being questioned by a cardinal'], ['the life and sayings of Zosima', 'the elder\'s teachings on love and responsibility'], ['the trial', 'Dmitri is judged for his father\'s murder'], ['the Epilogue', 'Alyosha speaks to the boys at Ilyusha\'s stone']];
var ORDER = ['The family meets at Zosima\'s monastery cell', 'Ivan tells Alyosha "The Grand Inquisitor"', 'Zosima dies', 'Fyodor is murdered', 'Dmitri is arrested', 'Ivan\'s last talk with Smerdyakov', 'The trial', 'Alyosha\'s speech at the stone'];
var WHO = [
  ['Love all God\'s creation, the whole and every grain of sand in it.', 'Father Zosima', 'Book VI, in Garnett\'s translation.'],
  ['It\'s not God that I don\'t accept, only I most respectfully return Him the ticket.', 'Ivan', 'Book V, "Rebellion."'],
  ['Let us never forget how good it was once here, when we were all together.', 'Alyosha', 'The Epilogue.'],
  ['People cannot bear freedom; give them bread and miracles, and they will follow you.', 'the Grand Inquisitor', 'Our summary of Ivan\'s story.'],
  ['Each of us is responsible to all, for all.', 'Father Zosima', 'Our summary of his teaching.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['The Brothers Karamazov came out as a magazine serial in 1879 and 1880.', true, 'In The Russian Messenger.'],
    ['Dostoevsky died a few months after finishing it.', true, 'In January 1881.'],
    ['Dmitri is found innocent at his trial.', false, 'He is convicted, though the reader knows more than the jury.'],
    ['"The Grand Inquisitor" is a story Ivan tells Alyosha.', true, 'Book V.'],
    ['Constance Garnett\'s English translation appeared in 1912.', true, 'London, Heinemann.'],
    ['Dostoevsky was once sentenced to death and reprieved at the last moment.', true, 'In 1849; he served four years at hard labor in Siberia instead.'],
    ['Alyosha leaves the monastery because Zosima tells him to live in the world.', true, 'Zosima sends him out.'],
    ['The novel argues that faith and doubt are easy questions.', false, 'It gives doubt its strongest voice, in Ivan, and answers through lives more than arguments.']
  ],
  items: [
    { q: 'Why does Ivan "return the ticket"?', r: 'He cannot accept a world that includes the suffering of innocent children', w: ['He does not like trains', 'He wants to travel', 'He has lost his money'], why: 'Book V, "Rebellion."' },
    { q: 'What does the Grand Inquisitor accuse Christ of?', r: 'Giving people a freedom too heavy for them to bear', w: ['Stealing bread', 'Breaking the law of Spain', 'Not knowing Latin'], why: 'Christ answers with silence and a kiss.' },
    { q: 'How does Christ answer the Inquisitor in Ivan\'s story?', r: 'With silence, and a kiss', w: ['With a long speech', 'With anger', 'He never appears'], why: 'Alyosha then kisses Ivan.' },
    { q: 'What does Zosima teach?', r: 'Active love and responsibility for one another', w: ['That nothing matters', 'That money is all', 'That one should never speak'], why: 'Book VI.' },
    { q: 'Who does the narrator call the hero of the novel?', r: 'Alyosha', w: ['Dmitri', 'Ivan', 'Fyodor'], why: 'In the author\'s preface.' },
    { q: 'How does the novel end?', r: 'Alyosha asks the schoolboys always to remember their friend Ilyusha and their kindness', w: ['With a wedding', 'With Ivan\'s escape', 'With the murderer\'s confession in court'], why: 'The Epilogue.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(WHOIS, function (a) { return 'Who is <b>' + a + '</b> in The Brothers Karamazov?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(CH, function (a) { return 'What happens in <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.seq(ORDER, 'the story of The Brothers Karamazov', 'event', R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
