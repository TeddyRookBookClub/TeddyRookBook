/* gbrome.marcus-aurelius-meditations (gbe3): his life and reign, who taught him what, the Stoic ideas, the view from above, dates. */
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
var ID = 'gbrome.marcus-aurelius-meditations';
var EV = ['Marcus is born in Rome (AD 121)', 'He is adopted by Antoninus Pius (AD 138)', 'He becomes emperor (AD 161)', 'Plague spreads through the empire (from about AD 165)', 'Wars on the Danube; he writes notes in army camps (AD 170s)', 'He dies; Commodus becomes emperor (AD 180)'];
var WHO = [['Rusticus', 'taught Marcus to read carefully and lent him the notes of Epictetus', 'was his Stoic teacher'], ['Fronto', 'taught Marcus rhetoric, the art of speaking', 'was a famous orator'], ['Antoninus Pius', 'adopted Marcus and ruled before him', 'was the emperor before Marcus'], ['Hadrian', 'arranged for Marcus to be adopted into the imperial family', 'was the emperor who chose Antoninus Pius'], ['Commodus', 'was Marcus’s son, who succeeded him and ruled badly', 'became emperor in AD 180'], ['Epictetus', 'was the freed-slave Stoic whose teaching Marcus read', 'taught at Nicopolis']];
var TERMS = [['Meditations', 'Marcus’s private notebook in twelve books'], ['ta eis heauton', '“to himself,” the title in the oldest manuscripts'], ['the view from above', 'imagining life from a great height, to see what really matters'], ['the inner retreat', 'withdrawing into one’s own mind for calm'], ['Stoicism', 'the philosophy that virtue is the only true good'], ['Carnuntum', 'an army base on the Danube where Marcus wrote'], ['the Quadi', 'a German people Marcus fought on the frontier'], ['providence', 'the belief that a wise reason orders the world']];
var SAID = [['Begin the morning by expecting to meet difficult people', 'Meditations II.1'], ['Retire into yourself; nowhere is quieter than your own soul', 'Meditations IV.3'], ['The whole earth is a point', 'Meditations IV.3'], ['Think of the times of Vespasian: all those busy people are gone', 'Meditations IV.32'], ['Asia and Europe are corners of the universe', 'Meditations VI.36'], ['We are made for co-operation, like hands and feet', 'Meditations II.1']];
var NOTM = [['Some things are up to us and some are not', 'Epictetus, Handbook 1'], ['My design is not to write histories, but lives', 'Plutarch, Life of Alexander'], ['Arms and the man I sing', 'Virgil, Aeneid I'], ['Without anger and without partiality', 'Tacitus, Annals I.1']];
function famSaid(R, lv) {
  var s = R.pick(SAID), w = H.samp(R, NOTM, lv === 1 ? 2 : 3);
  if (R.next() < 0.5) return H.mc('Which of these thoughts is from Marcus Aurelius’s Meditations (in our words)?', s[0], w.map(function (x) { return x[0]; }), [s[0] + ': ' + s[1] + '.'].concat(w.map(function (x) { return x[0] + ': ' + x[1] + '.'; })));
  var m = R.pick(NOTM), ms = H.samp(R, SAID, 3);
  return H.mc('Three of these thoughts are from the Meditations, in our words. Which one is <b>not</b>?', m[0], ms.map(function (x) { return x[0]; }), [m[0] + ': ' + m[1] + '.']);
}
function famReign(R, lv) {
  var D = [['became emperor in AD 161 and died in AD 180. How many years did he reign', 19], ['was adopted by Antoninus Pius in AD 138 and became emperor in AD 161. How many years did he wait', 23], ['was born in AD 121 and died in AD 180. How many years apart are those dates', 59], ['was born in AD 121 and adopted in AD 138. How many years apart are those dates', 17]];
  var d = R.pick(D);
  return H.num('Marcus Aurelius ' + d[0] + '?', d[1], ['Both dates are AD, so subtract: the answer is ' + d[1] + '.']);
}
var B = {
  facts: [
    ['Marcus Aurelius wrote the Meditations for himself, not for publication.', true, 'The old title means “to himself.”'],
    ['The Meditations were written in Latin.', false, 'In Greek, the language of philosophy.'],
    ['Book I lists what Marcus learned from family, teachers and friends.', true, 'A book of gratitude.'],
    ['Marcus wrote parts of the Meditations in army camps on the Danube.', true, 'Among the Quadi, and at Carnuntum.'],
    ['Marcus learned about Epictetus from his teacher Rusticus.', true, 'Rusticus lent him the notes of Epictetus’s lectures.'],
    ['Marcus thought difficult people should be hated.', false, 'He says he cannot be angry with his kinsman, nor hate him.'],
    ['Marcus was succeeded by his son Commodus.', true, 'In AD 180.'],
    ['The view from above is meant to show that nothing matters.', false, 'It shrinks fame and worry, so that acting justly stands out.'],
    ['Marcus says people do wrong from ignorance of what is good.', true, 'Meditations II.1.'],
    ['Marcus ruled in peace and never went to war.', false, 'He spent most of his last decade fighting on the Danube.'],
    ['Marcus says we are made for co-operation.', true, 'Like hands, feet, eyelids and teeth.']
  ],
  items: [
    { q: 'Why does Marcus say he cannot be harmed by the busybody or the ungrateful?', r: 'No one can make his own character ugly but himself', w: ['He has guards', 'He is the emperor', 'They are too far away'], why: 'Meditations II.1.' },
    { q: 'What does Marcus say is better than a house in the country or by the sea?', r: 'Retiring into his own soul', w: ['A palace in Rome', 'A long sea voyage', 'A library'], why: 'Meditations IV.3.' },
    { q: 'What is Book I of the Meditations mostly about?', r: 'What he learned from the people who shaped him', w: ['His battles', 'The laws of Rome', 'The stars'], why: 'Grandfather, mother, teachers, friends, and Antoninus Pius.' },
    { q: 'Which philosopher shaped Marcus’s Stoicism most?', r: 'Epictetus', w: ['Epicurus', 'Plotinus', 'Lucretius'], why: 'He read Arrian’s notes of Epictetus.' },
    { q: 'What is the purpose of the “view from above”?', r: 'To see worries and fame in proportion, so duty stands out', w: ['To plan battles', 'To map the empire', 'To prove the earth is flat'], why: 'The earth is a point; act justly now.' },
    { q: 'Why is the Meditations unusual among ancient books?', r: 'It is an emperor’s private notes to himself', w: ['It was the first novel', 'It was written by a slave', 'It is a history of Rome'], why: 'We have almost no other private writing by a Roman emperor.' }
  ]
};
H.T(ID, B, [seqF(EV, 'events of Marcus’s life'), whoF(WHO, 'Who'), whoF(WHO, 'Who'), termF(TERMS, 'the Meditations'), famSaid, famSaid, famReign].concat(dateFams(ID).slice(0, 2)), 0.6);
