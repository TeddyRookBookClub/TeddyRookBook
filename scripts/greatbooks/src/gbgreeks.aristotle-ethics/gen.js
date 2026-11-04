/* gbgreeks.aristotle-ethics: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.aristotle-ethics';
var TRI = [['courage', 'cowardice', 'rashness', 'facing danger'], ['self-control', 'dullness to pleasure', 'self-indulgence', 'bodily pleasures'], ['generosity', 'stinginess', 'wastefulness', 'giving money'], ['good temper', 'never being angry when one should be', 'hot temper', 'anger'], ['truthfulness', 'false modesty', 'boasting', 'telling about oneself'], ['wit', 'dullness', 'clowning', 'jokes and fun'], ['friendliness', 'quarrelsomeness', 'flattery', 'getting along with others']];
function famTri(R, lv) {
  var t = R.pick(TRI), others = TRI.filter(function (x) { return x !== t; }), k = R.int(0, 2);
  if (k === 0) return H.mc('Aristotle puts a virtue between <b>' + t[1] + '</b> and <b>' + t[2] + '</b>. Which virtue?', t[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [t[0] + ' is the mean in ' + t[3] + ', between ' + t[1] + ' (too little) and ' + t[2] + ' (too much).']);
  var lo = k === 1, ans = lo ? t[1] : t[2];
  return H.mc('In ' + t[3] + ', the virtue is <b>' + t[0] + '</b>. What is the vice of too <b>' + (lo ? 'little' : 'much') + '</b>?', ans, [lo ? t[2] : t[1]].concat(H.samp(R, others, lv === 1 ? 1 : 2).map(function (x) { return lo ? x[1] : x[2]; })), [t[0] + ' lies between ' + t[1] + ' and ' + t[2] + '.']);
}
function famMid(R, lv) {
  var a = R.int(1, 5) * 2, b = a + R.int(2, 8) * 2;
  if (lv === 1) return H.num('If ' + b + ' pounds of food is too much and ' + a + ' pounds too little, what is the arithmetic middle, in pounds?', (a + b) / 2, ['$(' + a + ' + ' + b + ') \\div 2 = ' + (a + b) / 2 + '$.', 'Aristotle\'s point: the right amount for a person may not be this middle.']);
  return H.mc('If ' + b + ' pounds of food is too much and ' + a + ' too little, will a good trainer always order ' + (a + b) / 2 + ' pounds?', 'No: the mean is relative to the person, more for a wrestler like Milo, less for a beginner', ['Yes: the mean is always the exact middle', 'Yes, because ' + (a + b) / 2 + ' is the average', 'No: he will always order the least'], ['Nicomachean Ethics II.6: the mean relative to us is not found by arithmetic.']);
}
var FR = [['Two neighbors trade tools whenever they need them.', 'use'], ['Teammates who only see each other for games and laughs.', 'pleasure'], ['Two old friends who want what is best for each other, whatever happens.', 'character (the good)'], ['A shopkeeper and a regular customer.', 'use'], ['Kids who only meet to play a video game they both like.', 'pleasure'], ['Friends who help each other become better people.', 'character (the good)']];
function famFriend(R, lv) { var f = R.pick(FR); return H.mc('Aristotle names three kinds of friendship. Which kind is this? <i>' + f[0] + '</i>', 'Friendship of ' + f[1], ['use', 'pleasure', 'character (the good)'].filter(function (x) { return x !== f[1]; }).map(function (x) { return 'Friendship of ' + x; }), ['Use: for what each gets. Pleasure: for the fun. Character: for who the other person is.']); }
var TERMS = [['eudaimonia', 'happiness or flourishing: a whole life going well'], ['aretē', 'virtue or excellence'], ['the mean', 'the right amount between too much and too little, relative to us'], ['phronēsis', 'practical wisdom: seeing what is right in a particular case'], ['akrasia', 'weakness of will: knowing the better and doing the worse'], ['contemplation', 'thinking about the highest things, the best activity in Book X']];
var B = {
  facts: [
    ['Aristotle says we become just by doing just acts.', true, 'Nicomachean Ethics II.1.'],
    ['The mean is always the exact middle between two extremes.', false, 'It is relative to us, and sometimes nearer one extreme.'],
    ['For Aristotle, happiness is a passing feeling of joy.', false, 'It is activity in accordance with virtue over a complete life.'],
    ['Aristotle says some actions, like theft, have no mean.', true, 'They are wrong in any amount.'],
    ['The book is named for Aristotle\'s son Nicomachus.', true, 'He may have edited it.'],
    ['Aristotle names three kinds of friendship: of use, of pleasure and of character.', true, 'Books VIII–IX.'],
    ['Aristotle agrees with Socrates that no one can know the better and do the worse.', false, 'He discusses weakness of will (akrasia) in Book VII.'],
    ['Book X says the highest happiness is contemplation.', true, 'The activity of our best part.'],
    ['Aristotle says ethics can be as exact as mathematics.', false, 'He warns it cannot.'],
    ['Courage is the mean between cowardice and rashness.', true, 'In facing danger.']
  ],
  items: [
    { q: 'What does Aristotle say everyone agrees the highest good is called?', r: 'Happiness (eudaimonia)', w: ['Wealth', 'Honor', 'Pleasure'], why: 'They disagree only about what it is.' },
    { q: 'How do virtues of character arise?', r: 'By habit, through repeated action', w: ['By nature, at birth', 'By reading books', 'By luck'], why: 'Nicomachean Ethics II.1.' },
    { q: 'Who is Milo in Aristotle\'s example?', r: 'A famous wrestler who needs more food than a beginner', w: ['A king of Athens', 'Aristotle\'s son', 'A philosopher'], why: 'Nicomachean Ethics II.6.' },
    { q: 'What is the best kind of friendship, for Aristotle?', r: 'Between good people who wish each other well for each other\'s sake', w: ['Between business partners', 'Between people who have fun together', 'Between rulers and subjects'], why: 'Book VIII.' },
    { q: 'What does Aristotle call a friend?', r: 'Another self', w: ['A useful tool', 'A mirror of the gods', 'A passing pleasure'], why: 'Book IX.' },
    { q: 'What ties all the virtues of character together?', r: 'Practical wisdom (phronēsis)', w: ['Wealth', 'Strength', 'Memory'], why: 'Book VI.' }
  ]
};
H.T(ID, B, [famTri, famTri, famMid, famFriend, function (R, lv) { return famTerm(R, lv, TERMS, 'the Nicomachean Ethics'); }].concat(dateFams(ID)), 0.55);
