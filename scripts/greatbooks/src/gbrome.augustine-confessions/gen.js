/* gbrome.augustine-confessions (gbe3): his life in order, places, people, which book, time and memory, terms, dates. */
function seqF(evs, what) { return function (R, lv) {
  var k = Math.min(evs.length, lv === 1 ? 3 : 4), idx = R.sample(evs.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
  var ord = idx.map(function (i) { return evs[i]; }), right = ord.join(' → '), w = [];
  for (var t = 0; t < 20 && w.length < 3; t++) { var s = R.shuffle(ord.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Put these ' + what + ' in order, <b>first to last</b>.', right, w, ord.map(function (e, j) { return (j + 1) + '. ' + e; }), { hint: 'Find the one that must come first, then work forward.' });
}; }
function termF(T, ctx) { return function (R, lv) {
  var t = R.pick(T), others = T.filter(function (x) { return x !== t; }), k = lv === 1 ? 2 : 3;
  if (R.next() < 0.5) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, k).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which word or name means <i>' + t[1] + '</i>?', t[0], H.samp(R, others, k).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}; }
function whoF(P, pre) { return function (R, lv) {
  var p = R.pick(P), names = H.uniq(P.map(function (x) { return x[0]; }).filter(function (x) { return x !== p[0]; }));
  return H.mc(pre + ' ' + p[1] + '?', p[0], H.samp(R, names, lv === 1 ? 2 : 3), [p[0] + ' ' + (p[2] || p[1]) + '.']);
}; }
function bookF(B, work, unit) { unit = unit || 'book'; return function (R, lv) {
  var b = R.pick(B), all = H.uniq(B.map(function (x) { return x[0]; }));
  if (lv === 1) return H.mc('In which ' + unit + ' of ' + work + ' ' + b[1] + '?', unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0], H.samp(R, all.filter(function (x) { return x !== b[0]; }), 2).map(function (x) { return unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + x; }), [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
  return H.num('In which ' + unit + ' of ' + work + ' ' + b[1] + '? Give the number.', b[0], [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
}; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.augustine-confessions';
var EV = ['Born at Thagaste (AD 354)', 'Steals pears with friends at sixteen', 'Reads Cicero’s Hortensius at Carthage', 'Leaves the Manichees and goes to Rome (AD 383)', 'Professor of rhetoric in Milan; hears Ambrose (AD 384)', '“Take up and read” in a garden (AD 386)', 'Baptized by Ambrose (AD 387)', 'Monica dies at Ostia (AD 387)', 'Becomes bishop of Hippo (about AD 395)', 'Writes the Confessions (about AD 397–400)'];
var WHO = [['Monica', 'was Augustine’s mother, who prayed for him for years', 'died at Ostia in AD 387'], ['Ambrose', 'was the bishop of Milan whose sermons moved Augustine, and who baptized him', 'was noticed reading silently'], ['Alypius', 'was the friend with Augustine in the garden in Milan', 'was baptized with him'], ['Adeodatus', 'was Augustine’s son', 'his name means “given by God”'], ['Cicero', 'wrote the Hortensius, which made Augustine love wisdom', 'was the great Roman orator'], ['Patricius', 'was Augustine’s father, baptized near the end of his life', 'was a town councilor of Thagaste'], ['Virgil', 'wrote the poem whose Dido made the schoolboy Augustine weep', 'wrote the Aeneid']];
var BK = [[1, 'does Augustine write “our heart is restless, until it repose in Thee”', 'childhood, and the famous first chapter'], [2, 'does he tell of stealing pears', 'age sixteen'], [8, 'does he hear the voice saying “Take up and read”', 'the garden in Milan'], [9, 'does his mother Monica die', 'at Ostia'], [10, 'does he write about memory', 'memory and the present'], [11, 'does he ask “What then is time?”', 'time and eternity']];
var PL = [['Thagaste', 'his home town in Roman Africa'], ['Carthage', 'the great city where he studied and taught'], ['Milan', 'the city where he heard Ambrose and was baptized'], ['Ostia', 'Rome’s port, where Monica died'], ['Hippo Regius', 'the port city where he became bishop']];
function famPlace(R, lv) {
  var p = R.pick(PL), others = PL.filter(function (x) { return x !== p; });
  return H.mc('In the Confessions, which place is <i>' + p[1] + '</i>?', p[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }).concat(lv === 3 ? ['Athens'] : []).slice(0, lv === 1 ? 2 : 3), [p[0] + ': ' + p[1] + '.']);
}
function famTime(R, lv) {
  var T = [['the past', 'memory'], ['the present', 'attention'], ['the future', 'expectation']], t = R.pick(T);
  return H.mc('Augustine says we measure time in the mind. Which power of the mind holds <b>' + t[0] + '</b>?', t[1], T.filter(function (x) { return x !== t; }).map(function (x) { return x[1]; }).concat(lv > 1 ? ['imagination'] : []), ['Memory holds the past, attention the present, expectation the future (Book XI).']);
}
function famAge(R, lv) {
  var D = [[386, 'heard “Take up and read”'], [387, 'was baptized'], [397, 'began the Confessions'], [391, 'was made a priest at Hippo'], [430, 'died at Hippo']], d = R.pick(D);
  return H.num('Augustine was born in AD 354. He ' + d[1] + ' in AD ' + d[0] + '. How many years apart are those dates?', d[0] - 354, [d[0] + ' − 354 = ' + (d[0] - 354) + '.']);
}
var TERMS = [['confessio', 'Latin: both confessing faults and praising God'], ['tolle, lege', '“take up and read”'], ['Manichees', 'a religious sect Augustine followed for nine years'], ['rhetoric', 'the art of public speaking, which Augustine taught'], ['distentio animi', 'a “stretching” of the mind: Augustine’s account of time'], ['the Platonists', 'philosophers whose books helped Augustine think of God as spiritual'], ['conversion', 'a turning of one’s life toward a new faith']];
var B = {
  facts: [
    ['The Confessions is written as a prayer to God.', true, 'From the first line to the last.'],
    ['Augustine stole the pears because he was hungry.', false, 'He was not; they threw most of them away. That is his puzzle.'],
    ['Augustine’s mother Monica was a Christian.', true, 'She prayed for him for many years.'],
    ['Augustine was baptized by Ambrose in Milan.', true, 'At Easter, AD 387.'],
    ['Augustine became a Christian as a small child and never doubted.', false, 'He searched for years, through the Manichees and philosophy.'],
    ['Augustine was surprised to see Ambrose reading silently.', true, 'Most people then read aloud.'],
    ['The Confessions tells only the story of Augustine’s life.', false, 'The last four books are about memory, time and creation.'],
    ['Augustine says he knows what time is until someone asks him to explain it.', true, 'Book XI, chapter 14.'],
    ['Cicero’s Hortensius made the young Augustine love wisdom.', true, 'He read it at nineteen.'],
    ['Augustine wrote the Confessions as an old man just before he died.', false, 'Around AD 397–400, in his forties; he died in 430.'],
    ['Augustine was born in Rome.', false, 'In Thagaste, in Roman Africa.']
  ],
  items: [
    { q: 'What does “our heart is restless, until it repose in Thee” say about the whole book?', r: 'It is the story of a restless search that, Augustine believes, finds rest in God', w: ['It is about getting enough sleep', 'It is a complaint about Rome', 'It is a rule for monks'], why: 'Book I, chapter 1.' },
    { q: 'Why does the pear theft trouble Augustine so much?', r: 'He did it for no reason but that it was wrong', w: ['He was caught and punished', 'The pears were poisoned', 'He stole them from his mother'], why: 'Book II.' },
    { q: 'What did Augustine do when he heard “Take up and read”?', r: 'He opened Paul’s letters and read the first passage his eyes fell on', w: ['He went to buy a new book', 'He read Virgil', 'He ignored it'], why: 'Book VIII, chapter 12: Romans 13.' },
    { q: 'How does Augustine solve the puzzle of measuring time?', r: 'We measure it in the mind, through memory, attention and expectation', w: ['With a water clock', 'By counting the stars', 'He says time does not exist at all'], why: 'Book XI.' },
    { q: 'Why is the Confessions often called the first great Western autobiography?', r: 'It examines the writer’s own inner life with candor', w: ['It was the first book in Latin', 'It lists every event of his life', 'It was written by a king'], why: 'An inner search, not just a record of events.' },
    { q: 'What did the books of the Platonists help Augustine to see?', r: 'That God is spiritual and that evil is a lack of good', w: ['That the earth goes round the sun', 'That Rome would fall', 'How to win lawsuits'], why: 'Book VII.' }
  ]
};
H.T(ID, B, [seqF(EV, 'events of Augustine’s life'), seqF(EV, 'events of Augustine’s life'), whoF(WHO, 'In the Confessions, who'), bookF(BK, 'the Confessions'), famPlace, famTime, termF(TERMS, 'the Confessions'), famAge].concat(dateFams(ID).slice(0, 2)), 0.6);
