/* gbgreeks.plato-theaetetus: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-theaetetus';
var DEFS = [['knowledge is perception', 1, 'first'], ['knowledge is true judgment', 2, 'second'], ['knowledge is true judgment with an account', 3, 'third']];
var WHO = [['Theaetetus', 'Knowledge is nothing but perception.'], ['Protagoras (as Socrates reports him)', 'Man is the measure of all things.'], ['Socrates', 'I am a midwife: I help others give birth to ideas and test them.'], ['Theodorus', 'The roots of three, of five, and so on up to seventeen cannot be measured by the unit.'], ['The Eleatic Stranger', 'Not being means being different.'], ['Hermogenes', 'Names are right only by agreement and custom.'], ['Cratylus', 'Names are right by nature.']];
var TERMS = [['wind-egg', 'an idea that turns out empty when tested'], ['wax tablet', 'Socrates\' model of memory as impressions in wax'], ['aviary', 'Socrates\' model of the mind as a cage of birds, each a piece of knowledge'], ['account (logos)', 'the reason or explanation added to a true judgment in the third answer'], ['epistemology', 'the part of philosophy that asks what knowledge is'], ['division', 'the Stranger\'s method of splitting a kind into two, again and again']];
var DLG = [['Theaetetus', 'what knowledge is'], ['Sophist', 'what a sophist is, and how one can speak of what is not'], ['Cratylus', 'whether names are right by nature or by agreement'], ['Parmenides', 'objections to the theory of Forms']];
function famRoot(R, lv) {
  var n = R.int(2, lv === 1 ? 50 : 200), r = Math.round(Math.sqrt(n)), sq = r * r === n;
  if (lv >= 2 && R.coin()) { var s = R.int(2, 15); return H.num('Theaetetus calls a number “square” when it is a whole number times itself. ' + s * s + ' is square. What number times itself makes it?', s, ['$' + s + ' \\times ' + s + ' = ' + s * s + '$.']); }
  var f = Math.floor(Math.sqrt(n));
  return H.mc('Theaetetus sorted numbers into “square” (a whole number times itself) and “oblong” (all the rest). Which is <b>' + n + '</b>?', sq ? 'Square' : 'Oblong', [sq ? 'Oblong' : 'Square'], [sq ? n + ' = ' + r + ' × ' + r + ', so it is square, with a whole-number root.' : n + ' lies between the squares ' + f * f + ' and ' + (f + 1) * (f + 1) + ', so it is not a whole number times itself: oblong, and its square root is irrational.']);
}
var B = {
  facts: [
    ['Socrates compares himself to a midwife.', true, 'His mother was a midwife, he says.'],
    ['The Theaetetus ends with a definition everyone accepts.', false, 'It ends without an answer.'],
    ['Theodorus showed that the roots of 3, 5 and up to 17 cannot be measured by the unit.', true, 'Theaetetus 147d.'],
    ['"Man is the measure of all things" is a saying of Protagoras.', true, 'Linked to the first answer, knowledge is perception.'],
    ['The wax tablet model explains mistakes like thinking 7 + 5 = 11.', false, 'It cannot; that is why Socrates tries the aviary.'],
    ['Theaetetus became a real mathematician who worked on irrational lengths.', true, 'And on the regular solids.'],
    ['At the end, Socrates leaves to answer the charges brought against him.', true, 'He goes to the porch of the King Archon, as in the Euthyphro.'],
    ['In the Cratylus, Socrates concludes we should learn about things from their names.', false, 'From the things themselves, he says.'],
    ['In the Sophist, the main speaker is a visitor from Elea.', true, 'The Eleatic Stranger.'],
    ['A jury persuaded of the truth has knowledge, Socrates says.', false, 'It has true judgment, not knowledge; so the second answer fails.']
  ],
  items: [
    { q: 'What is the question of the Theaetetus?', r: 'What is knowledge?', w: ['What is justice?', 'What is courage?', 'Is the soul immortal?'], why: 'Socrates asks Theaetetus to define it.' },
    { q: 'Why does "knowledge is true judgment" fail?', r: 'Someone can be persuaded of the truth without knowing it, like a jury', w: ['True judgment is impossible', 'Judgments are never true', 'Only gods can judge'], why: 'Theaetetus 201a–c.' },
    { q: 'Where does Socrates say philosophy begins?', r: 'In wonder', w: ['In doubt', 'In the marketplace', 'In mathematics'], why: 'Theaetetus 155d.' },
    { q: 'What does the aviary model add to the wax tablet?', r: 'The difference between owning knowledge and holding it at the moment', w: ['Color', 'Music', 'Numbers'], why: 'You can own a bird without holding it, and grab the wrong one.' },
    { q: 'What later problem looks back to the third answer?', r: 'Gettier\'s cases of justified true belief that seem not to be knowledge', w: ['Zeno\'s paradoxes', 'The Meno\'s doubled square', 'The ring of Gyges'], why: 'Edmund Gettier, 1963.' },
    { q: 'How does the Stranger explain "not being" in the Sophist?', r: 'As being different from something', w: ['As nothing at all', 'As a kind of motion', 'As a lie'], why: 'This lets him say what falsehood is.' }
  ]
};
H.T(ID, B, [famRoot, famRoot, function (R, lv) { return famSeq(R, lv === 1 ? 1 : 2, DEFS, 'answers of Theaetetus'); }, function (R, lv) { return famWho(R, lv, WHO, 'these dialogues'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'these dialogues'); }, function (R, lv) { return famMatch(R, lv, DLG, 'What is the <i>#</i> mostly about?', 'Which dialogue is mostly about #?'); }].concat(dateFams(ID)), 0.55);
