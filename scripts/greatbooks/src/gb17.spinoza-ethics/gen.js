/* gb17.spinoza-ethics: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.spinoza-ethics';
var PARTS = [['Of God', 1, 'Part I'], ['Of the nature and origin of the mind', 2, 'Part II'], ['Of the origin and nature of the emotions', 3, 'Part III'], ['Of human bondage, or the strength of the emotions', 4, 'Part IV'], ['Of the power of the understanding, or of human freedom', 5, 'Part V']];
var AFF = [['love', 'pleasure', 'an outside cause'], ['hatred', 'pain', 'an outside cause'], ['hope', 'pleasure', 'something past or future whose outcome is doubtful'], ['fear', 'pain', 'something past or future whose outcome is doubtful'], ['confidence', 'pleasure', 'something past or future, with doubt removed'], ['despair', 'pain', 'something past or future, with doubt removed'], ['self-approval', 'pleasure', 'oneself and one\'s own power'], ['humility', 'pain', 'oneself and one\'s own weakness']];
function famAff(R, lv) {
  var a = R.pick(AFF), others = AFF.filter(function (x) { return x !== a; });
  if (lv === 1 || R.coin()) return H.mc('In Spinoza\'s pattern (in our words), <b>' + a[1] + '</b> joined to the idea of <b>' + a[2] + '</b> is called what?', a[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [a[0] + ' = ' + a[1] + ' + the idea of ' + a[2] + '.']);
  return H.mc('Spinoza builds emotions from basic ones. Which is the basic emotion in <b>' + a[0] + '</b>?', a[1], ['desire', a[1] === 'pain' ? 'pleasure' : 'pain', 'wonder'], [a[0] + ' is ' + a[1] + ' joined to the idea of ' + a[2] + '.']);
}
var TM = [['substance', 'what exists in itself and is conceived through itself; for Spinoza, only God'], ['attribute', 'what the mind perceives as making up the essence of substance, such as thought or extension'], ['mode', 'a way or state of substance; a particular thing that exists in something else'], ['conatus', 'the striving of each thing to keep going in its own being'], ['bondage', 'being ruled by one\'s emotions instead of by understanding'], ['scholium', 'a note after a proof where Spinoza explains more freely'], ['geometrical order', 'setting out definitions, axioms and numbered proofs, as in Euclid']];
var EV = [['Spinoza is born in Amsterdam', 1632, '1632'], ['his community expels him', 1656, '1656'], ['the Theological-Political Treatise, published anonymously', 1670, '1670'], ['he declines a professorship at Heidelberg', 1673, '1673'], ['Leibniz visits him', 1676, '1676'], ['he dies; the Ethics is printed', 1677, '1677']];
var WHO = [['Spinoza', 'There is only one substance, God or Nature, and everything is in it.'], ['Descartes', 'Mind and body are two distinct substances.'], ['Novalis', 'Spinoza was a God-intoxicated man.'], ['Spinoza\'s critics in his own time', 'A God identical with Nature is no God at all.']];
var B = {
  facts: [
    ['The Ethics is set out like geometry, with definitions, axioms and proofs.', true, 'Its full title says "Demonstrated in Geometrical Order".'],
    ['Spinoza published the Ethics himself in 1665.', false, 'It was printed after his death, in 1677.'],
    ['For Spinoza there is only one substance.', true, 'God, or Nature.'],
    ['Spinoza says we know two of God\'s attributes: thought and extension.', true, 'Part II.'],
    ['Spinoza\'s three basic emotions are desire, pleasure and pain.', true, 'Part III.'],
    ['For Spinoza, freedom means acting with no causes at all.', false, 'It means acting from understanding.'],
    ['Spinoza calls being ruled by one\'s emotions "bondage".', true, 'Preface to Part IV.'],
    ['Spinoza agrees with Descartes that mind and body are two substances.', false, 'They are one thing under two attributes.'],
    ['The last sentence of the Ethics says excellent things are as difficult as they are rare.', true, 'Part V, last note.'],
    ['Spinoza earned his living as a lens grinder.', true, 'He ground lenses for instruments.']
  ],
  items: [
    { q: 'What does a passion become when we form a clear idea of its causes, according to Spinoza?', r: 'It stops being a passion', w: ['It grows stronger', 'It turns into hatred', 'Nothing changes'], why: 'Part V.' },
    { q: 'What does Spinoza call the calm joy of knowing God?', r: 'The intellectual love of God', w: ['Bondage', 'Conatus', 'Hope'], why: 'Part V.' },
    { q: 'In what city was Spinoza born?', r: 'Amsterdam', w: ['Paris', 'London', 'Rome'], why: 'To a Portuguese Jewish family.' },
    { q: 'What is the full title of the Ethics?', r: 'Ethics, Demonstrated in Geometrical Order', w: ['Meditations on First Philosophy', 'The Advancement of Learning', 'Leviathan'], why: 'The others are by Descartes, Bacon and Hobbes.' },
    { q: 'What does Spinoza write as one phrase in Part IV?', r: '"God or Nature"', w: ['"I think, therefore I am"', '"Knowledge is power"', '"The heart has its reasons"'], why: 'The others belong to Descartes, Bacon and Pascal.' },
    { q: 'What are the notes after Spinoza\'s proofs called?', r: 'Scholia', w: ['Sonnets', 'Objections', 'Essays'], why: 'There he speaks more freely.' }
  ]
};
H.T(ID, B, [famAff, famAff, function (R, lv) { return famSeq(R, lv, PARTS, 'parts of the Ethics'); }, function (R, lv) { return famTerm(R, lv, TM, 'the Ethics'); }, function (R, lv) { return famWho(R, lv, WHO, 'the story of the Ethics'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
