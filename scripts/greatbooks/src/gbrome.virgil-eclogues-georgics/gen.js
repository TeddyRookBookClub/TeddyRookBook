/* gbrome.virgil-eclogues-georgics (gbe3): which book is about what, the eclogues, weather signs, key words, dates. */
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
var ID = 'gbrome.virgil-eclogues-georgics';
var GB = [[1, 'does Virgil teach plowing, sowing and the signs of the weather', 'fields, grain and weather'], [2, 'does Virgil write about trees, vines and olives', 'trees and vines, with the praise of Italy and of country life'], [3, 'does Virgil write about horses and cattle', 'horses, cattle, sheep and goats'], [4, 'does Virgil describe the hive as a little city', 'bees, with the stories of Aristaeus and of Orpheus and Eurydice']];
var EC = [[1, 'does one herdsman keep his farm while his neighbor must leave his', 'Tityrus and Meliboeus'], [4, 'does Virgil foretell a child who brings back the golden age', 'the “Messianic” Eclogue, dedicated to Pollio'], [6, 'does the woodland god Silenus sing of how the world began', 'Silenus’s song'], [10, 'does the poet Gallus say “Love conquers all”', 'Gallus in Arcadia'], [3, 'does a singing contest end in a tie', 'Menalcas and Damoetas, judged by Palaemon'], [7, 'does Corydon win a singing match against Thyrsis', 'remembered by Meliboeus']];
var SIGNS = ['a crane flying high', 'a heifer sniffing the air with wide nostrils', 'swallows circling the pond', 'frogs croaking in the mud', 'ants carrying their eggs out along their path', 'a raven calling loudly on the shore', 'a lamp’s oil sputtering'];
var NOT = ['bees resting quietly in the hive all day', 'a ship arriving in harbor', 'a farmer sharpening his plow', 'a goat eating ivy', 'an olive tree in flower'];
function famSign(R, lv) {
  var s = R.pick(SIGNS);
  if (lv === 1) return H.mc('In Georgics Book I, Virgil lists warnings that rain is coming. Which of these is one of them?', s, H.samp(R, NOT, 2), ['Virgil’s rain signs include ' + SIGNS.slice(0, 5).join(', ') + '.']);
  var pick = H.samp(R, SIGNS.filter(function (x) { return x !== s; }), 2).concat([s]), odd = R.pick(NOT);
  return H.mc('Three of these are Virgil’s signs of coming rain (Georgics I). Which one is <b>not</b>?', odd, pick, ['Rain signs: ' + pick.join('; ') + '.', odd + ' is not one of them.']);
}
var TERMS = [['eclogue', 'a short poem, here a pastoral poem of shepherds'], ['georgic', 'a poem about farming (from the Greek for “farmer”)'], ['pastoral', 'poetry about shepherds and country life'], ['Maecenas', 'Augustus’s adviser and Virgil’s patron, named in every book of the Georgics'], ['Theocritus', 'the Greek poet of Sicilian shepherds whom the Eclogues follow'], ['labor omnia vicit', '“toil conquered everything,” Georgics Book I'], ['felix qui potuit rerum cognoscere causas', '“happy he who could know the causes of things,” Georgics Book II'], ['omnia vincit Amor', '“Love conquers all,” Eclogue 10'], ['Aristaeus', 'the beekeeper who loses his bees in Georgics IV']];
var EV = ['Virgil is born near Mantua (70 BC)', 'Julius Caesar is murdered (44 BC)', 'The battle of Philippi; farmland is taken for veterans (42 BC)', 'The Eclogues are published (about 39 BC)', 'The Georgics are finished and read to Octavian (29 BC)', 'Virgil dies, leaving the Aeneid unfinished (19 BC)'];
var B = {
  facts: [
    ['The Georgics are a poem about farming in four books.', true, 'Fields, trees, animals and bees.'],
    ['The Eclogues are songs of shepherds and herdsmen.', true, 'Ten short pastoral poems.'],
    ['The Eclogues follow the Greek poet Theocritus.', true, 'His shepherds sang in Sicily.'],
    ['The Georgics were Virgil’s first poem.', false, 'The Eclogues came first, then the Georgics, then the Aeneid.'],
    ['Book IV of the Georgics is about bees.', true, 'It ends with Aristaeus and the story of Orpheus.'],
    ['Virgil knew that the ruler of a hive is a queen.', false, 'Ancient writers called it a king; later naturalists showed it is female.'],
    ['The first Eclogue reflects land being taken to settle soldiers after a civil war.', true, 'After Philippi, 42 BC.'],
    ['Virgil wrote the Georgics as a practical handbook for farmers.', false, 'It is a poem about work and how to live; Cato and Varro wrote handbooks.'],
    ['Maecenas, Virgil’s patron, is named in every book of the Georgics.', true, 'He was Octavian’s close adviser.'],
    ['Christian readers later took the fourth Eclogue as a prophecy of Christ.', true, 'The emperor Constantine was one of them.'],
    ['Virgil says farming is easy because the gods do the work.', false, 'He says Jupiter made it hard on purpose, so people would grow inventive.'],
    ['“Love conquers all” comes from the Eclogues.', true, 'Eclogue 10.']
  ],
  items: [
    { q: 'Why, according to Georgics Book I, did Jupiter make farming hard?', r: 'So that hard work would sharpen people’s minds and skills', w: ['To punish farmers for laziness', 'Because he disliked Italy', 'He did not; farming was always easy'], why: 'Need and toil, Virgil says, produced the arts.' },
    { q: 'What is the hive like, in Georgics Book IV?', r: 'A little city where everyone shares the work', w: ['A prison', 'A palace for one bee alone', 'A battlefield with no order'], why: 'Virgil admires the bees’ order, work and loyalty.' },
    { q: 'What does Virgil say farmers would be, “did they know their own happiness”?', r: 'Too fortunate', w: ['Rich and famous', 'Soldiers', 'Unhappy'], why: 'Georgics II: O fortunatos nimium.' },
    { q: 'Whose story is told inside the story of Aristaeus at the end of the Georgics?', r: 'Orpheus and Eurydice', w: ['Aeneas and Dido', 'Romulus and Remus', 'Achilles and Hector'], why: 'Orpheus goes to the underworld for Eurydice and loses her by looking back.' },
    { q: 'Who is the Roman to whom Virgil addresses the Georgics?', r: 'Maecenas', w: ['Julius Caesar', 'Cicero', 'Lucretius'], why: 'Maecenas, friend and adviser of Octavian.' },
    { q: 'What happens to Meliboeus in the first Eclogue?', r: 'He has to leave his farm', w: ['He wins a singing contest', 'He becomes a god', 'He sails to Carthage'], why: 'His land has been taken; Tityrus has been allowed to stay.' }
  ]
};
H.T(ID, B, [bookF(GB, 'the Georgics'), bookF(EC, 'the Eclogues', 'eclogue'), famSign, famSign, termF(TERMS, 'Virgil’s country poems'), seqF(EV, 'events')].concat(dateFams(ID).slice(0, 2)), 0.6);
