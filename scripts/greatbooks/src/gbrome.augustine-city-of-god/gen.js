/* gbrome.augustine-city-of-god (gbe3): the two cities, the plan of the 22 books, the ages, the arguments, terms, dates. */
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
var ID = 'gbrome.augustine-city-of-god';
var PARTS = [[1, 'argue that the old gods did not give Rome its earthly success', 'Books I–V'], [6, 'argue that the old gods cannot give happiness after death', 'Books VI–X'], [11, 'tell the beginnings of the two cities', 'Books XI–XIV'], [15, 'follow the two cities through history', 'Books XV–XVIII'], [19, 'describe the ends of the two cities', 'Books XIX–XXII']];
function famPart(R, lv) {
  var p = R.pick(PARTS), lab = function (x) { return x[2]; };
  return H.mc('In the City of God, which books ' + p[1] + '?', p[2], H.samp(R, PARTS.filter(function (x) { return x !== p; }), lv === 1 ? 2 : 3).map(lab), [p[2] + ': they ' + p[1] + '.']);
}
var LOVE = [['the earthly city', 'love of self, even to the contempt of God', 'glories in itself'], ['the city of God', 'love of God, even to the contempt of self', 'glories in the Lord']];
function famLove(R, lv) {
  var c = R.pick(LOVE), o = LOVE[1 - LOVE.indexOf(c)];
  if (R.next() < 0.5) return H.mc('According to Augustine, which love forms <b>' + c[0] + '</b>?', c[1], [o[1], 'love of Rome, even to the contempt of other nations', 'love of wisdom, even to the contempt of riches'].slice(0, lv === 1 ? 2 : 3), ['Book XIV.28: two cities formed by two loves.']);
  return H.mc('Augustine says one city “' + c[2] + '.” Which city?', c[0], [o[0], 'the city of Rome', 'the city of Carthage'].slice(0, lv === 1 ? 2 : 3), ['Book XIV.28.']);
}
var AGES = ['Adam to the Flood', 'the Flood to Abraham', 'Abraham to David', 'David to the exile in Babylon', 'the exile to Christ', 'Christ to the end of the world'];
function famAge(R, lv) {
  var E = [['Cain builds a city; Abel builds none', 0], ['Noah’s ark', 1], ['the tower of Babel', 1], ['God’s promise to Abraham', 2], ['the rise of Assyria', 2], ['the founding of Rome', 3], ['the return from Babylon', 4], ['the spread of the Church among the nations', 5]], e = R.pick(E);
  if (lv === 1) return H.mc('In which of Augustine’s ages of history does <b>' + e[0] + '</b> belong?', AGES[e[1]], H.samp(R, AGES.filter(function (x, i) { return i !== e[1]; }), 2), ['Age ' + (e[1] + 1) + ': ' + AGES[e[1]] + '.']);
  return H.num('Augustine counts six ages of history (Book XXII). In which age, by number, does <b>' + e[0] + '</b> belong?', e[1] + 1, ['The ages: ' + AGES.map(function (a, i) { return (i + 1) + ' ' + a; }).join('; ') + '.', e[0] + ': age ' + (e[1] + 1) + '.']);
}
var ARG = [['Without justice, a kingdom is only a band of robbers on a large scale.', 'Rome’s greatness came by conquest, not by justice alone.', 'So Rome’s size alone does not prove it was just.'], ['Earthly cities rise and fall.', 'The city of God does not fall.', 'So the city of God is not any earthly city.'], ['Everyone, even at war, seeks some kind of peace.', 'Peace is the tranquillity of order.', 'So everyone seeks some kind of order.']];
function famArg(R, lv) {
  var a = R.pick(ARG);
  return H.mc('An argument in the spirit of the City of God: “' + a[0] + ' ' + a[1] + ' ' + a[2] + '” Which sentence is the <b>conclusion</b>?', a[2], [a[0], a[1]], ['The conclusion is supported by the other two; it begins with “So.”']);
}
var TERMS = [['the earthly city', 'people bound together by love of self'], ['the city of God', 'people bound together by love of God, a pilgrim on earth'], ['pilgrim', 'a traveler passing through, as the city of God is in this world'], ['tranquillitas ordinis', '“the tranquillity of order,” Augustine’s definition of peace'], ['Alaric', 'the Visigothic king whose army sacked Rome in AD 410'], ['Marcellinus', 'the imperial official who urged Augustine to write the book'], ['Varro', 'the Roman scholar whose writings on the gods Augustine answers']];
var EV = ['The Visigoths sack Rome (AD 410)', 'Augustine begins the City of God (AD 413)', 'He finishes it (AD 426)', 'The Vandals besiege Hippo; Augustine dies (AD 430)'];
var B = {
  facts: [
    ['Augustine wrote the City of God after the sack of Rome in AD 410.', true, 'He began in 413.'],
    ['Augustine says the two cities are two places on a map.', false, 'They are two kinds of people, defined by what they love.'],
    ['Augustine says that in this world the two cities are mixed together.', true, 'Their members are known only at the end.'],
    ['The City of God has twenty-two books.', true, 'Written over thirteen years.'],
    ['Augustine argues that Rome fell because it became Christian.', false, 'That was the charge he set out to answer.'],
    ['Augustine tells the story of Alexander and the pirate.', true, 'Book IV.4, borrowed from Cicero.'],
    ['Augustine calls peace “the tranquillity of order.”', true, 'Book XIX.13.'],
    ['Augustine wanted a constitution for a perfect Christian state.', false, 'He argued that no earthly state should be mistaken for the city of God.'],
    ['Augustine records that Cain built a city and Abel built none.', true, 'Book XV: Abel was a sojourner.'],
    ['Augustine finished the City of God the year Rome was sacked.', false, 'He worked on it from 413 to 426.'],
    ['Charlemagne liked to have the City of God read to him, says his biographer Einhard.', true, 'Einhard, Life of Charlemagne.']
  ],
  items: [
    { q: 'Why did Augustine write the City of God?', r: 'To answer those who blamed Christianity for the sack of Rome', w: ['To praise the Goths', 'To record the history of Carthage', 'To teach Latin grammar'], why: 'Book I, preface.' },
    { q: 'What, says Augustine, are kingdoms without justice?', r: 'Great robberies', w: ['Great families', 'Small cities', 'Perfect states'], why: 'Book IV.4.' },
    { q: 'What did the pirate tell Alexander?', r: 'They did the same thing, but Alexander did it with a great fleet and was called emperor', w: ['That he would join Alexander’s army', 'That the sea belonged to the gods', 'That he was innocent'], why: 'Book IV.4.' },
    { q: 'What makes someone a member of one city or the other, for Augustine?', r: 'What they love most', w: ['Where they were born', 'Which language they speak', 'How rich they are'], why: 'Two cities formed by two loves (XIV.28).' },
    { q: 'How does Augustine see history?', r: 'As one story with a beginning, a direction and an end', w: ['As endless repeating cycles', 'As pure chance', 'As the story of Rome alone'], why: 'From creation to the eternal city.' },
    { q: 'How should members of the city of God treat the earthly city’s peace, in Augustine’s view?', r: 'Use it and value it, while not putting their final hope in it', w: ['Destroy it', 'Ignore it completely', 'Treat it as perfect'], why: 'Book XIX.' }
  ]
};
H.T(ID, B, [famPart, famLove, famAge, famAge, famArg, termF(TERMS, 'the City of God'), seqF(EV, 'events')].concat(dateFams(ID).slice(0, 2)), 0.6);
