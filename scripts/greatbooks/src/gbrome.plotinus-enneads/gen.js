/* gbrome.plotinus-enneads (gbe3): the levels of reality in order, terms, the Enneads' arrangement, the argument on beauty, his life, dates. */
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
var ID = 'gbrome.plotinus-enneads';
var LV = ['the One', 'Intellect (nous)', 'Soul', 'the world of bodies', 'matter'];
function famLevels(R, lv) {
  var k = lv === 1 ? 3 : 4, idx = R.sample([0, 1, 2, 3, 4], k).sort(), ord = idx.map(function (i) { return LV[i]; }), up = lv === 3 && R.next() < 0.5;
  if (up) ord = ord.slice().reverse();
  var right = ord.join(' → '), w = [];
  for (var t = 0; t < 20 && w.length < 3; t++) { var s = R.shuffle(ord.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('In Plotinus’s picture of reality, put these in order ' + (up ? 'from the <b>lowest</b> (dimmest) to the highest' : 'from the <b>highest</b> source outward') + '.', right, w, ['From the source outward: the One → Intellect → Soul → bodies → matter.']);
}
function famAbove(R, lv) {
  var i = R.int(1, 4);
  if (R.next() < 0.5) return H.mc('For Plotinus, what does <b>' + LV[i] + '</b> come from, directly?', LV[i - 1], LV.filter(function (x, j) { return j !== i - 1 && j !== i; }).slice(0, lv === 1 ? 2 : 3), ['Each level flows from the one just above it: ' + LV[i - 1] + ' → ' + LV[i] + '.']);
  var j = R.int(0, 3);
  return H.mc('For Plotinus, what comes directly from <b>' + LV[j] + '</b>?', LV[j + 1], LV.filter(function (x, m) { return m !== j + 1 && m !== j; }).slice(0, lv === 1 ? 2 : 3), [LV[j] + ' → ' + LV[j + 1] + '.']);
}
var ENN = [[1, 'do the treatises deal with ethics: happiness, virtue and beauty', 'ethics; it includes On Beauty'], [4, 'do the treatises deal with the soul', 'the soul'], [5, 'do the treatises deal with Intellect', 'Intellect, the divine Mind'], [6, 'does Porphyry place the treatises on the One, at the very end', 'being and the One']];
var TERMS = [['Ennead', 'a group of nine treatises, from the Greek for “nine”'], ['the One', 'the first source of all, also called the Good'], ['nous', 'Intellect, the divine Mind that thinks the Forms'], ['procession', 'the flowing out of each level from the one above'], ['return', 'the soul’s turning back toward its source'], ['matter', 'the formless edge of reality, where the light gives out'], ['Platonopolis', 'the “city of philosophers” Plotinus hoped to found'], ['Porphyry', 'the student who edited the Enneads and wrote Plotinus’s life']];
var ARG = [
  ['If beauty were only symmetry of parts, nothing without parts could be beautiful.', 'A single color, or a flash of lightning, has no parts and is beautiful.', 'So beauty is not only symmetry of parts.'],
  ['Whatever flows from the Good is, in itself, good.', 'Evil is not good.', 'So evil is not something that flows from the Good as a thing of its own.'],
  ['To see a thing, the eye must be like what it sees.', 'The highest Beauty is perfectly beautiful.', 'So to see it, the soul must become beautiful.']
];
function famArg(R, lv) {
  var a = R.pick(ARG), others = ARG.filter(function (x) { return x !== a; });
  if (lv === 1 || R.next() < 0.5) return H.mc('Plotinus argues: “' + a[0] + ' ' + a[1] + ' ' + a[2] + '” Which sentence is the <b>conclusion</b>?', a[2], [a[0], a[1]], ['The conclusion begins with “So”: it is what the other two support.']);
  return H.mc('Plotinus argues: “' + a[0] + ' … ' + a[2] + '” Which premise is missing?', a[1], others.map(function (x) { return x[1]; }).concat([a[2]]), ['“' + a[1] + '” connects the first premise to the conclusion.']);
}
var EV = ['Plotinus studies with Ammonius in Alexandria', 'He joins Gordian III’s campaign to the East (AD 242–244)', 'He settles in Rome and begins to teach (AD 244)', 'Porphyry joins his circle (AD 263)', 'Plotinus dies in Campania (AD 270)', 'Porphyry publishes the Enneads (about AD 300)'];
var B = {
  facts: [
    ['The Enneads were edited by Plotinus’s student Porphyry.', true, 'In six groups of nine treatises.'],
    ['“Ennead” comes from the Greek word for nine.', true, 'Ennea, nine.'],
    ['Plotinus thought beauty is nothing but symmetry of parts.', false, 'He argued against that view: simple things like a color can be beautiful.'],
    ['For Plotinus, the One loses something each time a lower level flows from it.', false, 'It gives without losing, as the sun gives light.'],
    ['Plotinus saw himself as an interpreter of Plato.', true, '“Neoplatonist” is a modern label.'],
    ['Plotinus taught that evil is a lack, not a power of its own.', true, 'Like darkness, the absence of light.'],
    ['Plotinus let a famous artist paint his portrait in his studio.', false, 'He refused; his friends had an artist draw him from memory.'],
    ['Augustine was helped by “books of the Platonists,” probably including Plotinus.', true, 'Confessions, Book VII.'],
    ['Plotinus wrote On Beauty first of all his treatises.', true, 'By Porphyry’s order of writing, it was the first.'],
    ['Plotinus taught mainly in Athens.', false, 'In Rome, from AD 244.'],
    ['Plotinus asked the emperor Gallienus to found a city of philosophers.', true, 'Platonopolis, in Campania; it never happened.']
  ],
  items: [
    { q: 'What picture does Plotinus use for how everything comes from the One?', r: 'Light flowing from the sun', w: ['A river flowing uphill', 'A tower built brick by brick', 'A tree cut into planks'], why: 'The source gives without losing, and the light dims with distance.' },
    { q: 'What does Plotinus tell a person to do who wants to see the highest beauty?', r: 'Withdraw into yourself and chisel your own statue', w: ['Travel to see famous statues', 'Count the parts of beautiful things', 'Stop thinking about beauty'], why: 'Ennead I.6.9.' },
    { q: 'What, for Plotinus, is the purpose of philosophy?', r: 'The soul’s return toward Intellect and the One', w: ['Winning arguments in court', 'Measuring the stars', 'Gaining wealth'], why: 'The return, through virtue, beauty and contemplation.' },
    { q: 'Why did Plotinus refuse to sit for a portrait?', r: 'He thought the body was already an image, and a portrait would be an image of an image', w: ['He was afraid of painters', 'Portraits were illegal', 'He wanted a statue instead'], why: 'Porphyry, Life of Plotinus, chapter 1.' },
    { q: 'Where is matter in Plotinus’s picture?', r: 'At the dim outer edge, where form gives out', w: ['At the center', 'Above the One', 'Between Intellect and Soul'], why: 'Matter has no form of its own.' },
    { q: 'Who translated the Enneads into Latin in the Renaissance?', r: 'Marsilio Ficino', w: ['Augustine', 'Porphyry', 'Cicero'], why: 'Published in 1492.' }
  ]
};
H.T(ID, B, [famLevels, famLevels, famAbove, bookF(ENN, 'the Enneads', 'Ennead'), termF(TERMS, 'Plotinus'), famArg, seqF(EV, 'events')].concat(dateFams(ID).slice(0, 2)), 0.6);
