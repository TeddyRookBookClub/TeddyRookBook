/* gbgreeks.plato-timaeus: practice generator (gbe2). Bank plus computed families; shared helpers first. */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] (key sorts; when is shown in the answer) */
function famSeq(R, lv, ev, what) {
  var k = lv === 1 ? 3 : 4, pick = R.sample(ev, Math.min(k, ev.length)), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var lab = function (e) { return e[0]; }, right = srt.map(lab).join(' → '), w = [];
  for (var i = 0; i < 8 && w.length < 4; i++) { var s = R.shuffle(srt.slice()).map(lab).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Which list puts these ' + (what || 'events') + ' in order, <b>first to last</b>?', right, H.samp(R, w, lv === 1 ? 2 : 3), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }), { hint: 'Find the one that must come first, then work forward.' });
}
function famFirst(R, lv, ev, what) {
  var pick = R.sample(ev, lv === 1 ? 3 : 4), late = R.coin(), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var right = late ? srt[srt.length - 1] : srt[0];
  return H.mc('Which of these ' + (what || 'events') + ' came <b>' + (late ? 'last' : 'first') + '</b>?', right[0], pick.filter(function (e) { return e !== right; }).map(function (e) { return e[0]; }), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }));
}
/* key terms: tm = [[term, meaning]] */
function famTerm(R, lv, tm, ctx) {
  var t = R.pick(tm), others = tm.filter(function (x) { return x !== t; }), n = lv === 1 ? 2 : 3;
  if (R.coin()) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which term means: <i>' + t[1] + '</i>?', t[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}
/* who said what (from our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]]; ask which b goes with a given a (or the reverse) */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), others = pr.filter(function (x) { return x !== p; }), n = Math.min(others.length, lv === 1 ? 2 : 3);
  if (R.coin()) return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [p[0] + ' goes with ' + p[1] + '.']);
  return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [p[1] + ' goes with ' + p[0] + '.']);
}
var ID = 'gbgreeks.plato-timaeus';
var EL = [['fire', 'tetrahedron', 4], ['air', 'octahedron', 8], ['water', 'icosahedron', 20], ['earth', 'cube', 6]];
function famSolid(R, lv) {
  var e = R.pick(EL), k = R.int(0, 2), others = EL.filter(function (x) { return x !== e; });
  if (k === 0) return H.mc('In the Timaeus, which solid is the particle of <b>' + e[0] + '</b>?', e[1], others.map(function (x) { return x[1]; }).concat(lv > 1 ? ['dodecahedron'] : []), [e[0] + ' is the ' + e[1] + ', with ' + e[2] + ' faces.']);
  if (k === 1) return H.mc('In the Timaeus, which element is made of <b>' + e[1] + 's</b>?', e[0], others.map(function (x) { return x[0]; }), [e[1] + ': ' + e[0] + '.']);
  return H.num('How many faces does Plato\'s particle of <b>' + e[0] + '</b> (the ' + e[1] + ') have?', e[2], [e[1] + ': ' + e[2] + ' faces' + (e[0] === 'earth' ? ', all squares.' : ', all equilateral triangles.')]);
}
function famTrade(R, lv) {
  var k = R.int(0, lv === 1 ? 1 : 3), n = R.int(2, 9);
  if (k === 0) return H.num('Each particle of air (8 triangle faces) can break into particles of fire (4 faces each). How many fire particles come from ' + n + ' air particles?', 2 * n, ['One air makes $8 \\div 4 = 2$ fire.', '$' + n + ' \\times 2 = ' + 2 * n + '$.']);
  if (k === 1) return H.num('Timaeus says one particle of water (20 faces) breaks into 2 air (8 faces each) and 1 fire (4 faces). How many triangle faces are in ' + n + ' water particles?', 20 * n, ['$' + n + ' \\times 20 = ' + 20 * n + '$ faces.']);
  if (k === 2) return H.num('If ' + n + ' particles of water break up, each into 2 air and 1 fire, how many <b>air</b> particles are made?', 2 * n, ['Each water gives 2 air: $' + n + ' \\times 2 = ' + 2 * n + '$.', 'Check: $' + n + ' \\times 20 = ' + 20 * n + '$ faces, and $' + 2 * n + ' \\times 8 + ' + n + ' \\times 4 = ' + 20 * n + '$.']);
  var w = 2 * n; return H.num('Five air particles (8 faces each) have 40 triangle faces, enough for 2 water particles (20 faces each). How many air particles are needed to make ' + w + ' water particles?', 5 * n, ['Each 2 water need 5 air.', '$' + w + ' \\div 2 \\times 5 = ' + 5 * n + '$. Check: $' + 5 * n + ' \\times 8 = ' + 40 * n + ' = ' + w + ' \\times 20$.']);
}
var TERMS = [['dēmiourgos (the Craftsman)', 'the good maker who orders the world after an eternal pattern'], ['likely story', 'Timaeus\'s name for his account, the best that can be given of a changing world'], ['world soul', 'the soul of the whole cosmos, laid out in musical ratios'], ['time', 'the moving image of eternity, made with the heavens'], ['Atlantis', 'the island power that, in Critias\'s tale, was defeated by ancient Athens and sank'], ['the Pillars of Heracles', 'the Strait of Gibraltar']];
var B = {
  facts: [
    ['Timaeus calls his account of the world\'s making a "likely story".', true, 'Not certain, like mathematics.'],
    ['In the Timaeus, the Craftsman makes the world out of nothing.', false, 'He brings order to a disorderly chaos, looking to an eternal pattern.'],
    ['Plato makes fire out of tetrahedrons.', true, 'Sharp and light, with 4 faces.'],
    ['Earth can change into water in the Timaeus.', false, 'Earth\'s square faces come from a different triangle.'],
    ['The story of Atlantis first appears in Plato.', true, 'In the Timaeus and Critias.'],
    ['In the Critias, Atlantis grows proud and the gods meet to judge it.', true, 'The dialogue breaks off there.'],
    ['Timaeus says there were days and years before the heavens moved.', false, 'Time came with the heavens.'],
    ['For centuries the Timaeus was the work of Plato most read in western Europe.', true, 'In Calcidius\'s Latin translation.'],
    ['Solon heard the Atlantis story from priests in Egypt, according to Critias.', true, 'At Sais.'],
    ['Plato\'s world is shaped like a cube.', false, 'Like a sphere, the most perfect shape.']
  ],
  items: [
    { q: 'Why did the Craftsman make the world, according to Timaeus?', r: 'He was good and wanted all things to be as like himself as possible', w: ['He was lonely', 'He lost a contest', 'He was ordered to'], why: 'Timaeus 29e.' },
    { q: 'What does Timaeus call time?', r: 'A moving image of eternity', w: ['A river of fire', 'The shadow of the earth', 'A circle of numbers'], why: 'Timaeus 37d.' },
    { q: 'Where did Atlantis lie, in Critias\'s story?', r: 'Beyond the Pillars of Heracles, in the Atlantic', w: ['In the middle of Greece', 'On the Nile', 'Near the North Pole'], why: 'Timaeus 24e.' },
    { q: 'What do most scholars think about Atlantis?', r: 'Plato most likely invented it for his story', w: ['It has been dug up in Athens', 'It is described in Homer', 'It was a city in Egypt'], why: 'There is no earlier source and no evidence.' },
    { q: 'Which later astronomer on this ladder tried to fit the planets\' orbits around Plato\'s solids?', r: 'Kepler', w: ['Euclid', 'Herodotus', 'Thucydides'], why: 'In his first book, Mysterium Cosmographicum (1596).' },
    { q: 'What did Plato give the dodecahedron to?', r: 'The whole universe', w: ['Fire', 'Earth', 'The human head'], why: 'Timaeus 55c.' }
  ]
};
H.T(ID, B, [famSolid, famSolid, famTrade, famTrade, function (R, lv) { return famTerm(R, lv, TERMS, 'the Timaeus and Critias'); }].concat(dateFams(ID)), 0.55);
