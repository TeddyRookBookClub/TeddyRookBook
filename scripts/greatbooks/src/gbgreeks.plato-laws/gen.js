/* gbgreeks.plato-laws: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-laws';
var ST = [['Monarchy', 'one', 'keeps the laws', 1], ['Aristocracy', 'a few', 'keeps the laws', 2], ['Lawful democracy', 'many', 'keeps the laws', 3], ['Lawless democracy', 'many', 'ignores the laws', 4], ['Oligarchy', 'a few', 'ignores the laws', 5], ['Tyranny', 'one', 'ignores the laws', 6]];
function famForm(R, lv) {
  var f = R.pick(ST), others = ST.filter(function (x) { return x !== f; });
  if (lv === 1 || R.coin()) return H.mc('In the Statesman, what is rule by <b>' + f[1] + '</b> that <b>' + f[2] + '</b> called?', f[0], H.samp(R, others.filter(function (x) { return !(x[0].indexOf('democracy') >= 0 && f[0].indexOf('emocracy') >= 0); }), lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [f[0] + ': rule by ' + f[1] + ' that ' + f[2] + '.']);
  var pair = R.sample(ST, 2), better = pair[0][3] < pair[1][3] ? pair[0] : pair[1];
  return H.mc('By the Stranger\'s ranking in the Statesman, which is <b>better</b> to live under: ' + pair[0][0].toLowerCase() + ' or ' + pair[1][0].toLowerCase() + '?', better[0], [(better === pair[0] ? pair[1] : pair[0])[0]], ['His order, best to worst: ' + ST.map(function (x) { return x[0].toLowerCase(); }).join(', ') + '.']);
}
function famNum(R, lv) {
  var d = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
  if (lv >= 2 && R.coin()) return H.mc('The Laws fixes 5,040 households. Which of these numbers does <b>not</b> divide 5,040 evenly?', '11', H.samp(R, ['7', '8', '9', '10', '12', '6'], 3), ['5040 ÷ 11 ≈ 458.2. Every number from 1 to 10, and 12, divides 5,040 evenly.']);
  return H.num('Plato\'s city in the Laws has 5,040 households. If they are split into ' + d + ' equal groups, how many households are in each group?', 5040 / d, ['$5040 \\div ' + d + ' = ' + 5040 / d + '$.', '5,040 divides evenly by every number from 1 to 10.']);
}
var WHO = [['The Eleatic Stranger', 'The best thing is not that law should rule, but a wise and royal man.'], ['The Athenian Stranger', 'Each law should begin with a preamble that persuades before it commands.'], ['Cleinias', 'Among us Cretans, Zeus is said to be the author of our laws.'], ['Philebus', 'The good is pleasure.'], ['Socrates (in the Philebus)', 'The best life is a mixture, measured and in proportion.'], ['Megillus', 'In Sparta, Apollo is called our lawgiver.']];
var TERMS = [['preamble', 'the persuading part at the start of a law'], ['mixed constitution', 'a government that blends one-person rule with rule by the many'], ['second-best city', 'the Laws\' city, built for people as they are'], ['statesman\'s weaving', 'binding brave and gentle natures together into one city'], ['5,040', 'the number of households in the Laws\' city'], ['Magnesia', 'the name given to the planned colony on Crete']];
var B = {
  facts: [
    ['The Laws is Plato\'s longest work.', true, 'Twelve books.'],
    ['Socrates is the main speaker in the Laws.', false, 'An unnamed Athenian visitor leads; Socrates does not appear.'],
    ['The Laws is set on a walk on the island of Crete.', true, 'From Knossos to a cave sacred to Zeus.'],
    ['In the Statesman, the ideal is a wise ruler above the laws, but in practice laws should be kept strictly.', true, 'Statesman 294–301.'],
    ['The Statesman ranks tyranny as the best government.', false, 'Tyranny is the worst of all six.'],
    ['The Laws says officials should be chosen for wealth and birth.', false, 'For their obedience to the laws.'],
    ['5,040 can be divided evenly by every number from 1 to 10.', true, 'Laws V, 738a.'],
    ['In the Philebus, Socrates says the best life is pure pleasure.', false, 'A mixture of pleasure and thought, with measure.'],
    ['The Seventh Letter tells of Plato\'s trips to Sicily.', true, 'To Syracuse, hoping to influence Dionysius II.'],
    ['Plato calls monarchy and democracy the two "mothers" of constitutions in the Laws.', true, 'Laws III, 693d.']
  ],
  items: [
    { q: 'What image ends the Statesman?', r: 'Weaving brave and gentle natures into one fabric', w: ['A ship in a storm', 'A cave', 'A ladder'], why: 'Statesman 305e–311c.' },
    { q: 'Why should laws have preambles, in the Laws?', r: 'To persuade citizens before commanding them, as a good doctor explains', w: ['To make them longer', 'To hide their meaning', 'Because the gods require it'], why: 'Laws IV, 719e–723b.' },
    { q: 'What does the Laws say about a state where the law has no authority?', r: 'It is on the highway to ruin', w: ['It is the happiest state', 'It will be ruled by philosophers', 'It will grow rich'], why: 'Laws IV, 715d.' },
    { q: 'What do the speakers of the Laws plan?', r: 'The laws of a new colony on Crete', w: ['A war against Persia', 'A journey to Egypt', 'A trial of Socrates'], why: 'Cleinias is one of its founders.' },
    { q: 'Why is the Laws\' city called "second-best"?', r: 'It is built for people as they are, under law, not under philosopher-kings', w: ['It came second in a contest', 'It is smaller than Athens', 'It has two kings'], why: 'Laws V, 739.' },
    { q: 'Why is the Seventh Letter\'s author debated?', r: 'Scholars disagree whether Plato or someone else wrote it', w: ['It is in Latin', 'It was found in the 1900s', 'It is signed by Socrates'], why: 'Many accept it; some do not.' }
  ]
};
H.T(ID, B, [famForm, famForm, famNum, famNum, function (R, lv) { return famWho(R, lv, WHO, 'Plato\'s late dialogues'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Plato\'s late dialogues'); }].concat(dateFams(ID)), 0.55);
