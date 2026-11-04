/* gbgreeks.plato-republic-cave: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-republic-cave';
var CAVE = [['chained, watching shadows', 1, ''], ['turned toward the fire', 2, ''], ['dragged up the steep road', 3, ''], ['seeing reflections in water', 4, ''], ['seeing the things themselves and the stars', 5, ''], ['seeing the sun', 6, ''], ['going back down to the others', 7, '']];
var DECL = [['aristocracy (rule by the wise)', 1, ''], ['timocracy (rule by lovers of honor)', 2, ''], ['oligarchy (rule by the rich)', 3, ''], ['democracy', 4, ''], ['tyranny', 5, '']];
var MAP = [['the shadows on the wall', 'images and opinions taken on trust'], ['the objects carried past the fire', 'the things we see around us'], ['the world outside the cave', 'the realm of the Forms'], ['the sun', 'the Good'], ['the climb up the road', 'education, turning the soul toward the light']];
var STUD = [['arithmetic', 1, ''], ['plane geometry', 2, ''], ['solid geometry', 3, ''], ['astronomy', 4, ''], ['dialectic', 6, '']];
function famLine(R, lv) {
  var k = R.pick([2, 3, 4]), n = R.int(1, 6), L = n * (1 + k) * (1 + k), vis = L / (1 + k), seg = [vis / (1 + k), vis * k / (1 + k), (L - vis) / (1 + k), (L - vis) * k / (1 + k)], nm = ['images', 'things', 'mathematics', 'Forms'], i = lv === 1 ? R.pick([1, 2]) : R.int(0, 3);
  return H.num('A line of ' + L + ' units is cut in the ratio ' + k + ' : 1, the part for things <b>known</b> being longer than the part for things <b>seen</b>. Each part is then cut in the same ratio, the higher piece longer. How long is the segment for <b>' + nm[i] + '</b>?', seg[i], ['Seen part: $' + L + ' \\div ' + (1 + k) + ' = ' + vis + '$; known part: $' + (L - vis) + '$.', 'Seen part splits into images ' + seg[0] + ' and things ' + seg[1] + '; known part into mathematics ' + seg[2] + ' and Forms ' + seg[3] + '.', 'Notice that things and mathematics are equal (' + seg[1] + ').']);
}
function famTyrant(R, lv) {
  var a = R.pick([3, 9]);
  if (a === 3) return H.num('In Republic IX, Socrates counts the tyrant as three steps below the oligarch, who is three steps below the king. 3 × 3 = 9. Raising 9 to the third power, as he does, what number does he get for how much more pleasantly the king lives?', 729, ['$9^3 = 9 \\times 9 \\times 9 = 729$.', 'Socrates\' playful figure: the king lives 729 times more pleasantly than the tyrant.']);
  return H.mc('In Book X, a painted bed copies a carpenter\'s bed, which copies the Form of a bed. How far is the painting from the truth, as Socrates counts it?', 'Third (counting the Form as first)', ['First', 'Second', 'Fifth'], ['Form → the carpenter\'s bed → the painting: the painting is third.']);
}
var B = {
  facts: [
    ['In the cave, the prisoners see only shadows on the wall.', true, 'Republic VII, 514–515.'],
    ['The freed prisoner refuses ever to go back into the cave.', false, 'He goes back to help the others.'],
    ['Socrates compares the Good to the sun.', true, 'As the sun gives light and growth, the Good gives truth and being.'],
    ['In the divided line, mathematics belongs to the part for things seen.', false, 'It is in the part for things known, below the Forms.'],
    ['Future rulers study arithmetic, geometry, astronomy and harmony before dialectic.', true, 'Republic VII.'],
    ['Plato says the best rulers are those most eager to rule.', false, 'He says the best are those who do not want to rule.'],
    ['In Plato\'s sequence, tyranny comes out of democracy.', true, 'Republic VIII.'],
    ['The myth of Er tells of souls choosing their next lives.', true, 'Republic X.'],
    ['The ship parable shows sailors who respect the true pilot.', false, 'They call him a useless stargazer.'],
    ['Socrates says education puts knowledge into an empty soul.', false, 'It turns the whole soul toward the light; the power to learn is already there.']
  ],
  items: [
    { q: 'What does the sun stand for in the cave story?', r: 'The Good', w: ['The fire', 'The prisoners', 'The poets'], why: 'Republic VII, 517b–c.' },
    { q: 'Why do the prisoners laugh at the one who returns?', r: 'His eyes are not used to the dark, so he is bad at the shadow game', w: ['He tells jokes', 'He is wearing strange clothes', 'He has forgotten their names'], why: 'Republic VII, 516e–517a.' },
    { q: 'In the ship parable, who is the "useless stargazer"?', r: 'The true pilot, who studies the stars and winds', w: ['The owner of the ship', 'The strongest sailor', 'A passenger'], why: 'Republic VI, 488.' },
    { q: 'Which part of the divided line is the highest?', r: 'The Forms, known by understanding', w: ['Images', 'Things we see', 'Mathematics'], why: 'Republic VI, 511.' },
    { q: 'What is dialectic?', r: 'The art of question and answer that reaches toward the Forms and the Good', w: ['A kind of geometry', 'Speaking to crowds', 'Writing poetry'], why: 'The last and highest study in Book VII.' },
    { q: 'Whose soul, in the myth of Er, picks the quiet life of an ordinary person?', r: 'Odysseus', w: ['Achilles', 'Socrates', 'Gyges'], why: 'Tired of ambition, Republic X, 620c.' }
  ]
};
H.T(ID, B, [famLine, famLine, famTyrant, function (R, lv) { return famSeq(R, lv, CAVE, 'stages of the cave story'); }, function (R, lv) { return famSeq(R, lv, DECL, 'kinds of city in Plato\'s story of decline'); }, function (R, lv) { return famSeq(R, lv, STUD, 'studies of the future rulers'); }, function (R, lv) { return famMatch(R, lv, MAP, 'In the allegory of the cave, what does # stand for?', 'In the allegory of the cave, what stands for #?'); }].concat(dateFams(ID)), 0.55);
