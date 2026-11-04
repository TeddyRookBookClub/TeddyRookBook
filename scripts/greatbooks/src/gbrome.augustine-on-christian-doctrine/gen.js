/* gbrome.augustine-on-christian-doctrine (gbe3): things and signs, natural and conventional signs, use and enjoy, the four books, the speaker's three aims and styles, terms, dates. */
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
var ID = 'gbrome.augustine-on-christian-doctrine';
var NAT = ['smoke, which makes us think of fire', 'an animal’s footprint', 'an angry face', 'dark storm clouds', 'a flushed face with fever', 'ripples where a fish has jumped', 'a shadow moving across the floor'];
var CON = ['a spoken word', 'a trumpet call to advance', 'a nod of the head', 'a military flag', 'a written letter of the alphabet', 'a red traffic light', 'a wave to say hello', 'a church bell ringing for service'];
var THG = ['a piece of wood, just as wood', 'a stone, just as a stone', 'cattle in a field'];
function famSign(R, lv) {
  var r = R.next(), k = r < 0.45 ? 'n' : r < 0.9 ? 'c' : 't', x = R.pick(k === 'n' ? NAT : k === 'c' ? CON : THG);
  var lab = { n: 'A natural sign', c: 'A conventional (given) sign', t: 'Just a thing, not used as a sign' };
  return H.mc('In Augustine’s terms (On Christian Doctrine I–II), what is <b>' + x + '</b>?', lab[k], ['n', 'c', 't'].filter(function (q) { return q !== k; }).map(function (q) { return lab[q]; }).slice(0, lv === 1 ? 1 : 2),
    ['Natural signs point to something without anyone meaning them to; conventional signs are given on purpose to share a thought; a “thing” in the strict sense is not used as a sign.'], { keep: true });
}
function famOdd(R, lv) {
  var nat = R.next() < 0.5, three = H.samp(R, nat ? NAT : CON, 3), odd = R.pick(nat ? CON : NAT);
  return H.mc('Three of these are ' + (nat ? 'natural' : 'conventional') + ' signs. Which one is the odd one out?', odd, three, [odd.charAt(0).toUpperCase() + odd.slice(1) + ' is a ' + (nat ? 'conventional' : 'natural') + ' sign.']);
}
var AIMS = [['to teach', 'the subdued (plain) style', 'a necessity'], ['to delight', 'the temperate (middle) style', 'a beauty'], ['to persuade', 'the majestic (grand) style', 'a triumph']];
function famAims(R, lv) {
  var a = R.pick(AIMS), o = AIMS.filter(function (x) { return x !== a; });
  var t = R.int(0, lv === 1 ? 1 : 2);
  if (t === 0) return H.mc('Cicero, quoted by Augustine: “To teach is a necessity, to delight is a beauty, to persuade is …” what?', 'a triumph', ['a duty', 'a danger', 'a game'], ['Book IV, chapter 12.']);
  if (t === 1) return H.mc('Augustine matches the speaker’s aims to three styles. Which style suits the aim <b>' + a[0] + '</b>?', a[1], o.map(function (x) { return x[1]; }), ['Teach: subdued. Delight: temperate. Persuade (move to act): majestic. (Book IV)']);
  return H.mc('Which of the speaker’s three aims does Augustine say comes first, because without it nothing has been said?', 'To teach', ['To delight', 'To persuade', 'To win'], ['A speaker who is not understood has not yet said anything to his hearer.']);
}
var BK = [[1, 'does Augustine write about things, and about what to enjoy and what to use', 'things; love of God and neighbor'], [2, 'does he explain natural and conventional signs, and unknown signs', 'signs; languages and learning'], [3, 'does he take up ambiguous signs, and literal and figurative meaning', 'ambiguous signs; Tyconius’s rules'], [4, 'does he teach how to speak and preach', 'rhetoric for teachers and preachers']];
var TERMS = [['sign', 'a thing that makes something else come into the mind'], ['natural sign', 'a sign that points to something without anyone intending it'], ['conventional sign', 'a sign given on purpose to share a thought, such as a word'], ['frui', 'Latin “to enjoy”: to love a thing for its own sake'], ['uti', 'Latin “to use”: to love a thing for the sake of something else'], ['doctrina', 'teaching'], ['rhetoric', 'the art of speaking well and persuasively'], ['figurative', 'meant as a figure of speech, not literally']];
var EV = ['Augustine becomes bishop of Hippo (about AD 395)', 'He begins On Christian Doctrine (about AD 396)', 'He writes the Confessions (about AD 397–400)', 'Rome is sacked (AD 410)', 'He finishes Book III and writes Book IV (AD 426–427)'];
var B = {
  facts: [
    ['Augustine says all instruction is about things or about signs.', true, 'Book I, chapter 2.'],
    ['Smoke that makes us think of fire is a conventional sign.', false, 'It is a natural sign: no one meant it as a message.'],
    ['Words are the chief kind of conventional sign.', true, 'Book II, chapter 3.'],
    ['Augustine says Christians should reject everything written by pagans.', false, 'Whatever is true belongs to God and may be used, like the gold of Egypt.'],
    ['Augustine wrote On Christian Doctrine in two stages, about thirty years apart.', true, 'Begun about 396, finished 426–427.'],
    ['Augustine borrows the three aims of the speaker from Cicero.', true, 'To teach, to delight, to persuade.'],
    ['Augustine thought a speech is good if it is beautiful, whether or not it is understood.', false, 'Teaching comes first; a speaker not understood has said nothing.'],
    ['For Augustine, the aim of Scripture is love of God and of neighbor.', true, 'Book I.'],
    ['Augustine advises readers of the Bible to learn Hebrew and Greek.', true, 'To understand unknown signs.'],
    ['Augustine says written letters are signs of spoken words.', true, 'Signs of signs.'],
    ['Book IV of On Christian Doctrine is about astronomy.', false, 'It is about speaking and teaching.']
  ],
  items: [
    { q: 'What does Augustine mean by a “thing,” in the strict sense?', r: 'Something not used as a sign of anything else, like wood or stone', w: ['Anything you can touch', 'A word', 'A picture'], why: 'Book I, chapter 2.' },
    { q: 'What is the difference between “using” and “enjoying,” for Augustine?', r: 'We enjoy what we love for its own sake, and use what we love for the sake of something else', w: ['Using is good and enjoying is bad', 'There is no difference', 'Enjoying means eating'], why: 'Frui and uti, Book I.' },
    { q: 'Why does Augustine compare pagan learning to the gold of Egypt?', r: 'As the Israelites took Egypt’s gold for a better use, Christians may take what is true in pagan learning', w: ['Because pagan books were bound in gold', 'Because Egypt had the best schools', 'To show that learning is worthless'], why: 'Book II, chapter 40.' },
    { q: 'What rule does Augustine give for figurative passages?', r: 'A passage that, taken literally, would seem to recommend wrongdoing should be read figuratively', w: ['Every passage is figurative', 'No passage is ever figurative', 'Read only the parts you like'], why: 'Book III.' },
    { q: 'Why does Augustine think teachers of truth should learn rhetoric?', r: 'So that skill in speaking is not left only to those who teach falsehood', w: ['To become famous', 'To win prizes', 'Because it is required by law'], why: 'Book IV.' },
    { q: 'Who is the “great orator” Augustine quotes in Book IV?', r: 'Cicero', w: ['Virgil', 'Ambrose', 'Plotinus'], why: 'To teach, to delight, to persuade.' }
  ]
};
H.T(ID, B, [famSign, famSign, famOdd, famAims, bookF(BK, 'On Christian Doctrine'), termF(TERMS, 'On Christian Doctrine'), seqF(EV, 'events')].concat(dateFams(ID).slice(0, 2)), 0.6);
