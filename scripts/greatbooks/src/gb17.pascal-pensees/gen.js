/* gb17.pascal-pensees: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.pascal-pensees';
function famEV(R, lv) {
  var den = R.pick([2, 4, 5, 10]), prize = den * R.int(2, 12), cost = R.int(1, Math.max(2, prize / den - 1)), ev = prize / den - cost;
  if (lv === 1) return H.num('A game costs ' + cost + ' points. With chance 1/' + den + ' you win ' + prize + ' points; otherwise nothing. What are the expected winnings <b>before</b> subtracting the cost?', prize / den, ['$\\tfrac{1}{' + den + '} \\times ' + prize + ' = ' + prize / den + '$.']);
  return H.num('A game costs ' + cost + ' points to play. With chance 1/' + den + ' you win ' + prize + ' points; otherwise you win nothing. What is the expected value of playing (winnings minus cost)?', ev, ['Expected winnings: $\\tfrac{1}{' + den + '} \\times ' + prize + ' = ' + prize / den + '$.', 'Minus the cost: $' + prize / den + ' - ' + cost + ' = ' + ev + '$.', 'This is the kind of reasoning Pascal uses in the wager, where he makes the prize infinite.']);
}
function famBreak(R, lv) {
  var cost = R.pick([2, 3, 4, 5, 6]), k = R.pick([4, 5, 10, 20]), prize = cost * k;
  return H.mc('Wagering costs ' + cost + ' points either way, and wins ' + prize + ' points if a certain outcome happens. Above what chance does wagering pay on average?', '1/' + k, ['1/' + (k * 2), '1/2', '1/' + Math.max(2, k / 2)], ['Break-even when chance × ' + prize + ' = ' + cost + ', so chance = ' + cost + '/' + prize + ' = 1/' + k + '.', 'With an infinite prize, as Pascal frames the wager, any chance above zero is enough.']);
}
var TM = [['the wager', 'Pascal\'s argument that one should bet that God exists, weighing gains and losses'], ['diversion', 'filling our time with activity so as not to think about our condition'], ['the thinking reed', 'Pascal\'s image of a person: weak in body but great because he thinks'], ['the two infinities', 'the infinitely large and the infinitely small, between which we stand'], ['the heart', 'for Pascal, a direct kind of knowing, by which we grasp first principles'], ['apology', 'a reasoned defense of a belief (Pascal\'s planned book)']];
var NUM = [['the wager', '233'], ['the thinking reed', '347'], ['"the heart has its reasons"', '277']];
var EV = [['Pascal is born', 1623, '1623'], ['his work with Fermat on chance', 1654, '1654'], ['the Provincial Letters', 1656, '1656–57'], ['Pascal dies, leaving his notes', 1662, '1662'], ['the Pensées are first printed', 1670, '1670'], ['Voltaire\'s Philosophical Letters criticize Pascal', 1734, '1734']];
var WHO = [['Pascal', 'The heart has its reasons, which reason does not know.'], ['Pascal', 'Not choosing is itself a choice: you are already embarked.'], ['Voltaire', 'Pascal paints human nature too darkly.'], ['critics of the wager', 'Which God should one bet on, among so many religions?']];
var WHO2 = [['Pascal', 'All our dignity consists in thought.'], ['Descartes', 'I am, I exist, whenever I think it.'], ['Spinoza', 'All things excellent are as difficult as they are rare.'], ['Bacon', 'Begin with doubts and you may end in certainties.']];
var B = {
  facts: [
    ['Pascal finished the Pensées and published them himself.', false, 'He died first; his notes were printed in 1670.'],
    ['Pascal compares a human being to a thinking reed.', true, 'Pensées 347.'],
    ['Pascal says reason alone can settle whether God exists.', false, 'He says reason cannot settle it, but we must still choose.'],
    ['The wager compares a finite stake with an infinite possible gain.', true, 'Pensées 233.'],
    ['For Pascal, "the heart" means only emotions.', false, 'It is a direct kind of knowing, of first principles too.'],
    ['Pascal says people use diversions to avoid thinking about their condition.', true, 'Games, hunting, business.'],
    ['Pascal stands between the infinitely large and the infinitely small.', true, 'The two infinities.'],
    ['Voltaire agreed with everything in the Pensées.', false, 'He criticized Pascal\'s view of human nature and the wager.'],
    ['The order of the Pensées has been arranged differently by different editors.', true, 'They were loose notes.'],
    ['Pascal was a mathematician as well as a religious writer.', true, 'He worked with Fermat on chance.']
  ],
  items: [
    { q: 'What does "pensées" mean?', r: 'Thoughts', w: ['Letters', 'Prayers', 'Proofs'], why: 'French for thoughts.' },
    { q: 'What is the "many gods" objection to the wager?', r: 'There are many religions, so which God should one bet on?', w: ['God cannot be counted', 'No number can be that large', 'Pascal believed in many gods'], why: 'One of the main criticisms.' },
    { q: 'What does Pascal advise someone persuaded by the wager who still cannot believe?', r: 'To act as believers do, so habit quiets the passions', w: ['To give up', 'To study more geometry', 'To bet money'], why: 'Pensées 233.' },
    { q: 'According to Pascal, what is the principle of morality?', r: 'To think well', w: ['To be rich', 'To be strong', 'To be famous'], why: 'Pensées 347.' },
    { q: 'What modern field grew partly from the wager\'s kind of reasoning?', r: 'Decision theory', w: ['Botany', 'Geology', 'Grammar'], why: 'Weighing values and chances under uncertainty.' },
    { q: 'Which is the opposite of the mathematical mind, for Pascal?', r: 'The intuitive mind', w: ['The lazy mind', 'The angry mind', 'The animal mind'], why: 'It sees many fine points at once.' }
  ]
};
H.T(ID, B, [famEV, famBreak, function (R, lv) { return famTerm(R, lv, TM, 'the Pensées'); }, function (R, lv) { return famMatch(R, lv, NUM, 'In Trotter\'s numbering, which thought number is #?', 'Which thought is number # in Trotter\'s numbering?'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famWho(R, lv, WHO2, 'this era of the Great Books'); }, function (R, lv) { return famWho(R, lv, WHO, 'the debate over the Pensées'); }].concat(dateFams(ID)), 0.6);
