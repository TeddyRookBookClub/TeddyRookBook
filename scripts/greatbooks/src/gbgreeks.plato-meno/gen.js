/* gbgreeks.plato-meno: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-meno';
var STEPS = [['Meno asks whether virtue can be taught', 1, ''], ['Meno lists many virtues, a "swarm"', 2, ''], ['Meno compares Socrates to a torpedo fish', 3, ''], ['Meno poses his paradox about inquiry', 4, ''], ['The boy doubles the square', 5, ''], ['Anytus joins the conversation', 6, ''], ['Socrates compares true opinion to the statues of Daedalus', 7, '']];
var WHO = [['Meno', 'How can you search for something when you do not know what it is?'], ['Meno', 'Talking with you numbs me, like the touch of a torpedo fish.'], ['Socrates', 'All inquiry and learning is recollection.'], ['Socrates', 'I numb others only because I am puzzled myself.'], ['Anytus', 'The paid teachers called sophists ruin the young; keep away from them.'], ['The boy', 'I thought doubling the side would double the square.']];
var TERMS = [['aretē (virtue)', 'excellence; being good at being a person'], ['recollection', 'learning as remembering what the soul already knew'], ['true opinion', 'a correct belief without the reason that ties it down'], ['hypothesis', 'a starting assumption used to test a question, as geometers do'], ['sophist', 'a paid teacher of speaking and success'], ['diagonal', 'the line from one corner of a square to the opposite corner']];
function famSquare(R, lv) {
  var s = R.int(2, 12), k = R.int(0, 3);
  if (k === 0) return H.num('A square has sides of ' + s + ' feet. A boy doubles the <b>side</b> to ' + 2 * s + ' feet, as in the Meno. How many times bigger is the new square\'s area?', 4, ['Old area: $' + s + '^2 = ' + s * s + '$. New area: $' + 2 * s + '^2 = ' + 4 * s * s + '$.', '$' + 4 * s * s + ' \\div ' + s * s + ' = 4$: four times, not twice.']);
  if (k === 1) return H.num('A square has sides of ' + s + ' feet. What is the area of the square built on its <b>diagonal</b>, in square feet?', 2 * s * s, ['The square on the diagonal is double the original, as the boy finds.', '$2 \\times ' + s + '^2 = ' + 2 * s * s + '$ square feet.']);
  if (k === 2) return H.num('In the Meno, a square of side 2 feet has area 4. The boy\'s second guess is a side of 3 feet. What is the area of that square, in square feet?', 9, ['$3 \\times 3 = 9$.', 'Socrates wants 8, so 3 feet is too long.']);
  return H.num('A square of side ' + s + ' has area ' + s * s + '. Four copies make a big square. What is the big square\'s area?', 4 * s * s, ['The big square has side ' + 2 * s + ': area $' + 2 * s + '^2 = ' + 4 * s * s + '$.']);
}
var B = {
  facts: [
    ['Meno opens the dialogue by asking whether virtue can be taught.', true, 'Meno 70a.'],
    ['Socrates tells the boy the answer to the geometry problem.', false, 'He only asks questions; the boy sees it himself.'],
    ['Doubling the side of a square doubles its area.', false, 'It makes the area four times as big.'],
    ['The square on the diagonal of a square has twice its area.', true, 'That is the answer the boy reaches.'],
    ['Meno compares Socrates to an electric ray, the torpedo fish.', true, 'Meno 80a.'],
    ['Anytus, who joins the conversation, later helped accuse Socrates.', true, 'He is one of the three accusers at the trial.'],
    ['Socrates says true opinion is useless for action.', false, 'He says it guides action as well as knowledge does, while it lasts.'],
    ['The statues of Daedalus are Socrates\' picture of opinions that run away unless tied down.', true, 'Knowledge is opinion tied down by the reason why.'],
    ['Meno\'s first answer gives a single definition of virtue.', false, 'He gives a list, a "swarm" of virtues.'],
    ['The boy in the lesson had studied geometry for years.', false, 'He had never been taught it.']
  ],
  items: [
    { q: 'What is Meno\'s paradox?', r: 'You cannot search for what you know, nor for what you do not know', w: ['Virtue is both teachable and unteachable', 'A square cannot be doubled', 'Every definition is circular'], why: 'Meno 80d–e.' },
    { q: 'How does Socrates answer the paradox?', r: 'Learning is recollecting what the soul already knows', w: ['Inquiry really is impossible', 'Only the gods can learn', 'We learn by memorizing lists'], why: 'Meno 81a–d, a view Socrates says he heard from priests and poets.' },
    { q: 'What is the boy\'s first wrong guess?', r: 'Double the side', w: ['Use the diagonal', 'Add one foot', 'Halve the side'], why: 'That gives four times the area.' },
    { q: 'Why does Socrates say the boy is better off after his wrong guesses?', r: 'Now he knows he does not know, and wants to find out', w: ['He has memorized the answer', 'He can now teach geometry', 'He has stopped thinking'], why: 'Meno 84a–c.' },
    { q: 'What problem does Socrates find in "virtue is getting good things justly"?', r: 'Justice is part of virtue, so the definition is circular', w: ['Good things cannot be got', 'It is too short', 'Only rulers can be just'], why: 'Meno 78d–79c.' },
    { q: 'What difference between knowledge and true opinion does the Meno draw?', r: 'Knowledge is tied down by the reason why; true opinion can slip away', w: ['Knowledge is always about numbers', 'True opinion is never correct', 'There is no difference'], why: 'Meno 97d–98a.' },
    { q: 'Where is Meno from?', r: 'Thessaly, in northern Greece', w: ['Sparta', 'Egypt', 'Sicily'], why: 'He is a visitor to Athens who studied with Gorgias.' }
  ]
};
H.T(ID, B, [famSquare, famSquare, famSquare, function (R, lv) { return famSeq(R, lv, STEPS); }, function (R, lv) { return famWho(R, lv, WHO, 'the Meno'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Meno'); }].concat(dateFams(ID)), 0.55);
